/**
 * Interactive 3D USS Enterprise (NCC-1701) Main Bridge Interior Model
 * Features:
 * - Circular multi-tiered 3D bridge deck with sunken central command pit
 * - Curved red-orange anodized safety railings & rear crimson turbolift alcove
 * - Wide curved panoramic Main Viewscreen on forward bulkhead with live 3D outer space
 *   (streaming stars, warp streaks, ringed exoplanet, Mutara nebula, tactical target & weapons FX)
 * - 5 Core Interactive Stations with procedural backlit button matrices & upper monitors:
 *   1. Captain's Chair (Center Pedestal with glowing armrest pads)
 *   2. Helm & Navigation Island (Forward dual console with astrogation orb)
 *   3. Science Station (Starboard-Fore alcove with Spock's hooded sensor viewer)
 *   4. Tactical / Defense Station (Port-Fore alcove with targeting & shield matrix)
 *   5. Communications Station (Starboard-Aft alcove with subspace waveform arrays)
 * - Stylized 3D Senior Bridge Crew at their stations (Captain, Spock, Sulu, Chekov, Uhura, Tactical)
 */

import * as THREE from 'three';

export type BridgeStationId = 'captain' | 'helm' | 'tactical' | 'science' | 'comms';

export interface StationCameraPose {
  id: BridgeStationId;
  label: string;
  officerName: string;
  officerTitle: string;
  position: THREE.Vector3;
  defaultYaw: number;
  defaultPitch: number;
  consolePos: THREE.Vector3;
}

export interface BridgeInteriorController {
  group: THREE.Group;
  interactables: THREE.Object3D[];
  stationPoses: Record<BridgeStationId, StationCameraPose>;
  setAlertMode: (mode: 'normal' | 'yellow' | 'red') => void;
  setWarpFactor: (wf: number, mode: 'sublight' | 'impulse' | 'warp') => void;
  setHeadingPitch: (headingDeg: number, pitchDeg: number) => void;
  setTargetLocked: (locked: boolean) => void;
  setScanWaveActive: (active: boolean, colorHex?: number) => void;
  fireBridgePhasers: () => void;
  fireBridgeTorpedo: () => void;
  pulseShields: (freqNormalized: number) => void;
  highlightStation: (station: BridgeStationId) => void;
  update: (delta: number, elapsed: number) => void;
  dispose: () => void;
}

/**
 * Generates a high-resolution procedural CanvasTexture for backlit Starfleet console button matrices
 */
function createConsoleMatrixTexture(
  primaryHex: string,
  secondaryHex: string,
  stationTitle: string
): { map: THREE.CanvasTexture; emissiveMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark obsidian console bezel
  ctx.fillStyle = '#090d14';
  ctx.fillRect(0, 0, 512, 256);

  // Outer LCARS frame bar
  ctx.fillStyle = primaryHex;
  ctx.fillRect(10, 10, 12, 236);
  ctx.fillRect(10, 10, 492, 16);

  // Station header text
  ctx.fillStyle = '#090d14';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(stationTitle, 28, 22);

  // Backlit tactile jelly-buttons grid (TOS / Kelvin hybrid)
  const colors = [primaryHex, secondaryHex, '#ffaa22', '#22ddff', '#ff4455', '#44ff88', '#ffffff'];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      const bx = 34 + col * 26;
      const by = 40 + row * 28;
      const pick = (row * 7 + col * 3) % colors.length;
      ctx.fillStyle = colors[pick];
      ctx.beginPath();
      ctx.roundRect(bx, by, 20, 18, 3);
      ctx.fill();
    }
  }

  // Right-side telemetry circular radar & bar gauges
  const cx = 395;
  const cy = 110;
  ctx.strokeStyle = secondaryHex;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 48, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = primaryHex;
  ctx.beginPath();
  ctx.moveTo(cx - 52, cy);
  ctx.lineTo(cx + 52, cy);
  ctx.moveTo(cx, cy - 52);
  ctx.lineTo(cx, cy + 52);
  ctx.stroke();

  // Bottom linear slider bars
  for (let i = 0; i < 6; i++) {
    const sx = 34 + i * 44;
    ctx.fillStyle = '#182232';
    ctx.fillRect(sx, 192, 32, 46);
    const fillH = 14 + ((i * 13) % 28);
    ctx.fillStyle = i % 2 === 0 ? primaryHex : secondaryHex;
    ctx.fillRect(sx + 2, 192 + (44 - fillH), 28, fillH);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { map: tex, emissiveMap: tex };
}

/**
 * Creates a stylized 3D Starfleet Officer mesh group at a station
 */
