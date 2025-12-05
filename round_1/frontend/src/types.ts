/**
 * Type definitions for Ultimate Racer
 */

export interface Position {
  x: number;
  y: number;
}

export interface Move {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface EntityState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  checkpoints_passed: number[];
  penalty_turns: number;
  finished: boolean;
  finish_turn: number | null;
}

export interface GameHistory {
  player: Position[];
  ai: Position[];
}

export interface GameState {
  track: string[][];
  original_audience: Record<string, string>;
  dead_audience: Position[];
  player: EntityState;
  ai: EntityState;
  current_turn: 'player' | 'ai';
  turn_number: number;
  game_over: boolean;
  winner: 'player' | 'ai' | 'tie' | null;
  history: GameHistory;
}

export interface MovesResponse {
  moves: Move[];
  penalty: boolean;
}

export type GamePhase = 'intro' | 'playing' | 'victory';

