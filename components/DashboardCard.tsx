
import React from 'react';

interface DashboardCardProps {
  title: string;
  value?: string;
  icon: React.ReactNode;
  color: 'red' | 'orange' | 'blue' | 'green';
  children: React.ReactNode;
}

const colorClasses = {
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
};


const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-bold text-gray-600">{title}</h2>
          {value && <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>}
        </div>
        <div className={`p-2 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