function createCrewOfficer(
  shirtHex: number,
  skinHex: number,
  hairHex: number,
  isStanding = false,
  hasEarpiece = false
): THREE.Group {
  const crew = new THREE.Group();

  const tunicMat = new THREE.MeshStandardMaterial({
    color: shirtHex,
    roughness: 0.65,
    metalness: 0.08,
  });
  const trousersMat = new THREE.MeshStandardMaterial({
    color: 0x111318,
    roughness: 0.75,
    metalness: 0.05,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinHex,
    roughness: 0.55,
    metalness: 0.02,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: hairHex,
    roughness: 0.7,
    metalness: 0.05,
  });
  const goldBraidMat = new THREE.MeshStandardMaterial({
    color: 0xffc433,
    roughness: 0.3,
    metalness: 0.8,
  });

  const baseY = isStanding ? 0.0 : -0.18;

  // Torso (Starfleet duty tunic with black collar)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 0.52, 16), tunicMat);
  torso.position.set(0, baseY + 0.92, 0);
  crew.add(torso);

  // Black Starfleet collar ring
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.07, 16), trousersMat);
  collar.position.set(0, baseY + 1.19, 0);
  crew.add(collar);

  // Starfleet Delta Insignia on chest
  const badge = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 3), goldBraidMat);
  badge.position.set(-0.08, baseY + 1.04, -0.17);
  badge.rotation.x = -0.15;
  crew.add(badge);

  // Shoulders & Arms reaching toward console
  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.36, 8, 8), tunicMat);
    arm.position.set(side * 0.22, baseY + 0.88, -0.14);
    arm.rotation.x = Math.PI / 3.2;
    arm.rotation.z = -side * 0.15;
    crew.add(arm);

    // Sleeve rank braid
    const braid = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.008, 8, 16), goldBraidMat);
    braid.position.set(side * 0.24, baseY + 0.76, -0.26);
    braid.rotation.x = Math.PI / 3.2;
    crew.add(braid);

    // Hand
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), skinMat);
    hand.position.set(side * 0.24, baseY + 0.72, -0.32);
    crew.add(hand);

    // Legs
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.45, 8, 8), trousersMat);
    if (isStanding) {
      leg.position.set(side * 0.09, 0.38, 0);
    } else {
      leg.position.set(side * 0.09, 0.42, -0.16);
      leg.rotation.x = Math.PI / 2.6;
    }
    crew.add(leg);
  });

  // Head & Hair
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 20, 20), skinMat);
  head.position.set(0, baseY + 1.32, 0);
  crew.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.132, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hair.position.set(0, baseY + 1.33, 0.01);
  hair.rotation.x = -0.15;
  crew.add(hair);

  // Optional Communications Earpiece (for Lt. Uhura)
  if (hasEarpiece) {
    const earpiece = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.035, 0.08, 12),
      new THREE.MeshStandardMaterial({
        color: 0xe6edf5,
        metalness: 0.9,
        roughness: 0.15,
        emissive: 0x22d3ee,
        emissiveIntensity: 0.5,
      })
    );
    earpiece.position.set(-0.13, baseY + 1.31, -0.02);
    earpiece.rotation.z = Math.PI / 3;
    crew.add(earpiece);
  }

  return crew;
}

