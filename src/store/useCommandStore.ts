import { create } from 'zustand';
import { COMIC_VOLUMES } from '../data/comicVolumes';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundSynthesizer';
import { useArcadeStore } from './useArcadeStore';

export type ViewMode = '3d' | '2d-executive';
export type ReaderMode = 'scroll' | 'flip' | 'vertical';
export type ActiveGameModal = null | 'chaos' | 'quiz' | 'architect';

interface CommandStore {
  viewMode: ViewMode;
  readerMode: ReaderMode;
  activeIssueIndex: number;
  flipDirection: 'next' | 'prev';
  flipCounter: number;
  clusterHealth: number;
  activeGame: ActiveGameModal;
  activeStationDrawer: string | null;
  isCommandPaletteOpen: boolean;
  isCommsOpen: boolean;
  isTerminalFullscreen: boolean;
  activeDialogue: {
    speaker: string;
    text: string;
  };

  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  setReaderMode: (mode: ReaderMode) => void;
  toggleReaderMode: () => void;
  setActiveIssueIndex: (index: number) => void;
  nextIssue: () => void;
  prevIssue: () => void;
  setTerminalFullscreen: (fullscreen: boolean) => void;
  setClusterHealth: (health: number) => void;
  triggerChaosSpike: () => void;
  resolveChaos: () => void;
  openGame: (game: 'chaos' | 'quiz' | 'architect') => void;
  closeGame: () => void;
  openStationDrawer: (stationId: string) => void;
  closeStationDrawer: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommsOpen: (open: boolean) => void;
  setDialogue: (text: string, speaker?: string) => void;
}

const comicParams = new URLSearchParams(window.location.search);
const initialVolume = Number(comicParams.get('volume'));
const initialView = comicParams.get('view');
const preferVertical = initialView === 'vertical';

export const useCommandStore = create<CommandStore>((set, get) => ({
  viewMode: '3d',
  readerMode: initialView === 'stage' ? 'scroll' : preferVertical ? 'vertical' : 'flip',
  activeIssueIndex: Number.isInteger(initialVolume) && initialVolume >= 1 && initialVolume <= COMIC_VOLUMES.length ? initialVolume : 0,
  flipDirection: 'next',
  flipCounter: 0,
  clusterHealth: 100,
  activeGame: null,
  activeStationDrawer: null,
  isCommandPaletteOpen: false,
  isCommsOpen: false,
  isTerminalFullscreen: false,
  activeDialogue: {
    speaker: 'Mohamed AI // ISSUE #2026',
    text: 'Welcome to The Architect Chronicles! Scroll vertically or switch to Comic Page-Flip Mode to inspect my systems.',
  },

  setTerminalFullscreen: (fullscreen) => set({ isTerminalFullscreen: fullscreen }),

  setViewMode: (mode) => {
    sounds.playWarp();
    set({ viewMode: mode });
  },

  toggleViewMode: () => {
    sounds.playWarp();
    set((state) => ({ viewMode: state.viewMode === '3d' ? '2d-executive' : '3d' }));
  },

  setReaderMode: (mode) => {
    sounds.playWarp();
    const url = new URL(window.location.href);
    url.searchParams.set('view', mode === 'vertical' ? 'vertical' : mode === 'scroll' ? 'stage' : 'volumes');
    url.searchParams.set('volume', String(get().activeIssueIndex));
    window.history.replaceState(window.history.state, '', url);
    set({ readerMode: mode });
  },

  toggleReaderMode: () => {
    const { readerMode, setReaderMode } = get();
    setReaderMode(readerMode === 'scroll' ? 'flip' : 'scroll');
  },

  setActiveIssueIndex: (index) => {
    const cur = get().activeIssueIndex;
    const clamped = Math.max(0, Math.min(COMIC_VOLUMES.length, index));
    if (clamped === cur) return;
    sounds.playPageFlip();
    set((state) => ({
      activeIssueIndex: clamped,
      flipDirection: clamped >= cur ? 'next' : 'prev',
      flipCounter: state.flipCounter + 1,
    }));
  },

  nextIssue: () => {
    const cur = get().activeIssueIndex;
    if (cur < COMIC_VOLUMES.length) {
      sounds.playPageFlip();
      set((state) => ({
        activeIssueIndex: cur + 1,
        flipDirection: 'next',
        flipCounter: state.flipCounter + 1,
      }));
    }
  },

  prevIssue: () => {
    const cur = get().activeIssueIndex;
    if (cur > 0) {
      sounds.playPageFlip();
      set((state) => ({
        activeIssueIndex: cur - 1,
        flipDirection: 'prev',
        flipCounter: state.flipCounter + 1,
      }));
    }
  },

  setClusterHealth: (health) => set({ clusterHealth: Math.max(0, Math.min(100, health)) }),

  triggerChaosSpike: () => {
    sounds.playGlitch();
    set({
      clusterHealth: 20,
      activeGame: 'chaos',
      activeDialogue: {
        speaker: 'Mohamed AI [ALERT]',
        text: 'CRITICAL: Traffic spike detected on ICU & Auth pods! Health dropped to 20%! Execute recovery playbook immediately!',
      },
    });
  },

  resolveChaos: () => {
    sounds.playSuccess();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    useArcadeStore.getState().addScore('devops', 1500);
    set({
      clusterHealth: 100,
      activeGame: null,
      activeDialogue: {
        speaker: 'Mohamed AI [ONLINE]',
        text: 'EXCELLENT: Cluster recovered to 100% healthy! Kubernetes HPA scaled replicas and Ansible playbook executed flawlessly.',
      },
    });
  },

  openGame: (game) => {
    sounds.playClick();
    if (game === 'chaos') {
      get().triggerChaosSpike();
    } else {
      set({ activeGame: game });
    }
  },

  closeGame: () => {
    sounds.playClick();
    set({ activeGame: null });
  },

  openStationDrawer: (stationId) => {
    sounds.playClick();
    set({ activeStationDrawer: stationId });
  },

  closeStationDrawer: () => {
    sounds.playClick();
    set({ activeStationDrawer: null });
  },

  setCommandPaletteOpen: (open) => {
    sounds.playClick();
    set({ isCommandPaletteOpen: open });
  },

  toggleCommandPalette: () => {
    sounds.playClick();
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen }));
  },

  setCommsOpen: (open) => {
    sounds.playClick();
    set({ isCommsOpen: open });
  },

  setDialogue: (text, speaker = 'Mohamed AI') => {
    set({ activeDialogue: { speaker, text } });
  },
}));
