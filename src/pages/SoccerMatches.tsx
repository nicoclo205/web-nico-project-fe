import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import { GiSoccerField, GiTennisRacket, GiBasketballBall } from "react-icons/gi";
import { MdMeetingRoom } from "react-icons/md";
import { FiSearch, FiFilter } from "react-icons/fi";
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';

// Backend response interfaces (basadas en el serializer del backend)
interface BackendMatch {
	id_partido: number;
	api_fixture_id: number;
	id_liga: number;
	liga_nombre?: string;
	liga_logo?: string;
	temporada: string;
	fecha: string;
	ronda?: string;
	equipo_local: number;
	equipo_local_nombre?: string;
	equipo_local_logo?: string;
	equipo_visitante: number;
	equipo_visitante_nombre?: string;
	equipo_visitante_logo?: string;
	goles_local?: number | null;
	goles_visitante?: number | null;
	estado: 'programado' | 'en curso' | 'finalizado' | 'cancelado' | 'pospuesto' | 'suspendido';
	id_venue?: number | null;
	venue_nombre?: string | null;
	venue_ciudad?: string | null;
}

interface League {
	id_liga: number;
	nombre: string;
	logo_url?: string;
	pais_nombre?: string;
	tipo?: string;
}

// Frontend display interface
interface Match {
	id_partido: number;
	equipo_local: {
		id_equipo: number;
		nombre: string;
		logo?: string;
	};
	equipo_visitante: {
		id_equipo: number;
		nombre: string;
		logo?: string;
	};
	goles_local?: number;
	goles_visitante?: number;
	liga_nombre?: string;
	liga_logo?: string;
	fecha: string;
	estado: 'programado' | 'en curso' | 'finalizado' | 'cancelado' | 'pospuesto' | 'suspendido';
	venue_nombre?: string;
	venue_ciudad?: string;
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
	const [error, setError] = useState<string | null>(null);
	const [showFilters, setShowFilters] = useState(false);
	const [filterEstado, setFilterEstado] = useState<string>('all');
	const [filterFecha, setFilterFecha] = useState<string>('all');
	const [displayCount, setDisplayCount] = useState(10); // Mostrar 10 partidos inicialmente

	const userName = user?.nombre_usuario || user?.username || "Usuario";

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	// Fetch leagues from backend
	const fetchLeagues = async () => {
		try {
			setLoading(true);
			setError(null);

			// Deporte ID 1 = Fútbol (según el backend)
			const response = await apiService.getLeaguesBySport(1);

			if (response.success && response.data) {
				// Filtrar para quedarnos solo con una "La Liga" - la que tiene logo
				const filteredLeagues = response.data.filter((league) => {
					// Si es "La Liga", solo mantener la que tiene logo_url
					if (league.nombre === 'La Liga' || league.nombre.toLowerCase().includes('la liga')) {
						return league.logo_url && league.logo_url.trim() !== '';
					}
					// Para otras ligas, mantenerlas todas
					return true;
				});

				// Eliminar duplicados basados en nombre (por si hay múltiples La Liga con logo)
				const uniqueLeagues = filteredLeagues.filter((league, index, self) => {
					if (league.nombre === 'La Liga' || league.nombre.toLowerCase().includes('la liga')) {
						// Solo mantener la primera "La Liga" que tenga logo
						return index === self.findIndex(l =>
							(l.nombre === 'La Liga' || l.nombre.toLowerCase().includes('la liga')) &&
							l.logo_url && l.logo_url.trim() !== ''
						);
					}
					return true;
				});

				setLeagues(uniqueLeagues);
			} else {
				setError(response.error || 'Error al cargar las ligas');
				console.error('Error fetching leagues:', response.error);
			}
		} catch (err: any) {
			setError(err.message || 'Error al cargar las ligas');
			console.error('Error fetching leagues:', err);
		} finally {
			setLoading(false);
		}
	};

