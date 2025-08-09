import type { Point } from '../types';

export type StampType = 'computer' | 'disk' | 'bomb' | 'hand' | 'trash';

const stampImages: Record<StampType, HTMLImageElement | null> = {
  computer: null,
  disk: null,
  bomb: null,
  hand: null,
  trash: null,
};

const imagePromises: Record<StampType, Promise<HTMLImageElement> | null> = {
  computer: null,
  disk: null,
  bomb: null,
  hand: null,
  trash: null,
};

// Load stamp images from public folder
export const loadStampImage = (stampType: StampType): Promise<HTMLImageElement> => {
  if (stampImages[stampType]) {
    return Promise.resolve(stampImages[stampType]!);
  }
  
  if (imagePromises[stampType]) {
    return imagePromises[stampType]!;
  }
  
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      stampImages[stampType] = img;
      resolve(img);
    };
    img.onerror = () => {
      // Fallback to programmatic drawing if image not found
      console.warn(`Stamp image not found: ${stampType}.png, using fallback`);
      resolve(createFallbackImage(stampType));
    };
    img.src = `/stamps/${stampType}.png`;
  });
  
  imagePromises[stampType] = promise;
  return promise;
};

// Create fallback programmatic images if PNGs aren't available
const createFallbackImage = (stampType: StampType): HTMLImageElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  
  // Draw fallback icon programmatically
  ctx.translate(16, 16); // Center at 16,16
  
  switch (stampType) {
    case 'computer':
      drawComputer(ctx, 32);
      break;
    case 'disk':
      drawDisk(ctx, 32);
      break;
    case 'bomb':
      drawBomb(ctx, 32);
      break;
    case 'hand':
      drawHand(ctx, 32);
      break;
    case 'trash':
      drawTrash(ctx, 32);
      break;
  }
  
  const img = new Image();
  img.src = canvas.toDataURL();
  stampImages[stampType] = img;
  return img;
};

export const drawStamp = async (
  ctx: CanvasRenderingContext2D, 
  position: Point, 
  stampType: StampType, 
  size: number = 32
) => {
  try {
    const img = await loadStampImage(stampType);
    
    // Calculate dimensions while preserving aspect ratio
    const imgAspectRatio = img.width / img.height;
    let drawWidth = size;
    let drawHeight = size;
    
    if (imgAspectRatio > 1) {
      // Image is wider than tall
      drawHeight = size / imgAspectRatio;
    } else {
      // Image is taller than wide
      drawWidth = size * imgAspectRatio;
    }
    
    // Draw the image centered at the position with preserved aspect ratio
    ctx.drawImage(
      img, 
      position.x - drawWidth / 2, 
      position.y - drawHeight / 2, 
      drawWidth, 
      drawHeight
    );
  } catch (error) {
    console.error('Failed to draw stamp:', error);
  }
};

// Fallback drawing functions (same as before)
const drawComputer = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.fillStyle = '#F0F0F0';
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 1;
  
  // Monitor
  ctx.fillRect(-size/2, -size/2, size, size * 3/4);
  ctx.strokeRect(-size/2, -size/2, size, size * 3/4);
  
  // Screen
  ctx.fillStyle = '#000000';
  ctx.fillRect(-size/2 + 4, -size/2 + 4, size - 8, size * 3/4 - 12);
  
  // Base
  ctx.fillStyle = '#E0E0E0';
  ctx.fillRect(-size/3, size/4 - size/8, size * 2/3, size/8);
  ctx.strokeRect(-size/3, size/4 - size/8, size * 2/3, size/8);
};

const drawDisk = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 1;
  
  // Disk body
  ctx.fillRect(-size/2, -size/2, size, size);
  ctx.strokeRect(-size/2, -size/2, size, size);
  
  // Label area
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-size/2 + 4, -size/2 + 4, size - 8, size/3);
  
  // Metal slider
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(size/2 - 6, -size/2, 4, size/4);
};

const drawBomb = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 1;
  
  // Bomb body (circle)
  ctx.beginPath();
  ctx.arc(0, size/8, size/3, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  // Fuse
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size/6, -size/6);
  ctx.lineTo(-size/3, -size/2);
  ctx.stroke();
  
  // Spark
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(-size/3, -size/2, 2, 0, 2 * Math.PI);
  ctx.fill();
};

const drawHand = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.fillStyle = '#FFDBAC';
  ctx.strokeStyle = '#D2B48C';
  ctx.lineWidth = 1;
  
  // Palm
  ctx.beginPath();
  ctx.ellipse(0, 0, size/4, size/3, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  
  // Fingers
  for (let i = 0; i < 4; i++) {
    const x = -size/6 + (i * size/8);
    ctx.fillRect(x, -size/3, size/12, size/4);
    ctx.strokeRect(x, -size/3, size/12, size/4);
  }
  
  // Thumb
  ctx.fillRect(-size/3, -size/8, size/8, size/6);
  ctx.strokeRect(-size/3, -size/8, size/8, size/6);
};

const drawTrash = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.fillStyle = '#C0C0C0';
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 1;
  
  // Trash can body
  ctx.fillRect(-size/3, -size/3, size * 2/3, size * 2/3);
  ctx.strokeRect(-size/3, -size/3, size * 2/3, size * 2/3);
  
  // Lid
  ctx.fillRect(-size/2.5, -size/2, size * 4/5, size/8);
  ctx.strokeRect(-size/2.5, -size/2, size * 4/5, size/8);
  
  // Handle
  ctx.beginPath();
  ctx.arc(0, -size/2 - size/16, size/8, 0, Math.PI, true);
  ctx.stroke();
};