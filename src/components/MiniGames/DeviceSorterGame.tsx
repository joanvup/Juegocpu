import React, { useState } from 'react';
import { soundService } from '../../services/audio';
import confetti from 'canvas-confetti';
import { ArrowDownLeft, ArrowUpRight, Volume2, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';

interface DeviceItem {
  id: string;
  name: string;
  emoji: string;
  type: 'entrada' | 'salida';
  explanation: string;
}

const DEVICES: DeviceItem[] = [
  {
    id: 'd1',
    name: 'Teclado',
    emoji: '⌨️',
    type: 'entrada',
    explanation: 'El teclado mete letras y números a la computadora (Entrada).',
  },
  {
    id: 'd2',
    name: 'Pantalla / Monitor',
    emoji: '🖥️',
    type: 'salida',
    explanation: 'La pantalla saca imágenes y videos para que los veamos (Salida).',
  },
  {
    id: 'd3',
    name: 'Ratón (Mouse)',
    emoji: '🖱️',
    type: 'entrada',
    explanation: 'El ratón envía clics y movimientos a la computadora (Entrada).',
  },
  {
    id: 'd4',
    name: 'Altavoces / Parlantes',
    emoji: '🔊',
    type: 'salida',
    explanation: 'Los altavoces sacan el sonido y la música hacia nuestros oídos (Salida).',
  },
  {
    id: 'd5',
    name: 'Micrófono',
    emoji: '🎙️',
    type: 'entrada',
    explanation: 'El micrófono mete el sonido de nuestra voz a la computadora (Entrada).',
  },
  {
    id: 'd6',
    name: 'Impresora',
    emoji: '🖨️',
    type: 'salida',
    explanation: 'La impresora saca dibujos y tareas en hojas de papel reales (Salida).',
  },
  {
    id: 'd7',
    name: 'Cámara Web',
    emoji: '📷',
    type: 'entrada',
    explanation: 'La cámara web mete videos e imágenes de nosotros a la computadora (Entrada).',
  },
];

interface DeviceSorterGameProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

export const DeviceSorterGame: React.FC<DeviceSorterGameProps> = ({ onBack, onComplete }) => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const device = DEVICES[index];

  const handleClassify = (chosenType: 'entrada' | 'salida') => {
    if (feedback?.isCorrect) return;

    if (chosenType === device.type) {
      soundService.playSuccess();
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      setScore((s) => s + 40);
      setFeedback({ isCorrect: true, text: `¡Correcto! ${device.explanation}` });
      soundService.speak(`¡Muy bien! ${device.explanation}`);
    } else {
      soundService.playWrong();
      setFeedback({
        isCorrect: false,
        text: `¡Casi! Recuerda: ¿Le da cosas a la computadora (Entrada) o nos muestra cosas a nosotros (Salida)?`,
      });
      soundService.speak('¡Inténtalo de nuevo! Piensa si la información entra o sale.');
    }
  };

  const handleNext = () => {
    setFeedback(null);
    if (index < DEVICES.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onComplete(score + 100);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 bg-slate-900 border-4 border-cyan-400 rounded-3xl shadow-2xl text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/40 text-cyan-300 text-3xl">
            🎯
          </div>
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
              Distinguiendo Periféricos
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              ¿Entrada o Salida? 🔄
            </h2>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
        >
          Salir
        </button>
      </div>

      {/* Main card */}
      <div className="my-6 p-8 bg-slate-800/90 rounded-3xl border-2 border-indigo-500/40 text-center shadow-inner">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-4">
          <span>Objeto {index + 1} de {DEVICES.length}</span>
          <span className="text-amber-400">Puntos: {score} ⭐</span>
        </div>

        <div className="text-6xl my-3 p-4 bg-slate-900/60 inline-block rounded-3xl border border-indigo-400/30">
          {device.emoji}
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-white mt-2 mb-1">{device.name}</h3>
        <p className="text-sm text-cyan-200 font-semibold mb-6">
          ¿Este aparato sirve para dar órdenes (ENTRADA) o para mostrarnos resultados (SALIDA)?
        </p>

        {/* Action Buttons: ENTRADA vs SALIDA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <button
            onClick={() => handleClassify('entrada')}
            className="p-5 rounded-2xl bg-gradient-to-b from-indigo-700 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 border-2 border-indigo-400 font-black text-lg md:text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowDownLeft className="w-6 h-6 text-cyan-300" />
            <span>📥 ENTRADA (Input)</span>
          </button>

          <button
            onClick={() => handleClassify('salida')}
            className="p-5 rounded-2xl bg-gradient-to-b from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 border-2 border-emerald-400 font-black text-lg md:text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-6 h-6 text-emerald-300" />
            <span>📤 SALIDA (Output)</span>
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`mt-6 p-4 rounded-2xl border text-sm font-bold ${
              feedback.isCorrect
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                : 'bg-rose-950/80 border-rose-400 text-rose-200'
            }`}
          >
            <p>{feedback.text}</p>
            {feedback.isCorrect && (
              <button
                onClick={handleNext}
                className="mt-3 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-transform active:scale-95 inline-flex items-center gap-2"
              >
                <span>Siguiente Aparato</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
