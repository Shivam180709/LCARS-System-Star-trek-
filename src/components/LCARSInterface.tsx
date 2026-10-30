/**
 * Starfleet LCARS (Library Computer Access and Retrieval System) Interface
 * Includes Orthographic Schematics & Subsystem Inspect Callouts matching the reference diagram.
 */

import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Shield,
  Layers,
  Camera,
  Palette,
  Volume2,
  VolumeX,
  RotateCw,
  Maximize2,
  Crosshair,
  Flame,
  ChevronDown,
  ChevronUp,
  Camera as SnapshotIcon,
  Radio,
  Compass,
  Sliders,
  Sun,
  SunMedium,
  Moon,
  Eye,
  Sparkles,
  X,
  RotateCcw,
} from 'lucide-react';
import { AlertMode, HullFinish } from '../models/enterpriseModel';
import { CameraPreset, SceneHandle } from './EnterpriseScene';
import { spaceAudio } from '../audio/spaceAudio';

interface LCARSInterfaceProps {
  sceneHandle: SceneHandle | null;
  alertMode: AlertMode;
  setAlertMode: (mode: AlertMode) => void;
  speedMode: 'sublight' | 'impulse' | 'warp';
  setSpeedMode: (speed: 'sublight' | 'impulse' | 'warp') => void;
  hullFinish: HullFinish;
  setHullFinish: (finish: HullFinish) => void;
  explodedProgress: number;
  setExplodedProgress: (val: number) => void;
  autoRotate: boolean;
  setAutoRotate: (val: boolean) => void;
  autoRotateSpeed: number;
  setAutoRotateSpeed: (spd: number) => void;
  bloomEnabled: boolean;
  setBloomEnabled: (enabled: boolean) => void;
  exposure: number;
  setExposure: (val: number) => void;
  lightIntensity: number;
  setLightIntensity: (val: number) => void;
  ambientFill: number;
  setAmbientFill: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  lightingPreset: 'cinematic' | 'deepspace' | 'drydock' | 'solar';
  setLightingPreset: (preset: 'cinematic' | 'deepspace' | 'drydock' | 'solar') => void;
  onAskComputer?: () => void;
  onEnterBridge?: () => void;
}

type ActiveTab = 'ortho' | 'lighting' | 'flight' | 'tactical' | 'schematic' | 'cameras' | 'livery';

