'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ActivityDialog from '@/components/ActivityDialog';
import OptionsManager from '@/components/OptionsManager';
import ActiveTracker from '@/components/ActiveTracker';
import StatsChart from '@/components/StatsChart';
import { UserMenu } from '@/components/UserMenu';
import { useProductivity } from '@/hooks/useProductivity';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';

// Dynamic import for FullCalendar to avoid SSR issues
const Calendar = dynamic(() => import('@/components/Calendar'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center glass-card rounded-2xl">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading calendar...</p>
      </div>
    </div>
  ),
});

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <div className="text-4xl font-bold font-mono gradient-text">
        {time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })}
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        {time.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    options,
    logs,
    activeSession,
    loading,
    calendarEvents,
    getCurrentScheduled,
    addOption,
    deleteOption,
    scheduleActivity,
    deleteScheduled,
    startActivity,
    switchActivity,
    stopActivity,
  } = useProductivity();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [currentScheduled, setCurrentScheduled] = useState(getCurrentScheduled());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Update current scheduled activity every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScheduled(getCurrentScheduled());
    }, 60000);

    setCurrentScheduled(getCurrentScheduled());

    return () => clearInterval(interval);
  }, [getCurrentScheduled]);

  const handleSelectTimeRange = (start: Date, end: Date) => {
    setSelectedRange({ start, end });
    setDialogOpen(true);
  };

  const handleConfirmActivity = async (optionId: string) => {
    if (selectedRange) {
      await scheduleActivity(optionId, selectedRange.start, selectedRange.end);
      setSelectedRange(null);
    }
  };

  const handleEventClick = async (scheduledId: string) => {
    if (confirm('Delete this scheduled activity?')) {
      await deleteScheduled(scheduledId);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your productivity data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse-glow">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Productivity Tracker</h1>
                <p className="text-sm text-muted-foreground">Track your time, achieve your goals</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LiveClock />
              <div className="h-10 w-px bg-white/10" />
              <OptionsManager
                options={options}
                onAddOption={addOption}
                onDeleteOption={deleteOption}
              />
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main content */}
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="glass-card p-1 rounded-xl">
            <TabsTrigger
              value="schedule"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/80 data-[state=active]:to-pink-500/80 data-[state=active]:text-white transition-all flex items-center gap-2 px-4"
            >
              <CalendarIcon className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/80 data-[state=active]:to-pink-500/80 data-[state=active]:text-white transition-all flex items-center gap-2 px-4"
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="glass-card rounded-2xl p-4 h-[620px]">
                  <Calendar
                    events={calendarEvents}
                    options={options}
                    onSelectTimeRange={handleSelectTimeRange}
                    onEventClick={handleEventClick}
                  />
                </div>
              </div>
              <div>
                <ActiveTracker
                  options={options}
                  currentScheduled={currentScheduled}
                  activeSession={activeSession}
                  onStart={startActivity}
                  onSwitch={switchActivity}
                  onStop={stopActivity}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="glass-card rounded-2xl p-6">
              <StatsChart options={options} logs={logs} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ActivityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        options={options}
        startTime={selectedRange?.start || null}
        endTime={selectedRange?.end || null}
        onConfirm={handleConfirmActivity}
      />
    </main>
  );
}
