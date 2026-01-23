// Core types for the productivity tracker

export interface ActivityOption {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ScheduledActivity {
  id: string;
  user_id: string;
  option_id: string;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  option_id: string;
  scheduled_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  created_at: string;
}

export interface ActiveSession {
  option_id: string;
  scheduled_id: string | null;
  started_at: Date;
}

// For FullCalendar events
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    option_id: string;
    scheduled_id: string;
  };
}
