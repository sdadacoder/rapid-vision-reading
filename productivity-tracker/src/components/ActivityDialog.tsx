'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ActivityOption } from '@/types';
import { format } from 'date-fns';
import { CalendarPlus, Clock } from 'lucide-react';

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: ActivityOption[];
  startTime: Date | null;
  endTime: Date | null;
  onConfirm: (optionId: string) => void;
}

export default function ActivityDialog({
  open,
  onOpenChange,
  options,
  startTime,
  endTime,
  onConfirm,
}: ActivityDialogProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleConfirm = () => {
    if (selectedOption) {
      onConfirm(selectedOption);
      setSelectedOption('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass-card border-0 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarPlus className="w-5 h-5 text-purple-400" />
            Schedule Activity
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {startTime && endTime && (
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time slot</p>
                <p className="font-medium">
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                </p>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <Label htmlFor="activity" className="text-sm text-muted-foreground">
              Select Activity
            </Label>
            <Select value={selectedOption} onValueChange={setSelectedOption}>
              <SelectTrigger className="glass-input rounded-xl border-0 h-12">
                <SelectValue placeholder="Choose an activity..." />
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
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="glass rounded-xl border-0 hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedOption}
            className="glass-button rounded-xl border-0"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
