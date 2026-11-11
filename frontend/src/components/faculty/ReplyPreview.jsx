import React from 'react';
import { MessageSquareQuote, Sparkles, Send } from 'lucide-react';

export function ReplyPreview({ replyText = '', studentName = 'Student' }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200/90 p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <MessageSquareQuote className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-800">
            Student Reply Preview
          </span>
        </div>
        <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          Empathetic JEE Tone
        </span>
      </div>

      <div className="relative bg-white rounded-xl p-3 border border-slate-200 shadow-xs text-xs text-slate-700 leading-relaxed">
        <p className="font-normal italic">"{replyText}"</p>

        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Sent to: <strong className="text-slate-600 font-medium">{studentName}</strong></span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <Send className="w-3 h-3" /> Ready to dispatch
          </span>
        </div>
      </div>
    </div>
  );
}

export default ReplyPreview;
