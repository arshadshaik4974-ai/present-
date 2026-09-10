import React from 'react';
import { Card, CardContent } from '../common/Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = 'primary'
}) => {
  const colorStyles = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          </div>
          <div className={cn("p-3 rounded-lg flex-shrink-0", colorStyles[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={cn("font-medium", trend.isPositive ? "text-green-600" : "text-red-600")}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="ml-2 text-gray-500">vs last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
