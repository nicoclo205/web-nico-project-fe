import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

interface Player {
	id_deportista: number;
	nombre: string;
	foto?: string;
}

interface Team {
	id_equipo: number;
	nombre: string;
	logo?: string;
}

interface Competition {
	id_competencia: number;
	nombre: string;
	logo?: string;
}

interface TennisMatch {
	id_partidos: number;
	deportista_local?: Player;
	deportista_visitante?: Player;
	equipo_local?: Team;
	equipo_visitante?: Team;
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

const TennisMatches: React.FC = () => {
	const navigate = useNavigate();
	const [matches, setMatches] = useState<TennisMatch[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<'upcoming' | 'finished'>('upcoming');
	const [selectedCompetition, setSelectedCompetition] = useState<string>('all');
	const [competitions, setCompetitions] = useState<Competition[]>([]);

	useEffect(() => {
		fetchTennisMatches();
	}, []);

	const fetchTennisMatches = async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch tennis matches (assuming sport_id for tennis is 2)
			const response = await api.get('/api/partidos/', {
				params: {
					deporte: 2, // Tennis sport ID
				},
			});

			setMatches(response.data);

			// Extract unique competitions
			const uniqueCompetitions = Array.from(
				new Map(
					response.data
						.filter((match: TennisMatch) => match.id_competencia)
						.map((match: TennisMatch) => [
							match.id_competencia.id_competencia,
							match.id_competencia,
						])
				).values()
			);
			setCompetitions(uniqueCompetitions as Competition[]);
		} catch (err) {
			console.error('Error fetching tennis matches:', err);
			setError('Error al cargar los partidos de tenis');
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			programado: { text: 'Programado', className: 'bg-blue-500' },
			'en curso': { text: 'En Vivo', className: 'bg-red-500 animate-pulse' },
			finalizado: { text: 'Finalizado', className: 'bg-gray-500' },
			cancelado: { text: 'Cancelado', className: 'bg-red-700' },
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
		const matchesCompetition =
			selectedCompetition === 'all' ||
			match.id_competencia?.id_competencia.toString() === selectedCompetition;

		return matchesTab && matchesCompetition;
	});

	const groupedMatches = filteredMatches.reduce((groups: any, match) => {
		const date = new Date(match.fecha_partido).toLocaleDateString('es-ES');
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(match);
		return groups;
	}, {});

	const handleMatchClick = (match: TennisMatch) => {
		if (match.estado === 'programado') {
			navigate(`/bet/tennis/${match.id_partidos}`);
		}
	};

	if (loading) {
		return (
			<Layout>
				<div className="flex justify-center items-center min-h-screen">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
				</div>
			</Layout>
		);
	}

	if (error) {
		return (
			<Layout>
				<div className="flex justify-center items-center min-h-screen">
					<div className="text-red-500 text-center">
						<p className="text-xl">{error}</p>
						<button
							onClick={fetchTennisMatches}
							className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
						>
							Reintentar
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
						<span className="text-5xl">🎾</span>
						<h1 className="text-3xl font-bold text-white">Partidos de Tenis</h1>
					</div>
					<p className="text-gray-400">
						Consulta los próximos partidos y resultados de los principales torneos de tenis
					</p>
				</div>

				{/* Filters */}
				<div className="mb-6 space-y-4">
					{/* Tabs */}
					<div className="flex space-x-1 bg-gray-800 p-1 rounded-lg max-w-md">
						<button
							onClick={() => setActiveTab('upcoming')}
							className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
								activeTab === 'upcoming'
									? 'bg-yellow-600 text-white'
									: 'text-gray-400 hover:text-white'
							}`}
						>
							Próximos Partidos
						</button>
						<button
							onClick={() => setActiveTab('finished')}
							className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
								activeTab === 'finished'
									? 'bg-yellow-600 text-white'
									: 'text-gray-400 hover:text-white'
							}`}
						>
							Partidos Finalizados
						</button>
					</div>

