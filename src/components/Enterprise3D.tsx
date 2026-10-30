import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { lcarsAudio } from '../utils/lcarsAudio';
import { buildEnterpriseModel, EnterpriseComponents } from './enterpriseModel';
import { 
  createTurntablePedestal, 
  createScanningGridBeam, 
  createFloatingTelemetryGroup 
} from './lcarsTelemetry3D';
import { 
  Shield, 
  Zap, 
  Crosshair, 
  RotateCw, 
  Eye, 
  Flame,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Box,
  Palette,
  Scan,
  Compass,
  Gauge,
  Sliders,
  HelpCircle,
  Activity
} from 'lucide-react';
import { ShipDiagnosticsModal } from './ShipDiagnosticsModal';

export type ShipSectionId = 
  | 'bridge'
  | 'saucer'
  | 'engineering'
  | 'deflector'
  | 'nacelles'
  | 'impulse'
  | 'shuttlebay';

export interface SectionInfo {
  id: ShipSectionId;
  name: string;
  decks: string;
  system: string;
  realScience: string;
  canonLore: string;
  stats: string;
}

export const SHIP_SECTIONS: Record<ShipSectionId, SectionInfo> = {
  bridge: {
    id: 'bridge',
    name: 'Main Bridge',
    decks: 'Deck 1 (Saucer Apex)',
    system: 'Command & Helm Control Center',
    realScience: 'REAL SCIENCE: Real spacecraft (ISS, SpaceX Dragon, Orion) locate command flight computers inside heavily shielded hulls rather than atop exposed exterior perimeters.',
    canonLore: 'STAR TREK CANON: Deck 1 houses the Captain\'s chair, Conn, Ops, and tactical displays with a forward holographic main viewscreen.',
    stats: 'Decks: 1 | Atmospheric: 101.3 kPa | Redundant Optical ODN Buses',
  },
  saucer: {
    id: 'saucer',
    name: 'Primary Hull (Saucer)',
    decks: 'Decks 1 - 11',
    system: 'Living Quarters, Science Labs & Crew Support',
    realScience: 'REAL SCIENCE: A 140m disc in microgravity requires continuous thrust or centrifugal rotation to generate 1G artificial gravity.',
    canonLore: 'STAR TREK CANON: The saucer holds crew quarters, sickbay, astrophysics labs, and can separate from the secondary hull during emergencies.',
    stats: 'Diameter: 142.3 m | Internal Volume: 215,000 m³',
  },
  engineering: {
    id: 'engineering',
    name: 'Secondary Engineering Hull',
    decks: 'Decks 12 - 24',
    system: 'Warp Core & Antimatter Containment',
    realScience: 'REAL SCIENCE: CERN uses electromagnetic Penning traps to suspend antiprotons; matter-antimatter annihilation converts 100% of rest mass into energy via E=mc².',
    canonLore: 'STAR TREK CANON: Houses the vertical matter/antimatter reaction assembly (M/ARA) regulated by dilithium crystals to power primary systems.',
    stats: 'Reactant Tanks: Cryogenic Antideuterium | EPS Transfer: 4,000 kV',
  },
  deflector: {
    id: 'deflector',
    name: 'Navigational Deflector Dish',
    decks: 'Decks 14 - 17 (Forward Bow)',
    system: 'Graviton Particle Repulsor',
    realScience: 'REAL SCIENCE: At relativistic speeds (0.1c), interstellar dust grains impact with explosive kinetic force; active plasma and magnetic shielding are mandatory.',
    canonLore: 'STAR TREK CANON: The parabolic illuminated dish generates directional graviton fields to sweep space debris away from the ship\'s course.',
    stats: 'Field Radius: 50,000 km forward | Emitter: Subspace graviton dish',
  },
  nacelles: {
    id: 'nacelles',
    name: 'Twin Warp Nacelles',
    decks: 'Outboard Pylon Cantilever Units',
    system: 'Cochrane Subspace Field Generators',
    realScience: 'REAL SCIENCE: Alcubierre spacetime metrics require toroidal fields to contract space ahead and expand space behind without breaking local light-speed limits.',
    canonLore: 'STAR TREK CANON: Each nacelle houses verterium cortenide Cochrane coils, illuminated blue warp grilles, and red Bussard collectors for hydrogen harvesting.',
    stats: 'Coils: 18 paired toroidal units | Warp Limit: Warp 8 (cruising) / 9+ (emergency)',
  },
  impulse: {
    id: 'impulse',
    name: 'Main Impulse Engines',
    decks: 'Deck 7 (Aft Saucer)',
    system: 'Relativistic Fusion Thruster',
    realScience: 'REAL SCIENCE: Nuclear fusion (D-T or D-He3) exhausts hot relativistic plasma for high specific impulse (Isp > 100,000 s) rocket propulsion.',
    canonLore: 'STAR TREK CANON: Magnetohydrodynamic fusion reactors expel plasma through vectored exhaust ports, powering sub-light speeds up to 0.25c (Full Impulse).',
    stats: 'Output: 0.25c max sub-light | Reactor: Laser-induced Deuterium Fusion',
  },
  shuttlebay: {
    id: 'shuttlebay',
    name: 'Aft Shuttlecraft Hangar',
    decks: 'Decks 18 - 20 (Secondary Hull Aft)',
    system: 'Auxiliary Craft Launch & Recovery',
    realScience: 'REAL SCIENCE: Modern space station airlocks use dual pressurized bulkheads to prevent explosive vacuum decompression upon egress.',
    canonLore: 'STAR TREK CANON: Accommodates Class-F personnel shuttles behind curved clamshell hangar doors protected by dual atmospheric forcefields.',
    stats: 'Capacity: 4 Class-F Shuttles | Forcefield: Dual-stage atmospheric curtain',
  },
};

