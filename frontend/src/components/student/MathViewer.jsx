import React from 'react';
import { sanitizeHtml } from '../../utils/mathmlHelper';

export function MathViewer({ htmlContent = '', className = '' }) {
  if (!htmlContent) {
    return <div className="text-slate-400 italic text-sm">No content available.</div>;
  }

  const clean = sanitizeHtml(htmlContent);

  return (
    <div
      className={`question-html-content prose prose-slate max-w-none text-slate-800 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

export default MathViewer;
