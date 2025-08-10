import React from 'react';
import type { StampType } from '../utils/stamps';

interface BrushSettingsProps {
  brushSize: number;
  color: string;
  currentTool: string;
  selectedStamp: StampType;
  onBrushSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  onStampChange: (stamp: StampType) => void;
}

const colorPresets = ['#000000', '#404040', '#808080', '#c0c0c0', '#e0e0e0'];
const stampOptions: { type: StampType; label: string }[] = [
  { type: 'computer', label: 'MAC' },
  { type: 'disk', label: 'DISK' },
  { type: 'bomb', label: 'BOMB' },
  { type: 'hand', label: 'HAND' },
  { type: 'trash', label: 'TRASH' },
];

export const BrushSettings: React.FC<BrushSettingsProps> = ({
  brushSize,
  color,
  currentTool,
  selectedStamp,
  onBrushSizeChange,
  onColorChange,
  onStampChange,
}) => {
  return (
    <div className="border-r border-b border-dashed border-gray-300 p-4">
      <div className="space-y-4">
        <div>
          <div className="text-xs text-gray-500 mb-2">SIZE</div>
          <input
            type="range"
            min="1"
            max="20"
            step="0.1"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="w-full retro-slider"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-500 transition-all duration-75">
              {brushSize % 1 === 0 ? brushSize : brushSize.toFixed(1)}px
            </div>
          </div>
        </div>
        
        {currentTool !== 'stamp' && (
        <div>
          <div className="text-xs text-gray-500 mb-2">COLOR</div>
          <div className="flex space-x-1 mb-2">
            {colorPresets.map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={`w-6 h-6 border transition-all flex-shrink-0 ${
                  color === c ? 'border-black border-2' : 'border-gray-300'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-full h-6 max-w-32"
          />
        </div>
        )}
        
        {currentTool === 'stamp' && (
          <div>
            <div className="text-xs text-gray-500 mb-2">STAMPS</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {stampOptions.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => onStampChange(type)}
                  className={`text-center px-1 py-1 text-xs transition-colors ${
                    selectedStamp === type
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    {selectedStamp === type && (
                      <span className="inline-block w-1.5 h-1.5 bg-black rounded-full mr-1"></span>
                    )}
                    {label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};