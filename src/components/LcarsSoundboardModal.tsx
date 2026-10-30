import React, { useState } from 'react';
import { 
  Volume2, 
  X, 
  Radio, 
  Zap, 
  ShieldAlert, 
  AlertTriangle, 
  Sparkles, 
  Flame, 
  Crosshair, 
  Disc,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import { lcarsAudio } from '../utils/lcarsAudio';

interface LcarsSoundboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SoundItem {
  id: string;
  name: string;
  category: 'tactical' | 'propulsion' | 'terminal' | 'naval';
  description: string;
  color: string;
  play: () => void;
}

export const LcarsSoundboardModal: React.FC<LcarsSoundboardModalProps> = ({ isOpen, onClose }) => {
  const [activeSound, setActiveSound] = useState<string | null>(null);

  if (!isOpen) return null;

  const SOUNDS: SoundItem[] = [
    {
      id: 'chime',
      name: 'Computer Acknowledgment',
      category: 'terminal',
      description: 'Iconic two-tone LCARS acknowledgment chime (E5 + B5 perfect fifth).',
      color: '#f5b335',
      play: () => lcarsAudio.playChime(),
    },
    {
      id: 'beep',
      name: 'LCARS Key Press Beep',
      category: 'terminal',
      description: 'Standard optical capacitive touch frequency tone (880 Hz).',
      color: '#f6e6b4',
      play: () => lcarsAudio.playBeep(880, 0.08),
    },
    {
      id: 'communicator',
      name: 'Communicator Badge Chirp',
      category: 'terminal',
      description: 'Four-tone Starfleet subspace transceiver chirp.',
      color: '#38bdf8',
      play: () => lcarsAudio.playCommunicatorChirp(),
    },
    {
      id: 'computerSweep',
      name: 'Computational Processor Sweep',
      category: 'terminal',
      description: 'Rapid optical data network (ODN) computational search sweep.',
      color: '#00e5ff',
      play: () => lcarsAudio.playComputerSweep(),
    },
    {
      id: 'redalert',
      name: 'Red Alert Siren Klaxon',
      category: 'tactical',
      description: 'Triple-burst sawtooth tactical alert klaxon for battle stations.',
      color: '#ef4444',
      play: () => lcarsAudio.toggleRedAlert(true),
    },
    {
      id: 'yellowalert',
      name: 'Yellow Alert Condition',
      category: 'tactical',
      description: 'Dual pulse tactical standby warning chime (587 Hz).',
      color: '#f59e0b',
      play: () => lcarsAudio.playYellowAlert(),
    },
    {
      id: 'phaser',
      name: 'Phaser Beam Burst',
      category: 'tactical',
      description: 'Rapid nadion particle discharge beam pulse.',
      color: '#ffaa00',
      play: () => lcarsAudio.playPhaser(),
    },
    {
      id: 'torpedo',
      name: 'Photon Torpedo Launch',
      category: 'tactical',
      description: 'Matter/antimatter warhead ejection into subspace envelope.',
      color: '#ff3300',
      play: () => lcarsAudio.playPhotonTorpedo(),
    },
    {
      id: 'shields',
      name: 'Deflector Shield Resonance',
      category: 'tactical',
      description: 'Graviton shield barrier envelope oscillation harmonic.',
      color: '#00ccff',
      play: () => lcarsAudio.playShieldToggle(true),
    },
    {
      id: 'warp',
      name: 'Warp Jump Pulse',
      category: 'propulsion',
      description: 'Subspace distortion wave acceleration surge into warp space.',
      color: '#0088ff',
      play: () => lcarsAudio.playWarp(),
    },
    {
      id: 'transporter',
      name: 'Transporter Energize',
      category: 'propulsion',
      description: 'Phase transition molecular matter stream beam shimmer.',
      color: '#ffd700',
      play: () => lcarsAudio.playTransporter(),
    },
    {
      id: 'door',
      name: 'Pneumatic Door Swish',
      category: 'naval',
      description: 'Atmospheric pressure equalized cabin/bridge door slide.',
      color: '#cbd5e1',
      play: () => lcarsAudio.playDoorSwish(),
    },
    {
      id: 'whistle',
      name: 'Boatswain Honor Whistle',
      category: 'naval',
      description: 'Starfleet naval tradition piping whistle for command arrival.',
      color: '#e2e8f0',
      play: () => lcarsAudio.playBoatswainWhistle(),
    },
    {
      id: 'hum',
      name: 'Warp Core Ambient Hum',
      category: 'propulsion',
      description: 'Sub-bass 65 Hz matter/antimatter reaction idling vibration.',
      color: '#818cf8',
      play: () => lcarsAudio.toggleEngineHum(),
    },
  ];

  const handlePlaySound = (sound: SoundItem) => {
    setActiveSound(sound.id);
    sound.play();
    setTimeout(() => {
      setActiveSound(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0b0d18] border-2 border-[#f5b335] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 bg-[#121528] border-b border-[#f5b335]/40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f5b335]/20 border border-[#f5b335]/40 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-[#f5b335]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#f5b335] uppercase tracking-wider">
                STARFLEET AUDIO SYNTHESIZER // ZERO LATENCY
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white lcars-title">
                LCARS <span className="text-[#38bdf8]">INTERACTIVE SOUND FX BOARD</span>
              </h2>
            </div>
          </div>

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

        {/* Oscilloscope Graphic Visualizer */}
        <div className="p-2.5 bg-black/70 border-b border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-gray-400">
              {activeSound ? `ACTIVE: ${SOUNDS.find((s) => s.id === activeSound)?.name}` : 'READY: CLICK ANY PAD TO SYNTHESIZE SOUND'}
            </span>
          </div>

          {/* Simulated equalizer bars */}
          <div className="flex items-end gap-1 h-5">
            {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-t transition-all duration-150 ${
                  activeSound ? 'bg-[#38bdf8]' : 'bg-[#f5b335]/40'
                }`}
                style={{
                  height: activeSound ? `${Math.max(20, (h * Math.random() + 20) % 100)}%` : `${h * 0.3}%`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Sound Pads Grid */}
        <div className="p-3 sm:p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 no-scrollbar">
          {SOUNDS.map((sound) => {
            const isPlaying = activeSound === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => handlePlaySound(sound)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 shadow-md ${
                  isPlaying
                    ? 'scale-[0.98] border-white ring-2 ring-blue-400'
                    : 'hover:border-white/40 hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: isPlaying ? sound.color : '#101322',
                  borderColor: isPlaying ? '#ffffff' : `${sound.color}55`,
                  color: isPlaying ? '#000000' : '#ffffff',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm font-mono truncate">
                    {sound.name}
                  </span>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                      isPlaying ? 'bg-black text-white' : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {sound.category}
                  </span>
                </div>
                <p className={`text-[11px] leading-tight line-clamp-2 ${isPlaying ? 'text-black/85' : 'text-gray-400'}`}>
                  {sound.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-2.5 bg-[#0e101a] border-t border-white/10 text-center font-mono text-[10px] text-gray-400 flex-shrink-0">
          ALL AUDIO REAL-TIME PROCEDURALLY SYNTHESIZED VIA WEB AUDIO API OSCILLATORS • ZERO EXTERNAL SAMPLES
        </div>
      </div>
    </div>
  );
};
