import { GameProgress, WorldId } from '../types/game';

const SESSION_KEY = 'ciber_aventura_session_active';

export const DEFAULT_PROGRESS: GameProgress = {
  selectedCharacter: 'byte',
  characterHat: 'ninguno',
  unlockedWorlds: ['entrada'], // Empezar solo con Mundo 1 desbloqueado
  unlockedLevels: ['w1_l1'], // Empezar solo con Nivel 1-1
  completedLevels: {},
  totalBits: 0,
  unlockedBadges: [],
  unlockedCuriosities: ['curiosity_cpu_chef', 'curiosity_silicio'],
  playerName: 'Super Detective',
  soundEnabled: true,
  musicEnabled: true,
  narrationEnabled: true,
};

// Al recargar el juego, el progreso siempre se reinicia para que el siguiente estudiante empiece de cero
export const loadGameProgress = (): GameProgress => {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    // Limpiar cualquier residuo de sesiones o localStorages anteriores
    localStorage.removeItem('ciber_aventura_save_v1');
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Error limpiando progreso anterior', e);
  }
  return { ...DEFAULT_PROGRESS };
};

export const saveGameProgress = (progress: GameProgress) => {
  if (typeof window === 'undefined') return;
  try {
    // Guardamos únicamente en memoria de sesión temporal durante la partida activa del estudiante
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error guardando progreso de sesión', e);
  }
};

export const resetGameProgress = (): GameProgress => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('ciber_aventura_save_v1');
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  }
  return { ...DEFAULT_PROGRESS };
};

export const markLevelComplete = (
  current: GameProgress,
  levelId: string,
  stars: number,
  score: number,
  bitsCollected: number,
  nextLevelId?: string,
  nextWorldId?: WorldId,
  newBadgeId?: string
): GameProgress => {
  const currentLevelRecord = current.completedLevels[levelId] || { stars: 0, score: 0, highBits: 0 };

  const updatedCompleted = {
    ...current.completedLevels,
    [levelId]: {
      stars: Math.max(currentLevelRecord.stars, stars),
      score: Math.max(currentLevelRecord.score, score),
      highBits: Math.max(currentLevelRecord.highBits, bitsCollected),
    },
  };

  const unlockedLevels = new Set(current.unlockedLevels);
  if (nextLevelId) {
    unlockedLevels.add(nextLevelId);
  }

  const unlockedWorlds = new Set(current.unlockedWorlds);
  if (nextWorldId) {
    unlockedWorlds.add(nextWorldId);
  }

  const unlockedBadges = new Set(current.unlockedBadges);
  if (newBadgeId) {
    unlockedBadges.add(newBadgeId);
  }

  const newProgress: GameProgress = {
    ...current,
    totalBits: current.totalBits + bitsCollected,
    completedLevels: updatedCompleted,
    unlockedLevels: Array.from(unlockedLevels),
    unlockedWorlds: Array.from(unlockedWorlds),
    unlockedBadges: Array.from(unlockedBadges),
  };

  saveGameProgress(newProgress);
  return newProgress;
};
