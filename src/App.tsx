import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FolderArchive,
  Sliders,
  FileCode,
  FileText,
  BarChart2,
} from 'lucide-react';
import { AlgorithmType, BarColorType, DistributionPreset, SortStep } from './types';
import { ALGORITHM_REGISTRY } from './utils/sortingEngines';
import { soundSynth } from './utils/audio';
import { downloadAllProjectFilesZip } from './utils/projectFilesData';
import { VisualizerStage } from './components/VisualizerStage';
import { ControlDeck } from './components/ControlDeck';
import { ComplexityCard } from './components/ComplexityCard';
import { ProjectFilesViewer } from './components/ProjectFilesViewer';
import { ReportViewer } from './components/ReportViewer';
import { BenchmarkLab } from './components/BenchmarkLab';

type TabView = 'visualizer' | 'files' | 'report' | 'benchmark';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('visualizer');
  const [isZipping, setIsZipping] = useState(false);

  // Sorting Visualizer State
  const [currentAlgorithm, setCurrentAlgorithm] = useState<AlgorithmType>('Bubble Sort');
  const [arraySize, setArraySize] = useState<number>(20);
  const [speedMs, setSpeedMs] = useState<number>(40);
  const [preset, setPreset] = useState<DistributionPreset>('Random');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  const [array, setArray] = useState<number[]>([]);
  const [colorStates, setColorStates] = useState<BarColorType[]>([]);
  const [originalArray, setOriginalArray] = useState<number[]>([]);

  // Telemetry
  const [comparisons, setComparisons] = useState<number>(0);
  const [swaps, setSwaps] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0.0);
  const [status, setStatus] = useState<string>('Ready');
  const [message, setMessage] = useState<string>('Select an algorithm and press Start.');
  const [activeLine, setActiveLine] = useState<number | undefined>(undefined);

  // Playback State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Generator & Timing Refs
  const generatorRef = useRef<Generator<SortStep, void, unknown> | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const speedMsRef = useRef<number>(speedMs);
  speedMsRef.current = speedMs;

  // Sound synthesis ref
  const soundEnabledRef = useRef<boolean>(isSoundEnabled);
  soundEnabledRef.current = isSoundEnabled;

  // Helper to generate arrays based on preset
  const generateArrayData = useCallback((size: number, distribution: DistributionPreset): number[] => {
    let arr: number[] = [];
    if (distribution === 'Random') {
      arr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    } else if (distribution === 'Reverse Sorted') {
      arr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10).sort((a, b) => b - a);
    } else if (distribution === 'Nearly Sorted') {
      arr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10).sort((a, b) => a - b);
      const swapCount = Math.max(1, Math.floor(size / 10));
      for (let s = 0; s < swapCount; s++) {
        const i1 = Math.floor(Math.random() * size);
        const i2 = Math.floor(Math.random() * size);
        const tmp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = tmp;
      }
    } else if (distribution === 'Few Unique') {
      const choices = [18, 42, 68, 92];
      arr = Array.from({ length: size }, () => choices[Math.floor(Math.random() * choices.length)]);
    }
    return arr;
  }, []);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Initialize array
  const initArray = useCallback((newArr: number[]) => {
    clearTimer();
    setArray([...newArr]);
    setOriginalArray([...newArr]);
    setColorStates(Array(newArr.length).fill('default'));
    setComparisons(0);
    setSwaps(0);
    setElapsedTime(0);
    accumulatedTimeRef.current = 0;
    setStatus('Ready');
    setMessage(`Loaded array with ${newArr.length} elements.`);
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    generatorRef.current = null;
  }, []);

  // Initial load
  useEffect(() => {
    const initial = generateArrayData(arraySize, preset);
    initArray(initial);
  }, []);

  // Execution step loop
  const executeStep = useCallback((): boolean => {
    if (!generatorRef.current) return false;

    const res = generatorRef.current.next();
    if (res.done) {
      setIsFinished(true);
      setIsRunning(false);
      setIsPaused(false);
      const totalElapsed = accumulatedTimeRef.current + (performance.now() - startTimeRef.current) / 1000;
      accumulatedTimeRef.current = totalElapsed;
      setElapsedTime(totalElapsed);
      setStatus(`Completed in ${totalElapsed.toFixed(2)}s`);
      soundSynth.playCompletionChime();
      return false;
    }

    const state = res.value;
    setArray([...state.array]);
    setColorStates([...state.colorStates]);
    setComparisons(state.comparisons);
    setSwaps(state.swaps);
    setMessage(state.message);
    setActiveLine(state.activeLine);

    // Audio feedback on compared or swapped values
    if (soundEnabledRef.current) {
      const comparedIdx = state.colorStates.findIndex((c) => c === 'compare' || c === 'swap');
      if (comparedIdx !== -1) {
        soundSynth.playTone(state.array[comparedIdx], Math.max(...state.array, 100), 25);
      }
    }

    // Update elapsed time
    const currentElapsed = accumulatedTimeRef.current + (performance.now() - startTimeRef.current) / 1000;
    setElapsedTime(currentElapsed);

    if (state.finished) {
      setIsFinished(true);
      setIsRunning(false);
      setIsPaused(false);
      accumulatedTimeRef.current = currentElapsed;
      setStatus(`Completed in ${currentElapsed.toFixed(2)}s`);
      soundSynth.playCompletionChime();
      return false;
    }

    return true;
  }, []);

  const scheduleNext = useCallback(() => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      const hasMore = executeStep();
      if (hasMore) {
        scheduleNext();
      }
    }, speedMsRef.current);
  }, [executeStep]);

  // Start Sorting
  const handleStart = () => {
    clearTimer();
    const generator = ALGORITHM_REGISTRY[currentAlgorithm].generator(array);
    generatorRef.current = generator;

    setIsRunning(true);
    setIsPaused(false);
    setIsFinished(false);
    setStatus('Sorting...');

    startTimeRef.current = performance.now();
    accumulatedTimeRef.current = 0;

    scheduleNext();
  };

  // Pause
  const handlePause = () => {
    if (isRunning && !isPaused) {
      clearTimer();
      setIsPaused(true);
      accumulatedTimeRef.current += (performance.now() - startTimeRef.current) / 1000;
      setElapsedTime(accumulatedTimeRef.current);
      setStatus('Paused');
    }
  };

  // Resume
  const handleResume = () => {
    if (isRunning && isPaused) {
      setIsPaused(false);
      setStatus('Sorting...');
      startTimeRef.current = performance.now();
      scheduleNext();
    }
  };

  // Single Step
  const handleStep = () => {
    if (!generatorRef.current || isFinished) {
      const generator = ALGORITHM_REGISTRY[currentAlgorithm].generator(array);
      generatorRef.current = generator;
      setIsRunning(true);
      setIsPaused(true);
      setIsFinished(false);
      startTimeRef.current = performance.now();
      accumulatedTimeRef.current = 0;
    } else if (isRunning && !isPaused) {
      handlePause();
    }
    executeStep();
  };

  // Reset
  const handleReset = () => {
    clearTimer();
    initArray(originalArray);
  };

  // Regenerate Array
  const handleRegenerate = () => {
    const newArr = generateArrayData(arraySize, preset);
    initArray(newArr);
  };

  // Custom Array Apply
  const handleApplyCustom = (nums: number[]) => {
    setArraySize(nums.length);
    initArray(nums);
  };

  // Algorithm changed
  const handleSelectAlgorithm = (algo: AlgorithmType) => {
    if (isRunning) {
      handleReset();
    }
    setCurrentAlgorithm(algo);
  };

  // Size changed
  const handleChangeSize = (newSize: number) => {
    setArraySize(newSize);
    if (!isRunning) {
      const newArr = generateArrayData(newSize, preset);
      initArray(newArr);
    }
  };

  // Preset changed
  const handleSelectPreset = (p: DistributionPreset) => {
    setPreset(p);
    if (!isRunning) {
      const newArr = generateArrayData(arraySize, p);
      initArray(newArr);
    }
  };

  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    try {
      await downloadAllProjectFilesZip();
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar Contract: 3 zones ([Brand wordmark] - [4 nav links] - [1 primary action]) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark (single text element) */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('visualizer');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-sky-700 transition-colors"
          >
            Interactive Sorting Visualizer
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'visualizer' ? 'text-slate-950 font-bold border-b-2 border-sky-600 pb-0.5' : 'hover:text-slate-900'
              }`}
            >
              Visualizer
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'files' ? 'text-slate-950 font-bold border-b-2 border-sky-600 pb-0.5' : 'hover:text-slate-900'
              }`}
            >
              Python Files
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'report' ? 'text-slate-950 font-bold border-b-2 border-sky-600 pb-0.5' : 'hover:text-slate-900'
              }`}
            >
              Project Report
            </button>
            <button
              onClick={() => setActiveTab('benchmark')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'benchmark' ? 'text-slate-950 font-bold border-b-2 border-sky-600 pb-0.5' : 'hover:text-slate-900'
              }`}
            >
              Benchmark Lab
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all whitespace-nowrap shrink-0 shadow-xs active:scale-98 disabled:opacity-75 cursor-pointer"
            >
              <FolderArchive className="w-3.5 h-3.5 text-sky-400" />
              <span>{isZipping ? 'Zipping...' : 'Download Project (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* TAB 1: INTERACTIVE VISUALIZER */}
        {activeTab === 'visualizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Control Deck (4 columns on lg) */}
            <div className="lg:col-span-4 xl:col-span-3">
              <ControlDeck
                currentAlgorithm={currentAlgorithm}
                onSelectAlgorithm={handleSelectAlgorithm}
                isRunning={isRunning}
                isPaused={isPaused}
                isFinished={isFinished}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onStep={handleStep}
                onReset={handleReset}
                arraySize={arraySize}
                onChangeArraySize={handleChangeSize}
                speedMs={speedMs}
                onChangeSpeed={setSpeedMs}
                preset={preset}
                onSelectPreset={handleSelectPreset}
                onGenerateArray={handleRegenerate}
                onApplyCustomArray={handleApplyCustom}
              />
            </div>

            {/* Right Stage & Complexity Card (8 columns on lg) */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
              <VisualizerStage
                array={array}
                colorStates={colorStates}
                algorithmName={currentAlgorithm}
                comparisons={comparisons}
                swaps={swaps}
                elapsedTime={elapsedTime}
                message={message}
                status={status}
                isSoundEnabled={isSoundEnabled}
                onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
              />

              <ComplexityCard
                meta={ALGORITHM_REGISTRY[currentAlgorithm].meta}
                activeLine={activeLine}
              />
            </div>
          </div>
        )}

        {/* TAB 2: PYTHON PROJECT FILES */}
        {activeTab === 'files' && <ProjectFilesViewer />}

        {/* TAB 3: ACADEMIC PROJECT REPORT & VIVA GUIDE */}
        {activeTab === 'report' && <ReportViewer />}

        {/* TAB 4: BENCHMARK LAB */}
        {activeTab === 'benchmark' && <BenchmarkLab currentArray={array} />}
      </main>

      {/* Quiet Academic Project Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Interactive Visualization of Sorting Algorithms · Final-Year College Engineering Project
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Python 3</span>
            <span>·</span>
            <span>Tkinter GUI</span>
            <span>·</span>
            <span>Matplotlib</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
