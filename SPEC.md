---

### 3. `SPEC.md` (Core MVP Functional & UX Specification)

Save this as `SPEC.md` in your project root:

```markdown
# SPEC.md — WordAgents (`v0.1.0`) Core MVP Specification

## 1. MVP Objective
Deliver a self-contained, zero-database, open-source web application that runs locally with a single command (`npm run dev`), allowing a user to turn any text or PDF into a live 40-agent simulation where top breakthroughs surface on **The Board**.

## 2. Functional Requirements

### FR-1: Document Ingestion & Built-In Presets
- **File & Text Support:** Users can paste raw text/Markdown, upload `.txt` / `.md` / `.pdf` files, or select a built-in preset.
- **Mandatory Built-In Presets (Must work with 1 click):**
  1. **Preset 1 (Biomedical Discovery):** A rich, multi-section scientific research text containing latent cross-section links (e.g., cellular metabolism, trace metal transport, thermal protein folding, and oxidative stress across 15+ paragraphs).
  2. **Preset 2 (Ancient Wisdom & Strategy):** A rich philosophical/classical text (e.g., selections from *Genesis* or *The Art of War* across 15+ paragraphs) with deep thematic tensions (`Covenant`, `Exile`, `Mercy`, `Deception`, `Terrain`, `Momentum`).
- **Agent Spawning:** Upon ingestion, extract 35–50 distinct `WordAgent` entities with verbatim `dnaQuotes` and paragraph coordinates within `< 2 seconds`.

### FR-2: Simulation Loop & Controls
- **Play / Pause / Step / Speed Controls:** Users can start, pause, or reset the simulation at any time.
- **High-Speed Collision Tick:** When running, the arena computes hundreds of pairwise vector collisions per second, updating a live telemetry counter (`Total Micro-Interactions`, `Active WordAgents`, `Compound Words Bred`, `Board Signal Rate`).
- **SLM Debate Cadence:** Trigger an SLM debate + Critic evaluation for the highest-scoring unvisited pair every few seconds (throttled cleanly so local Ollama or API rate limits are respected).

### FR-3: The Split-Screen Interface
1. **Top Control Bar:**
   - Document Selector (Upload / Paste / Preset 1 / Preset 2).
   - Simulation Status (`Running` / `Paused`) + Play/Pause toggle.
   - SLM Engine Selector Modal/Popover: Choose `Ollama (Local)`, `Groq / Gemini / OpenAI API Key`, or `Instant Demo Mode`, with model name input.
   - **"WordAgents Cloud Waitlist" CTA Button:** Opens a clean modal explaining the upcoming 10,000-agent cross-library cloud engine with a 1-question high-signal survey (*"What documents or research problems do you want to simulate at scale?"*) + email capture (saved locally/exportable or webhook-ready).
2. **Left Panel — The Swarm Radar (35% Desktop Width):**
   - **Interactive 2D Arena Canvas or Force Grid:** Visually shows the 40+ WordAgents moving, pulsing on collision, and highlighting the current pair in the Debate Chamber.
   - **Agent Inspector:** Clicking any WordAgent badge shows its generation (`Gen 0` vs `Gen 1+ Compound`), energy level, parent words, and exact source `dnaQuotes`.
   - **Live Sub-Threshold Ticker:** Shows a compact scrolling log of collisions that scored `< 7.5` (proving to the user that the Critic Gate is actively filtering noise).
3. **Right Panel — The Discovery Board (65% Desktop Width):**
   - Displays only threads that passed the Critic Gate (`overall >= 7.5`), sorted by score/upvotes or newest breakthroughs.
   - **Thread Card Anatomy:**
     - **Header:** Breaking discovery headline + Surprise Score Badge (e.g., `9.1 / 10`) + Document Distance tag (e.g., `Bridged Para #2 ↔ Para #18`).
     - **Agents Involved:** Visual pills for `[Agent A]` ⚡ `[Agent B]` $\rightarrow$ Births **`[New Compound WordAgent]`**.
     - **The 3-Turn Micro-Debate:** Crisp, readable chat bubbles showing how the two words connected their contexts.
     - **Collapsible Grounding Proof:** Expandable drawer showing the exact verbatim sentences from the uploaded document so the user can verify zero hallucination.
     - **Behavioral Loop Actions:**
       - `🔥 Amplify (+Energy)`: Upvotes the thread and multiplies the collision gravity of `Agent A`, `Agent B`, and their newly bred child agent in future ticks.
       - `✕ Dismiss`: Removes thread from The Board and lowers those agents' energy.
       - `📋 Share / Export Markdown`: Copies a formatted summary card to clipboard for sharing on GitHub/X.

## 3. Verification & Acceptance Criteria
The MVP is complete ONLY when:
1. Project builds cleanly with zero TypeScript/lint compilation errors.
2. Core engine unit/integration tests pass:
   - Spawner extracts `>= 30` valid `WordAgent` objects from a preset text with non-empty `dnaQuotes`.
   - Arena `IgnitionScore` ranks distant, semantically bridged pairs higher than adjacent or identical pairs.
   - Debate + Critic pipeline produces valid `BoardThread` JSON objects and injects newly bred `generation: 1` child agents back into the arena pool.
3. The application starts cleanly and renders the full interactive Simulation & Board UI without requiring any external database installation.

# SLM Integration & Ollama Hyper-Efficiency Specification

## 1. Supported Providers & Hybrid Execution
WordAgents must support a seamless dual-mode execution model:
1. **Local Ollama (Zero Cost, Fully Private):** Connects to `http://localhost:11434`.
2. **Fast Cloud APIs (BYO API Key):** Supports Groq (`llama-3.1-8b-instant` or `llama-3.3-70b-versatile`), Google Gemini (`gemini-2.5-flash`), or OpenAI-compatible endpoints via a user-supplied API key stored securely in browser `localStorage`.
3. **Deterministic Demo Fallback:** If neither Ollama nor an API key is active, a built-in algorithmic template engine simulates realistic debates and scoring using the source text chunks so the app remains 100% functional out-of-the-box.

## 2. Ollama Hyper-Efficiency & Auto-Download Guardrail
To ensure zero friction for developers running `npm run dev`:
- **Model Check on Boot:** On startup, the app pings `http://localhost:11434/api/tags` to check if Ollama is running and which optimized SLMs are installed.
- **Recommended Hyper-Efficient SLM Order:** The app checks availability against this priority list:
  1. `qwen2.5:1.5b` (Recommended default)
  2. `llama3.2:1b` (Ultra-fast fallback)
  3. `gemma2:2b` (Deep reasoning alternative)
- **One-Click Pull UI:** If Ollama is running but the target model is missing, display a clean inline banner: *"Ollama detected, but `qwen2.5:1.5b` is missing. Click to auto-download (~1.1GB)"* with a button that triggers a background pull (`POST /api/chat` or shell hint) with a live progress indicator.
- **Strict JSON Enforcement:** Configure Ollama requests with `format: "json"` and low temperature (`temperature: 0.3` to `0.5`) to guarantee structured 3-turn debate and Critic score outputs without malformed syntax.

