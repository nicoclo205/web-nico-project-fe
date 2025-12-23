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
      console.log('Estadísticas recibidas:', response.data);
      console.log('Equipo Local buscado:', equipoLocal);
      console.log('Equipo Visitante buscado:', equipoVisitante);
      setStatistics(response.data);
    } else {
      console.error('Error al cargar estadísticas:', response.error);
      setError(response.error || 'No se pudieron cargar las estadísticas');
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  // Usar el orden de las estadísticas (primero = local, segundo = visitante)
  // El backend devuelve las estadísticas en el orden correcto
  let finalHomeStats = statistics.length > 0 ? statistics[0] : null;
  let finalAwayStats = statistics.length > 1 ? statistics[1] : null;

  // Verificar si están en el orden correcto comparando con los nombres de los equipos
  if (finalHomeStats && finalAwayStats) {
    const firstMatchesHome = finalHomeStats.equipo_nombre.toLowerCase().includes(equipoLocal.toLowerCase()) ||
                             equipoLocal.toLowerCase().includes(finalHomeStats.equipo_nombre.toLowerCase());

    // Si el primer registro NO es el equipo local, invertir
    if (!firstMatchesHome) {
      [finalHomeStats, finalAwayStats] = [finalAwayStats, finalHomeStats];
    }
  }

  const StatRow = ({ label, homeValue, awayValue, isPercentage = false, index = 0 }: {
    label: string;
    homeValue: number | null;
    awayValue: number | null;
    isPercentage?: boolean;
    index?: number;
  }) => {
    const home = homeValue ?? 0;
    const away = awayValue ?? 0;
    const total = home + away || 1;
    const homePercent = (home / total) * 100;
    const awayPercent = (away / total) * 100;

    return (
      <div className="py-3 border-b border-white/10 last:border-b-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-green-400 font-semibold">{isPercentage ? `${home}%` : home}</span>
          <span className="text-xs text-gray-300 font-medium tracking-wide uppercase">{label}</span>
          <span className="text-sm text-green-400 font-semibold">{isPercentage ? `${away}%` : away}</span>
        </div>
        <div className="flex h-2.5 bg-white/5 rounded-full overflow-hidden relative">
          {/* Barra local - se anima de izquierda a derecha */}
          <div
            className="h-2.5 bg-gradient-to-r from-green-600 to-green-500 rounded-l absolute left-0"
            style={{
              width: `${homePercent}%`,
              animation: 'expandRight 0.8s ease-out forwards',
              animationDelay: `${index * 80}ms`,
              transformOrigin: 'left center'
            }}
          />
          {/* Barra visitante - se anima de derecha a izquierda */}
          <div
            className="h-2.5 bg-gradient-to-l from-green-600 to-green-500 rounded-r absolute right-0"
            style={{
              width: `${awayPercent}%`,
              animation: 'expandLeft 0.8s ease-out forwards',
              animationDelay: `${index * 80}ms`,
              transformOrigin: 'right center'
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes expandRight {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes expandLeft {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-[#1f2126] to-[#16181d] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-br from-[#1f2126] to-[#16181d] p-6 rounded-t-3xl border-b border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Estadísticas del Partido
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Score */}
            <div className="mt-4 flex justify-around items-center bg-white/5 rounded-xl p-4">
              <div className="text-center flex-1">
                <p className="text-white/90 font-medium text-sm md:text-base mb-2">{equipoLocal}</p>
                <p className="text-3xl md:text-4xl font-bold text-white">{golesLocal ?? '-'}</p>
              </div>
              <div className="text-xl md:text-2xl text-white/40 font-bold px-4">VS</div>
              <div className="text-center flex-1">
                <p className="text-white/90 font-medium text-sm md:text-base mb-2">{equipoVisitante}</p>
                <p className="text-3xl md:text-4xl font-bold text-white">{golesVisitante ?? '-'}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            )}

            {error && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                <p className="text-yellow-400 font-medium">{error}</p>
                <p className="text-sm text-gray-400 mt-2">Las estadísticas aún no están disponibles para este partido</p>
              </div>
            )}

            {!loading && !error && statistics.length > 0 && finalHomeStats && finalAwayStats && (
              <div className="space-y-1">
                <StatRow
                  label="Posesión"
                  homeValue={finalHomeStats.posesion}
                  awayValue={finalAwayStats.posesion}
                  isPercentage={true}
                  index={0}
                />

                <StatRow
                  label="Tiros Totales"
                  homeValue={finalHomeStats.tiros_total}
                  awayValue={finalAwayStats.tiros_total}
                  index={1}
                />

                <StatRow
                  label="Tiros a Puerta"
                  homeValue={finalHomeStats.tiros_a_puerta}
                  awayValue={finalAwayStats.tiros_a_puerta}
                  index={2}
                />

                <StatRow
                  label="Tiros Fuera"
                  homeValue={finalHomeStats.tiros_fuera}
                  awayValue={finalAwayStats.tiros_fuera}
                  index={3}
                />

                <StatRow
                  label="Tiros Bloqueados"
                  homeValue={finalHomeStats.tiros_bloqueados}
                  awayValue={finalAwayStats.tiros_bloqueados}
                  index={4}
                />

                <StatRow
                  label="Corners"
                  homeValue={finalHomeStats.corners}
                  awayValue={finalAwayStats.corners}
                  index={5}
                />

                <StatRow
                  label="Offsides"
                  homeValue={finalHomeStats.offsides}
                  awayValue={finalAwayStats.offsides}
                  index={6}
                />

                <StatRow
                  label="Faltas"
                  homeValue={finalHomeStats.faltas}
                  awayValue={finalAwayStats.faltas}
                  index={7}
                />

                <StatRow
                  label="Tarjetas Amarillas"
                  homeValue={finalHomeStats.tarjetas_amarillas}
                  awayValue={finalAwayStats.tarjetas_amarillas}
                  index={8}
                />

                {((finalHomeStats.tarjetas_rojas && finalHomeStats.tarjetas_rojas > 0) ||
                  (finalAwayStats.tarjetas_rojas && finalAwayStats.tarjetas_rojas > 0)) && (
                  <StatRow
                    label="Tarjetas Rojas"
                    homeValue={finalHomeStats.tarjetas_rojas}
                    awayValue={finalAwayStats.tarjetas_rojas}
                    index={9}
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
          <div className="p-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchStatisticsModal;
