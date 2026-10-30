import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Compass, 
  Atom, 
  Sparkles, 
  Rocket, 
  Globe2,
  ExternalLink
} from 'lucide-react';
import { lcarsAudio } from '../utils/lcarsAudio';
import { speechController } from '../utils/speechController';

export interface TourStep {
  stepNumber: number;
  headline: string;
  realScience: string;
  starTrekCanon: string;
  visitorAction: string;
  interactiveCommand?: string;
}

export interface TourData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: 'warp' | 'astrobiology' | 'antimatter' | 'quantum' | 'starship';
  steps: TourStep[];
}

export const EXHIBITION_TOURS: TourData[] = [
  {
    id: 'warp_physics',
    title: 'The Physics of Warp Speed',
    subtitle: 'Alcubierre Spacetime Metrics vs. Cochrane Coils',
    category: 'Theoretical Astrophysics',
    icon: 'warp',
    steps: [
      {
        stepNumber: 1,
        headline: 'The Relativistic Cosmic Speed Barrier',
        realScience: 'Special Relativity dictates that accelerating any object possessing mass to the vacuum speed of light (c = 299,792,458 m/s) requires infinite energy. As velocity approaches c, relativistic mass and momentum approach infinity, and time dilates toward zero.',
        starTrekCanon: 'In Star Trek history, humanity was trapped in the Solar System until April 5, 2063, when Dr. Zefram Cochrane launched the Phoenix, breaking the light barrier using the first warp field generator.',
        visitorAction: 'Observe the 3D Enterprise warp nacelles; in Starfleet lore, they house the Cochrane coils.',
        interactiveCommand: 'view_nacelles',
      },
      {
        stepNumber: 2,
        headline: 'Warping Spacetime: The Alcubierre Metric',
        realScience: 'In 1994, Mexican theoretical physicist Miguel Alcubierre solved Einstein’s Field Equations to show that while nothing can travel through space faster than light, space itself can expand and contract at arbitrary speeds. A warp bubble contracts space in front and expands space behind.',
        starTrekCanon: 'Starfleet ships project a multi-layered asymmetrical subspace displacement field (warp bubble). The ship remains in a pocket of normal space, experiencing zero inertial forces or relativistic time dilation.',
        visitorAction: 'Engage Warp Engines to watch the twin blue plasma conduits glow.',
        interactiveCommand: 'engage_warp',
      },
      {
        stepNumber: 3,
        headline: 'The Problem of Negative Energy Density',
        realScience: 'Standard Alcubierre geometry requires negative energy density (exotic matter with negative Casimir pressure). Recent 2021-2024 studies by Lentz, Bobrick, and Martire propose positive-energy physical soliton solutions that could operate below or approaching light speed.',
        starTrekCanon: 'Starfleet generates exotic energy states using matter-antimatter annihilation regulated by dilithium crystals, which possess a 4D subspace crystalline lattice impermeable to high-frequency subspace radiation.',
        visitorAction: 'Inspect Main Engineering & Warp Core to see the power generation chain.',
        interactiveCommand: 'view_engineering',
      },
      {
        stepNumber: 4,
        headline: 'Subspace Communications & Sensor Arrays',
        realScience: 'Gravitational waves detected by LIGO (2015) travel at exactly light speed c. True faster-than-light signal transmission remains unproven in physical observation.',
        starTrekCanon: 'Federation subspace transceivers propagate radio messages through subspace at Warp 9.9997 (~hundreds of thousands of times c), enabling real-time communications across thousands of light-years.',
        visitorAction: 'Engage the Navigational Deflector to observe forward gravimetric beam projection.',
        interactiveCommand: 'view_deflector',
      },
    ],
  },
  {
    id: 'astrobiology_extremophiles',
    title: 'Astrobiology & Alien Worlds',
    subtitle: 'From Earth Extremophiles to Exoplanet Biosignatures',
    category: 'Exobiology & Microbiology',
    icon: 'astrobiology',
    steps: [
      {
        stepNumber: 1,
        headline: 'The Spectrum of Life’s Habitability',
        realScience: 'The circumstellar habitable zone ("Goldilocks zone") is where stellar irradiance permits liquid surface water. Astronomers have identified over 5,600 confirmed exoplanets, dozens within habitable zones (TRAPPIST-1, Proxima Centauri b, Kepler-452b).',
        starTrekCanon: 'Starfleet categorizes worlds by planetary classification. Class-M (Minshara) represents oxygen-nitrogen terrestrial planets capable of supporting humanoid biology without atmospheric suits.',
        visitorAction: 'Inspect the Enterprise lateral sensor pallets used for planetary scanning.',
        interactiveCommand: 'view_saucer',
      },
      {
        stepNumber: 2,
        headline: 'Earth’s Extremophiles: Redefining Life',
        realScience: 'Organisms on Earth survive in boiling sulfuric acid (Sulfolobus), at ocean depths under 1,000 atmospheres of hydrostatic pressure (piezophiles), and inside nuclear reactors surviving lethal ionizing radiation (Deinococcus radiodurans).',
        starTrekCanon: 'Vulcans evolved on a hot, high-gravity desert world (orbiting real star 40 Eridani A), leading to green copper-based hemocyanin blood, secondary eyelids, and higher muscular density.',
        visitorAction: 'Explore the Science Laboratory sensor sweeps on the Bridge simulation.',
      },
      {
        stepNumber: 3,
        headline: 'Chemical Biosignatures & Atmospheric Spectra',
        realScience: 'The James Webb Space Telescope (JWST) uses transmission spectroscopy to detect atmospheric methane, carbon dioxide, ozone, and water vapor on exoplanets. A simultaneous presence of methane and oxygen is a potent non-equilibrium biosignature.',
        starTrekCanon: 'Science officer Spock and Lt. Commander Data rely on high-resolution tricorder spectroscopic resonance to detect lifeforms through meters of solid rock.',
        visitorAction: 'Test the Bridge planetary spectroscopy analyzer in the Science station.',
      },
    ],
  },
  {
    id: 'quantum_transporters',
    title: 'Quantum Teleportation vs. Transporters',
    subtitle: 'The Heisenberg Uncertainty Principle & Pattern Buffers',
    category: 'Quantum Mechanics',
    icon: 'quantum',
    steps: [
      {
        stepNumber: 1,
        headline: 'Real Quantum Teleportation',
        realScience: 'Real quantum teleportation (demonstrated by Nobel Laureates Aspect, Clauser, and Zeilinger) transfers quantum states of photons or ions across distances using quantum entanglement. It teleports information, not matter itself.',
        starTrekCanon: 'Starfleet transporters dematerialize physical matter, convert it into an energy stream, and project it via an Annular Confinement Beam (ACB) across 40,000 km.',
        visitorAction: 'Activate the Transporter "Beam Up" effect on the 3D Enterprise to see the golden shimmer.',
        interactiveCommand: 'transporter_demo',
      },
      {
        stepNumber: 2,
        headline: 'The Heisenberg Problem',
        realScience: 'The Heisenberg Uncertainty Principle states that one cannot simultaneously know the exact position and momentum of a subatomic particle (Δx · Δp ≥ ℏ/2). Scanning a human body\'s 10²⁸ atoms at quantum resolution would alter the particles being measured.',
        starTrekCanon: 'Starfleet overcame this with the fictional "Heisenberg Compensator." When asked how it works, technical illustrator Michael Okuda famously replied: "It works very well, thank you."',
        visitorAction: 'Review the technical specs of the transporter bio-filter.',
      },
    ],
  },
  {
    id: 'antimatter_energy',
    title: 'Matter-Antimatter & Future Energy',
    subtitle: 'E = mc² Annihilation Physics vs. Dilithium Chambers',
    category: 'High-Energy Particle Physics',
    icon: 'antimatter',
    steps: [
      {
        stepNumber: 1,
        headline: 'Real Antimatter Production at CERN',
        realScience: 'Antimatter is genuine, experimentally verified physics. CERN produces antiprotons and combines them with positrons to create antihydrogen. When matter and antimatter meet, 100% of their combined mass transforms into energy via E = mc².',
        starTrekCanon: 'The Enterprise carries 3,000 cubic meters of cryogenic liquid antideuterium in magnetic suspension pods located on the lowest stardrive decks.',
        visitorAction: 'Inspect Main Engineering & Warp Core to locate the intermix chamber.',
        interactiveCommand: 'view_engineering',
      },
      {
        stepNumber: 2,
        headline: 'Energy Density Comparison',
        realScience: 'Matter-antimatter annihilation generates 90,000,000,000 megajoules per kilogram. By comparison, chemical rocket fuel generates only ~15 MJ/kg, and nuclear fission yields ~80,000,000 MJ/kg.',
        starTrekCanon: 'This monumental energy density is the only power source capable of establishing the petawatt-scale subspace fields required for warp propulsion and defensive shields.',
        visitorAction: 'Toggle Enterprise Defensive Shields to view energy field distribution.',
        interactiveCommand: 'shields_demo',
      },
    ],
  },
];

