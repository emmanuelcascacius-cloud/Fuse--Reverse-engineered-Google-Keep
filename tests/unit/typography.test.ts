import { describe, it, expect } from 'vitest';
import { getTypographyProfile } from '@/lib/typography';

describe('Dynamic Typography Scaling Engine (Issue 05)', () => {
  it('applies Micro Note rules for <= 35 chars and <= 2 lines (22px / 28px)', () => {
    const micro1 = getTypographyProfile('Buy milk');
    expect(micro1.fontSizeClass).toBe('text-[22px]');
    expect(micro1.lineHeightClass).toBe('leading-[28px]');
    expect(micro1.letterSpacingClass).toBe('tracking-[-0.01em]');

    const micro35 = getTypographyProfile('12345678901234567890123456789012345');
    expect(micro35.fontSizeClass).toBe('text-[22px]');
  });

  it('applies Short Note rules for 36-90 chars and <= 4 lines (18px / 24px)', () => {
    const short36 = getTypographyProfile('123456789012345678901234567890123456');
    expect(short36.fontSizeClass).toBe('text-[18px]');
    expect(short36.lineHeightClass).toBe('leading-[24px]');
    expect(short36.letterSpacingClass).toBe('tracking-[0em]');

    const short90 = getTypographyProfile('a'.repeat(90));
    expect(short90.fontSizeClass).toBe('text-[18px]');
  });

  it('applies Standard Note rules for 91-280 chars (14px / 20px)', () => {
    const std91 = getTypographyProfile('a'.repeat(91));
    expect(std91.fontSizeClass).toBe('text-[14px]');
    expect(std91.lineHeightClass).toBe('leading-[20px]');
    expect(std91.letterSpacingClass).toBe('tracking-[0.01em]');
    expect(std91.lineClampClass).toBeUndefined();

    const std280 = getTypographyProfile('a'.repeat(280));
    expect(std280.fontSizeClass).toBe('text-[14px]');
  });

  it('applies Long Note rules with line-clamp-14 for > 280 chars or > 12 lines', () => {
    const long281 = getTypographyProfile('a'.repeat(281));
    expect(long281.fontSizeClass).toBe('text-[14px]');
    expect(long281.lineClampClass).toBe('line-clamp-[14]');

    const multiLine13 = getTypographyProfile(Array(13).fill('line').join('\n'));
    expect(multiLine13.fontSizeClass).toBe('text-[14px]');
    expect(multiLine13.lineClampClass).toBe('line-clamp-[14]');
  });
});

