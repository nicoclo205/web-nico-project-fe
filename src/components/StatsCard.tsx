import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  iconColor = 'text-white' 
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <span className={`text-3xl ${iconColor}`}>{icon}</span>
      </div>
    </div>
  );
};

export default StatsCard;