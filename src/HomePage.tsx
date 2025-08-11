import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout';
import SportCard from './components/SportCard';
import RoomCard from './components/RoomCard';
import StatsCard from './components/StatsCard';

interface Sport {
	id: string;
	name: string;
	icon: string;
	color: string;
	bgGradient: string;
	activeMatches: number;
}

interface Room {
	id_sala: number;
	nombre: string;
	descripcion: string;
	codigo_sala: string;
	miembros: number;
	owner: string;
	estado: string;
}

interface UserStats {
	totalPoints: number;
	globalRank: number;
	activeBets: number;
	winRate: number;
}

const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation(['home', 'common', 'sports']);
	const [userRooms, setUserRooms] = useState<Room[]>([]);
	const [popularRooms, setPopularRooms] = useState<Room[]>([]);
	const [userStats, setUserStats] = useState<UserStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [userName, setUserName] = useState('');

	const sports: Sport[] = [
		{
			id: 'football',
			name: t('sports:football'),
			icon: '⚽',
			color: 'text-green-500',
			bgGradient: 'from-green-400 to-green-600',
			activeMatches: 24,
		},
		{
			id: 'basketball',
			name: t('sports:basketball'),
			icon: '🏀',
			color: 'text-orange-500',
			bgGradient: 'from-orange-400 to-orange-600',
			activeMatches: 12,
		},
		{
			id: 'baseball',
			name: t('sports:baseball'),
			icon: '⚾',
			color: 'text-red-500',
			bgGradient: 'from-red-400 to-red-600',
			activeMatches: 8,
		},
		{
			id: 'tennis',
			name: t('sports:tennis'),
			icon: '🎾',
			color: 'text-yellow-500',
			bgGradient: 'from-yellow-400 to-yellow-600',
			activeMatches: 15,
		},
		{
			id: 'volleyball',
			name: t('sports:volleyball'),
			icon: '🏐',
			color: 'text-blue-500',
			bgGradient: 'from-blue-400 to-blue-600',
			activeMatches: 6,
		},
	];

	useEffect(() => {
		fetchUserData();
		fetchRooms();
	}, []);

	const fetchUserData = async () => {
		try {
			const userData = localStorage.getItem('user');
			if (userData) {
				const user = JSON.parse(userData);
				setUserName(user.nombre_usuario || user.username || 'Usuario');
			} else {
				setUserName('Usuario');
			}

			// Mock user stats - replace with actual API call
			setUserStats({
				totalPoints: 1250,
				globalRank: 42,
				activeBets: 5,
				winRate: 68.5,
			});
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	};

	const fetchRooms = async () => {
		try {
			setLoading(true);
			// Mock data for demonstration - replace with actual API calls
			setUserRooms([
				{
					id_sala: 1,
					nombre: 'Liga de Campeones',
					descripcion: 'Competencia elite',
					codigo_sala: 'ABC123',
					miembros: 25,
					owner: 'admin',
					estado: 'activo',
				},
				{
					id_sala: 2,
					nombre: 'Amigos del Barrio',
					descripcion: 'Solo para locales',
					codigo_sala: 'XYZ789',
					miembros: 12,
					owner: 'juan',
					estado: 'activo',
				},
			]);

			setPopularRooms([
				{
					id_sala: 3,
					nombre: 'Mundial 2026',
					descripcion: 'Predicciones del mundial',
					codigo_sala: 'WC2026',
					miembros: 150,
					owner: 'system',
					estado: 'activo',
				},
				{
					id_sala: 4,
					nombre: 'Copa América',
					descripcion: 'Torneo continental',
					codigo_sala: 'COPA24',
					miembros: 89,
					owner: 'system',
					estado: 'activo',
				},
				{
					id_sala: 5,
					nombre: 'Liga Local',
					descripcion: 'Apuestas de la liga nacional',
					codigo_sala: 'LIGA01',
					miembros: 67,
					owner: 'admin',
					estado: 'activo',
				},
			]);
		} catch (error) {
			console.error('Error fetching rooms:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSportSelect = (sportId: string) => {
		console.log(`Selected sport: ${sportId}`);
		// navigate(`/matches?sport=${sportId}`);
	};

	const handleRoomClick = (roomId: number) => {
		console.log(`Navigating to room: ${roomId}`);
		// navigate(`/room/${roomId}`);
	};

	const handleCreateRoom = () => {
		console.log('Navigate to create room');
		// navigate('/create-room');
	};

	const handleJoinRoom = () => {
		console.log('Navigate to join room');
		// navigate('/join-room');
	};

	return (
		<Layout>
			{/* Hero Section */}
			<div className="relative overflow-hidden">
				<div className="absolute inset-0 bg-black opacity-50"></div>
				<div className="relative z-10 px-6 py-12 mx-auto max-w-7xl">
					<div className="text-center text-white">
						<h1 className="text-5xl font-bold mb-4 animate-pulse">
							{t('home:welcomeMessage', { name: userName })}
						</h1>
						<p className="text-xl mb-8 text-gray-300">
							{t('home:subtitle')}
						</p>
					</div>

					{/* User Stats Cards */}
					{userStats && (
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
							<StatsCard
								title={t('home:stats.totalPoints')}
								value={userStats.totalPoints}
								icon="🏆"
							/>
							<StatsCard
								title={t('home:stats.globalRank')}
								value={`#${userStats.globalRank}`}
								icon="👑"
							/>
							<StatsCard
								title={t('home:stats.activeBets')}
								value={userStats.activeBets}
								icon="🎲"
							/>
							<StatsCard
								title={t('home:stats.successRate')}
								value={`${userStats.winRate}%`}
								icon="📈"
							/>
						</div>
					)}
				</div>
			</div>

			{/* Sports Selection */}
			<div className="px-6 py-8 mx-auto max-w-7xl">
				<h2 className="text-3xl font-bold text-white mb-6 flex items-center">
					<span className="mr-3 text-3xl">🏅</span>
					{t('home:selectSport')}
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
					{sports.map((sport) => (
						<SportCard
							key={sport.id}
							id={sport.id}
							name={sport.name}
							icon={sport.icon}
							bgGradient={sport.bgGradient}
							activeMatches={sport.activeMatches}
							onSelect={handleSportSelect}
						/>
					))}
				</div>

				{/* Rooms Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* My Rooms */}
					<div>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-2xl font-bold text-white flex items-center">
								<span className="mr-2 text-2xl">👥</span>
								{t('home:myRooms')}
							</h2>
							<button
								onClick={handleCreateRoom}
								className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
							>
								<span className="mr-2">➕</span>
								{t('home:createRoom')}
							</button>
						</div>
						<div className="space-y-4">
							{loading ? (
								<div className="text-white text-center py-8">
									{t('common:loading')}
								</div>
							) : userRooms.length > 0 ? (
								userRooms.map((room) => (
									<RoomCard
										key={room.id_sala}
										id={room.id_sala}
										name={room.nombre}
										description={room.descripcion}
										members={room.miembros}
										code={room.codigo_sala}
										status={room.estado}
										onClick={handleRoomClick}
									/>
								))
							) : (
								<div className="bg-white/5 rounded-xl p-8 text-center">
									<p className="text-gray-400 mb-4">{t('home:noActiveRooms')}</p>
									<button
										onClick={handleJoinRoom}
										className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
									>
										{t('home:joinRoom')}
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Popular Rooms */}
					<div>
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-2xl font-bold text-white flex items-center">
								<span className="mr-2 text-2xl text-yellow-400">🏆</span>
								{t('home:popularRooms')}
							</h2>
							<button
								onClick={handleJoinRoom}
								className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
							>
								{t('home:exploreMore')}
							</button>
						</div>
						<div className="space-y-4">
							{popularRooms.map((room, index) => (
								<RoomCard
									key={room.id_sala}
									id={room.id_sala}
									name={room.nombre}
									description={room.descripcion}
									members={room.miembros}
									rank={index + 1}
									onClick={handleRoomClick}
									onJoin={handleJoinRoom}
									showJoinButton={true}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
					<button
						onClick={() => console.log('Navigate to matches')}
						className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 hover:shadow-2xl transform hover:scale-105 transition-all group"
					>
						<div className="text-5xl mb-3 text-center group-hover:animate-bounce">
							⚽
						</div>
						<h3 className="text-xl font-bold">{t('home:viewMatches')}</h3>
						<p className="text-sm mt-2 opacity-90">
							{t('home:viewMatchesDesc')}
						</p>
					</button>
					<button
						onClick={() => console.log('Navigate to my bets')}
						className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-6 hover:shadow-2xl transform hover:scale-105 transition-all group"
					>
						<div className="text-5xl mb-3 text-center group-hover:animate-bounce">
							🎲
						</div>
						<h3 className="text-xl font-bold">{t('home:myBets')}</h3>
						<p className="text-sm mt-2 opacity-90">
							{t('home:myBetsDesc')}
						</p>
					</button>
					<button
						onClick={() => console.log('Navigate to rankings')}
						className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-6 hover:shadow-2xl transform hover:scale-105 transition-all group"
					>
						<div className="text-5xl mb-3 text-center group-hover:animate-bounce">
							🏆
						</div>
						<h3 className="text-xl font-bold">{t('home:rankings')}</h3>
						<p className="text-sm mt-2 opacity-90">
							{t('home:rankingsDesc')}
						</p>
					</button>
				</div>

				{/* Recent Activity Section */}
				<div className="mt-12 bg-white/5 rounded-xl p-6">
					<h3 className="text-2xl font-bold text-white mb-4">
						🔥 {t('home:recentActivity')}
					</h3>
					<div className="space-y-3">
						<div className="flex items-center justify-between text-gray-300">
							<span>{t('home:activities.userBet', { user: 'Juan', match: 'Real Madrid vs Barcelona' })}</span>
							<span className="text-sm">{t('home:timeAgo.minutes', { count: 5 })}</span>
						</div>
						<div className="flex items-center justify-between text-gray-300">
							<span>{t('home:activities.userJoined', { user: 'María', room: 'Liga de Campeones' })}</span>
							<span className="text-sm">{t('home:timeAgo.minutes', { count: 12 })}</span>
						</div>
						<div className="flex items-center justify-between text-gray-300">
							<span>{t('home:activities.userWon', { user: 'Carlos', points: 50 })}</span>
							<span className="text-sm">{t('home:timeAgo.hours', { count: 1 })}</span>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default HomePage;