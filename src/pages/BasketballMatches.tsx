import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../services/api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import { MdSportsBasketball } from 'react-icons/md';

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

interface BasketballMatch {
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

const BasketballMatches: React.FC = () => {
	const { t } = useTranslation(['sports', 'common']);
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const updateParam = (key: string, value: string) => {
		const next = new URLSearchParams(searchParams);
		next.set(key, value);
		setSearchParams(next, { replace: true });
	};
	const [matches, setMatches] = useState<BasketballMatch[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	// Tab + filter persisted in the URL (shareable / survives refresh and back-navigation)
	const activeTab: 'upcoming' | 'finished' = searchParams.get('tab') === 'finished' ? 'finished' : 'upcoming';
	const setActiveTab = (tab: 'upcoming' | 'finished') => updateParam('tab', tab);
	const selectedCompetition = searchParams.get('competition') ?? 'all';
	const setSelectedCompetition = (c: string) => updateParam('competition', c);
	const [competitions, setCompetitions] = useState<Competition[]>([]);

	useEffect(() => {
		fetchBasketballMatches();
	}, []);

	const fetchBasketballMatches = async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch basketball matches (assuming sport_id for basketball is 3)
			const response = await api.get('/api/partidos/', {
				params: {
					deporte: 3, // Basketball sport ID
				},
			});

			setMatches(response.data);

			// Extract unique competitions
			const uniqueCompetitions = Array.from(
				new Map(
					response.data
						.filter((match: BasketballMatch) => match.id_competencia)
						.map((match: BasketballMatch) => [
							match.id_competencia.id_competencia,
							match.id_competencia,
						])
				).values()
			);
			setCompetitions(uniqueCompetitions as Competition[]);
		} catch (err) {
			console.error('Error fetching basketball matches:', err);
			setError(t('sports:basketballPage.error'));
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			programado: { text: t('common:scheduled'), className: 'bg-blue-500' },
			'en curso': { text: t('common:live'), className: 'bg-red-500 animate-pulse' },
			finalizado: { text: t('common:finished'), className: 'bg-gray-500' },
			cancelado: { text: t('common:cancelled'), className: 'bg-red-700' },
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
		const date = new Date(match.fecha_partido).toLocaleDateString('en-US');
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(match);
		return groups;
	}, {});

	const handleMatchClick = (match: BasketballMatch) => {
		if (match.estado === 'programado') {
			navigate(`/bet/basketball/${match.id_partidos}`);
		}
	};

	if (loading) {
		return (
			<AppShell>
				<div className="flex-1 flex justify-center items-center">
					<Spinner color="border-orange-500" />
				</div>
			</AppShell>
		);
	}

	if (error) {
		return (
			<AppShell>
				<div className="flex-1 flex justify-center items-center">
					<div className="text-red-500 text-center">
						<p className="text-xl">{error}</p>
						<button
							onClick={fetchBasketballMatches}
							className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
						>
							{t('common:retry')}
						</button>
					</div>
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell>
			<main className="flex-1 overflow-y-auto">
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-4">
						<MdSportsBasketball className="text-5xl text-orange-400" />
						<h1 className="text-3xl font-bold text-white">{t('sports:basketballPage.title')}</h1>
					</div>
					<p className="text-gray-400">
						{t('sports:basketballPage.subtitle')}
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
									? 'bg-orange-600 text-white'
									: 'text-gray-400 hover:text-white'
							}`}
						>
							{t('sports:basketballPage.upcomingTab')}
						</button>
						<button
							onClick={() => setActiveTab('finished')}
							className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
								activeTab === 'finished'
									? 'bg-orange-600 text-white'
									: 'text-gray-400 hover:text-white'
							}`}
						>
							{t('sports:basketballPage.finishedTab')}
						</button>
					</div>

					{/* Competition Filter */}
					{competitions.length > 0 && (
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => setSelectedCompetition('all')}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									selectedCompetition === 'all'
										? 'bg-orange-600 text-white'
										: 'bg-gray-800 text-gray-400 hover:text-white'
								}`}
							>
								{t('sports:basketballPage.allLeagues')}
							</button>
							{competitions.map((comp) => (
								<button
									key={comp.id_competencia}
									onClick={() =>
										setSelectedCompetition(comp.id_competencia.toString())
									}
									className={`px-4 py-2 rounded-lg font-medium transition-colors ${
										selectedCompetition === comp.id_competencia.toString()
											? 'bg-orange-600 text-white'
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
						<EmptyState
							title={activeTab === 'upcoming' ? t('sports:basketballPage.noUpcoming') : t('sports:basketballPage.noFinished')}
						/>
					) : (
						Object.entries(groupedMatches).map(([date, dayMatches]) => (
							<div
								key={date}
								className="bg-gray-800 rounded-lg overflow-hidden"
							>
								{/* Date Header */}
								<div className="bg-gray-900 px-6 py-3 border-b border-gray-700">
									<h3 className="text-white font-semibold flex items-center gap-2">
										<FiCalendar />
										{date}
									</h3>
								</div>

								{/* Matches */}
								<div className="divide-y divide-gray-700">
									{(dayMatches as BasketballMatch[]).map((match) => (
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
														{/* Home Team */}
														<div className="flex items-center gap-3 flex-1 justify-end">
															<span className="text-white font-medium text-lg">
																{match.equipo_local.nombre}
															</span>
															{match.equipo_local.logo && (
																<img
																	src={match.equipo_local.logo}
																	alt={match.equipo_local.nombre}
																	className="w-12 h-12 object-contain"
																/>
															)}
														</div>

														{/* Score or Time */}
														<div className="text-center px-6">
															{match.estado === 'finalizado' ? (
																<div className="flex items-center gap-2 text-2xl font-bold text-white">
																	<span>{match.resultado_local}</span>
																	<span className="text-gray-500">-</span>
																	<span>{match.resultado_visitante}</span>
																</div>
															) : match.estado === 'en curso' ? (
																<div>
																	<div className="flex items-center gap-2 text-xl font-bold text-white">
																		<span>{match.resultado_local || 0}</span>
																		<span className="text-gray-500">-</span>
																		<span>{match.resultado_visitante || 0}</span>
																	</div>
																	<span className="text-xs text-red-500 animate-pulse">
																		LIVE
																	</span>
																</div>
															) : (
																<div className="text-gray-400">
																	<div className="text-lg font-medium">
																		{new Date(
																			match.fecha_partido
																		).toLocaleTimeString('en-US', {
																			hour: '2-digit',
																			minute: '2-digit',
																		})}
																	</div>
																</div>
															)}
														</div>

														{/* Away Team */}
														<div className="flex items-center gap-3 flex-1">
															{match.equipo_visitante.logo && (
																<img
																	src={match.equipo_visitante.logo}
																	alt={match.equipo_visitante.nombre}
																	className="w-12 h-12 object-contain"
																/>
															)}
															<span className="text-white font-medium text-lg">
																{match.equipo_visitante.nombre}
															</span>
														</div>
													</div>

													{/* Arena Info */}
													{match.id_escenario && (
														<div className="text-center mt-2 text-sm text-gray-500">
															<FiMapPin className="inline mr-1" />{match.id_escenario.nombre}
															{match.id_escenario.ciudad &&
																`, ${match.id_escenario.ciudad}`}
														</div>
													)}
												</div>

												{/* Action Button */}
												{match.estado === 'programado' && (
													<button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
														{t('common:bet')}
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
			</main>
		</AppShell>
	);
};

export default BasketballMatches;
