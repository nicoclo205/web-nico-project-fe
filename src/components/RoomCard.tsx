import React from 'react';
import { useTranslation } from 'react-i18next';

interface RoomCardProps {
  id: number;
  name: string;
  description: string;
  members: number;
  code?: string;
  status?: string;
  rank?: number;
  onClick: (id: number) => void;
  onJoin?: () => void;
  showJoinButton?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({
  id,
  name,
  description,
  members,
  code,
  status,
  rank,
  onClick,
  onJoin,
  showJoinButton = false
}) => {
  const { t } = useTranslation(['rooms', 'common']);

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
      case 'activo':
        return t('rooms:active');
      case 'inactive':
      case 'inactivo':
        return t('rooms:inactive');
      default:
        return status;
    }
  };

  return (
    <div
      onClick={() => onClick(id)}
      className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          {rank && (
            <div className={`text-2xl font-bold mr-3 ${
              rank === 1 ? 'text-yellow-400' : 
              rank === 2 ? 'text-gray-300' : 
              rank === 3 ? 'text-orange-400' : 'text-white'
            }`}>
              #{rank}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <p className="text-gray-300 text-sm mt-1">{description}</p>
            <div className="flex items-center mt-2 text-gray-400 text-sm">
              <span className="mr-1">👥</span>
              <span>{t('rooms:memberCount', { count: members })}</span>
              {code && (
                <>
                  <span className="mx-2">•</span>
                  <span>{t('rooms:roomCode')}: {code}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <div className={`px-2 py-1 rounded text-xs ${
              status === 'activo' || status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {getStatusText(status)}
            </div>
          )}
          {showJoinButton && onJoin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm hover:bg-blue-500/30 transition-colors"
            >
              {t('rooms:joinRoom')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;