/**
 * Ultimate Racer - Main Application Component
 * An emoji-only turn-based racing game
 */

import { useState, useEffect, useCallback } from 'react';
import { GameState, Move, GamePhase } from './types';
import { newGame, getMoves, makeMove, aiMove, skipTurn, healthCheck } from './api';
import Track from './components/Track';
import VictoryPopup from './components/VictoryPopup';
import IntroAnimation from './components/IntroAnimation';

// Local storage key for intro animation
const INTRO_SEEN_KEY = 'ultimate-racer-intro-seen';

function App() {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHealthy, setIsHealthy] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [error, setError] = useState(false);

  // Check if user has seen intro animation before
  useEffect(() => {
    const seen = localStorage.getItem(INTRO_SEEN_KEY);
    console.log('[APP] Checking intro seen status:', seen);
    if (seen === 'true') {
      setHasSeenIntro(true);
    }
  }, []);

  // Health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      console.log('[APP] Performing initial health check...');
      const healthy = await healthCheck();
      setIsHealthy(healthy);
      console.log('[APP] Backend healthy:', healthy);
    };
    
    checkHealth();
    // Retry health check every 2 seconds if not healthy
    const interval = setInterval(async () => {
      if (!isHealthy) {
        const healthy = await healthCheck();
        setIsHealthy(healthy);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isHealthy]);

  // Start a new game
  const startNewGame = useCallback(async () => {
    console.log('[APP] Starting new game...');
    setIsLoading(true);
    setError(false);
    
    try {
      const state = await newGame();
      setGameState(state);
      setPhase('playing');
      
      // Mark intro as seen
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
      setHasSeenIntro(true);
      
      // Get initial moves for player
      const movesResponse = await getMoves(state);
      setValidMoves(movesResponse.moves);
      
      console.log('[APP] Game started successfully');
    } catch (err) {
      console.error('[APP] Failed to start game:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Process turns for AI and handle penalties
  const processGameLoop = useCallback(async (state: GameState): Promise<GameState> => {
    let currentState = state;
    
    // Keep processing turns until it's the player's turn with valid moves
    while (!currentState.game_over) {
      console.log(`[APP] Processing turn. Current: ${currentState.current_turn}`);
      
      if (currentState.current_turn === 'ai') {
        // AI's turn
        await new Promise(resolve => setTimeout(resolve, 600));
        currentState = await aiMove(currentState);
        setGameState(currentState);
        
        if (currentState.game_over) {
          return currentState;
        }
      } else {
        // Player's turn - check for penalty
        const movesResponse = await getMoves(currentState);
        
        if (movesResponse.penalty) {
          console.log('[APP] Player has penalty, skipping turn...');
          await new Promise(resolve => setTimeout(resolve, 400));
          currentState = await skipTurn(currentState);
          setGameState(currentState);
          
          if (currentState.game_over) {
            return currentState;
          }
          // Continue loop - now it's AI's turn
        } else {
          // Player has valid moves, set them and exit loop
          setValidMoves(movesResponse.moves);
          return currentState;
        }
      }
    }
    
    return currentState;
  }, []);

  // Handle player move selection
  const handleMoveSelect = useCallback(async (move: Move) => {
    if (!gameState || gameState.current_turn !== 'player' || isLoading) {
      console.log('[APP] Ignoring move - not player turn or loading');
      return;
    }
    
    console.log('[APP] Player selected move:', move.x, move.y);
    setIsLoading(true);
    setValidMoves([]);
    setError(false);
    
    try {
      // Execute player move
      let state = await makeMove(gameState, move);
      setGameState(state);
      
      // Check if game is over after player move
      if (state.game_over) {
        console.log('[APP] Game over! Winner:', state.winner);
        setPhase('victory');
        setIsLoading(false);
        return;
      }
      
      // Process game loop (AI turns, penalty handling)
      state = await processGameLoop(state);
      
      if (state.game_over) {
        setPhase('victory');
      }
      
    } catch (err) {
      console.error('[APP] Error during move:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [gameState, isLoading, processGameLoop]);

  // Handle restart
  const handleRestart = useCallback(() => {
    console.log('[APP] Restarting game...');
    setPhase('playing');
    setError(false);
    startNewGame();
  }, [startNewGame]);

  // Handle intro complete
  const handleIntroComplete = useCallback(() => {
    console.log('[APP] Intro complete, starting game...');
    startNewGame();
  }, [startNewGame]);

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">💥</div>
        <div className="text-4xl">😵</div>
        <button 
          onClick={() => {
            setError(false);
            setPhase('intro');
          }}
          className="text-4xl mt-4 hover:scale-110 transition-transform cursor-pointer"
        >
          🔄️
        </button>
      </div>
    );
  }

  // Loading screen while waiting for backend
  if (!isHealthy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl loading">🏎️</div>
        <div className="text-4xl mt-4 animate-pulse">⏳</div>
      </div>
    );
  }

  // Intro animation phase
  if (phase === 'intro' && !hasSeenIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  // Show start button if intro was already seen
  if (phase === 'intro' && hasSeenIntro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl mb-8 animate-bounce">🏎️💨</div>
        <button 
          onClick={startNewGame}
          className="start-button text-6xl hover:scale-110 transition-transform"
          disabled={isLoading}
        >
          {isLoading ? '⏳' : '▶️'}
        </button>
      </div>
    );
  }

  // Game playing phase
  if (phase === 'playing' && gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Turn indicator */}
        <div className="mb-4 text-4xl turn-indicator flex items-center gap-2">
          {gameState.current_turn === 'player' ? '🚙' : '🚗'}
          <span className="text-2xl">➡️</span>
          {isLoading && <span className="loading inline-block">⏳</span>}
        </div>
        
        {/* Checkpoint progress - show both players */}
        <div className="mb-4 flex flex-col gap-2">
          {/* Player progress */}
          <div className="flex gap-2 text-xl items-center">
            <span>🚙</span>
            <span className={gameState.player.checkpoints_passed.includes(1) ? 'opacity-100' : 'opacity-30'}>1️⃣</span>
            <span className="text-sm">→</span>
            <span className={gameState.player.checkpoints_passed.includes(2) ? 'opacity-100' : 'opacity-30'}>2️⃣</span>
            <span className="text-sm">→</span>
            <span className={gameState.player.checkpoints_passed.includes(3) ? 'opacity-100' : 'opacity-30'}>3️⃣</span>
            <span className="text-sm">→</span>
            <span className={gameState.player.finished ? 'opacity-100' : 'opacity-30'}>🏁</span>
          </div>
          {/* AI progress */}
          <div className="flex gap-2 text-xl items-center">
            <span>🚗</span>
            <span className={gameState.ai.checkpoints_passed.includes(1) ? 'opacity-100' : 'opacity-30'}>1️⃣</span>
            <span className="text-sm">→</span>
            <span className={gameState.ai.checkpoints_passed.includes(2) ? 'opacity-100' : 'opacity-30'}>2️⃣</span>
            <span className="text-sm">→</span>
            <span className={gameState.ai.checkpoints_passed.includes(3) ? 'opacity-100' : 'opacity-30'}>3️⃣</span>
            <span className="text-sm">→</span>
            <span className={gameState.ai.finished ? 'opacity-100' : 'opacity-30'}>🏁</span>
          </div>
        </div>
        
        {/* Track */}
        <Track
          gameState={gameState}
          validMoves={validMoves}
          onMoveSelect={handleMoveSelect}
          isPlayerTurn={gameState.current_turn === 'player' && !isLoading}
        />
        
        {/* Penalty indicator */}
        {gameState.player.penalty_turns > 0 && (
          <div className="mt-2 text-2xl animate-pulse">
            ⚠️ {Array(gameState.player.penalty_turns).fill('⏸️').join('')}
          </div>
        )}
        
        {/* Velocity display */}
        <div className="mt-4 flex gap-8 text-lg">
          <div className="flex items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-lg">
            <span>🚙</span>
            <span className="text-sm">↕️</span>
            <span>{gameState.player.vy}</span>
            <span className="text-sm">↔️</span>
            <span>{gameState.player.vx}</span>
          </div>
          <div className="flex items-center gap-1 bg-red-500/20 px-3 py-1 rounded-lg">
            <span>🚗</span>
            <span className="text-sm">↕️</span>
            <span>{gameState.ai.vy}</span>
            <span className="text-sm">↔️</span>
            <span>{gameState.ai.vx}</span>
          </div>
        </div>
      </div>
    );
  }

  // Victory phase
  if (phase === 'victory' && gameState) {
    return (
      <>
        <div className="overlay-backdrop" />
        <VictoryPopup
          winner={gameState.winner}
          onRestart={handleRestart}
        />
      </>
    );
  }

  // Fallback loading
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-6xl loading">🏎️</div>
    </div>
  );
}

export default App;
