'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Design, CellData, getCellKey, parseCellKey } from '@/types';

interface UseBitmapEditorReturn {
  // Design state
  rows: number;
  cols: number;
  cellSize: number;
  cells: Map<string, string>;

  // Settings
  showGrid: boolean;
  showPins: boolean;
  zoom: number;
  selectedColor: string;

  // Saved designs
  designs: Design[];
  currentDesignId: string | null;
  currentDesignName: string;

  // Loading states
  loading: boolean;
  saving: boolean;

  // Actions
  setRows: (rows: number) => void;
  setCols: (cols: number) => void;
  setCellSize: (size: number) => void;
  setShowGrid: (show: boolean) => void;
  setShowPins: (show: boolean) => void;
  setZoom: (zoom: number) => void;
  setSelectedColor: (color: string) => void;
  setCurrentDesignName: (name: string) => void;

  setCellColor: (row: number, col: number, color: string) => void;
  clearCell: (row: number, col: number) => void;
  clearAllCells: () => void;

  saveDesign: () => Promise<void>;
  loadDesign: (id: string) => Promise<void>;
  deleteDesign: (id: string) => Promise<void>;
  newDesign: () => void;

  fetchDesigns: () => Promise<void>;
}

export function useBitmapEditor(): UseBitmapEditorReturn {
  const { user } = useAuth();

  // Design dimensions
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(5);
  const [cellSize, setCellSize] = useState(40);

  // Cell colors
  const [cells, setCells] = useState<Map<string, string>>(new Map());

  // Editor settings
  const [showGrid, setShowGrid] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedColor, setSelectedColor] = useState('#ef4444');

  // Saved designs
  const [designs, setDesigns] = useState<Design[]>([]);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [currentDesignName, setCurrentDesignName] = useState('Untitled Design');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch user's designs
  const fetchDesigns = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bitmap_designs')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (err) {
      console.error('Error fetching designs:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch designs on mount
  useEffect(() => {
    if (user) {
      fetchDesigns();
    }
  }, [user, fetchDesigns]);

  // Set cell color
  const setCellColor = useCallback((row: number, col: number, color: string) => {
    setCells(prev => {
      const next = new Map(prev);
      next.set(getCellKey(row, col), color);
      return next;
    });
  }, []);

  // Clear cell
  const clearCell = useCallback((row: number, col: number) => {
    setCells(prev => {
      const next = new Map(prev);
      next.delete(getCellKey(row, col));
      return next;
    });
  }, []);

  // Clear all cells
  const clearAllCells = useCallback(() => {
    setCells(new Map());
  }, []);

  // Convert cells Map to array for storage
  const cellsToArray = useCallback((): CellData[] => {
    const result: CellData[] = [];
    cells.forEach((color, key) => {
      const { row, col } = parseCellKey(key);
      result.push({ row, col, color });
    });
    return result;
  }, [cells]);

  // Convert cells array to Map
  const arrayToCells = useCallback((arr: CellData[]): Map<string, string> => {
    const map = new Map<string, string>();
    arr.forEach(({ row, col, color }) => {
      map.set(getCellKey(row, col), color);
    });
    return map;
  }, []);

  // Save design
  const saveDesign = useCallback(async () => {
    if (!user) return;

    setSaving(true);
    try {
      const cellsArray = cellsToArray();

      if (currentDesignId) {
        // Update existing design
        const { error } = await supabase
          .from('bitmap_designs')
          .update({
            name: currentDesignName,
            rows,
            cols,
            cell_size: cellSize,
            cells: cellsArray,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentDesignId);

        if (error) throw error;
      } else {
        // Create new design
        const { data, error } = await supabase
          .from('bitmap_designs')
          .insert({
            user_id: user.id,
            name: currentDesignName,
            rows,
            cols,
            cell_size: cellSize,
            cells: cellsArray,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setCurrentDesignId(data.id);
        }
      }

      await fetchDesigns();
    } catch (err) {
      console.error('Error saving design:', err);
    } finally {
      setSaving(false);
    }
  }, [user, currentDesignId, currentDesignName, rows, cols, cellSize, cellsToArray, fetchDesigns]);

  // Load design
  const loadDesign = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bitmap_designs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentDesignId(data.id);
        setCurrentDesignName(data.name);
        setRows(data.rows);
        setCols(data.cols);
        setCellSize(data.cell_size);
        setCells(arrayToCells(data.cells || []));
      }
    } catch (err) {
      console.error('Error loading design:', err);
    } finally {
      setLoading(false);
    }
  }, [arrayToCells]);

  // Delete design
  const deleteDesign = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('bitmap_designs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (currentDesignId === id) {
        newDesign();
      }

      await fetchDesigns();
    } catch (err) {
      console.error('Error deleting design:', err);
    }
  }, [currentDesignId, fetchDesigns]);

  // New design
  const newDesign = useCallback(() => {
    setCurrentDesignId(null);
    setCurrentDesignName('Untitled Design');
    setRows(10);
    setCols(5);
    setCellSize(40);
    setCells(new Map());
    setZoom(1);
  }, []);

  return {
    // Design state
    rows,
    cols,
    cellSize,
    cells,

    // Settings
    showGrid,
    showPins,
    zoom,
    selectedColor,

    // Saved designs
    designs,
    currentDesignId,
    currentDesignName,

    // Loading states
    loading,
    saving,

    // Actions
    setRows,
    setCols,
    setCellSize,
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

    fetchDesigns,
  };
}
