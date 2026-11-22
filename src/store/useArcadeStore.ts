import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundSynthesizer';

export interface GameScoreMap {
  swe: number;
  fullstack: number;
  devops: number;
  instructor: number;
  pm: number;
}

export type ActiveGameType = 'none' | 'swe' | 'fullstack' | 'devops' | 'instructor' | 'pm';

interface ArcadeStore {
  scores: GameScoreMap;
  activeGame: ActiveGameType;
  unlockedTrophies: string[];
  isTrophyModalOpen: boolean;

  // Story Mode State
  isStoryModeActive: boolean;
  storyChapter: number;
  isStoryPaused: boolean;

  // Actions
  addScore: (game: keyof GameScoreMap, points: number) => void;
  setActiveGame: (game: ActiveGameType) => void;
  setIsTrophyModalOpen: (open: boolean) => void;
  getTotalScore: () => number;

  startStoryMode: () => void;
  stopStoryMode: () => void;
  setStoryChapter: (chapter: number) => void;
  toggleStoryPause: () => void;
}

export const useArcadeStore = create<ArcadeStore>((set, get) => ({
  scores: { swe: 0, fullstack: 0, devops: 0, instructor: 0, pm: 0 },
  activeGame: 'none',
  unlockedTrophies: [],
  isTrophyModalOpen: false,

  isStoryModeActive: false,
  storyChapter: 0,
  isStoryPaused: false,

  addScore: (game, points) => {
    set((state) => {
      const newScore = state.scores[game] + points;
      const updatedScores = { ...state.scores, [game]: newScore };
      const newTrophies = [...state.unlockedTrophies];

      if (game === 'swe' && newScore >= 1000 && !newTrophies.includes('ALGO_MASTER')) {
        newTrophies.push('ALGO_MASTER');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
      if (game === 'fullstack' && newScore >= 1200 && !newTrophies.includes('STREAM_MAESTRO')) {
        newTrophies.push('STREAM_MAESTRO');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
      if (game === 'devops' && newScore >= 1200 && !newTrophies.includes('SRE_GUARDIAN')) {
        newTrophies.push('SRE_GUARDIAN');
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      }
      if (game === 'instructor' && newScore >= 1000 && !newTrophies.includes('MASTER_EDUCATOR')) {
        newTrophies.push('MASTER_EDUCATOR');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
      if (game === 'pm' && newScore >= 1200 && !newTrophies.includes('DELIVERY_COMMANDER')) {
        newTrophies.push('DELIVERY_COMMANDER');
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      }

      return {
        scores: updatedScores,
        unlockedTrophies: newTrophies,
      };
    });
    sounds.playSuccess();
  },

  setActiveGame: (game) => {
    if (game !== 'none') {
      sounds.playClick();
    }
    set({ activeGame: game });
  },

  setIsTrophyModalOpen: (open) => {
    sounds.playClick();
    set({ isTrophyModalOpen: open });
  },

  getTotalScore: () => {
    const s = get().scores;
    return s.swe + s.fullstack + s.devops + s.instructor + s.pm;
  },

  startStoryMode: () => {
    set({ isStoryModeActive: true, storyChapter: 0, isStoryPaused: false });
  },

  stopStoryMode: () => {
    set({ isStoryModeActive: false, isStoryPaused: false });
  },

  setStoryChapter: (chapter) => {
    set({ storyChapter: chapter });
  },

  toggleStoryPause: () => {
    set((state) => ({ isStoryPaused: !state.isStoryPaused }));
  },
}));
