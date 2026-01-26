'use client';

import { Design } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, FolderOpen } from 'lucide-react';

interface DesignsListProps {
  designs: Design[];
  currentDesignId: string | null;
  loading: boolean;
  onLoadDesign: (id: string) => void;
  onDeleteDesign: (id: string) => void;
}

export default function DesignsList({
  designs,
  currentDesignId,
  loading,
  onLoadDesign,
  onDeleteDesign,
}: DesignsListProps) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <Label className="text-sm font-medium">Saved Designs</Label>
        <div className="mt-3 flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4">
      <Label className="text-sm font-medium flex items-center gap-2">
        <FolderOpen className="w-4 h-4" />
        Saved Designs ({designs.length})
      </Label>
      {designs.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-3">
          No saved designs yet. Create one and save it!
        </p>
      ) : (
        <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {designs.map((design) => (
            <div
              key={design.id}
              className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                currentDesignId === design.id
                  ? 'bg-purple-500/20 border border-purple-500/50'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <button
                onClick={() => onLoadDesign(design.id)}
                className="flex-1 text-left"
              >
                <div className="text-sm font-medium truncate">{design.name}</div>
                <div className="text-xs text-muted-foreground">
                  {design.cols}×{design.rows} • {new Date(design.updated_at).toLocaleDateString()}
                </div>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this design?')) {
                    onDeleteDesign(design.id);
                  }
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
