import { useState, useCallback } from 'react';
import { apiService, ApiResponse } from '../services/apiService';

export interface RankingUser {
  posicion: number;
  usuario: {
    id_usuario: number;
    nombre_usuario: string;
    nombre?: string;
    apellido?: string;
    foto_perfil?: string;
  };
  puntos: number;
  total_apuestas: number;
  apuestas_ganadas: number;
  apuestas_perdidas: number;
  efectividad: number;
}

export interface RankingData {
  sala: {
    id_sala: number;
    nombre: string;
    descripcion?: string;
  };
  ranking: RankingUser[];
  total_participantes: number;
}

export const useRanking = () => {
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current ranking for a room
  const fetchRoomRanking = useCallback(async (salaId: number): Promise<ApiResponse<RankingData>> => {
    setLoading(true);
    setError(null);

    const result = await apiService.getRoomRanking(salaId);

    if (result.success && result.data) {
      setRankingData(result.data);
    } else {
      setError(result.error || 'Failed to fetch ranking');
      setRankingData(null);
    }

    setLoading(false);
    return result;
  }, []);

  // Fetch ranking by period
  const fetchRankingByPeriod = useCallback(async (salaId: number, periodo?: string) => {
    setLoading(true);
    setError(null);

    const result = await apiService.getRankingByPeriod(salaId, periodo);

    setLoading(false);
    return result;
  }, []);

  // Refresh ranking data
  const refreshRanking = useCallback(async (salaId: number) => {
    return await fetchRoomRanking(salaId);
  }, [fetchRoomRanking]);

  return {
    rankingData,
    loading,
    error,
    fetchRoomRanking,
    fetchRankingByPeriod,
    refreshRanking,
  };
};
