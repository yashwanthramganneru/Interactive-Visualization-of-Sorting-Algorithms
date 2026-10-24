import JSZip from 'jszip';

export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    name: 'main.py',
    path: 'main.py',
    language: 'python',
    description: 'Tkinter GUI application with controls, metrics, presets, and Matplotlib integration.',
    content: `"""
main.py
=======
Interactive Visualization of Sorting Algorithms
Final-Year College Engineering Project

Technologies:
- Python 3.8+
- Tkinter (standard GUI toolkit)
- Matplotlib (bar animation and visualization)

Usage:
  GUI Mode (Default):
    python main.py

  CLI / Headless Test Mode:
    python main.py --test
"""

import sys
import random

try:
    import tkinter as tk
    from tkinter import ttk, messagebox
except ImportError:
    print("\\n" + "=" * 60)
    print("WARNING: Tkinter is not installed on this system.")
    print("=" * 60)
    print("On Windows & macOS: Tkinter is included automatically with Python from python.org.")
    print("On Ubuntu/Debian Linux: Run 'sudo apt-get install python3-tk'")
    print("On Fedora: Run 'sudo dnf install python3-tkinter'")
    print("=" * 60)
    print("\\nRunning in CLI self-test mode instead...\\n")
    import sorting_algorithms as sa
    test_arr = [45, 12, 89, 34, 7, 23, 67, 1]
    print(f"Original Array: {test_arr}\\n")
    for name, info in sa.ALGORITHM_INFO.items():
        gen = info["func"](test_arr)
        states = list(gen)
        print(f"✓ {name}: Sorted {states[-1]['array']} in {len(states)} steps ({states[-1]['comparisons']} comparisons, {states[-1]['swaps']} swaps)")
    print("\\nAll algorithms verified successfully!")
    sys.exit(0)

# Import local modules
import sorting_algorithms as sa
from visualizer import SortingVisualizer


class SortingVisualizerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Interactive Visualization of Sorting Algorithms — College Project")
        self.root.geometry("1180x760")
        self.root.minsize(980, 640)

        # Apply modern Tkinter theme & styling
        self.style = ttk.Style()
        try:
            self.style.theme_use("clam")
        except Exception:
            pass

        self._configure_styles()

        # State Variables
        self.current_algo_name = tk.StringVar(value="Bubble Sort")
        self.array_size_var = tk.IntVar(value=20)
        self.speed_var = tk.IntVar(value=40)  # delay in ms
        self.status_var = tk.StringVar(value="Ready to start")
        self.comparisons_var = tk.StringVar(value="0")
        self.swaps_var = tk.StringVar(value="0")
        self.time_var = tk.StringVar(value="0.00s")
        self.message_var = tk.StringVar(value="Select an algorithm and press Start Sorting.")

        # Preset variable
        self.preset_var = tk.StringVar(value="Random")

        # Build UI layout
        self._build_header()
        self._build_main_layout()
        self._build_status_bar()

        # Generate initial default array
        self.generate_new_array()

    def _configure_styles(self):
        """Custom styles for clean, attractive presentation."""
        self.font_title = ("Helvetica", 14, "bold")
        self.font_subtitle = ("Helvetica", 9)
        self.font_header = ("Helvetica", 10, "bold")
        self.font_body = ("Helvetica", 9)
        self.font_mono = ("Consolas", 10)
        self.font_stat_val = ("Helvetica", 13, "bold")
        self.font_stat_lbl = ("Helvetica", 8)

        self.style.configure("TFrame", background="#F8FAFC")
        self.style.configure("Card.TFrame", background="#FFFFFF", relief="solid", borderwidth=1)
        self.style.configure("Header.TFrame", background="#0F172A")

        self.style.configure("TLabel", background="#F8FAFC", foreground="#1E293B", font=self.font_body)
        self.style.configure("Card.TLabel", background="#FFFFFF", foreground="#1E293B", font=self.font_body)
        self.style.configure("HeaderTitle.TLabel", background="#0F172A", foreground="#FFFFFF", font=self.font_title)
        self.style.configure("HeaderSub.TLabel", background="#0F172A", foreground="#94A3B8", font=self.font_subtitle)

        self.style.configure("Primary.TButton", font=("Helvetica", 9, "bold"))
        self.style.configure("Secondary.TButton", font=("Helvetica", 9))

    def _build_header(self):
        header_frame = ttk.Frame(self.root, style="Header.TFrame", padding=(20, 12))
        header_frame.pack(fill="x", side="top")

        title_lbl = ttk.Label(
            header_frame,
            text="Interactive Visualization of Sorting Algorithms",
            style="HeaderTitle.TLabel"
        )
        title_lbl.pack(anchor="w")

        sub_lbl = ttk.Label(
            header_frame,
            text="Final-Year College Project · Graphical Data Structures & Algorithms Visualizer · Python 3, Tkinter & Matplotlib",
            style="HeaderSub.TLabel"
        )
        sub_lbl.pack(anchor="w", pady=(2, 0))

    def _build_main_layout(self):
        main_container = ttk.Frame(self.root, padding=12)
        main_container.pack(fill="both", expand=True)

        left_panel = ttk.Frame(main_container, width=320, padding=(0, 0, 12, 0))
        left_panel.pack(side="left", fill="y", expand=False)
        left_panel.pack_propagate(False)

        right_panel = ttk.Frame(main_container)
        right_panel.pack(side="right", fill="both", expand=True)

        self._build_controls(left_panel)
        self._build_visualizer_stage(right_panel)

    def _build_controls(self, parent):
        algo_card = ttk.LabelFrame(parent, text=" 1. Select Algorithm ", padding=10)
        algo_card.pack(fill="x", pady=(0, 10))

        algo_options = list(sa.ALGORITHM_INFO.keys())
        self.algo_dropdown = ttk.Combobox(
            algo_card,
            textvariable=self.current_algo_name,
            values=algo_options,
            state="readonly",
            font=self.font_header
        )
        self.algo_dropdown.pack(fill="x", pady=(2, 6))
        self.algo_dropdown.bind("<<ComboboxSelected>>", self._on_algorithm_changed)

        array_card = ttk.LabelFrame(parent, text=" 2. Array Configuration ", padding=10)
        array_card.pack(fill="x", pady=(0, 10))

        size_lbl_frame = ttk.Frame(array_card)
        size_lbl_frame.pack(fill="x")
        ttk.Label(size_lbl_frame, text="Size:").pack(side="left")
        self.size_val_lbl = ttk.Label(size_lbl_frame, text=f"{self.array_size_var.get()}", font=self.font_header)
        self.size_val_lbl.pack(side="right")

        self.size_slider = ttk.Scale(
            array_card,
            from_=6,
            to=50,
            variable=self.array_size_var,
            orient="horizontal",
            command=self._on_size_slider_changed
        )
        self.size_slider.pack(fill="x", pady=(2, 8))

        preset_frame = ttk.Frame(array_card)
        preset_frame.pack(fill="x", pady=(0, 8))
        ttk.Label(preset_frame, text="Distribution:").pack(side="left")
        preset_combo = ttk.Combobox(
            preset_frame,
            textvariable=self.preset_var,
            values=["Random", "Reverse Sorted", "Nearly Sorted", "Few Unique"],
            state="readonly",
            width=14
        )
        preset_combo.pack(side="right")

        gen_btn = ttk.Button(
            array_card,
            text="🎲 Generate Array",
            command=self.generate_new_array,
            style="Secondary.TButton"
        )
        gen_btn.pack(fill="x", pady=(0, 6))

        custom_frame = ttk.Frame(array_card)
        custom_frame.pack(fill="x", pady=(4, 0))
        ttk.Label(custom_frame, text="Custom Array (comma-separated):").pack(anchor="w")

        self.custom_entry = ttk.Entry(custom_frame, font=self.font_body)
        self.custom_entry.insert(0, "45, 12, 89, 34, 7, 23, 67, 18, 52")
        self.custom_entry.pack(fill="x", pady=(2, 4))

        apply_btn = ttk.Button(
            custom_frame,
            text="Apply Custom Values",
            command=self.apply_custom_array,
            style="Secondary.TButton"
        )
        apply_btn.pack(fill="x")

        playback_card = ttk.LabelFrame(parent, text=" 3. Playback Controls ", padding=10)
        playback_card.pack(fill="x", pady=(0, 10))

        speed_lbl_frame = ttk.Frame(playback_card)
        speed_lbl_frame.pack(fill="x")
        ttk.Label(speed_lbl_frame, text="Speed (Delay):").pack(side="left")
        self.speed_val_lbl = ttk.Label(speed_lbl_frame, text=f"{self.speed_var.get()} ms", font=self.font_header)
        self.speed_val_lbl.pack(side="right")

        self.speed_slider = ttk.Scale(
            playback_card,
            from_=1,
            to=200,
            variable=self.speed_var,
            orient="horizontal",
            command=self._on_speed_slider_changed
        )
        self.speed_slider.pack(fill="x", pady=(2, 10))

        btn_grid1 = ttk.Frame(playback_card)
        btn_grid1.pack(fill="x", pady=(0, 4))

        self.start_btn = ttk.Button(
            btn_grid1,
            text="▶ Start",
            command=self.start_sorting,
            style="Primary.TButton"
        )
        self.start_btn.pack(side="left", fill="x", expand=True, padx=(0, 3))

        self.pause_btn = ttk.Button(
            btn_grid1,
            text="⏸ Pause",
            command=self.pause_sorting,
            state="disabled",
            style="Secondary.TButton"
        )
        self.pause_btn.pack(side="right", fill="x", expand=True, padx=(3, 0))

        btn_grid2 = ttk.Frame(playback_card)
        btn_grid2.pack(fill="x", pady=(0, 4))

        self.resume_btn = ttk.Button(
            btn_grid2,
            text="▶ Resume",
            command=self.resume_sorting,
            state="disabled",
            style="Secondary.TButton"
        )
        self.resume_btn.pack(side="left", fill="x", expand=True, padx=(0, 3))

        self.step_btn = ttk.Button(
            btn_grid2,
            text="⏭ Step",
            command=self.step_forward,
            style="Secondary.TButton"
        )
        self.step_btn.pack(side="right", fill="x", expand=True, padx=(3, 0))

        self.reset_btn = ttk.Button(
            playback_card,
            text="🔄 Reset Array",
            command=self.reset_array,
            style="Secondary.TButton"
        )
        self.reset_btn.pack(fill="x", pady=(2, 0))

        legend_card = ttk.LabelFrame(parent, text=" Color Legend ", padding=8)
        legend_card.pack(fill="x")

        legends = [
            ("#3498DB", "Blue", "Unsorted Element"),
            ("#E67E22", "Orange", "Active Comparison"),
            ("#E74C3C", "Red", "Swap / Placement"),
            ("#9B59B6", "Purple", "Pivot / Key Element"),
            ("#2ECC71", "Green", "Confirmed Sorted"),
        ]
        for color, name, desc in legends:
            row = ttk.Frame(legend_card)
            row.pack(fill="x", pady=1)
            dot = tk.Label(row, text=" ■ ", fg=color, font=("Helvetica", 10, "bold"), bg="#F8FAFC")
            dot.pack(side="left")
            ttk.Label(row, text=f"{name}: {desc}", font=("Helvetica", 8)).pack(side="left")

    def _build_visualizer_stage(self, parent):
        metrics_bar = ttk.Frame(parent)
        metrics_bar.pack(fill="x", pady=(0, 8))

        self._create_metric_box(metrics_bar, "Algorithm", self.current_algo_name, is_text=True)
        self._create_metric_box(metrics_bar, "Status", self.status_var, is_text=True)
        self._create_metric_box(metrics_bar, "Comparisons", self.comparisons_var)
        self._create_metric_box(metrics_bar, "Swaps / Writes", self.swaps_var)
        self._create_metric_box(metrics_bar, "Execution Time", self.time_var)

        canvas_container = ttk.Frame(parent, style="Card.TFrame", padding=6)
        canvas_container.pack(fill="both", expand=True)

        self.visualizer = SortingVisualizer(
            canvas_container,
            on_update_callback=self._on_visualizer_update,
            on_finish_callback=self._on_visualizer_finish
        )

        self.info_card = ttk.LabelFrame(parent, text=" Complexity & Algorithm Specifications ", padding=10)
        self.info_card.pack(fill="x", pady=(8, 0))

        specs_row = ttk.Frame(self.info_card)
        specs_row.pack(fill="x", pady=(0, 4))

        self.best_lbl = ttk.Label(specs_row, text="Best Time: O(n)", font=self.font_header)
        self.best_lbl.pack(side="left", padx=(0, 20))

        self.avg_lbl = ttk.Label(specs_row, text="Average Time: O(n²)", font=self.font_header)
        self.avg_lbl.pack(side="left", padx=(0, 20))

        self.worst_lbl = ttk.Label(specs_row, text="Worst Time: O(n²)", font=self.font_header)
        self.worst_lbl.pack(side="left", padx=(0, 20))

        self.space_lbl = ttk.Label(specs_row, text="Space: O(1)", font=self.font_header)
        self.space_lbl.pack(side="left", padx=(0, 20))

        self.stability_lbl = ttk.Label(specs_row, text="Stability: Stable", font=self.font_header)
        self.stability_lbl.pack(side="left")

        self.desc_lbl = ttk.Label(
            self.info_card,
            text="",
            wraplength=760,
            font=self.font_body,
            foreground="#475569"
        )
        self.desc_lbl.pack(anchor="w", pady=(4, 0))

        self._update_complexity_display()

    def _create_metric_box(self, parent, label_text, var, is_text=False):
        box = ttk.Frame(parent, style="Card.TFrame", padding=(10, 6))
        box.pack(side="left", fill="x", expand=True, padx=3)

        lbl = ttk.Label(box, text=label_text, style="Card.TLabel", font=self.font_stat_lbl, foreground="#64748B")
        lbl.pack(anchor="w")

        val = ttk.Label(
            box,
            textvariable=var,
            style="Card.TLabel",
            font=self.font_header if is_text else self.font_stat_val,
            foreground="#0F172A"
        )
        val.pack(anchor="w")

    def _build_status_bar(self):
        status_bar = ttk.Frame(self.root, padding=(12, 6))
        status_bar.pack(fill="x", side="bottom")

        prefix = ttk.Label(status_bar, text="Step Detail:", font=self.font_header, foreground="#334155")
        prefix.pack(side="left", padx=(0, 6))

        msg = ttk.Label(status_bar, textvariable=self.message_var, font=self.font_body, foreground="#0369A1")
        msg.pack(side="left", fill="x", expand=True)

    def _on_algorithm_changed(self, event=None):
        self._update_complexity_display()
        if self.visualizer.is_running:
            self.visualizer.reset()
            self._update_buttons_on_stop()

    def _update_complexity_display(self):
        algo_name = self.current_algo_name.get()
        info = sa.ALGORITHM_INFO.get(algo_name, {})
        if not info:
            return

        self.best_lbl.config(text=f"Best Time: {info['time_best']}")
        self.avg_lbl.config(text=f"Average Time: {info['time_avg']}")
        self.worst_lbl.config(text=f"Worst Time: {info['time_worst']}")
        self.space_lbl.config(text=f"Space: {info['space']}")
        self.stability_lbl.config(text=f"Stability: {info['stability']}")
        self.desc_lbl.config(text=info["description"])

    def _on_size_slider_changed(self, val):
        new_size = int(float(val))
        self.size_val_lbl.config(text=str(new_size))
        if not self.visualizer.is_running:
            self.generate_new_array()

    def _on_speed_slider_changed(self, val):
        delay = int(float(val))
        self.speed_val_lbl.config(text=f"{delay} ms")
        self.visualizer.set_speed(delay)

    def generate_new_array(self):
        size = self.array_size_var.get()
        preset = self.preset_var.get()

        if preset == "Random":
            arr = [random.randint(5, 100) for _ in range(size)]
        elif preset == "Reverse Sorted":
            arr = sorted([random.randint(5, 100) for _ in range(size)], reverse=True)
        elif preset == "Nearly Sorted":
            arr = sorted([random.randint(5, 100) for _ in range(size)])
            num_swaps = max(1, size // 10)
            for _ in range(num_swaps):
                i1, i2 = random.randint(0, size - 1), random.randint(0, size - 1)
                arr[i1], arr[i2] = arr[i2], arr[i1]
        elif preset == "Few Unique":
            choices = [15, 35, 60, 85]
            arr = [random.choice(choices) for _ in range(size)]
        else:
            arr = [random.randint(5, 100) for _ in range(size)]

        self.visualizer.set_data(arr)
        self._update_buttons_on_stop()

    def apply_custom_array(self):
        raw_text = self.custom_entry.get().strip()
        if not raw_text:
            messagebox.showerror("Invalid Input", "Please enter at least one number separated by commas.")
            return

        cleaned = raw_text.replace(";", ",").replace(" ", ",")
        tokens = [t.strip() for t in cleaned.split(",") if t.strip()]

        if not tokens:
            messagebox.showerror("Invalid Input", "No numeric values detected in the input.")
            return

        if len(tokens) > 60:
            messagebox.showwarning(
                "Array Size Warning",
                f"You entered {len(tokens)} items. For optimal visualization legibility, size is capped at 60. First 60 items will be used."
            )
            tokens = tokens[:60]

        parsed = []
        for tok in tokens:
            try:
                val = int(tok)
                if val < 0:
                    messagebox.showerror("Invalid Input", f"Negative numbers ({val}) are not supported. Please use non-negative values.")
                    return
                if val > 1000:
                    messagebox.showerror("Invalid Input", f"Value {val} is too large. Please keep values <= 1000.")
                    return
                parsed.append(val)
            except ValueError:
                messagebox.showerror("Invalid Input", f"'{tok}' is not a valid integer. Please check your input.")
                return

        self.array_size_var.set(len(parsed))
        self.size_val_lbl.config(text=str(len(parsed)))
        self.visualizer.set_data(parsed)
        self.message_var.set(f"Loaded custom array with {len(parsed)} values: {parsed}")
        self._update_buttons_on_stop()

    def start_sorting(self):
        algo_name = self.current_algo_name.get()
        algo_meta = sa.ALGORITHM_INFO.get(algo_name)
        if not algo_meta:
            return

        generator = algo_meta["func"](self.visualizer.array)
        self.visualizer.set_speed(self.speed_var.get())
        self.visualizer.start(generator)

        self.start_btn.config(state="disabled")
        self.pause_btn.config(state="normal")
        self.resume_btn.config(state="disabled")
        self.step_btn.config(state="normal")
        self.status_var.set("Sorting...")

    def pause_sorting(self):
        self.visualizer.pause()
        self.pause_btn.config(state="disabled")
        self.resume_btn.config(state="normal")
        self.status_var.set("Paused")

    def resume_sorting(self):
        self.visualizer.resume()
        self.pause_btn.config(state="normal")
        self.resume_btn.config(state="disabled")
        self.status_var.set("Sorting...")

    def step_forward(self):
        if not self.visualizer.is_running:
            algo_name = self.current_algo_name.get()
            algo_meta = sa.ALGORITHM_INFO.get(algo_name)
            generator = algo_meta["func"](self.visualizer.array)
            self.visualizer.generator = generator
            self.visualizer.is_running = True
            self.visualizer.is_paused = True

        self.visualizer.step_forward()
        self.start_btn.config(state="disabled")
        self.pause_btn.config(state="disabled")
        self.resume_btn.config(state="normal")

    def reset_array(self):
        self.visualizer.reset()
        self._update_buttons_on_stop()

    def _update_buttons_on_stop(self):
        self.start_btn.config(state="normal")
        self.pause_btn.config(state="disabled")
        self.resume_btn.config(state="disabled")
        self.step_btn.config(state="normal")

    def _on_visualizer_update(self, comparisons, swaps, elapsed, message, status):
        self.comparisons_var.set(str(comparisons))
        self.swaps_var.set(str(swaps))
        self.time_var.set(f"{elapsed:.2f}s")
        self.message_var.set(message)
        self.status_var.set(status)

    def _on_visualizer_finish(self, comparisons, swaps, final_time):
        self._update_buttons_on_stop()
        self.status_var.set(f"Completed in {final_time:.2f}s")
        self.message_var.set(f"Sorting Complete! Total comparisons: {comparisons}, Total swaps/writes: {swaps}.")


def main():
    if "--test" in sys.argv or "--cli" in sys.argv:
        print("=== Interactive Sorting Visualizer CLI Self-Test ===")
        test_arr = [64, 34, 25, 12, 22, 11, 90, 48]
        print(f"Test Input: {test_arr}\\n")
        for name, info in sa.ALGORITHM_INFO.items():
            gen = info["func"](test_arr)
            steps = list(gen)
            last = steps[-1]
            print(f"[{name}]")
            print(f"  Result: {last['array']}")
            print(f"  Steps: {len(steps)} | Comparisons: {last['comparisons']} | Swaps/Writes: {last['swaps']}")
            print(f"  Best: {info['time_best']} | Worst: {info['time_worst']} | Space: {info['space']} | Stable: {info['stability']}\\n")
        print("All 5 sorting algorithms verified successfully!")
        return

    root = tk.Tk()
    app = SortingVisualizerApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()`,
  },
  {
    name: 'sorting_algorithms.py',
    path: 'sorting_algorithms.py',
    language: 'python',
    description: 'Generator implementations for Bubble, Selection, Insertion, Merge, and Quick Sort yielding state snapshots.',
    content: `"""
sorting_algorithms.py
======================
Implementation of sorting algorithms as generator functions for interactive visualization.
Each algorithm yields state snapshots at every comparison, swap, and partitioning step.
"""

COLOR_DEFAULT = "#3498DB"   # Soft Blue: unsorted default
COLOR_COMPARE = "#E67E22"   # Warm Orange: elements currently compared
COLOR_SWAP    = "#E74C3C"   # Crimson Red: elements currently swapped
COLOR_PIVOT   = "#9B59B6"   # Royal Purple: pivot or key element
COLOR_SORTED  = "#2ECC71"   # Vibrant Green: elements confirmed sorted
COLOR_MERGE   = "#1ABC9C"   # Teal / Cyan: merge temporary buffer zone


def get_color_list(n, default_color=COLOR_DEFAULT):
    return [default_color] * n


def bubble_sort(arr):
    a = list(arr)
    n = len(a)
    comparisons = 0
    swaps = 0

    yield {
        "array": list(a),
        "colors": get_color_list(n),
        "comparisons": comparisons,
        "swaps": swaps,
        "message": f"Starting Bubble Sort on {n} elements.",
        "finished": False
    }

    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            comparisons += 1
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
                a[j], a[j + 1] = a[j + 1], a[j]
                swaps += 1
                swapped = True

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

        colors = [COLOR_SORTED if k >= n - i - 1 else COLOR_DEFAULT for k in range(n)]
        yield {
            "array": list(a),
            "colors": list(colors),
            "comparisons": comparisons,
            "swaps": swaps,
            "message": f"Element {a[n - i - 1]} is now placed in its final sorted position.",
            "finished": False
        }

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

    yield {
        "array": list(a),
        "colors": get_color_list(n, COLOR_SORTED),
        "comparisons": comparisons,
        "swaps": swaps,
        "message": f"Bubble Sort complete! Total comparisons: {comparisons}, Total swaps: {swaps}.",
        "finished": True
    }


def selection_sort(arr):
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


def insertion_sort(arr):
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

    for i in range(1, n):
        key = a[i]
        j = i - 1

        colors = [COLOR_SORTED if k < i else COLOR_DEFAULT for k in range(n)]
        colors[i] = COLOR_PIVOT
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
        swaps += 1
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


def merge_sort(arr):
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


def quick_sort(arr):
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

    def quick_sort_helper(low, high):
        if low < high:
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


ALGORITHM_INFO = {
    "Bubble Sort": {
        "func": bubble_sort,
        "time_best": "O(n)",
        "time_avg": "O(n²)",
        "time_worst": "O(n²)",
        "space": "O(1)",
        "stability": "Stable",
        "description": "Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order."
    },
    "Selection Sort": {
        "func": selection_sort,
        "time_best": "O(n²)",
        "time_avg": "O(n²)",
        "time_worst": "O(n²)",
        "space": "O(1)",
        "stability": "Unstable",
        "description": "Divides input into sorted and unsorted regions. Repeatedly searches the unsorted region for the smallest element and swaps it."
    },
    "Insertion Sort": {
        "func": insertion_sort,
        "time_best": "O(n)",
        "time_avg": "O(n²)",
        "time_worst": "O(n²)",
        "space": "O(1)",
        "stability": "Stable",
        "description": "Builds the sorted array one element at a time by comparing the key with already-sorted items and shifting larger elements."
    },
    "Merge Sort": {
        "func": merge_sort,
        "time_best": "O(n log n)",
        "time_avg": "O(n log n)",
        "time_worst": "O(n log n)",
        "space": "O(n)",
        "stability": "Stable",
        "description": "Divide-and-conquer algorithm that recursively halves the array, sorts the halves independently, and merges them back."
    },
    "Quick Sort": {
        "func": quick_sort,
        "time_best": "O(n log n)",
        "time_avg": "O(n log n)",
        "time_worst": "O(n²)",
        "space": "O(log n)",
        "stability": "Unstable",
        "description": "Selects a pivot element and partitions array elements into items smaller than the pivot and items greater, recursively sorting each side."
    }
}`,
  },
  {
    name: 'visualizer.py',
    path: 'visualizer.py',
    language: 'python',
    description: 'Matplotlib and Tkinter Canvas Integration for non-blocking animation.',
    content: `"""
visualizer.py
=============
Matplotlib and Tkinter Canvas Integration for Sorting Visualization.
"""

import time
import matplotlib
matplotlib.use("TkAgg")
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg


class SortingVisualizer:
    def __init__(self, parent_frame, on_update_callback=None, on_finish_callback=None):
        self.parent = parent_frame
        self.on_update = on_update_callback
        self.on_finish = on_finish_callback

        self.array = []
        self.original_array = []
        self.generator = None
        self.is_running = False
        self.is_paused = False
        self.is_finished = False

        self.delay_ms = 40
        self.timer_after_id = None
        self.start_time = 0.0
        self.accumulated_time = 0.0

        self.comparisons = 0
        self.swaps = 0
        self.current_message = "Ready to sort."

        self.figure = Figure(figsize=(8.5, 4.8), dpi=100, facecolor="#F8FAFC")
        self.ax = self.figure.add_subplot(111)
        self.figure.tight_layout(pad=2.5)

        self.ax.set_facecolor("#FFFFFF")
        for spine in self.ax.spines.values():
            spine.set_color("#E2E8F0")
            spine.set_linewidth(1.0)
        self.ax.tick_params(colors="#64748B", labelsize=9)
        self.ax.grid(axis="y", linestyle="--", alpha=0.3, color="#94A3B8")

        self.canvas = FigureCanvasTkAgg(self.figure, master=self.parent)
        self.canvas_widget = self.canvas.get_tk_widget()
        self.canvas_widget.pack(fill="both", expand=True)

        self.bars = []

    def set_data(self, arr):
        self.stop_animation()
        self.array = list(arr)
        self.original_array = list(arr)
        self.comparisons = 0
        self.swaps = 0
        self.accumulated_time = 0.0
        self.is_finished = False
        self.current_message = f"Array loaded with {len(arr)} elements."

        self.draw_bars(self.array, ["#3498DB"] * len(self.array))
        self._notify_update("Ready")

    def draw_bars(self, arr, colors):
        self.ax.clear()
        self.ax.set_facecolor("#FFFFFF")
        self.ax.grid(axis="y", linestyle="--", alpha=0.3, color="#94A3B8")

        n = len(arr)
        if n == 0:
            self.canvas.draw_idle()
            return

        x_indices = range(n)
        max_val = max(arr) if arr else 100
        min_val = min(min(arr), 0)

        self.bars = self.ax.bar(
            x_indices,
            arr,
            color=colors,
            edgecolor="#1E293B",
            linewidth=0.5 if n > 30 else 0.8,
            width=0.75 if n > 30 else 0.65
        )

        if n <= 32:
            y_offset = max(max_val * 0.02, 1)
            for i, val in enumerate(arr):
                self.ax.text(
                    i,
                    val + y_offset,
                    str(val),
                    ha="center",
                    va="bottom",
                    fontsize=8 if n > 20 else 9,
                    color="#334155",
                    fontweight="semibold"
                )

        self.ax.set_xlim(-0.8, n - 0.2)
        self.ax.set_ylim(min_val, max_val * 1.15 if max_val > 0 else 10)
        self.ax.set_xlabel("Array Index", color="#475569", fontsize=10, labelpad=6)
        self.ax.set_ylabel("Element Value", color="#475569", fontsize=10, labelpad=6)

        self.canvas.draw_idle()

    def start(self, algorithm_generator):
        self.stop_animation()
        self.generator = algorithm_generator
        self.is_running = True
        self.is_paused = False
        self.is_finished = False

        self.start_time = time.perf_counter()
        self.accumulated_time = 0.0
        self._schedule_next_step()

    def pause(self):
        if self.is_running and not self.is_paused:
            self.is_paused = True
            self.accumulated_time += (time.perf_counter() - self.start_time)
            if self.timer_after_id:
                self.parent.after_cancel(self.timer_after_id)
                self.timer_after_id = None
            self._notify_update("Paused")

    def resume(self):
        if self.is_running and self.is_paused:
            self.is_paused = False
            self.start_time = time.perf_counter()
            self._schedule_next_step()
            self._notify_update("Sorting...")

    def step_forward(self):
        if not self.generator or self.is_finished:
            return
        if self.is_running and not self.is_paused:
            self.pause()
        self._execute_one_step()

    def reset(self):
        self.stop_animation()
        self.array = list(self.original_array)
        self.comparisons = 0
        self.swaps = 0
        self.accumulated_time = 0.0
        self.is_finished = False
        self.current_message = "Reset back to initial unsorted state."

        self.draw_bars(self.array, ["#3498DB"] * len(self.array))
        self._notify_update("Ready")

    def set_speed(self, delay_ms):
        self.delay_ms = max(1, int(delay_ms))

    def stop_animation(self):
        if self.timer_after_id:
            try:
                self.parent.after_cancel(self.timer_after_id)
            except Exception:
                pass
            self.timer_after_id = None
        self.is_running = False
        self.is_paused = False

    def _schedule_next_step(self):
        if not self.is_running or self.is_paused or self.is_finished:
            return
        self.timer_after_id = self.parent.after(self.delay_ms, self._animation_tick)

    def _animation_tick(self):
        self.timer_after_id = None
        if not self.is_running or self.is_paused:
            return
        has_more = self._execute_one_step()
        if has_more and not self.is_paused:
            self._schedule_next_step()

    def _execute_one_step(self):
        if not self.generator:
            return False
        try:
            state = next(self.generator)
            self.array = state["array"]
            self.comparisons = state["comparisons"]
            self.swaps = state["swaps"]
            self.current_message = state["message"]
            colors = state["colors"]
            is_finished = state.get("finished", False)

            self.draw_bars(self.array, colors)

            if is_finished:
                self._handle_completion()
                return False

            self._notify_update("Sorting...")
            return True
        except StopIteration:
            self._handle_completion()
            return False
        except Exception as e:
            self.current_message = f"Error during sorting: {str(e)}"
            self.stop_animation()
            self._notify_update("Error")
            return False

    def _get_current_elapsed_time(self):
        if not self.is_running:
            return self.accumulated_time
        if self.is_paused:
            return self.accumulated_time
        return self.accumulated_time + (time.perf_counter() - self.start_time)

    def _handle_completion(self):
        self.is_finished = True
        self.is_running = False
        self.is_paused = False
        final_time = self._get_current_elapsed_time()
        self.accumulated_time = final_time
        self._notify_update(f"Completed in {final_time:.2f}s")
        if self.on_finish:
            self.on_finish(self.comparisons, self.swaps, final_time)

    def _notify_update(self, status):
        if self.on_update:
            elapsed = self._get_current_elapsed_time()
            self.on_update(self.comparisons, self.swaps, elapsed, self.current_message, status)`,
  },
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    language: 'plaintext',
    description: 'Python package dependencies list.',
    content: `# Interactive Visualization of Sorting Algorithms
# Python dependencies
#
# Note: Tkinter is part of the Python Standard Library.
# On Windows and macOS, it comes pre-installed with the official installer from python.org.
# On Debian/Ubuntu Linux: sudo apt-get install python3-tk
# On Fedora: sudo dnf install python3-tkinter

matplotlib>=3.7.0
numpy>=1.24.0`,
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Project README with setup steps, Windows guide, features, and usage.',
    content: `# Interactive Visualization of Sorting Algorithms

A complete Final-Year Computer Science & Engineering college project that provides a dynamic, graphical visualization of fundamental sorting algorithms using **Python 3**, **Tkinter**, and **Matplotlib**.

## Features
- Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, and Quick Sort.
- Real-time vertical bar rendering with element values.
- Animated state coloring (Blue: Default, Orange: Compare, Red: Swap, Purple: Pivot, Green: Sorted).
- Start, Pause, Resume, Step-Forward, and Reset controls.
- Speed slider (1ms to 200ms) and array size slider (6 to 50 items).
- Custom array parser with comma-separated numbers and input validation.
- Live telemetry: comparisons, swaps, and wall-clock execution time.
- Theoretical complexity breakdown (Best, Avg, Worst, Space, Stability).

## Quick Start on Windows
1. Install Python 3.8+ from https://python.org (ensure "Add Python to PATH" is checked).
2. Open Command Prompt and navigate to this folder:
   cd path\\to\\sorting_visualizer
3. Install dependencies:
   pip install -r requirements.txt
4. Run the application:
   python main.py`,
  },
  {
    name: 'project_report.md',
    path: 'project_report.md',
    language: 'markdown',
    description: 'Complete academic degree project report with abstract, methodology, results, and Viva Q&A.',
    content: `# PROJECT REPORT: INTERACTIVE VISUALIZATION OF SORTING ALGORITHMS
Submitted in partial fulfillment of Bachelor of Technology in Computer Science & Engineering.

### Abstract
This project presents an Interactive Visualization of Sorting Algorithms developed in Python 3 using Tkinter and Matplotlib. It visualizes Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, and Quick Sort with generator-based non-blocking animations and live empirical metrics.

### Key Sections Included:
- 1. Abstract
- 2. Introduction & Motivation
- 3. Objectives & Scope
- 4. Literature Survey & Problem Statement
- 5. System Requirements & Architecture
- 6. Design & Methodology (Generator pattern, Tkinter non-blocking event loop)
- 7. Detailed Algorithm Analysis (Bubble, Selection, Insertion, Merge, Quick)
- 8. Experimental Results & Performance Benchmarks
- 9. Advantages & Educational Value
- 10. Limitations & Future Enhancements
- 11. Conclusion
- 12. References & Viva Voce Q&A Cheat Sheet`,
  },
];

export function downloadSingleFile(file: ProjectFile) {
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadAllProjectFilesZip() {
  const zip = new JSZip();
  const folder = zip.folder('sorting_visualizer_project');

  PROJECT_FILES.forEach((file) => {
    if (folder) {
      folder.file(file.name, file.content);
    } else {
      zip.file(file.name, file.content);
    }
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sorting_visualizer_python_project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
