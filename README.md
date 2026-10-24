# Interactive Visualization of Sorting Algorithms

A complete Final-Year Computer Science & Engineering college project that provides a dynamic, graphical visualization of fundamental sorting algorithms using **Python 3**, **Tkinter**, and **Matplotlib**.

---

## 🌐 Live Demo & GitHub Repository

- **Live Website:** https://interactive-visualization-of-sortin-ten.vercel.app/
- **GitHub Repository:** https://github.com/yashwanthramganneru/Interactive-Visualization-of-Sorting-Algorithms.git

---

## 📌 Project Overview

Understanding sorting algorithms purely from pseudocode or textbook diagrams can be difficult. This application bridges theoretical computer science and interactive visual learning by transforming abstract array operations into animated vertical bar charts. Students and educators can observe comparisons, swaps, partition steps, and sorted boundaries in real-time.

### Supported Algorithms
1. **Bubble Sort** (Adaptive with swapped flag)
2. **Selection Sort**
3. **Insertion Sort**
4. **Merge Sort** (Divide & Conquer)
5. **Quick Sort** (Lomuto Partition Scheme)

---

## ✨ Features

- **Dynamic Vertical Bar Animation**: Array elements are rendered as vertical bars with values displayed above bars.
- **Semantic Color Coding**:
  - 🔵 **Blue (`#3498DB`)**: Unsorted default element
  - 🟠 **Orange (`#E67E22`)**: Active comparison between elements
  - 🔴 **Red (`#E74C3C`)**: Active swap / write operation
  - 🟣 **Purple (`#9B59B6`)**: Pivot / Key element
  - 🟢 **Green (`#2ECC71`)**: Element placed in final sorted position
  - 🔷 **Teal (`#1ABC9C`)**: Subarray slice actively merging
- **Comprehensive Playback Controls**:
  - `Start`: Begins sorting with the selected algorithm.
  - `Pause`: Freezes animation while preserving state and pausing the timer.
  - `Resume`: Continues animation from the exact pause point.
  - `Step`: Single-step execution for micro-level algorithmic inspection.
  - `Reset`: Restores array to its original unsorted state.
- **Speed Slider**: Real-time delay adjustment from 1 ms (ultra-fast) to 200 ms (slow motion).
- **Array Generation & Presets**:
  - Size slider (6 to 50 elements)
  - Distribution presets: *Random*, *Reverse Sorted*, *Nearly Sorted*, *Few Unique*
- **Custom Array Input**:
  - Enter arbitrary comma-separated integers (e.g. `45, 12, 89, 34, 7, 23, 67, 18, 52`)
  - Full input validation preventing invalid characters, negative numbers, or excessive sizes.
- **Live Metrics Dashboard**:
  - Algorithm Name
  - Execution Status (`Ready`, `Sorting...`, `Paused`, `Completed in X.XXs`)
  - Total Comparisons Counter
  - Total Swaps / Writes Counter
  - Elapsed Execution Time (excluding pause duration)
- **Complexity Reference Panel**:
  - Best-Case Time Complexity
  - Average-Case Time Complexity
  - Worst-Case Time Complexity
  - Auxiliary Space Complexity
  - Algorithmic Stability indicator
  - Concise algorithm summary and invariant explanation

---

## 🗂️ Project Structure

```text
├── main.py                 # Main Tkinter graphical user interface application
├── visualizer.py           # Matplotlib figure embedding and non-blocking animation engine
├── sorting_algorithms.py   # Generator-based implementations of all 5 sorting algorithms
├── requirements.txt        # Required third-party Python packages
├── README.md               # Setup instructions, architecture, and user guide
└── project_report.md       # Comprehensive academic project documentation & Viva Q&A
```

---

## 🚀 Installation & Running the Project

### Prerequisites
- Python 3.8 or newer installed on your machine.
- Verify your Python installation in a terminal / command prompt:
  ```bash
  python --version
  ```

---

### Instructions for Windows (Recommended)

1. **Open Command Prompt or PowerShell**:
   Press `Win + R`, type `cmd` or `powershell`, and press `Enter`.

2. **Navigate to the Project Directory**:
   ```cmd
   cd path\to\sorting_visualizer
   ```

3. **(Optional but Recommended) Create a Virtual Environment**:
   ```cmd
   python -m venv venv
   venv\Scripts\activate
   ```

4. **Install Required Packages**:
   Tkinter comes pre-installed with the official Windows Python installer from `python.org`. You only need to install Matplotlib:
   ```cmd
   pip install -r requirements.txt
   ```

5. **Run the Application**:
   ```cmd
   python main.py
   ```

*(Note: If `python` is not recognized, use `py main.py` or ensure Python is added to your Windows PATH environment variable).*

---

### Instructions for macOS

1. Open **Terminal**.
2. Navigate to the project directory:
   ```bash
   cd path/to/sorting_visualizer
   ```
3. Install dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```
4. Run the application:
   ```bash
   python3 main.py
   ```

---

### Instructions for Linux (Ubuntu / Debian / Mint)

On some Linux distributions, Tkinter is packaged separately:
1. Install Tkinter and pip:
   ```bash
   sudo apt-get update
   sudo apt-get install -y python3-tk python3-pip
   ```
2. Install dependencies:
   ```bash
   pip3 install -r requirements.txt
   ```
3. Run the application:
   ```bash
   python3 main.py
   ```

### Headless / CLI Self-Test Mode
If running in an environment without a display monitor or X-Server, run:
```bash
python3 main.py --test
```
This executes all 5 sorting algorithms across test arrays, validating correctness, step counts, comparisons, and swaps directly in the terminal.

---

## 🧪 Algorithm Comparison Summary

| Algorithm | Best Time | Average Time | Worst Time | Space | Stable? | Method / Paradigm |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Bubble Sort** | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Yes | Comparison & Adjacent Swap |
| **Selection Sort** | $O(n^2)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | No | Selection of Extremum |
| **Insertion Sort** | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Yes | Incremental Insertion |
| **Merge Sort** | $O(n \log n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ | Yes | Divide & Conquer |
| **Quick Sort** | $O(n \log n)$ | $O(n \log n)$ | $O(n^2)$ | $O(\log n)$ | No | Partition & Conquer |

---

## 💡 How to Demonstrate During College Viva / Presentation

1. **Demonstrate Best-case vs Worst-case**:
   - Select **Bubble Sort** with the **Nearly Sorted** preset: Show how the early termination flag completes in very few steps ($O(n)$).
   - Select **Reverse Sorted** array: Show that Bubble and Insertion sort require maximum swaps ($O(n^2)$).
2. **Demonstrate Divide & Conquer**:
   - Run **Merge Sort**: Point out how subarrays turn teal as they are merged together.
   - Run **Quick Sort**: Point out the purple pivot element and how elements smaller than the pivot move to the left partition.
3. **Use the Step Button**:
   - Pause sorting and press `Step` to walk examiners through one comparison at a time, explaining invariant preservation.
4. **Custom Array Demonstration**:
   - Input custom values provided by the viva examiner to demonstrate robustness and custom input handling.

---

## 📄 License
This project is open-source and intended for academic, educational, and research use.
