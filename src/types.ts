export type AlgorithmType =
  | 'Bubble Sort'
  | 'Selection Sort'
  | 'Insertion Sort'
  | 'Merge Sort'
  | 'Quick Sort';

export type DistributionPreset =
  | 'Random'
  | 'Reverse Sorted'
  | 'Nearly Sorted'
  | 'Few Unique';

export type BarColorType =
  | 'default'   // #3498DB blue
  | 'compare'   // #E67E22 orange
  | 'swap'      // #E74C3C red
  | 'pivot'     // #9B59B6 purple
  | 'sorted'    // #2ECC71 green
  | 'merge';    // #1ABC9C teal

export interface SortStep {
  array: number[];
  colorStates: BarColorType[];
  comparisons: number;
  swaps: number;
  message: string;
  finished: boolean;
  activeLine?: number; // Python line reference
}

export interface AlgorithmMetadata {
  name: AlgorithmType;
  timeBest: string;
  timeAvg: string;
  timeWorst: string;
  space: string;
  stability: 'Stable' | 'Unstable';
  method: string;
  description: string;
  pythonSnippet: string;
}

export interface BenchmarkResult {
  algorithm: AlgorithmType;
  comparisons: number;
  swaps: number;
  steps: number;
  timeMs: number;
}
