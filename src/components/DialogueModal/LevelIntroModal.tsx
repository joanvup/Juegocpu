import React, { useEffect } from 'react';
import { LevelData } from '../../types/game';
import { soundService } from '../../services/audio';
import { Volume2, Play, Sparkles } from 'lucide-react';

interface LevelIntroModalProps {
  level: LevelData;
  onStart: () => void;
  onCancel: () => void;
}

export const LevelIntroModal: React.FC<LevelIntroModalProps> = ({ level, onStart, onCancel }) => {
  useEffect(() => {
    soundService.speak(
      `${level.title}. ${level.storyIntro}. Consejo de ${level.guideCharacter.name}: ${level.guideCharacter.tip}`
    );
    return () => {
      soundService.stopSpeaking();
    };
  }, [level]);

  const handleSpeak = () => {
    soundService.speak(
      `${level.title}. ${level.storyIntro}. Consejo de ${level.guideCharacter.name}: ${level.guideCharacter.tip}`,
      true
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-800 to-slate-900 border-4 border-amber-400/80 rounded-3xl p-6 md:p-8 shadow-2xl text-center text-white overflow-hidden">
        {/* Glowing background decor */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-center mb-2">
          <span className="text-xs md:text-sm font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
            {level.educationalTopic}
          </span>
          <button
            onClick={handleSpeak}
            className="p-2 bg-indigo-600/80 hover:bg-indigo-500 rounded-full text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 text-xs font-semibold px-3"
            title="Escuchar en voz alta"
          >
            <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Escuchar</span>
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-amber-300 mt-2 mb-1 tracking-tight drop-shadow-md">
          {level.title}
        </h2>
        <p className="text-sm md:text-base text-cyan-200 font-semibold mb-4">{level.subtitle}</p>

        {/* Character Speech Box */}
        <div className="my-4 p-4 bg-slate-800/90 rounded-2xl border-2 border-indigo-500/40 flex items-start gap-3.5 text-left shadow-inner">
          <div className="text-4xl md:text-5xl shrink-0 p-2 bg-indigo-950/80 rounded-2xl border border-indigo-400/30 shadow-md">
            {level.guideCharacter.emoji}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-400 mb-1">{level.guideCharacter.name}</h4>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              "{level.storyIntro}"
            </p>
          </div>
        </div>

        {/* Level Tip */}
        <div className="mb-6 p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs md:text-sm text-amber-200/90 flex items-center gap-2 text-left">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Pista de aventura:</strong> {level.guideCharacter.tip}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm transition-all active:scale-95 border border-slate-600"
          >
            Volver al Mapa
          </button>
          <button
            onClick={onStart}
            className="flex-1 max-w-xs px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border-b-4 border-emerald-700"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>¡JUGAR NIVEL!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
