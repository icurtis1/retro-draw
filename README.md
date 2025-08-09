# Retro Draw

🎨 **Live Demo:** [http://draw-gpt5.netlify.app](http://draw-gpt5.netlify.app)

A nostalgic pixel-perfect drawing application inspired by classic 90s software. Create digital art with authentic retro tools and aesthetics.

## Features

### Drawing Tools
- **Brush** - Freehand drawing with adjustable size
- **Eraser** - Remove parts of your drawing
- **Line** - Draw straight lines
- **Rectangle** - Create rectangular shapes
- **Circle** - Draw perfect circles
- **Text** - Add text with retro monospace font
- **Stamp** - Place retro icons (computer, disk, bomb, hand, trash)

### Controls
- **Size slider** - Adjust brush/tool size from 1-20px
- **Color palette** - Quick access to grayscale presets
- **Color picker** - Choose any custom color
- **Undo** - Step back through your drawing history (Ctrl/Cmd+Z)
- **Save** - Download your artwork as PNG
- **Clear** - Start with a fresh canvas

### Mobile Optimized
- Touch-friendly interface
- Prevents scrolling while drawing
- Responsive design for all screen sizes
- Proper touch event handling

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Tech Stack
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Canvas API for drawing
- Lucide React for icons

## Usage

1. Select a drawing tool from the left panel
2. Adjust size and color in the middle panel
3. Click or touch the canvas to start drawing
4. Use keyboard shortcuts:
   - `Ctrl/Cmd + Z` - Undo last action
   - `Enter` - Commit text (when using text tool)
   - `Escape` - Cancel text input

## Browser Compatibility

Works in all modern browsers with HTML5 Canvas support:
- Chrome/Chromium 80+
- Firefox 74+
- Safari 13+
- Edge 80+

## License

Open source - feel free to use and modify for your own projects.