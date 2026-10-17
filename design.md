# Fuse — Deep UI/UX & Visual Engineering Specification (`design.md`)

## 1. Visual Philosophy: "Calm Spatial Clarity"
Google Keep feels effortless and "smooth" not because of heavy animations, but because of **visual restraint, spatial predictability, and tactile surface elevation**. **Fuse** preserves this calm, low-cognitive-load atmosphere across both the Web Application and the Chrome Extension Shadow DOM overlay, while introducing **Priority State Color Coding (Red, Blue, Black first)** inside Google Keep's signature 12-color system.

### Core Aesthetic Pillars
1. **Calm Canvas, Expressive Cards**: The application background is never stark, blinding `#FFFFFF` without warmth or pure `#000000` (which causes OLED smearing and halation). Light mode uses warm paper-white (`#F8F9FA` canvas / `#FFFFFF` surface) and Dark mode uses Google's signature calm charcoal (`#202124`).
2. **Zero Chrome Noise at Rest**: Card action icons (Color palette, Label, Archive, More) are **hidden (`opacity: 0`)** until the cursor enters the card or keyboard focus lands on it. At rest, a note is pure typography on a softly tinted rectangle.
3. **Priority Without Panic**: Even when a note is marked **Red (`Coral` — Urgent/Serious)** or **Blue (`Storm` — Active)**, the hue is a desaturated, low-glare pastel in Light Mode and a deep, velvety muted tone in Dark Mode—never a neon `#FF0000` alarm that ruins the calm of the workspace.

---

## 2. The 12-Color Palette & Priority State System (Red, Blue, Black First)

Fuse uses all **12 authentic Google Keep background colors**, re-indexed so the **3 Primary State Colors (Red, Blue, Black/Charcoal)** appear first in the `<ColorStatePicker />` popover, search filter chips, and keyboard shortcuts (`Alt+1`, `Alt+2`, `Alt+3`).

### 2.1 Complete Dual-Theme Color Token Table

| Order | Fuse ID | Keep Name | Semantic State Role | Light Mode Bg | Light Mode Border | Dark Mode Bg | Dark Mode Border |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `coral` | **Coral (Red)** | **Primary 1 — Serious / Urgent / Blocker** | `#F28B82` | `#EC695E` | `#5C2B29` | `#7C3A37` |
| **2** | `storm` | **Storm (Blue)** | **Primary 2 — Active / Deep Work / Context** | `#AECBFA` | `#8AB4F8` | `#2A425A` | `#3B5B7C` |
| **3** | `clay` | **Clay (Black/Slate)** | **Primary 3 — Serious Neutral / Vault / Log** | `#E8EAED` | `#DADCE0` | `#3C4043` | `#5F6368` |
| **4** | `chalk` | **Chalk (Default)** | **Default Surface — Calm Baseline** | `#FFFFFF` | `#E0E0E0` | `#202124` | `#5F6368` |
| **5** | `peach` | **Peach** | Secondary — Warm Idea / Draft | `#FBBC04` / `#FDCB6E` | `#F29900` | `#613916` | `#7D4A1D` |
| **6** | `sand` | **Sand** | Secondary — Highlight / Scratchpad | `#FFF475` | `#FBC02D` | `#594212` | `#755718` |
| **7** | `mint` | **Mint** | Secondary — Completed / Fresh / Growth | `#CCFF90` | `#A8E665` | `#34481D` | `#466127` |
| **8** | `sage` | **Sage** | Secondary — Calm Reference / Docs | `#A7FFEB` | `#73E8CE` | `#164E43` | `#1E6B5C` |
| **9** | `fog` | **Fog** | Secondary — Backlog / Reading List | `#CBF0F8` | `#9ADCF0` | `#204F5E` | `#2C6B80` |
| **10** | `dusk` | **Dusk** | Secondary — Architecture / Creative | `#D7AEFB` | `#C084FC` | `#472A5B` | `#5E3878` |
| **11** | `blossom` | **Blossom** | Secondary — Personal / UI & Design | `#FDCFE8` | `#F8A5D2` | `#5B2E48` | `#7A3E61` |
| **12** | `earth` | **Earth (Warm)** | Secondary — Archive-Ready / Timeless | `#E6C9A8` | `#D4AF87` | `#4B3621` | `#63472B` |

### 2.2 Global Canvas, Text & Chrome Tokens (CSS Variables)

