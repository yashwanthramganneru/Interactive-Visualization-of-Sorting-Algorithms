"""
sorting_algorithms.py
======================
Implementation of sorting algorithms as generator functions for interactive visualization.
Each algorithm yields state snapshots at every comparison, swap, and partitioning step.

Yielded state dictionary structure:
{
    "array": list of int/float,      # Current state of the array
    "colors": list of str,           # Color for each bar
    "comparisons": int,              # Total comparisons so far
    "swaps": int,                    # Total swaps/movements so far
    "message": str,                  # Contextual explanation of the current step
    "finished": bool                 # True when sorting is complete
}

Color Palette:
- DEFAULT:  #3498DB (Blue)
- COMPARE:  #E67E22 (Orange)
- SWAP:     #E74C3C (Red)
- PIVOT:    #9B59B6 (Purple)
- SORTED:   #2ECC71 (Green)
- MERGE:    #1ABC9C (Teal)
"""

# Color Constants
COLOR_DEFAULT = "#3498DB"   # Soft Blue: unsorted default
COLOR_COMPARE = "#E67E22"   # Warm Orange: elements currently compared
COLOR_SWAP    = "#E74C3C"   # Crimson Red: elements currently swapped
COLOR_PIVOT   = "#9B59B6"   # Royal Purple: pivot or key element
COLOR_SORTED  = "#2ECC71"   # Vibrant Green: elements confirmed sorted
COLOR_MERGE   = "#1ABC9C"   # Teal / Cyan: merge temporary buffer zone


def get_color_list(n, default_color=COLOR_DEFAULT):
    """Utility to generate a uniform color list of size n."""
    return [default_color] * n


# ==============================================================================
# 1. BUBBLE SORT
# ==============================================================================
def bubble_sort(arr):
    """
    Bubble Sort Algorithm Generator
    Time Complexity:
      - Best: O(n) [optimized with swapped flag]
      - Average: O(n^2)
      - Worst: O(n^2)
    Space Complexity: O(1)
    Stability: Stable
    """
    a = list(arr)
    n = len(a)
    comparisons = 0
    swaps = 0

    colors = get_color_list(n)
    yield {
        "array": list(a),
        "colors": list(colors),
        "comparisons": comparisons,
        "swaps": swaps,
        "message": f"Starting Bubble Sort on {n} elements.",
        "finished": False
    }

    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            comparisons += 1

            # Highlight compared elements in Orange
            colors = [COLOR_SORTED if k >= n - i else COLOR_DEFAULT for k in range(n)]
            colors[j] = COLOR_COMPARE
            colors[j + 1] = COLOR_COMPARE

            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": comparisons,
                "swaps": swaps,
                "message": f"Pass {i + 1}: Comparing index {j} ({a[j]}) and {j + 1} ({a[j + 1]}).",
                "finished": False
            }

            if a[j] > a[j + 1]:
                # Swap elements
                a[j], a[j + 1] = a[j + 1], a[j]
                swaps += 1
                swapped = True

                # Highlight swapped elements in Red
                colors[j] = COLOR_SWAP
                colors[j + 1] = COLOR_SWAP
                yield {
                    "array": list(a),
                    "colors": list(colors),
                    "comparisons": comparisons,
                    "swaps": swaps,
                    "message": f"Swapped: {a[j + 1]} > {a[j]}, placed smaller value forward.",
                    "finished": False
                }

        # Mark the last element of this pass as sorted
        colors = [COLOR_SORTED if k >= n - i - 1 else COLOR_DEFAULT for k in range(n)]
        yield {
            "array": list(a),
            "colors": list(colors),
            "comparisons": comparisons,
            "swaps": swaps,
            "message": f"Element {a[n - i - 1]} is now placed in its final sorted position.",
            "finished": False
        }

        # Early termination optimization
        if not swapped:
            yield {
                "array": list(a),
                "colors": get_color_list(n, COLOR_SORTED),
                "comparisons": comparisons,
                "swaps": swaps,
                "message": "Array is already fully sorted! Early termination triggered.",
                "finished": True
            }
            return

    # Final sorted confirmation state
    yield {
        "array": list(a),
        "colors": get_color_list(n, COLOR_SORTED),
        "comparisons": comparisons,
        "swaps": swaps,
        "message": f"Bubble Sort complete! Total comparisons: {comparisons}, Total swaps: {swaps}.",
        "finished": True
    }


