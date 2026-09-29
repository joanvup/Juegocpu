/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameProgress, LevelData, WorldId, CharacterId } from './types/game';
import { WORLDS_DATA } from './data/levelsData';
import { BADGES } from './data/curriculumData';
import { loadGameProgress, saveGameProgress, markLevelComplete } from './services/storage';
import { soundService } from './services/audio';

import { GameHeader } from './components/Header/GameHeader';
import { WorldMap } from './components/WorldMap/WorldMap';
import { GameCanvas } from './components/PlatformEngine/GameCanvas';
import { LevelIntroModal } from './components/DialogueModal/LevelIntroModal';
import { LevelCompleteModal } from './components/EducationalModal/LevelCompleteModal';
import { EncyclopediaModal } from './components/Encyclopedia/EncyclopediaModal';
import { CertificateModal } from './components/Certificate/CertificateModal';
import { CharacterModal } from './components/CharacterCustomizer/CharacterModal';
import { MiniGamesHubModal, MiniGameType } from './components/MiniGames/MiniGamesHubModal';

import { CpuKitchenGame } from './components/MiniGames/CpuKitchenGame';
import { StorageOrganizerGame } from './components/MiniGames/StorageOrganizerGame';
import { CloudCableGame } from './components/MiniGames/CloudCableGame';
import { PaintDinoGame } from './components/MiniGames/PaintDinoGame';
import { CycleRunnerGame } from './components/MiniGames/CycleRunnerGame';
import { FastMathCpuGame } from './components/MiniGames/FastMathCpuGame';
import { DeviceSorterGame } from './components/MiniGames/DeviceSorterGame';

