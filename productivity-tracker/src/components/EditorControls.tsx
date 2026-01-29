'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Grid3X3,
  Circle,
  ZoomIn,
  ZoomOut,
  Download,
  Save,
  Trash2,
  Plus,
  Palette,
  RotateCcw,
  Eraser,
} from 'lucide-react';

interface EditorControlsProps {
  // Grid settings
  rows: number;
  cols: number;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;

  // Display settings
  showGrid: boolean;
  showPins: boolean;
  onShowGridChange: (show: boolean) => void;
  onShowPinsChange: (show: boolean) => void;

  // Zoom
  zoom: number;
  onZoomChange: (zoom: number) => void;

  // Color
  selectedColor: string;
  onColorChange: (color: string) => void;

  // Eraser
  isErasing: boolean;
  onErasingChange: (erasing: boolean) => void;

  // Actions
  onClearAll: () => void;
  onExport: () => void;
  onSave: () => void;
  onNew: () => void;

  // State
  saving: boolean;
  currentDesignName: string;
  onDesignNameChange: (name: string) => void;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ffffff', // white
  '#000000', // black
  '#6b7280', // gray
  '#92400e', // brown
];

export default function EditorControls({
  rows,
  cols,
  onRowsChange,
  onColsChange,
  showGrid,
  showPins,
  onShowGridChange,
  onShowPinsChange,
  zoom,
  onZoomChange,
  selectedColor,
  onColorChange,
  isErasing,
  onErasingChange,
  onClearAll,
  onExport,
  onSave,
  onNew,
  saving,
  currentDesignName,
  onDesignNameChange,
}: EditorControlsProps) {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 0.25, 0.25));
  };

  return (
    <div className="glass-card rounded-2xl p-4 space-y-6">
      {/* Design Name */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Design Name</Label>
        <Input
          value={currentDesignName}
          onChange={(e) => onDesignNameChange(e.target.value)}
          placeholder="Enter design name..."
          className="bg-white/5 border-white/10"
        />
      </div>

      {/* Grid Size */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Grid Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Columns</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={cols}
              onChange={(e) => onColsChange(parseInt(e.target.value) || 1)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Rows</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={rows}
              onChange={(e) => onRowsChange(parseInt(e.target.value) || 1)}
              className="bg-white/5 border-white/10"
            />
          </div>
        </div>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Color
        </Label>
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                !isErasing && selectedColor === color
                  ? 'border-white scale-110 shadow-lg'
                  : 'border-white/20 hover:border-white/50'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => {
                onColorChange(color);
                onErasingChange(false);
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Label className="text-xs text-muted-foreground">Custom:</Label>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => {
              onColorChange(e.target.value);
              onErasingChange(false);
            }}
            className="w-10 h-8 rounded cursor-pointer"
          />
          <span className="text-xs font-mono text-muted-foreground">
            {selectedColor}
          </span>
        </div>
        {/* Eraser */}
        <button
          onClick={() => onErasingChange(!isErasing)}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all mt-2 ${
            isErasing
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
              : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
          }`}
        >
          <Eraser className="w-4 h-4" />
          <span className="text-sm">Eraser {isErasing && '(Active)'}</span>
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Zoom: {Math.round(zoom * 100)}%</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.25}
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <input
            type="range"
            min="0.25"
            max="3"
            step="0.25"
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Toggle Controls */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Display Options</Label>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onShowGridChange(!showGrid)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              showGrid
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'bg-white/5 text-muted-foreground border border-white/10'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="text-sm">Show Grid Lines</span>
          </button>
          <button
            onClick={() => onShowPinsChange(!showPins)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              showPins
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'bg-white/5 text-muted-foreground border border-white/10'
            }`}
          >
            <Circle className="w-4 h-4" />
            <span className="text-sm">Show Pins</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Actions</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNew}
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={saving}
            className="bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30 text-purple-300"
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="bg-green-500/20 border-green-500/50 hover:bg-green-500/30 text-green-300"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
