'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActivityOption } from '@/types';
import { Settings2, Plus, X, Palette } from 'lucide-react';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

interface OptionsManagerProps {
  options: ActivityOption[];
  onAddOption: (name: string, color: string) => void;
  onDeleteOption: (id: string) => void;
}

export default function OptionsManager({
  options,
  onAddOption,
  onDeleteOption,
}: OptionsManagerProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const handleAdd = () => {
    if (newName.trim()) {
      onAddOption(newName.trim(), newColor);
      setNewName('');
      setNewColor(PRESET_COLORS[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="glass rounded-xl hover:bg-white/10 gap-2">
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">Manage Activities</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass-card border-0 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-5 h-5 text-purple-400" />
            Activity Options
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Existing options */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Current Activities</Label>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="glass rounded-xl px-3 py-2 flex items-center gap-2 group transition-all hover:bg-white/10"
                >
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="text-sm font-medium">{option.name}</span>
                  <button
                    type="button"
                    title={`Delete ${option.name}`}
                    aria-label={`Delete ${option.name}`}
                    onClick={() => onDeleteOption(option.id)}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 rounded-full w-5 h-5 flex items-center justify-center transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {options.length === 0 && (
                <div className="glass rounded-xl p-4 w-full text-center">
                  <p className="text-sm text-muted-foreground">No activities yet. Add one below!</p>
                </div>
              )}
            </div>
          </div>

          {/* Add new option */}
          <div className="space-y-4">
            <Label className="text-sm text-muted-foreground">Add New Activity</Label>
            <div className="space-y-3">
              <Input
                placeholder="Activity name (e.g., Gym, Work, Study)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="glass-input rounded-xl border-0 h-11"
              />
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Color:</span>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      title={`Select ${color} color`}
                      aria-label={`Select ${color} color`}
                      onClick={() => setNewColor(color)}
                      className={`w-7 h-7 rounded-lg transition-all ${
                        newColor === color
                          ? 'scale-110 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="w-full glass-button rounded-xl border-0 h-11 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
