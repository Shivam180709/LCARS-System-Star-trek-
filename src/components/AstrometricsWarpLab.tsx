import React, { useState } from 'react';
import { 
  Compass, 
  Zap, 
  Clock, 
  Rocket, 
  Globe2, 
  Activity, 
  HelpCircle, 
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { lcarsAudio } from '../utils/lcarsAudio';

interface AstrometricsWarpLabProps {
  onAskComputer?: (topic: string) => void;
}

interface StarDestination {
  id: string;
  name: string;
  constellation: string;
  distanceLy: number;
  spectralClass: string;
  planets: string;
  realScience: string;
  trekLore: string;
  coordinates: string;
}

const DESTINATIONS: StarDestination[] = [
  {
    id: 'proxima',
    name: 'Proxima Centauri / Alpha Centauri',
    constellation: 'Centaurus',
    distanceLy: 4.246,
    spectralClass: 'M5.5V Red Dwarf',
    planets: 'Proxima b (terrestrial in habitable zone), Proxima c, d',
    realScience: 'The closest known star system to our Sun. Traveling here at Voyager 1\'s speed (61,000 km/h) would take over 75,000 years.',
    trekLore: 'Founding member world of the United Federation of Planets, home to Centaurian civilization and deep space relay outposts.',
    coordinates: 'RA 14h 29m 43s // DEC -62° 40′ 46″',
  },
  {
    id: 'vulcan',
    name: '40 Eridani A (Vulcan System)',
    constellation: 'Eridanus',
    distanceLy: 16.3,
    spectralClass: 'K1V Orange Main Sequence',
    planets: 'Vulcan (Ni\'Var) - Super-Earth with high gravity & thin atmosphere',
    realScience: 'A real triple star system 16.3 light-years from Earth. Astronomers in 2018 detected a potential rocky super-Earth exoplanet orbiting 40 Eridani A.',
    trekLore: 'Homeworld of Mr. Spock, Surak, and the Vulcan species. Hot, arid, mountainous planet with gravity 1.4G, where logic supplanted ancient nuclear warfare.',
    coordinates: 'RA 04h 15m 16s // DEC -07° 39′ 10″',
  },
  {
    id: 'wolf359',
    name: 'Wolf 359 (Sector 001 Outskirts)',
    constellation: 'Leo',
    distanceLy: 7.86,
    spectralClass: 'M6.0V Red Flare Star',
    planets: 'Wolf 359 b, c (Sub-Neptune and terrestrial gas/rock)',
    realScience: 'One of the faintest and lowest-mass known stars, emitting frequent explosive flares with strong magnetic fields.',
    trekLore: 'Site of the devastating 2367 battle where the Borg Cube, with Locutus (Captain Picard), destroyed 39 Starfleet vessels including the USS Saratoga.',
    coordinates: 'RA 10h 56m 29s // DEC +07° 00′ 53″',
  },
  {
    id: 'trappist1',
    name: 'TRAPPIST-1 System',
    constellation: 'Aquarius',
    distanceLy: 39.46,
    spectralClass: 'M8V Ultra-Cool Dwarf',
    planets: '7 Earth-sized rocky planets (b, c, d, e, f, g, h); 3 in habitable zone',
    realScience: 'The most compact and populous known Earth-sized planetary system. Targeted intensively by JWST for atmospheric signatures.',
    trekLore: 'Classified under Federation General Order 1 (Prime Directive) as an active multi-terrestrial evolutionary reserve.',
    coordinates: 'RA 23h 06m 29s // DEC -05° 02′ 29″',
  },
  {
    id: 'vega',
    name: 'Vega (Alpha Lyrae)',
    constellation: 'Lyra',
    distanceLy: 25.04,
    spectralClass: 'A0V Brilliant Blue-White',
    planets: 'Extensive circum-stellar debris disk with protoplanetary rings',
    realScience: 'A rapidly spinning star rotating at 236 km/s at its equator, causing it to bulge noticeably. The standard baseline for astronomical apparent magnitude (0.0).',
    trekLore: 'Key Starfleet navigational beacon and terminus for early 22nd-century Earth warp probe telemetry.',
    coordinates: 'RA 18h 36m 56s // DEC +38° 47′ 01″',
  },
  {
    id: 'pleiades',
    name: 'Pleiades Cluster (Seven Sisters)',
    constellation: 'Taurus',
    distanceLy: 444.0,
    spectralClass: 'Open Cluster of 1,000+ Young Stars',
    planets: 'Multiple developing accretion disks and primordial planetary nebulae',
    realScience: 'A young open star cluster formed within the last 100 million years, glowing through blue reflection nebulae of interstellar dust.',
    trekLore: 'Frequent exploration destination for Enterprise science survey missions studying early stellar evolution and protostellar accretion.',
    coordinates: 'RA 03h 47m 24s // DEC +24° 07′ 00″',
  },
  {
    id: 'sagittariusA',
    name: 'Sagittarius A* (Milky Way Galactic Core)',
    constellation: 'Sagittarius',
    distanceLy: 26670,
    spectralClass: 'Supermassive Black Hole',
    planets: 'S-star cluster orbiting at up to 8% speed of light',
    realScience: '4.3 million solar masses condensed into a gravitational singularity with an event horizon radius of 12.7 million km, imaged directly by EHT.',
    trekLore: 'Surrounded by the Great Barrier, navigated by the USS Enterprise NCC-1701-A in 2287 under command of James T. Kirk.',
    coordinates: 'RA 17h 45m 40s // DEC -29° 00′ 28″',
  },
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy (M31)',
    constellation: 'Andromeda',
    distanceLy: 2537000,
    spectralClass: 'Spiral Galaxy (1 Trillion Stars)',
    planets: 'Countless billions of planetary systems',
    realScience: 'Approaching the Milky Way at 110 km/s. In ~4.5 billion years, our two galaxies will collide and merge into "Milkomeda".',
    trekLore: 'Target of the Kelvan Empire exploratory expeditions and ancient extragalactic subspace probes.',
    coordinates: 'RA 00h 42m 44s // DEC +41° 16′ 09″',
  },
];

