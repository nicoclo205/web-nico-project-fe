import React, { useEffect, useState } from 'react';
import { FiUsers, FiCopy, FiTrendingUp, FiClock, FiTarget, FiBell, FiCalendar, FiAward, FiAlertCircle } from 'react-icons/fi';
import { GiSoccerBall, GiTrophy } from 'react-icons/gi';

interface RoomDashboardProps {
  roomId: number;
  roomCode: string;
  createdAt: string;
  memberCount: number;
  maxMembers: number;
  onCopyCode: () => void;
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
}) => {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [lastResult, setLastResult] = useState<Match | null>(null);
  const [leader, setLeader] = useState<RankingUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [roomId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Token ${token}` };

      // Cargar próximos 3 partidos
      const matchesRes = await fetch(`http://localhost:8000/api/partidos/proximos/?sala_id=${roomId}`, { headers });
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setUpcomingMatches(matchesData.slice(0, 3));
      }

      // Cargar último resultado (partidos finalizados)
      const finishedRes = await fetch(`http://localhost:8000/api/partidos/?sala_id=${roomId}&estado=finalizado`, { headers });
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
      const rankingRes = await fetch(`http://localhost:8000/api/rankings/actual/?sala_id=${roomId}`, { headers });
      if (rankingRes.ok) {
        const rankingData = await rankingRes.json();
        if (rankingData.ranking && rankingData.ranking.length > 0) {
          setLeader(rankingData.ranking[0]);
        }
      }

      // Cargar notificaciones
      const notifRes = await fetch(`http://localhost:8000/api/sala-notificaciones/?sala_id=${roomId}`, { headers });
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

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays < 7) return `En ${diffDays} días`;

    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
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
                <p className="text-xs text-gray-400">Miembros</p>
                <p className="text-lg font-bold">{memberCount}/{maxMembers}</p>
              </div>
            </div>

            {/* Código de Sala */}
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-gray-400 mb-1">Código de Sala</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm font-mono font-bold text-green-400 text-center tracking-wider">
                    {roomCode}
                  </p>
                </div>
                <button
                  onClick={onCopyCode}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-colors"
                  title="Copiar código"
                >
                  <FiCopy className="text-sm text-green-400" />
                </button>
              </div>
            </div>

            {/* Fecha de Creación - Muy Compacta */}
            <div className="flex items-center gap-2">
              <FiCalendar className="text-sm text-gray-500" />
              <p className="text-xs text-gray-500">
                {new Date(createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Avisos Importantes */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-lg border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="text-xl text-yellow-500" />
            <h3 className="text-lg font-bold">Avisos Importantes</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiAlertCircle className="text-3xl mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay avisos recientes</p>
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
                      {new Date(notif.fecha).toLocaleString('es-ES', {
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
            <h3 className="text-lg font-bold">Próximos Partidos</h3>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <GiSoccerBall className="text-3xl mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay partidos próximos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match, index) => (
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
              <h3 className="text-lg font-bold">Último Resultado</h3>
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
                    {new Date(lastResult.fecha).toLocaleDateString('es-ES', {
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
            <h3 className="text-lg font-bold">Líder de la Sala</h3>
          </div>

          {!leader ? (
            <div className="text-center py-8 text-gray-400">
              <FiAward className="text-3xl mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay apuestas aún</p>
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
                  <p className="text-xs text-gray-400">Apuestas</p>
                  <p className="text-lg font-bold">{leader.total_apuestas}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-400">Ganadas</p>
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
            <h3 className="text-lg font-bold">Estadísticas</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400">Total Partidos</span>
              <span className="text-lg font-bold">{upcomingMatches.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-sm text-gray-400">Participantes</span>
              <span className="text-lg font-bold">{memberCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDashboard;
