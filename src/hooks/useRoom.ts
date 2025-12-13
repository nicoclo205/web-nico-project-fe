import { useState, useEffect, useCallback } from 'react';
import { apiService, Room, CreateRoomData, UpdateRoomData } from '../services/apiService';

export function useRoom(){
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);


    //Obtener salas del usuario
    const fetchUserRooms = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.getUserRooms();
            if (response.success) {
                setRooms(response.data || []);
            } else {
                setError(response.error || 'Error fetching rooms');
            }
        } catch (e: any) {
            setError(e.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    },[]);

    //Obtener todas las salas
    const fetchAllRooms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.getAllRooms();
            if (response.success) {
                setRooms(response.data || []);
            } else {
                setError(response.error || 'Error fetching all rooms');
            }
        } catch (e: any) {
            setError(e.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    },[]);

    //obtener sala por id
    const fetchRoomById = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.getRoomById(id);
            if (response.success) {
                setSelectedRoom(response.data || null);
            } else {
                setError(response.error || 'Error fetching room details');
            }
        } catch (e: any) {
            setError(e.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    },[]);

    //Crear sala
    const createRoom = useCallback(async (roomData: CreateRoomData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.createRoom(roomData);
            if (response.success && response.data) {
                setRooms(prev => [response.data!, ...prev]);
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.error || 'Error creating room' };
            }
        } catch (e: any) {
            return { success: false, error: e.message || 'Unknown error occurred' };
        }
        finally {
            setLoading(false);
        }
    },[]);

    //Actualizar sala
    const updateRoom = useCallback(async (id: number, payload: UpdateRoomData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.updateRoom(id, payload);
            if (response.success && response.data) {
                setRooms(prev =>
                    prev.map(r => (r.id_sala === id ? response.data! : r))
                );
                return { success: true, data: response.data };
            }
            return { success: false, error: response.error || 'Error updating room' };
        } catch (e: any) {
            return { success: false, error: e.message || 'Unknown error occurred' };
        }
        finally {
            setLoading(false);
        }
    },[]);

    //Eliminar sala
    const deleteRoom = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.deleteRoom(id);
            if (response.success) {
                setRooms(prev => prev.filter(r => r.id_sala !== id));
                return { success: true };
            }
            return { success: false, error: response.error || 'Error deleting room' };
        } catch (e: any) {
            return { success: false, error: e.message || 'Unknown error occurred' };
        }
        finally {
            setLoading(false);
        }
    },[]);

    //Unirse a sala
    const joinRoom = useCallback(async (roomId: number, codigo_sala: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.joinRoom(roomId, codigo_sala);
            if (response.success && response.data) {
                setSelectedRoom(response.data);
                return { success: true, data: response.data };
            }
            return { success: false, error: response.error || 'Error joining room' };
        } catch (e: any) {
            return { success: false, error: e.message || 'Unknown error occurred' };
        }
        finally {
            setLoading(false);
        }
    },[]);

    //Salir de sala
    const leaveRoom = useCallback(async (roomId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.leaveRoom(roomId);
            if (response.success) {
                setSelectedRoom(null);
                return { success: true };
            }
            return { success: false, error: response.error || 'Error leaving room' };
        } catch (e: any) {
            return { success: false, error: e.message || 'Unknown error occurred' };
        }
        finally {
            setLoading(false);
        }
    },[]);

    // Obtener miembros de la sala
    const getRoomMembers = useCallback(async (roomId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.getRoomMembers(roomId);
            if (response.success) {
                return { success: true, data: response.data };
            }
            return { success: false, error: response.error || 'Error fetching room members' };
        } catch (e: any) {
            return { success: false, error: e.message || 'Unknown error occurred' };
        }
        finally {
            setLoading(false);
        }
    },[]);

    useEffect(() => {
        fetchUserRooms();
    }, [fetchUserRooms]);

    const reload = async () => {
    await fetchUserRooms();
    };

    return {
    rooms,
    loading,
    error,
    selectedRoom,
    setSelectedRoom,
    reload,
    fetchUserRooms,
    fetchAllRooms,
    fetchRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    joinRoom,
    leaveRoom,
    getRoomMembers,
};
}