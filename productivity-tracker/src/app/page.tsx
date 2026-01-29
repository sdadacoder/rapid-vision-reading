'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BitmapCanvas from '@/components/BitmapCanvas';
import EditorControls from '@/components/EditorControls';
import DesignsList from '@/components/DesignsList';
import { UserMenu } from '@/components/UserMenu';
import { useBitmapEditor } from '@/hooks/useBitmapEditor';
import { useAuth } from '@/contexts/AuthContext';
import { Grid3X3 } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    rows,
    cols,
    cellSize,
    cells,
    showGrid,
    showPins,
    zoom,
    selectedColor,
    designs,
    currentDesignId,
    currentDesignName,
    loading,
    saving,
    setRows,
    setCols,
    setShowGrid,
    setShowPins,
    setZoom,
    setSelectedColor,
    setCurrentDesignName,
    setCellColor,
    clearCell,
    clearAllCells,
    saveDesign,
    loadDesign,
    deleteDesign,
    newDesign,
  } = useBitmapEditor();

  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Handle cell click - paint with selected color or erase
  const handleCellClick = useCallback((row: number, col: number) => {
    if (isErasing) {
      clearCell(row, col);
    } else {
      setCellColor(row, col, selectedColor);
    }
  }, [setCellColor, clearCell, selectedColor, isErasing]);

  // Export canvas as JPG
  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas with grid visible for export
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // Copy the current canvas
    ctx.drawImage(canvas, 0, 0);

    // Convert to JPG and download
    const link = document.createElement('a');
    link.download = `${currentDesignName.replace(/[^a-z0-9]/gi, '_')}.jpg`;
    link.href = tempCanvas.toDataURL('image/jpeg', 0.95);
    link.click();
  }, [currentDesignName]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
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
                <Grid3X3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Bitmap Editor</h1>
                <p className="text-sm text-muted-foreground">Create and customize your pixel designs</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-4">
              <BitmapCanvas
                rows={rows}
                cols={cols}
                cellSize={cellSize}
                zoom={zoom}
                showGrid={showGrid}
                showPins={showPins}
                cells={cells}
                selectedColor={selectedColor}
                onCellClick={handleCellClick}
                canvasRef={canvasRef}
              />
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-4">
            <EditorControls
              rows={rows}
              cols={cols}
              onRowsChange={setRows}
              onColsChange={setCols}
              showGrid={showGrid}
              showPins={showPins}
              onShowGridChange={setShowGrid}
              onShowPinsChange={setShowPins}
              zoom={zoom}
              onZoomChange={setZoom}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              isErasing={isErasing}
              onErasingChange={setIsErasing}
              onClearAll={clearAllCells}
              onExport={handleExport}
              onSave={saveDesign}
              onNew={newDesign}
              saving={saving}
              currentDesignName={currentDesignName}
              onDesignNameChange={setCurrentDesignName}
            />

            <DesignsList
              designs={designs}
              currentDesignId={currentDesignId}
              loading={loading}
              onLoadDesign={loadDesign}
              onDeleteDesign={deleteDesign}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
