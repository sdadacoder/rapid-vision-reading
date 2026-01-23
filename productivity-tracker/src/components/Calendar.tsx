'use client';

import { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import type { CalendarEvent, ActivityOption, ScheduledActivity } from '@/types';

interface CalendarProps {
  events: CalendarEvent[];
  options: ActivityOption[];
  onSelectTimeRange: (start: Date, end: Date) => void;
  onEventClick: (scheduledId: string) => void;
}

export default function Calendar({ events, options, onSelectTimeRange, onEventClick }: CalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time indicator every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (selectInfo: DateSelectArg) => {
    onSelectTimeRange(selectInfo.start, selectInfo.end);
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const scheduledId = clickInfo.event.extendedProps.scheduled_id;
    if (scheduledId) {
      onEventClick(scheduledId);
    }
  };

  return (
    <div className="h-full">
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek',
        }}
        selectable={true}
        selectMirror={true}
        select={handleSelect}
        eventClick={handleEventClick}
        events={events}
        nowIndicator={true}
        slotMinTime="05:00:00"
        slotMaxTime="23:00:00"
        slotDuration="00:30:00"
        height="100%"
        allDaySlot={false}
        eventDisplay="block"
      />
    </div>
  );
}
