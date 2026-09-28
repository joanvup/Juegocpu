import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CharacterId, LevelCollectible, LevelData, InteractiveDoor, Platform } from '../../types/game';
import { soundService } from '../../services/audio';
import { QuizPortalModal } from '../EducationalModal/QuizPortalModal';
import { TouchControls } from './TouchControls';
import { ArrowLeft, Sparkles, Volume2 } from 'lucide-react';

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

  // Active modal door state
  const [activeDoor, setActiveDoor] = useState<InteractiveDoor | null>(null);

  // In-level collectibles and doors tracking
  const [collectibles, setCollectibles] = useState<LevelCollectible[]>(() => [...level.collectibles]);
  const [doors, setDoors] = useState<InteractiveDoor[]>(() => [...level.doors]);
  const [bitsCollected, setBitsCollected] = useState(0);
  const [score, setScore] = useState(0);

  // Platform dynamic instances
  const platformsRef = useRef<Platform[]>(
    level.platforms.map((p) => ({
      ...p,
      initialX: p.initialX ?? p.x,
      dx: p.dx ?? 0,
      moveRange: p.moveRange ?? 100,
    }))
  );

  // Controls state
  const inputRef = useRef({
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
  });

  // Player physics state
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
    maxJumps: 2, // Allow double jump for 2nd graders to make platforming super fun and forgiving!
  });

  const particlesRef = useRef<Particle[]>([]);
  const cameraXRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);
  const isCompletedRef = useRef(false);

  // Spawn collectible sparkle particles
  const spawnCollectParticles = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.2;
      const speed = Math.random() * 3 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        color,
        alpha: 1,
        life: 0,
        maxLife: 25,
      });
    }
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeDoor) return; // Freeze during quiz

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

  // Handle door unlocked after answering quiz correctly
  const handleDoorSuccess = (doorId: string) => {
    setDoors((prev) =>
      prev.map((d) => (d.id === doorId ? { ...d, isUnlocked: true } : d))
    );
    setScore((s) => s + 100);
    setActiveDoor(null);
  };

  // Main game update & render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const loop = () => {
      tick++;

      // Canvas dimensions
      const viewWidth = canvas.width;
      const viewHeight = canvas.height;

      // UPDATE PHYSICS ONLY IF NOT IN DIALOGUE
      if (!activeDoor && !isCompletedRef.current) {
        const player = playerRef.current;
        const input = inputRef.current;

        // Horizontal movement
        const ACCEL = 0.8;
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
            // Spawn jump dust
            for (let i = 0; i < 6; i++) {
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
          input.jump = false; // consume jump press
        }

        // Apply Gravity
        player.vy += GRAVITY;
        if (player.vy > 14) player.vy = 14;

        // Apply moving platforms logic
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

        // Projected next position
        const nextX = player.x + player.vx;
        const nextY = player.y + player.vy;

        // Check horizontal level boundaries
        player.x = Math.max(0, Math.min(level.canvasWidth - player.width, nextX));

        // Check platform collisions
        let grounded = false;
        const currentPlatforms = platformsRef.current;

        for (const plat of currentPlatforms) {
          // Check landing on top of platform
          if (
            player.x + player.width > plat.x &&
            player.x < plat.x + plat.width &&
            player.y + player.height <= plat.y + 12 &&
            nextY + player.height >= plat.y &&
            player.vy >= 0
          ) {
            // Check special platform types
            if (plat.type === 'spring') {
              player.vy = -16.5; // Super spring bounce!
              player.jumpCount = 1;
              soundService.playSpring();
              spawnCollectParticles(plat.x + plat.width / 2, plat.y, '#f59e0b');
            } else if (plat.type === 'fan') {
              player.vy = -13; // Wind draft
              soundService.playFanSound();
            } else {
              player.y = plat.y - player.height;
              player.vy = 0;
              grounded = true;
              player.jumpCount = 0;

              // If on a moving platform, carry the player
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

        // Check wind draft above fan platforms
        currentPlatforms.forEach((plat) => {
          if (plat.type === 'fan') {
            if (
              player.x + player.width > plat.x &&
              player.x < plat.x + plat.width &&
              player.y < plat.y &&
              player.y > plat.y - 180
            ) {
              player.vy -= 0.8; // Lift player upwards
            }
          }
        });

        // Pit fall check (gentle respawn for 2nd graders)
        if (player.y > level.canvasHeight + 60) {
          player.x = Math.max(20, player.x - 220);
          player.y = 350;
          player.vy = 0;
          player.vx = 0;
          soundService.playWrong();
        }

        // Check Collectibles collision
        setCollectibles((prev) => {
          const remaining: LevelCollectible[] = [];
          for (const item of prev) {
            const itemCenterX = item.x + 15;
            const itemCenterY = item.y + 15;
            const dist = Math.hypot(
              player.x + player.width / 2 - itemCenterX,
              player.y + player.height / 2 - itemCenterY
            );

            if (dist < 32) {
              soundService.playBitCollect();
              setBitsCollected((b) => b + 1);
              setScore((s) => s + (item.type === 'crystal' ? 50 : item.type === 'star' ? 30 : 15));
              spawnCollectParticles(
                itemCenterX,
                itemCenterY,
                item.type === 'crystal' ? '#a855f7' : item.type === 'star' ? '#fbbf24' : '#38bdf8'
              );
            } else {
              remaining.push(item);
            }
          }
          return remaining;
        });

        // Check Interactive Doors collision
        doors.forEach((door) => {
          if (!door.isUnlocked) {
            // Check if player reaches the door
            if (
              player.x + player.width > door.x - 10 &&
              player.x < door.x + door.width + 10 &&
              player.y + player.height > door.y &&
              player.y < door.y + door.height
            ) {
              // Block player from passing until unlocked & open quiz dialog
              if (player.x < door.x) {
                player.x = door.x - player.width;
              } else {
                player.x = door.x + door.width;
              }
              player.vx = 0;
              setActiveDoor(door);
            }
          }
        });

        // Check Goal Reached (Portal at end of level)
        const goal = level.goal;
        if (
          player.x + player.width > goal.x &&
          player.x < goal.x + goal.width &&
          player.y + player.height > goal.y &&
          player.y < goal.y + goal.height
        ) {
          if (!isCompletedRef.current) {
            isCompletedRef.current = true;
            const totalBits = level.collectibles.length;
            const percentage = totalBits > 0 ? (bitsCollected / totalBits) * 100 : 100;
            const finalStars = percentage >= 80 ? 3 : percentage >= 45 ? 2 : 1;
            onLevelComplete(finalStars, score + 200, bitsCollected);
          }
        }

        // Smooth Camera Follow
        const targetCamX = player.x - viewWidth / 2 + player.width / 2;
        const maxCamX = Math.max(0, level.canvasWidth - viewWidth);
        const clampedCamX = Math.max(0, Math.min(maxCamX, targetCamX));
        cameraXRef.current += (clampedCamX - cameraXRef.current) * 0.1;
      }

      // -------------------- RENDERING --------------------
      ctx.clearRect(0, 0, viewWidth, viewHeight);

      const camX = cameraXRef.current;

      // 1. Cyber Background Parallax
      ctx.save();
      // Gradient background
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

      // Grid circuits in background
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

      // Floating ambient binary chips in background
      for (let i = 0; i < 15; i++) {
        const bx = ((i * 180 - camX * 0.2 + tick * 0.4) % (level.canvasWidth + 200)) - camX * 0.2;
        const by = 80 + (Math.sin(tick * 0.03 + i) * 30) + ((i * 35) % 250);
        ctx.fillStyle = 'rgba(125, 211, 252, 0.15)';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(i % 2 === 0 ? '1' : '0', bx % viewWidth, by);
      }
      ctx.restore();

      // Apply Camera Transform for World Objects
      ctx.save();
      ctx.translate(-camX, 0);

      // 2. Render Platforms
      platformsRef.current.forEach((plat) => {
        if (plat.type === 'ground') {
          // Ground platform with mother-board green / tech lines
          const gGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
          gGrad.addColorStop(0, '#10b981');
          gGrad.addColorStop(0.15, '#047857');
          gGrad.addColorStop(1, '#064e3b');
          ctx.fillStyle = gGrad;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, [8, 8, 0, 0]);
          ctx.fill();

          // Golden circuit trace on top
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(plat.x + 8, plat.y + 4);
          ctx.lineTo(plat.x + plat.width - 8, plat.y + 4);
          ctx.stroke();
        } else if (plat.type === 'circuit') {
          // Floating circuit platform
          ctx.fillStyle = '#1e1b4b';
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 10);
          ctx.fill();
          ctx.stroke();

          // Glowing node points
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(plat.x + 14, plat.y + plat.height / 2, 4, 0, Math.PI * 2);
          ctx.arc(plat.x + plat.width - 14, plat.y + plat.height / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (plat.type === 'moving') {
          // Moving platform with yellow hazard stripes
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 10);
          ctx.fill();
          ctx.stroke();

          // Arrow indicator
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('◄ ══ ►', plat.x + plat.width / 2, plat.y + 17);
        } else if (plat.type === 'spring') {
          // Springboard platform
          ctx.fillStyle = '#ea580c';
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
          ctx.fill();
          ctx.stroke();

          // Spring coil icon
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚡ RESORTE ⚡', plat.x + plat.width / 2, plat.y + 17);
        } else if (plat.type === 'fan') {
          // Fan Platform ("Fuuuuuu" wind blower)
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

          // Render rising wind draft particles
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
          // USB platform
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
          ctx.fill();
          ctx.stroke();

          // USB connector tip
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(plat.x + plat.width - 20, plat.y + 4, 16, plat.height - 8);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(plat.x + plat.width - 14, plat.y + 7, 4, 4);
          ctx.fillRect(plat.x + plat.width - 14, plat.y + plat.height - 11, 4, 4);
        } else if (plat.type === 'cloud') {
          // Cloud / Submarine cable platform
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 12);
          ctx.fill();
          ctx.stroke();

          // Submarine cable glow
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('☁️ NUBE ☁️', plat.x + plat.width / 2, plat.y + 17);
        }
      });

      // 3. Render Collectibles
      collectibles.forEach((item) => {
        const bob = Math.sin(tick * 0.08 + item.x) * 6;
        const cy = item.y + bob;

        ctx.save();
        if (item.type === 'bit') {
          // Cyan Glowing Bit
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
          // Golden Star
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 14;
          ctx.fillText('⭐', item.x + 12, cy + 18);
        } else if (item.type === 'silicon') {
          // Silicon Gem (from beach sand)
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 12;
          ctx.fillText('🏖️', item.x + 12, cy + 18);
        } else if (item.type === 'usb_drive') {
          // USB Flash Drive
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;
          ctx.fillText('💾', item.x + 12, cy + 18);
        } else if (item.type === 'crystal') {
          // Purple Crystal
          ctx.font = '26px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 16;
          ctx.fillText('🔮', item.x + 12, cy + 18);
        }
        ctx.restore();
      });

      // 4. Render Interactive Quiz Doors
      doors.forEach((door) => {
        if (!door.isUnlocked) {
          // Locked Barrier
          const glow = Math.sin(tick * 0.08) * 5 + 10;
          ctx.save();
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = glow;
          ctx.beginPath();
          ctx.roundRect(door.x, door.y, door.width, door.height, 12);
          ctx.fill();
          ctx.stroke();

          // Lock Icon & Speech bubble
          ctx.font = '30px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔒', door.x + door.width / 2, door.y + door.height / 2 + 10);

          // Guardian Emoji on top
          if (door.characterEmoji) {
            ctx.font = '26px sans-serif';
            ctx.fillText(door.characterEmoji, door.x + door.width / 2, door.y - 12);
          }

          // Question badge
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('¡TOCA AQUÍ!', door.x + door.width / 2, door.y - 36);
          ctx.restore();
        } else {
          // Unlocked open portal
          ctx.save();
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.roundRect(door.x, door.y, door.width, door.height, 12);
          ctx.stroke();

          ctx.font = '26px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✨🔓✨', door.x + door.width / 2, door.y + door.height / 2 + 10);
          ctx.restore();
        }
      });

      // 5. Render Goal Portal (Exit Flag / Energy Portal)
      const goal = level.goal;
      ctx.save();
      const goalAngle = tick * 0.04;
      ctx.translate(goal.x + goal.width / 2, goal.y + goal.height / 2);

      // Rotating glow rings
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
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
      ctx.font = 'black 13px sans-serif';
      ctx.fillText('¡META!', 0, -goal.height / 2 - 14);
      ctx.restore();

      // 6. Render Particles
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

      // 7. Render Player Avatar
      const player = playerRef.current;
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

      // Facing orientation
      if (player.facing === 'left') {
        ctx.scale(-1, 1);
      }

      // Player body bobbing
      const walkBob = player.isGrounded && Math.abs(player.vx) > 0.5 ? Math.sin(tick * 0.3) * 3 : 0;

      // Character body
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

      // Shadow on ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, player.height / 2 - 2, player.width / 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body bubble
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

      // Main Face Emoji
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(charEmoji, 0, -2 + walkBob);

      // Accessory Hat if equipped
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

      // Continue animation loop
      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [collectibles, doors, activeDoor, characterId, characterHat, level, spawnCollectParticles, bitsCollected, score, onLevelComplete]);

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
        <div className="flex items-center gap-3 md:gap-6">
          {/* Bits collected */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 rounded-xl border border-cyan-500/40">
            <span className="text-base md:text-lg">💎</span>
            <div className="text-left">
              <span className="text-[9px] text-cyan-300 uppercase block font-bold leading-none">Bits</span>
              <span className="text-xs md:text-sm font-black text-cyan-200">
                {bitsCollected} / {level.collectibles.length}
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 rounded-xl border border-amber-500/40">
            <span className="text-base md:text-lg">⭐</span>
            <div className="text-left">
              <span className="text-[9px] text-amber-300 uppercase block font-bold leading-none">Puntos</span>
              <span className="text-xs md:text-sm font-black text-amber-200">{score}</span>
            </div>
          </div>

          {/* Quick Voice Tip Button */}
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

        {/* Floating Quick Hint badge on bottom of canvas */}
        <div className="absolute bottom-3 left-4 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-700/80 text-xs text-slate-300 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>
            {level.guideCharacter.emoji} <strong>{level.guideCharacter.name}:</strong> {level.guideCharacter.tip}
          </span>
        </div>
      </div>

      {/* Mobile/Tablet Touch Controls bar */}
      <TouchControls
        onLeftStart={handleLeftStart}
        onLeftEnd={handleLeftEnd}
        onRightStart={handleRightStart}
        onRightEnd={handleRightEnd}
        onJumpStart={handleJumpStart}
        onJumpEnd={handleJumpEnd}
        onAction={() => soundService.speak(level.guideCharacter.tip, true)}
      />

      {/* Quiz Modal when reaching an interactive door */}
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
