import { useState, useEffect, useRef } from 'react';
import {
  Send,
  X,
  Volume2,
  Bot,
} from 'lucide-react';
import { useCommandStore } from '../../store/useCommandStore';
import { useArcadeStore } from '../../store/useArcadeStore';
import { speechNarrator } from '../../utils/speechNarrator';
import { sounds } from '../../audio/soundSynthesizer';
import { PORTFOLIO_DATA } from '../../data/portfolioData';

const PREWIRED_PROMPTS = [
  {
    label: 'Graduation Project (Akasha)',
    prompt: 'Tell me about your Graduation Project (Akasha).',
    response:
      'I led a team to build the Akasha-Platform—an AI-powered software engineering system that turns raw ideas into complete project plans, including architecture, database schemas, API planning, Git integration, and real-time collaboration with <20ms sync.',
  },
  {
    label: 'DevOps & Cloud Experience',
    prompt: 'How strong is your DevOps & Cloud experience?',
    response:
      'I specialize in end-to-end DevOps: CI/CD with GitHub Actions and Jenkins, container orchestration via Docker and Kubernetes on AWS, IaC with Terraform and Ansible, and live monitoring with Prometheus and Grafana. My DEPI project won 3rd Place nationwide!',
  },
  {
    label: 'Leadership & Teaching',
    prompt: 'What is your leadership and teaching background?',
    response:
      'Beyond writing code, I work as a Project Coordinator at Eyouth (Digilians), taught programming at 3C School to 100+ students, led a 5-developer team on our Library System, and resolved high-stakes telecom issues in Vodafone Corporate & Fixed support.',
  },
];

