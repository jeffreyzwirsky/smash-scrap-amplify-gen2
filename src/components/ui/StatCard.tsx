import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: { value: string; isPositive: boolean };
  loading?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-[#2d2d2d] border border-[#404040] rounded-xl p-6 shadow-lg animate-pulse">
        <div className="h-4 bg-[#3a3a3a] rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-[#3a3a3a] rounded w-3/4"></div>
      </div>
    );
  }
  return (
    <div className="bg-[#2d2d2d] border border-[#404040] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-white text-3xl font-bold">{value}</p>
          {trend && <p className={`text-sm mt-2 `}>{trend.isPositive ? '↑' : '↓'} {trend.value}</p>}
        </div>
        {Icon && <div className="p-3 bg-[#dc2626]/10 rounded-lg"><Icon className="h-6 w-6 text-[#dc2626]" /></div>}
      </div>
    </div>
  );
}
