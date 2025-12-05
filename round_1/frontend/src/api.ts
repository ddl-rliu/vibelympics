/**
 * API client for Ultimate Racer backend
 */

import { GameState, Move, MovesResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('[API] Initialized with base URL:', API_URL);

/**
 * Start a new game
 */
export async function newGame(): Promise<GameState> {
  console.log('[API] Requesting new game...');
  
  const response = await fetch(`${API_URL}/api/game/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    console.error('[API] Failed to start new game:', response.status);
    throw new Error('Failed to start new game');
  }
  
  const state = await response.json();
  console.log('[API] New game started. Turn:', state.current_turn);
  return state;
}

/**
 * Get valid moves for current player
 */
export async function getMoves(state: GameState): Promise<MovesResponse> {
  console.log('[API] Requesting valid moves for:', state.current_turn);
  
  const response = await fetch(`${API_URL}/api/game/moves`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(state),
  });
  
  if (!response.ok) {
    console.error('[API] Failed to get moves:', response.status);
    throw new Error('Failed to get moves');
  }
  
  const data = await response.json();
  console.log('[API] Got', data.moves.length, 'valid moves. Penalty:', data.penalty);
  return data;
}

/**
 * Execute a player move
 */
export async function makeMove(state: GameState, move: Move): Promise<GameState> {
  console.log('[API] Making move to:', move.x, move.y);
  
  const response = await fetch(`${API_URL}/api/game/move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state, move }),
  });
  
  if (!response.ok) {
    console.error('[API] Failed to make move:', response.status);
    throw new Error('Failed to make move');
  }
  
  const newState = await response.json();
  console.log('[API] Move complete. Turn:', newState.current_turn, 'Game over:', newState.game_over);
  return newState;
}

/**
 * Execute AI move
 */
export async function aiMove(state: GameState): Promise<GameState> {
  console.log('[API] Requesting AI move...');
  
  const response = await fetch(`${API_URL}/api/game/ai-move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(state),
  });
  
  if (!response.ok) {
    console.error('[API] Failed to get AI move:', response.status);
    throw new Error('Failed to get AI move');
  }
  
  const newState = await response.json();
  console.log('[API] AI move complete. Turn:', newState.current_turn, 'Game over:', newState.game_over);
  return newState;
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  console.log('[API] Checking health...');
  
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('[API] Health check result:', data);
    return data.status === 'healthy';
  } catch (error) {
    console.error('[API] Health check failed:', error);
    return false;
  }
}

