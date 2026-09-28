import React, { useState } from 'react';
import { soundService } from '../../services/audio';
import confetti from 'canvas-confetti';
import { ChefHat, Sparkles, Volume2, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  inputDevice: string;
  inputEmoji: string;
  inputDesc: string;
  processDesc: string;
  outputResult: string;
  outputEmoji: string;
  outputDevice: string;
}

const RECIPES: Recipe[] = [
  {
    id: 'rec_1',
    name: 'La Suma Mágica (2 + 2 = 4)',
    inputDevice: 'Teclado',
    inputEmoji: '⌨️',
    inputDesc: 'Escribes con los dedos "2 + 2"',
    processDesc: 'La CPU (el Chef) piensa en un milisegundo y calcula la suma',
    outputResult: 'El número 4 brillante',
    outputEmoji: '4️⃣',
    outputDevice: 'Pantalla',
  },
  {
    id: 'rec_2',
    name: 'El Pastel de Cumpleaños',
    inputDevice: 'Ratón (Mouse)',
    inputEmoji: '🖱️',
    inputDesc: 'Haces clic en los ingredientes: harina, huevos y azúcar',
    processDesc: 'La CPU hornea la masa y mezcla el betún digital',
    outputResult: 'Un delicioso pastel de fresa',
    outputEmoji: '🎂',
    outputDevice: 'Pantalla',
  },
  {
    id: 'rec_3',
    name: 'El Dibujo del Dinosaurio',
    inputDevice: 'Ratón y Pincel',
    inputEmoji: '🎨',
    inputDesc: 'Arrastras los colores verdes y morados',
    processDesc: 'La CPU calcula cada línea y punto de color',
    outputResult: 'El Dinosaurio Pixelado de Paint',
    outputEmoji: '🦖',
    outputDevice: 'Pantalla',
  },
  {
    id: 'rec_4',
    name: 'La Canción del Robot',
    inputDevice: 'Micrófono',
    inputEmoji: '🎙️',
    inputDesc: 'Cantas "¡Hola computadora!"',
    processDesc: 'La CPU procesa las ondas sonoras de tu voz',
    outputResult: '¡Música robótica divertida!',
    outputEmoji: '🔊',
    outputDevice: 'Altavoces',
  },
];

interface CpuKitchenGameProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

