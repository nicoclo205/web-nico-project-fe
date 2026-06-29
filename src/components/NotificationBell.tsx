import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdNotifications } from 'react-icons/io';
import { FiBell } from 'react-icons/fi';
import { useNotifications } from '../hooks/useNotifications';
import { encodeRoomId } from '../utils/roomHash';

const timeAgo = (isoDate: string): string => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { totalUnread, allNotifications, markAllSeen } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = allNotifications.filter(n => !n.leida);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => setOpen(v => !v);

  const handleNotifClick = (salaId: number, tipo: string) => {
    setOpen(false);
    const hash = encodeRoomId(salaId);
    const tab = tipo === 'nuevo_mensaje_chat' ? 'chat' : 'info';
    navigate(`/room/${hash}`, { state: { tab } });
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className={`relative text-white w-12 h-12 p-3 rounded-2xl flex items-center justify-center transition-all duration-200 ease-in-out ${
          open ? 'bg-green-600' : 'hover:bg-white/10'
        }`}
        aria-label="Notifications"
      >
        <IoMdNotifications className="w-full h-full" />
        {totalUnread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 bg-surface-alt border border-white/10 rounded-2xl shadow-2xl overflow-hidden top-14 right-0 w-[min(20rem,calc(100vw-1.5rem))] lg:top-0 lg:left-14 lg:right-auto lg:w-80">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-white font-semibold text-sm">Notifications</span>
            {unreadNotifications.length > 0 && (
              <button
                onClick={() => markAllSeen()}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {unreadNotifications.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">
                <FiBell className="text-3xl mx-auto mb-2" />
                No new notifications
              </div>
            ) : (
              unreadNotifications.map(notif => (
                <button
                  key={`${notif.sala_id}-${notif.id}`}
                  onClick={() => handleNotifClick(notif.sala_id, notif.tipo)}
                  className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors flex items-start gap-3 bg-white/5"
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{notif.icono}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug text-white line-clamp-2">
                      {notif.mensaje}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 truncate">{notif.sala_nombre}</span>
                      <span className="text-gray-600 text-xs">·</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo(notif.fecha)}</span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
