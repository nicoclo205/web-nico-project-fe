import React, { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';

interface RoomConfigurationProps {
  roomId: number;
}

interface Liga {
  id_liga: number;
  nombre: string;
  id_pais?: { nombre: string };
  logo_url?: string;
  id_deporte?: { nombre: string };
}

interface SalaLiga {
  id_sala_liga: number;
  id_liga: number;
  liga_nombre: string;
  liga_pais: string;
  liga_logo: string;
  deporte_nombre: string;
}

interface Partido {
  id_partido: number;
  equipo_local_nombre: string;
  equipo_visitante_nombre: string;
  fecha: string;
  liga_nombre: string;
}

interface SalaPartido {
  id_sala_partido: number;
  id_partido: number;
  partido_info: string;
  equipo_local: string;
  equipo_visitante: string;
  fecha_partido: string;
  liga_nombre: string;
}

const RoomConfiguration: React.FC<RoomConfigurationProps> = ({ roomId }) => {
  const [activatedLeagues, setActivatedLeagues] = useState<SalaLiga[]>([]);
  const [activatedMatches, setActivatedMatches] = useState<SalaPartido[]>([]);
  const [availableLeagues, setAvailableLeagues] = useState<Liga[]>([]);
  const [availableMatches, setAvailableMatches] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadActivatedConfig();
  }, [roomId]);

  const loadActivatedConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Token ${token}` };

      // Load activated leagues
      const leaguesRes = await fetch(`http://localhost:8000/api/sala-ligas/?sala_id=${roomId}`, { headers });
      if (leaguesRes.ok) {
        const leaguesData = await leaguesRes.json();
        setActivatedLeagues(leaguesData);
      }

      // Load activated matches
      const matchesRes = await fetch(`http://localhost:8000/api/sala-partidos/?sala_id=${roomId}`, { headers });
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setActivatedMatches(matchesData);
      }
    } catch (err: any) {
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableLeagues = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Token ${token}` };

      const res = await fetch(`http://localhost:8000/api/sala-ligas/disponibles/?sala_id=${roomId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAvailableLeagues(data);
      }
    } catch (err) {
      console.error('Error loading available leagues:', err);
    }
  };

  const loadAvailableMatches = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Token ${token}` };

      const res = await fetch(`http://localhost:8000/api/sala-partidos/disponibles/?sala_id=${roomId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAvailableMatches(data);
      }
    } catch (err) {
      console.error('Error loading available matches:', err);
    }
  };

  const handleAddLeague = async (ligaId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8000/api/sala-ligas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          id_sala: roomId,
          id_liga: ligaId,
        }),
      });

      if (res.ok) {
        loadActivatedConfig();
        loadAvailableLeagues();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error al agregar liga');
      }
    } catch (err) {
      alert('Error al agregar liga');
    }
  };

  const handleRemoveLeague = async (salaLigaId: number) => {
    if (!window.confirm('¿Eliminar esta liga de la sala?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8000/api/sala-ligas/${salaLigaId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${token}` },
      });

      if (res.ok) {
        loadActivatedConfig();
      } else {
        alert('Error al eliminar liga');
      }
    } catch (err) {
      alert('Error al eliminar liga');
    }
  };

  const handleAddMatch = async (partidoId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:8000/api/sala-partidos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          id_sala: roomId,
          id_partido: partidoId,
        }),
      });

      if (res.ok) {
        loadActivatedConfig();
        loadAvailableMatches();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error al agregar partido');
      }
    } catch (err) {
      alert('Error al agregar partido');
    }
  };

  const handleRemoveMatch = async (salaPartidoId: number) => {
    if (!window.confirm('¿Eliminar este partido de la sala?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8000/api/sala-partidos/${salaPartidoId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${token}` },
      });

      if (res.ok) {
        loadActivatedConfig();
      } else {
        alert('Error al eliminar partido');
      }
    } catch (err) {
      alert('Error al eliminar partido');
    }
  };

  const filteredLeagues = availableLeagues.filter(league =>
    league.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMatches = availableMatches.filter(match =>
    `${match.equipo_local_nombre} vs ${match.equipo_visitante_nombre}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && activatedLeagues.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Configuración de Apuestas</h2>
          <p className="text-gray-400 text-sm mt-1">
            Selecciona las ligas/torneos o partidos individuales que estarán disponibles para apostar
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-xl flex items-center gap-3">
          <FiAlertCircle className="text-red-400 text-xl" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Activated Leagues Section */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <GiSoccerBall className="text-green-500" />
            Ligas/Torneos Habilitados
          </h3>
          <button
            onClick={() => {
              loadAvailableLeagues();
              setSearchTerm('');
              setShowLeagueModal(true);
            }}
            className="btn-primary btn-icon"
          >
            <FiPlus /> Agregar Liga
          </button>
        </div>

        {activatedLeagues.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No hay ligas configuradas. Los usuarios podrán apostar en todos los partidos disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activatedLeagues.map((liga) => (
              <div
                key={liga.id_sala_liga}
                className="p-4 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {liga.liga_logo && (
                    <img src={liga.liga_logo} alt={liga.liga_nombre} className="w-8 h-8 rounded" />
                  )}
                  <div>
                    <p className="font-semibold">{liga.liga_nombre}</p>
                    <p className="text-xs text-gray-400">
                      {liga.liga_pais} • {liga.deporte_nombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveLeague(liga.id_sala_liga)}
                  className="btn-danger btn-icon text-sm"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activated Individual Matches Section */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-[#1f2126] to-[#141518] shadow-xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiCheck className="text-blue-500" />
            Partidos Individuales Habilitados
          </h3>
          <button
            onClick={() => {
              loadAvailableMatches();
              setSearchTerm('');
              setShowMatchModal(true);
            }}
            className="btn-info btn-icon"
          >
            <FiPlus /> Agregar Partido
          </button>
        </div>

        {activatedMatches.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No hay partidos individuales agregados manualmente
          </p>
        ) : (
          <div className="space-y-3">
            {activatedMatches.map((partido) => (
              <div
                key={partido.id_sala_partido}
                className="p-4 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div>
                  <p className="font-semibold">
                    {partido.equipo_local} vs {partido.equipo_visitante}
                  </p>
                  <p className="text-xs text-gray-400">
                    {partido.liga_nombre} • {new Date(partido.fecha_partido).toLocaleString('es-ES')}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveMatch(partido.id_sala_partido)}
                  className="btn-danger btn-icon text-sm"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add League Modal */}
      {showLeagueModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowLeagueModal(false)}>
          <div className="bg-[#1f2126] rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Agregar Liga/Torneo</h3>
              <button onClick={() => setShowLeagueModal(false)} className="btn-secondary btn-icon">
                <FiX />
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar liga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="space-y-2">
              {filteredLeagues.map((liga) => (
                <div
                  key={liga.id_liga}
                  className="p-3 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {liga.logo_url && (
                      <img src={liga.logo_url} alt={liga.nombre} className="w-8 h-8 rounded" />
                    )}
                    <div>
                      <p className="font-semibold text-sm">{liga.nombre}</p>
                      <p className="text-xs text-gray-400">
                        {liga.id_pais?.nombre} • {liga.id_deporte?.nombre}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleAddLeague(liga.id_liga);
                      setShowLeagueModal(false);
                    }}
                    className="btn-primary btn-icon text-sm"
                  >
                    <FiPlus />
                  </button>
                </div>
              ))}

              {filteredLeagues.length === 0 && (
                <p className="text-center text-gray-400 py-8">No hay ligas disponibles</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowMatchModal(false)}>
          <div className="bg-[#1f2126] rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Agregar Partido Individual</h3>
              <button onClick={() => setShowMatchModal(false)} className="btn-secondary btn-icon">
                <FiX />
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar partido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="space-y-2">
              {filteredMatches.map((partido) => (
                <div
                  key={partido.id_partido}
                  className="p-3 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {partido.equipo_local_nombre} vs {partido.equipo_visitante_nombre}
                    </p>
                    <p className="text-xs text-gray-400">
                      {partido.liga_nombre} • {new Date(partido.fecha).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleAddMatch(partido.id_partido);
                      setShowMatchModal(false);
                    }}
                    className="btn-primary btn-icon text-sm"
                  >
                    <FiPlus />
                  </button>
                </div>
              ))}

              {filteredMatches.length === 0 && (
                <p className="text-center text-gray-400 py-8">No hay partidos disponibles</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomConfiguration;
