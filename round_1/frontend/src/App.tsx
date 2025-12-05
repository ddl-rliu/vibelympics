/**
 * Ultimate Racer - Main Application Component
 * An emoji-only turn-based racing game
 */

import { useState, useEffect, useCallback } from 'react';
import { GameState, Move, GamePhase } from './types';
import { newGame, getMoves, makeMove, aiMove, healthCheck } from './api';
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
    } catch (error) {
      console.error('[APP] Failed to start game:', error);
    } finally {
      setIsLoading(false);
    }
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
    
    try {
      // Execute player move
      let state = await makeMove(gameState, move);
      setGameState(state);
      
      // Check if game is over
      if (state.game_over) {
        console.log('[APP] Game over! Winner:', state.winner);
        setPhase('victory');
        setIsLoading(false);
        return;
      }
      
      // If it's now AI's turn, execute AI move
      if (state.current_turn === 'ai') {
        console.log('[APP] Executing AI turn...');
        
        // Small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        state = await aiMove(state);
        setGameState(state);
        
        // Check if game is over after AI move
        if (state.game_over) {
          console.log('[APP] Game over after AI turn! Winner:', state.winner);
          setPhase('victory');
          setIsLoading(false);
          return;
        }
        
        // Get new moves for player
        const movesResponse = await getMoves(state);
        
        // Handle player penalty (skipped turn)
        if (movesResponse.penalty || movesResponse.moves.length === 0) {
          console.log('[APP] Player has penalty, AI plays again...');
          
          await new Promise(resolve => setTimeout(resolve, 500));
          state = await aiMove(state);
          setGameState(state);
          
          if (state.game_over) {
            setPhase('victory');
            setIsLoading(false);
            return;
          }
          
          const newMoves = await getMoves(state);
          setValidMoves(newMoves.moves);
        } else {
          setValidMoves(movesResponse.moves);
        }
      }
    } catch (error) {
      console.error('[APP] Error during move:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gameState, isLoading]);

  // Handle restart
  const handleRestart = useCallback(() => {
    console.log('[APP] Restarting game...');
    setPhase('playing');
    startNewGame();
  }, [startNewGame]);

  // Handle intro complete
  const handleIntroComplete = useCallback(() => {
    console.log('[APP] Intro complete, starting game...');
    startNewGame();
  }, [startNewGame]);

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
        <div className="text-6xl mb-8">🏎️💨</div>
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
        <div className="mb-4 text-4xl turn-indicator">
          {gameState.current_turn === 'player' ? '🚙' : '🚗'}
          {isLoading && <span className="ml-2 loading inline-block">⏳</span>}
        </div>
        
        {/* Checkpoint progress */}
        <div className="mb-4 flex gap-2 text-2xl">
          <span className={gameState.player.checkpoints_passed.includes(1) ? 'opacity-100' : 'opacity-30'}>1️⃣</span>
          <span>➡️</span>
          <span className={gameState.player.checkpoints_passed.includes(2) ? 'opacity-100' : 'opacity-30'}>2️⃣</span>
          <span>➡️</span>
          <span className={gameState.player.checkpoints_passed.includes(3) ? 'opacity-100' : 'opacity-30'}>3️⃣</span>
          <span>➡️</span>
          <span className={gameState.player.finished ? 'opacity-100' : 'opacity-30'}>🏁</span>
        </div>
        
        {/* Track */}
        <Track
          gameState={gameState}
          validMoves={validMoves}
          onMoveSelect={handleMoveSelect}
          isPlayerTurn={gameState.current_turn === 'player' && !isLoading}
        />
        
        {/* Velocity display */}
        <div className="mt-4 flex gap-8 text-xl">
          <div className="flex items-center gap-2">
            <span>🚙</span>
            <span>⬆️{gameState.player.vy >= 0 ? '' : '-'}{Math.abs(gameState.player.vy)}</span>
            <span>➡️{gameState.player.vx >= 0 ? '' : '-'}{Math.abs(gameState.player.vx)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚗</span>
            <span>⬆️{gameState.ai.vy >= 0 ? '' : '-'}{Math.abs(gameState.ai.vy)}</span>
            <span>➡️{gameState.ai.vx >= 0 ? '' : '-'}{Math.abs(gameState.ai.vx)}</span>
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