```css
:root {
  /* Light Mode — Calm Warm Paper & Ink */
  --bg-canvas: #FFFFFF;
  --bg-header: rgba(255, 255, 255, 0.92);
  --bg-search: #F1F3F4;
  --bg-search-focus: #FFFFFF;
  --bg-sidebar-active: #FEEFC3; /* Subtle warm pill for active nav */
  
  --text-primary: #202124;      /* Never pure #000000; softens contrast glare */
  --text-secondary: #5F6368;    /* Metadata, checklist completed items, placeholders */
  --text-muted: #80868B;        /* Timestamps, source domain chips */
  
  --border-hairline: #E0E0E0;   /* 1px solid card border on Default/Chalk */
  --icon-default: #5F6368;
  --icon-hover-bg: rgba(95, 99, 104, 0.087);
  
  /* Primary State Accent Dots (used in Color Picker & Filter Bar) */
  --state-red-dot: #D93025;
  --state-blue-dot: #1A73E8;
  --state-black-dot: #202124;
}

[data-theme="dark"] {
  /* Dark Mode — Google Keep Calm Charcoal */
  --bg-canvas: #202124;
  --bg-header: rgba(32, 33, 36, 0.92);
  --bg-search: #525355;
  --bg-search-focus: #FFFFFF;   /* Inverted or #303134 elevated search bar */
  --bg-sidebar-active: #41331C;
  
  --text-primary: #E8EAED;      /* Soft off-white; avoids halation on dark cards */
  --text-secondary: #9AA0A6;
  --text-muted: #7F868D;
  
  --border-hairline: #5F6368;   /* 1px solid border on Dark Chalk cards */
  --icon-default: #9AA0A6;
  --icon-hover-bg: rgba(232, 234, 237, 0.08);
}
```

### 2.3 Color Picker Popover Geometry (`<ColorStatePicker />`)
- **Layout**: 2 rows of 6 circular swatches (`28px × 28px` each, `gap: 6px`, container padding `8px 12px`, `border-radius: 8px`).
- **Row 1 (Primary States First)**:
  1. `coral` (Red — Serious/Urgent) — features a subtle `2px` inner ring indicator.
  2. `storm` (Blue — Active/Context) — features a subtle `2px` inner ring indicator.
  3. `clay` (Black/Slate — Neutral State) — features a subtle `2px` inner ring indicator.
  4. `chalk` (Default Canvas).
  5. `peach`
  6. `sand`
- **Row 2 (Secondary Palette)**: `mint`, `sage`, `fog`, `dusk`, `blossom`, `earth`.
- **Selected State**: Displays a centered `14px` checkmark icon inside the swatch with a `2px solid #1A73E8` (or `#8AB4F8` in dark mode) outer focus ring.

---

## 3. Typography & Dynamic Font-Size Scaling

Google Keep's signature visual rhythm comes from **automatic typography scaling** based on note body length. Since Fuse has **no title field**, the body text itself acts as the visual anchor.

### 3.1 Font Stack
- **Primary UI & Short Notes**: `'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` (clean geometric legibility matching Google Sans).
- **Body Copy & Checklists**: `'Roboto', 'Inter', system-ui, sans-serif` (optimized x-height for dense multi-line scanning).
- **Monospace (Code snippets / URLs)**: `'JetBrains Mono', 'Fira Code', monospace`.

### 3.2 Dynamic Body Text Scaling Rules (Card Preview)
When rendering `<NoteCard />` in the Masonry Grid, compute the effective character length `L` and line count `N` of `note.body`:

| Note Body Profile | Font Size | Line Height | Letter Spacing | Font Weight | Why It Feels Like Google Keep |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Micro Note** (`L <= 35` chars, `N <= 2` lines) | `22px` (`1.375rem`) | `28px` (`1.27`) | `-0.01em` | `400` | Acts like a bold sticky-note headline on the wall; readable from 3 feet away. |
| **Short Note** (`36 <= L <= 90` chars, `N <= 4` lines) | `18px` (`1.125rem`) | `24px` (`1.33`) | `0em` | `400` | Balanced medium display size for quick thoughts and short quotes. |
| **Standard Note** (`91 <= L <= 280` chars) | `14px` (`0.875rem`) | `20px` (`1.428`) | `+0.01em` | `400` | High-density reading cadence; fits ~35–42 characters per line inside a `240px` card. |
| **Long Note** (`L > 280` chars or `N > 12` lines) | `14px` (`0.875rem`) | `20px` (`1.428`) | `+0.01em` | `400` | Clamped at `14` lines (`-webkit-line-clamp: 14`) with a subtle bottom fade/ellipsis so one long note never breaks the masonry rhythm. |
| **Expanded `<NoteModal />` Editor** | `16px` (`1.0rem`) | `24px` (`1.50`) | `0em` | `400` | Comfortable, distraction-free writing size when focused. |

