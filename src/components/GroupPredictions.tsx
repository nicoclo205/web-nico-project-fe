import React, { useEffect, useState, useCallback } from 'react';
import { FiRefreshCw, FiClock, FiCheckCircle, FiUsers } from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

interface Prediction {
  id_apuesta: number;
  id_partido: number;
  usuario_nombre: string;
  usuario_foto: string | null;
  prediccion_local: number;
  prediccion_visitante: number;
  puntos_ganados: number;
  estado: 'pendiente' | 'ganada' | 'perdida';
  equipo_local: string;
  equipo_visitante: string;
  equipo_local_logo: string | null;
  equipo_visitante_logo: string | null;
  fecha_partido: string;
  estado_partido: string;
  goles_local_real: number | null;
  goles_visitante_real: number | null;
  ronda: string;
}

interface MatchGroup {
  id_partido: number;
  equipo_local: string;
  equipo_visitante: string;
  equipo_local_logo: string | null;
  equipo_visitante_logo: string | null;
  fecha_partido: string;
  estado_partido: string;
  goles_local_real: number | null;
  goles_visitante_real: number | null;
  ronda: string;
  predictions: Prediction[];
}

interface GroupPredictionsProps {
  roomId: number;
}

const TeamLogo: React.FC<{ src: string | null; alt: string }> = ({ src, alt }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <span className="text-lg">🏳️</span>;
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-6 h-6 object-contain"
      onError={() => setError(true)}
    />
  );
};

const GroupPredictions: React.FC<GroupPredictionsProps> = ({ roomId }) => {
  const token = localStorage.getItem('authToken');
  const [matchGroups, setMatchGroups] = useState<MatchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/apuestas-futbol/por_sala/?sala_id=${roomId}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to load predictions');
      const data: Prediction[] = await res.json();

      // Group by match
      const grouped = new Map<number, MatchGroup>();
      data.forEach((p) => {
        if (!grouped.has(p.id_partido)) {
          grouped.set(p.id_partido, {
            id_partido: p.id_partido,
            equipo_local: p.equipo_local,
            equipo_visitante: p.equipo_visitante,
            equipo_local_logo: p.equipo_local_logo,
            equipo_visitante_logo: p.equipo_visitante_logo,
            fecha_partido: p.fecha_partido,
            estado_partido: p.estado_partido,
            goles_local_real: p.goles_local_real,
            goles_visitante_real: p.goles_visitante_real,
            ronda: p.ronda,
            predictions: [],
          });
        }
        grouped.get(p.id_partido)!.predictions.push(p);
      });

      // Sort: upcoming first (by date asc), finished last (by date desc)
      const groups = Array.from(grouped.values());
      const upcoming = groups
        .filter((g) => g.estado_partido !== 'finalizado')
        .sort((a, b) => new Date(a.fecha_partido).getTime() - new Date(b.fecha_partido).getTime());
      const finished = groups
        .filter((g) => g.estado_partido === 'finalizado')
        .sort((a, b) => new Date(b.fecha_partido).getTime() - new Date(a.fecha_partido).getTime());

      setMatchGroups([...upcoming, ...finished]);
    } catch (err) {
      setError('Could not load group predictions.');
    } finally {
      setLoading(false);
    }
  }, [roomId, token]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      weekday: 'short', day: 'numeric', month: 'short',
    }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getBetStyle = (estado: string) => {
    if (estado === 'ganada') return 'text-green-400 font-bold';
    if (estado === 'perdida') return 'text-red-400';
    return 'text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <FiRefreshCw className="animate-spin mr-2" /> Loading predictions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-red-400 gap-3">
        <p>{error}</p>
        <button onClick={fetchPredictions} className="btn-primary text-sm px-4 py-2">
          Try Again
        </button>
      </div>
    );
  }

  if (matchGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
        <FiUsers size={40} />
        <p>No predictions in this group yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">
          {matchGroups.length} match{matchGroups.length !== 1 ? 'es' : ''} with predictions
        </span>
        <button
          onClick={fetchPredictions}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {matchGroups.map((match) => {
        const isFinished = match.estado_partido === 'finalizado';
        const isLive = match.estado_partido === 'en_curso';

        return (
          <div key={match.id_partido} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
            {/* Match header */}
            <div className="bg-white/10 px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 uppercase tracking-wide">{match.ronda}</span>
                <div className="flex items-center gap-1">
                  {isLive && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                      Live
                    </span>
                  )}
                  {isFinished
                    ? <FiCheckCircle size={13} className="text-green-400" />
                    : <FiClock size={13} className="text-gray-400" />
                  }
                  <span className="text-xs text-gray-400">{formatDate(match.fecha_partido)}</span>
                </div>
              </div>

              {/* Teams + real score */}
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-sm font-semibold text-white text-right">{match.equipo_local}</span>
                  <TeamLogo src={match.equipo_local_logo} alt={match.equipo_local} />
                </div>

                <div className="text-center min-w-[60px]">
                  {isFinished && match.goles_local_real !== null ? (
                    <span className="text-lg font-bold text-white">
                      {match.goles_local_real} – {match.goles_visitante_real}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">vs</span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-1 justify-start">
                  <TeamLogo src={match.equipo_visitante_logo} alt={match.equipo_visitante} />
                  <span className="text-sm font-semibold text-white">{match.equipo_visitante}</span>
                </div>
              </div>
            </div>

            {/* Predictions list */}
            <div className="divide-y divide-white/5">
              {match.predictions.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-3">No predictions</p>
              ) : (
                match.predictions.map((p) => (
                  <div key={p.id_apuesta} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-gray-200">{p.usuario_nombre}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm tabular-nums ${getBetStyle(p.estado)}`}>
                        {p.prediccion_local} – {p.prediccion_visitante}
                      </span>
                      {isFinished && (
                        <span className={`text-xs min-w-[40px] text-right ${getBetStyle(p.estado)}`}>
                          {p.estado === 'ganada' ? `+${p.puntos_ganados} pts` : '0 pts'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupPredictions;
