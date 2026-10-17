export interface NormalizedUrlResult {
  rawUrl: string;
  sourceDomain: string;
  exactPath: string;
  cleanUrl: string;
}

export function normalizeUrl(url: string): NormalizedUrlResult {
  try {
    const parsed = new URL(url);

    // Normalize hostname: lowercase, remove leading "www."
    let sourceDomain = parsed.hostname.toLowerCase();
    if (sourceDomain.startsWith('www.')) {
      sourceDomain = sourceDomain.substring(4);
    }

    // Clean exact path (without trailing slash, hash, or query params)
    const exactPath = `${sourceDomain}${parsed.pathname.replace(/\/$/, '')}`;
    const cleanUrl = `${parsed.protocol}//${sourceDomain}${parsed.pathname}`;

    return {
      rawUrl: url,
      sourceDomain,
      exactPath,
      cleanUrl,
    };
  } catch {
    const fallbackDomain = url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    return {
      rawUrl: url,
      sourceDomain: fallbackDomain,
      exactPath: url,
      cleanUrl: url,
    };
  }
}

export function isUrlMatchingScope(
  noteDomain?: string | null,
  noteUrl?: string | null,
  activeUrl?: string | null,
  matchScope: 'domain' | 'exact_url' | 'disabled' = 'domain'
): boolean {
  if (matchScope === 'disabled' || !activeUrl) return false;

  const current = normalizeUrl(activeUrl);

  if (matchScope === 'domain') {
    if (!noteDomain) return false;
    const cleanNoteDomain = noteDomain.toLowerCase().replace(/^www\./, '');
    return current.sourceDomain === cleanNoteDomain || current.sourceDomain.endsWith(`.${cleanNoteDomain}`);
  }

  if (matchScope === 'exact_url') {
    if (!noteUrl) return false;
    const cleanNote = normalizeUrl(noteUrl);
    return current.exactPath === cleanNote.exactPath;
  }

  return false;
}

