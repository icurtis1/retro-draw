import React from 'react';
import type { Tool } from '../types';

interface StatusPanelProps {
  isDrawing: boolean;
  isTyping: boolean;
  currentTool: Tool;
  brushSize: number;
  undoStackLength: number;
  cursorVisible: boolean;
  currentText: string;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  isDrawing,
  isTyping,
  currentTool,
  brushSize,
  undoStackLength,
  cursorVisible,
  currentText,
}) => {
  return (
    <div className="flex w-full">
      {/* Status */}
      <div className="flex-1 border-r border-dashed border-gray-300 p-3">
        <div className="space-y-2">
          <div className="text-xs text-gray-500 mb-2">STATUS</div>
          <div className="text-xs">
            {isDrawing ? 'DRAWING...' : isTyping ? 'TYPING...' : 'READY'}
          </div>
          {isTyping && (
            <div className="text-xs text-gray-400 mt-2">
              <div>ENTER: commit</div>
              <div>ESC: cancel</div>
            </div>
          )}
        </div>
      </div>

      {/* Current Tool Info */}
      <div className="flex-1 border-r border-dashed border-gray-300 p-3">
        <div className="space-y-2">
          <div className="text-xs text-gray-500 mb-2">CURRENT</div>
          <div className="text-xs">{currentTool.toUpperCase()}</div>
          <div className="text-xs text-gray-500 w-12 text-right transition-all duration-75">
            {brushSize % 1 === 0 ? brushSize : brushSize.toFixed(1)}PX
          </div>
          {isTyping && (
            <div className="text-xs text-gray-400 mt-2">
              TEXT: "{currentText}"
            </div>
          )}
        </div>
      </div>

      {/* Canvas Info */}
      <div className="flex-1 p-3">
        <div className="space-y-2">
          <div className="text-xs text-gray-500 mb-2">CANVAS</div>
          <div className="text-xs">1200×550</div>
          <div className="text-xs text-gray-500">STATES: {undoStackLength}</div>
          <div className="text-xs text-gray-500">
            CURSOR: {cursorVisible ? 'ON' : 'OFF'}
          </div>
        </div>
      </div>
    </div>
  );
};