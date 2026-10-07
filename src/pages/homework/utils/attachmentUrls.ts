interface UploadItemLike {
  status?: string;
  response?: { key?: unknown } | null;
  url?: unknown;
}

const invalidUrlFragments = ['undefined', 'null', 'nan', '[object object]'];

export const isValidAttachmentUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;

  const url = value.trim();
  if (
    !url ||
    invalidUrlFragments.some((fragment) => url.toLowerCase().includes(fragment))
  ) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      Boolean(parsed.hostname)
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
