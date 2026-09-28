import React, { useState, useEffect } from 'react';
import { InteractiveDoor } from '../../types/game';
import { soundService } from '../../services/audio';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle2, HelpCircle, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizPortalModalProps {
  door: InteractiveDoor;
  onSuccess: (doorId: string) => void;
  onClose: () => void;
}

export const QuizPortalModal: React.FC<QuizPortalModalProps> = ({ door, onSuccess, onClose }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const { question, characterName, characterEmoji, characterDialogue } = door;

  useEffect(() => {
    // Read the question aloud automatically for 2nd grade kids
    const promptToRead = `${characterDialogue || ''} Pregunta: ${question.prompt}. Opción A: ${
      question.options[0]?.text
    }. Opción B: ${question.options[1]?.text}. Opción C: ${question.options[2]?.text}.`;
    soundService.speak(promptToRead);

    return () => {
      soundService.stopSpeaking();
    };
  }, [door, question, characterDialogue]);

  const handleSpeakQuestion = () => {
    const promptToRead = `${characterDialogue || ''} Pregunta: ${question.prompt}. Opción A: ${
      question.options[0]?.text
    }. Opción B: ${question.options[1]?.text}. Opción C: ${question.options[2]?.text}.`;
    soundService.speak(promptToRead, true);
  };

  const handleSelectOption = (optionId: string, correct: boolean) => {
    if (isAnswered && isCorrect) return;
    setSelectedOptionId(optionId);
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      soundService.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      soundService.speak(`¡Excelente! ${question.explanation}`);
    } else {
      soundService.playWrong();
      soundService.speak('¡Casi casi! Intenta de nuevo. Piensa en lo que aprendimos.');
    }
  };

  const handleContinue = () => {
    if (isCorrect) {
      onSuccess(door.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 border-4 border-cyan-400 rounded-3xl p-6 md:p-8 shadow-2xl text-white text-center">
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />

        {/* Top bar with Guardian info & Narration button */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{characterEmoji || '🔮'}</span>
            <div className="text-left">
              <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wide block">
                Guardián del Portal
              </span>
              <span className="font-bold text-amber-300 text-sm md:text-base">
                {characterName || 'Guardián del Chip'}
              </span>
            </div>
          </div>
          <button
            onClick={handleSpeakQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            title="Escuchar en voz alta"
          >
            <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Leer</span>
          </button>
        </div>

        {/* Guardian message / dialogue */}
        {characterDialogue && (
          <div className="p-3 bg-cyan-950/60 rounded-xl border border-cyan-500/30 text-xs md:text-sm text-cyan-200 mb-4 font-medium italic">
            "{characterDialogue}"
          </div>
        )}

        {/* Question Prompt */}
        <div className="bg-slate-800 p-4 rounded-2xl border-2 border-indigo-500/50 mb-5 shadow-inner">
          <div className="flex items-center justify-center gap-2 mb-1 text-amber-400">
            <HelpCircle className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Desafío Educativo</span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-white leading-snug">
            {question.prompt}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle = 'bg-slate-800/90 border-slate-600 hover:border-cyan-400 hover:bg-slate-750 text-white';

            if (isAnswered && isSelected) {
              if (opt.isCorrect) {
                btnStyle = 'bg-emerald-600 border-emerald-400 text-white ring-4 ring-emerald-400/40 animate-bounce-once';
              } else {
                btnStyle = 'bg-rose-600/80 border-rose-400 text-white';
              }
            } else if (isAnswered && opt.isCorrect && !isCorrect) {
              // Optionally show correct or let them retry
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id, opt.isCorrect)}
                className={`w-full p-3.5 md:p-4 rounded-2xl border-2 font-bold text-left text-sm md:text-base transition-all flex items-center justify-between shadow-md active:scale-98 ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl md:text-3xl shrink-0 p-1 bg-slate-900/60 rounded-xl">
                    {opt.emoji}
                  </span>
                  <span className="leading-snug">{opt.text}</span>
                </div>
                {isAnswered && isSelected && (
                  <div className="shrink-0 ml-2">
                    {opt.isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-200 fill-emerald-500" />
                    ) : (
                      <span className="text-xs font-bold bg-rose-900/80 px-2 py-1 rounded-md">
                        ¡Prueba otra!
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Result Message & Actions */}
        {isAnswered && (
          <div className={`p-4 rounded-2xl mb-4 border ${isCorrect ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/80 border-rose-500/50 text-rose-200'}`}>
            <div className="flex items-center justify-center gap-2 mb-1 font-bold text-base">
              {isCorrect ? (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>¡RESPUESTA CORRECTA!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-5 h-5 text-rose-300" />
                  <span>¡No te rindas! Escoge otra opción.</span>
                </>
              )}
            </div>
            <p className="text-xs md:text-sm font-medium">
              {isCorrect ? question.explanation : '¡Recuerda los ingredientes y las funciones que vimos!'}
            </p>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition-all active:scale-95"
          >
            Volver a saltar
          </button>

          {isCorrect && (
            <button
              onClick={handleContinue}
              className="flex-1 max-w-xs px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-sm md:text-base shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border-b-4 border-emerald-700"
            >
              <span>¡ABRIR PUERTA Y CONTINUAR!</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
