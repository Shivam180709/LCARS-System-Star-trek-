import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  AlertTriangle,
  Compass,
  Radio,
  Shield,
  Award,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Flame,
  Crosshair,
  ChevronDown,
  ChevronUp,
  Eye,
  Rocket,
  Sliders,
  Volume2,
  UserCheck,
  ArrowRightCircle,
  X,
} from 'lucide-react';
import {
  createBridgeInteriorModel,
  BridgeInteriorController,
  BridgeStationId,
} from '../models/bridgeInteriorModel';
import { spaceAudio } from '../audio/spaceAudio';
import { lcarsAudio } from '../utils/lcarsAudio';

interface BridgeSimulationProps {
  onAskComputer?: (topic: string) => void;
  redAlertActive: boolean;
  onToggleRedAlert: (active: boolean) => void;
  onExitBridge?: () => void;
}

interface CrewAdvisoryEvent {
  id: string;
  station: BridgeStationId;
  officer: string;
  role: string;
  color: string;
  badgeBg: string;
  message: string;
  orderActionLabel: string;
  orderConfirmation: string;
}

const BRIDGE_ADVISORY_EVENTS: CrewAdvisoryEvent[] = [
  {
    id: 'klingon_attack',
    station: 'tactical',
    officer: 'LT. CMDR. SCOTT / TACTICAL',
    role: 'DEFENSE & WEAPONS',
    color: 'text-red-400',
    badgeBg: 'bg-red-950/90 border-red-500/70',
    message: 'Captain! Klingon D7 Battlecruiser decloaking off starboard bow — locking disruptors on our hull!',
    orderActionLabel: 'MODULATE SHIELDS & FIRE PHASERS',
    orderConfirmation: 'AYE CAPTAIN! Shields modulated to 648.2 MHz — firing ventral phaser banks!',
  },
  {
    id: 'tachyon_anomaly',
    station: 'science',
    officer: 'CMDR. SPOCK',
    role: 'CHIEF SCIENCE OFFICER',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/90 border-cyan-500/70',
    message: 'Captain, sensors detect a quantum subspace anomaly ahead. Recommend multi-spectral scan.',
    orderActionLabel: 'CALIBRATE SENSORS & SCAN',
    orderConfirmation: 'Fascinating, Captain. Subspace spectrometer calibrated — anomaly is a gravimetric lens.',
  },
  {
    id: 'distress_hail',
    station: 'comms',
    officer: 'LT. NYOTA UHURA',
    role: 'COMMUNICATIONS OFFICER',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/90 border-emerald-500/70',
    message: 'Captain! Receiving an encrypted subspace transmission from Outpost 4 on 42.8 GHz.',
    orderActionLabel: 'ALIGN WAVEFORM & DECODE',
    orderConfirmation: 'Hailing frequencies clear, Captain! Universal Translator has decoded the Starfleet message.',
  },
  {
    id: 'course_correction',
    station: 'helm',
    officer: 'LT. HIKARU SULU',
    role: 'CHIEF HELMSMAN',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/90 border-amber-500/70',
    message: 'Captain, ion storm eddy detected along flight path. Recommend heading 215° Mark +12 at Warp 4.5.',
    orderActionLabel: 'EXECUTE HELM MANEUVER',
    orderConfirmation: 'Aye sir! Coming about to 215° Mark +12, engaging Warp Factor 4.5!',
  },
];

