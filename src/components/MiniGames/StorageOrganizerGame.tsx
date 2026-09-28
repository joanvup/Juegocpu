import React, { useState } from 'react';
import { soundService } from '../../services/audio';
import confetti from 'canvas-confetti';
import { HardDrive, Cloud, Sparkles, Volume2, RotateCcw, ArrowRight } from 'lucide-react';

interface StorageItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  correctStorage: 'disco_duro' | 'usb' | 'nube';
  reason: string;
}

const STORAGE_ITEMS: StorageItem[] = [
  {
    id: 'item_1',
    name: 'Tarea de Ciencias para llevar al Colegio',
    emoji: '📝',
    description: 'Quieres imprimirla en la computadora de la escuela mañana.',
    correctStorage: 'usb',
    reason: '¡La Memoria USB es la mochila de viaje! Cabe en tu bolsillo para llevarla a la escuela.',
  },
  {
    id: 'item_2',
    name: 'Video de YouTube favorito',
    emoji: '▶️',
    description: 'Quieres verlo desde la tablet, el teléfono o la tele de la sala.',
    correctStorage: 'nube',
    reason: '¡La Nube guarda los videos en Centros de Datos para verlos en cualquier dispositivo!',
  },
  {
    id: 'item_3',
    name: 'El Sistema Operativo y Videojuegos Pesados',
    emoji: '🎮',
    description: 'Los juegos grandes que juegas siempre en tu computadora de la casa.',
    correctStorage: 'disco_duro',
    reason: '¡El Disco Duro es el baúl grande de la casa donde caben todos los juegos y programas!',
  },
  {
    id: 'item_4',
    name: 'Foto de las vacaciones compartida con la abuela',
    emoji: '📸',
    description: 'Para que la abuelita la vea desde su casa lejana por internet.',
    correctStorage: 'nube',
    reason: '¡La Nube conecta el mundo a través de cables submarinos y centros de datos!',
  },
  {
    id: 'item_5',
    name: 'Dibujo del Dinosaurio de Paint guardado en tu compu',
    emoji: '🦖',
    description: 'Para que nunca se pierda si se corta la luz en tu casa.',
    correctStorage: 'disco_duro',
    reason: '¡El Disco Duro protege tus creaciones dentro de la computadora aunque se apague!',
  },
  {
    id: 'item_6',
    name: 'Música en MP3 para escuchar en el auto',
    emoji: '🎵',
    description: 'Un dedito portátil para conectar en la radio del coche.',
    correctStorage: 'usb',
    reason: '¡La Memoria USB es portátil y la puedes conectar donde quieras!',
  },
];

interface StorageOrganizerGameProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

export const StorageOrganizerGame: React.FC<StorageOrganizerGameProps> = ({
  onBack,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const currentItem = STORAGE_ITEMS[currentIndex];

  const handleSelectStorage = (selected: 'disco_duro' | 'usb' | 'nube') => {
    if (feedback?.isCorrect) return;

    if (selected === currentItem.correctStorage) {
      soundService.playSuccess();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      setScore((s) => s + 50);
      setFeedback({
        isCorrect: true,
        message: `¡Correcto! ${currentItem.reason}`,
      });
      soundService.speak(`¡Muy bien! ${currentItem.reason}`);
    } else {
      soundService.playWrong();
      setFeedback({
        isCorrect: false,
        message: '¡Casi! Piensa en si necesitas llevarlo a la escuela, guardarlo en casa o verlo por internet.',
      });
      soundService.speak('¡Inténtalo de nuevo! Escoge el baúl adecuado.');
    }
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentIndex < STORAGE_ITEMS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete(score);
    }
  };

  const handleSpeakItem = () => {
    soundService.speak(
      `Tesoro digital: ${currentItem.name}. ${currentItem.description}. ¿En qué baúl digital lo guardas?`
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-900 border-4 border-cyan-400 rounded-3xl shadow-2xl text-white">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/40 text-cyan-300 text-3xl">
            <HardDrive className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
              Desafío de Almacenamiento
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              El Guardián de los 3 Baúles 💾
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeakItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>Leer</span>
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Progress & Item to organize */}
      <div className="my-5 p-6 bg-slate-800/90 rounded-3xl border-2 border-indigo-500/40 text-center shadow-inner">
        <div className="flex justify-between items-center mb-3 text-xs font-bold text-slate-400">
          <span>
            Objeto {currentIndex + 1} de {STORAGE_ITEMS.length}
          </span>
          <span className="text-amber-400">Puntos: {score} ⭐</span>
        </div>

        <div className="text-5xl my-2 p-3 bg-slate-900/60 inline-block rounded-2xl border border-indigo-400/30">
          {currentItem.emoji}
        </div>
        <h3 className="text-xl md:text-2xl font-black text-white mt-2 mb-1">
          {currentItem.name}
        </h3>
        <p className="text-sm md:text-base text-cyan-200 font-medium max-w-xl mx-auto">
          {currentItem.description}
        </p>
      </div>

      {/* The 3 Storage Chests */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* Chest 1: Disco Duro */}
        <button
          onClick={() => handleSelectStorage('disco_duro')}
          className="p-5 bg-gradient-to-b from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 border-2 border-amber-400/60 hover:border-amber-400 rounded-3xl text-left transition-all hover:scale-103 active:scale-97 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">💿</span>
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              El Baúl Grande
            </span>
          </div>
          <h4 className="text-lg font-black text-amber-300 group-hover:text-amber-200">
            Disco Duro
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Escondido dentro de la casa de la computadora. Cabe todo y no se borra.
          </p>
        </button>

        {/* Chest 2: Memoria USB */}
        <button
          onClick={() => handleSelectStorage('usb')}
          className="p-5 bg-gradient-to-b from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 border-2 border-emerald-400/60 hover:border-emerald-400 rounded-3xl text-left transition-all hover:scale-103 active:scale-97 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🎒</span>
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              La Mochila Viajera
            </span>
          </div>
          <h4 className="text-lg font-black text-emerald-300 group-hover:text-emerald-200">
            Memoria USB
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Pequeñita como un dedito. La llevas en el bolsillo a la escuela.
          </p>
        </button>

        {/* Chest 3: La Nube */}
        <button
          onClick={() => handleSelectStorage('nube')}
          className="p-5 bg-gradient-to-b from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 border-2 border-cyan-400/60 hover:border-cyan-400 rounded-3xl text-left transition-all hover:scale-103 active:scale-97 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">☁️</span>
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Centros de Datos
            </span>
          </div>
          <h4 className="text-lg font-black text-cyan-300 group-hover:text-cyan-200">
            La Nube
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Cables submarinos y miles de computadoras encendidas para todo el mundo.
          </p>
        </button>
      </div>

      {/* Feedback & Continue */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl mb-4 border text-center transition-all ${
            feedback.isCorrect
              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
              : 'bg-rose-950/90 border-rose-400 text-rose-200'
          }`}
        >
          <p className="text-sm md:text-base font-bold">{feedback.message}</p>
          {feedback.isCorrect && (
            <button
              onClick={handleNext}
              className="mt-3 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-transform active:scale-95 inline-flex items-center gap-2"
            >
              <span>
                {currentIndex < STORAGE_ITEMS.length - 1 ? '¡Siguiente Tesoro!' : '¡Completar Desafío!'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
