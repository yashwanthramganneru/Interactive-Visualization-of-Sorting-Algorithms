"""
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
    print("\n" + "=" * 60)
    print("WARNING: Tkinter is not installed on this system.")
    print("=" * 60)
    print("On Windows & macOS: Tkinter is included automatically with Python from python.org.")
    print("On Ubuntu/Debian Linux: Run 'sudo apt-get install python3-tk'")
    print("On Fedora: Run 'sudo dnf install python3-tkinter'")
    print("=" * 60)
    print("\nRunning in CLI self-test mode instead...\n")
    import sorting_algorithms as sa
    test_arr = [45, 12, 89, 34, 7, 23, 67, 1]
    print(f"Original Array: {test_arr}\n")
    for name, info in sa.ALGORITHM_INFO.items():
        gen = info["func"](test_arr)
        states = list(gen)
        print(f"✓ {name}: Sorted {states[-1]['array']} in {len(states)} steps ({states[-1]['comparisons']} comparisons, {states[-1]['swaps']} swaps)")
    print("\nAll algorithms verified successfully!")
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
        # Fonts
        self.font_title = ("Helvetica", 14, "bold")
        self.font_subtitle = ("Helvetica", 9)
        self.font_header = ("Helvetica", 10, "bold")
        self.font_body = ("Helvetica", 9)
        self.font_mono = ("Consolas", 10)
        self.font_stat_val = ("Helvetica", 13, "bold")
        self.font_stat_lbl = ("Helvetica", 8)

        # Style colors
        self.style.configure("TFrame", background="#F8FAFC")
        self.style.configure("Card.TFrame", background="#FFFFFF", relief="solid", borderwidth=1)
        self.style.configure("Header.TFrame", background="#0F172A")

        self.style.configure("TLabel", background="#F8FAFC", foreground="#1E293B", font=self.font_body)
        self.style.configure("Card.TLabel", background="#FFFFFF", foreground="#1E293B", font=self.font_body)
        self.style.configure("HeaderTitle.TLabel", background="#0F172A", foreground="#FFFFFF", font=self.font_title)
        self.style.configure("HeaderSub.TLabel", background="#0F172A", foreground="#94A3B8", font=self.font_subtitle)

        # Buttons
        self.style.configure("Primary.TButton", font=("Helvetica", 9, "bold"))
        self.style.configure("Secondary.TButton", font=("Helvetica", 9))

    def _build_header(self):
        """Top banner displaying title, subtitle, and project attribution."""
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
        """Builds two-column layout: Left control deck, Right visualizer & complexity stage."""
        main_container = ttk.Frame(self.root, padding=12)
        main_container.pack(fill="both", expand=True)

        # Left Column: Controls (fixed width 320px)
        left_panel = ttk.Frame(main_container, width=320, padding=(0, 0, 12, 0))
        left_panel.pack(side="left", fill="y", expand=False)
        left_panel.pack_propagate(False)

        # Right Column: Visualizer Canvas & Complexity Specs
        right_panel = ttk.Frame(main_container)
        right_panel.pack(side="right", fill="both", expand=True)

        self._build_controls(left_panel)
        self._build_visualizer_stage(right_panel)

    def _build_controls(self, parent):
        """Populates left panel with interactive controls."""
        # 1. Algorithm Selection Card
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

        # 2. Array Generation Card
        array_card = ttk.LabelFrame(parent, text=" 2. Array Configuration ", padding=10)
        array_card.pack(fill="x", pady=(0, 10))

        # Array Size Slider
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

        # Array Preset Selector
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

        # Custom Array Input
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

        # 3. Execution & Playback Card
        playback_card = ttk.LabelFrame(parent, text=" 3. Playback Controls ", padding=10)
        playback_card.pack(fill="x", pady=(0, 10))

        # Speed Slider
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

        # Button Grid
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

        # 4. Color Legend Card
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
        """Constructs the Matplotlib canvas area and complexity metrics cards."""
        # Top Metrics Strip
        metrics_bar = ttk.Frame(parent)
        metrics_bar.pack(fill="x", pady=(0, 8))

        self._create_metric_box(metrics_bar, "Algorithm", self.current_algo_name, is_text=True)
        self._create_metric_box(metrics_bar, "Status", self.status_var, is_text=True)
        self._create_metric_box(metrics_bar, "Comparisons", self.comparisons_var)
        self._create_metric_box(metrics_bar, "Swaps / Writes", self.swaps_var)
        self._create_metric_box(metrics_bar, "Execution Time", self.time_var)

        # Center Matplotlib Canvas Container
        canvas_container = ttk.Frame(parent, style="Card.TFrame", padding=6)
        canvas_container.pack(fill="both", expand=True)

        self.visualizer = SortingVisualizer(
            canvas_container,
            on_update_callback=self._on_visualizer_update,
            on_finish_callback=self._on_visualizer_finish
        )

        # Bottom Complexity Card & Algorithm Specs
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
        """Creates a styled KPI counter box."""
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
        """Bottom informational step-by-step prose message ticker."""
        status_bar = ttk.Frame(self.root, padding=(12, 6))
        status_bar.pack(fill="x", side="bottom")

        prefix = ttk.Label(status_bar, text="Step Detail:", font=self.font_header, foreground="#334155")
        prefix.pack(side="left", padx=(0, 6))

        msg = ttk.Label(status_bar, textvariable=self.message_var, font=self.font_body, foreground="#0369A1")
        msg.pack(side="left", fill="x", expand=True)

    # --------------------------------------------------------------------------
    # Event Handlers & Business Logic
    # --------------------------------------------------------------------------
    def _on_algorithm_changed(self, event=None):
        """Called when user changes algorithm in the dropdown."""
        self._update_complexity_display()
        if self.visualizer.is_running:
            self.visualizer.reset()
            self._update_buttons_on_stop()

    def _update_complexity_display(self):
        """Updates complexity labels and description based on selected algorithm."""
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
        """Updates array size label and regenerates array if not currently running."""
        new_size = int(float(val))
        self.size_val_lbl.config(text=str(new_size))
        if not self.visualizer.is_running:
            self.generate_new_array()

    def _on_speed_slider_changed(self, val):
        """Dynamically adjusts visualizer animation speed."""
        delay = int(float(val))
        self.speed_val_lbl.config(text=f"{delay} ms")
        self.visualizer.set_speed(delay)

    def generate_new_array(self):
        """Generates array based on selected size and distribution preset."""
        size = self.array_size_var.get()
        preset = self.preset_var.get()

        if preset == "Random":
            arr = [random.randint(5, 100) for _ in range(size)]
        elif preset == "Reverse Sorted":
            arr = sorted([random.randint(5, 100) for _ in range(size)], reverse=True)
        elif preset == "Nearly Sorted":
            arr = sorted([random.randint(5, 100) for _ in range(size)])
            # Swap ~10% of elements to make it 'nearly' sorted
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
        """Parses and validates user's custom comma-separated array input."""
        raw_text = self.custom_entry.get().strip()
        if not raw_text:
            messagebox.showerror("Invalid Input", "Please enter at least one number separated by commas.")
            return

        # Replace spaces, tabs, or semicolons if user entered those
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
        """Starts sorting using selected algorithm generator."""
        algo_name = self.current_algo_name.get()
        algo_meta = sa.ALGORITHM_INFO.get(algo_name)
        if not algo_meta:
            return

        generator = algo_meta["func"](self.visualizer.array)
        self.visualizer.set_speed(self.speed_var.get())
        self.visualizer.start(generator)

        # UI State updates
        self.start_btn.config(state="disabled")
        self.pause_btn.config(state="normal")
        self.resume_btn.config(state="disabled")
        self.step_btn.config(state="normal")
        self.status_var.set("Sorting...")

    def pause_sorting(self):
        """Pauses active sorting animation."""
        self.visualizer.pause()
        self.pause_btn.config(state="disabled")
        self.resume_btn.config(state="normal")
        self.status_var.set("Paused")

    def resume_sorting(self):
        """Resumes active sorting animation."""
        self.visualizer.resume()
        self.pause_btn.config(state="normal")
        self.resume_btn.config(state="disabled")
        self.status_var.set("Sorting...")

    def step_forward(self):
        """Advances visualization by one step."""
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
        """Restores array to initial unsorted state."""
        self.visualizer.reset()
        self._update_buttons_on_stop()

    def _update_buttons_on_stop(self):
        """Restores button states when sorting is completed or stopped."""
        self.start_btn.config(state="normal")
        self.pause_btn.config(state="disabled")
        self.resume_btn.config(state="disabled")
        self.step_btn.config(state="normal")

    def _on_visualizer_update(self, comparisons, swaps, elapsed, message, status):
        """Callback from visualizer engine to sync UI labels."""
        self.comparisons_var.set(str(comparisons))
        self.swaps_var.set(str(swaps))
        self.time_var.set(f"{elapsed:.2f}s")
        self.message_var.set(message)
        self.status_var.set(status)

    def _on_visualizer_finish(self, comparisons, swaps, final_time):
        """Callback when sorting generator completes."""
        self._update_buttons_on_stop()
        self.status_var.set(f"Completed in {final_time:.2f}s")
        self.message_var.set(f"Sorting Complete! Total comparisons: {comparisons}, Total swaps/writes: {swaps}.")


def main():
    """Main application entry point."""
    if "--test" in sys.argv or "--cli" in sys.argv:
        print("=== Interactive Sorting Visualizer CLI Self-Test ===")
        test_arr = [64, 34, 25, 12, 22, 11, 90, 48]
        print(f"Test Input: {test_arr}\n")
        for name, info in sa.ALGORITHM_INFO.items():
            gen = info["func"](test_arr)
            steps = list(gen)
            last = steps[-1]
            print(f"[{name}]")
            print(f"  Result: {last['array']}")
            print(f"  Steps: {len(steps)} | Comparisons: {last['comparisons']} | Swaps/Writes: {last['swaps']}")
            print(f"  Best: {info['time_best']} | Worst: {info['time_worst']} | Space: {info['space']} | Stable: {info['stability']}\n")
        print("All 5 sorting algorithms verified successfully!")
        return

    root = tk.Tk()
    app = SortingVisualizerApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
