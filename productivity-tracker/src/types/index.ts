// Core types for the bitmap editor

export interface CellData {
  row: number;
  col: number;
  color: string;
}

export interface Design {
  id: string;
  user_id: string;
  name: string;
  rows: number;
  cols: number;
  cell_size: number;
  cells: CellData[];
  created_at: string;
  updated_at: string;
}

export interface EditorSettings {
  showGrid: boolean;
  showPins: boolean;
  zoom: number;
  selectedColor: string;
}

export interface DesignState {
  rows: number;
  cols: number;
  cellSize: number;
  cells: Map<string, string>; // key: "row-col", value: color
}

// Helper to create cell key
export const getCellKey = (row: number, col: number): string => `${row}-${col}`;

// Helper to parse cell key
export const parseCellKey = (key: string): { row: number; col: number } => {
  const [row, col] = key.split('-').map(Number);
  return { row, col };
};
