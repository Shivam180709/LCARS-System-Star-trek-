import React, { useState } from 'react';
import { 
  Award, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Calendar,
  Share2,
  Copy,
  ChevronRight
} from 'lucide-react';
import { lcarsAudio } from '../utils/lcarsAudio';

interface StarfleetAcademyExamProps {
  onAskComputer?: (topic: string) => void;
}

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
  realScienceFact: string;
}

const ACADEMY_QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Relativity & Spacetime',
    question: 'In real physics, why can matter not accelerate to or exceed the speed of light in vacuum (c)?',
    options: [
      'Relativistic mass and required acceleration energy approach infinity via E = γmc²',
      'Light speed only applies to photons, solid matter burns from vacuum friction',
      'Quantum vacuum foam creates absolute drag at 0.99c',
      'Gravitons become repulsed by magnetic shielding',
    ],
    correctIdx: 0,
    explanation: 'Einstein\'s Special Relativity proves accelerating mass to c requires infinite energy: γ = 1/√(1 - v²/c²).',
    realScienceFact: 'Real FTL is only theoretically plausible if spacetime itself expands and contracts around the ship (Alcubierre metric).',
  },
  {
    id: 2,
    category: 'Quantum Mechanics',
    question: 'How do Starfleet transporters fictionally bypass the real-world Heisenberg Uncertainty Principle?',
    options: [
      'Subspace Tachyon Filter',
      'Heisenberg Compensators',
      'Converting matter into pure radio waves',
      'Extreme subatomic cryo-freezing',
    ],
    correctIdx: 1,
    explanation: 'Transporters fictionally rely on "Heisenberg Compensators" to simultaneously record subatomic position and momentum.',
    realScienceFact: 'In real quantum mechanics (Δx · Δp ≥ ℏ/2), measuring exact position inevitably perturbs momentum.',
  },
  {
    id: 3,
    category: 'Astrobiology & Physiology',
    question: 'What real-world marine animal uses copper-based green/blue blood, mirroring Star Trek Vulcans?',
    options: [
      'Horseshoe crabs and octopuses (Hemocyanin)',
      'Humpback whales',
      'Electric eels',
      'Deep-sea anglerfish',
    ],
    correctIdx: 0,
    explanation: 'Horseshoe crabs and cephalopods use copper-based hemocyanin to bind oxygen, resulting in distinctive blue-green blood!',
    realScienceFact: 'Hemocyanin is significantly more efficient than iron hemoglobin in frigid, oxygen-depleted deep sea conditions.',
  },
  {
    id: 4,
    category: 'Energy & Antimatter',
    question: 'When matter and antimatter annihilate in the Enterprise warp core (or CERN), what percentage of rest mass converts to energy?',
    options: [
      '0.7% (similar to hydrogen fusion)',
      '100% via Einstein\'s mass-energy equivalence E = mc²',
      '50% (the other half turns into neutrinos and vanishes)',
      'Only 10% due to thermodynamic loss',
    ],
    correctIdx: 1,
    explanation: 'Matter-antimatter annihilation converts 100% of rest mass directly into photons and pure energy (9 × 10¹⁶ J/kg).',
    realScienceFact: 'CERN regularly traps real antiprotons in Penning traps, but producing 1 gram would take billions of dollars and millennia.',
  },
  {
    id: 5,
    category: 'Space Exploration Ethics',
    question: 'What is the real-world space agency equivalent to Starfleet\'s Prime Directive?',
    options: [
      'The Outer Space Treaty & COSPAR Planetary Protection guidelines',
      'International Maritime Law',
      'The Federal Aviation Space Code',
      'The Geneva Orbital Protocol',
    ],
    correctIdx: 0,
    explanation: 'COSPAR mandates strict biological sterilization of Mars and Europa probes to prevent Earth microbes from contaminating extraterrestrial biospheres.',
    realScienceFact: 'Anthropological ethics also legally protect uncontacted indigenous human tribes from forced technological disruption.',
  },
  {
    id: 6,
    category: 'Gravitational Astrophysics',
    question: 'What is the theoretical boundary around a black hole beyond which nothing, not even light, can escape?',
    options: [
      'The Ergosphere',
      'The Event Horizon (Schwarzschild Radius)',
      'The Roche Limit',
      'The Oort Cloud',
    ],
    correctIdx: 1,
    explanation: 'The Event Horizon marks the point where escape velocity exceeds light speed (r_s = 2GM/c²).',
    realScienceFact: 'In 2019 and 2022, the Event Horizon Telescope captured the direct shadow of M87* and Sagittarius A*.',
  },
  {
    id: 7,
    category: 'Warp Drive Physics',
    question: 'In Mexican physicist Miguel Alcubierre\'s 1994 warp metric, what exotic substance was originally required?',
    options: [
      'Negative energy density (exotic matter with negative mass)',
      'Dilithium crystals',
      'Liquid deuterium',
      'Tachyon plasma',
    ],
    correctIdx: 0,
    explanation: 'Alcubierre\'s original general relativity metric required negative energy density to expand spacetime behind the ship.',
    realScienceFact: 'Recent 2021-2024 papers (Lentz, Bobrick, Martire) have proposed positive-energy sub-luminal soliton warp geometries.',
  },
  {
    id: 8,
    category: 'Exoplanet Science',
    question: 'How do NASA\'s Kepler and TESS telescopes discover most exoplanets?',
    options: [
      'Sending radio probes to take close-up photos',
      'Transit Photometry (measuring subtle periodic dips in star brightness)',
      'Gravitational lensing of sound waves',
      'Listening for extraterrestrial television broadcasts',
    ],
    correctIdx: 1,
    explanation: 'When an exoplanet passes in front of its host star, it blocks a tiny fraction of light (typically 0.01% - 1%), revealing its radius and orbit.',
    realScienceFact: 'Over 5,600 real exoplanets have been confirmed to date, including rocky worlds in the habitable zone.',
  },
];

