import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiTrendingUp, FiCheckCircle, FiXCircle, FiClock as FiPending, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import { useBets, Match, Bet } from '../hooks/useBets';
import { apiService, Room } from '../services/apiService';
import Spinner from './Spinner';

interface RoomBetsProps {
  roomId: number;
  isAdmin: boolean;
}

// ── Reusable team logo with initials fallback ──────────────────────────────
const TeamLogo: React.FC<{ logo: string; name: string; size?: 'sm' | 'md' | 'lg' }> = ({
  logo,
  name,
  size = 'md',
}) => {
  const sizeClass = size === 'lg' ? 'w-16 h-16' : size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const textClass = size === 'lg' ? 'text-lg' : 'text-xs';
  return logo ? (
    <img
      src={logo}
      alt={name}
      className={`${sizeClass} object-contain`}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
    />
  ) : (
    <div className={`${sizeClass} rounded-full bg-white/10 flex items-center justify-center ${textClass} font-bold flex-shrink-0`}>
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
};

// ── Yes / No toggle button ─────────────────────────────────────────────────
const YesNoToggle: React.FC<{
  value: boolean | null;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => (
  <div className="flex gap-2">
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(true)}
      className={`text-xs px-3 py-1 rounded-full border transition-all ${
        value === true
          ? 'bg-green-500/30 text-green-400 border-green-500/50'
          : 'bg-white/5 text-gray-400 border-white/20 hover:border-white/40'
      }`}
    >
      Yes
    </button>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(false)}
      className={`text-xs px-3 py-1 rounded-full border transition-all ${
        value === false
          ? 'bg-red-500/30 text-red-400 border-red-500/50'
          : 'bg-white/5 text-gray-400 border-white/20 hover:border-white/40'
      }`}
    >
      No
    </button>
  </div>
);