export const LCARSInterface: React.FC<LCARSInterfaceProps> = ({
  sceneHandle,
  alertMode,
  setAlertMode,
  speedMode,
  setSpeedMode,
  hullFinish,
  setHullFinish,
  explodedProgress,
  setExplodedProgress,
  autoRotate,
  setAutoRotate,
  autoRotateSpeed,
  setAutoRotateSpeed,
  bloomEnabled,
  setBloomEnabled,
  exposure,
  setExposure,
  lightIntensity,
  setLightIntensity,
  ambientFill,
  setAmbientFill,
  contrast,
  setContrast,
  lightingPreset,
  setLightingPreset,
  onAskComputer,
  onEnterBridge,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('lighting');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [showSchematicsHUD, setShowSchematicsHUD] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('saucer');

  // Dynamic Propulsion Speed & Warp Factor State
  // Thrusters: 10 to 500 km/s | Impulse: 2.5 to 75.0 Mm/s | Warp Factor: 1.0 to 9.9 (Warp 1.0 = 8.5 c)
  const [thrusterSpeed, setThrusterSpeed] = useState<number>(125);
  const [impulseSpeed, setImpulseSpeed] = useState<number>(37.5);
  const [warpFactor, setWarpFactor] = useState<number>(1.0);

  const formatWarpLightSpeed = (wf: number): string => {
    const cVal = 8.5 * Math.pow(wf, 3);
    return cVal < 100 ? `${cVal.toFixed(1)} c` : `${Math.round(cVal).toLocaleString()} c`;
  };

  const getNormalizedPropulsion = (
    mode: 'sublight' | 'impulse' | 'warp',
    tSpd = thrusterSpeed,
    iSpd = impulseSpeed,
    wFac = warpFactor
  ): number => {
    if (mode === 'warp') return (wFac - 1.0) / 8.9;
    if (mode === 'impulse') return (iSpd - 2.5) / 72.5;
    return (tSpd - 10) / 490;
  };

  useEffect(() => {
    sceneHandle?.setPropulsionFactor?.(speedMode, getNormalizedPropulsion(speedMode));
  }, [sceneHandle, speedMode, thrusterSpeed, impulseSpeed, warpFactor]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2500);
  };

  const handleAudioToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    spaceAudio.setMuted(nextMuted);
    if (!nextMuted) {
      spaceAudio.startEngines();
      spaceAudio.playChirp('high');
    }
  };

  const handleAlertChange = (mode: AlertMode) => {
    spaceAudio.playChirp(mode === 'red' ? 'high' : 'mid');
    setAlertMode(mode);
    spaceAudio.setAlertKlaxon(mode === 'red');
    showToast(`ALERT STATUS: CONDITION ${mode.toUpperCase()}`);
  };

  const handleSpeedChange = (speed: 'sublight' | 'impulse' | 'warp') => {
    spaceAudio.startEngines();
    spaceAudio.playChirp('mid');
    setSpeedMode(speed);
    spaceAudio.setWarpSpeed(speed === 'warp');
    sceneHandle?.setPropulsionFactor?.(speed, getNormalizedPropulsion(speed));
    showToast(
      speed === 'warp'
        ? `WARP ${warpFactor.toFixed(1)} ENGAGED • ${formatWarpLightSpeed(warpFactor)}`
        : speed === 'impulse'
        ? `IMPULSE ENGINES • ${impulseSpeed.toFixed(1)} Mm/s`
        : `THRUSTERS ACTIVE • ${thrusterSpeed} km/s`
    );
  };

  const handleFireTorpedo = () => {
    spaceAudio.playPhotonTorpedo();
    sceneHandle?.fireTorpedo();
    showToast('PHOTON TORPEDO LAUNCHED');
  };

  const handleFirePhaser = () => {
    spaceAudio.playPhaserPulse();
    sceneHandle?.firePhaser();
    showToast('VENTRAL PHASERS DISCHARGED');
  };

  const handleCameraChange = (preset: CameraPreset) => {
    spaceAudio.playChirp('low');
    sceneHandle?.setCameraPreset(preset);
  };

  const handleSubsystemClick = (name: string) => {
    setSelectedSubsystem(name);
    spaceAudio.playChirp('mid');
    sceneHandle?.focusSubsystem(name);
    showToast(`TELEMETRY LOCK: ${name.toUpperCase()}`);
  };

  const handleScreenshot = () => {
    const dataUrl = sceneHandle?.takeScreenshot();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `USS-Enterprise-NCC1701-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      showToast('HIGH-RES 3D CAPTURE SAVED');
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const renderTabBody = (isMobile: boolean) => {
    switch (activeTab) {
      case 'lighting':
        return (
          <div className="w-full flex flex-col gap-2.5 sm:gap-3">
            {/* Lighting Presets */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
              <div className={`grid ${isMobile ? 'grid-cols-2 w-full' : 'grid-cols-2 sm:flex sm:items-center'} gap-1.5`}>
                {[
                  { id: 'cinematic', label: '🎬 CINEMATIC', toast: 'LIGHTING: 🎬 CINEMATIC (BALANCED)' },
                  { id: 'deepspace', label: '🌌 DEEP SPACE', toast: 'LIGHTING: 🌌 DEEP SPACE (HIGH CONTRAST)' },
                  { id: 'drydock', label: '🛰️ DRYDOCK', toast: 'LIGHTING: 🛰️ STARBASE DRYDOCK' },
                  { id: 'solar', label: '☀️ SOLAR', toast: 'LIGHTING: ☀️ SOLAR HIGH-KEY' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setLightingPreset(p.id as any);
                      spaceAudio.playChirp('mid');
                      showToast(p.toast);
                    }}
                    className={`px-2.5 py-2 sm:py-1 rounded-lg text-xs sm:text-[11px] font-mono font-bold transition-all border text-center active:scale-95 cursor-pointer ${
                      lightingPreset === p.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {!isMobile && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-900/90 border border-slate-800 px-2 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-400">HULL CONTRAST:</span>
                  <span className="text-emerald-400 font-bold">100% VISIBLE</span>
                </div>
              )}
            </div>

            {/* Precision Calibration Sliders (Contrast, Exposure, Sunlight, Ambient Fill) */}
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2'} pt-1 border-t border-slate-800/80`}>
              {/* Contrast Slider */}
              <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-800 px-2.5 py-1.5 rounded-lg shadow-sm">
                <Sliders className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs sm:text-[10px] font-mono text-slate-300 flex-shrink-0 font-bold">
                  CONTRAST:
                </span>
                <input
                  type="range"
                  min="0.70"
                  max="1.50"
                  step="0.05"
                  value={contrast}
                  onChange={(e) => setContrast(parseFloat(e.target.value))}
                  className={`w-full ${isMobile ? 'h-3' : 'h-1.5'} bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400`}
                  title="Adjust starship hull optical contrast"
                />
                <span className="text-xs sm:text-[10px] font-mono text-amber-400 font-bold w-10 text-right">
                  {Math.round(contrast * 100)}%
                </span>
              </div>

              {/* Exposure Slider */}
              <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-800 px-2.5 py-1.5 rounded-lg shadow-sm">
                <SunMedium className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs sm:text-[10px] font-mono text-slate-300 flex-shrink-0 font-bold">
                  EXPOSURE:
                </span>
                <input
                  type="range"
                  min="0.30"
                  max="1.50"
                  step="0.05"
                  value={exposure}
                  onChange={(e) => setExposure(parseFloat(e.target.value))}
                  className={`w-full ${isMobile ? 'h-3' : 'h-1.5'} bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400`}
                  title="Adjust camera tone mapping exposure"
                />
                <span className="text-xs sm:text-[10px] font-mono text-amber-400 font-bold w-10 text-right">
                  {Math.round(exposure * 100)}%
                </span>
              </div>

              {/* Sun Key Light Slider */}
              <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-800 px-2.5 py-1.5 rounded-lg shadow-sm">
                <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs sm:text-[10px] font-mono text-slate-300 flex-shrink-0 font-bold">
                  SUNLIGHT:
                </span>
                <input
                  type="range"
                  min="0.20"
                  max="1.60"
                  step="0.05"
                  value={lightIntensity}
                  onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                  className={`w-full ${isMobile ? 'h-3' : 'h-1.5'} bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400`}
                  title="Adjust directional star key illumination"
                />
                <span className="text-xs sm:text-[10px] font-mono text-amber-400 font-bold w-10 text-right">
                  {Math.round(lightIntensity * 100)}%
                </span>
              </div>

              {/* Deep Space Ambient Fill Slider */}
              <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-800 px-2.5 py-1.5 rounded-lg shadow-sm">
                <Moon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-xs sm:text-[10px] font-mono text-slate-300 flex-shrink-0 font-bold">
                  FILL LIGHT:
                </span>
                <input
                  type="range"
                  min="0.02"
                  max="0.45"
                  step="0.02"
                  value={ambientFill}
                  onChange={(e) => setAmbientFill(parseFloat(e.target.value))}
                  className={`w-full ${isMobile ? 'h-3' : 'h-1.5'} bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400`}
                  title="Adjust deep space shadow fill & blue rim light"
                />
                <span className="text-xs sm:text-[10px] font-mono text-cyan-400 font-bold w-10 text-right">
                  {Math.round(ambientFill * 100)}%
                </span>
              </div>
            </div>

            {/* Turntable & Orbit Speed */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80">
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:flex sm:items-center'} gap-1.5`}>
                <button
                  onClick={() => {
                    const next = !autoRotate;
                    setAutoRotate(next);
                    sceneHandle?.setAutoRotate(next);
                    spaceAudio.playChirp('low');
                  }}
                  className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs sm:text-[11px] font-mono font-bold border transition-colors cursor-pointer text-center active:scale-95 ${
                    autoRotate
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {autoRotate ? 'TURNTABLE: ON' : 'TURNTABLE: OFF'}
                </button>
                <button
                  onClick={() => {
                    sceneHandle?.resetCamera();
                    spaceAudio.playChirp('low');
                  }}
                  className="px-3 py-2 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs sm:text-[11px] font-mono font-bold transition-colors cursor-pointer text-center active:scale-95"
                >
                  RESET 360°
                </button>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg">
                <span className="text-xs sm:text-[10px] font-mono text-slate-400">360° SPEED:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.2"
                    value={autoRotateSpeed}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setAutoRotateSpeed(val);
                      sceneHandle?.setAutoRotateSpeed(val);
                    }}
                    className={`w-24 sm:w-20 ${isMobile ? 'h-3' : 'h-1.5'} bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400`}
                  />
                  <span className="text-xs sm:text-[10px] font-mono text-cyan-400 w-8 text-right font-bold">
                    {autoRotateSpeed.toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ortho':
        return (
          <div className="w-full flex flex-col gap-2.5">
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-[10px] font-mono text-amber-400 font-bold uppercase">
                ORTHOGRAPHIC VIEWS:
              </span>
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3 sm:flex sm:items-center'} gap-1.5`}>
                {[
                  { preset: 'dorsal', label: 'TOP (DORSAL)' },
                  { preset: 'elevation', label: 'SIDE (ELEVATION)' },
                  { preset: 'bow', label: 'FRONT (BOW)' },
                  { preset: 'stern', label: 'BACK (STERN)' },
                  { preset: 'beauty', label: '3/4 BEAUTY' },
                  { preset: 'registry', label: 'NCC-1701 CLOSE-UP', special: true },
                ].map((v) => (
                  <button
                    key={v.preset}
                    onClick={() => handleCameraChange(v.preset as CameraPreset)}
                    className={`px-2.5 py-2 sm:py-1 rounded-lg text-xs sm:text-[11px] font-mono font-bold transition-all border whitespace-nowrap active:scale-95 cursor-pointer text-center ${
                      v.special
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <span className="text-xs sm:text-[10px] font-mono text-cyan-400 font-bold uppercase">
                SUBSYSTEM HOTSPOTS:
              </span>
              <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-3 sm:flex sm:items-center'} gap-1.5`}>
                {[
                  { id: 'saucer', label: 'SAUCER', activeBg: 'bg-cyan-600 text-slate-950 border-cyan-400' },
                  { id: 'deflector', label: 'DEFLECTOR', activeBg: 'bg-amber-600 text-slate-950 border-amber-400' },
                  { id: 'bussard', label: 'BUSSARD', activeBg: 'bg-red-600 text-slate-950 border-red-400' },
                  { id: 'nacelles', label: 'WARP GRILLS', activeBg: 'bg-blue-600 text-slate-950 border-blue-400' },
                  { id: 'impulse', label: 'IMPULSE', activeBg: 'bg-orange-600 text-slate-950 border-orange-400' },
                  { id: 'shuttlebay', label: 'SHUTTLEBAY', activeBg: 'bg-purple-600 text-slate-950 border-purple-400' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSubsystemClick(s.id)}
                    className={`px-2 py-2 sm:py-1 rounded-lg text-xs sm:text-[10px] font-mono font-bold border transition-colors text-center active:scale-95 cursor-pointer ${
                      selectedSubsystem === s.id
                        ? s.activeBg
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'flight':
        return (
          <div className="w-full flex flex-col gap-2.5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-[11px] font-mono text-slate-400 uppercase">
                  PROPULSION MODE & VELOCITY:
                </span>
                <span className="text-xs sm:text-[11px] font-mono font-bold text-cyan-400">
                  {speedMode === 'warp'
                    ? `WARP ${warpFactor.toFixed(1)} • ${formatWarpLightSpeed(warpFactor)}`
                    : speedMode === 'impulse'
                    ? `IMPULSE • ${impulseSpeed.toFixed(1)} Mm/s`
                    : `THRUSTERS • ${thrusterSpeed} km/s`}
                </span>
              </div>
              <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-3 sm:flex sm:items-center'} gap-1.5`}>
                <button
                  onClick={() => handleSpeedChange('sublight')}
                  className={`px-2.5 py-2 sm:py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex flex-col items-center justify-center active:scale-95 cursor-pointer ${
                    speedMode === 'sublight'
                      ? 'bg-slate-700 text-slate-100 border border-slate-400 shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>THRUSTERS</span>
                  <span className="text-[10px] font-normal opacity-90">{thrusterSpeed} km/s</span>
                </button>
                <button
                  onClick={() => handleSpeedChange('impulse')}
                  className={`px-2.5 py-2 sm:py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex flex-col items-center justify-center active:scale-95 cursor-pointer ${
                    speedMode === 'impulse'
                      ? 'bg-amber-500 text-slate-950 font-extrabold border border-amber-300 shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>IMPULSE</span>
                  <span className="text-[10px] font-normal opacity-90">{impulseSpeed.toFixed(1)} Mm/s</span>
                </button>
                <button
                  onClick={() => handleSpeedChange('warp')}
                  className={`px-2.5 py-2 sm:py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex flex-col items-center justify-center active:scale-95 cursor-pointer ${
                    speedMode === 'warp'
                      ? 'bg-cyan-500 text-slate-950 font-extrabold border border-cyan-300 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-cyan-400 hover:bg-cyan-950/30 border border-cyan-900/60'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>WARP {warpFactor.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] font-normal opacity-90">{formatWarpLightSpeed(warpFactor)}</span>
                </button>
              </div>
            </div>

            {/* Dynamic Propulsion Speed / Warp Factor Slider */}
            <div className="flex flex-col gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
              {speedMode === 'warp' && (
                <div className="flex items-center justify-between gap-2.5">
                  <span className="text-xs sm:text-[11px] font-mono text-cyan-400 font-bold whitespace-nowrap">
                    WARP FACTOR:
                  </span>
                  <input
                    type="range"
                    min="1.0"
                    max="9.9"
                    step="0.1"
                    value={warpFactor}
                    onChange={(e) => {
                      const wf = parseFloat(e.target.value);
                      setWarpFactor(wf);
                      sceneHandle?.setPropulsionFactor?.('warp', (wf - 1.0) / 8.9);
                    }}
                    className={`w-full ${isMobile ? 'h-3' : 'h-2'} bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400`}
                  />
                  <span className="text-xs sm:text-[11px] font-mono text-cyan-300 font-extrabold whitespace-nowrap text-right min-w-[105px]">
                    WF {warpFactor.toFixed(1)} ({formatWarpLightSpeed(warpFactor)})
                  </span>
                </div>
              )}

              {speedMode === 'impulse' && (
                <div className="flex items-center justify-between gap-2.5">
                  <span className="text-xs sm:text-[11px] font-mono text-amber-400 font-bold whitespace-nowrap">
                    IMPULSE SPEED:
                  </span>
                  <input
                    type="range"
                    min="2.5"
                    max="75.0"
                    step="0.5"
                    value={impulseSpeed}
                    onChange={(e) => {
                      const spd = parseFloat(e.target.value);
                      setImpulseSpeed(spd);
                      sceneHandle?.setPropulsionFactor?.('impulse', (spd - 2.5) / 72.5);
                    }}
                    className={`w-full ${isMobile ? 'h-3' : 'h-2'} bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400`}
                  />
                  <span className="text-xs sm:text-[11px] font-mono text-amber-400 font-extrabold whitespace-nowrap text-right min-w-[82px]">
                    {impulseSpeed.toFixed(1)} Mm/s
                  </span>
                </div>
              )}

              {speedMode === 'sublight' && (
                <div className="flex items-center justify-between gap-2.5">
                  <span className="text-xs sm:text-[11px] font-mono text-slate-300 font-bold whitespace-nowrap">
                    THRUSTER SPEED:
                  </span>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={thrusterSpeed}
                    onChange={(e) => {
                      const spd = parseInt(e.target.value, 10);
                      setThrusterSpeed(spd);
                      sceneHandle?.setPropulsionFactor?.('sublight', (spd - 10) / 490);
                    }}
                    className={`w-full ${isMobile ? 'h-3' : 'h-2'} bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-300`}
                  />
                  <span className="text-xs sm:text-[11px] font-mono text-slate-200 font-extrabold whitespace-nowrap text-right min-w-[72px]">
                    {thrusterSpeed} km/s
                  </span>
                </div>
              )}
            </div>

            {/* 360° Turntable Controls */}
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800">
              <button
                onClick={() => {
                  const next = !autoRotate;
                  setAutoRotate(next);
                  showToast(next ? '360° TURNTABLE ACTIVE' : 'FREE CAM: DRAG FREELY IN 360°');
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all active:scale-95 cursor-pointer ${
                  autoRotate
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                <span>AUTO-ROTATE 360°</span>
              </button>

              <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">360° ORBIT:</span>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={autoRotateSpeed}
                  onChange={(e) => setAutoRotateSpeed(parseFloat(e.target.value))}
                  className={`w-16 sm:w-20 ${isMobile ? 'h-2.5' : 'h-1.5'} bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400`}
                />
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  {autoRotateSpeed.toFixed(1)}x
                </span>
              </div>
            </div>
          </div>
        );

      case 'tactical':
        return (
          <div className="w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs sm:text-[11px] font-mono text-slate-400 uppercase">
                CONDITION ALERT STATUS:
              </span>
              <div className={`grid ${isMobile ? 'grid-cols-3' : 'flex items-center'} gap-1.5`}>
                <button
                  onClick={() => handleAlertChange('normal')}
                  className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-mono font-bold border transition-all text-center active:scale-95 cursor-pointer ${
                    alertMode === 'normal'
                      ? 'bg-emerald-600 text-slate-950 border-emerald-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  NORMAL
                </button>
                <button
                  onClick={() => handleAlertChange('yellow')}
                  className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-mono font-bold border transition-all text-center active:scale-95 cursor-pointer ${
                    alertMode === 'yellow'
                      ? 'bg-amber-600 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  YELLOW
                </button>
                <button
                  onClick={() => handleAlertChange('red')}
                  className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-mono font-bold border transition-all text-center active:scale-95 cursor-pointer ${
                    alertMode === 'red'
                      ? 'bg-red-600 text-slate-950 border-red-400 animate-pulse'
                      : 'bg-slate-900 text-red-400 border-slate-800 hover:bg-red-950/20'
                  }`}
                >
                  RED ALERT
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
              <span className="text-xs sm:text-[11px] font-mono text-red-400 font-bold uppercase">
                PRIMARY WEAPONS DISCHARGE:
              </span>
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'flex items-center'} gap-2`}>
                <button
                  onClick={handleFireTorpedo}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-950 text-red-200 border border-red-700/80 hover:bg-red-900 hover:border-red-500 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-lg"
                >
                  <Crosshair className="w-4 h-4 text-red-400" />
                  <span>PHOTON TORPEDO</span>
                </button>
                <button
                  onClick={handleFirePhaser}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-950 text-amber-200 border border-amber-700/80 hover:bg-amber-900 hover:border-amber-500 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-lg"
                >
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>VENTRAL PHASERS</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'schematic':
        return (
          <div className="w-full flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-[11px] font-mono text-slate-300 font-bold">
                  DECK SEPARATION DISTANCE:
                </span>
                <span className="font-mono text-xs text-sky-400 font-bold">
                  {Math.round(explodedProgress * 100)}% EXPANDED
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedProgress}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setExplodedProgress(val);
                }}
                className={`w-full ${isMobile ? 'h-3' : 'h-1.5'} bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400`}
              />
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-2' : 'flex items-center'} gap-1.5 text-xs sm:text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800`}>
              <span className="bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 text-center">
                1. Primary Saucer
              </span>
              <span className="bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 text-center">
                2. Dorsal Neck
              </span>
              <span className="bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 text-center">
                3. Secondary Hull
              </span>
              <span className="bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 text-center">
                4. Warp Nacelles
              </span>
            </div>
          </div>
        );

      case 'cameras':
        return (
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3 sm:flex sm:items-center'} gap-1.5 w-full`}>
            {[
              { preset: 'beauty', label: 'STARFLEET SHOWCASE' },
              { preset: 'bridge', label: 'BRIDGE MODULE' },
              { preset: 'deflector', label: 'DEFLECTOR DISH' },
              { preset: 'engines', label: 'WARP NACELLES & BAY' },
              { preset: 'flyby', label: 'DEEP-SPACE FLYBY' },
              { preset: 'registry', label: 'NCC-1701 HULL CLOSE-UP', special: true },
            ].map((c) => (
              <button
                key={c.preset}
                onClick={() => handleCameraChange(c.preset as CameraPreset)}
                className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-mono font-bold transition-all border whitespace-nowrap active:scale-95 cursor-pointer text-center ${
                  c.special
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        );

      case 'livery':
        return (
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:flex sm:items-center'} gap-2 w-full`}>
            {[
              { id: 'standard', label: 'MATTE PEARL', color: '#e2e6ed', border: 'border-slate-500' },
              { id: 'classic', label: 'CONSTITUTION 1966', color: '#ebf0f7', border: 'border-slate-400' },
              { id: 'section31', label: 'SECTION 31 STEALTH', color: '#15181d', border: 'border-slate-600' },
              { id: 'wireframe', label: 'HOLO-DIAGNOSTIC', color: '#22d3ee', border: 'border-cyan-200' },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setHullFinish(l.id as HullFinish);
                  spaceAudio.playChirp('mid');
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-mono font-bold border transition-all active:scale-95 cursor-pointer ${
                  hullFinish === l.id
                    ? 'bg-slate-700 text-white border-amber-400 shadow'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full border ${l.border} flex-shrink-0`}
                  style={{ backgroundColor: l.color }}
                />
                <span className="truncate">{l.label}</span>
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 sm:p-4 overflow-hidden">
      {/* Top Header: Starship Schematics & Telemetry Badge */}
      <div className="flex items-start justify-between w-full gap-2">
        <div className="pointer-events-auto bg-slate-950/90 border border-slate-700/60 rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 shadow-2xl flex items-center gap-2 sm:gap-3.5 backdrop-blur-md">
          <div className="w-1.5 sm:w-2.5 h-7 sm:h-10 rounded-full bg-amber-500 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-mono text-xs sm:text-sm uppercase tracking-wider text-amber-400 font-extrabold truncate">
                ENTERPRISE
              </span>
              <span className="text-[10px] sm:text-[11px] bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded font-mono font-bold border border-slate-700">
                NCC-1701
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wide hidden sm:block">
              CONSTITUTION CLASS • 360° TURNTABLE
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 border-l border-slate-700/80 pl-3">
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                alertMode === 'red'
                  ? 'bg-red-950 text-red-300 border border-red-700'
                  : alertMode === 'yellow'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
              }`}
            >
              {alertMode === 'red' ? 'RED ALERT' : alertMode === 'yellow' ? 'YELLOW ALERT' : 'CONDITION GREEN'}
            </span>
          </div>
        </div>

        {/* Top-Right Quick Utilities */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          {toastMessage && (
            <div className="bg-amber-500/90 text-slate-950 font-mono text-[10px] sm:text-xs font-bold px-2 py-1 rounded shadow-lg border border-amber-400 whitespace-nowrap">
              {toastMessage}
            </div>
          )}

          {/* Brief Enterprise Velocity Readout Badge (replaces duplicate upper +/- icons) */}
          <button
            onClick={() => {
              setActiveTab('flight');
              setIsCollapsed(false);
              setIsMobileDrawerOpen(true);
              spaceAudio.playChirp('mid');
            }}
            title="Current Enterprise Speed & Propulsion Telemetry (Click to adjust)"
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              speedMode === 'warp'
                ? 'bg-cyan-950/90 border-cyan-500/70 text-cyan-300'
                : speedMode === 'impulse'
                ? 'bg-amber-950/90 border-amber-500/70 text-amber-300'
                : 'bg-slate-950/90 border-slate-700/80 text-slate-200'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 flex-shrink-0" />
            {speedMode === 'warp' && (
              <span>
                WF {warpFactor.toFixed(1)} • {formatWarpLightSpeed(warpFactor)}
              </span>
            )}
            {speedMode === 'impulse' && <span>{impulseSpeed.toFixed(1)} Mm/s</span>}
            {speedMode === 'sublight' && <span>{thrusterSpeed} km/s</span>}
          </button>

          {onEnterBridge && (
            <button
              onClick={() => {
                spaceAudio.playChirp('high');
                onEnterBridge();
              }}
              title="Zoom into Dorsal Bridge Dome & Enter 3D Bridge Interior"
              aria-label="Enter 3D Bridge Interior"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 shadow-[0_0_16px_rgba(245,179,53,0.45)] transition-all flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-mono font-extrabold cursor-pointer active:scale-95"
            >
              <Compass className="w-3.5 h-3.5 text-slate-950 flex-shrink-0" />
              <span>ENTER BRIDGE</span>
            </button>
          )}

          {onAskComputer && (
            <button
              onClick={onAskComputer}
              title="Ask Enterprise LCARS Computer"
              aria-label="Ask Computer Voice Assistant"
              className="min-w-[36px] min-h-[36px] p-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/50 hover:bg-amber-500 hover:text-black transition-colors shadow-lg flex items-center justify-center gap-1.5 text-xs font-mono font-bold cursor-pointer active:scale-95"
            >
              <Radio className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="hidden lg:inline">ASK COMPUTER</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('lighting');
              setIsCollapsed(false);
              spaceAudio.playChirp('mid');
            }}
            title="Adjust Lighting, Exposure & Contrast"
            aria-label="Lighting and Contrast Controls"
            className={`min-w-[36px] min-h-[36px] p-2 rounded-xl border text-xs font-mono font-bold transition-colors shadow-lg flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
              activeTab === 'lighting' && !isCollapsed
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
                : 'bg-slate-950/85 text-amber-400 border-slate-700/60 hover:text-amber-300'
            }`}
          >
            <Sun className="w-4 h-4 flex-shrink-0" />
            <span className="hidden lg:inline">LIGHT: {lightingPreset.toUpperCase()}</span>
          </button>

          <button
            onClick={() => {
              const next = !bloomEnabled;
              setBloomEnabled(next);
              showToast(next ? 'OPTICAL BLOOM: ON' : 'OPTICAL BLOOM: OFF');
            }}
            title={bloomEnabled ? 'Disable Optical Bloom Glow' : 'Enable Optical Bloom Glow'}
            aria-label="Toggle Bloom Glow"
            className={`min-w-[36px] min-h-[36px] p-2 rounded-xl border text-xs font-mono font-bold transition-colors shadow-lg flex items-center justify-center gap-1 active:scale-95 cursor-pointer ${
              bloomEnabled
                ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60'
                : 'bg-slate-950/85 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${bloomEnabled ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          </button>

          <button
            onClick={handleAudioToggle}
            title={isMuted ? 'Unmute Audio Engine' : 'Mute Audio Engine'}
            aria-label="Toggle Audio"
            className="min-w-[36px] min-h-[36px] p-2 rounded-xl bg-slate-950/85 border border-slate-700/60 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors shadow-lg flex items-center justify-center active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleFullscreen}
            title="Toggle Fullscreen"
            aria-label="Fullscreen View"
            className="min-w-[36px] min-h-[36px] p-2 rounded-xl bg-slate-950/85 border border-slate-700/60 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors shadow-lg flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lower-Right Floating Viewport Controls (Zoom + / - & 360° Reset) */}
      <div className="fixed right-2.5 bottom-20 z-30 pointer-events-auto flex flex-col gap-2 items-center">
        <button
          onClick={() => {
            sceneHandle?.zoomIn();
            spaceAudio.playChirp('low');
          }}
          title="Zoom In (+)"
          aria-label="Zoom In"
          className="w-10 h-10 rounded-full bg-slate-950/90 border border-slate-700/80 text-amber-400 font-extrabold text-base flex items-center justify-center shadow-2xl backdrop-blur-md active:scale-90 transition-transform cursor-pointer"
        >
          +
        </button>
        <button
          onClick={() => {
            sceneHandle?.zoomOut();
            spaceAudio.playChirp('low');
          }}
          title="Zoom Out (-)"
          aria-label="Zoom Out"
          className="w-10 h-10 rounded-full bg-slate-950/90 border border-slate-700/80 text-amber-400 font-extrabold text-base flex items-center justify-center shadow-2xl backdrop-blur-md active:scale-90 transition-transform cursor-pointer"
        >
          -
        </button>
        <button
          onClick={() => {
            sceneHandle?.resetCamera();
            spaceAudio.playChirp('low');
          }}
          title="Reset 360° View"
          aria-label="Reset 360° View"
          className="w-10 h-10 rounded-full bg-slate-950/90 border border-slate-700/80 text-slate-300 font-bold text-xs flex items-center justify-center shadow-2xl backdrop-blur-md active:scale-90 transition-transform cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Mobile Expandable Slide-Up Drawer for Sliders & Precision Controls */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-x-2 bottom-[68px] z-40 pointer-events-auto bg-slate-950/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-6 duration-200 max-h-[58vh] overflow-y-auto">
          {/* Drawer Handle & Header */}
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                {activeTab === 'lighting' && '☀️ LIGHTING & CONTRAST'}
                {activeTab === 'ortho' && '📐 ORTHOGRAPHIC VIEWS'}
                {activeTab === 'flight' && '🚀 PROPULSION & 360°'}
                {activeTab === 'tactical' && '🛡️ TACTICAL SYSTEMS'}
                {activeTab === 'schematic' && '📚 EXPLODED DECKS'}
                {activeTab === 'cameras' && '📷 CINEMATIC CAMERAS'}
                {activeTab === 'livery' && '🎨 STARSHIP LIVERY'}
              </span>
            </div>
            <button
              onClick={() => {
                setIsMobileDrawerOpen(false);
                spaceAudio.playChirp('low');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono font-bold active:scale-95 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>CLOSE</span>
            </button>
          </div>

          {/* Active Tab Body (Touch-Optimized) */}
          <div className="w-full">
            {renderTabBody(true)}
          </div>
        </div>
      )}

      {/* Mobile Compact Icon-Only Bottom Dock */}
      <div className="md:hidden fixed inset-x-2 bottom-2 z-30 pointer-events-auto bg-slate-950/95 border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-1">
        {[
          { id: 'lighting', label: 'Lighting & Contrast', icon: Sun, color: 'text-amber-400', activeBg: 'bg-amber-500 text-slate-950' },
          { id: 'ortho', label: 'Orthographic Views', icon: Compass, color: 'text-amber-400', activeBg: 'bg-amber-500 text-slate-950' },
          { id: 'flight', label: 'Warp & Propulsion', icon: Rocket, color: 'text-cyan-400', activeBg: 'bg-cyan-500 text-slate-950' },
          { id: 'tactical', label: 'Tactical & Weapons', icon: Shield, color: 'text-red-400', activeBg: 'bg-red-500 text-slate-950' },
          { id: 'schematic', label: 'Exploded Decks', icon: Layers, color: 'text-sky-400', activeBg: 'bg-sky-500 text-slate-950' },
          { id: 'cameras', label: 'Cinematic Cameras', icon: Camera, color: 'text-purple-400', activeBg: 'bg-purple-500 text-slate-950' },
          { id: 'livery', label: 'Hull Livery', icon: Palette, color: 'text-emerald-400', activeBg: 'bg-emerald-500 text-slate-950' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && isMobileDrawerOpen;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (activeTab === tab.id && isMobileDrawerOpen) {
                  setIsMobileDrawerOpen(false);
                } else {
                  setActiveTab(tab.id as ActiveTab);
                  setIsMobileDrawerOpen(true);
                }
                spaceAudio.playChirp('mid');
              }}
              title={tab.label}
              aria-label={tab.label}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center rounded-xl transition-all active:scale-90 cursor-pointer relative ${
                isActive
                  ? `${tab.activeBg} shadow-lg font-bold`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-5 h-5" />
              {activeTab === tab.id && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${isActive ? 'bg-slate-950' : 'bg-amber-400'}`} />
              )}
            </button>
          );
        })}

        {/* Capture Snapshot Button */}
        <button
          onClick={handleScreenshot}
          title="Capture High-Res Image"
          aria-label="Capture High-Res Image"
          className="min-h-[44px] px-2.5 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-700/80 text-amber-400 active:scale-90 transition-transform cursor-pointer"
        >
          <SnapshotIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Unified LCARS Control Dock */}
      <div
        className={`hidden md:flex pointer-events-auto w-full max-w-[940px] mx-auto transition-transform duration-300 ease-out flex-col items-center ${
          isCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse Drawer Bar */}
        <button
          onClick={() => {
            setIsCollapsed(!isCollapsed);
            spaceAudio.playChirp('low');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1 rounded-t-lg bg-slate-950/90 border-t border-x border-slate-700/70 text-slate-400 hover:text-amber-400 font-mono text-[11px] transition-colors shadow-md cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>EXPAND SCHEMATICS & BRIDGE CONTROLS</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              <span>COLLAPSE HUD (ZEN 360° VIEW)</span>
            </>
          )}
        </button>

        {/* Main Dock Container */}
        <div className="w-full bg-slate-950/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
          {/* LCARS Nav Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5 gap-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('lighting');
                  spaceAudio.playChirp('mid');
                }}
                title="Lighting, Exposure & Contrast Calibration"
                aria-label="Lighting and Contrast"
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer ${
                  activeTab === 'lighting'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Sun className="w-4 h-4 flex-shrink-0" />
                <span>LIGHTING & CONTRAST</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('ortho');
                  spaceAudio.playChirp('mid');
                }}
                title="Orthographic Views & Subsystem Hotspots"
                aria-label="Orthographic Views"
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer ${
                  activeTab === 'ortho'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Compass className="w-4 h-4 flex-shrink-0" />
                <span>ORTHOGRAPHIC</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('flight');
                  spaceAudio.playChirp('mid');
                }}
                title="Flight Speeds & 360° Turntable Controls"
                aria-label="Flight and 360 Turntable"
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer ${
                  activeTab === 'flight'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Rocket className="w-4 h-4 flex-shrink-0" />
                <span>FLIGHT & 360°</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('tactical');
                  spaceAudio.playChirp('mid');
                }}
                title="Tactical Alert & Weapons Discharge"
                aria-label="Tactical and Weapons"
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer ${
                  activeTab === 'tactical'
                    ? 'bg-red-500 text-slate-950 shadow-md shadow-red-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>TACTICAL</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('schematic');
                  spaceAudio.playChirp('mid');
                }}
                title="Exploded Decks Separation"
                aria-label="Exploded Decks"
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer ${
                  activeTab === 'schematic'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Layers className="w-4 h-4 flex-shrink-0" />
                <span>EXPLODED DECKS</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('cameras');
                  spaceAudio.playChirp('mid');
                }}
                title="Cinematic Camera Angles"
                aria-label="Cinematic Camera Angles"
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer ${
                  activeTab === 'cameras'
                    ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Camera className="w-4 h-4 flex-shrink-0" />
                <span>CINEMATIC</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('livery');
                  spaceAudio.playChirp('mid');
                }}
                title="Starship Livery & Hull Finishes"
                aria-label="Hull Finish"
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer ${
                  activeTab === 'livery'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Palette className="w-4 h-4 flex-shrink-0" />
                <span>FINISH</span>
              </button>
            </div>

            <button
              onClick={handleScreenshot}
              title="Capture 3D Render"
              aria-label="Capture 3D Image"
              className="flex items-center justify-center gap-1.5 text-xs font-mono text-slate-300 hover:text-amber-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0 active:scale-95 cursor-pointer"
            >
              <SnapshotIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>CAPTURE</span>
            </button>
          </div>

          {/* Active Tab Body for Desktop */}
          <div className="min-h-[58px] flex items-center">
            {renderTabBody(false)}
          </div>
        </div>
      </div>
    </div>
  );
};
