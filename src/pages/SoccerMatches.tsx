import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import Layout from '../components/Layout';

import api from '../services/api';

 

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

 

// Helper: Get flag URL from country code

const getFlagUrl = (countryCode?: string) => {

	if (!countryCode) return '';

	return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

};

 

// Helper: Prefer logo, fallback to flag

const getTeamImage = (team: Team) => {

	if (team.logo && team.logo.trim() !== '') {

		return team.logo;

	}

	if (team.bandera) {

		return getFlagUrl(team.bandera);

	}

	return '';

};

 

const SoccerMatches: React.FC = () => {

	const navigate = useNavigate();

	const { t } = useTranslation(['sports', 'common']);

	const [matches, setMatches] = useState<Match[]>([]);

	const [leagues, setLeagues] = useState<League[]>([]);

	const [loading, setLoading] = useState(true);

	const [error, setError] = useState<string | null>(null);

	const [activeTab, setActiveTab] = useState<'upcoming' | 'finished'>(

		'upcoming'

	);

	const [selectedLeague, setSelectedLeague] = useState<number | 'all'>('all');

 

	useEffect(() => {

		fetchLeagues();

	}, []);

 

	useEffect(() => {

		if (leagues.length > 0) {

			fetchMatches();

		}

	}, [selectedLeague, leagues]);

 

	const fetchLeagues = async () => {

		try {

			setLoading(true);

			setError(null);

 

			// Fetch soccer leagues (deporte_id = 1 for football/soccer)

			const response = await api.get('/api/ligas/por_deporte/', {

				params: { deporte_id: 1 },

			});

 

			setLeagues(response.data);

		} catch (err: any) {

			console.error('Error fetching leagues:', err);

			setError('Error al cargar las ligas. Por favor, intenta de nuevo.');

		} finally {

			setLoading(false);

		}

	};

 

	const fetchMatches = async () => {

		try {

			setLoading(true);

			setError(null);

 

			let response;

 

			if (selectedLeague === 'all') {

				// Fetch all soccer matches

				response = await api.get('/api/partidos/', {

					params: { deporte: 1 },

				});

			} else {

				// Fetch matches by specific league

				response = await api.get('/api/partidos/por_liga/', {

					params: {

						liga_id: selectedLeague,

						temporada: new Date().getFullYear().toString(),

					},

				});

			}

 

			setMatches(response.data.results || response.data);

		} catch (err: any) {

			console.error('Error fetching matches:', err);

			setError(t('sports:soccerMatches.error'));

		} finally {

			setLoading(false);

		}

	};

 

	const getStatusBadge = (status: string) => {

		const statusConfig = {

			programado: {

				text: t('sports:soccerMatches.status.programado'),

				className: 'bg-blue-500',

			},

			'en curso': {

				text: t('sports:soccerMatches.status.en curso'),

				className: 'bg-red-500 animate-pulse',

			},

			finalizado: {

				text: t('sports:soccerMatches.status.finalizado'),

				className: 'bg-gray-500',

			},

			cancelado: {

				text: t('sports:soccerMatches.status.cancelado'),

				className: 'bg-red-700',

			},

		};

 

		const config =

			statusConfig[status as keyof typeof statusConfig] ||

			statusConfig['programado'];

 

		return (

			<span

				className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${config.className}`}

			>

				{config.text}

			</span>

		);

	};

 

	const filteredMatches = matches.filter((match) => {

		const isUpcoming =

			match.estado === 'programado' || match.estado === 'en curso';

		const isFinished = match.estado === 'finalizado';

 

		const matchesTab = activeTab === 'upcoming' ? isUpcoming : isFinished;

 

		return matchesTab;

	});

 

	const groupedMatches = filteredMatches.reduce((groups: any, match) => {

		const date = new Date(match.fecha_partido).toLocaleDateString('es-ES');

		if (!groups[date]) {

			groups[date] = [];

		}

		groups[date].push(match);

		return groups;

	}, {});

 

	const handleMatchClick = (match: Match) => {

		if (match.estado === 'programado') {

			navigate(`/bet/${match.id_partidos}`);

		}

	};

 

	if (loading && leagues.length === 0) {

		return (

			<Layout>

				<div className="flex justify-center items-center min-h-screen">

					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>

				</div>

			</Layout>

		);

	}

 

	if (error && leagues.length === 0) {

		return (

			<Layout>

				<div className="flex justify-center items-center min-h-screen">

					<div className="text-red-500 text-center">

						<p className="text-xl">{error}</p>

						<button

							onClick={fetchLeagues}

							className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"

						>

							{t('sports:soccerMatches.retry')}

						</button>

					</div>

				</div>

			</Layout>

		);

	}

 

	return (

		<Layout>

			<div className="max-w-7xl mx-auto px-4 py-8">

				{/* Header */}

				<div className="mb-8">

					<div className="flex items-center gap-3 mb-4">

						<span className="text-5xl">⚽</span>

						<h1 className="text-3xl font-bold text-white">

							{t('sports:soccerMatches.title')}

						</h1>

					</div>

					<p className="text-gray-400">

						{t('sports:soccerMatches.subtitle')}

					</p>

				</div>

 

				{/* League Selector with Icons */}

				<div className="mb-6">

					<h2 className="text-xl font-semibold text-white mb-4">

						Selecciona una Liga

					</h2>

					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

						{/* All Leagues Option */}

						<button

							onClick={() => setSelectedLeague('all')}

							className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${

								selectedLeague === 'all'

									? 'bg-green-600 shadow-lg scale-105'

									: 'bg-gray-800 hover:bg-gray-700'

							}`}

						>

							<div className="w-16 h-16 mb-2 flex items-center justify-center">

								<span className="text-4xl">🌍</span>

							</div>

							<span className="text-white text-sm font-medium text-center">

								Todas las Ligas

							</span>

						</button>

 

						{/* Individual League Options */}

						{leagues.map((league) => (

							<button

								key={league.id_liga}

								onClick={() => setSelectedLeague(league.id_liga)}

								className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${

									selectedLeague === league.id_liga

										? 'bg-green-600 shadow-lg scale-105'

										: 'bg-gray-800 hover:bg-gray-700'

								}`}

							>

								<div className="w-16 h-16 mb-2 flex items-center justify-center">

									{league.logo_url ? (

										<img

											src={league.logo_url}

											alt={league.nombre}

											className="w-full h-full object-contain"

										/>

									) : (

										<span className="text-4xl">🏆</span>

									)}

								</div>

								<span className="text-white text-sm font-medium text-center line-clamp-2">

									{league.nombre}

								</span>

								{league.pais_nombre && (

									<span className="text-gray-400 text-xs mt-1">

										{league.pais_nombre}

									</span>

								)}

							</button>

						))}

					</div>

				</div>

 

				{/* Filters */}

				<div className="mb-6 space-y-4">

					{/* Tabs */}

					<div className="flex space-x-1 bg-gray-800 p-1 rounded-lg max-w-md">

						<button

							onClick={() => setActiveTab('upcoming')}

							className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${

								activeTab === 'upcoming'

									? 'bg-green-600 text-white'

									: 'text-gray-400 hover:text-white'

							}`}

						>

							{t('sports:soccerMatches.upcomingTab')}

						</button>

						<button

							onClick={() => setActiveTab('finished')}

							className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${

								activeTab === 'finished'

									? 'bg-green-600 text-white'

									: 'text-gray-400 hover:text-white'

							}`}

						>

							{t('sports:soccerMatches.finishedTab')}

						</button>

					</div>

				</div>

 

				{/* Loading indicator for matches */}

				{loading ? (

					<div className="flex justify-center items-center py-12">

						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>

					</div>

				) : (

					<>

						{/* Matches List */}

						<div className="space-y-6">

							{Object.keys(groupedMatches).length === 0 ? (

								<div className="text-center py-12 bg-gray-800 rounded-lg">

									<span className="text-6xl mb-4 block">🔍</span>

									<p className="text-gray-400 text-lg">

										{activeTab === 'upcoming'

											? t('sports:soccerMatches.noUpcomingMatches')

											: t('sports:soccerMatches.noFinishedMatches')}

									</p>

								</div>

							) : (

								Object.entries(groupedMatches).map(([date, dayMatches]) => (

									<div

										key={date}

										className="bg-gray-800 rounded-lg overflow-hidden"

									>

										{/* Date Header */}

										<div className="bg-gray-900 px-6 py-3 border-b border-gray-700">

											<h3 className="text-white font-semibold flex items-center gap-2">

												<span>📅</span>

												{date}

											</h3>

										</div>

 

										{/* Matches */}

										<div className="divide-y divide-gray-700">

											{(dayMatches as Match[]).map((match) => (

												<div

													key={match.id_partidos}

													onClick={() => handleMatchClick(match)}

													className={`p-6 hover:bg-gray-700 transition-colors ${

														match.estado === 'programado' ? 'cursor-pointer' : ''

													}`}

												>

													<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

														{/* Competition and Status */}

														<div className="flex flex-col gap-2">

															{match.id_competencia && (

																<div className="flex items-center gap-2">

																	{match.id_competencia.logo && (

																		<img

																			src={match.id_competencia.logo}

																			alt={match.id_competencia.nombre}

																			className="w-6 h-6 object-contain"

																		/>

																	)}

																	<span className="text-sm text-gray-400">

																		{match.id_competencia.nombre}

																	</span>

																</div>

															)}

															{getStatusBadge(match.estado)}

														</div>

 

														{/* Match Info */}

														<div className="flex-1 w-full lg:mx-8">

															<div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">

																{/* Home Team */}

																<div className="flex items-center gap-3 flex-1 justify-end w-full sm:w-auto">

																	<span className="text-white font-medium text-base sm:text-lg text-right">

																		{match.equipo_local.nombre}

																	</span>

																	{getTeamImage(match.equipo_local) && (

																		<img

																			src={getTeamImage(match.equipo_local)}

																			alt={match.equipo_local.nombre}

																			className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"

																		/>

																	)}

																</div>

 

																{/* Score or Time */}

																<div className="text-center px-4 sm:px-6">

																	{match.estado === 'finalizado' ? (

																		<div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white">

																			<span>{match.resultado_local}</span>

																			<span className="text-gray-500">-</span>

																			<span>{match.resultado_visitante}</span>

																		</div>

																	) : (

																		<div className="text-gray-400">

																			<div className="text-base sm:text-lg font-medium">

																				{new Date(

																					match.fecha_partido

																				).toLocaleTimeString('es-ES', {

																					hour: '2-digit',

																					minute: '2-digit',

																				})}

																			</div>

																			{match.estado === 'en curso' && (

																				<span className="text-xs text-red-500">

																					{t('sports:soccerMatches.liveStatus')}

																				</span>

																			)}

																		</div>

																	)}

																</div>

 

																{/* Away Team */}

																<div className="flex items-center gap-3 flex-1 w-full sm:w-auto">

																	{getTeamImage(match.equipo_visitante) && (

																		<img

																			src={getTeamImage(match.equipo_visitante)}

																			alt={match.equipo_visitante.nombre}

																			className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"

																		/>

																	)}

																	<span className="text-white font-medium text-base sm:text-lg">

																		{match.equipo_visitante.nombre}

																	</span>

																</div>

															</div>

 

															{/* Stadium Info */}

															{match.id_escenario && (

																<div className="text-center mt-2 text-xs sm:text-sm text-gray-500">

																	📍 {match.id_escenario.nombre}

																	{match.id_escenario.ciudad &&

																		`, ${match.id_escenario.ciudad}`}

																</div>

															)}

														</div>

 

														{/* Action Button */}

														{match.estado === 'programado' && (

															<button className="w-full lg:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base">

																{t('sports:soccerMatches.bet')}

															</button>

														)}

													</div>

												</div>

											))}

										</div>

									</div>

								))

							)}

						</div>

					</>

				)}

			</div>

		</Layout>

	);

};

 

export default SoccerMatches;