export const CpuKitchenGame: React.FC<CpuKitchenGameProps> = ({ onBack, onComplete }) => {
  const [currentRecipeIdx, setCurrentRecipeIdx] = useState(0);
  const [cookingStage, setCookingStage] = useState<'input' | 'processing' | 'output'>('input');
  const [completedRecipes, setCompletedRecipes] = useState<string[]>([]);

  const recipe = RECIPES[currentRecipeIdx];

  const handleStartCooking = () => {
    soundService.playBitCollect();
    setCookingStage('processing');
    soundService.playFanSound();
    soundService.speak(`Paso 2: PROCESO. ${recipe.processDesc}. ¡El ventilador hace Fuuuu porque la CPU piensa muy rápido!`);

    setTimeout(() => {
      setCookingStage('output');
      soundService.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      soundService.speak(`Paso 3: SALIDA. ¡Aquí está el resultado! ${recipe.outputResult} en la ${recipe.outputDevice}.`);
      if (!completedRecipes.includes(recipe.id)) {
        setCompletedRecipes((prev) => [...prev, recipe.id]);
      }
    }, 2800);
  };

  const handleNextRecipe = () => {
    if (currentRecipeIdx < RECIPES.length - 1) {
      setCurrentRecipeIdx((i) => i + 1);
      setCookingStage('input');
    } else {
      onComplete(completedRecipes.length * 50);
    }
  };

  const handleSpeakRecipe = () => {
    soundService.speak(
      `Receta: ${recipe.name}. Paso 1: Entrada con ${recipe.inputDevice}. ${recipe.inputDesc}.`
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-900 border-4 border-amber-400 rounded-3xl shadow-2xl text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-400/40 text-amber-300 text-3xl">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              Laboratorio Interactivo
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              La Cocina del Chef CPU 👨‍🍳
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeakRecipe}
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

      {/* Recipe Progress Bar */}
      <div className="flex items-center justify-between my-4 px-2">
        <span className="text-xs font-bold text-slate-400">
          Receta {currentRecipeIdx + 1} de {RECIPES.length}
        </span>
        <div className="flex gap-2">
          {RECIPES.map((r, idx) => (
            <div
              key={r.id}
              className={`w-8 h-3 rounded-full transition-all ${
                idx === currentRecipeIdx
                  ? 'bg-amber-400 ring-2 ring-amber-400/50'
                  : completedRecipes.includes(r.id)
                  ? 'bg-emerald-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Kitchen Stage */}
      <div className="bg-slate-800/80 border-2 border-indigo-500/30 rounded-3xl p-6 md:p-8 text-center my-4 shadow-inner">
        <h3 className="text-xl md:text-2xl font-black text-amber-300 mb-2">{recipe.name}</h3>

        {/* The 3 Steps Flow Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {/* STEP 1: ENTRADA */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              cookingStage === 'input'
                ? 'bg-indigo-900/60 border-cyan-400 ring-4 ring-cyan-400/30 shadow-lg scale-105'
                : 'bg-slate-900/60 border-slate-700 opacity-80'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 block mb-1">
              1. ENTRADA (Ingredientes)
            </span>
            <div className="text-4xl my-2">{recipe.inputEmoji}</div>
            <h4 className="font-bold text-base text-white">{recipe.inputDevice}</h4>
            <p className="text-xs text-slate-300 mt-1">{recipe.inputDesc}</p>
          </div>

          {/* STEP 2: PROCESO */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              cookingStage === 'processing'
                ? 'bg-purple-900/60 border-amber-400 ring-4 ring-amber-400/30 shadow-lg scale-105 animate-pulse'
                : 'bg-slate-900/60 border-slate-700 opacity-80'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-1">
              2. PROCESO (Chef CPU)
            </span>
            <div className="text-4xl my-2">
              {cookingStage === 'processing' ? '👨‍🍳💨' : '🧠'}
            </div>
            <h4 className="font-bold text-base text-white">La CPU Piensa</h4>
            <p className="text-xs text-slate-300 mt-1">
              {cookingStage === 'processing'
                ? '¡Cocinando a la velocidad de la luz! ¡Fuuuuuu!'
                : recipe.processDesc}
            </p>
          </div>

          {/* STEP 3: SALIDA */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              cookingStage === 'output'
                ? 'bg-emerald-900/60 border-emerald-400 ring-4 ring-emerald-400/30 shadow-lg scale-105'
                : 'bg-slate-900/60 border-slate-700 opacity-80'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-1">
              3. SALIDA (El Pastel)
            </span>
            <div className="text-4xl my-2">
              {cookingStage === 'output' ? recipe.outputEmoji : '🎁'}
            </div>
            <h4 className="font-bold text-base text-white">{recipe.outputDevice}</h4>
            <p className="text-xs text-slate-300 mt-1">
              {cookingStage === 'output' ? recipe.outputResult : 'Esperando al Chef...'}
            </p>
          </div>
        </div>

        {/* Action button based on stage */}
        <div className="mt-6 flex justify-center">
          {cookingStage === 'input' && (
            <button
              onClick={handleStartCooking}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border-b-4 border-amber-700"
            >
              <Sparkles className="w-6 h-6 fill-slate-950" />
              <span>¡ENTREGAR INGREDIENTES AL CHEF!</span>
            </button>
          )}

          {cookingStage === 'processing' && (
            <div className="flex items-center gap-3 px-6 py-3 bg-purple-950 rounded-2xl border border-purple-500/50 text-purple-200 animate-pulse font-bold">
              <span className="text-2xl animate-spin">⚙️</span>
              <span>¡La CPU está pensando y horneando millones de cálculos!</span>
            </div>
          )}

          {cookingStage === 'output' && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setCookingStage('input')}
                className="px-5 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Repetir Receta</span>
              </button>

              <button
                onClick={handleNextRecipe}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border-b-4 border-emerald-700"
              >
                <span>
                  {currentRecipeIdx < RECIPES.length - 1 ? '¡Siguiente Receta!' : '¡Finalizar Cocina!'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
