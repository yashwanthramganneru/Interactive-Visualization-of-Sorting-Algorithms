import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { BarColorType } from '../types';
import { COLOR_MAP } from '../utils/sortingEngines';
import { soundSynth } from '../utils/audio';

interface VisualizerStageProps {
  array: number[];
  colorStates: BarColorType[];
  algorithmName: string;
  comparisons: number;
  swaps: number;
  elapsedTime: number;
  message: string;
  status: string;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

export const VisualizerStage: React.FC<VisualizerStageProps> = ({
  array,
  colorStates,
  algorithmName,
  comparisons,
  swaps,
  elapsedTime,
  message,
  status,
  isSoundEnabled,
  onToggleSound,
}) => {
  const maxVal = Math.max(...array, 10);
  const n = array.length;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Stage Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-900 tracking-tight">{algorithmName}</span>
          <span className="text-xs text-slate-400">·</span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
              status === 'Sorting...'
                ? 'bg-amber-100 text-amber-800'
                : status === 'Paused'
                ? 'bg-amber-50 text-amber-700'
                : status.startsWith('Completed')
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {status}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="text-slate-400 font-medium">Comparisons:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">{comparisons}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="text-slate-400 font-medium">Swaps / Writes:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">{swaps}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="text-slate-400 font-medium">Elapsed:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">{elapsedTime.toFixed(2)}s</span>
          </div>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => {
              soundSynth.enabled = !isSoundEnabled;
              onToggleSound();
            }}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors p-1 rounded hover:bg-slate-200/60"
            title={isSoundEnabled ? 'Mute tone synth' : 'Enable tone synth'}
            aria-label="Toggle Sound"
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-sky-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="text-[11px] font-medium">{isSoundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Bar Chart Canvas Area */}
      <div className="relative flex-1 flex items-end justify-center px-4 pt-12 pb-8 min-h-[340px] bg-white select-none overflow-hidden">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-8 px-6 opacity-40">
          <div className="border-b border-dashed border-slate-200 w-full" />
          <div className="border-b border-dashed border-slate-200 w-full" />
          <div className="border-b border-dashed border-slate-200 w-full" />
          <div className="border-b border-slate-200 w-full" />
        </div>

        {/* Bars Container */}
        <div className="relative z-10 flex items-end justify-center w-full h-full gap-1 sm:gap-1.5 max-w-5xl">
          {array.map((val, idx) => {
            const heightPercent = Math.max(6, (val / maxVal) * 100);
            const colorState = colorStates[idx] || 'default';
            const colorHex = COLOR_MAP[colorState];

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full max-w-[42px] transition-all duration-75"
              >
                {/* Value Label (only if <= 35 items) */}
                {n <= 32 && (
                  <span
                    className={`mb-1 font-mono tabular-nums text-center transition-colors ${
                      colorState === 'compare'
                        ? 'text-amber-600 font-bold text-[11px]'
                        : colorState === 'swap'
                        ? 'text-rose-600 font-bold text-[11px]'
                        : colorState === 'pivot'
                        ? 'text-purple-600 font-bold text-[11px]'
                        : 'text-slate-500 font-medium text-[10px]'
                    }`}
                  >
                    {val}
                  </span>
                )}

                {/* Vertical Bar */}
                <div
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: colorHex,
                  }}
                  className={`w-full rounded-t-sm transition-all duration-100 relative ${
                    colorState === 'compare'
                      ? 'ring-2 ring-amber-400 ring-offset-1 z-20'
                      : colorState === 'swap'
                      ? 'ring-2 ring-rose-500 ring-offset-1 z-20 scale-y-102'
                      : colorState === 'pivot'
                      ? 'ring-2 ring-purple-400 ring-offset-1 z-20'
                      : ''
                  }`}
                />

                {/* Index label underneath */}
                {n <= 25 && (
                  <span className="mt-1 text-[9px] font-mono text-slate-400 tabular-nums">
                    {idx}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Detail Footer Ticker */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Step Detail:</span>
        <p className="text-xs font-medium text-sky-800 truncate">{message}</p>
      </div>
    </div>
  );
};
