'use client';

import { ChartInfoTooltip } from './ChartInfoTooltip';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  info?: string;
  trend?: {
    value: number;
    label: string;
  };
  active?: boolean;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  info,
  trend,
  active,
  onClick,
}: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border p-4 shadow-md transition-all sm:p-6 ${
        onClick ? 'cursor-pointer' : ''
      } ${
        active
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 dark:border-blue-400 dark:bg-blue-950 dark:ring-blue-800'
          : 'border-slate-200 bg-white hover:shadow-lg dark:border-border dark:bg-card'
      }`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center gap-1.5'>
            <p className='text-sm font-medium text-slate-600 dark:text-muted-foreground'>
              {title}
            </p>
            {info && (
              <ChartInfoTooltip info={info} position='bottom' size='sm' />
            )}
          </div>
          <p className='mt-2 text-2xl font-bold text-slate-900 dark:text-foreground sm:text-3xl'>
            {value}
          </p>
          {subtitle && (
            <p className='mt-1 text-sm text-slate-500 dark:text-muted-foreground'>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className='mt-2 flex items-center'>
              <span
                className={`text-sm font-medium ${
                  trend.value > 0
                    ? 'text-green-600'
                    : trend.value < 0
                      ? 'text-red-600'
                      : 'text-slate-600'
                }`}
              >
                {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'}{' '}
                {Math.abs(trend.value)}%
              </span>
              <span className='ml-2 text-sm text-slate-500'>{trend.label}</span>
            </div>
          )}
        </div>
        {icon && <div className='ml-4 text-blue-600'>{icon}</div>}
      </div>
    </div>
  );
}
