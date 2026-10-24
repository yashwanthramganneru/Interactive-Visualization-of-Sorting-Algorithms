import { AlgorithmMetadata, AlgorithmType, BarColorType, SortStep } from '../types';

export const COLOR_MAP: Record<BarColorType, string> = {
  default: '#3498DB',  // Blue
  compare: '#E67E22',  // Orange
  swap: '#E74C3C',     // Red
  pivot: '#9B59B6',    // Purple
  sorted: '#2ECC71',   // Green
  merge: '#1ABC9C',    // Teal
};

export const COLOR_LABEL_MAP: Record<BarColorType, { name: string; hex: string; desc: string }> = {
  default: { name: 'Blue', hex: '#3498DB', desc: 'Unsorted default element' },
  compare: { name: 'Orange', hex: '#E67E22', desc: 'Active comparison in progress' },
  swap: { name: 'Red', hex: '#E74C3C', desc: 'Active swap or placement' },
  pivot: { name: 'Purple', hex: '#9B59B6', desc: 'Pivot or Key element' },
  sorted: { name: 'Green', hex: '#2ECC71', desc: 'Confirmed final sorted position' },
  merge: { name: 'Teal', hex: '#1ABC9C', desc: 'Subarray slice actively merging' },
};

function makeColorArray(n: number, fill: BarColorType = 'default'): BarColorType[] {
  return Array(n).fill(fill);
}

// -----------------------------------------------------------------------------
// 1. Bubble Sort
// -----------------------------------------------------------------------------
export function* bubbleSortGen(initialArr: number[]): Generator<SortStep, void, unknown> {
  const arr = [...initialArr];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  yield {
    array: [...arr],
    colorStates: makeColorArray(n),
    comparisons,
    swaps,
    message: `Starting Bubble Sort on ${n} elements.`,
    finished: false,
    activeLine: 1,
  };

  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      const colors = makeColorArray(n);
      for (let k = n - i; k < n; k++) colors[k] = 'sorted';
      colors[j] = 'compare';
      colors[j + 1] = 'compare';

      yield {
        array: [...arr],
        colorStates: colors,
        comparisons,
        swaps,
        message: `Pass ${i + 1}: Comparing index ${j} (${arr[j]}) with ${j + 1} (${arr[j + 1]}).`,
        finished: false,
        activeLine: 3,
      };

      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
        swaps++;
        swapped = true;

        colors[j] = 'swap';
        colors[j + 1] = 'swap';

        yield {
          array: [...arr],
          colorStates: colors,
          comparisons,
          swaps,
          message: `Swapped ${arr[j + 1]} and ${arr[j]} (placed smaller value ahead).`,
          finished: false,
          activeLine: 5,
        };
      }
    }

    const passDoneColors = makeColorArray(n);
    for (let k = n - i - 1; k < n; k++) passDoneColors[k] = 'sorted';
    yield {
      array: [...arr],
      colorStates: passDoneColors,
      comparisons,
      swaps,
      message: `Element ${arr[n - i - 1]} at index ${n - i - 1} settled into sorted boundary.`,
      finished: false,
      activeLine: 6,
    };

    if (!swapped) {
      yield {
        array: [...arr],
        colorStates: makeColorArray(n, 'sorted'),
        comparisons,
        swaps,
        message: `Array is fully sorted! Adaptive early termination after ${i + 1} passes.`,
        finished: true,
        activeLine: 8,
      };
      return;
    }
  }

  yield {
    array: [...arr],
    colorStates: makeColorArray(n, 'sorted'),
    comparisons,
    swaps,
    message: `Bubble Sort complete! ${comparisons} comparisons, ${swaps} swaps.`,
    finished: true,
    activeLine: 10,
  };
}

