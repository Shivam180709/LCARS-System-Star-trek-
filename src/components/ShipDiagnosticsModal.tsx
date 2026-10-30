import React, { useState } from 'react';
import { 
  Activity, 
  X, 
  Zap, 
  Shield, 
  Crosshair, 
  Sliders, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2,
  Flame,
  Gauge,
  HelpCircle
} from 'lucide-react';
import { lcarsAudio } from '../utils/lcarsAudio';

interface ShipDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskComputer?: (topic: string) => void;
}

export const ShipDiagnosticsModal: React.FC<ShipDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onAskComputer,
}) => {
  // Subsystem Testing States
  const [coreRatio, setCoreRatio] = useState<number>(1.0); // 1.0 = 1:1 nominal
  const [shieldFreq, setShieldFreq] = useState<number>(247.8); // MHz
  const [targetHazard, setTargetHazard] = useState<'micrometeor' | 'solarflare' | 'tachyon' | 'graviton'>('solarflare');
  const [phaserPower, setPhaserPower] = useState<'stun' | 'thermal' | 'disrupt' | 'nadion'>('thermal');
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  // Warp core diagnostics calculations
  const reactorPowerPetawatts = (coreRatio * 1.24).toFixed(2);
  const coreTempKelvin = Math.round(1800000 * Math.sqrt(coreRatio));
  const containmentStability = coreRatio > 1.3 ? 'MARGINAL (91%)' : coreRatio < 0.7 ? 'SUB-OPTIMAL (88%)' : 'OPTIMAL (99.8%)';

  // Shield Frequency Tuning Check
  const HAZARD_FREQS: Record<string, { name: string; optimalFreq: number; range: [number, number]; desc: string }> = {
    micrometeor: { name: 'Interstellar Dust & Micro-Meteoroids', optimalFreq: 224.5, range: [220, 230], desc: 'Kinetic particulate repulsor field required at relativistic speeds.' },
    solarflare: { name: 'Coronal Mass Ejection & Plasma Flares', optimalFreq: 248.0, range: [244, 252], desc: 'High-energy proton shielding and magnetic deflection envelope.' },
    tachyon: { name: 'Tachyon Particle Radiation Storm', optimalFreq: 268.4, range: [264, 272], desc: 'Subspace phase inversion required to avoid sensor blindness.' },
    graviton: { name: 'Gravimetric Shear Anomaly (Binary Star)', optimalFreq: 286.2, range: [282, 290], desc: 'Spatial stress tensor reinforcement for structural integrity.' },
  };

  const currentHazardInfo = HAZARD_FREQS[targetHazard];
  const isShieldTuned = shieldFreq >= currentHazardInfo.range[0] && shieldFreq <= currentHazardInfo.range[1];

  const handleTestShields = () => {
    lcarsAudio.playShieldToggle(true);
    if (isShieldTuned) {
      setTestResult(`HARMONIC LOCK ACHIEVED: Shield frequency ${shieldFreq.toFixed(1)} MHz successfully dispersed ${currentHazardInfo.name}! 100% deflection.`);
      lcarsAudio.playChime();
    } else {
      setTestResult(`SHIELD HARMONIC MISMATCH: Frequency ${shieldFreq.toFixed(1)} MHz failed to neutralize hazard. Tune towards ~${currentHazardInfo.optimalFreq} MHz!`);
      lcarsAudio.playBeep(320, 0.12);
    }
  };

  const handleFirePhaserTest = () => {
    lcarsAudio.playPhaser();
    const yields = {
      stun: '5.2 kW (Biological Stun / Neutralization)',
      thermal: '48.0 MW (Hull Vaporization & Asteroid Cutting)',
      disrupt: '4.8 GW (Shield Penetration Yield)',
      nadion: '480 GW (Maximum Starfleet Tactical Nadion Surge)',
    };
    setTestResult(`PHASER DISCHARGE: Fired at ${phaserPower.toUpperCase()} mode. Output: ${yields[phaserPower]}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-3xl bg-[#0b0d18] border-2 border-[#38bdf8] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 bg-[#101428] border-b border-[#38bdf8]/40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#38bdf8] uppercase tracking-wider">
                MAIN ENGINEERING SUBSYSTEM STRESS LAB // CONSTITUTION CLASS
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white lcars-title">
                LIVE <span className="text-[#f5b335]">SHIP DIAGNOSTICS & SYSTEM STRESS TEST</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskComputer && onAskComputer('Explain the real science and Star Trek lore behind matter-antimatter warp core containment and shield harmonic frequencies.')}
              className="px-2.5 py-1 bg-[#f5b335] hover:bg-[#e8732a] text-black font-mono text-[10.5px] font-bold rounded flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>EXPLAIN</span>
            </button>
            <button
              onClick={() => {
                lcarsAudio.playBeep(440, 0.05);
                onClose();
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Test 1: Warp Core Matter/Antimatter Injection Ratio */}
          <div className="bg-[#101322] p-3.5 rounded-xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#f5b335] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#f5b335]" />
                1. M/ARA WARP CORE INJECTION RATIO
              </span>
              <span className={`text-xs font-mono font-bold ${coreRatio === 1.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                RATIO: {coreRatio.toFixed(2)}:1 (D₂O / ANTI-D)
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={coreRatio}
                onChange={(e) => {
                  setCoreRatio(parseFloat(e.target.value));
                  lcarsAudio.playBeep(600 + parseFloat(e.target.value) * 300, 0.03);
                }}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#f5b335]"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                <span>0.5:1 (Lean Reaction)</span>
                <span className="text-emerald-400 font-bold">1.0:1 (Stoichiometric Nominal)</span>
                <span>1.5:1 (Rich / High Temp)</span>
              </div>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
              <div className="p-2 bg-black/60 rounded border border-white/5">
                <div className="text-[10px] text-gray-400">OUTPUT POWER</div>
                <div className="text-sm font-bold text-white mt-0.5">{reactorPowerPetawatts} PW</div>
              </div>
              <div className="p-2 bg-black/60 rounded border border-white/5">
                <div className="text-[10px] text-gray-400">CORE TEMPERATURE</div>
                <div className="text-sm font-bold text-white mt-0.5">{coreTempKelvin.toLocaleString()} K</div>
              </div>
              <div className="p-2 bg-black/60 rounded border border-white/5">
                <div className="text-[10px] text-gray-400">MAGNETIC FIELD</div>
                <div className="text-xs font-bold text-[#38bdf8] mt-0.5">{containmentStability}</div>
              </div>
            </div>
          </div>

          {/* Test 2: Deflector Shield Harmonic Frequency Tuner */}
          <div className="bg-[#101322] p-3.5 rounded-xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#38bdf8] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#38bdf8]" />
                2. DEFLECTOR SHIELD HARMONIC FREQUENCY TUNER
              </span>
              <span className="text-xs font-mono font-bold text-[#38bdf8]">
                {shieldFreq.toFixed(1)} MHz
              </span>
            </div>

            {/* Threat Selection */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">SIMULATE THREAT:</span>
              {(Object.keys(HAZARD_FREQS) as ('micrometeor' | 'solarflare' | 'tachyon' | 'graviton')[]).map((hazKey) => {
                const isSel = targetHazard === hazKey;
                return (
                  <button
                    key={hazKey}
                    onClick={() => {
                      setTargetHazard(hazKey);
                      lcarsAudio.playBeep(750, 0.04);
                    }}
                    className={`px-2.5 py-1 rounded text-[10.5px] font-mono uppercase whitespace-nowrap transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#38bdf8] text-black font-bold shadow'
                        : 'bg-[#181c30] text-gray-300 hover:bg-[#222845]'
                    }`}
                  >
                    {HAZARD_FREQS[hazKey].name.split(' (')[0].split(' &')[0]}
                  </button>
                );
              })}
            </div>

            {/* Frequency Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="210"
                max="295"
                step="0.5"
                value={shieldFreq}
                onChange={(e) => {
                  setShieldFreq(parseFloat(e.target.value));
                  lcarsAudio.playBeep(500 + (parseFloat(e.target.value) - 210) * 8, 0.02);
                }}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                <span>210 MHz</span>
                <span className="text-gray-300">Target Range: {currentHazardInfo.range[0]} - {currentHazardInfo.range[1]} MHz</span>
                <span>295 MHz</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-gray-400">
                {currentHazardInfo.desc}
              </span>
              <button
                onClick={handleTestShields}
                className="px-3.5 py-1.5 bg-[#38bdf8] hover:bg-[#0ea5e9] text-black font-bold font-mono text-xs uppercase rounded-lg transition-all cursor-pointer shadow"
              >
                TEST DEFLECTION
              </button>
            </div>
          </div>

          {/* Test 3: Phaser Energy Modulation */}
          <div className="bg-[#101322] p-3.5 rounded-xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#ffaa00] flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-[#ffaa00]" />
                3. PHASER EMITTER NADION PARTICLE DISCHARGE
              </span>
              <button
                onClick={handleFirePhaserTest}
                className="px-3.5 py-1 bg-[#ffaa00] hover:bg-[#ea580c] text-black font-bold font-mono text-xs uppercase rounded-lg transition-all cursor-pointer shadow"
              >
                TEST FIRE
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'stun', label: '1. STUN BEAM', power: '5.2 kW' },
                { id: 'thermal', label: '2. THERMAL CUT', power: '48.0 MW' },
                { id: 'disrupt', label: '3. DISRUPTION', power: '4.8 GW' },
                { id: 'nadion', label: '4. NADION BURST', power: '480 GW' },
              ].map((p) => {
                const isSel = phaserPower === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPhaserPower(p.id as any);
                      lcarsAudio.playBeep(800, 0.03);
                    }}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#ffaa00] text-black font-bold border-white'
                        : 'bg-[#181a28] text-gray-300 border-white/5 hover:bg-[#25283c]'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold truncate">{p.label}</div>
                    <div className={`text-[10px] font-mono ${isSel ? 'text-black/80' : 'text-gray-400'}`}>
                      {p.power}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result Feedback Banner */}
          {testResult && (
            <div className="p-3 bg-blue-950/70 border border-blue-400/50 rounded-xl font-mono text-xs text-white space-y-1 animate-fadeIn shadow-lg">
              <div className="text-[#38bdf8] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>DIAGNOSTIC TEST RESULT:</span>
              </div>
              <p className="text-gray-200">{testResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
