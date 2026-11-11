import React, { useState } from 'react';
import { diffWords } from 'diff';
import { Columns, AlignJustify, ArrowRight } from 'lucide-react';

export function DiffViewer({
  beforeText = '',
  afterText = '',
  field = 'answer',
  showToggle = true,
}) {
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'unified'

  // Calculate word/token differences
  const diffs = diffWords(String(beforeText || ''), String(afterText || ''));

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            DIFF
          </span>
          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono text-[11px]">
            field: {field}
          </span>
        </div>

        {showToggle && (
          <div className="flex items-center rounded-lg bg-slate-800/90 p-0.5 border border-slate-700/60 text-[11px]">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                viewMode === 'split'
                  ? 'bg-slate-700 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                viewMode === 'unified'
                  ? 'bg-slate-700 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlignJustify className="w-3 h-3" />
              <span>Unified</span>
            </button>
          </div>
        )}
      </div>

      {/* Diff Content */}
      <div className="p-3.5 font-mono text-xs overflow-x-auto leading-relaxed">
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Before (Original) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-rose-400 font-semibold mb-1">
                <span>BEFORE (Current DB)</span>
                <span className="text-[10px] text-slate-500 font-normal">Original</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-200 break-words">
                {beforeText || <span className="text-slate-600 italic">None</span>}
              </div>
            </div>

            {/* After (Proposed) */}
            <div className="space-y-1 md:pl-3 pt-3 md:pt-0">
              <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold mb-1">
                <span>AFTER (AI Suggestion)</span>
                <span className="text-[10px] text-slate-500 font-normal">Corrected</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-200 break-words">
                {afterText || <span className="text-slate-600 italic">None</span>}
              </div>
            </div>
          </div>
        ) : (
          /* Unified Diff View */
          <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400 mb-1">Inline Word Diff:</div>
            <div className="break-words">
              {diffs.map((part, index) => {
                if (part.added) {
                  return (
                    <span
                      key={index}
                      className="bg-emerald-900/60 text-emerald-300 px-1 py-0.5 rounded mx-0.5 underline decoration-emerald-500"
                    >
                      {part.value}
                    </span>
                  );
                }
                if (part.removed) {
                  return (
                    <span
                      key={index}
                      className="bg-rose-900/60 text-rose-300 px-1 py-0.5 rounded mx-0.5 line-through opacity-75"
                    >
                      {part.value}
                    </span>
                  );
                }
                return <span key={index} className="text-slate-300">{part.value}</span>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiffViewer;