### 3.3 Checklist & Chip Typography
- **Checklist Item Text**: `14px`, `line-height: 20px`, `color: var(--text-primary)`.
- **Checked Item Text**: `14px`, `text-decoration: line-through`, `color: var(--text-secondary)`.
- **Label Pill & Domain Chip**: `11px` (`0.6875rem`), `font-weight: 500`, `letter-spacing: 0.015em`, `line-height: 16px`, max-width `160px` (`text-overflow: ellipsis`).

---

## 4. Spatial Geometry, Padding & Masonry Engineering

### 4.1 The Rectangular Note Card (`<NoteCard />`)
Why Google Keep enables **simultaneous viewing of all notes**: every card shares a uniform horizontal footprint while varying vertically in strict `4px` increments.

- **Card Width**:
  - **Masonry Grid Mode**: Fixed `240px` column width (responsive down to `100%` or `2 columns` on mobile viewports `< 600px`).
  - **List View Mode**: Fixed `600px` centered single column (`max-width: calc(100vw - 32px)`).
- **Card Height Constraints**:
  - `min-height: 60px` (even a 1-word note has a clean rectangular presence).
  - `max-height: 380px` for text-only notes (`460px` if an image attachment is present).
- **Border & Corner Radius**:
  - `border-radius: 8px` (exact Material smooth rectangle—not overly pill-shaped, maximizing text area in corners).
  - `border: 1px solid var(--card-border-color)` (on colored notes in light mode, border matches background at rest and darkens by `8%` on hover; in dark mode, subtle `1px solid` muted border).
- **Internal Card Padding (Strict 4px/8px Grid)**:
  - **Body Container Padding**: `12px 16px 12px 16px` (Top `12px`, Right `16px`, Bottom `12px`, Left `16px`).
  - **Label & Source Domain Chips Row**: `padding: 4px 16px 8px 16px`, `gap: 6px`, flex-wrap.
  - **Bottom Hover Action Toolbar**: Height `36px`, `padding: 0 8px 4px 8px`, icons `32px × 32px` circular hit targets (`border-radius: 50%`) with `18px × 18px` SVG strokes (`1.75px` stroke width).

### 4.2 Masonry Bin-Packing Grid (`<MasonryGrid />`)
- **Column Gap & Row Gap**: `16px` horizontal gap between columns, `16px` vertical gap between cards in the same column.
- **Outer Container Padding**: `32px 24px` around the main note canvas; centered horizontally based on how many `240px` columns fit in the available viewport width:
  $$\text{Columns} = \max\left(1, \left\lfloor \frac{W_{\text{viewport}} - W_{\text{sidebar}} - 48}{240 + 16} \right\rfloor\right)$$
- **Placement Algorithm**: Shortest-column-first greedy bin-packing (placing each next card into whichever column currently has the smallest cumulative height $H_c$), recalculating smoothly via `ResizeObserver` + CSS `transform: translate3d(x, y, 0)` with `transition: transform 220ms cubic-bezier(0.2, 0, 0, 1)`.
- **Section Dividers ("PINNED" vs "OTHERS")**:
  - Uppercase section label: `11px`, `font-weight: 500`, `letter-spacing: 0.08em`, `color: var(--text-secondary)`, `margin: 24px 0 8px 16px`.

### 4.3 Quick Capture Bar (`<QuickCaptureBar />`)
- **Dimensions**: `width: 100%`, `max-width: 600px`, `margin: 32px auto 16px auto`.
- **Collapsed State**: Height `46px`, `border-radius: 8px`, `padding: 12px 16px`, placeholder *"Take a note..."* (`15px`, `font-weight: 500`, `color: var(--text-secondary)`), with inline right-side quick buttons for *New Checklist* and *New Image Note*.
- **Elevation**: Resting shadow `0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)` (gives the capture bar tactile floating prominence over the flat masonry cards).
- **Expanded State**: Auto-grows vertically up to `60vh` (internal scroll beyond `60vh`), showing the bottom toolbar with the **Priority Color State Picker (Red/Blue/Black first)**, Label button, and Pin icon on the top-right.

