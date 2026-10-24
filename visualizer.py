"""
visualizer.py
=============
Matplotlib and Tkinter Canvas Integration for Sorting Visualization.

Handles:
- Embedding Matplotlib Figure inside Tkinter using FigureCanvasTkAgg
- Responsive bar rendering with dynamic colors and value annotations
- State-machine driven animation loop via root.after() (non-blocking)
- Accurate runtime tracking excluding pause intervals
- Controls: Start, Pause, Resume, Step, Reset
"""

import time
import matplotlib
matplotlib.use("TkAgg")
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg


class SortingVisualizer:
    def __init__(self, parent_frame, on_update_callback=None, on_finish_callback=None):
        """
        Parameters:
        - parent_frame: Tkinter Frame where the Matplotlib canvas will be embedded
        - on_update_callback: function(comparisons, swaps, elapsed_time, message, status)
        - on_finish_callback: function(comparisons, swaps, elapsed_time)
        """
        self.parent = parent_frame
        self.on_update = on_update_callback
        self.on_finish = on_finish_callback

        # State tracking
        self.array = []
        self.original_array = []
        self.generator = None
        self.is_running = False
        self.is_paused = False
        self.is_finished = False

        # Animation timing
        self.delay_ms = 40  # Default speed
        self.timer_after_id = None
        self.start_time = 0.0
        self.accumulated_time = 0.0
        self.last_pause_time = 0.0

        # Stats
        self.comparisons = 0
        self.swaps = 0
        self.current_message = "Ready to sort."

        # Setup Matplotlib Figure & Axes
        self.figure = Figure(figsize=(8.5, 4.8), dpi=100, facecolor="#F8FAFC")
        self.ax = self.figure.add_subplot(111)
        self.figure.tight_layout(pad=2.5)

        # Style Matplotlib chart
        self.ax.set_facecolor("#FFFFFF")
        for spine in self.ax.spines.values():
            spine.set_color("#E2E8F0")
            spine.set_linewidth(1.0)
        self.ax.tick_params(colors="#64748B", labelsize=9)
        self.ax.grid(axis="y", linestyle="--", alpha=0.3, color="#94A3B8")

        # Create Canvas widget
        self.canvas = FigureCanvasTkAgg(self.figure, master=self.parent)
        self.canvas_widget = self.canvas.get_tk_widget()
        self.canvas_widget.pack(fill="both", expand=True)

        self.bars = []
        self.text_labels = []

    def set_data(self, arr):
        """Loads a new array into the visualizer."""
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
        """Redraws vertical bars on the Matplotlib axes."""
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

        # Draw vertical bars
        self.bars = self.ax.bar(
            x_indices,
            arr,
            color=colors,
            edgecolor="#1E293B",
            linewidth=0.5 if n > 30 else 0.8,
            width=0.75 if n > 30 else 0.65
        )

        # Add value labels above bars when array size is reasonable
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
        """Starts sorting animation with the given generator."""
        self.stop_animation()
        self.generator = algorithm_generator
        self.is_running = True
        self.is_paused = False
        self.is_finished = False

        self.start_time = time.perf_counter()
        self.accumulated_time = 0.0
        self._schedule_next_step()

    def pause(self):
        """Pauses the animation."""
        if self.is_running and not self.is_paused:
            self.is_paused = True
            self.accumulated_time += (time.perf_counter() - self.start_time)
            if self.timer_after_id:
                self.parent.after_cancel(self.timer_after_id)
                self.timer_after_id = None
            self._notify_update("Paused")

    def resume(self):
        """Resumes the animation from paused state."""
        if self.is_running and self.is_paused:
            self.is_paused = False
            self.start_time = time.perf_counter()
            self._schedule_next_step()
            self._notify_update("Sorting...")

    def step_forward(self):
        """Advances one discrete animation frame (manual single-step mode)."""
        if not self.generator or self.is_finished:
            return

        if self.is_running and not self.is_paused:
            self.pause()

        self._execute_one_step()

    def reset(self):
        """Resets the array to original unsorted state."""
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
        """Sets step delay in milliseconds."""
        self.delay_ms = max(1, int(delay_ms))

    def stop_animation(self):
        """Halts running timer loops."""
        if self.timer_after_id:
            try:
                self.parent.after_cancel(self.timer_after_id)
            except Exception:
                pass
            self.timer_after_id = None
        self.is_running = False
        self.is_paused = False

    def _schedule_next_step(self):
        """Schedules the next animation tick using root.after()."""
        if not self.is_running or self.is_paused or self.is_finished:
            return

        self.timer_after_id = self.parent.after(self.delay_ms, self._animation_tick)

    def _animation_tick(self):
        """Timer callback tick."""
        self.timer_after_id = None
        if not self.is_running or self.is_paused:
            return

        has_more = self._execute_one_step()
        if has_more and not self.is_paused:
            self._schedule_next_step()

    def _execute_one_step(self):
        """Executes a single yield from the sorting generator."""
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
        """Computes current total elapsed time accurately."""
        if not self.is_running:
            return self.accumulated_time
        if self.is_paused:
            return self.accumulated_time
        return self.accumulated_time + (time.perf_counter() - self.start_time)

    def _handle_completion(self):
        """Called when sorting generator reaches final sorted state."""
        self.is_finished = True
        self.is_running = False
        self.is_paused = False
        final_time = self._get_current_elapsed_time()
        self.accumulated_time = final_time

        self._notify_update(f"Completed in {final_time:.2f}s")
        if self.on_finish:
            self.on_finish(self.comparisons, self.swaps, final_time)

    def _notify_update(self, status):
        """Triggers UI update callback."""
        if self.on_update:
            elapsed = self._get_current_elapsed_time()
            self.on_update(self.comparisons, self.swaps, elapsed, self.current_message, status)
