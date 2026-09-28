export type CharacterId = 'byte' | 'pixel' | 'chipita' | 'nano';

export interface Character {
  id: CharacterId;
  name: string;
  role: string;
  color: string;
  avatarEmoji: string;
  hat?: string;
  description: string;
}

export type WorldId = 'entrada' | 'cpu' | 'almacenamiento' | 'salida';

export interface QuizQuestion {
  id: string;
  prompt: string;
  explanation: string;
  options: {
    id: string;
    text: string;
    emoji: string;
    isCorrect: boolean;
  }[];
  hint?: string;
}

export interface LevelCollectible {
  id: string;
  x: number;
  y: number;
  type: 'bit' | 'star' | 'crystal' | 'silicon' | 'usb_drive';
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'ground' | 'circuit' | 'cloud' | 'spring' | 'moving' | 'usb' | 'fan';
  dx?: number;
  moveRange?: number;
  initialX?: number;
}

export interface InteractiveDoor {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  question: QuizQuestion;
  isUnlocked: boolean;
  characterDialogue?: string;
  characterName?: string;
  characterEmoji?: string;
}

export interface LevelGoal {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LevelData {
  id: string;
  worldId: WorldId;
  title: string;
  subtitle: string;
  description: string;
  educationalTopic: string;
  storyIntro: string;
  guideCharacter: {
    name: string;
    emoji: string;
    tip: string;
  };
  canvasWidth: number;
  canvasHeight: number;
  playerStartX: number;
  playerStartY: number;
  platforms: Platform[];
  collectibles: LevelCollectible[];
  doors: InteractiveDoor[];
  goal: LevelGoal;
  minStarsRequirement?: number;
}

export interface WorldData {
  id: WorldId;
  name: string;
  title: string;
  emoji: string;
  themeColor: string;
  badgeName: string;
  badgeEmoji: string;
  conceptSummary: string;
  levels: LevelData[];
}

export interface GameProgress {
  selectedCharacter: CharacterId;
  characterHat: string;
  unlockedWorlds: WorldId[];
  unlockedLevels: string[];
  completedLevels: Record<string, { stars: number; score: number; highBits: number }>;
  totalBits: number;
  unlockedBadges: string[];
  unlockedCuriosities: string[];
  playerName: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  narrationEnabled: boolean;
}