---

## 5. Micro-Interactions, Elevation & Motion Physics

What makes Google Keep feel "alive and buttery smooth":

1. **Card Hover Elevation**:
   - **At Rest**: `box-shadow: none` (flat against canvas, zero visual clutter).
   - **On Hover / Keyboard Focus**:
     - Light Mode: `box-shadow: 0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)`.
     - Dark Mode: `box-shadow: 0 1px 3px 0 rgba(0,0,0,0.60), 0 4px 8px 3px rgba(0,0,0,0.30)`.
   - **Action Bar Reveal**: Transitions from `opacity: 0` to `opacity: 1` over `140ms ease-out`.
   - **Selection Checkmark**: Top-left `-8px, -8px` circular `20px × 20px` checkmark badge scales from `scale(0.8)` and `opacity: 0` to `scale(1)` and `opacity: 1` over `120ms cubic-bezier(0.4, 0, 0.2, 1)`.
2. **Card-to-Modal Shared Element Expansion (`<NoteModal />`)**:
   - Clicking a `<NoteCard />` measures its bounding client rect (`getBoundingClientRect()`) and animates the card's exact position, dimensions, and background color to the centered modal (`width: 600px`, `max-height: 85vh`, `border-radius: 8px`) over `200ms cubic-bezier(0.2, 0, 0, 1)`.
   - The original card in the grid remains as an `opacity: 0` placeholder so the Masonry grid never shifts or jumps while editing.
   - Backdrop scrim fades to `rgba(32, 33, 36, 0.60)` (`backdrop-filter: blur(1px)`).
3. **Color Transition**:
   - Changing a note's color in the picker transitions `background-color` and `border-color` smoothly over `180ms ease-in-out`.

---

## 6. Chrome Extension & Proactive Overlay Design (`<ContextualNoteOverlay />`)

Because Fuse notes **find you when you revisit a website** (e.g., `github.com`), the Chrome Extension UI must feel like a native, calm extension of the Fuse workspace without breaking or clashing with the host website.

### 6.1 Style Isolation (Shadow DOM)
- Mounted inside `<div id="fuse-contextual-root">` with `attachShadow({ mode: 'open' })`.
- Injects a self-contained stylesheet with `:host { all: initial; font-family: 'Inter', Roboto, sans-serif; z-index: 2147483646; }` so host page CSS (like GitHub's markdown styles or Tailwind resets) can never leak in or out.

### 6.2 Proactive Floating Note Widget Geometry
- **Anchor Position**: Fixed to `top: 16px; right: 16px;` (draggable vertically along the right viewport edge; remembers position per domain).
- **Collapsed Pill State (When minimized or >3 notes match)**:
  - Compact calm pill (`height: 36px`, `padding: 0 12px`, `border-radius: 18px`) displaying the Fuse icon, domain name (`github.com`), note count badge (`2 notes`), and small colored priority dots (e.g., a Red `Coral` dot if a serious note is attached to this site).
- **Proactive Expanded Card State (Default on Revisit)**:
  - Renders the actual **rectangular Fuse card** (`width: 280px`, `border-radius: 8px`, `padding: 12px 14px`) using the note's exact background color (`coral`, `storm`, `clay`, `chalk`, etc.).
  - **Priority Sorting**: If multiple notes match `github.com`, **Red (`coral`)** notes stack on top, followed by **Blue (`storm`)**, then **Black (`clay`)**, then secondary colors.
  - **Entrance Animation**: Slides in calmly from `translateX(16px)` and `opacity: 0` to `translateX(0)` and `opacity: 1` over `220ms cubic-bezier(0.16, 1, 0.3, 1)`—never a jarring bounce or screen-blocking modal.
  - **Header Strip inside Overlay Card (`24px` height)**:
    - Left: Favicon + domain chip (`github.com` or `exact path` toggle pill).
    - Right: Inline `+` (add another note for this site), Minimize (`–`), and Snooze for session (`×`).
  - **Inline Editable Body**: Clicking anywhere on the note body inside the overlay lets you edit text or check off checklist items immediately on `github.com`, auto-saving to extension storage in `< 2ms`.

