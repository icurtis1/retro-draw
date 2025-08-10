import type { Point } from '../types';

export const getMousePos = (canvas: HTMLCanvasElement, e: React.MouseEvent): Point => {
  const rect = canvas.getBoundingClientRect();
  
  // Account for any CSS scaling/letterboxing
  const canvasAspectRatio = canvas.width / canvas.height;
  const containerAspectRatio = rect.width / rect.height;
  
  let actualCanvasRect = rect;
  
  // If container is wider than canvas aspect ratio, there's horizontal letterboxing
  if (containerAspectRatio > canvasAspectRatio) {
    const actualWidth = rect.height * canvasAspectRatio;
    const offsetX = (rect.width - actualWidth) / 2;
    actualCanvasRect = {
      left: rect.left + offsetX,
      top: rect.top,
      width: actualWidth,
      height: rect.height
    };
  }
  // If container is taller than canvas aspect ratio, there's vertical letterboxing
  else if (containerAspectRatio < canvasAspectRatio) {
    const actualHeight = rect.width / canvasAspectRatio;
    const offsetY = (rect.height - actualHeight) / 2;
    actualCanvasRect = {
      left: rect.left,
      top: rect.top + offsetY,
      width: rect.width,
      height: actualHeight
    };
  }
  
  const scaleX = canvas.width / actualCanvasRect.width;
  const scaleY = canvas.height / actualCanvasRect.height;
  
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - actualCanvasRect.left) * scaleX,
    y: (e.clientY - actualCanvasRect.top) * scaleY
  };
};

export const drawLine = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
};

export const drawRectangle = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
  ctx.beginPath();
  ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y);
  ctx.stroke();
};

export const drawCircle = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
  // Calculate the diameter as the distance between start and current point
  const diameter = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  const radius = diameter / 2;
  
  // Center the circle at the midpoint between start and current position
  const centerX = (from.x + to.x) / 2;
  const centerY = (from.y + to.y) / 2;
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();
};

export const initializeCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
};

export const saveCanvasState = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL();
};

export const restoreCanvasState = (canvas: HTMLCanvasElement, dataUrl: string) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = dataUrl;
};