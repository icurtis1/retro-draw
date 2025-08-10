import { useState, useCallback } from 'react';
import type { DrawingState, Point, Tool } from '../types';
import type { StampType } from '../utils/stamps';
import { drawLine, drawRectangle, drawCircle, saveCanvasState } from '../utils/drawing';
import { drawStamp } from '../utils/stamps';

interface UseDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const useDrawing = ({ canvasRef }: UseDrawingProps) => {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    tool: 'brush',
    brushSize: 2,
    color: '#000000',
    lastPoint: null,
    startPoint: null,
    undoStack: [],
    previewImageData: null,
  });

  const [selectedStamp, setSelectedStamp] = useState<StampType>('computer');
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = saveCanvasState(canvas);
      setDrawingState(prev => {
        const newStack = [...prev.undoStack, dataUrl];
        return {
          ...prev,
          undoStack: newStack.length > 20 ? newStack.slice(1) : newStack
        };
      });
    }
  }, []);

  const setTool = useCallback((tool: Tool) => {
    setDrawingState(prev => ({ ...prev, tool }));
  }, []);

  const setBrushSize = useCallback((size: number) => {
    setDrawingState(prev => ({ ...prev, brushSize: size }));
  }, []);

  const setColor = useCallback((color: string) => {
    setDrawingState(prev => ({ ...prev, color }));
  }, []);

  const setStamp = useCallback((stamp: StampType) => {
    setSelectedStamp(stamp);
  }, []);
  const startDrawing = useCallback((point: Point) => {
    // Handle stamp tool - immediate action
    if (drawingState.tool === 'stamp') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        saveState();
        drawStamp(ctx, point, selectedStamp, drawingState.brushSize * 16);
      }
      return;
    }

    setDrawingState(prev => ({
      ...prev,
      isDrawing: true,
      lastPoint: point,
      startPoint: point,
    }));

    const canvas = canvasRef.current;
    if (canvas && (drawingState.tool === 'brush' || drawingState.tool === 'eraser')) {
      saveState();
    } else if (canvas && (drawingState.tool === 'line' || drawingState.tool === 'rectangle' || drawingState.tool === 'circle')) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setDrawingState(prev => ({ ...prev, previewImageData: imageData }));
      }
    }
  }, [drawingState.tool, drawingState.brushSize, selectedStamp, saveState]);

  const continueDrawing = useCallback((point: Point) => {
    // Stamp tool doesn't have continuous drawing
    if (drawingState.tool === 'stamp') return;
    
    if (!drawingState.isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.lineWidth = drawingState.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Ensure crispy lines for each drawing operation
    ctx.imageSmoothingEnabled = false;

    if (drawingState.tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawingState.color;
      if (drawingState.lastPoint) {
        drawLine(ctx, drawingState.lastPoint, point);
      }
      setDrawingState(prev => ({ ...prev, lastPoint: point }));
    } else if (drawingState.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      if (drawingState.lastPoint) {
        drawLine(ctx, drawingState.lastPoint, point);
      }
      setDrawingState(prev => ({ ...prev, lastPoint: point }));
    } else if ((drawingState.tool === 'line' || drawingState.tool === 'rectangle' || drawingState.tool === 'circle') && 
               drawingState.startPoint && drawingState.previewImageData) {
      // Show live preview of shapes
      ctx.putImageData(drawingState.previewImageData, 0, 0);
      ctx.lineWidth = drawingState.brushSize;
      ctx.strokeStyle = drawingState.color;
      ctx.globalCompositeOperation = 'source-over';

      if (drawingState.tool === 'line') {
        drawLine(ctx, drawingState.startPoint, point);
      } else if (drawingState.tool === 'rectangle') {
        drawRectangle(ctx, drawingState.startPoint, point);
      } else if (drawingState.tool === 'circle') {
        drawCircle(ctx, drawingState.startPoint, point);
      }
    }
  }, [drawingState]);

  const endDrawing = useCallback((point: Point) => {
    if (!drawingState.isDrawing || !drawingState.startPoint) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    if (drawingState.tool === 'line' || drawingState.tool === 'rectangle' || drawingState.tool === 'circle') {
      saveState();
      ctx.lineWidth = drawingState.brushSize;
      ctx.strokeStyle = drawingState.color;
      ctx.globalCompositeOperation = 'source-over';

      if (drawingState.tool === 'line') {
        drawLine(ctx, drawingState.startPoint, point);
      } else if (drawingState.tool === 'rectangle') {
        drawRectangle(ctx, drawingState.startPoint, point);
      } else if (drawingState.tool === 'circle') {
        drawCircle(ctx, drawingState.startPoint, point);
      }
    }

    setDrawingState(prev => ({
      ...prev,
      isDrawing: false,
      lastPoint: null,
      startPoint: null,
      previewImageData: null,
    }));
  }, [drawingState, saveState]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      saveState();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [saveState]);

  const undo = useCallback(() => {
    if (drawingState.undoStack.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const lastState = drawingState.undoStack[drawingState.undoStack.length - 1];
        setDrawingState(prev => ({ 
          ...prev, 
          undoStack: prev.undoStack.slice(0, -1) 
        }));
        
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = lastState;
      }
    }
  }, [drawingState.undoStack]);

  const saveImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `drawing-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  }, []);

  return {
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
  };
};