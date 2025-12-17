import React, { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiTrendingUp, FiCheckCircle, FiXCircle, FiClock as FiPending } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { useBets, Match } from '../hooks/useBets';

interface RoomBetsProps {
  roomId: number;
  isAdmin: boolean;
}

const RoomBets: React.FC<RoomBetsProps> = ({ roomId }) => {
  const { userBets, upcomingMatches, loading, error, fetchUserBets, fetchUpcomingMatches, createBet } = useBets();
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [betForm, setBetForm] = useState({
    prediccion_local: 0,
    prediccion_visitante: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserBets(roomId);
    fetchUpcomingMatches();
  }, [roomId, fetchUserBets, fetchUpcomingMatches]);

  const handleOpenBetModal = (match: Match) => {
    setSelectedMatch(match);
    setBetForm({
      prediccion_local: 0,
      prediccion_visitante: 0,
    });
    setBetError(null);
    setShowBetModal(true);
  };

  const handleSubmitBet = async () => {
    if (!selectedMatch) return;

    setSubmitting(true);
    setBetError(null);

    const result = await createBet({
      id_partido: selectedMatch.id_partido,
      id_sala: roomId,
      prediccion_local: betForm.prediccion_local,
      prediccion_visitante: betForm.prediccion_visitante,
    });

    if (result.success) {
      setShowBetModal(false);
      fetchUserBets(roomId);
      alert('¡Apuesta creada exitosamente!');
    } else {
      setBetError(result.error || 'Error al crear la apuesta');
    }

    setSubmitting(false);
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'ganada':
        return <FiCheckCircle className="text-green-500 text-xl" />;
      case 'perdida':
        return <FiXCircle className="text-red-500 text-xl" />;
      case 'pendiente':
        return <FiPending className="text-yellow-500 text-xl" />;
      default:
        return <FiClock className="text-gray-500 text-xl" />;
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'ganada':
        return 'Ganada';
      case 'perdida':
        return 'Perdida';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'ganada':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'perdida':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading && !userBets.length && !upcomingMatches.length) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-xl">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Upcoming Matches Section */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <GiSoccerBall className="text-green-500" />
          Partidos Disponibles para Apostar
        </h3>

        {upcomingMatches.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay partidos disponibles para apostar</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMatches.map((match) => (
              <div
                key={match.id_partido}
                className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <FiCalendar className="text-xs" />
                    {new Date(match.fecha).toLocaleDateString('es-ES')}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <FiClock className="text-xs" />
                    {new Date(match.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    {match.equipo_local_logo && (
                      <img src={match.equipo_local_logo} alt={match.equipo_local_nombre} className="w-8 h-8 object-contain" />
                    )}
                    <span className="font-semibold text-sm">{match.equipo_local_nombre}</span>
                  </div>

                  <span className="text-gray-400 text-lg font-bold px-3">vs</span>

                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-semibold text-sm text-right">{match.equipo_visitante_nombre}</span>
                    {match.equipo_visitante_logo && (
                      <img src={match.equipo_visitante_logo} alt={match.equipo_visitante_nombre} className="w-8 h-8 object-contain" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{match.liga_nombre}</span>
                  <button
                    onClick={() => handleOpenBetModal(match)}
                    className="btn-primary btn-sm"
                  >
                    Apostar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Bets Section */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-blue-500" />
          Mis Apuestas
        </h3>

        {userBets.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No has realizado apuestas en esta sala</p>
        ) : (
          <div className="space-y-3">
            {userBets.map((bet) => (
              <div
                key={bet.id_apuesta}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{bet.partido_info}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(bet.estado)}
                    <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(bet.estado)}`}>
                      {getStatusText(bet.estado)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">Tu predicción:</span>
                    <span className="text-xl font-bold text-green-400">
                      {bet.prediccion_local} - {bet.prediccion_visitante}
                    </span>
                  </div>

                  {bet.estado !== 'pendiente' && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Puntos:</span>
                      <span className={`text-xl font-bold ${bet.puntos_ganados > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                        {bet.puntos_ganados}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Apuesta realizada: {new Date(bet.fecha_apuesta).toLocaleString('es-ES')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bet Modal */}
      {showBetModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowBetModal(false)}>
          <div className="bg-[#1f2126] rounded-3xl p-6 md:p-8 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Crear Apuesta</h2>

            {/* Match Info */}
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {selectedMatch.equipo_local_logo && (
                    <img src={selectedMatch.equipo_local_logo} alt={selectedMatch.equipo_local_nombre} className="w-6 h-6 object-contain" />
                  )}
                  <span className="font-semibold text-sm">{selectedMatch.equipo_local_nombre}</span>
                </div>

                <span className="text-gray-400 font-bold">vs</span>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{selectedMatch.equipo_visitante_nombre}</span>
                  {selectedMatch.equipo_visitante_logo && (
                    <img src={selectedMatch.equipo_visitante_logo} alt={selectedMatch.equipo_visitante_nombre} className="w-6 h-6 object-contain" />
                  )}
                </div>
              </div>
              <div className="text-center text-xs text-gray-400">
                {new Date(selectedMatch.fecha).toLocaleString('es-ES')}
              </div>
            </div>

            {/* Error Display */}
            {betError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl">
                <p className="text-red-200 text-sm">{betError}</p>
              </div>
            )}

            {/* Score Prediction */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Predicción de Marcador</label>
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-2 text-center">{selectedMatch.equipo_local_nombre}</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={betForm.prediccion_local}
                    onChange={(e) => setBetForm({ ...betForm, prediccion_local: Number(e.target.value) })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <span className="text-3xl font-bold text-gray-500">-</span>

                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-2 text-center">{selectedMatch.equipo_visitante_nombre}</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={betForm.prediccion_visitante}
                    onChange={(e) => setBetForm({ ...betForm, prediccion_visitante: Number(e.target.value) })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBetModal(false)}
                disabled={submitting}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitBet}
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? 'Creando...' : 'Crear Apuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBets;
