'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  ActivityOption,
  ScheduledActivity,
  ActivityLog,
  ActiveSession,
  CalendarEvent,
} from '@/types';
import { differenceInMinutes, isWithinInterval } from 'date-fns';

export function useProductivity() {
  const [options, setOptions] = useState<ActivityOption[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledActivity[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all data for current user
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('No user logged in, skipping data fetch');
        setLoading(false);
        return;
      }

      const [optionsRes, scheduledRes, logsRes] = await Promise.all([
        supabase
          .from('activity_options')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at'),
        supabase
          .from('scheduled_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time'),
        supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false }),
      ]);

      if (optionsRes.data) setOptions(optionsRes.data);
      if (scheduledRes.data) setScheduled(scheduledRes.data);
      if (logsRes.data) setLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    // Re-fetch when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchData();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchData]);

  // Get current scheduled activity based on time
  const getCurrentScheduled = useCallback((): ScheduledActivity | null => {
    const now = new Date();
    return (
      scheduled.find((s) =>
        isWithinInterval(now, {
          start: new Date(s.start_time),
          end: new Date(s.end_time),
        })
      ) || null
    );
  }, [scheduled]);

  // Convert scheduled activities to calendar events
  const calendarEvents: CalendarEvent[] = scheduled.map((s) => {
    const option = options.find((o) => o.id === s.option_id);
    return {
      id: s.id,
      title: option?.name || 'Unknown',
      start: new Date(s.start_time),
      end: new Date(s.end_time),
      backgroundColor: option?.color || '#666',
      borderColor: option?.color || '#666',
      extendedProps: {
        option_id: s.option_id,
        scheduled_id: s.id,
      },
    };
  });

  // Add activity option
  const addOption = async (name: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const { data, error } = await supabase
      .from('activity_options')
      .insert({ name, color, user_id: user.id })
      .select()
      .single();

    if (data && !error) {
      setOptions((prev) => [...prev, data]);
    }
    return { data, error };
  };

  // Delete activity option
  const deleteOption = async (id: string) => {
    const { error } = await supabase.from('activity_options').delete().eq('id', id);
    if (!error) {
      setOptions((prev) => prev.filter((o) => o.id !== id));
    }
    return { error };
  };

  // Schedule an activity
  const scheduleActivity = async (optionId: string, startTime: Date, endTime: Date) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const { data, error } = await supabase
      .from('scheduled_activities')
      .insert({
        option_id: optionId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        user_id: user.id,
      })
      .select()
      .single();

    if (data && !error) {
      setScheduled((prev) => [...prev, data]);
    }
    return { data, error };
  };

  // Delete scheduled activity
  const deleteScheduled = async (id: string) => {
    const { error } = await supabase.from('scheduled_activities').delete().eq('id', id);
    if (!error) {
      setScheduled((prev) => prev.filter((s) => s.id !== id));
    }
    return { error };
  };

  // Start tracking an activity
  const startActivity = (optionId: string, scheduledId: string | null) => {
    setActiveSession({
      option_id: optionId,
      scheduled_id: scheduledId,
      started_at: new Date(),
    });
  };

  // Switch to different activity (stops current, starts new)
  const switchActivity = async (newOptionId: string) => {
    if (activeSession) {
      await stopActivity();
    }
    startActivity(newOptionId, null);
  };

  // Stop tracking and log the activity
  const stopActivity = async () => {
    if (!activeSession) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setActiveSession(null);
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const endedAt = new Date();
    const durationMinutes = differenceInMinutes(endedAt, activeSession.started_at);

    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        option_id: activeSession.option_id,
        scheduled_id: activeSession.scheduled_id,
        started_at: activeSession.started_at.toISOString(),
        ended_at: endedAt.toISOString(),
        duration_minutes: durationMinutes,
        user_id: user.id,
      })
      .select()
      .single();

    if (data && !error) {
      setLogs((prev) => [data, ...prev]);
    }

    setActiveSession(null);
    return { data, error };
  };

  return {
    options,
    scheduled,
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
    refetch: fetchData,
  };
}
