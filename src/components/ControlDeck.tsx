import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Shuffle,
  AlertCircle,
  Sliders,
  Check,
} from 'lucide-react';
import { AlgorithmType, DistributionPreset } from '../types';
import { COLOR_LABEL_MAP } from '../utils/sortingEngines';

interface ControlDeckProps {
  currentAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStep: () => void;
  onReset: () => void;
  arraySize: number;
  onChangeArraySize: (size: number) => void;
  speedMs: number;
  onChangeSpeed: (speed: number) => void;
  preset: DistributionPreset;
  onSelectPreset: (preset: DistributionPreset) => void;
  onGenerateArray: () => void;
  onApplyCustomArray: (values: number[]) => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  currentAlgorithm,
  onSelectAlgorithm,
  isRunning,
  isPaused,
  isFinished,
  onStart,
  onPause,
  onResume,
  onStep,
  onReset,
  arraySize,
  onChangeArraySize,
  speedMs,
  onChangeSpeed,
  preset,
  onSelectPreset,
  onGenerateArray,
  onApplyCustomArray,
}) => {
  const [customInput, setCustomInput] = useState('45, 12, 89, 34, 7, 23, 67, 18, 52');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const algorithms: AlgorithmType[] = [
    'Bubble Sort',
    'Selection Sort',
    'Insertion Sort',
    'Merge Sort',
    'Quick Sort',
  ];

  const presets: DistributionPreset[] = [
    'Random',
    'Reverse Sorted',
    'Nearly Sorted',
    'Few Unique',
  ];

  const handleApplyCustom = () => {
    setErrorMessage(null);
    setSuccessNote(null);
    const raw = customInput.trim();
    if (!raw) {
      setErrorMessage('Please enter at least one integer value.');
      return;
    }

    const cleaned = raw.replace(/;/g, ',').replace(/\s+/g, ',');
    const tokens = cleaned.split(',').filter((t) => t.trim().length > 0);

    if (tokens.length === 0) {
      setErrorMessage('No valid numbers found in input.');
      return;
    }

    if (tokens.length > 50) {
      setErrorMessage('Maximum 50 items allowed for clean visualization.');
      return;
    }

    const nums: number[] = [];
    for (const token of tokens) {
      const parsed = Number(token);
      if (isNaN(parsed) || !Number.isInteger(parsed)) {
        setErrorMessage(`"${token}" is not a valid integer.`);
        return;
      }
      if (parsed < 1 || parsed > 999) {
        setErrorMessage(`Value ${parsed} is out of bounds (1–999).`);
        return;
      }
      nums.push(parsed);
    }

    onApplyCustomArray(nums);
    setSuccessNote(`Applied ${nums.length} values`);
    setTimeout(() => setSuccessNote(null), 2500);
  };

  return (
    <div className="flex flex-col gap-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-sm">
      {/* 1. Algorithm Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 tracking-wide mb-2">
          1. Select Algorithm
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {algorithms.map((algo) => {
            const isActive = currentAlgorithm === algo;
            return (
              <button
                key={algo}
                onClick={() => onSelectAlgorithm(algo)}
                disabled={isRunning && !isPaused}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80 disabled:opacity-50'
                }`}
              >
                <span>{algo}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* 2. Playback Action Controls */}
      <div>
        <label className="block text-xs font-bold text-slate-700 tracking-wide mb-2">
          2. Playback Controls
        </label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {!isRunning || isFinished ? (
            <button
              onClick={onStart}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start</span>
            </button>
          ) : isPaused ? (
            <button
              onClick={onResume}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={onStep}
            disabled={isRunning && !isPaused}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors disabled:opacity-50"
            title="Advance one step manually"
          >
            <StepForward className="w-4 h-4" />
            <span>Step</span>
          </button>
        </div>

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Array</span>
        </button>
      </div>

      <hr className="border-slate-100" />

      {/* 3. Speed & Size Sliders */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-700">Animation Delay:</span>
            <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">{speedMs} ms</span>
          </div>
          <input
            type="range"
            min={5}
            max={250}
            step={5}
            value={speedMs}
            onChange={(e) => onChangeSpeed(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>Fast (5ms)</span>
            <span>Slow (250ms)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-700">Array Size:</span>
            <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">{arraySize} items</span>
          </div>
          <input
            type="range"
            min={8}
            max={45}
            step={1}
            disabled={isRunning && !isPaused}
            value={arraySize}
            onChange={(e) => onChangeArraySize(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 disabled:opacity-50"
          />
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* 4. Array Presets & Generation */}
      <div>
        <label className="block text-xs font-bold text-slate-700 tracking-wide mb-2">
          3. Array Distribution
        </label>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {presets.map((p) => {
            const isSelected = preset === p;
            return (
              <button
                key={p}
                onClick={() => onSelectPreset(p)}
                disabled={isRunning && !isPaused}
                className={`px-2 py-1.5 rounded-md text-[11px] font-medium border text-center transition-colors disabled:opacity-50 ${
                  isSelected
                    ? 'bg-sky-50 border-sky-300 text-sky-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          onClick={onGenerateArray}
          disabled={isRunning && !isPaused}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs border border-slate-200 transition-colors disabled:opacity-50"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Regenerate Array</span>
        </button>
      </div>

      <hr className="border-slate-100" />

      {/* 5. Custom Array Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 tracking-wide mb-1.5">
          4. Custom Array Input
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={isRunning && !isPaused}
            placeholder="e.g. 45, 12, 89, 34, 7, 23"
            className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
          />
          <button
            onClick={handleApplyCustom}
            disabled={isRunning && !isPaused}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
          >
            Apply
          </button>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-rose-600">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successNote && (
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-emerald-600">
            <Check className="w-3 h-3 shrink-0" />
            <span>{successNote}</span>
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* 6. Color Legend */}
      <div>
        <span className="block text-[11px] font-bold text-slate-500 tracking-wide mb-2 uppercase">
          Color Semantic Legend
        </span>
        <div className="space-y-1.5">
          {(Object.keys(COLOR_LABEL_MAP) as (keyof typeof COLOR_LABEL_MAP)[]).map((key) => {
            const item = COLOR_LABEL_MAP[key];
            return (
              <div key={key} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="text-slate-400 text-[11px]">{item.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
