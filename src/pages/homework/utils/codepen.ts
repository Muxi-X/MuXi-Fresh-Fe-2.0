/**
 * Check if a URL is a CodePen URL.
 *
 * Supported formats:
 *   Old:  https://codepen.io/user/pen/xxxxx
 *   New:  https://codepen.io/editor/user/pen/xxxxx
 *   Also: /details/, /full/ or /embed/ instead of /pen/
 *   Optional: http(s) scheme, www. prefix, trailing query/hash/params
 */
export function isCodePenUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  // (?:editor\/)? makes the editor segment optional;
  // [^/?#]+ excludes query params / hash / trailing slash from the pen slug
  return /^https?:\/\/(?:www\.)?codepen\.io\/(?:editor\/)?[^/]+\/(pen|details|full|embed)\/[^/?#]+/i.test(
    trimmed,
  );
}

/**
 * Convert a CodePen pen/details/full/embed URL to an embed URL.
 *
 *   Old: https://codepen.io/user/pen/abc123
 *     → https://codepen.io/user/embed/abc123?default-tab=result
 *
 *   New: https://codepen.io/editor/user/pen/019fdfe1-5b4a-788a-8c1d-5cbada8e5513
 *     → https://codepen.io/editor/user/embed/019fdfe1-5b4a-788a-8c1d-5cbada8e5513?default-tab=result
 *
 * Also normalizes http://, www., and strips query params / hash / trailing slash.
 * If the input is not a CodePen URL, it is returned unchanged.
 */
export function getCodePenEmbedUrl(url: string): string {
  const trimmed = url.trim();
  const match = trimmed.match(
    /^https?:\/\/(?:www\.)?codepen\.io\/(editor\/)?([^/]+)\/(pen|details|full|embed)\/([^/?#]+)/i,
  );
  if (match) {
    const editorPrefix = match[1] || ''; // 'editor/' or empty
    const username = match[2];
    const penId = match[4];
    return `https://codepen.io/${editorPrefix}${username}/embed/${penId}?default-tab=result`;
  }
  return trimmed;
}
