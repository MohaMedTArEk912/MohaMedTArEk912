// Mohamed Tarek Hussien - Interactive Voice Narration Engine
import { audioManager } from './audio';

export interface NarrationData {
  sectionId: string;
  phaseTitle: string;
  speechText: string;
}

export const SECTION_NARRATIONS: Record<string, NarrationData> = {
  'sec-about': {
    sectionId: 'sec-about',
    phaseTitle: 'Phase 00 // Origin Nexus',
    speechText:
      "Welcome to my control plane! I am Mohamed Tarek Hussien, a Software Engineer and Cloud-Native Architect based in Cairo, Egypt. I graduated from the Software Engineering Department at Helwan University's Faculty of Computers and Artificial Intelligence. Here, I engineer resilient, high-impact systems from first principles. Feel free to interact with my 3D model and explore my journey across all engineering dimensions!",
  },
  'sec-swe': {
    sectionId: 'sec-swe',
    phaseTitle: 'Phase 01 // Software Engineering & Architecture',
    speechText:
      "Phase one highlights my core software engineering and system architecture foundations. Before touching the cloud, I focus on algorithmic complexity, object-oriented design patterns, polyglot databases like MySQL, MongoDB, and Neo4j, and authoring comprehensive architectural blueprints including UML class diagrams, sequence protocols, and entity-relationship models.",
  },
  'sec-fullstack': {
    sectionId: 'sec-fullstack',
    phaseTitle: 'Phase 02 // Full-Stack Distributed Engine',
    speechText:
      "Phase two showcases my distributed application engine. I build reactive client interfaces in React and TypeScript connected to Node.js microservices. Projects here include my graduation platform, Akasha AI, our real-time ICU telemetry monitoring system using Socket.IO, and a competitive multiplayer quiz platform. Click the Emit Event button to see real-time duplex data in action!",
  },
  'sec-projects': {
    sectionId: 'sec-projects',
    phaseTitle: 'Phase 03 // Production Systems & Architecture Matrix',
    speechText:
      "Phase three highlights my battle-tested production case studies. From architecting the ApexFin clearing mesh handling over fifty-four thousand transactions per second with sub-fifteen millisecond settlement, to designing OmniMesh IoT stream processors and automated KubeGitOps control planes. Each system embodies strict fault tolerance, observable metrics, and resilient distributed architecture.",
  },
  'sec-devops': {
    sectionId: 'sec-devops',
    phaseTitle: 'Phase 04 // Cloud-Native DevOps & Infrastructure',
    speechText:
      "Phase four represents my cloud infrastructure control plane. I won third place nationwide in the intensive DEPI DevOps Track for architecting automated Kubernetes clusters, multi-stage Alpine Docker containers, and Terraform Infrastructure as Code. My goal is zero-downtime, fully automated continuous delivery.",
  },
  'sec-instructor': {
    sectionId: 'sec-instructor',
    phaseTitle: 'Phase 05 // Instructor & Community Pedagogy',
    speechText:
      "Phase five highlights my commitment to technical education. As a Programming Instructor at 3C School, I have mentored over one hundred aspiring engineers. I love deconstructing dense computing concepts—like the asynchronous event loop and hardware cache locality—into crystal-clear mental models.",
  },
  'sec-pm': {
    sectionId: 'sec-pm',
    phaseTitle: 'Phase 06 // Agile Delivery Command Nexus',
    speechText:
      "Phase six demonstrates my cross-functional project management. As Project Coordinator at Eyouth for the Digilians initiative, and leader of our five-developer software engineering team, I bridge architectural strategy with agile sprint planning, backlog grooming, and predictable milestone velocity.",
  },
  'sec-contact': {
    sectionId: 'sec-contact',
    phaseTitle: 'Phase 07 // Command Gateway & Dispatch',
    speechText:
      "You have docked at the command gateway! Feel free to query my qualifications directly in the interactive terminal shell, inspect my code repositories on GitHub, or reach out to me directly on LinkedIn. Let's build something remarkable together!",
  },
};

type SpeechListener = (state: {
  isSpeaking: boolean;
  currentSection: string;
  transcript: string;
  progress: number;
}) => void;

