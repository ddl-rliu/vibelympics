/**
 * IntroAnimation Component - Demonstrates game mechanics to new players
 * Shows a simulated mini-race to teach the core gameplay
 */

import { useState, useEffect, useCallback } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

// Simplified mini-track for demo (12x8 grid)
const DEMO_TRACK = [
  ['🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩'],
  ['🟩', '🟩', '😃', '😃', '🟩', '🟩', '🟩', '🟩', '😃', '🤓', '🟩', '🟩'],
  ['🟩', '⬛', '⬛', '⬛', '🏁', '⬛', '⬛', '⬛', '⬛', '⬛', '⬛', '🟩'],
  ['🟩', '⬛', '⬛', '⬛', '🏁', '⬛', '⬛', '⬛', '⬛', '⬛', '⬛', '🟩'],
  ['🟩', '⬛', '⬛', '🟩', '🟩', '🟩', '🟩', '🟩', '⬛', '⬛', '⬛', '🟩'],
  ['🟩', '⬛', '⬛', '⬛', '⬛', '⬛', '⬛', '⬛', '⬛', '⬛', '⬛', '🟩'],
  ['🟩', '🟩', '😪', '😛', '🤔', '😃', '😃', '😆', '😎', '🟩', '🟩', '🟩'],
  ['🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩'],
];

// Demo animation frames - simulated game moves
interface DemoFrame {
  playerPos: { x: number; y: number };
  aiPos: { x: number; y: number };
  validMoves?: { x: number; y: number }[];
  highlight?: 'player' | 'ai' | 'moves';
  showCheckpoint?: boolean;
}

