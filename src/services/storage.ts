import { GameProgress, WorldId } from '../types/game';

const STORAGE_KEY = 'ciber_aventura_save_v1';

export const DEFAULT_PROGRESS: GameProgress = {
  selectedCharacter: 'byte',
  characterHat: 'ninguno',
  unlockedWorlds: ['entrada', 'cpu'],
  unlockedLevels: ['w1_l1'],
  completedLevels: {},
  totalBits: 0,
  unlockedBadges: [],
  unlockedCuriosities: ['curiosity_cpu_chef', 'curiosity_silicio'],
  playerName: 'Super Detective',
  soundEnabled: true,
  musicEnabled: true,
  narrationEnabled: true,
};

export const loadGameProgress = (): GameProgress => {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_PROGRESS,
        ...parsed,
        unlockedWorlds: Array.from(new Set([...DEFAULT_PROGRESS.unlockedWorlds, ...(parsed.unlockedWorlds || [])])),
        unlockedLevels: Array.from(new Set([...DEFAULT_PROGRESS.unlockedLevels, ...(parsed.unlockedLevels || [])])),
      };
    }
  } catch (e) {
    console.error('Failed to load progress', e);
  }
  return DEFAULT_PROGRESS;
};

export const saveGameProgress = (progress: GameProgress) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
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
