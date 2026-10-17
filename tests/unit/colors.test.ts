import { describe, it, expect } from 'vitest';
import { NOTE_COLORS, getNoteColor, getNoteColorClasses } from '@/lib/constants/colors';

describe('Priority State 12-Color Palette (Issue 03)', () => {
  it('contains exactly 12 authentic Google Keep colors', () => {
    expect(NOTE_COLORS).toHaveLength(12);
  });

  it('orders Priority States first: Coral (Red) = 1, Storm (Blue) = 2, Clay (Black/Slate) = 3', () => {
    expect(NOTE_COLORS[0].id).toBe('coral');
    expect(NOTE_COLORS[0].order).toBe(1);
    expect(NOTE_COLORS[0].isPrimaryState).toBe(true);
    expect(NOTE_COLORS[0].light.bg).toBe('#F28B82');
    expect(NOTE_COLORS[0].dark.bg).toBe('#5C2B29');

    expect(NOTE_COLORS[1].id).toBe('storm');
    expect(NOTE_COLORS[1].order).toBe(2);
    expect(NOTE_COLORS[1].isPrimaryState).toBe(true);
    expect(NOTE_COLORS[1].light.bg).toBe('#AECBFA');
    expect(NOTE_COLORS[1].dark.bg).toBe('#2A425A');

    expect(NOTE_COLORS[2].id).toBe('clay');
    expect(NOTE_COLORS[2].order).toBe(3);
    expect(NOTE_COLORS[2].isPrimaryState).toBe(true);
    expect(NOTE_COLORS[2].light.bg).toBe('#E8EAED');
    expect(NOTE_COLORS[2].dark.bg).toBe('#3C4043');
  });

  it('orders Chalk (Default Surface) in position 4', () => {
    expect(NOTE_COLORS[3].id).toBe('chalk');
    expect(NOTE_COLORS[3].order).toBe(4);
    expect(NOTE_COLORS[3].light.bg).toBe('#FFFFFF');
    expect(NOTE_COLORS[3].dark.bg).toBe('#202124');
  });

  it('verifies all 9 secondary colors match design.md hex codes exactly', () => {
    const secondaryIds = ['peach', 'sand', 'mint', 'sage', 'fog', 'dusk', 'blossom', 'earth'];
    const slice = NOTE_COLORS.slice(4).map((c) => c.id);
    expect(slice).toEqual(secondaryIds);

    const peach = getNoteColor('peach');
    expect(peach.light.bg).toBe('#FBBC04');
    expect(peach.dark.bg).toBe('#613916');

    const mint = getNoteColor('mint');
    expect(mint.light.bg).toBe('#CCFF90');
    expect(mint.dark.bg).toBe('#34481D');
  });

  it('falls back to chalk if color id is unknown or null', () => {
    const fallbackNull = getNoteColor(null);
    expect(fallbackNull.id).toBe('chalk');

    const fallbackUnknown = getNoteColor('unknown-color');
    expect(fallbackUnknown.id).toBe('chalk');
  });

  it('resolves correct color classes for light and dark modes', () => {
    const coralLight = getNoteColorClasses('coral', false);
    expect(coralLight.bg).toBe('#F28B82');
    expect(coralLight.border).toBe('#EC695E');

    const coralDark = getNoteColorClasses('coral', true);
    expect(coralDark.bg).toBe('#5C2B29');
    expect(coralDark.border).toBe('#7C3A37');
  });
});

