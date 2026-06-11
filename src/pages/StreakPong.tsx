import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import BackButton from '../components/BackButton';
import { useAuth } from '../hooks/useAuth';

// ---- Game constants -------------------------------------------------------
const W = 800;
const H = 500;
const PADDLE_X = 24; // distance of paddles from each goal line
const PADDLE_W = 12;
const PADDLE_H = 92;
const BALL_R = 11;
const MAX_GOALS = 3;
const BASE_SPEED = 5.2;
const MAX_SPEED = 13;
const PLAYER_KEY_SPEED = 7.5;
const AI_MAX_SPEED = 5.2;
const GOAL_BONUS = 50;
const BEST_KEY = 'streakPongBest';

interface Team {
	name: string;
	code: string; // flagcdn.com country code
}

// World Cup nations — one is randomly assigned to the player each match.
const WORLD_CUP_TEAMS: Team[] = [
	{ name: 'Argentina', code: 'ar' },
	{ name: 'Brazil', code: 'br' },
	{ name: 'France', code: 'fr' },
	{ name: 'Spain', code: 'es' },
	{ name: 'Germany', code: 'de' },
	{ name: 'Italy', code: 'it' },
	{ name: 'Portugal', code: 'pt' },
	{ name: 'Netherlands', code: 'nl' },
	{ name: 'England', code: 'gb-eng' },
	{ name: 'Uruguay', code: 'uy' },
	{ name: 'Mexico', code: 'mx' },
	{ name: 'United States', code: 'us' },
	{ name: 'Canada', code: 'ca' },
	{ name: 'Japan', code: 'jp' },
	{ name: 'South Korea', code: 'kr' },
	{ name: 'Morocco', code: 'ma' },
	{ name: 'Senegal', code: 'sn' },
	{ name: 'Croatia', code: 'hr' },
	{ name: 'Belgium', code: 'be' },
	{ name: 'Colombia', code: 'co' },
	{ name: 'Ecuador', code: 'ec' },
	{ name: 'Switzerland', code: 'ch' },
	{ name: 'Australia', code: 'au' },
	{ name: 'Ghana', code: 'gh' },
];

/** Points earned when cashing out a streak (grows quadratically — hold your nerve!). */
const bankValue = (streak: number): number => 5 * streak * (streak + 1);

const pickTeams = (): [Team, Team] => {
	const i = Math.floor(Math.random() * WORLD_CUP_TEAMS.length);
	let j = Math.floor(Math.random() * (WORLD_CUP_TEAMS.length - 1));
	if (j >= i) j += 1;
	return [WORLD_CUP_TEAMS[i], WORLD_CUP_TEAMS[j]];
};

type Phase = 'idle' | 'playing' | 'gameover';

interface GameState {
	ballX: number;
	ballY: number;
	vx: number;
	vy: number;
	speed: number;
	rot: number;
	playerY: number;
	aiY: number;
	aiError: number;
	streak: number;
	score: number;
	goalsAgainst: number;
	msg: string;
	msgT: number;
	keys: { up: boolean; down: boolean };
}

const freshState = (): GameState => ({
	ballX: W / 2,
	ballY: H / 2,
	vx: 0,
	vy: 0,
	speed: BASE_SPEED,
	rot: 0,
	playerY: H / 2 - PADDLE_H / 2,
	aiY: H / 2 - PADDLE_H / 2,
	aiError: 0,
	streak: 0,
	score: 0,
	goalsAgainst: 0,
	msg: '',
	msgT: 0,
	keys: { up: false, down: false },
});

const flagUrl = (code: string) => `https://flagcdn.com/w40/${code}.png`;

/**
 * Streak Pong — soccer-themed pong with a push-your-luck twist.
 * Every save builds a streak; cash it out for points before you concede,
 * because a goal against wipes the unbanked streak. Three goals = full time.
 */