const SCIENCE_EXHIBITION_FACTS = [
  {
    title: 'REAL ALCUBIERRE WARP METRIC (1994)',
    body: 'Physicist Miguel Alcubierre proved Einstein’s field equations permit faster-than-light travel by contracting spacetime ahead of a vessel and expanding it behind, keeping the ship inside a flat "warp bubble" without violating local light-speed limits.',
    topic: 'Explain how Miguel Alcubierre Warp Drive works in real general relativity',
  },
  {
    title: 'SPECTROSCOPY & EXOPLANET ATMOSPHERES',
    body: 'Just like Spock’s Science Console spectrometer, NASA’s James Webb Space Telescope analyzes starlight passing through exoplanet atmospheres—identifying water vapor, CO₂, and methane from absorption lines.',
    topic: 'How does NASA use spectroscopy to study exoplanet atmospheres like Spock sensor station?',
  },
  {
    title: 'MATTER-ANTIMATTER ANNIHILATION (E = mc²)',
    body: 'The Enterprise warp core reacts deuterium (matter) with antideuterium (antimatter). In real particle physics at CERN, matter-antimatter annihilation converts 100% of rest mass into high-energy gamma photons—10 billion times more energy-dense than chemical rockets.',
    topic: 'How does matter antimatter annihilation work in physics?',
  },
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const CADET_QUIZ: QuizQuestion[] = [
  {
    question: 'In real physics, why is faster-than-light travel through flat space prohibited?',
    options: [
      'Relativistic mass and required acceleration energy approach infinity as velocity approaches c',
      'The speed of light only applies to radio waves, not solid matter',
      'Quantum entanglement absorbs all kinetic energy in vacuum',
      'Cosmic friction slows down all starships',
    ],
    correctIdx: 0,
    explanation: 'Einstein’s Special Relativity proves accelerating mass to light speed requires infinite energy: E = γmc².',
  },
  {
    question: 'How does the James Webb Space Telescope scan alien worlds like Spock’s Science Console?',
    options: [
      'Subspace tachyon beams',
      'Transmission spectroscopy of starlight passing through planetary atmospheres',
      'Bouncing sonar waves through vacuum',
      'Teleporting physical soil samples',
    ],
    correctIdx: 1,
    explanation: 'Chemical elements absorb specific wavelengths of light, leaving a unique spectral fingerprint.',
  },
  {
    question: 'When matter and antimatter collide in CERN or the Enterprise warp core, what happens?',
    options: [
      'They form heavy radioactive lead',
      'They freeze into absolute zero dark matter',
      '100% of their rest mass converts directly into pure energy via E = mc²',
      'They bounce off each other due to magnetic repulsion',
    ],
    correctIdx: 2,
    explanation: 'Matter-antimatter annihilation is the most energy-dense reaction known in physics, releasing 9 × 10¹⁶ J/kg.',
  },
];

export const BridgeSimulationView: React.FC<BridgeSimulationProps> = ({
  onAskComputer,
  redAlertActive,
  onToggleRedAlert,
  onExitBridge,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const bridgeControllerRef = useRef<BridgeInteriorController | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Active Station POV ('captain' default)
  const [activeStation, setActiveStation] = useState<BridgeStationId>('captain');
  const activeStationRef = useRef<BridgeStationId>('captain');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState<boolean>(false);
  const [gyroEnabled, setGyroEnabled] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Camera Spherical Look-Around State (First-Person 360° inside Bridge)
  const camPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.48, 1.25));
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.48, 1.25));
  const yawRef = useRef<number>(0.0);
  const pitchRef = useRef<number>(-0.06);
  const targetYawRef = useRef<number>(0.0);
  const targetPitchRef = useRef<number>(-0.06);
  const viewscreenZoomRef = useRef<number>(1.0);
  const [viewscreenZoom, setViewscreenZoom] = useState<number>(1.0);

  // Crew Advisory Banner State
  const [advisoryIdx, setAdvisoryIdx] = useState<number>(0);
  const [showAdvisoryBanner, setShowAdvisoryBanner] = useState<boolean>(true);
  const [officerLogMessage, setOfficerLogMessage] = useState<string | null>(null);

  // Station 1: Helm / Navigation Controls State
  const [helmMode, setHelmMode] = useState<'sublight' | 'impulse' | 'warp'>('warp');
  const [warpFactor, setWarpFactor] = useState<number>(1.0);
  const [headingDeg, setHeadingDeg] = useState<number>(180);
  const [pitchDeg, setPitchDeg] = useState<number>(0);
  const [orbitalLock, setOrbitalLock] = useState<boolean>(false);

  // Station 2: Tactical / Defense Controls State
  const [shieldFreq, setShieldFreq] = useState<number>(482.6);
  const [phaserCharge, setPhaserCharge] = useState<number>(85);
  const [targetLocked, setTargetLocked] = useState<boolean>(true);
  const [torpedoCount, setTorpedoCount] = useState<number>(12);

  // Station 3: Science Station Controls State
  const [wavelengthBand, setWavelengthBand] = useState<string>('SUBSPACE');
  const [spectrometerGain, setSpectrometerGain] = useState<number>(72);
  const [scienceFactIdx, setScienceFactIdx] = useState<number>(0);

  // Station 4: Communications Station Controls State
  const [subspaceFreq, setSubspaceFreq] = useState<number>(42.8);
  const [waveformPhase, setWaveformPhase] = useState<number>(64);
  const [translatorDecoded, setTranslatorDecoded] = useState<boolean>(false);

  // Cadet Quiz Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2600);
  };

  const formatWarpLightSpeed = (wf: number): string => {
    const cVal = 8.5 * Math.pow(wf, 3);
    return cVal < 100 ? `${cVal.toFixed(1)} c` : `${Math.round(cVal).toLocaleString()} c`;
  };

  // Switch Station POV with Smooth Camera Lerp/Slerp
  const handleSelectStation = (stationId: BridgeStationId, announce = true) => {
    setActiveStation(stationId);
    activeStationRef.current = stationId;
    setIsDrawerCollapsed(false);

    const controller = bridgeControllerRef.current;
    if (controller) {
      const pose = controller.stationPoses[stationId];
      targetCamPosRef.current.copy(pose.position);
      targetYawRef.current = pose.defaultYaw;
      targetPitchRef.current = pose.defaultPitch;
      controller.highlightStation(stationId);
      if (announce) {
        spaceAudio.playChirp('mid');
        showToast(`POV: ${pose.label} • ${pose.officerName}`);
      }
    }
  };

  // Handle Crew Advisory [JUMP TO STATION]
  const handleJumpToAdvisoryStation = () => {
    const currentEvent = BRIDGE_ADVISORY_EVENTS[advisoryIdx];
    lcarsAudio.playBeep(880, 0.08);
    handleSelectStation(currentEvent.station, true);
  };

  // Handle Crew Advisory [ORDER OFFICER] (stay in Captain's Chair while officer executes action!)
  const handleOrderOfficer = () => {
    const currentEvent = BRIDGE_ADVISORY_EVENTS[advisoryIdx];
    lcarsAudio.playChime();
    setOfficerLogMessage(`${currentEvent.officer}: "${currentEvent.orderConfirmation}"`);

    const controller = bridgeControllerRef.current;
    if (currentEvent.station === 'tactical') {
      setShieldFreq(648.2);
      controller?.pulseShields(0.75);
      controller?.fireBridgePhasers();
      spaceAudio.playPhaserPulse();
    } else if (currentEvent.station === 'science') {
      setWavelengthBand('SUBSPACE');
      setSpectrometerGain(94);
      controller?.setScanWaveActive(true, 0x22d3ee);
      spaceAudio.playChirp('high');
    } else if (currentEvent.station === 'comms') {
      setWaveformPhase(100);
      setTranslatorDecoded(true);
      spaceAudio.playChirp('mid');
    } else if (currentEvent.station === 'helm') {
      setHeadingDeg(215);
      setPitchDeg(12);
      setHelmMode('warp');
      setWarpFactor(4.5);
      controller?.setHeadingPitch(215, 12);
      controller?.setWarpFactor(4.5, 'warp');
      spaceAudio.setWarpSpeed(true);
    }

    setTimeout(() => {
      setOfficerLogMessage(null);
      setAdvisoryIdx((prev) => (prev + 1) % BRIDGE_ADVISORY_EVENTS.length);
    }, 4200);
  };

  // WebGL 3D Bridge Interior Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03050a);
    scene.fog = new THREE.FogExp2(0x03050a, 0.008);

    const baseFov = aspect < 1.0 ? 64 : 52;
    const camera = new THREE.PerspectiveCamera(baseFov, aspect, 0.08, 600);
    camera.position.copy(camPosRef.current);
    cameraRef.current = camera;

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (Boolean(navigator.webdriver) || /HeadlessChrome/i.test(navigator.userAgent));

    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // Studio Environment Map for Metallic Bulkheads & Console Trim
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
      if ('environmentIntensity' in scene) {
        (scene as any).environmentIntensity = 0.25;
      }
      pmrem.dispose();
      roomEnv.dispose();
    } catch {
      // Fallback
    }

    // Bridge Interior Studio Lighting Rig
    const overheadLight = new THREE.PointLight(0xfff6e5, 2.2, 22);
    overheadLight.position.set(0, 4.3, 0);
    scene.add(overheadLight);

    const viewscreenGlowLight = new THREE.PointLight(0x38bdf8, 1.8, 20);
    viewscreenGlowLight.position.set(0, 2.4, -7.2);
    scene.add(viewscreenGlowLight);

    const hemiLight = new THREE.HemisphereLight(0x3b4d70, 0x0c1017, 0.85);
    scene.add(hemiLight);

    // Post-Processing Bloom for Backlit Consoles & Main Viewscreen
    let composer: EffectComposer | null = null;
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.38, 0.35, 0.92);
      composer.addPass(bloom);
    } catch {
      composer = null;
    }

    // Build 3D Bridge Interior & Crew
    const bridgeController = createBridgeInteriorModel();
    bridgeController.setAlertMode(redAlertActive ? 'red' : 'normal');
    bridgeController.setWarpFactor(warpFactor, helmMode);
    scene.add(bridgeController.group);
    bridgeControllerRef.current = bridgeController;

    // 360° Touch-Drag Look-Around & Direct 3D Console Tap Raycasting
    let isPointerDown = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let dragDistance = 0;
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      dragDistance = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      dragDistance += Math.hypot(dx, dy);

      // Smooth 360-degree horizontal pan & clamped vertical tilt
      const sensitivity = 0.0042;
      targetYawRef.current -= dx * sensitivity;
      targetPitchRef.current = THREE.MathUtils.clamp(
        targetPitchRef.current - dy * sensitivity,
        -0.72,
        0.68
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;

      // Direct 3D Tap on Console or Crew Officer (if finger moved < 8px)
      if (dragDistance < 8) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);

        const hits = raycaster.intersectObjects(bridgeController.interactables, true);
        if (hits.length > 0) {
          let obj: THREE.Object3D | null = hits[0].object;
          while (obj && !obj.userData?.stationId) {
            obj = obj.parent;
          }
          const stId = obj?.userData?.stationId as BridgeStationId | undefined;
          if (stId) {
            handleSelectStation(stId, true);
          }
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Render Loop
    const clock = new THREE.Clock();
    let animId = 0;
    const lookTarget = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Smooth Exponential Damping for Station POV Camera Position & 360° Look Angles
      camPosRef.current.x = THREE.MathUtils.damp(
        camPosRef.current.x,
        targetCamPosRef.current.x,
        5.0,
        delta
      );
      camPosRef.current.y = THREE.MathUtils.damp(
        camPosRef.current.y,
        targetCamPosRef.current.y,
        5.0,
        delta
      );
      camPosRef.current.z = THREE.MathUtils.damp(
        camPosRef.current.z,
        targetCamPosRef.current.z,
        5.0,
        delta
      );
      camera.position.copy(camPosRef.current);

      yawRef.current = THREE.MathUtils.damp(yawRef.current, targetYawRef.current, 8.0, delta);
      pitchRef.current = THREE.MathUtils.damp(pitchRef.current, targetPitchRef.current, 8.0, delta);

      // Compute forward look vector from spherical yaw & pitch (0 yaw = looking along -Z toward Main Viewscreen)
      const cosPitch = Math.cos(pitchRef.current);
      const lookDirX = -Math.sin(yawRef.current) * cosPitch;
      const lookDirY = Math.sin(pitchRef.current);
      const lookDirZ = -Math.cos(yawRef.current) * cosPitch;

      lookTarget.set(
        camera.position.x + lookDirX * 10,
        camera.position.y + lookDirY * 10,
        camera.position.z + lookDirZ * 10
      );
      camera.lookAt(lookTarget);

      // Smooth Main Viewscreen Magnification FOV
      const curAspect = camera.aspect;
      const defaultFov = curAspect < 1.0 ? 64 : 52;
      const desiredFov = defaultFov / viewscreenZoomRef.current;
      if (Math.abs(camera.fov - desiredFov) > 0.05) {
        camera.fov = THREE.MathUtils.damp(camera.fov, desiredFov, 5.0, delta);
        camera.updateProjectionMatrix();
      }

      bridgeController.update(delta, elapsed);

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer?.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      bridgeController.dispose();
      renderer.dispose();
      if (container.contains(domElem)) {
        container.removeChild(domElem);
      }
    };
  }, []);

  // Optional Mobile Device Orientation (Gyroscope) 360° Look-Around
  useEffect(() => {
    if (!gyroEnabled) return;
    let baseAlpha: number | null = null;
    let baseBeta: number | null = null;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha === null || e.beta === null) return;
      if (baseAlpha === null) baseAlpha = e.alpha;
      if (baseBeta === null) baseBeta = e.beta;

      const dAlpha = ((e.alpha - baseAlpha + 540) % 360) - 180;
      const dBeta = e.beta - baseBeta;

      const pose = bridgeControllerRef.current?.stationPoses[activeStationRef.current];
      const baseYaw = pose ? pose.defaultYaw : 0;
      const basePitch = pose ? pose.defaultPitch : -0.06;

      targetYawRef.current = baseYaw + THREE.MathUtils.degToRad(dAlpha * 0.85);
      targetPitchRef.current = THREE.MathUtils.clamp(
        basePitch + THREE.MathUtils.degToRad(dBeta * 0.65),
        -0.65,
        0.6
      );
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [gyroEnabled]);

  // Sync Red Alert state into 3D Bridge Interior
  useEffect(() => {
    bridgeControllerRef.current?.setAlertMode(redAlertActive ? 'red' : 'normal');
  }, [redAlertActive]);

  // Sync Warp Factor & Propulsion Mode into 3D Bridge Viewscreen
  useEffect(() => {
    bridgeControllerRef.current?.setWarpFactor(warpFactor, helmMode);
  }, [warpFactor, helmMode]);

  const currentAdvisory = BRIDGE_ADVISORY_EVENTS[advisoryIdx];

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#03050a]">
      {/* 3D Bridge Interior WebGL Viewport */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />

      {/* TOP HUD: Exterior Hull Toggle, Active Station Badge, Gyro 360° & Crew Advisory Banner */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-2 sm:p-3">
        {/* Top Control Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Prominent [EXTERIOR HULL VIEW] Toggle Button */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {onExitBridge && (
              <button
                onClick={() => {
                  spaceAudio.playChirp('high');
                  onExitBridge();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-extrabold tracking-wider shadow-xl border border-amber-300 active:scale-95 transition-all cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5 flex-shrink-0" />
                <span>EXTERIOR HULL VIEW</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-1.5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-mono text-xs font-bold text-amber-400 uppercase">
                DECK 1 • {activeStation.toUpperCase()} POV
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                (DRAG 360° OR TAP CONSOLES)
              </span>
            </div>
          </div>

          {/* Right Utilities: Gyro 360°, Red Alert, Cadet Quiz, Reset Look */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {toastMsg && (
              <div className="hidden md:block bg-cyan-500/95 text-slate-950 font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-lg">
                {toastMsg}
              </div>
            )}

            <button
              onClick={() => {
                const next = !gyroEnabled;
                setGyroEnabled(next);
                showToast(next ? 'MOBILE GYRO 360° TILT: ON' : 'GYRO TILT: OFF (TOUCH DRAG)');
              }}
              title="Toggle Mobile Gyroscope 360° Look-Around"
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                gyroEnabled
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow'
                  : 'bg-slate-950/90 text-slate-300 border-slate-700/80 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GYRO 360°</span>
            </button>

            <button
              onClick={() => {
                handleSelectStation(activeStation, false);
                showToast('CAMERA CENTERED ON VIEWSCREEN');
              }}
              title="Center Camera on Forward Main Viewscreen"
              className="p-2 rounded-xl bg-slate-950/90 border border-slate-700/80 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                onToggleRedAlert(!redAlertActive);
                lcarsAudio.toggleRedAlert(!redAlertActive);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                redAlertActive
                  ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/40'
                  : 'bg-slate-950/90 text-red-400 border-red-800/70 hover:bg-red-950/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{redAlertActive ? 'RED ALERT' : 'ALERT'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Crew Advisory Banner (Jump to Station OR Order Officer) */}
        {showAdvisoryBanner && (
          <div
            className={`pointer-events-auto w-full max-w-2xl mx-auto rounded-2xl border p-2.5 sm:p-3 shadow-2xl backdrop-blur-xl transition-all ${currentAdvisory.badgeBg}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="px-2 py-1 rounded-lg bg-slate-950/90 border border-slate-700 text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-400 flex-shrink-0">
                  {currentAdvisory.station.toUpperCase()} HAIL
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-extrabold ${currentAdvisory.color}`}>
                      {currentAdvisory.officer}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      • {currentAdvisory.role}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-100 leading-snug mt-0.5">
                    {officerLogMessage || currentAdvisory.message}
                  </p>
                </div>
              </div>

              {/* Two Thumb-Friendly Action Buttons: [JUMP TO STATION] & [ORDER OFFICER] */}
              <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                <button
                  onClick={handleJumpToAdvisoryStation}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-[11px] font-extrabold shadow active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowRightCircle className="w-3.5 h-3.5" />
                  <span>JUMP TO STATION</span>
                </button>
                <button
                  onClick={handleOrderOfficer}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[11px] font-extrabold shadow active:scale-95 transition-all cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>ORDER OFFICER</span>
                </button>
                <button
                  onClick={() => setAdvisoryIdx((prev) => (prev + 1) % BRIDGE_ADVISORY_EVENTS.length)}
                  title="Next Bridge Event"
                  className="px-2 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[10px] font-bold cursor-pointer"
                >
                  NEXT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM LCARS STATION CONTROL DRAWER & STATION PILL BAR */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center p-2 sm:p-3 gap-1.5">
        {/* Collapsible Role-Tailored Tactile Controls Drawer */}
        <div className="pointer-events-auto w-full max-w-3xl bg-slate-950/92 border border-slate-700/85 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Drawer Header Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-amber-400">
                {activeStation === 'captain' && 'COMMAND CHAIR • BRIDGE OVERVIEW'}
                {activeStation === 'helm' && `HELM & NAVIGATION • WF ${warpFactor.toFixed(1)} (${formatWarpLightSpeed(warpFactor)})`}
                {activeStation === 'tactical' && `TACTICAL & DEFENSE • SHIELDS ${shieldFreq.toFixed(1)} MHz`}
                {activeStation === 'science' && `SCIENCE STATION • ${wavelengthBand} SPECTROMETER`}
                {activeStation === 'comms' && `COMMUNICATIONS • ${subspaceFreq.toFixed(1)} GHz SUBSPACE`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowAdvisoryBanner((v) => !v)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 font-bold cursor-pointer"
              >
                {showAdvisoryBanner ? 'HIDE HAIL' : 'SHOW HAIL'}
              </button>
              <button
                onClick={() => setIsDrawerCollapsed((c) => !c)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] font-mono font-bold cursor-pointer"
              >
                {isDrawerCollapsed ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    <span>CONTROLS</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    <span>MINIMIZE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Role-Specific Tactile Dials & Sliders Body */}
          {!isDrawerCollapsed && (
            <div className="p-2.5 sm:p-3 max-h-[38vh] overflow-y-auto">
              {/* 1. CAPTAIN'S CHAIR POV CONTROLS */}
              {activeStation === 'captain' && (
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      onClick={() => handleSelectStation('helm')}
                      className="px-2.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold text-center active:scale-95 cursor-pointer"
                    >
                      HELM ({formatWarpLightSpeed(warpFactor)})
                    </button>
                    <button
                      onClick={() => handleSelectStation('tactical')}
                      className="px-2.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/50 text-red-300 font-mono text-xs font-bold text-center active:scale-95 cursor-pointer"
                    >
                      TACTICAL (SHIELDS)
                    </button>
                    <button
                      onClick={() => handleSelectStation('science')}
                      className="px-2.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold text-center active:scale-95 cursor-pointer"
                    >
                      SPOCK (SENSORS)
                    </button>
                    <button
                      onClick={() => handleSelectStation('comms')}
                      className="px-2.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold text-center active:scale-95 cursor-pointer"
                    >
                      UHURA (COMMS)
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                      <Eye className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-[11px] font-mono text-slate-300 font-bold whitespace-nowrap">
                        VIEWSCREEN ZOOM:
                      </span>
                      <input
                        type="range"
                        min="1.0"
                        max="2.5"
                        step="0.1"
                        value={viewscreenZoom}
                        onChange={(e) => {
                          const z = parseFloat(e.target.value);
                          setViewscreenZoom(z);
                          viewscreenZoomRef.current = z;
                        }}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        {viewscreenZoom.toFixed(1)}x
                      </span>
                    </div>

                    <button
                      onClick={() => setIsQuizModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow cursor-pointer active:scale-95"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>CADET EXAM QUIZ</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. HELM / NAVIGATION POV CONTROLS */}
              {activeStation === 'helm' && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Touch Rotary Heading / Pitch Compass Dial */}
                  <div className="sm:col-span-5 flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                    <div className="relative w-16 h-16 rounded-full border-2 border-amber-400/80 bg-slate-950 flex items-center justify-center flex-shrink-0">
                      <div
                        className="w-1 h-7 bg-cyan-400 rounded-full origin-bottom transition-transform"
                        style={{
                          transform: `translateY(-14px) rotate(${headingDeg}deg)`,
                        }}
                      />
                      <span className="absolute text-[9px] font-mono font-bold text-amber-300">
                        {headingDeg}°
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">HEADING:</span>
                        <span className="text-amber-400 font-bold">
                          {headingDeg}° MK {pitchDeg >= 0 ? `+${pitchDeg}` : pitchDeg}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="359"
                        value={headingDeg}
                        onChange={(e) => {
                          const h = parseInt(e.target.value, 10);
                          setHeadingDeg(h);
                          bridgeControllerRef.current?.setHeadingPitch(h, pitchDeg);
                        }}
                        className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">PITCH INCLINATION:</span>
                        <div className="flex gap-1">
                          {[-15, 0, 15].map((p) => (
                            <button
                              key={p}
                              onClick={() => {
                                setPitchDeg(p);
                                bridgeControllerRef.current?.setHeadingPitch(headingDeg, p);
                              }}
                              className={`px-1.5 py-0.5 rounded border ${
                                pitchDeg === p
                                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {p >= 0 ? `+${p}°` : `${p}°`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warp Factor Swipe Throttle & Propulsion Mode */}
                  <div className="sm:col-span-7 flex flex-col gap-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['sublight', 'impulse', 'warp'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setHelmMode(m);
                            spaceAudio.setWarpSpeed(m === 'warp');
                            spaceAudio.playChirp('mid');
                          }}
                          className={`py-1 rounded-lg font-mono text-[11px] font-bold uppercase border cursor-pointer ${
                            helmMode === m
                              ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {m === 'sublight' ? 'THRUSTERS' : m === 'impulse' ? 'IMPULSE' : `WARP ${warpFactor.toFixed(1)}`}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-[11px] font-mono text-cyan-400 font-bold whitespace-nowrap">
                        WARP THROTTLE:
                      </span>
                      <input
                        type="range"
                        min="1.0"
                        max="9.9"
                        step="0.1"
                        value={warpFactor}
                        onChange={(e) => {
                          setHelmMode('warp');
                          setWarpFactor(parseFloat(e.target.value));
                        }}
                        className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                      <span className="text-xs font-mono text-cyan-300 font-extrabold whitespace-nowrap">
                        WF {warpFactor.toFixed(1)} ({formatWarpLightSpeed(warpFactor)})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          const next = !orbitalLock;
                          setOrbitalLock(next);
                          showToast(next ? 'STANDARD ORBIT LOCKED' : 'ORBITAL LOCK RELEASED');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer ${
                          orbitalLock
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                            : 'bg-slate-950 text-slate-300 border-slate-700'
                        }`}
                      >
                        {orbitalLock ? 'ORBITAL LOCK: ENGAGED' : 'LOCK STANDARD ORBIT'}
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">
                        HELM: LT. SULU • NAV: ENS. CHEKOV
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. TACTICAL / DEFENSE POV CONTROLS */}
              {activeStation === 'tactical' && (
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Shield Modulation Frequency Wheel */}
                    <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
                      <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-300 font-bold">SHIELD HARMONIC:</span>
                          <span className="text-cyan-400 font-extrabold">{shieldFreq.toFixed(1)} MHz</span>
                        </div>
                        <input
                          type="range"
                          min="142.0"
                          max="998.4"
                          step="1.2"
                          value={shieldFreq}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setShieldFreq(val);
                            bridgeControllerRef.current?.pulseShields((val - 142) / 856);
                          }}
                          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Phaser Capacitor Charge */}
                    <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
                      <Sliders className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-300 font-bold">PHASER CAPACITOR:</span>
                          <span className="text-amber-400 font-extrabold">{phaserCharge}% YIELD</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          step="5"
                          value={phaserCharge}
                          onChange={(e) => setPhaserCharge(parseInt(e.target.value, 10))}
                          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weapons Fire Pads & Target Lock Reticle Toggle */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        bridgeControllerRef.current?.fireBridgePhasers();
                        spaceAudio.playPhaserPulse();
                        showToast(`VENTRAL PHASERS FIRED (${phaserCharge}% YIELD)`);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-extrabold shadow active:scale-95 cursor-pointer"
                    >
                      <Radio className="w-4 h-4" />
                      <span>FIRE PHASERS</span>
                    </button>

                    <button
                      onClick={() => {
                        if (torpedoCount > 0) {
                          setTorpedoCount((c) => c - 1);
                          bridgeControllerRef.current?.fireBridgeTorpedo();
                          spaceAudio.playPhotonTorpedo();
                          showToast('PHOTON TORPEDO AWAY!');
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-extrabold shadow active:scale-95 cursor-pointer"
                    >
                      <Crosshair className="w-4 h-4" />
                      <span>TORPEDO ({torpedoCount})</span>
                    </button>

                    <button
                      onClick={() => {
                        const next = !targetLocked;
                        setTargetLocked(next);
                        bridgeControllerRef.current?.setTargetLocked(next);
                        showToast(next ? '3D TARGET RETICLE LOCKED' : 'TARGET LOCK CLEARED');
                      }}
                      className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl font-mono text-xs font-bold border active:scale-95 cursor-pointer ${
                        targetLocked
                          ? 'bg-red-950 text-red-300 border-red-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span>{targetLocked ? 'LOCKED: D7' : 'LOCK TARGET'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. SCIENCE STATION POV CONTROLS (Spock) */}
              {activeStation === 'science' && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Wavelength Tuning Rings */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {['GAMMA', 'X-RAY', 'UV', 'OPTICAL', 'INFRARED', 'SUBSPACE'].map((band) => (
                        <button
                          key={band}
                          onClick={() => {
                            setWavelengthBand(band);
                            bridgeControllerRef.current?.setScanWaveActive(true, 0x38bdf8);
                            spaceAudio.playChirp('high');
                          }}
                          className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border transition-all cursor-pointer ${
                            wavelengthBand === band
                              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow'
                              : 'bg-slate-900 text-cyan-300 border-slate-800'
                          }`}
                        >
                          {band}
                        </button>
                      ))}
                    </div>

                    {/* Spectrometer Gain Slider */}
                    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-xl flex-1 min-w-[180px]">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">SPECTROMETER:</span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={spectrometerGain}
                        onChange={(e) => {
                          setSpectrometerGain(parseInt(e.target.value, 10));
                          bridgeControllerRef.current?.setScanWaveActive(true, 0xa855f7);
                        }}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                      <span className="text-xs font-mono text-cyan-300 font-bold">{spectrometerGain}%</span>
                    </div>
                  </div>

                  {/* One-Tap "Science Exhibition Fact" Card */}
                  <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono font-extrabold text-cyan-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>EXHIBITION SCIENCE FACT: {SCIENCE_EXHIBITION_FACTS[scienceFactIdx].title}</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-200 mt-0.5 leading-snug">
                        {SCIENCE_EXHIBITION_FACTS[scienceFactIdx].body}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          setScienceFactIdx((i) => (i + 1) % SCIENCE_EXHIBITION_FACTS.length);
                          spaceAudio.playChirp('mid');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-mono text-[10px] font-extrabold cursor-pointer active:scale-95"
                      >
                        NEXT FACT
                      </button>
                      {onAskComputer && (
                        <button
                          onClick={() => onAskComputer(SCIENCE_EXHIBITION_FACTS[scienceFactIdx].topic)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-mono text-[10px] font-extrabold cursor-pointer active:scale-95"
                        >
                          ASK AI
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. COMMUNICATIONS STATION POV CONTROLS (Uhura) */}
              {activeStation === 'comms' && (
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
                      <Volume2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-[11px] font-mono text-slate-300 font-bold whitespace-nowrap">
                        SUBSPACE BAND:
                      </span>
                      <input
                        type="range"
                        min="12.0"
                        max="98.0"
                        step="0.4"
                        value={subspaceFreq}
                        onChange={(e) => setSubspaceFreq(parseFloat(e.target.value))}
                        className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                      <span className="text-xs font-mono text-emerald-400 font-bold whitespace-nowrap">
                        {subspaceFreq.toFixed(1)} GHz
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
                      <Sliders className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-[11px] font-mono text-slate-300 font-bold whitespace-nowrap">
                        WAVEFORM LOCK:
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={waveformPhase}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setWaveformPhase(val);
                          if (val > 88) setTranslatorDecoded(true);
                        }}
                        className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                      <span className="text-xs font-mono text-cyan-300 font-bold">{waveformPhase}%</span>
                    </div>
                  </div>

                  {/* Universal Translator Decoding Matrix */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-950/35 border border-emerald-500/40 rounded-xl p-2.5">
                    <div className="font-mono text-xs">
                      <span className="text-emerald-400 font-extrabold uppercase mr-2">
                        UNIVERSAL TRANSLATOR MATRIX:
                      </span>
                      <span className="text-slate-100">
                        {translatorDecoded || waveformPhase > 85
                          ? '"STARFLEET COMMAND TO USS ENTERPRISE: PROCEED TO SECTOR 001 SCIENCE EXHIBITION."'
                          : '◊ ∆ ¤ Ω Ψ [CARRIER LOCK < 85% — SLIDE WAVEFORM OR TAP DECODE]'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setWaveformPhase(100);
                        setTranslatorDecoded(true);
                        lcarsAudio.playChime();
                        showToast('UNIVERSAL TRANSLATOR LOCKED AT 100%');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-[11px] font-extrabold whitespace-nowrap cursor-pointer active:scale-95"
                    >
                      DECODE HAIL
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sleek Thumb-Friendly Bottom LCARS Station Pill Bar ([CAPTAIN] [HELM] [TACTICAL] [SCIENCE] [COMMS]) */}
        <div className="pointer-events-auto w-full max-w-2xl bg-slate-950/95 border border-slate-700/85 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl grid grid-cols-5 gap-1">
          {[
            { id: 'captain', label: 'CAPTAIN', activeBg: 'bg-amber-500 text-slate-950 border-amber-300' },
            { id: 'helm', label: 'HELM', activeBg: 'bg-amber-400 text-slate-950 border-amber-200' },
            { id: 'tactical', label: 'TACTICAL', activeBg: 'bg-red-500 text-white border-red-300' },
            { id: 'science', label: 'SCIENCE', activeBg: 'bg-cyan-500 text-slate-950 border-cyan-300' },
            { id: 'comms', label: 'COMMS', activeBg: 'bg-emerald-500 text-slate-950 border-emerald-300' },
          ].map((st) => {
            const isSelected = activeStation === st.id;
            return (
              <button
                key={st.id}
                onClick={() => handleSelectStation(st.id as BridgeStationId)}
                className={`py-2 px-1.5 rounded-xl font-mono text-[11px] sm:text-xs font-extrabold tracking-wider border transition-all text-center cursor-pointer active:scale-95 ${
                  isSelected
                    ? `${st.activeBg} shadow-lg`
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Starfleet Cadet Science Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-950 border-2 border-amber-500 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-mono text-sm font-extrabold text-amber-400 uppercase">
                  STARFLEET BRIDGE CADET CHALLENGE ({quizIdx + 1}/{CADET_QUIZ.length})
                </h3>
              </div>
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-mono text-sm text-white font-bold">
              {CADET_QUIZ[quizIdx].question}
            </p>

            <div className="space-y-2">
              {CADET_QUIZ[quizIdx].options.map((opt, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === CADET_QUIZ[quizIdx].correctIdx;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (selectedAnswer !== null) return;
                      setSelectedAnswer(i);
                      if (isCorrect) setQuizScore((s) => s + 1);
                    }}
                    className={`w-full text-left p-3 rounded-xl font-mono text-xs border transition-all cursor-pointer ${
                      selectedAnswer === null
                        ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                        : isCorrect
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold'
                        : isSelected
                        ? 'bg-red-950/90 border-red-500 text-red-200'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs font-mono text-cyan-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{CADET_QUIZ[quizIdx].explanation}</span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedAnswer(null);
                      setQuizIdx((q) => (q + 1) % CADET_QUIZ.length);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold cursor-pointer"
                  >
                    NEXT QUESTION (SCORE: {quizScore})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
