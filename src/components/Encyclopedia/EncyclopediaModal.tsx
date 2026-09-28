import React, { useState } from 'react';
import { CURIOSITIES, CuriosityFact } from '../../data/curriculumData';
import { soundService } from '../../services/audio';
import { BookOpen, Volume2, Sparkles, X, Lightbulb } from 'lucide-react';

interface EncyclopediaModalProps {
  onClose: () => void;
}

export const EncyclopediaModal: React.FC<EncyclopediaModalProps> = ({ onClose }) => {
  const [selectedFact, setSelectedFact] = useState<CuriosityFact>(CURIOSITIES[0]);

  const handleSpeak = (fact: CuriosityFact) => {
    soundService.speak(`${fact.title}. ${fact.detailedText}. Dato curioso: ${fact.funFact}`, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-4 border-cyan-400 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-cyan-500/30 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 rounded-2xl border border-cyan-400/40 text-cyan-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest block">
                Investigación para niños - 2do Grado
              </span>
              <h2 className="text-lg md:text-2xl font-black text-white">
                Enciclopedia del Interior de la Computadora 📖
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body: Sidebar list + Detail Card */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Fact list sidebar */}
          <div className="w-full md:w-1/3 p-3 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-800 space-y-2 max-h-[30vh] md:max-h-full">
            {CURIOSITIES.map((fact) => {
              const isSelected = selectedFact.id === fact.id;
              return (
                <button
                  key={fact.id}
                  onClick={() => {
                    setSelectedFact(fact);
                    soundService.playBitCollect();
                  }}
                  className={`w-full p-3 rounded-2xl text-left border-2 transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-indigo-900/70 border-cyan-400 ring-2 ring-cyan-400/30 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <span className="text-2xl p-1.5 bg-slate-900/80 rounded-xl">{fact.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">
                      {fact.category}
                    </span>
                    <h4 className="text-xs md:text-sm font-bold truncate">{fact.title}</h4>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Fact Detail View */}
          <div className="flex-1 p-5 md:p-8 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                  {selectedFact.category}
                </span>

                <button
                  onClick={() => handleSpeak(selectedFact)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-transform active:scale-95"
                >
                  <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Leer en voz alta</span>
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl md:text-5xl p-3 bg-slate-800 rounded-2xl border border-indigo-500/40">
                  {selectedFact.emoji}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-amber-300">
                  {selectedFact.title}
                </h3>
              </div>

              <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium mb-5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                {selectedFact.detailedText}
              </p>

              {/* Fun Fact Box */}
              <div className="p-4 bg-gradient-to-r from-amber-500/15 to-yellow-500/15 rounded-2xl border border-amber-400/40 text-amber-200 flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-black uppercase text-amber-300 tracking-wide mb-0.5">
                    ¿Sabías que...?
                  </h5>
                  <p className="text-xs md:text-sm font-semibold">{selectedFact.funFact}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs md:text-sm border border-slate-700"
              >
                Volver a la Aventura
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
