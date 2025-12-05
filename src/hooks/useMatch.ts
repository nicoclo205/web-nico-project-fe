import {ApiResponse, apiService} from '../services/apiService';
import { useEffect, useState, useCallback } from 'react';

export function useMatch(initialSport?: string) {

    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sport] = useState<string | undefined>(initialSport);
    
    const fetchMatches = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.getSportsMatches(sport);
            if (response.success) {
                setMatches(response.data || []);
            } else {
                setError(response.error || 'Error fetching matches');
            }
        }
        catch (e: any){
            setError(e.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [sport]);


    //Crear partido
    const createMatch = useCallback(async (matchData: any) => {
        try {
            const response: ApiResponse<any> = await (apiService as any).createMatch(matchData);

            if (response.success) {
                setMatches(prev => [response.data, ...prev]);
                return { success: true, data: response.data };
            }
            return { success: false, error: response.error || 'Error creating match' };
        } catch (e: any) {
            return { success: false, error: e.message || 'Unknown error occurred' };
        }
    }, []);

    //Actualizar partido
    const updateMatch = useCallback(async (id: number, payload: any) => {
         try {
            const response: ApiResponse<any> = await (apiService as any).updateMatch(id, payload);
            if (response.success && response.data) {
                 setMatches(prev =>
                    prev.map(m => (m.id_partido === id ? response.data : m))
                );
                return { success: true, data: response.data };
            }
            return { success: false, error: response.error };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }, []);

  // Eliminar partido
    const deleteMatch = useCallback(async (id: number) => {
        try {
            const response: ApiResponse<null> = await (apiService as any).deleteMatch(id);

            if (response.success) {
                setMatches(prev => prev.filter(m => m.id_partido !== id));
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }, []);

    // Cargar automáticamente al montar
    useEffect(() => {
        fetchMatches();
    }, [fetchMatches]);

    // Para componentes que necesiten recargar manualmente
    const reload = async () => {
        await fetchMatches();
    };

    return {
        matches,
        loading,
        error,
        reload,
        fetchMatches,
        createMatch,
        updateMatch,
        deleteMatch,
    };
}