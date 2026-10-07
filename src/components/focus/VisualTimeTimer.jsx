import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Coffee, Zap } from 'lucide-react';

/**
 * Visual Analog Pomodoro Timer
 * Inspired by Time Timer & Llama Life
 * Features:
 * - 60-minute counter-clockwise dial matching the reference image
 * - Animated coral wedge that shrinks towards 12 o'clock as time counts down
 * - Interactive center play/pause hub
 * - Clickable minute markers and quick-select presets
 */
export const VisualTimeTimer = ({
  minutes,
  seconds,
  customMinutes,
  isActive,
  isPaused,
  onToggle,
  onReset,
  onSelectMinutes,
  formatTime,
}) => {
  const cx = 160;
  const cy = 160;
  const radius = 116;

  // Remaining total seconds and fraction
  const remainingTotalMinutes = minutes + seconds / 60;
  const angleDeg = Math.min(360, Math.max(0, remainingTotalMinutes * 6)); // 360 deg = 60 min

  // Calculate sector end point for counter-clockwise arc
  const angleRad = (angleDeg * Math.PI) / 180;
  const endX = cx - radius * Math.sin(angleRad);
  const endY = cy - radius * Math.cos(angleRad);
  const largeArcFlag = angleDeg > 180 ? 1 : 0;

  // Sector SVG Path (starts at 12 o'clock, sweeps counter-clockwise to end point)
  let sectorPath = '';
  if (angleDeg >= 359.9) {
    sectorPath = null; // render full circle
  } else if (angleDeg > 0.05) {
    sectorPath = `M ${cx} ${cy} L ${cx} ${cy - radius} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY} Z`;
  }

  // Dial numbers (0 to 55 counter-clockwise)
  const dialNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Minor ticks (every 1 minute)
  const minorTicks = Array.from({ length: 60 }, (_, i) => i);

  // Handle clicking on dial to set timer
  const handleDialClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - rect.width / 2;
    const clickY = e.clientY - rect.top - rect.height / 2;

    // Angle from 12 o'clock counter-clockwise
    let clickAngleRad = Math.atan2(-clickX, -clickY);
    if (clickAngleRad < 0) {
      clickAngleRad += 2 * Math.PI;
    }
    const mins = Math.round((clickAngleRad / (2 * Math.PI)) * 60);
    const selected = mins === 0 ? 60 : mins;
    if (onSelectMinutes) {
      onSelectMinutes(selected);
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Visual Time Timer Dial */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center p-2">
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full cursor-pointer transition-all drop-shadow-sm"
          onClick={handleDialClick}
        >
          {/* Background circle of the clock face */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            className="fill-slate-100 dark:fill-slate-800/90 transition-colors"
          />

          {/* Time Timer Sector (Wedge) */}
          {angleDeg >= 359.9 ? (
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              className="fill-[#f87171] dark:fill-[#fb7185] transition-all duration-300"
            />
          ) : sectorPath ? (
            <path
              d={sectorPath}
              className="fill-[#f87171] dark:fill-[#fb7185] transition-all duration-300 ease-linear"
            />
          ) : null}

          {/* Minor 1-minute Ticks */}
          {minorTicks.map((m) => {
            if (m % 5 === 0) return null; // handled by major ticks
            const rad = (m * 6 * Math.PI) / 180;
            const x1 = cx - radius * Math.sin(rad);
            const y1 = cy - radius * Math.cos(rad);
            const x2 = cx - (radius - 4) * Math.sin(rad);
            const y2 = cy - (radius - 4) * Math.cos(rad);
            return (
              <line
                key={`minor-${m}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-600 stroke-[1.5]"
              />
            );
          })}

          {/* Major 5-minute Ticks */}
          {dialNumbers.map((num) => {
            const rad = (num * 6 * Math.PI) / 180;
            const x1 = cx - radius * Math.sin(rad);
            const y1 = cy - radius * Math.cos(rad);
            const x2 = cx - (radius - 8) * Math.sin(rad);
            const y2 = cy - (radius - 8) * Math.cos(rad);
            return (
              <line
                key={`tick-${num}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                className="text-slate-800 dark:text-slate-200 stroke-2"
                strokeLinecap="round"
              />
            );
          })}

          {/* Dial Numbers (0, 5, 10, ... 55) */}
          {dialNumbers.map((num) => {
            const rad = (num * 6 * Math.PI) / 180;
            const numRadius = radius + 22;
            const tx = cx - numRadius * Math.sin(rad);
            const ty = cy - numRadius * Math.cos(rad);

            const isCurrentSelected = customMinutes === (num === 0 ? 60 : num);

            return (
              <text
                key={`num-${num}`}
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="central"
                className={`font-mono text-[13px] font-bold select-none transition-colors ${
                  isCurrentSelected
                    ? 'fill-[#f43f5e] font-black'
                    : 'fill-slate-700 dark:fill-slate-300 hover:fill-slate-900 dark:hover:fill-white'
                }`}
              >
                {num}
              </text>
            );
          })}

          {/* Llama Life style playful decorative accents (from reference screenshot) */}
          {/* Pastel purple triangle near 50 */}
          <polygon
            points="198,135 204,142 195,145"
            className="fill-purple-400/60 pointer-events-none"
          />
          {/* Pastel yellow dots near 15 */}
          <circle cx="106" cy="188" r="2.5" className="fill-amber-300/80 pointer-events-none" />
          <circle cx="126" cy="186" r="2.5" className="fill-amber-300/80 pointer-events-none" />
          {/* Pastel pink accent near 35 */}
          <polygon
            points="260,268 268,280 272,266"
            className="fill-pink-300/50 pointer-events-none"
          />

          {/* Center Hub: Black circular button with Play / Pause icon */}
          <g
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="cursor-pointer group"
          >
            {/* Outer halo on hover */}
            <circle
              cx={cx}
              cy={cy}
              r={24}
              className="fill-slate-900/10 dark:fill-white/10 group-hover:scale-110 transition-transform"
            />
            {/* Main Black Center Hub */}
            <circle
              cx={cx}
              cy={cy}
              r={18}
              className="fill-slate-950 dark:fill-slate-100 group-hover:fill-slate-800 dark:group-hover:fill-white transition-colors shadow-lg"
            />

            {/* Play / Pause Symbol */}
            {isActive && !isPaused ? (
              // Pause icon (two white bars)
              <g className="fill-white dark:fill-slate-950">
                <rect x={cx - 5} y={cy - 6} width={3} height={12} rx={1} />
                <rect x={cx + 2} y={cy - 6} width={3} height={12} rx={1} />
              </g>
            ) : (
              // Play icon (white triangle)
              <polygon
                points={`${cx - 4},${cy - 7} ${cx + 7},${cy} ${cx - 4},${cy + 7}`}
                className="fill-white dark:fill-slate-950"
              />
            )}
          </g>
        </svg>
      </div>

      {/* Digital Readout & Status */}
      <div className="text-center mt-3 space-y-1">
        <div className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-slate-800 dark:text-slate-100">
          {formatTime(minutes, seconds)}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {isActive ? (isPaused ? '⏸️ Dijeda' : '🔥 Sedang Berjalan') : `${customMinutes}m Visual Timer`}
        </div>
      </div>

      {/* Quick Preset Buttons (Time Timer / Llama Life style) */}
      <div className="mt-5 w-full flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {[5, 10, 15, 25, 30, 45, 60].map((mins) => {
          const isSelected = customMinutes === mins;
          return (
            <button
              key={mins}
              onClick={() => onSelectMinutes(mins)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isSelected
                  ? 'bg-[#f43f5e] text-white shadow-rose-500/25 shadow-md scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
              }`}
            >
              {mins === 25 ? '25m 🍅' : `${mins}m`}
            </button>
          );
        })}
      </div>

      {/* Bottom Action Controls */}
      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          onClick={onReset}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 shadow-xs transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggle}
          className={`px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 ${
            isActive && !isPaused
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
          }`}
        >
          {isActive && !isPaused ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Jeda</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Mulai Fokus</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VisualTimeTimer;
