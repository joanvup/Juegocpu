import React, { useState } from 'react';
import { soundService } from '../../services/audio';
import confetti from 'canvas-confetti';
import { Cloud, Volume2, ArrowRight, Sparkles, Building2, Wifi } from 'lucide-react';

interface CloudNode {
  id: number;
  label: string;
  emoji: string;
  connected: boolean;
  desc: string;
}

interface CloudCableGameProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

export const CloudCableGame: React.FC<CloudCableGameProps> = ({ onBack, onComplete }) => {
  const [nodes, setNodes] = useState<CloudNode[]>([
    {
      id: 1,
      label: 'Tu Casa (Dispositivo)',
      emoji: '🏠',
      connected: true,
      desc: 'Donde tomas la foto o grabas tu video.',
    },
    {
      id: 2,
      label: 'Cables Bajo la Calle',
      emoji: '🛣️',
      connected: false,
      desc: 'Cables de fibra óptica bajo el suelo de la ciudad.',
    },
    {
      id: 3,
      label: 'Cables Submarinos en el Océano',
      emoji: '🐋',
      connected: false,
      desc: 'Cables gigantescos que cruzan el mar profundo junto a peces.',
    },
    {
      id: 4,
      label: 'Centro de Datos (Edificio Gigante)',
      emoji: '🏢',
      connected: false,
      desc: 'Edificio inmenso con miles de computadoras encendidas 24/7.',
    },
  ]);

  const [activeStep, setActiveStep] = useState(1);
  const isFinished = activeStep >= 4;

  const handleConnectNext = () => {
    if (activeStep < 4) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      setNodes((prev) =>
        prev.map((n) => (n.id === nextStep ? { ...n, connected: true } : n))
      );
      soundService.playSuccess();

      const nextNode = nodes.find((n) => n.id === nextStep);
      if (nextNode) {
        soundService.speak(`¡Conectado! ${nextNode.label}. ${nextNode.desc}`);
      }

      if (nextStep === 4) {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        soundService.speak(
          '¡Misión cumplida! Has llevado la información hasta el Centro de Datos. ¡Ese es el verdadero secreto de La Nube!'
        );
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-900 border-4 border-indigo-400 rounded-3xl shadow-2xl text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/40 text-indigo-300 text-3xl">
            <Cloud className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
              El Gran Secreto de Internet
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              La Expedición Submarina de La Nube 🌊
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              soundService.speak(
                'La nube no es una nube de agua en el cielo. Viaja por cables bajo las calles y el océano hasta llegar a edificios gigantes llamados Centros de Datos.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>Escuchar Secreto</span>
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Ocean Cable Map Simulation */}
      <div className="my-6 p-6 bg-gradient-to-b from-indigo-950/90 via-blue-950/80 to-slate-950 rounded-3xl border-2 border-indigo-500/40 shadow-inner">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">
            Ruta de Transmisión
          </span>
          <h3 className="text-lg md:text-xl font-bold text-white">
            ¿Cómo llega un video de YouTube a tu pantalla?
          </h3>
        </div>

        {/* The 4 Connected Node Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {nodes.map((node, idx) => (
            <div
              key={node.id}
              className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-between ${
                node.connected
                  ? 'bg-blue-900/60 border-cyan-400 ring-4 ring-cyan-400/30 shadow-lg scale-102'
                  : 'bg-slate-900/40 border-slate-700 opacity-60'
              }`}
            >
              <div className="text-4xl my-2">{node.emoji}</div>
              <h4 className="font-bold text-sm md:text-base text-white mb-1">{node.label}</h4>
              <p className="text-xs text-slate-300 mb-3">{node.desc}</p>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  node.connected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {node.connected ? '⚡ Conectado' : '🔒 Bloqueado'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center items-center gap-4">
        {!isFinished ? (
          <button
            onClick={handleConnectNext}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border-b-4 border-cyan-700"
          >
            <Wifi className="w-5 h-5" />
            <span>TENDER SIGUIENTE CABLE SUBMARINO ➔</span>
          </button>
        ) : (
          <div className="text-center">
            <div className="p-4 bg-emerald-950/80 rounded-2xl border border-emerald-500/50 text-emerald-200 mb-3 font-bold text-sm">
              🌟 ¡Centro de Datos alcanzado! Ahora conoces el gran secreto de La Nube.
            </div>
            <button
              onClick={() => onComplete(150)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              ¡Terminar y Recoger Recompensa!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
