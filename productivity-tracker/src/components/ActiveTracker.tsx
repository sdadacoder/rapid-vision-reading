'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ActivityOption, ActiveSession, ScheduledActivity } from '@/types';
import { differenceInSeconds, format } from 'date-fns';
import { Play, Square, ArrowRightLeft, Clock, Zap } from 'lucide-react';

interface ActiveTrackerProps {
  options: ActivityOption[];
  currentScheduled: ScheduledActivity | null;
  activeSession: ActiveSession | null;
  onStart: (optionId: string, scheduledId: string | null) => void;
  onSwitch: (optionId: string) => void;
  onStop: () => void;
}

export default function ActiveTracker({
  options,
  currentScheduled,
  activeSession,
  onStart,
  onSwitch,
  onStop,
}: ActiveTrackerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [switchTo, setSwitchTo] = useState<string>('');

  useEffect(() => {
    if (!activeSession) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      const seconds = differenceInSeconds(new Date(), activeSession.started_at);
      setElapsed(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const formatElapsed = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentOption = activeSession
    ? options.find((o) => o.id === activeSession.option_id)
    : currentScheduled
    ? options.find((o) => o.id === currentScheduled.option_id)
    : null;

  const scheduledOption = currentScheduled
    ? options.find((o) => o.id === currentScheduled.option_id)
    : null;

  return (
    <div className="glass-card rounded-2xl p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Activity Tracker</h2>
          <p className="text-xs text-muted-foreground">Track your current task</p>
        </div>
      </div>

      {activeSession ? (
        // Active session in progress
        <div className="space-y-6">
          {/* Activity indicator */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full animate-pulse shadow-lg"
                style={{
                  backgroundColor: currentOption?.color,
                  boxShadow: `0 0 20px ${currentOption?.color}60`,
                }}
              />
              <span className="font-semibold text-lg">{currentOption?.name}</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Started at {format(activeSession.started_at, 'h:mm a')}
            </p>
          </div>

          {/* Timer display */}
          <div className="text-center py-6">
            <div
              className="text-5xl font-mono font-bold tracking-wider"
              style={{
                background: `linear-gradient(135deg, ${currentOption?.color || '#a855f7'}, #ec4899)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {formatElapsed(elapsed)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Time elapsed</p>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <Button
              variant="destructive"
              onClick={onStop}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 border-0 font-medium"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Activity
            </Button>

            <div className="flex gap-2">
              <Select value={switchTo} onValueChange={setSwitchTo}>
                <SelectTrigger className="flex-1 glass-input rounded-xl border-0">
                  <SelectValue placeholder="Switch to..." />
                </SelectTrigger>
                <SelectContent className="glass-card border-0">
                  {options
                    .filter((o) => o.id !== activeSession.option_id)
                    .map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: option.color }}
                          />
                          {option.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={!switchTo}
                onClick={() => {
                  if (switchTo) {
                    onSwitch(switchTo);
                    setSwitchTo('');
                  }
                }}
                className="glass rounded-xl border-0 hover:bg-white/10"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : currentScheduled ? (
        // Scheduled activity ready to start
        <div className="space-y-6">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: scheduledOption?.color }}
              />
              <span className="font-semibold text-lg">{scheduledOption?.name}</span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(currentScheduled.start_time), 'h:mm a')} -{' '}
              {format(new Date(currentScheduled.end_time), 'h:mm a')}
            </p>
          </div>

          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">Ready to start</p>
            <div className="text-4xl font-mono font-bold text-purple-400">00:00:00</div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => onStart(currentScheduled.option_id, currentScheduled.id)}
              className="w-full h-12 rounded-xl glass-button border-0 font-medium"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Scheduled Activity
            </Button>

            <div className="flex gap-2">
              <Select value={switchTo} onValueChange={setSwitchTo}>
                <SelectTrigger className="flex-1 glass-input rounded-xl border-0">
                  <SelectValue placeholder="Or start different..." />
                </SelectTrigger>
                <SelectContent className="glass-card border-0">
                  {options
                    .filter((o) => o.id !== currentScheduled.option_id)
                    .map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: option.color }}
                          />
                          {option.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={!switchTo}
                onClick={() => {
                  if (switchTo) {
                    onStart(switchTo, null);
                    setSwitchTo('');
                  }
                }}
                className="glass rounded-xl border-0 hover:bg-white/10"
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // No scheduled activity
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-purple-400/60" />
            </div>
            <p className="text-muted-foreground mb-1">No activity scheduled</p>
            <p className="text-xs text-muted-foreground/60">Start tracking an activity below</p>
          </div>

          {options.length > 0 ? (
            <div className="flex gap-2">
              <Select value={switchTo} onValueChange={setSwitchTo}>
                <SelectTrigger className="flex-1 glass-input rounded-xl border-0">
                  <SelectValue placeholder="Select an activity..." />
                </SelectTrigger>
                <SelectContent className="glass-card border-0">
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!switchTo}
                onClick={() => {
                  if (switchTo) {
                    onStart(switchTo, null);
                    setSwitchTo('');
                  }
                }}
                className="glass-button rounded-xl border-0"
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No activities created yet. Add some activities to get started!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