class SpeechNarrator {
  private isSpeaking = false;
  private currentSection = 'sec-about';
  private transcript = '';
  private autoNarrate = false;
  private listeners: Set<SpeechListener> = new Set();
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
      };
    }
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    listener({
      isSpeaking: this.isSpeaking,
      currentSection: this.currentSection,
      transcript: this.transcript,
      progress: 0,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(progress: number = 0) {
    this.listeners.forEach((fn) =>
      fn({
        isSpeaking: this.isSpeaking,
        currentSection: this.currentSection,
        transcript: this.transcript,
        progress,
      })
    );
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  public getAutoNarrate(): boolean {
    return this.autoNarrate;
  }

  public setAutoNarrate(enabled: boolean) {
    this.autoNarrate = enabled;
  }

  private isFemaleVoice(name: string): boolean {
    const lower = name.toLowerCase();
    const femaleTokens = [
      'female',
      'woman',
      'girl',
      'jenny',
      'aria',
      'sonia',
      'zira',
      'samantha',
      'victoria',
      'karen',
      'susan',
      'stephanie',
      'emma',
      'michelle',
      'ava',
      'allison',
      'hazel',
      'catherine',
      'linda',
      'heather',
      'fiona',
      'kate',
      'serena',
      'tessa',
      'veena',
      'sangeeta',
      'ana',
      'clara',
      'libby',
      'mia',
      'natasha',
      'neerja',
      'heera',
      'kalpana',
      'leila',
      'mary',
      'zara',
    ];
    return femaleTokens.some((t) => lower.includes(t));
  }

  private isMaleVoice(name: string): boolean {
    const lower = name.toLowerCase();
    const maleTokens = [
      'male',
      'guy',
      'ryan',
      'christopher',
      'andrew',
      'brian',
      'eric',
      'steffan',
      'george',
      'oliver',
      'arthur',
      'daniel',
      'alex',
      'david',
      'james',
      'john',
      'richard',
      'thomas',
      'charles',
      'roger',
      'fred',
      'tom',
      'lee',
      'mark',
    ];
    return maleTokens.some((t) => lower.includes(t));
  }

  private selectBestVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Filter to English voices first
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    const scored = pool.map((v) => {
      let score = 0;
      const name = v.name.toLowerCase();

      // Disqualify any female voice
      if (this.isFemaleVoice(name)) {
        return { voice: v, score: -10000 };
      }

      // Reward confirmed male voices heavily
      const isConfirmedMale = this.isMaleVoice(name);
      if (isConfirmedMale) {
        score += 300;
      }

      // Premium online natural human male voices (e.g. Edge Microsoft Ryan / Christopher / Guy / Andrew Natural)
      if (name.includes('natural') && isConfirmedMale) score += 500;
      if (name.includes('online') && isConfirmedMale) score += 200;
      if (name.includes('neural') && isConfirmedMale) score += 250;

      // Google UK English Male
      if (name.includes('google') && name.includes('male')) score += 400;

      // Desirable human male voices
      if (name.includes('ryan') || name.includes('guy') || name.includes('christopher')) {
        score += 150;
      }
      if (name.includes('andrew') || name.includes('brian') || name.includes('eric') || name.includes('steffan')) {
        score += 120;
      }
      if (name.includes('daniel') || name.includes('oliver') || name.includes('alex')) {
        score += 100;
      }

      // Locale preference
      if (v.lang === 'en-US') score += 25;
      if (v.lang === 'en-GB') score += 20;

      // Penalize legacy robotic desktop SAPI voices unless no other male voice exists
      if (name.includes('desktop')) score -= 40;

      return { voice: v, score };
    });

    // Filter out disqualified female voices
    const maleCandidates = scored.filter((s) => s.score > -5000);
    maleCandidates.sort((a, b) => b.score - a.score);

    return maleCandidates[0]?.voice || voices.find((v) => !this.isFemaleVoice(v.name)) || voices[0] || null;
  }

  public speakSection(sectionId: string, force: boolean = true) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const data = SECTION_NARRATIONS[sectionId];
    if (!data) return;

    // If currently speaking the exact same section and not forced, ignore
    if (this.isSpeaking && this.currentSection === sectionId && !force) {
      return;
    }

    this.stop();

    this.currentSection = sectionId;
    this.transcript = data.speechText;
    this.isSpeaking = true;
    this.notify(0);

    // Play tactile comms chirp
    audioManager.playSfx('warp');

    const utterance = new SpeechSynthesisUtterance(data.speechText);
    this.currentUtterance = utterance;

    // Human-like natural male prosody: warm, calm, deep baritone pacing
    utterance.rate = 0.94;
    utterance.pitch = 0.88;
    utterance.lang = 'en-US';

    const bestVoice = this.selectBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify(0.1);
    };

    utterance.onboundary = (e) => {
      if (data.speechText.length > 0) {
        const pct = Math.min(1, (e.charIndex + e.charLength) / data.speechText.length);
        this.notify(pct);
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      audioManager.playSfx('key');
      this.notify(1);
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notify(0);
    };

    window.speechSynthesis.speak(utterance);
  }

  public speak(customText: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.stop();

    this.transcript = customText;
    this.isSpeaking = true;
    this.notify(0);

    const utterance = new SpeechSynthesisUtterance(customText);
    this.currentUtterance = utterance;
    utterance.rate = 0.94;
    utterance.pitch = 0.88;
    utterance.lang = 'en-US';

    const bestVoice = this.selectBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify(0.1);
    };

    utterance.onboundary = (e) => {
      if (customText.length > 0) {
        const pct = Math.min(1, (e.charIndex + e.charLength) / customText.length);
        this.notify(pct);
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      audioManager.playSfx('key');
      this.notify(1);
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notify(0);
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.notify(0);
  }

  public toggleSection(sectionId: string) {
    if (this.isSpeaking && this.currentSection === sectionId) {
      this.stop();
    } else {
      this.speakSection(sectionId, true);
    }
  }
}

export const speechNarrator = new SpeechNarrator();