// ──────────────────────────────────────────────────────────────────────────
const RoomBets: React.FC<RoomBetsProps> = ({ roomId }) => {
  const { t } = useTranslation(['rooms', 'common']);
  const {
    userBets,
    upcomingMatches,
    loading,
    error,
    fetchUserBets,
    fetchUpcomingMatches,
    createBet,
    updateBet,
    deleteBet,
  } = useBets();

  // ── Core modal state ───────────────────────────────────────────────────
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [editingBet, setEditingBet] = useState<Bet | null>(null);
  const [betForm, setBetForm] = useState({ prediccion_local: '', prediccion_visitante: '' });
  const [submitting, setSubmitting] = useState(false);
  const [betError, setBetError] = useState<string | null>(null);
  const [countdowns, setCountdowns] = useState<{ [key: number]: string }>({});

  // ── Knockout state ─────────────────────────────────────────────────────
  const [betStep, setBetStep] = useState<'score' | 'winner'>('score');
  const [tieneET, setTieneET] = useState<boolean | null>(null);
  const [ganadorKo, setGanadorKo] = useState<number | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────
  const localVal = parseInt(betForm.prediccion_local, 10);
  const visitanteVal = parseInt(betForm.prediccion_visitante, 10);
  const bothFilled = betForm.prediccion_local !== '' && betForm.prediccion_visitante !== '';
  const isDrawPrediction =
    bothFilled && !isNaN(localVal) && !isNaN(visitanteVal) && localVal === visitanteVal;

  // ── Replicate bet modal state ──────────────────────────────────────────
  const [showReplicateModal, setShowReplicateModal] = useState(false);
  const [otherAvailableRooms, setOtherAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomsForReplication, setSelectedRoomsForReplication] = useState<number[]>([]);
  const [lastBetData, setLastBetData] = useState<{ local: number; visitante: number; match: Match } | null>(null);
  const [replicating, setReplicating] = useState(false);

  // ── Initial data fetch ─────────────────────────────────────────────────
  useEffect(() => {
    fetchUserBets(roomId);
    fetchUpcomingMatches(roomId);
  }, [roomId, fetchUserBets, fetchUpcomingMatches]);

  // ── Countdown timer ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newCountdowns: { [key: number]: string } = {};
      upcomingMatches.forEach((match) => {
        const distance = new Date(match.fecha).getTime() - now;
        if (distance < 0) {
          newCountdowns[match.id_partido] = t('rooms:bets.closed');
        } else {
          const d = Math.floor(distance / 86400000);
          const h = Math.floor((distance % 86400000) / 3600000);
          const m = Math.floor((distance % 3600000) / 60000);
          const s = Math.floor((distance % 60000) / 1000);
          newCountdowns[match.id_partido] =
            d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);
    return () => clearInterval(interval);
  }, [upcomingMatches]);

  // ── Auto-toggle ET/penales when score changes on a knockout match ───────
  useEffect(() => {
    if (!selectedMatch?.is_knockout) return;
    if (isDrawPrediction) {
      setTieneET(true); // draw always implies ET
    } else {
      setTieneET(null);
      setGanadorKo(null);
    }
  }, [isDrawPrediction, selectedMatch?.is_knockout]);

  // ── Auto-return to score step when score changes from draw to non-draw ──
  useEffect(() => {
    if (!isDrawPrediction && betStep === 'winner') {
      setBetStep('score');
    }
  }, [isDrawPrediction, betStep]);

  // ── Modal helpers ──────────────────────────────────────────────────────
  const handleCloseModal = () => {
    setShowBetModal(false);
    setBetStep('score');
  };

  const handleOpenBetModal = (match: Match, existingBet?: Bet) => {
    setSelectedMatch(match);
    setEditingBet(existingBet || null);
    setBetForm({
      prediccion_local: existingBet != null ? String(existingBet.prediccion_local) : '',
      prediccion_visitante: existingBet != null ? String(existingBet.prediccion_visitante) : '',
    });
    setBetError(null);
    setBetStep('score');
    setTieneET(existingBet?.tiene_tiempo_extra ?? null);
    setGanadorKo(existingBet?.ganador_ko ?? null);
    setShowBetModal(true);
  };

  // ── Bet submission ─────────────────────────────────────────────────────
  const handleSubmitBet = async (equipoId?: number) => {
    if (!selectedMatch) return;

    const local = betForm.prediccion_local === '' ? 0 : parseInt(betForm.prediccion_local, 10);
    const visitante = betForm.prediccion_visitante === '' ? 0 : parseInt(betForm.prediccion_visitante, 10);
    const isDraw = local === visitante;

    // Step 1 for knockout + draw: advance to winner picker without submitting
    if (selectedMatch.is_knockout && isDraw && betStep === 'score') {
      setBetStep('winner');
      return;
    }

    setSubmitting(true);
    setBetError(null);

    // Build knockout payload fields
    const koFields = selectedMatch.is_knockout
      ? {
          tiene_tiempo_extra: isDraw ? true : (tieneET ?? false),
          tiene_penales: isDraw ? true : false,
          ganador_ko: isDraw ? (equipoId ?? ganadorKo) : null,
        }
      : {};

    const baseScoreFields = {
      prediccion_local: local,
      prediccion_visitante: visitante,
    };

    if (editingBet) {
      const result = await updateBet(editingBet.id_apuesta, { ...baseScoreFields, ...koFields });
      if (result.success) {
        handleCloseModal();
        fetchUserBets(roomId);
        fetchUpcomingMatches(roomId);
        alert(t('rooms:bets.betPlaced'));
      } else {
        setBetError(result.error || t('rooms:bets.errors.place'));
      }
      setSubmitting(false);
      return;
    }

    // Nueva apuesta: crear y luego buscar otras salas disponibles
    const result = await createBet({
      id_partido: selectedMatch.id_partido,
      id_sala: roomId,
      ...baseScoreFields,
      ...koFields,
    });

    if (result.success) {
      handleCloseModal();
      fetchUserBets(roomId);
      fetchUpcomingMatches(roomId);

      // Buscar otras salas donde el usuario también pueda apostar este partido
      const otherRoomsResult = await apiService.getOtherAvailableRooms(selectedMatch.id_partido, roomId);
      console.log('[RoomBets] otras_salas_disponibles response:', otherRoomsResult);
      if (otherRoomsResult.success && otherRoomsResult.data && otherRoomsResult.data.length > 0) {
        setOtherAvailableRooms(otherRoomsResult.data);
        setLastBetData({ local, visitante, match: selectedMatch });
        setSelectedRoomsForReplication(otherRoomsResult.data.map(r => r.id_sala));
        setShowReplicateModal(true);
      } else {
        alert(t('rooms:bets.betPlaced'));
      }
    } else {
      setBetError(result.error || t('rooms:bets.errors.place'));
      // On error in winner step, stay on winner step so user can retry
    }

    setSubmitting(false);
  };

  const handleWinnerSelected = (equipoId: number) => {
    setGanadorKo(equipoId);
    handleSubmitBet(equipoId);
  };

  const handleToggleRoomForReplication = (salaId: number) => {
    setSelectedRoomsForReplication(prev =>
      prev.includes(salaId) ? prev.filter(id => id !== salaId) : [...prev, salaId]
    );
  };

  const handleReplicateBet = async () => {
    if (!lastBetData || selectedRoomsForReplication.length === 0) {
      setShowReplicateModal(false);
      alert(t('rooms:bets.betPlaced'));
      return;
    }

    setReplicating(true);
    for (const salaId of selectedRoomsForReplication) {
      await createBet({
        id_partido: lastBetData.match.id_partido,
        id_sala: salaId,
        prediccion_local: lastBetData.local,
        prediccion_visitante: lastBetData.visitante,
      });
    }
    setReplicating(false);
    setShowReplicateModal(false);
    alert(t('rooms:bets.betPlaced'));
  };

  const handleFeelLucky = () => {
    setBetForm({
      prediccion_local: String(Math.floor(Math.random() * 7)),
      prediccion_visitante: String(Math.floor(Math.random() * 7)),
    });
  };

  const handleDeleteBet = async (bet: Bet) => {
    if (!window.confirm(t('rooms:deleteBetConfirm'))) return;
    const result = await deleteBet(bet.id_apuesta);
    if (result.success) {
      fetchUserBets(roomId);
      fetchUpcomingMatches(roomId);
    } else {
      alert(result.error || t('rooms:bets.errors.delete'));
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const isMatchBettingClosed = (match: Match) =>
    new Date(match.fecha).getTime() <= new Date().getTime();

  const getUserBetForMatch = (matchId: number): Bet | undefined =>
    userBets.find((bet) => bet.id_partido === matchId && bet.estado === 'pendiente');

  const getCompletedBets = (): Bet[] => userBets.filter((bet) => bet.estado !== 'pendiente');

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'ganada': return <FiCheckCircle className="text-green-500 text-xl" />;
      case 'perdida': return <FiXCircle className="text-red-500 text-xl" />;
      case 'pendiente': return <FiPending className="text-yellow-500 text-xl" />;
      default: return <FiClock className="text-gray-500 text-xl" />;
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'ganada': return t('rooms:bets.status.won');
      case 'perdida': return t('rooms:bets.status.lost');
      case 'pendiente': return t('rooms:bets.status.pending');
      case 'cancelada': return t('rooms:bets.status.cancelled');
      default: return estado;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'ganada': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'perdida': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pendiente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading && !userBets.length && !upcomingMatches.length) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  const completedBets = getCompletedBets();

  // ── Submit button label ────────────────────────────────────────────────
  const submitLabel = (() => {
    if (submitting) return t('rooms:bets.processing');
    if (selectedMatch?.is_knockout && isDrawPrediction) return 'Next: pick winner →';
    if (editingBet) return t('rooms:bets.updateBet');
    return t('rooms:bets.placeBet');
  })();

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Global error */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-xl">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* ── Upcoming Matches ─────────────────────────────────────────── */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-panel to-panel-dark shadow-xl border border-white/5">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <GiSoccerBall className="text-green-500" />
          Available Matches
        </h3>

        {upcomingMatches.length === 0 ? (
          <p className="text-gray-400 text-center py-8">{t('rooms:bets.noMatches')}</p>
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
                    userBet
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-white/10 hover:bg-white/10'
                  }`}
                >
                  {/* Match header row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiCalendar className="text-xs" />
                      {new Date(match.fecha).toLocaleDateString('en-US')}
                    </span>
                    <div className="flex items-center gap-2">
                      {match.is_knockout && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          ⚡ Knockout
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FiClock className="text-xs" />
                        {new Date(match.fecha).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <TeamLogo logo={match.equipo_local_logo} name={match.equipo_local_nombre} />
                      <span className="font-semibold text-sm">{match.equipo_local_nombre}</span>
                    </div>
                    <span className="text-gray-400 text-lg font-bold px-3">vs</span>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="font-semibold text-sm text-right">
                        {match.equipo_visitante_nombre}
                      </span>
                      <TeamLogo logo={match.equipo_visitante_logo} name={match.equipo_visitante_nombre} />
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="mb-3 text-center">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        bettingClosed
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      <FiClock />
                      {bettingClosed
                        ? t('rooms:bets.betsClosed')
                        : t('rooms:bets.closesIn', { time: countdown })}
                    </div>
                  </div>

                  {/* Existing bet display */}
                  {userBet && (
                    <div className="mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">{t('rooms:bets.yourPrediction')}</span>
                        <span className="text-lg font-bold text-green-400">
                          {userBet.prediccion_local} - {userBet.prediccion_visitante}
                        </span>
                      </div>
                      {userBet.ganador_ko_nombre && (
                        <p className="text-xs text-yellow-400 mt-1">
                          ⚡ Penalty winner: <strong>{userBet.ganador_ko_nombre}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
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
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBet(userBet)}
                                className="btn-danger btn-sm flex items-center gap-1"
                              >
                                <FiTrash2 className="text-xs" />
                                Delete
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenBetModal(match)}
                          disabled={bettingClosed}
                          className={`btn-sm ${
                            bettingClosed
                              ? 'btn-secondary opacity-50 cursor-not-allowed'
                              : 'btn-primary'
                          }`}
                        >
                          Place Bet
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

      {/* ── Bet History ──────────────────────────────────────────────── */}
      {completedBets.length > 0 && (
        <div className="rounded-3xl p-6 bg-gradient-to-br from-panel to-panel-dark shadow-xl border border-white/5">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-blue-500" />
            Bet History
          </h3>
          <div className="space-y-3">
            {completedBets.map((bet) => (
              <div key={bet.id_apuesta} className="bg-white/5 rounded-xl p-4 border border-white/10">
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
                    <span className="text-gray-400 text-sm">{t('rooms:bets.yourPrediction')}</span>
                    <span className="text-xl font-bold text-green-400">
                      {bet.prediccion_local} - {bet.prediccion_visitante}
                    </span>
                  </div>
                  {bet.estado !== 'pendiente' && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">{t('rooms:bets.points')}</span>
                      <span
                        className={`text-xl font-bold ${
                          bet.puntos_ganados > 0 ? 'text-green-400' : 'text-gray-500'
                        }`}
                      >
                        {bet.puntos_ganados > 0 ? `+${bet.puntos_ganados}` : bet.puntos_ganados}
                      </span>
                    </div>
                  )}
                </div>
                {bet.ganador_ko_nombre && (
                  <p className="mt-1 text-xs text-yellow-400">
                    ⚡ Penalty winner: <strong>{bet.ganador_ko_nombre}</strong>
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Bet placed: {new Date(bet.fecha_apuesta).toLocaleString('en-US')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Replicate Bet Modal */}
      {showReplicateModal && lastBetData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-panel rounded-3xl p-6 md:p-8 max-w-md w-full border border-white/10">
            <h2 className="text-xl font-bold mb-2">¿Replicar apuesta en otras salas?</h2>
            <p className="text-gray-400 text-sm mb-4">
              Pusiste <span className="text-white font-bold">{lastBetData.local} - {lastBetData.visitante}</span> para{' '}
              <span className="text-white font-semibold">{lastBetData.match.equipo_local_nombre} vs {lastBetData.match.equipo_visitante_nombre}</span>.
              Estás en otras salas con este mismo partido. ¿Querés hacer la misma apuesta?
            </p>

            <div className="space-y-2 mb-6">
              {otherAvailableRooms.map(sala => (
                <label
                  key={sala.id_sala}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoomsForReplication.includes(sala.id_sala)}
                    onChange={() => handleToggleRoomForReplication(sala.id_sala)}
                    className="w-4 h-4 accent-green-500"
                  />
                  <span className="font-medium text-sm">{sala.nombre}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowReplicateModal(false); alert(t('rooms:bets.betPlaced')); }}
                disabled={replicating}
                className="btn-secondary flex-1"
              >
                No, gracias
              </button>
              <button
                onClick={handleReplicateBet}
                disabled={replicating || selectedRoomsForReplication.length === 0}
                className="btn-primary flex-1"
              >
                {replicating ? 'Replicando...' : `Sí, replicar (${selectedRoomsForReplication.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bet Modal ────────────────────────────────────────────────── */}
      {showBetModal && selectedMatch && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-panel rounded-3xl p-6 md:p-8 max-w-md w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ════════════════════════════════════════════════════════
                STEP: WINNER (knockout + draw only)
            ════════════════════════════════════════════════════════ */}
            {betStep === 'winner' ? (
              <>
                <h2 className="text-2xl font-bold mb-1">Who wins the penalties? 🥅</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Prediction:{' '}
                  <span className="font-bold text-white">
                    {betForm.prediccion_local} – {betForm.prediccion_visitante}
                  </span>{' '}
                  <span className="text-yellow-400">(draw → penalties)</span>
                </p>

                {betError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl">
                    <p className="text-red-200 text-sm">{betError}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Local team */}
                  <button
                    onClick={() => handleWinnerSelected(selectedMatch.equipo_local)}
                    disabled={submitting}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      ganadorKo === selectedMatch.equipo_local
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <TeamLogo
                      logo={selectedMatch.equipo_local_logo}
                      name={selectedMatch.equipo_local_nombre}
                      size="lg"
                    />
                    <span className="font-bold text-sm text-center">
                      {selectedMatch.equipo_local_nombre}
                    </span>
                  </button>

                  {/* Away team */}
                  <button
                    onClick={() => handleWinnerSelected(selectedMatch.equipo_visitante)}
                    disabled={submitting}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      ganadorKo === selectedMatch.equipo_visitante
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <TeamLogo
                      logo={selectedMatch.equipo_visitante_logo}
                      name={selectedMatch.equipo_visitante_nombre}
                      size="lg"
                    />
                    <span className="font-bold text-sm text-center">
                      {selectedMatch.equipo_visitante_nombre}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => setBetStep('score')}
                  disabled={submitting}
                  className="w-full text-sm text-gray-400 hover:text-white transition-colors py-2"
                >
                  ← Back to change score
                </button>
              </>
            ) : (
              /* ════════════════════════════════════════════════════════
                 STEP: SCORE
              ════════════════════════════════════════════════════════ */
              <>
                <h2 className="text-2xl font-bold mb-6">
                  {editingBet ? t('rooms:bets.editBetTitle') : t('rooms:bets.placeBetTitle')}
                </h2>

                {/* Match info */}
                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TeamLogo
                        logo={selectedMatch.equipo_local_logo}
                        name={selectedMatch.equipo_local_nombre}
                        size="sm"
                      />
                      <span className="font-semibold text-sm">{selectedMatch.equipo_local_nombre}</span>
                    </div>
                    <span className="text-gray-400 font-bold">vs</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {selectedMatch.equipo_visitante_nombre}
                      </span>
                      <TeamLogo
                        logo={selectedMatch.equipo_visitante_logo}
                        name={selectedMatch.equipo_visitante_nombre}
                        size="sm"
                      />
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-400">
                    {new Date(selectedMatch.fecha).toLocaleString('en-US')}
                  </div>
                </div>

                {/* Bet error */}
                {betError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl">
                    <p className="text-red-200 text-sm">{betError}</p>
                  </div>
                )}

                {/* Score inputs */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('rooms:bets.scorePrediction')}
                  </label>
                  {selectedMatch.is_knockout && (
                    <p className="text-xs text-yellow-400 mb-3">
                      Include goals from regular time + extra time — not penalties.
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-2 text-center">
                        {selectedMatch.equipo_local_nombre}
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="20"
                        value={betForm.prediccion_local}
                        onChange={(e) =>
                          setBetForm({ ...betForm, prediccion_local: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <span className="text-3xl font-bold text-gray-500">-</span>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-2 text-center">
                        {selectedMatch.equipo_visitante_nombre}
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="20"
                        value={betForm.prediccion_visitante}
                        onChange={(e) =>
                          setBetForm({ ...betForm, prediccion_visitante: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Knockout info panel (shown when both scores are filled) ── */}
                {selectedMatch.is_knockout && bothFilled && (
                  <div className="mb-5 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 space-y-3">
                    <p className="text-yellow-400 font-bold text-sm">⚡ Knockout round</p>

                    {/* Extra time row */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Extra time?</span>
                      {isDrawPrediction ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-semibold">
                          Yes (draw)
                        </span>
                      ) : (
                        <YesNoToggle value={tieneET} onChange={setTieneET} />
                      )}
                    </div>

                    {/* Penalties row — only for draws */}
                    {isDrawPrediction && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Penalties?</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-semibold">
                          Yes (draw)
                        </span>
                      </div>
                    )}

                    {/* Hint */}
                    {isDrawPrediction && (
                      <p className="text-xs text-yellow-300">
                        Next: pick who wins the penalty shootout →
                      </p>
                    )}
                  </div>
                )}

                {/* Feel Lucky */}
                <div className="flex justify-center mb-4">
                  <button
                    onClick={handleFeelLucky}
                    disabled={submitting}
                    className="text-sm text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/10 hover:border-yellow-400/40 hover:bg-yellow-400/5"
                  >
                    {t('rooms:bets.feelLucky')}
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitBet()}
                    disabled={submitting}
                    className="btn-primary flex-1"
                  >
                    {submitLabel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBets;
