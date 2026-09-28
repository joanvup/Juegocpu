import React, { useState, useRef } from 'react';
import { soundService } from '../../services/audio';
import confetti from 'canvas-confetti';
import { Award, Printer, Download, Sparkles, X, CheckCircle, Edit3 } from 'lucide-react';

interface CertificateModalProps {
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  unlockedBadgesCount: number;
  totalScore: number;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  playerName,
  onUpdatePlayerName,
  unlockedBadgesCount,
  totalScore,
  onClose,
}) => {
  const [name, setName] = useState(playerName || 'Super Detective');
  const [isEditing, setIsEditing] = useState(false);
  const certRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    soundService.playSuccess();
    window.print();
  };

  const handleSaveName = () => {
    if (name.trim()) {
      onUpdatePlayerName(name.trim());
      setIsEditing(false);
      soundService.playSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl max-h-[95vh] bg-slate-900 border-4 border-amber-400 rounded-3xl shadow-2xl flex flex-col text-white overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <h3 className="text-base md:text-lg font-black text-amber-300">
              Diploma Oficial de 2do Grado 📜
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display (Printable Area) */}
        <div className="p-4 md:p-6">
          <div
            ref={certRef}
            className="relative p-6 md:p-10 bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 text-slate-900 rounded-3xl border-8 border-amber-600/80 shadow-2xl text-center overflow-hidden"
          >
            {/* Corner Badges & Flourishes */}
            <div className="absolute top-3 left-3 text-2xl">✨</div>
            <div className="absolute top-3 right-3 text-2xl">✨</div>
            <div className="absolute bottom-3 left-3 text-2xl">🌟</div>
            <div className="absolute bottom-3 right-3 text-2xl">🌟</div>

            <div className="inline-block px-4 py-1 bg-amber-600 text-amber-50 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-3 shadow-md">
              Colegio Digital de Primaria • 2do Grado
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-amber-900 uppercase tracking-tight mb-1">
              DIPLOMA DE HONOR
            </h1>
            <p className="text-sm md:text-base font-bold text-amber-800 italic mb-4">
              Gran Detective del Interior de la Computadora
            </p>

            <p className="text-xs md:text-sm text-slate-700 font-semibold max-w-lg mx-auto">
              Se otorga con orgullo y admiración al brillante estudiante:
            </p>

            {/* Student Name */}
            <div className="my-4 flex items-center justify-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-4 py-2 text-lg md:text-2xl font-black text-amber-950 bg-white border-2 border-amber-500 rounded-xl text-center shadow-inner focus:outline-none"
                    maxLength={30}
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
                  <h2 className="text-2xl md:text-4xl font-black text-amber-950 underline decoration-amber-500 decoration-wavy">
                    {name}
                  </h2>
                  <Edit3 className="w-5 h-5 text-amber-700" />
                </div>
              )}
            </div>

            <p className="text-xs md:text-sm text-slate-800 font-medium leading-relaxed max-w-md mx-auto mb-6">
              Por haber completado con éxito la expedición al interior de la computadora, descifrando el secreto de la <strong>CPU (El Chef)</strong>, el <strong>Silicio</strong>, el <strong>Ventilador Frío</strong>, el <strong>Disco Duro</strong>, la <strong>Memoria USB</strong> y <strong>La Nube</strong>.
            </p>

            {/* The 4 Magic Crystals Stamp */}
            <div className="flex justify-center items-center gap-4 my-4 p-3 bg-amber-200/60 rounded-2xl border border-amber-400/60 max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <span className="text-2xl">⌨️</span>
                <span className="text-[10px] font-black uppercase text-amber-900">Entrada</span>
              </div>
              <div className="text-amber-600 font-black">➔</div>
              <div className="flex flex-col items-center">
                <span className="text-2xl">👨‍🍳</span>
                <span className="text-[10px] font-black uppercase text-amber-900">Proceso</span>
              </div>
              <div className="text-amber-600 font-black">➔</div>
              <div className="flex flex-col items-center">
                <span className="text-2xl">🖥️</span>
                <span className="text-[10px] font-black uppercase text-amber-900">Salida</span>
              </div>
              <div className="text-amber-600 font-black">➔</div>
              <div className="flex flex-col items-center">
                <span className="text-2xl">💾</span>
                <span className="text-[10px] font-black uppercase text-amber-900">Guardado</span>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="flex justify-between items-end mt-6 pt-4 border-t-2 border-amber-300 text-xs text-amber-950 font-bold">
              <div className="text-left">
                <div className="text-amber-800 font-black font-mono">Profesor Bit 🧙‍♂️</div>
                <div className="text-[10px] text-slate-600">Guardián de la Computadora</div>
              </div>

              {/* Gold Seal */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-4 border-amber-200 flex flex-col items-center justify-center shadow-lg transform rotate-6">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-amber-950" />
                <span className="text-[8px] md:text-[9px] font-black uppercase text-amber-950">
                  OFICIAL
                </span>
              </div>

              <div className="text-right">
                <div className="text-amber-800 font-black font-mono">Chef CPU 👨‍🍳</div>
                <div className="text-[10px] text-slate-600">Unidad de Procesamiento</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center items-center gap-3 mt-4">
            <button
              onClick={handlePrint}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 border-b-4 border-amber-700"
            >
              <Printer className="w-5 h-5" />
              <span>Imprimir Diploma</span>
            </button>

            <button
              onClick={() => {
                soundService.playSuccess();
                confetti({ particleCount: 70, spread: 80 });
              }}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>¡Celebrar con Confeti!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