// -----------------------------------------------------------------------------
// 2. Selection Sort
// -----------------------------------------------------------------------------
export function* selectionSortGen(initialArr: number[]): Generator<SortStep, void, unknown> {
  const arr = [...initialArr];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  yield {
    array: [...arr],
    colorStates: makeColorArray(n),
    comparisons,
    swaps,
    message: `Starting Selection Sort on ${n} elements.`,
    finished: false,
    activeLine: 1,
  };

  for (let i = 0; i < n; i++) {
    let minIdx = i;

    const startColors = makeColorArray(n);
    for (let k = 0; k < i; k++) startColors[k] = 'sorted';
    startColors[minIdx] = 'pivot';

    yield {
      array: [...arr],
      colorStates: startColors,
      comparisons,
      swaps,
      message: `Pass ${i + 1}: Searching for minimum element from index ${i} (current candidate: ${arr[minIdx]}).`,
      finished: false,
      activeLine: 2,
    };

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const colors = makeColorArray(n);
      for (let k = 0; k < i; k++) colors[k] = 'sorted';
      colors[minIdx] = 'pivot';
      colors[j] = 'compare';

      yield {
        array: [...arr],
        colorStates: colors,
        comparisons,
        swaps,
        message: `Comparing candidate index ${j} (${arr[j]}) with current minimum (${arr[minIdx]}).`,
        finished: false,
        activeLine: 4,
      };

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        const newMinColors = makeColorArray(n);
        for (let k = 0; k < i; k++) newMinColors[k] = 'sorted';
        newMinColors[minIdx] = 'pivot';

        yield {
          array: [...arr],
          colorStates: newMinColors,
          comparisons,
          swaps,
          message: `New minimum found: ${arr[minIdx]} at index ${minIdx}.`,
          finished: false,
          activeLine: 5,
        };
      }
    }

    if (minIdx !== i) {
      const tmp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = tmp;
      swaps++;

      const swapColors = makeColorArray(n);
      for (let k = 0; k < i; k++) swapColors[k] = 'sorted';
      swapColors[i] = 'swap';
      swapColors[minIdx] = 'swap';

      yield {
        array: [...arr],
        colorStates: swapColors,
        comparisons,
        swaps,
        message: `Swapping minimum ${arr[i]} into sorted position at index ${i}.`,
        finished: false,
        activeLine: 7,
      };
    }

    const settledColors = makeColorArray(n);
    for (let k = 0; k <= i; k++) settledColors[k] = 'sorted';
    yield {
      array: [...arr],
      colorStates: settledColors,
      comparisons,
      swaps,
      message: `Index ${i} (${arr[i]}) locked into sorted region.`,
      finished: false,
      activeLine: 8,
    };
  }

  yield {
    array: [...arr],
    colorStates: makeColorArray(n, 'sorted'),
    comparisons,
    swaps,
    message: `Selection Sort complete! ${comparisons} comparisons, ${swaps} swaps.`,
    finished: true,
    activeLine: 10,
  };
}

// -----------------------------------------------------------------------------
// 3. Insertion Sort
// -----------------------------------------------------------------------------
export function* insertionSortGen(initialArr: number[]): Generator<SortStep, void, unknown> {
  const arr = [...initialArr];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  yield {
    array: [...arr],
    colorStates: makeColorArray(n),
    comparisons,
    swaps,
    message: `Starting Insertion Sort on ${n} elements.`,
    finished: false,
    activeLine: 1,
  };

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    const colors = makeColorArray(n);
    for (let k = 0; k < i; k++) colors[k] = 'sorted';
    colors[i] = 'pivot';

    yield {
      array: [...arr],
      colorStates: colors,
      comparisons,
      swaps,
      message: `Selecting key ${key} at index ${i} to insert into sorted left partition.`,
      finished: false,
      activeLine: 3,
    };

    while (j >= 0) {
      comparisons++;
      const compColors = makeColorArray(n);
      for (let k = 0; k < i; k++) compColors[k] = 'sorted';
      compColors[j] = 'compare';
      compColors[j + 1] = 'pivot';

      yield {
        array: [...arr],
        colorStates: compColors,
        comparisons,
        swaps,
        message: `Comparing key ${key} with ${arr[j]} at index ${j}.`,
        finished: false,
        activeLine: 5,
      };

      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        swaps++;

        const shiftColors = makeColorArray(n);
        for (let k = 0; k < i; k++) shiftColors[k] = 'sorted';
        shiftColors[j] = 'swap';
        shiftColors[j + 1] = 'swap';

        yield {
          array: [...arr],
          colorStates: shiftColors,
          comparisons,
          swaps,
          message: `Shifted ${arr[j + 1]} rightwards to index ${j + 1}.`,
          finished: false,
          activeLine: 6,
        };
        j--;
      } else {
        break;
      }
    }

    arr[j + 1] = key;
    swaps++;

    const insertColors = makeColorArray(n);
    for (let k = 0; k <= i; k++) insertColors[k] = 'sorted';

    yield {
      array: [...arr],
      colorStates: insertColors,
      comparisons,
      swaps,
      message: `Inserted key ${key} into position ${j + 1}.`,
      finished: false,
      activeLine: 8,
    };
  }

  yield {
    array: [...arr],
    colorStates: makeColorArray(n, 'sorted'),
    comparisons,
    swaps,
    message: `Insertion Sort complete! ${comparisons} comparisons, ${swaps} shifts/writes.`,
    finished: true,
    activeLine: 10,
  };
}

