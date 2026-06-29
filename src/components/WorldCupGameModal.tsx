import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiClipboard, FiChevronLeft, FiFlag } from 'react-icons/fi';
import { IoMdTrophy } from 'react-icons/io';
import { apiClient } from '../utils/languageApi';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';

// ── Tipos de /api/worldcup/game/state ────────────────────────────────────
interface TeamInfo {
	logo?: string | null;
}

interface GroupState {
	group: string;
	order: string[];
	saved: boolean;
}

interface KoMatch {
	match_no: number;
	home: string | null;
	away: string | null;
	winner: string | null;
}

interface KoRound {
	ronda: string;
	matches: KoMatch[];
}

interface Progress {
	groups_done: number;
	groups_total: number;
	thirds_done: boolean;
	ko_picked: number;
	ko_total: number;
	completed: boolean;
}

interface Scoring {
	group_exact: number;
	group_qualify: number;
	third: number;
	to_r16: number;
	to_qf: number;
	to_sf: number;
	to_final: number;
	champion: number;
}

interface GameState {
	deadline: string;
	locked: boolean;
	groups: GroupState[];
	thirds: string[];
	third_candidates: { group: string; team: string }[];
	knockout: KoRound[];
	progress: Progress;
	completed_at: string | null;
	team_info: Record<string, TeamInfo>;
	scoring: Scoring;
}

interface RankingRow {
	rank: number;
	id_usuario: number;
	nombre_usuario: string;
	foto_perfil: string | null;
	completed: boolean;
	total: number;
	groups: number;
	thirds: number;
	knockout: number;
	champion_pick: string | null;
	champion_correct: boolean;
}

interface RankingData {
	ranking: RankingRow[];
	tournament: { groups_complete: number; thirds_known: boolean; champion: string | null };
	locked: boolean;
}

type View = 'intro' | 'groups' | 'thirds' | 'ko' | 'done' | 'summary' | 'ranking';

interface Props {
	open: boolean;
	onClose: () => void;
}

// ── Bandera con fallback ─────────────────────────────────────────────────
const Flag: React.FC<{ team: string; info: Record<string, TeamInfo>; size?: string }> = ({
	team,
	info,
	size = 'w-7 h-5',
}) => {
	const [err, setErr] = useState(false);
	const logo = info[team]?.logo;
	if (!logo || err) return <FiFlag className="text-base text-gray-400" />;
	return (
		<img
			src={logo}
			alt={team}
			className={`${size} object-cover rounded-[3px] shadow-sm flex-shrink-0`}
			onError={() => setErr(true)}
			draggable={false}
		/>
	);
};

// ── Lista de grupo con drag & drop (pointer events: mouse + touch) ──────
const ROW_STEP = 60; // alto de fila (52) + separacion (8)

const DragList: React.FC<{
	order: string[];
	onReorder: (next: string[]) => void;
	teamInfo: Record<string, TeamInfo>;
}> = ({ order, onReorder, teamInfo }) => {
	const [dragIdx, setDragIdx] = useState<number | null>(null);
	const [dy, setDy] = useState(0);
	const startY = useRef(0);

	const onDown = (e: React.PointerEvent, i: number) => {
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		startY.current = e.clientY;
		setDragIdx(i);
		setDy(0);
	};

	const onMove = (e: React.PointerEvent) => {
		if (dragIdx === null) return;
		const d = e.clientY - startY.current;
		const shift = d > ROW_STEP * 0.55 ? 1 : d < -ROW_STEP * 0.55 ? -1 : 0;
		if (shift !== 0) {
			const j = dragIdx + shift;
			if (j >= 0 && j < order.length) {
				const next = [...order];
				[next[dragIdx], next[j]] = [next[j], next[dragIdx]];
				onReorder(next);
				setDragIdx(j);
				startY.current = e.clientY;
				setDy(0);
				return;
			}
		}
		setDy(d);
	};

	const endDrag = () => {
		setDragIdx(null);
		setDy(0);
	};

	return (
		<div className="space-y-2 select-none">
			{order.map((team, i) => (
				<div
					key={team}
					onPointerDown={(e) => onDown(e, i)}
					onPointerMove={onMove}
					onPointerUp={endDrag}
					onPointerCancel={endDrag}
					style={{
						touchAction: 'none',
						transform: dragIdx === i ? `translateY(${dy}px)` : undefined,
						zIndex: dragIdx === i ? 20 : 1,
					}}
					className={`relative flex items-center gap-3 h-[52px] px-3 rounded-xl border cursor-grab active:cursor-grabbing transition-colors ${
						dragIdx === i
							? 'bg-amber-500/15 border-amber-400/60 shadow-lg'
							: 'bg-white/[0.03] border-white/10 hover:border-amber-500/40'
					}`}
				>
					<span className="w-8 h-8 rounded-full bg-gradient-to-b from-amber-200 to-amber-500 text-black text-sm font-bold flex items-center justify-center flex-shrink-0">
						{i + 1}
					</span>
					<Flag team={team} info={teamInfo} />
					<span className="text-sm font-semibold text-white truncate flex-1">{team}</span>
					<span className="text-gray-500 text-lg leading-none pr-1">≡</span>
				</div>
			))}
		</div>
	);
};

