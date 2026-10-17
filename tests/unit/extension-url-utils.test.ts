import { describe, it, expect } from 'vitest';
import { normalizeUrl, isUrlMatchingScope } from '@/extension/lib/url-utils';

describe('Chrome Extension URL Normalizer (Issue 13)', () => {
  it('extracts source domain and strips www.', () => {
    const res1 = normalizeUrl('https://www.github.com/org/repo?ref=123#readme');
    expect(res1.sourceDomain).toBe('github.com');
    expect(res1.exactPath).toBe('github.com/org/repo');
    expect(res1.cleanUrl).toBe('https://github.com/org/repo');

    const res2 = normalizeUrl('https://sub.domain.linear.app/issue/123');
    expect(res2.sourceDomain).toBe('sub.domain.linear.app');
  });

  it('matches domain scope correctly', () => {
    // Domain match
    const isDomainMatch = isUrlMatchingScope(
      'github.com',
      null,
      'https://github.com/another/repo',
      'domain'
    );
    expect(isDomainMatch).toBe(true);

    // Subdomain match
    const isSubdomainMatch = isUrlMatchingScope(
      'github.com',
      null,
      'https://gist.github.com/user/123',
      'domain'
    );
    expect(isSubdomainMatch).toBe(true);

    // Mismatched domain
    const isDifferent = isUrlMatchingScope(
      'github.com',
      null,
      'https://gitlab.com/another/repo',
      'domain'
    );
    expect(isDifferent).toBe(false);
  });

  it('matches exact url scope correctly', () => {
    const isExactMatch = isUrlMatchingScope(
      'github.com',
      'https://github.com/org/repo',
      'https://github.com/org/repo?ref=banner#target',
      'exact_url'
    );
    expect(isExactMatch).toBe(true);

    const isDifferentPath = isUrlMatchingScope(
      'github.com',
      'https://github.com/org/repo',
      'https://github.com/org/another-repo',
      'exact_url'
    );
    expect(isDifferentPath).toBe(false);
  });
});