interface WarpSpeedTier {
  warp: number;
  label: string;
  speedOfLightC: number;
  description: string;
  era: string;
}

const WARP_TIERS: WarpSpeedTier[] = [
  { warp: 0.25, label: 'Full Impulse (0.25c)', speedOfLightC: 0.25, description: 'Relativistic sub-light fusion drive. Time dilation begins to register.', era: 'Standard Sublight' },
  { warp: 1.0, label: 'Warp 1.0 (c)', speedOfLightC: 1.0, description: 'Speed of Light (300,000 km/s). First broken by Zefram Cochrane in the Phoenix (2063).', era: 'First Contact (2063)' },
  { warp: 4.5, label: 'Warp 4.5 (91c)', speedOfLightC: 91.1, description: 'NX-01 Enterprise top cruising speed under Captain Jonathan Archer.', era: '22nd Century NX' },
  { warp: 6.0, label: 'Warp 6.0 (216c)', speedOfLightC: 216.0, description: 'Standard Federation cruising speed for commercial transports and scouts.', era: '23rd Century Fleet' },
  { warp: 8.0, label: 'Warp 8.0 (512c)', speedOfLightC: 512.0, description: 'Standard maximum safe cruising speed for Constitution Class USS Enterprise (NCC-1701).', era: 'TOS Constitution Refit' },
  { warp: 9.6, label: 'Warp 9.6 (1,909c)', speedOfLightC: 1909.0, description: 'Emergency flank speed for Galaxy Class USS Enterprise-D.', era: '24th Century TNG' },
  { warp: 9.975, label: 'Warp 9.975 (3,053c)', speedOfLightC: 3053.0, description: 'Intrepid Class (USS Voyager) and Sovereign Class sustained high warp.', era: 'Late 24th Century' },
  { warp: 15.0, label: 'Transwarp Conduit (Subspace)', speedOfLightC: 250000.0, description: 'Borg transwarp conduits or quantum slipstream bypassing normal Einsteinian limits.', era: 'Advanced Slipstream' },
];

