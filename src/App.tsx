import React, { useRef, useEffect } from 'react';
import { getMousePos, initializeCanvas } from './utils/drawing';
import { useDrawing } from './hooks/useDrawing';
import { useTextTool } from './hooks/useTextTool';
import { Toolbar } from './components/Toolbar';
import { BrushSettings } from './components/BrushSettings';
import { ActionPanel } from './components/ActionPanel';
import { StatusPanel } from './components/StatusPanel';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Custom hooks for drawing and text functionality
  const {
    drawingState,
    selectedStamp,
    setStamp,
    setTool,
    setBrushSize,
    setColor,
    startDrawing,
    continueDrawing,
    endDrawing,
    clearCanvas,
    undo,
    saveImage,
    saveState,
  } = useDrawing({ canvasRef });

  const {
    isTyping,
    textPosition,
    currentText,
    cursorVisible,
    startTyping,
    commitText,
    cancelText,
    resetTextState,
    addCharacter,
    removeCharacter,
  } = useTextTool({ 
    canvasRef, 
    brushSize: drawingState.brushSize, 
    color: drawingState.color, 
    onSaveState: saveState 
  });

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      initializeCanvas(canvas);
    }
  }, []);

  // Update cursor style based on tool and brush size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (drawingState.tool === 'eraser') {
      const size = Math.max(8, drawingState.brushSize * 2);
      const cursorSvg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" 
                  fill="white" 
                  stroke="#666" 
                  stroke-width="1"/>
        </svg>
      `;
      const cursorUrl = `data:image/svg+xml;base64,${btoa(cursorSvg)}`;
      canvas.style.cursor = `url("${cursorUrl}") ${size/2} ${size/2}, crosshair`;
    } else if (drawingState.tool === 'stamp') {
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'crosshair';
    }
  }, [drawingState.tool, drawingState.brushSize, drawingState.color]);
  // Keyboard event handling for text tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle undo shortcut (Ctrl+Z or Cmd+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (drawingState.undoStack.length > 0) {
          undo();
        }
        return;
      }

      if (!isTyping) return;
      
      e.preventDefault();
      
      if (e.key === 'Enter') {
        commitText();
        resetTextState();
      } else if (e.key === 'Escape') {
        cancelText();
        resetTextState();
      } else if (e.key === 'Backspace') {
        removeCharacter();
      } else if (e.key.length === 1) {
        addCharacter(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, commitText, cancelText, resetTextState, addCharacter, removeCharacter, undo, drawingState.undoStack.length]);

  // Handle tool switching while typing
  const handleToolChange = (newTool: typeof drawingState.tool) => {
    if (isTyping && drawingState.tool === 'text' && newTool !== 'text') {
      if (currentText.trim()) {
        commitText();
        resetTextState();
      } else {
        cancelText();
        resetTextState();
      }
    }
    setTool(newTool);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getMousePos(canvas, e);
    
    // Handle text tool
    if (drawingState.tool === 'text') {
      // If already typing, commit current text first
      if (isTyping) {
        if (currentText.trim()) {
          commitText();
          resetTextState();
        } else {
          cancelText();
          resetTextState();
        }
      }
      
      // Start new text input
      startTyping(point);
      return;
    }
    
    // If clicking with another tool while typing, commit text first
    if (isTyping) {
      if (currentText.trim()) {
        commitText();
        resetTextState();
      } else {
        cancelText();
        resetTextState();
      }
    }
    
    // Handle other drawing tools
    startDrawing(point);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const point = getMousePos(canvas, e);
    continueDrawing(point);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const point = getMousePos(canvas, e);
    endDrawing(point);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
    
    // Handle text tool
    if (drawingState.tool === 'text') {
      if (isTyping) {
        if (currentText.trim()) {
          commitText();
          resetTextState();
        } else {
          cancelText();
          resetTextState();
        }
      }
      startTyping(point);
      return;
    }
    
    if (isTyping) {
      if (currentText.trim()) {
        commitText();
        resetTextState();
      } else {
        cancelText();
        resetTextState();
      }
    }
    
    startDrawing(point);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
    
    continueDrawing(point);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const touch = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
    
    endDrawing(point);
  };

  return (
    <div className="h-screen bg-white font-mono text-sm flex flex-col overflow-hidden">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-3 gap-0 h-full" style={{ gridTemplateRows: 'auto auto 1fr auto' }}>
        
        {/* Top Row */}
        <Toolbar currentTool={drawingState.tool} onToolChange={handleToolChange} />
        
        <BrushSettings
          brushSize={drawingState.brushSize}
          color={drawingState.color}
          currentTool={drawingState.tool}
          selectedStamp={drawingState.selectedStamp}
          onBrushSizeChange={setBrushSize}
          onColorChange={setColor}
          onStampChange={setStamp}
        />
        
        <ActionPanel
          onUndo={undo}
          onSave={saveImage}
          onClear={clearCanvas}
          canUndo={drawingState.undoStack.length > 0}
        />

        {/* Middle Row - Canvas spans all columns */}
        <div className="col-span-3 border-b border-dashed border-gray-300 p-3 flex items-center justify-center overflow-hidden">
          <div className="border border-dashed border-gray-300 relative" style={{ height: 'calc(100vh - 280px)', aspectRatio: '5/2' }}>
            <canvas
              ref={canvasRef}
              width={1000}
              height={400}
              className="w-full h-full touch-none object-contain"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>
        </div>

        {/* Bottom Row - Status Panels */}
        <StatusPanel
          isDrawing={drawingState.isDrawing}
          isTyping={isTyping}
          currentTool={drawingState.tool}
          brushSize={drawingState.brushSize}
          undoStackLength={drawingState.undoStack.length}
          cursorVisible={cursorVisible}
          currentText={currentText}
        />
      </div>
    </div>
  );
}

export default App;