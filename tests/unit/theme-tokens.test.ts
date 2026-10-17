import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Design System Theme Tokens & CSS Properties (Issue 03)', () => {
  const cssContent = fs.readFileSync(
    path.resolve(process.cwd(), 'styles/globals.css'),
    'utf-8'
  );

  it('defines calm canvas and text tokens in :root (Light Mode)', () => {
    expect(cssContent).toContain('--bg-canvas: #FFFFFF');
    expect(cssContent).toContain('--bg-header: rgba(255, 255, 255, 0.92)');
    expect(cssContent).toContain('--bg-search: #F1F3F4');
    expect(cssContent).toContain('--bg-sidebar-active: #FEEFC3');
    expect(cssContent).toContain('--text-primary: #202124');
    expect(cssContent).toContain('--text-secondary: #5F6368');
    expect(cssContent).toContain('--text-muted: #80868B');
    expect(cssContent).toContain('--border-hairline: #E0E0E0');
  });

  it('defines calm charcoal and inverted tokens in [data-theme="dark"]', () => {
    expect(cssContent).toContain('[data-theme="dark"]');
    expect(cssContent).toContain('--bg-canvas: #202124');
    expect(cssContent).toContain('--bg-sidebar-active: #41331C');
    expect(cssContent).toContain('--text-primary: #E8EAED');
    expect(cssContent).toContain('--border-hairline: #5F6368');
  });

  it('defines primary state accent dots', () => {
    expect(cssContent).toContain('--state-red-dot: #D93025');
    expect(cssContent).toContain('--state-blue-dot: #1A73E8');
    expect(cssContent).toContain('--state-black-dot: #202124');
  });
});

