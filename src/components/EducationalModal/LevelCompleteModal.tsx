import React, { useEffect } from 'react';
import { LevelData } from '../../types/game';
import { soundService } from '../../services/audio';
import confetti from 'canvas-confetti';
import { Star, Award, RotateCcw, ArrowRight, Home, Sparkles } from 'lucide-react';

interface LevelCompleteModalProps {
  level: LevelData;
  stars: number;
  bitsCollected: number;
  totalBitsInLevel: number;
  score: number;
  newBadgeUnlocked?: string | null;
  onNextLevel: () => void;
  onReplay: () => void;
  onWorldMap: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  stars,
  bitsCollected,
  totalBitsInLevel,
  score,
  newBadgeUnlocked,
  onNextLevel,
  onReplay,
  onWorldMap,
}) => {
  useEffect(() => {
    soundService.playFanfare();
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 },
    });

    const congratText = `¡Felicidades, Detective! Has completado ${level.title} con ${stars} estrellas y ${bitsCollected} bits recolectados. ¡Excelente trabajo!`;
    soundService.speak(congratText);

    return () => {
      soundService.stopSpeaking();
    };
  }, [level, stars, bitsCollected]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-800 via-indigo-950 to-slate-900 border-4 border-amber-400 rounded-3xl p-6 md:p-8 shadow-2xl text-center text-white">
        {/* Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs md:text-sm font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>¡Misión Cumplida!</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-amber-300 mb-1">{level.title}</h2>
        <p className="text-xs md:text-sm text-cyan-200 font-semibold mb-4">
          Tema dominado: {level.educationalTopic}
        </p>

        {/* Stars Celebration */}
        <div className="flex justify-center items-center gap-3 my-4">
          {[1, 2, 3].map((starIdx) => {
            const isFilled = starIdx <= stars;
            return (
              <div
                key={starIdx}
                className={`transition-all duration-500 transform ${
                  isFilled ? 'scale-110 rotate-3' : 'scale-90 opacity-40'
                }`}
              >
                <div
                  className={`p-3 md:p-4 rounded-2xl border-2 ${
                    isFilled
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/30'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <Star
                    className={`w-8 h-8 md:w-10 md:h-10 ${
                      isFilled ? 'fill-amber-400 text-amber-300' : 'text-slate-600'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 bg-slate-900/80 p-4 rounded-2xl border border-indigo-500/30">
          <div className="p-3 bg-slate-800/80 rounded-xl">
            <span className="text-xs text-slate-400 block font-semibold">Bits Recolectados</span>
            <span className="text-xl md:text-2xl font-black text-cyan-300 flex items-center justify-center gap-1">
              <span>💎</span>
              <span>
                {bitsCollected} / {totalBitsInLevel}
              </span>
            </span>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl">
            <span className="text-xs text-slate-400 block font-semibold">Puntaje Total</span>
            <span className="text-xl md:text-2xl font-black text-amber-300 flex items-center justify-center gap-1">
              <span>⭐</span>
              <span>{score} pts</span>
            </span>
          </div>
        </div>

        {/* Badge Unlocked Notification if any */}
        {newBadgeUnlocked && (
          <div className="my-3 p-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-400/60 rounded-2xl flex items-center gap-3 text-left animate-pulse">
            <div className="p-2 bg-amber-400 rounded-xl text-slate-950 font-black text-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide block">
                ¡Nueva Medalla Desbloqueada!
              </span>
              <span className="text-sm font-bold text-white">{newBadgeUnlocked}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-2.5 justify-center mt-5">
          <button
            onClick={onWorldMap}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-600"
          >
            <Home className="w-4 h-4" />
            <span>Mapa del Mundo</span>
          </button>

          <button
            onClick={onReplay}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-600"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir</span>
          </button>

          <button
            onClick={onNextLevel}
            className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm md:text-base shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border-b-4 border-emerald-700"
          >
            <span>Siguiente</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