					{/* Competition Filter */}
					{competitions.length > 0 && (
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => setSelectedCompetition('all')}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									selectedCompetition === 'all'
										? 'bg-yellow-600 text-white'
										: 'bg-gray-800 text-gray-400 hover:text-white'
								}`}
							>
								Todos los Torneos
							</button>
							{competitions.map((comp) => (
								<button
									key={comp.id_competencia}
									onClick={() =>
										setSelectedCompetition(comp.id_competencia.toString())
									}
									className={`px-4 py-2 rounded-lg font-medium transition-colors ${
										selectedCompetition === comp.id_competencia.toString()
											? 'bg-yellow-600 text-white'
											: 'bg-gray-800 text-gray-400 hover:text-white'
									}`}
								>
									{comp.nombre}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Matches List */}
				<div className="space-y-6">
					{Object.keys(groupedMatches).length === 0 ? (
						<div className="text-center py-12 bg-gray-800 rounded-lg">
							<span className="text-6xl mb-4 block">🔍</span>
							<p className="text-gray-400 text-lg">
								No hay partidos{' '}
								{activeTab === 'upcoming' ? 'programados' : 'finalizados'} en
								este momento
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
									{(dayMatches as TennisMatch[]).map((match) => (
										<div
											key={match.id_partidos}
											onClick={() => handleMatchClick(match)}
											className={`p-6 hover:bg-gray-700 transition-colors ${
												match.estado === 'programado' ? 'cursor-pointer' : ''
											}`}
										>
											<div className="flex items-center justify-between">
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
												<div className="flex-1 mx-8">
													<div className="flex items-center justify-center gap-8">
														{/* Player 1 */}
														<div className="flex items-center gap-3 flex-1 justify-end">
															<span className="text-white font-medium text-lg">
																{match.deportista_local?.nombre || match.equipo_local?.nombre || 'Por definir'}
															</span>
															{(match.deportista_local?.foto || match.equipo_local?.logo) && (
																<div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
																	<img
																		src={match.deportista_local?.foto || match.equipo_local?.logo}
																		alt={match.deportista_local?.nombre || match.equipo_local?.nombre}
																		className="w-full h-full object-cover"
																	/>
																</div>
															)}
														</div>

														{/* Score or Time */}
														<div className="text-center px-6">
															{match.estado === 'finalizado' ? (
																<div className="flex flex-col items-center">
																	<div className="flex items-center gap-2 text-xl font-bold text-white">
																		<span>{match.resultado_local}</span>
																		<span className="text-gray-500">-</span>
																		<span>{match.resultado_visitante}</span>
																	</div>
																	<span className="text-xs text-gray-400 mt-1">Sets</span>
																</div>
															) : (
																<div className="text-gray-400">
																	<div className="text-lg font-medium">
																		{new Date(
																			match.fecha_partido
																		).toLocaleTimeString('es-ES', {
																			hour: '2-digit',
																			minute: '2-digit',
																		})}
																	</div>
																	{match.estado === 'en curso' && (
																		<span className="text-xs text-red-500">
																			EN VIVO
																		</span>
																	)}
																</div>
															)}
														</div>

														{/* Player 2 */}
														<div className="flex items-center gap-3 flex-1">
															{(match.deportista_visitante?.foto || match.equipo_visitante?.logo) && (
																<div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
																	<img
																		src={match.deportista_visitante?.foto || match.equipo_visitante?.logo}
																		alt={match.deportista_visitante?.nombre || match.equipo_visitante?.nombre}
																		className="w-full h-full object-cover"
																	/>
																</div>
															)}
															<span className="text-white font-medium text-lg">
																{match.deportista_visitante?.nombre || match.equipo_visitante?.nombre || 'Por definir'}
															</span>
														</div>
													</div>

													{/* Court Info */}
													{match.id_escenario && (
														<div className="text-center mt-2 text-sm text-gray-500">
															🏟️ {match.id_escenario.nombre}
															{match.id_escenario.ciudad &&
																`, ${match.id_escenario.ciudad}`}
														</div>
													)}
												</div>

												{/* Action Button */}
												{match.estado === 'programado' && (
													<button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
														Apostar
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
			</div>
		</Layout>
	);
};

export default TennisMatches;