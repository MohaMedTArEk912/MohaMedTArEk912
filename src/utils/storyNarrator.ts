import { speechNarrator } from './speechNarrator';
import { useArcadeStore } from '../store/useArcadeStore';
import { smoothScrollTo } from '../hooks/useLenisGSAP';
import confetti from 'canvas-confetti';

export interface StoryChapter {
  id: string;
  number: number;
  phaseCode: string;
  title: string;
  color: string;
  badge: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'sec-about',
    number: 0,
    phaseCode: 'PHASE 00',
    title: 'The Origin Nexus & First Principles',
    color: 'from-emerald-500 to-cyan-500',
    badge: 'EMERALD MATRIX',
  },
  {
    id: 'sec-swe',
    number: 1,
    phaseCode: 'PHASE 01',
    title: 'Software Engineering & System Architecture',
    color: 'from-cyan-500 to-blue-500',
    badge: 'ELECTRIC CYAN',
  },
  {
    id: 'sec-fullstack',
    number: 2,
    phaseCode: 'PHASE 02',
    title: 'Full-Stack Distributed Application Engine',
    color: 'from-indigo-500 to-cyan-400',
    badge: 'HYPER INDIGO',
  },
  {
    id: 'sec-projects',
    number: 3,
    phaseCode: 'PHASE 03',
    title: 'Production Systems & Architecture Matrix',
    color: 'from-teal-500 to-cyan-500',
    badge: 'TEAL TELEMETRY',
  },
  {
    id: 'sec-devops',
    number: 4,
    phaseCode: 'PHASE 04',
    title: 'Cloud-Native Control Plane & DEPI Honors',
    color: 'from-emerald-400 to-amber-400',
    badge: 'ACID LIME',
  },
  {
    id: 'sec-instructor',
    number: 5,
    phaseCode: 'PHASE 05',
    title: 'Pedagogical Leadership & 3C School Mentorship',
    color: 'from-amber-400 to-orange-400',
    badge: 'SOLAR AMBER',
  },
  {
    id: 'sec-pm',
    number: 6,
    phaseCode: 'PHASE 06',
    title: 'Agile Command Nexus & Cross-Functional Delivery',
    color: 'from-purple-500 to-pink-500',
    badge: 'ULTRAVIOLET',
  },
  {
    id: 'sec-contact',
    number: 7,
    phaseCode: 'PHASE 07',
    title: 'Command Gateway & Production Dispatch',
    color: 'from-cyan-400 to-emerald-400',
    badge: 'CYBER OBSIDIAN',
  },
];

class StoryNarratorManager {
  private chapterIndex = 0;
  private isRunning = false;
  private timer: number | null = null;
  private unsubscribeSpeech: (() => void) | null = null;

  public startStory() {
    this.stopStory();
    this.isRunning = true;
    this.chapterIndex = 0;
    useArcadeStore.getState().startStoryMode();
    this.playChapter(0);
  }

  public stopStory() {
    this.isRunning = false;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.unsubscribeSpeech) {
      this.unsubscribeSpeech();
      this.unsubscribeSpeech = null;
    }
    speechNarrator.stop();
    useArcadeStore.getState().stopStoryMode();
  }

  public nextChapter() {
    if (!this.isRunning) return;
    if (this.chapterIndex < STORY_CHAPTERS.length - 1) {
      this.playChapter(this.chapterIndex + 1);
    } else {
      this.finishStory();
    }
  }

  public prevChapter() {
    if (!this.isRunning) return;
    if (this.chapterIndex > 0) {
      this.playChapter(this.chapterIndex - 1);
    }
  }

  private playChapter(index: number) {
    if (index >= STORY_CHAPTERS.length) {
      this.finishStory();
      return;
    }

    this.chapterIndex = index;
    useArcadeStore.getState().setStoryChapter(index);

    const chapter = STORY_CHAPTERS[index];
    smoothScrollTo(`#${chapter.id}`);

    // Wait 600ms for smooth scroll initiation, then Mohamed starts speaking
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      if (!this.isRunning) return;

      speechNarrator.speakSection(chapter.id, true);

      // Listen for speech finish to advance smoothly to next chapter
      if (this.unsubscribeSpeech) this.unsubscribeSpeech();
      this.unsubscribeSpeech = speechNarrator.subscribe((state) => {
        if (!state.isSpeaking && this.isRunning && state.progress === 1) {
          // Pause 1.4 seconds before gliding to next chapter
          this.timer = window.setTimeout(() => {
            if (this.isRunning) {
              this.nextChapter();
            }
          }, 1400);
        }
      });
    }, 700);
  }

  private finishStory() {
    this.stopStory();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }
}

export const storyNarrator = new StoryNarratorManager();
