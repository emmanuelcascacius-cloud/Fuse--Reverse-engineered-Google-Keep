# FUSE — Product & Engineering Specification (`spec.md`)

> **AGENT DIRECTIVE (READ FIRST):**
> You are an autonomous coding and planning agent. Read this `spec.md` carefully from start to finish.
>
> 1. **Your Immediate Task:** Break down the entire **Fuse V1** specification into sequential, atomic, single-task **GitHub Issues** from start to finish.
>
> 2. **Granularity Rule:** Every GitHub Issue must represent **one clear, testable engineering task** with explicit acceptance criteria, dependencies, and file scope, and specific tests and linters for it.
>
> 3. **Author `skills.md` as Core Infrastructure:** Personal Intelligence in Fuse is driven by `skills.md` (Section 3). You must create dedicated issues to write and wire `skills.md` for both the internal backend LLM worker and external MCP/Plugin connections.
>
> 4. **STRICT V1 vs. V2 LOCK:** V2 is documented in Section 7 for context only. **DO NOT generate code or build issues for V2 until the user explicitly states: `"We are shipping V2."`** Right now, we are shipping **Fuse V1** to beta users.

## 1. Product Intent: The Smallest Proactive OS Ever Built

**Fuse** is a proactive atomic operating system. In our product experience and interface, **we never say "AI" and we never say "Agent."** There are no chatboxes, no prompt windows, and no text blobs. Fuse is a pure, silent loop from **raw human thoughts** to **one finished deliverable**.

### Core Product Hierarchy

1. **Primary Surface — The Living Black Widget ("The Smallest OS"):**

   * A pure black, windowless micro-surface with living icons that the user wakes up to or glances at throughout the day.

   * **The "One Thing" Rule:** The widget strictly renders **one living icon at a time**. If multiple deliverables or woken notes are queued, the user simply **flips/swipes left or right** on the widget to cycle through them.

2. **Input Surface — Reverse-Engineered Google Keep App:**

   * Where the user writes raw thoughts, brainstorms, reminders, or anything on their mind onto flat cards with zero friction.

3. **Desktop Surface — Bidirectional Browser Extension:**

   * Reverses Google Keep's one-way pipe into a two-way valve ($\text{App} \leftrightarrow \text{Browser}$) so relevant notes and deliverables ambush the user inside active browser tabs. the notes is a complete reverse engineered Google keep with our features.

## 2. The Living Black Widget (Core Interface & Engineering Rules)

The widget is the heart of Fuse. Because Fuse forbids conversational text blobs, **widget engineering must be ultra-crisp, tactile, and alive.**

### 2.1 Visual, Physics & Interaction Rules

* **Pure Obsidian Minimalism:** Deep pitch-black canvas (`#000000` to `#0A0A0A`), high-contrast vector glyphs, and zero text paragraphs.

* **60/120fps Float & Spring Physics:** Each living icon breathes and floats using damped harmonic spring physics when idle, and pulses kinetically when a new deliverable arrives.

* **Single-Icon Flip Queue:** Displays **1 icon at a time**. after tapping the icon ,Swiping/flipping left or right smoothly transitions to the next queued item. Tapping the active icon opens its deliverable immediately.

### 2.2 The Four Widget Deliverable Types

| Deliverable Type | Source Engine | Widget Living Icon | 1-Tap Action | 
| ----- | ----- | ----- | ----- | 
| **1. Interactive Artifact** | **Fuse Backend Personal Intelligence ONLY** (via internal `skills.md` + LLM API) | Glowing cube / spark / visual canvas glyph | Opens the working micro-app or interactive HTML visual page directly inside Fuse | 
| **2. External Report or Link** | **Claude (MCP) or ChatGPT (Plugin)** (via external `skills.md` + user chat/note memory) | Crisp document (`report.md`) or PR branch / link glyph | Opens the clean `report.md`, visual page, or launches directly into the external link (e.g., GitHub PR review) | 
| **3. Automation Pulse Report** | **Inline Note Automation Runner** (e.g., `"Every 6 pm search trending news on X"`) | Monochrome radar / pulse glyph | Opens a scannable flat report card | 
| **4. Woken Note**  | **Inline Time or Behavioral Trigger** (`6 PM`, `On a call`, `Open GitHub`, `#label`) | Floating note glyph tinted with the card's muted color | Opens that exact flat note in focus view | 

