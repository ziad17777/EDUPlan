/**
 * Detects if text is predominantly Arabic/RTL.
 * Strips markdown syntax before checking so headings like "### مرحبا" are detected correctly.
 * Returns "rtl" for Arabic, "ltr" for English/Latin, or "auto" if undetermined.
 */

// Arabic Unicode range: \u0600-\u06FF (Arabic), \u0750-\u077F (Arabic Supplement),
// \uFB50-\uFDFF (Arabic Presentation Forms-A), \uFE70-\uFEFF (Arabic Presentation Forms-B)
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const LATIN_CHAR_REGEX = /[A-Za-z]/g;

/**
 * Strips common markdown syntax to get pure text for direction detection.
 */
function stripMarkdown(text) {
  return text
    .replace(/#{1,6}\s*/g, '')       // headings
    .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1') // bold/italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '')     // inline/block code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links
    .replace(/^[\s>*\-+\d.]+/gm, '')        // list markers, blockquotes
    .replace(/[_~|]/g, '');                   // other markdown chars
}

/**
 * Detect text direction based on the first meaningful line of content.
 * @param {string} text - The message text (can include markdown)
 * @returns {"rtl" | "ltr"}
 */
export function detectTextDirection(text) {
  if (!text || typeof text !== 'string') return 'ltr';

  const cleaned = stripMarkdown(text).trim();
  if (!cleaned) return 'ltr';

  // Check the first non-empty line for quick detection
  const firstLine = cleaned.split('\n').find(line => line.trim().length > 0) || '';

  // Count Arabic vs Latin characters
  const arabicMatches = firstLine.match(ARABIC_CHAR_REGEX);
  const latinMatches = firstLine.match(LATIN_CHAR_REGEX);
  const arabicCount = arabicMatches ? arabicMatches.length : 0;
  const latinCount = latinMatches ? latinMatches.length : 0;

  // If there are any Arabic characters and they outnumber Latin, it's RTL
  if (arabicCount > 0 && arabicCount >= latinCount) return 'rtl';

  return 'ltr';
}

/**
 * Returns the text-align class based on direction.
 * @param {"rtl" | "ltr"} dir
 * @returns {string}
 */
export function getAlignClass(dir) {
  return dir === 'rtl' ? 'text-right' : 'text-left';
}