// -----------------------------------------------------------------------------
// 4. Merge Sort
// -----------------------------------------------------------------------------
export function* mergeSortGen(initialArr: number[]): Generator<SortStep, void, unknown> {
  const arr = [...initialArr];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  yield {
    array: [...arr],
    colorStates: makeColorArray(n),
    comparisons,
    swaps,
    message: `Starting Merge Sort (Divide & Conquer) on ${n} elements.`,
    finished: false,
    activeLine: 1,
  };

  function* merge(start: number, mid: number, end: number): Generator<SortStep, void, unknown> {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);

    let i = 0;
    let j = 0;
    let k = start;

    const baseColors = makeColorArray(n);
    for (let idx = start; idx <= end; idx++) baseColors[idx] = 'merge';

    yield {
      array: [...arr],
      colorStates: [...baseColors],
      comparisons,
      swaps,
      message: `Merging subarrays [${start}..${mid}] and [${mid + 1}..${end}].`,
      finished: false,
      activeLine: 4,
    };

    while (i < left.length && j < right.length) {
      comparisons++;
      const compColors = [...baseColors];
      compColors[k] = 'compare';

      yield {
        array: [...arr],
        colorStates: compColors,
        comparisons,
        swaps,
        message: `Comparing left ${left[i]} with right ${right[j]}.`,
        finished: false,
        activeLine: 6,
      };

      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }
      swaps++;

      const swapColors = [...baseColors];
      swapColors[k] = 'swap';
      yield {
        array: [...arr],
        colorStates: swapColors,
        comparisons,
        swaps,
        message: `Placed smaller element ${arr[k]} into index ${k}.`,
        finished: false,
        activeLine: 7,
      };
      k++;
    }

    while (i < left.length) {
      arr[k] = left[i];
      i++;
      swaps++;
      const colors = [...baseColors];
      colors[k] = 'swap';
      yield {
        array: [...arr],
        colorStates: colors,
        comparisons,
        swaps,
        message: `Flushed remaining left element ${arr[k]} into index ${k}.`,
        finished: false,
        activeLine: 8,
      };
      k++;
    }

    while (j < right.length) {
      arr[k] = right[j];
      j++;
      swaps++;
      const colors = [...baseColors];
      colors[k] = 'swap';
      yield {
        array: [...arr],
        colorStates: colors,
        comparisons,
        swaps,
        message: `Flushed remaining right element ${arr[k]} into index ${k}.`,
        finished: false,
        activeLine: 9,
      };
      k++;
    }
  }

  function* divideAndConquer(start: number, end: number): Generator<SortStep, void, unknown> {
    if (start < end) {
      const mid = Math.floor((start + end) / 2);
      yield* divideAndConquer(start, mid);
      yield* divideAndConquer(mid + 1, end);
      yield* merge(start, mid, end);
    }
  }

  yield* divideAndConquer(0, n - 1);

  yield {
    array: [...arr],
    colorStates: makeColorArray(n, 'sorted'),
    comparisons,
    swaps,
    message: `Merge Sort complete! ${comparisons} comparisons, ${swaps} writes.`,
    finished: true,
    activeLine: 10,
  };
}

