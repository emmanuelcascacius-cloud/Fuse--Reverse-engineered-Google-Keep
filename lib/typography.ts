export interface TypographyProfile {
  fontSizeClass: string;
  lineHeightClass: string;
  letterSpacingClass: string;
  lineClampClass?: string;
  inlineStyle?: React.CSSProperties;
}

export function getTypographyProfile(bodyText: string): TypographyProfile {
  const text = bodyText || '';
  const charLength = text.length;
  const lineCount = text.split(/\r\n|\r|\n/).length;

  // Micro Note: L <= 35 chars, N <= 2 lines -> 22px / 28px / -0.01em
  if (charLength <= 35 && lineCount <= 2) {
    return {
      fontSizeClass: 'text-[22px]',
      lineHeightClass: 'leading-[28px]',
      letterSpacingClass: 'tracking-[-0.01em]',
    };
  }

  // Short Note: 36 <= L <= 90 chars, N <= 4 lines -> 18px / 24px / 0em
  if (charLength <= 90 && lineCount <= 4) {
    return {
      fontSizeClass: 'text-[18px]',
      lineHeightClass: 'leading-[24px]',
      letterSpacingClass: 'tracking-[0em]',
    };
  }

  // Long Note: L > 280 chars or N > 12 lines -> 14px / 20px / +0.01em with 14 lines clamp
  if (charLength > 280 || lineCount > 12) {
    return {
      fontSizeClass: 'text-[14px]',
      lineHeightClass: 'leading-[20px]',
      letterSpacingClass: 'tracking-[0.01em]',
      lineClampClass: 'line-clamp-[14]',
    };
  }

  // Standard Note: 91 <= L <= 280 chars -> 14px / 20px / +0.01em
  return {
    fontSizeClass: 'text-[14px]',
    lineHeightClass: 'leading-[20px]',
    letterSpacingClass: 'tracking-[0.01em]',
  };
}

