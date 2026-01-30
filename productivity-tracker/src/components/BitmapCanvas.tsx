'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { getCellKey } from '@/types';

interface BitmapCanvasProps {
  rows: number;
  cols: number;
  cellSize: number;
  zoom: number;
  showGrid: boolean;
  showPins: boolean;
  cells: Map<string, string>;
  selectedColor: string;
  onCellClick: (row: number, col: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function BitmapCanvas({
  rows,
  cols,
  cellSize,
  zoom,
  showGrid,
  showPins,
  cells,
  selectedColor,
  onCellClick,
  canvasRef,
}: BitmapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const effectiveSize = cellSize * zoom;
  const pinRadius = effectiveSize * 0.08;
  const pinOffset = effectiveSize * 0.15;

  // Helper to get column count for a row (staggered rows have one fewer cell)
  const getColsForRow = useCallback((row: number) => {
    return row % 2 === 1 ? cols - 1 : cols;
  }, [cols]);

  // Calculate canvas dimensions
  // Width is just cols * cellSize (staggered rows fit within this width)
  const canvasWidth = cols * effectiveSize;
  const canvasHeight = rows * effectiveSize;

  // Get cell at canvas coordinates
  const getCellAtPosition = useCallback((canvasX: number, canvasY: number): { row: number; col: number } | null => {
    const row = Math.floor(canvasY / effectiveSize);
    const isStaggered = row % 2 === 1;
    const offsetX = isStaggered ? effectiveSize * 0.5 : 0;
    const colsInRow = getColsForRow(row);
    const col = Math.floor((canvasX - offsetX) / effectiveSize);

    if (row >= 0 && row < rows && col >= 0 && col < colsInRow) {
      // Check if click is within the actual cell bounds
      const cellX = col * effectiveSize + offsetX;
      const cellY = row * effectiveSize;

      if (canvasX >= cellX && canvasX < cellX + effectiveSize &&
          canvasY >= cellY && canvasY < cellY + effectiveSize) {
        return { row, col };
      }
    }
    return null;
  }, [effectiveSize, rows, getColsForRow]);

  // Draw the canvas
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw outer border (the "blue block" from the reference)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // Draw cells
    for (let row = 0; row < rows; row++) {
      const isStaggered = row % 2 === 1;
      const offsetX = isStaggered ? effectiveSize * 0.5 : 0;
      const colsInRow = getColsForRow(row);

      for (let col = 0; col < colsInRow; col++) {
        const x = col * effectiveSize + offsetX;
        const y = row * effectiveSize;
        const cellKey = getCellKey(row, col);
        const color = cells.get(cellKey) || '#1a1a2e';

        // Draw cell background
        ctx.fillStyle = color;
        ctx.fillRect(x, y, effectiveSize, effectiveSize);

        // Draw cell border (grid)
        if (showGrid) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, effectiveSize, effectiveSize);
        }

        // Draw pins
        if (showPins) {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;

          // Top-left pin
          ctx.beginPath();
          ctx.arc(x + pinOffset, y + pinOffset, pinRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Top-right pin
          ctx.beginPath();
          ctx.arc(x + effectiveSize - pinOffset, y + pinOffset, pinRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  }, [rows, cols, effectiveSize, canvasWidth, canvasHeight, cells, showGrid, showPins, pinRadius, pinOffset, getColsForRow]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    draw(ctx);
  }, [canvasRef, canvasWidth, canvasHeight, draw]);

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const cell = getCellAtPosition(x, y);
    if (cell) {
      onCellClick(cell.row, cell.col);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const cell = getCellAtPosition(x, y);
    if (cell) {
      onCellClick(cell.row, cell.col);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="overflow-auto bg-gray-900 rounded-lg p-4"
      style={{ maxHeight: '70vh' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          cursor: 'crosshair',
          display: 'block'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
