import * as THREE from 'three';

// Procedural Canvas Texture for floating LCARS Technical Telemetry callout panels
function createTelemetryPanelTexture(
  title: string,
  subtitle: string,
  specs: string[],
  accentColor = '#f5b335',
  textColor = '#38bdf8'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background - semi-transparent tactical dark panel
  ctx.fillStyle = 'rgba(2, 6, 18, 0.88)';
  ctx.fillRect(0, 0, 512, 256);

  // LCARS Border Framing & Accent Brackets
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;

  // Outer corner brackets
  ctx.beginPath();
  // Top-left
  ctx.moveTo(0, 36);
  ctx.lineTo(0, 0);
  ctx.lineTo(48, 0);
  // Top-right
  ctx.moveTo(464, 0);
  ctx.lineTo(512, 0);
  ctx.lineTo(512, 36);
  // Bottom-left
  ctx.moveTo(0, 220);
  ctx.lineTo(0, 256);
  ctx.lineTo(48, 256);
  // Bottom-right
  ctx.moveTo(464, 256);
  ctx.lineTo(512, 256);
  ctx.lineTo(512, 220);
  ctx.stroke();

  // Top LCARS Header Banner Block
  ctx.fillStyle = accentColor;
  ctx.fillRect(16, 12, 180, 24);

  ctx.fillStyle = '#050814';
  ctx.font = 'bold 16px "SF Mono", "Courier New", monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 24, 24);

  // Subtitle / System Tag
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "SF Mono", "Courier New", monospace';
  ctx.fillText(subtitle, 24, 62);

  // Horizontal LCARS dividing bar
  ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.fillRect(20, 80, 472, 2);

  // Telemetry Specification Lines
  ctx.fillStyle = textColor;
  ctx.font = '14px "SF Mono", "Courier New", monospace';
  let y = 110;
  for (const line of specs) {
    ctx.fillText('■ ' + line, 24, y);
    y += 28;
  }

  // Tactical status indicator block at bottom right
  ctx.fillStyle = '#10b981';
  ctx.fillRect(360, 218, 12, 12);
  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 12px "SF Mono", monospace';
  ctx.fillText('SYS ONLINE // 100%', 380, 225);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// Procedural Canvas Texture for the Scanning Laser Sheet
function createScanlineSheetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // Vertical holographic laser gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, 'rgba(0, 229, 255, 0.0)');
  grad.addColorStop(0.3, 'rgba(0, 229, 255, 0.15)');
  grad.addColorStop(0.7, 'rgba(0, 229, 255, 0.35)');
  grad.addColorStop(0.95, 'rgba(0, 240, 255, 0.95)');
  grad.addColorStop(1.0, 'rgba(255, 255, 255, 1.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Holographic scan grid lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1.5;
  for (let y = 0; y < 512; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  for (let x = 0; x < 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Creates the Futuristic Starfleet LCARS Display Screen Turntable Pedestal
export function createTurntablePedestal(): { group: THREE.Group; radarSweep: THREE.Line } {
  const group = new THREE.Group();
  group.name = 'LCARS_Turntable_Pedestal';
  group.position.y = -10;

  // 1. Concentric Holographic Degree Rings
  const ringRadii = [16, 22, 28, 34];
  for (const radius of ringRadii) {
    const ringGeo = new THREE.RingGeometry(radius - 0.08, radius + 0.08, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: radius === 34 ? 0xf5b335 : 0x00e5ff,
      transparent: true,
      opacity: radius === 34 ? 0.75 : 0.45,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    group.add(ringMesh);
  }

  // 2. Radial Azimuth Degree Markings (000°, 045°, 090°, 135°, 180°, 225°, 270°, 315°)
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  const center = 512;

  ctx.clearRect(0, 0, 1024, 1024);
  ctx.font = 'bold 22px "SF Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const degrees = [
    { deg: 0, label: '000° FORE' },
    { deg: 45, label: '045°' },
    { deg: 90, label: '090° STBD' },
    { deg: 135, label: '135°' },
    { deg: 180, label: '180° AFT' },
    { deg: 225, label: '225°' },
    { deg: 270, label: '270° PORT' },
    { deg: 315, label: '315°' },
  ];

  for (const d of degrees) {
    const rad = (d.deg * Math.PI) / 180 - Math.PI / 2;
    const x = center + Math.cos(rad) * 440;
    const y = center + Math.sin(rad) * 440;

    ctx.fillStyle = d.deg % 90 === 0 ? '#f5b335' : '#38bdf8';
    ctx.fillText(d.label, x, y);

    // Radial tick line
    ctx.strokeStyle = d.deg % 90 === 0 ? '#f5b335' : '#00e5ff';
    ctx.lineWidth = d.deg % 90 === 0 ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(center + Math.cos(rad) * 360, center + Math.sin(rad) * 360);
    ctx.lineTo(center + Math.cos(rad) * 420, center + Math.sin(rad) * 420);
    ctx.stroke();
  }

  const dialTex = new THREE.CanvasTexture(canvas);
  const dialGeo = new THREE.PlaneGeometry(72, 72);
  const dialMat = new THREE.MeshBasicMaterial({
    map: dialTex,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const dialMesh = new THREE.Mesh(dialGeo, dialMat);
  dialMesh.rotation.x = -Math.PI / 2;
  group.add(dialMesh);

  // 3. Technical Coordinate Crosshair Axes
  const axisGeoX = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-36, 0, 0),
    new THREE.Vector3(36, 0, 0),
  ]);
  const axisGeoZ = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, -36),
    new THREE.Vector3(0, 0, 36),
  ]);
  const axisMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
  });
  group.add(new THREE.Line(axisGeoX, axisMat));
  group.add(new THREE.Line(axisGeoZ, axisMat));

  // 4. Rotating LCARS Radar Sweep Line
  const sweepGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.05, 0),
    new THREE.Vector3(0, 0.05, 34),
  ]);
  const sweepMat = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.9,
    linewidth: 2,
  });
  const radarSweep = new THREE.Line(sweepGeo, sweepMat);
  group.add(radarSweep);

  return { group, radarSweep };
}

