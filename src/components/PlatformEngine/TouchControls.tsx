import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Sparkles } from 'lucide-react';

interface TouchControlsProps {
  onLeftStart: () => void;
  onLeftEnd: () => void;
  onRightStart: () => void;
  onRightEnd: () => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onAction?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onLeftStart,
  onLeftEnd,
  onRightStart,
  onRightEnd,
  onJumpStart,
  onJumpEnd,
  onAction,
}) => {
  return (
    <div className="w-full flex items-center justify-between px-4 py-2 pointer-events-auto select-none touch-none bg-slate-950/70 border-t border-slate-800 backdrop-blur-sm">
      {/* D-Pad: Left & Right */}
      <div className="flex items-center gap-3">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onLeftStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onLeftEnd();
          }}
          onMouseDown={onLeftStart}
          onMouseUp={onLeftEnd}
          onMouseLeave={onLeftEnd}
          className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-slate-700 to-slate-800 active:from-cyan-600 active:to-cyan-700 text-white rounded-2xl border-2 border-cyan-400/50 shadow-lg flex items-center justify-center transition-transform active:scale-90"
          aria-label="Izquierda"
        >
          <ArrowLeft className="w-8 h-8 md:w-10 md:h-10 stroke-[3]" />
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onRightStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onRightEnd();
          }}
          onMouseDown={onRightStart}
          onMouseUp={onRightEnd}
          onMouseLeave={onRightEnd}
          className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-slate-700 to-slate-800 active:from-cyan-600 active:to-cyan-700 text-white rounded-2xl border-2 border-cyan-400/50 shadow-lg flex items-center justify-center transition-transform active:scale-90"
          aria-label="Derecha"
        >
          <ArrowRight className="w-8 h-8 md:w-10 md:h-10 stroke-[3]" />
        </button>
      </div>

      {/* Central Guide */}
      <div className="hidden sm:flex flex-col items-center justify-center text-xs text-slate-400 font-bold">
        <span className="text-cyan-300">🎮 Controles Táctiles o Teclado (Flechas / A-D + Espacio)</span>
      </div>

      {/* Jump and Action Buttons */}
      <div className="flex items-center gap-3">
        {onAction && (
          <button
            onClick={onAction}
            className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-indigo-600 to-indigo-800 active:from-indigo-400 active:to-indigo-600 text-white rounded-2xl border-2 border-indigo-400 shadow-lg flex items-center justify-center transition-transform active:scale-90 font-bold"
            aria-label="Acción"
          >
            <Sparkles className="w-6 h-6 text-amber-300" />
          </button>
        )}

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJumpStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onJumpEnd();
          }}
          onMouseDown={onJumpStart}
          onMouseUp={onJumpEnd}
          onMouseLeave={onJumpEnd}
          className="w-20 h-16 md:w-24 md:h-20 bg-gradient-to-b from-amber-500 to-orange-600 active:from-amber-400 active:to-orange-500 text-slate-950 font-black rounded-2xl border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center transition-transform active:scale-90"
          aria-label="Saltar"
        >
          <ArrowUp className="w-7 h-7 md:w-8 md:h-8 stroke-[3]" />
          <span className="text-xs font-black tracking-wider uppercase">SALTAR</span>
        </button>
      </div>
    </div>
  );
};
