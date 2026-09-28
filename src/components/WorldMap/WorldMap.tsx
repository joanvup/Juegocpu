import React, { useState } from 'react';
import { WORLDS_DATA } from '../../data/levelsData';
import { BADGES } from '../../data/curriculumData';
import { GameProgress, LevelData, WorldData, WorldId } from '../../types/game';
import { soundService } from '../../services/audio';
import {
  Star,
  Lock,
  Play,
  Award,
  Sparkles,
  Gamepad2,
  BookOpen,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface WorldMapProps {
  progress: GameProgress;
  onSelectLevel: (level: LevelData) => void;
  onOpenMiniGame: (gameType: 'kitchen' | 'storage' | 'cloud' | 'dino' | 'cycle') => void;
  onOpenEncyclopedia: () => void;
  onOpenCertificate: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  progress,
  onSelectLevel,
  onOpenMiniGame,
  onOpenEncyclopedia,
  onOpenCertificate,
}) => {
  const [activeWorldId, setActiveWorldId] = useState<WorldId>('entrada');

  const activeWorld = WORLDS_DATA.find((w) => w.id === activeWorldId) || WORLDS_DATA[0];

  const handleSelectWorld = (wId: WorldId) => {
    setActiveWorldId(wId);
    soundService.playBitCollect();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 select-none animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-4 border-indigo-500/50 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Aventura Educativa • 2do Grado</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
              ¡Viaje al Interior de la Computadora! 🚀
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-2 max-w-2xl font-medium">
              Explora los 4 reinos digitales, supera los desafíos de plataformas, ayuda al <strong>Chef CPU</strong> y guarda tus tesoros en los <strong>Baúles Digitales</strong>.
            </p>
          </div>

          {/* Quick Lab Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => onOpenMiniGame('kitchen')}
              className="px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400 text-amber-200 font-bold text-xs md:text-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <span>👨‍🍳 Cocina CPU</span>
            </button>
            <button
              onClick={() => onOpenMiniGame('storage')}
              className="px-4 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border-2 border-cyan-400 text-cyan-200 font-bold text-xs md:text-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <span>💾 3 Baúles</span>
            </button>
            <button
              onClick={() => onOpenMiniGame('dino')}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border-2 border-emerald-400 text-emerald-200 font-bold text-xs md:text-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <span>🦖 Dino Paint</span>
            </button>
          </div>
        </div>
      </div>

      {/* World Tabs Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {WORLDS_DATA.map((world, idx) => {
          const isUnlocked = progress.unlockedWorlds.includes(world.id);
          const isSelected = activeWorldId === world.id;

          return (
            <button
              key={world.id}
              onClick={() => isUnlocked && handleSelectWorld(world.id)}
              disabled={!isUnlocked}
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center text-center relative overflow-hidden shadow-lg ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-900/90 to-slate-900 border-amber-400 ring-4 ring-amber-400/30 scale-102'
                  : isUnlocked
                  ? 'bg-slate-850/80 border-slate-700 hover:border-indigo-400/60'
                  : 'bg-slate-900/40 border-slate-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="text-3xl md:text-4xl mb-1">{world.emoji}</div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                Mundo {idx + 1}
              </span>
              <h3 className="text-xs md:text-sm font-black text-white truncate max-w-full">
                {world.title}
              </h3>

              {!isUnlocked && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>Bloqueado</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active World Details & Level Path */}
      <div className="bg-slate-900/90 border-4 border-indigo-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* World Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{activeWorld.emoji}</span>
              <h2 className="text-xl md:text-3xl font-black text-white">{activeWorld.name}</h2>
            </div>
            <p className="text-xs md:text-sm text-cyan-200 font-medium">
              {activeWorld.conceptSummary}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Medalla del Mundo:
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 rounded-xl border border-amber-400/40 text-amber-300 font-black text-xs">
              <span>{activeWorld.badgeEmoji}</span>
              <span>{activeWorld.badgeName}</span>
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div>
          <h3 className="text-xs md:text-sm font-black text-amber-400 uppercase tracking-widest mb-4">
            Niveles de Plataforma y Desafíos Didácticos:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeWorld.levels.map((lvl, index) => {
              const isUnlocked = progress.unlockedLevels.includes(lvl.id);
              const record = progress.completedLevels[lvl.id];
              const stars = record ? record.stars : 0;

              return (
                <div
                  key={lvl.id}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-slate-800 to-slate-850 border-indigo-500/60 hover:border-cyan-400 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div>
                    {/* Top Tag & Stars */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Nivel {index + 1}
                      </span>

                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h4 className="text-base font-black text-white mb-1">{lvl.title}</h4>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4">
                      {lvl.subtitle}
                    </p>
                  </div>

                  {/* Play / Lock Button */}
                  <div>
                    {isUnlocked ? (
                      <button
                        onClick={() => {
                          soundService.playBitCollect();
                          onSelectLevel(lvl);
                        }}
                        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs md:text-sm shadow-md transition-all hover:scale-103 active:scale-95 flex items-center justify-center gap-2 border-b-4 border-emerald-700"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>{record ? '¡JUGAR DE NUEVO!' : '¡COMENZAR NIVEL!'}</span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 border border-slate-800">
                        <Lock className="w-4 h-4" />
                        <span>Supera el nivel anterior</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges and Trophies Gallery Summary */}
      <div className="p-6 bg-slate-900/80 rounded-3xl border-2 border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <h3 className="text-base md:text-lg font-black text-white">
              Tus Medallas de Detective Digital
            </h3>
          </div>

          <button
            onClick={onOpenCertificate}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Ver Diploma Completo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map((badge) => {
            const isEarned = progress.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  isEarned
                    ? 'bg-amber-500/15 border-amber-400/80 text-white shadow-md'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-40'
                }`}
              >
                <span className="text-3xl p-2 bg-slate-900 rounded-xl">{badge.emoji}</span>
                <div>
                  <h4 className="text-xs md:text-sm font-bold leading-tight">{badge.name}</h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {isEarned ? '✅ Desbloqueada' : '🔒 Por descubrir'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