// ── Modal principal ──────────────────────────────────────────────────────
const WorldCupGameModal: React.FC<Props> = ({ open, onClose }) => {
	const { t, i18n } = useTranslation(['home', 'common']);
	const { user } = useAuth();
	const [state, setState] = useState<GameState | null>(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [view, setView] = useState<View>('intro');
	const [groupIdx, setGroupIdx] = useState(0);
	const [localOrder, setLocalOrder] = useState<string[]>([]);
	const [localThirds, setLocalThirds] = useState<string[]>([]);
	const [koIdx, setKoIdx] = useState(0);
	const [ranking, setRanking] = useState<RankingData | null>(null);

	const teamInfo = state?.team_info || {};

	// Partidos eliminatorios en orden de juego (solo los ya resueltos por
	// la prediccion pueden elegirse)
	const koList = (state?.knockout || []).flatMap((r) =>
		r.matches.map((m) => ({ ...m, ronda: r.ronda }))
	);
	const firstUnpicked = koList.findIndex((m) => m.home && m.away && !m.winner);

	const fetchState = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await apiClient.get<GameState>('/api/worldcup/game/state', { timeout: 15000 });
			setState(res.data);
		} catch {
			setError(t('home:wcGame.loadError'));
		} finally {
			setLoading(false);
		}
	}, [t]);

	useEffect(() => {
		if (open) {
			setView('intro');
			setRanking(null);
			fetchState();
		}
	}, [open, fetchState]);

	// Sincroniza el orden local cuando cambia el grupo visible
	useEffect(() => {
		if (state && view === 'groups') {
			setLocalOrder(state.groups[groupIdx]?.order || []);
		}
	}, [state, view, groupIdx]);

	useEffect(() => {
		if (state && view === 'thirds') setLocalThirds(state.thirds || []);
	}, [state, view]);

	const save = async (payload: Record<string, unknown>): Promise<GameState | null> => {
		setSaving(true);
		setError(null);
		try {
			const res = await apiClient.put<GameState>('/api/worldcup/game/state', payload, { timeout: 15000 });
			setState(res.data);
			return res.data;
		} catch (e: unknown) {
			const detail = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
			setError(detail || t('home:wcGame.loadError'));
			return null;
		} finally {
			setSaving(false);
		}
	};

	const openRanking = async () => {
		setView('ranking');
		try {
			const res = await apiClient.get<RankingData>('/api/worldcup/game/ranking', { timeout: 15000 });
			setRanking(res.data);
		} catch {
			setError(t('home:wcGame.loadError'));
		}
	};

	const startPlay = () => {
		if (!state) return;
		const p = state.progress;
		if (p.completed) setView('done');
		else if (p.groups_done >= p.groups_total && p.thirds_done) {
			setKoIdx(Math.max(firstUnpicked, 0));
			setView('ko');
		} else if (p.groups_done >= p.groups_total) setView('thirds');
		else {
			setGroupIdx(0);
			setView('groups');
		}
	};

	// Guardar grupo actual; next=true avanza, si no cierra el modal
	const saveGroup = async (next: boolean) => {
		if (!state || state.locked) {
			if (!next) onClose();
			return;
		}
		const letter = state.groups[groupIdx].group;
		const updated = await save({ group_order: { [letter]: localOrder } });
		if (!updated) return;
		if (!next) {
			onClose();
			return;
		}
		if (groupIdx + 1 < updated.groups.length) setGroupIdx(groupIdx + 1);
		else setView('thirds');
	};

	const toggleThird = (g: string) => {
		setLocalThirds((prev) =>
			prev.includes(g) ? prev.filter((x) => x !== g) : prev.length < 8 ? [...prev, g] : prev
		);
	};

	const saveThirds = async (cont: boolean) => {
		if (!state || state.locked) {
			if (!cont) onClose();
			return;
		}
		const updated = await save({ thirds: localThirds });
		if (!updated) return;
		if (!cont) {
			onClose();
			return;
		}
		const list = updated.knockout.flatMap((r) => r.matches);
		const idx = list.findIndex((m) => m.home && m.away && !m.winner);
		setKoIdx(Math.max(idx, 0));
		setView('ko');
	};

	const pickWinner = async (matchNo: number, team: string) => {
		if (!state || state.locked || saving) return;
		const updated = await save({ ko_winners: { [String(matchNo)]: team } });
		if (!updated) return;
		const list = updated.knockout.flatMap((r) => r.matches);
		const idx = list.findIndex((m) => m.home && m.away && !m.winner);
		if (idx === -1) setView('done');
		else setKoIdx(idx);
	};

	const fmtDeadline = (iso: string) =>
		new Date(iso).toLocaleString(i18n.language === 'es' ? 'es-CO' : 'en-US', {
			day: 'numeric',
			month: 'short',
			hour: 'numeric',
			minute: '2-digit',
		});

	if (!open) return null;

	const progressPct = state
		? Math.round(
				((state.progress.groups_done +
					(state.progress.thirds_done ? 1 : 0) +
					state.progress.ko_picked) /
					(state.progress.groups_total + 1 + state.progress.ko_total)) *
					100
		  )
		: 0;

	const current = view === 'groups' && state ? state.groups[groupIdx] : null;
	const koMatch = view === 'ko' && koList.length > 0 ? koList[Math.min(koIdx, koList.length - 1)] : null;
	const roundName = (r: string) => t(`home:wcGame.rounds.${r}`, r);

	const btnGold =
		'w-full py-3 rounded-xl bg-gradient-to-b from-amber-200 to-amber-500 text-black font-bold text-sm hover:from-amber-100 hover:to-amber-400 transition-colors disabled:opacity-50';
	const btnDark =
		'w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-semibold text-sm hover:border-amber-500/40 transition-colors';

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 md:p-6">
			<div className="w-full max-w-md bg-[#15100a] border border-amber-500/20 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
				{/* Header */}
				<div className="px-4 pt-4 pb-3 border-b border-amber-500/15 bg-black/40">
					<div className="flex items-center justify-between gap-2">
						<button
							onClick={() => setView('intro')}
							className="text-amber-400/80 hover:text-amber-300 p-1"
							aria-label="info"
						>
							<IoMdTrophy className="w-5 h-5" />
						</button>
						<div className="text-center flex-1 min-w-0">
							<h2 className="text-base font-bold text-white truncate">
								{view === 'groups'
									? t('home:wcGame.groupsHeader')
									: view === 'thirds'
									? t('home:wcGame.thirdsHeader')
									: view === 'ko'
									? t('home:wcGame.koHeader')
									: view === 'summary'
									? t('home:wcGame.summaryTitle')
									: view === 'ranking'
									? t('home:wcGame.rankingTitle')
									: t('home:wcGame.headerTitle')}
							</h2>
							{view === 'groups' && state && (
								<p className="text-xs text-gray-400">
									{t('home:wcGame.groupOf', {
										current: groupIdx + 1,
										total: state.groups.length,
									})}
								</p>
							)}
							{view === 'ko' && koMatch && (
								<p className="text-xs text-gray-400">{roundName(koMatch.ronda)}</p>
							)}
						</div>
						<div className="flex items-center gap-1">
							<button
								onClick={() => setView('summary')}
								className="text-amber-400/80 hover:text-amber-300 p-1"
								aria-label={t('home:wcGame.viewPredictions')}
							>
								<FiClipboard className="w-5 h-5" />
							</button>
							<button
								onClick={onClose}
								className="text-gray-400 hover:text-white p-1"
								aria-label={t('common:close', 'Close')}
							>
								<FiX className="w-5 h-5" />
							</button>
						</div>
					</div>
					{/* Barra de progreso */}
					<div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-500"
							style={{ width: `${progressPct}%` }}
						/>
					</div>
				</div>

				{/* Contenido */}
				<div className="flex-1 overflow-y-auto p-4">
					{loading && (
						<div className="py-16 flex justify-center">
							<Spinner />
						</div>
					)}
					{error && (
						<p className="mb-3 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
							{error}
						</p>
					)}
					{state?.locked && view !== 'ranking' && view !== 'summary' && (
						<p className="mb-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
							{t('home:wcGame.locked')}
						</p>
					)}

					{/* ── Intro ── */}
					{!loading && state && view === 'intro' && (
						<div className="space-y-4">
							<div className="text-center py-2">
								<IoMdTrophy className="w-12 h-12 text-amber-400 mx-auto mb-2" />
								<h3 className="text-lg font-bold text-white">
									{t('home:wcGame.introTitle')}
								</h3>
							</div>
							<ol className="space-y-2.5">
								{[1, 2, 3, 4].map((n) => (
									<li key={n} className="flex gap-3 text-sm text-gray-300">
										<span className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
											{n}
										</span>
										{t(`home:wcGame.intro${n}`)}
									</li>
								))}
							</ol>
							<div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 space-y-1">
								<p className="text-xs font-bold text-amber-300 uppercase tracking-wide">
									{t('home:wcGame.scoringTitle')}
								</p>
								<p className="text-xs text-gray-400">
									{t('home:wcGame.scoringGroups', {
										exact: state.scoring.group_exact,
										qualify: state.scoring.group_qualify,
									})}
								</p>
								<p className="text-xs text-gray-400">
									{t('home:wcGame.scoringThirds', { third: state.scoring.third })}
								</p>
								<p className="text-xs text-gray-400">
									{t('home:wcGame.scoringKo', {
										r16: state.scoring.to_r16,
										qf: state.scoring.to_qf,
										sf: state.scoring.to_sf,
										final: state.scoring.to_final,
										champ: state.scoring.champion,
									})}
								</p>
							</div>
							{!state.locked && (
								<p className="text-[11px] text-gray-500 text-center">
									{t('home:wcGame.deadlineLabel', { date: fmtDeadline(state.deadline) })}
								</p>
							)}
							<div className="flex gap-3 pt-1">
								<button onClick={onClose} className={btnDark}>
									{t('home:wcGame.exit')}
								</button>
								<button onClick={startPlay} className={btnGold}>
									{t('home:wcGame.continue')}
								</button>
							</div>
						</div>
					)}

					{/* ── Grupos (drag & drop) ── */}
					{!loading && state && view === 'groups' && current && (
						<div className="space-y-4">
							<div className="rounded-xl border-l-4 border-amber-400 bg-amber-500/5 px-3 py-2.5">
								<p className="text-xs text-gray-300">{t('home:wcGame.dragHint')}</p>
								<div className="flex flex-wrap gap-1.5 mt-1.5">
									{[
										`#1: ${state.scoring.group_exact} pts`,
										`#2: ${state.scoring.group_exact} pts`,
										`${t('home:wcGame.ptsThirds')}: ${state.scoring.third} pt`,
									].map((b) => (
										<span
											key={b}
											className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-300/90 bg-black/30"
										>
											{b}
										</span>
									))}
								</div>
							</div>
							<div className="flex items-center gap-3">
								<span className="w-9 h-9 rounded-lg bg-gradient-to-b from-amber-200 to-amber-500 text-black font-extrabold flex items-center justify-center">
									{current.group}
								</span>
								<h3 className="text-base font-bold text-white">
									{t('home:wcGame.group')} {current.group}
								</h3>
							</div>
							<DragList order={localOrder} onReorder={setLocalOrder} teamInfo={teamInfo} />
							<div className="flex gap-3 pt-1">
								<button
									onClick={() =>
										groupIdx === 0 ? setView('intro') : setGroupIdx(groupIdx - 1)
									}
									className={btnDark}
								>
									{t('home:wcGame.back')}
								</button>
								<button onClick={() => saveGroup(true)} disabled={saving} className={btnGold}>
									{t('home:wcGame.saveNext')}
								</button>
							</div>
							<button
								onClick={() => saveGroup(false)}
								disabled={saving}
								className="w-full text-center text-xs text-gray-400 hover:text-amber-300 underline underline-offset-4 py-1"
							>
								{t('home:wcGame.saveExit')}
							</button>
						</div>
					)}

					{/* ── Terceros ── */}
					{!loading && state && view === 'thirds' && (
						<div className="space-y-4">
							<div className="rounded-xl border-l-4 border-amber-400 bg-amber-500/5 px-3 py-2.5">
								<p className="text-xs text-gray-300">{t('home:wcGame.thirdsHint')}</p>
								<p className="text-xs font-bold text-amber-300 mt-1">
									{t('home:wcGame.selectedCount', { count: localThirds.length })}
								</p>
							</div>
							<div className="grid grid-cols-1 gap-2">
								{state.third_candidates.map(({ group, team }) => {
									const sel = localThirds.includes(group);
									return (
										<button
											key={group}
											onClick={() => toggleThird(group)}
											className={`flex items-center gap-3 h-[48px] px-3 rounded-xl border text-left transition-colors ${
												sel
													? 'bg-amber-500/15 border-amber-400/60'
													: 'bg-white/[0.03] border-white/10 hover:border-amber-500/40'
											}`}
										>
											<span
												className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
													sel
														? 'bg-gradient-to-b from-amber-200 to-amber-500 text-black'
														: 'bg-white/10 text-gray-300'
												}`}
											>
												{group}
											</span>
											<Flag team={team} info={teamInfo} />
											<span className="text-sm font-semibold text-white truncate flex-1">
												{team}
											</span>
											{sel && <span className="text-amber-300 text-sm font-bold">✓</span>}
										</button>
									);
								})}
							</div>
							<div className="flex gap-3 pt-1">
								<button
									onClick={() => {
										setGroupIdx(state.groups.length - 1);
										setView('groups');
									}}
									className={btnDark}
								>
									{t('home:wcGame.back')}
								</button>
								<button
									onClick={() => saveThirds(true)}
									disabled={saving || localThirds.length !== 8}
									className={btnGold}
								>
									{t('home:wcGame.saveContinue')}
								</button>
							</div>
							<button
								onClick={() => saveThirds(false)}
								disabled={saving}
								className="w-full text-center text-xs text-gray-400 hover:text-amber-300 underline underline-offset-4 py-1"
							>
								{t('home:wcGame.saveExit')}
							</button>
						</div>
					)}

					{/* ── Eliminatorias: un partido a la vez ── */}
					{!loading && state && view === 'ko' && koMatch && (
						<div className="space-y-4">
							<div className="text-center">
								<p className="text-xs uppercase tracking-widest text-amber-300/80 font-bold">
									{roundName(koMatch.ronda)}
								</p>
								<p className="text-xs text-gray-500 mt-0.5">
									{t('home:wcGame.matchOf', {
										current: state.progress.ko_picked + 1,
										total: state.progress.ko_total,
									})}
								</p>
							</div>
							<p className="text-center text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2">
								{t('home:wcGame.koHint')}
							</p>
							<div className="space-y-3">
								{[koMatch.home, koMatch.away].map((team, i) => (
									<button
										key={`${koMatch.match_no}-${i}`}
										onClick={() => team && pickWinner(koMatch.match_no, team)}
										disabled={!team || saving || state.locked}
										className={`w-full flex items-center gap-3 h-[64px] px-4 rounded-xl border transition-colors ${
											koMatch.winner === team && team
												? 'bg-amber-500/20 border-amber-400'
												: 'bg-white/[0.03] border-white/10 hover:border-amber-400/70 hover:bg-amber-500/10'
										}`}
									>
										{team ? (
											<>
												<Flag team={team} info={teamInfo} size="w-9 h-6" />
												<span className="text-base font-bold text-white truncate flex-1 text-left">
													{team}
												</span>
												{koMatch.winner === team && (
													<span className="text-amber-300 font-bold">✓</span>
												)}
											</>
										) : (
											<span className="text-gray-500 text-sm">—</span>
										)}
									</button>
								))}
							</div>
							<p className="text-center text-[11px] text-gray-500 uppercase tracking-widest">
								vs
							</p>
							<div className="flex gap-3 pt-1">
								<button
									onClick={() => {
										const prev = koList
											.slice(0, koIdx)
											.map((m, i) => ({ m, i }))
											.filter(({ m }) => m.home && m.away)
											.pop();
										if (prev) setKoIdx(prev.i);
										else setView('thirds');
									}}
									className={btnDark}
								>
									<FiChevronLeft className="inline -mt-0.5" /> {t('home:wcGame.back')}
								</button>
								<button onClick={onClose} className={btnDark}>
									{t('home:wcGame.saveExit')}
								</button>
							</div>
						</div>
					)}

					{/* ── Completado ── */}
					{!loading && state && view === 'done' && (
						<div className="text-center space-y-4 py-6">
							<IoMdTrophy className="w-16 h-16 text-amber-400 mx-auto" />
							<h3 className="text-xl font-bold text-white">{t('home:wcGame.doneTitle')}</h3>
							<p className="text-sm text-gray-400 max-w-xs mx-auto">
								{t('home:wcGame.doneDesc')}
							</p>
							{(() => {
								const champ = koList.find((m) => m.match_no === 104)?.winner;
								return champ ? (
									<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-400/50">
										<Flag team={champ} info={teamInfo} />
										<span className="text-sm font-bold text-amber-200">
											{t('home:wcGame.championLabel')}: {champ}
										</span>
									</div>
								) : null;
							})()}
							<div className="space-y-3 pt-2 max-w-xs mx-auto">
								<button onClick={() => setView('summary')} className={btnGold}>
									{t('home:wcGame.viewPredictions')}
								</button>
								<button onClick={openRanking} className={btnDark}>
									{t('home:wcGame.viewRanking')}
								</button>
								<button onClick={onClose} className={btnDark}>
									{t('home:wcGame.exit')}
								</button>
							</div>
						</div>
					)}

					{/* ── Resumen grafico de predicciones ── */}
					{!loading && state && view === 'summary' && (
						<div className="space-y-5">
							<div>
								<p className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-2">
									{t('home:wcGame.groupPredictions')}
								</p>
								<div className="grid grid-cols-2 gap-2">
									{state.groups.map((g) => (
										<div
											key={g.group}
											className={`rounded-xl border p-2.5 ${
												g.saved ? 'border-white/10 bg-white/[0.03]' : 'border-dashed border-white/15 opacity-60'
											}`}
										>
											<p className="text-[11px] font-bold text-amber-300 mb-1.5">
												{t('home:wcGame.group')} {g.group}
											</p>
											<ul className="space-y-1">
												{g.order.map((team, i) => (
													<li key={team} className="flex items-center gap-1.5 min-w-0">
														<span
															className={`w-4 text-[10px] font-bold flex-shrink-0 ${
																i < 2
																	? 'text-amber-300'
																	: i === 2 && state.thirds.includes(g.group)
																	? 'text-amber-500/80'
																	: 'text-gray-600'
															}`}
														>
															{i + 1}
														</span>
														<Flag team={team} info={teamInfo} size="w-4 h-3" />
														<span className="text-[11px] text-gray-300 truncate">{team}</span>
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							</div>
							<div>
								<p className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-2">
									{t('home:wcGame.bracketTitle')}
								</p>
								<div className="space-y-4">
									{state.knockout.map((round) => (
										<div key={round.ronda}>
											<p className="text-[11px] text-gray-500 uppercase tracking-widest mb-1.5">
												{roundName(round.ronda)}
											</p>
											<div className="grid grid-cols-2 gap-1.5">
												{round.matches.map((m) => (
													<div
														key={m.match_no}
														className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1.5"
													>
														{[m.home, m.away].map((team, i) => (
															<div key={i} className="flex items-center gap-1.5 min-w-0 py-0.5">
																{team ? (
																	<>
																		<Flag team={team} info={teamInfo} size="w-4 h-3" />
																		<span
																			className={`text-[11px] truncate ${
																				m.winner === team
																					? 'text-amber-300 font-bold'
																					: 'text-gray-400'
																			}`}
																		>
																			{team}
																		</span>
																	</>
																) : (
																	<span className="text-[11px] text-gray-600">—</span>
																)}
															</div>
														))}
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
							{(() => {
								const champ = koList.find((m) => m.match_no === 104)?.winner;
								return champ ? (
									<div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-400/50">
										<IoMdTrophy className="w-5 h-5 text-amber-300" />
										<Flag team={champ} info={teamInfo} />
										<span className="text-sm font-bold text-amber-200">{champ}</span>
									</div>
								) : null;
							})()}
							<div className="flex gap-3">
								<button onClick={openRanking} className={btnDark}>
									{t('home:wcGame.viewRanking')}
								</button>
								<button onClick={onClose} className={btnGold}>
									{t('home:wcGame.exit')}
								</button>
							</div>
						</div>
					)}

					{/* ── Ranking ── */}
					{view === 'ranking' && (
						<div className="space-y-3">
							{!ranking && (
								<div className="py-10 flex justify-center">
									<Spinner />
								</div>
							)}
							{ranking && ranking.ranking.length === 0 && (
								<p className="text-sm text-gray-400 text-center py-8">
									{t('home:wcGame.noPlayers')}
								</p>
							)}
							{ranking && ranking.ranking.length > 0 && (
								<div className="space-y-2">
									{ranking.ranking.map((row) => {
										const me =
											row.id_usuario === (user?.id_usuario ?? user?.id);
										return (
											<div
												key={row.id_usuario}
												className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
													me
														? 'border-amber-400/60 bg-amber-500/10'
														: 'border-white/10 bg-white/[0.03]'
												}`}
											>
												<span
													className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
														row.rank === 1
															? 'bg-gradient-to-b from-amber-200 to-amber-500 text-black'
															: 'bg-white/10 text-gray-300'
													}`}
												>
													{row.rank}
												</span>
												{row.foto_perfil ? (
													<img
														src={row.foto_perfil}
														alt=""
														className="w-7 h-7 rounded-full object-cover flex-shrink-0"
													/>
												) : (
													<span className="w-7 h-7 rounded-full bg-gray-700 text-[11px] text-white font-bold flex items-center justify-center flex-shrink-0">
														{row.nombre_usuario.charAt(0).toUpperCase()}
													</span>
												)}
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold text-white truncate">
														{row.nombre_usuario}
														{me && (
															<span className="ml-1.5 text-[10px] text-amber-300">
																({t('home:wcGame.you')})
															</span>
														)}
													</p>
													<p className="text-[10px] text-gray-500 truncate">
														{t('home:wcGame.ptsGroups')} {row.groups} ·{' '}
														{t('home:wcGame.ptsThirds')} {row.thirds} ·{' '}
														{t('home:wcGame.ptsKo')} {row.knockout}
														{!row.completed && (
															<span className="text-amber-500/80">
																{' '}
																· {t('home:wcGame.incomplete')}
															</span>
														)}
													</p>
												</div>
												<div className="text-right flex-shrink-0">
													<p className="text-base font-extrabold text-amber-300">
														{row.total}
													</p>
													<p className="text-[10px] text-gray-500">
														{t('home:wcGame.points')}
													</p>
												</div>
											</div>
										);
									})}
								</div>
							)}
							{ranking?.tournament.champion && (
								<p className="text-xs text-center text-amber-300">
									<IoMdTrophy className="inline mr-1 text-amber-400" />{t('home:wcGame.champion')}: {ranking.tournament.champion}
								</p>
							)}
							<button onClick={onClose} className={btnGold}>
								{t('home:wcGame.exit')}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default WorldCupGameModal;
