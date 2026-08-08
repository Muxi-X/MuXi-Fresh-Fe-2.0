/**
 * Check if a URL is a CodePen URL.
 *
 * Supported formats:
 *   Old:  https://codepen.io/user/pen/xxxxx
 *   New:  https://codepen.io/editor/user/pen/xxxxx
 *   Also: /details/ or /full/ instead of /pen/
 */
export function isCodePenUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  // (?:editor\/)? makes the editor segment optional
  return /^https:\/\/codepen\.io\/(?:editor\/)?[^/]+\/(pen|details|full)\/[^/?]+/i.test(trimmed);
}

/**
 * Convert a CodePen pen/details/full URL to an embed URL.
 *
 *   Old: https://codepen.io/user/pen/abc123
 *     → https://codepen.io/user/embed/abc123?default-tab=result
 *
 *   New: https://codepen.io/editor/user/pen/019fdfe1-5b4a-788a-8c1d-5cbada8e5513
 *     → https://codepen.io/editor/user/embed/019fdfe1-5b4a-788a-8c1d-5cbada8e5513?default-tab=result
 *
 * If the input is not a CodePen URL, it is returned unchanged.
 */
export function getCodePenEmbedUrl(url: string): string {
  const trimmed = url.trim();
  // Capture optional editor/ prefix, username, action (pen|details|full), and the pen slug
  const match = trimmed.match(
    /^https:\/\/codepen\.io\/(editor\/)?([^/]+)\/(pen|details|full)\/([^/?]+)/i,
  );
  if (match) {
    const editorPrefix = match[1] || ''; // 'editor/' or empty
    const username = match[2];
    const penId = match[4];
    return `https://codepen.io/${editorPrefix}${username}/embed/${penId}?default-tab=result`;
  }
  return trimmed;
}
