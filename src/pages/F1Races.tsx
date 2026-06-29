import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../services/api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import TimeUntil from '../components/TimeUntil';
import { GiSteeringWheel } from 'react-icons/gi';

interface F1Race {
	id_carrera_f1: number;
	nombre_gp: string;
	fecha: string;
	temporada?: string;
	estado: 'programado' | 'en curso' | 'finalizado' | 'cancelado';
	venue_nombre?: string | null;
	liga_nombre?: string | null;
}

const F1Races: React.FC = () => {
	const { t } = useTranslation(['sports', 'common']);
	const [searchParams, setSearchParams] = useSearchParams();
	const updateParam = (key: string, value: string) => {
		const next = new URLSearchParams(searchParams);
		next.set(key, value);
		setSearchParams(next, { replace: true });
	};
	const [races, setRaces] = useState<F1Race[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	// Tab persisted in the URL (shareable / survives refresh and back-navigation)
	const activeTab: 'upcoming' | 'finished' = searchParams.get('tab') === 'finished' ? 'finished' : 'upcoming';
	const setActiveTab = (tab: 'upcoming' | 'finished') => updateParam('tab', tab);

	useEffect(() => {
		fetchRaces();
	}, []);

	const fetchRaces = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await api.get('/api/carreras-f1/');
			setRaces(Array.isArray(response.data) ? response.data : []);
		} catch (err) {
			console.error('Error fetching F1 races:', err);
			setError(t('sports:f1Page.error'));
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
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['programado'];
		return (
			<span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${config.className}`}>
				{config.text}
			</span>
		);
	};

	const filteredRaces = races.filter((race) => {
		const isUpcoming = race.estado === 'programado' || race.estado === 'en curso';
		const isFinished = race.estado === 'finalizado';
		return activeTab === 'upcoming' ? isUpcoming : isFinished;
	});

	const sortedRaces = [...filteredRaces].sort(
		(a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
	);

	if (loading) {
		return (
			<AppShell>
				<div className="flex-1 flex justify-center items-center">
					<Spinner color="border-red-500" />
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
							onClick={fetchRaces}
							className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
						<GiSteeringWheel className="text-5xl text-red-400" />
						<h1 className="text-3xl font-bold text-white">{t('sports:f1Page.title')}</h1>
					</div>
					<p className="text-gray-400">{t('sports:f1Page.subtitle')}</p>
				</div>

				{/* Tabs */}
				<div className="mb-6 flex space-x-1 bg-gray-800 p-1 rounded-lg max-w-md">
					<button
						onClick={() => setActiveTab('upcoming')}
						className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
							activeTab === 'upcoming' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
						}`}
					>
						{t('sports:f1Page.upcomingTab')}
					</button>
					<button
						onClick={() => setActiveTab('finished')}
						className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
							activeTab === 'finished' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
						}`}
					>
						{t('sports:f1Page.finishedTab')}
					</button>
				</div>

				{/* Races List */}
				<div className="space-y-4">
					{sortedRaces.length === 0 ? (
						<EmptyState
							icon={<GiSteeringWheel className="text-6xl text-red-400 mb-4 mx-auto" />}
							title={activeTab === 'upcoming' ? t('sports:f1Page.noUpcoming') : t('sports:f1Page.noFinished')}
						/>
					) : (
						sortedRaces.map((race) => (
							<div
								key={race.id_carrera_f1}
								className="bg-surface border border-white/5 rounded-2xl p-4 md:p-6 flex items-center justify-between gap-4"
							>
								<div className="min-w-0">
									<div className="flex items-center gap-3 flex-wrap">
										<h3 className="text-white font-bold text-base md:text-lg truncate">{race.nombre_gp}</h3>
										{getStatusBadge(race.estado)}
									</div>
									<p className="text-gray-400 text-sm mt-1 truncate">
										{race.venue_nombre || race.liga_nombre || ''}
										{race.temporada ? ` · ${race.temporada}` : ''}
									</p>
								</div>
								<div className="text-right text-gray-400 flex-shrink-0">
									<div className="text-base font-medium">
										{new Date(race.fecha).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
									</div>
									<div className="text-xs text-gray-500">
										{new Date(race.fecha).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
									</div>
									{race.estado === 'programado' && <TimeUntil date={race.fecha} className="mt-1" />}
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

export default F1Races;
