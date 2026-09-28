import React from 'react';
import { CHARACTERS, ACCESSORY_HATS } from '../../data/curriculumData';
import { CharacterId } from '../../types/game';
import { soundService } from '../../services/audio';
import { Sparkles, X, Check, Lock } from 'lucide-react';

interface CharacterModalProps {
  selectedCharacter: CharacterId;
  selectedHat: string;
  totalBits: number;
  onSelectCharacter: (charId: CharacterId) => void;
  onSelectHat: (hatId: string) => void;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  selectedCharacter,
  selectedHat,
  totalBits,
  onSelectCharacter,
  onSelectHat,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border-4 border-indigo-500 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-500/30 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h3 className="text-lg md:text-xl font-black text-white">
              Vestidor de Héroes Cibernéticos 🤖
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6">
          {/* 1. Pick Character */}
          <div>
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3">
              1. Elige tu Avatar Aventurero:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharacter === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => {
                      onSelectCharacter(char.id);
                      soundService.playBitCollect();
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center ${
                      isSelected
                        ? 'bg-indigo-900/80 border-cyan-400 ring-4 ring-cyan-400/40 scale-105 shadow-lg'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-4xl p-2 bg-slate-900/80 rounded-2xl mb-2">
                      {char.avatarEmoji}
                    </span>
                    <h5 className="font-bold text-xs md:text-sm text-white mb-0.5">{char.name}</h5>
                    <span className="text-[10px] text-cyan-300 font-semibold">{char.role}</span>
                    {isSelected && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                        <span>Elegido</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Accessories & Hats */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                2. Sombreros y Accesorios:
              </h4>
              <span className="text-xs font-black text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-500/40">
                Tus Bits: 💎 {totalBits}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACCESSORY_HATS.map((hat) => {
                const isSelected = selectedHat === hat.id;
                const isUnlocked = totalBits >= hat.cost;

                return (
                  <button
                    key={hat.id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (isUnlocked) {
                        onSelectHat(hat.id);
                        soundService.playBitCollect();
                      }
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 text-left ${
                      isSelected
                        ? 'bg-indigo-900/80 border-amber-400 ring-2 ring-amber-400/40'
                        : isUnlocked
                        ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                        : 'bg-slate-950/60 border-slate-800 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-3xl p-2 bg-slate-900 rounded-xl">{hat.emoji}</span>
                    <div>
                      <h5 className="font-bold text-xs md:text-sm text-white">{hat.name}</h5>
                      <span className="text-[10px] text-slate-400 block">
                        {hat.cost === 0 ? '¡Gratis!' : `💎 ${hat.cost} bits`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-transform active:scale-95"
          >
            ¡Listo para Explorar!
          </button>
        </div>
      </div>
    </div>
  );
};