## 3. Where Personal Intelligence Comes From: `skills.md` & The Pipe

Personal Intelligence is **not** a vague buzzword and it is **separate from deterministic wake-up triggers/reminders**.

### 3.1 What Personal Intelligence Actually Is

* **Personal Intelligence = `skills.md` + Raw Thought Stream:**
  At the backend, Personal Intelligence is a collection of hyper-concise, deterministic execution instructions and tool definitions stored in **`skills.md` (The Fuse Skills Library)**.

* When Fuse passes a user's written notes/thoughts (not limited to app ideas—*anything* the user writes in notes) to an LLM API call, **`skills.md` instructs the model how to read unspoken intent, select tools, execute a task silently in the background, and output strictly ONE tangible deliverable** without ever asking the user a follow-up question.

* Fuse always attempts to resolve and hand the user **one finished thing** from its own Personal Intelligence (`skills.md`) before relying on external chat sessions.

### 3.2 Strict Deliverable Boundary: Backend Intelligence vs. External Models

1. **Fuse Backend Personal Intelligence (Builds Full Artifacts):**

   * Powered by internal `skills.md` + backend LLM API calls.

   * Reads the user's flat note stream (ideas, thoughts, problems, studies).

   * **Exclusive Power:** Only Fuse's backend Personal Intelligence can generate and host **sandboxed interactive App Artifacts** (working micro-apps, interactive HTML simulations) that launch on 1-tap from the widget.

2. **External Connected Models — Claude MCP & ChatGPT Plugin (Delivers `report.md`, Visual Pages, or Links):**

   * Connects to the user's existing Claude or ChatGPT workspace via **Fuse MCP Server** and **ChatGPT Plugin**, governed by an external `skills.md` file.

   * Uses both the user's Fuse notes and the memory/tasks from their ongoing chats (e.g., the user asked Claude to rewrite a full essay book, discussed a science experiment, or worked on a codebase).

   * **Strict Output Rule:** External models cannot push raw chat blobs. They can only hand the Fuse Widget **a structured `report.md`**, **a visual HTML representation page** (e.g., illustrating the science experiment they discussed), or **a direct actionable Link** (e.g., a GitHub PR ready for review).

### 3.3 Core V1 `skills.md` Library

The coding agent must write `packages/skills/skills.md` containing three foundational skills:

* **`Skill 01: Thought-to-Artifact` (Internal Backend Only):** Reads raw user notes/thoughts and compiles a self-contained, single-file interactive HTML/JS/React micro-app or tool overnight.

* **`Skill 02: Visual-Representation & Report-Bridge` (Internal & MCP/Plugin):** Converts a completed background task, book/essay rewrite, science concept, or code analysis into either a clean `report.md`, a visual HTML page, or a direct PR review link.

* **`Skill 03: Scheduled-Pulse-Report` (Automation Worker):** Executes recurring inline note automations (e.g., `"Every 6 pm search trending news on X"`) and formats a zero-noise report card.

## 4. Reverse-Engineered Google Keep (The Flat Note App)

We reverse-engineer Google Keep's cognitive speed, keeping notes completely flat while adding inline triggers and bidirectional browser capture.

### 4.1 Locked Core Note Mechanics

1. **Zero-Title Entry:** Opening the app immediately places the cursor in a new note body. Users never name a file or title a note before typing a thought.

2. **Spatial Scan Grid (15–20 Notes):** Multi-column Masonry grid displaying the bodies of 15–20 flat notes on one screen so eyes scan shapes and lengths, not title lists.

3. **Color as Emotional Bandwidth:** 8–10 muted card colors tag mood or urgency peripherally in $< 500\text{ ms}$.

4. **Flat Sticker Labels:** Non-exclusive `#labels` (`#product`, `#idea`) slap onto cards like stickers with 1-tap filtering and zero folders.

### 4.2 Evolved Keep Upgrades (Deterministic Triggers & Valve)

