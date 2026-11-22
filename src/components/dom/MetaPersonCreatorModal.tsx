import { useEffect, useRef } from 'react';
import { X, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../audio/soundSynthesizer';

interface MetaPersonCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelExported?: (url: string) => void;
}

export function MetaPersonCreatorModal({
  isOpen,
  onClose,
  onModelExported,
}: MetaPersonCreatorModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      // Check event source
      const data = event.data;
      if (!data || data.source !== 'metaperson_creator') return;

      switch (data.eventName) {
        case 'metaperson_creator_loaded': {
          // Send configuration to iframe
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              {
                eventName: 'set_export_parameters',
                format: 'glb',
                lod: 1,
                textureProfile: '2K.png',
              },
              '*'
            );
          }
          break;
        }

        case 'model_exported': {
          sounds.playSuccess();
          if (data.url && onModelExported) {
            onModelExported(data.url);
          }
          break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, onModelExported]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="font-display font-bold text-sm sm:text-base text-white tracking-wide">
              MetaPerson Avatar Creator & Studio (Avatar SDK)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://metaperson.avatarsdk.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 transition"
            >
              <span>Full Screen Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-900/40 flex items-center justify-between text-[11px] font-mono text-emerald-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Connected to Avatar SDK Web Integration. Customize your 3D avatar & export directly into your portfolio!</span>
          </div>
          <span className="hidden sm:inline text-slate-400">Target format: GLB / FBX</span>
        </div>

        {/* Embedded MetaPerson Creator Iframe */}
        <div className="flex-1 w-full relative bg-slate-950">
          <iframe
            ref={iframeRef}
            src="https://metaperson.avatarsdk.com/iframe.html"
            title="MetaPerson Creator"
            allow="camera; microphone; fullscreen"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
}