export const AstrometricsWarpLab: React.FC<AstrometricsWarpLabProps> = ({ onAskComputer }) => {
  const [selectedDest, setSelectedDest] = useState<StarDestination>(DESTINATIONS[1]); // Vulcan default
  const [selectedWarpIdx, setSelectedWarpIdx] = useState<number>(4); // Warp 8 default
  const [isEngagingWarp, setIsEngagingWarp] = useState<boolean>(false);
  const [flightLog, setFlightLog] = useState<string | null>(null);

  const currentWarp = WARP_TIERS[selectedWarpIdx];

  // Calculate Real-World Flight Times
  const distLy = selectedDest.distanceLy;
  const distKm = distLy * 9.461e12;

  // 1. Apollo / Chemical Rocket (40,000 km/h)
  const chemHours = distKm / 40000;
  const chemYears = chemHours / (24 * 365.25);

  // 2. Ion Engine (Deep Space 1 / Dawn @ 200,000 km/h)
  const ionHours = distKm / 200000;
  const ionYears = ionHours / (24 * 365.25);

  // 3. Project Orion Nuclear Pulse (0.05c)
  const orionYears = distLy / 0.05;

  // 4. Starfleet Warp Drive
  const warpDays = (distLy / currentWarp.speedOfLightC) * 365.25;

  const formatWarpTime = (days: number) => {
    if (days < 0.04) {
      const minutes = Math.round(days * 24 * 60);
      return `${minutes} Minutes`;
    }
    if (days < 1.0) {
      const hours = (days * 24).toFixed(1);
      return `${hours} Hours`;
    }
    if (days < 365) {
      return `${days.toFixed(1)} Days`;
    }
    const years = (days / 365.25).toFixed(2);
    return `${years} Years`;
  };

  const handleEngage = () => {
    setIsEngagingWarp(true);
    lcarsAudio.playWarp();
    const stardate = (47634.4 + Math.random() * 5).toFixed(1);
    setTimeout(() => {
      setIsEngagingWarp(false);
      setFlightLog(
        `WARP JUMP EXECUTED: Navigated to ${selectedDest.name} (${selectedDest.distanceLy} ly) at ${currentWarp.label}. Transit Time: ${formatWarpTime(warpDays)}. Stardate ${stardate}. Antimatter consumed: ${(distLy * 0.42).toFixed(2)} kg.`
      );
      lcarsAudio.playChime();
    }, 1800);
  };

  return (
    <div className="w-full h-full flex flex-col bg-black text-[#f6e6b4] overflow-hidden p-2 sm:p-4 gap-2.5">
      {/* Top LCARS Astrometrics Header */}
      <div className="flex items-center justify-between bg-[#0e101c] p-2.5 rounded-xl border-l-4 border-[#38bdf8] border-y border-r border-white/10 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center">
            <Compass className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#38bdf8] uppercase tracking-wider">
              STARFLEET STELLAR CARTOGRAPHY & ASTROMETRICS LAB
            </div>
            <h2 className="text-sm sm:text-lg font-bold text-white lcars-title">
              INTERACTIVE <span className="text-[#f5b335]">WARP SPEED & TRAVEL CALCULATOR</span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => onAskComputer && onAskComputer(`Explain the real science and Star Trek lore of traveling to ${selectedDest.name} using warp drive.`)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5b335] hover:bg-[#e8732a] text-black font-bold font-mono text-xs uppercase rounded-lg transition-all cursor-pointer shadow"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">ASK COMPUTER</span>
        </button>
      </div>

      {/* Main Astrometrics Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden min-h-0">
        {/* Left Column: Destination Selector (4 cols) */}
        <div className="lg:col-span-4 bg-[#0a0c16] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-xl">
          <div className="p-2.5 bg-[#121528] border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-[#38bdf8] flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              DESTINATION TARGETS
            </span>
            <span className="text-[10px] font-mono text-[#f5b335]">{DESTINATIONS.length} SECTORS</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
            {DESTINATIONS.map((d) => {
              const isSel = selectedDest.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDest(d);
                    setFlightLog(null);
                    lcarsAudio.playBeep(840, 0.04);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSel
                      ? 'bg-[#1a233d] border-[#38bdf8] shadow-md shadow-blue-500/20'
                      : 'bg-[#0f1220] border-white/5 hover:bg-[#151930] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-bold ${isSel ? 'text-[#38bdf8]' : 'text-white'}`}>
                      {d.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#f5b335]">
                      {d.distanceLy < 1000 ? `${d.distanceLy} ly` : `${(d.distanceLy / 1000).toFixed(1)}k ly`}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-gray-400 font-mono truncate">
                    {d.constellation} • {d.spectralClass}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Warp Flight Controls & Comparison Matrix (8 cols) */}
        <div className="lg:col-span-8 bg-[#0a0c16] rounded-xl border border-white/10 flex flex-col overflow-y-auto p-3 sm:p-4 gap-3 no-scrollbar shadow-xl">
          {/* Destination Detail Card */}
          <div className="bg-[#101426] p-3 rounded-xl border border-[#38bdf8]/30 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-[#f5b335] uppercase tracking-wider">
                  TARGET TARGETING SYSTEM // {selectedDest.coordinates}
                </span>
                <h3 className="text-base sm:text-xl font-bold text-white lcars-title">
                  {selectedDest.name}
                </h3>
              </div>
              <div className="px-3 py-1 bg-blue-950/60 border border-blue-500/40 rounded-lg text-right">
                <div className="text-[10px] font-mono text-[#38bdf8]">TRUE DISTANCE</div>
                <div className="text-sm font-bold font-mono text-white">
                  {selectedDest.distanceLy.toLocaleString()} Light-Years
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 bg-blue-950/40 rounded border border-blue-500/20 text-gray-200">
                <span className="text-[#38bdf8] font-bold block mb-0.5">■ REAL ASTROPHYSICS:</span>
                {selectedDest.realScience}
              </div>
              <div className="p-2 bg-amber-950/40 rounded border border-amber-500/20 text-gray-200">
                <span className="text-[#f5b335] font-bold block mb-0.5">■ STAR TREK CANON:</span>
                {selectedDest.trekLore}
              </div>
            </div>
          </div>

          {/* Warp Speed Throttle Selector */}
          <div className="bg-[#121528] p-3 rounded-xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#f5b335] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                WARP DRIVE THROTTLE // SPEED FACTOR
              </span>
              <span className="text-xs font-mono font-bold text-[#38bdf8]">
                {currentWarp.speedOfLightC < 1 ? `${currentWarp.speedOfLightC}c` : `${currentWarp.speedOfLightC.toLocaleString()}× Speed of Light`}
              </span>
            </div>

            {/* Throttle Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {WARP_TIERS.map((tier, idx) => {
                const isSel = selectedWarpIdx === idx;
                return (
                  <button
                    key={tier.label}
                    onClick={() => {
                      setSelectedWarpIdx(idx);
                      lcarsAudio.playBeep(700 + idx * 40, 0.04);
                    }}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#e8732a] text-black font-bold border-[#f5b335] shadow-md'
                        : 'bg-[#181c30] text-[#f6e6b4] border-white/10 hover:bg-[#252b48]'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono truncate">{tier.label.split(' (')[0]}</div>
                    <div className={`text-[10px] font-mono ${isSel ? 'text-black/80' : 'text-gray-400'}`}>
                      {tier.speedOfLightC < 1 ? 'Sub-light' : `${tier.speedOfLightC.toLocaleString()}c`}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-2 bg-black/50 rounded text-[11px] font-mono text-gray-300 border border-white/5">
              <span className="text-[#f5b335] font-bold">{currentWarp.era}: </span>
              {currentWarp.description}
            </div>
          </div>

          {/* Real Physics vs Warp Travel Time Comparison Matrix */}
          <div className="bg-[#101322] p-3 rounded-xl border border-white/10 space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-[#f5b335] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              FLIGHT DURATION COMPARISON TO {selectedDest.name.toUpperCase()}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {/* Chemical Rocket */}
              <div className="p-2.5 bg-black/60 rounded-lg border border-red-500/30">
                <div className="text-[10px] text-red-400 uppercase font-bold">1. MODERN CHEMICAL ROCKET (APOLLO / SATURN V)</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {chemYears > 1000 ? `${(chemYears / 1000).toFixed(0)} Thousand Years` : `${chemYears.toFixed(0)} Years`}
                </div>
                <div className="text-[10px] text-gray-400">Speed: 40,000 km/h (0.000037c)</div>
              </div>

              {/* Ion Engine */}
              <div className="p-2.5 bg-black/60 rounded-lg border border-yellow-500/30">
                <div className="text-[10px] text-yellow-400 uppercase font-bold">2. ION DRIVE (NASA DEEP SPACE 1 / DAWN)</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {ionYears > 1000 ? `${(ionYears / 1000).toFixed(0)} Thousand Years` : `${ionYears.toFixed(0)} Years`}
                </div>
                <div className="text-[10px] text-gray-400">Speed: 200,000 km/h (0.000185c)</div>
              </div>

              {/* Project Orion Nuclear Pulse */}
              <div className="p-2.5 bg-black/60 rounded-lg border border-cyan-500/30">
                <div className="text-[10px] text-cyan-400 uppercase font-bold">3. NUCLEAR PULSE DRIVE (PROJECT ORION)</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {orionYears > 1000 ? `${(orionYears / 1000).toFixed(0)} Thousand Years` : `${orionYears.toFixed(1)} Years`}
                </div>
                <div className="text-[10px] text-gray-400">Speed: 0.05c (15,000 km/s)</div>
              </div>

              {/* Starfleet Warp Drive */}
              <div className="p-2.5 bg-blue-950/60 rounded-lg border-2 border-[#38bdf8] shadow-lg shadow-blue-500/20">
                <div className="text-[10px] text-[#38bdf8] uppercase font-bold flex items-center justify-between">
                  <span>4. USS ENTERPRISE ({currentWarp.label.split(' (')[0]})</span>
                  <span className="px-1.5 py-0.2 bg-[#38bdf8] text-black rounded text-[9px]">FTL WARP</span>
                </div>
                <div className="text-base font-bold text-white mt-0.5">
                  {formatWarpTime(warpDays)}
                </div>
                <div className="text-[10px] text-gray-300">
                  Speed: {currentWarp.speedOfLightC < 1 ? 'Sub-light' : `${currentWarp.speedOfLightC.toLocaleString()}× Light Speed`}
                </div>
              </div>
            </div>
          </div>

          {/* Engage Warp Button & Subspace Flight Feedback */}
          <div className="space-y-2">
            <button
              onClick={handleEngage}
              disabled={isEngagingWarp}
              className={`w-full py-3 rounded-xl font-mono text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                isEngagingWarp
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-[#e8732a] via-[#f5b335] to-[#e8732a] text-black hover:opacity-95'
              }`}
            >
              <Rocket className="w-5 h-5" />
              <span>{isEngagingWarp ? 'TRANSIT IN PROGRESS: WARP FIELD ACTIVE...' : `ENGAGE WARP DRIVE TO ${selectedDest.name.split(' (')[0].toUpperCase()}`}</span>
            </button>

            {flightLog && (
              <div className="p-3 bg-blue-950/70 border border-blue-400/50 rounded-xl font-mono text-xs text-white space-y-1 shadow-lg animate-fadeIn">
                <div className="text-[#38bdf8] font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#f5b335]" />
                  <span>STARFLEET FLIGHT LOG CONFIRMATION:</span>
                </div>
                <p className="text-gray-200 leading-relaxed">{flightLog}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