* **Principle 1 — Two-Way Capture (Reverse the Extension Valve):**
  Bidirectional browser pipe ($\text{App} \leftrightarrow \text{Browser}$). Clips web selections into Fuse with zero title, and ambushes the user inside active tabs (`github.com`, `x.com`) when a matching note or deliverable wakes up.

* **Principle 2 — Chatless Inline Wake-Ups & Automations:**
  Typed directly inside the flat note body (separate from Personal Intelligence artifact generation):

  * *Behavioral Wake-Ups:* `"Wake this note up next time I open GitHub"`, `"Wake up when I'm on a call"`, `"Wake up next time I write a note with the #product label"`.

  * *Time Wake-Ups:* `"Wake this note up at 6pm every day"`, `"Wake this note up at night"`.

  * *Inline Automations:* `"Every 6 pm search trending news on X"`.

## 5. V1 Platform Matrix & Data Schema

| Surface | Locked V1 Deliverables | 
| ----- | ----- | 
| **Android** | Native Flat-Note App + **Living Black OS Widget** (Home screen + floating pill, single-icon view with left/right flip queue) | 
| **iOS** | Native Flat-Note App + **WidgetKit & Live Activities / Proactive Notifications** (1-tap launch into deliverable) | 
| **Browser Extension** | Manifest V3 Extension: 1-click capture + **Reverse Valve** tab ambush overlay | 
| **Backend & `skills.md`** | Real-time Sync DB, Inline Trigger Engine, **`skills.md` Personal Intelligence Worker**, **Claude MCP Server**, **ChatGPT Plugin API** | 

### Core Entities

```
NoteCard {
  id: UUID
  body: String                  // Raw thought; no mandatory title
  color_token: Enum(8..10)      // Muted emotional bandwidth palette
  stickers: Array<String>       // Flat non-exclusive #labels
  triggers: Array<TriggerRule>  // Deterministic time/behavioral/automation rules
  created_at: Timestamp
  updated_at: Timestamp
}

TriggerRule {
  id: UUID
  note_id: UUID
  type: Enum(TEMPORAL, BEHAVIORAL_URL, BEHAVIORAL_CALL, BEHAVIORAL_STICKER, INLINE_AUTOMATION)
  expression: String            // e.g., "0 18 * * *", "domain:github.com", "label:#product"
  status: Enum(ARMED, FIRED, SNOOZED)
}

WidgetSignal {
  id: UUID
  queue_index: Integer          // Supports left/right flip navigation on the widget
  source: Enum(INTERNAL_INTELLIGENCE, EXTERNAL_MCP_PLUGIN, INLINE_AUTOMATION, NOTE_TRIGGER)
  deliverable_type: Enum(INTERACTIVE_ARTIFACT, REPORT_MD, VISUAL_HTML, EXTERNAL_LINK, WOKEN_NOTE)
  icon_state: Enum(ARTIFACT_SPARK, REPORT_GLYPH, LINK_PR_GLYPH, RADAR_PULSE, NOTE_TINT)
  payload_content_or_url: String // Sandboxed HTML/App bundle, report.md body, external PR URL, or note_id
  consumed_at: Timestamp?
}

```

## 6. Coding Agent Plan: Start-to-Finish V1 GitHub Issues

Generate **atomic, single-task GitHub Issues** in this exact 6-phase order:

### Phase 1: Foundation & Reverse-Engineered Keep App

* `Issue 1.1`: Initialize monorepo (`apps/mobile`, `apps/extension`, `packages/backend`, `packages/mcp-plugin`, `packages/skills`).

* `Issue 1.2`: Implement `NoteCard`, `TriggerRule`, and `WidgetSignal` schema + real-time WebSocket sync queue.

* `Issue 1.3`: Build **Zero-Title Entry** note composer (launch app = immediate cursor focus in body).

* `Issue 1.4`: Build **Spatial Scan Masonry Grid** rendering 15–20 note bodies simultaneously for different screens

* `Issue 1.5`: Build **8–10 Muted Color Bandwidth Picker** with $< 500\text{ ms}$ card tinting.

* `Issue 1.6`: Build **Flat Sticker Labels** (`#label` inline parser, sticker pills, 1-tap filter bar).

