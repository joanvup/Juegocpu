import React, { useRef, useState, useEffect } from 'react';
import { soundService } from '../../services/audio';
import confetti from 'canvas-confetti';
import { Save, Sparkles, Volume2, RotateCcw, AlertTriangle, CheckCircle, ZapOff } from 'lucide-react';

interface PaintDinoGameProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#000000', '#ffffff'];

export const PaintDinoGame: React.FC<PaintDinoGameProps> = ({ onBack, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState('#22c55e');
  const [brushSize, setBrushSize] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [powerOutageState, setPowerOutageState] = useState<'normal' | 'blackout' | 'restored'>('normal');
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);

  // Initialize canvas with a friendly dinosaur outline to color or free draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Friendly Dino outline template for 2nd grade kids
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Dino body
    ctx.arc(260, 240, 70, 0, Math.PI * 2);
    // Dino head
    ctx.arc(330, 160, 45, 0, Math.PI * 2);
    // Dino tail
    ctx.moveTo(190, 240);
    ctx.quadraticCurveTo(120, 260, 100, 200);
    // Legs
    ctx.moveTo(230, 310);
    ctx.lineTo(230, 370);
    ctx.moveTo(290, 310);
    ctx.lineTo(290, 370);
    ctx.stroke();

    // Friendly guide text inside canvas
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('¡Pinta aquí tu Dinosaurio de Paint! 🦖', canvas.width / 2, 40);
  }, []);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  // Guardar dibujo
  const handleSaveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setSavedImageUrl(dataUrl);
    setIsSaved(true);
    soundService.playSuccess();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    soundService.speak('¡Dibujo guardado con éxito en el Disco Duro! Ahora está protegido si se corta la luz.');
  };

  // Simular corte de luz (El ejemplo exacto del PDF)
  const handleSimulateBlackout = () => {
    soundService.playWrong();
    setPowerOutageState('blackout');
    soundService.speak('¡Zas! ¡Se fue la luz y la computadora se apagó!');

    setTimeout(() => {
      setPowerOutageState('restored');
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (!isSaved) {
        // Did not save: Drawing is erased!
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('😱 ¡Oh no! El dibujo se borró porque olvidaste presionar GUARDAR.', canvas.width / 2, canvas.height / 2);
        soundService.speak('¡Oh no! El dibujo ya no está porque no presionaste el botón Guardar.');
      } else {
        // Saved: Drawing is restored!
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          soundService.playSuccess();
          soundService.speak('¡Hurra! Tu dibujo del dinosaurio está a salvo en el baúl del Disco Duro porque lo guardaste a tiempo.');
        };
        if (savedImageUrl) img.src = savedImageUrl;
      }
    }, 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-900 border-4 border-emerald-400 rounded-3xl shadow-2xl text-white">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/40 text-emerald-300 text-3xl">
            🦖
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
              Taller de Creatividad & Almacenamiento
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              El Taller de Paint del Dinosaurio 🎨
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              soundService.speak(
                'Pinta tu dinosaurio con los colores. Recuerda presionar el botón GUARDAR para que no se pierda si se corta la luz.'
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

      {/* Color Palette & Brush Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-3 p-3 bg-slate-800 rounded-2xl border border-slate-700">
        {/* Colors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Colores:</span>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                selectedColor === c ? 'scale-125 border-white ring-2 ring-cyan-400' : 'border-slate-800 hover:scale-110'
              }`}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Grosor:</span>
          {[4, 8, 16].map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                brushSize === size
                  ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-black'
                  : 'bg-slate-700 border-slate-600 text-slate-300'
              }`}
            >
              {size === 4 ? 'Fino' : size === 8 ? 'Medio' : 'Grueso'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full rounded-2xl overflow-hidden border-4 border-slate-700 bg-white flex items-center justify-center touch-none">
        {powerOutageState === 'blackout' && (
          <div className="absolute inset-0 bg-black z-30 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
            <ZapOff className="w-16 h-16 text-yellow-400 animate-bounce mb-2" />
            <h3 className="text-2xl font-black text-yellow-300">¡¡¡ZAS!!! ¡SE CORTÓ LA LUZ!</h3>
            <p className="text-sm text-slate-400 mt-1">La computadora se está reiniciando...</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={600}
          height={380}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="w-full max-h-[380px] object-contain cursor-crosshair bg-white"
        />
      </div>

      {/* Action Buttons: GUARDAR and Simular Corte de Luz */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDrawing}
            className={`px-5 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
              isSaved
                ? 'bg-emerald-600 text-white border-2 border-emerald-400'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 border-b-4 border-amber-700'
            }`}
          >
            {isSaved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            <span>{isSaved ? '¡GUARDADO EN DISCO DURO!' : '¡GUARDAR DIBUJO! (Disco Duro)'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateBlackout}
            className="px-4 py-3 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs md:text-sm border border-rose-400 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-yellow-300" />
            <span>Probar: ¿Qué pasa si se va la luz?</span>
          </button>

          <button
            onClick={() => onComplete(isSaved ? 100 : 30)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs md:text-sm shadow-md transition-all active:scale-95"
          >
            ¡Terminar Taller!
          </button>
        </div>
      </div>
    </div>
  );
};
