import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Spinner from '../components/Spinner';
import { apiClient } from '../utils/languageApi';
import { GiTrophy } from 'react-icons/gi';

// ── Tipos de la respuesta de /api/worldcup/board ─────────────────────────
interface Team {
	id_equipo: number;
	nombre: string;
	logo?: string | null;
}

interface StandingRow {
	pos: number;
	team: Team;
	pj: number;
	g: number;
	e: number;
	p: number;
	gf: number;
	gc: number;
	dif: number;
	pts: number;
	group?: string;
}

interface GroupTable {
	group: string;
	complete: boolean;
	played: number;
	standings: StandingRow[];
}

interface KnockoutSide {
	slot: string;
	team: Team | null;
	confirmed: boolean;
	projected: boolean;
}

interface KnockoutMatch {
	match_no: number;
	ronda: string;
	fecha: string | null;
	venue: string | null;
	ciudad: string | null;
	estado: string | null;
	goles_local: number | null;
	goles_visitante: number | null;
	id_partido: number | null;
	home: KnockoutSide;
	away: KnockoutSide;
}

interface KnockoutRound {
	ronda: string;
	matches: KnockoutMatch[];
}

interface BoardResponse {
	liga: { id_liga: number; nombre: string; logo_url?: string };
	all_groups_complete: boolean;
	groups: GroupTable[];
	thirds_ranking: StandingRow[];
	third_assignment_known: boolean;
	knockout: KnockoutRound[];
}

const ROUND_LABELS: Record<string, string> = {
	'Round of 32': 'Dieciseisavos de final (Ronda de 32)',
	'Round of 16': 'Octavos de final',
	'Quarter-Final': 'Cuartos de final',
	'Semi-Final': 'Semifinales',
	'Third Place': 'Tercer puesto',
	Final: 'Final',
};

// '3-ABCDF' -> '3º de A/B/C/D/F' ; '1A' -> '1º Grupo A' ; 'W73' -> 'Ganador P73'
function slotLabel(slot: string): string {
	if (slot.startsWith('3-')) return `3º de ${slot.slice(2).split('').join('/')}`;
	if (slot.startsWith('W')) return `Ganador P${slot.slice(1)}`;
	if (slot.startsWith('RU')) return `Perdedor P${slot.slice(2)}`;
	if (/^[12][A-L]$/.test(slot)) return `${slot[0]}º Grupo ${slot[1]}`;
	return slot;
}

