import React from 'react';
import { RotateCcw, Download, Trash2 } from 'lucide-react';

interface ActionPanelProps {
  onUndo: () => void;
  onSave: () => void;
  onClear: () => void;
  canUndo: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  onUndo,
  onSave,
  onClear,
  canUndo,
}) => {
  return (
    <div className="border-b border-dashed border-gray-300 p-4">
      <div className="space-y-2">
        <div className="text-xs text-gray-500 mb-3">ACTIONS</div>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="w-full text-left px-2 py-1 text-xs text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RotateCcw size={12} className="inline mr-2" />
          UNDO
        </button>
        <button
          onClick={onSave}
          className="w-full text-left px-2 py-1 text-xs text-gray-500 hover:text-black"
        >
          <Download size={12} className="inline mr-2" />
          SAVE
        </button>
        <button
          onClick={onClear}
          className="w-full text-left px-2 py-1 text-xs text-gray-500 hover:text-black"
        >
          <Trash2 size={12} className="inline mr-2" />
          CLEAR
        </button>
      </div>
    </div>
  );
};