// Creates the Dynamic Holographic Scanning Grid Beam that sweeps across the ship
export function createScanningGridBeam(): {
  group: THREE.Group;
  scanLight: THREE.PointLight;
  scanSheet: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.name = 'LCARS_Scanning_Grid_Beam';

  const scanWidth = 34;
  const scanHeight = 16;

  // 1. Horizontal glowing laser bar
  const barGeo = new THREE.BoxGeometry(scanWidth, 0.25, 0.4);
  const barMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.95,
  });
  const barMesh = new THREE.Mesh(barGeo, barMat);
  group.add(barMesh);

  // 2. Vertical holographic scanning grid laser sheet
  const sheetTex = createScanlineSheetTexture();
  const sheetGeo = new THREE.PlaneGeometry(scanWidth, scanHeight);
  const sheetMat = new THREE.MeshBasicMaterial({
    map: sheetTex,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const scanSheet = new THREE.Mesh(sheetGeo, sheetMat);
  scanSheet.position.y = scanHeight / 2;
  group.add(scanSheet);

  // 3. Moving scanner point light that casts illumination onto the ship
  const scanLight = new THREE.PointLight(0x00e5ff, 3.5, 20);
  scanLight.position.set(0, 0, 0);
  group.add(scanLight);

  return { group, scanLight, scanSheet };
}

// Creates Floating LCARS Technical Telemetry Panels anchored in 3D around the ship
export function createFloatingTelemetryGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'LCARS_Floating_Telemetry';

  const panelData = [
    {
      title: 'LCARS-SEC-01',
      subtitle: 'PRIMARY HULL // SAUCER',
      specs: [
        'DIAMETER: 142.3 METERS',
        'DECKS: 1 - 11 // CREW: 430',
        'ATMOSPHERIC: 101.3 kPa (NOMINAL)',
        'STRUCTURAL FIELD: 100% COHESION',
      ],
      accent: '#f5b335',
      text: '#38bdf8',
      pos: new THREE.Vector3(-18, 9, 8),
      targetPos: new THREE.Vector3(0, 2.2, 4.2),
    },
    {
      title: 'LCARS-SEC-02',
      subtitle: 'MAIN BRIDGE // DECK 1',
      specs: [
        'COMMAND & HELM SUBSYSTEMS',
        'FORWARD VIEW: HOLOGRAPHIC',
        'REDUNDANT OPTICAL ODN BUS',
        'TACTICAL STATUS: GREEN',
      ],
      accent: '#38bdf8',
      text: '#99ccff',
      pos: new THREE.Vector3(14, 11, 10),
      targetPos: new THREE.Vector3(0, 4.1, 4.2),
    },
    {
      title: 'LCARS-SEC-03',
      subtitle: 'TWIN WARP NACELLES',
      specs: [
        '18 TOROIDAL COCHRANE COILS',
        'WARP CRUISE: 8.0 // MAX: 9.0+',
        'OUTPUT: 1.24 TWh PER SEC',
        'SUBSPACE FREQ: 247.8 MHz',
      ],
      accent: '#00e5ff',
      text: '#67e8f9',
      pos: new THREE.Vector3(19, 7, -6),
      targetPos: new THREE.Vector3(9, 4.4, -4.6),
    },
    {
      title: 'LCARS-SEC-04',
      subtitle: 'NAVIGATIONAL DEFLECTOR',
      specs: [
        'SUB-GRAVITON PARTICLE REPULSOR',
        'RANGE: 50,000 KM FORWARD',
        'PARABOLIC COPPER EMITTER',
        'FLUX DENSITY: 99.8% STABLE',
      ],
      accent: '#f59e0b',
      text: '#fed7aa',
      pos: new THREE.Vector3(-16, -5, 14),
      targetPos: new THREE.Vector3(0, -2.4, 7.8),
    },
    {
      title: 'LCARS-SEC-05',
      subtitle: 'M/ARA WARP CORE',
      specs: [
        'SECONDARY HULL // DECKS 12-24',
        'REACTANTS: D2O / ANTI-DEUTERIUM',
        'DILITHIUM ARTICULATED MATRIX',
        'EPS TRANSFER: 4,000 kV',
      ],
      accent: '#f5b335',
      text: '#fde68a',
      pos: new THREE.Vector3(-18, -4, -4),
      targetPos: new THREE.Vector3(0, -2.4, -3.2),
    },
    {
      title: 'LCARS-SEC-06',
      subtitle: 'MAIN IMPULSE ENGINES',
      specs: [
        'RELATIVISTIC FUSION DRIVE',
        'MAX SUB-LIGHT: 0.25c (IMPULSE)',
        'REACTORS: LASER DEUTERIUM',
        'MAGNETOHYDRODYNAMIC EXHAUST',
      ],
      accent: '#ef4444',
      text: '#fca5a5',
      pos: new THREE.Vector3(16, -3, -14),
      targetPos: new THREE.Vector3(0, 2.25, -9.0),
    },
  ];

  for (const item of panelData) {
    const tex = createTelemetryPanelTexture(item.title, item.subtitle, item.specs, item.accent, item.text);
    const planeGeo = new THREE.PlaneGeometry(10, 5);
    const planeMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const panelMesh = new THREE.Mesh(planeGeo, planeMat);
    panelMesh.position.copy(item.pos);
    panelMesh.lookAt(new THREE.Vector3(item.pos.x * 2, item.pos.y + 4, item.pos.z * 2));
    group.add(panelMesh);

    // Glowing Leader Line connecting panel to ship subsystem
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      item.pos,
      item.targetPos,
    ]);
    const lineMat = new THREE.LineDashedMaterial({
      color: item.accent === '#ef4444' ? 0xff4444 : item.accent === '#f59e0b' ? 0xf59e0b : 0x00e5ff,
      dashSize: 0.8,
      gapSize: 0.4,
      transparent: true,
      opacity: 0.65,
    });
    const leaderLine = new THREE.Line(lineGeo, lineMat);
    leaderLine.computeLineDistances();
    group.add(leaderLine);

    // Subsystem Target Node Reticle Sphere
    const reticleGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: item.accent === '#ef4444' ? 0xff4444 : item.accent === '#f59e0b' ? 0xf59e0b : 0x00e5ff,
      wireframe: true,
    });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.position.copy(item.targetPos);
    group.add(reticle);
  }

  return group;
}
