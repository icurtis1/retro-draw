import { useState, useEffect, useCallback } from 'react';
import type { Point, TextState } from '../types';

interface UseTextToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  brushSize: number;
  color: string;
  onSaveState: () => void;
}

export const useTextTool = ({ canvasRef, brushSize, color, onSaveState }: UseTextToolProps) => {
  const [textState, setTextState] = useState<TextState>({
    isTyping: false,
    textPosition: null,
    currentText: '',
    cursorVisible: true,
    savedCanvasState: null,
  });

  // Handle cursor blinking
  useEffect(() => {
    if (!textState.isTyping) {
      setTextState(prev => ({ ...prev, cursorVisible: true }));
      return;
    }
    
    const interval = setInterval(() => {
      setTextState(prev => ({ ...prev, cursorVisible: !prev.cursorVisible }));
    }, 500);
    
    return () => clearInterval(interval);
  }, [textState.isTyping]);

  // Render text preview and cursor (always temporary)
  useEffect(() => {
    if (!textState.isTyping || !textState.textPosition || !canvasRef.current || !textState.savedCanvasState) {
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // ALWAYS restore from saved state first (this prevents cursor persistence)
    ctx.putImageData(textState.savedCanvasState, 0, 0);
    
    // Set text properties
    ctx.font = `${brushSize * 8}px monospace`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    
    // Disable smoothing for crispy text
    ctx.imageSmoothingEnabled = false;
    
    // Draw current text if any
    if (textState.currentText) {
      ctx.fillText(textState.currentText, textState.textPosition.x, textState.textPosition.y);
    }
    
    // Draw blinking cursor (temporary only)
    if (textState.cursorVisible) {
      const textWidth = ctx.measureText(textState.currentText).width;
      ctx.fillRect(textState.textPosition.x + textWidth, textState.textPosition.y, 1, brushSize * 8);
    }
  }, [textState.isTyping, textState.textPosition, textState.currentText, textState.cursorVisible, brushSize, color, textState.savedCanvasState]);

  const startTyping = useCallback((position: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save the current canvas state BEFORE any text/cursor rendering
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    setTextState({
      isTyping: true,
      textPosition: position,
      currentText: '',
      cursorVisible: true,
      savedCanvasState: imageData,
    });
    
    console.log('Started typing at:', position);
  }, []);

  const commitText = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!ctx || !textState.currentText.trim() || !textState.textPosition || !textState.savedCanvasState) {
      console.log('Commit text - no valid text to commit');
      return;
    }

    // Save state for undo before committing
    onSaveState();
    
    // Restore original canvas state first
    ctx.putImageData(textState.savedCanvasState, 0, 0);
    
    // Now permanently draw the text
    ctx.font = `${brushSize * 8}px monospace`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    ctx.imageSmoothingEnabled = false;
    ctx.fillText(textState.currentText, textState.textPosition.x, textState.textPosition.y);
    
    console.log('Text committed:', textState.currentText);
  }, [textState, brushSize, color, onSaveState]);

  const cancelText = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (ctx && textState.savedCanvasState) {
      // Restore canvas to state before typing started (no cursor artifacts)
      ctx.putImageData(textState.savedCanvasState, 0, 0);
      console.log('Text cancelled, canvas restored');
    }
  }, [textState.savedCanvasState]);

  const resetTextState = useCallback(() => {
    setTextState({
      isTyping: false,
      textPosition: null,
      currentText: '',
      cursorVisible: true,
      savedCanvasState: null,
    });
    console.log('Text state reset');
  }, []);

  const addCharacter = useCallback((char: string) => {
    setTextState(prev => ({ ...prev, currentText: prev.currentText + char }));
  }, []);

  const removeCharacter = useCallback(() => {
    setTextState(prev => ({ ...prev, currentText: prev.currentText.slice(0, -1) }));
  }, []);

  return {
    ...textState,
    startTyping,
    commitText,
    cancelText,
    resetTextState,
    addCharacter,
    removeCharacter,
  };
};