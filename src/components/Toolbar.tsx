import React from 'react';
import { Pen, Eraser, Square, Circle, Minus, Type, Stamp } from 'lucide-react';
import type { Tool } from '../types';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const tools = [
  { tool: 'brush', icon: Pen, label: 'BRUSH' },
  { tool: 'eraser', icon: Eraser, label: 'ERASER' },
  { tool: 'line', icon: Minus, label: 'LINE' },
  { tool: 'rectangle', icon: Square, label: 'RECT' },
  { tool: 'circle', icon: Circle, label: 'CIRCLE' },
  { tool: 'text', icon: Type, label: 'TEXT' },
  { tool: 'stamp', icon: Stamp, label: 'STAMP' },
] as const;

export const Toolbar: React.FC<ToolbarProps> = ({ currentTool, onToolChange }) => {
  return (
    <div className="p-3">
      <div className="space-y-4">
        <div>
          <div className="text-xs text-gray-500 mb-2">TOOLS</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {tools.map(({ tool, icon: Icon, label }) => (
              <button
                key={tool}
                onClick={() => onToolChange(tool as Tool)}
                className={`text-left px-2 py-1 text-xs transition-colors ${
                  currentTool === tool
                    ? 'bg-gray-100 text-black'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                <Icon size={12} className="inline mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};