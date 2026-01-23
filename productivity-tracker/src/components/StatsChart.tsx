'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ActivityOption, ActivityLog } from '@/types';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';
import { BarChart3, Calendar, CalendarDays, CalendarRange } from 'lucide-react';

interface StatsChartProps {
  options: ActivityOption[];
  logs: ActivityLog[];
}

type TimeRange = 'day' | 'week' | 'month';

export default function StatsChart({ options, logs }: StatsChartProps) {
  const getFilteredData = (range: TimeRange) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (range) {
      case 'day':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
    }

    const filteredLogs = logs.filter((log) => {
      const logDate = new Date(log.started_at);
      return isWithinInterval(logDate, { start, end });
    });

    const aggregated = options.map((option) => {
      const optionLogs = filteredLogs.filter((log) => log.option_id === option.id);
      const totalMinutes = optionLogs.reduce(
        (sum, log) => sum + (log.duration_minutes || 0),
        0
      );
      return {
        name: option.name,
        minutes: totalMinutes,
        hours: Math.round((totalMinutes / 60) * 10) / 10,
        color: option.color,
      };
    });

    return aggregated.filter((item) => item.minutes > 0);
  };

  const renderChart = (range: TimeRange) => {
    const data = getFilteredData(range);

    if (data.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto">
              <BarChart3 className="w-8 h-8 text-purple-400/60" />
            </div>
            <p className="text-muted-foreground">No activity data for this period</p>
            <p className="text-xs text-muted-foreground/60">Start tracking to see your stats</p>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 80, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            type="number"
            unit=" hrs"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={70}
            tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip
            formatter={(value) => [`${value} hours`, 'Duration']}
            contentStyle={{
              backgroundColor: 'rgba(30, 20, 50, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.9)' }}
            itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
          />
          <Bar dataKey="hours" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const totalHoursToday = getFilteredData('day').reduce((sum, item) => sum + item.hours, 0);
  const totalHoursWeek = getFilteredData('week').reduce((sum, item) => sum + item.hours, 0);
  const totalHoursMonth = getFilteredData('month').reduce((sum, item) => sum + item.hours, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Activity Statistics</h2>
          <p className="text-xs text-muted-foreground">Track your productivity over time</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <Calendar className="w-5 h-5 mx-auto text-purple-400 mb-2" />
          <p className="text-2xl font-bold gradient-text">{totalHoursToday.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Hours today</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <CalendarDays className="w-5 h-5 mx-auto text-pink-400 mb-2" />
          <p className="text-2xl font-bold gradient-text">{totalHoursWeek.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Hours this week</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <CalendarRange className="w-5 h-5 mx-auto text-blue-400 mb-2" />
          <p className="text-2xl font-bold gradient-text">{totalHoursMonth.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Hours this month</p>
        </div>
      </div>

      {/* Chart tabs */}
      <Tabs defaultValue="day">
        <TabsList className="glass p-1 rounded-xl mb-4">
          <TabsTrigger
            value="day"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/80 data-[state=active]:to-pink-500/80 data-[state=active]:text-white transition-all"
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="week"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/80 data-[state=active]:to-pink-500/80 data-[state=active]:text-white transition-all"
          >
            This Week
          </TabsTrigger>
          <TabsTrigger
            value="month"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/80 data-[state=active]:to-pink-500/80 data-[state=active]:text-white transition-all"
          >
            This Month
          </TabsTrigger>
        </TabsList>
        <div className="glass rounded-xl p-4">
          <TabsContent value="day" className="mt-0">{renderChart('day')}</TabsContent>
          <TabsContent value="week" className="mt-0">{renderChart('week')}</TabsContent>
          <TabsContent value="month" className="mt-0">{renderChart('month')}</TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