const DEMO_FRAMES: DemoFrame[] = [
  // Starting positions
  { playerPos: { x: 3, y: 3 }, aiPos: { x: 3, y: 2 }, highlight: 'player', validMoves: [
    { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
    { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
    { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
  ]},
  // Player moves - show move selection
  { playerPos: { x: 3, y: 3 }, aiPos: { x: 3, y: 2 }, highlight: 'moves', validMoves: [
    { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
    { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
    { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
  ]},
  // Player selects move to the right
  { playerPos: { x: 5, y: 3 }, aiPos: { x: 3, y: 2 }, highlight: 'player' },
  // AI's turn
  { playerPos: { x: 5, y: 3 }, aiPos: { x: 5, y: 2 }, highlight: 'ai' },
  // Player accelerates
  { playerPos: { x: 8, y: 3 }, aiPos: { x: 5, y: 2 }, highlight: 'player' },
  // AI accelerates
  { playerPos: { x: 8, y: 3 }, aiPos: { x: 8, y: 2 }, highlight: 'ai' },
  // Player curves down
  { playerPos: { x: 10, y: 4 }, aiPos: { x: 8, y: 2 }, highlight: 'player' },
  // AI curves
  { playerPos: { x: 10, y: 4 }, aiPos: { x: 10, y: 3 }, highlight: 'ai' },
  // Player continues
  { playerPos: { x: 10, y: 5 }, aiPos: { x: 10, y: 3 }, highlight: 'player' },
  // AI continues
  { playerPos: { x: 10, y: 5 }, aiPos: { x: 10, y: 5 }, highlight: 'ai' },
  // Player heading left
  { playerPos: { x: 8, y: 5 }, aiPos: { x: 10, y: 5 }, highlight: 'player' },
  // AI follows
  { playerPos: { x: 8, y: 5 }, aiPos: { x: 8, y: 5 }, highlight: 'ai' },
  // Player accelerates to finish
  { playerPos: { x: 5, y: 5 }, aiPos: { x: 8, y: 5 }, highlight: 'player' },
  // AI catching up
  { playerPos: { x: 5, y: 5 }, aiPos: { x: 5, y: 5 }, highlight: 'ai' },
  // Player curves up
  { playerPos: { x: 2, y: 4 }, aiPos: { x: 5, y: 5 }, highlight: 'player' },
  // AI curves
  { playerPos: { x: 2, y: 4 }, aiPos: { x: 2, y: 5 }, highlight: 'ai' },
  // Player near finish
  { playerPos: { x: 2, y: 3 }, aiPos: { x: 2, y: 5 }, highlight: 'player' },
  // AI catching up
  { playerPos: { x: 2, y: 3 }, aiPos: { x: 1, y: 3 }, highlight: 'ai' },
  // Player crosses finish!
  { playerPos: { x: 4, y: 3 }, aiPos: { x: 1, y: 3 }, highlight: 'player', showCheckpoint: true },
];

function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);

  const currentFrame = DEMO_FRAMES[frameIndex];

  // Auto-advance frames
  useEffect(() => {
    if (frameIndex >= DEMO_FRAMES.length - 1) {
      // Animation complete, show start button
      setTimeout(() => setShowStartButton(true), 500);
      return;
    }

    const timer = setTimeout(() => {
      setFrameIndex(prev => prev + 1);
    }, 800); // 800ms per frame

    return () => clearTimeout(timer);
  }, [frameIndex]);

  // Render demo track cell
  const renderCell = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    let content = DEMO_TRACK[y][x];
    
    // Check if this is a car position
    const isPlayer = currentFrame.playerPos.x === x && currentFrame.playerPos.y === y;
    const isAi = currentFrame.aiPos.x === x && currentFrame.aiPos.y === y;
    const isValidMove = currentFrame.validMoves?.some(m => m.x === x && m.y === y);
    
    if (isPlayer) {
      content = '🚙';
    } else if (isAi) {
      content = '🚗';
    }

    return (
      <div
        key={key}
        className={`
          w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-xl md:text-2xl
          ${isPlayer && currentFrame.highlight === 'player' ? 'animate-pulse ring-2 ring-blue-400 rounded' : ''}
          ${isAi && currentFrame.highlight === 'ai' ? 'animate-pulse ring-2 ring-red-400 rounded' : ''}
          relative
        `}
      >
        {content}
        {isValidMove && currentFrame.highlight === 'moves' && (
          <span className="absolute text-sm animate-pulse">🔴</span>
        )}
      </div>
    );
  }, [currentFrame]);

  // Generate all cells
  const cells = [];
  for (let y = 0; y < DEMO_TRACK.length; y++) {
    for (let x = 0; x < DEMO_TRACK[0].length; x++) {
      cells.push(renderCell(x, y));
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Demo track */}
      <div className="mb-8">
        {/* Legend */}
        <div className="flex justify-center gap-4 mb-4 text-2xl">
          <span className={currentFrame.highlight === 'player' ? 'animate-bounce' : ''}>🚙</span>
          <span>⚔️</span>
          <span className={currentFrame.highlight === 'ai' ? 'animate-bounce' : ''}>🚗</span>
        </div>

        {/* Track grid */}
        <div 
          className="grid gap-0 bg-black/30 rounded-lg p-2"
          style={{ gridTemplateColumns: `repeat(${DEMO_TRACK[0].length}, 1fr)` }}
        >
          {cells}
        </div>

        {/* Turn indicator */}
        <div className="flex justify-center mt-4 text-3xl">
          {currentFrame.highlight === 'player' && <span className="animate-pulse">🚙➡️</span>}
          {currentFrame.highlight === 'ai' && <span className="animate-pulse">🚗➡️</span>}
          {currentFrame.highlight === 'moves' && <span className="animate-pulse">🔴👆</span>}
        </div>

        {/* Checkpoint indicator */}
        {currentFrame.showCheckpoint && (
          <div className="flex justify-center mt-4 text-4xl animate-bounce">
            🏁🎉🏆
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mb-6">
        {DEMO_FRAMES.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i <= frameIndex ? 'bg-yellow-400' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Start button */}
      {showStartButton && (
        <button
          onClick={onComplete}
          className="start-button text-6xl animate-bounce hover:scale-110 transition-transform"
        >
          ▶️
        </button>
      )}
    </div>
  );
}

export default IntroAnimation;

