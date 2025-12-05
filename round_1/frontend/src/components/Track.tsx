/**
 * Track Component - Renders the race track with all layers
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import { GameState, Move } from '../types';

interface TrackProps {
  gameState: GameState;
  validMoves: Move[];
  onMoveSelect: (move: Move) => void;
  isPlayerTurn: boolean;
}

function Track({ gameState, validMoves, onMoveSelect, isPlayerTurn }: TrackProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(28);

  // Measure actual cell size from the DOM
  useEffect(() => {
    const measureCellSize = () => {
      if (gridRef.current) {
        const gridWidth = gridRef.current.offsetWidth;
        const newCellSize = gridWidth / 24;
        setCellSize(newCellSize);
        console.log('[TRACK] Measured cell size:', newCellSize);
      }
    };

    measureCellSize();
    window.addEventListener('resize', measureCellSize);
    return () => window.removeEventListener('resize', measureCellSize);
  }, []);

  // Create a map of valid move positions for quick lookup
  const validMoveMap = useMemo(() => {
    const map = new Map<string, Move>();
    validMoves.forEach(move => {
      map.set(`${move.x},${move.y}`, move);
    });
    return map;
  }, [validMoves]);

  // Create history position sets for overlay
  const playerHistorySet = useMemo(() => {
    const set = new Set<string>();
    gameState.history.player.forEach(pos => {
      set.add(`${pos.x},${pos.y}`);
    });
    return set;
  }, [gameState.history.player]);

  const aiHistorySet = useMemo(() => {
    const set = new Set<string>();
    gameState.history.ai.forEach(pos => {
      set.add(`${pos.x},${pos.y}`);
    });
    return set;
  }, [gameState.history.ai]);

  // Generate SVG path points for history
  const playerHistoryPoints = useMemo(() => {
    return gameState.history.player
      .map(pos => `${pos.x * cellSize + cellSize/2},${pos.y * cellSize + cellSize/2}`)
      .join(' ');
  }, [gameState.history.player, cellSize]);

  const aiHistoryPoints = useMemo(() => {
    return gameState.history.ai
      .map(pos => `${pos.x * cellSize + cellSize/2},${pos.y * cellSize + cellSize/2}`)
      .join(' ');
  }, [gameState.history.ai, cellSize]);

  // Render a cell
  const renderCell = (x: number, y: number) => {
    const key = `${x},${y}`;
    let content = gameState.track[y][x];
    const validMove = validMoveMap.get(key);
    const isPlayerPos = x === gameState.player.x && y === gameState.player.y;
    const isAiPos = x === gameState.ai.x && y === gameState.ai.y;
    const inPlayerHistory = playerHistorySet.has(key) && !isPlayerPos;
    const inAiHistory = aiHistorySet.has(key) && !isAiPos;

    // Override with car positions
    if (isPlayerPos) {
      content = '🚙';
    } else if (isAiPos) {
      content = '🚗';
    }

    return (
      <div
        key={key}
        className="track-cell relative"
        data-x={x}
        data-y={y}
      >
        {/* Base layer - track tile */}
        <span className={isPlayerPos || isAiPos ? 'car-move' : ''}>
          {content}
        </span>

        {/* History layer - show faded car trail */}
        {inPlayerHistory && !isAiPos && (
          <span className="history-marker text-blue-400" style={{ opacity: 0.4 }}>
            🚙
          </span>
        )}
        {inAiHistory && !isPlayerPos && (
          <span className="history-marker text-red-400" style={{ opacity: 0.4 }}>
            🚗
          </span>
        )}

        {/* Move selection layer */}
        {validMove && isPlayerTurn && (
          <button
            className="move-indicator"
            onClick={() => onMoveSelect(validMove)}
            aria-label={`Move to ${x}, ${y}`}
          >
            🔴
          </button>
        )}
      </div>
    );
  };

  // Generate all cells
  const cells = useMemo(() => {
    const result = [];
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 24; x++) {
        result.push(renderCell(x, y));
      }
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, validMoveMap, isPlayerTurn, playerHistorySet, aiHistorySet]);

  return (
    <div className="relative">
      {/* SVG layer for history lines */}
      <svg 
        className="absolute top-0 left-0 pointer-events-none"
        style={{ 
          width: cellSize * 24, 
          height: cellSize * 24,
          zIndex: 4 
        }}
      >
        {/* Player history line */}
        {gameState.history.player.length > 1 && (
          <polyline
            fill="none"
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={playerHistoryPoints}
          />
        )}
        
        {/* AI history line */}
        {gameState.history.ai.length > 1 && (
          <polyline
            fill="none"
            stroke="rgba(239, 68, 68, 0.6)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={aiHistoryPoints}
          />
        )}
      </svg>

      {/* Grid layer */}
      <div ref={gridRef} className="track-grid">
        {cells}
      </div>
    </div>
  );
}

export default Track;
