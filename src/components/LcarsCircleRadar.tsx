import React from 'react';

interface LcarsCircleRadarProps {
  size?: number;
  label?: string;
  sublabel?: string;
}

export const LcarsCircleRadar: React.FC<LcarsCircleRadarProps> = ({
  size = 180,
  label = 'SECTOR 001',
  sublabel = 'ISOLINEAR SCAN',
}) => {
  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Outer segmented ring */}
      <svg
        className="w-full h-full absolute inset-0 animate-spin"
        style={{ animationDuration: '40s' }}
        viewBox="0 0 200 200"
      >
        {/* Outer thin guide ring */}
        <circle cx="100" cy="100" r="95" fill="none" stroke="#e8732a" strokeWidth="1.5" opacity="0.4" />
        
        {/* Segmented dashed ring */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="#f5b335"
          strokeWidth="3"
          strokeDasharray="40 15 20 15 60 20"
        />

        {/* Outer thick arc segment */}
        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="#e8a558"
          strokeWidth="6"
          strokeDasharray="75 180"
          opacity="0.8"
        />
      </svg>

      {/* Middle counter-rotating segment */}
      <svg
        className="w-full h-full absolute inset-0 animate-spin"
        style={{ animationDuration: '24s', animationDirection: 'reverse' }}
        viewBox="0 0 200 200"
      >
        {/* Segmented block arc 1 */}
        <circle
          cx="100"
          cy="100"
          r="68"
          fill="none"
          stroke="#e8732a"
          strokeWidth="12"
          strokeDasharray="70 40 50 80"
          opacity="0.9"
        />

        {/* Small ticks */}
        <circle
          cx="100"
          cy="100"
          r="54"
          fill="none"
          stroke="#f6e6b4"
          strokeWidth="2"
          strokeDasharray="6 8"
          opacity="0.6"
        />
      </svg>

      {/* Inner core rings matching rp2zzJeWuVevbQT7unwArh.jpg */}
      <div className="relative w-20 h-20 rounded-full border-4 border-[#e8732a] flex items-center justify-center bg-black/60 shadow-lg">
        <div className="w-12 h-12 rounded-full border-4 border-[#f5b335] flex items-center justify-center bg-[#f5b335]/20">
          <div className="w-4 h-4 rounded-full bg-[#f6e6b4] shadow-md shadow-[#f5b335]" />
        </div>
      </div>

      {/* Crosshair lines */}
      <div className="absolute w-full h-[1px] bg-[#f5b335]/20 pointer-events-none" />
      <div className="absolute h-full w-[1px] bg-[#f5b335]/20 pointer-events-none" />
    </div>
  );
};
