import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import { GiSoccerField, GiTennisRacket, GiBasketballBall } from "react-icons/gi";
import { FiSearch, FiFilter } from "react-icons/fi";
import { useAuth } from '../hooks/useAuth';

interface Team {
	id_equipo: number;
	nombre: string;
	logo?: string;
	bandera?: string;
}

interface Competition {
	id_competencia: number;
	nombre: string;
	logo?: string;
}

interface League {
	id_liga: number;
	nombre: string;
	logo_url?: string;
	pais_nombre?: string;
	tipo?: string;
}

interface Match {
	id_partidos: number;
	equipo_local: Team;
	equipo_visitante: Team;
	resultado_local: number;
	resultado_visitante: number;
	id_competencia: Competition;
	fecha_partido: string;
	estado: 'programado' | 'en curso' | 'finalizado' | 'cancelado';
	id_escenario?: {
		nombre: string;
		ciudad?: string;
	};
}

const SoccerMatches: React.FC = () => {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const [matches, setMatches] = useState<Match[]>([]);
	const [leagues, setLeagues] = useState<League[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedLeague, setSelectedLeague] = useState<number | 'all'>('all');
	const [activeTab, setActiveTab] = useState<'upcoming' | 'finished'>('upcoming');
	const [searchTerm, setSearchTerm] = useState('');

	const userName = user?.nombre_usuario || user?.username || "Usuario";

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	// TODO: Conectar con tu backend
	// Ejemplo de función para cargar ligas:
	const fetchLeagues = async () => {
		try {
			setLoading(true);
			// AQUI: Reemplaza con tu endpoint
			// const response = await api.get('/api/ligas/por_deporte/', {
			//   params: { deporte_id: 1 }
			// });
			// setLeagues(response.data);

			// Datos de ejemplo para desarrollo
			setLeagues([
				{ id_liga: 1, nombre: 'La Liga', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/LaLiga.svg/240px-LaLiga.svg.png', pais_nombre: 'España' },
				{ id_liga: 2, nombre: 'Premier League', logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/240px-Premier_League_Logo.svg.png', pais_nombre: 'Inglaterra' },
				{ id_liga: 3, nombre: 'Serie A', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Serie_A_logo_2022.svg/240px-Serie_A_logo_2022.svg.png', pais_nombre: 'Italia' },
			]);
		} catch (err) {
			console.error('Error fetching leagues:', err);
		} finally {
			setLoading(false);
		}
	};

	// TODO: Conectar con tu backend
	const fetchMatches = async () => {
		try {
			setLoading(true);
			// AQUI: Reemplaza con tu endpoint
			// if (selectedLeague === 'all') {
			//   const response = await api.get('/api/partidos/', {
			//     params: { deporte: 1 }
			//   });
			//   setMatches(response.data.results || response.data);
			// } else {
			//   const response = await api.get('/api/partidos/por_liga/', {
			//     params: {
			//       liga_id: selectedLeague,
			//       temporada: new Date().getFullYear().toString()
			//     }
			//   });
			//   setMatches(response.data.results || response.data);
			// }

			// Datos de ejemplo para desarrollo
			const exampleMatches: Match[] = [
				{
					id_partidos: 1,
					equipo_local: { id_equipo: 1, nombre: 'Real Madrid', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/40px-Real_Madrid_CF.svg.png' },
					equipo_visitante: { id_equipo: 2, nombre: 'Barcelona', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/40px-FC_Barcelona_%28crest%29.svg.png' },
					resultado_local: 0,
					resultado_visitante: 0,
					id_competencia: { id_competencia: 1, nombre: 'La Liga' },
					fecha_partido: new Date(Date.now() + 86400000).toISOString(),
					estado: 'programado',
					id_escenario: { nombre: 'Santiago Bernabéu', ciudad: 'Madrid' }
				},
				{
					id_partidos: 2,
					equipo_local: { id_equipo: 3, nombre: 'Atlético Madrid', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/40px-Atletico_Madrid_2017_logo.svg.png' },
					equipo_visitante: { id_equipo: 4, nombre: 'Sevilla', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/40px-Sevilla_FC_logo.svg.png' },
					resultado_local: 2,
					resultado_visitante: 1,
					id_competencia: { id_competencia: 1, nombre: 'La Liga' },
					fecha_partido: new Date(Date.now() - 86400000).toISOString(),
					estado: 'finalizado',
					id_escenario: { nombre: 'Wanda Metropolitano', ciudad: 'Madrid' }
				}
			];
			setMatches(exampleMatches);
		} catch (err) {
			console.error('Error fetching matches:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLeagues();
	}, []);

	useEffect(() => {
		fetchMatches();
	}, [selectedLeague]);

	const filteredMatches = matches.filter((match) => {
		const isUpcoming = match.estado === 'programado' || match.estado === 'en curso';
		const isFinished = match.estado === 'finalizado';
		const matchesTab = activeTab === 'upcoming' ? isUpcoming : isFinished;

		const matchesSearch = searchTerm === '' ||
			match.equipo_local.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
			match.equipo_visitante.nombre.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesTab && matchesSearch;
	});

	return (
		<div className="flex flex-col lg:flex-row h-screen bg-[#0e0f11] text-white">
			{/* Sidebar */}
			<aside className="lg:w-20 w-full flex lg:flex-col flex-row items-center justify-around lg:justify-start py-4 lg:py-6 lg:space-y-8 space-x-4 lg:space-x-0 bg-[#121316]">
				{/* Home icon */}
				<FaHome
					onClick={() => navigate('/homepage')}
					className="
						text-white w-12 h-12
						p-3
						rounded-2xl
						hover:bg-white/10
						transition-all duration-200 ease-in-out
						cursor-pointer"
				/>

				{/* Soccer icon - Active */}
				<GiSoccerField
					className="
						text-white w-12 h-12
						p-3
						rounded-2xl
						bg-green-600
						transition-all duration-200 ease-in-out
						cursor-pointer"
				/>

				{/* Tennis icon */}
				<GiTennisRacket
					onClick={() => navigate('/tennis-matches')}
					className="
						text-white w-12 h-12
						p-3
						rounded-2xl
						hover:bg-white/10
						transition-all duration-200 ease-in-out
						cursor-pointer"
				/>

				{/* Basketball icon */}
				<GiBasketballBall
					onClick={() => navigate('/basketball-matches')}
					className="
						text-white w-12 h-12
						p-3
						rounded-2xl
						hover:bg-white/10
						transition-all duration-200 ease-in-out
						cursor-pointer"
				/>
			</aside>

			{/* Main panel */}
			<main className="flex-1 p-4 md:p-8 overflow-y-auto">
				{/* Header */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
					<div>
						<h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-3">
							<span className="text-4xl">⚽</span>
							Partidos de Fútbol
						</h1>
						<p className="text-gray-400 text-sm md:text-base mt-1">
							Apuesta en tus partidos favoritos
						</p>
					</div>

					<div className="flex items-center space-x-2 md:space-x-4">
						<span className="text-gray-300 text-sm md:text-base">{userName}</span>
						<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center">
							<span className="text-lg md:text-xl">{userName.charAt(0).toUpperCase()}</span>
						</div>

						{/* Logout button */}
						<button
							onClick={handleLogout}
							className="px-3 py-1.5 md:px-4 md:py-2 bg-red-700 hover:bg-red-400 transition rounded-2xl text-xs md:text-sm"
						>
							Cerrar sesión
						</button>
					</div>
				</div>

				{/* League Selector */}
				<div className="mb-6">
					<h2 className="text-base md:text-lg font-semibold mb-4">Selecciona una Liga</h2>
					<div className="flex gap-3 overflow-x-auto pb-2">
						<button
							onClick={() => setSelectedLeague('all')}
							className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl transition-all min-w-[80px] md:min-w-[100px] ${
								selectedLeague === 'all'
									? 'bg-green-600 shadow-lg scale-105'
									: 'bg-white/10 hover:bg-white/20'
							}`}
						>
							<span className="text-2xl md:text-3xl mb-1">🌍</span>
							<span className="text-xs md:text-sm font-medium text-center">Todas</span>
						</button>

						{leagues.map((league) => (
							<button
								key={league.id_liga}
								onClick={() => setSelectedLeague(league.id_liga)}
								className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl transition-all min-w-[80px] md:min-w-[100px] ${
									selectedLeague === league.id_liga
										? 'bg-green-600 shadow-lg scale-105'
										: 'bg-white/10 hover:bg-white/20'
								}`}
							>
								{league.logo_url ? (
									<img
										src={league.logo_url}
										alt={league.nombre}
										className="w-8 h-8 md:w-10 md:h-10 object-contain mb-1"
									/>
								) : (
									<span className="text-2xl md:text-3xl mb-1">🏆</span>
								)}
								<span className="text-xs md:text-sm font-medium text-center line-clamp-2">{league.nombre}</span>
							</button>
						))}
					</div>
				</div>

				{/* Tabs */}
				<div className="flex space-x-2 bg-white/10 p-1 rounded-xl max-w-md mb-6">
					<button
						onClick={() => setActiveTab('upcoming')}
						className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all text-sm md:text-base ${
							activeTab === 'upcoming'
								? 'bg-green-600 text-white'
								: 'text-gray-400 hover:text-white'
						}`}
					>
						Próximos
					</button>
					<button
						onClick={() => setActiveTab('finished')}
						className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all text-sm md:text-base ${
							activeTab === 'finished'
								? 'bg-green-600 text-white'
								: 'text-gray-400 hover:text-white'
						}`}
					>
						Finalizados
					</button>
				</div>

				{/* Search + Filters */}
				<div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
					<div className="flex items-center bg-white/10 px-3 md:px-4 py-2 rounded-xl flex-1">
						<FiSearch className="text-gray-400 mr-2 md:mr-3" />
						<input
							type="text"
							placeholder="Buscar equipos..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="bg-transparent outline-none w-full text-sm md:text-base"
						/>
					</div>
					<button className="flex items-center justify-center bg-white/10 px-4 py-2 rounded-xl text-sm md:text-base hover:bg-white/20 transition">
						<FiFilter className="mr-2" /> Filtros
					</button>
				</div>

				{/* Matches Grid */}
				{loading ? (
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:gap-6">
						{filteredMatches.length === 0 ? (
							<div className="text-center py-12 bg-gradient-to-br from-[#1f2126] to-[#141518] rounded-3xl border border-white/5">
								<span className="text-6xl mb-4 block">🔍</span>
								<p className="text-gray-400 text-lg">
									{activeTab === 'upcoming' ? 'No hay partidos próximos' : 'No hay partidos finalizados'}
								</p>
							</div>
						) : (
							filteredMatches.map((match) => (
								<div
									key={match.id_partidos}
									onClick={() => match.estado === 'programado' && navigate(`/bet/${match.id_partidos}`)}
									className={`rounded-3xl p-4 md:p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5 transition-all ${
										match.estado === 'programado' ? 'cursor-pointer hover:scale-[1.02] hover:border-green-500/50' : ''
									}`}
								>
									{/* Match Header */}
									<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
										<div className="flex items-center gap-2">
											{match.id_competencia?.logo && (
												<img
													src={match.id_competencia.logo}
													alt={match.id_competencia.nombre}
													className="w-5 h-5 object-contain"
												/>
											)}
											<span className="text-xs md:text-sm text-gray-400">{match.id_competencia?.nombre}</span>
										</div>
										<span className={`px-3 py-1 text-xs font-semibold rounded-full ${
											match.estado === 'programado' ? 'bg-blue-500' :
											match.estado === 'en curso' ? 'bg-red-500 animate-pulse' :
											match.estado === 'finalizado' ? 'bg-gray-500' : 'bg-red-700'
										}`}>
											{match.estado === 'programado' ? 'Programado' :
											 match.estado === 'en curso' ? 'En vivo' :
											 match.estado === 'finalizado' ? 'Finalizado' : 'Cancelado'}
										</span>
									</div>

									{/* Teams */}
									<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
										{/* Home Team */}
										<div className="flex items-center gap-3 flex-1 justify-end w-full">
											<span className="text-base md:text-lg font-medium text-right">{match.equipo_local.nombre}</span>
											{match.equipo_local.logo && (
												<img
													src={match.equipo_local.logo}
													alt={match.equipo_local.nombre}
													className="w-10 h-10 md:w-12 md:h-12 object-contain"
												/>
											)}
										</div>

										{/* Score or Time */}
										<div className="text-center px-4">
											{match.estado === 'finalizado' ? (
												<div className="flex items-center gap-2 text-xl md:text-2xl font-bold">
													<span>{match.resultado_local}</span>
													<span className="text-gray-500">-</span>
													<span>{match.resultado_visitante}</span>
												</div>
											) : (
												<div className="text-gray-400">
													<div className="text-base md:text-lg font-medium">
														{new Date(match.fecha_partido).toLocaleTimeString('es-ES', {
															hour: '2-digit',
															minute: '2-digit',
														})}
													</div>
													<div className="text-xs text-gray-500">
														{new Date(match.fecha_partido).toLocaleDateString('es-ES')}
													</div>
												</div>
											)}
										</div>

										{/* Away Team */}
										<div className="flex items-center gap-3 flex-1 w-full">
											{match.equipo_visitante.logo && (
												<img
													src={match.equipo_visitante.logo}
													alt={match.equipo_visitante.nombre}
													className="w-10 h-10 md:w-12 md:h-12 object-contain"
												/>
											)}
											<span className="text-base md:text-lg font-medium">{match.equipo_visitante.nombre}</span>
										</div>
									</div>

									{/* Stadium Info */}
									{match.id_escenario && (
										<div className="text-center mt-3 text-xs md:text-sm text-gray-500">
											📍 {match.id_escenario.nombre}
											{match.id_escenario.ciudad && `, ${match.id_escenario.ciudad}`}
										</div>
									)}

									{/* Action Button */}
									{match.estado === 'programado' && (
										<div className="mt-4">
											<button className="w-full py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm md:text-base font-medium">
												Apostar ahora
											</button>
										</div>
									)}
								</div>
							))
						)}
					</div>
				)}
			</main>

			{/* Right panel */}
			<aside className="hidden xl:block w-96 bg-[#141518] border-l border-white/5 p-6 overflow-y-auto">
				<h2 className="text-xl font-semibold mb-4">Estadísticas</h2>

				<div className="space-y-4">
					{/* Stats Card */}
					<div className="p-4 bg-white/5 rounded-2xl">
						<div className="flex items-center justify-between mb-2">
							<span className="text-gray-400 text-sm">Partidos Hoy</span>
							<span className="text-2xl font-bold text-green-400">
								{filteredMatches.filter(m => {
									const today = new Date().toDateString();
									return new Date(m.fecha_partido).toDateString() === today;
								}).length}
							</span>
						</div>
					</div>

					<div className="p-4 bg-white/5 rounded-2xl">
						<div className="flex items-center justify-between mb-2">
							<span className="text-gray-400 text-sm">Próximos Partidos</span>
							<span className="text-2xl font-bold text-blue-400">
								{matches.filter(m => m.estado === 'programado').length}
							</span>
						</div>
					</div>

					<div className="p-4 bg-white/5 rounded-2xl">
						<div className="flex items-center justify-between mb-2">
							<span className="text-gray-400 text-sm">En Vivo</span>
							<span className="text-2xl font-bold text-red-400 animate-pulse">
								{matches.filter(m => m.estado === 'en curso').length}
							</span>
						</div>
					</div>
				</div>

				{/* Quick Links */}
				<div className="mt-8">
					<h3 className="text-lg font-semibold mb-4">Accesos Rápidos</h3>
					<div className="space-y-2">
						<button
							onClick={() => navigate('/my-bets')}
							className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
						>
							<span className="text-sm">📊 Mis Apuestas</span>
						</button>
						<button
							onClick={() => navigate('/rankings')}
							className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
						>
							<span className="text-sm">🏆 Rankings</span>
						</button>
						<button
							onClick={() => navigate('/rooms')}
							className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
						>
							<span className="text-sm">🎮 Salas</span>
						</button>
					</div>
				</div>
			</aside>
		</div>
	);
};

export default SoccerMatches;