const RANKS = [
  { minScore: 0, maxScore: 2, title: 'Cadet 4th Class', department: 'Starfleet Academy Under-Graduate', badgeColor: '#94a3b8' },
  { minScore: 3, maxScore: 4, title: 'Ensign', department: 'Junior Operations Specialist', badgeColor: '#38bdf8' },
  { minScore: 5, maxScore: 6, title: 'Lieutenant', department: 'Bridge Science & Navigation Officer', badgeColor: '#3b82f6' },
  { minScore: 7, maxScore: 7, title: 'Lieutenant Commander', department: 'Chief Operations Engineer', badgeColor: '#f59e0b' },
  { minScore: 8, maxScore: 8, title: 'Starship Captain', department: 'Commanding Officer, USS Enterprise', badgeColor: '#e8732a' },
];

export const StarfleetAcademyExam: React.FC<StarfleetAcademyExamProps> = ({ onAskComputer }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState<boolean>(false);
  const [examComplete, setExamComplete] = useState<boolean>(false);
  const [cadetName, setCadetName] = useState<string>('J. T. Kirk');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const question = ACADEMY_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (hasAnsweredCurrent) return;
    setSelectedOpt(idx);
    setHasAnsweredCurrent(true);

    const isCorrect = idx === question.correctIdx;
    if (isCorrect) {
      lcarsAudio.playChime();
    } else {
      lcarsAudio.playBeep(330, 0.1);
    }

    const nextAnswers = [...userAnswers, idx];
    setUserAnswers(nextAnswers);
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setHasAnsweredCurrent(false);
    lcarsAudio.playBeep(880, 0.04);

    if (currentIdx + 1 < ACADEMY_QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setExamComplete(true);
      lcarsAudio.playBoatswainWhistle();
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setUserAnswers([]);
    setSelectedOpt(null);
    setHasAnsweredCurrent(false);
    setExamComplete(false);
    lcarsAudio.playBeep(640, 0.05);
  };

  // Score Calculation
  const correctCount = userAnswers.reduce((acc, ans, i) => {
    return ans === ACADEMY_QUESTIONS[i].correctIdx ? acc + 1 : acc;
  }, 0);

  const finalRank = RANKS.find((r) => correctCount >= r.minScore && correctCount <= r.maxScore) || RANKS[0];

  const handleCopyCertificate = () => {
    const text = `STARFLEET ACADEMY COMMENDATION: ${cadetName} has achieved the rank of ${finalRank.title} (${correctCount}/${ACADEMY_QUESTIONS.length}) on Stardate 47634.4! Certified in Real Science & Star Trek Lore.`;
    navigator.clipboard?.writeText(text);
    setCopiedLink(true);
    lcarsAudio.playChime();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-black text-[#f6e6b4] overflow-hidden p-2 sm:p-4 gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0e101c] p-2.5 rounded-xl border-l-4 border-[#f5b335] border-y border-r border-white/10 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f5b335]/20 border border-[#f5b335]/40 flex items-center justify-center">
            <Award className="w-5 h-5 text-[#f5b335]" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#f5b335] uppercase tracking-wider">
              STARFLEET ACADEMY HOLODECK CERTIFICATION // SAN FRANCISCO CAMPUS
            </div>
            <h2 className="text-sm sm:text-lg font-bold text-white lcars-title">
              CADET APTITUDE EXAM & <span className="text-[#38bdf8]">COMMISSION CERTIFICATE</span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => onAskComputer && onAskComputer('Provide a briefing on Starfleet Academy entrance examinations and the blend of real science with Starfleet protocol.')}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#181a28] hover:bg-[#25283c] border border-white/10 rounded-lg text-xs font-mono text-gray-300 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#f5b335]" />
          <span className="hidden sm:inline">STUDY GUIDE</span>
        </button>
      </div>

      {/* Main Exam Area */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto overflow-hidden min-h-0 bg-[#0a0c16] rounded-xl border border-white/10 p-3 sm:p-5 shadow-2xl">
        {!examComplete ? (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto space-y-3 no-scrollbar">
            {/* Progress Bar & Question Counter */}
            <div className="space-y-1.5 flex-shrink-0">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#f5b335] font-bold uppercase">
                  QUESTION {currentIdx + 1} OF {ACADEMY_QUESTIONS.length} // {question.category.toUpperCase()}
                </span>
                <span className="text-gray-400">
                  SCORE: {correctCount} / {currentIdx}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#e8732a] to-[#f5b335] transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / ACADEMY_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="p-3.5 sm:p-4 bg-[#101428] border border-blue-500/30 rounded-xl space-y-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-[#38bdf8] border border-blue-500/30 font-bold">
                ACADEMY EXAM RECORD #{question.id}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                {question.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-2">
              {question.options.map((opt, idx) => {
                const isSelected = selectedOpt === idx;
                const isCorrect = idx === question.correctIdx;

                let optClass = 'bg-[#121528] border-white/10 text-gray-200 hover:bg-[#1a1f38] hover:border-white/30';
                if (hasAnsweredCurrent) {
                  if (isCorrect) {
                    optClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                  } else if (isSelected) {
                    optClass = 'bg-red-950/80 border-red-500 text-red-200';
                  } else {
                    optClass = 'opacity-40 bg-[#121528] border-white/5';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasAnsweredCurrent}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-mono flex items-center justify-between gap-3 transition-all cursor-pointer ${optClass}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-black/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {hasAnsweredCurrent && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    )}
                    {hasAnsweredCurrent && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanatory Review (shows after answering) */}
            {hasAnsweredCurrent && (
              <div className="p-3 bg-blue-950/50 border border-blue-500/30 rounded-xl text-xs space-y-1.5 animate-fadeIn">
                <div className="text-[#38bdf8] font-mono font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#f5b335]" />
                  <span>DEEP EXPLANATION:</span>
                </div>
                <p className="text-gray-200 leading-relaxed font-mono">{question.explanation}</p>
                <div className="pt-1 border-t border-white/10 text-[11px] text-gray-400 font-mono">
                  <span className="text-[#f5b335] font-bold">REAL SCIENCE: </span>
                  {question.realScienceFact}
                </div>
              </div>
            )}

            {/* Next / Submit Button */}
            {hasAnsweredCurrent && (
              <button
                onClick={handleNext}
                className="w-full py-2.5 bg-[#f5b335] hover:bg-[#e8732a] text-black font-bold font-mono text-sm uppercase rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                <span>{currentIdx + 1 === ACADEMY_QUESTIONS.length ? 'VIEW COMMISSION CERTIFICATE' : 'NEXT QUESTION'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* =========================================================================
             STARFLEET COMMISSION CERTIFICATE (Gold LCARS Styling)
             ========================================================================= */
          <div className="flex-1 flex flex-col justify-between overflow-y-auto space-y-3 no-scrollbar p-2 animate-fadeIn">
            {/* The Certificate Frame */}
            <div className="bg-gradient-to-b from-[#101426] via-[#090b14] to-[#101426] border-4 border-[#f5b335] rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 relative">
              {/* Corner Starfleet Deltas */}
              <div className="flex items-center justify-between border-b-2 border-[#f5b335]/40 pb-3">
                <div className="text-left">
                  <div className="text-[10px] font-mono text-[#f5b335] uppercase tracking-widest">
                    UNITED FEDERATION OF PLANETS
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white lcars-title">
                    STARFLEET COMMAND COMMISSION
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-[#f5b335] bg-[#f5b335]/20 flex items-center justify-center shadow-lg">
                  <Award className="w-7 h-7 text-[#f5b335]" />
                </div>
              </div>

              {/* Recipient Details */}
              <div className="text-center space-y-2 py-2">
                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                  BE IT KNOWN BY THESE PRESENTS THAT CADET
                </p>

                <div className="inline-block px-4 py-1.5 bg-black/60 rounded-xl border border-[#38bdf8]/40">
                  <input
                    type="text"
                    value={cadetName}
                    onChange={(e) => setCadetName(e.target.value)}
                    className="text-center text-lg sm:text-2xl font-bold font-mono text-[#38bdf8] bg-transparent outline-none border-b border-[#38bdf8]/50 focus:border-[#f5b335]"
                    placeholder="ENTER YOUR NAME"
                  />
                </div>

                <p className="text-xs font-mono text-gray-300">
                  Having demonstrated exemplary proficiency in Real Physics, Quantum Astrodynamics, and Starfleet Lore:
                </p>

                <div className="p-3 bg-[#181c30] rounded-xl border border-[#f5b335]/40 max-w-md mx-auto space-y-1">
                  <div className="text-xs font-mono text-[#f5b335] uppercase">COMMISSIONED RANK CONFERRED:</div>
                  <div className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider lcars-title" style={{ color: finalRank.badgeColor }}>
                    {finalRank.title}
                  </div>
                  <div className="text-[11px] font-mono text-gray-400">
                    {finalRank.department}
                  </div>
                </div>
              </div>

              {/* Commission Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono pt-2 border-t border-white/10">
                <div className="p-2 bg-black/40 rounded border border-white/5">
                  <div className="text-[10px] text-gray-400">EXAM SCORE</div>
                  <div className="text-sm font-bold text-white mt-0.5">{correctCount} / {ACADEMY_QUESTIONS.length} ({Math.round((correctCount / ACADEMY_QUESTIONS.length) * 100)}%)</div>
                </div>
                <div className="p-2 bg-black/40 rounded border border-white/5">
                  <div className="text-[10px] text-gray-400">STARDATE</div>
                  <div className="text-sm font-bold text-white mt-0.5">47634.4</div>
                </div>
                <div className="p-2 bg-black/40 rounded border border-white/5">
                  <div className="text-[10px] text-gray-400">POSTING</div>
                  <div className="text-sm font-bold text-[#38bdf8] mt-0.5">USS ENTERPRISE</div>
                </div>
                <div className="p-2 bg-black/40 rounded border border-white/5">
                  <div className="text-[10px] text-gray-400">REGISTRY</div>
                  <div className="text-sm font-bold text-[#f5b335] mt-0.5">NCC-1701</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={handleCopyCertificate}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#38bdf8] hover:bg-[#0284c7] text-black font-bold font-mono text-xs uppercase rounded-xl transition-all cursor-pointer shadow"
              >
                {copiedLink ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'COMMISSION COPIED!' : 'COPY COMMISSION RECORD'}</span>
              </button>

              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#181a28] hover:bg-[#25283c] border border-white/10 text-white font-mono text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#f5b335]" />
                <span>RE-TAKE EXAM</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
