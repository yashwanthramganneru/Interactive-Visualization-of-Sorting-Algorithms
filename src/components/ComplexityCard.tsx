import React, { useState } from 'react';
import { Copy, Check, Code2, BookOpen } from 'lucide-react';
import { AlgorithmMetadata } from '../types';

interface ComplexityCardProps {
  meta: AlgorithmMetadata;
  activeLine?: number;
}

export const ComplexityCard: React.FC<ComplexityCardProps> = ({ meta }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(meta.pythonSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase">
            Complexity & Specifications
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Method: {meta.method}</span>
      </div>

      <div className="p-5">
        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="block text-[11px] font-medium text-slate-500">Best Time</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{meta.timeBest}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="block text-[11px] font-medium text-slate-500">Average Time</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{meta.timeAvg}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="block text-[11px] font-medium text-slate-500">Worst Time</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{meta.timeWorst}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="block text-[11px] font-medium text-slate-500">Aux Space</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{meta.space}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="block text-[11px] font-medium text-slate-500">Stability</span>
            <span
              className={`font-mono font-bold text-sm ${
                meta.stability === 'Stable' ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {meta.stability}
            </span>
          </div>
        </div>

        {/* Text Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4">{meta.description}</p>

        {/* Code Snippet Box */}
        <div className="relative rounded-lg bg-slate-900 text-slate-200 p-3.5 font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Python Implementation ({meta.name})</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-[11px] leading-5 text-slate-300 overflow-x-auto">
            {meta.pythonSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