	// Fetch matches from backend
	const fetchMatches = async () => {
		try {
			setLoading(true);
			setError(null);
			let response;

			if (selectedLeague === 'all') {
				// Fetch all soccer matches
				response = await apiService.getAllMatches();
			} else {
				// Fetch matches by league (sin temporada para obtener todos)
				response = await apiService.getMatchesByLeague(selectedLeague as number);
			}

			if (response.success && response.data) {
				// Transform backend data to frontend format
				const transformedMatches: Match[] = response.data.map((backendMatch: BackendMatch) => ({
					id_partido: backendMatch.id_partido,
					equipo_local: {
						id_equipo: backendMatch.equipo_local,
						nombre: backendMatch.equipo_local_nombre || 'Equipo Local',
						logo: backendMatch.equipo_local_logo
					},
					equipo_visitante: {
						id_equipo: backendMatch.equipo_visitante,
						nombre: backendMatch.equipo_visitante_nombre || 'Equipo Visitante',
						logo: backendMatch.equipo_visitante_logo
					},
					goles_local: backendMatch.goles_local ?? undefined,
					goles_visitante: backendMatch.goles_visitante ?? undefined,
					liga_nombre: backendMatch.liga_nombre,
					liga_logo: backendMatch.liga_logo,
					fecha: backendMatch.fecha,
					estado: backendMatch.estado,
					venue_nombre: backendMatch.venue_nombre ?? undefined,
					venue_ciudad: backendMatch.venue_ciudad ?? undefined
				}));

				setMatches(transformedMatches);
			} else {
				setError(response.error || 'Error al cargar los partidos');
				console.error('Error fetching matches:', response.error);
				setMatches([]);
			}
		} catch (err: any) {
			setError(err.message || 'Error al cargar los partidos');
			console.error('Error fetching matches:', err);
			setMatches([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLeagues();
	}, []);

	useEffect(() => {
		fetchMatches();
		setDisplayCount(10); // Reset display count cuando cambia la liga
	}, [selectedLeague]);

	const filteredMatches = matches.filter((match) => {
		const isUpcoming = match.estado === 'programado' || match.estado === 'en curso';
		const isFinished = match.estado === 'finalizado';
		const matchesTab = activeTab === 'upcoming' ? isUpcoming : isFinished;

		const matchesSearch = searchTerm === '' ||
			match.equipo_local.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
			match.equipo_visitante.nombre.toLowerCase().includes(searchTerm.toLowerCase());

		// Filtro por estado
		const matchesEstado = filterEstado === 'all' || match.estado === filterEstado;

		// Filtro por fecha
		let matchesFecha = true;
		if (filterFecha !== 'all') {
			const today = new Date();
			const matchDate = new Date(match.fecha);

			if (filterFecha === 'today') {
				matchesFecha = matchDate.toDateString() === today.toDateString();
			} else if (filterFecha === 'week') {
				const nextWeek = new Date(today);
				nextWeek.setDate(today.getDate() + 7);
				matchesFecha = matchDate >= today && matchDate <= nextWeek;
			} else if (filterFecha === 'month') {
				matchesFecha = matchDate.getMonth() === today.getMonth() &&
							   matchDate.getFullYear() === today.getFullYear();
			}
		}

		return matchesTab && matchesSearch && matchesEstado && matchesFecha;
	});

	// Partidos a mostrar (paginados)
	const displayedMatches = filteredMatches.slice(0, displayCount);
	const hasMoreMatches = filteredMatches.length > displayCount;

	return (
		<div className="flex flex-col lg:flex-row h-screen bg-[#0e0f11] text-white page-transition-enter">
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
						"
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

				{/* Rooms icon */}
				<MdMeetingRoom
					onClick={() => navigate('/rooms')}
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
							className="btn-danger"
						>
							Cerrar sesión
						</button>
					</div>
				</div>

				{/* Error Display */}
				{error && (
					<div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl">
						<p className="text-red-200 text-sm">{error}</p>
					</div>
				)}

				{/* League Selector */}
				<div className="mb-6">
					<h2 className="text-base md:text-lg font-semibold mb-4">Selecciona una Liga</h2>
					<div className="flex gap-3 overflow-x-auto pb-2">
						<button
							onClick={() => setSelectedLeague('all')}
							className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl transition-colors duration-300 min-w-[80px] md:min-w-[100px] ${
								selectedLeague === 'all'
									? 'bg-green-800 shadow-lg'
									: 'bg-white/10 hover:bg-gray-500'
							}`}
						>
							<span className="text-2xl md:text-3xl mb-1">🌍</span>
							<span className="text-xs md:text-sm font-normal text-center">Todas</span>
						</button>

						{leagues.map((league) => (
							<button
								key={league.id_liga}
								onClick={() => setSelectedLeague(league.id_liga)}
								className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl transition-colors duration-300 min-w-[80px] md:min-w-[100px] ${
									selectedLeague === league.id_liga
										? 'bg-green-800 shadow-lg'
										: 'bg-white/10 hover:bg-gray-500'
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
								<span className="text-xs md:text-sm font-normal text-center line-clamp-2">{league.nombre}</span>
							</button>
						))}
					</div>
				</div>

				{/* Tabs */}
				<div className="flex space-x-2 bg-white/10 p-1 rounded-xl max-w-md mb-6">
					<button
						onClick={() => setActiveTab('upcoming')}
						className={activeTab === 'upcoming' ? 'flex-1 btn-tab-active' : 'flex-1 btn-tab-inactive'}
					>
						Próximos
					</button>
					<button
						onClick={() => setActiveTab('finished')}
						className={activeTab === 'finished' ? 'flex-1 btn-tab-active' : 'flex-1 btn-tab-inactive'}
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
					<button
						onClick={() => setShowFilters(!showFilters)}
						className={`btn-icon ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
					>
						<FiFilter /> Filtros
					</button>
				</div>

				{/* Filters Panel */}
				{showFilters && (
					<div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Filter by Estado */}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Estado del Partido</label>
								<select
									value={filterEstado}
									onChange={(e) => setFilterEstado(e.target.value)}
									className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
								>
									<option value="all" className=' bg-slate-800'>Todos</option>
									<option value="programado" className=' bg-slate-800'>Programados</option>
									<option value="en curso" className='  bg-slate-800'>En Curso</option>
									<option value="finalizado" className='  bg-slate-800'>Finalizados</option>
									<option value="pospuesto" className='  bg-slate-800'>Pospuestos</option>
									<option value="suspendido" className='  bg-slate-800'>Suspendidos</option>
									<option value="cancelado" className='  bg-slate-800'>Cancelados</option>
								</select>
							</div>

							{/* Filter by Fecha */}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Período</label>
								<select
									value={filterFecha}
									onChange={(e) => setFilterFecha(e.target.value)}
									className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
								>
									<option value="all" className='  bg-slate-800'>Todas las fechas</option>
									<option value="today" className='  bg-slate-800'>Hoy</option>
									<option value="week" className='  bg-slate-800'>Esta semana</option>
									<option value="month" className='  bg-slate-800'>Este mes</option>
								</select>
							</div>
						</div>

						{/* Reset Filters Button */}
						<div className="mt-4 flex justify-end">
							<button
								onClick={() => {
									setFilterEstado('all');
									setFilterFecha('all');
								}}
								className="btn-secondary"
							>
								Limpiar filtros
							</button>
						</div>
					</div>
				)}

				{/* Matches Grid */}
				{loading ? (
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 gap-4 md:gap-6">
							{displayedMatches.length === 0 ? (
								<div className="text-center py-12 bg-gradient-to-br from-[#1f2126] to-[#141518] rounded-3xl border border-white/5">
									<span className="text-6xl mb-4 block">🔍</span>
									<p className="text-gray-400 text-lg">
										{activeTab === 'upcoming' ? 'No hay partidos próximos' : 'No hay partidos finalizados'}
									</p>
								</div>
							) : (
								displayedMatches.map((match) => (
								<div
									key={match.id_partido}
									onClick={() => match.estado === 'programado' && navigate(`/bet/${match.id_partido}`)}
									className={`rounded-3xl p-4 md:p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5 transition-all ${
										match.estado === 'programado' ? 'cursor-pointer hover:scale-[1.02] hover:border-green-500/50' : ''
									}`}
								>
									{/* Match Header */}
									<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
										<div className="flex items-center gap-2">
											{match.liga_logo && (
												<img
													src={match.liga_logo}
													alt={match.liga_nombre || 'Partido'}
													className="w-5 h-5 object-contain"
													onError={(e) => {
														e.currentTarget.style.display = 'none';
													}}
												/>
											)}
											<span className="text-xs md:text-sm text-gray-400">{match.liga_nombre || 'Liga'}</span>
										</div>
										<span className={`px-3 py-1 text-xs font-semibold rounded-full ${
											match.estado === 'programado' ? 'bg-blue-500' :
											match.estado === 'en curso' ? 'bg-red-500 animate-pulse' :
											match.estado === 'finalizado' ? 'bg-gray-500' :
											match.estado === 'pospuesto' ? 'bg-yellow-500' :
											match.estado === 'suspendido' ? 'bg-orange-500' : 'bg-red-700'
										}`}>
											{match.estado === 'programado' ? 'Programado' :
											 match.estado === 'en curso' ? 'En vivo' :
											 match.estado === 'finalizado' ? 'Finalizado' :
											 match.estado === 'pospuesto' ? 'Pospuesto' :
											 match.estado === 'suspendido' ? 'Suspendido' : 'Cancelado'}
										</span>
									</div>

									{/* Teams */}
									<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
										{/* Home Team */}
										<div className="flex items-center gap-3 flex-1 justify-end w-full">
											<span className="text-base md:text-lg font-medium text-right">{match.equipo_local.nombre}</span>
											{match.equipo_local.logo ? (
												<img
													src={match.equipo_local.logo}
													alt={match.equipo_local.nombre}
													className="w-10 h-10 md:w-12 md:h-12 object-contain"
													onError={(e) => {
														// Fallback to icon if image fails to load
														e.currentTarget.style.display = 'none';
														const parent = e.currentTarget.parentElement;
														if (parent) {
															const fallback = document.createElement('div');
															fallback.className = 'w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl';
															fallback.textContent = '⚽';
															parent.appendChild(fallback);
														}
													}}
												/>
											) : (
												<div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
													⚽
												</div>
											)}
										</div>

										{/* Score or Time */}
										<div className="text-center px-4">
											{match.estado === 'finalizado' ? (
												<div>
													<div className="flex items-center gap-2 text-xl md:text-2xl font-bold mb-1">
														<span>{match.goles_local ?? 0}</span>
														<span className="text-gray-500">-</span>
														<span>{match.goles_visitante ?? 0}</span>
													</div>
													<div className="text-xs text-gray-500">
														{new Date(match.fecha).toLocaleDateString('es-ES', {
															day: '2-digit',
															month: 'short',
															year: 'numeric'
														})}
													</div>
												</div>
											) : (
												<div className="text-gray-400">
													<div className="text-base md:text-lg font-medium">
														{new Date(match.fecha).toLocaleTimeString('es-ES', {
															hour: '2-digit',
															minute: '2-digit',
														})}
													</div>
													<div className="text-xs text-gray-500">
														{new Date(match.fecha).toLocaleDateString('es-ES')}
													</div>
												</div>
											)}
										</div>

										{/* Away Team */}
										<div className="flex items-center gap-3 flex-1 w-full">
											{match.equipo_visitante.logo ? (
												<img
													src={match.equipo_visitante.logo}
													alt={match.equipo_visitante.nombre}
													className="w-10 h-10 md:w-12 md:h-12 object-contain"
													onError={(e) => {
														// Fallback to icon if image fails to load
														e.currentTarget.style.display = 'none';
														const parent = e.currentTarget.parentElement;
														if (parent) {
															const fallback = document.createElement('div');
															fallback.className = 'w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl';
															fallback.textContent = '⚽';
															parent.appendChild(fallback);
														}
													}}
												/>
											) : (
												<div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
													⚽
												</div>
											)}
											<span className="text-base md:text-lg font-medium">{match.equipo_visitante.nombre}</span>
										</div>
									</div>

									{/* Stadium Info */}
									{match.venue_nombre && (
										<div className="text-center mt-3 text-xs md:text-sm text-gray-500">
											📍 {match.venue_nombre}
											{match.venue_ciudad && `, ${match.venue_ciudad}`}
										</div>
									)}
								</div>
							))
						)}
					</div>

					{/* Ver más button */}
					{hasMoreMatches && (
						<div className="flex justify-center mt-8">
							<button
								onClick={() => setDisplayCount(prev => prev + 10)}
								className="btn-primary btn-icon px-6 py-3"
							>
								Ver más partidos
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
								</svg>
							</button>
						</div>
					)}
				</>
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
									return new Date(m.fecha).toDateString() === today;
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