# ==============================================================================
# 2. SELECTION SORT
# ==============================================================================
def selection_sort(arr):
    """
    Selection Sort Algorithm Generator
    Time Complexity:
      - Best: O(n^2)
      - Average: O(n^2)
      - Worst: O(n^2)
    Space Complexity: O(1)
    Stability: Unstable (by default)
    """
    a = list(arr)
    n = len(a)
    comparisons = 0
    swaps = 0

    yield {
        "array": list(a),
        "colors": get_color_list(n),
        "comparisons": comparisons,
        "swaps": swaps,
        "message": f"Starting Selection Sort on {n} elements.",
        "finished": False
    }

    for i in range(n):
        min_idx = i

        # Step announcement
        colors = [COLOR_SORTED if k < i else COLOR_DEFAULT for k in range(n)]
        colors[min_idx] = COLOR_PIVOT
        yield {
            "array": list(a),
            "colors": list(colors),
            "comparisons": comparisons,
            "swaps": swaps,
            "message": f"Step {i + 1}: Seeking minimum element starting from index {i} (current: {a[min_idx]}).",
            "finished": False
        }

        for j in range(i + 1, n):
            comparisons += 1
            colors = [COLOR_SORTED if k < i else COLOR_DEFAULT for k in range(n)]
            colors[min_idx] = COLOR_PIVOT
            colors[j] = COLOR_COMPARE

            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": comparisons,
                "swaps": swaps,
                "message": f"Comparing candidate {a[j]} at index {j} with minimum {a[min_idx]}.",
                "finished": False
            }

            if a[j] < a[min_idx]:
                min_idx = j
                colors = [COLOR_SORTED if k < i else COLOR_DEFAULT for k in range(n)]
                colors[min_idx] = COLOR_PIVOT
                yield {
                    "array": list(a),
                    "colors": list(colors),
                    "comparisons": comparisons,
                    "swaps": swaps,
                    "message": f"New minimum discovered: {a[min_idx]} at index {min_idx}.",
                    "finished": False
                }

        # Swap found minimum into position i
        if min_idx != i:
            a[i], a[min_idx] = a[min_idx], a[i]
            swaps += 1
            colors = [COLOR_SORTED if k < i else COLOR_DEFAULT for k in range(n)]
            colors[i] = COLOR_SWAP
            colors[min_idx] = COLOR_SWAP
            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": comparisons,
                "swaps": swaps,
                "message": f"Swapping minimum element {a[i]} into sorted position {i}.",
                "finished": False
            }

        # Confirmed sorted boundary
        colors = [COLOR_SORTED if k <= i else COLOR_DEFAULT for k in range(n)]
        yield {
            "array": list(a),
            "colors": list(colors),
            "comparisons": comparisons,
            "swaps": swaps,
            "message": f"Index {i} ({a[i]}) is now sorted.",
            "finished": False
        }

    yield {
        "array": list(a),
        "colors": get_color_list(n, COLOR_SORTED),
        "comparisons": comparisons,
        "swaps": swaps,
        "message": f"Selection Sort complete! Total comparisons: {comparisons}, Total swaps: {swaps}.",
        "finished": True
    }


