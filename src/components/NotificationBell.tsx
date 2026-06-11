import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdNotifications } from 'react-icons/io';
import { useNotifications, AppNotification } from '../hooks/useNotifications';

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

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open && totalUnread > 0) {
      markAllSeen(); // mark all seen when panel opens
    }
  };

  const handleNotifClick = (notif: AppNotification) => {
    setOpen(false);
    navigate(`/rooms`);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
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

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-14 top-0 z-50 w-80 bg-[#1a1d21] border border-white/10 rounded-2xl shadow-2xl overflow-hidden lg:left-14 -left-64">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-white font-semibold text-sm">Notifications</span>
            {totalUnread > 0 && (
              <button
                onClick={() => markAllSeen()}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {allNotifications.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">
                <span className="text-3xl block mb-2">🔔</span>
                No notifications yet
              </div>
            ) : (
              allNotifications.map(notif => (
                <button
                  key={`${notif.sala_id}-${notif.id}`}
                  onClick={() => handleNotifClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors flex items-start gap-3 ${
                    !notif.leida ? 'bg-white/5' : ''
                  }`}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{notif.icono}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!notif.leida ? 'text-white' : 'text-gray-300'}`}>
                      {notif.mensaje}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 truncate">{notif.sala_nombre}</span>
                      <span className="text-gray-600 text-xs">·</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo(notif.fecha)}</span>
                    </div>
                  </div>
                  {!notif.leida && (
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2" />
                  )}
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
