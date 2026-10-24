import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  FileText,
  FolderArchive,
  Terminal,
} from 'lucide-react';
import {
  PROJECT_FILES,
  ProjectFile,
  downloadSingleFile,
  downloadAllProjectFilesZip,
} from '../utils/projectFilesData';

export const ProjectFilesViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadAllProjectFilesZip();
    } finally {
      setIsZipping(false);
    }
  };

  const lines = selectedFile.content.split('\n');

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto">
      {/* Top Banner / Call to Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-xl p-6 border border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Complete Python Source Code Package
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            All six required project files are pre-built, tested, and ready to run locally on Windows, macOS, or Linux using Python 3, Tkinter, and Matplotlib.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-tight transition-all shadow-md shrink-0 active:scale-98 disabled:opacity-75 cursor-pointer"
        >
          <FolderArchive className="w-4 h-4 text-slate-950" />
          <span>{isZipping ? 'Generating ZIP...' : 'Download Full Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Main File Explorer Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col md:flex-row min-h-[580px]">
        {/* Sidebar: File Tree */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 p-3 flex flex-col justify-between shrink-0">
          <div>
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Project Structure
            </div>
            <div className="space-y-1">
              {PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.name === file.name;
                const isPy = file.name.endsWith('.py');
                const isMd = file.name.endsWith('.md');

                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/10 text-sky-900 border border-sky-300/60 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {isPy ? (
                      <FileCode className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : isMd ? (
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Run Hint Card */}
          <div className="mt-4 p-3 bg-slate-900 rounded-lg text-slate-300 text-[11px]">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>How to Run</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
              Extract zip and execute from terminal or command prompt:
            </p>
            <div className="bg-slate-950 p-1.5 rounded font-mono text-[10px] text-emerald-400 border border-slate-800">
              python main.py
            </div>
          </div>
        </div>

        {/* Content Area: File Code Viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* File Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900">
                  {selectedFile.path}
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-[11px] text-slate-500">{lines.length} lines</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{selectedFile.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <button
                onClick={() => downloadSingleFile(selectedFile)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Code Viewer with Line Numbers */}
          <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs text-slate-200 max-h-[640px]">
            <div className="flex min-w-full">
              {/* Line Numbers Column */}
              <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800 font-mono text-[11px] shrink-0 leading-5">
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code Lines Column */}
              <pre className="pl-4 font-mono text-[11px] text-slate-200 leading-5 overflow-x-auto whitespace-pre">
                {selectedFile.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
