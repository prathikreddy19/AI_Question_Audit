/**
 * Utility functions for parsing and rendering Acadza Question HTML and MathML.
 */

export function sanitizeHtml(html) {
  if (!html) return '';
  // Modern browsers safely execute native MathML.
  // Remove potentially harmful script tags if any, but preserve MathML and style attributes.
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Attempts to parse options from question HTML if embedded (e.g., (A), (B), (C), (D))
 */
export function extractOptions(html) {
  if (!html) return [];
  
  // Look for pattern like (A)... (B)... (C)... (D)...
  const regex = /\(([A-D])\)\s*([\s\S]*?)(?=(?:\([A-D]\)|$))/gi;
  const matches = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const key = match[1].toUpperCase();
    let content = match[2].trim();
    // Clean trailing tags if any
    content = content.replace(/<\/h3>|<\/span>|<\/div>|<br\s*\/?>/gi, ' ').trim();
    if (content.length > 0) {
      matches.push({ key, content });
    }
  }

  // If found at least 2 distinct option keys
  if (matches.length >= 2) {
    return matches;
  }

  return [];
}

/**
 * Strips HTML tags for plain text previews
 */
export function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
