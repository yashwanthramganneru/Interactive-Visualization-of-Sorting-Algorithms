import React, { useState } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { AlgorithmType } from '../types';
import { ALGORITHM_REGISTRY } from '../utils/sortingEngines';

interface BenchmarkLabProps {
  currentArray: number[];
}

interface RunResult {
  algorithm: AlgorithmType;
  comparisons: number;
  swaps: number;
  totalSteps: number;
  timeEstimateMs: number;
}

export const BenchmarkLab: React.FC<BenchmarkLabProps> = ({ currentArray }) => {
  const [results, setResults] = useState<RunResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = () => {
    setIsRunning(true);
    setResults(null);

    setTimeout(() => {
      const algos: AlgorithmType[] = [
        'Bubble Sort',
        'Selection Sort',
        'Insertion Sort',
        'Merge Sort',
        'Quick Sort',
      ];

      const out: RunResult[] = algos.map((algo) => {
        const t0 = performance.now();
        const gen = ALGORITHM_REGISTRY[algo].generator(currentArray);
        let lastState: any = null;
        let count = 0;
        for (const state of gen) {
          lastState = state;
          count++;
        }
        const t1 = performance.now();

        return {
          algorithm: algo,
          comparisons: lastState ? lastState.comparisons : 0,
          swaps: lastState ? lastState.swaps : 0,
          totalSteps: count,
          timeEstimateMs: Math.max(0.1, Number((t1 - t0).toFixed(2))),
        };
      });

      setResults(out);
      setIsRunning(false);
    }, 150);
  };

  const maxComparisons = results ? Math.max(...results.map((r) => r.comparisons), 1) : 1;
  const maxSwaps = results ? Math.max(...results.map((r) => r.swaps), 1) : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Comparative Algorithm Shootout</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Execute all 5 sorting algorithms on the exact current array ({currentArray.length} items)
            to compare efficiency side-by-side.
          </p>
        </div>

        <button
          onClick={runBenchmark}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Benchmarking...' : 'Run Comparative Benchmark'}</span>
        </button>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Algorithm</th>
                  <th className="py-3 px-4">Comparisons</th>
                  <th className="py-3 px-4">Swaps / Writes</th>
                  <th className="py-3 px-4">Total Animation Steps</th>
                  <th className="py-3 px-4">Theoretical Worst</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {results.map((r) => (
                  <tr key={r.algorithm} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{r.algorithm}</td>
                    <td className="py-2.5 px-4 tabular-nums">
                      <div className="flex items-center gap-2">
                        <span className="w-12">{r.comparisons}</span>
                        <div className="w-24 bg-slate-100 rounded-xs h-2 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-xs"
                            style={{ width: `${(r.comparisons / maxComparisons) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 tabular-nums">
                      <div className="flex items-center gap-2">
                        <span className="w-12">{r.swaps}</span>
                        <div className="w-24 bg-slate-100 rounded-xs h-2 overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-xs"
                            style={{ width: `${(r.swaps / maxSwaps) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 tabular-nums text-slate-600">{r.totalSteps}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">
                      {ALGORITHM_REGISTRY[r.algorithm].meta.timeWorst}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