const StreakPong = () => {
	const { t } = useTranslation(['home', 'common']);
	const { user } = useAuth();
	const navigate = useNavigate();

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef(0);
	const g = useRef<GameState>(freshState());
	const phaseRef = useRef<Phase>('idle');

	const [phase, setPhase] = useState<Phase>('idle');
	const [score, setScore] = useState(0);
	const [streak, setStreak] = useState(0);
	const [goalsAgainst, setGoalsAgainst] = useState(0);
	const [teams, setTeams] = useState<[Team, Team]>(() => pickTeams());
	const [best, setBest] = useState<number>(() => Number(localStorage.getItem(BEST_KEY) || 0));
	const [isNewBest, setIsNewBest] = useState(false);

	const userName = user?.nombre_usuario || user?.username || t('common:user');
	const [playerTeam, aiTeam] = teams;

	const serve = useCallback((towardPlayer: boolean) => {
		const s = g.current;
		s.ballX = W / 2;
		s.ballY = H / 2;
		s.speed = BASE_SPEED;
		const angle = (Math.random() - 0.5) * (Math.PI / 3); // up to ±30°
		const dir = towardPlayer ? -1 : 1;
		s.vx = Math.cos(angle) * s.speed * dir;
		s.vy = Math.sin(angle) * s.speed;
	}, []);

	const setMessage = useCallback((text: string) => {
		g.current.msg = text;
		g.current.msgT = 75;
	}, []);

	const cashOut = useCallback(() => {
		const s = g.current;
		if (phaseRef.current !== 'playing' || s.streak === 0) return;
		const points = bankValue(s.streak);
		s.score += points;
		s.streak = 0;
		setScore(s.score);
		setStreak(0);
		setMessage(t('home:streakPong.banked', { points }));
	}, [setMessage, t]);

	const endGame = useCallback(() => {
		phaseRef.current = 'gameover';
		setPhase('gameover');
		const final = g.current.score;
		setBest((prev) => {
			if (final > prev) {
				localStorage.setItem(BEST_KEY, String(final));
				setIsNewBest(true);
				return final;
			}
			setIsNewBest(false);
			return prev;
		});
	}, []);

	const start = useCallback(() => {
		g.current = freshState();
		setScore(0);
		setStreak(0);
		setGoalsAgainst(0);
		setIsNewBest(false);
		setTeams(pickTeams());
		phaseRef.current = 'playing';
		setPhase('playing');
		serve(true);
	}, [serve]);

	// ---- Input --------------------------------------------------------------
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
				g.current.keys.up = true;
				e.preventDefault();
			} else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
				g.current.keys.down = true;
				e.preventDefault();
			} else if (e.key === ' ') {
				e.preventDefault();
				cashOut();
			}
		};
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') g.current.keys.up = false;
			if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') g.current.keys.down = false;
		};
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
		};
	}, [cashOut]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const movePaddle = (clientY: number) => {
			const rect = canvas.getBoundingClientRect();
			const y = ((clientY - rect.top) / rect.height) * H;
			g.current.playerY = Math.max(0, Math.min(H - PADDLE_H, y - PADDLE_H / 2));
		};
		const onMouseMove = (e: MouseEvent) => movePaddle(e.clientY);
		const onTouchMove = (e: TouchEvent) => {
			if (e.touches.length > 0) {
				e.preventDefault();
				movePaddle(e.touches[0].clientY);
			}
		};
		canvas.addEventListener('mousemove', onMouseMove);
		canvas.addEventListener('touchmove', onTouchMove, { passive: false });
		return () => {
			canvas.removeEventListener('mousemove', onMouseMove);
			canvas.removeEventListener('touchmove', onTouchMove);
		};
	}, []);

	// ---- Game loop ------------------------------------------------------------
	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;

		const update = () => {
			const s = g.current;

			// Player paddle (keyboard)
			if (s.keys.up) s.playerY -= PLAYER_KEY_SPEED;
			if (s.keys.down) s.playerY += PLAYER_KEY_SPEED;
			s.playerY = Math.max(0, Math.min(H - PADDLE_H, s.playerY));

			// AI paddle: tracks the ball (imperfectly) when it approaches
			const aiCenter = s.aiY + PADDLE_H / 2;
			const target = s.vx > 0 ? s.ballY + s.aiError : H / 2;
			const delta = target - aiCenter;
			s.aiY += Math.max(-AI_MAX_SPEED, Math.min(AI_MAX_SPEED, delta * 0.18));
			s.aiY = Math.max(0, Math.min(H - PADDLE_H, s.aiY));

			// Ball
			s.ballX += s.vx;
			s.ballY += s.vy;
			s.rot += s.vx * 0.03;

			// Walls
			if (s.ballY < BALL_R) {
				s.ballY = BALL_R;
				s.vy = Math.abs(s.vy);
			} else if (s.ballY > H - BALL_R) {
				s.ballY = H - BALL_R;
				s.vy = -Math.abs(s.vy);
			}

			// Player paddle collision (left)
			const pFront = PADDLE_X + PADDLE_W;
			if (
				s.vx < 0 &&
				s.ballX - BALL_R <= pFront &&
				s.ballX - BALL_R > PADDLE_X - 6 &&
				s.ballY >= s.playerY - BALL_R &&
				s.ballY <= s.playerY + PADDLE_H + BALL_R
			) {
				const rel = (s.ballY - (s.playerY + PADDLE_H / 2)) / (PADDLE_H / 2);
				const angle = rel * 0.85; // max ~49°
				s.speed = Math.min(s.speed * 1.06 + 0.05, MAX_SPEED);
				s.vx = Math.cos(angle) * s.speed;
				s.vy = Math.sin(angle) * s.speed;
				s.ballX = pFront + BALL_R;
				s.streak += 1;
				s.aiError = (Math.random() - 0.5) * PADDLE_H * 1.25;
				setStreak(s.streak);
			}

			// AI paddle collision (right)
			const aiFront = W - PADDLE_X - PADDLE_W;
			if (
				s.vx > 0 &&
				s.ballX + BALL_R >= aiFront &&
				s.ballX + BALL_R < aiFront + PADDLE_W + 6 &&
				s.ballY >= s.aiY - BALL_R &&
				s.ballY <= s.aiY + PADDLE_H + BALL_R
			) {
				const rel = (s.ballY - (s.aiY + PADDLE_H / 2)) / (PADDLE_H / 2);
				const angle = rel * 0.85;
				s.vx = -Math.cos(angle) * s.speed;
				s.vy = Math.sin(angle) * s.speed;
				s.ballX = aiFront - BALL_R;
			}

			// Goal against the player (ball crosses the left line)
			if (s.ballX < -BALL_R * 2) {
				s.goalsAgainst += 1;
				s.streak = 0;
				setStreak(0);
				setGoalsAgainst(s.goalsAgainst);
				if (s.goalsAgainst >= MAX_GOALS) {
					endGame();
					return;
				}
				setMessage(t('home:streakPong.conceded'));
				serve(true);
			}

			// Player scores past the CPU (ball crosses the right line)
			if (s.ballX > W + BALL_R * 2) {
				s.score += GOAL_BONUS;
				setScore(s.score);
				setMessage(t('home:streakPong.goalBonus', { points: GOAL_BONUS }));
				serve(false);
			}

			if (s.msgT > 0) s.msgT -= 1;
		};

		const draw = () => {
			const s = g.current;

			// Pitch: alternating mowing stripes
			for (let i = 0; i < 8; i += 1) {
				ctx.fillStyle = i % 2 === 0 ? '#14532d' : '#166534';
				ctx.fillRect((W / 8) * i, 0, W / 8, H);
			}

			// Pitch markings
			ctx.strokeStyle = 'rgba(255,255,255,0.4)';
			ctx.lineWidth = 2;
			ctx.strokeRect(4, 4, W - 8, H - 8);
			ctx.beginPath();
			ctx.moveTo(W / 2, 4);
			ctx.lineTo(W / 2, H - 4);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(W / 2, H / 2, 62, 0, Math.PI * 2);
			ctx.stroke();
			ctx.strokeRect(4, H / 2 - 110, 90, 220); // left penalty box
			ctx.strokeRect(W - 94, H / 2 - 110, 90, 220); // right penalty box

			// Paddles
			ctx.fillStyle = '#22c55e';
			ctx.fillRect(PADDLE_X, s.playerY, PADDLE_W, PADDLE_H);
			ctx.fillStyle = '#f8fafc';
			ctx.fillRect(W - PADDLE_X - PADDLE_W, s.aiY, PADDLE_W, PADDLE_H);

			// Ball (rolling soccer ball)
			if (phaseRef.current === 'playing') {
				ctx.save();
				ctx.translate(s.ballX, s.ballY);
				ctx.rotate(s.rot);
				ctx.font = `${BALL_R * 2.4}px serif`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText('⚽', 0, 2);
				ctx.restore();
			}

			// Streak indicator on the pitch
			if (s.streak > 0 && phaseRef.current === 'playing') {
				ctx.fillStyle = 'rgba(255,255,255,0.85)';
				ctx.font = 'bold 20px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText(`x${s.streak}  (+${bankValue(s.streak)})`, W / 2, 40);
			}

			// Event message (banked / goal / conceded)
			if (s.msgT > 0 && s.msg) {
				ctx.save();
				ctx.globalAlpha = Math.min(1, s.msgT / 45);
				ctx.fillStyle = '#facc15';
				ctx.font = 'bold 34px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText(s.msg, W / 2, H / 2 - 90);
				ctx.restore();
			}
		};

		const loop = () => {
			if (phaseRef.current === 'playing') update();
			draw();
			rafRef.current = requestAnimationFrame(loop);
		};
		rafRef.current = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafRef.current);
	}, [endGame, serve, setMessage, t]);

	// ---- UI -------------------------------------------------------------------
	return (
		<AppShell>
			<div className="flex-1 flex flex-col h-screen overflow-hidden">
				<header className="h-16 md:h-20 flex items-center gap-4 px-4 md:px-8 lg:px-12 bg-app/95 backdrop-blur-sm z-10 sticky top-0">
					<BackButton onClick={() => navigate('/homepage')} />
					<h1 className="text-lg md:text-2xl font-bold tracking-tight text-white">
						{t('home:streakPong.title')} <span className="text-green-500">⚽</span>
					</h1>
				</header>

				<div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 pb-12">
					<div className="max-w-4xl mx-auto flex flex-col gap-4">
						{/* Scoreboard */}
						<div className="flex items-center justify-between bg-surface rounded-xl border border-white/5 px-4 py-3">
							<div className="flex items-center gap-2 min-w-0">
								<img src={flagUrl(playerTeam.code)} alt={playerTeam.name} className="w-7 h-5 rounded-sm object-cover" />
								<div className="min-w-0">
									<p className="text-sm font-bold text-white truncate">{playerTeam.name}</p>
									<p className="text-xs text-green-400 truncate">{userName}</p>
								</div>
							</div>
							<div className="text-center px-3">
								<p className="text-2xl md:text-3xl font-bold text-white tabular-nums">{score}</p>
								<p className="text-[10px] uppercase tracking-wider text-gray-500">{t('home:streakPong.scoreLabel')}</p>
							</div>
							<div className="flex items-center gap-2 min-w-0 justify-end">
								<div className="min-w-0 text-right">
									<p className="text-sm font-bold text-white truncate">{aiTeam.name}</p>
									<p className="text-xs text-gray-400">{t('home:streakPong.cpu')}</p>
								</div>
								<img src={flagUrl(aiTeam.code)} alt={aiTeam.name} className="w-7 h-5 rounded-sm object-cover" />
							</div>
						</div>

						{/* Pitch */}
						<div className="relative rounded-xl overflow-hidden border border-white/10 shadow-lg">
							<canvas ref={canvasRef} width={W} height={H} className="w-full block touch-none" />

							{phase === 'idle' && (
								<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 p-6 text-center">
									<p className="text-white text-lg font-bold">
										{t('home:streakPong.playingFor')}{' '}
										<span className="text-green-400">{playerTeam.name}</span>
									</p>
									<p className="text-gray-300 text-sm max-w-md">{t('home:streakPong.hint')}</p>
									<button onClick={start} className="btn-primary px-8 py-3 text-base">
										{t('home:streakPong.kickOff')}
									</button>
								</div>
							)}

							{phase === 'gameover' && (
								<div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 p-6 text-center">
									<p className="text-yellow-400 text-2xl font-bold">{t('home:streakPong.fullTime')}</p>
									<p className="text-white text-lg">
										{t('home:streakPong.finalScore')}: <span className="font-bold text-green-400">{score}</span>
									</p>
									{isNewBest && <p className="text-green-400 text-sm font-medium">{t('home:streakPong.newBest')}</p>}
									<button onClick={start} className="btn-primary px-8 py-3 text-base mt-2">
										{t('home:streakPong.playAgain')}
									</button>
								</div>
							)}
						</div>

						{/* Controls row */}
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
							<button
								onClick={cashOut}
								disabled={phase !== 'playing' || streak === 0}
								className={`btn-primary flex-1 py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed ${
									streak >= 4 ? 'animate-pulse' : ''
								}`}
							>
								{t('home:streakPong.cashOut')} {streak > 0 ? `+${bankValue(streak)}` : ''}
							</button>
							<div className="flex items-center justify-around sm:justify-end gap-4 bg-surface rounded-lg border border-white/5 px-4 py-2">
								<div className="text-center">
									<p className="text-lg font-bold text-white tabular-nums">x{streak}</p>
									<p className="text-[10px] uppercase tracking-wider text-gray-500">{t('home:streakPong.streakLabel')}</p>
								</div>
								<div className="text-center">
									<p className="text-lg font-bold text-white tabular-nums">
										{Array.from({ length: MAX_GOALS }, (_, i) => (i < goalsAgainst ? '⚽' : '·')).join(' ')}
									</p>
									<p className="text-[10px] uppercase tracking-wider text-gray-500">{t('home:streakPong.goalsAgainst')}</p>
								</div>
								<div className="text-center">
									<p className="text-lg font-bold text-yellow-400 tabular-nums">{best}</p>
									<p className="text-[10px] uppercase tracking-wider text-gray-500">{t('home:streakPong.bestLabel')}</p>
								</div>
							</div>
						</div>

						<p className="text-xs text-gray-500 text-center">{t('home:streakPong.hint')}</p>
					</div>
				</div>
			</div>
		</AppShell>
	);
};

export default StreakPong;
