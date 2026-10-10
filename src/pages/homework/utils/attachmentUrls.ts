interface UploadItemLike {
  status?: string;
  response?: { key?: unknown } | null;
  url?: unknown;
}

const invalidInterpolatedValues = new Set([
  'undefined',
  'null',
  'nan',
  '[object object]',
]);

const decodeUrlComponent = (component: string): string => {
  try {
    return decodeURIComponent(component);
  } catch {
    return component;
  }
};

const hasInvalidInterpolatedValue = (url: URL): boolean => {
  const pathSegments = url.pathname.split('/').map(decodeUrlComponent);
  const hash = decodeUrlComponent(url.hash.slice(1));
  const components = [
    ...url.hostname.split('.'),
    url.username,
    url.password,
    ...pathSegments,
    ...Array.from(url.searchParams.keys()),
    ...Array.from(url.searchParams.values()),
    hash,
  ];

  return components.some((component) =>
    invalidInterpolatedValues.has(component.trim().toLowerCase()),
  );
};

export const isValidAttachmentUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;

  const url = value.trim();
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      Boolean(parsed.hostname) &&
      !hasInvalidInterpolatedValue(parsed)
    );
  } catch {
    return false;
  }
};

export const normalizeAttachmentUrls = (
  files: readonly UploadItemLike[] | undefined,
  root: string,
): string[] =>
  (files ?? []).flatMap((item) => {
    if (
      !item ||
      item.status === 'error' ||
      item.status === 'uploading' ||
      item.status === 'removed'
    ) {
      return [];
    }

    const key = item.response?.key;
    if (typeof key === 'string' && key.trim()) {
      const url = `${root}${key.trim()}`;
      return isValidAttachmentUrl(url) ? [url] : [];
    }

    if (isValidAttachmentUrl(item.url)) {
      return [item.url.trim()];
    }
    return [];
  });
