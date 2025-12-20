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

      {/* Top 3 Podium - Más Compacto */}
      {rankingData.ranking.length > 0 && (
        <div className="rounded-2xl p-4 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
          <h3 className="text-base font-bold mb-3">🏆 Top 3</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {rankingData.ranking.slice(0, 3).map((user) => {
              const userName = user.usuario.nombre_usuario || 'Usuario';
              const initial = userName.charAt(0).toUpperCase();

              return (
                <div
                  key={user.usuario.id_usuario}
                  className={`relative rounded-xl p-4 ${
                    user.posicion === 1
                      ? 'bg-gradient-to-br from-yellow-600/30 to-yellow-900/30 border border-yellow-500/50'
                      : user.posicion === 2
                      ? 'bg-gradient-to-br from-gray-600/30 to-gray-900/30 border border-gray-400/50'
                      : 'bg-gradient-to-br from-orange-600/30 to-orange-900/30 border border-orange-500/50'
                  }`}
                >
                  {/* Position Badge */}
                  <div className="absolute -top-2 -right-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      user.posicion === 1
                        ? 'bg-yellow-500'
                        : user.posicion === 2
                        ? 'bg-gray-400'
                        : 'bg-orange-500'
                    }`}>
                      #{user.posicion}
                    </div>
                  </div>

                  {/* User Avatar */}
                  <div className="flex flex-col items-center mb-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
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
                        <span className="text-white text-xl font-bold">{initial}</span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-center truncate w-full px-2">{userName}</h4>
                  </div>

                  {/* Stats */}
                  <div className="space-y-1 text-center">
                    <div>
                      <p className="text-gray-400 text-xs">Puntos</p>
                      <p className="text-2xl font-bold text-green-400">{user.puntos}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div>
                        <p className="text-gray-400">Apuestas</p>
                        <p className="font-semibold">{user.total_apuestas}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Efectividad</p>
                        <p className={`font-semibold ${getEffectivenessColor(user.efectividad)}`}>
                          {user.efectividad.toFixed(0)}%
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
      <div className="rounded-3xl p-4 md:p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
        <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-blue-500" />
          Clasificación Completa
        </h3>

        {rankingData.ranking.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay datos de ranking</p>
        ) : (
          <div className="space-y-2">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-2 lg:gap-4 px-2 lg:px-4 py-2 text-xs font-semibold text-gray-400 border-b border-white/10">
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
                <div key={user.usuario.id_usuario}>
                  {/* Desktop View */}
                  <div
                    className={`hidden md:grid grid-cols-12 gap-2 lg:gap-4 px-2 lg:px-4 py-3 rounded-xl hover:bg-white/5 transition-colors ${
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
                        <span className="text-gray-400 font-semibold text-sm">#{user.posicion}</span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="col-span-4 flex items-center gap-2 lg:gap-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                        {user.usuario.foto_perfil ? (
                          <img
                            src={user.usuario.foto_perfil}
                            alt={userName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">{initial}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-sm">{userName}</p>
                        {(user.usuario.nombre || user.usuario.apellido) && (
                          <p className="text-xs text-gray-400 truncate hidden lg:block">
                            {user.usuario.nombre} {user.usuario.apellido}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-base lg:text-lg font-bold text-green-400">{user.puntos}</span>
                    </div>

                    {/* Total Bets */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="font-semibold text-sm">{user.total_apuestas}</span>
                    </div>

                    {/* Won */}
                    <div className="col-span-1 flex items-center justify-center">
                      <span className="text-green-400 font-semibold text-sm">{user.apuestas_ganadas}</span>
                    </div>

                    {/* Lost */}
                    <div className="col-span-1 flex items-center justify-center">
                      <span className="text-red-400 font-semibold text-sm">{user.apuestas_perdidas}</span>
                    </div>

                    {/* Effectiveness */}
                    <div className="col-span-1 flex items-center justify-center">
                      <span className={`font-semibold text-sm ${getEffectivenessColor(user.efectividad)}`}>
                        {user.efectividad.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Mobile View - Card Layout */}
                  <div
                    className={`md:hidden rounded-xl p-3 ${
                      user.posicion <= 3 ? 'bg-white/5 border border-white/10' : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      {/* Position and User */}
                      <div className="flex items-center gap-3">
                        {user.posicion <= 3 ? (
                          <div className="flex items-center justify-center w-6">
                            <FiAward className={`text-lg ${getMedalColor(user.posicion)}`} />
                          </div>
                        ) : (
                          <span className="text-gray-400 font-semibold text-sm w-6">#{user.posicion}</span>
                        )}
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                          {user.usuario.foto_perfil ? (
                            <img
                              src={user.usuario.foto_perfil}
                              alt={userName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">{initial}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{userName}</p>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Puntos</p>
                        <p className="text-xl font-bold text-green-400">{user.puntos}</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <p className="text-gray-400">Total</p>
                        <p className="font-semibold">{user.total_apuestas}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Ganadas</p>
                        <p className="font-semibold text-green-400">{user.apuestas_ganadas}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Perdidas</p>
                        <p className="font-semibold text-red-400">{user.apuestas_perdidas}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Efectividad</p>
                        <p className={`font-semibold ${getEffectivenessColor(user.efectividad)}`}>
                          {user.efectividad.toFixed(0)}%
                        </p>
                      </div>
                    </div>
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
