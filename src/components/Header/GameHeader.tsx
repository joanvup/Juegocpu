import React from 'react';
import { GameProgress, CharacterId } from '../../types/game';
import { CHARACTERS, ACCESSORY_HATS } from '../../data/curriculumData';
import { soundService } from '../../services/audio';
import {
  Volume2,
  VolumeX,
  BookOpen,
  Award,
  Sparkles,
  Gamepad2,
  Smile,
  Mic,
  MicOff,
} from 'lucide-react';

interface GameHeaderProps {
  progress: GameProgress;
  onOpenEncyclopedia: () => void;
  onOpenCertificate: () => void;
  onOpenCharacterModal: () => void;
  onOpenMiniGames: () => void;
  onToggleSound: () => void;
  onToggleNarration: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  progress,
  onOpenEncyclopedia,
  onOpenCertificate,
  onOpenCharacterModal,
  onOpenMiniGames,
  onToggleSound,
  onToggleNarration,
}) => {
  const char = CHARACTERS.find((c) => c.id === progress.selectedCharacter) || CHARACTERS[0];
  const hat = ACCESSORY_HATS.find((h) => h.id === progress.characterHat);

  return (
    <header className="w-full bg-slate-900/95 border-b-2 border-indigo-500/40 px-3 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg select-none backdrop-blur-md sticky top-0 z-30">
      {/* Brand & Avatar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCharacterModal}
          className="relative p-1.5 bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 rounded-2xl border-2 border-cyan-400 shadow-md transition-transform hover:scale-105 active:scale-95 group"
          title="Cambiar avatar y sombreros"
        >
          <span className="text-2xl md:text-3xl">{char.avatarEmoji}</span>
          {hat && hat.id !== 'ninguno' && (
            <span className="absolute -top-2 -right-1 text-sm">{hat.emoji}</span>
          )}
        </button>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs md:text-sm font-black text-amber-300">
              {progress.playerName || 'Super Detective'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
              2do Grado
            </span>
          </div>
          <h1 className="text-xs md:text-sm font-bold text-slate-300 hidden sm:block">
            CiberAventura: El Misterio del Chip Mágico
          </h1>
        </div>
      </div>

      {/* Center Stats: Bits & Trophies */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Total Bits */}
        <div
          onClick={onOpenCharacterModal}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 rounded-2xl border border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-all"
          title="Tus Bits acumulados para desbloquear accesorios"
        >
          <span className="text-base md:text-lg">💎</span>
          <div className="text-left">
            <span className="text-[9px] text-cyan-300 uppercase block font-bold leading-none">
              Bits
            </span>
            <span className="text-xs md:text-sm font-black text-white">{progress.totalBits}</span>
          </div>
        </div>

        {/* Medals Count */}
        <div
          onClick={onOpenCertificate}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 rounded-2xl border border-amber-500/30 cursor-pointer hover:border-amber-400 transition-all"
          title="Ver tus Medallas y Diploma"
        >
          <span className="text-base md:text-lg">🏆</span>
          <div className="text-left">
            <span className="text-[9px] text-amber-300 uppercase block font-bold leading-none">
              Medallas
            </span>
            <span className="text-xs md:text-sm font-black text-white">
              {progress.unlockedBadges.length} / 4
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Mini-Games, Enciclopedia, Diploma, Audio */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Mini-Games Button */}
        <button
          onClick={onOpenMiniGames}
          className="flex items-center gap-1 px-2.5 md:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 border border-emerald-400/40"
          title="Laboratorio de Mini-Juegos Didácticos"
        >
          <Gamepad2 className="w-4 h-4 text-emerald-200" />
          <span className="hidden sm:inline">Mini-Juegos</span>
        </button>

        {/* Encyclopedia Button */}
        <button
          onClick={onOpenEncyclopedia}
          className="flex items-center gap-1 px-2.5 md:px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 border border-indigo-400/40"
          title="Enciclopedia y Curiosidades"
        >
          <BookOpen className="w-4 h-4 text-cyan-300" />
          <span className="hidden sm:inline">Sabías que...</span>
        </button>

        {/* Diploma */}
        <button
          onClick={onOpenCertificate}
          className="flex items-center gap-1 px-2.5 md:px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 border border-amber-400/40"
          title="Ver y Personalizar Diploma"
        >
          <Award className="w-4 h-4 text-amber-200" />
          <span className="hidden sm:inline">Diploma</span>
        </button>

        {/* Audio Narration Toggle (Text-to-Speech) */}
        <button
          onClick={onToggleNarration}
          className={`p-2 rounded-xl border transition-all active:scale-95 ${
            progress.narrationEnabled
              ? 'bg-purple-600/80 border-purple-400 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title={progress.narrationEnabled ? 'Voz de lectura activa' : 'Voz de lectura desactivada'}
        >
          {progress.narrationEnabled ? (
            <Mic className="w-4 h-4 text-amber-300" />
          ) : (
            <MicOff className="w-4 h-4" />
          )}
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-xl border transition-all active:scale-95 ${
            progress.soundEnabled
              ? 'bg-slate-800 border-cyan-400 text-cyan-300'
              : 'bg-slate-800 border-slate-700 text-slate-500'
          }`}
          title={progress.soundEnabled ? 'Sonidos activados' : 'Sonidos desactivados'}
        >
          {progress.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