interface ExhibitionToursProps {
  onAskComputer?: (topic: string) => void;
  onExecuteCommand?: (cmd: string) => void;
}

export const ExhibitionTours: React.FC<ExhibitionToursProps> = ({
  onAskComputer,
  onExecuteCommand,
}) => {
  const [selectedTour, setSelectedTour] = useState<TourData>(EXHIBITION_TOURS[0]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [showTourDetailMobile, setShowTourDetailMobile] = useState<boolean>(false);

  const currentStep = selectedTour.steps[currentStepIdx] || selectedTour.steps[0];

  const handleSelectTour = (tour: TourData) => {
    setSelectedTour(tour);
    setCurrentStepIdx(0);
    setShowTourDetailMobile(true);
    lcarsAudio.playChime();
    stopNarration();
  };

  const handleNextStep = () => {
    if (currentStepIdx < selectedTour.steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      lcarsAudio.playBeep(880, 0.06);
      stopNarration();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      lcarsAudio.playBeep(660, 0.06);
      stopNarration();
    }
  };

  useEffect(() => {
    const unsub = speechController.subscribe((speaking) => {
      setIsNarrating(speaking);
    });
    return () => {
      unsub();
      speechController.stopAllSpeech();
    };
  }, []);

  const stopNarration = () => {
    setIsNarrating(false);
    speechController.stopAllSpeech();
  };

  const toggleNarration = () => {
    if (isNarrating) {
      stopNarration();
      return;
    }

    setIsNarrating(true);
    lcarsAudio.playChime();

    const narrationScript = `${currentStep.headline}. Real Science: ${currentStep.realScience}. Star Trek Canon: ${currentStep.starTrekCanon}`;
    speechController.speakText(narrationScript);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-3 p-2 sm:p-4 md:p-6 bg-black overflow-hidden relative font-sans">
      {/* =========================================================================
          LEFT SIDEBAR: TOUR MODULES SELECTOR
          Visible on desktop, or on mobile when NOT in tour detail mode
          ========================================================================= */}
      <div className={`w-full md:w-80 lg:w-88 flex flex-col space-y-2 bg-[#0b0c14] border-2 border-[#3366cc]/40 rounded-xl overflow-hidden p-2.5 sm:p-3 shadow-2xl flex-shrink-0 ${
        showTourDetailMobile ? 'hidden md:flex' : 'flex flex-1 md:flex-none overflow-y-auto'
      }`}>
        <div className="bg-[#121422] p-2.5 sm:p-3 rounded-lg border-l-4 border-[#ff9900] border-y border-r border-white/10">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#cc99cc]">
            EXHIBITION WALKTHROUGHS
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-[#ff9900] lcars-title">
            EXPLORE STAR TREK // SCIENCE
          </h2>
        </div>

        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {EXHIBITION_TOURS.map((tour) => {
            const isSelected = selectedTour.id === tour.id;
            return (
              <button
                key={tour.id}
                onClick={() => handleSelectTour(tour)}
                className={`w-full p-2.5 sm:p-3 rounded-lg text-left transition-all flex items-start gap-2.5 border ${
                  isSelected
                    ? 'bg-[#ff9900] text-black border-[#ffaa00] font-bold shadow-lg'
                    : 'bg-[#0f101a] text-[#99ccff] hover:bg-[#181828] border-white/10'
                }`}
              >
                <div className="mt-0.5">
                  {tour.icon === 'warp' && <Rocket className="w-4 h-4" />}
                  {tour.icon === 'astrobiology' && <Globe2 className="w-4 h-4" />}
                  {tour.icon === 'quantum' && <Sparkles className="w-4 h-4" />}
                  {tour.icon === 'antimatter' && <Atom className="w-4 h-4" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className={`text-[10px] uppercase font-mono ${isSelected ? 'text-black' : 'text-[#ffaa00]'}`}>
                    {tour.category}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold truncate">{tour.title}</div>
                  <div className={`text-[10.5px] line-clamp-1 ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                    {tour.subtitle}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 self-center">
                  <span className="md:hidden text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/40 text-[#ffaa00]">
                    START
                  </span>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-[#cc99cc]'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MAIN TOUR SHOWCASE PANEL
          Visible on desktop, or on mobile when showTourDetailMobile is true
          ========================================================================= */}
      <div className={`flex-1 flex flex-col bg-[#0c0d16] border-2 border-[#3366cc]/40 rounded-xl p-3 sm:p-4 md:p-6 shadow-2xl justify-between overflow-y-auto ${
        !showTourDetailMobile ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Mobile Back Button */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10 md:hidden">
          <button
            onClick={() => {
              setShowTourDetailMobile(false);
              stopNarration();
              lcarsAudio.playBeep(640, 0.05);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5b335] hover:bg-[#ffbe4d] text-black font-mono font-bold text-xs uppercase rounded-lg shadow-md transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK TO ALL TOURS</span>
          </button>
          <span className="text-[10px] font-mono text-[#cc99cc] uppercase">
            EXHIBIT TOUR
          </span>
        </div>

        <div>
          {/* Header with Title and Step Counter */}
          <div className="border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-[#1a1b2e] text-[#cc99cc] border border-[#cc99cc]/40 rounded text-[10px] sm:text-xs font-mono uppercase tracking-wider">
                {selectedTour.category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#ffaa00]">
                  STEP {currentStepIdx + 1} OF {selectedTour.steps.length}
                </span>
                <button
                  onClick={toggleNarration}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono uppercase transition-all ${
                    isNarrating
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-[#3399cc] text-black font-bold hover:bg-[#44aadd]'
                  }`}
                >
                  {isNarrating ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isNarrating ? 'STOP AUDIO' : 'NARRATE'}</span>
                </button>
              </div>
            </div>

            <h3 className="text-base sm:text-xl font-bold text-[#ff9900] tracking-wide lcars-title leading-tight">
              {currentStep.headline}
            </h3>
            <p className="text-[11px] font-mono text-[#99ccff]">{selectedTour.title}</p>
          </div>

          {/* Content Comparison: Real Science vs Star Trek Canon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {/* Card 1: Real Science */}
            <div className="p-3.5 bg-blue-950/30 rounded-xl border-l-4 border-[#3399cc] border-y border-r border-blue-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[#3399cc] font-mono text-xs uppercase font-bold tracking-wider mb-1.5">
                  <Atom className="w-4 h-4" />
                  <span>■ REAL-WORLD SCIENCE FOUNDATION</span>
                </div>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed font-sans">
                  {currentStep.realScience}
                </p>
              </div>
              <div className="mt-3 pt-1.5 border-t border-blue-500/20 text-[10px] text-[#99ccff] font-mono">
                STATUS: Peer-Reviewed Scientific Baseline
              </div>
            </div>

            {/* Card 2: Star Trek Canon */}
            <div className="p-3.5 bg-amber-950/20 rounded-xl border-l-4 border-[#ff9900] border-y border-r border-amber-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[#ff9900] font-mono text-xs uppercase font-bold tracking-wider mb-1.5">
                  <Rocket className="w-4 h-4" />
                  <span>■ 24TH-CENTURY STARFLEET CANON</span>
                </div>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed font-sans">
                  {currentStep.starTrekCanon}
                </p>
              </div>
              <div className="mt-3 pt-1.5 border-t border-amber-500/20 text-[10px] text-[#ffaa00] font-mono">
                STATUS: Starfleet Engineering Canon Lore
              </div>
            </div>
          </div>

          {/* Interactive Action Card */}
          <div className="p-2.5 sm:p-3 bg-black/60 rounded-lg border border-purple-500/30 flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#cc99cc] flex-shrink-0" />
              <span className="text-[11px] font-mono text-gray-300">
                <strong className="text-[#cc99cc] uppercase">EXHIBIT ACTION:</strong>{' '}
                {currentStep.visitorAction}
              </span>
            </div>
            {onAskComputer && (
              <button
                onClick={() => onAskComputer(currentStep.headline)}
                className="flex-shrink-0 px-2.5 py-1 bg-[#1a1b2e] hover:bg-[#ff9900] hover:text-black text-[#ffaa00] text-xs font-mono uppercase rounded transition-colors"
              >
                Ask Computer
              </button>
            )}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIdx === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#181928] hover:bg-[#252538] disabled:opacity-30 text-[#99ccff] text-xs font-mono uppercase tracking-wider transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREV</span>
          </button>

          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {selectedTour.steps.map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  setCurrentStepIdx(i);
                  lcarsAudio.playBeep(700 + i * 50, 0.05);
                }}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                  i === currentStepIdx
                    ? 'bg-[#ff9900] ring-2 ring-[#ff9900]/40 scale-110'
                    : 'bg-gray-700 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNextStep}
            disabled={currentStepIdx === selectedTour.steps.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ff9900] hover:bg-[#ffaa00] disabled:opacity-30 text-black font-bold text-xs font-mono uppercase tracking-wider transition-all"
          >
            <span>NEXT</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
