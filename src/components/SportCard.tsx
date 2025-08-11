import React from 'react';
import { useTranslation } from 'react-i18next';

interface SportCardProps {
  id: string;
  name: string;
  icon: string;
  bgGradient: string;
  activeMatches: number;
  onSelect: (id: string) => void;
}

const SportCard: React.FC<SportCardProps> = ({ 
  id, 
  name, 
  icon, 
  bgGradient, 
  activeMatches, 
  onSelect 
}) => {
  const { t } = useTranslation(['sports']);

  return (
    <button
      onClick={() => onSelect(id)}
      className={`group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${bgGradient} transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
    >
      <div className="relative z-10 text-white text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="font-bold text-lg">{name}</h3>
        <p className="text-sm mt-2 opacity-90">
          {t('sports:activeMatches', { count: activeMatches })}
        </p>
      </div>
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
    </button>
  );
};

export default SportCard;