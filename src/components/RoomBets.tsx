import React, { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiTrendingUp, FiCheckCircle, FiXCircle, FiClock as FiPending, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { useBets, Match, Bet } from '../hooks/useBets';

interface RoomBetsProps {
  roomId: number;
  isAdmin: boolean;
}

const RoomBets: React.FC<RoomBetsProps> = ({ roomId }) => {
  const { userBets, upcomingMatches, loading, error, fetchUserBets, fetchUpcomingMatches, createBet, updateBet, deleteBet } = useBets();
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [editingBet, setEditingBet] = useState<Bet | null>(null);
  const [betForm, setBetForm] = useState({
    prediccion_local: 0,
    prediccion_visitante: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [countdowns, setCountdowns] = useState<{[key: number]: string}>({});

  useEffect(() => {
    fetchUserBets(roomId);
    fetchUpcomingMatches(roomId);
  }, [roomId, fetchUserBets, fetchUpcomingMatches]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newCountdowns: {[key: number]: string} = {};

      upcomingMatches.forEach((match) => {
        const matchTime = new Date(match.fecha).getTime();
        const distance = matchTime - now;

        if (distance < 0) {
          newCountdowns[match.id_partido] = 'Cerrado';
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          if (days > 0) {
            newCountdowns[match.id_partido] = `${days}d ${hours}h ${minutes}m`;
          } else if (hours > 0) {
            newCountdowns[match.id_partido] = `${hours}h ${minutes}m ${seconds}s`;
          } else {
            newCountdowns[match.id_partido] = `${minutes}m ${seconds}s`;
          }
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [upcomingMatches]);

  const handleOpenBetModal = (match: Match, existingBet?: Bet) => {
    setSelectedMatch(match);
    setEditingBet(existingBet || null);
    setBetForm({
      prediccion_local: existingBet?.prediccion_local || 0,
      prediccion_visitante: existingBet?.prediccion_visitante || 0,
    });
    setBetError(null);
    setShowBetModal(true);
  };

  const handleSubmitBet = async () => {
    if (!selectedMatch) return;

    setSubmitting(true);
    setBetError(null);

    let result;

    if (editingBet) {
      // Update existing bet
      result = await updateBet(editingBet.id_apuesta, {
        prediccion_local: betForm.prediccion_local,
        prediccion_visitante: betForm.prediccion_visitante,
      });
    } else {
      // Create new bet
      result = await createBet({
        id_partido: selectedMatch.id_partido,
        id_sala: roomId,
        prediccion_local: betForm.prediccion_local,
        prediccion_visitante: betForm.prediccion_visitante,
      });
    }

    if (result.success) {
      setShowBetModal(false);
      fetchUserBets(roomId);
      fetchUpcomingMatches(roomId);
      alert(editingBet ? '¡Apuesta actualizada exitosamente!' : '¡Apuesta creada exitosamente!');
    } else {
      setBetError(result.error || 'Error al procesar la apuesta');
    }

    setSubmitting(false);
  };

  const handleDeleteBet = async (bet: Bet) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta apuesta?')) {
      return;
    }

    const result = await deleteBet(bet.id_apuesta);

    if (result.success) {
      fetchUserBets(roomId);
      fetchUpcomingMatches(roomId);
      alert('Apuesta eliminada exitosamente');
    } else {
      alert(result.error || 'Error al eliminar la apuesta');
    }
  };

  const isMatchBettingClosed = (match: Match) => {
    const now = new Date().getTime();
    const matchTime = new Date(match.fecha).getTime();
    return matchTime <= now;
  };

  const getUserBetForMatch = (matchId: number): Bet | undefined => {
    return userBets.find(bet => bet.id_partido === matchId && bet.estado === 'pendiente');
  };

  const getCompletedBets = (): Bet[] => {
    return userBets.filter(bet => bet.estado !== 'pendiente');
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

  const completedBets = getCompletedBets();

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
            {upcomingMatches.map((match) => {
              const userBet = getUserBetForMatch(match.id_partido);
              const bettingClosed = isMatchBettingClosed(match);
              const countdown = countdowns[match.id_partido];

              return (
                <div
                  key={match.id_partido}
                  className={`bg-white/5 rounded-xl p-4 border transition-all ${
                    userBet ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:bg-white/10'
                  }`}
                >
                  {/* Match Header */}
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

                  {/* Teams */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      {match.equipo_local_logo ? (
                        <img
                          src={match.equipo_local_logo}
                          alt={match.equipo_local_nombre}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent && !parent.querySelector('.team-fallback')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'team-fallback w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold';
                              fallback.textContent = match.equipo_local_nombre.substring(0, 2).toUpperCase();
                              parent.insertBefore(fallback, e.currentTarget);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                          {match.equipo_local_nombre.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-sm">{match.equipo_local_nombre}</span>
                    </div>

                    <span className="text-gray-400 text-lg font-bold px-3">vs</span>

                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="font-semibold text-sm text-right">{match.equipo_visitante_nombre}</span>
                      {match.equipo_visitante_logo ? (
                        <img
                          src={match.equipo_visitante_logo}
                          alt={match.equipo_visitante_nombre}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent && !parent.querySelector('.team-fallback')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'team-fallback w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold';
                              fallback.textContent = match.equipo_visitante_nombre.substring(0, 2).toUpperCase();
                              parent.insertBefore(fallback, e.currentTarget);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                          {match.equipo_visitante_nombre.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="mb-3 text-center">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      bettingClosed ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      <FiClock />
                      {bettingClosed ? 'Apuestas cerradas' : `Cierra en: ${countdown}`}
                    </div>
                  </div>

                  {/* User Bet Display (if exists) */}
                  {userBet && (
                    <div className="mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Tu predicción:</span>
                        <span className="text-lg font-bold text-green-400">
                          {userBet.prediccion_local} - {userBet.prediccion_visitante}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Liga Info and Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{match.liga_nombre}</span>
                    <div className="flex gap-2">
                      {userBet ? (
                        <>
                          {!bettingClosed && (
                            <>
                              <button
                                onClick={() => handleOpenBetModal(match, userBet)}
                                className="btn-info btn-sm flex items-center gap-1"
                              >
                                <FiEdit2 className="text-xs" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteBet(userBet)}
                                className="btn-danger btn-sm flex items-center gap-1"
                              >
                                <FiTrash2 className="text-xs" />
                                Eliminar
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenBetModal(match)}
                          disabled={bettingClosed}
                          className={`btn-sm ${bettingClosed ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'}`}
                        >
                          Apostar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bet History Section */}
      {completedBets.length > 0 && (
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-blue-500" />
            Historial de Apuestas
          </h3>

          <div className="space-y-3">
            {completedBets.map((bet) => (
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
                        {bet.puntos_ganados > 0 ? `+${bet.puntos_ganados}` : bet.puntos_ganados}
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
        </div>
      )}

      {/* Bet Modal */}
      {showBetModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowBetModal(false)}>
          <div className="bg-[#1f2126] rounded-3xl p-6 md:p-8 max-w-md w-full border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">{editingBet ? 'Editar Apuesta' : 'Crear Apuesta'}</h2>

            {/* Match Info */}
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {selectedMatch.equipo_local_logo ? (
                    <img
                      src={selectedMatch.equipo_local_logo}
                      alt={selectedMatch.equipo_local_nombre}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.team-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'team-fallback w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold';
                          fallback.textContent = selectedMatch.equipo_local_nombre.substring(0, 2).toUpperCase();
                          parent.insertBefore(fallback, e.currentTarget);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                      {selectedMatch.equipo_local_nombre.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-sm">{selectedMatch.equipo_local_nombre}</span>
                </div>

                <span className="text-gray-400 font-bold">vs</span>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{selectedMatch.equipo_visitante_nombre}</span>
                  {selectedMatch.equipo_visitante_logo ? (
                    <img
                      src={selectedMatch.equipo_visitante_logo}
                      alt={selectedMatch.equipo_visitante_nombre}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.team-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'team-fallback w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold';
                          fallback.textContent = selectedMatch.equipo_visitante_nombre.substring(0, 2).toUpperCase();
                          parent.insertBefore(fallback, e.currentTarget);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                      {selectedMatch.equipo_visitante_nombre.substring(0, 2).toUpperCase()}
                    </div>
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
                {submitting ? 'Procesando...' : editingBet ? 'Actualizar Apuesta' : 'Crear Apuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBets;
