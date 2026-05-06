import { create } from 'zustand';
import { GamePhase } from '../game/types';

interface GameUIState {
  phase: GamePhase;
  p1Hp: number;
  p2Hp: number;
  p1Ep: number;
  p2Ep: number;
  timer: number;
  winner: string | null;
}

export const useGameStore = create<GameUIState>(() => ({
  phase: 'start',
  p1Hp: 100,
  p2Hp: 100,
  p1Ep: 100,
  p2Ep: 100,
  timer: 99,
  winner: null,
}));
