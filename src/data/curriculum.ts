export type Difficulty = "foundational" | "intermediate" | "advanced";

export interface Topic {
  id: string;
  title: string;
  shortDesc: string;
  difficulty: Difficulty;
  readTimeMin: number;
  keyPoints: string[];
  content: string; // placeholder — fill content here
  codeExample?: {
    language: string;
    filename: string;
    code: string;
  };
  tags: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

export interface Domain {
  id: "frontend" | "backend" | "infrastructure" | "devops";
  title: string;
  tagline: string;
  description: string;
  color: string; // accent color class
  iconName: string; // lucide-react icon name
  topics: Topic[];
  modules: Module[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CURRICULUM DATA
// ─────────────────────────────────────────────────────────────────────────────

export const curriculumData: Domain[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // FRONTEND
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "frontend",
    title: "Frontend",
    tagline: "From browser pixels to production apps",
    description: "Deep dive into web engines, modern language runtimes, UI architecture patterns, dynamic rendering strategies, and build pipelines.",
    color: "cyan",
    iconName: "Layout",
    topics: [],
    modules: [
      {
        id: "fe-browser",
        title: "How Browsers Work",
        description: "The internals of rendering engines, JavaScript runtimes, and sandboxing models that run every web page.",
        topics: [
          {
            id: "fe-crp",
            title: "The Critical Rendering Path",
            shortDesc: "How raw HTML bytes become visible pixels — parsing, layout, paint, and composite explained.",
            difficulty: "foundational",
            readTimeMin: 8,
            keyPoints: [
              "HTML tokenization and DOM tree assembly from the byte stream.",
              "CSS parsing into CSSOM — selector specificity and cascade resolution.",
              "Render Tree construction — combining DOM + CSSOM, excluding invisible nodes.",
              "Layout (Reflow): computing geometry (x, y, width, height) for every render object.",
              "Paint: generating draw commands (fill, stroke, text) for each layer.",
              "Composite: GPU-accelerated blending of independent layers — why `transform` and `opacity` are cheap.",
            ],
            content: `## Why This Matters (Read This First)

Imagine you type a URL into your browser and press Enter. Between that moment and seeing the page on your screen, your browser runs a factory assembly line with 6 stations. Each station has a specific job, and the fastest factory wins — because users leave if a page takes more than 3 seconds to load.

This assembly line is called the **Critical Rendering Path (CRP)**. Understanding it is the difference between "it works" and "it works fast." Google measures your CRP performance with **Core Web Vitals** (LCP, FCP, CLS) — these affect your SEO ranking directly.

In this article, I will explain every step of the CRP in plain language. Every technical term (and there are many) will be defined the first time we encounter it. By the end, you will understand exactly what your browser does to turn code into pixels.

---

## What Is the Critical Rendering Path?

The **Critical Rendering Path (CRP)** is the sequence of 6 steps the browser follows to convert HTML, CSS, and JavaScript into pixels on your screen:

\`\`\`
Bytes → DOM → CSSOM → Render Tree → Layout → Paint → Composite → Pixels
\`\`\`

Each step depends on the one before it. The browser cannot skip any step. If a step is slow, every step after it is delayed. Our job as developers is to make each step as fast as possible.

Here is a 1-sentence summary of each step, so you know where we are going:

| Step | What Happens | Keyword |
|------|-------------|---------|
| **1. DOM** | Browser reads HTML and builds a tree of elements | "Parsing" |
| **2. CSSOM** | Browser reads CSS and builds a style tree | "Cascade" |
| **3. Render Tree** | Merge DOM + CSSOM into a tree of visible things | "Visibility" |
| **4. Layout** | Calculate x, y, width, height for every visible thing | "Geometry" |
| **5. Paint** | Draw pixels for each thing (colors, text, images) | "Drawing" |
| **6. Composite** | Blend layers together on the GPU | "Layers" |

Now let's go through each step in detail.

---

## Step 1: DOM Construction — How Your Browser Reads HTML

### What Is Parsing?

When your browser receives HTML from the server, it receives raw **bytes** (1s and 0s). Before the browser can do anything useful, it must convert those bytes into a structure it understands. This conversion is called **parsing**.

Parsing happens in 4 phases:

**Phase 1: Bytes → Characters**
The browser looks at the HTTP response headers to find the **encoding** (usually UTF-8 or Shift_JIS). Using that encoding, it converts the raw bytes into readable characters.

\`\`\`
01001000 01010100 01001101 01001100  →  "H"  "T"  "M"  "L"
\`\`\`

**Phase 2: Characters → Tokens**
A **tokenizer** (also called a **lexer**) reads characters one at a time and groups them into meaningful chunks called **tokens**. Think of tokens as lego bricks — each brick has a type and some data.

For example, the HTML text \`<html lang="en">\` is broken into these tokens:

\`\`\`
START_TAG:html
ATTR_NAME:lang
ATTR_VALUE:en
SELF_CLOSING:false
\`\`\`

**Phase 3: Tokens → Nodes**
Each token becomes a **node** in a tree. A \`START_TAG:html\` token creates an "element node" named \`html\`. Text between tags becomes a "text node."

**Phase 4: Nodes → Tree**
Nodes are organized into a tree structure called the **Document Object Model (DOM)**. The tree reflects the nesting of your HTML tags. A parent node contains child nodes.

\`\`\`
HTML source:
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>Hello</h1>
    <p>World</p>
  </body>
</html>

Becomes this DOM tree:

            document
               │
             html
           ╱      ╲
        head      body
         │       ╱    ╲
       title    h1     p
         │      │      │
     "My Page" "Hello" "World"
\`\`\`

### Key Point: The Parser Is Streaming

The HTML parser does **not** wait for the entire HTML file to download. It starts working immediately as data arrives from the network. This is called **incremental parsing**.

This is important because it means the browser can start discovering resources (CSS files, images, scripts) early, even before the full HTML has been received.

### The Preload Scanner

The browser has a special lightweight parser called the **preload scanner**. Its only job is to scan ahead of the main parser and look for URLs it should start downloading NOW.

The preload scanner looks for:
- \`<img src="...">\` → starts downloading the image
- \`<link rel="stylesheet" href="...">\` → starts downloading the CSS
- \`<script src="...">\` with async or defer → starts downloading the script
- \`<link rel="preload" href="...">\` → explicitly tells the preload scanner to fetch

This is why putting \`<link rel="preload">\` in your \`<head>\` helps performance — the preload scanner sees it immediately.

### The Script Blocking Problem (Very Important!)

When the main parser encounters a \`<script>\` tag without \`async\` or \`defer\`, it **stops everything**:

\`\`\`html
<!-- The parser STOPS here -->
<script src="analytics.js"></script>
<!-- Parser does NOT continue until the script is downloaded and executed -->
<div>This content is delayed</div>
\`\`\`

**Why does the parser stop?**

Because JavaScript can modify the DOM. Consider this:

\`\`\`javascript
// Inside analytics.js
document.write('<div>I just injected this!</div>');
\`\`\`

If the parser didn't stop, it would have already processed the rest of the HTML, and the injected \`<div>\` would appear in the wrong place. So the parser must pause, let the script run, and then continue.

**The solution:** Use \`async\` or \`defer\` to tell the browser: "Don't stop the parser for this script."

| Attribute | Blocks Parser? | When Does It Execute? | Use This When... |
|-----------|---------------|----------------------|------------------|
| (none) | Yes | Immediately when downloaded | Legacy scripts that must run synchronously |
| \`defer\` | No | After HTML is fully parsed, before \`DOMContentLoaded\` event | Most scripts — preserves execution order |
| \`async\` | No | As soon as it's downloaded (could be before or after HTML finishes) | Independent scripts like analytics, ads |
| \`type="module"\` | No | Automatically deferred (like \`defer\`) | Modern ES module code |

**Real-world impact:** A render-blocking script in \`<head>\` can delay your page by 1-2 seconds on a slow network. Simply moving your scripts to the end of \`<body>\` or adding \`defer\` is one of the highest-impact performance fixes you can make.

---

## Step 2: CSSOM Construction — How Your Browser Reads CSS

### What Is CSSOM?

The **CSS Object Model (CSSOM)** is a tree representation of all CSS rules on your page. It is the CSS equivalent of the DOM.

Just like HTML is parsed into the DOM, CSS is parsed into the CSSOM:

\`\`\`css
/* CSS source */
body {
  font-size: 16px;
  color: #333;
}
h1 {
  font-size: 2rem;
  color: blue;
}
\`\`\`

Becomes this CSSOM tree:

\`\`\`
style sheet
  ├── rule: body
  │     ├── font-size: 16px
  │     └── color: #333
  ├── rule: h1
  │     ├── font-size: 2rem
  │     └── color: blue
  └── rule: .highlight
        └── color: yellow
\`\`\`

### The Cascade — What Does "Cascade" Mean?

The word **cascade** refers to the algorithm the browser uses to decide which CSS rule wins when multiple rules target the same element.

The cascade uses 3 factors, in this order:

**Factor 1: Origin** — Where does the style come from?

| Origin | Priority | Example |
|--------|----------|---------|
| Browser defaults (user agent) | Lowest | Default link color (blue, underlined) |
| User styles | Low | User's browser settings (custom font size) |
| Author styles (your CSS) | High | Everything in your stylesheets |
| \`!important\` | Highest | Overrides everything |

**Factor 2: Specificity** — How specific is the selector?

Specificity is a scoring system. Each selector type has a point value:

| Selector Type | Points | Example |
|--------------|--------|---------|
| Inline style (in HTML \`style\` attribute) | 1000 | \`<div style="color: red">\` |
| ID selector | 100 | \`#header\` |
| Class, attribute, pseudo-class | 10 | \`.nav\`, \`[type="text"]\`, \`:hover\` |
| Element, pseudo-element | 1 | \`div\`, \`p\`, \`::before\` |

You calculate specificity by writing it as a 3-number code: (IDs, Classes, Elements)

\`\`\`
p          → (0, 0, 1)
.text      → (0, 1, 0)
p.text     → (0, 1, 1)
#header    → (1, 0, 0)
#header p  → (1, 0, 1)
\`\`\`

Higher specificity wins. If specificity is equal...

**Factor 3: Source Order** — The rule declared LAST in the CSS wins.

Example:

\`\`\`css
/* (0, 0, 1) — specificity: element */
p { color: red; }

/* (0, 1, 0) — specificity: class — WINS over element */
.text { color: blue; }

/* (0, 1, 1) — specificity: class + element — WINS over class alone */
p.text { color: green; }

/* For <p class="text">: color is green (0, 1, 1 > 0, 1, 0 > 0, 0, 1) */
\`\`\`

### Why CSSOM Blocks Rendering

Here is a critical fact: **The browser will NOT render a single pixel until the CSSOM is built.**

Why? Because the browser doesn't know the final style of any element without the CSSOM. Consider this HTML:

\`\`\`html
<div>Hello</div>
\`\`\`

Without the CSSOM, the browser doesn't know:
- What color is the text? (CSS: \`color\`)
- How big is the text? (CSS: \`font-size\`)
- Is it a block or inline? (CSS: \`display\`)
- What is the background? (CSS: \`background\`)
- How wide is it? (CSS: \`width\` — defaults to 100% for block elements)

All of these are needed before the browser can draw anything. So it waits for the CSSOM.

**Practical tip:** Only the CSS needed for the **above-the-fold content** (what the user sees first without scrolling) should block rendering. You can defer non-critical CSS:

\`\`\`html
<!-- Critical CSS: blocks rendering — needed for first view -->
<link rel="stylesheet" href="critical.css">

<!-- Non-critical CSS: does NOT block rendering -->
<link rel="stylesheet" href="non-critical.css" media="print"
      onload="this.media='all'">
\`\`\`

The \`media="print"\` trick works because the browser thinks this stylesheet is for printing (not for the screen), so it does NOT block rendering. After the stylesheet loads, the \`onload\` handler changes the media to \`all\`, applying the styles.

---

## Step 3: Render Tree Construction — Combining DOM and CSSOM

The **Render Tree** is the result of combining the DOM and CSSOM. It contains only **visible** elements.

\`\`\`
DOM:                         CSSOM:
html                          body { display: block; font-size: 16px }
├── head (hidden)             h1 { display: block; font-size: 2rem }
├── body                      img { display: inline }
│     ├── h1 "Title"          .hidden { display: none }
│     ├── p "Text"
│     └── img (src="photo.jpg")

              ↓

Render Tree (visible only):
html (block)
└── body (block, font-size: 16px)
      ├── h1 (block, font-size: 2rem) "Title"
      ├── p (block) "Text"
      └── img (inline) [image]
\`\`\`

### What Gets Excluded?

| Rule | Example | Included in Render Tree? |
|------|---------|--------------------------|
| \`display: none\` | \`<div style="display: none">\` | No — creates no box at all |
| \`visibility: hidden\` | \`<div style="visibility: hidden">\` | Yes — creates a box, but it's invisible |
| \`<head>\` and children | \`<title>\`, \`<meta>\`, \`<link>\` | No — never visible |
| \`::before\` and \`::after\` | Pseudo-elements | Yes — they create boxes |
| \`<script>\` | \`<script>\` | No — scripts are not visual elements |

**Important:** \`display: none\` is different from \`visibility: hidden\`:
- \`display: none\` → Element is removed from the Render Tree entirely. It takes up NO space.
- \`visibility: hidden\` → Element IS in the Render Tree. It takes up space, but you can't see it.

---

## Step 4: Layout (Also Called Reflow)

**Layout** (or **reflow**) is the process of calculating the exact position and size of every Render Tree node.

After Step 3, the browser knows what elements exist and what their styles are. But it doesn't know WHERE they go or HOW BIG they are. Layout answers those questions.

### How Layout Works — The Two-Pass Algorithm

The layout algorithm makes two passes through the Render Tree:

**Pass 1 (Widths):** Starting from the top (\`<html>\`), each element calculates its width based on its parent's width. For example, a \`<div>\` with \`width: 50%\` inside a 1000px parent gets \`width: 500px\`.

**Pass 2 (Heights and Positions):** Again starting from the top, each element calculates its height and position. Block elements stack vertically. Inline elements flow horizontally.

\`\`\`
Layout result for a simple page:
┌───────────────────────────────────────────┐
│ html: x=0, y=0, w=1280, h=720            │
│                                           │
│  ├─ body: x=8, y=8, w=1264, h=704        │
│  │                                       │
│  │  ├─ h1: x=8, y=8, w=1264, h=48       │
│  │  │  "Critical Rendering Path"         │
│  │  │                                    │
│  │  ├─ p: x=8, y=64, w=1264, h=24       │
│  │  │  "Step 1: DOM Construction"        │
│  │  │                                    │
│  │  └─ img: x=8, y=96, w=200, h=150     │
└───────────────────────────────────────────┘
\`\`\`

### What Triggers Layout?

Any change to the GEOMETRY of an element triggers layout. This is EXPENSIVE because layout changes can cascade — changing one element's width might affect its parent, siblings, and children.

| CSS Property | Triggers Layout? | Why |
|-------------|-----------------|-----|
| \`width\`, \`height\` | Yes | Changes the box dimensions |
| \`padding\`, \`margin\`, \`border\` | Yes | Changes the box dimensions |
| \`display\`, \`position\`, \`float\` | Yes | Changes the layout mode entirely |
| \`font-size\` | Yes | Changes text size, which affects element height |
| \`top\`, \`left\`, \`right\`, \`bottom\` | Yes (for positioned elements) | Changes position |
| \`transform\` | No | Only compositing — stays on its own layer |
| \`opacity\` | No | Only compositing |
| \`color\` | No | Only paint (re-draw text color) |
| \`background-color\` | No | Only paint (re-draw background) |
| \`box-shadow\` | No | Only paint (re-draw shadow) |

### Layout Thrashing — The Most Common Performance Bug

**Layout thrashing** happens when JavaScript forces the browser to recalculate layout over and over in a loop.

Here is what happens step by step:

\`\`\`javascript
elements.forEach((el, i) => {
  // Step A: READ the height
  const h = el.offsetHeight;  // Forces layout NOW

  // Step B: WRITE a new height
  el.style.height = (h + 10) + 'px';  // Invalidates layout (marks it dirty)

  // On the next iteration, Step A forces layout AGAIN
  // because Step B invalidated it
});
\`\`\`

**Why is this bad?** The browser's layout engine works in batches:
1. When you WRITE a style (like \`el.style.height\`), the browser marks layout as "dirty" but does NOT run layout yet. It waits in case you have more changes.
2. When you READ a layout value (like \`el.offsetHeight\`), the browser MUST return the CURRENT value. If layout is dirty, it must run layout immediately to give you an accurate number.

So the pattern READ → WRITE → READ → WRITE forces layout to run on EVERY iteration of the loop.

**The fix: Batch your reads and writes**

\`\`\`javascript
// PASS 1: Read ALL values first (browser runs layout ONCE)
const heights = elements.map(el => el.offsetHeight);

// PASS 2: Write ALL changes (browser invalidates layout ONCE)
elements.forEach((el, i) => {
  el.style.height = (heights[i] + 10) + 'px';
});

// Layout runs ONE TIME before the next paint
\`\`\`

### The 16.6ms Frame Budget

Your screen refreshes 60 times per second (60fps). That means the browser has **16.6 milliseconds** to complete all 6 CRP steps for each frame. If your layout step takes 30ms, you have already exceeded the budget, and the frame is **dropped** — the user sees a stutter or "jank."

This is why avoiding unnecessary layout is so important. A full-page reflow on a page with 5,000 DOM nodes can take 10-50ms — that's 1-3 missed frames.

---

## Step 5: Paint

**Paint** converts each Render Tree node into a list of drawing commands. These commands are stored in a **display list** — think of it as a recipe book that can be reused later.

\`\`\`
Display list for "Hello World" page:
1. FILL rectangle (x=0, y=0, w=1280, h=720) with color #030712
2. FILL rectangle (x=8, y=8, w=1264, h=48) with color #ffffff
3. DRAW TEXT "Critical Rendering Path" at (x=8, y=30)
   with font Outfit 32px, color #f3f4f6
4. FILL rectangle (x=8, y=64, w=1264, h=24) with color #ffffff
5. DRAW TEXT "Step 1: DOM Construction" at (x=8, y=82)
   with font Outfit 16px, color #9ca3af
\`\`\`

### What Makes Paint Expensive?

| Property | Paint Cost | Why |
|----------|-----------|-----|
| \`color\` | Cheap | Just changes text color |
| \`background-color\` | Cheap | Just fills a rectangle |
| \`border-radius\` | Medium | Requires clipping calculations |
| \`box-shadow\` | **Expensive** | Multiple blurred layers overlaid |
| \`text-shadow\` | **Expensive** | Similar to box-shadow but for text |
| \`gradient\` | **Expensive** | Per-pixel color calculations |
| \`SVG filters\` | **Very Expensive** | Complex per-pixel operations |

### Paint-Only Properties

These CSS properties trigger ONLY paint (and then composite). They do NOT trigger layout:

\`\`\`css
/* These trigger Paint + Composite — no Layout */
color
background-color
border-color
border-radius
outline
box-shadow
text-shadow
\`\`\`

---

## Step 6: Compositing — The GPU Step

**Compositing** is the final step. The browser takes all painted **layers** and blends them together on the **GPU (Graphics Processing Unit)**.

### What Is a Layer?

A **layer** is an independent surface that the browser paints separately. Each layer gets its own **GPU texture** (a bitmap stored in GPU memory).

Layers are created automatically when the browser detects:

| Condition | Example |
|-----------|---------|
| \`position: fixed\` or \`sticky\` | Fixed header |
| CSS animations using \`transform\` or \`opacity\` | Animated element |
| \`<video>\` or \`<canvas>\` element | Video player |
| \`will-change: transform\` | Explicit hint to promote to layer |

### Why \`transform\` and \`opacity\` Are Magic

Here is the key insight: When an element is on its own layer, changing ONLY its \`transform\` (position) or \`opacity\` (transparency) does NOT require layout or paint. The browser simply tells the GPU: "Move this texture 100px to the right."

\`\`\`css
/* BAD: Animating 'left' triggers Layout + Paint + Composite */
/* The browser must recalculate geometry, repaint the element, then composite */
.box {
  animation: slide-bad 1s;
}
@keyframes slide-bad {
  from { left: 0; }
  to   { left: 100px; }
}

/* GOOD: Animating 'transform' triggers ONLY Composite */
/* The element is on its own GPU layer — just reposition */
.box {
  animation: slide-good 1s;
}
@keyframes slide-good {
  from { transform: translateX(0); }
  to   { transform: translateX(100px); }
}
\`\`\`

### The Layer Trade-off

Layers are powerful but NOT free:

- Each layer consumes GPU memory (typically 1-4 MB per layer at 1280x720)
- Mobile devices have limited GPU memory (128-256 MB total)
- Creating too many layers can cause the browser to run out of GPU memory and fall back to CPU rendering (much slower)

**Rule of thumb:** Only promote elements to layers (using \`will-change\`) when they actually animate. Do NOT use \`will-change: transform\` on every element "just in case."

---

## Putting It All Together — Optimization Strategies

Here is a table of optimizations for each CRP step, sorted by impact:

| Step | Optimization | Expected Impact | Difficulty |
|------|-------------|-----------------|------------|
| 1. DOM | Use \`defer\` on scripts, move them to end of \`<body>\` | 500-2000ms LCP improvement | Easy |
| 2. CSSOM | Inline critical CSS in \`<head>\`, defer non-critical | 200-500ms first paint | Medium |
| 2. CSSOM | Use \`<link media="print">\` trick for non-critical CSS | 200-500ms | Easy |
| 3. Render Tree | Minimize DOM depth (avoid div-hell) | 10-50ms | Easy |
| 4. Layout | Batch DOM reads/writes (avoid layout thrashing) | Prevents dropped frames | Medium |
| 4. Layout | Use \`transform\` for animations, not \`left\`/\`top\` | 60fps smoothness | Easy |
| 5. Paint | Avoid \`box-shadow\` and complex gradients on large areas | 10-100ms per paint | Easy |
| 6. Composite | Limit layer count, only use \`will-change\` when needed | Saves GPU memory | Medium |

### How to Measure CRP in Chrome DevTools

1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Go to the **Performance** tab
3. Click the **Record** button (circle icon)
4. Reload the page
5. Click **Stop** after the page loads
6. Look at the **Rendering** section — you will see colored bars for each step (DOM, CSSOM, Layout, Paint, Composite)

The **Lighthouse** tab also gives you specific CRP recommendations with estimated time savings.

---

## Practice Questions

Test your understanding:

1. **Q:** What is the difference between \`display: none\` and \`visibility: hidden\`?
   **A:** \`display: none\` removes the element from the Render Tree (no box created). \`visibility: hidden\` keeps the element in the Render Tree (box exists but is invisible).

2. **Q:** Why does \`<script>\` without \`defer\` block HTML parsing?
   **A:** Because JavaScript can modify the DOM via \`document.write()\`. The parser must stop to let the script run before continuing. \`defer\` tells the browser "this script will NOT use document.write."

3. **Q:** Why is \`transform\` cheaper than \`left\` for animations?
   **A:** \`left\` triggers Layout + Paint + Composite (3 steps). \`transform\` triggers ONLY Composite (1 step) because the element is on its own GPU layer.

4. **Q:** What is layout thrashing?
   **A:** A pattern where JavaScript interleaves DOM reads and writes, forcing the browser to recalculate layout on every iteration instead of batching.

5. **Q:** What CSS properties trigger ONLY Paint (no Layout)?
   **A:** \`color\`, \`background-color\`, \`border-radius\`, \`box-shadow\`, \`text-shadow\`, \`outline\` — visual properties that don't change geometry.

---

## Summary Cheat Sheet

\`\`\`
CRP in 6 Steps:
1. DOM      ← Parse HTML → Tree of elements
2. CSSOM    ← Parse CSS  → Tree of styles
3. Render   ← DOM + CSSOM → Visible nodes only
4. Layout   ← Calculate geometry → x, y, w, h
5. Paint    ← Generate draw commands → Display list
6. Composite ← Blend layers on GPU → Pixels on screen

Key Rules:
• Put <script> at end of <body> or use defer/async
• Inline critical CSS in <head>, defer the rest
• Use transform for animations, NOT left/top
• Batch DOM reads before writes (avoid layout thrashing)
• Only promote layers with will-change when actually animating
• Measure with Chrome DevTools Performance tab`,

            tags: ["Performance", "Architecture"],
          },
          {
            id: "fe-v8",
            title: "V8 Engine: JIT Compilation & Garbage Collection",
            shortDesc: "How V8 goes from source code to machine code — Ignition, TurboFan, hidden classes, and generational GC.",
            difficulty: "advanced",
            readTimeMin: 12,
            keyPoints: [
              "Parsing → AST → Ignition bytecode: the fast path to execution.",
              "Feedback Vectors: V8 records type information every time a function runs.",
              "TurboFan JIT: compiles hot functions to optimized machine code using feedback.",
              "Hidden Classes (Shapes): objects with the same property order share an internal map — enables fast property access.",
              "Inline Caches (ICs): monomorphic → polymorphic → megamorphic degradation.",
              "Young Generation (Scavenger): fast copying GC for short-lived allocations.",
              "Old Generation (Mark-Sweep-Compact): concurrent marking to avoid stop-the-world pauses.",
            ],
            content: `## Why This Matters (Read This First)

JavaScript is the language you write. But something else runs it — the **JavaScript engine**. When you write \`const x = 1 + 2\`, the engine is what actually does the adding. When you write a loop that runs 10,000 times, the engine decides how to make it fast.

The most widely-used JavaScript engine is **V8**. It powers:
- **Google Chrome** — the most popular browser
- **Node.js** — JavaScript on the server
- **Deno** — a modern Node.js alternative
- **Microsoft Edge** (since 2020) — also uses V8 under the hood

Understanding how V8 works makes you a better developer because you will understand why some code is fast and other code is slow. You will stop writing code that "works" but secretly makes the engine do extra work.

---

## What Is a JavaScript Engine?

A **JavaScript engine** is a program that reads your JavaScript code and runs it. It has two main jobs:

1. **Parse** your code and understand what it says
2. **Execute** your code and produce results

Modern JavaScript engines (V8, SpiderMonkey, JavaScriptCore) do NOT just interpret your code line by line like a human reading a recipe. They use a sophisticated strategy called **Just-In-Time (JIT) compilation** to make your code run fast.

---

## The Problem JavaScript Engines Face

JavaScript is a **dynamic language**. This means types can change at runtime:

\`\`\`javascript
function add(a, b) {
  return a + b;
}

add(1, 2);        // a is number, b is number → returns 3
add("hello", " "); // a is string, b is string → returns "hello "
add(1, "world");   // a is number, b is string → returns "1world"
\`\`\`

The \`+\` operator does different things depending on the types of \`a\` and \`b\`:
- Both numbers → arithmetic addition
- At least one string → string concatenation

A compiled language like C++ knows the types at compile time and can generate machine code that directly adds two numbers with a single CPU instruction. JavaScript cannot do this because it doesn't know the types until the code actually runs.

This is the fundamental challenge: **How can JavaScript be fast when types are unpredictable?**

V8's answer: a two-tier architecture.

---

## V8's Two-Tier Architecture

V8 uses two execution modes:

| Mode | Name | Speed | When It Runs |
|------|------|-------|-------------|
| Tier 1 | **Ignition** (Interpreter) | Fast startup, slow execution | Every function, the first time it runs |
| Tier 2 | **TurboFan** (JIT Compiler) | Slow startup, fast execution | Functions that run many times ("hot" functions) |

This is a trade-off. Most functions in a program run only a few times — they don't need to be ultra-fast. Only the "hot" functions (called hundreds or thousands of times) benefit from the time investment of optimization.

### Tier 1: Ignition — The Interpreter

When your JavaScript code first runs, V8:

1. **Parses** your source code into an **Abstract Syntax Tree (AST)** — a tree representation of your code's structure
2. **Generates bytecode** — a compact, intermediate representation that Ignition can execute directly

Bytecode is NOT machine code. It is a simpler, lower-level language that the interpreter can run quickly. Think of it as a "translated" version of your JavaScript that is easier for the computer to process.

\`\`\`
Your JavaScript:
    function add(a, b) { return a + b; }

    ↓ Parsing

Abstract Syntax Tree (AST):
    FunctionDeclaration
    ├── name: "add"
    ├── params: ["a", "b"]
    └── body: ReturnStatement
              └── BinaryExpression (+)
                  ├── left: Identifier("a")
                  └── right: Identifier("b")

    ↓ Bytecode generation

Ignition Bytecode (simplified):
    Ldar a1        // Load argument at position 1 into accumulator
    Add a2         // Add argument at position 2 to accumulator
    Return         // Return the accumulator value
\`\`\`

The interpreter runs this bytecode directly. It is slower than machine code, but it starts immediately — no waiting for compilation.

### Tier 2: TurboFan — The JIT Compiler

As a function runs, V8 watches it. It keeps track of:
- How many times the function has been called
- What types were passed as arguments

This tracking data is stored in a **feedback vector** (also called **type feedback**). Every time \`add(1, 2)\` runs, V8 records: "a was a number, b was a number, result was a number."

When a function becomes **hot** (runs many times), V8 sends it to TurboFan, the **JIT (Just-In-Time) compiler**. TurboFan:

1. Reads the type feedback
2. **Speculates** that future calls will have the same types
3. Generates **optimized machine code** that assumes those types

For \`add(a, b)\` with number feedback, TurboFan generates machine code that directly adds two numbers using a single CPU instruction — just as fast as C++.

\`\`\`
TurboFan speculation:
  "I've seen add(1, 2), add(3, 4), add(5, 6)
   → a is always number, b is always number
   → I will generate machine code that adds two numbers directly"

Generated machine code (pseudocode):
    mov rax, [a]       // Load 'a' into CPU register
    add rax, [b]       // Add 'b' to the register
    mov [result], rax  // Store the result
\`\`\`

### Deoptimization — When Speculation Fails

What happens if after optimization, someone calls \`add("hello", " ")\`?

TurboFan's optimized code assumed numbers, but now it gets strings. It cannot use the optimized code anymore. V8 performs **deoptimization**:

1. Throws away the optimized machine code
2. Falls back to the slower bytecode interpreter
3. If the function becomes hot again with the new types, TurboFan will recompile

Deoptimization is expensive — it can take hundreds of milliseconds. This is why **keeping types consistent in hot functions** is critical for performance.

\`\`\`javascript
// GOOD: Consistent types → V8 optimizes once and stays optimized
function totalPrice(price, tax) {
  return price + tax;  // Always numbers
}
totalPrice(100, 10);     // V8 records: number + number
totalPrice(200, 20);     // Same types → stays optimized
totalPrice(50, 5);       // Same types → fast path

// BAD: Inconsistent types → V8 deoptimizes and re-optimizes
function total(price, tax) {
  return price + tax;
}
total(100, 10);          // V8 records: number + number
total(100, 10);          // Hot → TurboFan optimizes for numbers
total("100", "10");      // STRING! → Deoptimize! Now slow again
total(200, 20);          // Number again → Re-compile? Expensive!
\`\`\`

---

## Hidden Classes (Shapes)

### The Problem V8 Faces with Objects

In JavaScript, objects are just collections of key-value pairs. You can add or remove properties at any time:

\`\`\`javascript
const user1 = { name: "Alice", age: 30 };
const user2 = { name: "Bob", age: 25 };
user1.email = "alice@example.com";  // Dynamic property addition
delete user2.age;                    // Dynamic property deletion
\`\`\`

In a compiled language like C++, each object type has a fixed memory layout. The compiler knows that \`user.age\` is always at offset 16 bytes from the start of the object. Accessing it is a single CPU instruction.

JavaScript objects don't have this fixed layout. Two objects with the same properties might store them differently. Without optimization, every property access would require a dictionary lookup (like \`HashMap.get("age")\`) — much slower than a fixed offset.

### How V8 Solves This: Hidden Classes

V8 attaches a **hidden class** (also called a **Shape** or **Map**) to every object. The hidden class describes the object's property layout.

\`\`\`javascript
function User(name, age) {
  this.name = name;
  this.age = age;
}

const user1 = new User("Alice", 30);
const user2 = new User("Bob", 25);
\`\`\`

When this code runs:
1. \`new User("Alice", 30)\` creates an object with no properties
2. \`this.name = name\` adds property "name" → V8 creates a hidden class \`C0\` with "name" at offset 0
3. \`this.age = age\` adds property "age" → V8 creates hidden class \`C1\` (transition from \`C0\`) with "age" at offset 8
4. \`new User("Bob", 25)\` creates another object that follows the same transition path → both objects share the same hidden classes

Now, when V8 sees \`user1.age\`, it knows:
- \`user1\` has hidden class \`C1\`
- In \`C1\`, property "age" is at offset 8
- Access \`user1.age\` → read memory at (address of user1 + 8 bytes)

This is just as fast as a C++ struct access!

### What Breaks Hidden Class Optimization

\`\`\`javascript
function User(name, age) {
  this.name = name;
  this.age = age;
}

const user1 = new User("Alice", 30);
const user2 = new User("Bob", 25);

// BAD: Adding properties out of order
user1.email = "alice@example.com";   // Creates new hidden class C2
user2.email = "bob@example.com";     // user2 doesn't share C2 → creates C3

// user1 and user2 now have DIFFERENT hidden classes
// V8 cannot optimize property access as a fixed offset anymore

// BAD: Deleting properties
delete user1.age;  // Forces dictionary mode — slow!
\`\`\`

**Rules for optimal object performance:**
- Initialize all properties in the constructor (don't add them later)
- Always add properties in the same order
- Never use \`delete\` on objects in hot paths
- Use \`Object.assign(obj, { ... })\` instead of setting properties one by one

---

## Inline Caches (ICs)

**Inline Caches (ICs)** are V8's mechanism for speeding up repeated operations on the same type of object.

When V8 first sees \`user.name\`, it doesn't know what type \`user\` is. It does a slow lookup:

\`\`\`
user.name → "Find property 'name' on object → check object, then prototype chain"
\`\`\`

After the first lookup, V8 records the result in an **Inline Cache** attached to that line of code. The cache says: "When the object has hidden class C1, property 'name' is at offset 0."

The next time that same line runs with an object of the same hidden class, V8 skips the slow lookup entirely and goes directly to offset 0.

### IC States

Inline caches can be in different states:

| State | Number of Hidden Classes | Performance |
|-------|-------------------------|-------------|
| **Monomorphic** | 1 | Fast — direct offset access |
| **Polymorphic** | 2-4 | Medium — checks each possible type |
| **Megamorphic** | 5+ | Slow — falls back to dictionary lookup |

\`\`\`javascript
// Monomorphic (FAST): Only one object type passes through this code
function getName(user) {
  return user.name;  // IC sees only one hidden class
}
getName(user1);  // hidden class C1
getName(user2);  // hidden class C1 (same)
getName(user3);  // hidden class C1 (same)

// Polymorphic (MEDIUM): Multiple object types
function getName(user) {
  return user.name;
}
getName(user1);  // hidden class C1
getName(admin1); // hidden class C2 (different type)
getName(user2);  // C1 or C2 → polymorphic

// Megamorphic (SLOW): Many different types
function getName(user) {
  return user.name;
}
const objects = [
  { name: "a" }, { nom: "b" }, { name: "c", extra: true },
  { title: "d" }, { name: "e", age: 1 },
];
objects.forEach(o => getName(o));  // Many different hidden classes → megamorphic
\`\`\`

---

## Garbage Collection (GC)

### What Is Garbage Collection?

JavaScript manages memory automatically. When you create an object, the engine allocates memory for it. When you no longer need the object, the engine should free that memory so it can be reused.

\`\`\`javascript
function createUser(name) {
  const user = { name: name, createdAt: Date.now() };
  return user;
}

const alice = createUser("Alice");
// 'user' inside the function is no longer needed after the function returns
// The object { name: "Alice", createdAt: ... } IS still needed
// because 'alice' variable still references it
\`\`\`

The engine needs to figure out which objects are still needed (reachable) and which are not (garbage). This is **garbage collection (GC)**.

### V8's Generational Approach

V8 divides memory into two **generations**:

| Generation | Contains | Size | Collection Frequency | Collection Speed |
|------------|----------|------|---------------------|------------------|
| **Young (Nursery)** | Recently created objects | ~1-8 MB | Often (every few seconds) | Very fast (~1-2 ms) |
| **Old** | Objects that survived multiple young collections | Most of heap | Rarely (when memory is full) | Slow (~10-100 ms) |

The idea behind generational GC: **Most objects die young.**

Think about a function that creates a temporary array:

\`\`\`javascript
function processItems(items) {
  const temp = [];           // temp is created...
  for (const item of items) {
    temp.push(item.value);   // ...items are added...
  }
  return temp;               // ...and it's returned (survives)
  // Objects that are NOT returned die here
}
\`\`\`

Variables inside a function (like loop counters, intermediate values) are created and destroyed within milliseconds. Only a few objects (like the returned array) live long enough to be promoted to the old generation.

### Young Generation GC (Scavenger)

The young generation uses a **Scavenger** (copying) collector:

1. The young generation is split into two equal halves: **from-space** and **to-space**
2. New objects are allocated in from-space
3. When from-space is full, V8 finds all "alive" objects (still referenced) and copies them to to-space
4. Dead objects are left behind (the entire from-space is cleared)
5. From-space and to-space swap roles

This is fast because copying only alive objects is proportional to the number of survivors, not the total number of objects.

### Old Generation GC (Mark-Sweep-Compact)

Objects that survive multiple young collections are **promoted** to the old generation. The old generation uses a different algorithm:

1. **Mark:** Starting from "roots" (global variables, the call stack), V8 traverses all references and marks every reachable object
2. **Sweep:** Unmarked objects are garbage — their memory is freed
3. **Compact (optional):** Surviving objects are moved together to eliminate memory fragmentation

V8 runs old generation GC **concurrently** (on a background thread) to avoid stopping your JavaScript from running. However, there are still brief pauses when it needs to "stop the world" to scan the call stack.

### Memory Leaks — When GC Cannot Help

A memory leak happens when you hold a reference to an object that you no longer need. The GC thinks the object is still alive and never frees it.

Common JavaScript memory leaks:

\`\`\`javascript
// LEAK 1: Event listeners that are never removed
const button = document.getElementById("submit");
const data = loadLargeData();  // 10MB object
button.addEventListener("click", () => {
  console.log("Clicked");
  // The closure captures 'data' → 'data' cannot be GC'd
  // even after the button is removed from the DOM!
});

// FIX: Remove the listener when done
button.removeEventListener("click", handler);

// LEAK 2: Accumulating data in arrays
const cache = [];
function process(data) {
  cache.push(data);  // Never removes old entries → grows forever
}

// LEAK 3: Accidental global variables
function doWork() {
  hugeData = loadHugeData();  // No 'let' or 'const' → global!
  // 'hugeData' is now global and lives forever
}
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between Ignition and TurboFan?
   **A:** Ignition is the interpreter — starts quickly but runs code slower. TurboFan is the JIT compiler — takes time to compile but runs optimized code much faster. Ignition runs every function initially; TurboFan kicks in for "hot" functions.

2. **Q:** What is deoptimization and why is it expensive?
   **A:** Deoptimization happens when TurboFan's type speculation was wrong (e.g., function expected numbers but got strings). V8 must throw away the optimized machine code and fall back to bytecode. This is expensive because compilation + deoptimization together can take hundreds of milliseconds.

3. **Q:** What is a hidden class (Shape)?
   **A:** A hidden class is V8's internal description of an object's property layout. It allows V8 to access properties by fixed memory offsets instead of dictionary lookups, making property access as fast as C++ struct access.

4. **Q:** Why does deleting properties or adding them out of order hurt performance?
   **A:** Because it forces the object into a different hidden class path or even into slow "dictionary mode." When objects have different hidden classes, Inline Caches become polymorphic (slower) or megamorphic (very slow).

5. **Q:** What is the generational hypothesis in GC?
   **A:** "Most objects die young." The young generation collects frequently but quickly (copying only survivors). Objects that survive multiple collections are promoted to the old generation, which collects rarely but more thoroughly. This balance makes GC efficient.

---

## Summary Cheat Sheet

\`\`\`
V8 Architecture:
Your JS → Parser → AST → Ignition (bytecode) → TurboFan (machine code)

Hot function? → TurboFan compiles optimized code using type feedback
Type changed? → Deoptimization → back to Ignition

Object Performance Rules:
• Initialize all properties in constructor
• Same order every time
• No delete on hot objects
• Keep object types consistent in arrays

Inline Cache States:
• Monomorphic (1 type) → Fast
• Polymorphic (2-4 types) → Medium
• Megamorphic (5+ types) → Slow

GC Generations:
• Young (Nursery): ~1-8 MB, collected every few seconds, ~1ms
• Old: Most of heap, collected rarely, ~10-100ms

Memory Leak Prevention:
• Remove event listeners when done
• Cap cache sizes
• Use 'let' and 'const' (avoid accidental globals)
• Nullify large references when no longer needed
\`\`\``,
            tags: ["V8", "Performance", "Compiler"],
          },
          {
            id: "fe-event-loop",
            title: "The Event Loop, Tasks & Microtasks",
            shortDesc: "The exact order the browser executes JavaScript — call stack, task queue, microtask queue, and rendering steps.",
            difficulty: "foundational",
            readTimeMin: 10,
            keyPoints: [
              "The Call Stack: LIFO structure — JavaScript executes one function at a time.",
              "Web APIs (setTimeout, fetch, DOM events): handled by the browser, not the JS engine.",
              "Task Queue (macrotasks): one task per event loop tick — setTimeout, setInterval, I/O.",
              "Microtask Queue: Promise.then, queueMicrotask, MutationObserver — drained entirely before the next task.",
              "Priority: Call Stack > Microtask Queue (all) > Task Queue (one at a time).",
              "Render step: happens between tasks — explains why microtask storms can freeze the screen.",
            ],
            content: `## Why This Matters (Read This First)

Imagine you are a chef in a busy kitchen. You can only cook one dish at a time. While the pasta is boiling, you don't just stand there — you chop vegetables, plate a salad, or answer the phone. But you never actually do two things at the exact same moment. You switch between tasks so quickly that it looks like everything happens at once.

JavaScript is that chef. It is **single-threaded**: one command at a time. Yet it handles network requests, user clicks, animations, and timers without freezing. How?

The answer is the **Event Loop** — the orchestration mechanism that decides what runs next. It is not part of JavaScript itself. It is provided by the **host environment** (browser or Node.js).

By the end of this article, you will be able to predict exactly what order this code outputs:

\`\`\`javascript
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

queueMicrotask(() => console.log("D"));

console.log("E");
\`\`\`

The answer is at the end. Try to guess before you get there.

---

## The Four Participants in the Event Loop

The event loop coordinates four components:

| Component | What It Does | Analogy |
|-----------|-------------|---------|
| **Call Stack** | Executes JavaScript functions one at a time | The chef's hands — doing one thing right now |
| **Web APIs** | Browser features (timers, fetch, DOM) that run outside JS | The stove and oven — they do work on their own |
| **Task Queue** | Callbacks from Web APIs waiting to run | Orders waiting to be cooked |
| **Microtask Queue** | High-priority callbacks (Promise, queueMicrotask) | VIP orders that cut the line |

---

## 1. The Call Stack — What Is Running Right Now

The **Call Stack** is a LIFO (Last In, First Out) data structure that tracks which function is currently executing.

When you call a function, it gets **pushed** onto the stack. When the function returns, it gets **popped** off.

\`\`\`javascript
function multiply(a, b) {
  return a * b;
}

function square(n) {
  return multiply(n, n);
}

console.log(square(3));
\`\`\`

Step by step:

\`\`\`
1. console.log(square(3)) is called
   Stack: [ console.log, square ]

2. square(3) calls multiply(3, 3)
   Stack: [ console.log, square, multiply ]

3. multiply returns 9 → popped off
   Stack: [ console.log, square ]

4. square returns 9 → popped off
   Stack: [ console.log ]

5. console.log runs → prints "9" → popped off
   Stack: [ ]

All done. One function at a time.
\`\`\`

### Stack Overflow

If a function calls itself recursively without a base case, the stack fills up and the browser throws a **stack overflow** error:

\`\`\`javascript
function infinite() {
  return infinite();
}

infinite();
// Uncaught RangeError: Maximum call stack size exceeded
\`\`\`

Every browser has a limit (typically 10,000–50,000 frames). Beyond that, the runtime refuses to push more frames.

---

## 2. Web APIs — The Browser Does the Heavy Lifting

JavaScript cannot do everything itself. Timers, network requests, and DOM events are handled by **Web APIs** — C++ functions provided by the browser environment.

When you call \`setTimeout(callback, 1000)\`:

1. The Call Stack runs \`setTimeout\`
2. \`setTimeout\` hands the timer off to the browser's timer system (a Web API)
3. \`setTimeout\` returns immediately — the Call Stack keeps moving
4. After 1000ms, the browser places the callback into the Task Queue

\`\`\`javascript
console.log("Start");

setTimeout(() => {
  console.log("Timer done");
}, 1000);

console.log("End");
\`\`\`

What happens:

\`\`\`
1. console.log("Start") → Call Stack runs it → prints "Start"
2. setTimeout(...) → Call Stack runs it → browser starts a 1000ms timer
3. console.log("End") → Call Stack runs it → prints "End"
4. Call Stack is empty
5. (after 1000ms) Browser puts the callback into the Task Queue
6. Event loop sees Call Stack empty, moves callback from Task Queue to Call Stack
7. console.log("Timer done") → prints "Timer done"
\`\`\`

Output: \`Start\`, \`End\`, \`Timer done\`

The timer did NOT block execution. The callback waited in the queue until the Call Stack was clear.

---

## 3. Task Queue (Macrotask Queue) — One at a Time

The **Task Queue** (also called the **Macrotask Queue**) holds callbacks from Web APIs that are ready to execute.

These APIs add tasks to the Task Queue:

| API | When the task is queued |
|-----|------------------------|
| \`setTimeout(cb, ms)\` | After \`ms\` milliseconds have passed |
| \`setInterval(cb, ms)\` | Every \`ms\` milliseconds |
| \`fetch(url)\` | When the HTTP response starts arriving |
| DOM events (\`click\`, \`scroll\`, \`keydown\`) | When the event fires |
| \`<script src="...">\` | After the script loads |

**Key rule: The event loop processes ONE task per tick.** After a task runs, the event loop checks the Microtask Queue before moving to the next task.

\`\`\`javascript
setTimeout(() => console.log("Task 1"), 0);
setTimeout(() => console.log("Task 2"), 0);
setTimeout(() => console.log("Task 3"), 0);

// These are three separate tasks.
// Output: Task 1, Task 2, Task 3
// Each runs in its own event loop tick.
\`\`\`

---

## 4. Microtask Queue — The VIP Lane

The **Microtask Queue** has higher priority than the Task Queue. The event loop **drains the entire Microtask Queue** before it picks the next task.

These APIs add to the Microtask Queue:

| API | Why you use it |
|-----|----------------|
| \`Promise.prototype.then()\` | React to a resolved/rejected promise |
| \`Promise.prototype.catch()\` | Handle a rejected promise |
| \`Promise.prototype.finally()\` | Run cleanup after promise settles |
| \`queueMicrotask(fn)\` | Explicitly queue a microtask |
| \`MutationObserver\` | React to DOM changes |

### The Critical Rule

\`\`\`
1. Run one macrotask from the Task Queue
2. Drain ALL microtasks from the Microtask Queue
3. Render (if the browser decides it needs to)
4. Go to step 1
\`\`\`

**"Drain ALL microtasks" means if a microtask adds another microtask, that new one also runs. The queue must be completely empty before the next macrotask is touched.**

---

## 5. Putting It Together — The Complete Event Loop Cycle

Here is the exact sequence, in order:

\`\`\`
┌──────────────────────────────────────────────────┐
│                  EVENT LOOP TICK                  │
│                                                    │
│  1. Is the Call Stack empty?                      │
│     │ YES → continue                              │
│     │ NO  → wait until it is                      │
│                                                    │
│  2. Is the Microtask Queue non-empty?              │
│     │ YES → take the first microtask              │
│     │       push it onto the Call Stack           │
│     │       GO BACK TO STEP 2                     │
│     │       (keep going until Microtask Queue     │
│     │        is COMPLETELY empty)                  │
│     │ NO  → continue                              │
│                                                    │
│  3. Is the Task Queue non-empty?                   │
│     │ YES → take the FIRST task (only ONE!)       │
│     │       push it onto the Call Stack           │
│     │       GO BACK TO STEP 1                     │
│     │ NO  → continue                              │
│                                                    │
│  4. Render (if needed) — style, layout, paint     │
│                                                    │
│  5. Wait for new tasks (idle)                     │
└──────────────────────────────────────────────────┘
\`\`\`

### Visual Flow

\`\`\`
              ┌──────────────┐
              │  Call Stack  │ ← JS executes here
              └──────┬───────┘
                     │ empty?
                     ▼
  ┌──────────────────────────────┐
  │   Microtask Queue (all!)     │ ← Priority 1
  │  Promise.then, queueMicrotask │
  └──────────────┬───────────────┘
                 │ empty?
                 ▼
  ┌──────────────────────────────┐
  │    Task Queue (one only)     │ ← Priority 2
  │   setTimeout, click, fetch   │
  └──────────────┬───────────────┘
                 │ done?
                 ▼
            ┌──────────┐
            │  Render  │ ← Paint pixels
            └──────────┘
\`\`\`

---

## 6. Examples — Tracing the Event Loop

### Example 1: The Classic Question

\`\`\`javascript
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");
\`\`\`

**Trace:**

| Step | What happens | Output |
|------|-------------|--------|
| 1 | \`console.log("A")\` runs in Call Stack | \`A\` |
| 2 | \`setTimeout(cb, 0)\` runs → browser starts a 0ms timer → callback queued to Task Queue | |
| 3 | \`Promise.resolve().then(cb)\` runs → callback queued to Microtask Queue | |
| 4 | \`console.log("D")\` runs in Call Stack | \`D\` |
| 5 | Call Stack empty → drain Microtask Queue → \`console.log("C")\` runs | \`C\` |
| 6 | Microtask Queue empty → take one Task → \`console.log("B")\` runs | \`B\` |

**Output: \`A\`, \`D\`, \`C\`, \`B\`**

Even though \`setTimeout\` had a 0ms delay, \`C\` printed before \`B\`. The Microtask Queue always gets drained before the next task.

### Example 2: Microtasks Can Starve the Event Loop

\`\`\`javascript
function loop() {
  Promise.resolve().then(() => {
    console.log("microtask");
    loop(); // queue another microtask
  });
}

loop();

setTimeout(() => console.log("task"), 0);
\`\`\`

**What happens:**

1. \`loop()\` runs → queues a microtask
2. Call Stack empties
3. Microtask Queue drained: prints "microtask", \`loop()\` queues ANOTHER microtask
4. Microtask Queue is NOT empty yet → drain again: prints "microtask", queues another
5. This continues forever
6. The \`setTimeout\` task NEVER runs

**Output: \`microtask\`, \`microtask\`, \`microtask\`, ... (infinite)**

This is called **starving the event loop**. The Task Queue never gets a turn because the Microtask Queue is never emptied. In real applications, this would freeze the UI because rendering also happens between tasks.

**Fix:** Use \`setTimeout\` to yield to the Task Queue periodically:

\`\`\`javascript
function loop() {
  // Do some work...
  // Then schedule the next iteration as a TASK, not a microtask
  setTimeout(() => loop(), 0);
}
\`\`\`

### Example 3: async/await Is Just Promise Syntax Sugar

\`\`\`javascript
async function foo() {
  console.log("1");
  await bar();
  console.log("2");
}

async function bar() {
  console.log("3");
}

foo();
console.log("4");
\`\`\`

**Trace:**

| Step | What happens | Output |
|------|-------------|--------|
| 1 | \`foo()\` called → pushed to Call Stack | |
| 2 | \`console.log("1")\` runs | \`1\` |
| 3 | \`await bar()\` → \`bar()\` runs synchronously → \`console.log("3")\` | \`3\` |
| 4 | \`bar()\` returns \`undefined\` (wrapped as \`Promise.resolve(undefined)\`) | |
| 5 | \`await\` queues the rest of \`foo()\` (\`console.log("2")\`) as a microtask | |
| 6 | \`foo()\` suspends → popped from Call Stack | |
| 7 | \`console.log("4")\` runs | \`4\` |
| 8 | Call Stack empty → drain Microtask Queue → \`console.log("2")\` runs | \`2\` |

**Output: \`1\`, \`3\`, \`4\`, \`2\`**

The code after \`await\` behaves exactly like a \`.then()\` callback — it is queued as a microtask.

### Example 4: Nesting Microtasks

\`\`\`javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => {
  console.log("3");
  Promise.resolve().then(() => console.log("4"));
});

console.log("5");
\`\`\`

**Output: \`1\`, \`5\`, \`3\`, \`4\`, \`2\`**

Why? Because when the Event Loop drains the Microtask Queue, it finds \`console.log("3")\`, runs it, which queues \`console.log("4")\`. The Microtask Queue is NOT empty yet, so \`4\` also runs before the task \`2\`.

---

## 7. Rendering — Where Paint Happens

The browser **does not render** after every microtask. Rendering (Style → Layout → Paint → Composite) happens **between tasks**, not between microtasks.

\`\`\`
Task → (rendering) → Microtasks → (no rendering) → Task → (rendering) → ...
\`\`\`

This is why a microtask storm blocks the screen. If you queue an infinite stream of microtasks, rendering never gets a turn, and the user sees a frozen page.

### When Does the Browser Render?

The browser decides when to render. It typically aligns with the display's refresh rate (every 16.6ms for 60fps). The rendering step happens after a task completes and before the next task starts — BUT only if the browser determines something visual has changed.

### requestAnimationFrame — Sync with Paint

\`\`\`javascript
// Runs JUST BEFORE the browser paints the next frame
requestAnimationFrame(() => {
  element.style.transform = \`translateX(\${scrollPos}px)\`;
});
\`\`\`

\`requestAnimationFrame\` callbacks run in a special queue that executes **between task completion and paint**. They are NOT microtasks and NOT tasks — they have their own phase.

Simplified order:

\`\`\`
Macrotask → Microtasks (all) → requestAnimationFrame (all) → Style → Layout → Paint
\`\`\`

Use \`requestAnimationFrame\` for visual updates. Use \`setTimeout\` for non-visual deferred work. Use microtasks for promise reactions.

---

## 8. Common Pitfalls

### Pitfall 1: Forgetting That Promise.then Is Async

\`\`\`javascript
let value = 0;

Promise.resolve().then(() => {
  value = 1;
});

console.log(value); // 0, not 1!
\`\`\`

The \`.then()\` callback runs as a microtask, which executes after the synchronous \`console.log\`. If you need the updated value, you must use it inside the \`.then()\`.

### Pitfall 2: Starving the Task Queue

\`\`\`javascript
// BAD: recursive promise chain blocks rendering
function processData(data) {
  if (data.length === 0) return;
  const item = data.shift();
  // ... do work with item ...
  Promise.resolve().then(() => processData(data));
}

// GOOD: use setTimeout to yield to rendering
function processData(data) {
  if (data.length === 0) return;
  const item = data.shift();
  // ... do work with item ...
  setTimeout(() => processData(data), 0);
}
\`\`\`

### Pitfall 3: Synchronous Code in Promises

\`\`\`javascript
console.log("1");

new Promise((resolve) => {
  console.log("2"); // This runs SYNCHRONOUSLY
  resolve();
}).then(() => console.log("3"));

console.log("4");
// Output: 1, 2, 4, 3
\`\`\`

The Promise constructor's executor function (\`(resolve) => { ... }\`) runs **synchronously**. Only the \`.then()\` callbacks are asynchronous (microtasks).

---

## 9. Node.js Differences

Node.js uses the same event loop concept (powered by **libuv**) but with slightly different phases:

\`\`\`
   ┌───────────────────────────┐
┌─>│          timers           │ ← setTimeout / setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ ← I/O error callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │ ← internal use
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │          poll            │ ← I/O events (most important)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │          check           │ ← setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     close callbacks       │ ← socket close events
│  └───────────────────────────┘
\`\`\`

### Node-Specific: process.nextTick

\`process.nextTick()\` is NOT a microtask in the traditional sense. It has its own **nextTickQueue** that is processed **between each phase of the event loop**, even before microtasks.

\`\`\`javascript
Promise.resolve().then(() => console.log("microtask"));
process.nextTick(() => console.log("nextTick"));
// Output: nextTick, microtask
\`\`\`

\`process.nextTick\` runs before promise microtasks. Use it sparingly — it is easy to starve I/O with recursive \`process.nextTick\` calls.

---

## Practice Questions

1. **Q:** What is the difference between a macrotask and a microtask? Give two examples of each.
   **A:** A macrotask comes from Web APIs (setTimeout, click events, fetch) and is processed one per event loop tick. A microtask comes from Promise.then and queueMicrotask — the entire microtask queue is drained before the next macrotask. Macrotask examples: setTimeout callback, click handler. Microtask examples: Promise.then callback, queueMicrotask.

2. **Q:** What does this code output? \`console.log("1"); setTimeout(() => console.log("2"), 0); Promise.resolve().then(() => console.log("3")); console.log("4");\`
   **A:** \`1\`, \`4\`, \`3\`, \`2\`. Synchronous code (1, 4) runs first. Then microtasks (3) drain before the macrotask (2).

3. **Q:** Can microtasks starve the event loop? How?
   **A:** Yes. If a microtask queues another microtask (e.g., recursive \`Promise.resolve().then(...)\`), the Microtask Queue never empties, so the Task Queue and rendering never get a turn. The page freezes.

4. **Q:** Where does \`requestAnimationFrame\` fit in the event loop?
   **A:** \`requestAnimationFrame\` callbacks run after all microtasks are drained and before the browser renders (style, layout, paint). They are not tasks or microtasks — they have their own scheduling phase tied to the display refresh rate.

5. **Q:** Why does \`new Promise((resolve) => { console.log("hi"); resolve(); })\` print "hi" synchronously?
   **A:** The Promise constructor's executor function runs synchronously. Only \`.then()\` / \`.catch()\` / \`.finally()\` callbacks are queued as microtasks.

---

## Summary Cheat Sheet

\`\`\`
EVENT LOOP PRIORITY (high to low):

  1. Call Stack (synchronous code)
  2. Microtask Queue (Promise.then, queueMicrotask) ← ALL of them
  3. requestAnimationFrame callbacks
  4. Browser render (Style → Layout → Paint → Composite)
  5. Task Queue (setTimeout, click handlers, I/O) ← ONE at a time

KEY RULES:
  • JavaScript is single-threaded — one function at a time
  • Web APIs (timers, fetch) run outside the Call Stack
  • Microtasks drain completely before the next task
  • Microtask storms block rendering
  • Promise executor runs synchronously; .then() is async (microtask)
  • Use requestAnimationFrame for visual updates
  • Use setTimeout for deferred work that should not block UI
  • process.nextTick (Node) runs after each phase, before microtasks

CLASSIC OUTPUT:
  console.log("1");                          // 1. sync
  setTimeout(() => console.log("2"), 0);     // 5. task
  Promise.resolve().then(() => console.log("3")); // 3. microtask
  queueMicrotask(() => console.log("4"));    // 4. microtask
  console.log("5");                          // 2. sync
  // Output: 1, 5, 3, 4, 2
\`\`\`

### Answer to the Opening Question

\`\`\`javascript
console.log("A");                                    // 1. sync → A
setTimeout(() => console.log("B"), 0);               // 5. task → B
Promise.resolve().then(() => console.log("C"));      // 3. microtask → C
queueMicrotask(() => console.log("D"));              // 4. microtask → D
console.log("E");                                    // 2. sync → E

// Output: A, E, C, D, B
\`\`\``,
            codeExample: {
              language: "javascript",
              filename: "event-loop-trace.js",
              code: `// Event Loop execution trace

console.log("A");                              // 1: sync

setTimeout(() => console.log("B"), 0);          // 5: macrotask (last)

Promise.resolve().then(() => console.log("C")); // 3: microtask

queueMicrotask(() => console.log("D"));         // 4: microtask

console.log("E");                              // 2: sync

// Order:
//   Call Stack:  A, E
//   Microtasks:  C, D
//   Macrotask:   B
// Output: A, E, C, D, B`,
            },
            tags: ["JavaScript", "Runtime", "Async"],
          },
          {
            id: "fe-browser-security",
            title: "Browser Security Model",
            shortDesc: "Same-Origin Policy, CORS, CSP, XSS, CSRF — how the browser enforces security boundaries.",
            difficulty: "intermediate",
            readTimeMin: 10,
            keyPoints: [
              "Same-Origin Policy (SOP): origin = scheme + host + port; scripts can't read cross-origin responses.",
              "CORS: server-controlled opt-in headers that relax SOP for specific origins.",
              "Content Security Policy (CSP): allowlist-based policy preventing inline script injection.",
              "XSS (Cross-Site Scripting): injecting malicious scripts via unsanitized user input.",
              "CSRF (Cross-Site Request Forgery): tricking a logged-in user's browser into making unintended requests.",
              "Clickjacking: embedding a victim site in an iframe to capture clicks — mitigated by X-Frame-Options.",
            ],
            content: `## Overview

The browser security model uses layered mechanisms to isolate websites from each other.

## Same-Origin Policy (SOP)

Origin = **scheme + host + port**. Documents from origin A cannot read resources from origin B. SOP does not prevent writes.

## CORS

| Header | Purpose |
|--------|---------|
| \`Access-Control-Allow-Origin\` | Which origins can read the response |
| \`Access-Control-Allow-Methods\` | Allowed HTTP methods |
| \`Access-Control-Allow-Headers\` | Allowed request headers |

> **Misconfiguration:** Reflecting \`Origin\` back in ACAO allows any origin.

## CSP (Content Security Policy)

Declares a whitelist of allowed resource sources. Avoid \`'unsafe-inline'\` — use nonces or hashes. Enable CSP reporting.

## Common Vulnerabilities

| Attack | Prevention |
|--------|------------|
| XSS | Output encoding + CSP |
| CSRF | \`SameSite=Strict\` + CSRF tokens |
| Clickjacking | \`X-Frame-Options: DENY\` |`,
            tags: ["Security", "Browser"],
          },
          {
            id: "fe-wasm",
            title: "WebAssembly: Architecture & Integration",
            shortDesc: "How Wasm runs near-native code in the browser — the module format, linear memory, and JS interop.",
            difficulty: "advanced",
            readTimeMin: 10,
            keyPoints: [
              "Wasm module: a binary format with functions, memory, tables, and globals — compiled from C/C++/Rust/Go.",
              "Linear memory: a contiguous array of bytes shared between Wasm and JS — no GC, manual management.",
              "JS interop: imports/exports bridge JS and Wasm — JS calls Wasm exports, Wasm calls JS imports.",
              "Streaming instantiation: `WebAssembly.instantiateStreaming()` compiles while the module downloads.",
              "Wasm GC (reference types): Wasm can now manage GC objects shared with JS — enables .NET, Dart, Kotlin.",
              "Use cases: compute-heavy (video encoding, crypto, image processing), game engines, codec offload.",
              "WASI: system interface for non-browser Wasm — running Wasm on servers, edge, and plugins.",
            ],
            content: `## Overview

**WebAssembly (Wasm)** is a binary instruction format for portable compilation targets (C, C++, Rust, Go). Runs in a sandboxed VM achieving near-native speed.

## Architecture

Wasm module contains: typed functions, **linear memory** (contiguous byte array), function table, globals.

\`\`\`javascript
const { instance } = await WebAssembly.instantiateStreaming(
  fetch("module.wasm")
);
instance.exports.myFunction();
\`\`\`

Linear memory: manual allocation (no GC), shared via ArrayBuffer with JS.

## Use Cases

| Domain | Examples |
|--------|---------|
| Compute-heavy | Video encoding, crypto |
| Game engines | Unity, Unreal Engine |
| Edge computing | Cloudflare Workers |
| Plugin systems | Envoy, Istio (WASI) |

## WASI

POSIX-like API for Wasm outside the browser. Runtimes: Wasmtime, Wasmer.

> **Value:** Compile once, run anywhere — browser, server, edge, embedded — with strong sandbox guarantees.`,
            tags: ["WebAssembly", "Browser", "Performance"],
          },
        ],
      },
      {
        id: "fe-javascript",
        title: "JavaScript Deep Cuts",
        description: "The language mechanics that power every framework — closures, prototypes, async patterns, and the module system.",
        topics: [
          {
            id: "fe-closures",
            title: "Closures, Scope & Execution Contexts",
            shortDesc: "How variables are resolved at runtime — lexical environments, scope chains, and why closures retain memory.",
            difficulty: "foundational",
            readTimeMin: 8,
            keyPoints: [
              "Execution Context: created on every function call — holds a Lexical Environment + `this` binding.",
              "Lexical Environment: maps variable names to values + a reference to the outer environment.",
              "Scope Chain: variable lookup walks outer references until the global scope.",
              "Closure: a function that captures its defining lexical environment — persists even after the outer function returns.",
              "Memory implication: closed-over variables cannot be GC'd as long as the closure is reachable.",
            ],
            content: `## Overview

JavaScript uses **lexical (static) scoping**: variable visibility is determined by where the code is written, not where it is called from.

## Execution Context & Lexical Environment

Every function invocation creates an **Execution Context** containing a **Lexical Environment** (variable-to-value mapping) plus a reference to the outer environment and the \`this\` binding.

## Scope Chain

Variable resolution walks the chain of nested environments until the global scope. If not found, a \`ReferenceError\` is thrown.

## Closures

A **closure** is a function that captures its defining lexical environment, persisting even after the outer function returns:

\`\`\`javascript
function makeCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    value: () => count,
  };
}

const c = makeCounter();
c.increment(); c.increment();
console.log(c.value()); // 2
// The 'count' variable is retained because the closures reference it
\`\`\`

## Memory Implications

Variables captured by a closure remain in memory as long as the closure is reachable. This is a common source of memory leaks - event listeners referencing large data structures prevent GC.

Modern engines optimize: if a captured variable is never accessed, the engine may avoid retaining it. However, explicit nullification of large objects at end of lifecycle is the safest practice.`,
            codeExample: {
              language: "javascript",
              filename: "closure.js",
              code: `function makeCounter() {
  let count = 0;          // captured in the closure
  return {
    increment: () => ++count,
    value:     () => count,
  };
}

const c = makeCounter();
c.increment(); c.increment();
console.log(c.value()); // 2
// 'count' is alive because the returned object holds closures that reference it.`,
            },
            tags: ["JavaScript", "Core"],
          },
          {
            id: "fe-prototypes",
            title: "Prototypal Inheritance & the Prototype Chain",
            shortDesc: "How JavaScript objects delegate property lookups up the prototype chain — and what `class` really compiles to.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Every object has an internal [[Prototype]] slot pointing to its prototype.",
              "Property lookup: own properties first, then walks [[Prototype]] chain until null.",
              "`class` syntax is syntactic sugar — under the hood, prototype chains are wired manually.",
              "`Object.create(proto)` is the cleanest way to set a prototype explicitly.",
              "Performance implication: deep prototype chains slow property lookups.",
            ],
            content: `## Overview

Unlike classical inheritance (Java, C++, Python), JavaScript uses **prototypal inheritance**: objects inherit directly from other objects.

## The Prototype Chain

Every object has an internal \`[[Prototype]]\` slot. Property lookup checks own properties first, then walks the chain until \`null\`.

- \`Object.getPrototypeOf(obj)\` to access the prototype

## \`class\` Is Syntactic Sugar

The \`class\` keyword creates a constructor function and sets its \`.prototype\` property. \`extends\` chains prototypes: \`B.prototype.[[Prototype]]\` points to \`A.prototype\`.

## \`Object.create(proto)\`

Creates a new object with the given prototype. More explicit than constructor functions:

\`\`\`javascript
const animal = { speak() { console.log(this.sound); } };
const dog = Object.create(animal);
dog.sound = 'woof';
dog.speak(); // woof
\`\`\`

## Performance

Deep prototype chains add lookup cost. V8's Inline Caches optimize repeated accesses on the same shape, but deep chains increase cache miss likelihood.`,
            tags: ["JavaScript", "Core"],
          },
          {
            id: "fe-async",
            title: "Async JavaScript: Callbacks, Promises & async/await",
            shortDesc: "The evolution of async patterns in JavaScript and exactly what async/await desugars to.",
            difficulty: "foundational",
            readTimeMin: 10,
            keyPoints: [
              "Callbacks: first async pattern — leads to 'callback hell' with deep nesting.",
              "Promises: represent an eventual value — .then() chains return new Promises.",
              "Promise states: pending → fulfilled | rejected (one-way transitions).",
              "async/await: syntactic sugar over Promises — `await` suspends the function, not the thread.",
              "Error handling: try/catch works with await; unhandled rejections cause global warnings.",
              "Promise.all vs Promise.allSettled vs Promise.race — when to use each.",
            ],
            content: `## Overview

JavaScript's async evolution: Callbacks → Promises → async/await.

## Callbacks

The original async pattern. Leads to "callback hell" with deep nesting and error handling complexity.

## Promises

Represent an eventual value. States: pending → fulfilled | rejected (one-way transitions).

- \`.then()\` chains return new Promises - enables flat chaining
- \`.catch()\` catches rejections in the chain
- \`.finally()\` runs regardless of outcome

## async/await

Syntactic sugar over Promises:

\`\`\`javascript
async function fetchUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    return await res.json();
  } catch (err) {
    console.error("Failed:", err);
    throw err;
  }
}
\`\`\`

- \`await\` suspends the function (not the thread)
- \`try/catch\` works naturally with await
- Unhandled rejections cause global warnings

## Concurrent Patterns

| Method | Behavior |
|--------|----------|
| \`Promise.all\` | Rejects fast - fails on first rejection |
| \`Promise.allSettled\` | Waits for all - never rejects |
| \`Promise.race\` | Resolves/rejects with the first settled |
| \`Promise.any\` | Resolves with first fulfillment |`,
            tags: ["JavaScript", "Async", "Core"],
          },
          {
            id: "fe-modules",
            title: "ES Modules vs CommonJS",
            shortDesc: "The difference between static ESM and dynamic CJS — and why it matters for bundlers and tree-shaking.",
            difficulty: "intermediate",
            readTimeMin: 6,
            keyPoints: [
              "CommonJS (CJS): `require()` is synchronous, evaluated at runtime — exports are plain objects.",
              "ES Modules (ESM): `import`/`export` are static — resolved at parse time, not runtime.",
              "Live bindings: ESM exports are live references — mutating the export updates all importers.",
              "Tree-shaking: only possible with ESM because static analysis can determine unused exports.",
              "Interop: mixing CJS and ESM requires special handling in Node.js and bundlers.",
            ],
            content: `## Overview

JavaScript has two module systems: **CommonJS** (Node.js, \`require\`) and **ES Modules** (ESM, \`import\`/\`export\`).

## CommonJS (CJS)

- \`require()\` is **synchronous**, evaluated at runtime
- Exports are plain objects (\`module.exports\`)
- Used by Node.js (default before ESM support)

## ES Modules (ESM)

- \`import\`/\`export\` are **static** - resolved at parse time, not runtime
- **Live bindings**: exports are live references - mutating the export updates all importers
- **Tree-shaking**: only possible with ESM because static analysis determines unused exports

## Interoperability

Mixing CJS and ESM requires special handling:
- ESM can \`import\` CJS modules (default import only)
- CJS cannot \`require\` ESM modules
- Bundlers (Webpack, Rollup, Vite) handle interop automatically

\`\`\`javascript
// ESM - static, tree-shakeable
export const sum = (a, b) => a + b;

// CJS - dynamic, not tree-shakeable
module.exports = { sum: (a, b) => a + b };
\`\`\`

> **Key insight:** ESM's static structure enables optimizations (tree-shaking, scope hoisting) that CJS cannot achieve.`,
            tags: ["JavaScript", "Modules", "Tooling"],
          },
        ],
      },
      {
        id: "fe-typescript",
        title: "TypeScript Mastery",
        description: "Static types, compiler internals, and advanced type-level programming for production-grade codebases.",
        topics: [
          {
            id: "fe-ts-type-system",
            title: "TypeScript Type System: Structural Typing",
            shortDesc: "How TypeScript checks compatibility — structural (duck) typing, assignability rules, and `never`.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Structural typing: compatibility is based on shape, not declared type names.",
              "Assignability: A is assignable to B if A has at least all properties B requires.",
              "Excess property checks: only applied on literal object expressions, not variables.",
              "`unknown` vs `any`: both accept anything, but `unknown` requires narrowing before use.",
              "`never`: the bottom type — represents impossible states; useful for exhaustiveness checks.",
            ],
            content: `## Why This Matters

TypeScript's type system is the most powerful in widespread use today — it's structurally typed, Turing-complete at the type level, and capable of expressing relationships that in most languages would require runtime checks. Understanding structural typing, assignability, and the type hierarchy is not academic: it directly determines how you design APIs, refactor code, and catch bugs. For a CTO, it determines whether the team's TypeScript codebase is a safety net or a productivity drag.

## Structural Typing: The Core Principle

Unlike Java or C# (which use **nominal typing** — "is this variable declared as type X?"), TypeScript uses **structural typing**: two types are compatible if their *structure* (their shape) matches, regardless of what they are called.

\`\`\`typescript
interface Person { name: string; age: number; }
interface Employee { name: string; age: number; employeeId: string; }

const p: Person = { name: "Alice", age: 30 };

// This works — Employee has all of Person's properties
const e: Employee = { name: "Bob", age: 25, employeeId: "E123" };
const personFromEmployee: Person = e;  // ✅ OK — Employee extends Person structurally

// But not the reverse:
const employeeFromPerson: Employee = p;  // ❌ Property 'employeeId' is missing
\`\`\`

### Why Structural Typing Matters

Structural typing enables patterns that nominal systems cannot express naturally:

1. **Duck typing compatibility:** If it walks like a duck and quacks like a duck, TypeScript treats it as a duck. Libraries that return objects with the same shape are automatically compatible — no need to import or declare shared interfaces.
2. **Testability:** Your test mocks don't need to implement interfaces explicitly. Any object with the right methods compiles as a valid mock.
3. **Evolution:** Adding a property to an interface doesn't break unrelated code that uses the same shape elsewhere.

The tradeoff is that structural typing provides **less type identity safety**. If two concepts have the same shape but different semantics (e.g., \`UserId\` and \`Email\` both being strings), TypeScript won't catch you mixing them up unless you use \**brand types*\* or \**nominal type patterns*\*.

## Assignability Rules

The fundamental rule: **A is assignable to B if A has *at least* all the properties B requires**.

\`\`\`typescript
// B requires { name: string }
// A has { name: string, age: number }
// A satisfies B's requirements, so A is assignable to B

function greet(person: { name: string }) {
  return \`Hello, \${person.name}\`;
}

greet({ name: "Alice", age: 30 });  // ✅ OK — has 'name'
\`\`\`

### Excess Property Checks

There is one critical exception to the assignability rule: **excess property checks** apply to literal object expressions.

\`\`\`typescript
// This is an excess property check — it FAILS:
greet({ name: "Alice", age: 30, extra: "boom" });
// ❌ Object literal may only specify known properties

// But this WORKS — no excess property check on variables:
const alice = { name: "Alice", age: 30, extra: "boom" };
greet(alice);  // ✅ OK — structural typing says it's fine
\`\`\^

This inconsistency is intentional: literal objects are likely programmer errors (typos, leftover properties from copy-paste), while variable assignments have already been validated by the developer. The rule of thumb: **passing a literal triggers excess property checks; passing a variable does not**.

## The Type Hierarchy

TypeScript's types form a lattice with \`unknown\` at the top (the universal supertype) and \`never\` at the bottom (the universal subtype).

\`\`\`
        unknown
       /       \\
      any    object
       |     /    \\
       |   string  number ...
       |     \\    /
       |     never
       \\       /
        (top types)

        never  (bottom type)
\`\`\`

### \`unknown\` vs \`any\`

Both \`unknown\` and \`any\` accept any value. The difference: \`unknown\` **requires narrowing before use**, while \`any\` disables type checking entirely.

\`\`\`typescript
let data: unknown = fetchData();
data.toUpperCase();  // ❌ Object is of type 'unknown'

// Must narrow:
if (typeof data === "string") {
  data.toUpperCase();  // ✅ OK — narrowed to string
}

let anything: any = fetchData();
anything.toUpperCase();     // ✅ No error — but could explode at runtime
anything.nonexistent();     // ✅ No error — anything goes
\`\`\`

**Rule for CTOs:** \`any\` should be banned in most codebases. \`unknown\` is the safe escape hatch — it forces the developer to handle the type before using it. The one exception is gradual migration paths where \`any\` bridges untyped JavaScript.

### \`never\` — The Bottom Type

\`never\` represents values that **cannot occur**. It is assignable to every type (because if you have a \`never\`, you're in an impossible state — you can safely use it anywhere), and nothing is assignable to \`never\`.

The most valuable use of \`never\` is **exhaustiveness checking**:

\`\`\`typescript
type Shape = Circle | Square | Triangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "square": return shape.side ** 2;
    case "triangle": return shape.base * shape.height / 2;
    default:
      // If we add a new Shape variant and forget to handle it,
      // this line errors — preventing runtime bugs
      const _exhaustive: never = shape;
      throw new Error("Unhandled shape: " + shape);
  }
}
\`\`\`

If a new shape variant is added, the \`never\` assignment fails at compile time. This pattern should be standard in every codebase with discriminated unions.

## CTO-Level Takeaways

1. **Ban \`any\` in your codebase.** Use an ESLint rule (\`@typescript-eslint/no-explicit-any\`). Allow only explicitly reviewed exceptions.
2. **Use \`unknown\` for third-party data.** API responses, JSON.parse output, and user input should be \`unknown\` until narrowed.
3. **Enforce exhaustiveness checks.** Make \`never\`-assignment the default in all switch/if-else chains over discriminated unions. It catches missed cases at compile time.
4. **Understand structural typing's limits.** Consider branded types for distinct concepts with the same shape (e.g., \`type UserId = string & { __brand: "UserId" }\`).
5. **Document the excess property check rule.** The literal-vs-variable asymmetry surprises every developer at least once.
;`,
            tags: ["TypeScript"],
          },
          {
            id: "fe-ts-generics",
            title: "Generics & Constraints",
            shortDesc: "Writing reusable, type-safe code with generic type parameters and constraint bounds.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Generic functions: type parameters inferred from arguments or explicitly provided.",
              "Constraints (`extends`): restrict the types a generic can accept.",
              "Default type parameters: provide fallback types for generics.",
              "Generic interfaces and classes: sharing type parameters across members.",
            ],
            content: `## Why This Matters

Generics are the mechanism that makes TypeScript's type system *useful* rather than merely *correct*. Without generics, every reusable utility, collection, or abstraction would require either \`any\` (losing type safety) or duplicated definitions for every type. Generics let you write code once and have it type-check correctly for every usage — catching bugs at compile time that would otherwise surface as runtime crashes.

## Generic Functions: Type Parameters in Action

A generic function captures a relationship between input types and output types that a concrete type annotation cannot express.

\`\`\`typescript
// Without generics: lose type information
function first(arr: any[]): any {
  return arr[0];
}
const x = first([1, 2, 3]);  // x is 'any' — no type safety

// With generics: preserve the relationship
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
const y = first([1, 2, 3]);  // y is 'number | undefined' ✅
const z = first(["a", "b"]); // z is 'string | undefined' ✅
\`\`\`

## Type Inference vs Explicit Annotation

TypeScript infers generic type parameters from arguments in most cases. Explicit annotation is only needed when inference is ambiguous.

\`\`\`typescript
// Inference works naturally:
const result1 = first([1, 2, 3]);  // T inferred as number

// Explicit annotation — required when inference is impossible:
async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}
// TypeScript cannot infer T from 'url' alone:
const user = await fetchData<User>("/api/user/1");  // Must specify
\`\`\`

## Constraints: \`extends\`

Constraints restrict which types a generic parameter can accept. The constraint is the *minimum* requirement — the actual type must satisfy it but can have more.

\`\`\`typescript
interface HasLength { length: number; }

function logLength<T extends HasLength>(item: T): T {
  console.log(item.length);
  return item;
}

logLength("hello");          // ✅ string has .length
logLength([1, 2, 3]);        // ✅ array has .length
logLength({ length: 10 });   // ✅ object with length
logLength(42);               // ❌ number has no .length
\`\`\`

### Key constraint patterns:

| Pattern | Use Case | Example |
|---------|----------|---------|
| \`T extends U\` | T must have at least U's properties | \`T extends { id: string }\` |
| \`K extends keyof T\` | K must be a valid key of T | \`getProperty(obj, key)\` |
| \`T extends new (...args: any[]) => any\` | T must be a constructable class | DI container factories |
| \`T extends Record<string, unknown>\` | T must be an object type | Generic object mappers |

## Default Type Parameters

Default type parameters provide fallback types when inference is not possible:

\`\`\`typescript
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

const a = createArray(3, 42);    // T = number (inferred)
const b = createArray(3, "x");   // T = string (inferred)
const c = createArray(3);        // ❌ Error — cannot infer T
const d = createArray<string>(3, "x"); // ✅ Explicit
\`\`\`

Default parameters are most useful in generic classes and type utilities where a reasonable default exists.

## Generic Interfaces and Classes

Generics can be parameterized across the entire interface or class, sharing the type parameter across all members:

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
}

const numStack = new Stack<number>();
numStack.push(1);
numStack.push("string");  // ❌ Type 'string' is not assignable to type 'number'
\`\`\`

## Practical Generic Patterns

### Pattern 1: Type-safe Event Emitter

\`\`\`typescript
type EventMap = {
  userLogin: { userId: string; timestamp: number };
  pageView: { path: string; referrer?: string };
  error: { message: string; code: number };
};

class TypedEmitter<T extends Record<string, unknown>> {
  private listeners = new Map<keyof T, Set<Function>>();

  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners.get(event)?.forEach(handler => handler(data));
  }
}

const emitter = new TypedEmitter<EventMap>();
emitter.on("userLogin", (data) => {
  console.log(data.userId);  // ✅ type-safe — knows userId is string
});
\`\`\`

### Pattern 2: Builder Pattern with Generics

\`\`\`typescript
class QueryBuilder<T, K extends keyof T = keyof T> {
  private selected: K[] = [];

  select(...fields: K[]): this {
    this.selected.push(...fields);
    return this;
  }

  build(): (item: T) => Pick<T, K> {
    const keys = this.selected;
    return (item) => {
      const result = {} as Pick<T, K>;
      keys.forEach(k => result[k] = item[k]);
      return result;
    };
  }
}

interface User { id: number; name: string; email: string; }
const builder = new QueryBuilder<User>()
  .select("name", "email")
  .build();
// builder returns Pick<User, "name" | "email">
\`\`\`

## Generic Constraints in Production: What Can Go Wrong

1. **Over-constraining:** Making \`T extends SomeSpecificInterface\` when only one property is needed. Prefer small, focused constraints.
2. **Under-constraining:** Not constraining at all, leading to confusing errors when invalid types are passed.
3. **Type explosion:** Complex generic types with multiple parameters and nested conditionals can slow down the compiler significantly. Profile with \`tsc --generateTrace\`.
4. **Inference ambiguity:** When TypeScript cannot infer a generic parameter, the error messages are notoriously cryptic. Provide explicit annotations in public APIs.

## CTO-Level Takeaways

1. **Standardize generic naming conventions.** \`T\` for single params, \`TKey/TValue\` for pairs, descriptive names (\`TData\`, \`TError\`) for complex cases.
2. **Prefer generic constraints over \`any\` casts.** Every \`as any\` in a generic function is a potential runtime bug waiting to surface.
3. **Use \`satisfies\` (TS 4.9+) for validation without widening.** Let inference work naturally and use \`satisfies\` as a validation layer.
4. **Benchmark build times.** Complex generics are the #1 cause of slow TypeScript compilation. If \`tsc\` is slow, profile for deeply nested generic types.
;`,
            codeExample: {
              language: "typescript",
              filename: "generics.ts",
              code: `// Constrained generic: T must have a 'length' property
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest("hello", "world"); // ✅ string
longest([1, 2], [3]);      // ✅ number[]
longest(1, 2);             // ❌ number has no 'length'`,
            },
            tags: ["TypeScript", "Advanced"],
          },
          {
            id: "fe-ts-advanced-types",
            title: "Advanced Types: Conditional, Mapped & Template Literals",
            shortDesc: "Type-level computations — building utility types, extracting types, and creating string literal combinations.",
            difficulty: "advanced",
            readTimeMin: 12,
            keyPoints: [
              "Conditional Types: `T extends U ? X : Y` — evaluated at compile time.",
              "`infer`: extract a type from within another in a conditional branch.",
              "Mapped Types: transform every key of an existing type.",
              "Template Literal Types: compose string unions at the type level.",
              "Built-in utilities: Partial, Required, Readonly, Pick, Omit, ReturnType, Parameters.",
            ],
            content: `## Why This Matters

TypeScript's type system is **Turing-complete** — you can compute arbitrary transformations at compile time. Conditional types, mapped types, and template literal types let you encode business rules, API shapes, and data validation at the type level, eliminating entire categories of runtime errors. While advanced type programming can be overdone (creating unreadable "type gymnastics"), the patterns in this section are the ones that appear in every production TypeScript codebase — and understanding them is essential for building type-safe libraries, API clients, and utility types.

## Conditional Types: Type-Level if/else

A conditional type selects between two types based on a condition:

\`\`\`typescript
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<"hello">;  // "yes"
type B = IsString<42>;        // "no"

// The condition is: "is T assignable to string?"
// If yes, resolve to "yes"; otherwise "no"
\`\`\`

### Distributive Conditional Types

When a conditional type is applied to a **union**, it distributes — the condition is evaluated for each member of the union individually:

\`\`\`typescript
type ToArray<T> = T extends unknown ? T[] : never;

type Result = ToArray<string | number>;
// Distributive: ToArray<string> | ToArray<number>
// Result: string[] | number[]

// Without distribution — wraps the whole union:
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
type Result2 = ToArrayNonDist<string | number>;
// Result2: (string | number)[]  — wrapped, not distributed
\`\`\`

Distribution is the key to many advanced type utilities. The \`[T]\` wrapper trick disables it by preventing the naked type parameter from being distributed.

### The \`infer\` Keyword

\`infer\` lets you *extract* a type from within another type inside a conditional branch:

\`\`\`typescript
// Extract the return type of a function:
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Fn = (x: number) => string;
type Result = ReturnType<Fn>;  // string

// Extract the resolved type of a Promise:
type Unwrap<T> = T extends Promise<infer U> ? U : T;

type A = Unwrap<Promise<string>>;  // string
type B = Unwrap<number>;           // number (not a Promise, pass through)
\`\`\`

### Real-World \`infer\` Patterns

\`\`\`typescript
// Extract element type from an array:
type ElementType<T> = T extends (infer U)[] ? U : never;
type Items = ElementType<string[]>;  // string

// Extract the first argument of a function:
type FirstArg<T> = T extends (arg: infer A, ...rest: any[]) => any ? A : never;
type Arg = FirstArg<(id: number, name: string) => void>;  // number

// Extract the resolved value from the Axios/React Query pattern:
type ApiResult<T> = T extends { data: infer D } ? D : never;
type UserData = ApiResult<{ data: { id: number; name: string } }>;
// { id: number; name: string }
\`\`\`

## Mapped Types: Transforming Object Types

Mapped types iterate over the keys of an existing type and transform each property:

\`\`\`typescript
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Optional<T> = {
  [K in keyof T]?: T[K];
};

// Key remapping (TS 4.1+):
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

type User = { name: string; age: number };
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number }
\`\`\`

### Filtering with Key Remapping

Using \`as never\` in a mapped type excludes keys:

\`\`\`typescript
type Methods<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

type User = { name: string; age: number; greet(): void };
type UserMethods = Methods<User>;  // { greet: () => void }
\`\`\`

### Built-in Mapped Type Utilities

| Utility | Effect |
|---------|--------|
| \`Partial<T>\` | All properties optional |
| \`Required<T>\` | All properties mandatory |
| \`Readonly<T>\` | All properties readonly |
| \`Pick<T, K>\` | Select subset of keys |
| \`Omit<T, K>\` | Remove subset of keys |
| \`Record<K, V>\` | Object with keys K and values V |

## Template Literal Types

Template literal types build string types from unions:

\`\`\`typescript
type EventName = \`on\${Capitalize<string>}\`;
// on + any capitalized string — too broad, but illustrates the mechanism

type Side = "top" | "bottom" | "left" | "right";
type Size = "sm" | "md" | "lg";
type SpacingClass = \`\${Side}-\${Size}\`;
// "top-sm" | "top-md" | "top-lg" | "bottom-sm" | ... (12 variants)
\`\`\`

### Intrinsic String Manipulation Types

TypeScript provides four built-in string type transformers:

| Type | Effect | Example |
|------|--------|---------|
| \`Uppercase<S>\` | All caps | \`Uppercase<"hello">\` → \`"HELLO"\` |
| \`Lowercase<S>\` | All lower | \`Lowercase<"HELLO">\` → \`"hello"\` |
| \`Capitalize<S>\` | First char upper | \`Capitalize<"hello">\` → \`"Hello"\` |
| \`Uncapitalize<S>\` | First char lower | \`Uncapitalize<"Hello">\` → \`"hello"\` |

### Database Row Type Builder: Real Example

\`\`\`typescript
type TableNames = "users" | "posts" | "comments";

// Build database row types from table name:
type TableRow = {
  users: { id: number; name: string; email: string };
  posts: { id: number; title: string; authorId: number; body: string };
  comments: { id: number; postId: number; text: string; authorId: number };
};

// Type-safe query builder API:
type QueryResult<T extends TableNames> = TableRow[T];
type InsertInput<T extends TableNames> = Omit<TableRow[T], "id">;
type UpdateInput<T extends TableNames> = Partial<InsertInput<T>>;
\`\`\`

## Combining Patterns: Type-Safe API Client

\`\`\`typescript
type ApiEndpoints = {
  "/users": { GET: { response: User[] }; POST: { body: CreateUser; response: User } };
  "/users/:id": { GET: { response: User }; PUT: { body: UpdateUser; response: User }; DELETE: { response: void } };
};

type RouteParams<T extends string> =
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param | keyof RouteParams<Rest>]: string }
    : T extends \`\${string}:\${infer Param}\`
      ? { [K in Param]: string }
      : {};

type ApiMethod<Endpoint extends keyof ApiEndpoints, Method extends keyof ApiEndpoints[Endpoint]> =
  (params: RouteParams<Endpoint> & ApiEndpoints[Endpoint][Method] extends { body: infer B } ? { body: B } : {}) => 
    ApiEndpoints[Endpoint][Method]["response"];
\`\`\`

This is the kind of type infrastructure that powers production API clients like tRPC, TanStack Query, and GraphQL Codegen. Understanding how it works means you can build custom solutions when off-the-shelf tools don't fit.

## CTO-Level Takeaways

1. **Use utility types instead of manual transformations.** \`Pick\`, \`Omit\`, \`Partial\`, \`Record\` cover 90% of use cases. Reserve conditional/mapped types for the remaining 10%.
2. **Complex types should be tested.** Use \`expect-type\` or \`tsd\` to assert type behavior in CI. A misbehaving conditional type can silently produce \`any\` or \`never\` and propagate errors.
3. **Avoid recursive types in large codebases.** They significantly slow down the compiler. Profile with \`tsc --generateTrace\`.
4. **Document "type-level APIs" the same way you document runtime code.** A mapped type with key remapping and \`infer\$ is a useful abstraction, but it must be readable. Add \`//\` comments explaining each step.
5. **Enforce a "no type gymnastics without tests" rule.** If a type utility is complex enough to need explanation, it needs a type test.
;`,
            codeExample: {
              language: "typescript",
              filename: "advanced-types.ts",
              code: `// Extract the resolved type of any Promise
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

// Build CSS class names at the type level
type Side = "top" | "bottom" | "left" | "right";
type SpacingClass = \`\${"m" | "p"}-\${Side}\`;
// "m-top" | "m-bottom" | "m-left" | "m-right" | "p-top" | ...`,
            },
            tags: ["TypeScript", "Advanced"],
          },
          {
            id: "fe-ts-compiler",
            title: "TypeScript Compiler & tsconfig Deep Dive",
            shortDesc: "How `tsc` works, key compiler flags that affect correctness, and project references for monorepos.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "Compilation phases: parse → type check → emit (or transpile-only mode).",
              "`strict` mode: enables strictNullChecks, noImplicitAny, strictFunctionTypes, and more.",
              "`target` & `lib`: control output syntax and available runtime APIs.",
              "`paths` & `baseUrl`: module aliasing for cleaner imports.",
              "Project References: incremental builds across multi-package repos.",
            ],
            content: `## Why This Matters

The TypeScript compiler (\`tsc\`) is more than a type checker — it is a full compilation pipeline that determines how fast your CI runs, whether your production code contains dead code, and how much of your team's time is spent debugging type errors. The \`tsconfig.json\` flags you choose directly impact developer experience, runtime correctness, and build performance. As a CTO or lead engineer, understanding the compiler means you can make informed trade-offs between strictness and productivity.

## The Compilation Pipeline

\`tsc\` operates in four distinct phases:

\`\`\`
Source Files → Scanner → Parser → Binder → Checker → Emitter → Output
                     ↓
                Preprocessor (resolves imports, loads declarations)
\`\`\`

### Phase 1: Scanner & Parser

The scanner tokenizes source code into tokens (\`interface\`, \`<\`, \`string\`, \`>\`, \`{\`, etc.). The parser consumes these tokens to build an **Abstract Syntax Tree (AST)** — a tree representation of the program's syntactic structure. Parser errors (e.g., missing parentheses, unmatched braces) are the first things reported.

### Phase 2: Binder

The binder creates **Symbols** for every declaration (variables, types, functions, classes) and builds the **scope tree**. This is where the binder connects identifiers to their declarations — resolving which \`foo\` refers to which \`foo\`. Each Symbol stores type information, declarations, and the symbol's container (module, namespace, etc.).

### Phase 3: Type Checker

The checker walks the AST annotated with Symbols and evaluates every expression's type. It reports type errors, checks assignability, resolves generics, and evaluates conditional types. This is the slowest phase — the checker may visit the same node multiple times through different paths (e.g., checking a generic function once for each concrete instantiation).

### Phase 4: Emitter

The emitter transforms the AST (after type checking) into output files. It handles:
- **Downlevel emit:** Converting ES2024 syntax to ES2015 (or whatever \`target\` specifies)
- **Module resolution:** Converting ESM imports to CommonJS (if \`module\` is set to CommonJS)
- **Declaration emit:** Generating \`.d.ts\` files
- **Source maps:** Generating \`.js.map\` files for debugging

### Transpile-Only Mode

Tools like \`ts-loader\`, \`esbuild\`, and \`swc\` skip the type checker entirely, going from parser directly to emitter with minimal type information. This is why Vite builds are 10-100x faster than \`tsc\` — they trade correctness guarantees for speed. In CI, you need both: type checking (\`tsc --noEmit\`) for correctness and a fast transpiler for output.

## Key \`tsconfig.json\` Flags

### The \`strict\` Family

\`strict: true\` enables a bundle of individual checks. Here's what each does:

| Flag | Effect | Why It Matters |
|------|--------|---------------|
| \`strictNullChecks\` | \`null\` and \`undefined\` are not assignable to other types | Catches \`Cannot read property of null\` — the #1 runtime error in JS |
| \`noImplicitAny\` | Errors if a variable/parameter has an implicit \`any\` type | Prevents type checking from silently skipping code |
| \`strictFunctionTypes\` | Enforces contravariance on function parameter types | Catches unsound callback passing that could cause runtime errors |
| \`strictBindCallApply\` | Type-checks \`.bind\`, \`.call\`, \`.apply\` arguments | Prevents argument count mismatches |
| \`strictPropertyInitialization\` | Class properties must be initialized in the constructor | Catches uninitialized state in class instances |
| \`noUncheckedIndexedAccess\` | Accessing indexed properties adds \`\| undefined\` | Catches missing array/object properties |

### Module Resolution

\`\`\`json
{
  "compilerOptions": {
    "moduleResolution": "bundler",     // For Vite/Webpack/tsup — resolves like a bundler
    "module": "esnext",                // Output ESM syntax
    "moduleDetection": "force"         // Treat all files as modules (TS 4.7+)
  }
}
\`\`\`

The \`moduleResolution\` options in order of strictness:

1. \`classic\` — Legacy, don't use.
2. \`node\` — Node.js CJS resolution (\`require\`). No extension resolution for ESM.
3. \`node16\` / \`nodenext\` — Node.js ESM-aware resolution. Requires file extensions in imports (\`./foo.js\` — not \`./foo\`).
4. \`bundler\` — Modern bundler resolution. Allows extensionless imports, wildcards. Most permissive, but may miss issues that \`nodenext\` would catch.

### \`paths\` and \`baseUrl\`

Module aliasing for cleaner imports:

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
\`\`\`

Now \`import { Button } from "@components/Button"\` resolves to \`src/components/Button\`. This improves readability and makes refactoring easier (moving files only requires updating \`paths\`, not every import).

### \`target\` vs \`lib\`

- \`target\`: The output JavaScript syntax version. \`ES2022\` emits class fields, async iteration, etc. \`ES2015\` downlevels everything to ES5.
- \`lib\`: The type definitions available at runtime. \`ES2023\` includes \`Array.findLast\`, \`Set.intersection\`, etc. If \`target\` is low but \`lib\` is high, type checking uses the high-level types but the emitter downlevels syntax.

**Common mistake:** Setting \`target: "ES5"\` with \`lib: ["ES2023"]\`. TypeScript will type-check using ES2023 features, but emit ES5 code that won't have those features at runtime. \`target\` and \`lib\` should be consistent.

## Project References for Monorepos

TypeScript's biggest architectural feature for monorepos:

\`\`\`json
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,            // Enables project references
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../shared" }
  ]
}
\`\`\`

\`\`\`json
// tsconfig.json (root)
{
  "references": [
    { "path": "packages/core" },
    { "path": "packages/shared" },
    { "path": "packages/server" }
  ]
}
\`\`\`

Project References provide:

1. **Incremental builds:** \`tsc --build\` only rebuilds changed projects and their dependents. For a monorepo with 50 packages, this reduces CI type-checking from 5 minutes to 10 seconds.
2. **Isolation:** Each project has its own \`tsconfig\`. A change in \`packages/core\` that breaks \`packages/server\` is caught at build time, not at authoring time.
3. **Clear boundaries:** The \`.d.ts\` files in \`outDir\` define the public API. Anything not exported is invisible to consumers.

### Incremental Mode

\`\`\`json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
\`\`\`

With \`incremental: true\`, \`tsc\` caches the compilation graph to a \`.tsbuildinfo\` file. On subsequent runs, it skips files whose timestamps haven't changed. This reduces re-check time by 80-95% in CI and locally.

## CTO-Level Takeaways

1. **Always enable \`strict: true\`.** The individual strict flags collectively prevent more bugs than any ESLint plugin. The only exception is migration projects where disabling specific flags temporarily smooths the transition.
2. **Use \`tsc --noEmit\` for CI type checking.** This runs the full type checker without write overhead. Use a fast transpiler (esbuild, swc, tsup) for actual output.
3. **Adopt Project References for monorepos.** Monorepos without project references eventually hit a wall where \`tsc\` takes 10+ minutes. Project references + \`--build\` mode is the solution.
4. **Set \`moduleResolution: "bundler"\` if you use a bundler.** It matches how bundlers actually resolve modules, avoiding false-positive errors from \`node\` resolution.
5. **Profile slow compilation.** Run \`tsc --generateTrace trace\` and open \`chrome://tracing\` to load the trace. The bottleneck is almost always complex generic types in a single file.
6. **Standardize \`tsconfig\` across the organization.** Use a shared base config (\`@org/tsconfig\`) and extend it per project. This ensures consistency and makes it easy to update strictness across all projects.
;`,
            tags: ["TypeScript", "Tooling"],
          },
        ],
      },
      {
        id: "fe-frameworks",
        title: "UI Frameworks & Architecture",
        description: "How React, Vue, Svelte, and others solve the same core problem — and the architectural patterns that scale.",
        topics: [
          {
            id: "fe-virtual-dom",
            title: "Virtual DOM & Reconciliation",
            shortDesc: "How React's diffing algorithm minimizes DOM mutations — and why keys matter.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Virtual DOM: a lightweight JS representation of the real DOM tree.",
              "Reconciliation: comparing old and new vDOM trees to produce a minimal set of DOM mutations.",
              "Heuristic diffing: O(n) algorithm assuming same-position = same component type.",
              "`key` prop: helps React identify which list items changed, moved, or were removed.",
              "Fiber architecture: React's incremental rendering engine — suspends, resumes, and prioritizes work.",
            ],
            content: `## Why This Matters

The Virtual DOM is React's most famous innovation — and its most misunderstood. Many developers think "Virtual DOM means React is fast." The truth is more nuanced: the Virtual DOM is an *abstraction* that makes declarative UI programming possible, with the reconciliation algorithm serving as the bridge between your declarative code and the imperative DOM. Understanding how reconciliation actually works is essential for debugging performance issues, structuring component trees, and knowing when to reach for keys, memoization, or refactoring.

## What the Virtual DOM Actually Is

The Virtual DOM is a lightweight JavaScript object tree that mirrors the structure of the real DOM. Each node in the tree is a plain object representing a DOM element:

\`\`\`typescript
// Simplified vDOM node
interface VNode {
  type: 'div' | 'span' | 'h1' | string;  // HTML tag name
  props: { [key: string]: any };           // Attributes, event listeners, children
  children: VNode[] | string | null;       // Child nodes or text content
  key?: string | number;                   // Identity key for list reconciliation
}
\`\`\`

When you write JSX:

\`\`\`tsx
<div className="container">
  <h1>Hello</h1>
  <p>World</p>
</div>
\`\`\`

React compiles it to:

\`\`\`javascript
React.createElement('div', { className: 'container' },
  React.createElement('h1', null, 'Hello'),
  React.createElement('p', null, 'World')
)
\`\`\`

Which produces the vDOM tree:

\`\`\`javascript
{
  type: 'div',
  props: { className: 'container' },
  children: [
    { type: 'h1', props: {}, children: 'Hello' },
    { type: 'p', props: {}, children: 'World' }
  ]
}
\`\`\`

The key insight: **creating and comparing vDOM trees is cheap** (just object creation and property comparison). **Mutating the real DOM is expensive** (triggers layout, paint, compositing). The reconciliation algorithm optimizes by finding the minimal set of DOM mutations needed to transition from one state to the next.

## Reconciliation: The Diffing Algorithm

React's reconciliation algorithm is based on two key heuristics:

1. **Elements of different types produce different trees.** If the root element changes from \`<div>\` to \`<span>\`, React tears down the entire old tree and builds a new one from scratch.
2. **Keys help identify children across renders.** Without keys, React uses index-based matching for lists, which can produce incorrect results.

### The Algorithm Step by Step

When a component re-renders, React compares the new vDOM tree against the old one (the "current" fiber tree):

\`\`\`
Step 1: Compare root nodes
├── Different type → Tear down old subtree, mount new subtree (full reset)
└── Same type → Update DOM attributes, recurse into children

Step 2: Compare children
├── Same number of children → Diff each child by position
└── Different number or keys → Run keyed reconciliation
\`\`\`

\`\`\`typescript
// Case 1: Different root type — full reset
// Before: <div><Counter /></div>
// After:  <span><Counter /></span>
// Result: entire div and Counter unmount, span and new Counter mount

// Case 2: Same type, same attributes — skip
// Before: <div className="container">
// After:  <div className="container">
// Result: no DOM operation needed

// Case 3: Same type, different props — update
// Before: <div className="old">
// After:  <div className="new">
// Result: className attribute updated
\`\`\`

### Keyed Reconciliation for Lists

Without keys, React matches children by index:

\`\`\`tsx
// Before: [<li>A</li>, <li>B</li>, <li>C</li>]
// After:  [<li>A</li>, <li>B</li>]

// React matches by index:
// A[0] ↔ A[0] — same text, keep
// B[1] ↔ B[1] — same text, keep
// C[2] — removed

// This works for appending/prepending:
// Before: [<li>A</li>]
// After:  [<li>X</li>, <li>A</li>, <li>Y</li>]

// Without keys (index-based):
// A[0] ↔ X[0] — text changed! Re-render li 0
// [1]  ↔ A[1] — new! Insert li 1 (with text A)
// [2]  ↔ Y[2] — new! Insert li 2 (with text Y)
// Result: 1 re-render + 2 inserts — wasteful but correct for static content

// With keys:
// [key=a] ↔ [key=a] — same key, keep
// [key=x] → new — Insert
// [key=y] → new — Insert
// Result: 2 inserts — optimal
\`\`\`

**The critical "key without value" bug:**

\`\`\`tsx
// BAD: Using index as key — unstable on reorder
{items.map((item, index) => <li key={index}>{item.name}</li>)}

// BAD: Using random key — changes every render, defeats reconciliation
{items.map(item => <li key={Math.random()}>{item.name}</li>)}

// GOOD: Stable, unique ID
{items.map(item => <li key={item.id}>{item.name}</li>)}
\`\`\`

Using \`key={index}\` is safe only for static lists that never change order. For any list that can be reordered, filtered, or have items inserted at arbitrary positions, missing stable keys causes React to unnecessarily re-render DOM elements, potentially losing input state, scroll position, or animation state.

## Fiber Architecture: React's Incremental Rendering Engine

React 16 introduced **Fiber**, a complete rewrite of the reconciliation engine. Fiber enables:

1. **Interruptible rendering:** The reconciler can pause work, yield to the browser, and resume later. This prevents long renders from blocking the main thread and causing jank.
2. **Priority-based scheduling:** Urgent updates (user input, animations) are processed before non-urgent ones (data fetching results, background sync).
3. **Concurrent features:** Suspense, transitions, and automatic batching all depend on Fiber's ability to pause and resume work.

### How Fiber Works

Each component instance is represented by a **Fiber node** — a JavaScript object that stores the component's state, props, effects, and connections to sibling/parent/child fibers:

\`\`\`typescript
interface Fiber {
  tag: number;           // Component type (FunctionComponent, ClassComponent, HostComponent)
  type: any;             // The actual component function/class/tag
  stateNode: any;        // Instance (DOM element for host, component instance for classes)
  return: Fiber | null;  // Parent fiber
  child: Fiber | null;   // First child fiber
  sibling: Fiber | null; // Next sibling fiber
  memorizedState: any;   // Hooks linked list
  memorizedProps: any;   // Props from last render
  pendingProps: any;     // New props to process
  flags: number;         // Effects to apply (Placement, Update, Deletion)
  lanes: number;         // Priority level
  alternate: Fiber;      // Link to the "work-in-progress" copy
}
\`\`\`

The fiber tree is a **linked list** (not a recursive tree). This is what makes interruption possible — instead of a deep recursive call stack that cannot be paused, Fiber walks the linked list one node at a time, checking the elapsed time between each node and yielding if necessary.

\`\`\`
Fiber traversal order (depth-first):
A → child(B) → child(C) → sibling(D) → child(E) → return(F) → sibling(G)...
\`\`\`

### Work Loop

\`\`\`javascript
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;  // Check if we should yield
  }
  if (!nextUnitOfWork) {
    commitRoot();  // All work done — apply mutations to DOM
  }
  requestIdleCallback(workLoop);
}
\`\`\`

The render phase (building the work-in-progress fiber tree) is interruptible and can be paused. The commit phase (applying DOM mutations) is synchronous and non-interruptible — this ensures the UI never shows a half-updated state.

## CTO-Level Takeaways

1. **Keys are non-negotiable for dynamic lists.** Enforce \`react/no-array-index-key\` in your ESLint config. Every list item rendered from dynamic data must have a stable, unique key.
2. **Understand what triggers reconciliation.** A parent re-render re-reconciles all children, even if their props haven't changed. Use \`React.memo\` for expensive subtrees that re-render without prop changes.
3. **Prefer composition over nesting.** Deeply nested component trees increase reconciliation cost. Flat component structures are faster and easier to profile.
4. **Profile before optimizing.** The React DevTools Profiler shows exactly which components re-rendered and why. Don't add \`useMemo\`/\`useCallback\` everywhere — add them where the profiler shows unnecessary re-renders.
5. **Concurrent features are safe to adopt incrementally.** \`startTransition\` and \`useDeferredValue\` work with existing code and improve perceived performance without architectural changes.
;`,
            tags: ["React", "Architecture"],
          },
          {
            id: "fe-react-hooks",
            title: "React Hooks: Mental Model & Common Pitfalls",
            shortDesc: "What hooks are doing under the hood — the rules, the closure traps, and how to think about effects.",
            difficulty: "intermediate",
            readTimeMin: 10,
            keyPoints: [
              "Hooks are linked list entries attached to the fiber — order must never change between renders.",
              "useState: schedules a re-render; the setter function is referentially stable.",
              "useEffect: runs after paint; cleanup runs before next effect or unmount.",
              "Stale closure trap: effects close over a snapshot of state — use refs or functional updaters to escape.",
              "useMemo / useCallback: memoize expensive computations or stable references for child components.",
            ],
            content: `## Why This Matters

React Hooks transformed how the React ecosystem builds components, but their mental model is fundamentally different from class components — and from most other programming paradigms. Hooks are not magic; they are a linked list attached to a fiber node, with strict rules about ordering and execution. Misunderstanding this model is the #1 source of bugs in modern React apps: stale closures, infinite re-render loops, and effects that run at the wrong time. Mastering hooks means understanding the fiber render cycle, closure capture, and the lifecycle of a React component's state.

## The Fiber + Linked List Model

Hooks are stored as a **singly linked list** attached to the component's Fiber node. Each hook call in the component (\`useState\`, \`useEffect\`, \`useRef\`) creates a new node in this list:

\`\`\`typescript
// Simplified structure of a hook node on the fiber
interface Hook {
  memorizedState: any;    // For useState: the current value
                          // For useEffect: the effect cleanup/destroy function
                          // For useRef: the { current } object
  next: Hook | null;      // Next hook in the linked list
  queue: UpdateQueue;     // Pending state updates
  baseState: any;         // The state before the current render
}
\`\`\`

When the component renders for the first time (mount):

\`\`\`
function MyComponent() {
  const [count, setCount] = useState(0);     // Hook #1
  const [name, setName] = useState("");       // Hook #2
  useEffect(() => { ... }, [count]);          // Hook #3
  const ref = useRef(null);                  // Hook #4
}
\`\`\`

React builds: \`Hook #1 → Hook #2 → Hook #3 → Hook #4\`

On re-render, React walks the same linked list in the same order. **This is why hooks cannot be inside conditions, loops, or early returns** — the order must be identical between renders.

\`\`\`typescript
// ❌ BREAKS THE RULES — hooks order changes
function BadComponent({ flag }) {
  const [count, setCount] = useState(0);
  if (flag) {
    const [name, setName] = useState("");  // Hook #2 only sometimes!
  }
  useEffect(() => { ... }, []);            // Order changes — React crashes
}

// ✅ CORRECT — hooks always execute in the same order
function GoodComponent({ flag }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  useEffect(() => { ... }, []);
}
\`\`\`

## useState: The State Hook

\`useState\` returns a tuple of the current value and a setter function. The setter is **referentially stable** — it's the same function reference across renders, which means it doesn't cause unnecessary re-renders when passed as a prop.

\`\`\`typescript
const [count, setCount] = useState(0);

// Setter forms:
setCount(5);              // Direct value
setCount(prev => prev + 1);  // Functional updater — uses previous state

// Functional form is essential when the new state depends on the old,
// AND when the update might be batched with other updates:
function handleClick() {
  setCount(c => c + 1);
  setCount(c => c + 1);
  setCount(c => c + 1);
  // With batching: count is incremented by 3
  // Without functional form: last setCount(1) wins
}
\`\`\`

**State updates are batched** since React 18 — multiple \`setState\` calls in the same event handler are grouped into a single re-render. The functional updater form (\`prev => prev + 1\`) is the only way to reliably compute the next state from the previous one within a batch.

## useEffect: The Synchronization Hook

\`useEffect\` is the most misunderstood hook. It is **not** a lifecycle event (\`componentDidMount\`, \`componentDidUpdate\`). It is a **synchronization mechanism**: it synchronizes your component with external systems (network, DOM, timers, subscriptions).

\`\`\`typescript
useEffect(() => {
  // Effect function — runs after the browser paints
  // Setup: subscribe, fetch, attach listeners

  return () => {
    // Cleanup function — runs before the component unmounts
    // OR before the effect re-runs (when deps change)
    // Cleanup: unsubscribe, abort fetch, detach listeners
  };
}, [dependency1, dependency2]);
\`\`\`

### Effect Lifecycle (React 18+ Strict Mode)

In development with Strict Mode, effects run twice (mount → cleanup → mount) to detect missing cleanup. The production behavior is:

\`\`\`
Mount:        run effect
Re-render (dep changed): cleanup old effect → run new effect
Re-render (dep unchanged): (nothing — skip)
Unmount:      cleanup
\`\`\`

### The Stale Closure Trap

The most common React bug: an effect captures a state value from the render when the effect was created, but the state has since changed.

\`\`\`typescript
// BAD: count is captured once, never updates
function TimerBad() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);  // count is always 0 — captured at mount
    }, 1000);
    return () => clearInterval(id);
  }, []);  // Empty deps — effect never re-runs, count is stale
}

// FIX 1: Include the dependency
function TimerGood1() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [count]);  // Re-creates interval every second — works but wasteful
}

// FIX 2: Functional updater — no dependency needed
function TimerGood2() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);  // Always uses latest state
    }, 1000);
    return () => clearInterval(id);
  }, []);  // No stale closure — interval never re-created
}

// FIX 3: useRef for the latest value
function TimerGood3() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current);  // Always reads latest
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
}
\`\`\`

## useMemo and useCallback

These hooks memoize values and function references:

\`\`\`typescript
// useMemo: memoizes the RESULT of a computation
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// useCallback: memoizes a FUNCTION reference
const handleClick = useCallback(
  (id: number) => {
    setSelected(id);
  },
  [setSelected]  // setSelected is stable, so handleClick is stable
);
\`\`\`

**When to use them:**
- When the computation is expensive (profiled, >1ms)
- When the value/function is a dependency of another hook
- When the function is passed to \`React.memo\` wrapped child

**When NOT to use them:**
- Everywhere (premature memoization adds overhead)
- For primitive values (numbers, strings — they're compared by value, not reference)

React 19 introduces the React Compiler which automatically adds memoization. Until then, manual memoization is a performance optimization, not a correctness requirement.

## useRef: The Escape Hatch

\`useRef\` returns a mutable object that persists across renders. Changing \`.current\` does NOT trigger a re-render.

\`\`\`typescript
function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();  // Access DOM node after mount
  }, []);

  return <input ref={inputRef} />;
}
\`\`\`

\`useRef\` is also used to store values that must persist across renders without causing re-renders — previous state, timer IDs, mutable caches.

## CTO-Level Takeaways

1. **Enforce the Rules of Hooks.** Use \`eslint-plugin-react-hooks\` with \`rules-of-hooks\` and \`exhaustive-deps\`. These are not suggestions — they prevent bugs that are extremely hard to debug.
2. **Understand effect dependencies.** Every variable from the component scope used inside an effect must be in the dependency array. The linter will tell you this. Listen to it.
3. **Use functional state updates.** \`setState(prev => ...)\$ avoids stale closure issues in effects and event handlers.
4. **Don't optimize prematurely.** \`useMemo\` and \`useCallback\` add code complexity and memory overhead. Profile first, optimize second.
5. **Strict Mode double-invocation is a feature, not a bug.** It surfaces missing cleanup in effects. Write cleanups for every effect that creates subscriptions, timers, or event listeners.
;`,
            tags: ["React", "Core"],
          },
          {
            id: "fe-signals",
            title: "Fine-Grained Reactivity & Signals",
            shortDesc: "The alternative to virtual DOM — how Solid.js, Vue 3, and Svelte 5 track dependencies with signals.",
            difficulty: "advanced",
            readTimeMin: 10,
            keyPoints: [
              "Signals: reactive primitives that track their own subscribers.",
              "Auto-tracking: reading a signal inside a computation registers a dependency automatically.",
              "No diffing required: updates target only the DOM nodes that depend on the changed signal.",
              "Solid.js: no component re-renders — components run once, setup subscriptions, done.",
              "Vue 3 reactivity: Proxy-based dependency tracking with an effect scheduler.",
            ],
            content: `## Why This Matters

For nearly a decade, the Virtual DOM with its diff-and-patch cycle was considered the state of the art for UI frameworks. But a new generation of frameworks — Solid.js, Vue 3, Svelte 5, Preact Signals, Angular 17+ — has popularized an alternative: **fine-grained reactivity** based on signals. Signals eliminate the Virtual DOM overhead entirely by tracking exactly which parts of the UI depend on which pieces of state. When a signal changes, only the specific DOM nodes that depend on it are updated. No diffing, no component re-rendering, no reconciliation. Understanding this model is essential for making informed framework choices and for understanding where the industry is heading.

## What Signals Are

A signal is a reactive primitive that holds a value and tracks which effects depend on it:

\`\`\`typescript
// Conceptual signal implementation
function createSignal<T>(initial: T) {
  let value = initial;
  const subscribers = new Set<() => void>();

  function read(): T {
    // Track: register current effect as subscriber (if inside an effect)
    if (currentEffect) subscribers.add(currentEffect);
    return value;
  }

  function write(newValue: T) {
    value = newValue;
    // Trigger: re-run all subscribed effects
    subscribers.forEach(fn => fn());
  }

  return [read, write] as const;  // In solid: [getter, setter]
}
\`\`\`

The core innovation is **auto-tracking**: when you read a signal's value inside a computation (an effect, a derived value, or a component), the signal automatically registers that computation as a subscriber. When the signal is written to, all subscribers are automatically re-executed.

## Signals vs Virtual DOM

| Aspect | Virtual DOM (React) | Signals (Solid, Vue 3) |
|--------|-------------------|----------------------|
| **Rendering model** | Component re-renders → diff → patch | Direct DOM node update |
| **Granularity** | Component-level | Individual DOM node / computed |
| **Overhead per update** | O(component tree) diff | O(dirty nodes) |
| **Memory** | vDOM trees for each component | Signal graphs + subscribers |
| **Initial render** | Generate vDOM tree, diff against empty | Mount directly |
| **Bundle size** | ~40KB (React + DOM) | ~4-15KB (Solid) |

### How Solid.js Uses Signals

Solid.js components run exactly once. They set up signal subscriptions and create DOM nodes during that single execution. When a signal changes, only the specific DOM nodes bound to that signal are patched:

\`\`\`tsx
// Solid.js component — runs once
function Counter() {
  const [count, setCount] = createSignal(0);

  // This creates a DOM text node and subscribes it to count
  // count() reads the signal, which auto-subscribes this effect
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <span>{count()}</span>  {/* Only this span updates */}
    </div>
  );
}
\`\`\`

No component re-renders ever occur. Clicking the button calls \`setCount\`, which triggers only the span's text node to update. The button, the div, and the component itself are never touched again.

### How Vue 3 Uses Proxies for Reactivity

Vue 3 wraps component data in JavaScript Proxies that intercept get/set operations:

\`\`\`typescript
const state = reactive({ count: 0 });

// When any computed/effect reads state.count:
//   Proxy traps the 'get' → registers dependency
// When state.count is set:
//   Proxy traps the 'set' → schedules all dependent effects

watchEffect(() => {
  console.log(state.count);  // Auto-subscribes
});

state.count++;  // Triggers the watchEffect
\`\`\`

Vue's reactivity system goes through an effect scheduler that batches updates and deduplicates — if you change \`state.count\` and \`state.name\` synchronously, the watcher runs only once.

### How Svelte 5 Uses Runes

Svelte 5 introduces **runes** — explicit reactive primitives that compile down to direct DOM manipulations:

\`\`\`svelte
<script>
  let count = $state(0);  // Rune: reactive state
  let doubled = $derived(count * 2);  // Rune: derived value

  function increment() {
    count += 1;  // Direct mutation — the compiler handles reactivity
  }
</script>

<button onclick={increment}>
  {count} × 2 = {doubled}
</button>
\`\`\`

The Svelte compiler analyzes the template and generates code that directly updates the text nodes when \`count\` changes. No runtime diffing. No component overhead.

## Performance Characteristics

Signals excel in specific scenarios:

1. **High-frequency updates:** Dragging, animating, or streaming data where a single value changes rapidly. React would re-render the entire component tree; signals update a single text node.
2. **Large static UIs with small dynamic parts:** A dashboard with 10,000 DOM nodes but only one updating counter. React would diff the entire tree; signals update one node.
3. **Memory-constrained environments:** Mobile web, embedded devices. Signals don't keep vDOM trees in memory.

Virtual DOM still wins in:
1. **Heavy structural changes:** When large parts of the tree change simultaneously (page transitions), the vDOM approach can batch updates more efficiently than cascading signal updates.
2. **Developer familiarity:** The React ecosystem, tooling, and hiring pool are vastly larger than Solid/Vue/Svelte.

## Composing with Signals: Derived Values and Effects

\`\`\`typescript
// Solid.js — derived signals (memoized computed values)
const [todos, setTodos] = createSignal<Todo[]>([]);
const activeTodos = createMemo(() => todos().filter(t => !t.completed));
// activeTodos only recomputes when todos() changes — not on unrelated updates

// Effects for side effects (like useEffect, but run synchronously):
createEffect(() => {
  console.log('Count changed:', count());
  // Runs whenever count() changes, tracks dependencies automatically
});
\`\`\`

The key difference from \`useEffect\` in React: Solid's \`createEffect\` runs **synchronously** after the DOM update, not asynchronously after paint. This means you can read DOM measurements in effects without missing frames.

## CTO-Level Takeaways

1. **Consider signals for performance-critical UIs.** If your app has real-time updates, animations, or large data grids, signal-based frameworks (Solid, Svelte, or Vue) will outperform React by a significant margin.
2. **The ecosystem matters more than the rendering model.** React's network effects (libraries, hiring, tooling, AI codegen) outweigh the Virtual DOM's performance overhead for most applications. Choose signals for performance-critical apps where you control the stack.
3. **Signals are coming to React indirectly.** Third-party signal libraries (Preact Signals, Legend-State) work with React, and the React Compiler aims to eliminate manual memoization. The gap is narrowing.
4. **Auto-tracking has a learning curve.** The implicit dependency tracking in signals can make data flow harder to reason about than React's explicit \`useEffect\` deps. Test coverage and code review are essential.
5. **Evaluate total cost of ownership.** Switching from React to Solid or Svelte means losing access to most React-specific libraries (React Query, React Router, etc.). The performance gains must outweigh the ecosystem loss.
;`,
            tags: ["Architecture", "Performance", "Svelte", "Solid"],
          },
          {
            id: "fe-state-management",
            title: "State Management Patterns",
            shortDesc: "Comparing flux, atomic, proxy, and server-state approaches — and when to reach for each.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Flux / Redux: unidirectional data flow — action → reducer → new state.",
              "Zustand: minimal store with a hook API — no Provider required.",
              "Jotai / Recoil: atomic state — derived state computed lazily from primitive atoms.",
              "Valtio: Proxy-based mutable state that re-renders only subscribers.",
              "TanStack Query: server-state as a first-class cache — fetching, caching, synchronizing.",
            ],
            content: `## Why This Matters

State management is the single most debated topic in frontend architecture. The reason is simple: as applications grow, the complexity of keeping UI in sync with state grows quadratically. Every pattern — from Redux to Zustand to Jotai to TanStack Query — represents a different answer to the same question: "Where should this piece of data live, and how should changes propagate?" Choosing the wrong pattern leads to prop drilling, synchronization bugs, unnecessary re-renders, and code that's hard to refactor. Choosing the right pattern (or combination of patterns) is the difference between a codebase that scales and one that collapses under its own weight.

## The State Management Landscape

Modern frontend state can be categorized into two fundamentally different kinds of state, each requiring different tools:

| Category | Description | Examples | Tools |
|----------|-------------|----------|-------|
| **Server State** | Data fetched from/ synced with a backend | User profile, dashboard data, messages | TanStack Query, RTK Query, SWR, Apollo |
| **Client State** | Data that exists only on the client | UI state, form input, theme, modals | Zustand, Jotai, Redux, Valtio, Context |

**The #1 mistake** in state management architecture is treating server state like client state — manually caching, invalidating, and synchronizing data that belongs to the server. This is why TanStack Query has become nearly universal in modern React apps: it eliminates entire categories of boilerplate by treating server state as a cache rather than application state.

## Pattern 1: Flux / Redux — Unidirectional Data Flow

Redux enforces a strict unidirectional flow: \`Action → Reducer → New State → UI Update\`. The key constraint: state is read-only and mutations happen through pure reducer functions.

\`\`\`typescript
// Action: a plain object describing what happened
type Action = { type: 'INCREMENT'; payload?: number }
  | { type: 'DECREMENT'; payload?: number };

// Reducer: pure function (prevState, action) => newState
function counterReducer(state = { count: 0 }, action: Action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + (action.payload ?? 1) };
    case 'DECREMENT':
      return { count: state.count - (action.payload ?? 1) };
    default:
      return state;
  }
}
\`\`\`

**When to use:** Large applications with complex state transitions that benefit from a strict audit trail. When undo/redo, time-travel debugging, or sophisticated middleware (saga, thunk) is needed.

**When NOT to use:** Small to medium apps. The boilerplate is significant. Redux Toolkit (RTK) reduces this considerably, but the mental overhead remains.

### Redux Toolkit (Contemporary Redux)

\`\`\`typescript
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => { state.count += 1; },  // Immer-powered mutability
    decrement: (state) => { state.count -= 1; },
  },
});

const store = configureStore({ reducer: counterSlice.reducer });
// store.dispatch(counterSlice.actions.increment());
\`\`\`

RTK eliminates most Redux boilerplate: action creators are auto-generated, reducers use Immer for mutable-style updates, and \`configureStore\` sets up middleware automatically.

## Pattern 2: Zustand — Minimal Store

Zustand provides a tiny (1KB) store API with no Provider required:

\`\`\`typescript
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// In component:
function Counter() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  // ... auto-selectors prevent unnecessary re-renders
}
\`\`\`

**Key features:** No Provider wrapper needed. Selectors control granular re-rendering. Middleware (persist, immer, devtools) is opt-in. TypeScript-first API.

**When to use:** Medium-sized apps that need a shared store without Redux overhead. The sweet spot for most applications.

## Pattern 3: Jotai / Recoil — Atomic State

Atomic state decomposes state into primitive "atoms" that can be composed:

\`\`\`typescript
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);
const doubledAtom = atom((get) => get(countAtom) * 2);  // Derived atom
const incrementAtom = atom(null, (get, set) => set(countAtom, get(countAtom) + 1));

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [doubled] = useAtom(doubledAtom);
  // ...
}
\`\`\`

**Key insight:** Derived atoms are lazily computed and only re-evaluate when their dependencies change. This creates a reactive dependency graph similar to signals, without the Virtual DOM overhead.

**When to use:** Complex state with many derived values. Apps where different parts of the UI need different "slices" of the same state.

## Pattern 4: Valtio — Proxy-Based Mutable State

Valtio uses JavaScript Proxies to make mutable state reactive:

\`\`\`typescript
import { proxy, useSnapshot } from 'valtio';

const state = proxy({ count: 0, todos: [] });

// Direct mutation — triggers re-render only in subscribers
state.count += 1;

function Counter() {
  const snap = useSnapshot(state);  // Returns a frozen snapshot
  // snap.count is read-only, re-renders only when count changes
  return <div>{snap.count}</div>;
}
\`\`\`

**When to use:** Form state, complex nested objects. The mutable API is familiar and reduces cognitive overhead. Best for state that doesn't need time-travel or action logs.

## Pattern 5: TanStack Query — Server State as Cache

TanStack Query (formerly React Query) treats server data as a cache rather than application state:

\`\`\`typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch — automatic caching, background refetching, stale detection
function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetch(\`/api/users/\${userId}\`).then(r => r.json()),
    staleTime: 30_000,  // Consider data fresh for 30 seconds
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes (formerly cacheTime)
  });
  // ...
}

// Mutate — optimistic updates, automatic cache invalidation
function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUser) => fetch('/api/users', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
\`\`\`

**Key features:** Automatic caching, deduplication, background refetching, pagination, infinite scroll, optimistic updates. Eliminates the need for manual loading/error/empty states.

**When to use:** Every app that fetches data from an API. It should be the default choice for server state.

## Choosing the Right Pattern

\`\`\`
Project Type                    Recommended Approach
─────────────────────────────────────────────────────
Small app (<5 pages)            Server: TanStack Query / SWR
                                Client: useState + Context

Medium app                       Server: TanStack Query
                                 Client: Zustand or Jotai

Large enterprise app             Server: TanStack Query or RTK Query
                                 Client: Redux Toolkit or Zustand

Form-heavy app                   Server: TanStack Query
                                 Client: Valtio or Form libraries (React Hook Form)

Real-time dashboard              Server: TanStack Query + WebSocket
                                 Client: Signals (via solid-js or preact-signals)
\`\`\`

## CTO-Level Takeaways

1. **Separate server state from client state.** TanStack Query should be the default choice for API data. Manual \`useEffect\` + \`useState\` for fetching is legacy code.
2. **Use Zustand as the default client store.** It's simple, performant, and TypeScript-native. Reach for Redux only when you need its middleware ecosystem or time-travel debugging.
3. **Avoid over-centralizing.** Not all state needs to be in a global store. Component state (\`useState\`) is fine for UI state. "Lift state up" only when genuinely shared.
4. **Standardize on one approach.** Nothing is worse than a codebase with Context, Redux, Zustand, and Jotai all in use. Choose one client state solution and use it consistently.
5. **Re-evaluate Context.** React Context is not a state management tool — it's a dependency injection mechanism. Every value change in Context re-renders ALL consumers. Use it for themes, localization, and auth — not for frequently updating data.
6. **Cache invalidation is the hard part.** TanStack Query's automatic cache invalidation on mutations eliminates the most error-prone part of state management — coordinating fetches and updates.
;`,
            tags: ["Architecture", "React", "Patterns"],
          },
        ],
      },
      {
        id: "fe-rendering",
        title: "Rendering Strategies",
        description: "Choosing between CSR, SSR, SSG, ISR, and RSC — and understanding the hydration cost.",
        topics: [
          {
            id: "fe-csr-ssr",
            title: "CSR vs SSR vs SSG vs ISR",
            shortDesc: "When and why to render on the client, the server, at build time, or on demand — with concrete trade-offs.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "CSR: fast TTFB, slow FCP — server sends empty shell, JS renders everything.",
              "SSR: HTML on every request — good TTFB, hydration cost adds TTI overhead.",
              "SSG: pre-rendered at build time — fastest delivery, but stale data risk.",
              "ISR (Incremental Static Regeneration): SSG + background regeneration on a TTL.",
              "Choosing: frequency of data change × SEO requirements × personalization needs.",
            ],
            content: `## Why This Matters

Every web application must answer the same question: where should the HTML be generated? The answer determines your Time to First Byte (TTFB), First Contentful Paint (FCP), Time to Interactive (TTI), SEO capabilities, and infrastructure costs. Choosing the wrong rendering strategy for your use case is the single most impactful performance mistake you can make — it determines the entire architecture of your application. Understanding CSR, SSR, SSG, and ISR means you can make an intentional, data-driven choice rather than following the framework default.

## The Four Strategies Compared

### Client-Side Rendering (CSR)

The browser receives an empty HTML shell (or nearly empty), fetches JavaScript, and the JavaScript renders everything.

\`\`\`
Request → Server returns <div id="root"></div> + script tags
        → Browser downloads JS bundle
        → React mounts
        → Fetch API data
        → DOM populated
\`\`\`

| Metric | Value |
|--------|-------|
| TTFB | **Fastest** — minimal server processing |
| FCP | **Slow** — must wait for JS download + parse + execute + API |
| TTI | **Same as FCP** (or later) — single HTML + JS bundle |
| SEO | **Poor** — crawlers may not execute JS |
| Server cost | **Lowest** — static file server only |

**Best for:** Admin panels, dashboards, authenticated apps behind a login (where SEO doesn't matter).

### Server-Side Rendering (SSR)

The server generates the full HTML on each request and sends it to the client. The client then hydrates to make it interactive.

\`\`\`
Request → Server runs React.renderToString → Server sends full HTML
        → Browser paints HTML immediately (FCP achieved)
        → Downloads JS bundle
        → Hydrates (makes HTML interactive) → TTI achieved
\`\`\`

| Metric | Value |
|--------|-------|
| TTFB | **Slower than CSR** — server must render HTML |
| FCP | **Fast** — browser paints HTML immediately |
| TTI | **Delayed by hydration** — JS must download and hydrate |
| SEO | **Excellent** — full HTML content |
| Server cost | **Higher** — CPU for every request |

**Best for:** Public-facing apps with dynamic content (e-commerce, social media, news).

### Static Site Generation (SSG)

HTML is generated at build time and served as flat files from a CDN.

\`\`\`
Build → Run React.renderToString for every page → Output .html files
Deploy → Serve .html files from CDN
Request → CDN serves pre-built HTML immediately
\`\`\`

| Metric | Value |
|--------|-------|
| TTFB | **Fastest possible** — CDN edge |
| FCP | **Fastest** — HTML arrives immediately |
| TTI | **Delayed by hydration** (if interactive) |
| SEO | **Excellent** |
| Server cost | **Zero** — CDN only |
| Freshness | **Stale** — content is from build time |

**Best for:** Blogs, marketing pages, documentation, landing pages.

### Incremental Static Regeneration (ISR)

Hybrid of SSG and SSR: static pages generated at build time (or on first request), then re-generated in the background on a TTL.

\`\`\`
First request: Generate HTML on-demand (like SSR), cache it → Serve
Subsequent requests: Serve cached HTML
After TTL: Serve stale cached HTML while regenerating in background → Update cache
\`\`\`

| Metric | Value |
|--------|-------|
| TTFB | **Fast** — cached HTML served |
| FCP | **Fast** |
| TTI | **Delayed by hydration** |
| SEO | **Excellent** |
| Freshness | **Configurable** — TTL determines staleness window |

**Best for:** Content-driven sites with moderate update frequency (blogs with new posts daily, e-commerce catalogs with infrequent price changes).

## How to Choose

\`\`\`
Question 1: Is SEO important?
  No  → CSR (or SSR if you need fast FCP)
  Yes → Go to Question 2

Question 2: Is the data per-request dynamic?
  No (same for all users, changes infrequently) → SSG (fastest)
  Yes → Go to Question 3

Question 3: Can you tolerate stale data?
  Yes → ISR
  No → SSR (or streaming SSR)
\`\`\`

### The Hydration Tax

All strategies except CSR share one cost: **hydration**. Even with SSG, if the page has interactive React components, the browser must download and execute React, then hydrate the HTML to attach event listeners. The HTML is visible instantly, but the page is not interactive until hydration completes. This gap between FCP and TTI is called the **uncanny valley** of SSR — the user sees a page but can't interact with it.

## Streaming SSR

Modern SSR (React 18+, Next.js App Router) supports **streaming**: the server sends HTML in chunks as it becomes available, rather than waiting for the entire page to render.

\`\`\`
Request → Server starts rendering
        → Sends header/nav/shell immediately
        → Wraps slow data in <Suspense>
        → Sends placeholder for slow parts
        → Data resolves → Sends the rest
        → Browser progressively paints
\`\`\`

Streaming eliminates the "all or nothing" problem of traditional SSR — the user sees content sooner, and slow data boundaries don't block the rest of the page.

## CTO-Level Takeaways

1. **Start with SSG for content sites, SSR for apps.** These are the default choices for most projects. CSR and ISR are specializations, not defaults.
2. **Measure the hydration gap.** Profile TTI vs FCP on 3G networks. If the gap is >3 seconds, investigate partial hydration or islands architecture.
3. **SSR is not free.** Each SSR request consumes server CPU. Estimate your request rate × render time to determine whether SSR costs are acceptable or you need caching.
4. **ISR is not "SSG with updates."** It requires careful cache invalidation strategy. On-demand revalidation (triggered by webhooks on content changes) is superior to time-based revalidation for most use cases.
5. **Consider hybrid approaches.** Not every page needs the same strategy. Your marketing landing page can be SSG, while the product dashboard is CSR. Modern frameworks (Next.js, Astro, Nuxt) support per-page strategy selection.
;`,
            tags: ["Architecture", "Performance"],
          },
          {
            id: "fe-rsc",
            title: "React Server Components (RSC)",
            shortDesc: "Server-only components, the client-server boundary, and the RSC wire protocol.",
            difficulty: "advanced",
            readTimeMin: 11,
            keyPoints: [
              "Server Components: run only on the server, never hydrated — zero JS sent to client.",
              "Client Components: `'use client'` directive marks the boundary.",
              "RSC wire format: a JSON-like serialization of the server component tree streamed to the client.",
              "Server Actions: async functions that run on the server, invoked directly from client components.",
              "Streaming: Suspense boundaries allow progressive HTML flushing before data resolves.",
            ],
            content: `## Why This Matters

React Server Components (RSC) represent the most significant shift in React architecture since Hooks. RSC fundamentally changes the boundary between server and client: instead of "render everything on the server" (SSR) or "render everything on the client" (CSR), RSC lets you decide on a component-by-component basis what runs where. This eliminates the largest category of frontend performance problems — sending JavaScript to the client that never needed to be there. For CTOs evaluating Next.js or any RSC-compatible framework, understanding the RSC model is essential to making informed decisions about architecture, caching, and data fetching.

## The Core Idea

In traditional React, every component runs on both the server (for SSR) and the client (for hydration). RSC introduces a split:

- **Server Components:** Execute only on the server. Never sent to the client. Zero JavaScript overhead. Can directly access databases, filesystems, and backend services.
- **Client Components:** Execute on both server (for SSR HTML) and client (for hydration/interactivity). Marked with a \`'use client'\` directive.

\`\`\`tsx
// ServerComponent.tsx — NO 'use client' directive
// This runs ONLY on the server. Zero JS sent to the browser.
async function ProductList() {
  const products = await db.product.findMany();  // Direct DB access!
  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.name} — {p.price}</li>
      ))}
    </ul>
  );
}

// ClientComponent.tsx — HAS 'use client' directive
// This runs on server (SSR) AND client (hydration)
'use client';
function AddToCart({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);
  return (
    <button onClick={() => { addToCart(productId); setAdded(true); }}>
      {added ? '✓ Added' : 'Add to Cart'}
    </button>
  );
}
\`\`\`

### The Client Boundary

When a Server Component imports a Client Component, it creates a "client boundary." All children of the Client Component are also client-evaluated. Server Components and Client Components can be freely composed, but data flows in one direction: Server → Client (as props).

\`\`\`tsx
// Parent (Server Component) → can use Server or Client children
async function Page() {
  const product = await getProduct(params.id);

  return (
    <div>
      {/* Server Component child — zero JS */}
      <ProductDescription product={product} />

      {/* Client Component child — boundary created here */}
      <AddToCart productId={product.id} />

      {/* Lifting Client Components up: the AddToCart is the leaf
          that needs interactivity. Keeping ProductDescription on
          the server minimizes the client JS bundle. */}
    </div>
  );
}
\`\`\`

## The RSC Wire Protocol

When a Server Component renders, it produces a **serialized JSON-like output** that describes the resulting tree. This is **not HTML** — it's a specialized format that React can use on the client to reconstruct the component tree without re-executing the Server Component.

\`\`\`
// Simplified RSC wire format:
[
  { type: "$", key: null, props: { children: [
    { type: "ul", props: { children: [
      { type: "li", props: { children: "Widget — $19.99" } },
      { type: "li", props: { children: "Gadget — $29.99" } },
    ] } },
    // Client Component references are preserved:
    { type: "#1", props: { productId: "123" } },  // Reference to AddToCart
  ] } }
]
\`\`\`

The client receives this stream and interleaves it with Client Component JavaScript. The result: the page is interactive as soon as React can process the stream, without waiting for the Server Component's JS to download (because it never will — there is no Server Component JS).

## Streaming and Suspense

RSC integrates deeply with React Suspense for streaming:

\`\`\`tsx
async function ProductPage({ params }) {
  return (
    <div>
      <h1>Product</h1>
      <Suspense fallback={<ProductSkeleton />}>
        {/* This component suspends while fetching from DB.
            The server streams the fallback immediately,
            then replaces it with the actual content when ready. */}
        <ProductDetails id={params.id} />
      </Suspense>
    </div>
  );
}
\`\`\`

When the server encounters \`<Suspense>\`, it flushes the fallback HTML to the client immediately, continues rendering the Server Component, and streams the result when ready. The client progressively updates the UI — no client-side loading spinners needed.

## Server Actions

Server Actions (React 19 / Next.js App Router) allow Client Components to invoke server-side functions directly:

\`\`\`tsx
'use server';  // This file's exports are Server Actions
export async function submitContactForm(prevState: any, formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');

  // Validate
  if (!email || !email.includes('@')) {
    return { error: 'Invalid email' };
  }

  // Direct DB access — no API route needed
  await db.contact.create({ data: { name, email } });

  return { success: true };
}
\`\`\`

\`\`\`tsx
'use client';
import { submitContactForm } from './actions';

function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, {});
  // formAction is a Server Action — called via fetch under the hood
  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="email" type="email" required />
      {state?.error && <p className="error">{state.error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
\`\`\`

Server Actions eliminate the need for separate API route handlers for form submissions and data mutations. The framework handles serialization, submission, and progressive enhancement automatically.

## RSC vs Traditional SSR

| Aspect | Traditional SSR | RSC |
|--------|----------------|-----|
| **What's sent to client** | HTML + ALL component JS | HTML (via SSR) + ONLY Client Component JS |
| **Data fetching** | Must be client-side or via \`getServerSideProps\` | Direct DB access in Server Components |
| **Hydration** | Whole app hydrates | Only Client Components hydrate |
| **API routes** | Required for mutations | Server Actions replace simple cases |
| **Caching** | Page-level (invalidation is coarse) | Component-level (fine-grained) |
| **Bundle size** | Full app JS | Only interactive components' JS |

## CTO-Level Takeaways

1. **RSC dramatically reduces JS bundle size.** Most pages have more static/display content than interactive content. With RSC, the static parts contribute zero JS. Expect 30-70% bundle size reduction on content-heavy pages.
2. **Direct database access in components is a double-edged sword.** It's convenient but makes caching and request deduplication critical. Use React's \`cache()\` function or a dedicated data layer to prevent N+1 queries.
3. **Server Actions are not API replacements.** They work beautifully for form submissions but shouldn't replace a well-designed API layer for third-party integrations or mobile clients.
4. **Adopt RSC incrementally.** You can build a Next.js App Router project with only Client Components at first, then migrate Server Components as you learn the patterns. The two coexist fine.
5. **Profile the client-server boundary.** Every \`'use client'\` directive adds to the JS bundle. Audit your boundaries — if a component doesn't need interactivity (no state, no effects, no event handlers), it should be a Server Component.
;`,
            tags: ["React", "Architecture", "Next.js"],
          },
          {
            id: "fe-hydration",
            title: "Hydration: Full, Partial & Island Architecture",
            shortDesc: "The performance cost of hydration, and how Islands Architecture and partial hydration eliminate it.",
            difficulty: "advanced",
            readTimeMin: 8,
            keyPoints: [
              "Hydration: attaching event listeners to server-rendered HTML — rebuilds the component tree in JS.",
              "Hydration penalty: even with SSR, TTI is delayed until all JS hydrates.",
              "Partial Hydration: only hydrate interactive components, leave static parts as HTML.",
              "Islands Architecture (Astro): each interactive island is independently hydrated.",
              "Resumability (Qwik): serializes execution state into HTML — no replay, just resume.",
            ],
            content: `## Why This Matters

Hydration is the hidden cost of server-rendered React. The browser receives fully-formed HTML and paints it immediately — but the page is not interactive until React hydrates it. This gap between FCP and TTI is where users perceive your app as "broken": they can see content but clicking does nothing. The cost is proportional to the amount of JavaScript that must be downloaded, parsed, and executed. Understanding hydration — and the alternatives to it — is essential for delivering fast, interactive experiences on real-world network conditions.

## What Hydration Actually Is

When a server renders React to HTML (SSR), the HTML includes the visual output of every component. But that HTML has no event listeners, no state, no effects — it's a static snapshot. The browser paints it immediately.

Then the client downloads and executes React, creates the full component tree in memory, and **matches** each component to its corresponding DOM node in the server HTML. This process is called hydration:

\`\`\`javascript
// Simplified: how React hydrates SSR HTML
// Server produced: <button id="add-to-cart">Add to Cart</button>
// Client must:
// 1. Create the React component tree
// 2. Walk the DOM tree
// 3. Match each React component to its DOM node
// 4. Attach event handlers
// 5. Initialize state

// During hydration, React calls:
reactRoot.hydrate(<App />, document.getElementById('root'));
// React renders <App /> in memory, then walks the existing DOM
// (not creating new DOM, just attaching to existing nodes)
\`\`\`

The critical performance insight: **hydration requires the full component tree to be created in JavaScript memory, even for components that are entirely static.** React must recreate the entire Virtual DOM tree, then match it against the real DOM. If the vDOM and the real DOM don't match (a hydration mismatch), React falls back to a client-side re-render, replacing the server HTML.

## The Hydration Penalty

The cost of hydration is proportional to the component tree size, not just the interactive parts:

\`\`\`
Page load time breakdown (typical Next.js SSR page):

HTML arrives:         |■■■■■■■■■■|  200ms (TTFB + FCP)
JS downloads:         |■■■■■■■■■■■■■■■■■■■■|  400ms
Parse + Compile:      |■■■■■■■■|  150ms
Hydrate:              |■■■■■■■■■■|  200ms
TTI achieved:         ---------------------->  950ms

The first 200ms: user can SEE content
The next 750ms: user can SEE but NOT INTERACT
\`\`\`

On a 3G mobile connection with a slow CPU, this gap can grow to 5-10 seconds. Users tapping on buttons that don't respond — this is the hydration penalty.

### Where Hydration Hurts Most

1. **Content-heavy pages:** A blog post with thousands of DOM nodes needs to hydrate the entire tree even if only the "like" button is interactive.
2. **Low-end devices:** Parse and execute times scale with device CPU speed. A M1 MacBook hydrates 10x faster than an Android Moto G4.
3. **Large component trees:** Every component in the tree must be reconstructed in JavaScript memory during hydration, not just the interactive ones.

## Partial Hydration

The solution: only hydrate components that actually need interactivity. Leave static components as pure HTML.

### Islands Architecture (Astro)

Astro pioneered the "islands" concept: each interactive component is an independently loaded island of JavaScript. The rest of the page is static HTML with zero JS.

\`\`\`astro
---
// Astro component — everything inside --- is server-only
import Header from '../components/Header.astro';
import ImageCarousel from '../components/ImageCarousel.jsx';
import AddToCart from '../components/AddToCart.jsx';
---

<!-- Header is static HTML — zero JS -->
<Header title="My Store" />

<!-- ImageCarousel is an island — JS only for this interactive widget -->
<ImageCarousel client:load />

<!-- AddToCart is an island — lazy-loaded when visible -->
<AddToCart client:visible productId={product.id} />

<!-- Everything below is static HTML -->
<footer>© 2025 My Store</footer>
\`\`\`

Each island is independent. The ImageCarousel's JS does not block the AddToCart's JS. Static sections contribute zero JS. The framework serializes component props into the HTML, and the island JS hydrates only its own DOM subtree.

### React Server Components (Next.js App Router)

RSC achieves a similar effect: Server Components are never hydrated, Client Components are the "islands." The difference from Astro is that RSC components can compose together within the same framework, and Server Components can directly access databases.

### Selective Hydration (React 18)

React 18 introduced selective hydration: wrapping parts of the tree in \`<Suspense>\` allows React to hydrate them independently and in priority order:

\`\`\`tsx
// React hydrates the sidebar first (it's visible and likely interactive),
// then hydrates the comments section (below the fold)
<Suspense fallback={<SidebarSkeleton />}>
  <Sidebar />  {/* Hydrated first — higher priority */}
</Suspense>
<main>
  <article>...static content...</article>
  <Suspense fallback={<CommentsSkeleton />}>
    <Comments />  {/* Hydrated later — lower priority */}
  </Suspense>
</main>
\`\`\`

The browser doesn't need to wait for Comments to hydrate before Sidebar is interactive.

## Resumability (Qwik)

Qwik takes a fundamentally different approach: instead of hydrating (replaying all component logic), Qwik serializes the **listener state** into the HTML. When the user clicks a button, Qwik downloads and executes only the code for that button's handler — nothing else.

\`\`\`html
<!-- Qwik server output — contains all information needed without JS -->
<button on:click="my-chunk.js#handleClick">
  Click me
  <!-- Qwik serializes closure state into HTML attributes -->
  <!-- <!--#qks|count|0|--> -->
</button>
\`\`\`

There is no hydration phase. The page is interactive the moment the HTML is rendered because all event handlers are registered via global delegation. When an event fires, Qwik lazily loads the handler code. This is called **resumability** — the browser resumes execution from where the server left off, rather than replaying everything.

## CTO-Level Takeaways

1. **Measure the hydration gap.** Run Lighthouse on 4G throttling. Compare FCP to TTI. If the gap exceeds your target (e.g., 2 seconds), investigate partial hydration.
2. **Consider Astro for content-heavy sites.** If your app is "mostly static content with some interactive islands," Astro delivers a dramatically smaller JS bundle than traditional React SSR.
3. **RSC in Next.js helps but is not a full solution.** Server Components eliminate server-side JS, but Client Components still hydrate. Profile your client boundary to minimize the interactive surface.
4. **Qwik's resumability is the most performant approach** — zero hydration cost. Evaluate if you're building a high-traffic public-facing app where every millisecond matters. The trade-off is a smaller ecosystem and hiring pool.
5. **Avoid unnecessary interactivity.** Every toggle, animation, and interactive widget adds to the hydration cost. Question whether each interactive element genuinely improves the user experience.
;`,
            tags: ["Performance", "Architecture"],
          },
          {
            id: "fe-web-vitals",
            title: "Core Web Vitals & Performance Budget",
            shortDesc: "Measuring LCP, INP, and CLS — the metrics Google uses and how to actually improve them.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "LCP (Largest Contentful Paint): time until largest above-the-fold element is visible. Target: < 2.5s.",
              "INP (Interaction to Next Paint): latency of all user interactions. Target: < 200ms.",
              "CLS (Cumulative Layout Shift): visual instability score. Target: < 0.1.",
              "LCP optimizations: preload hero images, server-push fonts, avoid render-blocking JS.",
              "INP optimizations: break up long tasks, use scheduler API, avoid heavy main thread work.",
              "CLS fixes: always set explicit width/height on images and embeds.",
            ],
            content: `## Why This Matters

Google's Core Web Vitals are not just metrics — they are ranking signals that directly affect your site's search visibility, user engagement, and conversion rates. Since the 2021 Page Experience update, Google uses LCP, INP (replacing FID in March 2024), and CLS as ranking factors. Beyond SEO, these metrics measure what users actually experience: how fast your page loads, how quickly it responds to interaction, and whether the layout jumps around while loading. For engineering leaders, Core Web Vitals provide a data-driven framework for prioritizing performance work — replacing gut feelings with measurable targets.

## The Three Core Metrics

### Largest Contentful Paint (LCP)

LCP measures the time from navigation start until the largest content element (image, video, text block) in the viewport becomes visible.

**Target:** < 2.5 seconds (Good) | 2.5-4.0s (Needs Improvement) | > 4.0s (Poor)

**What contributes to LCP:**

\`\`\`
TTFB (Time to First Byte)            ← Server response time
    ↓
Resource Load Delay (preload scan)   ← HTML parsing + resource discovery
    ↓
Resource Load Time                   ← Download time for hero image/font
    ↓
Element Render Time                  ← Decode + paint
\`\`\`

**Top LCP optimizations:**

1. **Preload the LCP resource.** Identify the hero image or video and add \`<link rel="preload">\` in \`<head>\`:
   \`\`\`html
   <link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
   \`\`\`

2. **Eliminate render-blocking resources.** Inline critical CSS. Defer non-critical CSS and scripts.

3. **Optimize TTFB.** Use CDN caching, edge rendering, or static generation for the first response.

4. **Serve images in modern formats.** WebP or AVIF. Use responsive images (\`srcset\` + \`sizes\`):

   \`\`\`html
   <img
     src="hero-800.webp"
     srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
     sizes="(max-width: 600px) 100vw, 800px"
     alt="Hero image"
     fetchpriority="high"
   >
   \`\`\`

### Interaction to Next Paint (INP)

INP measures the latency of all user interactions (clicks, taps, key presses) and reports the worst (or near-worst) interaction latency.

**Target:** < 200ms | 200-500ms | > 500ms

INP replaced First Input Delay (FID) in March 2024 because FID only measured the *first* interaction, which is rarely representative. INP measures all interactions, providing a more complete picture of responsiveness.

**What causes poor INP:**

- Long tasks (>50ms) on the main thread that delay event handler execution
- Heavy event handlers that do too much synchronous work
- Layout thrashing from forced reflows in event handlers
- Slow \`requestAnimationFrame\` callbacks
- Third-party scripts monopolizing the main thread

**Top INP optimizations:**

1. **Break up long tasks.** Use \`setTimeout()\`, \`requestIdleCallback()\`, or the Scheduler API (\`yield\`):
   \`\`\`javascript
   // Break a 200ms task into 4 × 50ms chunks
   async function processItems(items) {
     for (const item of items) {
       process(item);
       // Yield to the event loop every 5 items
       if (item.index % 5 === 0) {
         await new Promise(resolve => setTimeout(resolve, 0));
       }
     }
   }
   \`\`\`

2. **Debounce or throttle expensive handlers.** Scroll and resize handlers should not do complex work on every event.

3. **Avoid forced reflows.** Batch DOM reads before writes. Don't interleave reading \`offsetHeight\` with setting \`style.height\` in event handlers.

4. **Use \`content-visibility: auto\`** on below-the-fold sections to defer rendering:

   \`\`\`css
   .comments-section {
     content-visibility: auto;
     contain-intrinsic-size: 500px;  /* Reserve space */
   }
   \`\`\`

### Cumulative Layout Shift (CLS)

CLS measures visual stability — how much the page layout shifts during loading.

**Target:** < 0.1 | 0.1-0.25 | > 0.25

**What causes CLS:**

- Images without dimensions
- Embeds (ads, iframes, embeds) that load late and push content down
- Dynamic content injected above existing content
- Web fonts causing FOIT/FOUT (Flash of Invisible/Visible Text)
- Late-loading UI elements (banners, notifications) inserted at the top

**Top CLS fixes:**

1. **Always set width and height on images and video:**
   \`\`\`html
   <!-- Without dimensions → CLS when image loads -->
   <img src="photo.jpg" alt="Photo">

   <!-- With dimensions → browser reserves space -->
   <img src="photo.jpg" width="800" height="600" alt="Photo">

   <!-- With aspect-ratio CSS → responsive but stable -->
   <img src="photo.jpg" style="width: 100%; height: auto; aspect-ratio: 4/3;" alt="Photo">
   \`\`\`

2. **Reserve space for dynamic content.** Ads, embeds, and banners should have a reserved container with explicit dimensions:
   \`\`\`html
   <div class="ad-container" style="min-height: 250px; min-width: 300px;">
     <!-- Ad loads here without pushing content down -->
   </div>
   \`\`\`

3. **Use \`font-display: optional\` for non-critical fonts** to avoid layout shifts from font swapping.

4. **Avoid inserting content at the top of the page** after the page has loaded. Use a banner slot at the bottom or reserve space.

## Performance Budget

A performance budget sets numeric targets for key metrics and treats violations as bugs:

\`\`\`
┌──────────────────────────────┬───────────┐
│ Metric                       │ Budget    │
├──────────────────────────────┼───────────┤
│ LCP                          │ < 2.0s    │
│ INP                          │ < 150ms   │
│ CLS                          │ < 0.05    │
│ Time to Interactive          │ < 3.5s    │
│ JavaScript bundle size       │ < 300KB   │
│ (compressed)                 │           │
│ Total page weight            │ < 1MB     │
│ Number of HTTP requests      │ < 30      │
│ Third-party scripts          │ < 3       │
└──────────────────────────────┴───────────┘
\`\`\`

**How to enforce budgets:**

1. **Lighthouse CI:** Run Lighthouse in CI and fail builds if scores drop below thresholds.
2. **Webpack/Rollup/Vite plugins:** \`bundlesize\`, \`webpack-bundle-analyzer\`, \`vite-plugin-inspect\` to track bundle sizes.
3. **Real User Monitoring (RUM):** Collect Web Vitals from actual users using the \`web-vitals\` library and send them to your analytics:
   \`\`\`javascript
   import { onLCP, onINP, onCLS } from 'web-vitals';

   onLCP(metric => sendToAnalytics('LCP', metric.value));
   onINP(metric => sendToAnalytics('INP', metric.value));
   onCLS(metric => sendToAnalytics('CLS', metric.value));
   \`\`\`

## CTO-Level Takeaways

1. **Set a performance budget and enforce it in CI.** Without a budget, performance degrades with every feature addition. Make it a build failure, not a warning.
2. **Collect RUM data.** Lab data (Lighthouse) is a proxy. Real user data tells you what actual devices and networks experience. Use the \`web-vitals\` library or tools like SpeedCurve/Calibre.
3. **Prioritize LCP for SEO, INP for user experience.** LCP is the most visible ranking factor, but INP directly measures whether users perceive your app as responsive.
4. **CLS is the easiest win.** Adding \`width\`/\`height\` to images and reserving space for ads eliminates most CLS issues with minimal development effort.
5. **Third-party scripts are the #1 performance risk.** Each analytics, ad, chatbot, or widget script adds network requests, main thread contention, and potential layout shifts. Audit them regularly and load them lazily.
6. **Performance is a feature, not a task.** Treat regressions like bugs. Assign performance ownership to a specific team member. Review budgets in sprint planning.
;`,
            tags: ["Performance"],
          },
        ],
      },
      {
        id: "fe-tooling",
        title: "Build Tools & Workflows",
        description: "Bundlers, transpilers, module graphs, and the developer experience machinery.",
        topics: [
          {
            id: "fe-bundlers",
            title: "How Bundlers Work: Vite, Webpack & Rollup",
            shortDesc: "Module graph construction, code splitting, tree shaking, and HMR — what bundlers actually do.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Entry → dependency graph: bundler traverses import/require chains from entry points.",
              "Chunking: splits the graph into async-loadable bundles for route-based code splitting.",
              "Tree shaking: removes exports never referenced in the import graph (ESM only).",
              "Vite: dev server uses native browser ESM + esbuild — no bundling in development.",
              "HMR (Hot Module Replacement): patches only changed modules without full page reload.",
            ],
            content: `## Why This Matters

Every JavaScript project — from a simple landing page to a massive enterprise app — goes through a bundler. Understanding what bundlers actually do (parse imports, construct a dependency graph, split into chunks, eliminate dead code) is the foundation for debugging build issues, optimizing bundle size, and choosing the right tool. The landscape has shifted dramatically: Webpack's dominance has been challenged by Vite's dev-speed revolution, but the underlying concepts remain the same. Whether you're using Webpack, Vite, Rollup, Turbopack, or Parcel, the mental model of module graphs and code splitting is universal.

## The Module Graph

Every bundler starts with the same fundamental process:

1. Read one or more **entry points** (e.g., \`src/main.tsx\`)
2. Parse each file to find its imports (\`import ... from '...'\`)
3. Recursively resolve and parse every imported file
4. Build a **module graph** — a tree/directed graph showing which modules depend on which

\`\`\`
Entry: src/main.tsx
  ├── import React from 'react'           → node_modules/react/index.js
  │     └── ... (React's internal imports)
  ├── import App from './App'             → src/App.tsx
  │     ├── import Header from './Header' → src/Header.tsx
  │     ├── import Footer from './Footer' → src/Footer.tsx
  │     └── import { BrowserRouter } from 'react-router-dom'
  └── import './styles.css'               → src/styles.css
\`\`\`

## How Different Bundlers Approach This

### Webpack: Everything Is a Module

Webpack treats every file as a module that can be loaded by a **loader**. The configuration defines how files of each type are transformed:

\`\`\`javascript
// webpack.config.js — the loader pipeline
module.exports = {
  module: {
    rules: [
      { test: /\\.tsx$/, use: 'ts-loader' },      // TypeScript → JavaScript
      { test: /\\.css$/, use: ['style-loader', 'css-loader'] },  // CSS → inline styles
      { test: /\\.svg$/, type: 'asset/resource' }, // SVG → URL
    ],
  },
};
\`\`\`

Webpack builds a complete dependency graph before emitting anything. In development, it incrementally re-builds only changed modules. For large projects, this can take 30-60 seconds even with HMR — which is why Vite gained traction.

### Vite: Dev Server Without Bundling

Vite's breakthrough insight: modern browsers support native ESM imports. In development, **Vite doesn't bundle at all** — it serves modules directly via HTTP:

\`\`\`html
<!-- Vite dev server transforms this: -->
<script type="module">
  import { createApp } from 'vue'
  import App from './App.vue'
</script>

<!-- Into native ESM that the browser loads directly -->
<script type="module">
  import { createApp } from '/@modules/vue'  // Vite serves vue via esbuild
  import App from '/src/App.vue'             // Vite transforms .vue on the fly
</script>

<!-- Browser requests each module individually via HTTP:
     GET /@modules/vue
     GET /src/App.vue
     GET /src/components/Header.vue
     ... -->
\`\`\`

**Pre-bundling dependencies:** Vite uses esbuild to pre-bundle npm dependencies (which are often CommonJS) into a single ESM file per dependency. This prevents the browser from making hundreds of HTTP requests to load lodash or antd methods individually.

**Production build:** Vite delegates to **Rollup** for production — tree-shaking, code splitting, minification, and asset hashing are handled by Rollup's mature plugin ecosystem.

### Rollup: The Production Bundler

Rollup focuses on ESM-first bundling with the best tree-shaking in the ecosystem. Its plugin API is the standard that Vite adopted:

\`\`\`typescript
// Rollup plugin — transforms a file during production build
function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(source) {
      if (source === 'special-dep') return '\0virtual-module';
      return null;  // Let Rollup handle normally
    },
    load(id) {
      if (id === '\0virtual-module') return 'export default "virtual"';
    },
    transform(code, id) {
      if (id.endsWith('.custom')) return code.replace(/CUSTOM/g, 'REPLACED');
    },
    generateBundle(options, bundle) {
      // Modify output before writing
    },
  };
}
\`\`\`

## Code Splitting

Splitting the bundle into smaller chunks that load on demand is the most impactful performance optimization:

\`\`\`javascript
// Dynamic import → creates a separate chunk
const AdminPanel = React.lazy(() => import('./AdminPanel'));

// The bundler recognizes this pattern and creates:
// - main.bundle.js  (core app — loaded immediately)
// - admin-panel.chunk.js  (loaded only when AdminPanel is rendered)
\`\`\`

**Chunking strategies:**

| Strategy | How It Works | Use Case |
|----------|-------------|----------|
| Entry-based | One chunk per entry point | Multi-page apps |
| Dynamic import | Routes become chunks | Single-page apps |
| Vendor splitting | node_modules in a separate chunk | Better caching (deps change rarely) |
| Module Federation | Remote modules loaded at runtime | Micro-frontends |
| Granular chunks | One chunk per module | Maximum caching (Turbopack) |

## Tree Shaking

Tree shaking removes unused exports from the final bundle. It requires ESM (static imports) — CommonJS's dynamic \`require()\` cannot be statically analyzed:

\`\`\`typescript
// utils.ts
export function used() { return 'used'; }
export function unused() { return 'unused'; }  // Removed by tree-shaking

// app.ts — imports only 'used'
import { used } from './utils';
// Result: 'unused' is not included in the bundle
\`\`\`

**Tree shaking is not free.** Side effects in modules can prevent tree shaking. Mark your package.json with \`"sideEffects": false\` to enable deeper tree shaking, or use an array for specific files that have side effects.

## HMR (Hot Module Replacement)

HMR updates modules in the browser without a full page reload, preserving application state:

\`\`\`javascript
// How Vite's HMR works:
// 1. Developer edits Component.tsx
// 2. Vite transforms the changed file
// 3. Vite sends the new code over WebSocket to the browser
// 4. The HMR runtime receives the update
// 5. Replaces the module in the module registry
// 6. Calls component-specific HMR handler (e.g., React Refresh)
// 7. React re-renders the affected components — state is preserved
\`\`\`

The key difference from Webpack: Vite only needs to transform and send the changed module (and its HMR boundary), while Webpack must re-analyze the entire dependency graph of the changed module after re-building.

## CTO-Level Takeaways

1. **Use Vite for new projects.** The developer experience difference (instant startup, fast HMR) is a team productivity multiplier. Webpack should only be chosen for legacy projects with complex custom plugin requirements.
2. **Monitor bundle size in CI.** Tools like \`vite-plugin-inspect\`, \`webpack-bundle-analyzer\`, or \`bundlesize\` should fail builds when bundles exceed budgets. A 300KB compressed bundle should be your maximum target for initial load.
3. **Code splitting is not optional.** Lazy-load routes, feature modules, and heavy dependencies (charts, PDF viewers, code editors) — every byte not needed for initial render should be split into a separate chunk.
4. **Tree shaking requires discipline.** Use ESM, set \`"sideEffects": false\` in package.json (if safe), and avoid barrel files (\`index.ts\` that re-export everything) which defeat tree shaking.
5. **Understand your build tool's performance characteristics.** Vite is fast in dev but delegates to Rollup for production builds. If your production build is slow, profile Rollup, not Vite.
;`,
            tags: ["Tooling", "Performance"],
          },
          {
            id: "fe-monorepo",
            title: "Monorepos: Turborepo & pnpm Workspaces",
            shortDesc: "Sharing code across apps in a single repository — workspace links, task graphs, and remote caching.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "Workspace: a package inside a monorepo — linked via symlinks in node_modules.",
              "pnpm workspaces: content-addressable store eliminates duplicate packages across the repo.",
              "Task graph: Turborepo declares task dependencies — builds run in topological order.",
              "Remote cache: share build artifacts across CI machines — only run what changed.",
              "Common packages: shared UI, utils, tsconfig, eslint config — defined once, used everywhere.",
            ],
            content: `## Why This Matters

As your codebase grows from a single app to multiple applications sharing shared packages, the monorepo becomes an organizational necessity. The alternative — separate repositories for each package — creates versioning nightmares, duplicate code, and coordination overhead. But a poorly configured monorepo can be worse than no monorepo: slow installs, broken dependency links, and CI pipelines that rebuild everything on every change. Understanding pnpm workspaces and Turborepo's task orchestration is the difference between a monorepo that accelerates your team and one that slows it down.

## Why pnpm Over npm or Yarn

pnpm's key innovation is the **content-addressable store**. Instead of copying packages into each project's \`node_modules\`, pnpm stores them globally and creates hard links:

\`\`\`
npm/Yarn layout:                    pnpm layout (with store):
project-a/node_modules/             project-a/node_modules/
  lodash/  (copy #1)                  .pnpm/
project-b/node_modules/                lodash@4.17.21/
  lodash/  (copy #2)                    node_modules/lodash → ../../store/.../lodash
                                  (hard link to global store)
\`\`\`

**Benefits of pnpm's approach:**

1. **Disk space:** 100 projects using lodash share one copy in the store, not 100 copies. Savings of 70-90% for large monorepos.
2. **Install speed:** Linking is faster than copying. pnpm is typically 2-3x faster than npm for large monorepos.
3. **Strict dependency isolation:** Packages cannot access undeclared dependencies. This catches bugs where a package relies on a transitive dependency that could disappear.

### pnpm Workspaces

\`\`\`yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'        # Next.js, Express, etc.
  - 'packages/*'    # Shared UI, utils, configs
  - 'packages/configs/*'  # tsconfig, eslint-config, prettier-config
\`\`\`

\`\`\`json
// apps/web/package.json
{
  "dependencies": {
    "@myorg/shared-ui": "workspace:*",  // Links to local package
    "@myorg/utils": "workspace:*"
  }
}
\`\`\`

The \`workspace:*\` protocol tells pnpm to link to the local package, not install from npm. When publishing, you can use \`workspace:^\` (range) which gets replaced during \`pnpm publish\`.

## Turborepo: Task Orchestration

Turborepo doesn't replace the package manager — it orchestrates script execution across the monorepo:

### Task Graph

Define dependencies between tasks — Turborepo runs them in topological order and in parallel where possible:

\`\`\`json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // Wait for dependencies to build first
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**", "test/**"]  // Only re-run if these files changed
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,  // Dev servers shouldn't cache
      "persistent": true
    }
  }
}
\`\`\`

\`\`\`
Example execution for "turbo run test":
1. Identifies changed packages (since last commit)
2. For each changed package:
   a. Build its dependencies first (in parallel if independent)
   b. Build the package
   c. Run tests (in parallel across all changed packages)
3. Skip packages that haven't changed (if outputs are cached)
\`\`\`

### Remote Caching

Turborepo can share build artifacts across machines via a remote cache (Vercel Remote Caching or self-hosted):

\`\`\`
Developer A: turbo run build → cache stored remotely
CI:          turbo run build → retrieves A's cache → 10-second CI build
Developer B: turbo run build → retrieves A's cache (or CI's cache)
\`\`\`

Without remote caching, every CI runner and every developer's machine re-builds everything from scratch. With it, only the exact changed packages are rebuilt — everything else is a cache hit.

## Organizing a Monorepo

\`\`\`
my-monorepo/
├── apps/
│   ├── web/                    # Next.js app
│   ├── mobile/                 # Expo app
│   └── admin/                  # React admin dashboard
├── packages/
│   ├── shared-ui/              # React component library
│   │   ├── src/
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── utils/                  # Pure utility functions
│   ├── api-client/             # Auto-generated API client
│   └── configs/
│       ├── tsconfig/           # Shared tsconfigs (next.json, react.json, base.json)
│       ├── eslint-config/      # Shared ESLint config
│       └── prettier-config/    # Shared Prettier config
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
\`\`\`

### Common Packages Strategy

- **Shared UI:** Keep it framework-agnostic (preact signals) or framework-specific with proper peer deps
- **Configs:** TypeScript, ESLint, Prettier — shared configurations avoid drift
- **Types:** Shared TypeScript types for API contracts — the single source of truth
- **API Client:** Auto-generated client matching the backend OpenAPI spec — eliminates manual fetch code

## CTO-Level Takeaways

1. **Use pnpm, not npm or Yarn, for monorepos.** The disk space savings and strict dependency isolation are worth the switch. Migration is straightforward (\`pnpm import\` converts lockfiles).
2. **Turborepo's remote caching is the killer feature.** Without it, monorepo CI gets slower as the repo grows. With it, CI time stays constant regardless of repo size. Self-host on S3 if Vercel is not your platform.
3. **Enforce strict boundaries between packages.** Each package should have a well-defined API (its exported types/functions). Use tools like \`dependency-cruiser\` or ESLint's import/no-restricted-paths to prevent circular dependencies and layer violations.
4. **Don't over-abstract early.** Creating too many packages too soon adds overhead (versioning, build config, cross-package refactoring). Start with 3-5 packages and split only when the code genuinely needs independent deployment or versioning.
5. **Standardize configs across the monorepo.** Shared TypeScript, ESLint, and Prettier configs prevent configuration drift and reduce the cognitive overhead of 10 different \`tsconfig.json\` files.
;`,
            tags: ["Tooling", "Monorepo"],
          },
          {
            id: "fe-modern-runtimes",
            title: "Modern JS Runtimes: Bun & Deno",
            shortDesc: "How Bun and Deno reimagine the JS runtime — native TypeScript, built-in bundler, and Node.js compatibility.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Bun: built on WebKit's JavaScriptCore — 4x faster startup than Node, native TS/JSX transpilation.",
              "Bun's built-in bundler: replaces webpack/esbuild for many use cases — Bun.serve(), Bun.file(), Bun.sqlite.",
              "Deno: V8-based, web-standard API surface — fetch, WebSocket, Web Crypto are first-class APIs, not libraries.",
              "Deno's permission model: `--allow-read`, `--allow-net` — fine-grained security by default, not afterthought.",
              "Node.js compatibility: both Bun and Deno now support the npm ecosystem and CommonJS interop.",
              "Choosing a runtime: startup time × web-standard alignment × ecosystem compatibility × team expertise.",
            ],
            content: `## Why This Matters

For over a decade, Node.js was the only viable server-side JavaScript runtime. Bun and Deno have challenged this monopoly with fundamentally different design philosophies: Deno doubles down on web standards (fetch, WebSocket, Web Crypto as built-ins), while Bun optimizes for raw performance (JavaScriptCore engine, 4x faster startup, built-in bundler). Understanding these alternatives is important not because you'll necessarily switch, but because their innovations are shaping Node.js's roadmap — and because choosing the right runtime for a new project can save significant infrastructure costs.

## Bun: Speed-First Runtime

Built on **WebKit's JavaScriptCore** engine (not V8), Bun achieves dramatically better cold-start performance:

\`\`\`
Benchmark: Starting an HTTP server from cold

Node.js (v22):   ~180ms  (parse + compile + register)
Bun (v1.1):      ~28ms   (JIT-compiled from the start)
Deno (v2):       ~45ms   (V8 isolate + permission check)
\`\`\`

### Built-in APIs

Bun replaces dozens of npm packages with built-in APIs:

\`\`\`typescript
import { serve, file, write, SQLite } from 'bun';

// HTTP server — replaces express, fastify, etc.
serve({
  port: 3000,
  async fetch(request) {
    const body = await Bun.file('./public/index.html').text();
    return new Response(body, {
      headers: { 'Content-Type': 'text/html' },
    });
  },
});

// File I/O — replaces fs-extra, graceful-fs
const data = await Bun.file('data.json').json();
await Bun.write('output.txt', 'Hello');

// SQLite — replaces better-sqlite3, sql.js
const db = new Bun.SQLite('app.db');
const users = db.query('SELECT * FROM users').all();
\`\`\`

### Built-in Bundler

\`\`\`typescript
Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  target: 'browser',  // Also: 'bun' (for server), 'node'
  minify: true,
  splitting: true,     // Code splitting
  external: ['react'], // Don't bundle these
});
\`\`\`

Bun's bundler replaces Webpack/Rollup/vite for many use cases, running 10-20x faster than esbuild and 100x+ faster than Webpack.

### npm Compatibility

Bun aims for full Node.js/npm compatibility. \`bun install\` is 10-30x faster than \`npm install\` for clean installs. Most \`express\`, \`prisma\`, and \`next\` applications run under Bun with minimal changes.

## Deno: Web Standards-First Runtime

Deno was created by Ryan Dahl (the original creator of Node.js) to fix what he considers Node.js's design mistakes:

| Aspect | Node.js | Deno |
|--------|---------|------|
| **Module system** | CommonJS + ESM (dual) | ESM only (import from URL) |
| **Security** | Full system access by default | Per-script permissions (\`--allow-net\`, \`--allow-read\`) |
| **Standard library** | npm ecosystem | \`std/\` (deno.land/std) — curated, audited |
| **TypeScript** | Requires ts-loader or tsx | Built-in — no tsconfig needed |
| **Package manager** | npm (node_modules) | Import from URLs (cached locally) |
| **Web APIs** | Requires polyfills | fetch, WebSocket, Crypto built-in |

\`\`\`typescript
// Deno — import from URL, no package.json needed
import { serve } from 'https://deno.land/std/http/server.ts';
import { assertEquals } from 'https://deno.land/std/assert/mod.ts';

// Built-in web APIs — no polyfills
const response = await fetch('https://api.example.com');
const ws = new WebSocket('wss://example.com');
const uuid = crypto.randomUUID();

// Permission system
// Deno: deno run --allow-net --allow-read server.ts
// Node: node server.js (everything allowed)
\`\`\`

### Node.js Compatibility (Deno 2+)

Deno 2 added \`npm:\` specifier support for full npm compatibility:

\`\`\`typescript
import express from 'npm:express';
import { PrismaClient } from 'npm:@prisma/client';

// Deno can now run most Node.js applications
\`\`\`

## Choosing a Runtime

\`\`\`
Question             │ Node.js        │ Bun              │ Deno
─────────────────────┼────────────────┼──────────────────┼─────────────────
Maturity             │ ★★★★★          │ ★★★☆☆            │ ★★★☆☆
npm compatibility    │ ★★★★★ (native) │ ★★★★☆            │ ★★★★☆
Cold start           │ ★★★☆☆          │ ★★★★★            │ ★★★★☆
Server perf          │ ★★★★☆          │ ★★★★★            │ ★★★★☆
Built-in bundler     │ ✗              │ ✔                │ ✔ (limited)
Permissions model    │ ✗              │ ✗                │ ✔
Web standard APIs    │ Polyfills      │ Mostly native    │ Native
Edge compatibility   │ Limited        │ Growing          │ Good (Deno Deploy)
Team hiring          │ ★★★★★          │ ★★☆☆☆            │ ★★☆☆☆
\`\`\`

## CTO-Level Takeaways

1. **Node.js is still the safe default.** Bun and Deno are production-ready for many use cases, but Node.js's ecosystem maturity, tooling, and hiring pool make it the lowest-risk choice for most teams.
2. **Consider Bun for new server projects.** If you're starting a new API service without heavy Node.js-specific dependencies, Bun's developer experience (fast startup, hot reload, built-in bundler) is a genuine productivity win.
3. **Deno's permission model is underappreciated.** For security-conscious environments (fintech, healthcare), Deno's \`--allow-*\$ permission flags provide meaningful security guarantees that Node.js cannot offer without complex sandboxing.
4. **Edge computing changes the equation.** Cloudflare Workers, Deno Deploy, and Bun's edge hosting all optimize for fast cold starts — Bun's JavaScriptCore and Deno's V8 isolate pools are significantly faster than Node.js cold starts on edge.
5. **Monitor the space but don't over-invest.** The runtime landscape is evolving rapidly. Write portable code (use web-standard APIs) to minimize migration cost if you need to switch runtimes later.
;`,
            tags: ["Tooling", "Runtime", "JavaScript"],
          },
          {
            id: "fe-vite-deep",
            title: "Vite: Plugin System, HMR & Production Build",
            shortDesc: "How Vite works under the hood — the dependency pre-bundling, plugin pipeline, HMR protocol, and Rollup-based production build.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Dev server: Vite serves native ESM in development — no bundling; the browser imports modules directly via HTTP.",
              "Pre-bundling: esbuild converts CommonJS dependencies to ESM and bundles them into few files — reduces request waterfall.",
              "Plugin system: Rollup-compatible plugin API — transform, resolve, load hooks; most Rollup plugins work in Vite.",
              "HMR protocol: Vite sends updated module code over WebSocket — the browser re-evaluates only the changed module, no full reload.",
              "Production build: Vite delegates to Rollup for production — code splitting, CSS extraction, asset hashing, tree shaking.",
              "SWC / esbuild integration: Vite can use SWC for fast React refresh transform instead of Babel — significantly faster.",
              "Vitest integration: shares Vite config and transform pipeline — no separate test build step needed.",
            ],
            content: `## Why This Matters

Vite has become the de facto standard build tool for new frontend projects — and for good reason. Its architecture represents a fundamental shift: instead of bundling everything in development, Vite serves native ESM directly to the browser and uses esbuild and Rollup only where they add value. Understanding how Vite works under the hood — the pre-bundling, the plugin pipeline, the HMR protocol, and the production build — is essential for debugging issues, writing custom plugins, and making informed decisions about your build configuration.

## The Dev Server: No Bundling

Vite's development server is built on a simple but powerful insight: modern browsers support \`<script type="module">\` natively. Instead of bundling all modules before serving them (as Webpack does), Vite serves them directly:

\`\`\`
Traditional bundler dev server (Webpack):
┌──────────────────────────────────────────────┐
│ Source code → Bundler → Bundle.js → Browser  │
│              (rebuilds on change)             │
└──────────────────────────────────────────────┘
Every change requires re-bundling — even with HMR, 
the module graph must be re-analyzed.

Vite dev server:
┌──────────────────────────────────────────────┐
│ Source code → Transform → Native ESM → Browser│
│              (file by file)                    │
└──────────────────────────────────────────────┘
Browser imports modules individually via HTTP.
Vite only needs to transform the changed file.
\`\`\`

The difference is dramatic: Vite's dev server starts in <300ms for most projects, regardless of size. Webpack can take 10-60 seconds for the same project.

### Dependency Pre-Bundling

Vite uses **esbuild** to pre-bundle dependencies (node_modules) before serving them:

\`\`\`
Why pre-bundling is necessary:

Raw dependencies might look like:
  node_modules/lodash/
    ├── package.json          (CommonJS module)
    ├── index.js
    ├── internal/
    │   ├── baseEach.js
    │   ├── ... 300+ files
    └── ...

If Vite served these as-is, the browser would make 300+ HTTP requests
just for lodash. Pre-bundling bundles them into a single ESM file.

Additionally, many npm packages are CommonJS — esbuild converts them to ESM.
\`\`\`

The pre-bundling step runs once and caches the result in \`node_modules/.vite\`. It's re-run only when dependencies change (e.g., \`pnpm install\`).

## The Plugin Pipeline

Vite's plugin API is compatible with Rollup plugins, with some Vite-specific extensions:

\`\`\`typescript
// A Vite plugin that transforms SVG imports into React components
import { Plugin } from 'vite';

function svgrPlugin(): Plugin {
  return {
    name: 'vite-plugin-svgr',
    enforce: 'pre',  // Run before other transforms

    // Transform hook — runs for each module
    async transform(code, id) {
      if (id.endsWith('.svg?react')) {
        // Parse SVG, optimize, return as React component
        const svgCode = await optimizeSvg(code);
        return {
          code: \`import React from 'react';
                export default () => <svg dangerouslySetInnerHTML={{\` +
                '\n          __html: ' + JSON.stringify(svgCode) + '}} />;\`,
          map: null,
        };
      }
    },

    // Configure hook — modify Vite's config before build
    config(config) {
      return {
        define: {
          __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
        },
      };
    },

    // Configure dev server middleware
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/health') {
          res.statusCode = 200;
          res.end('OK');
        } else {
          next();
        }
      });
    },
  };
}
\`\`\`

**Hook execution order:**
1. \`enforce: 'pre'\` plugins run first
2. Normal plugins
3. \`enforce: 'post'\` plugins run last
4. Built-in Vite transforms (CSS, asset handling)

### How Vite Transforms Files

| File Type | Transform | Tool |
|-----------|-----------|------|
| \`.ts\`, \`.tsx\` | Strip types, compile JSX | esbuild |
| \`.vue\` | Parse SFC, compile template | \`@vitejs/plugin-vue\` |
| \`.svelte\` | Parse Svelte component | \`@sveltejs/vite-plugin-svelte\` |
| \`.css\` | PostCSS, CSS modules | Built-in |
| \`.scss\`, \`.less\` | Pre-processor | Plugin |
| \`.svg\`, \`.png\` | Asset handling | Built-in |

## HMR Protocol

When you edit a file in development:

1. **File watcher** (chokidar) detects the change
2. Vite re-transforms the changed module
3. Vite determines the **HMR boundary** — which modules accept the update
4. Sends a WebSocket message to the browser:
   \`\`\`json
   {
     "type": "update",
     "updates": [{
       "type": "js-update",
       "path": "/src/components/Counter.tsx",
       "acceptedPath": "/src/components/Counter.tsx",
       "timestamp": 1700000000000
     }]
   }
   \`\`\`
5. The browser's HMR runtime re-evaluates the module and calls \`import.meta.hot.accept\`
6. React Refresh (or Vue's HMR) re-renders affected components preserving state

Unlike Webpack's HMR (which needs to rebuild the module's chunk), Vite's HMR sends only the transformed source of the changed module — a much smaller payload.

## Production Build: Rollup Under the Hood

When you run \`vite build\`, Vite delegates to **Rollup** for production:

\`\`\`javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Manual chunk splitting
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@my-org/ui-library'],
          charts: ['recharts', 'd3'],
        },
        // Entry file naming
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // CSS code splitting: extract CSS per chunk
    cssCodeSplit: true,
    // Target browsers
    target: 'es2020',
    // Minification
    minify: 'esbuild',  // or 'terser' for ES5 downlevel
    sourcemap: true,
  },
});
\`\`\`

### Production Build Pipeline

\`\`\`
1. Rollup constructs the module graph (ESM imports)
2. Applies all plugin transforms (Vite + user plugins)
3. Tree shaking: Rollup marks unused exports and removes them
4. Code splitting: creates chunks based on dynamic imports + manualChunks
5. CSS extraction: extracts CSS from JS and writes separate files
6. Asset hashing: adds content hash to filenames for caching
7. Minification: esbuild or terser
8. Output: writes to dist/ directory
\`\`\`

## CTO-Level Takeaways

1. **Vite is the default for new projects.** Its dev experience (instant startup, fast HMR) improves developer productivity measurably. The only reason to choose Webpack today is a legacy codebase with complex custom Webpack plugins.
2. **Understand pre-bundling's limitations.** Large dependency trees (e.g., monorepos with 100+ internal packages) can cause slow pre-bundling. Use \`optimizeDeps.exclude\` for dependencies that work natively as ESM.
3. **Write framework-agnostic code when possible.** Vite supports React, Vue, Svelte, Solid, and Lit equally. Choose a framework that works with Vite's native approach — avoid frameworks that require Webpack-specific features.
4. **Profile your production build.** \`vite build --profile\` generates a Rollup profile that shows which plugins are slow. Common bottlenecks: large SVG processing, complex CSS transformations, or heavy TypeScript type checking during emit.
5. **Use \`vite preview\` for pre-production checks.** It serves the production build locally with the same static file structure your CDN will serve — catches base path issues, asset references, and caching behavior before deployment.
;`,
            tags: ["Vite", "Tooling", "Build"],
          },
          {
            id: "fe-micro-frontends",
            title: "Micro-Frontends: Module Federation & Composition",
            shortDesc: "Decomposing frontend monoliths — independent deployments, shared dependencies, and runtime integration patterns.",
            difficulty: "advanced",
            readTimeMin: 9,
            keyPoints: [
              "Micro-frontend principles: each team owns a vertical slice (UI + logic + data), deploys independently, composes at runtime.",
              "Module Federation (Webpack 5 / Rspack): host app loads remote modules at runtime — shared dependencies via shared singleton.",
              "Module Federation concerns: version conflicts (singleton vs multiple instances), error boundaries for remote failures, cross-team coordination.",
              "Iframe-based integration: simplest isolation, hardest UX — no shared context, no SEO, no accessibility across boundaries.",
              "Web Component composition: framework-agnostic — each micro-frontend is a custom element; the shell composes them via DOM.",
              "Edge-side composition (Nginx / Varnish): assemble HTML fragments on the server/edge — fastest TTFB, no client-side coordination.",
              "Choosing a strategy: Module Federation for rich SPAs with high cohesion; Web Components for polyglot teams; edge-side for content-heavy.",
            ],
            content: `## Why This Matters

Micro-frontends address a real organizational problem: how do you scale frontend development across multiple teams without creating a distributed monolith? The promise is independent deployments, technology diversity, and team autonomy. The reality is more complex — shared dependencies, version conflicts, performance overhead, and coordination costs. Understanding the trade-offs of Module Federation, Web Components, iframes, and edge-side composition is essential for CTOs evaluating whether micro-frontends are right for their organization — and for architects designing the integration strategy.

## Module Federation: Runtime Module Loading

Webpack 5's Module Federation (also available in Rspack) enables runtime loading of remote modules — one application can load components from another application at runtime:

\`\`\`javascript
// host/webpack.config.js — the shell application
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        'checkout': 'checkout@https://checkout.app.com/remoteEntry.js',
        'catalog': 'catalog@https://catalog.app.com/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};
\`\`\`

\`\`\`javascript
// remote/webpack.config.js — exposed module from another app
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'checkout',
      exposes: {
        './Cart': './src/components/Cart.tsx',
        './CheckoutForm': './src/components/CheckoutForm.tsx',
      },
      shared: {
        react: { singleton: true },
      },
    }),
  ],
};
\`\`\`

### How It Works at Runtime

1. The host application loads \`remoteEntry.js\` from the remote URL
2. \`remoteEntry.js\` contains a manifest of all exposed modules
3. When the host imports \`checkout/Cart\`, Module Federation:
   - Checks if \`react\` is already loaded (singleton) — uses the host's version
   - Fetches the remote chunk containing \`Cart\`
   - Executes \`Cart\` within the host's React context
4. The remote module behaves like a local component

### The Singleton Problem

The most complex aspect of Module Federation is **shared dependency management**:

\`\`\`
Scenario:
  Host uses React 18.2.0
  Remote A uses React 18.2.0
  Remote B uses React 18.3.0

If singleton: true — only one version of React is loaded.
  Which version wins? The highest required version.
  Remote B's React 18.3.0 is loaded.
  Host and Remote A use B's React — should be compatible (minor bump).

If singleton: false — two versions of React are loaded.
  Multiple React instances cause issues with context, refs, and events.
  This breaks most React micro-frontend setups.
\`\`\`

The practical rule: **all micro-frontends in a Module Federation setup must use the same major version of shared libraries.** Version mismatches are the #1 cause of production bugs in Module Federation architectures.

## Web Components: Framework-Agnostic Integration

Web Components offer a different approach: each micro-frontend is wrapped in a custom element, making it framework-agnostic:

\`\`\`typescript
// Team A builds a cart widget as a Web Component
import { LitElement, html } from 'lit';

class CartWidget extends LitElement {
  static properties = {
    userId: { type: String },
  };

  render() {
    return html\`
      <div class="cart">
        <h3>Shopping Cart</h3>
        <slot></slot>
      </div>
    \`;
  }
}
customElements.define('cart-widget', CartWidget);
\`\`\`

\`\`\`html
<!-- The shell composes micro-frontends via standard HTML -->
<main>
  <h1>My Store</h1>
  <product-list></product-list>        <!-- Team B's widget -->
  <cart-widget user-id="123"></cart-widget>  <!-- Team A's widget -->
</main>
\`\`\`

**Pros:** True framework independence, standard API, works with any framework.
**Cons:** Polyfills for older browsers, limited SSR support, accessibility challenges, each Web Component is a separate JS bundle.

## Edge-Side Composition

For content-heavy sites, the most performant approach is assembling HTML fragments at the edge (CDN or reverse proxy):

\`\`\`
Nginx configuration for edge-side includes:

<!-- Request comes in for /product/123 -->
<!-- Nginx assembles the page from fragments: -->

GET /fragments/header     →  {HTML for header}
GET /fragments/product/123 →  {HTML for product details}
GET /fragments/reviews/123 →  {HTML for reviews}
GET /fragments/footer     →  {HTML for footer}

<!-- All requests in parallel → assembled at edge → sent to client -->
<!-- No client-side JavaScript needed for composition -->
\`\`\`

**Pros:** Fastest possible TTFB, no client-side composition cost, works with any backend.
**Cons:** Limited interactivity (each fragment is static HTML), complex caching strategy, hard to share state between fragments.

## When to Actually Use Micro-Frontends

\`\`\`
Do you need micro-frontends?
│
├── Yes, if:
│   ● Multiple teams need to deploy independently
│   ● Each team owns a distinct vertical feature (cart, search, profile)
│   ● Different teams use different frameworks or versions
│   ● The monolith has reached a size where a single deploy blocks everyone
│
├── No, if:
│   ● One team owns the entire frontend
│   ● The app is small-medium (<20 developers)
│   ● You have no independent deployment requirement
│   ● You're trying to solve "slow builds" — there are simpler solutions
│
└── Consider a monorepo first, then split:
    1. Start with a monorepo (shared packages, one deploy)
    2. Extract teams into separate apps only when coordination friction > micro-frontend complexity
\`\`\`

## CTO-Level Takeaways

1. **Don't start with micro-frontends.** They add significant complexity (shared deps, cross-team coordination, performance overhead). Start with a well-structured monorepo. Extract micro-frontends only when the monorepo's deployment coordination becomes a bottleneck.
2. **Module Federation requires version discipline.** Enforce strict peer dependency policies. Use a shared dependency dashboard to track which versions each micro-frontend expects.
3. **Measure the performance cost.** Each micro-frontend adds: JavaScript bundle overhead, network request for remoteEntry.js, potential duplicate dependencies. Set performance budgets and test on real devices.
4. **Edge-side composition is underrated.** For content-heavy sites, it gives you the organizational benefits of micro-frontends without the client-side performance tax. Consider it before Module Federation.
5. **Consider your hiring pool.** Module Federation requires senior engineers who understand Webpack internals and dependency management. If your team is mid-level heavy, Web Components or iframes may be safer choices.
;`,
            tags: ["Architecture", "Micro-Frontends", "Module Federation"],
          },
        ],
      },
      {
        id: "fe-testing",
        title: "Frontend Testing & Quality",
        description: "From unit to visual regression — building a reliable testing pyramid for the frontend.",
        topics: [
          {
            id: "fe-vitest",
            title: "Vitest: Unit & Component Testing",
            shortDesc: "Blazing-fast unit testing with Vite-native tooling — mocking, coverage, and component testing patterns.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Vitest shares Vite's config and transform pipeline — near-instant startup, HMR for test files.",
              "Component testing: testing-library + jsdom or happy-dom — test behavior, not implementation.",
              "Mocking strategies: vi.mock() at the module level, vi.spyOn() for object methods, MSW for network.",
              "Coverage: c8/istanbul integration — set thresholds in CI to prevent regression.",
              "Snapshot testing: use sparingly — easy to merge broken snapshots. Prefer inline snapshots.",
            ],
            content: `## Why This Matters

Frontend testing is in a golden age. Vitest gives you near-instant test startup by sharing Vite's transform pipeline, and Playwright provides reliable cross-browser automation without flaky sleeps. But the fundamental challenge remains: **what should you test, and at what level?** Most teams either over-invest in brittle E2E tests or under-invest in unit tests that miss real user-facing bugs. Understanding the modern testing pyramid — with Vitest for unit/component tests, Playwright for E2E, and accessibility checks integrated throughout — is essential for building a testing strategy that catches bugs without slowing development.

## Vitest: Vite-Native Testing

Vitest shares Vite's configuration, transform pipeline, and plugin system — eliminating the separate test build step that Jest required:

\`\`\`typescript
// vitest.config.ts — extends vite.config.ts automatically
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',  // DOM environment for component tests
    globals: true,         // describe, it, expect available globally
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',     // or 'istanbul'
      reporter: ['text', 'html'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
\`\`\`

### Component Testing

\`\`\`typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments count when button is clicked', () => {
    render(<Counter initialCount={0} />);

    const button = screen.getByRole('button', { name: /increment/i });
    fireEvent.click(button);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<Counter onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onChange).toHaveBeenCalledWith(1);
  });
});
\`\`\`

**Key principles:** Test behavior, not implementation. Don't test internal state, private methods, or component internals. Test what the user sees and does.

### Mocking Strategies

\`\`\`typescript
import { vi } from 'vitest';

// Mock a module entirely
vi.mock('../api', () => ({
  fetchUsers: vi.fn().mockResolvedValue([{ id: 1, name: 'Alice' }]),
  fetchPosts: vi.fn(),
}));

// Spy on an object method
const spy = vi.spyOn(localStorage, 'getItem');
spy.mockReturnValue('cached-data');

// Mock fetch globally (for API calls inside components)
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: 1, name: 'Alice' }]);
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
\`\`\`

Prefer **MSW (Mock Service Worker)** over vi.mock() for API mocking — it mocks at the network level, so your code runs unchanged and the same mocks can be used in E2E tests.

### Snapshot Testing

Snapshots are useful for catching unintended changes but should be used sparingly:

\`\`\`typescript
it('renders the profile card', () => {
  const { container } = render(<ProfileCard user={mockUser} />);

  // Inline snapshot — easier to review in PRs than external snapshot files
  expect(container.firstChild).toMatchInlineSnapshot(\`
    <div class="card">
      <img src="avatar.jpg" alt="Alice" />
      <h2>Alice</h2>
      <p>Software Engineer</p>
    </div>
  \`);
});
\`\`\`

**When to use snapshots:** Stable, rarely-changing UI output. Component libraries, design system components.
**When NOT to use:** Frequently changing content, complex nested trees, third-party component output.

## Playwright: Reliable E2E Testing

Playwright's killer feature: **auto-waiting**. Every action automatically waits for the element to be visible, enabled, and stable — no \`waitForTimeout\` or \`sleep(1000)\` needed:

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('user can add item to cart', async ({ page }) => {
  await page.goto('/products');

  // Playwright auto-waits for this element to be visible
  await page.getByText('Wireless Headphones').click();

  // Auto-waits for the add-to-cart button to be enabled
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // Verifies the cart updated — auto-waits for assertion
  await expect(page.getByTestId('cart-count')).toHaveText('1');
});
\`\`\`

### Network Mocking

\`\`\`typescript
test('shows error state when API fails', async ({ page }) => {
  // Intercept the API call and return a 500
  await page.route('**/api/products', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' }),
    });
  });

  await page.goto('/products');

  // Verify the error UI
  await expect(page.getByText('Something went wrong')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});
\`\`\`

### Visual Regression Testing

\`\`\`typescript
test('homepage matches design spec', async ({ page }) => {
  await page.goto('/');

  // Take a full-page screenshot and compare against baseline
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixelRatio: 0.01,  // Allow 1% pixel difference
    fullPage: true,
  });
});
\`\`\`

Visual regression catches CSS bugs that unit tests never will: layout shifts, font rendering issues, color mismatches, responsive breakpoint problems. The key is setting an appropriate threshold to avoid flakiness from anti-aliasing or animation frames.

## The Testing Strategy

\`\`\`
Testing pyramid for frontend apps (2026):

         ╱╲
        ╱  ╲           E2E / Visual Regression (Playwright)
       ╱    ╲          10-20 critical user journeys
      ╱──────╲
     ╱        ╲        Integration / Component (Vitest + Testing Library)
    ╱          ╲       100-200 component tests for core UI
   ╱────────────╲
  ╱              ╲     Unit / Utility (Vitest)
 ╱                ╲    Pure functions, hooks, reducers, validation
╱──────────────────╲
\`\`\`

Each level has its place:
- **Unit tests** (fast, reliable): pure logic, validation, data transformation
- **Component tests** (fast, reliable with mocks): individual component behavior and state
- **E2E tests** (slower, more brittle): critical user flows, happy paths
- **Visual regression** (catches CSS bugs): design integrity across changes

## CTO-Level Takeaways

1. **Use Vitest over Jest for new projects.** The Vite integration (shared config, instant startup, HMR for tests) is a significant DX improvement. Jest is legacy for new frontends.
2. **Invest in E2E tests for critical flows only.** Login, checkout, search — the 3-5 most important user journeys. Test everything else at the component level. E2E tests are 10x slower and more flaky.
3. **Use MSW for API mocking across all test levels.** The same mock handlers work in Vitest (node) and Playwright (browser). This means your tests reflect real API behavior consistently.
4. **Set coverage thresholds and fail the build.** 80% line coverage should be your minimum. Use the HTML coverage report to identify untested code in PR reviews.
5. **Add visual regression at the component level, not just E2E.** Tools like Chromatic or Percy integrate with Storybook and catch visual bugs before they reach staging.
6. **Invest in accessibility testing.** \`@axe-core/playwright\` running in CI catches ~30% of accessibility issues automatically. The remaining 70% require manual testing — but fixing the automated findings first reduces manual effort significantly.
;`,
            tags: ["Testing", "Vitest", "Tooling"],
          },
          {
            id: "fe-playwright",
            title: "Playwright: E2E & Visual Regression",
            shortDesc: "Cross-browser E2E testing with auto-waiting, network interception, and screenshot comparison.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Auto-waiting: Playwright waits for elements to be actionable — no arbitrary sleep() calls.",
              "Cross-browser: Chrome, Firefox, Safari, and Edge — including mobile WebKit emulation.",
              "Component testing: Playwright can mount individual components (React/Vue/Svelte) for isolated testing.",
              "Network mocking: intercept and modify API responses at the browser level — test edge cases reliably.",
              "Visual regression: pixel-diff screenshots with configurable threshold — catch unintended CSS changes.",
              "CI integration: shard tests across parallel workers, retry flaky tests, report with HTML reporter.",
            ],
            content: `## Why This Matters

Playwright is the de facto standard for browser automation — not just for testing, but for scraping, monitoring, and scripting. Its key advantage over Cypress and Puppeteer is **cross-browser support** (Chromium, Firefox, WebKit) with a single API, **auto-waiting** (eliminating arbitrary timeouts), and **network interception** at the browser protocol level. For teams building reliable E2E tests, Playwright's design philosophy — treat the browser as a programmable environment, not a black box — makes tests faster to write and more reliable to run.

## Auto-Waiting: The Magic Behind Reliable Tests

The #1 cause of flaky E2E tests is timing — clicking a button before it's enabled, typing into an input that hasn't rendered, asserting on text that hasn't appeared. Playwright eliminates this with **auto-waiting**:

\`\`\`typescript
// Playwright waits for ALL of these conditions before proceeding:
await page.getByRole('button', { name: 'Submit' }).click();
// 1. Element is attached to the DOM
// 2. Element is visible (not display:none, not zero size)
// 3. Element is stable (not animating)
// 4. Element receives events (not obscured by another element)
// 5. Element is enabled (not disabled)

// If any condition isn't met within the timeout (default 30s), the test fails
// If the condition IS met, the action executes immediately — no fixed waits
\`\`\`

Compare with Cypress (which has built-in retrying) and raw Puppeteer (which does not):

\`\`\`typescript
// Puppeteer — manual wait needed
await page.waitForSelector('button:not([disabled])');
await page.click('button');

// Cypress — auto-retries assertions but has a different mental model
cy.get('button').should('not.be.disabled').click();

// Playwright — everything auto-waits
await page.getByRole('button').click();
\`\`\`

## Cross-Browser Testing

Playwright supports Chromium, Firefox, and WebKit (Safari) with the same API:

\`\`\`typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: {
        browserName: 'webkit',
        // Mobile Safari emulation
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ...',
      },
    },
  ],
});
\`\`\`

Running tests across all three browsers catches browser-specific bugs — CSS differences, API availability, event handling quirks — that single-browser testing misses.

### Locator Strategy

Playwright encourages **accessible locators** over CSS selectors:

\`\`\`typescript
// Avoid: CSS selectors — brittle, tied to implementation
page.locator('.card-header h2');
page.locator('#submit-btn');

// Prefer: Accessible locators — stable, user-centric
page.getByRole('button', { name: /submit/i });
page.getByLabel('Email address');
page.getByPlaceholder('Enter your name');
page.getByText('Welcome back');
page.getByTestId('checkout-form');  // Use only when no semantic locator works

// Chaining: narrow down within a section
const form = page.getByRole('form', { name: 'Login' });
await form.getByLabel('Email').fill('user@example.com');
await form.getByRole('button', { name: 'Sign in' }).click();
\`\`\`

Using accessible locators means your tests mirror how real users interact with the page — and they double as accessibility checks.

## Advanced Patterns

### Component Testing

Playwright can mount individual components (React, Vue, Svelte) for isolated testing:

\`\`\`typescript
import { test, expect } from '@playwright/experimental-ct-react';
import { Counter } from './Counter';

test('counter increments', async ({ mount }) => {
  const component = await mount(<Counter initialCount={5} />);

  await component.getByRole('button').click();

  await expect(component.getByTestId('count')).toHaveText('6');
});
\`\`\`

### Parallel Execution and Sharding

\`\`\`
# Run tests in parallel across CI machines
npx playwright test --shard=1/4  # Machine 1: runs 25% of tests
npx playwright test --shard=2/4  # Machine 2: runs 25% of tests
npx playwright test --shard=3/4  # Machine 3
npx playwright test --shard=4/4  # Machine 4

# Combined: reduces CI E2E time from 30min to 7.5min
\`\`\`

### Trace Viewer and Debugging

Playwright captures a **trace** of every test run (DOM snapshots, network requests, console logs, screenshots) that can be viewed in the Trace Viewer:

\`\`\`typescript
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on-first-retry',  // Capture trace only when test fails
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
\`\`\`

\`\`\`bash
# View traces locally
npx playwright show-trace test-results/trace.zip
\`\`\`

## CTO-Level Takeaways

1. **Playwright is the standard for E2E testing.** Choose it over Cypress for new projects — the cross-browser support, auto-waiting, and network interception API are superior. Cypress's ecosystem advantages (plugins, community) are shrinking.
2. **Use accessible locators exclusively.** Enforce \`getByRole\`, \`getByLabel\`, \`getByText\` in code review. CSS-based selectors in tests are a code smell — they couple tests to implementation details.
3. **Shard E2E tests in CI.** Even with 50 E2E tests, a full run can take 15+ minutes. Sharding across 4 machines brings this under 5 minutes.
4. **Record traces on failure.** The Trace Viewer is the best debugging tool for flaky tests — it shows exactly what happened before the failure. Enable \`trace: 'on-first-retry'\$ to capture traces without slowing passing tests.
5. **Run tests across browsers, not just Chromium.** WebKit and Firefox catch real rendering and API differences. At minimum, run critical user flows across all three.
;`,
            tags: ["Testing", "E2E", "Playwright"],
          },
          {
            id: "fe-a11y",
            title: "Accessibility: WCAG, ARIA & Automated Testing",
            shortDesc: "Building inclusive web apps — WCAG 2.2 criteria, ARIA patterns, and integrating a11y into CI.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "WCAG 2.2: four principles (Perceivable, Operable, Understandable, Robust) with three conformance levels (A, AA, AAA).",
              "ARIA: roles, states, and properties supplement native semantics — first rule: don't use ARIA if a native HTML element works.",
              "Keyboard navigation: all interactive elements must be reachable and operable via keyboard — visible focus indicators are non-negotiable.",
              "Screen reader testing: NVDA (Windows), VoiceOver (macOS/iOS), TalkBack (Android) — each interprets ARIA slightly differently.",
              "Automated a11y testing: axe-core, Lighthouse a11y audit, playwright-run axe checks in CI — catches ~30% of issues automatically.",
              "Manual testing: zoom to 200%, tab through every interactive element, test with high-contrast mode — catches what automation misses.",
              "Design system integration: enforce a11y at the component library level — every button, input, and dialog ships a11y-ready.",
            ],
            content: `## Why This Matters

Accessibility is not a feature — it's a fundamental property of good software. Approximately 15% of the global population has some form of disability, and inaccessible web applications exclude them from participating in modern life. Beyond the ethical imperative, accessibility is also a legal requirement (ADA, Section 508, EN 301 549) and a business advantage: accessible sites rank better in search, reach a wider audience, and are typically more usable for everyone (curb-cut effect). Understanding WCAG criteria, ARIA patterns, and how to integrate accessibility into your development workflow is essential for engineering leaders who want to ship software that works for everyone.

## WCAG 2.2: The Four Principles

The Web Content Accessibility Guidelines (WCAG) 2.2 organize accessibility into four principles, each with specific success criteria at levels A (minimum), AA (standard), and AAA (advanced):

| Principle | Meaning | Key Criteria (AA) |
|-----------|---------|-------------------|
| **Perceivable** | Content must be available to at least one sense | Alt text, captions, color contrast (4.5:1) |
| **Operable** | UI must be usable with any input method | Keyboard navigation, no keyboard traps, timing adjustable |
| **Understandable** | Content and UI must be clear | Predictable navigation, error identification, readable language |
| **Robust** | Content must work with assistive technologies | Valid HTML, ARIA attributes, name/role/value |

### Color Contrast (AA: 4.5:1)

The most frequently failed WCAG criterion. Normal text must have a contrast ratio of at least 4.5:1 against its background. Large text (≥18px bold or ≥24px regular) requires 3:1.

\`\`\`css
/* BAD: Low contrast — fails WCAG AA */
.light-gray-text {
  color: #999;
  background: #fff;  /* Contrast ratio: 2.8:1 */
}

/* GOOD: Sufficient contrast — passes WCAG AA */
.dark-text {
  color: #333;
  background: #fff;  /* Contrast ratio: 10.2:1 */
}
\`\`\`

**Tooling:** Use \`@axe-core/playwright\` in CI, or the browser's built-in contrast checker in DevTools.

### Keyboard Navigation

All interactive elements must be reachable and operable via keyboard:

\`\`\`html
<!-- BAD: Click-only — inaccessible to keyboard users -->
<div class="button" onclick="submit()">Submit</div>

<!-- GOOD: Native button — keyboard accessible by default -->
<button onclick="submit()">Submit</button>

<!-- If you must use a div (e.g., complex custom widget): -->
<div
  role="button"
  tabindex="0"
  onclick="submit()"
  onkeydown="if(event.key === 'Enter') submit()"
>
  Submit
</div>
\`\`\`

**The #1 keyboard rule: all interactive functionality must be accessible via the Tab key and activated with Enter or Space.**

### Focus Indicators

Every interactive element must have a visible focus indicator. Never do this:

\`\`\`css
/* BAD: Hides focus — keyboard users cannot see their position */
*:focus {
  outline: none;
}

/* GOOD: Custom focus indicator — visible and branded */
*:focus-visible {
  outline: 2px solid #4A90D9;
  outline-offset: 2px;
  border-radius: 2px;
}
\`\`\`

## ARIA: Accessible Rich Internet Applications

ARIA supplements HTML semantics when native elements are insufficient:

\`\`\`html
<!-- First rule of ARIA: Don't use ARIA if you can use a native HTML element -->

<!-- BAD: Reinventing the wheel with ARIA -->
<div role="navigation" aria-label="Main navigation">
  <a href="/">Home</a>
  <a href="/about">About</a>
</div>

<!-- GOOD: Native <nav> already has the right role -->
<nav aria-label="Main navigation">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>

<!-- ARIA is needed for complex widgets: -->
<div role="tablist" aria-label="Product details">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
    Description
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">
    Reviews
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  Product description here.
</div>
\`\`\`

### Common ARIA Patterns

| Pattern | ARIA Attributes | Live Example |
|---------|----------------|--------------|
| Tabs | \`role="tablist"\`, \`role="tab"\`, \`role="tabpanel"\`, \`aria-selected\`, \`aria-controls\` | Product detail tabs |
| Accordion | \`aria-expanded\`, \`aria-controls\` | FAQ sections |
| Modal | \`role="dialog"\`, \`aria-modal="true"\`, \`aria-labelledby\` | Confirmation dialogs |
| Alert | \`role="alert"\`, \`aria-live="assertive"\` | Form validation errors |
| Progress | \`role="progressbar"\`, \`aria-valuenow\`, \`aria-valuemin\`, \`aria-valuemax\` | Upload progress |
| Menu | \`role="menubar"\`, \`role="menu"\`, \`role="menuitem"\` | Dropdown menus |

## Automated a11y Testing

Automated tools catch approximately 30% of accessibility issues — the remaining 70% require manual testing:

\`\`\`typescript
// Playwright + axe-core — run in every E2E test
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();

  // Fail the test if any violations found
  expect(results.violations).toEqual([]);
});
\`\`\`

\`\`\`bash
# Run as a dedicated CI step — not just in E2E tests
npx axe --exit --show-errors
\`\`\`

### What Automation Catches vs Misses

**Automation catches (30%):**
- Missing alt text on images
- Insufficient color contrast
- Missing form labels
- Invalid ARIA attributes
- Duplicate IDs

**Manual testing required (70%):**
- Logical reading order (screen reader navigation)
- Meaningful alt text (context-dependent)
- Non-visual content comprehension
- Keyboard navigation flow
- Focus management in dynamic content

## Integrating a11y into the Development Process

\`\`\`
1. Design phase:
   - Color contrast checks in design tools (Figma plugins)
   - Designer provides focus states, keyboard behavior specs
   - Annotations for screen reader content

2. Development phase:
   - Use semantic HTML by default (not divs with ARIA)
   - Add ARIA only when semantic HTML is insufficient
   - Keyboard-test every interactive element during development

3. Code review phase:
   - Checklist item: "Is this keyboard accessible?"
   - Checklist item: "Are the ARIA attributes correct?"

4. CI phase:
   - axe-core runs on every PR (fails build on violations)
   - Lighthouse a11y score is tracked (regression detection)

5. QA phase:
   - Manual screen reader testing (NVDA on Windows, VoiceOver on Mac)
   - Zoom to 200% — no content should be cut off
   - Tab through every interactive element — visible focus at every step
   - Test with high-contrast mode enabled
\`\`\`

## CTO-Level Takeaways

1. **Make accessibility a CI gate, not an afterthought.** \`@axe-core/playwright\` failing the build on new violations is the single most impactful change you can make. Fixing issues after they reach production is 10x more expensive.
2. **Invest in your design system's accessibility.** If your design system components (Button, Input, Modal, Select) are accessible, every product built on top of them inherits that accessibility. This is the highest-leverage investment.
3. **Prioritize keyboard navigation.** The most common and impactful accessibility failure is an interactive element that keyboard users cannot reach. Test every interactive element with Tab + Enter/Space during development.
4. **Don't rely on automation alone.** Automated a11y testing catches the "easy" issues. Schedule quarterly manual screen reader audits and include accessibility in your QA process.
5. **Accessibility is a spectrum, not a binary.** Aim for WCAG AA as your standard. AAA is rarely achievable for complex apps and shouldn't block progress. Track violations, fix them by priority, and don't let perfection be the enemy of progress.
;`,
            tags: ["Accessibility", "Testing", "UX"],
          },
        ],
      },
      {
        id: "fe-modern-frameworks",
        title: "Modern Framework Ecosystem",
        description: "Choosing and mastering the frameworks that define 2026 frontend architecture.",
        topics: [
          {
            id: "fe-nextjs",
            title: "Next.js: App Router, RSC & Server Actions in Practice",
            shortDesc: "Production patterns with Next.js App Router — mixing server/client components, data fetching, and deployment.",
            difficulty: "intermediate",
            readTimeMin: 11,
            keyPoints: [
              "App Router: file-system routing with layout nesting, loading.tsx, error.tsx — each file is a React component.",
              "Server Components by default: zero JS for static content, 'use client' boundary at the interaction leaf.",
              "Data fetching strategies: async server components (fetch in component), route handlers, server actions.",
              "Server Actions: functions annotated with 'use server' — called directly from client forms/buttons, no API route needed.",
              "Caching: Next.js caches fetch() results, rendered RSC payloads, and static routes — granular revalidation with revalidatePath/Tag.",
              "Partial Prerendering (PPR): combines static shell + dynamic holes in a single response — best of SSG and SSR.",
              "Deployment: Vercel (edge + serverless) vs self-hosted (Node.js Docker image) — trade-offs for latency and cost.",
            ],
            content: `## Why This Matters

Next.js has evolved from a simple SSR framework to a full-stack platform that redefines how React applications are built. The App Router (introduced in Next.js 13, now the default) represents a fundamental shift: Server Components by default, file-system routing with nested layouts, and Server Actions that eliminate the need for API routes. Understanding these patterns is essential for any team building production React applications — whether you use Next.js or not, its architectural decisions are shaping the entire React ecosystem.

## App Router Architecture

The App Router uses a file-system convention where each folder represents a route segment:

\`\`\`
app/
├── layout.tsx              ← Wraps all pages (applied to every route)
├── page.tsx                ← Route: /
├── loading.tsx             ← Shown while page.tsx data fetches
├── error.tsx               ← Error boundary for the route
├── not-found.tsx           ← 404 page
├── global-error.tsx        ← Root error boundary (replaces entire layout)
│
├── products/
│   ├── layout.tsx          ← Layout for /products/* (applied below root layout)
│   ├── page.tsx            ← Route: /products
│   ├── loading.tsx         ← Loading state for /products
│   └── [id]/
│       ├── page.tsx        ← Route: /products/123 (dynamic segment)
│       └── loading.tsx     ← Loading for individual product page
│
├── cart/
│   ├── page.tsx            ← Route: /cart
│   └── checkout/
│       └── page.tsx        ← Route: /cart/checkout
│
└── api/
    └── webhook/
        └── route.ts        ← Route handler: /api/webhook (GET, POST, etc.)
\`\`\`

### Layout Nesting

Layouts persist across navigations — they do not re-mount when the child route changes:

\`\`\`tsx
// app/layout.tsx — root layout (required)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <nav>{/* Persistent navigation */}</nav>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// app/products/layout.tsx — nested layout for /products/*
export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="products-layout">
      <Sidebar />  {/* Only for products section */}
      {children}
    </div>
  );
}
\`\`\`

## Server Components in Practice

In the App Router, **all components are Server Components by default**. Only components with the \`'use client'\$ directive are hydrated on the client:

\`\`\`tsx
// app/page.tsx — Server Component (default)
// This component runs only on the server. Zero JS sent to client.
async function HomePage() {
  const posts = await db.post.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 10,
  });

  return (
    <div>
      <h1>Latest Posts</h1>
      {/* posts.map(...) is server-rendered HTML — no JS for lists */}
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
      {/* Client Component at the leaf — only this needs JS */}
      <LikeButton postId={posts[0].id} />
    </div>
  );
}
\`\`\`

## Data Fetching Strategies

The App Router provides multiple data fetching approaches:

\`\`\`tsx
// 1. Fetch directly in the component (Server Component)
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetch(\`https://api.example.com/products/\${params.id}\`, {
    next: { revalidate: 3600 },  // ISR: revalidate every hour
  }).then(r => r.json());

  return <ProductDetail product={product} />;
}

// 2. Route handler (replaces API routes)
// app/api/products/route.ts
export async function GET(request: Request) {
  const products = await db.product.findMany();
  return Response.json(products);
}

// 3. Server Actions (for mutations)
// app/actions.ts
'use server';
export async function createProduct(formData: FormData) {
  const name = formData.get('name');
  const price = formData.get('price');

  await db.product.create({ data: { name, price: Number(price) } });

  revalidatePath('/products');  // Revalidate the cached page
  redirect('/products');
}
\`\`\`

## Caching in Next.js

Next.js has a multi-layered cache system that can be confusing:

| Cache Layer | What It Caches | Scope | Revalidation |
|-------------|----------------|-------|-------------|
| **Request Dedup** | Multiple \`fetch()\` calls with same URL in one render | Per request | Automatic (per render) |
| **Data Cache** | \`fetch()\` responses across requests | Persistent | \`revalidatePath()\`, \`revalidateTag()\$, or time-based |
| **Full Route Cache** | Rendered HTML/RSC payload | Persistent | Automatic on data change |
| **Router Cache** | Client-side navigation cache | Browser session | 30s by default |

\`\`\`typescript
// Fine-grained revalidation:
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate all pages that use this data
revalidateTag('products');

// Revalidate a specific page
revalidatePath('/products');
\`\`\`

## CTO-Level Takeaways

1. **Use the App Router, not the Pages Router.** The Pages Router is in maintenance mode. All new Next.js projects should use the App Router. Migration from Pages is worth planning.
2. **Server Components are not theoretical — they dramatically reduce bundle size.** Expect 40-60% JS reduction on content-heavy pages. Push the \`'use client'\$ boundary as deep as possible.
3. **Server Actions replace most simple API routes.** For CRUD operations on the same data model, Server Actions reduce boilerplate significantly. Keep dedicated API routes for third-party integrations and webhooks.
4. **Understand the caching model before optimizing.** Next.js's aggressive caching means stale data is common. Use \`revalidateTag()\$ for targeted revalidation. \`dynamic = 'force-dynamic'\$ is a blunt instrument for debugging.
5. **Choose your deployment platform carefully.** Vercel provides the best integration (edge functions, ISR, analytics) but is expensive at scale. Self-hosting offers cost control but requires managing Node.js servers and caching infrastructure.
;`,
            tags: ["Next.js", "React", "Framework"],
          },
          {
            id: "fe-astro",
            title: "Astro: Content-First & Islands Architecture",
            shortDesc: "Zero-JS-by-default with Astro — when to reach for Astro over Next.js, and how islands work.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "Astro islands: interactive components hydrate independently — rest of the page is static HTML/CSS (zero JS).",
              "Multi-framework: use React, Vue, Svelte, Solid, or Lit components side-by-side in the same page.",
              "Content collections: type-safe Markdown/MDX with frontmatter validation — ideal for docs, blogs, marketing.",
              "View Transitions: browser-level navigation with native View Transition API — SPA-like feel without SPA JS.",
              "When to choose Astro: content-heavy sites, marketing pages, e-commerce product pages — not for highly interactive apps.",
            ],
            content: `## Why This Matters

Astro occupies a unique niche in the framework landscape: it delivers **zero JavaScript by default**, making it the fastest option for content-driven websites. Its "Islands Architecture" — where interactive components are independent, lazily-loaded widgets in a sea of static HTML — directly addresses the hydration tax problem that plagues traditional SSR frameworks. For marketing sites, documentation, blogs, and e-commerce product pages, Astro often delivers the best Core Web Vitals scores with the least developer effort.

## Zero JS by Default

In Astro, every page is rendered as static HTML with zero client-side JavaScript — unless you explicitly add an interactive component:

\`\`\`astro
---
// This is Astro's "component frontmatter" — runs at build time
// Everything here is server-side / build-time only
const pageTitle = "Welcome to our store";
const products = await fetch('https://api.example.com/products').then(r => r.json());
---

<html lang="en">
  <head>
    <title>{pageTitle}</title>
  </head>
  <body>
    <h1>{pageTitle}</h1>

    <!-- Static product list — zero JS -->
    <ul class="product-grid">
      {products.map(product => (
        <li>
          <img src={product.image} alt={product.name} />
          <h2>{product.name}</h2>
          <p>\${product.price}</p>
        </li>
      ))}
    </ul>

    <!-- Interactive island — JS only for this component -->
    <AddToCart client:load />
  </body>
</html>
\`\`\`

The \`client:load\` directive tells Astro to hydrate the \`AddToCart\` component when the page loads. Other directives control *when* the island hydrates:

| Directive | Hydration Trigger | Use Case |
|-----------|-------------------|----------|
| \`client:load\` | Immediately on page load | Above-the-fold interactive elements |
| \`client:idle\` | When browser is idle (requestIdleCallback) | Below-the-fold widgets |
| \`client:visible\` | When element scrolls into viewport | Lazy-loaded sections, comments |
| \`client:media\` | When a media query matches | Responsive components (mobile nav) |
| \`client:only\` | Client-only (no SSR) | Components that need browser APIs |

## Content Collections

Astro's type-safe content management for Markdown/MDX:

\`\`\`typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',  // 'content' for Markdown/MDX, 'data' for JSON/YAML
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    author: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
\`\`\`

\`\`\`astro
---
// Query content collections with full type safety
import { getCollection } from 'astro:content';

const posts = await getCollection('blog', ({ data }) => {
  return !data.draft && data.pubDate < new Date();
});

// Sort by date
posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

{posts.map(post => <article>
  <h2><a href={\`/blog/\${post.slug}/\`}>{post.data.title}</a></h2>
  <time>{post.data.pubDate.toDateString()}</time>
</article>)}
\`\`\`

## Multi-Framework Support

Astro supports React, Vue, Svelte, Solid, Preact, and Lit components in the same page:

\`\`\`astro
---
// All of these can coexist in a single .astro file
import ReactCart from '../components/Cart.tsx';
import VueReviews from '../components/Reviews.vue';
import SvelteSearch from '../components/Search.svelte';
---

<!-- Each framework's component is an independent island -->
<ReactCart client:load />
<VueReviews client:visible />
<SvelteSearch client:idle />
\`\`\`

This is unique to Astro — no other framework allows mixing frameworks on the same page. It's useful for incrementally migrating from one framework to another, or when different teams prefer different frameworks.

## Astro vs Next.js

| Aspect | Astro | Next.js |
|--------|-------|---------|
| **Default rendering** | Static (zero JS) | Server-rendered (RSC) |
| **JS output** | Only interactive islands | Server + Client components |
| **Best for** | Content sites, marketing, docs | Full-stack apps, dashboards |
| **API routes** | Not built-in (use a backend) | Built-in (route handlers) |
| **Data fetching** | Build-time or client-side | Server Components, server actions |
| **Ecosystem** | Smaller but growing | Largest React ecosystem |
| **Learning curve** | Low (HTML-like syntax) | Medium (RSC, caching model) |

## CTO-Level Takeaways

1. **Use Astro for any content-driven website.** Marketing pages, documentation, blogs, landing pages — Astro delivers better Core Web Vitals scores than any full-stack framework. The zero-JS-by-default approach is a built-in performance guarantee.
2. **Keep interactive islands small.** The strength of Astro's architecture depends on minimizing the JS surface. If your page has more interactive components than static content, consider Next.js or Solid instead.
3. **Content Collections replace headless CMS for many use cases.** For documentation and blogs, the file-system-based content with built-in type validation reduces complexity compared to a CMS + API setup.
4. **Astro is excellent for migration scenarios.** The multi-framework support means you can incrementally rewrite a legacy jQuery site to React components over time, with Astro as the shell.
5. **Pair Astro with a proper backend.** Astro excels at the frontend, but it's not a full-stack framework. Use it with a backend (Node.js, Python, Go) for API routes, authentication, and database access.
;`,
            tags: ["Astro", "Architecture", "Framework"],
          },
          {
            id: "fe-ai-frontend",
            title: "AI Integration in Frontend Apps",
            shortDesc: "Embedding LLM capabilities — streaming chat, RAG UI patterns, and the Vercel AI SDK.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Vercel AI SDK: unified hooks (useChat, useCompletion, useAssistant) that work with any provider (OpenAI, Anthropic, open-source).",
              "Streaming UI: render LLM token streams as they arrive — Suspense boundaries for smooth progressive rendering.",
              "RAG UI patterns: search-as-you-type, cited answers with source highlights, follow-up suggestions.",
              "AI components: chat widgets, copilot sidebars, inline code completion — each has different UX patterns.",
              "Client-side vs server-side: sensitive logic (prompts, API keys) stays on server; streaming tokens rendered on client.",
              "Cost and latency: streaming reduces perceived latency; implement token budgets and rate limiting for production.",
            ],
            content: `## Why This Matters

AI integration is rapidly becoming a standard feature of web applications — not just standalone chatbots, but embedded copilots, AI-powered search, content generation, and intelligent form filling. The frontend patterns for AI integration are different from traditional data fetching: they involve streaming token-by-token output, managing conversation state, and maintaining user trust with citations and transparency. Understanding these patterns — especially the Vercel AI SDK, which has become the de facto standard — is essential for frontend teams building AI-enhanced experiences.

## The Vercel AI SDK

The AI SDK provides framework-agnostic hooks for integrating LLM providers into your application:

\`\`\`typescript
// app/api/chat/route.ts — API route for chat (any framework)
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: "You are a helpful assistant for our e-commerce site.",
  });

  return result.toDataStreamResponse();
}
\`\`\`

\`\`\`tsx
// Chat component (React, but similar hooks exist for Vue/Svelte)
'use client';
import { useChat } from 'ai/react';

function ChatWidget() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(m => (
          <div key={m.id} className={\`message \${m.role}\`}>
            {m.content}
          </div>
        ))}
        {isLoading && <TypingIndicator />}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about our products..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
\`\`\`

### Streaming UI

The SDK returns tokens as a stream, not a complete response. The UI updates progressively:

\`\`\`typescript
// What the browser receives:
// { "content": "The" }
// { "content": " product" }
// { "content": " is" }
// { "content": " available" }
// { "content": " in" }
// ...

// React renders each chunk as it arrives — no waiting for the full response
// The user sees tokens appearing in real-time, creating a responsive feel
\`\`\`

The AI SDK handles all the complexity: aborting in-progress generations, error recovery, reconnection, and streaming state management.

## RAG UI Patterns

Retrieval-Augmented Generation (RAG) combines LLM responses with retrieved context from your data:

\`\`\`typescript
// Server-side RAG implementation
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      searchProducts: tool({
        description: 'Search products in our catalog',
        parameters: z.object({
          query: z.string(),
          category: z.string().optional(),
        }),
        execute: async ({ query, category }) => {
          // Search the product database
          return db.product.findMany({
            where: {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
              ],
              ...(category ? { category } : {}),
            },
            take: 5,
          });
        },
      }),
    },
    maxSteps: 3,  // Allow the LLM to use tools and continue
  });

  return result.toDataStreamResponse();
}
\`\`\`

**UI considerations for RAG:**

1. **Cited answers:** Show which source documents informed the response (inline citations with hover preview)
2. **Source highlights:** When suggesting a product, show images, prices, and links alongside text
3. **Follow-up suggestions:** Generate possible next questions based on the current context
4. **Grounding indicators:** A subtle disclaimer that not all information may be current

## Cost and Latency Management

\`\`\`typescript
// Client-side rate limiting and budget tracking
import { experimental_useAssistant } from 'ai/react';

function useAiWithBudget() {
  const [tokenCount, setTokenCount] = useState(0);
  const MAX_TOKENS = 10000;  // Per session budget

  const assistant = experimental_useAssistant({
    api: '/api/assistant',
    onFinish: (message) => {
      // Track token usage from response headers
      const usage = message.annotations?.usage;
      if (usage) {
        setTokenCount(prev => prev + usage.totalTokens);
      }
    },
  });

  const isOverBudget = tokenCount > MAX_TOKENS;

  return { ...assistant, isOverBudget };
}
\`\`\`

**Production considerations:**

- **Token budgeting:** Set per-user/per-session token limits
- **Latency masking:** Show streaming tokens immediately — don't wait for complete response
- **Abort patterns:** Allow users to stop generation (AbortController)
- **Error states:** LLMs can timeout, return irrelevant results, or refuse to answer — handle gracefully
- **Caching:** Cache common queries (pricing, shipping policies) to reduce API costs

## CTO-Level Takeaways

1. **Stream everything.** Never make users wait for a complete LLM response. Streaming tokens as they arrive creates the perception of responsiveness even when the underlying model is slow.
2. **Implement RAG from day one.** A raw LLM without your business context will hallucinate pricing, availability, and policies. Always provide relevant context from your database or knowledge base.
3. **Set hard token budgets.** LLM costs scale with usage. Implement per-user token tracking and hard limits. Use caching for deterministic queries (policies, FAQs).
4. **Design for fallbacks.** LLMs can fail, be unavailable, or return harmful content. Every AI feature should have a graceful fallback (e.g., "I couldn't find an answer — here's the help center link").
5. **Measure perceived latency, not API latency.** Streaming makes 3-second responses feel instant. Track "time to first token" (TTFT) as your primary metric, not total generation time.
;`,
            tags: ["AI", "UX", "Integration"],
          },
          {
            id: "fe-sveltekit",
            title: "Svelte 5 & SvelteKit: Runes, Fine-Grained Reactivity & Meta-Framework",
            shortDesc: "Svelte's compiler-first approach, the runes API (Svelte 5), and SvelteKit's full-stack capabilities.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Svelte 5 runes: $state, $derived, $effect replace the old let/export let reactivity — explicit, fine-grained, no more signals debate.",
              "Compiler magic: Svelte compiles your components to vanilla JS at build time — no virtual DOM, no diffing, minimal runtime overhead.",
              "SvelteKit: file-system routing (like Next.js), but with form actions, load functions, and +page.server.ts / +page.ts separation.",
              "Form actions: the primary data mutation pattern — export actions object in +page.server.ts, use enhance for progressive enhancement.",
              "SvelteKit adapters: node, vercel, cloudflare, static — deploy the same app to any platform with adapter-specific config.",
              "When to choose Svelte: high-interactivity apps (dashboards, tools) where bundle size matters — smallest JS output of any framework.",
            ],
            content: `## Why This Matters

Svelte challenges the fundamental assumption that a UI framework needs a runtime. By compiling components to vanilla JavaScript at build time, Svelte eliminates the Virtual DOM, the diffing algorithm, and the framework runtime — producing the smallest bundles of any major framework. Svelte 5's "runes" API (\`$state\`, \`$derived\`, \`$effect\`) makes reactivity explicit and fine-grained, while SvelteKit provides a full-stack meta-framework with file-system routing, form actions, and server-side rendering. For teams building interactive apps where bundle size is critical (dashboards, tools, mobile web), Svelte offers unmatched performance characteristics.

## Svelte 5 Runes: Explicit Reactivity

Svelte 5 replaces the old \`let\`-based reactivity (which was implicit and magical) with explicit **runes**:

\`\`\`svelte
<script>
  // $state: reactive variable — when it changes, the UI updates
  let count = $state(0);

  // $derived: computed value — automatically recomputes when dependencies change
  let doubled = $derived(count * 2);

  // $effect: runs when its dependencies change (replaces onMount/onDestroy for this pattern)
  $effect(() => {
    console.log('Count changed to:', count);
  });

  function increment() {
    count += 1;  // Direct mutation — Svelte tracks this
  }
</script>

<button onclick={increment}>
  {count} × 2 = {doubled}
</button>
\`\`\`

**Why runes matter:** They make reactive dependencies explicit. Unlike the old Svelte (where any \`let\` variable could be reactive), runes are clearly demarcated. This makes code more readable and enables TypeScript inference to work correctly.

### How Compilation Works

Svelte compiles each component into vanilla JavaScript at build time:

\`\`\`javascript
// What the compiler generates (simplified):
function Counter($$anchor) {
  let count = 0;  // Ordinary JS variable
  let doubled = 0;

  // Svelte generates direct DOM update code — no Virtual DOM
  const button = document.createElement('button');
  const text = document.createTextNode(' ');

  const update = () => {
    doubled = count * 2;
    text.data = count + ' × 2 = ' + doubled;
  };

  button.onclick = () => {
    count += 1;
    update();  // Direct DOM update — no diffing
  };

  button.append(text);
  $$anchor.before(button);
}
\`\`\`

No Virtual DOM, no diffing, no reconciliation. When \`count\` changes, only the specific text node is updated. This is why Svelte bundles are 3-5x smaller than equivalent React apps.

## SvelteKit: Full-Stack Meta-Framework

SvelteKit follows the same file-system routing convention as Next.js but with its own data loading patterns:

\`\`\`typescript
// src/routes/products/[id]/+page.server.ts — server-side data loading
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const product = await fetch(\`/api/products/\${params.id}\`).then(r => r.json());
  const reviews = await fetch(\`/api/products/\${params.id}/reviews\`).then(r => r.json());

  return { product, reviews };
};
\`\`\`

\`\`\`svelte
<!-- src/routes/products/[id]/+page.svelte — the page component -->
<script>
  import type { PageData } from './$types';
  export let data: PageData;
  const { product, reviews } = data;
</script>

<h1>{product.name}</h1>
<p>{product.description}</p>

<h2>Reviews</h2>
{#each reviews as review}
  <div class="review">
    <p>{review.text}</p>
    <small>— {review.author}</small>
  </div>
{/each}
\`\`\`

### Form Actions

SvelteKit's primary data mutation pattern:

\`\`\`typescript
// src/routes/products/[id]/+page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  addReview: async ({ request, params }) => {
    const formData = await request.formData();
    const text = formData.get('text');
    const rating = formData.get('rating');

    await db.review.create({
      data: {
        productId: params.id,
        text,
        rating: Number(rating),
      },
    });

    // On success, re-run load functions to get fresh data
    return { success: true };
  },
};
\`\`\`

\`\`\`svelte
<!-- The form automatically handles loading states via use:enhance -->
<script>
  import { enhance } from '$app/forms';
</script>

<form method="POST" action="?/addReview" use:enhance>
  <textarea name="text" required></textarea>
  <select name="rating">
    {#each [1, 2, 3, 4, 5] as r}
      <option value={r}>{r} stars</option>
    {/each}
  </select>
  <button type="submit">Submit Review</button>
</form>
\`\`\`

## CTO-Level Takeaways

1. **Svelte produces the smallest bundles of any major framework.** For apps where bundle size is critical (mobile web, low-end devices, performance-sensitive dashboards), Svelte is the strongest choice. Expect 30-50KB gzipped for a typical SvelteKit app vs 80-120KB for React.
2. **SvelteKit's form actions are excellent for data mutations.** The progressive enhancement pattern (works without JS, enhances when JS loads) is simpler than React Query + Server Actions for most use cases.
3. **The ecosystem is smaller but mature.** Svelte has fewer UI libraries, fewer tutorials, and a smaller hiring pool than React. Evaluate whether your team's productivity depends on ecosystem availability.
4. **Consider Svelte for greenfield internal tools.** Dashboards, admin panels, and data visualization tools benefit from Svelte's small bundles and fast updates. React's ecosystem advantage matters less for closed-source internal apps.
5. **The compiler-based approach has trade-offs.** Dynamic component loading and runtime composition are harder in Svelte than React. If your app needs heavy dynamic component loading, evaluate carefully.
;`,
            tags: ["Svelte", "SvelteKit", "Framework"],
          },
          {
            id: "fe-vue-nuxt",
            title: "Vue 3 & Nuxt 3: Composition API, Reactivity & Full-Stack Framework",
            shortDesc: "Vue 3's Proxy-based reactivity system, the Composition API, and Nuxt 3's hybrid rendering approach.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Vue 3 Composition API: ref() for primitives, reactive() for objects, computed(), watch() — composables replace mixins for code reuse.",
              "Reactivity system: Vue 3 uses Proxy (not defineProperty) — deep reactivity by default, no special syntax for nested objects.",
              "script setup: the recommended syntax — less boilerplate than options API, top-level imports and variables are available in template.",
              "Vue ecosystem: Pinia (state management), Vue Router, Vite as the default build tool — everything is officially maintained.",
              "Nuxt 3: file-system routing, auto-imports, hybrid rendering (SSR + SSG + ISR per route), Nitro server engine.",
              "Nuxt modules: a rich module ecosystem — Nuxt Auth, Nuxt Content, Nuxt UI — first-party and community maintained.",
              "When to choose Vue: team preference for HTML-in-template (vs JSX), progressive adoption (Vue is the easiest to add to existing pages).",
            ],
            content: `## Why This Matters

Vue 3 represents a mature middle ground between React and Svelte: it offers a reactive system similar to signals, a flexible Composition API, and an officially maintained meta-framework (Nuxt 3) that rivals Next.js. Vue's key advantage is its **progressive adoption** — you can add Vue to an existing page incrementally, use it as a simple view layer, or scale it to a full-stack application with Nuxt. For teams that prefer HTML-in-template (rather than JSX) and want a framework with strong official libraries (router, state management, build tool), Vue is an excellent choice.

## Vue 3 Composition API

The Composition API groups related logic together (unlike the Options API which scatters it across \`data\`, \`methods\`, \`computed\`):

\`\`\`vue
<script setup>
import { ref, computed, onMounted } from 'vue';

// Reactive state — ref() for primitives, reactive() for objects
const count = ref(0);
const user = reactive({ name: 'Alice', email: 'alice@example.com' });

// Computed — automatically tracks dependencies
const doubled = computed(() => count.value * 2);

// Watch — react to changes
watch(count, (newVal, oldVal) => {
  console.log(\`Count changed from \${oldVal} to \${newVal}\`);
});

// Lifecycle
onMounted(() => {
  console.log('Component mounted');
});

function increment() {
  count.value++;  // .value is required for ref() in <script>
}
</script>

<template>
  <button @click="increment">
    {{ count }} × 2 = {{ doubled }}
  </button>
</template>
\`\`\`

### Reactivity System: Proxy-Based

Vue 3 uses JavaScript Proxies for deep, automatic reactivity — no special syntax needed for nested objects:

\`\`\`typescript
import { reactive, watch } from 'vue';

const state = reactive({
  user: {
    profile: {
      name: 'Alice',
      address: { city: 'NYC' },
    },
  },
});

// Deep reactivity — this triggers watchers:
state.user.profile.address.city = 'SF';

// Vue 3's reactive() uses Proxy traps on get/set
// Every property access registers a dependency
// Every property set triggers dependent watchers
\`\`\`

This contrasts with React, where only \`setState\` triggers re-renders, and deeply nested state requires manual cloning or Immer.

## Nuxt 3: Full-Stack Vue

Nuxt 3 provides a similar feature set to Next.js but with Vue's reactivity model:

\`\`\`typescript
// server/api/products.ts — Nitro API route (Nuxt's server engine)
export default defineEventHandler(async (event) => {
  const products = await db.product.findMany();
  return products;
});

// pages/products/[id].vue — File-system route
<script setup>
const route = useRoute();
const { data: product, pending } = await useFetch(\`/api/products/\${route.params.id}\`);

// useFetch is auto-imported — deduplicates requests, handles caching
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else>
    <h1>{{ product.name }}</h1>
    <p>{{ product.description }}</p>
  </div>
</template>
\`\`\`

### Hybrid Rendering

Nuxt 3 supports per-route rendering strategies:

\`\`\`typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },                    // SSG — pre-rendered at build
    '/products': { swr: 3600 },                  // ISR — revalidate every hour
    '/admin/**': { ssr: false },                  // CSR — no server rendering
    '/api/**': { cors: true },                    // API routes
  },
});
\`\`\`

## Vue vs React: Decision Guide

| Aspect | Vue 3 | React 19 |
|--------|-------|----------|
| **Templating** | HTML templates (separate template block) | JSX (JavaScript expressions) |
| **Reactivity** | Proxy-based (automatic deep tracking) | Explicit setState / hooks |
| **Ecosystem** | Officially maintained (Pinia, Router, Vite) | Community-driven (React Query, Zustand, React Router) |
| **Learning curve** | Lower for traditional web developers | Higher (JSX, hooks mental model) |
| **Bundle size (min+gzip)** | ~33KB (runtime + compiler) | ~42KB (react + react-dom) |
| **TypeScript** | Excellent (script setup + generics) | Excellent (but hooks require generic discipline) |

## CTO-Level Takeaways

1. **Vue is the most pragmatic choice for teams transitioning from jQuery or traditional MVC.** Its template syntax is familiar to any developer who knows HTML, and the progressive adoption model (add Vue to existing pages incrementally) reduces migration risk.
2. **Nuxt 3 is production-ready for full-stack apps.** Its hybrid rendering (per-route SSR/SSG/CSR/ISR) and Nitro server engine make it a strong competitor to Next.js, with less complexity around caching.
3. **Vue's official ecosystem reduces decision fatigue.** Pinia (state), Vue Router (routing), Vite (build), Nuxt (meta-framework) — all officially maintained, all designed to work together. Compare with React where you must assemble your own stack.
4. **Consider Vue for European/Asian markets.** Vue has significantly larger market share in Europe (especially France, Netherlands, Germany) and Asia (China, Japan) compared to the US. If hiring in those regions, Vue talent is more available.
5. **The Composition API is a learning investment.** Developers coming from Vue 2 Options API need time to adjust. Budget 1-2 weeks for the transition, and use the \`<script setup>\$ syntax which is the recommended modern approach.
;`,
            tags: ["Vue", "Nuxt", "Framework"],
          },
        ],
      },
      {
        id: "fe-css",
        title: "CSS Architecture: Tailwind, Design Tokens & Styling Strategies",
        description: "Modern CSS workflows — utility-first frameworks, CSS Modules, CSS-in-JS, and scalable design systems.",
        topics: [
          {
            id: "fe-tailwind",
            title: "Tailwind CSS & Utility-First Workflow",
            shortDesc: "Writing CSS faster with utility classes — the trade-offs, customization, and when utility-first makes sense.",
            difficulty: "foundational",
            readTimeMin: 8,
            keyPoints: [
              "Utility-first: compose UI from small, single-purpose classes (flex, pt-4, text-lg) — no context-switching between HTML and CSS files.",
              "Design system enforcement: Tailwind's config file defines colors, spacing, typography — developers can't invent arbitrary values.",
              "PurgeCSS / content detection: Tailwind scans your templates and tree-shakes unused classes — production CSS is typically 10-15KB gzipped.",
              "Customization: extend the default theme, use arbitrary values (top-[117px]), write custom plugins for reusable utilities.",
              "Tailwind vs hand-written CSS: Tailwind wins for iteration speed and consistency; loses for readability when classes become long strings.",
              "Headless UI / Radix + Tailwind: accessible, unstyled primitives combined with Tailwind — the 2026 recommendation for new projects.",
            ],
            content: `## Why This Matters

Tailwind CSS has fundamentally changed how the frontend ecosystem approaches styling. Its utility-first approach — composing UI from hundreds of single-purpose classes rather than writing custom CSS — has been adopted by the majority of new projects. The debate is no longer "should we use Tailwind?" but "how should we configure and extend it for our team?" Understanding Tailwind's trade-offs, customization patterns, and where it fits in the broader CSS ecosystem is essential for teams that want consistent, maintainable, and performant styles.

## Utility-First: What It Actually Means

Traditional CSS requires you to invent names and jump between HTML and CSS files:

\`\`\`css
/* Traditional CSS */
.profile-card {
  display: flex;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  background-color: white;
}
.profile-card__avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  margin-right: 1rem;
}
.profile-card__name {
  font-size: 1.125rem;
  font-weight: 600;
}
\`\`\`

\`\`\`html
<!-- Tailwind: compose from utilities, no context-switching -->
<div class="flex p-6 rounded-lg shadow-sm bg-white">
  <img class="w-12 h-12 rounded-full mr-4" src="avatar.jpg" alt="" />
  <p class="text-lg font-semibold">Alice</p>
</div>
\`\`\`

**The key shift:** You stop naming things (no more BEM, no more CSS class hierarchies). You compose styling directly in the template using a constrained set of design tokens.

### Design System Enforcement

Tailwind's configuration file is your design system:

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a5f',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
\`\`\`

**Why this matters:** Developers cannot invent \`color: #4A7B9D\` or \`margin-left: 17px\`. They can only use the colors, spacing, and typography defined in the config. This enforces design consistency mechanically — no code review can match what config-level enforcement achieves.

### The "Long Class Strings" Problem

The most common criticism of Tailwind:

\`\`\`html
<!-- This is hard to read: -->
<button class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-500 border border-transparent rounded-md shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
  Submit
</button>
\`\`\`

Solutions:
1. **Extract components** (React, Vue): Create a \`Button\` component that wraps Tailwind classes — the long string is written once.
2. **\`@apply\` directive** (for rare cases where extraction is impractical):
   \`\`\`css
   .btn-primary {
     @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md;
   }
   \`\`\`
3. **Accept it:** The long class string is in your template, not in separate CSS files. Many teams find the trade-off worth it.

## Production Build Size

Tailwind's purge (content detection) removes unused classes at build time:

\`\`\`javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx,vue,svelte,astro}',
  ],
};
\`\`\`

On a typical project, Tailwind produces **10-15KB of gzipped CSS** — comparable to or smaller than hand-written CSS. The "Tailwind is bloated" criticism is outdated (it was true in v1 before purge was the default).

## Custom Plugins

For reusable utility patterns:

\`\`\`javascript
// tailwind.config.js
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function({ addUtilities, theme }) {
      addUtilities({
        '.text-balance': {
          textWrap: 'balance',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    }),
  ],
};
\`\`\`

## Tailwind + Headless Component Libraries

The 2026 recommended pattern: use unstyled, accessible primitives with Tailwind:

\`\`\`tsx
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';

function Dropdown() {
  return (
    <Menu>
      <MenuButton className="inline-flex items-center px-4 py-2 bg-white rounded-md shadow-sm hover:bg-gray-50">
        Options
      </MenuButton>
      <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black/5">
        <MenuItem>
          <a className="block px-4 py-2 text-sm hover:bg-gray-100" href="/settings">
            Settings
          </a>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
\`\`\`

This combines Tailwind's styling speed with Headless UI's baked-in accessibility (keyboard navigation, ARIA attributes, focus management).

## CTO-Level Takeaways

1. **Tailwind is the default choice for new projects.** Its design system enforcement, iteration speed, and production CSS size make it the pragmatic choice. Use it unless you have specific requirements that demand CSS-in-JS or runtime styling.
2. **Invest in your Tailwind config.** The config file IS your design system. Spend time defining brand colors, spacing scale, typography, and breakpoints. This prevents the proliferation of arbitrary values that makes unstyled Tailwind chaotic.
3. **Enforce component extraction in code review.** Long class strings belong inside reusable components, not scattered across pages. A Button component should exist once; every \`<button>\$ in the app should use it.
4. **Pair Tailwind with a headless component library.** Radix UI (React) or Headless UI (Vue/React) provide accessible primitives that accept Tailwind classes. This gives you accessibility + styling speed without reinventing dialog/menu/tabs patterns.
5. **Train your team on the Tailwind mindset.** Developers accustomed to semantic CSS may resist the utility-first approach. Budget 1-2 weeks of ramp-up time and emphasize that Tailwind's constraints are features, not limitations.
;`,
            tags: ["CSS", "Tailwind", "Styling"],
          },
          {
            id: "fe-css-modules",
            title: "CSS Modules, CSS-in-JS & Design Tokens",
            shortDesc: "Scoping styles, runtime vs zero-runtime CSS-in-JS, and token-driven design at scale.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "CSS Modules: locally scoped class names by default — the build tool (Vite/Webpack) mangles class names to avoid collisions.",
              "CSS-in-JS evolution: runtime (styled-components) → zero-runtime (Linaria, Panda CSS) → static extraction (Vanilla Extract, StyleX).",
              "Design tokens: platform-agnostic variables (color, spacing, typography) defined in JSON — consumed by CSS, Figma, and documentation.",
              "StyleX (Meta): compile-time CSS-in-JS — type-safe, locally scoped, no runtime cost; used in Facebook/Meta products.",
              "Choosing a strategy: Tailwind for greenfield projects, CSS Modules for existing codebases, StyleX/Vanilla Extract for design-system-heavy apps.",
            ],
            content: `## Why This Matters

Not every project uses Tailwind. Legacy codebases, design-system-heavy applications, and teams that prefer runtime styling need alternatives. Understanding the full CSS landscape — CSS Modules for scoping, CSS-in-JS for dynamic styles, and design tokens for cross-platform consistency — ensures you can make an informed choice for your specific context. The industry has moved away from runtime CSS-in-JS (styled-components) toward zero-runtime solutions (Vanilla Extract, StyleX, Panda CSS) that provide the developer experience of CSS-in-JS without the performance cost.

## CSS Modules: Scoping Without JS

CSS Modules are built into Vite and Webpack — no configuration needed:

\`\`\`css
/* Button.module.css */
.button {
  display: inline-flex;
  padding: 0.5rem 1rem;
  background: var(--color-brand);
  border-radius: 0.25rem;
}

.primary {
  background: var(--color-brand-600);
  color: white;
}
\`\`\`

\`\`\`tsx
import styles from './Button.module.css';

function Button({ variant, children }) {
  return (
    <button className={\`\${styles.button} \${variant === 'primary' ? styles.primary : ''}\`}>
      {children}
    </button>
  );
}

// Generated HTML: <button class="Button_button_3xK92 Button_primary_2aLd7">
// Class names are scoped to this component — no collisions possible
\`\`\`

**Pros:** No runtime cost, works with any framework, built into build tools.
**Cons:** Dynamic styles require CSS custom properties or inline styles, no type safety (class names are strings).

## CSS-in-JS: The Evolution

The CSS-in-JS ecosystem has evolved through three generations:

| Generation | Examples | Mechanism | Runtime Cost |
|-----------|----------|-----------|--------------|
| 1st (Runtime) | styled-components, Emotion | Creates \`<style>\` tags at runtime, generates unique class names | **High** — inserts styles on first render |
| 2nd (Zero-runtime) | Linaria, Astroturf | Extracts CSS at build time, no runtime style injection | **None** — all CSS is static |
| 3rd (Static extraction) | Vanilla Extract, StyleX, Panda CSS | CSS is authored in JS/TS files, extracted to static CSS at build time with full type safety | **None** — type-safe, compiled to CSS |

### Why Runtime CSS-in-JS Is Declining

\`\`\`typescript
// styled-components (runtime) — each style injection adds ~0.5ms
// 100 components × 0.5ms = 50ms of style injection on first render
const Button = styled.button\`
  background: \${props => props.variant === 'primary' ? 'blue' : 'gray'};
  padding: 8px 16px;
  border-radius: 4px;
\`;

// This dynamic interpolation requires runtime evaluation
// The entire CSS string must be parsed on every render
// For SSR, styles must be collected and injected separately
\`\`\`

The performance cost, combined with the complexity of SSR style collection, has driven teams to zero-runtime alternatives.

### StyleX (Meta)

StyleX is Meta's internal CSS-in-JS solution, now open source. It's used in Facebook, Instagram, WhatsApp, and Threads:

\`\`\`typescript
import { stylex } from '@stylexjs/stylex';

const styles = stylex.create({
  button: {
    display: 'inline-flex',
    padding: '0.5rem 1rem',
    backgroundColor: {
      default: 'var(--color-brand)',
      ':hover': 'var(--color-brand-dark)',
    },
    borderRadius: '0.25rem',
  },
  primary: {
    backgroundColor: 'var(--color-brand-600)',
    color: 'white',
  },
});

function Button({ variant, children }) {
  return (
    <button {...stylex.props(styles.button, variant === 'primary' && styles.primary)}>
      {children}
    </button>
  );
}
\`\`\`

StyleX compiles to static CSS at build time — no runtime style injection. It provides:
- **Type safety:** Class name typos are compile-time errors
- **Locally scoped:** Generated class names are unique per file
- **No runtime cost:** All CSS is extracted during build
- **Dead code elimination:** Unused styles are removed during tree shaking

## Design Tokens

Design tokens are the bridge between design and development — platform-agnostic variables that represent design decisions:

\`\`\`json
{
  "color": {
    "brand": {
      "50": { "value": "#eff6ff", "type": "color" },
      "500": { "value": "#3b82f6", "type": "color" },
      "600": { "value": "#2563eb", "type": "color" }
    },
    "neutral": {
      "100": { "value": "#f5f5f5", "type": "color" },
      "900": { "value": "#171717", "type": "color" }
    }
  },
  "spacing": {
    "xs": { "value": "0.25rem", "type": "dimension" },
    "sm": { "value": "0.5rem", "type": "dimension" },
    "md": { "value": "1rem", "type": "dimension" },
    "lg": { "value": "1.5rem", "type": "dimension" },
    "xl": { "value": "2rem", "type": "dimension" }
  },
  "typography": {
    "fontFamily": { "value": ["Inter", "system-ui", "sans-serif"], "type": "fontFamily" }
  }
}
\`\`\`

**Why tokens matter:**
1. **Single source of truth:** Designers edit tokens in Figma (via plugins like Tokens Studio), developers consume the same tokens in CSS
2. **Multi-platform:** Generate CSS custom properties, Android XML, iOS Swift from the same token file
3. **Versioning:** Token changes are tracked in git — design changes become reviewable pull requests
4. **Automation:** CI can validate that no CSS file uses values outside the token set

### From Tokens to CSS

\`\`\`css
/* Generated from design tokens */
:root {
  --color-brand-50: #eff6ff;
  --color-brand-500: #3b82f6;
  --color-brand-600: #2563eb;
  --color-neutral-100: #f5f5f5;
  --color-neutral-900: #171717;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --font-family-display: Inter, system-ui, sans-serif;
}
\`\`\`

\`\`\`css
/* Usage */
.card {
  padding: var(--spacing-lg);
  background: var(--color-neutral-100);
  font-family: var(--font-family-display);
}
\`\`\`

## Choosing a Styling Strategy

\`\`\`
Scenario                        │ Recommended Approach
────────────────────────────────┼────────────────────────────────────
Greenfield project              │ Tailwind CSS
Large team, design system heavy │ Vanilla Extract or StyleX
Migrating existing codebase     │ CSS Modules (least invasive)
Runtime dynamic styles needed   │ CSS custom properties + inline styles
Cross-platform design system    │ Design tokens + platform-specific output
\`\`\`

## CTO-Level Takeaways

1. **Avoid runtime CSS-in-JS for new projects.** styled-components and Emotion were revolutionary but have been superseded by zero-runtime alternatives. The style injection performance cost and SSR complexity are no longer worth the benefit.
2. **Design tokens should be your foundation.** Whether you use Tailwind, CSS Modules, or StyleX, the design decisions (colors, spacing, typography) should come from a single token source. Tailwind's config is effectively a design token system — use it that way.
3. **Vanilla Extract / StyleX are the best choices for design-system-heavy codebases.** If you have a dedicated design system team and multiple products consuming the same components, the type safety and build-time extraction of these tools justify the setup overhead.
4. **CSS Modules are the lowest-effort migration path.** If you're migrating a legacy codebase with thousands of CSS files, CSS Modules provide scoping with minimal refactoring. Add gradually — one component at a time.
5. **Standardize across the organization.** The worst scenario is one team using Tailwind, another using styled-components, and a third using CSS Modules. Choose ONE approach and enforce it in project scaffolding.
;`,
            tags: ["CSS", "Design Systems", "Styling"],
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // BACKEND
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "backend",
    title: "Backend",
    tagline: "From HTTP request to database and back",
    description: "Deep dive into language runtime models, API design protocols, persistent storage engines, architecture patterns, and security frameworks.",
    color: "violet",
    iconName: "Server",
    topics: [],
    modules: [
      {
        id: "be-runtimes",
        title: "Language Runtimes & Concurrency",
        description: "How different languages handle execution, threads, and I/O under the hood.",
        topics: [
          {
            id: "be-nodejs",
            title: "Node.js Event Loop & Libuv",
            shortDesc: "Single-threaded, non-blocking I/O — how Node handles thousands of concurrent connections with one thread.",
            difficulty: "intermediate",
            readTimeMin: 10,
            keyPoints: [
              "Single thread: Node uses one main thread for JS execution — no shared memory race conditions.",
              "Libuv: the C library providing the event loop, thread pool, and OS async I/O abstraction.",
              "Thread pool: CPU-bound or blocking operations (file I/O, crypto) offloaded to 4 worker threads.",
              "Event loop phases: timers → pending callbacks → idle → poll → check (setImmediate) → close.",
              "process.nextTick: runs before any I/O callbacks — can starve the event loop if misused.",
            ],
            content: "// Content coming soon",
            tags: ["Node.js", "Runtime", "Concurrency"],
          },
          {
            id: "be-go-scheduler",
            title: "Go Scheduler: Goroutines & the GMP Model",
            shortDesc: "Go's M:N threading model — mapping lightweight goroutines to OS threads via logical processors.",
            difficulty: "advanced",
            readTimeMin: 11,
            keyPoints: [
              "G (Goroutine): ~2KB stack, grows dynamically — start millions cheaply.",
              "M (Machine): OS thread — expensive to create, so the runtime reuses them.",
              "P (Processor): logical CPU context — holds local run queue of goroutines.",
              "Work stealing: idle Ps steal goroutines from busy Ps' run queues.",
              "Preemption: scheduler checks goroutine yield points — cooperative and asynchronous preemption.",
            ],
            content: "// Content coming soon",
            codeExample: {
              language: "go",
              filename: "goroutines.go",
              code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	for i := 0; i < 10_000; i++ {
		wg.Add(1)
		go func(id int) {       // starts a goroutine (~2KB stack)
			defer wg.Done()
			fmt.Println(id)
		}(i)
	}
	wg.Wait()
}`,
            },
            tags: ["Go", "Concurrency", "Runtime"],
          },
          {
            id: "be-rust-ownership",
            title: "Rust Ownership, Borrowing & Async",
            shortDesc: "Memory safety without a GC — ownership rules, lifetimes, and the Tokio async runtime.",
            difficulty: "advanced",
            readTimeMin: 13,
            keyPoints: [
              "Ownership: each value has one owner — when the owner drops, the value is freed.",
              "Borrowing: shared references (`&T`) allow multiple readers; exclusive references (`&mut T`) allow one writer.",
              "Lifetimes: annotations telling the compiler how long references are valid.",
              "Send + Sync: traits marking types safe to transfer between threads or share across threads.",
              "Tokio: async runtime for Rust — cooperative scheduling on a thread pool using Futures.",
            ],
            content: "// Content coming soon",
            tags: ["Rust", "Concurrency", "Memory"],
          },
          {
            id: "be-io-models",
            title: "I/O Models: Blocking, Non-Blocking & io_uring",
            shortDesc: "From simple blocking reads to epoll multiplexing and Linux's io_uring ring buffer.",
            difficulty: "advanced",
            readTimeMin: 10,
            keyPoints: [
              "Blocking I/O: thread sleeps waiting for the syscall — simple, but wastes threads.",
              "Non-blocking + polling: syscall returns immediately with EAGAIN — busy-loop wastes CPU.",
              "I/O multiplexing (select/poll/epoll): kernel notifies when descriptors are ready — efficient.",
              "epoll: Linux-specific, O(1) event dispatch — used by Node.js, Nginx, Redis.",
              "io_uring: submission ring + completion ring — batches syscalls, reduces kernel/user context switches.",
            ],
            content: "// Content coming soon",
            tags: ["Systems", "Linux", "Performance"],
          },
          {
            id: "be-bun-deno",
            title: "Bun & Deno: The Modern Runtime Alternatives",
            shortDesc: "How Bun (JavaScriptCore) and Deno (V8) differ from Node.js — startup time, API surface, and ecosystem compatibility.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Bun: built on JavaScriptCore — ~4x faster cold start than Node; native TS/JSX transpilation, built-in test runner, SQLite.",
              "Deno: V8-based, web-standards-first — fetch, WebSocket, Web Crypto, Blob are globals, not imports.",
              "Node compat: both runtimes now support the npm registry and CommonJS — Bun via its own resolver, Deno via npm: specifiers.",
              "Built-in tooling: Bun ships a bundler, minifier, package manager, and test runner — no more webpack/vitest needed for basic cases.",
              "Permission model: Deno requires explicit flags (--allow-net, --allow-read); Bun follows Node's no-permissions model.",
              "Choosing a runtime: evaluate cold-start latency × API compatibility × built-in tooling × deployment target.",
            ],
            content: "// Content coming soon",
            tags: ["Runtime", "JavaScript", "Benchmark"],
          },
          {
            id: "be-python-web",
            title: "Python Web Frameworks: FastAPI, Django & ASGI",
            shortDesc: "The dominant Python backend ecosystems — ASGI vs WSGI, FastAPI's Pydantic-powered API layer, Django's batteries-included monolith, and async Python with Starlette.",
            difficulty: "intermediate",
            readTimeMin: 10,
            keyPoints: [
              "WSGI (Django, Flask): synchronous gateway interface — each request blocks a worker thread. Gunicorn + gevent for async concurrency.",
              "ASGI (FastAPI, Starlette): asynchronous gateway interface — native async/await support, WebSocket support out of the box.",
              "FastAPI: automatic OpenAPI/Swagger docs from Pydantic models — validation, serialization, and schema generation from type annotations.",
              "Django: ORM, admin panel, migrations (Alembic-like), auth, middleware — all included. Best for content-heavy and monolith apps.",
              "Flask: minimalist — composable extensions (Flask-SQLAlchemy, Flask-Login). Good for small services and prototyping.",
              "Pydantic: data validation using Python type hints — BaseModel, Field validators, JSON Schema export. Core of FastAPI and modern Python APIs.",
              "SQLAlchemy: ORM with Core (SQL expression) and ORM (declarative models) — Alembic for schema migrations. The Python DB standard.",
              "Celery: distributed task queue — broker-backed (Redis/RabbitMQ), scheduled tasks, chain workflows. Production background job processing.",
              "uv/rye: modern Python package management — uv is Rust-based pip alternative (10-100x faster), rye manages projects like Cargo. Replacing poetry/pipenv.",
            ],
            content: "// Content coming soon",
            tags: ["Python", "Backend", "API", "FastAPI", "Django"],
          },
          {
            id: "be-go-rust-web",
            title: "Go & Rust Web Frameworks: Gin, Echo, Axum & Actix",
            shortDesc: "The high-performance web framework landscape beyond Node.js — zero-allocation routing, compile-time safety, and async runtimes in Go and Rust.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Go Gin: most popular Go framework — martini-like API, middleware chains, JSON binding/validation, radix tree router for fast path matching.",
              "Go Echo: minimal, zero-allocation router — built-in middleware (CORS, CSRF, JWT, rate limiting), data binding, and OpenAPI support.",
              "Go Fiber: Express-inspired API — `c.Send()` / `c.JSON()` / `c.Next()` syntax ported to Go. Good for Node.js developers migrating to Go.",
              "Rust Axum: Tokio-based async framework from the Tower ecosystem — composable middleware via Tower Service trait, extractors, and state sharing.",
              "Rust Actix Web: actor-based async framework (though actors are optional) — fastest throughput measured by TechEmpower benchmarks.",
              "Choosing criteria: startup latency × throughput × ecosystem maturity × team expertise. Go for operational simplicity; Rust for maximum performance.",
            ],
            content: "// Content coming soon",
            tags: ["Go", "Rust", "Backend", "API", "Performance"],
          },
        ],
      },
      {
        id: "be-http",
        title: "HTTP & Network Protocols",
        description: "The transport layer everything runs on — HTTP versions, headers, caching, and WebSockets.",
        topics: [
          {
            id: "be-http-spec",
            title: "HTTP/1.1, HTTP/2 & HTTP/3 Compared",
            shortDesc: "Head-of-line blocking, multiplexing, server push, and QUIC — the evolution of the web's core protocol.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "HTTP/1.1: one request per connection — 6 parallel connections per browser as a workaround.",
              "HTTP/2: binary framing, multiplexing (multiple streams over one TCP connection), HPACK header compression.",
              "HTTP/2 HOL blocking: TCP-level packet loss stalls all streams.",
              "HTTP/3: QUIC (UDP-based) transport — per-stream reliability eliminates HOL blocking.",
              "0-RTT: QUIC can resume connections without a handshake using stored session tickets.",
            ],
            content: "// Content coming soon",
            tags: ["HTTP", "Networking", "Protocols"],
          },
          {
            id: "be-rest-design",
            title: "RESTful API Design",
            shortDesc: "Resource modeling, idempotency, status codes, and pagination — building APIs that don't surprise clients.",
            difficulty: "foundational",
            readTimeMin: 8,
            keyPoints: [
              "Resources as nouns: `/users/:id` not `/getUser?id=1`.",
              "HTTP methods: GET (safe + idempotent), PUT (idempotent), POST (neither), DELETE (idempotent).",
              "Status codes: 2xx success, 3xx redirect, 4xx client error, 5xx server error — use the right one.",
              "Idempotency: repeating the same request has the same effect — critical for retries.",
              "Pagination patterns: cursor-based vs offset-based — cursor scales, offset doesn't.",
              "Versioning: URL path (`/v2/`) vs header (`Accept-Version: 2`) — trade-offs for both.",
            ],
            content: "// Content coming soon",
            tags: ["API", "Design"],
          },
          {
            id: "be-graphql",
            title: "GraphQL: Schema, Resolvers & the N+1 Problem",
            shortDesc: "Type-safe API queries, dynamic data fetching, and solving the N+1 query problem with DataLoader.",
            difficulty: "intermediate",
            readTimeMin: 10,
            keyPoints: [
              "Schema: strongly-typed contract defining types, queries, mutations, and subscriptions.",
              "Resolver: function that fetches data for each field — composable tree of resolvers.",
              "N+1 problem: fetching a list of users, then making a DB query per user for their posts.",
              "DataLoader: batches and deduplicates requests within a single tick — solves N+1.",
              "Persisted queries: send query hash instead of full query string — improves GET caching.",
            ],
            content: "// Content coming soon",
            tags: ["GraphQL", "API"],
          },
          {
            id: "be-grpc",
            title: "gRPC & Protocol Buffers",
            shortDesc: "Binary serialization, HTTP/2 streaming, and strong contracts for inter-service communication.",
            difficulty: "advanced",
            readTimeMin: 9,
            keyPoints: [
              "Protocol Buffers: binary schema language — faster and smaller than JSON.",
              "Service definition: `.proto` files generate client/server stubs in any language.",
              "Streaming types: Unary, Server Streaming, Client Streaming, Bidirectional Streaming.",
              "gRPC on HTTP/2: multiplexed streams — one TCP connection for all calls.",
              "When to use: internal microservice-to-microservice — not browser-facing APIs.",
            ],
            content: "// Content coming soon",
            tags: ["gRPC", "API", "Protocols"],
          },
          {
            id: "be-websockets",
            title: "WebSockets, SSE & Real-Time Patterns",
            shortDesc: "Persistent connections for real-time data — when to use WebSockets vs SSE vs polling.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "WebSocket: full-duplex persistent connection over a single TCP socket after HTTP upgrade.",
              "SSE (Server-Sent Events): one-directional server-push over regular HTTP — simpler, auto-reconnects.",
              "Long polling: client holds request open until server has data — works everywhere, scales poorly.",
              "WebRTC: peer-to-peer data and media — bypasses server after ICE negotiation.",
              "Choosing: SSE for dashboards/feeds; WebSocket for chat/games; WebRTC for video calls.",
            ],
            content: "// Content coming soon",
            tags: ["Realtime", "Protocols", "API"],
          },
          {
            id: "be-trpc-hono",
            title: "Modern API Layers: tRPC & Hono",
            shortDesc: "Type-safe APIs without codegen (tRPC) and ultra-lightweight edge routers (Hono) — the new generation of API tooling.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "tRPC: end-to-end type safety — share types between server and client without REST/GraphQL schema codegen.",
              "tRPC procedure types: queries (GET/caching), mutations (POST), subscriptions (WebSocket) — all automatically inferred.",
              "tRPC middleware: auth, logging, rate limiting as reusable procedure middleware — composable, not decorator-based.",
              "Hono: ~14KB router that runs on Node, Deno, Bun, Cloudflare Workers, and Lambda — universal edge runtime API.",
              "Hono middleware ecosystem: JWT auth, CORS, compression, OpenAPI docs generation from Zod schemas.",
              "When to use which: tRPC for full-stack TypeScript apps (monorepos); Hono for multi-runtime edge/API gateways.",
            ],
            content: "// Content coming soon",
            tags: ["API", "TypeScript", "Edge"],
          },
          {
            id: "be-api-gateway",
            title: "API Gateway Patterns: Kong, APIGateway & Edge Routing",
            shortDesc: "Centralized entry points for API traffic — rate limiting, auth, transformation, and the shift to edge-native gateways.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "API Gateway responsibilities: auth (JWT validation, OAuth), rate limiting, request transformation, caching, canary routing, analytics.",
              "Kong: plugin-based gateway with a Postgres-backed admin API — 200+ plugins, open-source, runs on any infrastructure.",
              "AWS API Gateway: fully managed — REST, HTTP, and WebSocket APIs; integrates with Lambda, IAM, WAF, and CloudFront.",
              "Edge gateways: Cloudflare API Gateway, AWS CloudFront Lambda@Edge — rate limiting and auth at the CDN edge, near-zero latency.",
              "Rate limiting strategies: token bucket (burst-friendly), sliding window (fair), concurrency-based (for long-lived connections).",
              "Gateway vs mesh: gateway handles north-south (client → service); service mesh handles east-west (service → service) — they complement, not replace.",
            ],
            content: "// Content coming soon",
            tags: ["API Gateway", "Infrastructure", "Security"],
          },
        ],
      },
      {
        id: "be-databases",
        title: "Databases & Storage",
        description: "Storage engines, query planners, transaction isolation, and distributed database theory.",
        topics: [
          {
            id: "be-db-indexes",
            title: "Database Indexing: B-Tree & LSM-Tree",
            shortDesc: "How databases physically store and retrieve data — the data structures powering every query.",
            difficulty: "advanced",
            readTimeMin: 11,
            keyPoints: [
              "B-Tree: balanced tree of sorted pages — good for reads, random writes update in-place.",
              "B+Tree: leaf nodes hold all data and are linked — range scans are efficient.",
              "LSM-Tree (Log-Structured Merge): append-only writes to MemTable, flushed to SSTables — write-optimized.",
              "Compaction: background merge of SSTables to reclaim space and speed reads.",
              "Index types: primary (clustered), secondary, composite, partial, covering, full-text.",
            ],
            content: "// Content coming soon",
            tags: ["Databases", "Systems", "Performance"],
          },
          {
            id: "be-transactions",
            title: "Transactions: ACID, Isolation Levels & MVCC",
            shortDesc: "What 'Serializable' means, why you probably use Read Committed, and how MVCC eliminates read locks.",
            difficulty: "advanced",
            readTimeMin: 12,
            keyPoints: [
              "Atomicity: all-or-nothing — partial success is rolled back.",
              "Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.",
              "Anomalies by level: dirty reads, non-repeatable reads, phantom reads, write skew.",
              "MVCC (Multi-Version Concurrency Control): readers see a snapshot, don't block writers.",
              "2PL (Two-Phase Locking): acquire all locks before releasing any — prevents anomalies, causes deadlocks.",
              "WAL (Write-Ahead Log): changes written to log before applying to pages — enables crash recovery.",
            ],
            content: "// Content coming soon",
            tags: ["Databases", "Advanced"],
          },
          {
            id: "be-query-planner",
            title: "Query Planners & Execution",
            shortDesc: "How the database turns SQL into a physical execution plan — joins, statistics, and EXPLAIN.",
            difficulty: "advanced",
            readTimeMin: 10,
            keyPoints: [
              "Query planner: chooses physical operators (hash join, merge join, index scan) to minimize cost.",
              "Statistics: table row counts and column histograms guide the planner's cost estimates.",
              "EXPLAIN / EXPLAIN ANALYZE: shows the chosen plan and actual execution times.",
              "Join algorithms: nested loop, hash join, merge join — choose based on set sizes and indexes.",
              "N+1 mitigation: use JOINs or eager loading, not a query per row.",
            ],
            content: "// Content coming soon",
            tags: ["Databases", "SQL"],
          },
          {
            id: "be-nosql",
            title: "NoSQL: Document, Key-Value, Wide-Column & Graph",
            shortDesc: "When to leave relational behind — the data models, trade-offs, and use cases of each NoSQL category.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Document (MongoDB): flexible JSON documents — great for nested, schema-evolving data.",
              "Key-Value (Redis): O(1) lookups — caching, sessions, pub/sub, distributed locks.",
              "Wide-Column (Cassandra): partition key determines node — optimized for time-series writes.",
              "Graph (Neo4j): native relationships as first-class citizens — social graphs, fraud detection.",
              "Choosing: think about access patterns first, then pick the model that fits.",
            ],
            content: "// Content coming soon",
            tags: ["Databases", "NoSQL"],
          },
          {
            id: "be-cap",
            title: "Distributed Databases: CAP, PACELC & Consistency Models",
            shortDesc: "The fundamental trade-offs in distributed data systems — and what 'eventual consistency' really means.",
            difficulty: "advanced",
            readTimeMin: 10,
            keyPoints: [
              "CAP theorem: a distributed store can provide at most 2 of: Consistency, Availability, Partition tolerance.",
              "Partition tolerance is mandatory in practice — choose CP or AP.",
              "PACELC: when no partition, choose Latency vs Consistency — more nuanced than CAP.",
              "Strong consistency: reads always reflect the latest write — requires coordination.",
              "Eventual consistency: replicas converge over time — no global ordering guarantee.",
              "Consensus (Raft/Paxos): leader election + quorum writes for strong consistency.",
            ],
            content: "// Content coming soon",
            tags: ["Distributed Systems", "Databases"],
          },
          {
            id: "be-redis",
            title: "Redis: Data Structures, Persistence & Patterns",
            shortDesc: "Redis as a cache, message broker, and coordination primitive — and how it persists to disk.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Data structures: String, List, Hash, Set, Sorted Set, Stream, Bitmap.",
              "Expiry and eviction: TTL per key; LRU/LFU eviction policies when memory is full.",
              "Persistence: RDB (point-in-time snapshots) vs AOF (append-only command log).",
              "Pub/Sub: lightweight messaging — not durable, fire-and-forget.",
              "Distributed lock (Redlock): acquire lock across N independent Redis instances.",
              "Redis Cluster: sharding with consistent hashing across 16,384 hash slots.",
            ],
            content: "// Content coming soon",
            tags: ["Redis", "Caching"],
          },
        ],
      },
      {
        id: "be-architecture",
        title: "Backend Architecture Patterns",
        description: "Structuring business logic for maintainability, testability, and scalability.",
        topics: [
          {
            id: "be-clean-arch",
            title: "Clean Architecture & Hexagonal Architecture",
            shortDesc: "Keeping business logic independent of frameworks, databases, and delivery mechanisms.",
            difficulty: "intermediate",
            readTimeMin: 10,
            keyPoints: [
              "Dependency Rule: inner layers must not depend on outer layers.",
              "Entities: core business objects and rules — pure business logic, no framework code.",
              "Use Cases: application-specific business rules — orchestrate entities.",
              "Interface Adapters: translate data between use cases and external formats (HTTP, DB).",
              "Hexagonal: ports (interfaces) + adapters (implementations) — same idea, different framing.",
            ],
            content: "// Content coming soon",
            tags: ["Architecture", "Patterns"],
          },
          {
            id: "be-ddd",
            title: "Domain-Driven Design (DDD)",
            shortDesc: "Modeling complex business domains — bounded contexts, aggregates, entities, and domain events.",
            difficulty: "advanced",
            readTimeMin: 12,
            keyPoints: [
              "Ubiquitous Language: shared vocabulary between developers and domain experts.",
              "Bounded Context: explicit boundary within which a model is valid and consistent.",
              "Aggregate: cluster of entities with one Aggregate Root — the consistency boundary.",
              "Domain Events: things that happened in the domain — drive integration between contexts.",
              "Repository pattern: abstract data access behind a collection-like interface.",
            ],
            content: "// Content coming soon",
            tags: ["Architecture", "DDD", "Patterns"],
          },
          {
            id: "be-microservices",
            title: "Microservices: Patterns & Trade-offs",
            shortDesc: "Service decomposition, inter-service communication, and the distributed systems tax.",
            difficulty: "advanced",
            readTimeMin: 11,
            keyPoints: [
              "Decomposition strategies: by business capability, by subdomain, by team ownership.",
              "Synchronous (HTTP/gRPC): tight coupling, easier debugging — caller blocks on response.",
              "Asynchronous (message brokers): loose coupling, better resilience — adds message ordering complexity.",
              "Saga pattern: distributed transactions via choreography or orchestration.",
              "API Gateway: single entry point — handles routing, auth, rate limiting, aggregation.",
              "Service mesh (Istio/Linkerd): infrastructure-level mTLS, observability, traffic management.",
            ],
            content: "// Content coming soon",
            tags: ["Architecture", "Distributed Systems"],
          },
          {
            id: "be-events",
            title: "Event-Driven Architecture: Kafka & Event Sourcing",
            shortDesc: "Log-based messaging, consumer groups, and using the event log as the source of truth.",
            difficulty: "advanced",
            readTimeMin: 11,
            keyPoints: [
              "Kafka: distributed commit log — topics, partitions, offsets, consumer groups.",
              "Log retention: messages are kept for a configurable period — consumers can replay.",
              "Consumer groups: partitions assigned across group members — horizontal scaling of consumption.",
              "Event Sourcing: store every state change as an immutable event — derive current state by replaying.",
              "CQRS: separate write model (commands → events) from read model (projections).",
            ],
            content: "// Content coming soon",
            tags: ["Event-Driven", "Kafka", "Architecture"],
          },
          {
            id: "be-caching",
            title: "Caching Strategies",
            shortDesc: "Cache-aside, write-through, write-behind, and how to avoid stampedes and stale data.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "Cache-aside (lazy): app checks cache, falls back to DB on miss, populates cache.",
              "Write-through: write to cache and DB simultaneously — consistent, but write latency doubles.",
              "Write-behind (write-back): write to cache, async write to DB — faster writes, risk of data loss.",
              "Cache stampede: many requests miss at once and hammer DB — use probabilistic early expiration.",
              "Cache invalidation: the hardest problem — event-driven invalidation vs TTL trade-off.",
            ],
            content: "// Content coming soon",
            tags: ["Caching", "Architecture", "Performance"],
          },
          {
            id: "be-backend-testing",
            title: "Backend Testing: pytest, Testcontainers & Integration Strategy",
            shortDesc: "Testing backend services at every layer — from fast unit tests to containerized integration tests and consumer-driven contracts.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "pytest: fixtures (not setUp/tearDown), parametrization, conftest.py sharing, and 2000+ plugins. The standard for Python backend testing.",
              "Go testing: `go test` built-in — table-driven tests, subtests, `-race` flag for data race detection, `testify/assert` for richer assertions.",
              "Testcontainers: throwaway PostgreSQL, Redis, Kafka etc. in Docker containers — test against real infrastructure, not mocks. Supports Go, Python, Java, Node.",
              "Integration test boundaries: test each adapter (DB, cache, external API) with a real instance via Testcontainers — not the entire system at once.",
              "Consumer-driven contracts (Pact): microservice A publishes its expectations, microservice B runs them in CI — catches breaking API changes early.",
              "Test pyramid for backends: unit (70%) → integration (20%) → contract (5%) → E2E (5%). Adjust ratios based on service complexity.",
              "Fixture factories: factory_boy (Python) / factory_bot (Ruby) / testfixtures (Go) — build test data declaratively, not spread across tests.",
            ],
            content: "// Content coming soon",
            tags: ["Testing", "pytest", "Integration", "Quality"],
          },
        ],
      },
      {
        id: "be-security",
        title: "Security & Authentication",
        description: "Identity protocols, cryptographic primitives, and API security patterns.",
        topics: [
          {
            id: "be-authn",
            title: "OAuth 2.0 & OpenID Connect (OIDC)",
            shortDesc: "Delegated authorization and federated identity — the flows, tokens, and common mistakes.",
            difficulty: "intermediate",
            readTimeMin: 11,
            keyPoints: [
              "OAuth 2.0: grants a client limited access to a resource server on behalf of a user.",
              "Authorization Code Flow: safest for server-side apps — code exchanged for tokens server-to-server.",
              "PKCE (Proof Key for Code Exchange): protects Authorization Code flow in SPAs and mobile apps.",
              "OIDC: adds identity to OAuth — ID Token (JWT) carries user info.",
              "Token types: Access Token (short-lived, opaque or JWT), Refresh Token (long-lived, rotate on use).",
            ],
            content: "// Content coming soon",
            tags: ["Security", "Authentication", "OAuth"],
          },
          {
            id: "be-jwt",
            title: "JWT: Structure, Signing & Security Pitfalls",
            shortDesc: "What a JWT contains, how signatures work, and the attacks that JWT implementations get wrong.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Structure: header.payload.signature — base64url encoded, not encrypted.",
              "Signing algorithms: RS256 (asymmetric, verify with public key) vs HS256 (symmetric, shared secret).",
              "Vulnerabilities: `alg: none` attack, algorithm confusion, accepting expired tokens.",
              "Storage: memory > httpOnly cookie >> localStorage — XSS risk with localStorage.",
              "Revocation: JWTs are stateless — use short TTL + refresh token rotation, or a token blocklist.",
            ],
            content: "// Content coming soon",
            tags: ["Security", "JWT"],
          },
          {
            id: "be-crypto",
            title: "Cryptography Fundamentals for Developers",
            shortDesc: "Symmetric vs asymmetric encryption, TLS handshake, password hashing, and what not to implement yourself.",
            difficulty: "advanced",
            readTimeMin: 12,
            keyPoints: [
              "Symmetric encryption (AES-GCM): same key encrypts and decrypts — fast, key distribution is the problem.",
              "Asymmetric encryption (RSA, ECC): public key encrypts / private key decrypts — solves key distribution.",
              "TLS 1.3 handshake: ClientHello → ServerHello + Certificate → Finished — 1 RTT.",
              "Forward secrecy: ephemeral keys (ECDHE) ensure past sessions can't be decrypted if private key leaks.",
              "Password hashing: bcrypt, Argon2id — slow by design, with salt and work factor.",
            ],
            content: "// Content coming soon",
            tags: ["Security", "Cryptography"],
          },
        ],
      },
      {
        id: "be-data-access",
        title: "Type-Safe Data Access: ORMs & Query Builders",
        description: "From raw SQL to type-safe ORMs — how Prisma, Drizzle, and Kysely change the backend data layer.",
        topics: [
          {
            id: "be-prisma-drizzle",
            title: "Prisma vs Drizzle: Schema, Migrations & Query API",
            shortDesc: "Comparing the two dominant TypeScript ORMs — declarative schema vs code-first, and when each shines.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Prisma: declarative schema file (schema.prisma) — generates a fully typed client with auto-complete.",
              "Prisma migrations: declarative — diff the schema against the database, generate migration SQL automatically.",
              "Prisma limits: N+1 requires `include` or `relationLoadStrategy: join`; raw queries escape type safety.",
              "Drizzle: code-first — define tables as TS objects with drizzle-orm; schema IS your source of truth, no codegen step.",
              "Drizzle queries: SQL-like chaining API (db.select().from(users).where(eq(users.id, 1))) — closer to the metal.",
              "Drizzle migrations: `drizzle-kit` generates SQL files from schema diffs — full control over migration SQL.",
              "Choosing: Prisma for rapid prototyping and CRUD-heavy apps; Drizzle for complex queries and maximum type safety.",
            ],
            content: "// Content coming soon",
            tags: ["ORM", "Database", "TypeScript"],
          },
          {
            id: "be-kysely",
            title: "Kysely: Type-Safe SQL Query Builder",
            shortDesc: "Write raw SQL with full TypeScript type inference — no ORM overhead, no stringly-typed queries.",
            difficulty: "intermediate",
            readTimeMin: 6,
            keyPoints: [
              "Kysely is not an ORM — it's a query builder that generates SQL strings, inferred from your DB schema types.",
              "Schema introspection: kysely-codegen reads your live database and generates TypeScript types automatically.",
              "Type-safe joins, subqueries, CTEs — all checked at compile time, not runtime.",
              "When to use: complex reporting queries, multi-table aggregations, or when you want full SQL control without losing types.",
            ],
            content: "// Content coming soon",
            tags: ["SQL", "TypeScript", "Database"],
          },
        ],
      },
      {
        id: "be-ai-engineering",
        title: "AI Engineering for Backend Developers",
        description: "Integrating LLMs, embeddings, and RAG into production backend services — from prompt design to cost control.",
        topics: [
          {
            id: "be-llm-fundamentals",
            title: "LLM Fundamentals: Tokens, Context, Temperature & Prompting",
            shortDesc: "How LLMs process text, the parameters that control output, and prompt engineering patterns that work in production.",
            difficulty: "intermediate",
            readTimeMin: 10,
            keyPoints: [
              "Tokenization: text is split into tokens (~0.75 word per token) — input + output tokens determine API cost.",
              "Context window: the max tokens an LLM can consider — GPT-4 (128K), Claude (200K), Gemini (1M).",
              "Temperature: controls randomness — 0 for deterministic tasks, ~0.7 for creative generation.",
              "System prompt: the instruction that sets the LLM's behavior — most important prompt in the request.",
              "Few-shot prompting: provide examples in the prompt to guide output format — more reliable than instructions alone.",
              "Structured output: request JSON with a schema description — some providers now enforce JSON mode natively.",
              "Streaming: consume tokens as they're generated — reduces perceived latency, enables progressive UI rendering.",
            ],
            content: "// Content coming soon",
            tags: ["AI", "LLM", "Prompt Engineering"],
          },
          {
            id: "be-rag",
            title: "RAG: Retrieval-Augmented Generation in Practice",
            shortDesc: "Grounding LLM responses in your own data — embedding pipelines, vector databases, and hybrid search.",
            difficulty: "advanced",
            readTimeMin: 11,
            keyPoints: [
              "RAG architecture: ingest → chunk → embed → index → retrieve → generate — never fine-tune for factual recall.",
              "Chunking strategies: semantic chunking (by paragraph/section) beats fixed-size — overlap between chunks avoids boundary loss.",
              "Embedding models: text-embedding-3-small (OpenAI), voyage-2, Cohere Embed v3 — each has different dimensions and pricing.",
              "Vector databases: pgvector (PostgreSQL extension), Pinecone, Weaviate, Qdrant — trade-offs for latency vs consistency.",
              "Hybrid search: combine vector similarity (semantic) with BM25 keyword search (lexical) — best accuracy for most domains.",
              "RAG evaluation: hit rate, MRR (Mean Reciprocal Rank), faithfulness — does the generated answer actually match the retrieved context?",
              "Production RAG: caching (embedding + generation), rate limiting, content moderation guardrails, cost tracking per query.",
            ],
            content: "// Content coming soon",
            tags: ["AI", "RAG", "Vector Database"],
          },
          {
            id: "be-ai-production",
            title: "LLM APIs, Cost Control & Guardrails",
            shortDesc: "Choosing providers, managing API keys, implementing safety filters, and budgeting for LLM usage at scale.",
            difficulty: "advanced",
            readTimeMin: 9,
            keyPoints: [
              "Provider landscape: OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Google (Gemini 2.0), open-source (Llama 3, Mistral).",
              "API patterns: chat completions endpoint, function/tool calling, response streaming — each has different latency and cost profiles.",
              "Cost optimization: prompt caching, output length limits, model tiering (cheap model for classification, expensive model for generation).",
              "Guardrails: input/output content moderation (LlamaGuard, Azure AI Content Safety), PII redaction, prompt injection detection.",
              "Observability: trace LLM calls with OpenTelemetry — log prompts, responses, token counts, latency per request.",
              "Fallback chains: try cheap model first, escalate to expensive model on low confidence — reduces average cost per query.",
            ],
            content: "// Content coming soon",
            tags: ["AI", "API", "Production"],
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // INFRASTRUCTURE
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "infrastructure",
    title: "Infra",
    tagline: "The layer everything runs on",
    description: "Systems programming, Linux internals, traffic management, cloud network design, and zero-trust security.",
    color: "emerald",
    iconName: "Shield",
    topics: [],
    modules: [
      {
        id: "infra-linux",
        title: "Linux & Operating Systems",
        description: "The kernel primitives, process models, and networking stack underlying every server.",
        topics: [
          {
            id: "infra-processes",
            title: "Processes, Threads & the Linux Scheduler",
            shortDesc: "How the Linux kernel creates, schedules, and manages processes and threads.",
            difficulty: "advanced",
            readTimeMin: 11,
            keyPoints: [
              "Process: isolated execution context with own address space, file descriptors, PID.",
              "Thread (LWP): shares address space with siblings — lighter weight, communication via shared memory.",
              "fork(): copies the parent process — COW (copy-on-write) makes it cheap.",
              "exec(): replaces the current process image with a new program.",
              "CFS (Completely Fair Scheduler): assigns CPU time proportionally using a red-black tree.",
              "Nice values and cgroups: controlling CPU priority and limits.",
            ],
            content: "// Content coming soon",
            tags: ["Linux", "OS", "Kernel"],
          },
          {
            id: "infra-memory",
            title: "Virtual Memory, Paging & the MMU",
            shortDesc: "How the kernel abstracts physical RAM — virtual addresses, page tables, TLBs, and the OOM killer.",
            difficulty: "advanced",
            readTimeMin: 12,
            keyPoints: [
              "Virtual address space: each process sees its own flat address space — kernel maps to physical RAM.",
              "Page table: maps virtual page numbers to physical frame numbers.",
              "TLB (Translation Lookaside Buffer): cache of recent virtual → physical translations.",
              "Page fault: accessing an unmapped page — kernel handles it (load from disk, allocate, or SIGSEGV).",
              "mmap: map files or anonymous memory into the address space — used for fast I/O.",
              "OOM Killer: when memory is exhausted, kernel kills processes scored by heuristics.",
            ],
            content: "// Content coming soon",
            tags: ["Linux", "Memory", "Kernel"],
          },
          {
            id: "infra-files",
            title: "File Systems: VFS, Inodes & Page Cache",
            shortDesc: "The abstraction layer between applications and physical storage — and how the kernel caches disk reads.",
            difficulty: "advanced",
            readTimeMin: 10,
            keyPoints: [
              "VFS (Virtual File System): uniform interface to any filesystem (ext4, XFS, tmpfs, FUSE).",
              "Inode: metadata record for a file — permissions, size, timestamps, data block pointers.",
              "Directory: a file mapping names to inodes.",
              "Page Cache: kernel caches disk blocks in RAM — `read()` hits cache first.",
              "Dirty pages: written but not yet flushed to disk — `fsync()` forces a flush.",
              "Journaling: filesystem records intent before writing — protects against corruption on crash.",
            ],
            content: "// Content coming soon",
            tags: ["Linux", "File Systems"],
          },
          {
            id: "infra-tcp",
            title: "TCP/IP Stack Deep Dive",
            shortDesc: "Sockets, handshakes, flow control, congestion control — how TCP guarantees reliable delivery.",
            difficulty: "advanced",
            readTimeMin: 12,
            keyPoints: [
              "Socket: file descriptor representing a network endpoint — same `read/write/close` API.",
              "3-Way Handshake: SYN → SYN-ACK → ACK — establishes sequence numbers.",
              "4-Way Teardown: FIN → ACK → FIN → ACK — TIME_WAIT ensures packets in flight are gone.",
              "Sliding Window: controls how much unacknowledged data can be in flight.",
              "Congestion Control (CUBIC, BBR): grows send rate until packet loss or delay, then backs off.",
              "Nagle's algorithm: batches small writes — disable with TCP_NODELAY for low-latency apps.",
            ],
            content: "// Content coming soon",
            tags: ["Networking", "Linux", "TCP"],
          },
          {
            id: "infra-dns",
            title: "DNS: Resolution, Record Types & TTL",
            shortDesc: "How a domain name becomes an IP address — the full recursive resolution chain.",
            difficulty: "foundational",
            readTimeMin: 7,
            keyPoints: [
              "Resolution chain: stub resolver → recursive resolver → root nameserver → TLD → authoritative.",
              "Record types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), TXT (verification, SPF).",
              "TTL: how long resolvers cache a record — lower TTL = faster propagation, more queries.",
              "DNSSEC: signs records with asymmetric crypto — prevents DNS spoofing.",
              "DNS-over-HTTPS (DoH): encrypts DNS queries — prevents eavesdropping.",
            ],
            content: "// Content coming soon",
            tags: ["Networking", "DNS"],
          },
        ],
      },
      {
        id: "infra-networking",
        title: "Networking & Traffic Management",
        description: "Load balancers, proxies, routing protocols, and CDN edge infrastructure.",
        topics: [
          {
            id: "infra-lb",
            title: "Load Balancers: L4 vs L7",
            shortDesc: "Distributing traffic at the transport layer vs application layer — algorithms, health checks, and session affinity.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "L4 (TCP/UDP): routes packets without inspecting content — fast, low overhead.",
              "L7 (HTTP): inspects application data — enables path routing, header manipulation, SSL termination.",
              "Algorithms: Round Robin, Weighted Round Robin, Least Connections, IP Hash (sticky sessions).",
              "Health checks: LB removes unhealthy backends — active (probes) vs passive (error rate).",
              "Session affinity (sticky sessions): routes same client to same backend — complicates horizontal scaling.",
            ],
            content: "// Content coming soon",
            tags: ["Networking", "Infrastructure"],
          },
          {
            id: "infra-proxy",
            title: "Reverse Proxies & API Gateways",
            shortDesc: "Nginx, Envoy, and Kong — what a reverse proxy does and where gateways fit in the architecture.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "Reverse proxy: sits in front of servers — clients see only the proxy's IP.",
              "TLS termination: proxy handles SSL, speaks plain HTTP to backends.",
              "Buffering: proxy buffers slow client uploads so fast backends aren't waiting.",
              "API Gateway: reverse proxy with added features — auth, rate limiting, transformation, analytics.",
              "Service mesh vs gateway: mesh handles east-west (service-to-service); gateway handles north-south (client-to-service).",
            ],
            content: "// Content coming soon",
            tags: ["Networking", "Proxy"],
          },
          {
            id: "infra-cdn",
            title: "CDNs & Edge Computing",
            shortDesc: "Caching at the network edge, cache invalidation, and executing code at the edge with V8 isolates.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "CDN PoP (Point of Presence): geographically distributed cache servers.",
              "Cache keys: URL + Vary headers — control what counts as a unique cacheable request.",
              "Cache invalidation: purge by URL, tag, or surrogate key — eventual consistency across PoPs.",
              "Edge functions: JS/WASM executed in the CDN PoP — near-zero latency, limited compute.",
              "Origin shield: a single CDN node designated as origin-facing — reduces origin load.",
            ],
            content: "// Content coming soon",
            tags: ["Networking", "CDN", "Edge"],
          },
          {
            id: "infra-bgp",
            title: "BGP, Anycast & Internet Routing",
            shortDesc: "How large-scale internet routing works — BGP path selection, Anycast IP, and what happens during an outage.",
            difficulty: "advanced",
            readTimeMin: 9,
            keyPoints: [
              "AS (Autonomous System): independently administered network with an ASN.",
              "BGP: path-vector protocol — routers advertise reachable IP prefixes with a list of AS hops.",
              "Anycast: advertise the same IP from multiple locations — router sends to nearest.",
              "Route hijacking: malicious or accidental BGP announcements re-routing traffic.",
              "RPKI (Resource Public Key Infrastructure): cryptographic validation of BGP route origins.",
            ],
            content: "// Content coming soon",
            tags: ["Networking", "Advanced"],
          },
          {
            id: "infra-ebpf",
            title: "eBPF & Cilium: Programmable Kernel Networking",
            shortDesc: "How eBPF runs sandboxed programs in the Linux kernel — and how Cilium uses it for networking, observability, and security.",
            difficulty: "advanced",
            readTimeMin: 10,
            keyPoints: [
              "eBPF: a sandboxed bytecode VM inside the Linux kernel — programs attached to hooks (XDP, TC, kprobe, tracepoint).",
              "Verifier: ensures eBPF programs terminate and don't crash the kernel — loops must be bounded, memory access checked.",
              "Maps: key-value stores shared between kernel eBPF programs and userspace — used for config, stats, and state.",
              "Cilium: CNI plugin that uses eBPF for pod networking — replaces kube-proxy with eBPF-based service load balancing.",
              "Cilium Network Policies: L3-L7 policies with HTTP/gRPC/Kafka awareness — more expressive than standard K8s NetworkPolicies.",
              "Hubble: Cilium's observability layer — captures flow logs at the kernel level, no sidecars needed.",
              "Use cases beyond networking: security auditing (Falco), profiling (bpftrace), storage (BIO latency), Scheduler (EEVDF).",
            ],
            content: "// Content coming soon",
            tags: ["eBPF", "Networking", "Kernel", "Cilium"],
          },
          {
            id: "infra-service-mesh",
            title: "Service Mesh: Istio, Linkerd & mTLS at Scale",
            shortDesc: "Dedicated infrastructure layer for service-to-service communication — traffic management, observability, and zero-trust security.",
            difficulty: "advanced",
            readTimeMin: 9,
            keyPoints: [
              "Service mesh: a dedicated layer (sidecar proxies) that handles all service-to-service communication — app code doesn't change.",
              "Istio: Envoy-based, feature-rich — traffic splitting (canary), fault injection, circuit breakers, mTLS, and telemetry out of the box.",
              "Linkerd: lighter than Istio — uses a micro-proxy, simpler control plane, faster startup. Good for teams that want 'just enough' mesh.",
              "mTLS: automatic mutual TLS between every sidecar pair — encrypts all east-west traffic, no app-level cert management needed.",
              "Traffic policy: retries, timeouts, rate limiting, circuit breaking — configured declaratively via Kubernetes CRDs.",
              "Observability: mesh captures golden signals (latency, traffic, errors, saturation) per service pair — no code changes, no agents.",
              "Mesh vs API Gateway: mesh for east-west (service-to-service); gateway for north-south (external → service). Use both in production.",
            ],
            content: "// Content coming soon",
            tags: ["Service Mesh", "Istio", "Networking"],
          },
        ],
      },
      {
        id: "infra-virtualization",
        title: "Virtualization & Containers",
        description: "The kernel primitives that make containers possible, and how they differ from VMs.",
        topics: [
          {
            id: "infra-namespaces",
            title: "Linux Namespaces & Cgroups",
            shortDesc: "The kernel primitives that give containers their isolation — what they actually do at the system level.",
            difficulty: "advanced",
            readTimeMin: 10,
            keyPoints: [
              "Namespaces isolate: PID, Mount, Network, IPC, UTS (hostname), User, Time.",
              "PID namespace: container sees its own PID 1 — `kill -9 1` inside a container only kills the container process.",
              "Network namespace: each container gets its own network stack, interfaces, routing tables.",
              "Cgroups (v2): limit and account for CPU, memory, I/O, network bandwidth per group.",
              "OverlayFS: combines read-only image layers with a writable container layer — COW.",
            ],
            content: "// Content coming soon",
            codeExample: {
              language: "bash",
              filename: "namespace.sh",
              code: `# Create a shell with its own PID and mount namespace
sudo unshare --fork --pid --mount-proc bash
# Inside this shell:
ps aux  # shows only this shell and its children`,
            },
            tags: ["Linux", "Containers", "Kernel"],
          },
          {
            id: "infra-hypervisors",
            title: "Hypervisors: Type-1, Type-2 & MicroVMs",
            shortDesc: "Hardware virtualization vs OS-level containers — and Firecracker's microVM model for serverless.",
            difficulty: "advanced",
            readTimeMin: 8,
            keyPoints: [
              "Type-1 (bare-metal): runs directly on hardware (Xen, KVM) — production workloads.",
              "Type-2 (hosted): runs inside an OS (VirtualBox, VMware Fusion) — dev environments.",
              "KVM: Linux kernel module that turns Linux into a Type-1 hypervisor using CPU virtualization extensions.",
              "MicroVM (Firecracker): stripped-down KVM VM — boots in 125ms, ~5MB memory overhead.",
              "Firecracker + containers: each Lambda function / Fargate task gets its own microVM for isolation.",
            ],
            content: "// Content coming soon",
            tags: ["Virtualization", "Containers"],
          },
        ],
      },
      {
        id: "infra-cloud",
        title: "Cloud Architecture",
        description: "IAM, VPC design, multi-region availability, and disaster recovery on major cloud platforms.",
        topics: [
          {
            id: "infra-iam",
            title: "IAM: Roles, Policies & Least Privilege",
            shortDesc: "Identity and access management on AWS/GCP/Azure — the principle of least privilege in practice.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Principal: user, service account, or role that can request access.",
              "Policy: JSON document allowing or denying actions on resources.",
              "Least privilege: grant only the permissions needed for the task at hand.",
              "Role assumption: workloads assume roles at runtime — no static credentials needed.",
              "OIDC federation: CI/CD pipelines get short-lived tokens without storing any secrets.",
            ],
            content: "// Content coming soon",
            tags: ["Cloud", "Security"],
          },
          {
            id: "infra-vpc",
            title: "VPC Design & Network Topology",
            shortDesc: "Subnets, routing tables, NAT gateways, security groups, and private link endpoints.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "VPC: logically isolated virtual network — you control IP ranges, subnets, routing.",
              "Public subnet: has route to Internet Gateway — resources can have public IPs.",
              "Private subnet: no direct internet route — access internet via NAT Gateway (egress only).",
              "Security groups: stateful firewall rules attached to ENIs — allow only; deny by default.",
              "VPC Peering / Transit Gateway: connect VPCs — peering is 1:1, TGW is a hub.",
              "PrivateLink: access AWS services without traversing the internet.",
            ],
            content: "// Content coming soon",
            tags: ["Cloud", "Networking"],
          },
          {
            id: "infra-ha",
            title: "High Availability & Disaster Recovery",
            shortDesc: "Multi-AZ, multi-region, RTO/RPO targets, and the four DR patterns from cheapest to most resilient.",
            difficulty: "advanced",
            readTimeMin: 9,
            keyPoints: [
              "RTO (Recovery Time Objective): max acceptable downtime after a failure.",
              "RPO (Recovery Point Objective): max acceptable data loss (how old can the last backup be?).",
              "Multi-AZ: automatic failover within a region — protects against datacenter failure.",
              "Pilot Light: core services running in DR region at minimal scale — scale up on disaster.",
              "Warm Standby: fully functional but reduced capacity replica — faster RTO than Pilot Light.",
              "Multi-Site Active-Active: traffic splits across regions normally — no manual failover needed.",
            ],
            content: "// Content coming soon",
            tags: ["Cloud", "HA", "Reliability"],
          },
          {
            id: "infra-security-cloud",
            title: "Cloud Security: KMS, Secrets & Compliance",
            shortDesc: "Encrypting data at rest and in transit, managing secrets, and achieving compliance certifications.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "KMS (Key Management Service): managed key storage — envelope encryption for all data at rest.",
              "Envelope encryption: KMS encrypts the DEK; DEK encrypts your data — key rotation only re-wraps the DEK.",
              "Secrets Manager / Parameter Store: rotate, version, and audit access to credentials.",
              "CloudTrail / Audit Logs: every API call recorded — essential for compliance investigations.",
              "Compliance frameworks: SOC 2, ISO 27001, PCI-DSS, GDPR — what they require of your infrastructure.",
            ],
            content: "// Content coming soon",
            tags: ["Cloud", "Security"],
          },
          {
            id: "infra-finops",
            title: "FinOps: Cloud Cost Optimization",
            shortDesc: "Managing cloud spend at scale — reserved instances, spot instances, savings plans, and cost allocation.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "FinOps lifecycle: inform (visibility) → optimize (right-size, commit) → operate (continuous governance).",
              "Compute optimization: Reserved Instances / Savings Plans (1yr/3yr commit, up to 72% discount), Spot Instances (up to 90% discount).",
              "Storage tiering: S3 Standard → S3 IA → S3 Glacier — match storage class to access frequency.",
              "Data transfer costs: egress is the hidden cost — minimize cross-region/AZ traffic, use CloudFront for egress aggregation.",
              "Cost allocation: tag everything (env, team, service) — enables chargeback/showback to business units.",
              "Tooling: AWS Cost Explorer, Vantage, CloudHealth, Infracost — each has different granularity and automation capabilities.",
            ],
            content: "// Content coming soon",
            tags: ["Cloud", "FinOps", "Cost"],
          },
          {
            id: "infra-zero-trust",
            title: "Zero Trust Network Architecture",
            shortDesc: "Never trust, always verify — BeyondCorp principles, microsegmentation, and identity-aware proxies.",
            difficulty: "advanced",
            readTimeMin: 9,
            keyPoints: [
              "Zero Trust core principles: no implicit trust based on network location — every request must authenticate and be authorized.",
              "BeyondCorp (Google): access based on device posture + user identity, not VPN — all resources are external-facing.",
              "Microsegmentation: divide the network into smallest possible zones — each connection is separately authenticated.",
              "Identity-Aware Proxy (IAP): Cloudflare Access, Google IAP, Pomerium — proxy enforces auth before traffic reaches the app.",
              "mTLS: mutual TLS between services — each side presents a certificate, both sides verify. Service mesh does this at scale.",
              "ZTNA vs VPN: VPN gives full network access; ZTNA gives app-level access — dramatically reduces blast radius.",
            ],
            content: "// Content coming soon",
            tags: ["Security", "Networking", "Zero Trust"],
          },
          {
            id: "infra-serverless",
            title: "Serverless Architecture: Lambda, Fargate & Cloud Run",
            shortDesc: "Event-driven compute without server management — cold starts, cost models, and when NOT to go serverless.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "FaaS (Lambda / Cloud Functions): event-driven functions — billed per invocation and duration, auto-scales from zero to thousands.",
              "Container serverless (Fargate / Cloud Run): run any container without managing EC2 instances — billed per request or per vCPU-hour.",
              "Cold starts: Lambda cold start adds 200ms-1s latency — mitigated by provisioned concurrency, SnapStart (Java), or keeping functions warm.",
              "Serverless trade-offs: no control over the runtime environment, 15-minute Lambda timeout, 1-10GB memory limit, no local filesystem.",
              "Cost model: serverless wins for variable/spiky traffic; loses for steady high-throughput workloads (reserved instances are cheaper).",
              "Serverless patterns: event-driven (S3 → Lambda → DynamoDB), API + Lambda (API Gateway), stream processing (Kinesis → Lambda).",
              "When NOT to use: long-running processes, WebSocket-heavy apps, predictable high load, latency-sensitive real-time systems.",
            ],
            content: "// Content coming soon",
            tags: ["Serverless", "Lambda", "Cloud"],
          },
          {
            id: "infra-cloud-compare",
            title: "Cloud Provider Comparison: AWS vs GCP vs Azure",
            shortDesc: "Strengths, weaknesses, and decision framework for choosing between the three major cloud platforms.",
            difficulty: "intermediate",
            readTimeMin: 10,
            keyPoints: [
              "AWS: largest ecosystem (200+ services), deepest IaaS, strongest in serverless (Lambda, DynamoDB, Aurora) and enterprise adoption.",
              "GCP: best-in-class data/ML (BigQuery, Vertex AI, Spanner), superior networking (global VPC, Cloud CDN),最强的 Kubernetes (GKE Autopilot).",
              "Azure: best hybrid/enterprise integration (Active Directory, Power Platform, SQL Server), strongest .NET/Windows workload support.",
              "Kubernetes comparison: EKS (AWS-managed control plane, 3-AZ default), GKE (Autopilot, multi-cluster, Anthos), AKS (Azure AD integration, Windows containers).",
              "Serverless comparison: Lambda (mature, 200+ event sources, 15-min timeout) vs Cloud Functions (GCP, simpler) vs Azure Functions (portal-friendly, enterprise auth).",
              "Data services: DynamoDB (NoSQL, single-digit ms) vs Firestore/Datastore vs Cosmos DB (multi-model, global distribution).",
              "Decision framework: if you use Microsoft ecosystem → Azure; need best data/ML → GCP; need most services/partners → AWS. Multi-cloud is increasingly common.",
              "Multi-cloud strategy: avoid provider lock-in for critical layers (Kubernetes, Terraform, OpenTelemetry), but accept lock-in for differentiated services.",
            ],
            content: "// Content coming soon",
            tags: ["Cloud", "AWS", "GCP", "Azure"],
          },
          {
            id: "infra-cloud-managed",
            title: "Managed Cloud Services: Databases, Queues & Event Bus",
            shortDesc: "Fully managed data and messaging services across AWS, GCP, and Azure — when to use which and how to compare.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Relational databases: RDS / Aurora (AWS, MySQL/PostgreSQL-compatible, 5x throughput) vs Cloud SQL (GCP, managed MySQL/PG/SQL Server) vs Azure SQL (fully managed SQL Server).",
              "NoSQL: DynamoDB (AWS, key-value + document, single-digit ms at any scale) vs Firestore (GCP, real-time sync, great for mobile) vs Cosmos DB (Azure, multi-model, global distribution with SLAs).",
              "Data warehousing: Redshift (AWS, columnar, petabyte-scale) vs BigQuery (GCP, serverless, no cluster management, SQL:2011) vs Azure Synapse (enterprise, integrated with Power BI).",
              "Message queues: SQS (AWS, pull-based, at-least-once) vs Pub/Sub (GCP, push/pull, exactly-once delivery) vs Azure Service Bus (enterprise, sessions, dead-letter, FIFO).",
              "Event streaming: Kinesis (AWS, real-time, 1MB/s per shard) vs Pub/Sub (GCP, global, 1GB/s project) vs Event Hubs (Azure, Kafka-compatible, 1MB/s per TU).",
              "Choosing a messaging strategy: SQS + SNS for simple decoupling, Kafka/Kinesis for event sourcing, Pub/Sub for global event routing, EventBridge for SaaS integration.",
            ],
            content: "// Content coming soon",
            tags: ["Cloud", "Databases", "Messaging"],
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // DEVOPS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "devops",
    title: "DevOps",
    tagline: "Ship reliably and recover fast",
    description: "Continuous delivery, infrastructure as code, container orchestration, observability, and site reliability engineering.",
    color: "orange",
    iconName: "Cpu",
    topics: [],
    modules: [
      {
        id: "do-containers",
        title: "Containers & Container Runtimes",
        description: "Docker internals, image best practices, and the OCI standard.",
        topics: [
          {
            id: "do-docker",
            title: "Docker Architecture: Daemon, containerd & runc",
            shortDesc: "The layered architecture of Docker — how a `docker run` command actually starts a container.",
            difficulty: "foundational",
            readTimeMin: 7,
            keyPoints: [
              "Docker CLI → Docker daemon → containerd → runc: the call chain for running a container.",
              "containerd: OCI-compliant container runtime — manages image pull, storage, and lifecycle.",
              "runc: the lowest-level OCI runtime — calls Linux kernel APIs to create the isolated process.",
              "Image layers: each Dockerfile instruction creates a layer — layers are content-addressed and cached.",
              "BuildKit: modern builder for Docker — parallel layer resolution, cache mounts, secret handling.",
            ],
            content: "// Content coming soon",
            codeExample: {
              language: "dockerfile",
              filename: "Dockerfile",
              code: `# Multi-stage build: builder stage has all dev deps, final has only runtime
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                    # install deps (cached layer)
COPY . .
RUN npm run build

FROM node:20-alpine AS final
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"] # distroless or Alpine for minimal surface area`,
            },
            tags: ["Docker", "Containers"],
          },
          {
            id: "do-image-hardening",
            title: "Image Security & Minimization",
            shortDesc: "Reducing attack surface — distroless images, non-root users, secret handling, and vulnerability scanning.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "Minimal base images: Alpine (~5MB), distroless (~2MB) — fewer packages = fewer vulnerabilities.",
              "Non-root user: `USER 1000` in Dockerfile — privilege escalation is harder.",
              "Never bake secrets into images: use build args vs runtime env vars — check your layer history.",
              "Multi-stage builds: dev toolchain never ships to production.",
              "Vulnerability scanning: Trivy, Grype, Snyk — scan in CI before pushing.",
            ],
            content: "// Content coming soon",
            tags: ["Docker", "Security"],
          },
        ],
      },
      {
        id: "do-kubernetes",
        title: "Kubernetes",
        description: "Control plane internals, workload types, networking, scaling, and Helm packaging.",
        topics: [
          {
            id: "do-k8s-internals",
            title: "Kubernetes Architecture: Control Plane & Workers",
            shortDesc: "Every component of a K8s cluster and what it does — etcd, API server, scheduler, controller manager.",
            difficulty: "intermediate",
            readTimeMin: 10,
            keyPoints: [
              "etcd: consistent KV store holding all cluster state — everything else is derived from it.",
              "API Server: the only component that reads/writes etcd — serves the REST API.",
              "Scheduler: watches for unscheduled Pods, picks the best node based on resources + constraints.",
              "Controller Manager: runs reconciliation loops — ensures actual state matches desired state.",
              "kubelet: agent on each node — pulls Pod specs, manages containers via CRI.",
              "kube-proxy: programs iptables/IPVS for Service IP → Pod IP routing.",
            ],
            content: "// Content coming soon",
            tags: ["Kubernetes", "Architecture"],
          },
          {
            id: "do-k8s-workloads",
            title: "Workload Resources: Pods, Deployments & StatefulSets",
            shortDesc: "When to use Deployment vs StatefulSet vs DaemonSet — and how the controllers manage them.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Pod: smallest deployable unit — one or more containers sharing network namespace.",
              "Deployment: manages a ReplicaSet for stateless workloads — rolling updates, rollbacks.",
              "StatefulSet: stable network identity + ordered scaling — for databases, distributed systems.",
              "DaemonSet: one Pod per node — for node-level agents (logging, monitoring, networking).",
              "Job / CronJob: run-to-completion workloads — batch processing, scheduled tasks.",
            ],
            content: "// Content coming soon",
            codeExample: {
              language: "yaml",
              filename: "deployment.yaml",
              code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    spec:
      containers:
      - name: api
        image: myapp:v1.2.3          # always use explicit tags
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            memory: 256Mi            # no CPU limit — avoid throttling
        readinessProbe:
          httpGet: { path: /health, port: 3000 }`,
            },
            tags: ["Kubernetes", "Workloads"],
          },
          {
            id: "do-k8s-networking",
            title: "Kubernetes Networking: CNI, Services & Ingress",
            shortDesc: "How pods get IPs, how Services route traffic, and how Ingress exposes services externally.",
            difficulty: "advanced",
            readTimeMin: 10,
            keyPoints: [
              "CNI: plugin interface — Calico, Cilium, Flannel each implement pod networking differently.",
              "Every pod gets a unique cluster IP — pods can reach each other directly.",
              "Service (ClusterIP): stable virtual IP for a set of pods — kube-proxy programs iptables rules.",
              "Service (NodePort / LoadBalancer): expose services outside the cluster.",
              "Ingress: HTTP/HTTPS routing rules — hostname and path-based routing to Services.",
              "Ingress Controller: the implementation (nginx, Traefik, AWS ALB) that watches Ingress objects.",
            ],
            content: "// Content coming soon",
            tags: ["Kubernetes", "Networking"],
          },
          {
            id: "do-k8s-scheduling",
            title: "Scheduling, Resource Requests & Autoscaling",
            shortDesc: "How the scheduler places pods, why resource requests matter, and how HPA and Karpenter scale the cluster.",
            difficulty: "advanced",
            readTimeMin: 9,
            keyPoints: [
              "Resource Requests: what the pod is guaranteed — scheduler uses this for placement.",
              "Resource Limits: the hard ceiling — CPU throttled at limit; memory OOM-killed at limit.",
              "Quality of Service classes: Guaranteed, Burstable, BestEffort — determines eviction priority.",
              "HPA (Horizontal Pod Autoscaler): scale pod count based on CPU/memory or custom metrics.",
              "VPA (Vertical Pod Autoscaler): right-size resource requests — useful for recommendation mode.",
              "Cluster Autoscaler / Karpenter: provision new nodes when pods can't be scheduled.",
            ],
            content: "// Content coming soon",
            tags: ["Kubernetes", "Scaling"],
          },
          {
            id: "do-k8s-storage",
            title: "Storage in Kubernetes: PVs, PVCs & Storage Classes",
            shortDesc: "Persistent storage for stateful workloads — provisioning, binding, and storage class tiering.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "PersistentVolume (PV): a piece of storage provisioned by an admin or dynamically.",
              "PersistentVolumeClaim (PVC): a request for storage by a Pod — binds to a matching PV.",
              "StorageClass: defines provisioner and parameters — enables dynamic provisioning.",
              "Access modes: ReadWriteOnce, ReadOnlyMany, ReadWriteMany — not all drivers support all modes.",
              "CSI (Container Storage Interface): standard interface for storage plugins.",
            ],
            content: "// Content coming soon",
            tags: ["Kubernetes", "Storage"],
          },
          {
            id: "do-helm",
            title: "Helm: Packaging, Templating & Releases",
            shortDesc: "Managing complex Kubernetes manifests with Helm charts — templating, values overrides, and upgrade strategies.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "Chart: a package of Kubernetes templates + default values.",
              "Release: an instance of a chart installed in the cluster — `helm install`, `helm upgrade`.",
              "Values: override any default in `values.yaml` at install/upgrade time.",
              "Hooks: run jobs at lifecycle points (pre-install, post-upgrade) — database migrations.",
              "Helm vs Kustomize: Helm is a template engine; Kustomize is a patch overlay system.",
            ],
            content: "// Content coming soon",
            tags: ["Kubernetes", "Tooling"],
          },
          {
            id: "do-crd-operator",
            title: "CRDs & Operator Pattern: Extending Kubernetes",
            shortDesc: "Custom Resource Definitions + custom controllers — the Kubernetes way to manage complex stateful applications.",
            difficulty: "advanced",
            readTimeMin: 10,
            keyPoints: [
              "CRD: define a new resource type (e.g., Database, Certificate, Backup) via a Kubernetes manifest — stored in etcd like native resources.",
              "Controller: a reconciliation loop that watches CRD instances and drives actual state toward desired state — the heart of the operator pattern.",
              "Operator = CRD + Controller + Domain Knowledge: encoding operational expertise (backup, scaling, upgrade) into software that runs on K8s.",
              "Popular operators: cert-manager (TLS certificates), External Secrets (syncs secrets from cloud providers), Prometheus Operator, Strimzi (Kafka).",
              "Operator SDK: Kopf (Python), kubebuilder (Go), Java Operator SDK — frameworks for writing operators in any language.",
              "Operator Lifecycle Manager (OLM): manages operator installation, upgrades, and permissions in the cluster.",
              "When to write an operator: managing stateful infrastructure (DBs, message queues, caches) that requires domain-specific lifecycle logic.",
            ],
            content: "// Content coming soon",
            tags: ["Kubernetes", "Operator", "CRD"],
          },
        ],
      },
      {
        id: "do-iac",
        title: "Infrastructure as Code",
        description: "Declaring, versioning, and automating infrastructure with Terraform and GitOps workflows.",
        topics: [
          {
            id: "do-terraform",
            title: "Terraform: State, Providers & Modules",
            shortDesc: "Declarative infrastructure management — how Terraform plans, applies, and reconciles state.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "State file: Terraform's record of what it thinks exists — maps resources to real infrastructure.",
              "Remote state: store in S3/GCS with state locking via DynamoDB/GCS — prevents concurrent writes.",
              "Plan: diff between state and desired config — always review before apply.",
              "Provider: plugin for a cloud/service API — generates resources from HCL declarations.",
              "Module: reusable config unit — input variables + output values.",
              "Import: bring existing resources under Terraform management.",
            ],
            content: "// Content coming soon",
            codeExample: {
              language: "hcl",
              filename: "main.tf",
              code: `terraform {
  backend "s3" {
    bucket         = "my-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "tf-state-lock"   # distributed lock
  }
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  name    = "prod-vpc"
  cidr    = "10.0.0.0/16"
}`,
            },
            tags: ["IaC", "Terraform"],
          },
          {
            id: "do-gitops",
            title: "GitOps: ArgoCD & Flux",
            shortDesc: "Using Git as the single source of truth — pull-based deployment, drift detection, and reconciliation.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "GitOps principle: desired state in Git → controller reconciles cluster to match.",
              "Pull-based: cluster agent pulls from Git — no inbound firewall holes needed.",
              "ArgoCD: GUI + CLI, ApplicationSet for templating multiple apps.",
              "Flux: lighter, CRD-driven — integrates with Helm and Kustomize natively.",
              "Drift detection: controller alerts (or auto-heals) when cluster diverges from Git.",
            ],
            content: "// Content coming soon",
            tags: ["IaC", "GitOps"],
          },
          {
            id: "do-pulumi-cdk",
            title: "Pulumi & CDK: Infrastructure as General-Purpose Code",
            shortDesc: "Writing infrastructure in TypeScript, Python, Go, or C# — how Pulumi and AWS CDK differ from HCL-based Terraform.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Pulumi: IaC with real programming languages — loops, conditionals, functions, and classes are native. State is managed by Pulumi Cloud.",
              "Pulumi vs Terraform: Pulumi uses familiar languages (no HCL to learn), supports real IDEs (autocomplete, type checking, refactoring).",
              "Pulumi Automation API: embed infrastructure provisioning inside application code — enables dynamic, per-environment infrastructure.",
              "AWS CDK: define AWS infrastructure in TypeScript/Python/Java/C# — compiles to CloudFormation templates under the hood.",
              "CDK Constructs: reusable infrastructure components (L1 = raw CFN resources, L2 = AWS best-practice defaults, L3 = multi-resource patterns).",
              "CDK vs Pulumi: CDK is AWS-only; Pulumi is multi-cloud. CDK outputs CloudFormation; Pulumi manages state itself. Both support TypeScript.",
              "Choosing IaC: Terraform for multi-cloud + large ecosystem; Pulumi/CDK for teams that want to use their existing programming language.",
            ],
            content: "// Content coming soon",
            tags: ["IaC", "Pulumi", "CDK"],
          },
          {
            id: "do-ansible",
            title: "Ansible: Configuration Management & Automation",
            shortDesc: "Agentless automation for server provisioning, application deployment, and configuration drift remediation — the ad-hoc simplicity of SSH-driven orchestration.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Agentless: Ansible connects via SSH (or WinRM) — no daemon, no agent, no PKI infrastructure. Push-based model: control node pushes config to managed nodes.",
              "Playbooks: YAML-based idempotent automation — tasks run in order with `state: present/absent`. Use `--check` for dry-run validation.",
              "Inventory: static (INI/YAML host lists) or dynamic (AWS EC2, GCP, Kubernetes API queries). Group variables and host variables for environment-specific overrides.",
              "Roles: reusable, self-contained units — tasks, handlers, templates, variables, and defaults organized by convention. The building block of Ansible Galaxy.",
              "Ansible vs Terraform: Terraform declares infrastructure (VPC, DB, load balancer); Ansible configures what runs on it (install packages, write config files, start services). They complement each other.",
              "Idempotency: Ansible modules check current state before acting — `apt: name=nginx state=present` only installs if nginx is missing. Running a playbook twice is safe.",
              "Ansible Vault: encrypt sensitive variables (passwords, API keys, SSH keys) within playbooks — `ansible-vault encrypt vars/secrets.yml`.",
              "Alternatives: SaltStack (fast, event-driven, agent optional), Puppet (DSL-based, agent pull model), Chef (Ruby DSL, full-blown CMS). Ansible is the simplest to start with.",
            ],
            content: "// Content coming soon",
            tags: ["Ansible", "Configuration Management", "Automation", "IaC"],
          },
        ],
      },
      {
        id: "do-cicd",
        title: "CI/CD Pipelines",
        description: "Automated testing, secure build systems, and zero-downtime deployment strategies.",
        topics: [
          {
            id: "do-github-actions",
            title: "GitHub Actions: Workflows, Secrets & OIDC",
            shortDesc: "Building production CI/CD pipelines — keyless cloud auth with OIDC, caching, and matrix builds.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Workflow: YAML file in `.github/workflows/` — triggered by push, PR, schedule, or manual dispatch.",
              "Job matrix: run the same job with multiple parameter combinations (OS × Node version).",
              "Caching: cache node_modules or build outputs between runs — saves minutes per run.",
              "OIDC: GitHub issues a short-lived token for the run — cloud provider trusts it without stored secrets.",
              "Reusable workflows: call one workflow from another — DRY principle for CI.",
            ],
            content: "// Content coming soon",
            codeExample: {
              language: "yaml",
              filename: ".github/workflows/deploy.yml",
              code: `name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    permissions:
      id-token: write    # required for OIDC
      contents: read
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: arn:aws:iam::123:role/deploy
        aws-region: us-east-1
    # No stored secrets — the OIDC token authenticates the role assumption`,
            },
            tags: ["CI-CD", "GitHub Actions"],
          },
          {
            id: "do-deployment-strategies",
            title: "Deployment Strategies: Blue-Green, Canary & Feature Flags",
            shortDesc: "Shipping safely to production — the mechanics of each strategy and when to use them.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Rolling update: gradually replaces old pods with new — default Kubernetes strategy.",
              "Blue-Green: two identical environments; switch router from blue to green instantly — easy rollback.",
              "Canary: route a small % of traffic to new version — observe errors before full rollout.",
              "Feature flags: decouple deploy from release — ship dark, enable for specific users.",
              "Database compatibility: migrations must be backward-compatible with old code during rollout.",
            ],
            content: "// Content coming soon",
            tags: ["CI-CD", "Deployment"],
          },
          {
            id: "do-testing-pyramid",
            title: "The Testing Pyramid: Unit, Integration & E2E",
            shortDesc: "Why the ratio of tests matters, what to test at each layer, and the role of contract tests in microservices.",
            difficulty: "foundational",
            readTimeMin: 7,
            keyPoints: [
              "Unit tests: fast, isolated — test pure functions and business logic.",
              "Integration tests: test boundaries (DB, cache, API clients) with real or containerized dependencies.",
              "E2E tests: full user flows in a real browser — slow, flaky, valuable for critical paths only.",
              "Contract tests (Pact): consumer and provider agree on the API contract — catches breaking changes.",
              "Test coverage: a proxy metric — 80% with meaningful assertions beats 100% with trivial tests.",
            ],
            content: "// Content coming soon",
            tags: ["Testing", "CI-CD"],
          },
        ],
      },
      {
        id: "do-observability",
        title: "Observability & Reliability",
        description: "The three pillars of observability, SRE practices, and incident response.",
        topics: [
          {
            id: "do-metrics",
            title: "Metrics: Prometheus, PromQL & Grafana",
            shortDesc: "Time-series metrics collection, labeling, alerting rules, and dashboard design.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Metric types: Counter (cumulative), Gauge (current value), Histogram (distributions), Summary.",
              "Pull model: Prometheus scrapes `/metrics` endpoints on a configurable interval.",
              "Labels: high-cardinality dimensions — keep label values bounded (no user IDs as labels).",
              "PromQL: functional query language — `rate()`, `histogram_quantile()`, `topk()`.",
              "AlertManager: routes alerts to PagerDuty, Slack, etc. — handles deduplication and silencing.",
            ],
            content: "// Content coming soon",
            tags: ["Observability", "Prometheus"],
          },
          {
            id: "do-logging",
            title: "Structured Logging: Design & Aggregation",
            shortDesc: "Why structured (JSON) logs beat printf strings — and how to aggregate with Loki or Elasticsearch.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "Structured logging: emit JSON — every field is indexable, no regex parsing required.",
              "Correlation ID: propagate a unique request ID through all log entries for a single request.",
              "Log levels: DEBUG → INFO → WARN → ERROR — only ERROR and above in production by default.",
              "Loki: index only labels (app, level, pod) — store raw log lines in object storage.",
              "Elasticsearch: full-text indexed — powerful queries, higher storage and compute cost.",
            ],
            content: "// Content coming soon",
            tags: ["Observability", "Logging"],
          },
          {
            id: "do-tracing",
            title: "Distributed Tracing & OpenTelemetry",
            shortDesc: "Following a request across microservices — spans, trace context propagation, and the OTel SDK.",
            difficulty: "advanced",
            readTimeMin: 9,
            keyPoints: [
              "Trace: a directed acyclic graph of spans representing a single request's journey.",
              "Span: a named, timed operation with attributes — start/end timestamp, status, events.",
              "Context propagation: trace ID + span ID injected into HTTP headers (W3C TraceContext) or message metadata.",
              "OpenTelemetry: vendor-neutral SDK for generating traces, metrics, and logs.",
              "Sampling: trace 1-10% of requests in production — head-based vs tail-based sampling.",
            ],
            content: "// Content coming soon",
            tags: ["Observability", "Tracing"],
          },
          {
            id: "do-sre",
            title: "SRE: SLIs, SLOs, Error Budgets & On-Call",
            shortDesc: "How Google's Site Reliability Engineering approach turns reliability into a software engineering problem.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "SLI (Service Level Indicator): a quantitative measure of service behavior — latency p99, error rate.",
              "SLO (Service Level Objective): target for the SLI — '99.9% of requests < 200ms'.",
              "Error Budget: the allowed unreliability — 99.9% SLO = 43.8 min/month error budget.",
              "Error budget policy: if budget exhausted, freeze new features — prioritize reliability.",
              "Postmortem: blameless review of an incident — 5 Whys, contributing factors, action items.",
              "Toil: manual, repetitive operational work — SRE principle is to automate it away.",
            ],
            content: "// Content coming soon",
            tags: ["SRE", "Reliability"],
          },
          {
            id: "do-chaos",
            title: "Chaos Engineering & Resilience Testing",
            shortDesc: "Proactively finding weaknesses — failure injection, game days, and steady-state hypothesis testing.",
            difficulty: "advanced",
            readTimeMin: 7,
            keyPoints: [
              "Chaos Engineering: deliberately inject failures to find systemic weaknesses.",
              "Steady-state hypothesis: define what 'normal' looks like before running experiments.",
              "Blast radius: start small (one pod, one AZ) and expand — limit damage of unexpected failures.",
              "Tools: Chaos Monkey, LitmusChaos, AWS Fault Injection Simulator.",
              "Game days: scheduled events where teams practice incident response with simulated failures.",
            ],
            content: "// Content coming soon",
            tags: ["SRE", "Reliability", "Testing"],
          },
          {
            id: "do-incident-mgmt",
            title: "Incident Management & On-Call Practices",
            shortDesc: "Building an incident response process that actually works — severity levels, escalation, blameless postmortems, and on-call rotations.",
            difficulty: "intermediate",
            readTimeMin: 8,
            keyPoints: [
              "Severity levels: SEV1 (service down) → SEV4 (cosmetic) — each level has a defined response time and escalation path.",
              "Incident commander: one person owns the incident timeline, delegates tasks, and communicates status — not necessarily the most senior engineer.",
              "Postmortem culture: blameless, written within 48 hours — focus on systemic causes, not individual mistakes. Action items with owners and deadlines.",
              "On-call rotations: optimal team size is 4-6 per rotation — 1 week primary, 1 week secondary. Avoid hero culture.",
              "PagerDuty / OpsGenie: alert routing, escalation policies, silence windows, and schedules — integrate with monitoring tools.",
              "Key metric: MTTD (Mean Time to Detect) and MTTR (Mean Time to Resolve) — track trends, not absolute values.",
            ],
            content: "// Content coming soon",
            tags: ["SRE", "Incident Management", "On-Call"],
          },
        ],
      },
      {
        id: "do-supply-chain",
        title: "Supply Chain Security",
        description: "Protecting your software supply chain — from dependency integrity to build attestation and vulnerability management.",
        topics: [
          {
            id: "do-sbom-sigstore",
            title: "SBOM, Sigstore & SLSA: Trust from Build to Deploy",
            shortDesc: "Cryptographic attestation of where software comes from — Bill of Materials, keyless signing, and build integrity levels.",
            difficulty: "advanced",
            readTimeMin: 10,
            keyPoints: [
              "SBOM (Software Bill of Materials): a machine-readable inventory of all dependencies — SPDX or CycloneDX format.",
              "Sigstore: keyless code signing with OIDC identity — no more managing GPG keys; Fulcio (CA) + Rekor (transparency log) + Cosign (CLI).",
              "SLSA (Supply chain Levels for Software Artifacts): maturity model from SLSA 1 (documented build) to SLSA 4 (hermetic + reproducible).",
              "Dependency confusion: attackers publish packages with the same name as internal packages — scope your packages, verify sources.",
              "Vulnerability scanning in CI: Trivy, Grype, Dependabot, Renovate — scan both OS packages and application dependencies.",
              "Renovate: auto-create PRs for dependency updates with changelogs — configure grouping, scheduling, and automerge for patch versions.",
            ],
            content: "// Content coming soon",
            tags: ["Security", "Supply Chain", "SBOM"],
          },
          {
            id: "do-software-composition",
            title: "Dependency Management & Renovate",
            shortDesc: "Keeping dependencies up to date without breaking the build — automated PRs, grouping strategies, and security patching.",
            difficulty: "intermediate",
            readTimeMin: 7,
            keyPoints: [
              "Automated updates: Renovate creates PRs for outdated dependencies — configure minimum release age to avoid rushing broken updates.",
              "Grouping: group related packages (all React, all AWS SDK) into a single PR — reduces CI load and review overhead.",
              "Presets: use shared Renovate presets across the org — enforce consistent rules for major/minor/patch updates.",
              "Security updates: Renovate can auto-merge patch security updates after CI passes — critical for reducing exposure window.",
              "Monorepo support: Renovate natively understands pnpm/npm/yarn workspaces — updates shared packages correctly.",
            ],
            content: "// Content coming soon",
            tags: ["Dependencies", "Security", "Tooling"],
          },
        ],
      },
      {
        id: "do-platform-engineering",
        title: "Platform Engineering & IDP",
        description: "Building Internal Developer Platforms that reduce cognitive load and accelerate delivery — Backstage, scorecards, and golden paths.",
        topics: [
          {
            id: "do-backstage",
            title: "Backstage: Developer Portal & Service Catalog",
            shortDesc: "Spotify's open-source platform — unifying all your services, documentation, CI/CD, and infrastructure in one UI.",
            difficulty: "intermediate",
            readTimeMin: 9,
            keyPoints: [
              "Backstage core: Software Catalog, Software Templates, TechDocs, and Plugins — extensible via React plugin architecture.",
              "Software Catalog: register all services, libraries, and infrastructure components with metadata (owning team, language, SLA).",
              "Software Templates: scaffold new projects with predefined CI/CD, linting, and deployment config — golden paths enforced from day one.",
              "TechDocs: documentation-as-code — Markdown files in the repo, rendered in Backstage with search and versioning.",
              "Scorecards: define and measure standards (test coverage, SLO attainment, dependency freshness) — gamify operational excellence.",
              "Adoption path: start with the Catalog, add Templates for new services, then gradually adopt plugins and custom integrations.",
            ],
            content: "// Content coming soon",
            tags: ["Platform", "Developer Experience", "Tooling"],
          },
          {
            id: "do-idp-design",
            title: "IDP Design: Golden Paths & Cognitive Load",
            shortDesc: "Designing an Internal Developer Platform that engineers actually want to use — reducing friction without removing flexibility.",
            difficulty: "advanced",
            readTimeMin: 8,
            keyPoints: [
              "Cognitive load: the #1 goal of an IDP is to reduce the mental overhead of infrastructure decisions — let devs focus on business logic.",
              "Golden paths: paved, opinionated workflows for common tasks (new service, add database, deploy) — deviate only with explicit justification.",
              "Separation of concerns: platform team owns the paved paths; app teams own their business logic — clear boundaries prevent platform gatekeeping.",
              "Self-service: developers provision their own resources (Env, DB, Queue) through a UI or API — no ticket to the platform team.",
              "Measuring success: lead time for a new service (from commit → production), developer satisfaction survey (SPACE framework).",
              "Common pitfalls: building a portal before having APIs to back it; over-customizing before proving value with the catalog.",
            ],
            content: "// Content coming soon",
            tags: ["Platform", "Developer Experience", "Architecture"],
          },
        ],
      },
    ],
  },
];

// Total topic count across all domains
export function getTopicCount(): number {
  return curriculumData.reduce((domainAcc, domain) => {
    return domainAcc + domain.modules.reduce((modAcc, mod) => modAcc + mod.topics.length, 0);
  }, 0);
}

// Find a topic by id across all domains
export function findTopicById(id: string): { topic: Topic; module: Module; domain: Domain } | undefined {
  for (const domain of curriculumData) {
    for (const module of domain.modules) {
      const topic = module.topics.find(t => t.id === id);
      if (topic) return { topic, module, domain };
    }
  }
  return undefined;
}