interface Enterprise3DProps {
  onSelectSection?: (section: SectionInfo) => void;
  redAlertActive?: boolean;
  onAskComputer?: (topic: string) => void;
}

export const Enterprise3D: React.FC<Enterprise3DProps> = ({ 
  onSelectSection, 
  redAlertActive = false,
  onAskComputer 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Interaction states
  const [selectedSection, setSelectedSection] = useState<ShipSectionId>('saucer');
  const [renderMode, setRenderMode] = useState<'colored' | 'hologram' | 'cad'>('colored');
  const [orbitSpeed, setOrbitSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [shieldsActive, setShieldsActive] = useState<boolean>(false);
  const [warpActive, setWarpActive] = useState<boolean>(false);
  const [isFiringPhaser, setIsFiringPhaser] = useState<boolean>(false);
  const [isFiringTorpedo, setIsFiringTorpedo] = useState<boolean>(false);
  const [isTransporting, setIsTransporting] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);

  // References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const shipComponentsRef = useRef<EnterpriseComponents | null>(null);
  const phaserBeamsRef = useRef<THREE.Line[]>([]);
  const torpedoRef = useRef<THREE.Mesh | null>(null);
  const transporterParticlesRef = useRef<THREE.Points | null>(null);
  const starfieldRef = useRef<THREE.Points | null>(null);
  const cosmicDustRef = useRef<THREE.Points | null>(null);

  // Holographic elements references
  const turntablePedestalRef = useRef<{ group: THREE.Group; radarSweep: THREE.Line } | null>(null);
  const scanBeamRef = useRef<{ group: THREE.Group; scanLight: THREE.PointLight; scanSheet: THREE.Mesh } | null>(null);
  const floatingTelemetryRef = useRef<THREE.Group | null>(null);
  const starRimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Smooth target camera coordinates
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(26, 14, 30));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const handleSelectSection = useCallback((secId: ShipSectionId) => {
    setSelectedSection(secId);
    const secData = SHIP_SECTIONS[secId];
    if (onSelectSection) onSelectSection(secData);
    lcarsAudio.playBeep(920, 0.05);

    // Dynamic camera framing based on chosen ship section
    const comps = shipComponentsRef.current;
    if (comps && comps.subsystemNodes.has(secId)) {
      const nodePos = comps.subsystemNodes.get(secId)!;
      targetLookAtRef.current.copy(nodePos);

      switch (secId) {
        case 'bridge':
          targetCamPosRef.current.set(nodePos.x + 8, nodePos.y + 7, nodePos.z + 12);
          break;
        case 'deflector':
          targetCamPosRef.current.set(nodePos.x + 12, nodePos.y + 4, nodePos.z + 16);
          break;
        case 'nacelles':
          targetCamPosRef.current.set(nodePos.x + 16, nodePos.y + 10, nodePos.z + 10);
          break;
        case 'impulse':
          targetCamPosRef.current.set(nodePos.x + 10, nodePos.y + 6, nodePos.z - 14);
          break;
        case 'shuttlebay':
          targetCamPosRef.current.set(nodePos.x + 10, nodePos.y + 4, nodePos.z - 16);
          break;
        case 'engineering':
          targetCamPosRef.current.set(nodePos.x + 15, nodePos.y + 5, nodePos.z + 6);
          break;
        case 'saucer':
        default:
          targetCamPosRef.current.set(26, 14, 30);
          targetLookAtRef.current.set(0, 0, 0);
          break;
      }
    }
  }, [onSelectSection]);

  const setCameraPreset = (preset: 'orbit' | 'fore' | 'dorsal' | 'ventral' | 'nacelles' | 'aft') => {
    lcarsAudio.playBeep(880, 0.05);
    targetLookAtRef.current.set(0, 0, 0);
    switch (preset) {
      case 'fore':
        targetCamPosRef.current.set(0, 3, 36);
        break;
      case 'dorsal':
        targetCamPosRef.current.set(0, 34, 4);
        break;
      case 'ventral':
        targetCamPosRef.current.set(0, -32, 6);
        break;
      case 'nacelles':
        targetCamPosRef.current.set(24, 12, -8);
        break;
      case 'aft':
        targetCamPosRef.current.set(0, 8, -36);
        break;
      case 'orbit':
      default:
        targetCamPosRef.current.set(26, 14, 30);
        break;
    }
  };

  const toggleShields = () => {
    const next = !shieldsActive;
    setShieldsActive(next);
    lcarsAudio.playShieldToggle(next);
  };

  const toggleWarp = () => {
    const next = !warpActive;
    setWarpActive(next);
    if (next) lcarsAudio.playWarp();
    else lcarsAudio.playBeep(440, 0.08);
  };

  const triggerPhaser = () => {
    setIsFiringPhaser(true);
    lcarsAudio.playPhaser();
    setTimeout(() => setIsFiringPhaser(false), 650);
  };

  const triggerTorpedo = () => {
    setIsFiringTorpedo(true);
    lcarsAudio.playPhotonTorpedo();
    setTimeout(() => setIsFiringTorpedo(false), 900);
  };

  const triggerTransporter = () => {
    setIsTransporting(true);
    lcarsAudio.playTransporter();
    setTimeout(() => setIsTransporting(false), 2000);
  };

  // Build the High-Definition Star Trek 3D Model with Three.js
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Responsive Camera Setup (Adaptive FOV for portrait and landscape screens)
    const isPortrait = height > width;
    const fov = isPortrait ? 58 : 42;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1200);
    camera.position.set(26, 14, 30);
    cameraRef.current = camera;

    // Renderer
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({ antialias: !isHeadless, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isHeadless;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 1. Detailed Multi-Layered Deep Space Starfield (for Colored Mode)
    const starCount = 3500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const radius = 180 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[idx + 2] = radius * Math.cos(phi);

      // Realistic Stellar Temperatures (Blue-white, warm yellow, deep red)
      const starType = Math.random();
      if (starType > 0.75) {
        // Hot O/B class star (cyan/blue-white)
        starColors[idx] = 0.65;
        starColors[idx + 1] = 0.85;
        starColors[idx + 2] = 1.0;
      } else if (starType > 0.3) {
        // Main sequence F/G class (white to warm sunlight)
        starColors[idx] = 1.0;
        starColors[idx + 1] = 0.96;
        starColors[idx + 2] = 0.88;
      } else {
        // Red giant/dwarf (warm amber/crimson)
        starColors[idx] = 1.0;
        starColors[idx + 1] = 0.65;
        starColors[idx + 2] = 0.45;
      }
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);
    starfieldRef.current = starfield;

    // Distant cosmic dust particles
    const dustCount = 800;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 320;
      dustPositions[i + 1] = (Math.random() - 0.5) * 180;
      dustPositions[i + 2] = (Math.random() - 0.5) * 320;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.8,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const cosmicDust = new THREE.Points(dustGeo, dustMat);
    scene.add(cosmicDust);
    cosmicDustRef.current = cosmicDust;

    // 2. Dynamic Lighting from a Nearby Star (for Cinematic Photorealistic PBR Mode)
    // Primary Star Directional Light
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 3.8);
    keyLight.position.set(38, 25, 30);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Dynamic Star Rim Light (Casts intense rim glints along the curved saucer rim and nacelle ridges)
    const starRimLight = new THREE.DirectionalLight(0x80b5ff, 3.4);
    starRimLight.position.set(-35, 12, -28);
    scene.add(starRimLight);
    starRimLightRef.current = starRimLight;

    // Deep space soft bounce light
    const bounceLight = new THREE.AmbientLight(0x0d1522, 1.2);
    scene.add(bounceLight);

    // 3. Futuristic Starfleet LCARS Display Screen Turntable Pedestal
    const turntable = createTurntablePedestal();
    scene.add(turntable.group);
    turntablePedestalRef.current = turntable;

    // 4. Dynamic Holographic Scanning Grid Beam
    const scanBeam = createScanningGridBeam();
    scene.add(scanBeam.group);
    scanBeamRef.current = scanBeam;

    // 5. Floating LCARS Technical Telemetry Group
    const telemetry = createFloatingTelemetryGroup();
    scene.add(telemetry);
    floatingTelemetryRef.current = telemetry;

    // 6. Build the High-Definition Studio Enterprise NCC-1701 Model
    const components = buildEnterpriseModel();
    shipComponentsRef.current = components;
    scene.add(components.root);

    // 7. Apply Render Mode (Colored Deep Space vs LCARS Hologram vs CAD Blueprint)
    const isHologram = renderMode === 'hologram';
    const isCad = renderMode === 'cad';

    // Scene Background color
    if (isHologram) {
      scene.background = new THREE.Color(0x03060f); // Dark LCARS tactical display screen
      starfield.visible = false;
      cosmicDust.visible = false;
      turntable.group.visible = true;
      scanBeam.group.visible = true;
      telemetry.visible = true;
      starRimLight.color.setHex(0x00e5ff);
      starRimLight.intensity = 2.4;
      keyLight.intensity = 1.8;
    } else if (isCad) {
      scene.background = new THREE.Color(0x050c18); // CAD blueprint dark navy
      starfield.visible = false;
      cosmicDust.visible = false;
      turntable.group.visible = true;
      scanBeam.group.visible = false;
      telemetry.visible = false;
      starRimLight.intensity = 1.5;
      keyLight.intensity = 2.0;
    } else {
      // Colored Photorealistic Deep Space Orbit Mode
      scene.background = new THREE.Color(0x020308); // Deep space cosmic black
      starfield.visible = true;
      cosmicDust.visible = true;
      turntable.group.visible = false;
      scanBeam.group.visible = false;
      telemetry.visible = false;
      starRimLight.color.setHex(0x80b5ff);
      starRimLight.intensity = 3.4;
      keyLight.intensity = 3.8;
    }

    // Traverse Enterprise meshes to apply mode materials
    components.root.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj !== components.shieldBubble) {
        // Toggle the high-definition wireframe overlay lines
        const wireChild = obj.getObjectByName('hologram_wireframe');
        if (wireChild) {
          wireChild.visible = isHologram || isCad;
        }

        if (isHologram) {
          // Both 3D Holographic Wireframe AND Shaded Model
          // Glowing cyan, orange, and blue semi-transparent holographic projections
          if (obj === components.deflectorDish || obj === components.bussardLeft || obj === components.bussardRight) {
            obj.material = new THREE.MeshStandardMaterial({
              color: 0xff8800,
              emissive: 0xff6600,
              emissiveIntensity: 1.6,
              transparent: true,
              opacity: 0.5,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
              roughness: 0.2,
            });
          } else if (obj === components.warpCoilsLeft || obj === components.warpCoilsRight) {
            obj.material = new THREE.MeshStandardMaterial({
              color: 0x0088ff,
              emissive: 0x00b4d8,
              emissiveIntensity: 2.0,
              transparent: true,
              opacity: 0.6,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
              roughness: 0.1,
            });
          } else {
            // General Starfleet hull semi-transparent cyan holographic projection
            obj.material = new THREE.MeshStandardMaterial({
              color: 0x00c8e6,
              emissive: 0x0088aa,
              emissiveIntensity: 0.85,
              transparent: true,
              opacity: 0.35,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
              roughness: 0.25,
            });
          }
        } else if (isCad) {
          // CAD wireframe blueprint shading
          obj.material = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            wireframe: false,
            metalness: 0.1,
            roughness: 0.8,
            transparent: true,
            opacity: 0.6,
          });
        } else {
          // Colored Mode: Restore photorealistic metallic PBR materials
          if (obj.userData.originalMaterial) {
            obj.material = obj.userData.originalMaterial;
          }
        }
      }
    });

    // Weapons: Dual Phaser Beams
    const phaserMat = new THREE.LineBasicMaterial({
      color: 0xffaa00,
      linewidth: 3,
      transparent: true,
      opacity: 0,
    });
    const phaser1Geo = new THREE.BufferGeometry().setFromPoints([
      components.phaserOriginLeft,
      new THREE.Vector3(26, -10, 48),
    ]);
    const phaser2Geo = new THREE.BufferGeometry().setFromPoints([
      components.phaserOriginRight,
      new THREE.Vector3(26, -10, 48),
    ]);
    const phaserLine1 = new THREE.Line(phaser1Geo, phaserMat);
    const phaserLine2 = new THREE.Line(phaser2Geo, phaserMat);
    scene.add(phaserLine1);
    scene.add(phaserLine2);
    phaserBeamsRef.current = [phaserLine1, phaserLine2];

    // Photon Torpedo
    const torpedoGeo = new THREE.SphereGeometry(0.85, 16, 16);
    const torpedoMat = new THREE.MeshBasicMaterial({
      color: 0xff3300,
      transparent: true,
      opacity: 0,
    });
    const torpedo = new THREE.Mesh(torpedoGeo, torpedoMat);
    torpedo.position.copy(components.torpedoOrigin);
    scene.add(torpedo);
    torpedoRef.current = torpedo;

    // Transporter Shimmer Sparkles
    const transGeo = new THREE.BufferGeometry();
    const transCount = 450;
    const transPositions = new Float32Array(transCount * 3);
    for (let i = 0; i < transCount * 3; i += 3) {
      transPositions[i] = (Math.random() - 0.5) * 8;
      transPositions[i + 1] = (Math.random() - 0.5) * 12 + 2;
      transPositions[i + 2] = (Math.random() - 0.5) * 8 + 4;
    }
    transGeo.setAttribute('position', new THREE.BufferAttribute(transPositions, 3));
    const transMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.7,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const transParticles = new THREE.Points(transGeo, transMat);
    scene.add(transParticles);
    transporterParticlesRef.current = transParticles;

    // Touch & Pointer Orbit Controls
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevX = clientX;
      prevY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevX;
      const deltaY = clientY - prevY;
      prevX = clientX;
      prevY = clientY;

      components.root.rotation.y += deltaX * 0.008;
      components.root.rotation.x = Math.max(-0.65, Math.min(0.65, components.root.rotation.x + deltaY * 0.008));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.04;
      targetCamPosRef.current.multiplyScalar(1 + zoomFactor * 0.05);
      targetCamPosRef.current.clampLength(12, 90);
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Camera lerp towards target coordinates
      camera.position.lerp(targetCamPosRef.current, delta * 3.8);
      camera.lookAt(targetLookAtRef.current);

      // Orbit speed multiplier
      const speedMultiplier = orbitSpeed === 'slow' ? 0.09 : orbitSpeed === 'fast' ? 0.28 : 0.16;

      // Smooth Continuous 360-degree orbital rotation
      if (isAutoRotate && !isDragging) {
        components.root.rotation.y += delta * speedMultiplier;
      }

      // 1. Holographic Mode Animations
      if (isHologram) {
        // Rotating radar sweep line on the turntable pedestal
        if (turntable.radarSweep) {
          turntable.radarSweep.rotation.y += delta * 1.5;
        }

        // Scanning grid lines passing smoothly over the ship (bow to aft and back)
        if (scanBeam) {
          const scanZ = Math.sin(time * 0.9) * 16;
          scanBeam.group.position.z = scanZ;
          scanBeam.scanLight.intensity = 2.8 + Math.sin(time * 8) * 0.8;
          scanBeam.scanSheet.rotation.y = Math.sin(time * 0.5) * 0.05;
        }

        // Telemetry floating panels subtle levitation
        if (telemetry) {
          telemetry.children.forEach((child, i) => {
            if (child instanceof THREE.Mesh) {
              child.position.y += Math.sin(time * 2 + i) * 0.003;
            }
          });
        }
      }

      // 2. Colored Photorealistic Deep Space Animations
      if (!isHologram && !isCad) {
        // Starfield warp streak or subtle stellar drift
        if (starfield) {
          if (warpActive) {
            starfield.rotation.z += delta * 1.8;
            starfield.position.z = (starfield.position.z + delta * 140) % 150;
          } else {
            starfield.rotation.y += delta * 0.015;
          }
        }

        // Spin internal Bussard intake turbines
        if (components.turbineLeft) components.turbineLeft.rotation.z += delta * 4;
        if (components.turbineRight) components.turbineRight.rotation.z += delta * 4;

        // Bussard Ramscoop pulsing amber/ruby red glow
        const bussardPulse = 1.4 + Math.sin(time * 6) * 0.5;
        if (components.bussardLeft.material instanceof THREE.MeshStandardMaterial) {
          components.bussardLeft.material.emissiveIntensity = bussardPulse;
        }
        if (components.bussardRight.material instanceof THREE.MeshStandardMaterial) {
          components.bussardRight.material.emissiveIntensity = bussardPulse;
        }

        // Navigational Deflector dish warm amber glow
        if (components.deflectorDish.material instanceof THREE.MeshStandardMaterial) {
          components.deflectorDish.material.emissiveIntensity = redAlertActive
            ? 3.2 + Math.sin(time * 8) * 0.8
            : 2.2 + Math.sin(time * 3) * 0.4;
        }

        // Warp Nacelles glowing blue grilles and coils
        const warpGlow = warpActive ? 3.5 + Math.sin(time * 12) * 0.8 : 1.2;
        if (components.warpCoilsLeft.material instanceof THREE.MeshStandardMaterial) {
          components.warpCoilsLeft.material.emissiveIntensity = warpGlow;
        }
        if (components.warpCoilsRight.material instanceof THREE.MeshStandardMaterial) {
          components.warpCoilsRight.material.emissiveIntensity = warpGlow;
        }

        // Impulse engines glowing red-orange plasma
        if (components.impulseEngine.material instanceof THREE.MeshStandardMaterial) {
          components.impulseEngine.material.emissiveIntensity = 1.6 + Math.sin(time * 5) * 0.4;
        }
      }

      // 3. Deflector Shield Bubble
      if (components.shieldBubble) {
        const shieldMat = components.shieldBubble.material as THREE.MeshStandardMaterial;
        if (shieldsActive) {
          shieldMat.opacity = 0.35 + Math.sin(time * 4) * 0.15;
          components.shieldBubble.rotation.y += delta * 0.4;
        } else {
          shieldMat.opacity = Math.max(0, shieldMat.opacity - delta * 2.5);
        }
      }

      // 4. Weapons: Phasers
      if (phaserBeamsRef.current.length > 0) {
        phaserBeamsRef.current.forEach((beam) => {
          const mat = beam.material as THREE.LineBasicMaterial;
          mat.opacity = isFiringPhaser ? 0.95 + Math.sin(time * 30) * 0.05 : 0;
        });
      }

      // 5. Weapons: Photon Torpedo
      if (torpedoRef.current) {
        const tMat = torpedoRef.current.material as THREE.MeshBasicMaterial;
        if (isFiringTorpedo) {
          tMat.opacity = 1.0;
          torpedoRef.current.position.z += delta * 95;
          torpedoRef.current.scale.setScalar(1.0 + Math.sin(time * 20) * 0.25);
        } else {
          tMat.opacity = 0;
          torpedoRef.current.position.copy(components.torpedoOrigin);
        }
      }

      // 6. Transporter Sparkles
      if (transporterParticlesRef.current) {
        const tpMat = transporterParticlesRef.current.material as THREE.PointsMaterial;
        if (isTransporting) {
          tpMat.opacity = 0.85 + Math.sin(time * 25) * 0.15;
          transporterParticlesRef.current.rotation.y += delta * 4;
        } else {
          tpMat.opacity = 0;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      const isPort = h > w;
      cameraRef.current.fov = isPort ? 58 : 42;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(animationId);

      scene.clear();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [renderMode, isAutoRotate, orbitSpeed, warpActive, shieldsActive, isFiringPhaser, isFiringTorpedo, isTransporting, redAlertActive]);

  const currentSectionData = SHIP_SECTIONS[selectedSection];

  return (
    <div className="relative w-full h-full min-h-[380px] overflow-hidden bg-black select-none flex flex-col justify-between">
      {/* 3D Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0" />

      {/* Top Overlay Banner & Visual Mode Switcher */}
      <div className="relative z-10 p-2 sm:p-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Title Badge */}
        <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border-l-4 border-[#e8732a] pointer-events-auto shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#f5b335] uppercase tracking-wider">
                CONSTITUTION REFIT // NCC-1701
              </span>
              <span className="px-1.5 py-0.2 bg-[#e8732a]/20 border border-[#e8732a]/40 text-[#f5b335] text-[9px] font-mono rounded">
                {renderMode === 'colored' ? '4K PHOTOREALISTIC' : renderMode === 'hologram' ? 'LCARS HOLOGRAM' : 'CAD BLUEPRINT'}
              </span>
            </div>
            <h2 className="text-xs sm:text-base font-bold text-[#f6e6b4] lcars-title leading-tight">
              U.S.S. ENTERPRISE <span className="text-[#e8732a]">3D ORBITAL SCHEMATIC</span>
            </h2>
          </div>
          {redAlertActive && (
            <span className="px-1.5 py-0.5 bg-red-950 text-red-400 border border-red-500 text-[10px] font-bold rounded animate-pulse">
              RED ALERT
            </span>
          )}
        </div>

        {/* Visual Mode Selector: Colored (Deep Space) vs Holographic (LCARS Turntable) vs CAD */}
        <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded-lg border border-[#e8732a]/40 pointer-events-auto">
          {[
            { id: 'colored', label: 'COLORED', sub: 'Deep Space Orbit', icon: Palette },
            { id: 'hologram', label: 'HOLOGRAPHIC', sub: 'LCARS Telemetry', icon: Eye },
            { id: 'cad', label: 'CAD WIREFRAME', sub: 'Blueprint', icon: Box },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSel = renderMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setRenderMode(mode.id as any);
                  lcarsAudio.playBeep(880, 0.05);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase rounded transition-all ${
                  isSel
                    ? 'bg-[#f5b335] text-black font-bold shadow-md'
                    : 'bg-[#181822] text-[#f6e6b4] hover:bg-[#252535]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}

          {/* Orbit Speed Selector */}
          <div className="flex items-center border-l border-white/15 pl-1.5 ml-0.5 gap-1">
            <button
              onClick={() => {
                const speeds: ('slow' | 'normal' | 'fast')[] = ['slow', 'normal', 'fast'];
                const next = speeds[(speeds.indexOf(orbitSpeed) + 1) % speeds.length];
                setOrbitSpeed(next);
                lcarsAudio.playBeep(720, 0.04);
              }}
              title="Change Orbit Speed"
              className="px-2 py-1 bg-[#181822] hover:bg-[#252535] text-[#f5b335] text-[10px] font-mono rounded flex items-center gap-1"
            >
              <Gauge className="w-3 h-3 text-[#f5b335]" />
              <span className="uppercase">{orbitSpeed}</span>
            </button>

            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              title="Toggle 360° Orbit Rotation"
              className={`p-1.5 rounded transition-colors ${
                isAutoRotate ? 'bg-[#e8732a] text-black font-bold' : 'bg-[#181822] text-[#f6e6b4]'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Section Info Card (Desktop & Landscape) */}
      <div className="relative z-10 self-end mr-2 sm:mr-4 max-w-xs sm:max-w-sm pointer-events-auto hidden md:block">
        <div className="bg-black/90 backdrop-blur-md border-r-4 border-[#e8732a] p-3 rounded-l-lg border-y border-l border-white/10 shadow-2xl text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[#f5b335]">
            <span className="font-mono uppercase tracking-wider">{currentSectionData.decks}</span>
            <span className="text-[#f6e6b4] font-bold uppercase">{currentSectionData.name}</span>
          </div>
          <p className="text-[#e8a558] font-mono text-[11px] leading-tight">
            {currentSectionData.system}
          </p>
          <div className="p-2 bg-blue-950/40 rounded border border-blue-500/30 text-[10.5px] text-gray-200">
            <span className="text-[#f5b335] font-bold block mb-0.5">■ REAL SCIENCE:</span>
            {currentSectionData.realScience}
          </div>
          <div className="p-2 bg-amber-950/30 rounded border border-amber-500/30 text-[10.5px] text-gray-200">
            <span className="text-[#e8732a] font-bold block mb-0.5">■ STAR TREK CANON:</span>
            {currentSectionData.canonLore}
          </div>
        </div>
      </div>

      {/* Bottom Control Dock (Clean & Mobile-Friendly) */}
      <div className="relative z-20 pb-2 px-2 flex flex-col items-center pointer-events-auto">
        <button
          onClick={() => {
            setHudCollapsed(!hudCollapsed);
            lcarsAudio.playBeep(700, 0.05);
          }}
          className="mb-1 flex items-center gap-1.5 px-3 py-1 bg-black/90 hover:bg-[#e8732a]/30 border border-[#f5b335]/40 rounded-t-lg text-[10px] font-mono uppercase tracking-wider text-[#f5b335] backdrop-blur-md"
        >
          {hudCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {hudCollapsed ? 'EXPAND CONTROLS' : 'COLLAPSE CONTROLS'}
        </button>

        {!hudCollapsed && (
          <div className="w-full max-w-4xl bg-black/92 border-t-2 border-x-2 border-[#f5b335] rounded-b-xl backdrop-blur-lg p-2 sm:p-3 shadow-2xl space-y-2">
            {/* Row 1: Camera Quick Angles & Section Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#f5b335] whitespace-nowrap pl-1">
                VIEW:
              </span>
              <button
                onClick={() => setCameraPreset('orbit')}
                className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1e293b] text-[#38bdf8] hover:bg-[#334155]"
              >
                360° ORBIT
              </button>
              <button
                onClick={() => setCameraPreset('fore')}
                className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1e293b] text-[#38bdf8] hover:bg-[#334155]"
              >
                FORE BOW
              </button>
              <button
                onClick={() => setCameraPreset('dorsal')}
                className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1e293b] text-[#38bdf8] hover:bg-[#334155]"
              >
                DORSAL
              </button>
              <button
                onClick={() => setCameraPreset('ventral')}
                className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1e293b] text-[#38bdf8] hover:bg-[#334155]"
              >
                VENTRAL
              </button>
              <button
                onClick={() => setCameraPreset('nacelles')}
                className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1e293b] text-[#38bdf8] hover:bg-[#334155]"
              >
                NACELLES
              </button>
              <button
                onClick={() => setCameraPreset('aft')}
                className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1e293b] text-[#38bdf8] hover:bg-[#334155]"
              >
                AFT IMPULSE
              </button>

              <span className="text-[10px] uppercase font-mono tracking-wider text-[#f5b335] whitespace-nowrap pl-2 border-l border-white/20">
                INSPECT:
              </span>
              {(Object.keys(SHIP_SECTIONS) as ShipSectionId[]).map((secId) => {
                const sec = SHIP_SECTIONS[secId];
                const isSelected = selectedSection === secId;
                return (
                  <button
                    key={secId}
                    onClick={() => handleSelectSection(secId)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wide whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-[#f5b335] text-black font-bold shadow-md'
                        : 'bg-[#181822] text-[#f6e6b4] hover:bg-[#252535] border border-white/10'
                    }`}
                  >
                    {sec.name}
                  </button>
                );
              })}
            </div>

            {/* Quick Inquiries Prompt Pill Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-0.5">
              <span className="text-[10px] font-mono text-[#f5b335] uppercase tracking-wider flex items-center gap-1 whitespace-nowrap pl-1">
                <HelpCircle className="w-3 h-3 text-[#f5b335]" />
                QUICK INQUIRY:
              </span>
              {[
                'Why is the bridge on Deck 1 instead of inside?',
                'How does the Alcubierre warp field bend space?',
                'What happens if antimatter containment fails?',
                'How does the deflector dish clear space debris?',
                'How do transporters resolve Heisenberg uncertainty?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    if (onAskComputer) onAskComputer(q);
                    lcarsAudio.playChime();
                  }}
                  className="px-2.5 py-0.5 bg-[#101222] hover:bg-[#1a2038] border border-blue-400/30 hover:border-blue-400/70 text-[#99ccff] text-[10px] font-mono rounded-full whitespace-nowrap transition-all cursor-pointer shadow flex items-center gap-1"
                >
                  <span>{q}</span>
                </button>
              ))}
            </div>

            {/* Row 2: Ship Interactive Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-1 border-t border-white/10">
              <button
                onClick={() => {
                  setIsDiagnosticsOpen(true);
                  lcarsAudio.playChime();
                }}
                className="flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider bg-[#101528] hover:bg-[#182040] text-[#38bdf8] border border-[#38bdf8]/40 shadow-md font-bold transition-all cursor-pointer"
              >
                <Sliders className="w-3 h-3 text-[#38bdf8]" />
                <span>DIAGNOSTICS</span>
              </button>

              <button
                onClick={toggleWarp}
                className={`flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  warpActive
                    ? 'bg-[#0088ff] text-white font-bold shadow-lg shadow-blue-500/40'
                    : 'bg-[#121422] text-[#99ccff] hover:bg-[#1a2035] border border-blue-500/30'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>WARP {warpActive ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={toggleShields}
                className={`flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  shieldsActive
                    ? 'bg-[#00ccff] text-black font-bold shadow-lg shadow-cyan-500/40'
                    : 'bg-[#121422] text-[#3399cc] hover:bg-[#1a2035] border border-cyan-500/30'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>SHIELDS {shieldsActive ? 'UP' : 'DOWN'}</span>
              </button>

              <button
                onClick={triggerPhaser}
                disabled={isFiringPhaser}
                className={`flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  isFiringPhaser
                    ? 'bg-[#ffaa00] text-black font-bold animate-pulse'
                    : 'bg-[#161420] text-[#ffaa00] hover:bg-[#251e28] border border-amber-500/30'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>PHASERS</span>
              </button>

              <button
                onClick={triggerTorpedo}
                disabled={isFiringTorpedo}
                className={`flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  isFiringTorpedo
                    ? 'bg-[#ff2200] text-white font-bold'
                    : 'bg-[#161218] text-[#ff5544] hover:bg-[#25181a] border border-red-500/30'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>TORPEDO</span>
              </button>

              <button
                onClick={triggerTransporter}
                disabled={isTransporting}
                className={`flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  isTransporting
                    ? 'bg-[#ffd700] text-black font-bold'
                    : 'bg-[#16141a] text-[#ffd700] hover:bg-[#242018] border border-yellow-500/30'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>BEAM UP</span>
              </button>

              <button
                onClick={() => {
                  targetCamPosRef.current.set(26, 14, 30);
                  targetLookAtRef.current.set(0, 0, 0);
                  lcarsAudio.playBeep(780, 0.05);
                }}
                className="flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider bg-[#181822] text-[#f6e6b4] hover:bg-[#252535] border border-white/10 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>RESET VIEW</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subsystem Diagnostics & Stress Test Modal */}
      <ShipDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        onAskComputer={onAskComputer}
      />
    </div>
  );
};
