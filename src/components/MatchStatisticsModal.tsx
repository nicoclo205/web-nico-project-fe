import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { apiService } from '../services/apiService';

interface MatchStatistic {
  id_estadistica: number;
  equipo_nombre: string;
  posesion: number | null;
  tiros_total: number | null;
  tiros_a_puerta: number | null;
  tiros_fuera: number | null;
  tiros_bloqueados: number | null;
  corners: number | null;
  offsides: number | null;
  faltas: number | null;
  tarjetas_amarillas: number | null;
  tarjetas_rojas: number | null;
}

interface MatchStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partidoId: number;
  equipoLocal: string;
  equipoVisitante: string;
  golesLocal: number | null;
  golesVisitante: number | null;
}

const MatchStatisticsModal: React.FC<MatchStatisticsModalProps> = ({
  isOpen,
  onClose,
  partidoId,
  equipoLocal,
  equipoVisitante,
  golesLocal,
  golesVisitante,
}) => {
  const [statistics, setStatistics] = useState<MatchStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && partidoId) {
      loadStatistics();
    }
  }, [isOpen, partidoId]);

  const loadStatistics = async () => {
    setLoading(true);
    setError(null);

    const response = await apiService.getMatchStatistics(partidoId);

    if (response.success && response.data) {
      setStatistics(response.data);
    } else {
      setError(response.error || 'No se pudieron cargar las estadísticas');
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  const homeStats = statistics.find(s => s.equipo_nombre === equipoLocal);
  const awayStats = statistics.find(s => s.equipo_nombre === equipoVisitante);

  const StatRow = ({ label, homeValue, awayValue, isPercentage = false }: {
    label: string;
    homeValue: number | null;
    awayValue: number | null;
    isPercentage?: boolean;
  }) => {
    const home = homeValue ?? 0;
    const away = awayValue ?? 0;
    const total = home + away || 1;
    const homePercent = (home / total) * 100;
    const awayPercent = (away / total) * 100;

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-white/90">{isPercentage ? `${home}%` : home}</span>
          <span className="text-xs text-gray-400">{label}</span>
          <span className="text-sm font-medium text-white/90">{isPercentage ? `${away}%` : away}</span>
        </div>
        <div className="flex gap-1">
          <div
            className="h-2 bg-blue-500 rounded-l transition-all duration-300"
            style={{ width: `${homePercent}%` }}
          />
          <div
            className="h-2 bg-red-500 rounded-r transition-all duration-300"
            style={{ width: `${awayPercent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Estadísticas del Partido</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiX className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Score */}
          <div className="mt-4 flex justify-around items-center">
            <div className="text-center">
              <p className="text-white/90 font-medium">{equipoLocal}</p>
              <p className="text-4xl font-bold text-white mt-2">{golesLocal ?? '-'}</p>
            </div>
            <div className="text-2xl text-white/60 font-bold">VS</div>
            <div className="text-center">
              <p className="text-white/90 font-medium">{equipoVisitante}</p>
              <p className="text-4xl font-bold text-white mt-2">{golesVisitante ?? '-'}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
              <p className="text-yellow-400">{error}</p>
              <p className="text-sm text-gray-400 mt-2">Las estadísticas aún no están disponibles para este partido</p>
            </div>
          )}

          {!loading && !error && statistics.length > 0 && homeStats && awayStats && (
            <div className="space-y-2">
              <StatRow
                label="Posesión"
                homeValue={homeStats.posesion}
                awayValue={awayStats.posesion}
                isPercentage={true}
              />

              <StatRow
                label="Tiros Totales"
                homeValue={homeStats.tiros_total}
                awayValue={awayStats.tiros_total}
              />

              <StatRow
                label="Tiros a Puerta"
                homeValue={homeStats.tiros_a_puerta}
                awayValue={awayStats.tiros_a_puerta}
              />

              <StatRow
                label="Tiros Fuera"
                homeValue={homeStats.tiros_fuera}
                awayValue={awayStats.tiros_fuera}
              />

              <StatRow
                label="Tiros Bloqueados"
                homeValue={homeStats.tiros_bloqueados}
                awayValue={awayStats.tiros_bloqueados}
              />

              <StatRow
                label="Tiros de Esquina"
                homeValue={homeStats.corners}
                awayValue={awayStats.corners}
              />

              <StatRow
                label="Fueras de Juego"
                homeValue={homeStats.offsides}
                awayValue={awayStats.offsides}
              />

              <StatRow
                label="Faltas"
                homeValue={homeStats.faltas}
                awayValue={awayStats.faltas}
              />

              <StatRow
                label="Tarjetas Amarillas"
                homeValue={homeStats.tarjetas_amarillas}
                awayValue={awayStats.tarjetas_amarillas}
              />

              {((homeStats.tarjetas_rojas && homeStats.tarjetas_rojas > 0) ||
                (awayStats.tarjetas_rojas && awayStats.tarjetas_rojas > 0)) && (
                <StatRow
                  label="Tarjetas Rojas"
                  homeValue={homeStats.tarjetas_rojas}
                  awayValue={awayStats.tarjetas_rojas}
                />
              )}
            </div>
          )}

          {!loading && !error && statistics.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No hay estadísticas disponibles para este partido</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchStatisticsModal;
