import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  BookOpen, 
  Radio, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Sparkles, 
  Compass, 
  Menu, 
  X,
  Music,
  Square,
  Play,
  Layers,
  Wind,
  Sliders,
  RotateCcw,
  Zap,
  Award
} from 'lucide-react';
import { EnterpriseScene, SceneHandle } from './components/EnterpriseScene';
import { LCARSInterface } from './components/LCARSInterface';
import { AlertMode, HullFinish } from './models/enterpriseModel';
import { spaceAudio } from './audio/spaceAudio';
import { ScienceDatabaseView } from './components/ScienceDatabaseView';
import { StarTrekCanonView } from './components/StarTrekCanonView';
import { BridgeSimulationView } from './components/BridgeSimulationView';
import { ExhibitionTours } from './components/ExhibitionTours';
import { AskComputerVoiceModal } from './components/AskComputerVoiceModal';
import { AstrometricsWarpLab } from './components/AstrometricsWarpLab';
import { StarfleetAcademyExam } from './components/StarfleetAcademyExam';
import { LcarsSoundboardModal } from './components/LcarsSoundboardModal';
import { lcarsAudio, ThemePlayerState } from './utils/lcarsAudio';
import { speechController } from './utils/speechController';

export type MainNavTab = 'enterprise' | 'astrometrics' | 'academy' | 'science' | 'canon' | 'bridge' | 'tours';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainNavTab>('enterprise');
  const [isSoundboardOpen, setIsSoundboardOpen] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [themeState, setThemeState] = useState<ThemePlayerState>(lcarsAudio.getThemeState());
  const [showSongControls, setShowSongControls] = useState<boolean>(false);
  const [isHumPlaying, setIsHumPlaying] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [redAlertActive, setRedAlertActive] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Quick Live AI Voice Assistant Modal
  const [isAskComputerOpen, setIsAskComputerOpen] = useState<boolean>(false);
  const [askComputerTopic, setAskComputerTopic] = useState<string>('');

  // 3D Enterprise Flight Simulation State (Movie-Accurate Model from Shivam180709/Enterprise-Model)
  const [sceneHandle, setSceneHandle] = useState<SceneHandle | null>(null);
  const [speedMode, setSpeedMode] = useState<'sublight' | 'impulse' | 'warp'>('impulse');
  const [hullFinish, setHullFinish] = useState<HullFinish>('standard');
  const [explodedProgress, setExplodedProgress] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState<number>(0.8);
  const [bloomEnabled, setBloomEnabled] = useState<boolean>(true);
  const [exposure, setExposure] = useState<number>(0.80);
  const [lightIntensity, setLightIntensity] = useState<number>(0.75);
  const [ambientFill, setAmbientFill] = useState<number>(0.12);
  const [contrast, setContrast] = useState<number>(1.0);
  const [lightingPreset, setLightingPreset] = useState<'cinematic' | 'deepspace' | 'drydock' | 'solar'>('cinematic');
  const [isEnteringBridge, setIsEnteringBridge] = useState<boolean>(false);

  const handleEnterBridge = () => {
    if (isEnteringBridge) return;
    setAutoRotate(false);
    sceneHandle?.setCameraPreset('bridge');
    setIsEnteringBridge(true);
    lcarsAudio.playChime();
    window.setTimeout(() => {
      setIsEnteringBridge(false);
      setCurrentTab('bridge');
    }, 650);
  };

  const handleLightingPresetChange = (preset: 'cinematic' | 'deepspace' | 'drydock' | 'solar') => {
    setLightingPreset(preset);
    switch (preset) {
      case 'cinematic':
        setExposure(0.80);
        setLightIntensity(0.75);
        setAmbientFill(0.12);
        setContrast(1.0);
        break;
      case 'deepspace':
        setExposure(0.68);
        setLightIntensity(0.65);
        setAmbientFill(0.06);
        setContrast(1.18);
        break;
      case 'drydock':
        setExposure(0.88);
        setLightIntensity(0.60);
        setAmbientFill(0.28);
        setContrast(0.95);
        break;
      case 'solar':
        setExposure(1.00);
        setLightIntensity(0.95);
        setAmbientFill(0.20);
        setContrast(1.10);
        break;
    }
  };

  // Live Time & Stardate
  const [currentTime, setCurrentTime] = useState<string>('08:42:12');
  const [currentDate, setCurrentDate] = useState<string>('2026.OCT.14 • STARDATE 47634.4');
  const [speechRate, setSpeechRate] = useState<number>(speechController.getSpeechRate());

  // Track global speech state and speed
  useEffect(() => {
    const unsubscribeSpeech = speechController.subscribe((speaking) => {
      setIsAiSpeaking(speaking);
    });
    const unsubscribeRate = speechController.subscribeRate((rate) => {
      setSpeechRate(rate);
    });
    return () => {
      unsubscribeSpeech();
      unsubscribeRate();
    };
  }, []);

  // Track theme song state (Playing, Paused, Time, Duration, Volume)
  useEffect(() => {
    const unsubscribe = lcarsAudio.subscribeTheme((state) => {
      setThemeState(state);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setCurrentTime(timeStr);

      const year = now.getFullYear();
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const m = monthNames[now.getMonth()];
      const d = now.getDate();
      const startOfYear = new Date(year, 0, 1).getTime();
      const frac = (now.getTime() - startOfYear) / (365.25 * 24 * 3600 * 1000);
      const sd = (40000 + (year - 2364) * 1000 + frac * 1000).toFixed(1);
      setCurrentDate(`${year}.${m}.${d} • STARDATE ${sd}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab: MainNavTab) => {
    speechController.stopAllSpeech(); // Silence speech when switching screens
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    lcarsAudio.playBeep(920, 0.05);
  };

  const handleOpenAskComputer = (topic?: string) => {
    setAskComputerTopic(topic || '');
    setIsAskComputerOpen(true);
    lcarsAudio.playChime();
  };

  const toggleSound = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    lcarsAudio.setMasterMute(nextMuted);
    if (nextMuted) {
      setIsHumPlaying(false);
    }
  };

  // Star Trek Theme Song Fanfare Player (Play -> Pause -> Resume from paused position)
  const toggleThemeSong = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      lcarsAudio.enabled = true;
    }
    lcarsAudio.toggleStarfleetTheme();
  };

  // Warp Core Engine Hum Player
  const toggleEngineHum = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      lcarsAudio.enabled = true;
    }
    const playing = lcarsAudio.toggleEngineHum();
    setIsHumPlaying(playing);
    if (playing) {
      lcarsAudio.playChime();
    }
  };

  const handlePauseAiVoice = () => {
    speechController.stopAllSpeech();
    lcarsAudio.playBeep(440, 0.05);
  };

  const handleToggleRedAlert = (active: boolean) => {
    setRedAlertActive(active);
    lcarsAudio.toggleRedAlert(active);
    spaceAudio.setAlertKlaxon(active);
  };

  // Keyboard navigation shortcuts for bridge officers & 3D orbital viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isAskComputerOpen ||
        isSoundboardOpen ||
        currentTab !== 'enterprise'
      ) {
        return;
      }
      switch (e.key.toLowerCase()) {
        case 't':
          spaceAudio.playPhotonTorpedo();
          sceneHandle?.fireTorpedo();
          break;
        case ' ':
          e.preventDefault();
          spaceAudio.playPhaserPulse();
          sceneHandle?.firePhaser();
          break;
        case 'w':
          setSpeedMode((prev) => {
            const next = prev === 'warp' ? 'impulse' : 'warp';
            spaceAudio.setWarpSpeed(next === 'warp');
            return next;
          });
          break;
        case 'r':
          handleToggleRedAlert(!redAlertActive);
          break;
        case '+':
        case '=':
          sceneHandle?.zoomIn();
          break;
        case '-':
        case '_':
          sceneHandle?.zoomOut();
          break;
        case '0':
          sceneHandle?.resetCamera();
          break;
        case '1':
          sceneHandle?.setCameraPreset('beauty');
          break;
        case '2':
          sceneHandle?.setCameraPreset('bridge');
          break;
        case '3':
          sceneHandle?.setCameraPreset('deflector');
          break;
        case '4':
          sceneHandle?.setCameraPreset('engines');
          break;
        case '5':
          sceneHandle?.setCameraPreset('flyby');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sceneHandle, isAskComputerOpen, isSoundboardOpen, currentTab, redAlertActive]);

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col bg-black text-[#f6e6b4] select-none font-sans relative ${
      redAlertActive ? 'red-alert-glow' : ''
    }`}>
      {/* Soft Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 bg-[radial-gradient(ellipse_at_center,_transparent_70%,_rgba(0,0,0,0.6)_100%)]" />

      {/* TOP HEADER / LCARS BANNER */}
      <header className="flex-shrink-0 z-40 bg-[#0c0d15] border-b-2 border-[#f5b335] shadow-lg">
        <div className="flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2">
          {/* Left Brand / LCARS Graphic Accent */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 sm:w-4 h-8 sm:h-9 bg-[#f5b335] rounded-l-md" />
              <div className="w-8 sm:w-16 h-8 sm:h-9 bg-[#e8732a] flex items-center justify-center">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-black tracking-tighter">
                  1701-D
                </span>
              </div>
              <div className="w-4 sm:w-8 h-8 sm:h-9 bg-[#3366cc]" />
            </div>

            {/* Mobile Navigation Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 bg-[#181822] text-[#f5b335] border border-[#f5b335]/40 rounded cursor-pointer"
              title="Toggle LCARS Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="leading-tight">
              <h1 className="text-xs sm:text-xl lg:text-2xl font-bold uppercase tracking-wider text-[#f5b335] lcars-title truncate">
                <span className="sm:hidden">STARFLEET 3D</span>
                <span className="hidden sm:inline">STARFLEET SCIENCE TERMINAL</span>
              </h1>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-2 font-mono flex-nowrap">
            {/* Prominent Global PAUSE AI VOICE Button */}
            {isAiSpeaking && (
              <button
                onClick={handlePauseAiVoice}
                title="Pause AI Voice Output"
                className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] sm:text-[11px] uppercase rounded-full animate-pulse shadow-lg cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current flex-shrink-0" />
                <span className="hidden sm:inline">PAUSE AI VOICE</span>
              </button>
            )}

            {/* Star Trek Theme Player & Controls */}
            <div className="relative flex items-center">
              {/* Main Song Toggle Button (Play -> Pause -> Resume from paused position) */}
              <button
                onClick={toggleThemeSong}
                title={
                  themeState.isPlaying
                    ? 'Pause "Enterprising Young Men" (Star Trek Theme)'
                    : themeState.isPaused
                    ? `Resume "Enterprising Young Men" from ${formatAudioTime(themeState.currentTime)}`
                    : 'Play "Enterprising Young Men" (Star Trek Theme Song)'
                }
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] uppercase font-bold rounded-l-full transition-all cursor-pointer ${
                  themeState.isPlaying
                    ? 'bg-[#f5b335] text-black shadow-md shadow-orange-500/40 animate-pulse'
                    : themeState.isPaused
                    ? 'bg-[#292212] text-[#f5b335] border-y border-l border-[#f5b335]'
                    : 'bg-[#181824] text-[#f6e6b4] hover:bg-[#252538] border-y border-l border-[#f5b335]/30'
                }`}
              >
                <Music className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">
                  {themeState.isPlaying
                    ? `PAUSE (${formatAudioTime(themeState.currentTime)}) ❚❚`
                    : themeState.isPaused
                    ? `RESUME (${formatAudioTime(themeState.currentTime)}) ▶`
                    : 'SONG ▶'}
                </span>
                {themeState.isPlaying && (
                  <span className="sm:hidden text-[9px] font-mono font-bold">❚❚</span>
                )}
                {themeState.isPaused && (
                  <span className="sm:hidden text-[9px] font-mono font-bold">▶</span>
                )}
              </button>

              {/* Small Option Button to open Volume, Replay, and 38s Jump options */}
              <button
                onClick={() => setShowSongControls((prev) => !prev)}
                title="Adjust Volume, Replay, or Jump to 38s Fanfare (Enterprising Young Men)"
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 text-[10px] uppercase font-bold rounded-r-full border-y border-r border-[#f5b335]/50 transition-all cursor-pointer ${
                  showSongControls
                    ? 'bg-[#f5b335] text-black'
                    : 'bg-[#12131f] hover:bg-[#202235] text-[#f5b335]'
                }`}
              >
                <Sliders className="w-3 h-3 flex-shrink-0" />
                <span className="text-[9px] font-mono hidden sm:inline">OPTS</span>
              </button>

              {/* Starfleet FX Soundboard Button */}
              <button
                onClick={() => {
                  setIsSoundboardOpen(true);
                  lcarsAudio.playChime();
                }}
                title="Open Starfleet LCARS Sound FX Board"
                className="flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-[#161828] hover:bg-[#222640] text-[#38bdf8] border border-[#38bdf8]/40 transition-all cursor-pointer shadow ml-1"
              >
                <Radio className="w-3 h-3 text-[#38bdf8] flex-shrink-0" />
                <span className="text-[9px] font-mono font-bold hidden sm:inline">SFX</span>
              </button>

              {/* LCARS Audio Control Popover */}
              {showSongControls && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-84 bg-[#0a0b12] border-2 border-[#f5b335] rounded-xl shadow-2xl p-3 z-50 font-mono space-y-3 backdrop-blur-md">
                  {/* Popover Header */}
                  <div className="border-b border-[#f5b335]/30 pb-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-[#f5b335] font-bold uppercase tracking-wider">
                        <Music className="w-3.5 h-3.5" />
                        <span>ENTERPRISING YOUNG MEN</span>
                      </div>
                      <button
                        onClick={() => setShowSongControls(false)}
                        className="p-0.5 text-gray-400 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[9px] text-[#f6e6b4]/70 pl-5">
                      STAR TREK OST // MICHAEL GIACCHINO
                    </div>
                  </div>

                  {/* Scrubber / Timeline */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-gray-300">
                      <span className="text-[#f5b335] font-bold">
                        {formatAudioTime(themeState.currentTime)}
                      </span>
                      <span>
                        {formatAudioTime(themeState.duration)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={themeState.duration || 105.6}
                      step="0.5"
                      value={themeState.currentTime}
                      onChange={(e) => lcarsAudio.seekTheme(parseFloat(e.target.value))}
                      className="w-full accent-[#f5b335] cursor-pointer h-1.5 bg-[#181a28] rounded-lg"
                    />
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Play from 38 Seconds (Heroic Fanfare) */}
                    <button
                      onClick={() => {
                        lcarsAudio.playThemeFrom38s();
                      }}
                      className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-gradient-to-r from-[#e8732a] to-[#f5b335] text-black font-bold text-[11px] rounded-lg shadow uppercase hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black" />
                      <span>PLAY FROM 38s (MAIN FANFARE)</span>
                    </button>

                    {/* Replay from Start */}
                    <button
                      onClick={() => {
                        lcarsAudio.replayTheme();
                      }}
                      className="flex items-center justify-center gap-1 py-1 px-2 bg-[#141525] hover:bg-[#20223a] text-[#f6e6b4] border border-[#f5b335]/30 font-bold text-[10px] rounded-lg uppercase transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-[#f5b335]" />
                      <span>REPLAY (0:00)</span>
                    </button>

                    {/* Toggle Play / Pause */}
                    <button
                      onClick={toggleThemeSong}
                      className={`flex items-center justify-center gap-1 py-1 px-2 font-bold text-[10px] rounded-lg uppercase transition-all cursor-pointer ${
                        themeState.isPlaying
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow'
                          : 'bg-[#f5b335] hover:bg-[#ffbe4d] text-black shadow'
                      }`}
                    >
                      {themeState.isPlaying ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>PAUSE</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>{themeState.isPaused ? 'RESUME' : 'PLAY'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Volume Slider & Presets */}
                  <div className="space-y-1.5 pt-1 border-t border-white/10">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-[#f5b335]">
                        <Volume2 className="w-3 h-3" />
                        <span>VOLUME:</span>
                      </span>
                      <span className="text-[#f6e6b4] font-bold">
                        {Math.round(themeState.volume * 100)}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={themeState.volume}
                      onChange={(e) => lcarsAudio.setThemeVolume(parseFloat(e.target.value))}
                      className="w-full accent-[#f5b335] cursor-pointer h-1.5 bg-[#181a28] rounded-lg"
                    />

                    {/* Quick Volume Presets */}
                    <div className="flex items-center justify-between gap-1 text-[9px]">
                      {[
                        { label: '25%', val: 0.25 },
                        { label: '50%', val: 0.5 },
                        { label: '75%', val: 0.75 },
                        { label: '100%', val: 1.0 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => lcarsAudio.setThemeVolume(preset.val)}
                          className={`flex-1 py-0.5 rounded border transition-colors cursor-pointer ${
                            Math.abs(themeState.volume - preset.val) < 0.04
                              ? 'bg-[#f5b335] text-black border-[#f5b335] font-bold'
                              : 'bg-[#12131f] text-gray-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Speech Cadence / Speed Controls */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-[#f5b335]">
                        <Sparkles className="w-3 h-3 text-[#f5b335]" />
                        <span>AI VOICE SPEED:</span>
                      </span>
                      <span className="text-[#f6e6b4] font-bold">
                        {speechRate}x {speechRate === 1.15 ? '(FAST)' : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[9px]">
                      {[
                        { label: '1.0x', val: 1.0 },
                        { label: '1.15x (FAST)', val: 1.15 },
                        { label: '1.25x', val: 1.25 },
                        { label: '1.5x', val: 1.5 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            speechController.setSpeechRate(preset.val);
                            lcarsAudio.playBeep(640, 0.05);
                          }}
                          className={`flex-1 py-1 rounded border transition-colors cursor-pointer text-center ${
                            Math.abs(speechRate - preset.val) < 0.04
                              ? 'bg-[#f5b335] text-black border-[#f5b335] font-bold shadow'
                              : 'bg-[#12131f] text-gray-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Warp Core Ambient Engine Hum */}
            <button
              onClick={toggleEngineHum}
              title="Toggle Starship Warp Core Hum"
              className={`hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] sm:text-[11px] uppercase font-bold rounded-full transition-all cursor-pointer ${
                isHumPlaying
                  ? 'bg-[#3399cc] text-black shadow'
                  : 'bg-[#141520] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              <Wind className="w-3 h-3" />
              <span>HUM: {isHumPlaying ? 'ON' : 'OFF'}</span>
            </button>

            {/* Real-Time AI Computer Voice Button */}
            <button
              onClick={() => handleOpenAskComputer()}
              title="Ask Starfleet LCARS AI Computer"
              className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-[#e8732a] hover:bg-[#f5b335] text-black font-bold text-[10px] sm:text-[11px] uppercase rounded-full shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">ASK AI</span>
            </button>

            {/* Red Alert Klaxon */}
            <button
              onClick={() => handleToggleRedAlert(!redAlertActive)}
              title="Toggle Red Alert"
              className={`p-1 rounded transition-all cursor-pointer ${
                redAlertActive
                  ? 'bg-red-600 text-white animate-pulse shadow-red-500/50'
                  : 'bg-[#181822] text-red-500 border border-red-500/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>

            {/* Master Sound Mute */}
            <button
              onClick={toggleSound}
              title={isAudioMuted ? 'Unmute All Audio' : 'Mute All Audio & Speech'}
              className={`p-1 rounded border transition-colors cursor-pointer ${
                isAudioMuted
                  ? 'bg-red-950 text-red-400 border-red-500/40'
                  : 'bg-[#181822] text-[#f6e6b4] border-white/10 hover:bg-[#252538]'
              }`}
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY: LCARS SPLIT SCREEN */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP LEFT SIDEBAR NAVIGATION */}
        <aside className="hidden md:flex w-56 lg:w-64 flex-col bg-[#0b0c14] border-r-2 border-[#3366cc] p-3 space-y-3 z-20 flex-shrink-0 select-none">
          <div className="bg-[#121422] p-2.5 rounded-lg border-l-4 border-[#f5b335] font-mono">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">
              SYSTEM TIME
            </div>
            <div className="text-sm font-bold text-[#f5b335]">{currentTime}</div>
            <div className="text-[10px] text-gray-400 mt-1">{currentDate}</div>
          </div>

          {/* Navigation Buttons */}
          <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto">
            <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 px-1 pt-1">
              PRIMARY SYSTEMS
            </div>

            {[
              { id: 'enterprise', label: 'USS ENTERPRISE 3D', icon: Rocket, color: '#f5b335' },
              { id: 'astrometrics', label: 'ASTROMETRICS & WARP', icon: Compass, color: '#38bdf8' },
              { id: 'academy', label: 'STARFLEET ACADEMY', icon: Award, color: '#f59e0b' },
              { id: 'science', label: 'SCIENCE DATABASE', icon: BookOpen, color: '#e8732a' },
              { id: 'canon', label: 'STAR TREK CANON', icon: Layers, color: '#3366cc' },
              { id: 'bridge', label: 'BRIDGE SIMULATION', icon: Radio, color: '#cc6699' },
              { id: 'tours', label: 'EXHIBITION TOURS', icon: Music, color: '#f5b335' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id as MainNavTab)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#f5b335] text-black shadow-lg translate-x-1'
                      : 'bg-[#12131e] text-[#f6e6b4] hover:bg-[#1e2030] hover:text-white border border-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* AI Guide Shortcut */}
          <button
            onClick={() => handleOpenAskComputer()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-[#e8732a] to-[#f5b335] text-black font-mono font-bold text-xs uppercase rounded-lg shadow-lg hover:brightness-110 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>ASK COMPUTER (AI)</span>
          </button>
        </aside>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col p-4 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#f5b335]">
              <span className="text-xs font-mono font-bold text-[#f5b335] uppercase">
                LCARS NAVIGATION CONSOLE
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {[
              { id: 'enterprise', label: 'USS ENTERPRISE 3D' },
              { id: 'astrometrics', label: 'ASTROMETRICS & WARP' },
              { id: 'academy', label: 'STARFLEET ACADEMY' },
              { id: 'science', label: 'SCIENCE DATABASE' },
              { id: 'canon', label: 'STAR TREK CANON' },
              { id: 'bridge', label: 'BRIDGE SIMULATION' },
              { id: 'tours', label: 'EXHIBITION TOURS' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id as MainNavTab)}
                className={`py-2.5 px-4 rounded text-left font-mono font-bold text-xs uppercase cursor-pointer ${
                  currentTab === t.id
                    ? 'bg-[#f5b335] text-black shadow'
                    : 'bg-[#121422] text-[#f6e6b4]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* MAIN VIEWPORT CONTAINER */}
        <main className="flex-1 flex flex-col overflow-hidden bg-black relative">
          {/* Mobile Horizontal Quick-Tab Bar (Compact 26px Bar with Icons) */}
          <div className="flex md:hidden overflow-x-auto gap-1 px-1.5 py-1 bg-[#0a0b12] border-b border-white/10 z-10 no-scrollbar">
            {[
              { id: 'enterprise', label: '3D SHIP', icon: Rocket },
              { id: 'astrometrics', label: 'WARP LAB', icon: Compass },
              { id: 'academy', label: 'ACADEMY', icon: Award },
              { id: 'science', label: 'SCIENCE', icon: BookOpen },
              { id: 'canon', label: 'CANON', icon: Layers },
              { id: 'bridge', label: 'BRIDGE', icon: Radio },
              { id: 'tours', label: 'TOURS', icon: Music },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = currentTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTabChange(t.id as MainNavTab)}
                  className={`flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase whitespace-nowrap rounded font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#f5b335] text-black shadow'
                      : 'text-[#f6e6b4]/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-hidden relative">
            {currentTab === 'enterprise' && (
              <div className="relative w-full h-full overflow-hidden select-none bg-[#020306]">
                {/* Movie-Accurate 3D Enterprise Scene with Free 360 OrbitControls & Cinematic Lighting */}
                <EnterpriseScene
                  onSceneReady={setSceneHandle}
                  alertMode={redAlertActive ? 'red' : 'normal'}
                  speedMode={speedMode}
                  hullFinish={hullFinish}
                  explodedProgress={explodedProgress}
                  autoRotate={autoRotate}
                  autoRotateSpeed={autoRotateSpeed}
                  bloomEnabled={bloomEnabled}
                  exposure={exposure}
                  lightIntensity={lightIntensity}
                  ambientFill={ambientFill}
                  contrast={contrast}
                />
                {/* LCARS Schematics, Lighting & Contrast Controllers, and 360 Orbit HUD */}
                <LCARSInterface
                  sceneHandle={sceneHandle}
                  alertMode={redAlertActive ? 'red' : 'normal'}
                  setAlertMode={(m) => {
                    handleToggleRedAlert(m === 'red');
                  }}
                  speedMode={speedMode}
                  setSpeedMode={setSpeedMode}
                  hullFinish={hullFinish}
                  setHullFinish={setHullFinish}
                  explodedProgress={explodedProgress}
                  setExplodedProgress={setExplodedProgress}
                  autoRotate={autoRotate}
                  setAutoRotate={setAutoRotate}
                  autoRotateSpeed={autoRotateSpeed}
                  setAutoRotateSpeed={setAutoRotateSpeed}
                  bloomEnabled={bloomEnabled}
                  setBloomEnabled={setBloomEnabled}
                  exposure={exposure}
                  setExposure={setExposure}
                  lightIntensity={lightIntensity}
                  setLightIntensity={setLightIntensity}
                  ambientFill={ambientFill}
                  setAmbientFill={setAmbientFill}
                  contrast={contrast}
                  setContrast={setContrast}
                  lightingPreset={lightingPreset}
                  setLightingPreset={handleLightingPresetChange}
                  onAskComputer={handleOpenAskComputer}
                  onEnterBridge={handleEnterBridge}
                />

                {/* Cinematic Dorsal Bridge Zoom Transition Overlay */}
                {isEnteringBridge && (
                  <div className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center bg-sky-950/35 backdrop-blur-[2px] animate-pulse">
                    <div className="px-5 py-3 rounded-2xl bg-slate-950/90 border-2 border-[#f5b335] shadow-[0_0_35px_rgba(245,179,53,0.5)] text-center font-mono">
                      <div className="text-[10px] tracking-[0.25em] text-cyan-400 uppercase font-bold">
                        DECK 1 • DORSAL DOME TURBOLIFT
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-[#f5b335] tracking-wider mt-0.5">
                        ENTERING MAIN BRIDGE...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentTab === 'astrometrics' && (
              <AstrometricsWarpLab onAskComputer={handleOpenAskComputer} />
            )}

            {currentTab === 'academy' && (
              <StarfleetAcademyExam onAskComputer={handleOpenAskComputer} />
            )}

            {currentTab === 'science' && (
              <ScienceDatabaseView onAskComputer={handleOpenAskComputer} />
            )}

            {currentTab === 'canon' && (
              <StarTrekCanonView onAskComputer={handleOpenAskComputer} />
            )}

            {currentTab === 'bridge' && (
              <BridgeSimulationView
                redAlertActive={redAlertActive}
                onToggleRedAlert={handleToggleRedAlert}
                onAskComputer={handleOpenAskComputer}
                onExitBridge={() => handleTabChange('enterprise')}
              />
            )}

            {currentTab === 'tours' && (
              <ExhibitionTours
                onAskComputer={handleOpenAskComputer}
                onExecuteCommand={(cmd) => {
                  if (cmd.includes('nacelles') || cmd.includes('warp') || cmd.includes('engineering') || cmd.includes('deflector') || cmd.includes('saucer')) {
                    handleTabChange('enterprise');
                  }
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Real-time Streaming Voice Assistant Modal */}
      <AskComputerVoiceModal
        isOpen={isAskComputerOpen}
        onClose={() => setIsAskComputerOpen(false)}
        initialTopic={askComputerTopic}
      />

      {/* Starfleet LCARS Sound FX Board Modal */}
      <LcarsSoundboardModal
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
      />
    </div>
  );
}