# ==============================================================================
# 3. INSERTION SORT
# ==============================================================================
def insertion_sort(arr):
    """
    Insertion Sort Algorithm Generator
    Time Complexity:
      - Best: O(n) [already sorted]
      - Average: O(n^2)
      - Worst: O(n^2)
    Space Complexity: O(1)
    Stability: Stable
    """
    a = list(arr)
    n = len(a)
    comparisons = 0
    swaps = 0

    yield {
        "array": list(a),
        "colors": get_color_list(n),
        "comparisons": comparisons,
        "swaps": swaps,
        "message": f"Starting Insertion Sort on {n} elements.",
        "finished": False
    }

    # Index 0 is considered trivially sorted initially
    for i in range(1, n):
        key = a[i]
        j = i - 1

        colors = [COLOR_SORTED if k < i else COLOR_DEFAULT for k in range(n)]
        colors[i] = COLOR_PIVOT  # Key element highlighted in purple
        yield {
            "array": list(a),
            "colors": list(colors),
            "comparisons": comparisons,
            "swaps": swaps,
            "message": f"Picking key element {key} at index {i} for insertion into sorted sub-array.",
            "finished": False
        }

        while j >= 0:
            comparisons += 1
            colors = [COLOR_SORTED if k < i else COLOR_DEFAULT for k in range(n)]
            colors[j] = COLOR_COMPARE
            colors[j + 1] = COLOR_PIVOT

            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": comparisons,
                "swaps": swaps,
                "message": f"Comparing key {key} with {a[j]} at index {j}.",
                "finished": False
            }

            if a[j] > key:
                # Shift element to the right
                a[j + 1] = a[j]
                swaps += 1
                colors[j] = COLOR_SWAP
                colors[j + 1] = COLOR_SWAP
                yield {
                    "array": list(a),
                    "colors": list(colors),
                    "comparisons": comparisons,
                    "swaps": swaps,
                    "message": f"Shifted {a[j + 1]} rightwards to make space for key {key}.",
                    "finished": False
                }
                j -= 1
            else:
                break

        a[j + 1] = key
        swaps += 1  # insertion write
        colors = [COLOR_SORTED if k <= i else COLOR_DEFAULT for k in range(n)]
        yield {
            "array": list(a),
            "colors": list(colors),
            "comparisons": comparisons,
            "swaps": swaps,
            "message": f"Inserted key {key} into position {j + 1}.",
            "finished": False
        }

    yield {
        "array": list(a),
        "colors": get_color_list(n, COLOR_SORTED),
        "comparisons": comparisons,
        "swaps": swaps,
        "message": f"Insertion Sort complete! Total comparisons: {comparisons}, Total shifts/writes: {swaps}.",
        "finished": True
    }


# ==============================================================================
# 4. MERGE SORT
# ==============================================================================
def merge_sort(arr):
    """
    Merge Sort Algorithm Generator
    Time Complexity:
      - Best: O(n log n)
      - Average: O(n log n)
      - Worst: O(n log n)
    Space Complexity: O(n)
    Stability: Stable
    """
    a = list(arr)
    n = len(a)
    stats = {"comparisons": 0, "swaps": 0}

    yield {
        "array": list(a),
        "colors": get_color_list(n),
        "comparisons": stats["comparisons"],
        "swaps": stats["swaps"],
        "message": f"Starting Merge Sort (Divide & Conquer) on {n} elements.",
        "finished": False
    }

    def merge(start, mid, end):
        left = a[start:mid + 1]
        right = a[mid + 1:end + 1]

        i = 0
        j = 0
        k = start

        # Visual indicator of the current merge segment
        colors = get_color_list(n)
        for idx in range(start, end + 1):
            colors[idx] = COLOR_MERGE

        yield {
            "array": list(a),
            "colors": list(colors),
            "comparisons": stats["comparisons"],
            "swaps": stats["swaps"],
            "message": f"Merging subarrays [{start}..{mid}] and [{mid + 1}..{end}].",
            "finished": False
        }

        while i < len(left) and j < len(right):
            stats["comparisons"] += 1
            colors = get_color_list(n)
            for idx in range(start, end + 1):
                colors[idx] = COLOR_MERGE
            colors[k] = COLOR_COMPARE

            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": stats["comparisons"],
                "swaps": stats["swaps"],
                "message": f"Comparing left element {left[i]} with right element {right[j]}.",
                "finished": False
            }

            if left[i] <= right[j]:
                a[k] = left[i]
                i += 1
            else:
                a[k] = right[j]
                j += 1
            stats["swaps"] += 1

            colors[k] = COLOR_SWAP
            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": stats["comparisons"],
                "swaps": stats["swaps"],
                "message": f"Placed smaller element {a[k]} at index {k}.",
                "finished": False
            }
            k += 1

        while i < len(left):
            a[k] = left[i]
            i += 1
            stats["swaps"] += 1
            colors = get_color_list(n)
            for idx in range(start, end + 1):
                colors[idx] = COLOR_MERGE
            colors[k] = COLOR_SWAP
            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": stats["comparisons"],
                "swaps": stats["swaps"],
                "message": f"Flushed remaining left element {a[k]} into index {k}.",
                "finished": False
            }
            k += 1

        while j < len(right):
            a[k] = right[j]
            j += 1
            stats["swaps"] += 1
            colors = get_color_list(n)
            for idx in range(start, end + 1):
                colors[idx] = COLOR_MERGE
            colors[k] = COLOR_SWAP
            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": stats["comparisons"],
                "swaps": stats["swaps"],
                "message": f"Flushed remaining right element {a[k]} into index {k}.",
                "finished": False
            }
            k += 1

    def divide_and_conquer(start, end):
        if start < end:
            mid = (start + end) // 2
            yield from divide_and_conquer(start, mid)
            yield from divide_and_conquer(mid + 1, end)
            yield from merge(start, mid, end)

    yield from divide_and_conquer(0, n - 1)

    yield {
        "array": list(a),
        "colors": get_color_list(n, COLOR_SORTED),
        "comparisons": stats["comparisons"],
        "swaps": stats["swaps"],
        "message": f"Merge Sort complete! Total comparisons: {stats['comparisons']}, Total writes: {stats['swaps']}.",
        "finished": True
    }


