import React, { useEffect } from 'react';
import { FiAward, FiTrendingUp, FiTarget, FiPercent, FiRefreshCw } from 'react-icons/fi';
import { useRanking } from '../hooks/useRanking';

interface RoomRankingProps {
  roomId: number;
}

const RoomRanking: React.FC<RoomRankingProps> = ({ roomId }) => {
  const { rankingData, loading, error, fetchRoomRanking, refreshRanking } = useRanking();

  useEffect(() => {
    fetchRoomRanking(roomId);
  }, [roomId, fetchRoomRanking]);

  const handleRefresh = () => {
    refreshRanking(roomId);
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-300';
      case 3:
        return 'text-orange-400';
      default:
        return 'text-gray-500';
    }
  };

  const getMedalIcon = (position: number) => {
    if (position <= 3) {
      return <FiAward className={`text-2xl ${getMedalColor(position)}`} />;
    }
    return <span className="text-xl font-bold text-gray-500">#{position}</span>;
  };

  const getEffectivenessColor = (efectividad: number) => {
    if (efectividad >= 70) return 'text-green-400';
    if (efectividad >= 50) return 'text-yellow-400';
    if (efectividad >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading && !rankingData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-500 rounded-xl">
        <p className="text-red-200 text-sm">{error}</p>
      </div>
    );
  }

  if (!rankingData) {
    return (
      <div className="text-center text-gray-400 py-8">
        No hay datos de ranking disponibles
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FiAward className="text-yellow-500" />
            Ranking
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {rankingData.total_participantes} participante{rankingData.total_participantes !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-secondary btn-icon"
          title="Actualizar ranking"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Top 3 Podium */}
      {rankingData.ranking.length > 0 && (
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
          <h3 className="text-lg font-bold mb-4">🏆 Top 3</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rankingData.ranking.slice(0, 3).map((user) => {
              const userName = user.usuario.nombre_usuario || 'Usuario';
              const initial = userName.charAt(0).toUpperCase();

              return (
                <div
                  key={user.usuario.id_usuario}
                  className={`relative rounded-2xl p-6 ${
                    user.posicion === 1
                      ? 'bg-gradient-to-br from-yellow-600/30 to-yellow-900/30 border-2 border-yellow-500/50'
                      : user.posicion === 2
                      ? 'bg-gradient-to-br from-gray-600/30 to-gray-900/30 border-2 border-gray-400/50'
                      : 'bg-gradient-to-br from-orange-600/30 to-orange-900/30 border-2 border-orange-500/50'
                  }`}
                >
                  {/* Position Badge */}
                  <div className="absolute -top-3 -right-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      user.posicion === 1
                        ? 'bg-yellow-500'
                        : user.posicion === 2
                        ? 'bg-gray-400'
                        : 'bg-orange-500'
                    }`}>
                      <span className="text-white font-bold text-lg">#{user.posicion}</span>
                    </div>
                  </div>

                  {/* User Avatar */}
                  <div className="flex flex-col items-center mb-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
                      user.posicion === 1
                        ? 'bg-yellow-500'
                        : user.posicion === 2
                        ? 'bg-gray-400'
                        : 'bg-orange-500'
                    }`}>
                      {user.usuario.foto_perfil ? (
                        <img
                          src={user.usuario.foto_perfil}
                          alt={userName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-3xl font-bold">{initial}</span>
                      )}
                    </div>
                    <h4 className="font-bold text-lg text-center">{userName}</h4>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 text-center">
                    <div>
                      <p className="text-gray-400 text-xs">Puntos</p>
                      <p className="text-3xl font-bold text-green-400">{user.puntos}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400">Apuestas</p>
                        <p className="font-semibold">{user.total_apuestas}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Efectividad</p>
                        <p className={`font-semibold ${getEffectivenessColor(user.efectividad)}`}>
                          {user.efectividad.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Ranking Table */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-blue-500" />
          Clasificación Completa
        </h3>

        {rankingData.ranking.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay datos de ranking</p>
        ) : (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-gray-400 border-b border-white/10">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Usuario</div>
              <div className="col-span-2 text-center">Puntos</div>
              <div className="col-span-2 text-center">Apuestas</div>
              <div className="col-span-1 text-center">G</div>
              <div className="col-span-1 text-center">P</div>
              <div className="col-span-1 text-center">%</div>
            </div>

            {/* Ranking Rows */}
            {rankingData.ranking.map((user) => {
              const userName = user.usuario.nombre_usuario || 'Usuario';
              const initial = userName.charAt(0).toUpperCase();

              return (
                <div
                  key={user.usuario.id_usuario}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors ${
                    user.posicion <= 3 ? 'bg-white/5' : ''
                  }`}
                >
                  {/* Position */}
                  <div className="col-span-1 flex items-center">
                    {user.posicion <= 3 ? (
                      <div className="flex items-center justify-center">
                        {getMedalIcon(user.posicion)}
                      </div>
                    ) : (
                      <span className="text-gray-400 font-semibold">#{user.posicion}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      {user.usuario.foto_perfil ? (
                        <img
                          src={user.usuario.foto_perfil}
                          alt={userName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">{initial}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{userName}</p>
                      {(user.usuario.nombre || user.usuario.apellido) && (
                        <p className="text-xs text-gray-400 truncate">
                          {user.usuario.nombre} {user.usuario.apellido}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="text-lg font-bold text-green-400">{user.puntos}</span>
                  </div>

                  {/* Total Bets */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="font-semibold">{user.total_apuestas}</span>
                  </div>

                  {/* Won */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-green-400 font-semibold">{user.apuestas_ganadas}</span>
                  </div>

                  {/* Lost */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-red-400 font-semibold">{user.apuestas_perdidas}</span>
                  </div>

                  {/* Effectiveness */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className={`font-semibold ${getEffectivenessColor(user.efectividad)}`}>
                      {user.efectividad.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Legend */}
      <div className="rounded-3xl p-4 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <FiTarget className="text-green-500" />
            <span className="text-gray-400">G = Ganadas</span>
          </div>
          <div className="flex items-center gap-2">
            <FiTarget className="text-red-500" />
            <span className="text-gray-400">P = Perdidas</span>
          </div>
          <div className="flex items-center gap-2">
            <FiPercent className="text-blue-500" />
            <span className="text-gray-400">% = Efectividad</span>
          </div>
          <div className="flex items-center gap-2">
            <FiAward className="text-yellow-500" />
            <span className="text-gray-400">Top 3 destacados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomRanking;