export function AvatarComms() {
  const { isCommsOpen, setCommsOpen, activeDialogue, setDialogue, isTerminalFullscreen } = useCommandStore();
  const isStoryModeActive = useArcadeStore((state) => state.isStoryModeActive);
  const [inputText, setInputText] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const typingTimerRef = useRef<any>(null);

  // Subscribe to speech narrator state
  useEffect(() => {
    return speechNarrator.subscribe((state) => {
      setIsVoiceActive(state.isSpeaking);
    });
  }, []);

  useEffect(() => {
    const fullText = activeDialogue.text;
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    let charIndex = 0;
    const tick = setTimeout(() => {
      setDisplayedText('');
      setIsTyping(true);

      typingTimerRef.current = setInterval(() => {
        if (charIndex <= fullText.length) {
          setDisplayedText(fullText.slice(0, charIndex));
          charIndex++;
        } else {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          setIsTyping(false);
        }
      }, 18);
    }, 0);

    return () => {
      clearTimeout(tick);
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [activeDialogue.text]);

  const speakText = (text: string) => {
    speechNarrator.speak(text);
  };

  const handleSelectPrompt = (prompt: typeof PREWIRED_PROMPTS[0]) => {
    sounds.playClick();
    setDialogue(prompt.response, 'Mohamed AI');
    speakText(prompt.response);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sounds.playClick();
    const query = inputText.trim().toLowerCase();
    setInputText('');

    let reply = '';

    if (query.includes('phone') || query.includes('whatsapp') || query.includes('call') || query.includes('number')) {
      reply = `You can call or WhatsApp Mohamed directly at ${PORTFOLIO_DATA.profile.phones.join(' or ')}. He is based in Cairo, Egypt (GMT+2) and responds promptly!`;
    } else if (query.includes('email') || query.includes('mail') || query.includes('contact') || query.includes('reach')) {
      reply = `Mohamed's primary contact email is ${PORTFOLIO_DATA.profile.emails[0]}. Feel free to dispatch an interview invitation or project inquiry directly!`;
    } else if (query.includes('hire') || query.includes('available') || query.includes('job') || query.includes('role') || query.includes('status')) {
      reply = `Mohamed is graduating in 2026 from Helwan University (Software Engineering) and is officially Military Exempt. He is available for immediate full-time Full-Stack MERN or DevOps/Cloud Engineer roles (Remote or Hybrid Cairo).`;
    } else if (query.includes('military') || query.includes('army') || query.includes('service')) {
      reply = `Mohamed's military status is officially Exempt. He is 100% free and unencumbered to commence work immediately without interruptions.`;
    } else if (query.includes('docker') || query.includes('k8s') || query.includes('kubernetes') || query.includes('devops') || query.includes('cloud')) {
      reply = `Mohamed's DevOps stack includes Docker, Kubernetes (HPA, Ingress, Pods), AWS (EC2, EKS, ALB), Terraform IaC, Ansible automation, GitHub Actions CI/CD, and Prometheus/Grafana telemetry. He won 3rd Place nationwide in the DEPI DevOps track!`;
    } else if (query.includes('mern') || query.includes('react') || query.includes('node') || query.includes('socket') || query.includes('fullstack')) {
      reply = `In Full-Stack, Mohamed builds resilient React frontends backed by asynchronous Node.js/Express microservices, sub-15ms Socket.io real-time streaming, and MongoDB/MySQL/Neo4j data stores.`;
    } else if (query.includes('depi')) {
      reply = `In DEPI (Digital Egypt Pioneers Initiative), Mohamed completed the intensive DevOps Engineer Track (Jun 2025 – Dec 2025) and won 3rd Place for Best Project across the entire nationwide cohort!`;
    } else if (query.includes('eyouth') || query.includes('digilians')) {
      reply = `At Eyouth · Digilians, Mohamed coordinates large-scale technological training initiatives, managing cross-functional timelines, sprint reviews, and stakeholder alignment.`;
    } else if (query.includes('school') || query.includes('3c') || query.includes('teach') || query.includes('mentor')) {
      reply = `At 3C School (Jun 2025 – May 2026), Mohamed instructed 100+ aspiring software engineers in C++, Python, algorithms, data structures, and practical web architecture.`;
    } else if (query.includes('vodafone')) {
      reply = `At Vodafone, Mohamed delivered technical support and complex data/fixed troubleshooting for corporate enterprise accounts, maintaining 98%+ SLA adherence.`;
    } else if (query.includes('game') || query.includes('challenge') || query.includes('chaos')) {
      reply = `You can test Mohamed's systems in 3 mini-games: 'Chaos Engineering: Save the Cluster', '60-Second Tech Blitz', or 'Akasha System Architect'. Open the [GAMES] button in the top HUD!`;
    } else {
      reply = `I am Mohamed's AI Co-Pilot. Mohamed is a Full-Stack MERN and Cloud-Native DevOps Engineer from Helwan University. Ask me about his projects (Akasha, ICU, Quiz Platform), DEPI honors, military exemption, or click one of the quick chips below!`;
    }

    setDialogue(reply, 'Mohamed AI');
    speakText(reply);
  };

  if (isTerminalFullscreen || isStoryModeActive) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-auto z-40 sm:w-88 font-sans pointer-events-none">
      {!isCommsOpen ? (
        // Pulp Comic Floating Co-Pilot Trigger
        <button
          onClick={() => {
            sounds.playClick();
            setCommsOpen(true);
          }}
          className="pointer-events-auto group flex items-center gap-2.5 px-3.5 py-2 bg-[#120F1A] border-3 border-[#09080D] outline-1 outline-[#F2C94C]/60 text-[#F3E7D3] hover:bg-[#2A194D] shadow-[5px_5px_0px_#09080D] transition cursor-pointer w-fit"
        >
          <div className="relative w-6 h-6 bg-[#E62E25] border-2 border-[#09080D] flex items-center justify-center text-white font-bold shrink-0">
            <Bot className="w-3.5 h-3.5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F2C94C] border border-[#09080D] animate-ping" />
          </div>
          <div className="text-left font-mono pr-1">
            <div className="text-[10.5px] font-bold text-[#F3E7D3] group-hover:text-[#F2C94C] transition flex items-center gap-1.5 uppercase">
              <span>Talk With Mohamed AI</span>
              <span className="text-[9px] text-[#F2C94C] font-bold">• ONLINE</span>
            </div>
          </div>
        </button>
      ) : (
        // Expanded Comic Narrator Dialogue Cockpit
        <div className="pointer-events-auto bg-[#120F1A]/95 border-3 border-[#09080D] outline-1 outline-[#F2C94C]/60 shadow-[8px_8px_0px_#09080D] backdrop-blur-xl overflow-hidden flex flex-col font-mono text-xs max-h-[75vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#2A194D] border-b-2 border-[#09080D]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#E62E25] border-2 border-[#09080D] flex items-center justify-center text-white font-black">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#F3E7D3] uppercase">
                  {activeDialogue.speaker}
                </span>
                <span className="text-[9px] text-[#F2C94C] flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2C94C]" />
                  <span>COMIC CO-PILOT DISPATCH</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => speakText(activeDialogue.text)}
                className={`p-1 text-[#CBC0E3] hover:text-[#F2C94C] transition cursor-pointer ${
                  isVoiceActive ? 'text-[#F2C94C] animate-pulse' : ''
                }`}
                title="Speak message aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCommsOpen(false)}
                className="p-1 text-[#CBC0E3] hover:text-white hover:bg-[#09080D] transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Aged Newsprint Dialogue Balloon Box */}
          <div className="p-3.5 max-h-44 overflow-y-auto bg-[#F3E7D3] text-[#09080D] border-b-2 border-[#09080D] text-xs leading-relaxed font-mono font-medium">
            <p className="whitespace-pre-line">
              {displayedText}
              {isTyping && <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#E62E25] animate-pulse align-middle" />}
            </p>
          </div>

          {/* Quick Pre-wired Prompt Chips */}
          <div className="p-2 border-b-2 border-[#09080D] bg-[#120F1A] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
            {PREWIRED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPrompt(p)}
                className="px-2 py-1 bg-[#2A194D] hover:bg-[#E62E25] text-[#F3E7D3] hover:text-white border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] font-bold whitespace-nowrap transition cursor-pointer shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* User Input Form */}
          <form onSubmit={handleSendMessage} className="p-2 flex items-center gap-1.5 bg-[#09080D]">
            <input
              type="text"
              placeholder="Ask anything (e.g. 'phone', 'docker', 'hire')..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#120F1A] border-2 border-[#5B3E96] focus:border-[#F2C94C] px-2.5 py-1.5 text-base sm:text-xs text-[#F3E7D3] placeholder-[#9888B8] focus:outline-none"
            />
            <button
              type="submit"
              className="p-1.5 bg-[#F2C94C] hover:bg-[#D99B1E] text-[#09080D] border-2 border-[#09080D] transition shrink-0 cursor-pointer font-bold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
