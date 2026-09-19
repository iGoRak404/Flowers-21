import React, { useState } from 'react';
import { UserConfig, AnimationType } from './types';
import { LoginCard } from './components/LoginCard';
import { MainScreen } from './components/MainScreen';
import { PetalsRainCanvas } from './components/animations/PetalsRainCanvas';
import { SunflowerBloomSVG } from './components/animations/SunflowerBloomSVG';
import { FloatingSparklesCanvas } from './components/animations/FloatingSparklesCanvas';
import { SpiralVortexCanvas } from './components/animations/SpiralVortexCanvas';
import { GoldenButterfliesCanvas } from './components/animations/GoldenButterfliesCanvas';
import { CelestialFlowersCanvas } from './components/animations/CelestialFlowersCanvas';
import { AuroraFlowersCanvas } from './components/animations/AuroraFlowersCanvas';
import { CrystalPetalsCanvas } from './components/animations/CrystalPetalsCanvas';
import { SunburstDandelionsCanvas } from './components/animations/SunburstDandelionsCanvas';
import { ShootingStarsRainCanvas } from './components/animations/ShootingStarsRainCanvas';
import { CodeModal } from './components/CodeModal';
import { STANDALONE_HTML_CODE } from './data/standaloneHtml';
import { playFlowerChime, setGlobalMuted } from './utils/audio';
import { musicManager } from './utils/musicManager';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserConfig | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [activeAnimation, setActiveAnimation] = useState<AnimationType>('petals_rain');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  const handleLoginSuccess = (user: UserConfig) => {
    setIsTransitioning(true);
    if (soundEnabled) {
      playFlowerChime(1);
    }

    setTimeout(() => {
      setCurrentUser(user);
      setActiveAnimation(user.animationType);
      setIsTransitioning(false);
    }, 450);
  };

  const handleLogout = () => {
    setIsTransitioning(true);
    musicManager.stop();
    if (soundEnabled) {
      playFlowerChime(0.85);
    }

    setTimeout(() => {
      setCurrentUser(null);
      setActiveAnimation('petals_rain');
      setIsTransitioning(false);
    }, 400);
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      setGlobalMuted(!next);
      musicManager.setMuted(!next);
      return next;
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-warm-night flex flex-col justify-center items-center overflow-x-hidden selection:bg-amber-400 selection:text-slate-950 font-['Poppins',sans-serif]">
      {/* CAPA 1: RESPLANDOR AMBIENTAL DE FONDO */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-radial from-amber-500/10 via-yellow-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-radial from-amber-600/10 to-transparent blur-3xl" />
      </div>

      {/* CAPA 2: MOTOR DE ANIMACIONES DE FONDO DE FLORES AMARILLAS */}
      {currentUser ? (
        <>
          {activeAnimation === 'petals_rain' && <PetalsRainCanvas interactive={true} />}
          {activeAnimation === 'sunflower_bloom' && <SunflowerBloomSVG interactive={true} />}
          {activeAnimation === 'floating_sparkles' && <FloatingSparklesCanvas interactive={true} />}
          {activeAnimation === 'golden_bouquet' && <FloatingSparklesCanvas interactive={true} />}
          {activeAnimation === 'spiral_vortex' && <SpiralVortexCanvas interactive={true} />}
          {activeAnimation === 'celestial_flowers' && <CelestialFlowersCanvas interactive={true} />}
          {activeAnimation === 'aurora_flowers' && <AuroraFlowersCanvas interactive={true} />}
          {activeAnimation === 'crystal_petals' && <CrystalPetalsCanvas interactive={true} />}
          {activeAnimation === 'sunburst_dandelions' && <SunburstDandelionsCanvas interactive={true} />}
          {/* Mariposas doradas: para Ange, Keisy, Leslie, Vane, Nata, Siel, Julieth y Skarlet */}
          {(activeAnimation === 'golden_butterflies' ||
            ['keisy', 'leslie', 'vane', 'naty', 'nata', 'siel', 'julieth', 'skarlet'].includes(currentUser.username.toLowerCase())) && (
            <GoldenButterfliesCanvas interactive={true} />
          )}

          {/* Lluvia de estrellas fugaces: para perfiles con temática mágica */}
          {['keisy', 'vane', 'naty', 'nata', 'leslie', 'ashlie', 'ange', 'siel', 'julieth', 'skarlet'].includes(currentUser.username.toLowerCase()) && (
            <ShootingStarsRainCanvas interactive={true} />
          )}
        </>
      ) : (
        <PetalsRainCanvas interactive={true} />
      )}

      {/* CAPA 3: INTERFAZ DE USUARIO (TRANSICIÓN SUAVE LOGIN <-> MAIN) */}
      <div
        className={`w-full z-20 transition-all duration-500 ease-in-out ${
          isTransitioning
            ? 'opacity-0 scale-95 pointer-events-none'
            : 'opacity-100 scale-100'
        }`}
      >
        {!currentUser ? (
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <LoginCard onLoginSuccess={handleLoginSuccess} />
          </div>
        ) : (
          <MainScreen
            user={currentUser}
            activeAnimation={activeAnimation}
            onLogout={handleLogout}
            onOpenCodeModal={() => setIsCodeModalOpen(true)}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />
        )}
      </div>

      {/* MODAL DE CÓDIGO HTML ÚNICO AUTÓNOMO */}
      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        singleFileHtml={STANDALONE_HTML_CODE}
      />
    </div>
  );
}
