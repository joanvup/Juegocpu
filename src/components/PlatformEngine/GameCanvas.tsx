import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CharacterId, LevelCollectible, LevelData, InteractiveDoor, Platform } from '../../types/game';
import { soundService } from '../../services/audio';
import { QuizPortalModal } from '../EducationalModal/QuizPortalModal';
import { TouchControls } from './TouchControls';
import { ArrowLeft, Sparkles, Volume2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface GameCanvasProps {
  level: LevelData;
  characterId: CharacterId;
  characterHat: string;
  onLevelComplete: (stars: number, score: number, bitsCollected: number) => void;
  onExitToMap: () => void;
}

interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  jumpCount: number;
  maxJumps: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  characterId,
  characterHat,
  onLevelComplete,
  onExitToMap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active quiz dialog state (when interacting with a door)
  const [activeDoor, setActiveDoor] = useState<InteractiveDoor | null>(null);

  // HUD stats for React display
  const [hudBits, setHudBits] = useState(0);
  const [hudScore, setHudScore] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [goalWarning, setGoalWarning] = useState<string | null>(null);

  // Engine refs to avoid tearing down requestAnimationFrame on state updates
  const collectiblesRef = useRef<LevelCollectible[]>([...level.collectibles]);
  const doorsRef = useRef<InteractiveDoor[]>(
    level.doors.map((d) => ({
      ...d,
      isUnlocked: false,
    }))
  );
  const platformsRef = useRef<Platform[]>(
    level.platforms.map((p) => ({
      ...p,
      initialX: p.initialX ?? p.x,
      dx: p.dx ?? 0,
      moveRange: p.moveRange ?? 100,
    }))
  );

  const bitsCollectedRef = useRef(0);
  const scoreRef = useRef(0);
  const isCompletedRef = useRef(false);
  const animFrameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const cameraXRef = useRef(0);
  const victoryCelebrationTickRef = useRef(0);

  // Inputs
  const inputRef = useRef({
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
  });

  // Player physics
  const playerRef = useRef<PlayerState>({
    x: level.playerStartX,
    y: level.playerStartY,
    vx: 0,
    vy: 0,
    width: 42,
    height: 46,
    isGrounded: false,
    facing: 'right',
    jumpCount: 0,
    maxJumps: 2,
  });

  // Reset or initialize on level change
  useEffect(() => {
    isCompletedRef.current = false;
    victoryCelebrationTickRef.current = 0;
    bitsCollectedRef.current = 0;
    scoreRef.current = 0;
    setHudBits(0);
    setHudScore(0);
    setUnlockedCount(0);
    setGoalWarning(null);

    collectiblesRef.current = [...level.collectibles];
    doorsRef.current = level.doors.map((d) => ({ ...d, isUnlocked: false }));
    platformsRef.current = level.platforms.map((p) => ({
      ...p,
      initialX: p.initialX ?? p.x,
      dx: p.dx ?? 0,
      moveRange: p.moveRange ?? 100,
    }));

    playerRef.current = {
      x: level.playerStartX,
      y: level.playerStartY,
      vx: 0,
      vy: 0,
      width: 42,
      height: 46,
      isGrounded: false,
      facing: 'right',
      jumpCount: 0,
      maxJumps: 2,
    };
  }, [level.id]);

  // Spawn collectible particle burst
  const spawnParticles = useCallback((x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      const speed = Math.random() * 3 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1.5,
        color,
        alpha: 1,
        life: 0,
        maxLife: 24,
      });
    }
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeDoor) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = true;
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (!inputRef.current.jumpPressed) {
          inputRef.current.jump = true;
          inputRef.current.jumpPressed = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = false;
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        inputRef.current.jump = false;
        inputRef.current.jumpPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeDoor]);

  // Unlocking door callback
  const handleDoorSuccess = (doorId: string) => {
    doorsRef.current = doorsRef.current.map((d) =>
      d.id === doorId ? { ...d, isUnlocked: true } : d
    );
    const count = doorsRef.current.filter((d) => d.isUnlocked).length;
    setUnlockedCount(count);
    scoreRef.current += 150;
    setHudScore(scoreRef.current);
    setActiveDoor(null);
    soundService.playSuccess();

    // Check if all doors unlocked now
    const allUnlocked = doorsRef.current.every((d) => d.isUnlocked);
    if (allUnlocked) {
      soundService.speak('¡Excelente! Todas las preguntas fueron resueltas. ¡El portal de la meta se ha activado!');
    }
  };

  // Main 60fps Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    let warningTimer = 0;

    const loop = () => {
      tick++;

      const viewWidth = canvas.width;
      const viewHeight = canvas.height;

      // Handle goal warning banner auto-dismiss
      if (warningTimer > 0) {
        warningTimer--;
        if (warningTimer === 0) {
          setGoalWarning(null);
        }
      }

      // Check if level completed victory sequence is playing
      if (isCompletedRef.current) {
        victoryCelebrationTickRef.current++;
        // Keep particles moving and render celebration
      }

      // UPDATE GAME PHYSICS (Only when activeDoor modal is NOT open, and before victory completes)
      if (!activeDoor && !isCompletedRef.current) {
        const player = playerRef.current;
        const input = inputRef.current;

        // Horizontal movement
        const ACCEL = 0.85;
        const MAX_SPEED = 5.8;
        const FRICTION = 0.82;

        if (input.left) {
          player.vx = Math.max(player.vx - ACCEL, -MAX_SPEED);
          player.facing = 'left';
        } else if (input.right) {
          player.vx = Math.min(player.vx + ACCEL, MAX_SPEED);
          player.facing = 'right';
        } else {
          player.vx *= FRICTION;
          if (Math.abs(player.vx) < 0.05) player.vx = 0;
        }

        // Jump physics
        const GRAVITY = 0.55;
        const JUMP_POWER = -11.5;

        if (input.jump) {
          if (player.isGrounded || player.jumpCount < player.maxJumps) {
            player.vy = JUMP_POWER;
            player.jumpCount++;
            player.isGrounded = false;
            if (player.jumpCount === 1) {
              soundService.playJump();
            } else {
              soundService.playSpring();
            }

            // Jump particles
            for (let i = 0; i < 5; i++) {
              particlesRef.current.push({
                x: player.x + player.width / 2,
                y: player.y + player.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 2.5 + 1.5,
                color: '#60a5fa',
                alpha: 0.8,
                life: 0,
                maxLife: 15,
              });
            }
          }
          input.jump = false;
        }

        // Apply Gravity
        player.vy += GRAVITY;
        if (player.vy > 14) player.vy = 14;

        // Apply moving platform motion
        platformsRef.current.forEach((plat) => {
          if (plat.type === 'moving' && plat.dx && plat.moveRange && plat.initialX !== undefined) {
            plat.x += plat.dx;
            if (plat.x > plat.initialX + plat.moveRange) {
              plat.dx = -Math.abs(plat.dx);
            } else if (plat.x < plat.initialX - plat.moveRange) {
              plat.dx = Math.abs(plat.dx);
            }
          }
        });

        // 1. Mandatory Locked Doors Collision (FULL-HEIGHT IMPENETRABLE BARRIER FIELD)
        // If a door is locked, it blocks horizontal crossing anywhere on the Y axis!
        let nextX = player.x + player.vx;
        doorsRef.current.forEach((door) => {
          if (!door.isUnlocked) {
            const barrierLeft = door.x - 12;
            const barrierRight = door.x + door.width + 12;

            // Check if player would intersect the barrier's X coordinates
            const playerLeft = nextX;
            const playerRight = nextX + player.width;

            if (playerRight >= barrierLeft && playerLeft <= barrierRight) {
              // Stop player at barrier edge
              if (player.x + player.width <= barrierLeft) {
                nextX = barrierLeft - player.width;
              } else if (player.x >= barrierRight) {
                nextX = barrierRight;
              } else {
                nextX = player.x;
              }
              player.vx = 0;

              // Open dialog automatically so they answer
              setActiveDoor(door);
            }
          }
        });

        const nextY = player.y + player.vy;

        // Check horizontal boundaries
        player.x = Math.max(0, Math.min(level.canvasWidth - player.width, nextX));

        // Check platform collisions
        let grounded = false;
        const currentPlatforms = platformsRef.current;

        for (const plat of currentPlatforms) {
          if (
            player.x + player.width > plat.x &&
            player.x < plat.x + plat.width &&
            player.y + player.height <= plat.y + 14 &&
            nextY + player.height >= plat.y &&
            player.vy >= 0
          ) {
            if (plat.type === 'spring') {
              player.vy = -16.5;
              player.jumpCount = 1;
              soundService.playSpring();
              spawnParticles(plat.x + plat.width / 2, plat.y, '#f59e0b', 10);
            } else if (plat.type === 'fan') {
              player.vy = -13;
              soundService.playFanSound();
            } else {
              player.y = plat.y - player.height;
              player.vy = 0;
              grounded = true;
              player.jumpCount = 0;

              if (plat.type === 'moving' && plat.dx) {
                player.x += plat.dx;
              }
            }
          }
        }

        if (!grounded) {
          player.y = nextY;
          player.isGrounded = false;
        } else {
          player.isGrounded = true;
        }

        // Fan wind draft
        currentPlatforms.forEach((plat) => {
          if (plat.type === 'fan') {
            if (
              player.x + player.width > plat.x &&
              player.x < plat.x + plat.width &&
              player.y < plat.y &&
              player.y > plat.y - 180
            ) {
              player.vy -= 0.8;
            }
          }
        });

        // Pit fall check (gentle respawn)
        if (player.y > level.canvasHeight + 60) {
          player.x = Math.max(30, player.x - 220);
          player.y = 350;
          player.vy = 0;
          player.vx = 0;
          soundService.playWrong();
        }

        // Check collectibles
        const remainingCollectibles: LevelCollectible[] = [];
        for (const item of collectiblesRef.current) {
          const itemCenterX = item.x + 15;
          const itemCenterY = item.y + 15;
          const dist = Math.hypot(
            player.x + player.width / 2 - itemCenterX,
            player.y + player.height / 2 - itemCenterY
          );

          if (dist < 34) {
            soundService.playBitCollect();
            bitsCollectedRef.current += 1;
            setHudBits(bitsCollectedRef.current);

            const points = item.type === 'crystal' ? 50 : item.type === 'star' ? 30 : 15;
            scoreRef.current += points;
            setHudScore(scoreRef.current);

            spawnParticles(
              itemCenterX,
              itemCenterY,
              item.type === 'crystal' ? '#a855f7' : item.type === 'star' ? '#fbbf24' : '#38bdf8',
              14
            );
          } else {
            remainingCollectibles.push(item);
          }
        }
        collectiblesRef.current = remainingCollectibles;

        // 2. CHECK GOAL REACHED
        const goal = level.goal;
        const isNearGoal =
          player.x + player.width > goal.x &&
          player.x < goal.x + goal.width &&
          player.y + player.height > goal.y &&
          player.y < goal.y + goal.height;

        if (isNearGoal) {
          // Check if all educational doors are completed!
          const allUnlocked = doorsRef.current.every((d) => d.isUnlocked);

          if (!allUnlocked) {
            // Push player back and show clear message
            player.x = goal.x - player.width - 15;
            player.vx = -3;
            soundService.playWrong();
            setGoalWarning('⚠️ ¡Portal Bloqueado! Debes responder la pregunta del Guardián en la puerta para activarlo.');
            warningTimer = 180;
            soundService.speak('¡La meta está bloqueada! Debes responder la pregunta del guardián para activarla.');
          } else if (!isCompletedRef.current) {
            // ALL DOORS UNLOCKED! Trigger victory cleanly without freezing!
            isCompletedRef.current = true;
            soundService.playSuccess();

            // Spawn victory fireworks
            spawnParticles(goal.x + goal.width / 2, goal.y + goal.height / 2, '#fde047', 40);
            spawnParticles(goal.x + goal.width / 2, goal.y + goal.height / 2, '#38bdf8', 40);

            // Compute score and stars safely
            const totalBits = level.collectibles.length;
            const collectedBits = bitsCollectedRef.current;
            const percentage = totalBits > 0 ? (collectedBits / totalBits) * 100 : 100;
            const finalStars = percentage >= 80 ? 3 : percentage >= 45 ? 2 : 1;
            const finalScore = scoreRef.current + 250;

            // Wait 500ms for victory visual transition, then call callback
            setTimeout(() => {
              onLevelComplete(finalStars, finalScore, collectedBits);
            }, 600);
          }
        }

        // Camera follow
        const targetCamX = player.x - viewWidth / 2 + player.width / 2;
        const maxCamX = Math.max(0, level.canvasWidth - viewWidth);
        const clampedCamX = Math.max(0, Math.min(maxCamX, targetCamX));
        cameraXRef.current += (clampedCamX - cameraXRef.current) * 0.1;
      }

      // -------------------- RENDERING --------------------
      ctx.clearRect(0, 0, viewWidth, viewHeight);

      const camX = cameraXRef.current;

      // Background Gradient
      ctx.save();
      const bgGrad = ctx.createLinearGradient(0, 0, 0, viewHeight);
      if (level.worldId === 'entrada') {
        bgGrad.addColorStop(0, '#06201b');
        bgGrad.addColorStop(1, '#0f172a');
      } else if (level.worldId === 'cpu') {
        bgGrad.addColorStop(0, '#1a103c');
        bgGrad.addColorStop(1, '#090d16');
      } else if (level.worldId === 'almacenamiento') {
        bgGrad.addColorStop(0, '#241a05');
        bgGrad.addColorStop(1, '#0f172a');
      } else {
        bgGrad.addColorStop(0, '#2b0b1c');
        bgGrad.addColorStop(1, '#0f172a');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, viewWidth, viewHeight);

      // Grid circuits
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 2;
      const gridSize = 60;
      const gridOffsetX = -(camX * 0.3) % gridSize;
      for (let x = gridOffsetX; x < viewWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, viewHeight);
        ctx.stroke();
      }
      for (let y = 0; y < viewHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(viewWidth, y);
        ctx.stroke();
      }
      ctx.restore();

      // Camera Transform for World Objects
      ctx.save();
      ctx.translate(-camX, 0);

      // 1. Render Platforms
      platformsRef.current.forEach((plat) => {
        if (plat.type === 'ground') {
          const gGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
          gGrad.addColorStop(0, '#10b981');
          gGrad.addColorStop(0.15, '#047857');
          gGrad.addColorStop(1, '#064e3b');
          ctx.fillStyle = gGrad;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, [8, 8, 0, 0]);
          ctx.fill();

          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(plat.x + 8, plat.y + 4);
          ctx.lineTo(plat.x + plat.width - 8, plat.y + 4);
          ctx.stroke();
        } else if (plat.type === 'circuit') {
          ctx.fillStyle = '#1e1b4b';
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 10);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(plat.x + 14, plat.y + plat.height / 2, 4, 0, Math.PI * 2);
          ctx.arc(plat.x + plat.width - 14, plat.y + plat.height / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (plat.type === 'moving') {
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 10);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('◄ ══ ►', plat.x + plat.width / 2, plat.y + 17);
        } else if (plat.type === 'spring') {
          ctx.fillStyle = '#ea580c';
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚡ RESORTE ⚡', plat.x + plat.width / 2, plat.y + 17);
        } else if (plat.type === 'fan') {
          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#bae6fd';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('💨 FUUUU!', plat.x + plat.width / 2, plat.y + 16);

          for (let w = 0; w < 3; w++) {
            const windY = plat.y - ((tick * 4 + w * 50) % 150);
            const windAlpha = Math.max(0, 1 - (plat.y - windY) / 150);
            ctx.strokeStyle = `rgba(186, 230, 253, ${windAlpha * 0.7})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(plat.x + 15 + w * 18, windY);
            ctx.lineTo(plat.x + 15 + w * 18, windY - 20);
            ctx.stroke();
          }
        } else if (plat.type === 'usb') {
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(plat.x + plat.width - 20, plat.y + 4, 16, plat.height - 8);
        } else if (plat.type === 'cloud') {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 12);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('☁️ NUBE ☁️', plat.x + plat.width / 2, plat.y + 17);
        }
      });

      // 2. Render Collectibles
      collectiblesRef.current.forEach((item) => {
        const bob = Math.sin(tick * 0.08 + item.x) * 6;
        const cy = item.y + bob;

        ctx.save();
        if (item.type === 'bit') {
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(item.x + 12, cy);
          ctx.lineTo(item.x + 24, cy + 12);
          ctx.lineTo(item.x + 12, cy + 24);
          ctx.lineTo(item.x, cy + 12);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(item.x + 12, cy + 12, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'star') {
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 14;
          ctx.fillText('⭐', item.x + 12, cy + 18);
        } else if (item.type === 'silicon') {
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 12;
          ctx.fillText('🏖️', item.x + 12, cy + 18);
        } else if (item.type === 'usb_drive') {
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;
          ctx.fillText('💾', item.x + 12, cy + 18);
        } else if (item.type === 'crystal') {
          ctx.font = '26px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 16;
          ctx.fillText('🔮', item.x + 12, cy + 18);
        }
        ctx.restore();
      });

      // 3. Render Mandatory Force Field Doors (Full vertical laser wall when locked!)
      doorsRef.current.forEach((door) => {
        if (!door.isUnlocked) {
          ctx.save();
          // Full-height energy beam from y: 0 to y: level.canvasHeight
          const beamGrad = ctx.createLinearGradient(door.x, 0, door.x + door.width, 0);
          beamGrad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
          beamGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.85)');
          beamGrad.addColorStop(1, 'rgba(239, 68, 68, 0.4)');

          ctx.fillStyle = beamGrad;
          ctx.fillRect(door.x, 0, door.width, level.canvasHeight);

          // Glowing laser border lines
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(door.x, 0);
          ctx.lineTo(door.x, level.canvasHeight);
          ctx.moveTo(door.x + door.width, 0);
          ctx.lineTo(door.x + door.width, level.canvasHeight);
          ctx.stroke();

          // Animated energy hazard grid
          const animOffset = (tick * 3) % 40;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 2;
          for (let y = animOffset; y < level.canvasHeight; y += 40) {
            ctx.beginPath();
            ctx.moveTo(door.x, y);
            ctx.lineTo(door.x + door.width, y + 10);
            ctx.stroke();
          }

          // Guardian Card in middle of the door
          const cardY = door.y + door.height / 2 - 20;
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.roundRect(door.x - 30, cardY - 40, door.width + 60, 80, 16);
          ctx.fill();
          ctx.stroke();

          // Guardian Emoji & Lock
          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(door.characterEmoji || '🔮', door.x + door.width / 2, cardY - 8);

          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#fde047';
          ctx.fillText('¡DESAFÍO OBLIGATORIO!', door.x + door.width / 2, cardY + 16);
          ctx.fillStyle = '#ffffff';
          ctx.fillText('🔒 TOCA AQUÍ', door.x + door.width / 2, cardY + 30);

          ctx.restore();
        } else {
          // Open green gateway
          ctx.save();
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.roundRect(door.x, door.y, door.width, door.height, 12);
          ctx.stroke();

          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✨ ABRIÓ ✨', door.x + door.width / 2, door.y + door.height / 2);
          ctx.restore();
        }
      });

      // 4. Render Goal Portal (Active OR Locked based on doors state)
      const goal = level.goal;
      const allDoorsUnlocked = doorsRef.current.every((d) => d.isUnlocked);

      ctx.save();
      const goalAngle = tick * 0.04;
      ctx.translate(goal.x + goal.width / 2, goal.y + goal.height / 2);

      if (allDoorsUnlocked) {
        // ACTIVE GOAL
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.ellipse(0, 0, goal.width / 2, goal.height / 2, goalAngle, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fde047';
        ctx.beginPath();
        ctx.ellipse(0, 0, goal.width / 3, goal.height / 3, -goalAngle * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌟', 0, 0);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('¡META ABIERTA!', 0, -goal.height / 2 - 14);
      } else {
        // LOCKED GOAL (Requires passing all questions!)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, 0, goal.width / 2, goal.height / 2, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fill();

        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', 0, 0);

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('PORTAL BLOQUEADO', 0, -goal.height / 2 - 14);
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#fecaca';
        ctx.fillText('¡Responde las preguntas!', 0, -goal.height / 2 - 2);
      }
      ctx.restore();

      // 5. Render Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }

      // 6. Render Player
      const player = playerRef.current;
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

      if (player.facing === 'left') {
        ctx.scale(-1, 1);
      }

      const walkBob = player.isGrounded && Math.abs(player.vx) > 0.5 ? Math.sin(tick * 0.3) * 3 : 0;

      let bodyColor = '#3b82f6';
      let charEmoji = '🤖';
      if (characterId === 'pixel') {
        bodyColor = '#10b981';
        charEmoji = '🦖';
      } else if (characterId === 'chipita') {
        bodyColor = '#ec4899';
        charEmoji = '🐱';
      } else if (characterId === 'nano') {
        bodyColor = '#f59e0b';
        charEmoji = '🧑‍🚀';
      }

      // Victory float up
      if (isCompletedRef.current) {
        ctx.translate(0, -Math.min(30, victoryCelebrationTickRef.current * 2));
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, player.height / 2 - 2, player.width / 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = bodyColor;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(
        -player.width / 2 + 2,
        -player.height / 2 + walkBob,
        player.width - 4,
        player.height - 6,
        14
      );
      ctx.fill();
      ctx.stroke();

      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(charEmoji, 0, -2 + walkBob);

      if (characterHat && characterHat !== 'ninguno') {
        let hatEmoji = '✨';
        if (characterHat === 'chef') hatEmoji = '👨‍🍳';
        else if (characterHat === 'detective') hatEmoji = '🔍';
        else if (characterHat === 'corona') hatEmoji = '👑';
        else if (characterHat === 'mochila') hatEmoji = '🎒';
        else if (characterHat === 'nube') hatEmoji = '🪽';

        ctx.font = '20px sans-serif';
        ctx.fillText(hatEmoji, 0, -player.height / 2 - 8 + walkBob);
      }

      ctx.restore();

      ctx.restore(); // End World Translation

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [level.id, characterId, characterHat, spawnParticles, onLevelComplete, activeDoor, level]);

  // Touch handlers
  const handleLeftStart = () => {
    inputRef.current.left = true;
  };
  const handleLeftEnd = () => {
    inputRef.current.left = false;
  };
  const handleRightStart = () => {
    inputRef.current.right = true;
  };
  const handleRightEnd = () => {
    inputRef.current.right = false;
  };
  const handleJumpStart = () => {
    inputRef.current.jump = true;
  };
  const handleJumpEnd = () => {
    inputRef.current.jump = false;
  };

  const totalDoors = level.doors.length;

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Top Level Navigation HUD */}
      <div className="flex items-center justify-between px-3 md:px-6 py-2.5 bg-slate-900/90 border-b border-indigo-500/30 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onExitToMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs md:text-sm font-bold border border-slate-700 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Mapa</span>
          </button>

          <div>
            <span className="text-[10px] md:text-xs font-bold text-amber-400 uppercase tracking-widest block">
              {level.educationalTopic}
            </span>
            <h2 className="text-sm md:text-base font-black text-white">{level.title}</h2>
          </div>
        </div>

        {/* Stats HUD */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Questions/Doors Mandatory Status */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border ${
            unlockedCount >= totalDoors
              ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
          }`}>
            {unlockedCount >= totalDoors ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <Lock className="w-4 h-4 text-rose-300" />
            )}
            <div className="text-left">
              <span className="text-[9px] uppercase block font-bold leading-none">
                {unlockedCount >= totalDoors ? 'Meta Lista' : 'Preguntas'}
              </span>
              <span className="text-xs md:text-sm font-black">
                {unlockedCount} / {totalDoors}
              </span>
            </div>
          </div>

          {/* Bits collected */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 rounded-xl border border-cyan-500/40">
            <span className="text-base md:text-lg">💎</span>
            <div className="text-left">
              <span className="text-[9px] text-cyan-300 uppercase block font-bold leading-none">Bits</span>
              <span className="text-xs md:text-sm font-black text-cyan-200">
                {hudBits} / {level.collectibles.length}
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 rounded-xl border border-amber-500/40">
            <span className="text-base md:text-lg">⭐</span>
            <div className="text-left">
              <span className="text-[9px] text-amber-300 uppercase block font-bold leading-none">Puntos</span>
              <span className="text-xs md:text-sm font-black text-amber-200">{hudScore}</span>
            </div>
          </div>

          {/* Voice Tip */}
          <button
            onClick={() => soundService.speak(level.guideCharacter.tip, true)}
            className="p-2 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1 text-xs font-bold"
            title="Escuchar consejo"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">Pista</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative flex-1 w-full h-[55vh] md:h-[65vh] flex items-center justify-center bg-slate-950 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          className="w-full h-full object-contain cursor-crosshair shadow-2xl"
        />

        {/* Goal Warning Pop-up Banner if player touches locked goal */}
        {goalWarning && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-md w-[92%] p-3.5 bg-rose-600/95 text-white font-black text-xs md:text-sm rounded-2xl border-2 border-rose-300 shadow-2xl flex items-center gap-3 animate-bounce-once">
            <AlertCircle className="w-6 h-6 text-yellow-300 shrink-0" />
            <span>{goalWarning}</span>
          </div>
        )}

        {/* Floating Quick Hint badge */}
        <div className="absolute bottom-3 left-4 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-700/80 text-xs text-slate-300 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>
            {level.guideCharacter.emoji} <strong>{level.guideCharacter.name}:</strong> {level.guideCharacter.tip}
          </span>
        </div>
      </div>

      {/* Mobile/Tablet Touch Controls */}
      <TouchControls
        onLeftStart={handleLeftStart}
        onLeftEnd={handleLeftEnd}
        onRightStart={handleRightStart}
        onRightEnd={handleRightEnd}
        onJumpStart={handleJumpStart}
        onJumpEnd={handleJumpEnd}
        onAction={() => soundService.speak(level.guideCharacter.tip, true)}
      />

      {/* Quiz Modal when interacting with mandatory door */}
      {activeDoor && (
        <QuizPortalModal
          door={activeDoor}
          onSuccess={handleDoorSuccess}
          onClose={() => setActiveDoor(null)}
        />
      )}
    </div>
  );
};
