import React from 'react';
import { Gamepad2, X, Sparkles, ChefHat, HardDrive, Cloud, Palette, RefreshCw } from 'lucide-react';
import { soundService } from '../../services/audio';

interface MiniGamesHubModalProps {
  onSelectGame: (gameType: 'kitchen' | 'storage' | 'cloud' | 'dino' | 'cycle') => void;
  onClose: () => void;
}

const MINI_GAMES = [
  {
    id: 'kitchen' as const,
    title: 'La Cocina del Chef CPU',
    subtitle: 'La metáfora del Chef y la Computadora',
    emoji: '👨‍🍳',
    desc: 'Entrega ingredientes (Entrada), mira al Chef CPU pensar rápido con su ventilador (Proceso) y obtén el pastel (Salida).',
    color: 'from-amber-500/20 to-orange-600/20 border-amber-400',
    reward: '+100 Puntos ⭐',
  },
  {
    id: 'storage' as const,
    title: 'El Guardián de los 3 Baúles',
    subtitle: 'Disco Duro, USB y La Nube',
    emoji: '💾',
    desc: 'Clasifica fotos, tareas del colegio y videos de YouTube en el baúl grande, la mochila de viaje o la nube.',
    color: 'from-cyan-500/20 to-blue-600/20 border-cyan-400',
    reward: '+150 Puntos ⭐',
  },
  {
    id: 'dino' as const,
    title: 'El Taller de Paint del Dinosaurio',
    subtitle: '¡Pinta y no olvides GUARDAR!',
    emoji: '🦖',
    desc: 'Pinta tu propio dinosaurio en el lienzo y experimenta qué pasa si se corta la luz antes o después de pulsar Guardar.',
    color: 'from-emerald-500/20 to-teal-600/20 border-emerald-400',
    reward: '+100 Puntos ⭐',
  },
  {
    id: 'cloud' as const,
    title: 'La Expedición Submarina de La Nube',
    subtitle: 'Cables bajo el mar y Centros de Datos',
    emoji: '🌊',
    desc: 'Descubre el gran secreto de internet: ¡la nube no es de agua! Conecta cables submarinos hasta el Centro de Datos.',
    color: 'from-indigo-500/20 to-purple-600/20 border-indigo-400',
    reward: '+120 Puntos ⭐',
  },
  {
    id: 'cycle' as const,
    title: 'El Ciclo de los 4 Pasos Mágicos',
    subtitle: 'El gran viaje de la información',
    emoji: '✨',
    desc: 'Ordena la secuencia perfecta: 1. Entrada ➔ 2. Proceso ➔ 3. Salida ➔ 4. Almacenamiento.',
    color: 'from-rose-500/20 to-pink-600/20 border-rose-400',
    reward: '+200 Puntos ⭐',
  },
];

export const MiniGamesHubModal: React.FC<MiniGamesHubModalProps> = ({
  onSelectGame,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border-4 border-emerald-400 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-700 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/40 text-emerald-300">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                Laboratorio Didáctico de Juegos
              </span>
              <h2 className="text-lg md:text-2xl font-black text-white">
                Mini-Juegos Educativos de 2do Grado 🎮
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* List of games */}
        <div className="p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {MINI_GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                soundService.playBitCollect();
                onSelectGame(game.id);
              }}
              className={`p-5 rounded-3xl border-2 bg-gradient-to-br ${game.color} hover:scale-102 transition-all text-left flex flex-col justify-between shadow-lg group active:scale-98`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl p-2 bg-slate-900/80 rounded-2xl">{game.emoji}</span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-900 text-amber-300 border border-amber-400/40">
                    {game.reward}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                  {game.title}
                </h3>
                <span className="text-xs font-semibold text-cyan-200 block mb-2">
                  {game.subtitle}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{game.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:underline">
                <span>¡JUGAR MINI-JUEGO!</span>
                <span>➔</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
