import { Sparkles } from 'lucide-react';
import { avatarPhysicsImpulse } from '../3d/avatarPhysicsImpulse';
import { audioManager } from '../../utils/audio';

interface StageGridHeaderProps {
  sector: string;
  corridor: string;
  badge?: string;
  corridorRange?: [number, number];
}

export function StageGridHeader({ sector, corridor, badge }: StageGridHeaderProps) {
  const cleanSector = sector.split('|')[0].trim();

  const handleMobileStageTap = () => {
    audioManager.playSfx('click');
    avatarPhysicsImpulse.trigger(1.25);
  };

  return (
    <div className="stage-grid-header flex flex-col gap-2.5">
      {/* Top Issue Strip Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Vintage 25¢ Comic Issue Stamp */}
          <span className="px-2 py-0.5 bg-[#E62E25] text-white font-display text-xs sm:text-sm border-3 border-[#09080D] shadow-[3px_3px_0px_#09080D] -rotate-3 tracking-wider shrink-0">
            25¢
          </span>
          <span className="comic-caption-tag text-[11px] sm:text-sm truncate">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#E62E25] border-2 border-[#09080D] rotate-45 shrink-0" />
            <span className="truncate">{cleanSector}</span>
          </span>
        </div>

        {/* Diagonal Ink Gutter Line */}
        <div className="h-[4px] flex-1 bg-gradient-to-r from-[#F2C94C] via-[#E62E25] to-[#5B3E96] border-y border-[#09080D] hidden sm:block transform -skew-x-12" />

        <div className="flex items-center gap-2 shrink-0">
          {badge && (
            <span className="px-2.5 py-0.5 bg-[#F3E7D3] border-3 border-[#09080D] shadow-[3px_3px_0px_#09080D] text-[9.5px] sm:text-xs font-display text-[#09080D] tracking-wider rotate-1">
              ★ {badge} ★
            </span>
          )}
          <span className="hidden md:inline px-2.5 py-0.5 bg-[#09080D] border-2 border-[#F2C94C] text-[10px] font-display text-[#F2C94C] tracking-widest -skew-x-6">
            {corridor.split(':')[0]}
          </span>
        </div>
      </div>

      {/* =====================================================================
          MOBILE & TABLET DEDICATED 3D COMIC PANEL WINDOW (lg:hidden)
          Frames the live 3D Avatar + 3D Coding Props inside a cut-out comic panel!
          ===================================================================== */}
      <div
        onClick={handleMobileStageTap}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleMobileStageTap();
        }}
        className="lg:hidden pointer-events-auto relative w-full h-44 sm:h-56 border-4 border-[#09080D] outline-2 outline-[#F2C94C] -outline-offset-4 shadow-[6px_6px_0px_#09080D] -rotate-0.5 overflow-hidden cursor-pointer select-none group"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(9, 8, 13, 0.02) 38%, rgba(9, 8, 13, 0.68) 100%)',
        }}
      >
        {/* Top-Left Pinned Comic Panel Number */}
        <span className="absolute top-1.5 left-2 z-10 bg-[#F2C94C] text-[#09080D] font-display text-[10px] tracking-wider px-2 py-0.5 border-2 border-[#09080D] shadow-[2px_2px_0px_#09080D] -rotate-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#E62E25]" />
          <span>Panel #00 // live 3D coding stage</span>
        </span>

        {/* Top-Right SFX Sticker */}
        <span className="comic-sfx absolute top-1.5 right-2 text-[10px] z-10">
          TAP 3D STAGE!!
        </span>

        {/* Bottom Comic Caption Strip */}
        <div className="absolute bottom-1.5 inset-x-2 z-10 flex items-center justify-between pointer-events-none">
          <span className="bg-[#09080D]/90 text-[#F3E7D3] border-2 border-[#09080D] px-2 py-0.5 font-display text-[9.5px] tracking-widest">
            ⚡ Interactive 3D avatar &amp; coding props
          </span>
          <span className="bg-[#E62E25] text-white border-2 border-[#09080D] px-2 py-0.5 font-display text-[9.5px] tracking-wider shadow-[2px_2px_0px_#09080D] group-active:scale-95 transition">
            Pow! Tap me
          </span>
        </div>
      </div>
    </div>
  );
}
