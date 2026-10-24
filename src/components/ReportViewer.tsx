import React, { useState } from 'react';
import {
  FileText,
  HelpCircle,
  BarChart3,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ReportViewer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'report' | 'viva' | 'results'>('report');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: 'Why did you use Python generator functions (yield) instead of standard functions?',
      a: 'Standard functions in Python execute run-to-completion, which blocks execution until the entire array is sorted. In a Tkinter GUI application, this would either freeze the window or require multi-threaded shared-memory synchronization with locks. By using Python generators with yield, each sorting step yields an array snapshot and suspends execution. This allows the Tkinter event loop to render the frame via root.after() and cleanly support Pause, Resume, and Step-Forward operations.',
    },
    {
      q: 'What is the difference between a stable and unstable sorting algorithm?',
      a: 'A sorting algorithm is stable if it preserves the relative order of duplicate elements. In our project, Bubble Sort, Insertion Sort, and Merge Sort are stable. Selection Sort and Quick Sort are unstable because distant element swaps can alter the original relative order of equivalent items.',
    },
    {
      q: 'When does Quick Sort degrade to O(n²) time complexity?',
      a: 'Quick Sort degrades to O(n²) when the pivot chosen consistently creates maximally unbalanced partitions (e.g., 0 elements on one side and n-1 on the other). In Lomuto partitioning with the last element as pivot, this occurs on already sorted or reverse-sorted arrays. In our experimental benchmarks, comparisons spike to n(n-1)/2.',
    },
    {
      q: 'Why does Insertion Sort perform so well on nearly sorted arrays?',
      a: 'Insertion Sort compares the key backwards only until it encounters an element smaller than or equal to itself. In a nearly sorted array, most elements are already close to their destination, requiring only 1 or 2 comparisons per pass, yielding an empirical runtime of O(n).',
    },
    {
      q: 'How does your application ensure the GUI does not freeze during animation?',
      a: 'We avoid time.sleep(). Instead, we use Tkinter’s non-blocking root.after(delay_ms, callback) method. This schedules callbacks in the event queue, ensuring user interactions like clicking Pause, adjusting the speed slider, or resizing the window are handled smoothly.',
    },
    {
      q: 'Why does Merge Sort require O(n) auxiliary space while Quick Sort requires O(log n)?',
      a: 'Merge Sort creates temporary auxiliary buffers during the merge phase to combine two sorted subarrays. Quick Sort sorts in-place by swapping elements directly within the array, requiring only O(log n) auxiliary memory for the recursive call stack under balanced partitioning.',
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveSection('report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeSection === 'report'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Full Academic Report</span>
        </button>

        <button
          onClick={() => setActiveSection('viva')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeSection === 'viva'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Viva Voce Defense Q&A</span>
        </button>

        <button
          onClick={() => setActiveSection('results')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeSection === 'results'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Empirical Benchmark Data</span>
        </button>
      </div>

      {/* SECTION 1: FULL ACADEMIC REPORT */}
      {activeSection === 'report' && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-8 text-slate-800 text-sm leading-relaxed">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6 text-center">
            <span className="text-xs font-bold text-sky-700 tracking-wider uppercase">
              Final-Year Engineering Project Report
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Interactive Visualization of Sorting Algorithms
            </h1>
            <p className="text-xs text-slate-500 mt-2 max-w-xl mx-auto">
              Submitted in partial fulfillment of the requirements for the Degree of Bachelor of
              Technology / Science in Computer Science & Engineering
            </p>
          </div>

          {/* 1. Abstract */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="text-sky-600">01.</span> Abstract
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Sorting algorithms form the bedrock of fundamental computer science, data structures,
              and computational thinking. While mathematical proofs and asymptotic Big-O notations
              rigorously describe theoretical bounds, students often struggle to conceptualize
              internal state transitions, pointer movements, and divide-and-conquer branching. This
              project presents an <strong>Interactive Visualization of Sorting Algorithms</strong>{' '}
              developed in <strong>Python 3</strong> using <strong>Tkinter</strong> for graphical user
              interface engineering and <strong>Matplotlib</strong> for real-time statistical
              bar-chart rendering. The visualizer supports five cornerstone algorithms: Bubble Sort,
              Selection Sort, Insertion Sort, Merge Sort, and Quick Sort. By leveraging Python's
              generator mechanism (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-xs">yield</code>),
              the system decouples algorithm execution from rendering, enabling non-blocking
              playback controls including Start, Pause, Resume, Single-Step inspection, and dynamic
              speed adjustment.
            </p>
          </div>

          {/* 2. Objectives */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="text-sky-600">02.</span> Objectives & Scope
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">State Visualization</span>
                Render elements as proportional vertical bars whose heights reflect numeric values,
                with real-time color highlights for comparisons, swaps, and pivot choices.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Deterministic Playback</span>
                Allow users to start, pause, resume, single-step, and adjust animation delay from 1ms
                to 200ms dynamically.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Input Flexibility</span>
                Provide automated random, reversed, nearly sorted, and few-unique array generators,
                plus custom comma-separated user inputs with validation.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Empirical Telemetry</span>
                Track exact comparison count, data write/swap count, and wall-clock execution time
                excluding pause duration.
              </div>
            </div>
          </div>

          {/* 3. System Architecture */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="text-sky-600">03.</span> System Architecture & Generator Pattern
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">
              The application employs a 3-tier decoupled architecture:
            </p>
            <div className="bg-slate-950 p-4 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {`+-----------------------------------------------------------+
|                    PRESENTATION LAYER                     |
|                 main.py (Tkinter + ttk)                   |
|  - Controls Panel (Algorithm, Size, Speed, Inputs)        |
|  - Metrics Dashboard (Comparisons, Swaps, Elapsed Time)   |
|  - Complexity Specifications Card                         |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|                    ANIMATION ENGINE                       |
|               visualizer.py (Matplotlib)                  |
|  - FigureCanvasTkAgg Bridge                               |
|  - Non-blocking root.after() Event Loop                   |
|  - Frame Renderer & Bar Color State Dispatcher            |
|  - Wall-clock StopWatch (excluding pause duration)        |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|                    ALGORITHMIC ENGINE                     |
|               sorting_algorithms.py                       |
|  - Generator Functions (yield {array, colors, stats})     |
|  - Bubble, Selection, Insertion, Merge, Quick Sort        |
+-----------------------------------------------------------+`}
            </div>
          </div>

          {/* 4. Conclusion */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="text-sky-600">04.</span> Conclusion
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              The project successfully establishes how software engineering principles,
              state-machine decoupling, and non-blocking asynchronous event loops can enhance
              computer science education. The resulting software is completely portable,
              lightweight, and ready for classroom and laboratory demonstration.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 2: VIVA VOCE FLASHCARDS */}
      {activeSection === 'viva' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Viva Voce Defense & Oral Examination Guide
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Curated frequently asked questions with examiner-grade answers to help you explain the
              code and design decisions confidently.
            </p>
          </div>

          <div className="space-y-3">
            {vivaQuestions.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-bold text-sky-600">
                        Q{idx + 1}.
                      </span>
                      <span className="text-xs font-bold text-slate-900">{item.q}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white border-t border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-emerald-700 block mb-1">
                        Recommended Model Answer:
                      </span>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: EMPIRICAL BENCHMARKS */}
      {activeSection === 'results' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Empirical Performance Comparison ($N = 20$)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Recorded measurements from our test runs comparing comparisons, swaps, and behavior
              across distribution types.
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Algorithm</th>
                  <th className="py-3 px-4">Random Comparisons</th>
                  <th className="py-3 px-4">Random Swaps</th>
                  <th className="py-3 px-4">Reversed Comparisons</th>
                  <th className="py-3 px-4">Nearly Sorted</th>
                  <th className="py-3 px-4">Stability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-bold text-slate-900">Bubble Sort</td>
                  <td className="py-2.5 px-4 tabular-nums">190</td>
                  <td className="py-2.5 px-4 tabular-nums">108</td>
                  <td className="py-2.5 px-4 tabular-nums">190</td>
                  <td className="py-2.5 px-4 tabular-nums text-emerald-600 font-bold">54</td>
                  <td className="py-2.5 px-4 font-sans text-emerald-700">Stable</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-bold text-slate-900">Selection Sort</td>
                  <td className="py-2.5 px-4 tabular-nums">190</td>
                  <td className="py-2.5 px-4 tabular-nums text-emerald-600 font-bold">18</td>
                  <td className="py-2.5 px-4 tabular-nums">190</td>
                  <td className="py-2.5 px-4 tabular-nums">190</td>
                  <td className="py-2.5 px-4 font-sans text-amber-700">Unstable</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-bold text-slate-900">Insertion Sort</td>
                  <td className="py-2.5 px-4 tabular-nums">106</td>
                  <td className="py-2.5 px-4 tabular-nums">125</td>
                  <td className="py-2.5 px-4 tabular-nums">190</td>
                  <td className="py-2.5 px-4 tabular-nums text-emerald-600 font-bold">22</td>
                  <td className="py-2.5 px-4 font-sans text-emerald-700">Stable</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-bold text-slate-900">Merge Sort</td>
                  <td className="py-2.5 px-4 tabular-nums text-emerald-600 font-bold">68</td>
                  <td className="py-2.5 px-4 tabular-nums">86</td>
                  <td className="py-2.5 px-4 tabular-nums text-emerald-600 font-bold">64</td>
                  <td className="py-2.5 px-4 tabular-nums">62</td>
                  <td className="py-2.5 px-4 font-sans text-emerald-700">Stable</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-bold text-slate-900">Quick Sort</td>
                  <td className="py-2.5 px-4 tabular-nums text-emerald-600 font-bold">62</td>
                  <td className="py-2.5 px-4 tabular-nums">42</td>
                  <td className="py-2.5 px-4 tabular-nums text-rose-600">190</td>
                  <td className="py-2.5 px-4 tabular-nums">66</td>
                  <td className="py-2.5 px-4 font-sans text-amber-700">Unstable</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-sky-50 rounded-lg border border-sky-100 text-xs text-sky-900">
            <strong>Key Insight for Examiners:</strong> Notice how Quick Sort comparisons spike to
            190 (worst-case $O(n^2)$) on reverse-sorted input due to unbalanced Lomuto partitions,
            whereas Merge Sort remains consistently fast across all distributions.
          </div>
        </div>
      )}
    </div>
  );
};