# ==============================================================================
# 5. QUICK SORT
# ==============================================================================
def quick_sort(arr):
    """
    Quick Sort Algorithm Generator (Lomuto Partition Scheme)
    Time Complexity:
      - Best: O(n log n)
      - Average: O(n log n)
      - Worst: O(n^2) [when unbalanced partitions occur]
    Space Complexity: O(log n) call stack
    Stability: Unstable
    """
    a = list(arr)
    n = len(a)
    stats = {"comparisons": 0, "swaps": 0}

    yield {
        "array": list(a),
        "colors": get_color_list(n),
        "comparisons": stats["comparisons"],
        "swaps": stats["swaps"],
        "message": f"Starting Quick Sort (Lomuto Partition Scheme) on {n} elements.",
        "finished": False
    }

    def partition(low, high):
        pivot = a[high]
        i = low - 1

        colors = get_color_list(n)
        colors[high] = COLOR_PIVOT
        for idx in range(low, high):
            colors[idx] = COLOR_DEFAULT

        yield {
            "array": list(a),
            "colors": list(colors),
            "comparisons": stats["comparisons"],
            "swaps": stats["swaps"],
            "message": f"Partitioning range [{low}..{high}]: Selected pivot {pivot} at index {high}.",
            "finished": False
        }

        for j in range(low, high):
            stats["comparisons"] += 1
            colors = get_color_list(n)
            colors[high] = COLOR_PIVOT
            colors[j] = COLOR_COMPARE
            if i >= low:
                colors[i] = COLOR_SWAP

            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": stats["comparisons"],
                "swaps": stats["swaps"],
                "message": f"Comparing element {a[j]} at index {j} against pivot {pivot}.",
                "finished": False
            }

            if a[j] < pivot:
                i += 1
                a[i], a[j] = a[j], a[i]
                stats["swaps"] += 1

                colors = get_color_list(n)
                colors[high] = COLOR_PIVOT
                colors[i] = COLOR_SWAP
                colors[j] = COLOR_SWAP
                yield {
                    "array": list(a),
                    "colors": list(colors),
                    "comparisons": stats["comparisons"],
                    "swaps": stats["swaps"],
                    "message": f"Element {a[i]} < pivot ({pivot}). Swapped with index {i}.",
                    "finished": False
                }

        # Place pivot into its correct partition index
        a[i + 1], a[high] = a[high], a[i + 1]
        stats["swaps"] += 1

        colors = get_color_list(n)
        colors[i + 1] = COLOR_SORTED
        yield {
            "array": list(a),
            "colors": list(colors),
            "comparisons": stats["comparisons"],
            "swaps": stats["swaps"],
            "message": f"Placed pivot {pivot} into its sorted position at index {i + 1}.",
            "finished": False
        }

        return i + 1

    def quick_sort_recursive(low, high):
        if low < high:
            pi_generator = partition(low, high)
            pi = None
            for step in pi_generator:
                pi = step  # The last yielded step yields the pivot index or intermediate
                yield step
            # Note: in Python generator, we can compute partition inline or obtain pivot index
            # To get partition index reliably while yielding:
            pass

    # Clean iterative stack or explicit helper for partition with yield
    def quick_sort_helper(low, high):
        if low < high:
            # We run partition step-by-step
            pivot = a[high]
            i = low - 1

            colors = get_color_list(n)
            colors[high] = COLOR_PIVOT

            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": stats["comparisons"],
                "swaps": stats["swaps"],
                "message": f"Subarray [{low}..{high}]: Selected pivot {pivot} at index {high}.",
                "finished": False
            }

            for j in range(low, high):
                stats["comparisons"] += 1
                colors = get_color_list(n)
                colors[high] = COLOR_PIVOT
                colors[j] = COLOR_COMPARE
                if i >= low:
                    colors[i] = COLOR_SWAP

                yield {
                    "array": list(a),
                    "colors": list(colors),
                    "comparisons": stats["comparisons"],
                    "swaps": stats["swaps"],
                    "message": f"Comparing {a[j]} with pivot {pivot}.",
                    "finished": False
                }

                if a[j] < pivot:
                    i += 1
                    a[i], a[j] = a[j], a[i]
                    stats["swaps"] += 1
                    colors = get_color_list(n)
                    colors[high] = COLOR_PIVOT
                    colors[i] = COLOR_SWAP
                    colors[j] = COLOR_SWAP
                    yield {
                        "array": list(a),
                        "colors": list(colors),
                        "comparisons": stats["comparisons"],
                        "swaps": stats["swaps"],
                        "message": f"Swapped {a[i]} into left partition (< {pivot}).",
                        "finished": False
                    }

            a[i + 1], a[high] = a[high], a[i + 1]
            stats["swaps"] += 1
            pi = i + 1

            colors = get_color_list(n)
            colors[pi] = COLOR_SORTED
            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": stats["comparisons"],
                "swaps": stats["swaps"],
                "message": f"Pivot {pivot} settled at index {pi}.",
                "finished": False
            }

            yield from quick_sort_helper(low, pi - 1)
            yield from quick_sort_helper(pi + 1, high)
        elif low == high:
            colors = get_color_list(n)
            colors[low] = COLOR_SORTED
            yield {
                "array": list(a),
                "colors": list(colors),
                "comparisons": stats["comparisons"],
                "swaps": stats["swaps"],
                "message": f"Single element at index {low} is already in place.",
                "finished": False
            }

    yield from quick_sort_helper(0, n - 1)

    yield {
        "array": list(a),
        "colors": get_color_list(n, COLOR_SORTED),
        "comparisons": stats["comparisons"],
        "swaps": stats["swaps"],
        "message": f"Quick Sort complete! Total comparisons: {stats['comparisons']}, Total swaps: {stats['swaps']}.",
        "finished": True
    }


