import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { FiUsers, FiCopy, FiTrendingUp, FiClock, FiTarget, FiBell, FiCalendar, FiAward, FiAlertCircle, FiMail, FiSend } from 'react-icons/fi';
import { GiSoccerBall, GiTrophy } from 'react-icons/gi';
import { API_BASE_URL } from '../config/api';

interface RoomDashboardProps {
  roomId: number;
  roomCode: string;
  createdAt: string;
  memberCount: number;
  maxMembers: number;
  onCopyCode: () => void;
  isAdmin?: boolean;
}

interface Match {
  id_partido: number;
  equipo_local_nombre: string;
  equipo_local_logo: string;
  equipo_visitante_nombre: string;
  equipo_visitante_logo: string;
  fecha: string;
  liga_nombre: string;
  goles_local?: number;
  goles_visitante?: number;
  estado: string;
}

interface RankingUser {
  posicion: number;
  usuario: {
    id_usuario: number;
    nombre_usuario: string;
    foto_perfil?: string;
  };
  puntos: number;
  total_apuestas: number;
  apuestas_ganadas: number;
}

interface Notification {
  id: number;
  tipo: string;
  mensaje: string;
  fecha: string;
  icono: string;
  color: string;
}

const RoomDashboard: React.FC<RoomDashboardProps> = ({
  roomId,
  roomCode,
  createdAt,
  memberCount,
  maxMembers,
  onCopyCode,
  isAdmin = false,
}) => {
  const { t } = useTranslation(['rooms', 'common']);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [lastResult, setLastResult] = useState<Match | null>(null);
  const [leader, setLeader] = useState<RankingUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [inviteError, setInviteError] = useState('');

  const handleInvite = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setInviteError(t('rooms:invite.invalidEmail'));
      return;
    }
    setInviteStatus('sending');
    setInviteError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/salas/${roomId}/invite/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteStatus('success');
        setInviteEmail('');
        setTimeout(() => setInviteStatus('idle'), 3000);
      } else {
        setInviteError(data.error || t('rooms:invite.error'));
        setInviteStatus('error');
      }
    } catch {
      setInviteError(t('rooms:invite.error'));
      setInviteStatus('error');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [roomId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Token ${token}` };

      // Cargar próximos 3 partidos
      const matchesRes = await fetch(`${API_BASE_URL}/api/partidos/proximos/?sala_id=${roomId}`, { headers });
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setUpcomingMatches(matchesData.slice(0, 3));
      }

      // Cargar último resultado (partidos finalizados)
      const finishedRes = await fetch(`${API_BASE_URL}/api/partidos/?sala_id=${roomId}&estado=finalizado`, { headers });
      if (finishedRes.ok) {
        const finishedData = await finishedRes.json();
        if (finishedData.length > 0) {
          // Ordenar por fecha descendente y tomar el más reciente
          const sorted = finishedData.sort((a: Match, b: Match) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
          setLastResult(sorted[0]);
        }
      }

      // Cargar líder de la sala (ranking)
      const rankingRes = await fetch(`${API_BASE_URL}/api/rankings/actual/?sala_id=${roomId}`, { headers });
      if (rankingRes.ok) {
        const rankingData = await rankingRes.json();
        if (rankingData.ranking && rankingData.ranking.length > 0) {
          setLeader(rankingData.ranking[0]);
        }
      }

      // Cargar notificaciones
      const notifRes = await fetch(`${API_BASE_URL}/api/sala-notificaciones/?sala_id=${roomId}`, { headers });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.slice(0, 5)); // Últimas 5 notificaciones
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('rooms:dashboard.today');
    if (diffDays === 1) return t('rooms:dashboard.tomorrow');
    if (diffDays < 7) return `In ${diffDays} days`;

    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Columna Principal - 2/3 */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header Compacto con Info Básica */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-lg border border-white/5">
          <div className="flex flex-wrap items-center gap-4">
            {/* Miembros */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <FiUsers className="text-xl text-green-500" />
              <div>
                <p className="text-xs text-gray-400">{t('rooms:dashboard.members')}</p>
                <p className="text-lg font-bold">{memberCount}/{maxMembers}</p>
              </div>
            </div>

            {/* Código de Sala */}
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-gray-400 mb-1">{t('rooms:dashboard.roomCode')}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm font-mono font-bold text-green-400 text-center tracking-wider">
                    {roomCode}
                  </p>
                </div>
                <button
                  onClick={onCopyCode}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-colors"
                  title={t('rooms:dashboard.copyCodeTitle')}
                >
                  <FiCopy className="text-sm text-green-400" />
                </button>
              </div>
            </div>

            {/* Fecha de Creación - Muy Compacta */}
            <div className="flex items-center gap-2">
              <FiCalendar className="text-sm text-gray-500" />
              <p className="text-xs text-gray-500">
                {new Date(createdAt).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Invite Member (admin only) */}
        {isAdmin && (
          <div className="rounded-2xl p-4 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-lg border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <FiMail className="text-lg text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-300">{t('rooms:invite.title')}</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={e => { setInviteEmail(e.target.value); setInviteStatus('idle'); setInviteError(''); }}
                placeholder={t('rooms:invite.emailPlaceholder')}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
              />
              <button
                onClick={handleInvite}
                disabled={inviteStatus === 'sending'}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              >
                <FiSend className="text-sm" />
                {inviteStatus === 'sending' ? t('rooms:invite.sending') : t('rooms:invite.button')}
              </button>
            </div>
            {inviteStatus === 'success' && (
              <p className="mt-2 text-xs text-green-400">{t('rooms:invite.success')}</p>
            )}
            {inviteStatus === 'error' && inviteError && (
              <p className="mt-2 text-xs text-red-400">{inviteError}</p>
            )}
          </div>
        )}

        {/* Avisos Importantes */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-lg border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="text-xl text-yellow-500" />
            <h3 className="text-lg font-bold">{t('rooms:dashboard.notices')}</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiAlertCircle className="text-3xl mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('rooms:dashboard.noNotices')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5"
                >
                  <div className={`text-2xl ${notif.color}`}>
                    {notif.icono}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200">{notif.mensaje}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.fecha).toLocaleString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximos 3 Partidos */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-lg border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <FiClock className="text-xl text-blue-500" />
            <h3 className="text-lg font-bold">{t('rooms:dashboard.upcomingMatches')}</h3>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <GiSoccerBall className="text-3xl mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('rooms:dashboard.noUpcomingMatches')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <div
                  key={match.id_partido}
                  className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-400">
                      {formatDate(match.fecha)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(match.fecha)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center">
                    {/* Equipo Local */}
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm font-semibold text-right truncate">
                        {match.equipo_local_nombre}
                      </span>
                      {match.equipo_local_logo && (
                        <img
                          src={match.equipo_local_logo}
                          alt=""
                          className="w-8 h-8 object-contain flex-shrink-0"
                        />
                      )}
                    </div>

                    {/* VS */}
                    <div className="text-center">
                      <span className="text-xs text-gray-500 font-bold">VS</span>
                    </div>

                    {/* Equipo Visitante */}
                    <div className="flex items-center gap-2">
                      {match.equipo_visitante_logo && (
                        <img
                          src={match.equipo_visitante_logo}
                          alt=""
                          className="w-8 h-8 object-contain flex-shrink-0"
                        />
                      )}
                      <span className="text-sm font-semibold truncate">
                        {match.equipo_visitante_nombre}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {match.liga_nombre}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Último Resultado */}
        {lastResult && (
          <div className="rounded-2xl p-5 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-lg border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <FiTarget className="text-xl text-purple-500" />
              <h3 className="text-lg font-bold">{t('rooms:dashboard.lastResult')}</h3>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Equipo Local */}
                <div className="flex flex-col items-center gap-2">
                  {lastResult.equipo_local_logo && (
                    <img
                      src={lastResult.equipo_local_logo}
                      alt=""
                      className="w-12 h-12 object-contain"
                    />
                  )}
                  <span className="text-sm font-semibold text-center">
                    {lastResult.equipo_local_nombre}
                  </span>
                </div>

                {/* Marcador */}
                <div className="text-center">
                  <div className="text-3xl font-bold flex items-center justify-center gap-3">
                    <span className={lastResult.goles_local! > lastResult.goles_visitante! ? 'text-green-400' : 'text-gray-400'}>
                      {lastResult.goles_local ?? 0}
                    </span>
                    <span className="text-gray-600">-</span>
                    <span className={lastResult.goles_visitante! > lastResult.goles_local! ? 'text-green-400' : 'text-gray-400'}>
                      {lastResult.goles_visitante ?? 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(lastResult.fecha).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </p>
                </div>

                {/* Equipo Visitante */}
                <div className="flex flex-col items-center gap-2">
                  {lastResult.equipo_visitante_logo && (
                    <img
                      src={lastResult.equipo_visitante_logo}
                      alt=""
                      className="w-12 h-12 object-contain"
                    />
                  )}
                  <span className="text-sm font-semibold text-center">
                    {lastResult.equipo_visitante_nombre}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                {lastResult.liga_nombre}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Columna Lateral - 1/3 */}
      <div className="lg:col-span-1 space-y-4">
        {/* Líder de la Sala */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-yellow-900/20 to-[#141518] shadow-lg border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-4">
            <GiTrophy className="text-xl text-yellow-500" />
            <h3 className="text-lg font-bold">{t('rooms:dashboard.roomLeader')}</h3>
          </div>

          {!leader ? (
            <div className="text-center py-8 text-gray-400">
              <FiAward className="text-3xl mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('rooms:dashboard.noBetsYet')}</p>
            </div>
          ) : (
            <div className="text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-3">
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-[#141518] z-10">
                  <span className="text-sm">👑</span>
                </div>
                {leader.usuario.foto_perfil ? (
                  <img
                    src={leader.usuario.foto_perfil}
                    alt={leader.usuario.nombre_usuario}
                    className="w-20 h-20 rounded-full object-cover border-4 border-yellow-500/50"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-yellow-600 flex items-center justify-center border-4 border-yellow-500/50">
                    <span className="text-3xl font-bold">
                      {leader.usuario.nombre_usuario.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Nombre */}
              <h4 className="text-xl font-bold mb-1">
                {leader.usuario.nombre_usuario}
              </h4>

              {/* Puntos */}
              <div className="inline-block px-4 py-2 bg-yellow-500/20 rounded-xl border border-yellow-500/30 mb-3">
                <p className="text-2xl font-bold text-yellow-500">
                  {leader.puntos} pts
                </p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-400">{t('rooms:dashboard.bets')}</p>
                  <p className="text-lg font-bold">{leader.total_apuestas}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-400">Won</p>
                  <p className="text-lg font-bold text-green-400">{leader.apuestas_ganadas}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-lg border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-xl text-green-500" />
            <h3 className="text-lg font-bold">{t('rooms:dashboard.stats')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400">{t('rooms:dashboard.upcomingMatches')}</span>
              <span className="text-lg font-bold">{upcomingMatches.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400">{t('rooms:dashboard.participants')}</span>
              <span className="text-lg font-bold">{memberCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDashboard;