// -----------------------------------------------------------------------------
// 5. Quick Sort
// -----------------------------------------------------------------------------
export function* quickSortGen(initialArr: number[]): Generator<SortStep, void, unknown> {
  const arr = [...initialArr];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  yield {
    array: [...arr],
    colorStates: makeColorArray(n),
    comparisons,
    swaps,
    message: `Starting Quick Sort (Lomuto Partition) on ${n} elements.`,
    finished: false,
    activeLine: 1,
  };

  function* quickSortHelper(low: number, high: number): Generator<SortStep, void, unknown> {
    if (low < high) {
      const pivot = arr[high];
      let i = low - 1;

      const colors = makeColorArray(n);
      colors[high] = 'pivot';

      yield {
        array: [...arr],
        colorStates: colors,
        comparisons,
        swaps,
        message: `Partitioning [${low}..${high}]: Chosen pivot ${pivot} at index ${high}.`,
        finished: false,
        activeLine: 3,
      };

      for (let j = low; j < high; j++) {
        comparisons++;
        const compColors = makeColorArray(n);
        compColors[high] = 'pivot';
        compColors[j] = 'compare';
        if (i >= low) compColors[i] = 'swap';

        yield {
          array: [...arr],
          colorStates: compColors,
          comparisons,
          swaps,
          message: `Comparing element ${arr[j]} at index ${j} with pivot ${pivot}.`,
          finished: false,
          activeLine: 5,
        };

        if (arr[j] < pivot) {
          i++;
          const tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
          swaps++;

          const swapColors = makeColorArray(n);
          swapColors[high] = 'pivot';
          swapColors[i] = 'swap';
          swapColors[j] = 'swap';

          yield {
            array: [...arr],
            colorStates: swapColors,
            comparisons,
            swaps,
            message: `Element ${arr[i]} < pivot (${pivot}). Swapped with index ${i}.`,
            finished: false,
            activeLine: 6,
          };
        }
      }

      const tmp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = tmp;
      swaps++;
      const pi = i + 1;

      const settledColors = makeColorArray(n);
      settledColors[pi] = 'sorted';

      yield {
        array: [...arr],
        colorStates: settledColors,
        comparisons,
        swaps,
        message: `Pivot ${pivot} positioned at final partition index ${pi}.`,
        finished: false,
        activeLine: 8,
      };

      yield* quickSortHelper(low, pi - 1);
      yield* quickSortHelper(pi + 1, high);
    } else if (low === high) {
      const singleColors = makeColorArray(n);
      singleColors[low] = 'sorted';
      yield {
        array: [...arr],
        colorStates: singleColors,
        comparisons,
        swaps,
        message: `Base case: single element at index ${low} is already in position.`,
        finished: false,
        activeLine: 9,
      };
    }
  }

  yield* quickSortHelper(0, n - 1);

  yield {
    array: [...arr],
    colorStates: makeColorArray(n, 'sorted'),
    comparisons,
    swaps,
    message: `Quick Sort complete! ${comparisons} comparisons, ${swaps} swaps.`,
    finished: true,
    activeLine: 10,
  };
}

export const ALGORITHM_REGISTRY: Record<
  AlgorithmType,
  {
    generator: (arr: number[]) => Generator<SortStep, void, unknown>;
    meta: AlgorithmMetadata;
  }
> = {
  'Bubble Sort': {
    generator: bubbleSortGen,
    meta: {
      name: 'Bubble Sort',
      timeBest: 'O(n)',
      timeAvg: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)',
      stability: 'Stable',
      method: 'Adjacent Comparison & Swap',
      description:
        'Repeatedly steps through the list, compares adjacent elements, and swaps them if out of order. Optimized with a swapped flag for linear best-case runtime on sorted lists.',
      pythonSnippet: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
    },
  },
  'Selection Sort': {
    generator: selectionSortGen,
    meta: {
      name: 'Selection Sort',
      timeBest: 'O(n²)',
      timeAvg: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)',
      stability: 'Unstable',
      method: 'Selection of Minimum',
      description:
        'Divides the list into sorted and unsorted segments. Repeatedly finds the smallest item in the unsorted segment and moves it to the beginning of the unsorted segment.',
      pythonSnippet: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    },
  },
  'Insertion Sort': {
    generator: insertionSortGen,
    meta: {
      name: 'Insertion Sort',
      timeBest: 'O(n)',
      timeAvg: 'O(n²)',
      timeWorst: 'O(n²)',
      space: 'O(1)',
      stability: 'Stable',
      method: 'Incremental Insertion',
      description:
        'Builds the sorted array one element at a time by picking the next key element and shifting larger items to the right to make space for it. Highly efficient for small or nearly sorted lists.',
      pythonSnippet: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    },
  },
  'Merge Sort': {
    generator: mergeSortGen,
    meta: {
      name: 'Merge Sort',
      timeBest: 'O(n log n)',
      timeAvg: 'O(n log n)',
      timeWorst: 'O(n log n)',
      space: 'O(n)',
      stability: 'Stable',
      method: 'Divide and Conquer',
      description:
        'Recursively halves the array until sublists of size 1 remain, then systematically merges sorted sublists in linear time. Guarantees O(n log n) even in worst-case scenarios.',
      pythonSnippet: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`,
    },
  },
  'Quick Sort': {
    generator: quickSortGen,
    meta: {
      name: 'Quick Sort',
      timeBest: 'O(n log n)',
      timeAvg: 'O(n log n)',
      timeWorst: 'O(n²)',
      space: 'O(log n)',
      stability: 'Unstable',
      method: 'Partition & Conquer',
      description:
        'Selects a pivot element (Lomuto scheme uses end element) and partitions other elements into smaller and larger partitions, recursively sorting each side.',
      pythonSnippet: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr`,
    },
  },
};