function formatDate(iso: string | null): string {
	if (!iso) return '';
	const d = new Date(iso);
	return d.toLocaleDateString('es-CO', {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function TeamCell({ team, fallback }: { team: Team | null; fallback: string }) {
	if (!team) {
		return <span className="text-gray-400 italic text-sm">{fallback}</span>;
	}
	return (
		<span className="flex items-center gap-2 min-w-0">
			{team.logo && (
				<img
					src={team.logo}
					alt={team.nombre}
					className="w-5 h-5 rounded-sm object-cover shrink-0"
					loading="lazy"
				/>
			)}
			<span className="truncate">{team.nombre}</span>
		</span>
	);
}

function GroupCard({ table }: { table: GroupTable }) {
	return (
		<div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
			<div className="px-4 py-2.5 bg-white/5 flex items-center justify-between">
				<h3 className="font-bold text-white">Grupo {table.group}</h3>
				<span className="text-xs text-gray-400">
					{table.complete ? 'Completo' : `${table.played}/6 jugados`}
				</span>
			</div>
			<table className="w-full text-sm">
				<thead>
					<tr className="text-gray-400 text-xs">
						<th className="text-left pl-3 py-1.5 font-medium w-full">Equipo</th>
						<th className="px-1.5 font-medium">PJ</th>
						<th className="px-1.5 font-medium">G</th>
						<th className="px-1.5 font-medium">E</th>
						<th className="px-1.5 font-medium">P</th>
						<th className="px-1.5 font-medium">GF</th>
						<th className="px-1.5 font-medium">GC</th>
						<th className="px-1.5 font-medium">DIF</th>
						<th className="px-2 font-semibold text-white">Pts</th>
					</tr>
				</thead>
				<tbody>
					{table.standings.map((row) => (
						<tr
							key={row.team.id_equipo}
							className={`border-t border-white/5 ${
								row.pos <= 2
									? 'bg-green-500/10'
									: row.pos === 3
									? 'bg-yellow-500/5'
									: ''
							}`}
						>
							<td className="pl-3 py-1.5 text-white">
								<span className="flex items-center gap-2">
									<span
										className={`w-1 h-4 rounded-full shrink-0 ${
											row.pos <= 2
												? 'bg-green-500'
												: row.pos === 3
												? 'bg-yellow-500'
												: 'bg-transparent'
										}`}
									/>
									<TeamCell team={row.team} fallback="—" />
								</span>
							</td>
							<td className="text-center text-gray-300">{row.pj}</td>
							<td className="text-center text-gray-300">{row.g}</td>
							<td className="text-center text-gray-300">{row.e}</td>
							<td className="text-center text-gray-300">{row.p}</td>
							<td className="text-center text-gray-300">{row.gf}</td>
							<td className="text-center text-gray-300">{row.gc}</td>
							<td className="text-center text-gray-300">{row.dif}</td>
							<td className="text-center font-bold text-white">{row.pts}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function KnockoutCard({ match }: { match: KnockoutMatch }) {
	const played =
		match.estado === 'finalizado' &&
		match.goles_local !== null &&
		match.goles_visitante !== null;
	return (
		<div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1.5">
			<div className="flex justify-between text-xs text-gray-400">
				<span>P{match.match_no}</span>
				<span>
					{formatDate(match.fecha)}
					{match.ciudad ? ` · ${match.ciudad}` : ''}
				</span>
			</div>
			{[
				{ side: match.home, goals: match.goles_local },
				{ side: match.away, goals: match.goles_visitante },
			].map(({ side, goals }, i) => (
				<div key={i} className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2 min-w-0 text-sm text-white">
						<TeamCell team={side.team} fallback={slotLabel(side.slot)} />
						{side.projected && (
							<span className="text-[10px] uppercase tracking-wide bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded shrink-0">
								proyección
							</span>
						)}
					</div>
					<span className="font-bold text-white w-6 text-center">
						{played ? goals : '–'}
					</span>
				</div>
			))}
		</div>
	);
}

function WorldCupBoard() {
	const [searchParams] = useSearchParams();
	const [board, setBoard] = useState<BoardResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const ligaParam = searchParams.get('league') || searchParams.get('liga');

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		const qs = ligaParam ? `?liga=${ligaParam}` : '';
		apiClient
			.get<BoardResponse>(`/api/worldcup/board${qs}`)
			.then((res) => {
				if (!cancelled) {
					setBoard(res.data);
					setError(null);
				}
			})
			.catch(() => {
				if (!cancelled) setError('No se pudo cargar el tablero del Mundial.');
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [ligaParam]);

	return (
		<AppShell>
			<div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 pb-12">
				<header className="mb-6">
					<h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
						<GiTrophy className="text-4xl text-amber-400" />
						Mundial FIFA 2026
					</h1>
					<p className="text-gray-400 text-sm mt-1">
						Fase de grupos y cuadro de eliminatorias. Los cruces marcados como
						“proyección” se calculan con las posiciones actuales y pueden
						cambiar.
					</p>
				</header>

				{loading && (
					<div className="flex justify-center py-16">
						<Spinner />
					</div>
				)}
				{error && (
					<div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl">
						<p className="text-red-200 text-sm">{error}</p>
					</div>
				)}

				{board && (
					<>
						{/* ── Grupos ───────────────────────────────────────── */}
						<section>
							<h2 className="text-lg font-semibold text-white mb-1">
								Fase de grupos
							</h2>
							<p className="text-xs text-gray-400 mb-4">
								<span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5" />
								Clasifica directo (1º y 2º)
								<span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500 ml-4 mr-1.5" />
								3º: clasifican los 8 mejores
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
								{board.groups.map((g) => (
									<GroupCard key={g.group} table={g} />
								))}
							</div>
						</section>

						{/* ── Mejores terceros ─────────────────────────────── */}
						{board.thirds_ranking.length > 0 && (
							<section className="mt-10">
								<h2 className="text-lg font-semibold text-white mb-1">
									Ranking de terceros
								</h2>
								<p className="text-xs text-gray-400 mb-4">
									Los 8 mejores terceros avanzan a la ronda de 32.
								</p>
								<div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
									<table className="w-full text-sm min-w-[480px]">
										<thead>
											<tr className="text-gray-400 text-xs">
												<th className="text-left pl-3 py-2 font-medium">#</th>
												<th className="text-left font-medium w-full">Equipo</th>
												<th className="px-2 font-medium">Grupo</th>
												<th className="px-2 font-medium">PJ</th>
												<th className="px-2 font-medium">DIF</th>
												<th className="px-2 font-medium">GF</th>
												<th className="px-2 font-semibold text-white">Pts</th>
											</tr>
										</thead>
										<tbody>
											{board.thirds_ranking.map((row, i) => (
												<tr
													key={row.team?.id_equipo ?? i}
													className={`border-t border-white/5 ${
														i < 8 ? 'bg-green-500/10' : 'opacity-60'
													}`}
												>
													<td className="pl-3 py-1.5 text-gray-300">{i + 1}</td>
													<td className="text-white">
														<TeamCell team={row.team} fallback="—" />
													</td>
													<td className="text-center text-gray-300">
														{row.group}
													</td>
													<td className="text-center text-gray-300">{row.pj}</td>
													<td className="text-center text-gray-300">
														{row.dif}
													</td>
													<td className="text-center text-gray-300">{row.gf}</td>
													<td className="text-center font-bold text-white">
														{row.pts}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</section>
						)}

						{/* ── Eliminatorias ─────────────────────────────────── */}
						<section className="mt-10">
							<h2 className="text-lg font-semibold text-white mb-4">
								Fase eliminatoria
							</h2>
							<div className="flex flex-col gap-8">
								{board.knockout.map((round) => (
									<div key={round.ronda}>
										<h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3">
											{ROUND_LABELS[round.ronda] ?? round.ronda}
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
											{round.matches.map((m) => (
												<KnockoutCard key={m.match_no} match={m} />
											))}
										</div>
									</div>
								))}
							</div>
						</section>
					</>
				)}
			</div>
		</AppShell>
	);
}

export default WorldCupBoard;
