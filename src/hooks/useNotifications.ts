import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';

export interface AppNotification {
  id: number;
  tipo: string;
  mensaje: string;
  icono: string;
  color: string;
  fecha: string;
  leida: boolean;
  sala_id: number;
  sala_nombre: string;
}

export interface SalaNotifications {
  sala_id: number;
  sala_nombre: string;
  no_leidas: number;
  notificaciones: AppNotification[];
}

interface NotificationsState {
  total_no_leidas: number;
  salas: SalaNotifications[];
}

const POLL_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

export const useNotifications = () => {
  const [data, setData] = useState<NotificationsState>({ total_no_leidas: 0, salas: [] });
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/notificaciones/mias/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silent — non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllSeen = useCallback(async (salaId?: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/api/notificaciones/marcar-vistas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(salaId ? { sala_id: salaId } : {}),
      });
      // Optimistically clear badge
      setData(prev => ({
        total_no_leidas: salaId
          ? prev.total_no_leidas - (prev.salas.find(s => s.sala_id === salaId)?.no_leidas ?? 0)
          : 0,
        salas: prev.salas.map(s =>
          !salaId || s.sala_id === salaId
            ? { ...s, no_leidas: 0, notificaciones: s.notificaciones.map(n => ({ ...n, leida: true })) }
            : s
        ),
      }));
    } catch {
      // silent
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    setLoading(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // All notifications flat-sorted by date
  const allNotifications: AppNotification[] = data.salas
    .flatMap(s => s.notificaciones)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 20);

  return {
    totalUnread: data.total_no_leidas,
    salas: data.salas,
    allNotifications,
    loading,
    refresh: fetchNotifications,
    markAllSeen,
  };
};