# Algorithm Metadata Dictionary
ALGORITHM_INFO = {
    "Bubble Sort": {
        "func": bubble_sort,
        "time_best": "O(n)",
        "time_avg": "O(n²)",
        "time_worst": "O(n²)",
        "space": "O(1)",
        "stability": "Stable",
        "description": "Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The largest element 'bubbles' to the end in each pass."
    },
    "Selection Sort": {
        "func": selection_sort,
        "time_best": "O(n²)",
        "time_avg": "O(n²)",
        "time_worst": "O(n²)",
        "space": "O(1)",
        "stability": "Unstable",
        "description": "Divides input into sorted and unsorted regions. Repeatedly searches the unsorted region for the smallest element and swaps it with the leftmost unsorted element."
    },
    "Insertion Sort": {
        "func": insertion_sort,
        "time_best": "O(n)",
        "time_avg": "O(n²)",
        "time_worst": "O(n²)",
        "space": "O(1)",
        "stability": "Stable",
        "description": "Builds the sorted array one element at a time by comparing the current key with already-sorted items and shifting larger elements to the right."
    },
    "Merge Sort": {
        "func": merge_sort,
        "time_best": "O(n log n)",
        "time_avg": "O(n log n)",
        "time_worst": "O(n log n)",
        "space": "O(n)",
        "stability": "Stable",
        "description": "Divide-and-conquer algorithm that recursively halves the array, sorts the halves independently, and merges the sorted halves back together."
    },
    "Quick Sort": {
        "func": quick_sort,
        "time_best": "O(n log n)",
        "time_avg": "O(n log n)",
        "time_worst": "O(n²)",
        "space": "O(log n)",
        "stability": "Unstable",
        "description": "Selects a 'pivot' element and partitions array elements into items smaller than the pivot and items greater, then recursively sorts the partitions."
    }
}
