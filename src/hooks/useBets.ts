import { useState, useCallback } from 'react';
import { apiService, ApiResponse } from '../services/apiService';

export interface Bet {
  id_apuesta: number;
  id_usuario: number;
  usuario_nombre: string;
  id_partido: number;
  partido_info: string;
  id_sala: number;
  sala_nombre: string;
  prediccion_local: number;
  prediccion_visitante: number;
  primer_tiempo_local?: number;
  primer_tiempo_visitante?: number;
  fecha_apuesta: string;
  estado: 'pendiente' | 'ganada' | 'perdida' | 'cancelada';
  puntos_ganados: number;
}

export interface Match {
  id_partido: number;
  equipo_local: string;
  equipo_local_nombre: string;
  equipo_local_logo: string;
  equipo_visitante: string;
  equipo_visitante_nombre: string;
  equipo_visitante_logo: string;
  fecha: string;
  estado: string;
  goles_local?: number;
  goles_visitante?: number;
  liga_nombre: string;
  liga_logo: string;
}

export const useBets = () => {
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user bets for a specific room
  const fetchUserBets = useCallback(async (salaId: number) => {
    setLoading(true);
    setError(null);

    const result = await apiService.getUserBets(salaId);

    if (result.success && result.data) {
      setUserBets(result.data);
    } else {
      setError(result.error || 'Failed to fetch bets');
      setUserBets([]);
    }

    setLoading(false);
    return result;
  }, []);

  // Fetch upcoming matches available for betting
  const fetchUpcomingMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await apiService.getUpcomingMatches();

    if (result.success && result.data) {
      setUpcomingMatches(result.data);
    } else {
      setError(result.error || 'Failed to fetch matches');
      setUpcomingMatches([]);
    }

    setLoading(false);
    return result;
  }, []);

  // Create a new bet
  const createBet = useCallback(async (betData: {
    id_partido: number;
    id_sala: number;
    prediccion_local: number;
    prediccion_visitante: number;
    primer_tiempo_local?: number;
    primer_tiempo_visitante?: number;
  }): Promise<ApiResponse<any>> => {
    setLoading(true);
    setError(null);

    const result = await apiService.createBet(betData);

    if (!result.success) {
      setError(result.error || 'Failed to create bet');
    }

    setLoading(false);
    return result;
  }, []);

  // Get bets for a specific match in a room
  const fetchMatchBets = useCallback(async (partidoId: number, salaId: number) => {
    setLoading(true);
    setError(null);

    const result = await apiService.getMatchBets(partidoId, salaId);

    setLoading(false);
    return result;
  }, []);

  return {
    userBets,
    upcomingMatches,
    loading,
    error,
    fetchUserBets,
    fetchUpcomingMatches,
    createBet,
    fetchMatchBets,
  };
};
