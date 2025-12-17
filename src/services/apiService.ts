import { apiClient } from '../utils/languageApi';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Room interfaces
export interface Room {
  id_sala: number;
  nombre: string;
  descripcion?: string;
  max_miembros?: number;
  es_privada: boolean;
  codigo_sala: string;
  fecha_creacion: string;
  id_usuario: number;
  creador?: {
    id_usuario: number;
    nombre_usuario: string;
  };
  miembros_count?: number;
  miembros?: RoomMember[];
}

export interface RoomMember {
  id_usuario_sala: number;
  id_usuario: number;
  nombre_usuario: string;
  rol: 'admin' | 'participante';
  fecha_union: string;
}

export interface CreateRoomData {
  nombre: string;
  descripcion?: string;
  max_miembros?: number;
  es_privada?: boolean;
}

export interface UpdateRoomData {
  nombre?: string;
  descripcion?: string;
  max_miembros?: number;
  es_privada?: boolean;
}

class ApiService {
  // User authentication
  async login(username: string, password: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api-token-auth/', {
        username,
        password,
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  }

  // ========== ROOMS (SALAS) CRUD ==========

  // Get all user rooms (salas del usuario autenticado)
  async getUserRooms(): Promise<ApiResponse<Room[]>> {
    try {
      const response = await apiClient.get('/api/salas/mis_salas/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch user rooms',
      };
    }
  }

  // Get all rooms (todas las salas disponibles)
  async getAllRooms(): Promise<ApiResponse<Room[]>> {
    try {
      const response = await apiClient.get('/api/salas/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch all rooms',
      };
    }
  }

  // Get room by ID
  async getRoomById(roomId: number): Promise<ApiResponse<Room>> {
    try {
      const response = await apiClient.get(`/api/salas/${roomId}/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch room details',
      };
    }
  }

  // Create new room
  async createRoom(roomData: CreateRoomData): Promise<ApiResponse<Room>> {
    try {
      const response = await apiClient.post('/api/salas/', roomData);

      return {
        success: true,
        data: response.data,
        message: 'Room created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create room',
      };
    }
  }

  // Update room (only creator can update)
  async updateRoom(roomId: number, roomData: UpdateRoomData): Promise<ApiResponse<Room>> {
    try {
      const response = await apiClient.patch(`/api/salas/${roomId}/`, roomData);

      return {
        success: true,
        data: response.data,
        message: 'Room updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update room',
      };
    }
  }

  // Delete room (only creator can delete)
  async deleteRoom(roomId: number): Promise<ApiResponse<null>> {
    try {
      await apiClient.delete(`/api/salas/${roomId}/`);

      return {
        success: true,
        message: 'Room deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete room',
      };
    }
  }

  // Join room with code
  async joinRoom(roomId: number, codigo_sala: string): Promise<ApiResponse<Room>> {
    try {
      const response = await apiClient.post(`/api/salas/${roomId}/unirse/`, {
        codigo_sala,
      });

      return {
        success: true,
        data: response.data.sala,
        message: response.data.message || 'Successfully joined room',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to join room',
      };
    }
  }

  // Leave room
  async leaveRoom(roomId: number): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post(`/api/salas/${roomId}/salir/`);

      return {
        success: true,
        message: response.data.message || 'Successfully left room',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to leave room',
      };
    }
  }

  // Get room members
  async getRoomMembers(roomId: number): Promise<ApiResponse<RoomMember[]>> {
    try {
      const response = await apiClient.get(`/api/salas/${roomId}/miembros/`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch room members',
      };
    }
  }

  // Get sports matches with language support
  async getSportsMatches(sport?: string): Promise<ApiResponse<any[]>> {
    try {
      const params = sport ? { sport } : {};
      const response = await apiClient.get('/api/partidos/', { params });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch matches',
      };
    }
  }

  // User registration
  async register(userData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/usuarios/', userData);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      };
    }
  }

  // Get user stats
  async getUserStats(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/usuarios/me/stats/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch user stats',
      };
    }
  }

  // Get leagues by sport
  async getLeaguesBySport(deporteId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/api/ligas/por_deporte/', {
        params: { deporte_id: deporteId }
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch leagues',
      };
    }
  }

  // Get matches by league
  async getMatchesByLeague(ligaId: number, temporada?: string): Promise<ApiResponse<any[]>> {
    try {
      const params: any = { liga_id: ligaId };
      if (temporada) {
        params.temporada = temporada;
      }

      const response = await apiClient.get('/api/partidos/por_liga/', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch matches by league',
      };
    }
  }

  // Get all matches (soccer)
  async getAllMatches(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/api/partidos/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch all matches',
      };
    }
  }

  // ========== APUESTAS (BETS) ==========

  // Get upcoming matches for betting (partidos disponibles para apostar)
  async getUpcomingMatches(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/api/partidos/proximos/');

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch upcoming matches',
      };
    }
  }

  // Create a bet (crear apuesta de fútbol)
  async createBet(betData: {
    id_partido: number;
    id_sala: number;
    prediccion_local: number;
    prediccion_visitante: number;
    primer_tiempo_local?: number;
    primer_tiempo_visitante?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/apuestas-futbol/', betData);

      return {
        success: true,
        data: response.data,
        message: 'Bet created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create bet',
      };
    }
  }

  // Get user bets for a room (apuestas del usuario en una sala)
  async getUserBets(salaId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/api/apuestas-futbol/mis_apuestas/', {
        params: { sala_id: salaId }
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch user bets',
      };
    }
  }

  // Get bets for a specific match (apuestas de un partido en una sala)
  async getMatchBets(partidoId: number, salaId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/api/apuestas-futbol/por_partido/', {
        params: {
          partido_id: partidoId,
          sala_id: salaId
        }
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch match bets',
      };
    }
  }

  // ========== RANKING ==========

  // Get current ranking for a room (ranking actual de una sala)
  async getRoomRanking(salaId: number): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/api/ranking/actual/', {
        params: { sala_id: salaId }
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch room ranking',
      };
    }
  }

  // Get ranking by period (ranking por período)
  async getRankingByPeriod(salaId: number, periodo?: string): Promise<ApiResponse<any[]>> {
    try {
      const params: any = { sala_id: salaId };
      if (periodo) {
        params.periodo = periodo;
      }

      const response = await apiClient.get('/api/ranking/por_sala/', { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch ranking by period',
      };
    }
  }
}

export const apiService = new ApiService();
