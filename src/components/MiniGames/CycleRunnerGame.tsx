import React, { useState } from 'react';
import { soundService } from '../../services/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Volume2, RotateCcw, ArrowRight, Award } from 'lucide-react';

interface StepCard {
  id: string;
  orderNumber: number;
  title: string;
  emoji: string;
  actionDesc: string;
}

const STEPS_ORIGINAL: StepCard[] = [
  {
    id: 's1',
    orderNumber: 1,
    title: '1. ENTRADA',
    emoji: '⌨️',
    actionDesc: 'Le doy una orden a la computadora con el Ratón o el Teclado.',
  },
  {
    id: 's2',
    orderNumber: 2,
    title: '2. PROCESO',
    emoji: '👨‍🍳',
    actionDesc: 'La CPU (el cerebro) piensa rápido qué hacer.',
  },
  {
    id: 's3',
    orderNumber: 3,
    title: '3. SALIDA',
    emoji: '🖥️',
    actionDesc: 'La Pantalla o la Impresora me muestran el resultado.',
  },
  {
    id: 's4',
    orderNumber: 4,
    title: '4. ALMACENAMIENTO',
    emoji: '💾',
    actionDesc: 'Lo guardo en el Disco o la Nube para que nunca se pierda.',
  },
];

interface CycleRunnerGameProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

export const CycleRunnerGame: React.FC<CycleRunnerGameProps> = ({ onBack, onComplete }) => {
  // Shuffled cards for the student to select in correct order
  const [selectedSequence, setSelectedSequence] = useState<StepCard[]>([]);
  const [availableCards, setAvailableCards] = useState<StepCard[]>(() =>
    [...STEPS_ORIGINAL].sort(() => Math.random() - 0.5)
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectCard = (card: StepCard) => {
    const nextExpected = selectedSequence.length + 1;
    if (card.orderNumber === nextExpected) {
      soundService.playSuccess();
      const newSequence = [...selectedSequence, card];
      setSelectedSequence(newSequence);
      setAvailableCards((prev) => prev.filter((c) => c.id !== card.id));

      soundService.speak(`¡Correcto! ${card.title}. ${card.actionDesc}`);

      if (newSequence.length === 4) {
        setIsSuccess(true);
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        soundService.speak(
          '¡Extraordinario Detective! Has ordenado el gran viaje de la información a la perfección: Entrada, Proceso, Salida y Almacenamiento.'
        );
      }
    } else {
      soundService.playWrong();
      soundService.speak('¡Ese no es el siguiente paso! Recuerda: primero entra la orden, luego la CPU piensa, después sale el resultado y al final se guarda.');
    }
  };

  const handleReset = () => {
    setSelectedSequence([]);
    setAvailableCards([...STEPS_ORIGINAL].sort(() => Math.random() - 0.5));
    setIsSuccess(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-900 border-4 border-rose-400 rounded-3xl shadow-2xl text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-400/40 text-rose-300 text-3xl">
            🌟
          </div>
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block">
              El Gran Resumen de la Información
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              El Ciclo de los 4 Pasos Mágicos ✨
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              soundService.speak(
                'Ordena los 4 pasos mágicos en orden: 1 Entrada, 2 Proceso, 3 Salida y 4 Almacenamiento.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>Instrucciones</span>
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Target Sequence Slots (1 -> 2 -> 3 -> 4) */}
      <div className="my-5 p-5 bg-slate-800/80 rounded-3xl border-2 border-indigo-500/30">
        <h3 className="text-center font-bold text-amber-300 text-sm md:text-base mb-4">
          Coloca los 4 pasos en orden tocando las tarjetas de abajo:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((stepNumber) => {
            const placedCard = selectedSequence.find((c) => c.orderNumber === stepNumber);
            return (
              <div
                key={stepNumber}
                className={`min-h-[140px] p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                  placedCard
                    ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
                    : 'bg-slate-900/60 border-dashed border-slate-600'
                }`}
              >
                {placedCard ? (
                  <>
                    <span className="text-3xl mb-1">{placedCard.emoji}</span>
                    <h4 className="text-sm font-black text-emerald-300">{placedCard.title}</h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                      {placedCard.actionDesc}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-2xl text-slate-600 mb-1">#{stepNumber}</span>
                    <span className="text-xs text-slate-400 font-bold">Paso {stepNumber}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Cards To Click */}
      {!isSuccess && availableCards.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Tarjetas disponibles (Toca la siguiente en orden):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleSelectCard(card)}
                className="p-4 bg-gradient-to-b from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 border-2 border-indigo-400/60 hover:border-cyan-400 rounded-2xl text-left flex items-start gap-3 shadow-md transition-transform active:scale-95 group"
              >
                <span className="text-3xl p-2 bg-slate-900/60 rounded-xl">{card.emoji}</span>
                <div>
                  <h5 className="text-base font-bold text-cyan-300 group-hover:text-cyan-200">
                    {card.title}
                  </h5>
                  <p className="text-xs text-slate-300 mt-0.5">{card.actionDesc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Success Celebration */}
      {isSuccess && (
        <div className="p-6 bg-emerald-950/80 rounded-3xl border-2 border-emerald-400 text-center my-4">
          <div className="text-4xl mb-2">🎉🏆✨</div>
          <h3 className="text-xl md:text-2xl font-black text-emerald-300">
            ¡EXCELENTE! ¡ERES UN VERDADERO DETECTIVE DIGITAL!
          </h3>
          <p className="text-sm text-slate-200 mt-1 max-w-lg mx-auto">
            Has dominado todo el viaje: 1. Entrada, 2. Proceso, 3. Salida y 4. Almacenamiento.
          </p>

          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" />
              Repetir
            </button>
            <button
              onClick={() => onComplete(200)}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              ¡Recoger Diploma y Puntos!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