### Phase 2: Deterministic Inline Triggers & Automations

* `Issue 2.1`: Build inline natural-language parser detecting `"wake this note up..."` and `"every [time]..."` inside flat notes.

* `Issue 2.2`: Build Temporal Wake Scheduler (`6pm every day`, `at night`) pushing `WOKEN_NOTE` signals to the widget queue.

* `Issue 2.3`: Build Behavioral Matcher (`on a call`, `open GitHub`, `#label` write trigger).

* `Issue 2.4`: Build Inline Automation Runner (`"Every 6 pm search trending news on X"`) generating clean pulse report cards.

### Phase 3: `skills.md`, Personal Intelligence & MCP/Plugin Pipe

* `Issue 3.1`: Author `packages/skills/skills.md`—defining the hyper-concise system prompts, proactive rules, and tool schemas for `Thought-to-Artifact`, `Visual-Representation`, and `Report-Bridge`.

* `Issue 3.2`: Build the **Fuse Backend Personal Intelligence Worker** that reads unprompted user thoughts/notes, applies `skills.md`, and generates **single-file Interactive Artifacts** (micro-apps / visual HTML).

* `Issue 3.3`: Build the **Fuse Claude MCP Server** exposing note/memory resources and tools (`push_report_md`, `push_visual_page`, `push_external_link`) governed by `skills.md`.

* `Issue 3.4`: Build the **Fuse ChatGPT Plugin / OpenAPI Actions** mirroring the MCP deliverable endpoints (`report.md`, visual page, or PR/external link).

* `Issue 3.5`: Build the **Strict Deliverable Gatekeeper**—enforces that internal intelligence outputs interactive artifacts while external models output only `report.md`, visual HTML pages, or actionable links (dropping all conversational text blobs).

### Phase 4: The Living Black Widget ("The Smallest OS")

* `Issue 4.1`: Build the **Living Black Widget Canvas** (`#000000` surface, zero-text constraint, 60/120fps spring-float icon physics).

* `Issue 4.2`: Build the **Single-Icon Flip Queue Controller**—renders strictly one living icon at a time and when the icon is typed cycles through queued signals on left/right swipe.

* `Issue 4.3`: Build **Android Native Widget & Floating Black Pill** with 1-tap routing to Artifact Viewer, `report.md` sheet, external URL, or flat note.

* `Issue 4.4`: Build **iOS WidgetKit, Live Activities & Proactive Notification Bridge** with 1-tap deliverable routing.

* `Issue 4.5`: Build the **In-App Deliverable Viewer** (sandboxed full-screen runner for interactive artifacts/visual HTML + crisp markdown reader for `report.md`).

### Phase 5: Two-Way Browser Extension (Reverse Valve)

* `Issue 5.1`: Build Manifest V3 extension for 1-click zero-title web capture into the flat note grid.

* `Issue 5.2`: Build the **Reverse Valve Content Script**—ambushes the user inside matching tabs (`github.com`, `x.com`) with a minimalist black floating icon when a note or PR link wakes up.

### Phase 6: End-to-End Verification

* `Issue 6.1`: E2E verification of all 4 zero-chat loops: (1) Raw thought $\rightarrow$ `skills.md` Backend Artifact, (2) Claude/ChatGPT MCP $\rightarrow$ `report.md` / PR Link, (3) 6 PM X Automation $\rightarrow$ Pulse Report, and (4) Behavioral/Time Trigger $\rightarrow$ Woken Note on the single-icon flip widget.

## 7. Fuse V2 Roadmap (LOCKED — DO NOT BUILD YET)

> **HARD GUARDRAIL:** Do **NOT** create GitHub issues or write code for V2 until the user explicitly commands: **`"We are shipping V2."`**

1. **Fuse Custom OS Keyboard ("The Words"):** System-wide mobile keyboard capturing user writing and implicit intent across all apps.

2. **Meta & Muse Hardware Plugins:** Native wearable integrations for ambient audio and neural state triggers.

3. **Open Fuse `skills.md` Marketplace:** Public library for third-party developers to publish strictly proactive skills that output to the Living Black Widget.