export function createBridgeInteriorModel(): BridgeInteriorController {
  const root = new THREE.Group();
  root.name = 'USS_Enterprise_Bridge_Interior';

  const interactables: THREE.Object3D[] = [];
  const disposableTextures: THREE.Texture[] = [];
  const disposableGeometries: THREE.BufferGeometry[] = [];
  const disposableMaterials: THREE.Material[] = [];

  // Shared PBR Architecture Materials
  const deckFloorMat = new THREE.MeshStandardMaterial({
    color: 0x161b24,
    roughness: 0.68,
    metalness: 0.22,
  });
  const upperDeckMat = new THREE.MeshStandardMaterial({
    color: 0x202736,
    roughness: 0.52,
    metalness: 0.35,
  });
  const bulkheadPearlMat = new THREE.MeshStandardMaterial({
    color: 0x9aa6b8,
    roughness: 0.42,
    metalness: 0.38,
  });
  const darkChromeMat = new THREE.MeshStandardMaterial({
    color: 0x283242,
    roughness: 0.25,
    metalness: 0.82,
  });
  const consoleBodyMat = new THREE.MeshStandardMaterial({
    color: 0x121722,
    roughness: 0.38,
    metalness: 0.62,
  });
  // Iconic TOS / Kelvin Red-Orange Safety Railing & Turbolift Trim
  const railingRedMat = new THREE.MeshStandardMaterial({
    color: 0xe0341e,
    emissive: new THREE.Color(0x550800),
    emissiveIntensity: 0.35,
    roughness: 0.24,
    metalness: 0.48,
  });
  const alertLightMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: new THREE.Color(0x00aaff),
    emissiveIntensity: 1.8,
    roughness: 0.2,
  });
  const ceilingDomeGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfff8eb,
    emissive: new THREE.Color(0xdbeafe),
    emissiveIntensity: 1.35,
    roughness: 0.3,
  });

  disposableMaterials.push(
    deckFloorMat,
    upperDeckMat,
    bulkheadPearlMat,
    darkChromeMat,
    consoleBodyMat,
    railingRedMat,
    alertLightMat,
    ceilingDomeGlowMat
  );

  // ============================================================================
  // 1. MULTI-TIERED CIRCULAR BRIDGE DECK, RAILINGS & BULKHEADS
  // ============================================================================

  // Central Sunken Command Pit Floor (Radius 4.6m, Y = 0)
  const centralFloor = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.2, 64), deckFloorMat);
  centralFloor.position.y = -0.1;
  centralFloor.receiveShadow = true;
  root.add(centralFloor);

  // Concentric glowing floor accent ring around Captain's Pit
  const pitGlowRing = new THREE.Mesh(
    new THREE.RingGeometry(4.48, 4.58, 64),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  pitGlowRing.rotation.x = -Math.PI / 2;
  pitGlowRing.position.y = 0.01;
  root.add(pitGlowRing);

  // Elevated Outer Perimeter Walkway Ring (Inner R = 4.6m, Outer R = 8.9m, Y = +0.38m)
  const outerRingShape = new THREE.Shape();
  outerRingShape.absarc(0, 0, 8.9, 0, Math.PI * 2, false);
  const innerHolePath = new THREE.Path();
  innerHolePath.absarc(0, 0, 4.6, 0, Math.PI * 2, true);
  outerRingShape.holes.push(innerHolePath);

  const outerDeckGeo = new THREE.ExtrudeGeometry(outerRingShape, {
    depth: 0.38,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    curveSegments: 64,
  });
  outerDeckGeo.rotateX(Math.PI / 2);
  const outerDeckMesh = new THREE.Mesh(outerDeckGeo, upperDeckMat);
  outerDeckMesh.position.y = 0.38;
  outerDeckMesh.receiveShadow = true;
  root.add(outerDeckMesh);

  // Curved Red-Orange Safety Railings framing the sunken command pit
  const railArcAngles = [
    { start: 0.28, len: 1.05 },
    { start: 1.65, len: 1.15 },
    { start: 3.45, len: 1.15 },
    { start: 4.95, len: 0.98 },
  ];
  railArcAngles.forEach((arc) => {
    const topRailGeo = new THREE.TorusGeometry(4.68, 0.048, 16, 40, arc.len);
    topRailGeo.rotateX(Math.PI / 2);
    topRailGeo.rotateY(arc.start);
    const topRail = new THREE.Mesh(topRailGeo, railingRedMat);
    topRail.position.y = 1.12;
    root.add(topRail);

    const midRailGeo = new THREE.TorusGeometry(4.68, 0.028, 12, 40, arc.len);
    midRailGeo.rotateX(Math.PI / 2);
    midRailGeo.rotateY(arc.start);
    const midRail = new THREE.Mesh(midRailGeo, darkChromeMat);
    midRail.position.y = 0.78;
    root.add(midRail);

    // Vertical Stanchion Posts along each arc
    const postCount = 4;
    for (let i = 0; i <= postCount; i++) {
      const a = arc.start + (arc.len * i) / postCount;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.045, 0.76, 12),
        railingRedMat
      );
      post.position.set(Math.cos(a) * 4.68, 0.76, -Math.sin(a) * 4.68);
      root.add(post);
    }
  });

  // Outer Circular Bulkhead Wall (with open forward cutout for the Panoramic Viewscreen!)
  // Forward viewscreen spans roughly angle -Math.PI*0.72 to -Math.PI*0.28 in Z-negative
  const wallGeo = new THREE.CylinderGeometry(8.85, 8.85, 4.4, 64, 1, true, -Math.PI * 0.76, Math.PI * 1.52);
  const wallMesh = new THREE.Mesh(wallGeo, bulkheadPearlMat);
  wallMesh.position.y = 2.55;
  wallMesh.material.side = THREE.DoubleSide;
  root.add(wallMesh);

  // Structural Radial Ribs & Recessed Alert Light Strips around the Bridge Perimeter
  const ribCount = 14;
  for (let i = 0; i < ribCount; i++) {
    const angle = (i / ribCount) * Math.PI * 2;
    // Skip ribs directly blocking the center of the forward Main Viewscreen (-Z axis)
    if (Math.sin(angle) < -0.78 && Math.abs(Math.cos(angle)) < 0.62) continue;

    const ribGroup = new THREE.Group();
    ribGroup.rotation.y = angle;
    root.add(ribGroup);

    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 4.4, 0.42), darkChromeMat);
    pillar.position.set(0, 2.55, 8.65);
    ribGroup.add(pillar);

    const lightStrip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 3.6, 0.46), alertLightMat);
    lightStrip.position.set(0, 2.55, 8.62);
    ribGroup.add(lightStrip);
  }

  // Upper Ceiling Dome Structure & Concentric Overhead Starfleet Illumination Rings
  const ceilingRing = new THREE.Mesh(
    new THREE.RingGeometry(2.4, 8.85, 64),
    new THREE.MeshStandardMaterial({ color: 0x141923, roughness: 0.6, metalness: 0.4, side: THREE.DoubleSide })
  );
  ceilingRing.rotation.x = Math.PI / 2;
  ceilingRing.position.y = 4.65;
  root.add(ceilingRing);

  const overheadGlowRing = new THREE.Mesh(new THREE.RingGeometry(2.8, 3.6, 48), ceilingDomeGlowMat);
  overheadGlowRing.rotation.x = Math.PI / 2;
  overheadGlowRing.position.y = 4.62;
  root.add(overheadGlowRing);

  // Rear Red Turbolift Alcove (Aft Bulkhead, Z = +8.55, X = -1.8)
  const turboliftGroup = new THREE.Group();
  turboliftGroup.position.set(-1.8, 0.38, 8.45);
  turboliftGroup.rotation.y = Math.PI + 0.21;
  root.add(turboliftGroup);

  const liftFrame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.75, 0.38), darkChromeMat);
  liftFrame.position.y = 1.38;
  turboliftGroup.add(liftFrame);

  const liftDoors = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.48, 0.42), railingRedMat);
  liftDoors.position.y = 1.32;
  turboliftGroup.add(liftDoors);

  const liftSeam = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.48, 0.44), darkChromeMat);
  liftSeam.position.y = 1.32;
  turboliftGroup.add(liftSeam);

  const liftHeaderLight = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.45), alertLightMat);
  liftHeaderLight.position.y = 2.66;
  turboliftGroup.add(liftHeaderLight);

  // ============================================================================
  // 2. CURVED PANORAMIC "MAIN VIEWSCREEN" & LIVE 3D OUTER SPACE BEYOND
  // ============================================================================

  // Forward Bevelled Frame housing the Main Viewscreen
  const viewscreenFrameBottom = new THREE.Mesh(
    new THREE.CylinderGeometry(8.75, 8.75, 0.42, 48, 1, true, Math.PI * 0.76, Math.PI * 0.48),
    darkChromeMat
  );
  viewscreenFrameBottom.position.y = 0.65;
  viewscreenFrameBottom.material.side = THREE.DoubleSide;
  root.add(viewscreenFrameBottom);

  const viewscreenFrameTop = new THREE.Mesh(
    new THREE.CylinderGeometry(8.75, 8.75, 0.45, 48, 1, true, Math.PI * 0.76, Math.PI * 0.48),
    darkChromeMat
  );
  viewscreenFrameTop.position.y = 4.35;
  viewscreenFrameTop.material.side = THREE.DoubleSide;
  root.add(viewscreenFrameTop);

  // Subtle holographic reticle frame lines along top & bottom of Main Viewscreen
  const vsGlowTrim = new THREE.Mesh(
    new THREE.CylinderGeometry(8.7, 8.7, 0.06, 48, 1, true, Math.PI * 0.76, Math.PI * 0.48),
    alertLightMat
  );
  vsGlowTrim.position.y = 0.88;
  vsGlowTrim.material.side = THREE.DoubleSide;
  root.add(vsGlowTrim);

  // Live 3D Outer SpaceDiorama Group (Positioned outside forward viewscreen at -Z)
  const outerSpaceGroup = new THREE.Group();
  outerSpaceGroup.position.set(0, 2.4, -28);
  root.add(outerSpaceGroup);

  // 2A. Streaming 3D Stars visible through the Main Viewscreen
  const vsStarCount = 2600;
  const vsStarGeo = new THREE.BufferGeometry();
  const vsStarPos = new Float32Array(vsStarCount * 3);
  const vsStarCol = new Float32Array(vsStarCount * 3);
  const vsStarSpd = new Float32Array(vsStarCount);

  for (let i = 0; i < vsStarCount; i++) {
    vsStarPos[i * 3] = (Math.random() - 0.5) * 160;
    vsStarPos[i * 3 + 1] = (Math.random() - 0.5) * 95;
    vsStarPos[i * 3 + 2] = -Math.random() * 180;
    vsStarSpd[i] = 18 + Math.random() * 42;

    const c = Math.random();
    if (c < 0.45) {
      vsStarCol[i * 3] = 0.65;
      vsStarCol[i * 3 + 1] = 0.86;
      vsStarCol[i * 3 + 2] = 1.0;
    } else if (c < 0.82) {
      vsStarCol[i * 3] = 0.98;
      vsStarCol[i * 3 + 1] = 0.98;
      vsStarCol[i * 3 + 2] = 1.0;
    } else {
      vsStarCol[i * 3] = 1.0;
      vsStarCol[i * 3 + 1] = 0.78;
      vsStarCol[i * 3 + 2] = 0.52;
    }
  }
  vsStarGeo.setAttribute('position', new THREE.BufferAttribute(vsStarPos, 3));
  vsStarGeo.setAttribute('color', new THREE.BufferAttribute(vsStarCol, 3));
  const vsStarMat = new THREE.PointsMaterial({
    size: 0.65,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const vsStars = new THREE.Points(vsStarGeo, vsStarMat);
  outerSpaceGroup.add(vsStars);

  // 2B. Relativistic Warp Streaks on the Main Viewscreen
  const vsStreakCount = 650;
  const vsStreakGeo = new THREE.BufferGeometry();
  const vsStreakPos = new Float32Array(vsStreakCount * 6);
  const vsStreakCol = new Float32Array(vsStreakCount * 6);
  const vsStreakBase = new Float32Array(vsStreakCount * 3);

  for (let i = 0; i < vsStreakCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = 4.5 + Math.random() * 55;
    const x = Math.cos(angle) * rad;
    const y = Math.sin(angle) * (rad * 0.65);
    const z = -Math.random() * 160;
    vsStreakBase[i * 3] = x;
    vsStreakBase[i * 3 + 1] = y;
    vsStreakBase[i * 3 + 2] = z;

    vsStreakPos[i * 6] = x;
    vsStreakPos[i * 6 + 1] = y;
    vsStreakPos[i * 6 + 2] = z;
    vsStreakPos[i * 6 + 3] = x;
    vsStreakPos[i * 6 + 4] = y;
    vsStreakPos[i * 6 + 5] = z - 8;

    const isRed = Math.random() < 0.15;
    vsStreakCol[i * 6] = isRed ? 1.0 : 0.85;
    vsStreakCol[i * 6 + 1] = isRed ? 0.55 : 0.96;
    vsStreakCol[i * 6 + 2] = 1.0;
    vsStreakCol[i * 6 + 3] = isRed ? 0.9 : 0.12;
    vsStreakCol[i * 6 + 4] = isRed ? 0.15 : 0.45;
    vsStreakCol[i * 6 + 5] = isRed ? 0.3 : 1.0;
  }
  vsStreakGeo.setAttribute('position', new THREE.BufferAttribute(vsStreakPos, 3));
  vsStreakGeo.setAttribute('color', new THREE.BufferAttribute(vsStreakCol, 3));
  const vsStreakMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const vsStreaks = new THREE.LineSegments(vsStreakGeo, vsStreakMat);
  outerSpaceGroup.add(vsStreaks);

  // 2C. Ringed Class-M / Gas Giant Planet & Mutara Nebula visible on Main Viewscreen
  const spaceSectorGroup = new THREE.Group();
  outerSpaceGroup.add(spaceSectorGroup);

  const planetMesh = new THREE.Mesh(
    new THREE.SphereGeometry(7.2, 36, 36),
    new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: new THREE.Color(0x0d285c),
      emissiveIntensity: 0.45,
      roughness: 0.65,
      metalness: 0.1,
    })
  );
  planetMesh.position.set(-14, 3.2, -32);
  spaceSectorGroup.add(planetMesh);

  const planetRings = new THREE.Mesh(
    new THREE.RingGeometry(9.2, 15.5, 48),
    new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    })
  );
  planetRings.position.copy(planetMesh.position);
  planetRings.rotation.set(1.18, 0.32, -0.25);
  spaceSectorGroup.add(planetRings);

  // 2D. Enemy Klingon Battlecruiser / Tactical Anomaly Target on Main Viewscreen
  const targetShipGroup = new THREE.Group();
  targetShipGroup.position.set(8.5, 0.6, -24);
  targetShipGroup.rotation.set(0.15, -0.45, -0.1);
  spaceSectorGroup.add(targetShipGroup);

  const klingonHullMat = new THREE.MeshStandardMaterial({
    color: 0x3a5248,
    roughness: 0.45,
    metalness: 0.6,
  });
  // D7 Battlecruiser Primary Wing Hull
  const d7Wing = new THREE.Mesh(new THREE.ConeGeometry(3.4, 2.2, 4), klingonHullMat);
  d7Wing.rotation.x = Math.PI / 2;
  d7Wing.scale.set(1.4, 0.25, 1.0);
  targetShipGroup.add(d7Wing);

  // D7 Forward Boom & Command Bulb
  const d7Boom = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 3.8, 12), klingonHullMat);
  d7Boom.rotation.x = Math.PI / 2;
  d7Boom.position.z = 2.0;
  targetShipGroup.add(d7Boom);

  const d7Bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x47665a,
      emissive: new THREE.Color(0xff3300),
      emissiveIntensity: 0.4,
      roughness: 0.4,
    })
  );
  d7Bulb.scale.set(1.2, 0.65, 1.3);
  d7Bulb.position.z = 3.8;
  targetShipGroup.add(d7Bulb);

  // 3D Tactical Target Lock Reticle around the Target Ship
  const targetReticleGroup = new THREE.Group();
  targetReticleGroup.position.copy(targetShipGroup.position);
  spaceSectorGroup.add(targetReticleGroup);

  const reticleRingMat = new THREE.MeshBasicMaterial({
    color: 0xff3344,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const reticleRing1 = new THREE.Mesh(new THREE.RingGeometry(4.2, 4.45, 32), reticleRingMat);
  const reticleRing2 = new THREE.Mesh(new THREE.RingGeometry(5.1, 5.25, 4), reticleRingMat);
  targetReticleGroup.add(reticleRing1, reticleRing2);

  // 2E. Science Spectrometer Scanning Wave Ring & Shield Bubble Pulse Effect
  const scanWaveMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const scanWaveMesh = new THREE.Mesh(new THREE.RingGeometry(1.5, 2.4, 48), scanWaveMat);
  scanWaveMesh.position.set(0, 0, -5);
  outerSpaceGroup.add(scanWaveMesh);

  const shieldPulseMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.0,
    wireframe: true,
    blending: THREE.AdditiveBlending,
  });
  const shieldPulseMesh = new THREE.Mesh(new THREE.SphereGeometry(8.4, 24, 18), shieldPulseMat);
  shieldPulseMesh.position.set(0, 2.2, 0);
  root.add(shieldPulseMesh);

  // Active Weapons FX on the Main Viewscreen (Phaser Beams & Photon Torpedoes)
  const phaserBeamMat = new THREE.LineBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.0,
  });
  const phaserBeamGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-3.2, -1.8, 18),
    targetShipGroup.position.clone(),
    new THREE.Vector3(3.2, -1.8, 18),
    targetShipGroup.position.clone(),
  ]);
  const phaserBeamLines = new THREE.LineSegments(phaserBeamGeo, phaserBeamMat);
  spaceSectorGroup.add(phaserBeamLines);

  const torpedoMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff2200 })
  );
  torpedoMesh.visible = false;
  spaceSectorGroup.add(torpedoMesh);

  // ============================================================================
  // 3. THE 5 CORE INTERACTIVE BRIDGE STATIONS & 3D CREW
  // ============================================================================

  const stationHighlightRings: Record<BridgeStationId, THREE.Mesh> = {} as any;

  const registerInteractableStation = (
    group: THREE.Group,
    stationId: BridgeStationId,
    ringRadius = 1.35
  ) => {
    group.userData.stationId = stationId;
    group.traverse((child) => {
      child.userData.stationId = stationId;
    });
    interactables.push(group);

    // Subtle floor holographic selection ring under each station
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(ringRadius - 0.1, ringRadius, 40), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    group.add(ring);
    stationHighlightRings[stationId] = ring;
  };

  // --- STATION 1: CENTER PEDESTAL — THE CAPTAIN'S CHAIR (pos: 0, 0, 0.9) ---
  const captainGroup = new THREE.Group();
  captainGroup.position.set(0, 0, 0.9);
  root.add(captainGroup);

  const captainDais = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.32, 0.18, 32), darkChromeMat);
  captainDais.position.y = 0.09;
  captainGroup.add(captainDais);

  const captainPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 0.42, 20), darkChromeMat);
  captainPedestal.position.y = 0.32;
  captainGroup.add(captainPedestal);

  // Seat & Backrest
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x1c2029, roughness: 0.5, metalness: 0.2 });
  const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.12, 0.65), chairMat);
  seatMesh.position.set(0, 0.54, 0);
  captainGroup.add(seatMesh);

  const backrestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.72, 0.12), chairMat);
  backrestMesh.position.set(0, 0.92, 0.28);
  backrestMesh.rotation.x = -0.12;
  captainGroup.add(backrestMesh);

  // Glowing Armrest Status Pads
  const capPadTex = createConsoleMatrixTexture('#f59e0b', '#38bdf8', 'COMMAND PAD');
  disposableTextures.push(capPadTex.map);
  const capPadMat = new THREE.MeshStandardMaterial({
    map: capPadTex.map,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: capPadTex.emissiveMap,
    emissiveIntensity: 1.3,
    roughness: 0.25,
  });

  [-1, 1].forEach((side) => {
    const armrest = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.72), consoleBodyMat);
    armrest.position.set(side * 0.4, 0.66, -0.02);
    captainGroup.add(armrest);

    const pad = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.36), capPadMat);
    pad.rotation.x = -Math.PI / 2 + 0.15;
    pad.position.set(side * 0.4, 0.79, -0.14);
    captainGroup.add(pad);
  });

  // Captain Kirk figure (visible when viewing from other stations!)
  const captainOfficer = createCrewOfficer(0xeab308, 0xf1c27d, 0x6b4423, false);
  captainOfficer.position.set(0, 0.1, -0.02);
  captainGroup.add(captainOfficer);

  registerInteractableStation(captainGroup, 'captain', 1.38);

  // --- STATION 2: FORWARD CENTER ISLAND — HELM & NAVIGATION CONSOLE (pos: 0, 0, -2.55) ---
  const helmGroup = new THREE.Group();
  helmGroup.position.set(0, 0, -2.55);
  root.add(helmGroup);

  const helmBase = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.78, 1.05), consoleBodyMat);
  helmBase.position.y = 0.39;
  helmGroup.add(helmBase);

  const helmSlope = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.22, 0.96), darkChromeMat);
  helmSlope.position.set(0, 0.84, -0.02);
  helmSlope.rotation.x = 0.36;
  helmGroup.add(helmSlope);

  const helmTex = createConsoleMatrixTexture('#f59e0b', '#22d3ee', 'HELM & ASTROGATION');
  disposableTextures.push(helmTex.map);
  const helmScreenMat = new THREE.MeshStandardMaterial({
    map: helmTex.map,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: helmTex.emissiveMap,
    emissiveIntensity: 1.45,
    roughness: 0.2,
  });
  const helmPanel = new THREE.Mesh(new THREE.PlaneGeometry(2.42, 0.82), helmScreenMat);
  helmPanel.position.set(0, 0.96, 0.02);
  helmPanel.rotation.x = -Math.PI / 2 + 0.36;
  helmGroup.add(helmPanel);

  // Central Astrogation Plotting Globe between Helm (Sulu) & Navigation (Chekov)
  const astroGlobe = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 24),
    new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 1.6,
      wireframe: true,
    })
  );
  astroGlobe.position.set(0, 1.12, -0.12);
  helmGroup.add(astroGlobe);

  // Lt. Sulu (Port Helm) & Ensign Chekov (Starboard Navigation)
  const suluOfficer = createCrewOfficer(0xeab308, 0xe5b887, 0x111318, false);
  suluOfficer.position.set(-0.72, 0.0, 0.68);
  helmGroup.add(suluOfficer);

  const chekovOfficer = createCrewOfficer(0xeab308, 0xf5cba7, 0x4a2f1d, false);
  chekovOfficer.position.set(0.72, 0.0, 0.68);
  helmGroup.add(chekovOfficer);

  registerInteractableStation(helmGroup, 'helm', 1.65);

  // Helper to build Perimeter Alcove Consoles (Science, Tactical, Comms)
  const createPerimeterStation = (
    stationId: BridgeStationId,
    posX: number,
    posZ: number,
    rotY: number,
    primaryHex: string,
    secondaryHex: string,
    title: string,
    shirtHex: number,
    skinHex: number,
    hairHex: number,
    hasHoodedViewer = false,
    hasEarpiece = false
  ) => {
    const stGroup = new THREE.Group();
    stGroup.position.set(posX, 0.38, posZ);
    stGroup.rotation.y = rotY;
    root.add(stGroup);

    // Desk Base & Angled Upper Monitor Hood
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.82, 0.92), consoleBodyMat);
    desk.position.y = 0.41;
    stGroup.add(desk);

    const upperMonitorHood = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.65, 0.48), darkChromeMat);
    upperMonitorHood.position.set(0, 1.12, -0.22);
    stGroup.add(upperMonitorHood);

    const stTex = createConsoleMatrixTexture(primaryHex, secondaryHex, title);
    disposableTextures.push(stTex.map);
    const stMat = new THREE.MeshStandardMaterial({
      map: stTex.map,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: stTex.emissiveMap,
      emissiveIntensity: 1.45,
      roughness: 0.2,
    });

    // Lower Tactile Button Matrix Surface
    const lowerScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.02, 0.58), stMat);
    lowerScreen.position.set(0, 0.84, 0.14);
    lowerScreen.rotation.x = -Math.PI / 2 + 0.28;
    stGroup.add(lowerScreen);

    // Upper Angled Display Monitor
    const upperScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.98, 0.48), stMat);
    upperScreen.position.set(0, 1.12, 0.03);
    upperScreen.rotation.x = -0.12;
    stGroup.add(upperScreen);

    // Spock's Iconic Blue Hooded Sensor Viewer at the Science Station!
    if (hasHoodedViewer) {
      const viewerTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.19, 0.52, 24),
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.3,
          metalness: 0.6,
        })
      );
      viewerTube.position.set(0.55, 1.08, 0.18);
      viewerTube.rotation.x = 0.42;
      stGroup.add(viewerTube);

      const viewerLens = new THREE.Mesh(
        new THREE.CircleGeometry(0.15, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      viewerLens.position.set(0.55, 1.3, 0.28);
      viewerLens.rotation.x = -0.45;
      stGroup.add(viewerLens);
    }

    // Station Officer
    const officer = createCrewOfficer(shirtHex, skinHex, hairHex, false, hasEarpiece);
    officer.position.set(0, 0, 0.76);
    stGroup.add(officer);

    registerInteractableStation(stGroup, stationId, 1.5);
    return { stGroup, officer };
  };

  // --- STATION 3: SCIENCE STATION (Spock — Starboard-Fore Perimeter) ---
  const scienceStation = createPerimeterStation(
    'science',
    5.4,
    -3.1,
    -Math.PI / 3.2,
    '#0ea5e9',
    '#a855f7',
    'SCIENCE & SENSORS // SPOCK',
    0x0284c7, // Science Blue
    0xe8cfa0,
    0x0f1217,
    true, // Spock's hooded sensor viewer
    false
  );

  // --- STATION 4: TACTICAL / DEFENSE STATION (Port-Fore Perimeter) ---
  const tacticalStation = createPerimeterStation(
    'tactical',
    -5.4,
    -3.1,
    Math.PI / 3.2,
    '#ef4444',
    '#f59e0b',
    'TACTICAL & SHIELDS',
    0xdc2626, // Operations/Tactical Red
    0xf1c27d,
    0x3b2818,
    false,
    false
  );

  // --- STATION 5: COMMUNICATIONS STATION (Uhura — Starboard-Aft Perimeter) ---
  const commsStation = createPerimeterStation(
    'comms',
    6.1,
    1.85,
    -Math.PI / 1.65,
    '#10b981',
    '#38bdf8',
    'SUBSPACE COMMS // UHURA',
    0xdc2626, // Operations Red
    0x8d5524,
    0x0c0e12,
    false,
    true // Uhura's silver earpiece
  );

  // ============================================================================
  // 4. STATION POV CAMERA POSES (Angled so both Console & Main Viewscreen show!)
  // ============================================================================
  const stationPoses: Record<BridgeStationId, StationCameraPose> = {
    captain: {
      id: 'captain',
      label: 'CAPTAIN',
      officerName: 'CAPT. JAMES T. KIRK',
      officerTitle: 'COMMANDING OFFICER • CENTER CHAIR',
      position: new THREE.Vector3(0, 1.48, 1.25),
      defaultYaw: 0.0,
      defaultPitch: -0.06,
      consolePos: new THREE.Vector3(0, 0.8, 0.9),
    },
    helm: {
      id: 'helm',
      label: 'HELM',
      officerName: 'LT. HIKARU SULU & ENS. CHEKOV',
      officerTitle: 'HELM & ASTROGATION CONSOLE',
      position: new THREE.Vector3(0, 1.36, -1.35),
      defaultYaw: 0.0,
      defaultPitch: -0.14,
      consolePos: new THREE.Vector3(0, 0.9, -2.55),
    },
    tactical: {
      id: 'tactical',
      label: 'TACTICAL',
      officerName: 'LT. CMDR. SCOTT / TACTICAL',
      officerTitle: 'WEAPONS & DEFLECTOR SHIELDS',
      position: new THREE.Vector3(-3.95, 1.68, -2.25),
      defaultYaw: 0.42, // Angled toward both Tactical Console and Main Viewscreen
      defaultPitch: -0.15,
      consolePos: new THREE.Vector3(-5.4, 1.2, -3.1),
    },
    science: {
      id: 'science',
      label: 'SCIENCE',
      officerName: 'CMDR. SPOCK',
      officerTitle: 'CHIEF SCIENCE OFFICER • SENSOR ASTROMETRICS',
      position: new THREE.Vector3(3.95, 1.68, -2.25),
      defaultYaw: -0.42, // Angled toward both Science Console and Main Viewscreen
      defaultPitch: -0.15,
      consolePos: new THREE.Vector3(5.4, 1.2, -3.1),
    },
    comms: {
      id: 'comms',
      label: 'COMMS',
      officerName: 'LT. NYOTA UHURA',
      officerTitle: 'CHIEF COMMUNICATIONS OFFICER • SUBSPACE ARRAY',
      position: new THREE.Vector3(4.55, 1.68, 1.35),
      defaultYaw: -0.68, // Sees Comms Console & forward Main Viewscreen
      defaultPitch: -0.14,
      consolePos: new THREE.Vector3(6.1, 1.2, 1.85),
    },
  };

  // ============================================================================
  // 5. DYNAMIC BRIDGE SIMULATION STATE & ANIMATION LOOP
  // ============================================================================
  let currentAlert: 'normal' | 'yellow' | 'red' = 'normal';
  let currentWarpFactor = 1.0;
  let currentPropulsionMode: 'sublight' | 'impulse' | 'warp' = 'impulse';
  let targetHeadingOffset = new THREE.Vector2(0, 0);
  let phaserTimer = 0;
  let torpedoProgress = 0;
  let scanWaveProgress = 0;
  let shieldPulseTimer = 0;

  const setAlertMode = (mode: 'normal' | 'yellow' | 'red') => {
    currentAlert = mode;
  };

  const setWarpFactor = (wf: number, mode: 'sublight' | 'impulse' | 'warp') => {
    currentWarpFactor = wf;
    currentPropulsionMode = mode;
  };

  const setHeadingPitch = (headingDeg: number, pitchDeg: number) => {
    // Map heading (0..360) and pitch (-45..45) to sector parallax shift on the Main Viewscreen
    const hRad = ((headingDeg - 180) * Math.PI) / 180;
    const pRad = (pitchDeg * Math.PI) / 180;
    targetHeadingOffset.set(Math.sin(hRad) * 14, Math.sin(pRad) * 8);
  };

  const setTargetLocked = (locked: boolean) => {
    targetReticleGroup.visible = locked;
  };

  const setScanWaveActive = (active: boolean, colorHex = 0x22d3ee) => {
    if (active) {
      scanWaveProgress = 1.0;
      scanWaveMat.color.setHex(colorHex);
    }
  };

  const fireBridgePhasers = () => {
    phaserTimer = 0.65;
    phaserBeamMat.opacity = 1.0;
  };

  const fireBridgeTorpedo = () => {
    torpedoProgress = 0.01;
    torpedoMesh.visible = true;
    torpedoMesh.position.set(0, -1.5, 16);
  };

  const pulseShields = (freqNormalized: number) => {
    shieldPulseTimer = 0.85;
    shieldPulseMat.color.setHSL(0.52 + freqNormalized * 0.18, 0.95, 0.6);
  };

  const highlightStation = (activeStation: BridgeStationId) => {
    (Object.keys(stationHighlightRings) as BridgeStationId[]).forEach((id) => {
      const ring = stationHighlightRings[id];
      const mat = ring.material as THREE.MeshBasicMaterial;
      if (id === activeStation) {
        mat.color.setHex(0x22d3ee);
        mat.opacity = 0.75;
      } else {
        mat.color.setHex(0xf59e0b);
        mat.opacity = 0.16;
      }
    });
    // Hide the 3D crew mesh of the seat the user is currently occupying in first-person POV so the camera doesn't clip inside their head!
    captainOfficer.visible = activeStation !== 'captain';
    scienceStation.officer.visible = activeStation !== 'science';
    tacticalStation.officer.visible = activeStation !== 'tactical';
    commsStation.officer.visible = activeStation !== 'comms';
  };

  // Initialize default station highlight
  highlightStation('captain');

  const update = (delta: number, elapsed: number) => {
    // 1. Rotate Helm Astrogation Globe & Viewscreen Planet
    astroGlobe.rotation.y += delta * 0.65;
    planetMesh.rotation.y += delta * 0.18;

    // Smoothly steer outer space sector when user rotates Helm Compass Dial
    spaceSectorGroup.position.x = THREE.MathUtils.damp(
      spaceSectorGroup.position.x,
      targetHeadingOffset.x,
      3.0,
      delta
    );
    spaceSectorGroup.position.y = THREE.MathUtils.damp(
      spaceSectorGroup.position.y,
      targetHeadingOffset.y,
      3.0,
      delta
    );

    // Subtle Klingon target hover & reticle spin
    targetShipGroup.position.y = 0.6 + Math.sin(elapsed * 1.4) * 0.45;
    targetReticleGroup.position.copy(targetShipGroup.position);
    reticleRing1.rotation.z += delta * 0.9;
    reticleRing2.rotation.z -= delta * 0.6;

    // 2. Stream Main Viewscreen Stars & Relativistic Warp Streaks based on Propulsion Mode & Warp Factor
    const isWarp = currentPropulsionMode === 'warp';
    const isImpulse = currentPropulsionMode === 'impulse';
    const wfNorm = (currentWarpFactor - 1.0) / 8.9;
    const starFlow = isWarp ? 2.4 + wfNorm * 6.5 : isImpulse ? 0.95 : 0.25;

    const sAttr = vsStarGeo.attributes.position as THREE.BufferAttribute;
    const sArr = sAttr.array as Float32Array;
    for (let i = 0; i < vsStarCount; i++) {
      sArr[i * 3 + 2] += vsStarSpd[i] * starFlow * delta;
      if (sArr[i * 3 + 2] > 12) {
        sArr[i * 3 + 2] = -175;
      }
    }
    sAttr.needsUpdate = true;

    // Stretch Warp Streaks on the Main Viewscreen
    const targetStreakOpacity = isWarp ? 0.65 + wfNorm * 0.34 : isImpulse ? 0.28 : 0.08;
    vsStreakMat.opacity = THREE.MathUtils.damp(vsStreakMat.opacity, targetStreakOpacity, 4.0, delta);
    const tailLen = isWarp ? 12 + wfNorm * 38 : isImpulse ? 4.5 : 1.5;

    const lAttr = vsStreakGeo.attributes.position as THREE.BufferAttribute;
    const lArr = lAttr.array as Float32Array;
    for (let i = 0; i < vsStreakCount; i++) {
      vsStreakBase[i * 3 + 2] += (45 + wfNorm * 120) * (isWarp ? 1.8 : 0.35) * delta;
      if (vsStreakBase[i * 3 + 2] > 14) {
        vsStreakBase[i * 3 + 2] = -160;
      }
      const x = vsStreakBase[i * 3];
      const y = vsStreakBase[i * 3 + 1];
      const z = vsStreakBase[i * 3 + 2];

      lArr[i * 6] = x;
      lArr[i * 6 + 1] = y;
      lArr[i * 6 + 2] = z;
      lArr[i * 6 + 3] = x;
      lArr[i * 6 + 4] = y;
      lArr[i * 6 + 5] = z - tailLen;
    }
    lAttr.needsUpdate = true;

    // 3. Weapons & Science Scan Effects on Main Viewscreen
    if (phaserTimer > 0) {
      phaserTimer = Math.max(0, phaserTimer - delta);
      phaserBeamMat.opacity = phaserTimer / 0.65;
      // Update beam endpoints to track targetShipGroup
      const posArr = phaserBeamGeo.attributes.position.array as Float32Array;
      posArr[3] = targetShipGroup.position.x;
      posArr[4] = targetShipGroup.position.y;
      posArr[5] = targetShipGroup.position.z;
      posArr[9] = targetShipGroup.position.x;
      posArr[10] = targetShipGroup.position.y;
      posArr[11] = targetShipGroup.position.z;
      phaserBeamGeo.attributes.position.needsUpdate = true;
    } else {
      phaserBeamMat.opacity = 0;
    }

    if (torpedoProgress > 0) {
      torpedoProgress += delta * 1.65;
      if (torpedoProgress >= 1.0) {
        torpedoProgress = 0;
        torpedoMesh.visible = false;
      } else {
        const start = new THREE.Vector3(0, -1.5, 16);
        torpedoMesh.position.lerpVectors(start, targetShipGroup.position, torpedoProgress);
        const sc = 1.0 + Math.sin(torpedoProgress * Math.PI) * 1.4;
        torpedoMesh.scale.set(sc, sc, sc);
      }
    }

    if (scanWaveProgress > 0) {
      scanWaveProgress = Math.max(0, scanWaveProgress - delta * 0.75);
      const s = 1.0 + (1.0 - scanWaveProgress) * 14.0;
      scanWaveMesh.scale.set(s, s, 1);
      scanWaveMat.opacity = scanWaveProgress * 0.75;
    } else {
      scanWaveMat.opacity = 0;
    }

    if (shieldPulseTimer > 0) {
      shieldPulseTimer = Math.max(0, shieldPulseTimer - delta);
      shieldPulseMat.opacity = (shieldPulseTimer / 0.85) * 0.32;
      shieldPulseMesh.rotation.y += delta * 1.2;
    } else {
      shieldPulseMat.opacity = 0;
    }

    // 4. Red / Yellow / Normal Alert Bulkhead Lighting
    if (currentAlert === 'red') {
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 6.5);
      alertLightMat.color.setHex(0xff1122);
      alertLightMat.emissive.setHex(0xff0000);
      alertLightMat.emissiveIntensity = 1.2 + pulse * 2.8;
    } else if (currentAlert === 'yellow') {
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 3.5);
      alertLightMat.color.setHex(0xf59e0b);
      alertLightMat.emissive.setHex(0xff8800);
      alertLightMat.emissiveIntensity = 1.2 + pulse * 1.4;
    } else {
      alertLightMat.color.setHex(0x22d3ee);
      alertLightMat.emissive.setHex(0x00aaff);
      alertLightMat.emissiveIntensity = 1.6;
    }
  };

  const dispose = () => {
    disposableTextures.forEach((t) => t.dispose());
    disposableGeometries.forEach((g) => g.dispose());
    disposableMaterials.forEach((m) => m.dispose());
    vsStarGeo.dispose();
    vsStarMat.dispose();
    vsStreakGeo.dispose();
    vsStreakMat.dispose();
  };

  return {
    group: root,
    interactables,
    stationPoses,
    setAlertMode,
    setWarpFactor,
    setHeadingPitch,
    setTargetLocked,
    setScanWaveActive,
    fireBridgePhasers,
    fireBridgeTorpedo,
    pulseShields,
    highlightStation,
    update,
    dispose,
  };
}
