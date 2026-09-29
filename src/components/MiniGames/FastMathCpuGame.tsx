import React, { useState, useEffect } from 'react';
import { soundService } from '../../services/audio';
import confetti from 'canvas-confetti';
import { Zap, Volume2, RotateCcw, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface MathQuestion {
  num1: number;
  num2: number;
  options: number[];
  answer: number;
}

const QUESTIONS: MathQuestion[] = [
  { num1: 2, num2: 2, options: [3, 4, 5], answer: 4 },
  { num1: 5, num2: 3, options: [7, 8, 9], answer: 8 },
  { num1: 10, num2: 5, options: [12, 15, 20], answer: 15 },
  { num1: 4, num2: 4, options: [6, 8, 10], answer: 8 },
  { num1: 6, num2: 2, options: [8, 9, 10], answer: 8 },
  { num1: 7, num2: 3, options: [9, 10, 11], answer: 10 },
];

interface FastMathCpuGameProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

export const FastMathCpuGame: React.FC<FastMathCpuGameProps> = ({ onBack, onComplete }) => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const q = QUESTIONS[index];

  useEffect(() => {
    soundService.speak(`¿Cuánto es ${q.num1} más ${q.num2}? ¡La CPU lo calcula en un parpadeo!`);
  }, [index, q]);

  const handleSelect = (choice: number) => {
    if (choice === q.answer) {
      soundService.playSuccess();
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      setScore((s) => s + 30);
      setFeedback('¡CORRECTO! ¡La CPU procesó el cálculo en microsegundos!');
      soundService.speak(`¡Excelente! ${q.num1} más ${q.num2} es igual a ${q.answer}.`);

      setTimeout(() => {
        setFeedback(null);
        if (index < QUESTIONS.length - 1) {
          setIndex((i) => i + 1);
        } else {
          onComplete(score + 100);
        }
      }, 1400);
    } else {
      soundService.playWrong();
      setFeedback('¡Casi casi! Cuenta con tus deditos e intenta de nuevo.');
      soundService.speak('¡Inténtalo de nuevo! La CPU te ayuda.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6 bg-slate-900 border-4 border-yellow-400 rounded-3xl shadow-2xl text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/20 rounded-2xl border border-yellow-400/40 text-yellow-300 text-3xl">
            <Zap className="w-8 h-8 fill-yellow-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest block">
              Entrenamiento de Velocidad CPU
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              El Rayo de Sumas de la CPU ⚡
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

      {/* Progress & Math Card */}
      <div className="my-6 p-8 bg-slate-800/90 rounded-3xl border-2 border-yellow-500/40 text-center shadow-inner">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-4">
          <span>Pregunta {index + 1} de {QUESTIONS.length}</span>
          <span className="text-amber-400">Puntos: {score} ⭐</span>
        </div>

        <span className="text-xs uppercase font-black px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
          Operación Aritmética
        </span>

        <div className="text-4xl md:text-6xl font-black text-yellow-300 my-6 tracking-wider">
          {q.num1} + {q.num2} = ?
        </div>

        <p className="text-sm text-cyan-200 font-semibold mb-6">
          ¿Cuál es el resultado que la CPU enviará a la pantalla?
        </p>

        {/* Options */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className="py-4 md:py-6 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 hover:from-yellow-500 hover:to-orange-500 hover:text-slate-950 font-black text-2xl md:text-3xl border-2 border-yellow-400/60 shadow-lg transition-transform active:scale-95"
            >
              {opt}
            </button>
          ))}
        </div>

        {feedback && (
          <div className="mt-6 p-3 bg-yellow-950/80 border border-yellow-500/60 rounded-xl text-yellow-200 font-bold text-sm animate-pulse">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};