export default function App() {
  const [progress, setProgress] = useState<GameProgress>(() => loadGameProgress());

  // Game View State
  const [currentView, setCurrentView] = useState<
    | 'map'
    | 'platform_game'
    | 'mini_game_kitchen'
    | 'mini_game_storage'
    | 'mini_game_cloud'
    | 'mini_game_dino'
    | 'mini_game_cycle'
    | 'mini_game_math'
    | 'mini_game_devices'
  >('map');

  // Active level selection
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [showLevelIntro, setShowLevelIntro] = useState(false);
  const [levelVictoryData, setLevelVictoryData] = useState<{
    level: LevelData;
    stars: number;
    bitsCollected: number;
    score: number;
    newBadgeUnlocked?: string | null;
  } | null>(null);

  // Modals state
  const [isEncyclopediaOpen, setIsEncyclopediaOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isMiniGamesHubOpen, setIsMiniGamesHubOpen] = useState(false);

  // Sync progress settings with audio service
  useEffect(() => {
    soundService.soundEnabled = progress.soundEnabled;
    soundService.narrationEnabled = progress.narrationEnabled;
  }, [progress.soundEnabled, progress.narrationEnabled]);

  // Handle selecting a level from the map
  const handleSelectLevel = (level: LevelData) => {
    setSelectedLevel(level);
    setShowLevelIntro(true);
  };

  // Start playing the level
  const handleStartLevel = () => {
    setShowLevelIntro(false);
    setLevelVictoryData(null);
    setCurrentView('platform_game');
  };

  // When a level is completed
  const handleLevelCompleted = useCallback(
    (stars: number, score: number, bitsCollected: number) => {
      if (!selectedLevel) return;

      // Find next level & world unlocking logic
      let nextLevelId: string | undefined;
      let nextWorldId: WorldId | undefined;
      let newBadgeId: string | undefined;

      const currentWorld = WORLDS_DATA.find((w) => w.id === selectedLevel.worldId);
      if (currentWorld) {
        const levelIdx = currentWorld.levels.findIndex((l) => l.id === selectedLevel.id);
        if (levelIdx !== -1 && levelIdx < currentWorld.levels.length - 1) {
          nextLevelId = currentWorld.levels[levelIdx + 1].id;
        } else if (levelIdx === currentWorld.levels.length - 1) {
          // Completed the entire world! Unlock next world badge and next world
          const worldIdx = WORLDS_DATA.findIndex((w) => w.id === currentWorld.id);
          const matchingBadge = BADGES.find((b) => b.world === currentWorld.id);
          if (matchingBadge) {
            newBadgeId = matchingBadge.id;
          }

          if (worldIdx !== -1 && worldIdx < WORLDS_DATA.length - 1) {
            nextWorldId = WORLDS_DATA[worldIdx + 1].id;
            nextLevelId = WORLDS_DATA[worldIdx + 1].levels[0]?.id;
          }
        }
      }

      setProgress((prev) => {
        const updated = markLevelComplete(
          prev,
          selectedLevel.id,
          stars,
          score,
          bitsCollected,
          nextLevelId,
          nextWorldId,
          newBadgeId
        );
        return updated;
      });

      const badgeName = newBadgeId ? BADGES.find((b) => b.id === newBadgeId)?.name : null;

      setLevelVictoryData({
        level: selectedLevel,
        stars,
        bitsCollected,
        score,
        newBadgeUnlocked: badgeName,
      });
    },
    [selectedLevel]
  );

  // Replay current level
  const handleReplayLevel = () => {
    setLevelVictoryData(null);
    setCurrentView('platform_game');
  };

  // Next level
  const handleNextLevelFromVictory = () => {
    if (!selectedLevel) return;
    setLevelVictoryData(null);

    let foundNext: LevelData | null = null;
    for (let w = 0; w < WORLDS_DATA.length; w++) {
      const world = WORLDS_DATA[w];
      const lIdx = world.levels.findIndex((l) => l.id === selectedLevel.id);
      if (lIdx !== -1) {
        if (lIdx < world.levels.length - 1) {
          foundNext = world.levels[lIdx + 1];
        } else if (w < WORLDS_DATA.length - 1) {
          foundNext = WORLDS_DATA[w + 1].levels[0];
        }
        break;
      }
    }

    if (foundNext) {
      setSelectedLevel(foundNext);
      setShowLevelIntro(true);
      setCurrentView('map');
    } else {
      setCurrentView('map');
      setIsCertificateOpen(true);
    }
  };

  // Handle mini-game complete
  const handleMiniGameReward = (bonusScore: number) => {
    const updated: GameProgress = {
      ...progress,
      totalBits: progress.totalBits + Math.floor(bonusScore / 2),
    };
    setProgress(updated);
    saveGameProgress(updated);
    soundService.playFanfare();
    setCurrentView('map');
  };

  // Toggles
  const handleToggleSound = () => {
    const updated = { ...progress, soundEnabled: !progress.soundEnabled };
    setProgress(updated);
    saveGameProgress(updated);
  };

  const handleToggleNarration = () => {
    const updated = { ...progress, narrationEnabled: !progress.narrationEnabled };
    setProgress(updated);
    saveGameProgress(updated);
    if (updated.narrationEnabled) {
      soundService.speak('¡Voz de lectura en español activada!', true);
    }
  };

  const handleUpdatePlayerName = (name: string) => {
    const updated = { ...progress, playerName: name };
    setProgress(updated);
    saveGameProgress(updated);
  };

  const handleSelectCharacter = (charId: CharacterId) => {
    const updated = { ...progress, selectedCharacter: charId };
    setProgress(updated);
    saveGameProgress(updated);
  };

  const handleSelectHat = (hatId: string) => {
    const updated = { ...progress, characterHat: hatId };
    setProgress(updated);
    saveGameProgress(updated);
  };

  const handleOpenMiniGame = (gameType: MiniGameType) => {
    setIsMiniGamesHubOpen(false);
    if (gameType === 'kitchen') setCurrentView('mini_game_kitchen');
    else if (gameType === 'storage') setCurrentView('mini_game_storage');
    else if (gameType === 'cloud') setCurrentView('mini_game_cloud');
    else if (gameType === 'dino') setCurrentView('mini_game_dino');
    else if (gameType === 'cycle') setCurrentView('mini_game_cycle');
    else if (gameType === 'math') setCurrentView('mini_game_math');
    else if (gameType === 'devices') setCurrentView('mini_game_devices');
  };

  // Calculate total user score across levels
  const totalScore = Object.values(progress.completedLevels).reduce((acc, l) => acc + l.score, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Main Navigation Bar */}
      <GameHeader
        progress={progress}
        onOpenEncyclopedia={() => setIsEncyclopediaOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
        onOpenCharacterModal={() => setIsCharacterModalOpen(true)}
        onOpenMiniGames={() => setIsMiniGamesHubOpen(true)}
        onToggleSound={handleToggleSound}
        onToggleNarration={handleToggleNarration}
      />

      {/* Main Screen Router */}
      <main className="flex-1 flex flex-col justify-start">
        {currentView === 'map' && (
          <WorldMap
            progress={progress}
            onSelectLevel={handleSelectLevel}
            onOpenMiniGame={handleOpenMiniGame}
            onOpenEncyclopedia={() => setIsEncyclopediaOpen(true)}
            onOpenCertificate={() => setIsCertificateOpen(true)}
          />
        )}

        {currentView === 'platform_game' && selectedLevel && (
          <GameCanvas
            level={selectedLevel}
            characterId={progress.selectedCharacter}
            characterHat={progress.characterHat}
            onLevelComplete={handleLevelCompleted}
            onExitToMap={() => {
              setLevelVictoryData(null);
              setCurrentView('map');
            }}
          />
        )}

        {currentView === 'mini_game_kitchen' && (
          <div className="p-4 md:p-6 flex-1 flex items-center justify-center">
            <CpuKitchenGame
              onBack={() => setCurrentView('map')}
              onComplete={handleMiniGameReward}
            />
          </div>
        )}

        {currentView === 'mini_game_storage' && (
          <div className="p-4 md:p-6 flex-1 flex items-center justify-center">
            <StorageOrganizerGame
              onBack={() => setCurrentView('map')}
              onComplete={handleMiniGameReward}
            />
          </div>
        )}

        {currentView === 'mini_game_cloud' && (
          <div className="p-4 md:p-6 flex-1 flex items-center justify-center">
            <CloudCableGame
              onBack={() => setCurrentView('map')}
              onComplete={handleMiniGameReward}
            />
          </div>
        )}

        {currentView === 'mini_game_dino' && (
          <div className="p-4 md:p-6 flex-1 flex items-center justify-center">
            <PaintDinoGame
              onBack={() => setCurrentView('map')}
              onComplete={handleMiniGameReward}
            />
          </div>
        )}

        {currentView === 'mini_game_cycle' && (
          <div className="p-4 md:p-6 flex-1 flex items-center justify-center">
            <CycleRunnerGame
              onBack={() => setCurrentView('map')}
              onComplete={handleMiniGameReward}
            />
          </div>
        )}

        {currentView === 'mini_game_math' && (
          <div className="p-4 md:p-6 flex-1 flex items-center justify-center">
            <FastMathCpuGame
              onBack={() => setCurrentView('map')}
              onComplete={handleMiniGameReward}
            />
          </div>
        )}

        {currentView === 'mini_game_devices' && (
          <div className="p-4 md:p-6 flex-1 flex items-center justify-center">
            <DeviceSorterGame
              onBack={() => setCurrentView('map')}
              onComplete={handleMiniGameReward}
            />
          </div>
        )}
      </main>

      {/* Level Intro Story Dialog */}
      {showLevelIntro && selectedLevel && (
        <LevelIntroModal
          level={selectedLevel}
          onStart={handleStartLevel}
          onCancel={() => setShowLevelIntro(false)}
        />
      )}

      {/* Level Complete Celebration Modal */}
      {levelVictoryData && (
        <LevelCompleteModal
          level={levelVictoryData.level}
          stars={levelVictoryData.stars}
          bitsCollected={levelVictoryData.bitsCollected}
          totalBitsInLevel={levelVictoryData.level.collectibles.length}
          score={levelVictoryData.score}
          newBadgeUnlocked={levelVictoryData.newBadgeUnlocked}
          onNextLevel={handleNextLevelFromVictory}
          onReplay={handleReplayLevel}
          onWorldMap={() => {
            setLevelVictoryData(null);
            setCurrentView('map');
          }}
        />
      )}

      {/* Global Modals */}
      {isEncyclopediaOpen && (
        <EncyclopediaModal onClose={() => setIsEncyclopediaOpen(false)} />
      )}

      {isCertificateOpen && (
        <CertificateModal
          playerName={progress.playerName}
          onUpdatePlayerName={handleUpdatePlayerName}
          unlockedBadgesCount={progress.unlockedBadges.length}
          totalScore={totalScore}
          onClose={() => setIsCertificateOpen(false)}
        />
      )}

      {isCharacterModalOpen && (
        <CharacterModal
          selectedCharacter={progress.selectedCharacter}
          selectedHat={progress.characterHat}
          totalBits={progress.totalBits}
          onSelectCharacter={handleSelectCharacter}
          onSelectHat={handleSelectHat}
          onClose={() => setIsCharacterModalOpen(false)}
        />
      )}

      {isMiniGamesHubOpen && (
        <MiniGamesHubModal
          onSelectGame={handleOpenMiniGame}
          onClose={() => setIsMiniGamesHubOpen(false)}
        />
      )}
    </div>
  );
}
