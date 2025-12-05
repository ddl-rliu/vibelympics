/**
 * IntroAnimation Component - Demonstrates game mechanics to new players
 * Shows a simulated mini-race moving counter-clockwise with history trails
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

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

// Demo animation frames - counter-clockwise movement
// Start near finish, go DOWN left side, then RIGHT across bottom, then UP right side, back to finish
interface DemoFrame {
  playerPos: { x: number; y: number };
  aiPos: { x: number; y: number };
  validMoves?: { x: number; y: number }[];
  highlight?: 'player' | 'ai' | 'moves';
  showCheckpoint?: boolean;
}

const DEMO_FRAMES: DemoFrame[] = [
  // Starting positions near finish line
  { playerPos: { x: 3, y: 3 }, aiPos: { x: 3, y: 2 }, highlight: 'player', validMoves: [
    { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
    { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
    { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
  ]},
  // Show move selection
  { playerPos: { x: 3, y: 3 }, aiPos: { x: 3, y: 2 }, highlight: 'moves', validMoves: [
    { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
    { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
    { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
  ]},
  // Player moves DOWN (counter-clockwise - going left/down first)
  { playerPos: { x: 2, y: 4 }, aiPos: { x: 3, y: 2 }, highlight: 'player' },
  // AI moves DOWN
  { playerPos: { x: 2, y: 4 }, aiPos: { x: 2, y: 3 }, highlight: 'ai' },
  // Player continues DOWN
  { playerPos: { x: 1, y: 5 }, aiPos: { x: 2, y: 3 }, highlight: 'player' },
  // AI continues DOWN
  { playerPos: { x: 1, y: 5 }, aiPos: { x: 1, y: 4 }, highlight: 'ai' },
  // Player turns RIGHT at bottom
  { playerPos: { x: 2, y: 5 }, aiPos: { x: 1, y: 4 }, highlight: 'player' },
  // AI continues
  { playerPos: { x: 2, y: 5 }, aiPos: { x: 1, y: 5 }, highlight: 'ai' },
  // Player moves RIGHT
  { playerPos: { x: 4, y: 5 }, aiPos: { x: 1, y: 5 }, highlight: 'player' },
  // AI follows
  { playerPos: { x: 4, y: 5 }, aiPos: { x: 3, y: 5 }, highlight: 'ai' },
  // Player continues RIGHT
  { playerPos: { x: 7, y: 5 }, aiPos: { x: 3, y: 5 }, highlight: 'player' },
  // AI catches up
  { playerPos: { x: 7, y: 5 }, aiPos: { x: 6, y: 5 }, highlight: 'ai' },
  // Player turns UP on right side
  { playerPos: { x: 9, y: 4 }, aiPos: { x: 6, y: 5 }, highlight: 'player' },
  // AI follows
  { playerPos: { x: 9, y: 4 }, aiPos: { x: 9, y: 5 }, highlight: 'ai' },
  // Player continues UP
  { playerPos: { x: 10, y: 3 }, aiPos: { x: 9, y: 5 }, highlight: 'player' },
  // AI continues
  { playerPos: { x: 10, y: 3 }, aiPos: { x: 10, y: 4 }, highlight: 'ai' },
  // Player approaches finish
  { playerPos: { x: 9, y: 2 }, aiPos: { x: 10, y: 4 }, highlight: 'player' },
  // AI catching up
  { playerPos: { x: 9, y: 2 }, aiPos: { x: 10, y: 3 }, highlight: 'ai' },
  // Player crosses finish!
  { playerPos: { x: 6, y: 2 }, aiPos: { x: 10, y: 3 }, highlight: 'player', showCheckpoint: true },
];

function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);

  const currentFrame = DEMO_FRAMES[frameIndex];

  // Build history arrays from all frames up to current
  const playerHistory = useMemo(() => {
    const history: { x: number; y: number }[] = [];
    const seen = new Set<string>();
    for (let i = 0; i <= frameIndex; i++) {
      const pos = DEMO_FRAMES[i].playerPos;
      const key = `${pos.x},${pos.y}`;
      if (!seen.has(key)) {
        history.push(pos);
        seen.add(key);
      }
    }
    return history;
  }, [frameIndex]);

  const aiHistory = useMemo(() => {
    const history: { x: number; y: number }[] = [];
    const seen = new Set<string>();
    for (let i = 0; i <= frameIndex; i++) {
      const pos = DEMO_FRAMES[i].aiPos;
      const key = `${pos.x},${pos.y}`;
      if (!seen.has(key)) {
        history.push(pos);
        seen.add(key);
      }
    }
    return history;
  }, [frameIndex]);

  // Auto-advance frames
  useEffect(() => {
    if (frameIndex >= DEMO_FRAMES.length - 1) {
      // Animation complete, show start button
      setTimeout(() => setShowStartButton(true), 500);
      return;
    }

    const timer = setTimeout(() => {
      setFrameIndex(prev => prev + 1);
    }, 700); // 700ms per frame

    return () => clearTimeout(timer);
  }, [frameIndex]);

  // Check if position is in history (not current position)
  const isInPlayerHistory = useCallback((x: number, y: number) => {
    return playerHistory.some((pos, idx) => 
      pos.x === x && pos.y === y && 
      idx < playerHistory.length - 1 // Not the current position
    );
  }, [playerHistory]);

  const isInAiHistory = useCallback((x: number, y: number) => {
    return aiHistory.some((pos, idx) => 
      pos.x === x && pos.y === y && 
      idx < aiHistory.length - 1 // Not the current position
    );
  }, [aiHistory]);

  // Render demo track cell
  const renderCell = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    let content = DEMO_TRACK[y][x];
    
    // Check if this is a car position
    const isPlayer = currentFrame.playerPos.x === x && currentFrame.playerPos.y === y;
    const isAi = currentFrame.aiPos.x === x && currentFrame.aiPos.y === y;
    const isValidMove = currentFrame.validMoves?.some(m => m.x === x && m.y === y);
    const inPlayerHist = isInPlayerHistory(x, y);
    const inAiHist = isInAiHistory(x, y);
    
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
        
        {/* History markers */}
        {inPlayerHist && !isAi && (
          <span className="absolute text-xs opacity-40">🚙</span>
        )}
        {inAiHist && !isPlayer && (
          <span className="absolute text-xs opacity-40">🚗</span>
        )}
        
        {isValidMove && currentFrame.highlight === 'moves' && (
          <span className="absolute text-sm animate-pulse">🔴</span>
        )}
      </div>
    );
  }, [currentFrame, isInPlayerHistory, isInAiHistory]);

  // Generate all cells
  const cells = [];
  for (let y = 0; y < DEMO_TRACK.length; y++) {
    for (let x = 0; x < DEMO_TRACK[0].length; x++) {
      cells.push(renderCell(x, y));
    }
  }

  // Calculate SVG path points for history lines
  const cellSize = 32; // Approximate cell size
  const playerPathPoints = playerHistory
    .map(pos => `${pos.x * cellSize + cellSize/2},${pos.y * cellSize + cellSize/2}`)
    .join(' ');
  const aiPathPoints = aiHistory
    .map(pos => `${pos.x * cellSize + cellSize/2},${pos.y * cellSize + cellSize/2}`)
    .join(' ');

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

        {/* Track grid with history overlay */}
        <div className="relative">
          {/* SVG layer for history lines */}
          <svg 
            className="absolute top-0 left-0 pointer-events-none"
            style={{ 
              width: DEMO_TRACK[0].length * cellSize + 16, 
              height: DEMO_TRACK.length * cellSize + 16,
              zIndex: 4,
              left: 8,
              top: 8,
            }}
          >
            {/* Player history line */}
            {playerHistory.length > 1 && (
              <polyline
                fill="none"
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={playerPathPoints}
              />
            )}
            
            {/* AI history line */}
            {aiHistory.length > 1 && (
              <polyline
                fill="none"
                stroke="rgba(239, 68, 68, 0.5)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={aiPathPoints}
              />
            )}
          </svg>

          <div 
            className="grid gap-0 bg-black/30 rounded-lg p-2"
            style={{ gridTemplateColumns: `repeat(${DEMO_TRACK[0].length}, 1fr)` }}
          >
            {cells}
          </div>
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
