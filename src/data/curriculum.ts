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
            content: `## Why This Matters (Read This First)

Imagine you run a restaurant with one chef. A hundred orders come in. The chef does not cook everything at once — that would burn the food. Instead, he starts a dish, and while the pasta boils (I/O), he chops vegetables for another order. No time is spent waiting.

Node.js is that chef. It uses a **single thread** to handle thousands of concurrent connections. It does not need one thread per connection like traditional servers. The secret is the **Event Loop**, powered by the C library **libuv**.

By the end of this article, you will understand exactly what happens when you call \`fs.readFile\`, \`setTimeout\`, or \`crypto.pbkdf2\` — and why Node can handle 10,000 concurrent connections on a single CPU.

---

## Node.js Is Single-Threaded — What Does That Actually Mean?

In most web servers (Apache, Django with Gunicorn sync workers), each connection gets its own OS thread or process. With 1,000 concurrent connections, that is 1,000 threads. Each thread consumes ~2MB of memory for its stack, totaling 2GB just for thread overhead.

Node.js uses **one main thread** for JavaScript execution. There is exactly one Call Stack. If you never block it, one thread can handle thousands of connections.

\`\`\`javascript
const http = require("http");

// One thread handles ALL these requests concurrently
const server = http.createServer((req, res) => {
  // This callback runs when a request arrives
  // It does NOT block the thread — it sets up async work and returns
  res.writeHead(200);
  res.end("Hello");
});

server.listen(3000);
\`\`\`

The callback runs, does its work, and returns immediately. The thread is free to handle the next request.

**Key insight:** Node.js is single-threaded for JavaScript execution, but it uses a **thread pool** (4 threads by default) for operations that cannot be done asynchronously at the OS level (file I/O, DNS, crypto).

---

## Libuv — The Engine Behind the Event Loop

Libuv is a C library originally written for Node.js (now used by Luvit, Julia, and others). It provides:

1. **The Event Loop** — orchestrates callback execution
2. **The Thread Pool** — for blocking operations
3. **Async I/O via epoll/kqueue/IOCP** — OS-level async file and network I/O

\`\`\`
┌─────────────────────────────────────────────────┐
│                  Node.js Process                  │
│                                                    │
│   ┌─────────────────────────────────────┐         │
│   │        V8 (JavaScript Engine)       │         │
│   │   Runs your JS code on main thread  │         │
│   └────────────┬────────────────────────┘         │
│                │                                   │
│                ▼                                   │
│   ┌─────────────────────────────────────┐         │
│   │        Libuv (Event Loop)           │         │
│   │   ┌────────┬────────┬──────────┐    │         │
│   │   │ Timers │  I/O   │ Threads  │    │         │
│   │   │ Queue  │ Queue  │ Pool (4) │    │         │
│   │   └────────┴────────┴──────────┘    │         │
│   └─────────────────────────────────────┘         │
└─────────────────────────────────────────────────┘
\`\`\`

---

## The Event Loop Phases in Detail

The event loop runs in **phases**, each with its own queue of callbacks. The loop processes one phase, then moves to the next.

\`\`\`
   ┌───────────────────────────┐
┌─>│          timers           │ ← setTimeout, setInterval callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ ← I/O callbacks deferred to next iteration
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │ ← internal libuv use
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │          poll            │ ← new I/O events, executes I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │          check           │ ← setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     close callbacks       │ ← socket close events
│  └───────────────────────────┘
└────────────────────────────────── loop back to timers
\`\`\`

### Phase 1: Timers

Callbacks from \`setTimeout\` and \`setInterval\` are executed here. The timer's **threshold** is the minimum delay — the callback may run later if other phases take longer.

\`\`\`javascript
const start = Date.now();
setTimeout(() => {
  console.log("Ran after", Date.now() - start, "ms");
}, 100);

// If the poll phase takes 50ms, the timer runs at ~150ms — not exactly 100ms
\`\`\`

### Phase 2: Pending Callbacks

Certain I/O callbacks that were deferred (like OS-level errors) are executed here.

### Phase 3: Idle/Prepare

Internal bookkeeping — the loop prepares for the poll phase.

### Phase 4: Poll (The Most Important Phase)

This phase does two things:
1. **Watts** for new I/O events (network data, file reads) if no timers are pending
2. **Executes** callbacks for I/O events that have completed

If the poll queue is empty and there are timers scheduled, the loop calculates how long to wait before the next timer fires and blocks for I/O up to that time.

\`\`\`javascript
const fs = require("fs");

// This callback is executed in the POLL phase
fs.readFile(__filename, () => {
  console.log("File read complete");
});

setTimeout(() => console.log("Timer"), 0);
// If file read completes quickly, both run in the same iteration
\`\`\`

### Phase 5: Check

\`setImmediate\` callbacks are executed here. Despite the name, \`setImmediate\` runs after I/O callbacks (poll phase), not immediately.

\`\`\`javascript
setTimeout(() => console.log("timer"), 0);
setImmediate(() => console.log("immediate"));

// In the main module, the order is non-deterministic — depends on how long the loop setup takes
// Inside an I/O callback, setImmediate ALWAYS runs before setTimeout:
fs.readFile(__filename, () => {
  setImmediate(() => console.log("immediate inside I/O")); // runs first
  setTimeout(() => console.log("timer inside I/O"), 0);    // runs second
});
\`\`\`

### Phase 6: Close Callbacks

Cleanup handlers for closed sockets or handles (e.g., \`socket.on("close")\`).

---

## The Thread Pool

Not everything in Node.js is asynchronous at the OS level. File I/O, DNS lookups, and cryptographic operations are handled by a **thread pool** (default 4 threads, configurable via \`UV_THREADPOOL_SIZE\`).

\`\`\`javascript
const crypto = require("crypto");

// crypto.pbkdf2 uses the thread pool
const start = Date.now();
for (let i = 0; i < 4; i++) {
  crypto.pbkdf2("password", "salt", 100000, 512, "sha512", () => {
    console.log("Done in", Date.now() - start, "ms");
  });
}
// With 4 thread pool threads, all 4 complete at roughly the same time
// With 5 calls, the 5th waits for a thread to free up
\`\`\`

**What uses the thread pool?**

| Operation | Thread Pool? | Why |
|-----------|-------------|-----|
| \`fs.readFile\`, \`fs.writeFile\` | Yes | Disk I/O is not async at the OS level on Linux (only network I/O is) |
| \`crypto.pbkdf2\`, \`crypto.scrypt\` | Yes | CPU-intensive, would block the event loop |
| \`crypto.randomBytes\` | Yes | Entropy gathering can block |
| \`dns.lookup\` | Yes | Uses \`getaddrinfo\` which is blocking |
| HTTP requests | No | Network sockets use epoll/kqueue — true async I/O |
| TCP/UDP sockets | No | True async I/O via OS multiplexing |

---

## process.nextTick — The Highest Priority

\`process.nextTick\` is NOT part of the libuv event loop. It has its own queue that is processed **between each phase**, immediately after the current operation completes.

\`\`\`javascript
setTimeout(() => console.log("timer"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));

// Output: nextTick, (timer or immediate, non-deterministic)
\`\`\`

**Warning:** Recursive \`process.nextTick\` calls can starve I/O:

\`\`\`javascript
function doWork() {
  process.nextTick(() => doWork()); // I/O never gets processed!
}
doWork();
// The poll phase never gets to handle new connections
\`\`\`

Use \`setImmediate\` instead for recursive async loops — it yields to the poll phase.

---

## Common Mistakes

### Blocking the Event Loop

\`\`\`javascript
// BAD: CPU-heavy loop blocks everything
const http = require("http");
const server = http.createServer((req, res) => {
  for (let i = 0; i < 1e9; i++) {} // Blocks the event loop for seconds
  res.end("Done");
});

// GOOD: Offload to a worker thread
const { Worker } = require("worker_threads");
const server = http.createServer((req, res) => {
  const worker = new Worker("./compute.js");
  worker.on("message", (result) => res.end(result));
});
\`\`\`

### Not Handling Stream Backpressure

\`\`\`javascript
// BAD: Reads faster than the client can consume
req.on("data", (chunk) => {
  res.write(chunk); // No backpressure handling
});

// GOOD: Use pipe with automatic backpressure
req.pipe(res);
\`\`\`

---

## Practice Questions

1. **Q:** How can Node.js handle 10,000 concurrent connections with a single thread when Apache needs 10,000 threads for the same load?
   **A:** Node uses non-blocking I/O — the single thread sets up operations and moves on, never waiting. Apache dedicates one OS thread per connection, and each thread blocks waiting for that connection's I/O. Thread overhead (stack memory, context switching) limits Apache's concurrency.

2. **Q:** You call \`fs.readFile\` and \`crypto.pbkdf2\` simultaneously. Both take 100ms. How long do they take to complete with the default thread pool size?
   **A:** Both finish in ~100ms. \`fs.readFile\` uses one thread, \`crypto.pbkdf2\` uses another. With 4 threads, they run in parallel. If you had 5 such operations, one would wait for a thread to free up.

3. **Q:** Why does \`setTimeout(fn, 0)\` not run immediately?
   **A:** The timer phase has a minimum threshold of 1ms (clamped by libuv). Even at 0ms, the callback is queued and must wait for the current operation to complete, the poll phase, and potentially other phases before the timer phase runs again.

4. **Q:** What is the difference between \`setImmediate\` and \`process.nextTick\`?
   **A:** \`process.nextTick\` runs its callbacks before the event loop continues to the next phase — it interrupts the loop. \`setImmediate\` runs its callbacks during the check phase, which is one of the regular phases. Recursive \`nextTick\` can starve I/O; recursive \`setImmediate\` yields to the poll phase.

5. **Q:** Your Express.js app handles JSON parsing, but a client sends a 500MB JSON body. What happens?
   **A:** The main thread blocks for seconds parsing the JSON, all other requests are delayed. Fix: use streaming JSON parsing or body parser size limits (\`express.json({ limit: "1mb" })\`) with early rejection. For large payloads, parse in a worker thread.

---

## Summary Cheat Sheet

\`\`\`
Node.js Architecture:
────────────────────
• 1 main thread for JS execution (V8)
• Libuv provides the Event Loop + Thread Pool
• 4 thread pool threads (UV_THREADPOOL_SIZE)

Event Loop Phases (in order):
─────────────────────────────
1. Timers (setTimeout/setInterval)
2. Pending callbacks
3. Idle/Prepare (internal)
4. Poll (I/O callbacks) ← most important
5. Check (setImmediate)
6. Close callbacks

Priority Order (highest to lowest):
───────────────────────────────────
1. process.nextTick (between phases)
2. Promise microtasks (between phases)
3. Timer/IO/Check callbacks (per phase)

Rules:
• CPU-heavy work blocks the event loop → use Worker Threads
• File I/O uses the thread pool (not epoll)
• setImmediate runs after I/O; nextTick runs before everything
• Never recursively use nextTick — will starve I/O
• Use streams.pipe() for automatic backpressure
• Avoid synchronous APIs (fs.readFileSync) in production servers`,
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
            content: `## Why This Matters (Read This First)

Imagine you have 10,000 workers in a factory. Each worker has their own toolbox (memory, state). If you used OS threads, each worker would need a massive toolbox (1MB+ stack), and switching between them would take time. The factory would grind to a halt.

Now imagine each worker carries only a tiny notepad (~2KB). They share a few large tool benches (OS threads). When a worker is idle, another grabs the notepad and starts working instantly. This is **goroutines on the Go scheduler**.

Go lets you start millions of goroutines because they are lightweight user-space threads scheduled by Go's runtime, not the OS kernel. Understanding the **GMP model** (Goroutine, Machine, Processor) is essential for writing high-concurrency Go services.

---

## The GMP Model — Three Abstractions

Go's scheduler maps goroutines to OS threads through three components:

| Component | What It Is | Key Characteristic |
|-----------|-----------|-------------------|
| **G (Goroutine)** | A lightweight execution context | ~2KB stack, grows/shrinks dynamically |
| **M (Machine)** | An OS thread | ~1MB stack, expensive to create, runtime reuses them |
| **P (Processor)** | A logical CPU context | Holds a local run queue (LRQ) of goroutines; \`GOMAXPROCS\` sets the count |

\`\`\`
┌──────────────────────────────────────────────────────┐
│              Go Process (runtime)                      │
│                                                         │
│  GOMAXPROCS = 4                                        │
│                                                         │
│  P0 ─── M0 ─── (OS Thread) ─── G1 → G2 → G3 (LRQ)   │
│  P1 ─── M1 ─── (OS Thread) ─── G4 → G5 (LRQ)        │
│  P2 ─── M2 ─── (OS Thread) ─── G6 (LRQ)              │
│  P3 ─── M3 ─── (OS Thread) ─── G7 → G8 (LRQ)        │
│                                                         │
│  Global Run Queue: G9, G10, G11, ...                   │
└──────────────────────────────────────────────────────┘
\`\`\`

By default, \`GOMAXPROCS\` equals the number of CPU cores. Each P is bound to one M (OS thread). When code running on a P blocks (syscall, channel wait), the runtime detaches the M and creates/acquires a new M for that P.

---

## Goroutines Are Cheap

\`\`\`go
package main

import (
	"fmt"
	"runtime"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	start := runtime.NumGoroutine()

	for i := 0; i < 100_000; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			_ = n
		}(i)
	}
	wg.Wait()

	fmt.Printf("Created %d goroutines, leaked: %d\n",
		100_000, runtime.NumGoroutine()-start)
}
\`\`\`

Each goroutine starts with a **2KB stack** (vs ~1MB for an OS thread). The stack grows and shrinks dynamically using **stack copying** — Go moves the stack to a larger/smaller location when needed.

---

## Scheduling — How Goroutines Run

Go implements **M:N scheduling** — M goroutines multiplexed onto N OS threads. The scheduler runs at specific **preemption points**:

1. **Function calls** — entering/exiting a function
2. **Channel operations** — send/receive
3. **Mutex operations** — sync.Mutex.Lock/Unlock
4. **time.Sleep** and timer operations
5. **Garbage collection** — all goroutines stop at safepoints

Since Go 1.14, the scheduler also uses **asynchronous preemption** — a signal-based mechanism that preempts goroutines running tight loops without function calls.

\`\`\`go
// Go 1.14+ can preempt this tight loop
func busyLoop() {
	for { // No function calls — previously this would block other goroutines forever
		// But Go 1.14+ sends a signal to preempt it
	}
}
\`\`\`

---

## Work Stealing — Load Balancing

When a P's local run queue is empty, it **steals** goroutines from another P's queue:

\`\`\`go
// If P0 finishes all its goroutines while P1 has 100 queued:
// P0 steals ~50 goroutines from P1's LRQ
// Both Ps stay busy instead of P0 sitting idle
\`\`\`

Work stealing happens:
- When a P finds its LRQ empty
- Every 14th scheduling attempt — the P checks the global run queue (GRQ) to prevent starvation
- After a goroutine blocks on syscall or channel — the P looks for new work immediately

---

## Network Poller — Async I/O

Go integrates with the OS's I/O multiplexing facility (epoll on Linux, kqueue on macOS, IOCP on Windows). When a goroutine performs network I/O:

\`\`\`go
conn, _ := net.Dial("tcp", "example.com:80")
// This goroutine is PARKED — the network poller waits for data
// The M (OS thread) is freed to run other goroutines
// When data arrives, the goroutine is placed back on a P's LRQ
\`\`\`

\`\`\`
Step 1: Goroutine calls conn.Read()
Step 2: Runtime sees no data → goroutine is parked, M is released
Step 3: Network poller (epoll) waits on the fd
Step 4: Data arrives → epoll wakes up → goroutine is queued on P's LRQ
Step 5: Goroutine resumes execution

This is how goroutines achieve async I/O without explicit callbacks or await keywords.
\`\`\`

---

## Practical Patterns

### Limiting Goroutine Count

\`\`\`go
// BAD: Create unlimited goroutines — can exhaust memory
for _, item := range items {
	go process(item)
}

// GOOD: Use a worker pool with bounded goroutines
sem := make(chan struct{}, 10) // max 10 concurrent
for _, item := range items {
	sem <- struct{}{} // blocks if 10 goroutines are running
	go func(item Item) {
		process(item)
		<-sem
	}(item)
}
\`\`\`

### Avoiding Goroutine Leaks

\`\`\`go
// BAD: Goroutine leaks if ch is never sent to
go func() {
	result := <-ch // blocks forever if ch never receives
	doWork(result)
}()

// GOOD: Use context cancellation
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
go func() {
	select {
	case result := <-ch:
		doWork(result)
	case <-ctx.Done():
		return // goroutine exits cleanly
	}
}()
\`\`\`

---

## Practice Questions

1. **Q:** What happens when a goroutine makes a blocking syscall (e.g., \`os.File.Read\`)?
   **A:** The M (OS thread) blocks with the goroutine. The scheduler detaches the P from the blocked M, creates or wakes a new M (from the idle list), and attaches it to the P. The P continues running other goroutines. When the syscall returns, the goroutine is requeued, and the M goes into the idle pool.

2. **Q:** What is \`GOMAXPROCS\` and what happens if you set it higher than the number of CPU cores?
   **A:** \`GOMAXPROCS\` limits the number of Ps (logical processors). Setting it higher than CPU cores does not increase parallelism (only N cores run N OS threads simultaneously), but it can increase concurrency — useful when goroutines are frequently blocked on I/O.

3. **Q:** Can one goroutine starve others? How did Go 1.14 fix this?
   **A:** Before Go 1.14, a tight loop without function calls (e.g., \`for {}\`) could starve other goroutines because the scheduler only ran at function call boundaries. Go 1.14 added asynchronous preemption — a signal (SIGURG on Linux) interrupts the goroutine, giving the scheduler a chance to run.

4. **Q:** How does the Go scheduler know when to schedule a different goroutine?
   **A:** The scheduler runs at preemption points: function calls, channel operations, mutex operations, time.Sleep, GC safepoints, and (Go 1.14+) via signal-based asynchronous preemption every 10ms.

5. **Q:** Why do goroutines use less memory than OS threads?
   **A:** Goroutines start with a ~2KB stack that grows/shrinks dynamically via stack copying. OS threads have a fixed 1MB+ stack that cannot shrink. Goroutines also avoid the kernel overhead of thread creation and context switching (no syscall needed to switch goroutines).

---

## Summary Cheat Sheet

\`\`\`
GMP Model:
  G (Goroutine) = lightweight execution (~2KB stack)
  M (Machine)   = OS thread (~1MB stack)
  P (Processor) = scheduling context (GOMAXPROCS count)

Scheduling:
  • M:N multiplexing — many goroutines on few threads
  • Function call = preemption point
  • Work stealing — idle Ps steal from busy Ps
  • Asynchronous preemption (Go 1.14+)

Key Rules:
  • GOMAXPROCS = number of CPU cores (default)
  • Network I/O uses epoll/kqueue — M is freed, goroutine parks
  • Blocking syscall → M blocks, P gets a new M
  • Use channel semaphores to limit concurrent goroutines
  • Use context.WithTimeout to prevent goroutine leaks
  • Avoid sync.WaitGroup in production — prefer errgroup`,
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
            content: `## Why This Matters (Read This First)

Most programming languages let you write code without thinking about memory. A **garbage collector** (GC) tracks allocations and frees them when they are no longer reachable. This is convenient, but GC pauses cause latency spikes — bad for games, real-time systems, or high-frequency trading.

Rust takes a different path. It guarantees **memory safety without a garbage collector** using a compile-time system called **ownership**. If your code compiles, it is memory-safe. No dangling pointers, no use-after-free, no double-free. Ever.

The trade-off: you must think about ownership, borrowing, and lifetimes. The compiler enforces rules that in other languages are left to convention (and mistakes).

---

## Ownership — One Owner Per Value

Every value in Rust has exactly **one owner**. When the owner goes out of scope, the value is dropped (freed).

\`\`\`rust
fn main() {
    let s = String::from("hello"); // s owns the String
    println!("{}", s);
} // s goes out of scope → String is dropped, memory freed
\`\`\`

### Move Semantics

When you assign a value or pass it to a function, ownership **moves**:

\`\`\`rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // ownership MOVES from s1 to s2

    // println!("{}", s1); // COMPILE ERROR: s1 no longer owns the value
    println!("{}", s2); // OK — s2 is the owner
}

fn take_ownership(s: String) { // s takes ownership
    println!("{}", s);
} // s is dropped here
\`\`\`

Primitive types (integers, booleans, floats) implement the \`Copy\` trait — they are **copied** instead of moved:

\`\`\`rust
let x = 5;
let y = x; // x is Copy → both x and y are valid
println!("{} {}", x, y); // works fine
\`\`\`

---

## Borrowing — References Without Ownership

Instead of transferring ownership, you can **borrow** a reference:

\`\`\`rust
fn main() {
    let s = String::from("hello");
    let len = calculate_length(&s); // &s creates a reference (borrows)
    println!("'{}' has length {}", s, len); // s is still usable
}

fn calculate_length(s: &String) -> usize { // s is a reference
    s.len()
} // s is NOT dropped — it does not own the value
\`\`\`

### Two Kinds of References

| Reference | Syntax | What It Allows | Limit |
|-----------|--------|----------------|-------|
| Shared (immutable) | \`&T\` | Read the value | Many readers at once |
| Exclusive (mutable) | \`&mut T\` | Read and write | One writer at a time |

\`\`\`rust
fn main() {
    let mut s = String::from("hello");

    let r1 = &s;      // shared borrow — OK
    let r2 = &s;      // shared borrow — OK (multiple readers)
    println!("{} and {}", r1, r2);

    let r3 = &mut s;  // mutable borrow — OK, no shared refs in scope
    r3.push_str(" world");
    println!("{}", r3);
}
\`\`\`

**The borrow checker enforces this rule:** You may have either one mutable reference OR any number of immutable references, but not both at the same time.

\`\`\`rust
let mut s = String::from("hello");
let r1 = &s;       // immutable borrow
let r2 = &s;       // immutable borrow
let r3 = &mut s;   // COMPILE ERROR: cannot borrow as mutable while immutable borrows exist
\`\`\`

This prevents **data races** at compile time — the single most common concurrency bug.

---

## Lifetimes — How Long Do References Live?

References must always be valid. The compiler needs to know how long a reference lives relative to the value it points to.

\`\`\`rust
fn main() {
    let r;
    {
        let x = 5;
        r = &x; // r borrows x, but x will be dropped...
    } // x is dropped here
    // println!("{}", r); // COMPILE ERROR: x does not live long enough
}
\`\`\`

Lifetime annotations use the \`'\` prefix:

\`\`\`rust
// 'a is a lifetime parameter — the return reference lives as long as both inputs
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("short");
    let s2 = String::from("longer");
    let result = longest(&s1, &s2);
    println!("The longest is: {}", result);
}
\`\`\`

In practice, **lifetime elision** rules let you omit most lifetime annotations:

\`\`\`rust
fn first_word(s: &str) -> &str {
// The compiler infers: fn first_word<'a>(s: &'a str) -> &'a str
    s.split_whitespace().next().unwrap_or("")
}
\`\`\`

---

## Send + Sync — Safe Concurrency

Rust uses traits to mark types as safe to use across threads:

| Trait | Meaning | Default |
|-------|---------|---------|
| \`Send\` | The type can be transferred across threads | Most types are Send |
| \`Sync\` | The type can be shared across threads (\`&T\` is Send) | Most types are Sync |

\`\`\`rust
fn main() {
    let s = String::from("hello");

    // std::thread::spawn requires F: Send + 'static
    std::thread::spawn(move || {
        // move transfers ownership of s into the closure
        println!("{}", s);
    }).join().unwrap();
}
\`\`\`

Types like \`Rc<T>\` (reference counted) are NOT \`Send\` — they use non-atomic reference counting. Use \`Arc<T>\` (atomically reference counted) for shared ownership across threads.

\`\`\`rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));

    let mut handles = vec![];
    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
\`\`\`

---

## Tokio — Async Runtime for Rust

Rust's async model uses **cooperative multitasking** based on Futures. Tokio provides the runtime:

\`\`\`rust
use tokio::net::TcpListener;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind("127.0.0.1:8080").await?;

    loop {
        let (socket, addr) = listener.accept().await?;
        println!("New connection from: {}", addr);

        tokio::spawn(async move {
            // Each connection runs on the Tokio thread pool
            handle_connection(socket).await;
        });
    }
}

async fn handle_connection(socket: tokio::net::TcpStream) {
    // ...
}
\`\`\`

Tokio uses **work-stealing** (like Go's scheduler) to balance async tasks across a thread pool. Each \`.await\` is a preemption point where the runtime can switch to another task.

---

## Practice Questions

1. **Q:** What happens when you try to use a value after moving it in Rust?
   **A:** The compiler rejects it with a "use after move" error. Ownership is transferred to the new binding/function. The original owner's variable is invalidated. This is checked at compile time — zero runtime cost.

2. **Q:** Can you have both an immutable reference and a mutable reference to the same value at the same time?
   **A:** No. The borrow checker allows either one mutable reference or any number of immutable references, but never both simultaneously. This prevents data races at compile time.

3. **Q:** What is the difference between \`Box<T>\`, \`Rc<T>\`, and \`Arc<T>\`?
   **A:** \`Box<T>\` is a heap-allocated value with single ownership. \`Rc<T>\` is reference-counted (non-atomic) — allows multiple owners within a single thread. \`Arc<T>\` is atomically reference-counted — safe for multiple owners across threads.

4. **Q:** Why might you want to use \`Pin\` in async Rust?
   **A:** Async functions can create self-referential structs (where a field points to another field within the same struct). Moving such a struct would invalidate the internal pointer. \`Pin\` guarantees the data will not be moved, which is essential for safe async execution.

5. **Q:** What happens at a \`.await\` point in Tokio?
   **A:** The future yields control back to the runtime. The runtime parks the current task and can schedule another task on the same thread. When the awaited operation completes (e.g., I/O data arrives), the task is woken and resumed from the await point.

---

## Summary Cheat Sheet

\`\`\`
Ownership Rules:
  1. Each value has exactly one owner
  2. When the owner goes out of scope, the value is dropped
  3. Assignment or function call MOVES ownership (unless Copy)

Borrowing Rules:
  1. Either: one &mut T (mutable reference)
  2. Or: N &T (immutable references)
  3. References must always be valid (lifetimes)

Send + Sync:
  • Send = safe to transfer ownership between threads
  • Sync = safe to share reference between threads
  • Rc<T> is !Send; Arc<T> is Send + Sync

Async (Tokio):
  • .await is a preemption point
  • Futures are lazily evaluated — nothing happens until polled
  • Tokio uses work-stealing like Go's scheduler
  • Pin is needed for self-referential structs in async blocks`,
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
            content: `## Why This Matters (Read This First)

Every backend server reads from disks and networks. How it reads determines how many users it can serve. The evolution of I/O models is the story of avoiding wasted CPU cycles.

Imagine calling a pizza place. With **blocking I/O**, you call and sit by the phone doing nothing until the pizza arrives. With **non-blocking + polling**, you keep calling back every 30 seconds ("Is it ready?"). With **epoll**, you give the pizza place your number and they call you when it's ready — you do other things in the meantime.

This article covers the I/O models that power Node.js, Nginx, Redis, and the cutting-edge io_uring interface.

---

## Blocking I/O — Simple but Wasteful

\`\`\`c
// Blocking I/O: the thread sleeps until data is available
char buf[1024];
int fd = open("file.txt", O_RDONLY);
read(fd, buf, sizeof(buf)); // Thread BLOCKS here — sleeping, doing nothing
printf("%s", buf);
\`\`\`

| Characteristic | Value |
|---------------|-------|
| Thread state | **Sleeping** (TASK_INTERRUPTIBLE) |
| CPU usage | 0% while waiting |
| Scalability | One thread per connection: ~8MB stack per thread → 1,000 threads = 8GB RAM |
| Latency | Excellent for low concurrency |
| Best for | Simple scripts, low-concurrency apps |

---

## Non-Blocking + Polling

The file descriptor is set to non-blocking (\`O_NONBLOCK\`). \`read()\` returns immediately — with data if available, or \`EAGAIN\` if not.

\`\`\`c
// Non-blocking: spin in a loop checking for data
int flags = fcntl(fd, F_GETFL, 0);
fcntl(fd, F_SETFL, flags | O_NONBLOCK);

char buf[1024];
while (1) {
    ssize_t n = read(fd, buf, sizeof(buf));
    if (n > 0) {
        // Got data!
        break;
    } else if (errno == EAGAIN) {
        // No data yet — spin again (WASTES CPU)
        continue;
    }
}
\`\`\`

**Problem:** Busy-looping wastes CPU. \`poll()\` and \`select()\\) fix this by letting you wait on multiple fds at once, but they have O(n) scaling — the kernel scans all fds every call.

---

## I/O Multiplexing — epoll

\`epoll\` is Linux-specific (since 2.6). It is O(1) — it only returns fds that are ready. Node.js, Nginx, Redis, and libuv all use epoll on Linux.

\`\`\`c
int epfd = epoll_create(1);
struct epoll_event ev, events[64];
ev.events = EPOLLIN;
ev.data.fd = socket_fd;
epoll_ctl(epfd, EPOLL_CTL_ADD, socket_fd, &ev);

while (1) {
    int n = epoll_wait(epfd, events, 64, -1); // Blocks until events happen
    for (int i = 0; i < n; i++) {
        // Only ready fds are returned — O(1), not O(N)
        handle_event(events[i].data.fd);
    }
}
\`\`\`

### How epoll Works

\`\`\`
┌──────────────────────┐
│  epoll instance       │
│  ┌──────────────────┐│
│  │ Interest list    ││ ← fds being monitored (added via epoll_ctl)
│  └──────────────────┘│
│  ┌──────────────────┐│
│  │ Ready list       ││ ← fds with events (returned by epoll_wait)
│  └──────────────────┘│
└──────────────────────┘
\`\`\`

**Edge-triggered (ET) vs Level-triggered (LT):**

| Mode | Behavior | Use Case |
|------|----------|----------|
| Level-triggered (default) | epoll_wait returns as long as data exists | Simpler code, compatible with blocking read |
| Edge-triggered | epoll_wait returns only when NEW data arrives | Higher performance, must read until EAGAIN |

\`\`\`c
// Edge-triggered: must read all data or loop forever
struct epoll_event ev;
ev.events = EPOLLIN | EPOLLET; // Edge-triggered
epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev);

// Read loop until EAGAIN:
while (1) {
    ssize_t n = read(fd, buf, sizeof(buf));
    if (n == -1 && errno == EAGAIN) break; // All data consumed
    process(buf, n);
}
\`\`\`

---

## io_uring — The New Hotness

Introduced in Linux 5.1, io_uring is a ring-buffer interface that drastically reduces syscall overhead.

### The Problem It Solves

epoll still requires **two syscalls** for an I/O operation:
1. \`epoll_wait\` to know an fd is ready
2. \`read\` / \`write\` to actually transfer data

Each syscall switches from userspace → kernel → userspace (context switch), which costs ~1-2μs.

### How io_uring Works

\`\`\`
┌────────────────────────────┐
│      Userspace              │
│  ┌────────────────────┐     │
│  │ Submission Queue   │ →→→ │ ← App writes sqe entries
│  └────────────────────┘     │
│  ┌────────────────────┐     │
│  │ Completion Queue   │ ←←← │ ← Kernel writes cqe entries
│  └────────────────────┘     │
└────────────┬───────────────┘
             │ (shared memory — no copying)
             ▼
┌────────────────────────────┐
│         Kernel              │
│  Reads SQ entries, performs │
│  I/O, writes CQ entries     │
└────────────────────────────┘
\`\`\`

\`\`\`c
// io_uring: batch multiple I/O operations in ONE syscall
struct io_uring ring;
io_uring_queue_init(64, &ring, 0);

// Submit 3 reads in a single batch
struct io_uring_sqe *sqe1 = io_uring_get_sqe(&ring);
io_uring_prep_read(sqe1, fd1, buf1, sizeof(buf1), 0);
struct io_uring_sqe *sqe2 = io_uring_get_sqe(&ring);
io_uring_prep_read(sqe2, fd2, buf2, sizeof(buf2), 0);

io_uring_submit(&ring); // ONE syscall for all 3 reads

// Wait for completions
int ret = io_uring_wait_cqe(&ring, &cqe);
// ...
\`\`\`

**Key benefits:**
- One syscall submits many operations (amortized cost)
- No polling needed — completion notification is delivered via the ring
- Supports vectored I/O, buffered writes, fsync, splice, and more
- Can even accept new connections asynchronously

---

## Comparison Table

| Model | Syscalls per I/O | CPU Efficiency | Concurrency | Code Complexity |
|-------|-----------------|---------------|-------------|-----------------|
| Blocking | 1 (plus context switch) | Poor (thread sleeps) | Low (thread per conn) | Simple |
| Non-blocking + poll | 2+ (poll + read) | Poor (busy loop) | Medium | Medium |
| select/poll | O(n) scan | Medium | Medium | Medium |
| epoll (LT) | 2 (epoll_wait + read) | Good | Very high | Medium |
| epoll (ET) | 2+ (must read until EAGAIN) | Excellent | Very high | Complex |
| io_uring | 1 for N operations | Excellent (amortized) | Very high | Complex |

---

## Practice Questions

1. **Q:** Why can blocking I/O not scale to 10,000 concurrent connections?
   **A:** Each blocked thread consumes ~8MB of stack memory (the default on Linux). 10,000 threads would require 80GB of RAM just for stacks, plus the overhead of thread creation/destruction. Context switching between 10,000 threads also wastes significant CPU time.

2. **Q:** What is the fundamental advantage of io_uring over epoll?
   **A:** io_uring can submit multiple I/O operations in a single syscall (amortized context switch cost), and it uses shared memory rings to avoid copying data between kernel and userspace. It also supports operations that epoll cannot handle, like async readv/writev and accept.

3. **Q:** Why does epoll's edge-triggered mode require reading until EAGAIN?
   **A:** Edge-triggered mode only notifies once when new data arrives. If you don't read all data, the remaining data stays in the buffer, but you won't get another notification until more data arrives. The application would miss the pending data.

4. **Q:** In Node.js, does \`fs.readFile\` use epoll?
   **A:** No. File I/O on Linux is not asynchronous at the OS level (only network I/O uses epoll/kqueue). Libuv's thread pool handles file I/O — the fs operation runs on a worker thread in the thread pool.

5. **Q:** Can io_uring be faster than epoll for a single read?
   **A:** For a single operation, epoll is likely faster because the io_uring submission/completion ring setup overhead exceeds the epoll syscall cost. io_uring's advantage comes from batching multiple operations into one syscall.

---

## Summary Cheat Sheet

\`\`\`
I/O Models (from worst to best):
─────────────────────────────────
1. Blocking: thread sleeps for I/O — simple, doesn't scale
2. Non-blocking + poll: CPU waste from busy-looping
3. select/poll: O(n) scan of all fds — works, but slow
4. epoll (Linux): O(1) — returns only ready fds
   • Level-triggered: simpler, compatible with blocking read
   • Edge-triggered: more efficient, must read until EAGAIN
5. io_uring (Linux 5.1+): ring-buffer based
   • One syscall submits batch of operations
   • Zero-copy between kernel and userspace
   • Async everything: read, write, accept, openat, fsync

Real-world mappings:
  • Node.js: libuv → epoll (I/O) + thread pool (file/crypto)
  • Nginx: epoll (ET mode)
  • Redis: epoll / kqueue (single-threaded, multiplexed)
  • Go netpoller: epoll (goroutines park, M freed)
  • io_uring: SPDK, RocksDB, QEMU, and new async frameworks`,
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
            content: `## Why This Matters (Read This First)

Node.js dominated the 2010s. But as JavaScript fatigue grew and performance demands increased, developers started asking: "Is there a faster way to run JavaScript/TypeScript?"

Enter **Bun** and **Deno** — two modern runtimes that learn from Node.js's mistakes. Bun targets raw speed (4x faster cold start). Deno targets web-standard API compatibility. Both can run your existing Node.js code. But which one should you use?

---

## Bun — Fast by Design

Bun uses **JavaScriptCore** (the engine powering Safari, not Chrome's V8). This alone gives it advantages:

| Aspect | Node.js | Bun |
|--------|---------|-----|
| Engine | V8 | JavaScriptCore (JSC) |
| Cold start | ~200ms | ~40ms |
| Language | JavaScript | JavaScript + built-in TS/JSX transpiler |
| Test runner | vitest, jest | Built-in (\`bun test\`) |
| Package manager | npm/pnpm/yarn | Built-in (Bun's own, 10x faster than npm) |
| SQLite | third-party | Built-in (\`bun:sqlify\`) |

\`\`\`bash
# Compare cold start times
time node -e "console.log('hello')"   # ~200ms
time bun -e "console.log('hello')"    # ~40ms

# Bun can run TypeScript directly — no ts-node needed
bun run server.ts
\`\`\`

### Built-in Tools — No More Webpack

\`\`\`bash
# Bun bundles TypeScript to a single file
bun build ./src/index.ts --outdir=./dist

# Bun runs tests
bun test

# Bun installs dependencies (uses bun.lockb)
bun install

# Bun starts a simple HTTP server
bun -e "Bun.serve({port:3000, fetch:()=>new Response('hi')})"
\`\`\`

### Bun's SQLite Client

\`\`\`typescript
import { Database } from "bun:sqlify";

const db = new Database(":memory:");
db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)");
db.run("INSERT INTO users (name) VALUES ('Alice'), ('Bob')");

const users = db.query("SELECT * FROM users").all();
console.log(users); // [{id:1,name:'Alice'},{id:2,name:'Bob'}]
\`\`\`

---

## Deno — Web Standards First

Deno was created by Ryan Dahl (the original creator of Node.js) to fix Node.js's design regrets. Its philosophy: **be compatible with browser APIs, not Node.js APIs**.

\`\`\`typescript
// Deno uses web-standard fetch — no 'node-fetch' or 'undici' needed
const response = await fetch("https://api.github.com/users/octocat");
const data = await response.json();
console.log(data);

// Native WebSocket — no 'ws' package
const ws = new WebSocket("ws://localhost:8080");
ws.onmessage = (e) => console.log(e.data);

// Web Crypto — no 'crypto' npm package
const key = await crypto.subtle.generateKey("AES-GCM", true, ["encrypt", "decrypt"]);
\`\`\`

### Permission Model

Deno requires explicit permissions — no scripts can access the network or filesystem without your consent:

\`\`\`bash
deno run server.ts          # Error: no network access
deno run --allow-net server.ts    # Allow network
deno run --allow-read --allow-write server.ts  # Allow file access
deno run --allow-all server.ts    # Allow everything (bypass security)
\`\`\`

### npm Compatibility

Deno can import npm packages using \`npm:\` specifiers:

\`\`\`typescript
import express from "npm:express@4";
const app = express();
app.get("/", (req, res) => res.send("Hello from Deno!"));
app.listen(3000);
\`\`\`

This is powered by an **npm compatibility layer** that translates CommonJS and Node APIs to Deno equivalents.

---

## Choosing a Runtime

| Criteria | Choose Node.js | Choose Bun | Choose Deno |
|----------|---------------|------------|-------------|
| Ecosystem maturity | Largest npm ecosystem | Growing, good Node compat | Smaller, but growing |
| Cold start latency | Slowest | Fastest (~40ms) | Medium |
| Built-in tools | Need separate tools | Bundler, test runner included | Linter, formatter, doc generator |
| Web standard APIs | Polyfills needed | Partial | Native |
| Deployment target | Everywhere | Bun hosting, Docker | Deno Deploy, Docker |
| Team familiarity | Everyone knows it | Growing | Smallest |

---

## Practice Questions

1. **Q:** Why does Bun have faster cold start times than Node.js?
   **A:** Three reasons: (1) JavaScriptCore's architecture requires less initialization than V8; (2) Bun is written in Zig and optimized for startup; (3) Bun's built-in transpiler eliminates the need for ts-node or tsconfig loading overhead.

2. **Q:** Deno requires \`--allow-net\` for HTTP servers. Why is this better than Node.js's approach?
   **A:** It follows the principle of least privilege — a script cannot accidentally (or maliciously) send your data to an external server. In Node.js, any \`require()\`'d package can make network requests without your knowledge.

3. **Q:** Can Bun run Express.js applications?
   **A:** Yes. Bun has Node.js compatibility built-in. Running \`bun run index.js\` with an Express app works in most cases. However, native Node.js addons (C++ .node files) and some edge-case Node APIs may not be supported.

4. **Q:** What is the main trade-off Bun makes by using JavaScriptCore instead of V8?
   **A:** Chrome DevTools debugging works natively with V8 but requires extra tooling for JavaScriptCore. Some V8-specific optimizations and APIs are not available in JSC. Bun's error stack traces and source maps may differ from what developers are used to with Node.js.

5. **Q:** Why did Deno choose to use URL imports (\`import from "https://..."\`) instead of npm?
   **A:** URL imports avoid centralized package registries. Each import is an immutable reference to the exact URL content, which can be cached. This aligns with the browser's module system (ES Modules work the same way in browsers).

---

## Summary Cheat Sheet

\`\`\`
┌────────────────┬──────────┬────────┬─────────┐
│                │ Node.js  │  Bun   │  Deno   │
├────────────────┼──────────┼────────┼─────────┤
│ Engine         │ V8       │ JSC    │ V8      │
│ TS/JSX native  │ ❌       │ ✅     │ ✅      │
│ Test runner    │ External │ Built  │ Built   │
│ Package mgr    │ npm/pnpm │ Built  │ npm:    │
│ Permission     │ None     │ None   │ Granular│
│ Cold start     │ ~200ms   │ ~40ms  │ ~100ms  │
│ Node compat    │ Native   │ Good   │ Partial │
└────────────────┴──────────┴────────┴─────────┘`,
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
            content: `## Why This Matters (Read This First)

Python dominates data science and machine learning. For backend web development, it has three major ecosystems: **Django** (batteries-included monolith), **FastAPI** (modern async with automatic docs), and **Flask** (minimalist microframework).

Understanding when to use each and how the async gateway (ASGI) differs from the sync gateway (WSGI) is essential for anyone building Python backends professionally.

---

## WSGI vs ASGI — The Gateway Protocols

| Protocol | Synchronous? | WebSocket? | Frameworks |
|----------|-------------|------------|------------|
| WSGI | Yes — one request blocks a thread | No | Django, Flask, Pyramid |
| ASGI | Async/await native | Yes | FastAPI, Starlette, Django Channels |

### WSGI — The Old Standard

\`\`\`python
# WSGI application: a callable (function or class)
def app(environ, start_response):
    """environ: dict of CGI-style environment variables.
       start_response: callable to send status + headers."""
    status = "200 OK"
    headers = [("Content-Type", "text/plain")]
    start_response(status, headers)
    return [b"Hello World"]

# Gunicorn with sync workers:
# gunicorn app:app -w 4
# 4 OS threads handling requests — each blocks on I/O
\`\`\`

WSGI is simple but wasteful — each request ties up a thread even when waiting for a database query.

### ASGI — Async Native

\`\`\`python
# ASGI application: an async callable
async def app(scope, receive, send):
    """scope: connection info dict.
       receive: async callable to get incoming events.
       send: async callable to send outgoing events."""
    await send({
        "type": "http.response.start",
        "status": 200,
        "headers": [(b"content-type", b"text/plain")],
    })
    await send({
        "type": "http.response.body",
        "body": b"Hello World",
    })
\`\`\`

---

## FastAPI — Modern, Fast, Type-Safe

FastAPI uses **Pydantic** for data validation and automatically generates OpenAPI documentation.

\`\`\`python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    is_offer: Optional[bool] = None

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    """Query parameter q is optional.
       Path parameter item_id is an int — FastAPI validates it."""
    return {"item_id": item_id, "q": q}

@app.post("/items/", response_model=Item, status_code=201)
def create_item(item: Item):
    """Pydantic validates the request body automatically.
       Swagger docs are generated from the type annotations."""
    if item.price < 0:
        raise HTTPException(status_code=422, detail="Price cannot be negative")
    return item
\`\`\`

### Automatic Swagger Docs

Run \`uvicorn main:app --reload\` and visit:
- \`/docs\` — Swagger UI (interactive API testing)
- \`/redoc\` — ReDoc UI (cleaner documentation)

Both are generated from Python type annotations — zero configuration.

---

## Django — Batteries Included

Django includes everything for a content-heavy web application: ORM, admin panel, authentication, migrations, middleware, and templates.

\`\`\`python
# models.py — Django ORM
from django.db import models

class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey("auth.User", on_delete=models.CASCADE)

    class Meta:
        indexes = [models.Index(fields=["created_at"])]

# views.py — class-based view
from django.views.generic import ListView

class BlogListView(ListView):
    model = BlogPost
    template_name = "blog/list.html"
    paginate_by = 20
    queryset = BlogPost.objects.select_related("author").all()
\`\`\`

### Django's ORM — Powerful but Dangerous

\`\`\`python
# BAD: N+1 query problem
posts = BlogPost.objects.all()
for post in posts:
    print(post.author.email)  # ONE query per post!

# GOOD: Use select_related for ForeignKey
posts = BlogPost.objects.select_related("author").all()
for post in posts:
    print(post.author.email)  # Zero extra queries
\`\`\`

---

## Flask — Minimal and Composable

Flask gives you routing and request handling. Everything else comes from extensions.

\`\`\`python
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://localhost/mydb"
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)

@app.route("/users", methods=["GET"])
def list_users():
    users = User.query.all()
    return jsonify([{"id": u.id, "name": u.name} for u in users])

@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    user = User(name=data["name"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "name": user.name}), 201
\`\`\`

---

## SQLAlchemy — The Python ORM Standard

SQLAlchemy has two layers: **Core** (SQL expression language) and **ORM** (declarative models).

\`\`\`python
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

engine = create_engine("postgresql://localhost/mydb")

# Core — write SQL expressions
with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM users WHERE id = :id"), {"id": 1})
    row = result.fetchone()

# ORM — object-oriented
with Session(engine) as session:
    user = session.get(User, 1)
    print(user.name)
\`\`\`

---

## Choosing Your Python Web Stack

| Aspect | FastAPI | Django | Flask |
|--------|---------|--------|-------|
| Best for | APIs, microservices, async | Content sites, admin panels | Small services, prototyping |
| Async native | Yes | Via Channels | No |
| ORM | SQLAlchemy or raw | Built-in ORM | Any (SQLAlchemy common) |
| Admin panel | No | Built-in | Flask-Admin extension |
| Learning curve | Medium | Steep | Low |
| Performance | Highest | Medium | Medium |

---

## Practice Questions

1. **Q:** You have a Django view that queries related models. How do you prevent N+1 queries?
   **A:** Use \`select_related()\` for ForeignKey and OneToOne relations (SQL JOIN), and \`prefetch_related()\` for ManyToMany and reverse relations (separate query + Python join).

2. **Q:** Why is FastAPI faster than Flask for I/O-heavy workloads?
   **A:** FastAPI runs on ASGI (using Starlette + Uvicorn), which supports async/await natively. During I/O waits (DB queries, API calls), the event loop switches to another task instead of blocking the thread. Flask (WSGI) blocks the entire thread during I/O.

3. **Q:** What is the difference between Pydantic's \`BaseModel\` and a Python dataclass?
   **A:** Pydantic validates data at runtime based on type annotations — it coerces types, raises validation errors, and generates JSON Schema. Dataclasses have no validation or coercion.

4. **Q:** When would you use SQLAlchemy Core instead of the ORM?
   **A:** For complex reporting queries, bulk inserts, or when you need fine-grained control over the generated SQL. The ORM adds overhead from identity maps, session tracking, and lazy loading.

5. **Q:** How do you handle background tasks in FastAPI vs Django?
   **A:** FastAPI can use \`BackgroundTasks\` (simple) or Celery (complex). Django uses Celery or Django-Q. For production, always use a proper task queue (Celery + Redis/RabbitMQ) — not in-process background threads that might be killed by the server.

---

## Summary Cheat Sheet

\`\`\`
Python Backend Ecosystem:
─────────────────────────
• WSGI (sync): Django, Flask, Pyramid
• ASGI (async): FastAPI, Starlette, Django Channels

Framework decision:
  • FastAPI: APIs, async, auto docs → /docs
  • Django: Full-featured, admin, ORM, auth
  • Flask: Minimal, composable extensions

Key tools:
  • Pydantic: runtime validation → JSON Schema
  • SQLAlchemy: Core (SQL expressions) + ORM (models)
  • Alembic: schema migrations from SQLAlchemy models
  • Celery: distributed task queue (Redis/RabbitMQ)
  • Gunicorn + Uvicorn: production ASGI/WSGI serving
  • uv: Rust-based pip alternative (10-100x faster)`,
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
            content: `## Why This Matters (Read This First)

Beyond Node.js, the backend world runs on **Go** and **Rust** — two languages that trade developer convenience for raw performance. Go gives you goroutines and fast compilation. Rust gives you memory safety without a GC and zero-cost abstractions.

If you need to handle 100,000 requests per second on a single machine, you are looking at Go or Rust. This article compares the dominant web frameworks in both ecosystems.

---

## Go Web Frameworks

Go's standard library \`net/http\` is surprisingly capable for basic cases. Frameworks add routing, middleware, and validation niceties.

### Gin — The Most Popular

\`\`\`go
package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default() // includes Logger and Recovery middleware

	r.GET("/users/:id", func(c *gin.Context) {
		id := c.Param("id") // path parameter
		c.JSON(200, gin.H{
			"user_id": id,
			"name":    "Alice",
		})
	})

	r.POST("/users", func(c *gin.Context) {
		var user struct {
			Name  string \`json:"name" binding:"required"\`
			Email string \`json:"email" binding:"required,email"\`
		}
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		c.JSON(201, user)
	})

	r.Run(":8080")
}
\`\`\`

Gin uses a **radix tree** router — O(n) where n is path depth, not number of routes. Even with 10,000 routes, routing is instantaneous.

### Echo — Minimal and Fast

\`\`\`go
import "github.com/labstack/echo/v4"

func main() {
	e := echo.New()
	e.Use(middleware.CORS())
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(20)))

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	e.Start(":8080")
}
\`\`\`

Echo shines with built-in middleware: CORS, CSRF, JWT, rate limiting, request ID, and graceful shutdown.

### Fiber — Express.js for Go Developers

\`\`\`go
import "github.com/gofiber/fiber/v2"

func main() {
	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	app.Get("/:name", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"name": c.Params("name"),
		})
	})

	app.Listen(":3000")
}
\`\`\`

Fiber is a direct port of Express.js syntax. Great for Node.js developers moving to Go.

---

## Rust Web Frameworks

Rust frameworks are built on top of **Tokio** (async runtime) and **Tower** (service abstraction).

### Axum — The Modern Choice

\`\`\`rust
use axum::{
    extract::{Path, Query, State},
    routing::get,
    Router,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Deserialize)]
struct UserParams {
    name: Option<String>,
}

async fn get_user(
    Path(id): Path<u64>,
    Query(params): Query<UserParams>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "id": id,
        "name": params.name.unwrap_or_else(|| "Anonymous".to_string()),
    }))
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/users/:id", get(get_user));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
\`\`\`

Axum uses **extractors** (\`Path\`, \`Query\`, \`Json\`, \`State\`) — composable types that implement \`FromRequestParts\`. The \`Tower\` middleware ecosystem provides timeouts, rate limiting, tracing, and load balancing.

### Actix Web — The Performance King

\`\`\`rust
use actix_web::{web, App, HttpServer, Responder};

async fn index(path: web::Path<String>) -> impl Responder {
    format!("Hello {}!", path)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/{name}", web::get().to(index))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
\`\`\`

Actix Web consistently ranks #1 in TechEmpower benchmarks. It uses an actor-based model (optional) for state management.

---

## Framework Comparison

| Framework | Language | Router | Middleware | Throughput | Startup Time |
|-----------|----------|--------|------------|------------|--------------|
| Gin | Go | Radix tree | Chain | ~100K req/s | ~5ms |
| Echo | Go | Radix tree | Built-in chain | ~120K req/s | ~5ms |
| Fiber | Go | Radix tree | Express-like | ~130K req/s | ~5ms |
| Axum | Rust | Trait-based | Tower stack | ~300K req/s | ~3ms |
| Actix Web | Rust | Regex/custom | Actor/chain | ~400K req/s | ~3ms |

---

## Practice Questions

1. **Q:** Why do Rust web frameworks have higher throughput than Go frameworks?
   **A:** Rust's zero-cost abstractions mean the async runtime and HTTP parsing compile to near-hand-written machine code. Go has a runtime (goroutines, GC) that adds overhead — garbage collection pauses and goroutine scheduling costs.

2. **Q:** When would you choose Gin over the standard library \`net/http\`?
   **A:** When you need path parameters (\`/users/:id\`), request body validation, middleware chains (auth, logging, recovery), or JSON response helpers. The stdlib is sufficient for simple APIs with no path parameters.

3. **Q:** What is the Tower ecosystem in Axum?
   **A:** Tower provides the \`Service\` trait and composable middleware (Timeout, RateLimit, Retry, LoadShed, Buffer). Any Tower middleware can wrap an Axum handler. This is similar to Rack in Ruby or WSGI middleware in Python.

4. **Q:** How does Actix Web's actor model work?
   **A:** Actors are objects that process messages sequentially in their own mailbox. Actix Web actors can maintain state across requests (like a WebSocket session) without shared mutable state — each actor runs in its own Task.

5. **Q:** Is Go's goroutine-per-request model more efficient than Rust's async tasks?
   **A:** Not necessarily. Go goroutines are lightweight (~2KB) but still heavier than Rust async tasks (~0 bytes on the heap — they are state machines stored inline). Rust's async tasks have zero heap allocation for the task itself, while goroutines always have a stack.

---

## Summary Cheat Sheet

\`\`\`
Go Frameworks:
  Gin:  radix tree router, JSON binding/validation, middleware chains
  Echo: minimal API, built-in middleware (CORS, JWT, ratelimit)
  Fiber: Express.js-port, Node devs migrating to Go

Rust Frameworks:
  Axum:  Tower-based, strong types via extractors
  Actix: actor model, #1 TechEmpower benchmarks

Choosing:
  • Go: simpler deployment, faster compilation, GC-managed
  • Rust: maximum throughput, memory safe, no GC, complex borrow checker
  • Both: excellent concurrency models (goroutines vs async/await)`,
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
            content: `## Why This Matters (Read This First)

The web runs on HTTP. Every API call, every webpage load, every microservice communication uses HTTP. Yet most developers do not understand how the protocol actually works.

HTTP/1.1 dominated for 20 years. HTTP/2 brought multiplexing. HTTP/3 rebuilt the transport layer on UDP (QUIC) to eliminate head-of-line blocking. Choosing the right version can cut page load times by 30-50%.

---

## HTTP/1.1 — The Workhorse

| Feature | HTTP/1.1 |
|---------|----------|
| Connections | One request per connection (serial) |
| Multiplexing | Not supported — must use 6 parallel connections |
| Header compression | None — headers sent as plaintext every request |
| Server push | Not supported |
| Transport | TCP |

\`\`\`http
GET /api/users HTTP/1.1
Host: example.com
User-Agent: curl/8.0
Accept: application/json
Authorization: Bearer abc123
(empty line)
\`\`\`

**Head-of-line blocking (HOL):** If you request \`style.css\` and \`app.js\` in sequence, the second request cannot start until the first response completes. Browsers work around this by opening **6 parallel connections** per origin.

---

## HTTP/2 — Binary Multiplexing

HTTP/2 addresses HTTP/1.1's fundamental problem: it allows multiple concurrent **streams** over a single TCP connection.

\`\`\`
HTTP/1.1 (one connection):          HTTP/2 (one connection):
┌──────────────┐                    ┌──────────────────┐
│ GET style.css│                    │ ┌→ Stream 1: HTML│
│ ...wait...   │                    │ ├→ Stream 2: CSS │
│ ← style.css  │                    │ ├→ Stream 3: JS  │
│ GET app.js   │                    │ └→ Stream 4: img │
│ ...wait...   │                    │ ALL IN PARALLEL  │
│ ← app.js     │                    └──────────────────┘
└──────────────┘
\`\`\`

### Binary Framing Layer

HTTP/2 is not text-based like HTTP/1.1. It uses **binary frames**:

\`\`\`
HTTP/2 Frame (binary):
┌────────────────────────────────┐
│ Length (24 bits)               │
├────────────────────────────────┤
│ Type (8 bits): DATA, HEADERS,  │
│   PRIORITY, RST_STREAM, SETTINGS│
├────────────────────────────────┤
│ Flags (8 bits): END_STREAM,   │
│   END_HEADERS, PADDED          │
├────────────────────────────────┤
│ Stream ID (31 bits)            │
├────────────────────────────────┤
│ Payload                        │
└────────────────────────────────┘
\`\`\`

**HPACK header compression:** Repeated headers (Cookie, Authorization) are sent once and referenced by index in subsequent requests.

### Server Push

The server can send resources the client hasn't requested yet:

\`\`\`http
:method = GET
:path = /index.html

# Server also pushes:
:method = GET
:path = /style.css  # Client doesn't need to request this separately
\`\`\`

In practice, server push was poorly adopted and is being replaced by **103 Early Hints**.

### HTTP/2's Achilles Heel: TCP HOL Blocking

Since all streams share one TCP connection, a single lost packet blocks ALL streams until TCP retransmits the packet. This is **TCP-level head-of-line blocking**.

---

## HTTP/3 — QUIC Changes Everything

HTTP/3 replaces TCP with **QUIC** (Quick UDP Internet Connections), built on UDP.

\`\`\`
TCP (HTTP/2):                    QUIC (HTTP/3):
┌────────────────────┐           ┌────────────────────┐
│ Single TCP conn    │           │ UDP with per-stream│
│ ┌─ Stream 1: data │           │ reliability        │
│ ┌─ Stream 2: data │           │ ┌─ Stream 1: data  │
│ ┌─ Stream 3: data │           │ ├─ Stream 2: (lost)│
│ ✗ PACKET LOSS!    │           │ └─ Stream 3: data  │
│ ALL streams block │           │    Only stream 2   │
│ until retransmit  │           │    waits for retry │
└────────────────────┘           └────────────────────┘
\`\`\`

**Why QUIC?**
- 0-RTT connection establishment (no TCP handshake on repeat visits)
- Per-stream reliability — packet loss on one stream does not affect others
- Built-in encryption (TLS 1.3 is mandatory, not optional)
- Connection migration — change networks (WiFi → 4G) without dropping the connection

\`\`\`
Connection setup comparison:
TCP + TLS 1.3:   SYN → SYN-ACK → ACK → ClientHello → ServerHello → ... → Ready = 2-3 RTT
QUIC (0-RTT):    ClientHello + data → Ready = 0 RTT (if previously connected)
\`\`\`

---

## Performance Comparison

| Scenario | HTTP/1.1 | HTTP/2 | HTTP/3 |
|----------|----------|--------|--------|
| 100 small files (10KB each) | ~6 at a time | All at once | All at once |
| 1% packet loss | +1 RTT per request | +1 RTT for ALL | +1 RTT for ONE stream |
| First visit (new user) | TCP + TLS handshake | Same | 1-RTT handshake |
| Return visit | Same | Same | 0-RTT (immediate data) |
| Network change (WiFi → 4G) | Connection dies | Connection dies | Survives |

---

## Practice Questions

1. **Q:** Why does HTTP/2's multiplexing not help when there is 2% packet loss?
   **A:** All multiplexed streams share one TCP connection. TCP delivers bytes in order — a single lost packet stalls the entire connection until retransmission. This is called TCP-level head-of-line blocking.

2. **Q:** How does QUIC avoid TCP's head-of-line blocking?
   **A:** QUIC implements multiplexing at the transport layer (UDP). Each stream has independent reliability. Packet loss on stream 2 only delays stream 2 — streams 1, 3, and 4 continue delivering data.

3. **Q:** What is 0-RTT and why is it controversial?
   **A:** 0-RTT allows a client that has previously connected to a server to send data in the first packet (no handshake). The risk: replay attacks — an attacker can re-send the 0-RTT data and the server may process it twice. Idempotent operations (GET, PUT) are safe; non-idempotent operations (POST) are not.

4. **Q:** When would you still use HTTP/1.1 over HTTP/2?
   **A:** When the server or client does not support HTTP/2 (older browsers, some IoT devices). Also, HTTP/1.1 over a single connection is simpler for debugging — you can read the plaintext with curl or netcat.

5. **Q:** What is HPACK and why does it matter for API performance?
   **A:** HPACK compresses HTTP/2 headers using a static + dynamic table. Repeated headers (Authorization, Cookie) are replaced with a 1-byte index. This reduces request overhead from ~800 bytes to ~50 bytes — critical for APIs with many small requests.

---

## Summary Cheat Sheet

\`\`\`
        HTTP/1.1    HTTP/2      HTTP/3
        ────────    ──────      ──────
Transport: TCP       TCP         QUIC (UDP)
Multiplex: ❌ (6 conns) ✅       ✅
HOL blocking: request-level (6 conns workaround)
                      TCP-level (packet loss blocks ALL)
                                 Per-stream (only affected stream)
Headers:  plaintext   HPACK       QPACK
Push:     ❌          ✅          ✅
0-RTT:    ❌          ❌          ✅
Conn migration: ❌    ❌          ✅

When to use:
• HTTP/1.1: legacy systems, simple tools
• HTTP/2: modern web apps, many small resources
• HTTP/3: latency-sensitive apps, mobile (network changes), video streaming`,
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
            content: `## Why This Matters (Read This First)

APIs are the contracts between services. A well-designed REST API is intuitive, consistent, and predictable. A poorly designed one leads to confused clients, broken integrations, and security holes.

REST (Representational State Transfer) is not a standard — it is a set of architectural constraints. Most APIs are "REST-ish." The key is to make APIs that do not surprise your consumers.

---

## Resources as Nouns

URLs represent **resources** (nouns), not actions (verbs):

\`\`\`
✅ GOOD (resources):
  GET    /users          → List users
  GET    /users/:id      → Get one user
  POST   /users          → Create a user
  PUT    /users/:id      → Replace a user
  PATCH  /users/:id      → Partially update a user
  DELETE /users/:id      → Delete a user

❌ BAD (actions in URL):
  GET    /getUser?id=1
  POST   /createUser
  POST   /deleteUser?id=1
  GET    /getUserOrders?id=1  → Should be: GET /users/1/orders
\`\`\`

---

## HTTP Methods — Semantics Matter

| Method | Safe? | Idempotent? | Use Case |
|--------|-------|-------------|----------|
| GET | Yes | Yes | Read data, no side effects |
| PUT | No | Yes | Full replacement of a resource |
| DELETE | No | Yes | Remove a resource |
| POST | No | No | Create or trigger action |
| PATCH | No | No | Partial update |

**Idempotent** means calling the same request N times has the same effect as calling it once:

\`\`\`
PUT /users/1 {"name": "Alice"}  → Response: 200
PUT /users/1 {"name": "Alice"}  → Response: 200 (same result)
DELETE /users/1                 → Response: 204
DELETE /users/1                 → Response: 404 (idempotent — same effect: user doesn't exist)
POST /users {"name": "Alice"}   → Response: 201
POST /users {"name": "Alice"}   → Response: 201 (CREATES A SECOND USER — NOT idempotent)
\`\`\`

---

## Status Codes — The Right One Matters

\`\`\`
2xx Success:
  200 OK           — GET, PUT, PATCH success
  201 Created      — POST success (include Location header)
  204 No Content   — DELETE success or PUT with no body

3xx Redirection:
  301 Moved Permanently — resource has new URL
  304 Not Modified      — use cached version (ETag/If-None-Match)

4xx Client Error:
  400 Bad Request      — malformed request body
  401 Unauthorized     — missing/invalid authentication
  403 Forbidden        — authenticated but not allowed
  404 Not Found        — resource does not exist
  409 Conflict         — resource state conflict (e.g., duplicate)
  422 Unprocessable Entity — validation errors

5xx Server Error:
  500 Internal Server Error — unexpected server failure
  502 Bad Gateway           — upstream service failed
  503 Service Unavailable   — server temporarily overloaded
  504 Gateway Timeout       — upstream didn't respond in time
\`\`\`

---

## Pagination — Cursor vs Offset

### Offset-Based (Simple, Doesn't Scale)

\`\`\`http
GET /users?page=1&limit=20
→ 200 OK
   Link: <https://api.example.com/users?page=2&limit=20>; rel="next"
   Content: [...20 users...]
\`\`\`

**Problem:** \`OFFSET 100000 LIMIT 20\` in SQL still scans 100,020 rows.

### Cursor-Based (Scales to Millions)

\`\`\`http
GET /users?cursor=eyJpZCI6MTAwMH0&limit=20
→ 200 OK
   {
     "data": [...20 users...],
     "next_cursor": "eyJpZCI6MTAyMH0",
     "has_more": true
   }
\`\`\`

\`\`\`sql
-- Behind the scenes: WHERE id > :cursor ORDER BY id LIMIT 20
-- Always uses the index — O(log N) per page, not O(offset)
\`\`\`

---

## API Versioning

\`\`\`
URL path versioning (most common):
  GET /v1/users    → First version
  GET /v2/users    → Breaking changes

Header versioning:
  GET /users
  Accept-Version: 2
  Accept: application/vnd.myapi.v2+json

Query parameter (least recommended):
  GET /users?version=2
\`\`\`

The URL approach is simplest for clients — they can see the version in every request log.

---

## Practice Questions

1. **Q:** Why is \`PATCH /users/:id\` preferred over overloading \`POST\` for partial updates?
   **A:** \`PATCH\` explicitly signals "partial update" — the client sends only the fields to change. \`POST\` has no idempotency guarantees. Using \`PATCH\` allows intermediate proxies and caching layers to understand the operation semantics.

2. **Q:** Your GET endpoint returns a 500 error for a specific ID. What is the root cause likely?
   **A:** The server code is throwing an unhandled exception for that specific resource — possibly a null pointer access, division by zero, or a missing related entity. Always check error logs and add structured error responses (including a request ID for correlation).

3. **Q:** When would you use 201 Created vs 200 OK for a POST?
   **A:** Use 201 Created when the POST creates a new resource (the standard behavior). Use 200 OK when the POST processes data but does not create a new resource (e.g., a search endpoint that accepts POST to handle complex query parameters).

4. **Q:** Why does cursor-based pagination scale better than offset-based?
   **A:** Offset-based: \`LIMIT 20 OFFSET 100000\` requires the database to scan and skip 100,000 rows. Cursor-based: \`WHERE id > 100000 LIMIT 20\` uses the primary key index to jump directly to the right position — O(1) per page regardless of total dataset size.

5. **Q:** Should you return 404 or 403 when an authenticated user tries to access a resource they do not have permission to see?
   **A:** Return 404 (Not Found). This prevents information leakage — if you return 403, the attacker learns the resource EXISTS, just that they cannot access it. 404 hides the existence of the resource entirely.

---

## Summary Cheat Sheet

\`\`\`
REST API Design Rules:
─────────────────────
• Resources as nouns, not verbs
• Use correct HTTP methods (GET, POST, PUT, PATCH, DELETE)
• Use correct status codes (201, 204, 400, 401, 403, 404, 422)
• Make GET and DELETE idempotent
• Use cursor-based pagination for large datasets
• Version via URL path (/v1/, /v2/)
• Include error codes + messages in response body
• Use ETags for conditional requests (304 Not Modified)
• Always validate input — never trust the client
• Document with OpenAPI / Swagger`,
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
            content: `## Why This Matters (Read This First)

REST APIs over-fetch and under-fetch. A user profile page might need \`GET /users/:id\`, \`GET /users/:id/posts\`, \`GET /users/:id/followers\` — 3 requests, 3 round trips. GraphQL lets you get all that data in one request, shaped exactly how you need it.

But GraphQL comes with its own challenges: resolver efficiency (the N+1 problem), query cost analysis, and caching complexity.

---

## Schema — The Contract

A GraphQL schema defines what data is available and what types it has:

\`\`\`graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  followers(first: Int = 10): [User!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: DateTime!
}

type Query {
  user(id: ID!): User
  users(page: Int, limit: Int): [User!]!
  search(query: String!): [SearchResult!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

union SearchResult = User | Post
\`\`\`

Every field has a type: \`String\`, \`Int\`, \`ID\`, custom types, or **scalars** (DateTime, JSON). The \`!\` means non-nullable.

---

## Resolvers — The Implementation

Each field in the schema has a corresponding **resolver** function:

\`\`\`typescript
const resolvers = {
  Query: {
    user: async (_, { id }, { db }) => {
      return db.users.findByPk(id); // Returns one row
    },
    search: async (_, { query }, { db }) => {
      const [users, posts] = await Promise.all([
        db.users.search(query),
        db.posts.search(query),
      ]);
      return [...users, ...posts];
    },
  },
  User: {
    posts: async (user, _, { db }) => {
      // This resolver runs for EVERY User returned
      return db.posts.findAll({ where: { authorId: user.id } });
    },
  },
};
\`\`\`

---

## The N+1 Problem

When you query:

\`\`\`graphql
{
  users {
    name
    posts { title }
  }
}
\`\`\`

The naive resolver runs:
1. \`SELECT * FROM users\` (1 query)
2. For each user: \`SELECT * FROM posts WHERE authorId = ?\` (N queries)

If there are 100 users, that is 101 queries. **This is the N+1 problem.**

### Solution: DataLoader

DataLoader batches and deduplicates requests within a single request tick:

\`\`\`typescript
import DataLoader from "dataloader";

// Create a DataLoader for posts by user ID
const postLoader = new DataLoader(async (userIds: readonly number[]) => {
  const posts = await db.posts.findAll({
    where: { authorId: userIds }, // Single query!
  });
  // DataLoader expects results in the same order as userIds
  return userIds.map(id => posts.filter(p => p.authorId === id));
});

const resolvers = {
  User: {
    posts: (user, _, { postLoader }) => postLoader.load(user.id),
  },
};
\`\`\`

Now the same query runs **2 queries total** (1 for users + 1 for all posts), regardless of how many users are returned.

DataLoader also: (1) deduplicates — if Post.author is the same User referenced twice, it only loads once; (2) caches results within the request — subsequent loads hit the in-memory cache.

---

## Query Cost Analysis

Without protection, a malicious query can bring down your server:

\`\`\`graphql
# This query could resolve to billions of items:
query {
  users {
    followers {
      followers {
        followers {
          name
        }
      }
    }
  }
}
\`\`\`

Solutions: **query depth limiting**, **query cost analysis** (assign weights to fields), and **timeout**.

\`\`\`typescript
import { createComplexityRule, simpleEstimator } from "graphql-query-complexity";

const rule = createComplexityRule({
  estimators: [simpleEstimator({ defaultComplexity: 1 })],
  maximumComplexity: 1000,
  onComplete: (complexity) => console.log(\`Query complexity: \${complexity}\`),
});
\`\`\`

---

## Practice Questions

1. **Q:** How does GraphQL differ from REST in terms of versioning?
   **A:** GraphQL typically avoids versioning — you add new fields and deprecate old ones (\`@deprecated\` directive). Clients request only what they need, so old clients are unaffected by new fields. REST requires URL versioning (\`/v1/\`, \`/v2/\`) for breaking changes.

2. **Q:** What is the difference between a Query and a Mutation in GraphQL?
   **A:** Queries are side-effect-free reads — they can run in parallel. Mutations have side effects — they run sequentially in the order they are written. This guarantees predictable server state.

3. **Q:** Why does DataLoader use batched loading instead of caching?
   **A:** DataLoader's primary purpose is batching — collecting individual \`load()\` calls within a single tick and issuing one batched query. The per-request cache is a side effect that also deduplicates. DataLoader does NOT replace a persistent cache like Redis.

4. **Q:** Your GraphQL API is slow for nested queries. What tools do you use to debug?
   **A:** GraphQL response includes \`extensions\` where you can add resolver timing. Apollo Studio provides per-resolver tracing. Use \`@deprecated\` to guide clients away from expensive fields, and consider implementing **query cost analysis** to reject expensive queries.

5. **Q:** When would you NOT use GraphQL?
   **A:** (1) Simple CRUD apps where REST's over-fetching is negligible; (2) File upload APIs (GraphQL handles binary data poorly); (3) High-frequency, low-latency RPC-style calls (gRPC is better); (4) When your team is not comfortable with the complexity of resolver management and N+1 prevention.

---

## Summary Cheat Sheet

\`\`\`
GraphQL Architecture:
────────────────────
Schema → Type definitions (SDL)
Resolvers → Functions that fetch each field's data
DataLoader → Batch + deduplicate per-request

Key Concepts:
  • Query: parallel, no side effects
  • Mutation: sequential, has side effects
  • Subscription: real-time via WebSocket
  • N+1 problem: resolve with DataLoader
  • Cost analysis: prevent malicious queries
  • Persisted queries: send hash instead of full query

Tools:
  • Apollo Server / Yoga (server)
  • Apollo Client / urql (client)
  • GraphQL Code Generator (TS types from schema)
  • DataLoader (batching/dedup library)`,
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
            content: `## Why This Matters (Read This First)

For internal microservice communication, JSON over HTTP is wasteful. A simple JSON response like \`{"user": "Alice"}\` might take 20 bytes in JSON but only 4 bytes in a binary format. More importantly, HTTP/1.1 opens a new connection per request. gRPC uses **HTTP/2 multiplexing** — one connection, many concurrent calls.

gRPC is the dominant protocol for server-to-server communication at companies like Google, Netflix, and Uber.

---

## Protocol Buffers — Binary Serialization

Protobuf is a **schema language** + **binary serialization format**:

\`\`\`protobuf
syntax = "proto3";

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
}

message GetUserRequest {
  string user_id = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  repeated Post posts = 4;
}

message Post {
  string id = 1;
  string title = 2;
}
\`\`\`

Each field has a **number** (1, 2, 3) — this is the field's tag in the binary encoding. The \`repeated\` keyword means a list.

\`\`\`
JSON encoding of User: {"id":"1","name":"Alice","email":"alice@example.com"}
  → ~60 bytes (with whitespace and quotes)

Protobuf encoding of the same User:
  0A 01 31 12 05 41 6C 69 63 65 1A 11 61 6C 69 63 65 40 65 78 61 6D 70 6C 65 2E 63 6F 6D
  → ~29 bytes (50% smaller, no parsing needed)
\`\`\`

---

## gRPC Streaming Types

| Type | Client | Server | Use Case |
|------|--------|--------|----------|
| Unary | One request | One response | Standard RPC |
| Server Streaming | One request | Many responses | Watch/feed endpoints |
| Client Streaming | Many requests | One response | Upload/file processing |
| Bidirectional Streaming | Many requests | Many responses | Chat, real-time game |

\`\`\`go
// Server-side streaming: send multiple messages
func (s *userServer) ListUsers(req *pb.ListUsersRequest, stream pb.UserService_ListUsersServer) error {
    for _, user := range users {
        if err := stream.Send(user); err != nil {
            return err
        }
    }
    return nil
}

// Client-side: receive stream
stream, _ := client.ListUsers(ctx, &pb.ListUsersRequest{})
for {
    user, err := stream.Recv()
    if err == io.EOF { break }
    fmt.Println(user.Name)
}
\`\`\`

---

## When to Use gRPC (and When Not To)

**Use gRPC for:**
- Internal microservice-to-microservice communication
- Polyglot environments (one proto → code in 12+ languages)
- Low-latency, high-throughput RPC
- Streaming data pipelines

**Do NOT use gRPC for:**
- Browser-facing APIs (no native browser support — needs gRPC-Web + proxy)
- Public APIs consumed by diverse clients (REST/GraphQL is more accessible)
- Simple CRUD apps (overkill)

---

## Practice Questions

1. **Q:** Why is Protobuf more compact than JSON?
   **A:** Protobuf uses a binary encoding with varints (variable-length integers), field tags instead of field names, and no delimiters like commas or braces. JSON sends field names as strings in every message.

2. **Q:** What is a \`.proto\` file's \`syntax = "proto3"\` and how does it differ from proto2?
   **A:** proto3 removes custom default values, required/optional keywords, and extension support. It adds map types, any types, and JSON mapping. proto3 is simpler and the current standard.

3. **Q:** How does gRPC handle errors?
   **A:** gRPC uses a set of well-defined status codes (INVALID_ARGUMENT, NOT_FOUND, UNAVAILABLE, etc.) that are returned as trailing metadata with the response. All errors are structured — no HTTP status codes.

4. **Q:** Can you use gRPC from a browser?
   **A:** Not directly — browsers lack the HTTP/2 raw frame access that gRPC needs. Solutions: gRPC-Web (a proxy translates gRPC to HTTP/1.1 + base64), or Connect-Web (runs on standard HTTP).

5. **Q:** What is the difference between gRPC and a message queue (Kafka/RabbitMQ)?
   **A:** gRPC is synchronous RPC — the caller awaits a response. Kafka is asynchronous messaging — the producer sends and forgets, consumers read later. Use gRPC when you need a response; use Kafka for event-driven decoupling.

---

## Summary Cheat Sheet

\`\`\`
Protobuf → Binary encoding → smaller & faster than JSON
One .proto file → generated code in 12+ languages

Streaming Types:
  • Unary: request → response
  • Server streaming: request → response stream
  • Client streaming: request stream → response
  • Bidirectional: both streams

Pros: efficient binary, HTTP/2 multiplexing, code generation
Cons: no browser support, complex debugging (binary wire format),
     larger initial setup than REST`,
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
            content: `## Why This Matters (Read This First)

Most web applications need real-time features: chat, notifications, live dashboards, collaborative editing. The traditional approach — HTTP polling — wastes bandwidth and adds latency.

Three technologies handle real-time data: **WebSockets** (full-duplex, persistent), **SSE** (server-to-client only, simpler), and **WebRTC** (peer-to-peer, media). Choosing the right one determines your architecture's complexity, scalability, and latency.

---

## WebSocket — Full-Duplex, Persistent

WebSocket starts as an HTTP request, then **upgrades** to a persistent TCP connection:

\`\`\`http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

→ 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

After the upgrade, both client and server can send data at any time.

\`\`\`javascript
// Client
const ws = new WebSocket("wss://chat.example.com");

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "message", text: "Hello!" }));
};

ws.onmessage = (event) => {
  console.log("Received:", JSON.parse(event.data));
};

ws.onclose = () => console.log("Disconnected");
\`\`\`

### WebSocket Server (Node.js with ws)

\`\`\`javascript
const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, req) => {
  console.log("Client connected from", req.socket.remoteAddress);

  ws.on("message", (data) => {
    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on("close", () => console.log("Client disconnected"));
});
\`\`\`

---

## Server-Sent Events (SSE) — One-Way Push

SSE is **simpler** than WebSocket but **one-directional** — server pushes to client. It uses standard HTTP with a special content type:

\`\`\`javascript
// Server (Node.js)
const http = require("http");

http.createServer((req, res) => {
  if (req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    // Send an event every 2 seconds
    setInterval(() => {
      res.write(\`data: {"time": "\${new Date().toISOString()}"}\\n\\n\`);
    }, 2000);
  }
}).listen(3000);

// Client (browser)
const evtSource = new EventSource("/events");
evtSource.onmessage = (event) => {
  console.log("Server says:", JSON.parse(event.data));
};
// SSE auto-reconnects on connection loss — no code needed!
\`\`\`

---

## Comparison

| Feature | WebSocket | SSE | Long Polling |
|---------|-----------|-----|-------------|
| Direction | Bidirectional | Server → Client | Client → Server |
| Protocol | ws:// / wss:// | HTTP | HTTP |
| Auto-reconnect | Manual | Built-in | Manual |
| Browser support | Everywhere | Everywhere (except IE) | Everywhere |
| Scalability | Stateful server | Lightweight | Low (many open requests) |
| Binary data | Native | Via base64 | Via base64 |
| Use case | Chat, games | Dashboards, feeds | Fallback |

---

## WebRTC — Peer-to-Peer Media

WebRTC enables direct browser-to-browser communication for video, audio, and data — no server needed for the data flow:

\`\`\`javascript
// Peer A: create offer
const pc = new RTCPeerConnection();
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
// Send offer to Peer B via signaling server (WebSocket)

// Peer B: receive offer, create answer
const pc = new RTCPeerConnection();
await pc.setRemoteDescription(offer);
const answer = await pc.createAnswer();
await pc.setLocalDescription(answer);
// Send answer back via signaling server

// Now data flows directly P2P — server is only needed for signaling
\`\`\`

---

## Practice Questions

1. **Q:** When should you use SSE instead of WebSocket?
   **A:** When you only need server-to-client updates (dashboards, notifications, stock tickers). SSE auto-reconnects, works over standard HTTP (through enterprise proxies), and is simpler to implement.

2. **Q:** Why do WebSocket servers need sticky sessions (or a pub/sub layer) when scaling horizontally?
   **A:** A WebSocket connection is tied to the specific server instance that handled the upgrade. If the client reconnects and hits a different server, that server has no context. Use Redis Pub/Sub or a message broker to broadcast to all server instances.

3. **Q:** What is the WebSocket ping/pong mechanism?
   **A:** Either side can send a ping frame; the other must respond with a pong frame. This keeps the connection alive through proxies/NATs that time out idle connections. The \`ws\` library does this automatically with \`heartbeatInterval\`.

4. **Q:** Can WebRTC work without a signaling server?
   **A:** No. The signaling server is needed to exchange SDP offers/answers and ICE candidates. Once the connection is established, media/data flows directly P2P. The signaling server is never in the data path.

5. **Q:** What happens if a WebSocket connection drops mid-message?
   **A:** The partial message is lost. WebSocket has no built-in message acknowledgment. For reliable delivery, implement your own acknowledgment layer on top of WebSocket, or use a library like Socket.IO that adds it.

---

## Summary Cheat Sheet

\`\`\`
Real-Time Communication:
────────────────────────
WebSocket: full-duplex, persistent, low latency
  • Stateful server — sticky sessions or pub/sub for scaling
  • Raw binary or text frames
  • Manual reconnection needed

SSE (Server-Sent Events): one-way push, auto-reconnect
  • Standard HTTP — works through all proxies
  • text/event-stream content type
  • Built-in reconnection with Last-Event-ID

Long Polling: works everywhere, inefficient
  • Client holds request open until server has data
  • Server responds, client opens next request
  • High latency, many open connections

WebRTC: peer-to-peer, UDP-based
  • Video/audio/data direct between browsers
  • Requires signaling server (WebSocket + STUN/TURN)
  • ICE for NAT traversal`,
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
            content: `## Why This Matters (Read This First)

Most TypeScript backends follow one of two patterns: REST (client chooses the URL, not the data shape) or GraphQL (flexible queries, complex infrastructure). But what if you could call server functions directly from your client code, with full type safety?

**tRPC** does exactly this — it gives you end-to-end type safety without code generation or schema definition. **Hono** provides an ultra-lightweight router that runs on every runtime (Node, Deno, Bun, Cloudflare Workers). Together, they represent the new generation of API tooling.

---

## tRPC — Type-Safe RPC Without Codegen

With tRPC, your server defines procedures; the client calls them like local functions:

\`\`\`typescript
// server/router.ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const appRouter = t.router({
  // Query — for reading data (GET semantics)
  getUserById: t.procedure
    .input(z.string())
    .query(async ({ input }) => {
      const user = await db.user.findUnique({ where: { id: input } });
      return user;
    }),

  // Mutation — for writing data (POST semantics)
  createUser: t.procedure
    .input(z.object({ name: z.string(), email: z.string().email() }))
    .mutation(async ({ input }) => {
      return db.user.create({ data: input });
    }),
});

export type AppRouter = typeof appRouter;
\`\`\`

\`\`\`typescript
// client.ts
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./server/router";

const client = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "http://localhost:3000/trpc" })],
});

// Full type safety — autocomplete for procedure names and input types
const user = await client.getUserById.query("user_123");
//    ^? type: { id: string; name: string; email: string } | null

const newUser = await client.createUser.mutate({
  name: "Alice",
  email: "alice@example.com",
  // TypeScript error if you miss a required field or use wrong type
});
\`\`\`

### How tRPC Achieves End-to-End Safety

\`\`\`
Traditional REST:
  Server: define route, validate input, return JSON → NO type connection to client
  Client: manually write fetch(), manually type response → OPPORTUNITY FOR MISMATCH

tRPC:
  Server: define procedure with Zod schema → INFERRED types exported
  Client: import AppRouter type → FULL AUTOMATIC type inference
\`\`\`

---

## Hono — Universal Edge Router

Hono is a ~14KB router that runs everywhere:

\`\`\`typescript
import { Hono } from "hono";

const app = new Hono();

app.use("*", async (c, next) => {
  console.log(\`\${c.req.method} \${c.req.url}\`);
  await next();
});

app.get("/api/users/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id, name: "Alice" });
});

// Runs on: Node, Deno, Bun, Cloudflare Workers, Lambda@Edge
export default app;

// Cloudflare Workers: just export the app
// Node: serve(app)
// Bun: export default app
\`\`\`

### Hono + Zod for OpenAPI

\`\`\`typescript
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

app.post("/api/users", zValidator("json", schema), (c) => {
  const { name, email } = c.req.valid("json");
  return c.json({ created: true });
});

// Install @hono/swagger-ui to auto-generate OpenAPI docs
\`\`\`

---

## tRPC vs Hono — When to Use Which

| Aspect | tRPC | Hono |
|--------|------|------|
| Type safety | End-to-end (server → client types) | Standard TypeScript |
| Use case | Full-stack TypeScript monorepo | Any API, edge functions |
| Client lib | @trpc/client | fetch() or any client |
| Multi-runtime | Node only (adapters exist) | Node, Deno, Bun, Workers |
| OpenAPI | Not native | Via @hono/zod-openapi |

---

## Practice Questions

1. **Q:** How does tRPC handle authentication?
   **A:** tRPC provides middleware that runs before procedures. You extract the user from the request context in middleware, then throw TRPCError if unauthorized. The authenticated user object is available in every procedure's context.

2. **Q:** Can tRPC work with React Server Components?
   **Q:** Yes. tRPC v11 supports React Server Components — you can call server procedures directly in Server Components without an API call. The same type safety applies.

3. **Q:** Why is Hono only 14KB when Express.js is ~200KB?
   **A:** Hono is built from scratch for edge runtimes — no Node.js-specific APIs (no fs, no net), minimal abstractions, and tree-shakable middleware. Express carries decades of backward compatibility.

4. **Q:** How does tRPC batch requests?
   **A:** The \`httpBatchLink\` in @trpc/client collects all procedure calls within a single tick and sends them as one HTTP POST request. The server processes them and returns an array of results. This reduces HTTP overhead significantly.

5. **Q:** When would you use Hono over Express?
   **A:** When deploying to edge runtimes (Cloudflare Workers, Deno Deploy, Lambda@Edge), when you need the smallest possible bundle size, or when you want a modern middleware pattern with TypeScript-native design.

---

## Summary Cheat Sheet

\`\`\`
tRPC:
  • Server: router → procedures (query/mutation) → Zod input validation
  • Client: createTRPCClient<AppRouter> → full type safety
  • No codegen — types inferred from server implementation
  • Built-in request batching (httpBatchLink)

Hono:
  • 14KB, universal (Node/Deno/Bun/Workers)
  • Built-in JWT, CORS, compression middleware
  • Zod validation via @hono/zod-validator
  • OpenAPI generation via @hono/swagger-ui

Choose tRPC for: full-stack TypeScript monorepos
Choose Hono for: edge APIs, multi-runtime, API gateways`,
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
            content: `## Why This Matters (Read This First)

As your backend grows from one service to dozens, you need a single entry point that handles authentication, rate limiting, routing, and transformation. This is the **API Gateway** — the front door to your entire system.

A good gateway simplifies client code (one URL to know) and centralizes cross-cutting concerns. A bad gateway becomes a bottleneck and a single point of failure.

---

## What an API Gateway Does

\`\`\`
                   ┌──────────────┐
Client ──→        │              │──→ User Service
                   │  API Gateway  │──→ Order Service
Client ──→        │  (Kong/Envoy) │──→ Payment Service
                   │              │──→ Analytics (fire-and-forget)
                   └──────────────┘
\`\`\`

**Core responsibilities:**
1. **Authentication** — validate JWT, OAuth tokens before traffic reaches services
2. **Rate limiting** — prevent abuse with per-client or per-IP limits
3. **Request transformation** — inject headers, rewrite paths, validate schemas
4. **Routing** — path-based or header-based routing to backend services
5. **Caching** — cache responses for GET endpoints
6. **Canary routing** — route X% of traffic to a new version
7. **Analytics** — log request metrics per route and per client

---

## Kong — The Open-Source Standard

Kong uses a plugin architecture — every feature is a plugin:

\`\`\`yaml
# Kong declarative config (kong.yml)
_format_version: "3.0"
services:
  - name: user-service
    url: http://user-svc:3000
    routes:
      - name: user-route
        paths:
          - /api/users
    plugins:
      - name: jwt
        config:
          secret: "${JWT_SECRET}"
      - name: rate-limiting
        config:
          minute: 100
          policy: local
      - name: cors
        config:
          origins:
            - "https://myapp.com"
\`\`\`

---

## Rate Limiting Strategies

| Strategy | How It Works | Best For |
|----------|-------------|----------|
| Token Bucket | Tokens refill at a fixed rate, burst allowed | APIs with bursty traffic |
| Sliding Window | Counts requests in the last N seconds | Fair distribution |
| Concurrency | Limits parallel in-flight requests | Long-running requests |
| Fixed Window | Resets counter at the end of window | Simple, but allows spikes at window boundaries |

\`\`\`javascript
// Token bucket algorithm (simplified)
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens per second
    this.lastRefill = Date.now();
  }

  tryConsume(count = 1) {
    this._refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true; // allowed
    }
    return false; // rate limited
  }

  _refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity,
      this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}
\`\`\`

---

## Gateway vs Service Mesh

These two are complementary, not competing:

| Aspect | API Gateway | Service Mesh |
|--------|-------------|--------------|
| Traffic direction | North-south (external → service) | East-west (service → service) |
| Location | Edge of the network | Sidecar alongside each service |
| Examples | Kong, AWS API Gateway, Cloudflare | Istio, Linkerd, Consul Connect |
| Features | Auth, rate limit, caching | mTLS, retries, circuit breaking, telemetry |

\`\`\`
                    ┌─── Service Mesh (east-west) ───┐
                    │   mTLS between every service    │
                    │                                 │
API Gateway         │  ┌──────┐    ┌──────┐          │
(north-south)──→    │  │ Svc A│←──→│ Svc B│          │
External clients    │  └──────┘    └──────┘          │
                    │      ↕           ↕              │
                    │  ┌──────┐    ┌──────┐          │
                    │  │ Svc C│←──→│ Svc D│          │
                    │  └──────┘    └──────┘          │
                    └────────────────────────────────┘
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between a reverse proxy and an API gateway?
   **A:** A reverse proxy (Nginx, HAProxy) handles TLS termination, routing, and buffering. An API gateway adds higher-level features: authentication, rate limiting, request transformation, API key management, and analytics. Kong and Envoy can act as both.

2. **Q:** Your gateway rate-limits by client IP. What happens when multiple users share the same NAT IP (corporate office)?
   **A:** They all share the same rate limit bucket. Fix: use API keys or JWT claims (tenant ID) as the rate limit key instead of IP address. Use a combination of IP + API key for defense in depth.

3. **Q:** How does a gateway handle backend service failures?
   **A:** With circuit breaker pattern — after N consecutive failures, the gateway stops routing to that backend for a timeout period. With health checks — the gateway removes unhealthy backends from the pool.

4. **Q:** When should you NOT use an API gateway?
   **A:** For simple services with 1-2 backends and no auth/rate limiting needs. Also, if your latency budget is extremely tight (<5ms), the gateway hop adds unavoidable overhead (typically 1-5ms).

5. **Q:** How does AWS API Gateway differ from Kong?
   **A:** AWS API Gateway is fully managed — no infrastructure to operate, automatic scaling, integrated with IAM and WAF. Kong is self-hosted or SaaS — more plugin options, runs on any cloud, but requires operational expertise.

---

## Summary Cheat Sheet

\`\`\`
API Gateway Responsibilities:
  • Authentication (JWT, OAuth, API keys)
  • Rate limiting (token bucket, sliding window)
  • Request/response transformation
  • Routing (path, header, weight-based)
  • Caching
  • Analytics and logging
  • Canary / blue-green routing

Popular Gateways:
  • Kong: plugin-based, Postgres-backed, 200+ plugins
  • AWS API Gateway: managed, Lambda integration
  • Envoy: high-performance, L7, used in service mesh
  • Cloudflare API Gateway: edge-native, near-zero latency

Gateway ≠ Service Mesh:
  • Gateway: north-south (external → service)
  • Mesh: east-west (service → service)
  • Use BOTH in production`,
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
            content: `## Why This Matters (Read This First)

When your app has 1,000 users, every query is fast. When it has 1,000,000 users, unindexed queries can take seconds. Understanding how databases index data is the difference between a responsive app and one that falls over under load.

B-Tree indexes power PostgreSQL, MySQL, and SQLite. LSM-Tree indexes power Cassandra, RocksDB, and LevelDB. Choosing the right index type for your workload is a core database design skill.

---

## B-Tree — The Universal Index

A B-Tree is a **balanced self-sorting tree** that maintains sorted data for efficient insertions, deletions, and lookups.

\`\`\`
                  [50]
                /      \
            [20, 30]    [70, 80]
           /    |    \   |   \
          /     |     \  |    \
[10,15] [22,25] [35,40] [60] [75,78]
\`\`\`

### B+Tree — What Databases Actually Use

B+Tree is a variant where **all data is in the leaf nodes**, and internal nodes only contain keys (pointers). Leaf nodes are linked for efficient range scans.

\`\`\`
B+Tree layout:
        Internal nodes (routing only):
              [50, 100]
             /    |     \
            /     |      \
    Leaf nodes (data + next pointer):
    [10,20,30] → [40,50,60] → [70,80,90] → ...
     ↑ sorted    ↑ linked     ↑ for range queries
\`\`\`

\`\`\`sql
-- PostgreSQL creates a B+Tree index by default
CREATE INDEX idx_users_email ON users (email);

-- This query uses the B+Tree → O(log N)
SELECT * FROM users WHERE email = 'alice@example.com';

-- Range query uses the linked leaf nodes → also O(log N) + sequential scan
SELECT * FROM users WHERE email > 'a@' AND email < 'b@';
\`\`\`

### When B-Tree Excels

- **Point lookups**: \`WHERE id = 42\` — O(log N) with ~3-4 page reads for 1M rows
- **Range scans**: \`WHERE date > '2024-01-01'\` — sequential scan of linked leaf nodes
- **ORDER BY**: tree is already sorted — no separate sort step needed

### B-Tree Weaknesses

- **Random writes**: inserting a row in the middle may cause page splits (expensive)
- **Write amplification**: each write may touch multiple pages

---

## LSM-Tree — Write-Optimized

Log-Structured Merge Trees optimize for **write-heavy** workloads. They are used by Cassandra, RocksDB, LevelDB, and ScyllaDB.

\`\`\`
┌────────────────────────────────────────────────────┐
│ MemTable (in-memory, sorted)                       │
│ [10, 20, 30, 40]                                   │
└────────────────────┬───────────────────────────────┘
                     │ Flush when full
                     ▼
┌────────────────────────────────────────────────────┐
│ SSTable 0 (on disk, sorted, immutable)             │
│ [5, 10, 15, 20]                                    │
├────────────────────────────────────────────────────┤
│ SSTable 1                                          │
│ [1, 12, 25, 30]                                    │
├────────────────────────────────────────────────────┤
│ SSTable 2                                          │
│ [2, 8, 18, 35]                                     │
└────────────────────────────────────────────────────┘
                     │ Compaction (background merge)
                     ▼
┌────────────────────────────────────────────────────┐
│ SSTable (merged)                                   │
│ [1, 2, 5, 8, 10, 12, 15, 18, 20, 25, 30, 35]     │
└────────────────────────────────────────────────────┘
\`\`\`

### How LSM-Tree Writes Work

1. **All writes go to MemTable** (in-memory sorted data structure) — this is fast!
2. When the MemTable is full, it is flushed to disk as an **SSTable** (immutable, sorted)
3. **Reads** check MemTable first, then SSTables from newest to oldest
4. **Compaction** merges SSTables in the background to reclaim space and speed reads

\`\`\`sql
-- Cassandra INSERT is actually an append — no in-place update
INSERT INTO users (id, name, email) VALUES (1, 'Alice', 'alice@example.com');
-- This write goes to the MemTable immediately → extremely fast
-- The old version of the row (if any) is not touched until compaction
\`\`\`

### LSM-Tree vs B-Tree

| Aspect | B+Tree | LSM-Tree |
|--------|--------|----------|
| Write throughput | Moderate (page splits) | High (append-only) |
| Read throughput | High (single structure) | Moderate (check multiple SSTables) |
| Space amplification | Low | High (multiple copies) |
| Write amplification | Moderate | High (compaction) |
| Typical use | PostgreSQL, MySQL | Cassandra, RocksDB, LevelDB |

---

## Index Types

| Type | Description | Best For |
|------|-------------|----------|
| Primary (clustered) | Table data sorted by primary key | Point lookups by PK |
| Secondary | Separate structure pointing to rows | Queries by non-PK columns |
| Composite | Index on multiple columns | Queries filtering by all columns |
| Partial | Index on a subset of rows (\`WHERE status = 'active'\`) | Filtered queries |
| Covering | Includes all columns needed by the query | Index-only scans (no table access) |
| Full-text | Tokenized text search | \`LIKE '%word%'\` or text search |
| GiST/GIN | PostgreSQL generalized search | JSONB, arrays, geospatial |

\`\`\`sql
-- Partial index: only index active users
CREATE INDEX idx_active_users ON users (email)
  WHERE status = 'active';

-- Covering index: query never touches the table
CREATE INDEX idx_user_cover ON users (email) INCLUDE (name, avatar_url);
SELECT email, name, avatar_url FROM users WHERE email = 'alice@example.com';
-- This reads ONLY the index — no table heap access!
\`\`\`

---

## Practice Questions

1. **Q:** Why does a B+Tree index use linked leaves?
   **A:** For efficient range scans (\`WHERE age BETWEEN 20 AND 30\`). Once the start of the range is found via the tree (O(log N)), the linked leaves allow sequential traversal — no need to navigate the tree again for each row.

2. **Q:** Cassandra uses LSM-Trees. Why are writes so fast but reads slower than PostgreSQL?
   **A:** Writes go to an in-memory MemTable (no disk seek). Reads must check the MemTable, then multiple SSTables (newest first). If an SSTable is large, reads may need to search several files. Compaction helps by merging SSTables.

3. **Q:** What happens when a B+Tree page is full and you insert a new row?
   **A:** The page **splits** — half the entries move to a new page, and a new entry is added to the parent page. This can cascade up the tree. Page splits are expensive and cause write amplification.

4. **Q:** When would you use a partial index over a full index?
   **A:** When you always query with a specific WHERE condition. For example, if \`WHERE status = 'active'\` appears in 90% of queries, indexing only active rows makes the index smaller and faster.

5. **Q:** What is an index-only scan and why is it fast?
   **A:** When all columns needed by a query are in the index itself (not the table), PostgreSQL never reads the table. This is called an index-only scan and is 2-5x faster than a regular index scan.

---

## Summary Cheat Sheet

\`\`\`
B+Tree (PostgreSQL, MySQL):
  • Balanced tree, all data in linked leaf nodes
  • O(log N) reads, moderate writes
  • Great for: point lookups, range scans, ORDER BY

LSM-Tree (Cassandra, RocksDB):
  • Append-only writes to MemTable → flushed to SSTables
  • Background compaction merges SSTables
  • Great for: write-heavy workloads
  • Bad for: point reads (check multiple structures)

Index Types:
  Primary (clustered) → table data in PK order
  Secondary → separate B+Tree pointing to heap
  Composite → (col1, col2, col3) — leftmost prefix rule
  Partial → WHERE clause restricts indexed rows
  Covering → INCLUDE extra columns for index-only scans`,
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
            content: `## Why This Matters (Read This First)

Databases lie about consistency. The default isolation level (Read Committed in PostgreSQL, Read Committed in most databases) allows many anomalies. If you write banking software, booking systems, or inventory management, you must understand what **Serializable** actually means — and why you probably accept Read Committed.

This article explains ACID properties, the four isolation levels, the anomalies they prevent, and how **MVCC** (Multi-Version Concurrency Control) makes concurrent reads efficient.

---

## ACID — The Four Guarantees

| Property | What It Means | Violation Example |
|----------|--------------|-------------------|
| **Atomicity** | All-or-nothing execution | Partial debit — money removed from account A but not added to account B |
| **Consistency** | Data obeys all rules (constraints, triggers) | Invalid state after transaction |
| **Isolation** | Concurrent transactions don't interfere | Reading uncommitted data |
| **Durability** | Committed data survives crashes | Data lost after power failure |

---

## Isolation Levels and Anomalies

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Write Skew |
|-------|-----------|---------------------|--------------|------------|
| Read Uncommitted | Possible | Possible | Possible | Possible |
| Read Committed | Prevented | Possible | Possible | Possible |
| Repeatable Read | Prevented | Prevented | Possible (PG: prevented) | Possible |
| Serializable | Prevented | Prevented | Prevented | Prevented |

### Dirty Read — Reading Uncommitted Data

\`\`\`sql
-- Transaction A                    Transaction B
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
                                    SELECT balance FROM accounts WHERE id = 1;
                                    -- Reads 900 (uncommitted!)
ROLLBACK;                           -- A's change is rolled back
                                    -- B read 900 that never actually existed
\`\`\`

### Non-Repeatable Read — Same Row, Different Values

\`\`\`sql
-- Transaction A                    Transaction B
SELECT balance FROM accounts WHERE id = 1;
-- Returns 1000
                                    UPDATE accounts SET balance = 500 WHERE id = 1;
                                    COMMIT;
SELECT balance FROM accounts WHERE id = 1;
-- Returns 500 (different from first read!)
\`\`\`

### Phantom Read — New Rows Appear

\`\`\`sql
-- Transaction A                    Transaction B
SELECT COUNT(*) FROM orders WHERE amount > 100;
-- Returns 5
                                    INSERT INTO orders (amount) VALUES (200);
                                    COMMIT;
SELECT COUNT(*) FROM orders WHERE amount > 100;
-- Returns 6 (a phantom appeared!)
\`\`\`

### Write Skew — Two Transactions Write to Different Rows, Breaking a Constraint

\`\`\`sql
-- Rule: at least one doctor must be on call
-- Both doctors try to go off call simultaneously

-- Transaction A (Doctor Alice)      Transaction B (Doctor Bob)
UPDATE doctors SET on_call = false  UPDATE doctors SET on_call = false
WHERE name = 'Alice';              WHERE name = 'Bob';
COMMIT;                             COMMIT;
-- Now zero doctors on call — constraint violated
\`\`\`

Write skew is not prevented by Read Committed or Repeatable Read. Only **Serializable** prevents it.

---

## MVCC — Multi-Version Concurrency Control

PostgreSQL, Oracle, MySQL (InnoDB), and SQL Server (snapshot isolation) use MVCC to allow **readers never block writers**:

\`\`\`
┌──────────────────────────────────────────────┐
│  Row "balance = 1000"                         │
│                                               │
│  Version 1 (created by T1): balance = 1000    │
│    → visible to transactions started before T2 │
│                                               │
│  Version 2 (created by T2): balance = 900     │
│    → visible to transactions started after T2  │
│                                               │
│  T3 (started before T2) still sees version 1  │
│  T4 (started after T2) sees version 2         │
└──────────────────────────────────────────────┘
\`\`\`

\`\`\`sql
-- In PostgreSQL (Read Committed):
-- T1: BEGIN;
-- T1: UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- T2 (concurrent): SELECT balance FROM accounts WHERE id = 1;
-- T2 sees the OLD balance (1000) — transaction T1's uncommitted change is invisible
-- T1: COMMIT;
-- T2: SELECT balance FROM accounts WHERE id = 1;
-- T2 sees the NEW balance (900) — T1 is committed
\`\`\`

---

## WAL — Write-Ahead Log

Before any change is applied to the actual database pages, it is written to the **WAL** (Write-Ahead Log). This enables crash recovery:

\`\`\`
1. Transaction starts
2. Changes written to WAL (on disk)
3. ⚡ Power failure
4. On restart, database reads WAL
5. Committed changes are replayed (REDO)
6. Uncommitted changes are rolled back (UNDO)

WAL fsync is the critical performance bottleneck — every COMMIT must fsync the WAL.
\`\`\`

---

## Practice Questions

1. **Q:** In PostgreSQL's Repeatable Read, are phantom reads possible?
   **A:** No. PostgreSQL implements Repeatable Read using Snapshot Isolation — every statement in the transaction sees a snapshot of committed data taken at the first statement. Phantom reads are not possible because the snapshot is fixed.

2. **Q:** What is the difference between optimistic and pessimistic locking?
   **A:** Pessimistic locking (\`SELECT ... FOR UPDATE\`) locks rows upfront — prevents conflicts but reduces concurrency. Optimistic locking assumes no conflict and checks at commit time (version column) — higher concurrency but needs retry logic.

3. **Q:** Why does increasing isolation level usually reduce database performance?
   **A:** Higher isolation requires more locking (or more aggressive MVCC snapshot management). Serializable may need actual lock waits or abort transactions with conflicts. Read Uncommitted has no locking overhead but allows anomalies.

4. **Q:** How do you choose the right isolation level?
   **A:** Read Committed is the default for most apps — it prevents dirty reads. Use Repeatable Read for financial transactions where you read data twice. Use Serializable for critical constraints (doctor on-call example) where write skew is possible.

5. **Q:** What happens to MVCC versions that are no longer visible to any active transaction?
   **A:** PostgreSQL's **VACUUM** process cleans up dead tuple versions. Without VACUUM, the table grows indefinitely (bloat). Autovacuum runs automatically but can fall behind under heavy write load.

---

## Summary Cheat Sheet

\`\`\`
ACID:
  Atomicity: all-or-nothing (WAL-based rollback)
  Consistency: data obeys all rules
  Isolation: transactions don't interfere (MVCC)
  Durability: committed data survives (WAL fsync)

Anomalies by Isolation Level:
  Read Uncommitted → dirty read, non-repeatable read, phantom, write skew
  Read Committed   → non-repeatable read, phantom, write skew
  Repeatable Read  → write skew (PG also prevents phantom)
  Serializable     → none

MVCC:
  • Each row has multiple versions
  • Readers see a snapshot — never block writers
  • Writers don't block readers (in PostgreSQL)
  • Old versions cleaned by VACUUM

WAL:
  • Changes written to log BEFORE data pages
  • fsync on commit — the main write latency bottleneck
  • Enables crash recovery (REDO + UNDO)`,
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
            content: `## Why This Matters (Read This First)

You write a query: \`SELECT * FROM users WHERE email = 'alice@example.com'\`. The database returns the result. But between your query and the result, the **query planner** made dozens of decisions: which index to use, which join algorithm to pick, whether to sort or use a hash.

Understanding how the planner works — and how to read its output — is the difference between writing queries that work and writing queries that work fast on millions of rows.

---

## How the Planner Works

The planner converts your SQL into a **physical execution plan**:

\`\`\`
SQL query:
  SELECT u.name, o.total
  FROM users u
  JOIN orders o ON u.id = o.user_id
  WHERE u.email = 'alice@example.com'

Logical plan:
  Projection [u.name, o.total]
    └── Join (condition: u.id = o.user_id)
          ├── Scan users (filter: email = 'alice@example.com')
          └── Scan orders

Physical plan (planner's choice):
  Projection [u.name, o.total]
    └── Nested Loop Join
          ├── Index Scan: users (idx_users_email)
          │     → finds 1 user row
          └── Index Scan: orders (idx_orders_user_id)
                → finds matching orders for that user
\`\`\`

---

## EXPLAIN and EXPLAIN ANALYZE

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.email = 'alice@example.com';
\`\`\`

Output:

\`\`\`
Nested Loop  (cost=8.30..12.34 rows=5 width=36)
  (actual time=0.12..0.18 rows=3 loops=1)
  Buffers: shared hit=4
  → Index Scan using idx_users_email on users u
      (cost=0.28..8.29 rows=1 width=17)
      (actual time=0.05..0.06 rows=1 loops=1)
      Index Cond: (email = 'alice@example.com')
      Buffers: shared hit=2
  → Index Scan using idx_orders_user_id on orders o
      (cost=0.28..4.05 rows=1 width=19)
      (actual time=0.06..0.07 rows=3 loops=1)
      Index Cond: (user_id = u.id)
      Buffers: shared hit=2
\`\`\`

**Reading the output:**
- \`cost=8.30..12.34\` — estimated cost (arbitrary units, first number = startup, second = total)
- \`actual time=0.12..0.18\` — actual time in milliseconds
- \`rows=3\` — actual rows returned
- \`loops=1\` — how many times this node was executed
- \`shared hit=4\` — 4 pages read from PostgreSQL's shared buffer (cache hit — fast!)

---

## Join Algorithms

| Algorithm | When It's Used | Complexity |
|-----------|---------------|------------|
| **Nested Loop** | One table is small (~1 row) | O(N × M) — but with index, O(N log M) |
| **Hash Join** | No index, one table fits in memory | O(N + M) — build hash table, probe |
| **Merge Join** | Both tables sorted on join key | O(N + M) — merge two sorted lists |

\`\`\`sql
-- Forces a hash join (if no index)
SET enable_nestloop = off;
EXPLAIN (ANALYZE)
SELECT * FROM big_table b JOIN small_table s ON b.id = s.id;
-- → Hash Join
--   Hash Cond: (s.id = b.id)
--   → Seq Scan on small_table s
--   → Hash
--       → Seq Scan on big_table b
\`\`\`

---

## Common Query Performance Issues

### Index Not Used

\`\`\`sql
-- BAD: Function on column prevents index usage
SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';

-- FIX 1: Index on expression
CREATE INDEX idx_users_email_lower ON users (LOWER(email));

-- FIX 2: Store lowercase in a separate column
-- FIX 3: Use case-insensitive collation (PostgreSQL 15+)
\`\`\`

### Wrong Join Type

\`\`\`sql
-- If the planner mis-estimates row counts, it picks the wrong join
-- Fix: UPDATE STATISTICS or ANALYZE to refresh table statistics
VACUUM ANALYZE users;
\`\`\`

---

## Practice Questions

1. **Q:** What does \`cost=0.28..8.29\` mean in PostgreSQL's EXPLAIN output?
   **A:** The first number (0.28) is the startup cost — cost to return the first row. The second (8.29) is the total cost to return all rows. These are arbitrary cost units based on I/O, CPU, and row count estimates.

2. **Q:** Why does the planner sometimes choose a sequential scan when an index exists?
   **A:** If the table is small (fits in a few pages), a sequential scan is faster than reading the index + table. The planner estimates that reading 100% of a 4-page table via index (random I/O) costs more than scanning 4 pages sequentially.

3. **Q:** What makes the planner's estimate wrong?
   **A:** Stale statistics (not running ANALYZE), correlated columns (city and zip code are correlated but the planner assumes independence), or lack of statistics for expression indexes.

4. **Q:** How does a database execute \`ORDER BY ... LIMIT 10\` efficiently?
   **A:** If the ORDER BY column is indexed, the database scans the index in order and stops after 10 rows (top-N sort). Without an index, it must sort the entire result set and then take 10 rows.

5. **Q:** What is the difference between \`EXPLAIN\` and \`EXPLAIN ANALYZE\`?
   **A:** \`EXPLAIN\` shows the estimated plan only — it does not execute the query. \`EXPLAIN ANALYZE\` actually executes the query and shows actual times and row counts. NEVER run EXPLAIN ANALYZE on a production database for write queries — it will actually write data.

---

## Summary Cheat Sheet

\`\`\`
Query Planner:
  SQL → Logical Plan → Physical Plan → Execution

EXPLAIN output:
  cost = (startup..total) — arbitrary units
  actual time = (startup..total) — ms (ANALYZE only)
  rows = estimated (or actual with ANALYZE)
  loops = times this node ran
  Buffers: shared hit = cache, shared read = disk

Join Algorithms:
  Nested Loop: O(N×M) — good when one side is small
  Hash Join: O(N+M) — good for large, unsorted data
  Merge Join: O(N+M) — good for already-sorted data

Performance Tips:
  • ANALYZE regularly for accurate statistics
  • No functions on indexed columns in WHERE
  • Use covering indexes for index-only scans
  • VACUUM to prevent table bloat (PostgreSQL)
  • Monitor slow queries with pg_stat_statements`,
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
            content: `## Why This Matters (Read This First)

Relational databases (PostgreSQL, MySQL) are great for structured data with relationships and strict consistency. But they struggle with: flexible schemas, horizontal scaling, high write throughput, and large-scale time-series data.

NoSQL databases trade away relational guarantees (joins, ACID transactions, strict schemas) for scalability and flexibility. There are 4 main categories, each optimized for different access patterns.

---

## Document Stores (MongoDB)

Store data as **JSON-like documents** — no schema enforcement, nested data is natural.

\`\`\`javascript
// MongoDB document — each document can have different fields
{
  _id: ObjectId("..."),
  name: "Alice",
  email: "alice@example.com",
  address: { city: "NYC", zip: "10001" },  // nested
  tags: ["premium", "vip"],                  // array
  metadata: { lastLogin: ISODate("...") }    // mixed types
}
\`\`\`

\`\`\`javascript
// MongoDB query
db.users.find({ "address.city": "NYC", tags: "premium" })
  .sort({ name: 1 })
  .limit(20);

// MongoDB aggregation pipeline (like a query pipeline)
db.orders.aggregate([
  { $match: { status: "shipped" } },
  { $group: { _id: "$customer_id", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } },
  { $limit: 10 },
]);
\`\`\`

**Best for:** Content management, catalogs, user profiles (nested, evolving data)
**Avoid when:** Many relations between entities, need multi-object ACID transactions

---

## Key-Value Stores (Redis)

Simple \`{key: value}\` — O(1) lookups, no queries, no relations.

\`\`\`bash
# Redis CLI
SET session:abc123 '{"userId": 42, "expires": 1700000000}'
GET session:abc123
EXPIRE session:abc123 3600  # auto-expire after 1 hour

# Data structures
LPUSH queue:notifications "user_42"
BRPOP queue:notifications 0  # blocking pop — wait for messages

SADD online_users "alice"
SISMEMBER online_users "alice"  # check membership

ZADD leaderboard 1000 "player1"  # sorted set
ZREVRANGE leaderboard 0 9        # top 10
\`\`\`

**Best for:** Caching, sessions, real-time counters, pub/sub, distributed locks
**Avoid when:** Complex queries, relations, or data larger than available RAM

---

## Wide-Column Stores (Cassandra)

Data is stored in rows, but each row can have different columns. The **partition key** determines which node stores the data — critical for scalability.

\`\`\`sql
-- Cassandra CQL: looks like SQL but behavior is very different
CREATE TABLE events (
  user_id UUID,
  timestamp TIMESTAMP,
  event_type TEXT,
  payload TEXT,
  PRIMARY KEY ((user_id), timestamp)  -- partition key = user_id, clustering = timestamp
) WITH CLUSTERING ORDER BY (timestamp DESC);

-- This query is fast — it hits ONE partition
SELECT * FROM events WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100;

-- This query is SLOW — it needs to SCATTER-GATHER across ALL partitions
SELECT * FROM events WHERE event_type = 'click';  -- 🚫 No partition key!
\`\`\`

**Best for:** Time-series data, IoT sensor data, event logging, anything write-heavy
**Avoid when:** You need joins, secondary indexes on high-cardinality columns, ad-hoc queries

---

## Graph Databases (Neo4j)

Relationships are first-class citizens — each edge is stored natively with its own properties and direction.

\`\`\`cypher
// Neo4j Cypher query
CREATE (alice:User {name: "Alice"})
CREATE (bob:User {name: "Bob"})
CREATE (alice)-[:FOLLOWS {since: 2024}]->(bob)

// Find who Alice follows, who follows them back
MATCH (alice:User {name: "Alice"})-[:FOLLOWS]->(followed)<-[:FOLLOWS]-(mutual:User)
RETURN mutual.name
\`\`\`

**Best for:** Social networks, fraud detection, recommendation engines, dependency graphs
**Avoid when:** Simple CRUD, single-entity workloads

---

## Choosing the Right NoSQL Store

| Access Pattern | Best Choice | Why |
|---------------|-------------|-----|
| Nested, evolving documents | MongoDB | Flexible schema, nested queries |
| Simple O(1) lookups | Redis | In-memory, microsecond latency |
| Time-series writes | Cassandra | Partition key = node, no contention |
| Relationship-heavy queries | Neo4j | Native edge storage — 1000x faster than SQL joins on deep graphs |
| Full-text search | Elasticsearch | Inverted index, relevance scoring |

---

## Practice Questions

1. **Q:** Why does MongoDB recommend embedding related data instead of referencing it?
   **A:** MongoDB does not support joins. Embedding (nested documents within a document) allows fetching all related data in one query. Referencing requires multiple queries (or $lookup aggregation, which is slow).

2. **Q:** Cassandra requires you to specify the partition key in every query. Why?
   **A:** Cassandra distributes data across nodes by hashing the partition key. Without specifying the partition key, the query must contact all nodes (scatter-gather). This is inefficient and can overwhelm the cluster.

3. **Q:** How does Redis handle data that doesn't fit in RAM?
   **A:** It doesn't. Redis is an in-memory database — all data must fit in RAM. If it doesn't, configure eviction policies (LFU, LRU) or use Redis Cluster to distribute data across multiple machines.

4. **Q:** When would you use PostgreSQL's JSONB instead of MongoDB?
   **A:** When you need both flexible JSON documents AND relational features (joins, ACID transactions, foreign keys). PostgreSQL's JSONB supports indexing for JSON fields while maintaining full SQL capabilities.

5. **Q:** What is the CAP trade-off for each NoSQL category?
   **A:** MongoDB (CP — prefers consistency over availability during partitions), Cassandra (AP — always available, eventual consistency), Redis (CP — single-threaded, strong consistency within a node; AP with Cluster mode).

---

## Summary Cheat Sheet

\`\`\`
NoSQL Categories:
─────────────────
Document (MongoDB)
  • Schema-flexible JSON documents
  • Embed related data, don't join
  • Great for: catalogs, profiles, content

Key-Value (Redis)
  • O(1) operations, in-memory
  • Data structures: String, Hash, List, Set, Sorted Set
  • Great for: cache, session, real-time

Wide-Column (Cassandra)
  • Partition key → data distribution
  • Must query by partition key
  • Great for: time-series, IoT, event logs

Graph (Neo4j)
  • Native relationship storage
  • Deep traversal queries
  • Great for: social, fraud, recommendations`,
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
            content: `## Why This Matters (Read This First)

When your database is in one data center and users are on the other side of the world, network latency adds 100-300ms to every query. When you have 1M simultaneous users, a single PostgreSQL instance cannot handle the load.

Distributed databases solve these problems, but they force trade-offs. The **CAP theorem** states you cannot have all three of: Consistency, Availability, and Partition Tolerance. Understanding this trade-off is essential for designing distributed systems.

But CAP is also over-simplified. **PACELC** provides a more nuanced model.

---

## CAP Theorem Explained

**CAP says:** A distributed data store can provide at most 2 of 3 guarantees:

| Guarantee | What It Means |
|-----------|---------------|
| **C**onsistency | Every read returns the most recent write |
| **A**vailability | Every request gets a (non-error) response |
| **P**artition tolerance | The system works despite network failures |

\`\`\`
CP (Consistency + Partition)         AP (Availability + Partition)
    ┌────┐          ┌────┐                ┌────┐          ┌────┐
    │Node│←──⛔──→│Node│                │Node│←──⛔──→│Node│
    │ A  │ network │ B  │                │ A  │ network │ B  │
    └────┘ failure └────┘                └────┘ failure └────┘
    B refuses reads                     B accepts reads
    until synchronized                  with stale data
    (Consistency)                       (Available but stale)

Examples:                             Examples:
  MongoDB (default)                     Cassandra
  PostgreSQL (sync repl)                DynamoDB (default)
  etcd, Zookeeper                       Riak
\`\`\`

### Key Insight: Partition Tolerance Is Mandatory

In real-world networks, partitions (network failures) WILL happen. You cannot opt out of partition tolerance. So the real choice is:

**CP (Consistency over Availability):** When a network partition occurs, the system stops accepting writes/reads on the minority side. You get consistency but partial unavailability.

**AP (Availability over Consistency):** When a network partition occurs, both sides accept writes. When the partition heals, data is merged. You get availability but potentially stale reads (eventual consistency).

---

## PACELC — The Better Model

PACELC adds the **partition-free case** to the trade-off:

**P**artition → choose **A**vailability or **C**onsistency
**E**lse (no partition) → choose **L**atency or **C**onsistency

\`\`\`
     Is there a partition?
          /        \
        YES         NO
       /              \
   Choose:           Choose:
  A or C?           L or C?

  DynamoDB: AP      DynamoDB: L (eventually consistent reads)
  MongoDB:  CP      MongoDB:  C (strong consistency primary)
  Cassandra: AP     Cassandra: L (tunable consistency)
  etcd:     CP      etcd:      C (Raft, strong)
\`\`\`

---

## Consistency Models From Weak to Strong

| Model | What You Get | Example |
|-------|-------------|---------|
| **Eventual** | Replicas converge over time. Reads may return stale data. | DNS, DynamoDB (default) |
| **Causal** | Related operations are seen in order. Unrelated operations can be concurrent. | MongoDB (causal consistency sessions) |
| **Read-after-write** | Reading your own writes is immediate. Other writes may be delayed. | DynamoDB (consistent read) |
| **Strong (Linearizability)** | Every read returns the most recent write across all replicas. | etcd, Spanner, PostgreSQL sync replication |

---

## Consensus Protocols — Raft and Paxos

For **strong consistency** in a distributed system, nodes must agree on a value despite failures. This is consensus.

\`\`\`
Raft's consensus flow:
┌─────┐  ┌─────┐  ┌─────┐
│Leader│→ │Follower│→ │Follower│
└──┬──┘  └─────┘  └─────┘
   │
   │ 1. Client sends write to Leader
   │ 2. Leader appends to log
   │ 3. Leader sends AppendEntries to Followers
   │ 4. Majority acknowledge (quorum = N/2 + 1)
   │ 5. Leader commits and responds to client
   │
   If Leader fails → new election → new Leader takes over
\`\`\`

**etcd** (used by Kubernetes) is a Raft-based key-value store. It provides linearizable reads and writes at the cost of ~1-5ms write latency (quorum sync).

---

## Practice Questions

1. **Q:** Can a distributed database be both CP and AP simultaneously?
   **A:** No. During a network partition, you must choose: reject writes (CP) or accept writes on both sides (AP). You can have different behavior per operation (DynamoDB offers eventually consistent reads and strongly consistent reads), but the same operation cannot be both.

2. **Q:** What happens in a CP system (etcd) when a partition occurs?
   **A:** If the leader is isolated from the majority, it steps down. The majority side elects a new leader and continues. The minority side cannot form a quorum and rejects all writes. Availability is lost on the minority side.

3. **Q:** What is "eventual consistency" in practical terms?
   **A:** If no new writes are made to a DynamoDB table, all replicas will eventually have the same data. The convergence time depends on the replication latency (typically milliseconds to seconds). If writes keep coming, some replicas may always lag.

4. **Q:** Raft requires a majority (quorum) for writes. Why N/2+1 and not N?
   **A:** N/2+1 is the smallest subset that overlaps with any other N/2+1 subset. If the leader fails, any new leader must contact a majority to find the latest committed entry. A majority of any two majorities always overlap, guaranteeing that the most recent committed entry is not lost.

5. **Q:** When would you use DynamoDB (AP) vs Spanner (CP)?
   **A:** Use DynamoDB for global-scale applications where availability during partitions matters more than immediate consistency (e.g., shopping cart, session data). Use Spanner for financial systems where consistency is non-negotiable (e.g., account balances, inventory counts).

---

## Summary Cheat Sheet

\`\`\`
CAP Theorem:
  Choose 2 of 3: Consistency, Availability, Partition tolerance
  In practice: partition tolerance is mandatory → CP or AP

PACELC:
  If Partition → choose Availability or Consistency
  If no Partition → choose Latency or Consistency

Consistency Models (stronger → slower):
  Eventual → Causal → Read-after-write → Strong (Linearizable)

Consensus (for strong consistency):
  Raft: leader-based, log replication, majority quorum
  Paxos: more complex, no single leader (used in Spanner)
  Both tolerate N/2 - 1 failures

Real-world choices:
  etcd, Zookeeper → CP, strong consistency (Raft/Zab)
  DynamoDB, Cassandra → AP, eventual consistency
  MongoDB → CP (default), tunable
  Spanner → CP (TrueTime clock for external consistency)
  PostgreSQL streaming replication → CP (sync), AP (async)`,
            tags: ["Databases", "NoSQL"],
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
            content: `## Why This Matters (Read This First)

Redis is often misunderstood as "just a cache." In reality, it is a multi-model database: a cache, a message broker, a rate limiter, a distributed lock manager, and a real-time analytics engine — all in one.

With sub-millisecond latency and operations like SET, LPUSH, and ZADD, Redis is the Swiss Army knife of backend infrastructure.

---

## Data Structures

\`\`\`bash
# String — the basic building block
SET user:42:name "Alice"
GET user:42:name
INCR page:visits            # atomic increment — perfect for counters
SET lock:resource "ok" NX EX 10  # SET If Not Exists, expires in 10s

# List — ordered collection (queue/stack)
LPUSH notifications:42 "new_message"
BRPOP notifications:42 0   # blocking pop — wait for next message

# Hash — group related fields
HSET user:42 name "Alice" email "alice@example.com"
HGETALL user:42

# Set — unordered unique members
SADD game:players "alice"
SISMEMBER game:players "alice"  # O(1) membership check
SINTER store:1:items store:2:items  # intersection — common items

# Sorted Set — unique members with scores
ZADD leaderboard 1000 "player1" 500 "player2"
ZREVRANGE leaderboard 0 2 WITHSCORES  # top 3
ZINCRBY leaderboard 50 "player1"      # increment score

# Stream — append-only log (like Kafka but simpler)
XADD sensor:temp * temperature 22.5  # * = auto-generated ID
XREAD COUNT 10 STREAMS sensor:temp 0  # read from start
XREADGROUP GROUP mygroup consumer1 COUNT 1 STREAMS sensor:temp >  # consumer group
\`\`\`

---

## Expiry and Eviction

\`\`\`bash
# TTL — time-to-live per key
SET session:abc123 "user_data" EX 3600  # expires in 1 hour
TTL session:abc123  # how many seconds left
PERSIST session:abc123  # remove expiry

# When memory is full, Redis evicts keys based on policy:
# CONFIG SET maxmemory-policy allkeys-lru
# Policies:
#   noeviction:        return errors (default)
#   allkeys-lru:       evict least recently used keys
#   allkeys-lfu:       evict least frequently used keys (Redis 4+)
#   volatile-ttl:      evict keys with shortest TTL first
#   volatile-lru/lfu:  evict keys with expiry set
\`\`\`

---

## Persistence — RDB vs AOF

| Feature | RDB (Snapshot) | AOF (Append-Only File) |
|---------|---------------|----------------------|
| Data format | Binary dump | Redis protocol text |
| Write trigger | Periodic save | Every write (fsync) |
| File size | Compact | Larger (records every command) |
| Recovery speed | Fast (load once) | Slow (replay all commands) |
| Data loss | Between snapshots | 1 fsync interval (default 1s) |

\`\`\`bash
# RDB: save every 60 seconds if 1000+ keys changed
save 60 1000

# AOF: fsync every second (good balance)
appendonly yes
appendfsync everysec

# Best practice: use BOTH
# RDB for fast restarts, AOF for durability
aof-use-rdb-preamble yes
\`\`\`

---

## Redis Patterns

### Distributed Lock (Redlock)

\`\`\`javascript
// This is NOT sufficient for production locks
const lock = await redis.set("lock:resource", "owner", "NX", "EX", 30);

// Redlock: acquire lock on N independent Redis instances (N=5 minimum)
// Only if majority succeed → lock acquired
// Requires: Redis client with Redlock implementation
\`\`\`

### Rate Limiting

\`\`\`bash
# Sliding window rate limit: max 100 requests per IP per minute
INCR rate:{ip}:{current_minute}
EXPIRE rate:{ip}:{current_minute} 60
# Then check: if value > 100 → reject
\`\`\`

### Pub/Sub (Fire-and-Forget)

\`\`\`bash
# Publisher
PUBLISH channel:updates "user:42 changed"

# Subscriber
SUBSCRIBE channel:updates
# Note: subscribers DO NOT receive messages published before they subscribed
# Use Streams for persistent messaging
\`\`\`

---

## Redis Cluster

\`\`\`
┌──────────────────────────────────────────────────┐
│  Redis Cluster (16,384 hash slots)               │
│                                                    │
│  Node 1 (slots 0-5460)     Node 2 (5461-10922)    │
│  Node 3 (10923-16383)      Node 4 (replica)       │
│                                                    │
│  Key → CRC16(key) % 16384 → pick node             │
└──────────────────────────────────────────────────┘
\`\`\`

---

## Practice Questions

1. **Q:** Why is Redis single-threaded and how does it handle concurrent connections?
   **A:** Redis uses a single-threaded event loop (like Node.js) — one thread processes all commands sequentially using epoll/kqueue. This eliminates locking overhead. I/O is non-blocking, so the thread never waits.

2. **Q:** What happens if a Redis AOF file grows to 10GB?
   **A:** Redis can rewrite the AOF in the background (BGREWRITEAOF) — it reads the current dataset and writes a minimal AOF that captures only the current state, not the entire command history.

3. **Q:** Can you use Redis as a primary database (not just a cache)?
   **A:** Yes, with caveats: Redis is in-memory (must fit in RAM), has limited query capabilities (no SQL), and persistence is not as robust as PostgreSQL (potential data loss on crash with default config).

4. **Q:** What is the difference between Redis Pub/Sub and Redis Streams?
   **A:** Pub/Sub is fire-and-forget — messages are lost if no subscriber is connected. Streams are persistent (stored in memory) — consumers can join anytime and read from any point, with consumer groups for load balancing.

5. **Q:** How does Redis Cluster handle node failures?
   **A:** If a master node fails and its replica (if configured) takes over, the cluster continues. If a node fails with no replica, the hash slots it owns become unavailable — any request to those slots gets a MOVED error.

---

## Summary Cheat Sheet

\`\`\`
Redis Data Structures:
  String → caching, counters, locks (SET NX EX)
  List   → queues, stacks (LPUSH, BRPOP)
  Hash   → object fields (HSET, HGETALL)
  Set    → tags, membership (SADD, SINTER)
  Sorted Set → leaderboards, rate limiting (ZADD, ZRANK)
  Stream → event log, message queue (XADD, XREAD)

Persistence:
  RDB: periodic snapshots — fast recovery, some data loss
  AOF: every command logged — durable, slower recovery
  Best: both (AOF with RDB preamble)

Eviction (when memory full):
  allkeys-lru: most common — evict least recently used
  allkeys-lfu: evict least frequently used
  volatile-ttl: evict shortest TTL first
  noeviction: return errors (default)

Cluster: 16,384 hash slots, key → CRC16 mod 16384 → node`,
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
            content: `## Why This Matters (Read This First)

Most applications start simple and become unmaintainable. Business logic leaks into controllers, SQL queries are scattered across the codebase, and changing a feature breaks three unrelated things.

**Clean Architecture** and **Hexagonal Architecture** solve this by enforcing a **dependency rule**: inner layers (business logic) must NOT depend on outer layers (frameworks, databases, HTTP). This keeps your business rules testable, framework-independent, and long-lived.

---

## The Dependency Rule

\`\`\`
     ┌─────────────────────────────┐
     │    Frameworks & Drivers      │  ← Outer layer
     │  (HTTP, DB, Queue, UI)       │     Changes often
     │   Depends on ↓               │
     ├─────────────────────────────┤
     │    Interface Adapters        │  ← Presenters, Controllers,
     │   (Controllers, Presenters,  │     Gateways
     │    Repository implementations)│    Depends on ↓
     ├─────────────────────────────┤
     │    Application / Use Cases   │  ← Orchestrate business rules
     │   (CreateUser, PlaceOrder)   │     Depends on ↓
     ├─────────────────────────────┤
     │    Domain / Entities         │  ← Core business rules
     │   (User, Order, Product)    │     Independent of everything
     └─────────────────────────────┘
\`\`\`

### Layer 1: Entities (Domain)

Pure business logic. No framework annotations, no database imports, no HTTP concepts.

\`\`\`typescript
// domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public email: Email, // Value Object — not a string
    public name: string,
  ) {}

  changeEmail(newEmail: Email): void {
    if (this.email.equals(newEmail)) {
      throw new Error("New email is the same as current email");
    }
    this.email = newEmail;
    // Domain event could be raised here
  }
}

// Value Object
export class Email {
  private constructor(public readonly value: string) {}

  static create(value: string): Email {
    if (!value.includes("@")) throw new Error("Invalid email");
    return new Email(value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
\`\`\`

### Layer 2: Use Cases (Application)

Orchestrate entities and call repository interfaces. No database or HTTP code.

\`\`\`typescript
// application/use-cases/ChangeEmailUseCase.ts
export class ChangeEmailUseCase {
  constructor(
    private userRepository: UserRepository, // INTERFACE — not implementation
    private emailService: EmailService,      // INTERFACE
  ) {}

  async execute(userId: string, newEmail: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const email = Email.create(newEmail);

    if (await this.emailService.isEmailTaken(email)) {
      throw new Error("Email already in use");
    }

    user.changeEmail(email);
    await this.userRepository.save(user);
  }
}
\`\`\`

### Layer 3: Interface Adapters

Translate between the use case and the external world.

\`\`\`typescript
// infrastructure/controllers/UserController.ts
// This depends on Express.js — OK, it's the outer layer
export class UserController {
  constructor(private changeEmail: ChangeEmailUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      await this.changeEmail.execute(req.params.id, req.body.email);
      res.status(200).json({ message: "Email updated" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

// infrastructure/repositories/PostgresUserRepository.ts
export class PostgresUserRepository implements UserRepository {
  constructor(private db: Pool) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) return null;
    return this.toDomain(result.rows[0]);
  }

  async save(user: User): Promise<void> {
    await this.db.query(
      "UPDATE users SET email = $1 WHERE id = $2",
      [user.email.value, user.id],
    );
  }

  private toDomain(row: any): User {
    return new User(row.id, Email.create(row.email), row.name);
  }
}
\`\`\`

---

## Hexagonal Architecture (Ports & Adapters)

The same concept, different naming:

\`\`\`
           ┌──────────────────────┐
           │  Application Core    │
           │                      │
           │   ┌──────────────┐   │
  ┌────────┼──→│   Inbound    │───┼──→ HTTP Controller (Adapter)
  │        │   │   Ports      │   │
  │        │   │(Interfaces)  │   │
  │        │   └──────────────┘   │
  │        │                      │
  │        │   ┌──────────────┐   │
  │        │   │   Outbound   │   │
  │        │   │   Ports      │───┼──→ PostgreSQL (Adapter)
  │        │   │(Interfaces)  │   │
  │        │   └──────────────┘   │
  │        └──────────────────────┘
  │
  User clicks "Save"
\`\`\`

| Clean Architecture | Hexagonal Architecture |
|-------------------|----------------------|
| Use Case | Inbound Port |
| Controller | Inbound Adapter |
| Repository Interface | Outbound Port |
| Repository Implementation | Outbound Adapter |

---

## Practice Questions

1. **Q:** Why should your domain entities not have framework annotations (e.g., \`@Entity\`, \`@Column\`)?
   **A:** Framework coupling makes it impossible to test business logic without the framework, and changing the framework requires changing every entity. Domain entities should be plain objects (POJOs/POPOs).

2. **Q:** How do you handle transactions in Clean Architecture?
   **A:** The transaction boundary should wrap the use case execution. A unit of work pattern starts a transaction at the beginning of a use case and commits it at the end. The domain layer knows nothing about transactions.

3. **Q:** What is the difference between an Entity and a Value Object?
   **A:** Entities have identity (two Users with the same name are different). Value Objects have no identity — two Email objects with "a@b.com" are equal. Value Objects are immutable.

4. **Q:** Does Clean Architecture mean you cannot use an ORM?
   **A:** No, but the ORM belongs in the outer layer (Interface Adapters). The domain entities should NOT be ORM entities. You map between domain entities and ORM entities in the repository implementation.

5. **Q:** When is Clean Architecture over-engineering?
   **A:** For CRUD apps with simple business logic (a blog, a to-do app). The abstraction overhead is not justified. Use Clean Architecture when business rules are complex (financial calculations, compliance logic, multi-step workflows).

---

## Summary Cheat Sheet

\`\`\`
Clean Architecture Layers:
  1. Entities (Domain) — pure business rules, no dependencies
  2. Use Cases — orchestrate entities, depend on interfaces
  3. Interface Adapters — translate use case ↔ external world
  4. Frameworks — HTTP, DB, Queue — the outermost detail

Dependency Rule:
  • Inner layers NEVER import from outer layers
  • Dependencies POINT INWARD (interfaces in core, impl in outer)

Hexagonal Naming:
  • Inbound Port = Use Case interface
  • Inbound Adapter = Controller
  • Outbound Port = Repository interface
  • Outbound Adapter = Repository implementation (Postgres, Redis, etc.)

Benefits: testable without frameworks, swap DB/HTTP without touching logic`,
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
            content: `## Why This Matters (Read This First)

Domain-Driven Design (DDD) is a methodology for modeling complex business domains. It is not about technology — it is about creating a **shared understanding** between developers and domain experts (business people).

When the codebase's model matches the business's mental model, changing the software becomes easier because the business logic is explicit, not hidden in SQL queries or controller methods.

---

## Ubiquitous Language

The most important DDD concept: use the same words in code as the business uses in conversation.

\`\`\`
Business says:                     Code uses:
"Submit an order"                  SubmitOrderUseCase
"Customer is blocked"              Customer.block()
"Payment was declined"             PaymentDeclined event
"Refund the line item"             LineItem.refund()
\`\`\`

If the business says "order" and your code has \`Order\` but also \`Purchase\` and \`Transaction\` — you have a ubiquitous language problem. The code does not match the mental model.

---

## Bounded Context

A **Bounded Context** is an explicit boundary within which a model is valid. The same word ("Customer") can mean different things in different contexts:

\`\`\`
┌───────────────────────────────────────────────┐
│ Sales Context              Support Context      │
│                              │                  │
│ Customer:                    │ Customer:         │
│   • name                     │   • name          │
│   • email                    │   • email         │
│   • credit limit             │   • ticket count  │
│   • shipping address         │   • satisfaction  │
│                              │   • last contact  │
│ "Customer buys things"       │ "Customer needs   │
│                              │  help"            │
└───────────────────────────────────────────────┘
\`\`\`

Each context has its own model, its own database (optionally), and its own team. Communication between contexts happens via **events** or **anti-corruption layers**.

---

## Aggregate

An **Aggregate** is a cluster of entities that must be consistent together. One entity is the **Aggregate Root** — the only entry point for external access.

\`\`\`typescript
// Order Aggregate
class Order {
  // Aggregate Root — the only way to access OrderItems
  private items: OrderItem[] = [];
  private status: OrderStatus;

  addItem(productId: string, quantity: number, price: Money): void {
    if (this.status !== OrderStatus.DRAFT) {
      throw new Error("Can only add items to draft orders");
    }
    this.items.push(new OrderItem(productId, quantity, price));
  }

  removeItem(productId: string): void {
    if (this.status !== OrderStatus.DRAFT) {
      throw new Error("Can only remove items from draft orders");
    }
    this.items = this.items.filter(i => i.productId !== productId);
  }

  submit(): void {
    if (this.items.length === 0) {
      throw new Error("Cannot submit empty order");
    }
    this.status = OrderStatus.SUBMITTED;
    // Raise domain event
    this.events.push(new OrderSubmittedEvent(this.id, this.items));
  }
}

// OrderItem is an Entity within the Order Aggregate
class OrderItem {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly price: Money,
  ) {}
}
\`\`\`

**Rule:** External code can only hold a reference to the Aggregate Root (Order), not to internal entities (OrderItem). All changes must go through the Root.

---

## Domain Events

Things that happened in the domain — past tense, immutable.

\`\`\`typescript
class OrderSubmittedEvent {
  constructor(
    public readonly orderId: string,
    public readonly items: OrderItem[],
    public readonly occurredAt: Date = new Date(),
  ) {}
}

// In the Order aggregate:
submit(): void {
  // ...validations...
  this.status = OrderStatus.SUBMITTED;
  this.addEvent(new OrderSubmittedEvent(this.id, this.items));
}

// In the application layer:
class SubmitOrderUseCase {
  async execute(orderId: string): Promise<void> {
    const order = await this.orderRepo.find(orderId);
    order.submit();
    await this.orderRepo.save(order); // save dispatches events
    // Events are published after successful save
  }
}
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between Bounded Context and a microservice?
   **A:** A Bounded Context is a DESIGN boundary — it defines where a model applies. A microservice is a DEPLOYMENT boundary. Ideally, one Bounded Context = one microservice, but a context can also contain multiple services if the model is consistent.

2. **Q:** Why should the Aggregate Root be the only way to access internal entities?
   **A:** To maintain consistency. If external code can directly modify OrderItem's quantity, it might set it to -1 or exceed inventory. By funneling all changes through Order.addItem(), the aggregate enforces invariants.

3. **Q:** What is an anti-corruption layer?
   **A:** A translation layer between two contexts. If the Support Context calls the Sales Context's API, the Sales API response should be translated into the Support Context's own Customer model — not used directly.

4. **Q:** Can an Aggregate contain other Aggregates?
   **A:** An aggregate can reference another AGGREGATE by its ID, but it should NOT hold a direct object reference. For example, Order holds userId (not a User object). Loading the entire User aggregate for order operations would conflate boundaries.

5. **Q:** When should you NOT use DDD?
   **A:** When the domain is simple (CRUD with no complex business rules), when there is no domain expert to collaborate with, or when the team is small and the project has tight deadlines. DDD requires investment in modeling and communication.

---

## Summary Cheat Sheet

\`\`\`
DDD Building Blocks:
───────────────────
Ubiquitous Language — same words in code and business
Bounded Context — model boundary, translation at edges
Entity — has identity (User, Order)
Value Object — no identity, immutable (Email, Money)
Aggregate — consistency boundary with Aggregate Root
Domain Event — something that happened (past tense)
Repository — collection-like access to aggregates
Domain Service — stateless logic not fitting an entity

Strategic Design:
  • Core Domain — competitive advantage (build yourself)
  • Supporting Domain — important but not core (build or buy)
  • Generic Subdomain — commodity (use off-the-shelf)
  • Context Map — how bounded contexts relate`,
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
            content: `## Why This Matters (Read This First)

A monolith starts simple: one codebase, one database, one deploy. As the team grows, deployment coordination becomes painful, a change in any module requires full regression testing, and scaling means scaling the entire application.

Microservices decompose the monolith into independently deployable services. Each service has its own database, its own API, and its own team. The benefits are real, but so is the **distributed systems tax** — network failures, data consistency challenges, and operational complexity.

---

## Decomposition Strategies

### By Business Capability

\`\`\`
┌──────────────────────────────────────────────────┐
│                  E-Commerce                        │
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐│
│  │ Catalog  │ │  Cart    │ │  Orders  │ │Payment││
│  └──────────┘ └──────────┘ └──────────┘ └───────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐│
│  │Shipping  │ │Inventory │ │  Users   │ │Search ││
│  └──────────┘ └──────────┘ └──────────┘ └───────┘│
└──────────────────────────────────────────────────┘
\`\`\`

Each capability owns its data and exposes it through an API.

---

## Communication Patterns

### Synchronous (HTTP/gRPC)

Simple, but creates temporal coupling:

\`\`\`typescript
// Order Service calls Inventory Service synchronously
async function placeOrder(order: Order): Promise<void> {
  // Check inventory — HTTP call to Inventory Service
  const inventory = await httpClient.post(
    "http://inventory-service/check", { items: order.items }
  );

  if (!inventory.available) {
    throw new Error("Out of stock");
  }

  // Save order
  await orderRepo.save(order);
}
\`\`\`

**Problem:** If Inventory is down, Order fails too (cascading failure).

### Asynchronous (Message Broker)

Decoupled, but adds eventual consistency:

\`\`\`typescript
// Order Service publishes event
async function placeOrder(order: Order): Promise<void> {
  await orderRepo.save({
    ...order,
    status: "PENDING",
  });

  await eventBus.publish("order.created", {
    orderId: order.id,
    items: order.items,
  });
  // Order is now PENDING — Payment Service will process it
}

// Payment Service listens
eventBus.subscribe("order.created", async (event) => {
  const payment = await processPayment(event.orderId);
  if (payment.success) {
    await eventBus.publish("order.paid", { orderId: event.orderId });
  } else {
    await eventBus.publish("order.payment_failed", { orderId: event.orderId });
  }
});
\`\`\`

---

## Saga Pattern — Managing Distributed Transactions

There is no ACID across microservices. A saga is a sequence of local transactions where each step publishes an event triggering the next step. If a step fails, **compensating actions** undo previous steps.

\`\`\`
Order Saga:
  1. Order Service: Create order (PENDING)
  2. Payment Service: Reserve payment
  3. Inventory Service: Reserve inventory
  4. Shipping Service: Create shipment
  5. Order Service: Mark order as CONFIRMED

If step 4 fails:
  → Compensate step 3: Release inventory
  → Compensate step 2: Release payment
  → Step 1: Mark order as FAILED
\`\`\`

**Choreography (event-based):** Each service publishes events and reacts to others' events.
**Orchestration (command-based):** A central coordinator (orchestrator) tells each service what to do.

---

## API Gateway

The gateway is the single entry point for all external clients:

\`\`\`
                      ┌──────────┐
  Mobile App ───────→ │          │──→ Catalog Service
                      │  API     │──→ Cart Service
  Web App ──────────→ │  Gateway │──→ Order Service
                      │          │──→ User Service
  Third Party ──────→ │          │──→ Search Service
                      └──────────┘
\`\`\`

Gateway handles: auth, rate limiting, routing, response aggregation, protocol translation.

---

## Practice Questions

1. **Q:** When is a monolith actually better than microservices?
   **A:** When the team is small (<10), the application has clear boundaries within a single codebase, and deployment frequency is low. A well-structured monolith (with module boundaries) is simpler to develop, test, and deploy.

2. **Q:** What is the "distributed monolith" anti-pattern?
   **A:** When microservices share a database, call each other synchronously in a chain, and cannot be deployed independently. This has all the complexity of microservices with none of the benefits.

3. **Q:** How do you handle schema changes in event-driven microservices?
   **A:** Use schema registry (Avro, Protobuf Schema Registry) to enforce compatibility. Consumers must handle both old and new event formats during rolling upgrades. Never delete or rename fields — only add optional ones.

4. **Q:** What is the difference between orchestration and choreography sagas?
   **A:** Orchestration: a central saga manager tells each service what to do — easier to visualize and track but creates a single point of complexity. Choreography: each service reacts to events — more decoupled but harder to understand the overall flow.

5. **Q:** How do you debug a request that spans 5 microservices?
   **A:** Distributed tracing (OpenTelemetry + Jaeger/Zipkin) — each service propagates a trace ID, and spans are collected and visualized. Without tracing, debugging cross-service issues is nearly impossible.

---

## Summary Cheat Sheet

\`\`\`
Microservice Traits:
  • Independently deployable
  • Owns its data (database per service)
  • Communicates via API (sync) or events (async)
  • Scalable independently

Communication:
  Synchronous: HTTP/gRPC — simple, temporal coupling
  Asynchronous: message broker (Kafka/RabbitMQ) — decoupled, eventual consistency

Saga Patterns:
  Choreography: events drive the flow — decoupled but hard to trace
  Orchestration: a coordinator drives the flow — centralized but clear

Distributed Systems Tax:
  1. Network failures (timeouts, retries, circuit breakers)
  2. Data consistency (eventual consistency, sagas)
  3. Operational complexity (deploy, monitor, debug 20+ services)
  4. Team coordination (API contracts, versioning, testing)`,
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
            content: `## Why This Matters (Read This First)

Event-Driven Architecture (EDA) changes the fundamental model of communication. Instead of one service calling another (synchronous, blocking), services **publish events** and **react to events**. This decouples producers from consumers — the producer does not know or care who listens.

Kafka is the dominant event store. Unlike traditional message queues (RabbitMQ, SQS), Kafka is a **distributed commit log** — events are persisted and can be replayed.

---

## Kafka — Distributed Commit Log

\`\`\`
┌────────────────────────────────────────────────────┐
│  Kafka Cluster                                      │
│                                                      │
│  Topic: "orders"                                    │
│  ┌────────┬────────┬────────┬────────┬────────┐    │
│  │Part 0  │Part 1  │Part 2  │Part 3  │Part 4  │    │
│  │┌──────┐│┌──────┐│┌──────┐│┌──────┐│┌──────┐│    │
│  ││msg 0 │││msg 0 │││msg 0 │││msg 0 │││msg 0 ││    │
│  ││msg 1 │││msg 1 │││msg 1 │││msg 1 │││      ││    │
│  ││msg 2 │││msg 2 │││      │││      │││      ││    │
│  ││msg 3 │││      │││      │││      │││      ││    │
│  │└──────┘│└──────┘│└──────┘│└──────┘│└──────┘│    │
│  └────────┴────────┴────────┴────────┴────────┘    │
│  ↑                                    ↑             │
│  Producer (writes to end)             Consumer      │
│                                       (reads from   │
│                                        offset, can  │
│                                        replay from  │
│                                        start)       │
└────────────────────────────────────────────────────┘
\`\`\`

### Key Concepts

| Concept | What It Is |
|---------|------------|
| **Topic** | A named stream of events |
| **Partition** | An ordered, immutable sequence of messages (a single log file) |
| **Offset** | A message's position within a partition (0, 1, 2, ...) |
| **Producer** | Publishes messages to a topic partition |
| **Consumer** | Reads messages from a topic at a specific offset |
| **Consumer Group** | A group of consumers that divide partitions among themselves |

\`\`\`typescript
// Producer
import { Kafka } from "kafkajs";

const kafka = new Kafka({ brokers: ["localhost:9092"] });
const producer = kafka.producer();

await producer.connect();
await producer.send({
  topic: "orders",
  messages: [{ key: "user_42", value: JSON.stringify(order) }],
});
await producer.disconnect();

// Consumer
const consumer = kafka.consumer({ groupId: "payment-service" });
await consumer.connect();
await consumer.subscribe({ topic: "orders", fromBeginning: true });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const order = JSON.parse(message.value.toString());
    await processPayment(order);
  },
});
\`\`\`

---

## Event Sourcing

Instead of storing the **current state**, store every **state change** as an event.

\`\`\`typescript
// Traditional: store current balance
db.accounts.update({ id: accountId }, { balance: 900 });

// Event sourcing: store every event
events.append("bank", [
  { type: "AccountCreated", data: { accountId, owner: "Alice" }},
  { type: "MoneyDeposited", data: { amount: 1000 }},
  { type: "MoneyWithdrawn", data: { amount: 100 }},
]);

// Current balance = 1000 - 100 = 900
function getBalance(events: Event[]): number {
  return events.reduce((balance, event) => {
    switch (event.type) {
      case "MoneyDeposited": return balance + event.amount;
      case "MoneyWithdrawn": return balance - event.amount;
      default: return balance;
    }
  }, 0);
}
\`\`\`

**Benefits:** Full audit trail, temporal queries (what was my balance on Jan 1st?), event replay for debugging
**Cost:** Event store must be append-only and fast; current state requires rehydration

---

## CQRS — Command Query Responsibility Segregation

Separate the **write model** (commands that produce events) from the **read model** (projections optimized for queries):

\`\`\`
┌────────────────────────────────────────────────────┐
│  Write Side                          Read Side        │
│                                                      │
│  Command: PlaceOrder            Query: GetOrder      │
│      → Aggregate processes      → Read from          │
│      → Events published          pre-computed         │
│      → Projection updated        projection           │
│                                                      │
│  ┌──────────────┐              ┌──────────────┐      │
│  │ Order Service│──Event──→   │ Read Model   │      │
│  │ (Write)      │              │ (PostgreSQL) │      │
│  └──────────────┘              └──────────────┘      │
\`\`\`

Events flow from write to read asynchronously. The read model is eventually consistent with the write model.

---

## Practice Questions

1. **Q:** What is the difference between Kafka and RabbitMQ?
   **A:** Kafka is a distributed log — messages are persisted, ordered, and can be replayed. RabbitMQ is a message queue — messages are removed after consumption. Kafka scales better for high-throughput event streaming; RabbitMQ is better for complex routing.

2. **Q:** How does Kafka achieve high throughput?
   **A:** Sequential I/O — writes are appended to the end of a file (no random seeks). Batching — producers batch messages, consumers fetch in batches. Zero-copy — consumers read directly from the page cache.

3. **Q:** In Event Sourcing, how do you handle schema changes to events?
   **A:** Never delete or rename fields. Add new optional fields. Use a schema registry (Avro, Protobuf) to track versions. Write upcasters (migration functions) that transform old events to the latest schema when rehydrating.

4. **Q:** When would you NOT use Event Sourcing?
   **A:** When you only need the current state (no audit/history requirement), when storage is constrained (events grow unboundedly), or when the team is not comfortable with the complexity of event replay and projection management.

5. **Q:** What happens if Kafka's disk fills up?
   **A:** Kafka stops accepting new messages. Configure log retention — time-based (7 days) or size-based (10GB per partition). Cleanup policy can be "delete" (old messages removed) or "compact" (retain latest value per key).

---

## Summary Cheat Sheet

\`\`\`
Kafka:
  Topic → Partition → Message (offset)
  Producer: append to partition
  Consumer: read from offset, any partition group
  Consumer Group: split partitions across consumers

Event Sourcing:
  Store events, not state
  Rehydrate current state by replaying events

CQRS:
  Write model: commands → events
  Read model: projections of events → optimized queries

When to use:
  • Event Sourcing: audit trail, temporal queries, event replay
  • Kafka: high-throughput event streaming, decoupling services
  • CQRS: different read/write patterns, complex queries need optimization`,
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
            content: `## Why This Matters (Read This First)

Caching is the single highest-impact performance optimization in backend systems. A well-cached endpoint responds in <5ms instead of 50ms. A poorly-cached system serves stale data or collapses under a **cache stampede**.

This article covers the four main caching strategies, their trade-offs, and how to avoid the most common failure modes.

---

## Cache-Aside (Lazy Loading)

The most common pattern — the application manages the cache:

\`\`\`
1. Check cache
2. Cache hit → return data (fast path)
3. Cache miss → read from DB
4. Store result in cache
5. Return data
\`\`\`

\`\`\`typescript
async function getUser(id: string): Promise<User> {
  // 1. Check cache
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) {
    return JSON.parse(cached); // Cache hit → fast
  }

  // 2. Cache miss → read from DB
  const user = await db.users.findByPk(id);
  if (!user) return null;

  // 3. Populate cache (with TTL)
  await redis.set(\`user:\${id}\`, JSON.stringify(user), "EX", 3600);

  return user;
}
\`\`\`

**Pros:** Simple, only caches what is requested, resilient to cache failure (falls back to DB)
**Cons:** Cache miss adds latency (cache → DB round trip), first request is always slow

---

## Write-Through

Write to cache and database simultaneously:

\`\`\`typescript
async function updateUser(id: string, data: Partial<User>): Promise<void> {
  // Write to cache first
  const user = await db.users.findByPk(id);
  const updated = { ...user, ...data };
  await redis.set(\`user:\${id}\`, JSON.stringify(updated));

  // Then write to DB (or vice versa)
  await db.users.update(data, { where: { id } });
}
\`\`\`

**Pros:** Cache is always up-to-date (no stale reads)
**Cons:** Write latency is higher (must write to both), wasted cache space for rarely-read data

---

## Write-Behind (Write-Back)

Write to cache, then asynchronously update the database:

\`\`\`typescript
async function incrementCounter(id: string): Promise<number> {
  // Increment in Redis (fast)
  const count = await redis.incr(\`counter:\${id}\`);

  // Queue async DB update
  await queue.add({ type: "update_counter", id, count });

  return count;
}
\`\`\`

**Pros:** Very fast writes (memory-only), batches DB writes
**Cons:** Data loss risk if cache fails before DB write completes

---

## Cache Stampede Prevention

A **cache stampede** happens when a cached item expires and MANY concurrent requests all miss the cache simultaneously, hammering the database.

\`\`\`typescript
// BAD: Stampede-prone
const cached = await redis.get("expensive_data");
if (!cached) {
  // EVERY concurrent request runs this — all hit the DB!
  const data = await expensiveDBQuery();
  await redis.set("expensive_data", JSON.stringify(data), "EX", 3600);
  return data;
}

// GOOD: Probabilistic early expiration
// Refresh the cache when it's about to expire, not after
async function getWithStaleProtection(key: string): Promise<Data> {
  const cached = await redis.get(key);

  if (!cached) {
    // Use Redis SET NX to ensure only ONE request computes
    const lock = await redis.set(\`lock:\${key}\`, "1", "NX", "EX", 5);
    if (lock) {
      const data = await expensiveDBQuery();
      await redis.set(key, JSON.stringify(data), "EX", 60);
      return data;
    }
    // Wait for the one that got the lock
    await sleep(50);
    return getWithStaleProtection(key);
  }

  return JSON.parse(cached);
}
\`\`\`

---

## Cache Invalidation

The hardest problem in computer science. Strategies:

| Strategy | How | Best For |
|----------|-----|----------|
| TTL | Cache expires after N seconds | Simple, works for most cases |
| Event-driven | Purge cache when data changes | Real-time accuracy |
| Write-through | Keep cache in sync on every write | High read-to-write ratio |
| Manual | Admin panel button to clear cache | Emergency operations |

---

## Practice Questions

1. **Q:** What is the cache stampede problem and how does probabilistic early expiration solve it?
   **A:** When many concurrent requests all miss the cache simultaneously, they all hit the database. Probabilistic early expiration refreshes the cache BEFORE it expires (based on a random probability that increases as TTL approaches), so only one request refreshes instead of all of them.

2. **Q:** Write-through vs write-behind: when would you choose one over the other?
   **A:** Write-through for data that MUST be consistent immediately (account balance, inventory count). Write-behind for data where eventual consistency is acceptable and write throughput is the priority (page views, analytics events).

3. **Q:** What happens if the cache server (Redis) goes down?
   **A:** In cache-aside, the application falls back to the database — slower but functional. When Redis recovers, the cache is cold and stampede prevention should kick in. Redis replication (primary-replica) prevents total data loss.

4. **Q:** Why use a distributed cache (Redis) instead of in-process memory (Map)?
   **A:** In-process caches are duplicated across servers (N servers × N copies of the same data), waste memory, and cause inconsistency when one server updates and another does not. Redis provides a single shared cache with consistent data.

5. **Q:** How do you calculate the optimal TTL for a cached item?
   **A:** Balance staleness tolerance × read frequency × write frequency. If users accept 5-minute-old data, TTL=300s. If reads are 100x more frequent than writes, longer TTL is beneficial. Monitor cache hit rate and adjust.

---

## Summary Cheat Sheet

\`\`\`
Caching Strategies:
────────────────────
Cache-Aside (Lazy): app checks cache → DB → populates
  Pros: simple, resilient  Cons: first request slow
  Use: general purpose

Write-Through: write to cache + DB simultaneously
  Pros: always fresh      Cons: slower writes
  Use: read-heavy, write-light data

Write-Behind: write to cache → async DB write
  Pros: fast writes       Cons: risk of data loss
  Use: high write throughput

Cache Stampede Prevention:
  • Probabilistic early expiration: refresh before TTL ends
  • SET NX lock: only one request recomputes
  • Stale-while-revalidate: serve stale data while refreshing

Invalidation:
  TTL simplest; event-driven most accurate`,
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
            content: `## Why This Matters (Read This First)

Backend testing requires multiple layers: unit tests for business logic, integration tests for external dependencies (DB, cache, API), and contract tests for API compatibility between services.

The test pyramid guides the ratio: ~70% unit (fast, isolated), ~20% integration (real dependencies via Testcontainers), ~5% contract (Pact), ~5% E2E (critical paths only).

---

## pytest — Python Testing

\`\`\`python
# conftest.py — shared fixtures
import pytest
from testcontainers.postgres import PostgresContainer
from myapp.db import create_connection

@pytest.fixture(scope="session")
def postgres():
    """Start PostgreSQL container once per test session."""
    with PostgresContainer("postgres:16") as pg:
        yield pg

@pytest.fixture
def db(postgres):
    """Create a fresh connection per test with clean DB."""
    conn = create_connection(postgres.get_connection_url())
    run_migrations(conn)  # Apply migrations for each test
    yield conn
    conn.close()
    # Each test starts with a clean database

# test_orders.py — parametrized tests
@pytest.mark.parametrize("items,coupon,expected", [
    ([{"price": 100}], {"type": "percentage", "value": 20}, 20),
    ([{"price": 10}], {"type": "fixed", "value": 50}, 10),
    ([], {"type": "percentage", "value": 20}, 0),
])
def test_calculate_discount(items, coupon, expected):
    from myapp.pricing import calculate_discount
    assert calculate_discount(items, coupon) == expected
\`\`\`

---

## Go Testing

\`\`\`go
// Table-driven tests in Go
func TestCalculateDiscount(t *testing.T) {
    tests := []struct {
        name     string
        items    []CartItem
        coupon   Coupon
        expected float64
    }{
        {"percentage discount", []CartItem{{Price: 100}}, Coupon{Type: "percentage", Value: 20}, 20},
        {"fixed discount capped", []CartItem{{Price: 10}}, Coupon{Type: "fixed", Value: 50}, 10},
        {"empty cart", []CartItem{}, Coupon{Type: "percentage", Value: 20}, 0},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            assert.Equal(t, tt.expected, calculateDiscount(tt.items, tt.coupon))
        })
    }
}

// Integration test with Testcontainers
func TestOrderRepository(t *testing.T) {
    ctx := context.Background()

    // Start PostgreSQL container
    pg, err := testcontainers.GenericContainer(ctx,
        testcontainers.GenericContainerRequest{
            ContainerRequest: testcontainers.ContainerRequest{
                Image: "postgres:16",
                Env: map[string]string{
                    "POSTGRES_PASSWORD": "test",
                    "POSTGRES_DB":       "testdb",
                },
                ExposedPorts: []string{"5432/tcp"},
            },
            Started: true,
        })
    require.NoError(t, err)
    defer pg.Terminate(ctx)

    port, _ := pg.MappedPort(ctx, "5432")
    dbURL := fmt.Sprintf("postgres://postgres:test@localhost:%s/testdb", port.Port())

    repo := NewOrderRepository(dbURL)
    order, err := repo.Create(ctx, Order{UserID: "123", Total: 100})
    assert.NoError(t, err)
    assert.NotEmpty(t, order.ID)
}
\`\`\`

---

## Integration Test Boundaries

\`\`\`typescript
// Typescript with Testcontainers
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { RedisContainer } from "@testcontainers/redis";

describe("Order Service Integration", () => {
    let postgres: PostgreSqlContainer;
    let redis: RedisContainer;

    beforeAll(async () => {
        // Start real containers — not mocks!
        postgres = await new PostgreSqlContainer("postgres:16").start();
        redis = await new RedisContainer("redis:7").start();

        await runMigrations(postgres.getConnectionUri());
    }, 30000);

    afterAll(async () => {
        await postgres.stop();
        await redis.stop();
    });

    test("create order with cache warmup", async () => {
        const db = new OrderRepository(postgres.getConnectionUri());
        const cache = new OrderCache(redis.getConnectionUri());

        const order = await db.create({ userId: "123", total: 50 });
        await cache.warmup(order);

        const cached = await cache.get(order.id);
        expect(cached).toBeDefined();
        expect(cached?.total).toBe(50);
    });
});
\`\`\`

---

## Practice Questions

1. **Q:** When should you use Testcontainers vs mocks?
   **A:** Testcontainers for integration tests — test against REAL PostgreSQL, Redis, Kafka. Mocks for unit tests — isolate business logic. Use Testcontainers when you need to verify that your SQL queries work, that your cache logic handles connection errors, or that your message format matches Kafka's expectations. The containers are real but disposable.

2. **Q:** What is the advantage of table-driven tests in Go?
   **A:** Table-driven tests define inputs and expected outputs in a data structure. Adding a new test case is just adding a row to the table — no new function, no copy-paste. Each case runs as a subtest (t.Run), so failures are identified by name. Coverage is visible: you can see which cases are missing.

3. **Q:** How do you handle test data in integration tests?
   **A:** Use fixture factories (factory_boy in Python, factory_bot in Ruby) to build test objects declaratively. Each test specifies only the relevant fields. Factories handle defaults, associations, and sequences. This keeps tests concise and maintainable — no more sprawling setup code.

4. **Q:** What is the role of consumer-driven contracts (Pact)?
   **A:** Pact tests verify that microservice API providers satisfy their consumers' expectations. Service A (consumer) publishes its expectations (I need field X, Y, Z on endpoint /orders/123). Service B (provider) runs the Pact test in CI — if a change breaks the contract, the test fails BEFORE deploying. This prevents breaking changes from reaching production.

5. **Q:** How do you test error scenarios with Testcontainers?
   **A:** Stop the container during the test. Test that your application handles connection loss gracefully (retry, backoff, error response). Start the container again — test that reconnection works. This is much harder with mocks because they rarely simulate real network failures authentically.

---

## Summary Cheat Sheet

\`\`\`
Testing Layers:
  Unit (70%): business logic, fast, isolated — pytest, go test, jest
  Integration (20%): DB, cache, API — Testcontainers
  Contract (5%): API compatibility — Pact
  E2E (5%): critical user flows — Playwright, Cypress

pytest: fixtures, parametrization, conftest.py, 2000+ plugins
Go testing: table-driven tests, subtests, -race, testify/assert

Testcontainers: real PostgreSQL, Redis, Kafka in Docker
  Use for integration tests — test against real dependencies
  Start once per session, cleanup between tests

Pact: consumer-driven contract testing
  Consumer publishes expectations
  Provider verifies in CI

Best Practices:
  Clean DB between tests (truncate, not drop)
  Use fixture factories for test data
  Test error scenarios (stop container, network failure)
  Run integration tests in CI (Docker required)`,
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
            content: `## Why This Matters (Read This First)

Authentication and authorization are the most critical security features in any application. OAuth 2.0 is the industry standard for delegated authorization. OpenID Connect (OIDC) adds identity on top.

Understanding the difference between Authorization Code flow (server-side apps), PKCE (SPAs/mobile), and Client Credentials (machine-to-machine) is essential for building secure applications.

---

## OAuth 2.0 — Delegated Authorization

OAuth allows a third-party app to access a user's data without seeing the user's password. For example, "Allow this app to post to your Twitter feed."

### The Four Roles

| Role | Example |
|------|---------|
| **Resource Owner** | The user who owns the data |
| **Client** | The app requesting access (web, mobile, SPA) |
| **Authorization Server** | The server that issues tokens (Auth0, Keycloak) |
| **Resource Server** | The API that serves the data |

---

## Authorization Code Flow (Server-Side Apps)

The most secure flow for apps with a backend:

\`\`\`
User clicks "Login with Google"
    │
    ▼
1. Browser → Authorization Server
   ?response_type=code
   &client_id=MY_APP
   &redirect_uri=https://myapp.com/callback
   &scope=openid%20profile%20email
    │
    ▼  (User sees Google consent screen)
User grants permission
    │
    ▼
2. Google redirects to myapp.com/callback?code=AUTH_CODE
    │
    ▼
3. Server → Google Token Endpoint (SERVER-TO-SERVER, never seen by browser)
   POST /token
   code=AUTH_CODE
   client_id=MY_APP
   client_secret=MY_SECRET  ← only the server knows this
   redirect_uri=https://myapp.com/callback
    │
    ▼
4. Google returns:
   {
     "access_token": "eyJhbG...",     // short-lived (15 min)
     "refresh_token": "def502...",    // long-lived (days/weeks)
     "id_token": "eyJhbGci..."       // JWT with user info (OIDC)
   }
\`\`\`

The **authorization code** is a one-time-use code exchanged server-to-server for tokens. Even if intercepted, it is useless without the client_secret.

---

## PKCE — Proof Key for Code Exchange (SPAs & Mobile)

SPAs cannot securely store a client_secret. PKCE adds a cryptographic challenge:

\`\`\`
1. Client generates cryptographically random "code_verifier" (43-128 chars)
2. Client computes SHA256 hash → "code_challenge"
3. Authorization request includes code_challenge
4. Token request includes code_verifier
5. Server verifies SHA256(verifier) === challenge

Without PKCE: attacker intercepting the auth code could exchange it for tokens
With PKCE: attacker would also need the code_verifier (which never leaves the client)
\`\`\`

---

## OpenID Connect (OIDC) — Identity Layer

OIDC adds an **ID Token** (JWT) that contains verified user identity information:

\`\`\`javascript
// Decoded ID Token (JWT)
{
  "iss": "https://accounts.google.com",
  "sub": "1234567890",           // unique user ID — never changes
  "aud": "myapp-123.apps.googleusercontent.com",
  "exp": 1700000000,
  "iat": 1699996400,
  "email": "alice@example.com",
  "email_verified": true,
  "name": "Alice Smith",
  "picture": "https://..."
}
\`\`\`

The \`/userinfo\` endpoint returns the user's profile — but the info in the ID Token (verified by signature) is often sufficient, saving a round trip.

---

## Token Types

| Token | Lifetime | Purpose | Revocable? |
|-------|----------|---------|------------|
| Access Token | 15-60 min | Call APIs (in Authorization header) | Usually no (stateless) |
| Refresh Token | Days/weeks | Get new access tokens | Yes (server-side) |
| ID Token | Hours | Know who the user is (OIDC only) | No |

\`\`\`javascript
// Calling an API with access token
const response = await fetch("https://api.example.com/users/me", {
  headers: {
    "Authorization": "Bearer eyJhbGciOiJSUzI1NiIs..." // access token
  }
});
\`\`\`

---

## Practice Questions

1. **Q:** Why is the Authorization Code flow more secure than Implicit Flow (which returns the access token directly in the URL fragment)?
   **A:** In Implicit Flow, the access token is exposed in the URL fragment, visible to JavaScript, browser history, and referrer headers. In Authorization Code flow, the code is exchanged server-to-server with client_secret authentication — the token never touches the browser.

2. **Q:** What does PKCE protect against and how?
   **A:** PKCE protects against authorization code interception. The client creates a code_verifier and sends its hash (code_challenge) in the auth request. To exchange the code for tokens, the client must provide the verifier — not just the code. An attacker with the code but not the verifier cannot get tokens.

3. **Q:** Can you revoke a JWT access token?
   **A:** Not directly — JWTs are stateless. To support revocation, you need a token blacklist (stored in Redis) checked on every request, or use very short TTL + refresh token rotation.

4. **Q:** What is the difference between OAuth 2.0 and OIDC?
   **A:** OAuth 2.0 handles authorization — "what can this app do?" OIDC adds authentication — "who is the user?" OIDC extends OAuth with the ID Token (JWT containing user identity) and the UserInfo endpoint.

5. **Q:** How do you handle OAuth in mobile apps securely?
   **A:** Use PKCE + an in-app browser tab (not WebView). WebView can intercept credentials. iOS uses ASWebAuthenticationSession; Android uses Chrome Custom Tabs. Never embed client_secret in a mobile app.

---

## Summary Cheat Sheet

\`\`\`
OAuth 2.0 Flows:
─────────────────
Authorization Code (server-side)
  1. Auth code (browser redirect)
  2. Exchange code + client_secret for tokens (server-to-server)
  Most secure — use this when you have a backend.

Authorization Code + PKCE (SPA/mobile)
  1. Auth code + code_challenge (browser redirect)
  2. Exchange code + code_verifier for tokens
  Use for apps without a backend secret.

Client Credentials (machine-to-machine)
  1. Client sends client_id + client_secret → gets access token
  No user involved — service accounts.

OIDC adds:
  • ID Token — JWT with user identity
  • UserInfo endpoint — get user profile
  • Standard scopes: openid, profile, email`,
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
            content: `## Why This Matters (Read This First)

JSON Web Tokens (JWT) are everywhere — OAuth access tokens, session cookies, password reset links, API authentication. They are simple: a base64-encoded JSON payload with a cryptographic signature.

But JWTs are also easy to get wrong. Algorithm confusion attacks, accepting "none" algorithm, storing secrets in client-side code, and not rotating keys are common vulnerabilities. This article covers what you need to do JWT right.

---

## JWT Structure

A JWT has three parts separated by dots:

\`\`\`
header.payload.signature

eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIn0.
XbQ8d8G7d6G9Z9e0F3a0B2c4D5e6F7g8H9i0J1k2L3m4
\`\`\`

### Header

\`\`\`json
{
  "alg": "RS256",     // Signing algorithm
  "typ": "JWT",       // Token type
  "kid": "key-2024"   // Key ID (for key rotation)
}
\`\`\`

### Payload (Claims)

\`\`\`json
{
  "sub": "user_123",           // Subject — who the token is about
  "iss": "https://auth.myapp.com",  // Issuer
  "aud": "https://api.myapp.com",   // Audience
  "exp": 1700000000,           // Expiration (UNIX timestamp)
  "iat": 1699996400,           // Issued at
  "roles": ["admin", "editor"] // Custom claims
}
\`\`\`

### Signature

The signature proves the token has not been tampered with:

\`\`\`
HMAC-SHA256(
  base64urlEncode(header) + "." + base64urlEncode(payload),
  secret  // or private key for RS256
)
\`\`\`

---

## Signing Algorithms

| Algorithm | Type | Key | Best For |
|-----------|------|-----|----------|
| HS256 | Symmetric | Single shared secret | Internal services (same trust boundary) |
| RS256 | Asymmetric | Private key signs, public key verifies | Distributed systems, third-party verification |
| ES256 | Asymmetric (ECC) | Smaller keys than RSA | Mobile apps, limited bandwidth |

\`\`\`typescript
// HS256 — same secret on both ends (simple but less secure)
const token = jwt.sign({ userId: "123" }, "my-secret", { algorithm: "HS256" });
const decoded = jwt.verify(token, "my-secret");

// RS256 — private key signs, public key verifies
const token = jwt.sign({ userId: "123" }, privateKey, { algorithm: "RS256" });
const decoded = jwt.verify(token, publicKey);
// Client-facing APIs use RS256 — anyone can verify with the public key
\`\`\`

---

## Security Pitfalls

### 1. "alg": "none" Attack

\`\`\`javascript
// BAD: Not checking the algorithm
const decoded = jwt.verify(token, secret);

// Attacker sends:
eyJhbGciOiJub25lIn0.eyJ1c2VySWQiOiJhZG1pbiJ9.
// This verifies successfully without a signature!

// GOOD: Always specify algorithm
const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
\`\`\`

### 2. Algorithm Confusion

If the server expects RS256 but the client sends HS256 with the server's PUBLIC key as the secret:

\`\`\`javascript
// Server expects RS256, but doesn't check:
const decoded = jwt.verify(token, PUBLIC_KEY); // PUBLIC_KEY is publicly known!

// Attacker creates a token signed with HS256 using the PUBLIC_KEY as the secret:
const fakeToken = jwt.sign({ admin: true }, PUBLIC_KEY, { algorithm: "HS256" });
// Server verifies with PUBLIC_KEY, and the signature matches!
\`\`\`

**Fix:** Always verify \`algorithms: ["RS256"]\` and never accept a token signed with the opposite algorithm type.

### 3. Not Validating Expiration

\`\`\`javascript
const decoded = jwt.verify(token, secret, { ignoreExpiration: true }); // BAD!
\`\`\`

### 4. Storing JWTs in localStorage

\`\`\`javascript
// BAD: XSS can read localStorage
localStorage.setItem("token", jwt);

// BETTER: httpOnly cookie (not accessible to JS)
document.cookie = \`token=\${jwt}; HttpOnly; Secure; SameSite=Strict; Path=/\`;
\`\`\`

---

## Token Revocation

JWTs are stateless — once issued, they cannot be revoked without infrastructure:

\`\`\`typescript
// Strategy 1: Short TTL + Refresh Token Rotation
// Access token: 15 minutes
// Refresh token: 7 days, rotated on each use
async function refreshTokens(refreshToken: string) {
  // Verify refresh token
  const payload = await verifyRefreshToken(refreshToken);

  // Issue new access + refresh tokens
  const newAccess = signAccessToken(payload.userId);
  const newRefresh = await generateRefreshToken(payload.userId);

  // Invalidate the old refresh token (rotation!)
  await invalidateRefreshToken(refreshToken);

  return { accessToken: newAccess, refreshToken: newRefresh };
}

// Strategy 2: Token Blacklist (for immediate revocation)
const isBlacklisted = await redis.sismember("token_blacklist", tokenJti);
if (isBlacklisted) throw new Error("Token revoked");
\`\`\`

---

## Practice Questions

1. **Q:** What is the "alg: none" attack and how do you prevent it?
   **A:** An attacker sets the JWT header's algorithm to "none" and removes the signature. If the server trusts the header without verifying, the token is accepted. Fix: always specify the accepted algorithms in \`jwt.verify()\`.

2. **Q:** Why is RS256 preferred over HS256 for microservices?
   **A:** With RS256, the signing key (private) and verification key (public) are separate. Only the auth service has the private key. All other services only need the public key to verify — they cannot sign new tokens. If HS256 is used, every service that verifies tokens also has the power to mint them.

3. **Q:** What is the purpose of the \`jti\` (JWT ID) claim?
   **A:** The \`jti\` is a unique identifier for the token. It enables token blacklisting — if a token needs to be revoked, its \`jti\` is added to a blacklist. It also detects token replay (if the same token is used twice with the same jti, reject).

4. **Q:** Can a JWT be encrypted?
   **A:** JWT is signed, not encrypted — anyone with the base64-decoded payload can read the claims. For encrypted tokens, use JWE (JSON Web Encryption). Most applications only need JWS (signed), as sensitive data should not be placed in the payload.

5. **Q:** How do you handle JWT expiration for long-running operations?
   **A:** Use refresh tokens. The API endpoint returns 401 when the access token expires. The client uses the refresh token (stored securely, rotated on use) to get a new access token. For very long operations, use a service account token with longer expiration.

---

## Summary Cheat Sheet

\`\`\`
JWT = base64(header) + "." + base64(payload) + "." + signature

Header: { alg, typ, kid }
Payload: { sub, iss, aud, exp, iat, jti, custom claims }
Signature: HMAC(header + "." + payload, secret)

Signing:
  HS256: shared secret — simple, same trust boundary
  RS256: private signs, public verifies — distributed systems
  ES256: ECC-based — smaller keys, mobile-friendly

Security Rules:
  1. ALWAYS specify algorithms in verify()
  2. NEVER accept "alg: none"
  3. NEVER store in localStorage (use httpOnly cookies)
  4. ALWAYS validate exp (expiration)
  5. Use RS256 for multi-service architecture
  6. Rotate refresh tokens on each use`,
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
            content: `## Why This Matters (Read This First)

Cryptography is the foundation of web security. TLS encrypts every HTTPS connection. Password hashing protects user credentials. Digital signatures verify software integrity.

You should NEVER implement cryptographic algorithms yourself. Use battle-tested libraries. But you MUST understand the concepts to make correct choices.

---

## Symmetric Encryption (AES-GCM)

Same key encrypts and decrypts:

\`\`\`typescript
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Encryption
const algorithm = "aes-256-gcm";
const key = randomBytes(32); // 256-bit key
const iv = randomBytes(12);  // 96-bit IV (nonce) — MUST be unique per encryption

const cipher = createCipheriv(algorithm, key, iv);
let encrypted = cipher.update("Sensitive data", "utf8", "hex");
encrypted += cipher.final("hex");
const authTag = cipher.getAuthTag().toString("hex");

// Decryption
const decipher = createDecipheriv(algorithm, key, iv);
decipher.setAuthTag(Buffer.from(authTag, "hex"));
let decrypted = decipher.update(encrypted, "hex", "utf8");
decrypted += decipher.final("utf8");
console.log(decrypted); // "Sensitive data"
\`\`\`

**AES-GCM** (Galois/Counter Mode) provides both confidentiality and integrity (authentication tag). Use GCM, not ECB or CBC.

---

## Asymmetric Encryption (RSA, ECC)

Public key encrypts, private key decrypts:

\`\`\`typescript
import { generateKeyPairSync, publicEncrypt, privateDecrypt } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 4096, // 2048 minimum, 4096 recommended
});

const encrypted = publicEncrypt(publicKey, Buffer.from("Secret message"));
const decrypted = privateDecrypt(privateKey, encrypted);
\`\`\`

RSA is slow — typically used to encrypt a **symmetric key** (hybrid encryption) rather than the full payload. ECC (Elliptic Curve Cryptography) provides equivalent security with smaller keys (256-bit ECC ≈ 3072-bit RSA).

---

## TLS 1.3 Handshake

\`\`\`
Client                                 Server
  │                                       │
  │── ClientHello (key_share + sig_algs) →│
  │                                       │
  │← ServerHello + Certificate + Finished │
  │  (encrypted extensions)               │
  │                                       │
  │── Finished ───────────────────────────→│
  │                                       │
  │← Application Data (encrypted) ────────│
  │                                       │

1 RTT (vs TLS 1.2: 2 RTT)
0-RTT: client can send data IMMEDIATELY if it has cached session ticket
\`\`\`

**Forward Secrecy:** Ephemeral Diffie-Hellman (ECDHE) keys are generated per-session and discarded. Even if the server's long-term private key leaks, past sessions cannot be decrypted.

---

## Password Hashing

Passwords must NOT be stored as plaintext, MD5, SHA256, or even salted SHA256. Use **adaptive hashing** algorithms:

\`\`\`typescript
import { hash, compare } from "bcrypt";

// Hash (cost factor 12 = ~250ms on modern hardware)
const passwordHash = await hash("user_password", 12);

// Verify
const isValid = await compare("user_password", passwordHash);
\`\`\`

| Algorithm | Designed By | Cost Factor | Best For |
|-----------|-------------|-------------|----------|
| bcrypt | 1999 | Work factor (2^N rounds) | General purpose |
| Argon2id | 2015 (PHC winner) | Memory + time + parallelism | Modern systems, high security |
| scrypt | 2009 | Memory + time + parallelism | Cryptocurrency, resource-intensive |

\`\`\`typescript
// Argon2id (preferred for new systems)
import { hash, verify } from "@node-rs/argon2";

const hash = await hash("password", {
  memoryCost: 19456, // 19 MB
  timeCost: 2,       // iterations
  parallelism: 1,
});
\`\`\`

---

## What NOT to Implement Yourself

| Do NOT Build | Use Instead |
|-------------|-------------|
| Custom encryption algorithm | AES-GCM (libsodium, Node crypto) |
| Custom hash function | SHA-256, SHA-3 |
| Custom TLS | OpenSSL, BoringSSL, rustls |
| Custom JWT library | jsonwebtoken, jose |
| Custom password hashing | bcrypt, Argon2id |
| Random number generation | crypto.randomBytes (NOT Math.random) |

\`\`\`javascript
// NEVER use Math.random() for security
const badToken = Math.random().toString(); // Predictable!

// ALWAYS use crypto.randomBytes
const goodToken = crypto.randomBytes(32).toString("hex"); // Cryptographically secure
\`\`\`

---

## Practice Questions

1. **Q:** Why should you NEVER use ECB mode for AES encryption?
   **A:** ECB encrypts each 16-byte block independently. Identical plaintext blocks produce identical ciphertext blocks. This leaks data patterns — the classic example is that an encrypted image still shows the silhouette through the ciphertext.

2. **Q:** What is forward secrecy and why does it matter?
   **A:** Forward secrecy ensures that if a server's long-term private key is compromised, past sessions cannot be decrypted. TLS 1.3 achieves this with ephemeral Diffie-Hellman (ECDHE) — a one-time key pair per session that is discarded after use.

3. **Q:** Why is bcrypt better than SHA256 for password hashing?
   **A:** SHA256 is designed to be FAST — you can compute billions of hashes per second on a GPU. bcrypt is designed to be SLOW — it includes a configurable cost factor that increases computation time. This makes brute-force attacks economically infeasible.

4. **Q:** What is a nonce (IV) in AES-GCM and what happens if you reuse it?
   **A:** The nonce (12 bytes) must be unique for every encryption with the same key. Reusing the nonce allows an attacker to recover the authentication key and forge messages, and also to XOR ciphertexts to recover plaintexts. Never reuse a nonce.

5. **Q:** Can you encrypt with a private key and decrypt with a public key?
   **A:** No. In asymmetric cryptography, the PUBLIC key encrypts and the PRIVATE key decrypts. However, the private key can SIGN (prove authorship) and the public key verifies the signature. This is the opposite direction and uses a different algorithm (RSA-PSS, ECDSA).

---

## Summary Cheat Sheet

\`\`\`
Symmetric: same key → encrypt + decrypt
  AES-GCM: fast, authenticated encryption
  Key: 256-bit, IV: 96-bit unique nonce

Asymmetric: public key encrypts, private key decrypts
  RSA: 2048-4096 bit, slow, large keys
  ECC: 256-bit = RSA 3072-bit security, smaller keys
  Use: hybrid encryption (RSA/ECC encrypts AES key)

TLS 1.3:
  • 1-RTT handshake (0-RTT for repeat connections)
  • Forward secrecy via ECDHE
  • Mandatory encryption (no plaintext options)

Password Hashing:
  bcrypt: cost factor 12+ (industry standard)
  Argon2id: memory-hard, PHC winner (future standard)
  NEVER: plaintext, MD5, SHA256, fast hashes

Golden Rule: NEVER implement crypto yourself. Use libraries.`,
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
            content: `## Why This Matters (Read This First)

TypeScript ORMs eliminate entire categories of bugs. If your database schema changes, your TypeScript code will not compile until you update the queries. No more runtime "column not found" errors.

Prisma and Drizzle are the two dominant TypeScript ORMs. They take opposite approaches: Prisma uses a **declarative schema file**; Drizzle uses **code-first TypeScript definitions**.

---

## Prisma — Declarative Schema, Generated Client

Prisma uses a custom schema language (\`schema.prisma\`) and generates a fully typed client.

\`\`\`prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
}
\`\`\`

Run \`npx prisma generate\` → fully typed client:

\`\`\`typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fully typed — autocomplete for all fields
const user = await prisma.user.findUnique({
  where: { email: "alice@example.com" },
  include: {
    posts: {
      select: { title: true, createdAt: true },
    },
  },
});
// user.posts[0].title — fully typed to string
\`\`\`

### Prisma Migrations

\`\`\`bash
# After changing schema.prisma:
npx prisma migrate dev --name add_bio_field
# Prisma diffs against the database and generates SQL:
# ALTER TABLE "User" ADD COLUMN "bio" TEXT;
\`\`\`

### Prisma Limitations

- **N+1 is easy to trigger accidentally** — \`include\` loads relations in separate queries unless you use \`relationLoadStrategy: "join"\`
- **Raw queries escape type safety** — \`$queryRaw\` returns \`unknown\`
- **Codegen step** — you must run \`prisma generate\` after every schema change

---

## Drizzle — Code-First, SQL-Like API

Drizzle defines tables as TypeScript objects — no codegen, no custom schema language:

\`\`\`typescript
import { pgTable, serial, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  metadata: jsonb("metadata").$type<{ avatar?: string; timezone?: string }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  authorId: uuid("author_id").references(() => users.id),
});
\`\`\`

Queries use a SQL-like chaining API:

\`\`\`typescript
import { db } from "./db";
import { users, posts } from "./schema";
import { eq } from "drizzle-orm";

// SELECT with JOIN — fully typed
const result = await db
  .select({
    userName: users.name,
    postTitle: posts.title,
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .where(eq(users.email, "alice@example.com"));

// INSERT
const newUser = await db.insert(users).values({
  email: "bob@example.com",
  name: "Bob",
}).returning();

// UPDATE
await db.update(users)
  .set({ name: "Bob Updated" })
  .where(eq(users.id, "some-uuid"));
\`\`\`

### Drizzle Migrations

\`\`\`bash
npx drizzle-kit generate   # generates SQL from schema changes
npx drizzle-kit migrate    # runs migrations
\`\`\`

---

## Prisma vs Drizzle

| Aspect | Prisma | Drizzle |
|--------|--------|---------|
| Schema | \`schema.prisma\` (DSL) | TypeScript code |
| Codegen | Required (\`prisma generate\`) | None (types inferred) |
| Query API | Objects (\`findUnique\`, \`include\`) | SQL-like chaining |
| Raw SQL | \`$queryRaw\` (untyped) | \`sql\` template tag (partial types) |
| Migration | Auto-generated (diff-based) | Generated SQL files |
| Bundle size | Large (big client) | Tiny (tree-shakeable) |
| Complex queries | Awkward | Natural (SQL-in-type) |

---

## Practice Questions

1. **Q:** When would you choose Prisma over Drizzle?
   **A:** When rapid prototyping and CRUD-heavy apps are your priority. Prisma's findUnique/create/update API is simpler for basic operations, and the auto-generated migrations require less manual effort.

2. **Q:** When would you choose Drizzle over Prisma?
   **A:** When you need complex queries (subqueries, CTEs, aggregations), maximum performance, or a minimal bundle. Drizzle's SQL-like API makes complex queries readable, and its tree-shakeable client has near-zero overhead.

3. **Q:** How does Drizzle achieve type safety without code generation?
   **A:** Drizzle uses TypeScript's type inference on the table definitions. The \`pgTable\` function returns a typed object where column types are inferred. The query builder chains methods and propagates types through operations like \`.select()\`, \`.where()\`, and \`.leftJoin()\`.

4. **Q:** What is the N+1 problem in Prisma and how do you avoid it?
   **A:** Prisma's \`include\` loads relations with separate queries by default. With 100 users + posts, that is 1 query for users + 100 queries for posts. Use \`relationLoadStrategy: "join"\` to emit a SQL JOIN instead.

5. **Q:** Can you use Drizzle with an existing database that has no TypeScript definitions?
   **A:** Yes. Use \`drizzle-kit pull\` to introspect the database and generate the TypeScript schema file automatically. This is similar to Prisma's \`db pull\`.

---

## Summary Cheat Sheet

\`\`\`
Prisma:
  • Declarative schema → generated client
  • Simple CRUD (findUnique, create, update)
  • Auto-generated migrations
  • N+1 risk with include
  • Larger bundle

Drizzle:
  • TypeScript code = schema (no codegen)
  • SQL-like API (select, where, join)
  • Fully tree-shakeable
  • Complex queries are natural
  • Smaller bundle

Both:
  • Full TypeScript type safety
  • PostgreSQL, MySQL, SQLite support
  • Migration tooling
  • Active communities

Choose Prisma for: CRUD-heavy, rapid dev, teams new to TS
Choose Drizzle for: complex queries, performance, bundle size`,
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
            content: `## Why This Matters (Read This First)

Sometimes you do NOT want an ORM. You want full control over SQL — with all the type safety TypeScript can provide. Kysely fills this gap: it is a **type-safe SQL query builder**, not an ORM.

Kysely does not manage relationships, does not have an identity map, and does not auto-fetch relations. It generates SQL strings with compile-time type checking. Perfect for complex reporting queries, multi-table aggregations, and teams that prefer explicit SQL.

---

## Schema Definition

Kysely defines types from your database schema:

\`\`\`typescript
import { Generated, ColumnType } from "kysely";

export interface Database {
  users: UserTable;
  posts: PostTable;
}

interface UserTable {
  id: Generated<string>;      // auto-generated UUID
  email: string;
  name: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

interface PostTable {
  id: Generated<string>;
  title: string;
  content: string | null;
  author_id: string;
}
\`\`\`

---

## Queries

\`\`\`typescript
import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.DATABASE_URL }),
  }),
});

// SELECT with JOIN — fully typed
const result = await db
  .selectFrom("users")
  .innerJoin("posts", "posts.author_id", "users.id")
  .select([
    "users.name",
    "users.email",
    "posts.title",
  ])
  .where("users.email", "=", "alice@example.com")
  .execute();
// result: { name: string | null; email: string; title: string }[]

// INSERT
const newUser = await db
  .insertInto("users")
  .values({ email: "bob@example.com", name: "Bob" })
  .returningAll()
  .executeTakeFirst();

// UPDATE with complex WHERE
await db
  .updateTable("users")
  .set({ name: "Bob Updated" })
  .where("email", "in", ["bob@example.com", "bob2@example.com"])
  .execute();

// DELETE
await db
  .deleteFrom("posts")
  .where("author_id", "=", "some-uuid")
  .execute();
\`\`\`

---

## Complex Queries — Where Kysely Shines

\`\`\`typescript
// CTE (Common Table Expression)
const averageRating = db
  .with("avg_rating", (qb) =>
    qb
      .selectFrom("reviews")
      .select([sql<number>\`AVG(rating)\`.as("avg"), "product_id"])
      .groupBy("product_id")
  )
  .selectFrom("products")
  .leftJoin("avg_rating", "avg_rating.product_id", "products.id")
  .select([
    "products.name",
    "avg_rating.avg",
  ])
  .where("products.category", "=", "electronics")
  .execute();

// Subquery in WHERE
const topUsers = await db
  .selectFrom("users")
  .selectAll()
  .where("id", "in",
    db.selectFrom("orders")
      .select("user_id")
      .where("total", ">", 1000)
      .groupBy("user_id")
      .having(sql\`COUNT(*)\`, ">", 10)
  )
  .execute();
\`\`\`

---

## Schema Introspection

Use \`kysely-codegen\` to generate TypeScript types from your live database:

\`\`\`bash
npx kysely-codegen --dialect postgres --out-file src/db/types.ts
# This reads your database schema and generates:
#   export interface Database { ... }
#   export interface UserTable { ... }
\`\`\`

---

## Practice Questions

1. **Q:** How is Kysely different from Prisma and Drizzle?
   **A:** Kysely is a query builder, not an ORM. It has no concept of relations, no identity map, no lazy loading. You write explicit JOINs. This gives you full control over SQL generation with compile-time type checking. Kysely is closer to the SQL than either Prisma or Drizzle.

2. **Q:** When would you use Kysely over Prisma?
   **A:** For complex reporting queries, CTEs, window functions, bulk operations, or when you want to write SQL directly but with TypeScript types. For CRUD-heavy apps, Prisma or Drizzle require less code.

3. **Q:** How does Kysely handle migrations?
   **A:** Kysely does not have a built-in migration system. Use a separate tool like \`node-pg-migrate\`, \`umzug\`, or \`db-migrate\`. Or use Drizzle Kit for migrations with Kysely for queries.

4. **Q:** Can Kysely be used with Drizzle migrations?
   **A:** Yes. Use \`drizzle-kit\` for migration generation and Kysely for query building. They operate at different layers — Drizzle Kit generates SQL, Kysely executes queries.

5. **Q:** Is Kysely production-ready?
   **A:** Yes. Kysely is mature, extensively tested, and used in production by many teams. It supports PostgreSQL, MySQL, SQLite, and MSSQL.

---

## Summary Cheat Sheet

\`\`\`
Kysely:
  Type-safe SQL query builder (not an ORM)
  No relations, no identity map, no lazy loading

API style:
  selectFrom → innerJoin → where → select → execute
  insertInto → values → returning → executeTakeFirst
  updateTable → set → where → execute
  deleteFrom → where → execute

Features:
  • Full TypeScript type inference
  • CTEs, subqueries, window functions
  • Schema introspection via kysely-codegen
  • Migration-agnostic (use your own)
  • Transaction support
  • Raw SQL with sql\`\` template tag

Use when: complex queries, full SQL control, no ORM overhead
Use instead: Prisma/Drizzle for CRUD-heavy apps`,
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
            content: `## Why This Matters (Read This First)

Large Language Models (LLMs) like GPT-4, Claude, and Gemini are transforming backend development. Understanding how they work — tokens, context windows, temperature, and prompting — is essential for building AI-powered features.

Every LLM call costs money. Every token matters. This article covers the fundamentals you need to use LLMs effectively in production.

---

## Tokenization

LLMs do not read text character by character. They tokenize it — split into chunks of ~0.75 words each.

\`\`\`
"Hello, world! How are you today?"

→ ["Hello", ",", " world", "!", " How", " are", " you", " today", "?"]
→ 9 tokens
\`\`\`

\`\`\`python
import tiktoken  # OpenAI's tokenizer

enc = tiktoken.get_encoding("cl100k_base")
tokens = enc.encode("Hello, world! How are you today?")
print(len(tokens))  # 9
print(enc.decode(tokens))  # "Hello, world! How are you today?"
\`\`\`

**Cost is measured in tokens** — both input (prompt) and output (completion). GPT-4o costs $2.50/1M input tokens, $10/1M output tokens. A 1000-word article is ~1,500 tokens.

---

## Context Window

The **context window** is the maximum number of tokens the LLM can consider at once:

| Model | Context Window |
|-------|---------------|
| GPT-4o | 128K tokens |
| GPT-4 Turbo | 128K tokens |
| Claude 3.5 Sonnet | 200K tokens |
| Claude 3 Opus | 200K tokens |
| Gemini 1.5 Pro | 1M tokens |
| Llama 3 70B | 8K-32K tokens |

\`\`\`typescript
// Sending a large document? Stay within context window.
const prompt = \`
Document: \${longDocument.substring(0, 100000)}  // truncate to 100K chars
Question: \${question}
\`;
\`\`\`

---

## Temperature, Top-P, and Other Parameters

| Parameter | Range | Effect | Use Case |
|-----------|-------|--------|----------|
| temperature | 0-2 | Controls randomness. 0 = deterministic, 2 = very random | 0 for extraction/classification, 0.7 for chat |
| top_p | 0-1 | Nucleus sampling — only consider tokens with cumulative probability > top_p | 1 for default, 0.9 for slight filtering |
| max_tokens | 1-N | Maximum output tokens | Set to limit cost and prevent runaway generation |
| stop | strings[] | Stop generation when any string is encountered | \["\\n\\n", "Human:"\] for structured output |

\`\`\`typescript
// Deterministic (temperature=0) — for classification
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "Classify the sentiment as POSITIVE, NEGATIVE, or NEUTRAL. Respond with only one word." },
    { role: "user", content: "I love this product!" },
  ],
  temperature: 0,
  max_tokens: 10,
});
// Response: "POSITIVE"
\`\`\`

---

## Prompt Engineering Patterns

### System Prompt

The most important prompt — it sets the LLM's behavior:

\`\`\`typescript
const messages = [
  {
    role: "system",
    content: \`You are a helpful customer support assistant for Acme Corp.
    - Be concise and professional
    - If you don't know the answer, say "I don't know" — do not make up information
    - Never share internal policies or pricing unless asked
    - Format responses in markdown\`,
  },
  { role: "user", content: userMessage },
];
\`\`\`

### Few-Shot Prompting

Provide examples in the prompt — more reliable than instructions alone:

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "Extract structured data from text." },
    {
      role: "user",
      content: \`Text: "My name is Alice and I live in New York"
      Output: {"name": "Alice", "city": "New York"}

      Text: "\${userText}"
      Output:\`,
    },
  ],
  temperature: 0,
});
\`\`\`

### Structured Output

Most providers now support **JSON mode**:

\`\`\`typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "Extract information as JSON." },
    { role: "user", content: \`Extract: \${userText}\` },
  ],
  response_format: { type: "json_object" }, // Guarantees valid JSON
});
\`\`\`

---

## Streaming

Streaming reduces perceived latency — the user sees the first token in milliseconds instead of waiting for the full response:

\`\`\`typescript
const stream = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Write a short poem" }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
  // Token by token: "The" → " sun" → " sets" → " slow"...
}
\`\`\`

---

## Practice Questions

1. **Q:** What happens when the input exceeds the context window?
   **A:** The LLM cannot process tokens beyond its context window. Most providers truncate from the beginning (losing earlier context) or reject the request. Choose a model with sufficient context length for your use case.

2. **Q:** Temperature 0 guarantees deterministic output, right?
   **A:** No. Even at temperature 0, floating-point arithmetic and GPU non-determinism can produce different outputs. For truly deterministic output, set seed parameter (supported by OpenAI) and use temperature 0.

3. **Q:** Why is the system prompt the most important part of the API call?
   **A:** The system prompt sets the LLM's behavior, tone, and constraints. It is processed first and has the most influence on the model's response style. A good system prompt reduces hallucination, enforces format, and defines boundaries.

4. **Q:** How do you estimate the cost of an LLM API call?
   **A:** Count input + output tokens. Input: \`tiktoken\` the prompt. Output: estimate based on expected response length. Multiply by per-token price. For GPT-4o, a 2000-token prompt + 500-token response costs (2000 × $2.50/1M) + (500 × $10/1M) = $0.01.

5. **Q:** What is the difference between temperature and top_p?
   **A:** Temperature scales the log probabilities before sampling — higher temperature makes low-probability tokens more likely. Top_p (nucleus sampling) selects from the smallest set of tokens whose cumulative probability exceeds p. Use one or the other, not both (set the unused to 1).

---

## Summary Cheat Sheet

\`\`\`
LLM Fundamentals:
────────────────
Tokenization: ~0.75 words/token
Context window: max tokens the model can process
Temperature: 0 (deterministic) → 2 (very random)
Top-p: nucleus sampling threshold
Max tokens: limit output length and cost

Prompting:
  System prompt → sets behavior (most important)
  Few-shot → examples in context
  Structured output → JSON mode
  Streaming → first token faster, progressive rendering

Cost:
  Input tokens × price + output tokens × price
  Use token counting libraries (tiktoken)
  Set max_tokens to prevent runaway generation`,
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
            content: `## Why This Matters (Read This First)

LLMs know a lot, but they do not know YOUR data. They cannot answer questions about your internal documentation, your product catalog, or your user's specific account. This is where **Retrieval-Augmented Generation (RAG)** comes in.

RAG retrieves relevant chunks from your database and injects them into the LLM's context. The LLM generates answers grounded in your data — not from its training. This is how companies build customer support bots, internal knowledge assistants, and AI-powered search.

---

## RAG Architecture

\`\`\`
                      ┌──────────────────┐
                      │    Documents      │ (PDFs, wikis, code repos)
                      └────────┬─────────┘
                               │
                               ▼
┌──────────────────────────────────────────────┐
│                Ingestion Pipeline              │
│  1. Chunk (split documents into pieces)       │
│  2. Embed (convert chunks to vectors)         │
│  3. Index (store vectors in vector DB)        │
└──────────────────────────────────────────────┘
                               ▲
                               │
┌──────────────────────────────────────────────┐
│                Query Pipeline                  │
│  1. User question                              │
│  2. Embed question → query vector              │
│  3. Vector DB → top-K similar chunks           │
│  4. Add chunks to LLM context                  │
│  5. LLM generates answer grounded in chunks    │
└──────────────────────────────────────────────┘
\`\`\`

---

## Chunking — The Most Important Ingestion Step

Split documents into chunks that are:
- **Small enough** to fit in the context window
- **Semantically coherent** (paragraph boundaries, not 500-char splits)
- **Overlapping** (50-100 char overlap between chunks to avoid boundary loss)

\`\`\`typescript
function chunkDocument(text: string): string[] {
  // Simple approach: split by paragraphs, group into ~500-token chunks
  const paragraphs = text.split("\\n\\n");
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + para).length > 2000) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += "\\n\\n" + para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
\`\`\`

**Better chunking:** Use semantic chunkers (LangChain's RecursiveCharacterTextSplitter, Unstructured.io) that split on natural boundaries.

---

## Embedding Models

Convert text to vectors (arrays of floats):

\`\`\`typescript
import { OpenAI } from "openai";

const openai = new OpenAI();

async function embed(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",  // 1536 dimensions
    input: text,
  });
  return response.data[0].embedding;
}

// Store in pgvector:
// INSERT INTO embeddings (content, embedding) VALUES ($1, $2::vector)
\`\`\`

| Model | Dimensions | Cost | Quality |
|-------|-----------|------|---------|
| text-embedding-3-small | 1536 | $0.02/1M tokens | Good |
| text-embedding-3-large | 3072 | $0.13/1M tokens | Better |
| voyage-2 | 1024 | $0.10/1M tokens | Good |

---

## Vector Database — pgvector

\`\`\`sql
-- Enable pgvector extension
CREATE EXTENSION vector;

-- Create table with vector column
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536),  -- matches text-embedding-3-small dimensions
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX idx_embedding ON document_chunks
  USING hnsw (embedding vector_cosine_ops);  -- HNSW index (fast, approximate)

-- Query: find top-5 most similar chunks
SELECT content, 1 - (embedding <=> $1::vector) as similarity
FROM document_chunks
ORDER BY embedding <=> $1::vector  -- cosine distance (<=>)
LIMIT 5;
\`\`\`

---

## Generation — The LLM Call

\`\`\`typescript
async function answerQuestion(question: string): Promise<string> {
  // 1. Embed question
  const queryVector = await embed(question);

  // 2. Retrieve relevant chunks
  const chunks = await findSimilarChunks(queryVector, 5);

  // 3. Build context
  const context = chunks.map(c => c.content).join("\\n\\n---\\n\\n");

  // 4. Generate answer grounded in context
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: \`Answer the question based ONLY on the provided context.
        If the context does not contain the answer, say "I don't know."
        Cite the relevant parts of the context.\`,
      },
      {
        role: "user",
        content: \`Context:
\${context}

Question: \${question}\`,
      },
    ],
    temperature: 0,
  });

  return response.choices[0].message.content;
}
\`\`\`

---

## Practice Questions

1. **Q:** Why chunk documents instead of embedding the entire document?
   **A:** Long documents exceed context windows and produce poor embeddings (the vector averages out specific information). Smaller chunks match specific queries better. 500-1000 token chunks are the standard sweet spot.

2. **Q:** What is hybrid search and why use it?
   **A:** Hybrid search combines vector similarity (semantic meaning) with keyword search (exact term matching). Vector search finds concepts; keyword search finds exact phrases. Together they outperform either alone. Use BM25 + vector search with weighted scoring.

3. **Q:** How do you evaluate RAG quality?
   **A:** Measure (1) Hit rate — does the relevant chunk appear in the top-5 results? (2) MRR (Mean Reciprocal Rank) — how high is the relevant chunk ranked? (3) Faithfulness — does the generated answer match the retrieved context? (4) Answer relevance — does the answer address the question?

4. **Q:** What happens when the retrieved context is irrelevant?
   **A:** The LLM should say "I don't know" if instructed properly. Without the instruction, it may hallucinate based on its training data. Always instruct the LLM to answer only based on the provided context.

5. **Q:** How do you handle real-time data updates in RAG?
   **A:** When a document is updated: re-chunk → re-embed → update the vector database. For near-real-time, use CDC (Change Data Capture) to trigger reindexing. For batch updates, run the ingestion pipeline on a schedule.

---

## Summary Cheat Sheet

\`\`\`
RAG Pipeline:
  Ingest:  Document → Chunk → Embed → Index (Vector DB)
  Query:   Question → Embed → Retrieve (top-K) → Context → LLM → Answer

Key Components:
  Chunking: 500-1000 tokens, overlap, semantic boundaries
  Embedding: text-embedding-3-small (1536 dims), voyage-2
  Vector DB: pgvector, Pinecone, Weaviate, Qdrant
  Retrieval: vector search + keyword search (hybrid = best)
  Generation: system prompt + context + question → answer

Evaluation:
  Hit rate, MRR, faithfulness, answer relevance
  Always test on your domain-specific data`,
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
            content: `## Why This Matters (Read This First)

LLMs are expensive and unpredictable. A single unconstrained request can cost $1+ in compute and take 30 seconds to respond. Without guardrails, users can extract sensitive information or make your AI say things you will regret.

Production AI engineering is about controlling quality, managing costs, and ensuring safety — all while delivering a great user experience.

---

## Provider Landscape

| Provider | Best Model | Strengths | Weaknesses |
|----------|-----------|-----------|------------|
| OpenAI | GPT-4o | Best overall, function calling, JSON mode | Most expensive, rate limits |
| Anthropic | Claude 3.5 Sonnet | Long context (200K), safety, coding | Slower than GPT-4o |
| Google | Gemini 2.0 | 1M context, multi-modal, cheap | Less mature API |
| Meta | Llama 3 70B | Open source, self-host | Needs GPU infrastructure |
| Mistral | Mistral Large | European, open-weight | Smaller ecosystem |

---

## Cost Optimization

### Prompt Caching

Anthropic and OpenAI automatically cache repeated prompt prefixes:

\`\`\`typescript
// The system prompt is cached after the first request
// Subsequent requests pay ~50% less for the cached prefix
const messages = [
  { role: "system", content: VERY_LONG_SYSTEM_PROMPT }, // cached!
  { role: "user", content: userQuestion },
];
\`\`\`

### Model Tiering

Use different models for different tasks:

\`\`\`typescript
// Classification → cheap model
async function classifyIntent(text: string): Promise<string> {
  return cheapModel.call(text); // e.g., GPT-4o-mini: $0.15/1M tokens
}

// Complex generation → expensive model
async function generateReport(intent: string, context: string): Promise<string> {
  return expensiveModel.call(\`Generate a report for \${intent}...\`);
  // e.g., GPT-4o: $2.50/1M tokens
}
\`\`\`

### Fallback Chain

Try cheap model first, escalate to expensive on low confidence:

\`\`\`typescript
async function answer(query: string): Promise<string> {
  // Try fast/cheap model first
  const quickAnswer = await fastModel.call(query);

  // Request confidence score from the model
  if (quickAnswer.confidence > 0.9) return quickAnswer.text;

  // Escalate to expensive model for complex queries
  return expensiveModel.call(query);
}
\`\`\`

---

## Guardrails

### Input Guardrails — Prompt Injection Detection

\`\`\`typescript
// Check for prompt injection before the LLM call
function isPromptInjection(text: string): boolean {
  const injectionPatterns = [
    /ignore (all )?(previous|above) instructions/i,
    /system prompt/i,
    /you are (now |actually )/i,
    /forget everything/i,
  ];
  return injectionPatterns.some(p => p.test(text));
}

if (isPromptInjection(userInput)) {
  return { error: "Invalid input" };
}
\`\`\`

### Output Guardrails — Content Moderation

\`\`\`typescript
// Check LLM output before sending to user
async function moderateOutput(text: string): Promise<boolean> {
  const response = await openai.moderations.create({ input: text });
  return response.results[0].flagged; // true if content violates policy
}
\`\`\`

---

## Observability

Trace every LLM call:

\`\`\`typescript
import { trace } from "@opentelemetry/api";

async function tracedLLMCall(prompt: string): Promise<string> {
  const tracer = trace.getTracer("llm");
  const span = tracer.startSpan("openai.chat");

  span.setAttributes({
    "llm.model": "gpt-4o",
    "llm.prompt": prompt,
    "llm.prompt_tokens": countTokens(prompt),
  });

  const start = Date.now();
  const response = await openai.chat.completions.create({ /* ... */ });
  const duration = Date.now() - start;

  span.setAttributes({
    "llm.response": response.choices[0].message.content,
    "llm.duration_ms": duration,
    "llm.total_tokens": response.usage.total_tokens,
  });
  span.end();

  return response.choices[0].message.content;
}
\`\`\`

---

## Practice Questions

1. **Q:** How do you handle prompt injection attacks in production?
   **A:** (1) Input validation — detect known injection patterns; (2) Separate system prompt from user input — never concatenate user input into the system prompt; (3) Output validation — check LLM responses before sending to users; (4) Use instruction-tuned models that are better at following the system prompt.

2. **Q:** What is model tiering and why use it?
   **A:** Route simple queries to cheap models (GPT-4o-mini: $0.15/1M) and complex queries to expensive models (GPT-4o: $2.50/1M). Classification, simple Q&A, and extraction can use cheap models. Complex reasoning, creative writing, and code generation need expensive models.

3. **Q:** How do you estimate cloud costs for an LLM feature?
   **A:** (Average daily requests × avg input tokens × input price) + (avg daily requests × avg output tokens × output price) + embedding costs + vector DB costs. For a chatbot with 10K requests/day, 3000 input + 1000 output tokens using GPT-4o: ~$125/month in LLM costs.

4. **Q:** What is the role of a content moderation layer?
   **A:** It filters both input (user prompts) and output (LLM responses) for harmful content — hate speech, violence, sexual content, PII leaks, and policy violations. OpenAI's Moderation API or Azure AI Content Safety can be used.

5. **Q:** Why should you always set max_tokens on production LLM calls?
   **A:** Without max_tokens, an LLM can generate indefinitely — runaway responses can cost thousands of dollars and degrade user experience. Always set a reasonable limit based on your use case (e.g., 500 tokens for Q&A, 2000 for code generation).

---

## Summary Cheat Sheet

\`\`\`
Production AI Checklist:
────────────────────────
Cost:
  • Prompt caching (cache system prompt)
  • Model tiering (cheap → expensive escalation)
  • Max tokens set on every call
  • Monitor token usage per user/session

Safety:
  • Input guardrails (prompt injection detection)
  • Output guardrails (content moderation)
  • PII redaction
  • Rate limiting per user

Observability:
  • Trace every LLM call (OpenTelemetry)
  • Log: prompt, response, tokens, latency, model
  • Monitor: error rate, latency p50/p99, cost per user

Reliability:
  • Retries with exponential backoff
  • Fallback to cheaper model on timeout
  • Circuit breaker for provider outages`,
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
            content: `## Why This Matters (Read This First)

Every application runs as one or more **processes**. The operating system (Linux) manages which process runs when, how much CPU it gets, and ensures isolation between processes.

Understanding processes, threads, and the Linux scheduler is essential for diagnosing performance issues, configuring CPU limits in containers, and writing efficient multi-threaded applications.

---

## Processes vs Threads

| Aspect | Process | Thread (LWP) |
|--------|---------|---------------|
| Address space | Separate (isolated) | Shared with siblings |
| Creation | fork() — COW copy | clone() — shares memory |
| Overhead | High (full address space copy on write) | Low (shares address space) |
| Communication | IPC (pipes, sockets, shared memory) | Shared memory (direct) |
| Crash impact | Only that process dies | Can crash the entire process |

\`\`\`bash
# See all processes
ps aux
ps auxf  # tree view — shows parent-child relationships

# See threads within a process
ps -eLf | grep nginx
top -H -p <PID>
\`\`\`

---

## fork() and exec()

Creating a new process in Unix happens in two steps:

\`\`\`c
#include <unistd.h>
#include <sys/wait.h>

pid_t pid = fork();  // Step 1: copy this process

if (pid == 0) {
    // Child process — pid is 0 here
    execvp("/usr/bin/python3", args);  // Step 2: replace with new program
    // If exec fails, we reach here
    _exit(1);
} else {
    // Parent process — pid is the child's PID
    int status;
    waitpid(pid, &status, 0);  // Wait for child to finish
}
\`\`\`

**COW (Copy-on-Write):** \`fork()\` does NOT copy all memory immediately. Both parent and child share the same physical pages marked read-only. When either writes, a page fault triggers a copy. This makes fork() fast — ~1μs per 1MB of address space (only page tables are copied).

---

## CFS — Completely Fair Scheduler

The CFS is Linux's default scheduler since kernel 2.6.23:

\`\`\`
CFS maintains a red-black tree of runnable tasks, keyed by vruntime:
                     [vruntime=100]
                    /              \
          [vruntime=80]          [vruntime=120]
          /           \          /           \
[vruntime=70]  [vruntime=85]  [vruntime=110] [vruntime=130]

The leftmost node (lowest vruntime) is selected to run next.
vruntime increases based on the task's priority (nice value):
  • nice=0: vruntime runs at real time
  • nice=+19: vruntime runs at ~1/10 real time (low priority)
  • nice=-20: vruntime runs at ~10x real time (high priority)
\`\`\`

---

## Nice Values and Cgroups

### Nice Values (Process-Level Priority)

\`\`\`bash
# Start with low priority
nice -n 19 ./slow-task.sh

# Change priority of running process
renice -n 10 -p 1234

# Range: -20 (highest priority) to +19 (lowest)
# Normal users can only INCREASE nice value (lower priority)
# Root can set any value
\`\`\`

### Cgroups (Container-Level Limits)

Cgroups control resource limits for groups of processes — the foundation of container resource constraints:

\`\`\`bash
# Cgroup v2: limit a group to 0.5 CPU cores
echo "50000 100000" > /sys/fs/cgroup/cpu/mygroup/cpu.max
# 50ms CPU time per 100ms period = 0.5 core

# Limit memory to 512MB
echo "536870912" > /sys/fs/cgroup/memory/mygroup/memory.max
\`\`\`

Kubernetes resource requests and limits map directly to cgroup settings.

---

## Practice Questions

1. **Q:** What happens when a process calls \`fork()\`?
   **A:** The kernel creates a new process (child) that is an almost exact copy of the parent. Both continue executing from the same point after fork(). The child gets a new PID, and fork() returns 0 to the child and the child's PID to the parent.

2. **Q:** Why is \`fork()\` fast despite copying the entire process?
   **A:** Copy-on-Write (COW). \`fork()\` copies only page tables and marks all pages read-only. Physical pages are shared. When either process writes, a page fault triggers a copy of just that page. If the child immediately calls \`exec()\`, the address space is replaced and no write happens — zero physical page copies.

3. **Q:** What is the difference between nice -20 and nice +19?
   **A:** nice -20 is the highest priority — the process gets more CPU time relative to others. nice +19 is the lowest priority — the process runs only when nothing else needs the CPU. Both run, but the scheduler allocates CPU proportionally.

4. **Q:** How does a container (Docker) limit CPU usage?
   **A:** Docker sets cgroup cpu.max (v2) or cpu.cfs_quota_us/cpu.cfs_period_us (v1). The container's processes, regardless of how many, cannot exceed the quota. A limit of 0.5 cores means the container gets 50ms of CPU per 100ms period.

5. **Q:** What is a zombie process and how does it occur?
   **A:** A child process exits but the parent has not called wait()/waitpid() to read its exit status. The child remains as a "zombie" in the process table (shown as "Z" in ps). Zombies consume only a PID — no memory or CPU. They are cleaned up when the parent calls wait() or exits.

---

## Summary Cheat Sheet

\`\`\`
Process Lifecycle:
  fork() → create copy (COW)
  exec() → replace program
  exit() → terminate, signal parent
  wait() → reap exit status, clean up zombie

Scheduling (CFS):
  Red-black tree of tasks by vruntime
  Leftmost = next to run
  nice -20 → 10x priority
  nice +19 → 0.1x priority

Cgroups v2:
  cpu.max → max CPU time per period
  memory.max → max memory usage
  io.max → max I/O bandwidth

Thread vs Process:
  Thread: shares address space, fast creation, vulnerable
  Process: isolated address space, slow creation, robust`,
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
            content: `## Why This Matters (Read This First)

Memory is the fastest storage tier. Understanding how virtual memory, paging, and the MMU work is essential for performance debugging, configuring database memory limits, and avoiding the OOM killer.

Every \`malloc()\` returns a **virtual address**, not a physical one. The MMU (Memory Management Unit) translates virtual addresses to physical addresses on the fly, enabling isolation, overcommit, and file-backed memory (mmap).

---

## Virtual Address Space

Each process sees its own flat 64-bit address space:

\`\`\`
Typical process address space (x86-64 Linux):
┌──────────────────────┐ 0xFFFFFFFFFFFFFFFF
│      Kernel space     │ ← Inaccessible from user code
├──────────────────────┤ 0x7FFFFFFFFFFF (TASK_SIZE)
│       Stack           │ ← Grows downward
│          ↓            │
│                      │
│          ↑            │
│         Heap          │ ← Grows upward (brk/sbrk)
│      Data segment     │ ← Global/static variables
│      Text segment     │ ← Program code (read-only)
├──────────────────────┤
│  Memory-mapped files  │ ← mmap() regions
└──────────────────────┘ 0x0
\`\`\`

\`\`\`bash
# Inspect memory map of a process
cat /proc/1234/maps
# 555555554000-555555555000 r-xp 00000000 ... /usr/bin/ls  (text)
# 7ffff7ff7000-7ffff7ffa000 rw-p 00000000 ... [stack]
\`\`\`

---

## Page Tables and TLB

Virtual pages (4KB each) are mapped to physical frames via a multi-level page table:

\`\`\`
Virtual Address (48 bits):
┌─────────┬──────────┬──────────┬──────────┬──────────┐
│  PML4   │  PDPT    │   PD     │   PT     │  Offset  │
│ (9 bits)│ (9 bits) │ (9 bits) │ (9 bits) │ (12 bits)│
└────┬────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘
     │         │         │         │          │
     ▼         ▼         ▼         ▼          ▼
   Level 4 → Level 3 → Level 2 → Level 1 → Physical Frame (4KB)
\`\`\`

**TLB (Translation Lookaside Buffer)** — a cache of recent virtual→physical translations. TLB misses are expensive (~10-100 cycles). Modern CPUs have 64-1536 TLB entries.

\`\`\`bash
# Check TLB miss rate (requires perf)
perf stat -e dTLB-loads,dTLB-load-miss ./myapp
\`\`\`

---

## Page Faults

When a process accesses a virtual address with no valid page table entry:

| Fault Type | Cause | Kernel Action |
|------------|-------|---------------|
| Minor | Page is in memory but not in the page table | Add entry to TLB (fast ~1μs) |
| Major | Page must be loaded from disk (swap or mmap) | Read from disk (slow ~10ms) |
| Segmentation | Access to unmapped or forbidden address | Send SIGSEGV, kill process |

\`\`\`bash
# Monitor major page faults
pidstat -p 1234 -r 1  # page faults and memory stats
\# Or: /usr/bin/time -v ./myapp  (shows major/minor faults)
\`\`\`

---

## mmap — Memory-Mapped Files

\`mmap()\` maps a file or anonymous memory into the address space:

\`\`\`c
#include <sys/mman.h>
#include <fcntl.h>
#include <unistd.h>

int fd = open("data.bin", O_RDONLY);

// Map the entire file into memory
void *addr = mmap(NULL,            // let kernel choose address
                  file_size,       // length
                  PROT_READ,       // read-only
                  MAP_PRIVATE,     // COW on write
                  fd,              // file descriptor
                  0);              // offset

// Now we can access the file as a byte array:
char first_byte = ((char*)addr)[0];

// The kernel lazily loads pages on demand — much faster than read()
munmap(addr, file_size);
\`\`\`

---

## OOM Killer

When memory is exhausted, Linux invokes the **Out-Of-Memory Killer**:

\`\`\`bash
# Check OOM score for a process
cat /proc/1234/oom_score
# Higher score = more likely to be killed

# Adjust OOM score (lower = less likely to be killed)
echo -1000 > /proc/1234/oom_score_adj  # never kill (requires root)
echo 1000 > /proc/1234/oom_score_adj   # always kill first

# Tune vm.overcommit_ratio — percentage of RAM + swap available for overcommit
sysctl vm.overcommit_ratio=50  # default 50%
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between a minor page fault and a major page fault?
   **A:** Minor fault: the page is in RAM but not mapped in the process's page table (e.g., shared library pages, COW). Resolved in ~1μs by updating the page table. Major fault: the page is on disk (swap or mmap'd file). Requires a disk read — takes ~10ms, 10,000x slower.

2. **Q:** Why does \`mmap()\` outperform \`read()\` for large files?
   **A:** \`mmap()\` maps pages on demand — avoids copying data from kernel space to user space. \`read()\` copies data: disk → kernel buffer → user buffer. \`mmap()\` gives direct access to the kernel page cache, eliminating the copy.

3. **Q:** What happens when a process allocates more memory than physical RAM?
   **A:** Linux uses overcommit by default — \`malloc()\` succeeds even if the total allocated exceeds RAM+swap. Pages are not backed by physical frames until they are actually written. When real memory runs out, the OOM killer terminates a process to free memory.

4. **Q:** What is the TLB and why does it matter for performance?
   **A:** The TLB caches virtual→physical address translations. Modern CPUs access memory in 4KB pages. Without the TLB, every memory access would require walking a multi-level page table (4 memory accesses). With a 95% TLB hit rate, most accesses cost 0 extra cycles.

5. **Q:** What is huge pages (2MB/1GB) and when should you use them?
   **A:** Huge pages use larger page sizes, reducing TLB pressure (fewer entries needed for the same memory). A 2MB huge page covers 512 regular 4KB pages with one TLB entry. Use for databases, JVM heaps, and high-performance computing. Configure via \`/sys/kernel/mm/hugepages/\`.

---

## Summary Cheat Sheet

\`\`\`
Virtual Memory:
  • Each process has its own virtual address space
  • MMU translates virtual → physical via page tables
  • TLB caches recent translations (~1 cycle hit, ~100 cycles miss)

Page Faults:
  Minor: page in RAM, update page table (~1μs)
  Major: page on disk, load from swap/file (~10ms)
  SIGSEGV: invalid access (segmentation fault)

Memory Mapping:
  mmap: file → address space — page-fault-driven loading
  MAP_SHARED: changes visible to other processes
  MAP_PRIVATE: COW — changes not visible

OOM Killer:
  Scored by oom_score (memory usage + oom_score_adj)
  SYStem kills highest-scoring process when memory exhausted
  Tune with vm.overcommit_memory = 2 (disable overcommit)`,
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
            content: `## Why This Matters (Read This First)

Every file you read, every program you run, involves a filesystem. The **Virtual File System (VFS)** is the Linux kernel's elegant abstraction that makes all filesystems look the same to user-space programs.

Understanding inodes (the metadata behind every file), the page cache (why reads are fast after the first time), and journaling (how filesystems survive crashes) is essential for systems programming and database configuration.

---

## VFS — Virtual File System

VFS provides a uniform interface to any filesystem:

\`\`\`
User-space:  open()  read()  write()  close()
                ↓       ↓       ↓       ↓
            ┌──────────────────────────────────┐
            │         VFS Layer                 │
            │  (vfs_open, vfs_read, vfs_write)  │
            └──────┬──────┬──────┬──────┬──────┘
                   │      │      │      │
              ┌────┘  ┌───┘  ┌───┘  ┌──┘
              ▼       ▼      ▼      ▼
           ext4     XFS    tmpfs   ntfs3
\`\`\`

---

## Inodes — File Metadata

Every file and directory on disk has an **inode** — a metadata record:

\`\`\`bash
# View inode information
stat myfile.txt
# Output:
#   File: myfile.txt
#   Size: 1024        Blocks: 8        Inode: 123456
#   Access: 2024-01-15  (permissions)
#   Uid: 1000 (user)   Gid: 1000 (group)
#   Links: 1           (hard link count)

# Find inode number
ls -li myfile.txt  # -l = long, -i = show inodes
# 123456 -rw-r--r-- 1 user user 1024 Jan 15 10:00 myfile.txt
\`\`\`

**What an inode contains:**
- File size, permissions, owner, timestamps (atime, mtime, ctime)
- Pointers to data blocks (direct, indirect, double indirect, triple indirect)
- File type (regular, directory, symlink, device, socket)
- Link count (number of hard links to this inode)

**What an inode does NOT contain:**
- The filename! Filenames are stored in directory entries (dentry).

---

## Directories

A directory is a **file** that maps names to inodes:

\`\`\`
Directory file (contents):
┌────────────┬──────────┐
│ "file.txt" │ inode 123│
│ "script.sh"│ inode 456│
│ "subdir"   │ inode 789│
│ "."        │ inode 123│  ← current directory
│ ".."       │ inode 2  │  ← parent directory
└────────────┴──────────┘
\`\`\`

\`\`\`bash
# Hard link: same inode, different names
ln myfile.txt myhardlink.txt  # both point to inode 123
ls -li myfile.txt myhardlink.txt  # same inode number!

# Symlink: different inode containing path string
ln -s myfile.txt mysymlink.txt
# mysymlink.txt has its OWN inode, containing "myfile.txt"
\`\`\`

---

## Page Cache

The kernel caches disk blocks in RAM — the **page cache**:

\`\`\`
Process reads /etc/passwd:
1. Kernel checks page cache
2. Cache MISS → read from disk (slow, ~10ms)
3. Store in page cache
4. Copy to user buffer
5. Next read → cache HIT → zero disk I/O (fast, ~1μs)
\`\`\`

\`\`\`bash
# Check page cache usage
free -h
#              total   used   buff/cache
# Mem:         16G     4G     10G         ← 10GB of page cache!

# Clear page cache (for benchmarking)
echo 3 > /proc/sys/vm/drop_caches  # 1=pagecache, 2=dentries, 3=all

# Monitor page cache for a file
finfo myfile.txt  # or use mincore() system call
\`\`\`

---

## Journaling

Journaling prevents filesystem corruption after a crash:

\`\`\`
Without journaling (ext2):
  Writing file: write inode → write data blocks → ⚡ CRASH
  → Filesystem state: metadata and data inconsistent → fsck on next boot

With journaling (ext4, XFS):
  1. Write intent to journal ("about to write inode + data")
  2. ⚡ CRASH
  3. On reboot: replay journal → complete or rollback the operation
  → Filesystem is always consistent
\`\`\`

\`\`\`bash
# Check filesystem features
tune2fs -l /dev/sda1 | grep features
# Filesystem features: has_journal extents ...

# Journal modes (ext4):
# data=ordered (default): metadata journaled, data written before metadata
# data=writeback: metadata journaled, data not (fastest, least safe)
# data=journal: both metadata and data journaled (slowest, safest)
mount -o data=ordered /dev/sda1 /mnt
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between a hard link and a symbolic link?
   **A:** A hard link shares the same inode — it is literally the same file with a different name. A symbolic link is a separate file containing the path to the target. Hard links cannot span filesystems or directories. If the target of a symlink is deleted, the symlink is broken.

2. **Q:** How does the page cache speed up repeated file reads?
   **A:** The first read is slow (disk → kernel page cache → user buffer). Subsequent reads hit the page cache (memory → user buffer, no disk I/O). The kernel uses read-ahead to predictively cache sequential access patterns.

3. **Q:** Why does Linux show 10GB "used" by buff/cache but the system is not OOM?
   **A:** The page cache is reclaimable. When an application needs memory, the kernel evicts clean pages from the page cache. The page cache uses "free" memory that would otherwise be wasted — it improves performance without hurting availability.

4. **Q:** What happens during \`fsync()\`?
   **A:** \`fsync()\` flushes the file's dirty pages (modified in page cache but not yet on disk) and the filesystem metadata to the storage device. It blocks until the device confirms the data is persistent. This is why databases call fsync after every transaction.

5. **Q:** What is a dentry (directory entry) cache?
   **A:** The kernel caches parsed directory entries (filename → inode mappings) in the dentry cache. This avoids re-reading directory data from disk. \`ls -l\` on a warm cache has zero disk I/O. The dentry cache is separate from the page cache.

---

## Summary Cheat Sheet

\`\`\`
VFS: uniform interface → ext4, XFS, tmpfs, btrfs, FUSE

Inode:
  Metadata: size, permissions, timestamps, block pointers
  Does NOT store filename — filenames are in dentries

Page Cache:
  Caches disk blocks in RAM
  Clean pages = disk data (reclaimable)
  Dirty pages = modified (need fsync)

Journaling:
  Records intent before writing — crash-safe
  ext4 default: data=ordered
  XFS: metadata journaling only

Key syscalls:
  read/write → page cache (buffered I/O)
  mmap → map file into memory
  fsync → flush dirty pages to disk
  sync → fsync all dirty pages`,
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
            content: `## Why This Matters (Read This First)

TCP is the reliable transport layer that carries HTTP, SSH, databases, and most internet traffic. Understanding its mechanisms — the 3-way handshake, flow control, congestion control — is essential for diagnosing network performance and configuring systems for low latency.

A page load involves one or more TCP connections. Each new connection adds 1 round trip (the handshake). Combined with TLS, that is 2-3 round trips before any data flows.

---

## Sockets: The Unix I/O Abstraction

In Unix, everything is a file — including network connections:

\`\`\`c
int server_fd = socket(AF_INET, SOCK_STREAM, 0); // TCP socket
int enable = 1;
setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &enable, sizeof(enable));

struct sockaddr_in addr;
addr.sin_family = AF_INET;
addr.sin_port = htons(8080);
addr.sin_addr.s_addr = INADDR_ANY;

bind(server_fd, (struct sockaddr*)&addr, sizeof(addr));
listen(server_fd, SOMAXCONN);

while (1) {
    int client_fd = accept(server_fd, NULL, NULL);
    // handle client — same read/write/close API as files
}
\`\`\`

---

## 3-Way Handshake

\`\`\`
Client (browser)                   Server (nginx)
    │                                   │
    │ ── SYN (seq=1000) ──────────────→ │  Step 1: Client sends SYN
    │                                   │
    │ ← SYN-ACK (seq=5000, ack=1001) ── │  Step 2: Server responds
    │                                   │
    │ ── ACK (seq=1001, ack=5001) ────→ │  Step 3: Client acknowledges
    │                                   │
    │ ── [HTTP GET /] ────────────────→ │  Now data can flow!
    │                                   │
    1 round trip before data (RTT)
\`\`\`

Every HTTP request on a new TCP connection adds 1 RTT. For a user in Sydney connecting to a server in New York (~150ms RTT), that is 150ms just for the handshake.

---

## Flow Control — Sliding Window

The receiver advertises a **window** — how much data it is willing to receive:

\`\`\`
Sender (window=14600 bytes):               Receiver
    │                                            │
    │ ── segment 1 (1460 bytes) ──────────────→  │
    │ ── segment 2 (1460 bytes) ──────────────→  │
    │ ── segment 3 (1460 bytes) ──────────────→  │
    │ ... up to 10 segments (14,600 bytes)       │
    │                                            │
    │ ← ACK (ack=8761, window=29200) ──────────  │
    │   "Received up to byte 8760, I can take    │
    │    29200 more bytes"                       │
    │                                            │
\`\`\`

The window prevents the sender from overwhelming the receiver's buffer.

---

## Congestion Control

While flow control protects the receiver, **congestion control** protects the network. Linux uses CUBIC (default) or BBR:

\`\`\`
CUBIC Congestion Control:
                          ── packet loss!
                          │
  Congestion window   ────┘
  (cwnd)                   ┌── multiplicative decrease (halve cwnd)
                          │
                         ┌┘ exponential growth ←─ additive increase ──→
                         │ (slow start)          (congestion avoidance)
                         └──────────────►         ────────────────►
                            Time ────────────────────────────────────>
\`\`\`

\`\`\`bash
# Check which congestion control algorithm is in use
sysctl net.ipv4.tcp_congestion_control
# net.ipv4.tcp_congestion_control = bbr

# Available algorithms
sysctl net.ipv4.tcp_available_congestion_control
\`\`\`

---

## Nagle's Algorithm and TCP_NODELAY

Nagle's algorithm delays small writes to batch them into larger segments:

\`\`\`javascript
// BAD: Nagle delays interactive data
socket.write("H"); // Delayed — waits for more data or ACK
socket.write("i");

// FIX: Disable Nagle for low-latency apps
socket.setNoDelay(true); // TCP_NODELAY in Node.js

// In C:
int flag = 1;
setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, &flag, sizeof(flag));
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between flow control and congestion control?
   **A:** Flow control prevents the sender from overwhelming the RECEIVER's buffer (advertised window). Congestion control prevents the sender from overwhelming the NETWORK (cwnd — congestion window). TCP uses the minimum of both windows.

2. **Q:** What happens during TCP's slow start phase?
   **A:** The congestion window (cwnd) starts at 10 segments (~14KB) and doubles every RTT (exponential growth). When a packet is lost or cwnd reaches the slow start threshold, it switches to congestion avoidance (additive increase).

3. **Q:** What is the TIME_WAIT state and why is it necessary?
   **A:** When a TCP connection closes, the side that sends the last ACK enters TIME_WAIT (typically 60 seconds). It ensures the other side received the ACK (retransmits if not) and prevents delayed packets from a closed connection being mistaken for a new connection.

4. **Q:** How does TCP handle out-of-order packets?
   **A:** TCP uses sequence numbers to reorder packets on the receiving side. The receiver acknowledges the highest in-order byte received. Out-of-order packets are buffered. If packets are lost, TCP retransmits after a timeout.

5. **Q:** What does TCP_NODELAY do and when should you use it?
   **A:** It disables Nagle's algorithm, which batches small writes into larger packets. Use TCP_NODELAY for low-latency interactive applications (SSH, real-time games, chat). Do NOT use it for bulk transfers where batching improves throughput.

---

## Summary Cheat Sheet

\`\`\`
TCP Key Concepts:
  3-Way Handshake: SYN → SYN-ACK → ACK (1 RTT before data)
  Sliding Window: receiver's buffer capacity (flow control)
  Congestion Window: network capacity (congestion control)
  Sequence Numbers: detect loss, reorder packets
  Checksum: detect corruption

Congestion Control (CUBIC):
  Slow Start: double cwnd every RTT (exponential)
  Congestion Avoidance: +1 MSS per RTT (linear)
  Packet Loss: halve cwnd (multiplicative decrease)

Socket Options:
  TCP_NODELAY: disable Nagle (low latency)
  SO_REUSEADDR: reuse port after TIME_WAIT
  TCP_QUICKACK: send ACKs immediately (not delayed)

Monitoring:
  ss -ti  → TCP socket info (window, cwnd, RTT)
  netstat -s  → TCP statistics (retransmits, resets)
  tcpdump → packet-level inspection`,
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
            content: `## Why This Matters (Read This First)

DNS is the phonebook of the internet. When you type \`example.com\`, DNS translates it to an IP address like \`93.184.216.34\`. This translation involves a chain of servers, each caching results to make subsequent lookups faster.

A slow DNS lookup adds 50-200ms to every page load. A misconfigured DNS record can take down your email delivery or redirect traffic to the wrong server.

---

## Resolution Chain

\`\`\`
Your browser needs to connect to "www.example.com"

1. Browser cache → miss
2. OS stub resolver → checks /etc/hosts → miss
3. Recursive resolver (usually your ISP or 8.8.8.8):
   a. Root server → "who manages .com?"
   b. .com TLD server → "who manages example.com?"
   c. Authoritative server for example.com → "www.example.com = 93.184.216.34"
4. Returns IP to browser

Each step may be cached by the recursive resolver.
\`\`\`

\`\`\`bash
# Trace the full resolution chain
dig +trace www.example.com

# Quick lookup
nslookup www.example.com
host www.example.com

# Check which resolver your system uses
cat /etc/resolv.conf
# nameserver 8.8.8.8
# nameserver 1.1.1.1
\`\`\`

---

## Record Types

| Record | Purpose | Example |
|--------|---------|---------|
| A | Maps hostname to IPv4 address | \`www.example.com → 93.184.216.34\` |
| AAAA | Maps hostname to IPv6 address | \`www.example.com → 2606:2800:220:1:248:1893:25c8:1946\` |
| CNAME | Alias — maps one name to another | \`blog.example.com → example.github.io\` |
| MX | Mail server for the domain | \`example.com → mail.example.com (priority 10)\` |
| TXT | Arbitrary text — used for verification | \`SPF, DKIM, DMARC, domain verification\` |
| NS | Authoritative nameserver | \`example.com → ns1.example.com\` |
| SOA | Start of Authority — zone metadata | Admin email, serial, refresh intervals |

\`\`\`bash
# View all DNS records for a domain
dig example.com ANY

# Check mail servers
dig example.com MX

# Check CNAME chain
dig www.example.com CNAME +short
\`\`\`

---

## TTL — Time To Live

TTL controls how long a resolver caches a record:

\`\`\`bash
# Short TTL (60 seconds) — for fast propagation during changes
example.com. 60 IN A 93.184.216.34

# Long TTL (86400 seconds = 24 hours) — for stable records
example.com. 86400 IN MX 10 mail.example.com
\`\`\`

**Trade-off:**
- Short TTL (60s): changes propagate fast, but more DNS queries = higher resolver load
- Long TTL (86400s): fewer queries, but changes take 24 hours to propagate

For DNS migrations: lower TTL to 60 seconds 48 hours BEFORE the change, then make the change.

---

## DNSSEC

DNSSEC signs DNS records with cryptographic keys:

\`\`\`bash
# Check if a domain has DNSSEC
dig example.com DNSSEC

# Verify the DNSSEC chain
delv example.com

# Without DNSSEC: an attacker could intercept the DNS response
# and send you to a fake IP address (DNS spoofing / cache poisoning)
# With DNSSEC: the resolver verifies the signature before using the record
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between a recursive resolver and an authoritative nameserver?
   **A:** A recursive resolver (8.8.8.8, your ISP) does the work of following the chain from root → TLD → authoritative to find an IP. An authoritative nameserver (ns1.example.com) hosts the actual DNS records for a domain and responds with the definitive answer.

2. **Q:** Why can CNAME records not coexist with other record types at the same name?
   **A:** Per RFC, if a CNAME record exists for a name, no other record types are allowed at that name. The CNAME is an alias that redirects to another name where all other records exist. If you need both, use the root domain (example.com → A record) and CNAME www to the root.

3. **Q:** What is DNS prefetching and how does it improve page load time?
   **A:** Browsers use \`<link rel="dns-prefetch" href="//api.example.com">\` to resolve the domain to an IP before the user clicks the link. This saves the DNS lookup latency (typically 20-120ms) from the critical path.

4. **Q:** What happens when a DNS query returns multiple A records?
   **A:** The client typically picks one at random (round-robin DNS) or uses the first one. This is a simple form of load balancing. However, it does not account for server health — if one server goes down, clients may still try to connect to it.

5. **Q:** What is DNS-based failover and how does it work?
   **A:** A DNS provider monitors your servers and automatically updates A records to point only to healthy servers. If the primary server goes down, the DNS record changes to the secondary server's IP. The failover speed is limited by the TTL — records with shorter TTL fail over faster.

---

## Summary Cheat Sheet

\`\`\`
DNS Resolution:
  Stub resolver → Recursive resolver → Root → TLD → Authoritative

Record Types:
  A/AAAA: IPv4/IPv6 address
  CNAME: alias (no other records at same name)
  MX: mail server with priority
  TXT: text (SPF, DKIM, DMARC, verification)
  NS: authoritative nameserver
  SOA: zone metadata (serial, refresh, retry, expire, ttl)

TTL: cache duration — short TTL for fast propagation, long for stability

DNSSEC: cryptographic signing — prevents spoofing

Best Practices:
  • Use CNAME for www → root domain
  • Set TTL low before planned changes
  • Use separate TXT records for SPF, DKIM, DMARC
  • Monitor DNS resolution time in RUM (Real User Monitoring)`,
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
            content: `## Why This Matters (Read This First)

A single server can handle only so much traffic. Load balancers distribute requests across a pool of backend servers, improving both capacity and reliability.

Two types exist: **L4** (transport layer, faster) and **L7** (application layer, smarter). Choosing between them depends on whether you need to inspect HTTP headers or just route packets.

---

## L4 (Transport Layer) Load Balancing

Operates at TCP/UDP level — does not inspect the payload:

\`\`\`
Client → L4 LB (IP: 10.0.0.1:443)
                │
        ┌───────┼───────┐
        ▼       ▼       ▼
    Server A  Server B  Server C
    10.0.0.2  10.0.0.3  10.0.0.4

L4 LB forwards TCP segments without looking at the HTTP request.
\`\`\`

**Uses:** TCP/UDP traffic where payload inspection is not needed.
**Pros:** Very fast (kernel-level), low overhead, protocol-agnostic.
**Cons:** Cannot route based on URL, headers, or cookies.

---

## L7 (Application Layer) Load Balancing

Operates at HTTP level — can inspect and modify requests:

\`\`\`
Client → L7 LB (nginx/haproxy)
  GET /api/users → Server A
  POST /api/orders → Server B
  Host: admin.example.com → Server C
\`\`\`

**Uses:** HTTP APIs, microservices routing, TLS termination, canary deployments.
**Pros:** URL-based routing, header rewriting, session affinity (sticky cookies).
**Cons:** Higher overhead per request (parses HTTP).

---

## Load Balancing Algorithms

| Algorithm | How It Works | Best For |
|-----------|-------------|----------|
| Round Robin | Distributes requests in order | Equal-capacity servers |
| Weighted Round Robin | Servers with more weight get more requests | Unequal-capacity servers |
| Least Connections | Sends to server with fewest active connections | Varying request durations |
| IP Hash | Hash of client IP → same server | Sticky sessions (no cookie) |
| Random | Pick randomly | Simple, works well with many requests |

---

## Health Checks

Health checks remove unhealthy backends:

\`\`\`yaml
# HAProxy health check config
backend web-servers
    server web1 10.0.0.2:80 check inter 3000 fall 3 rise 2
    #         lb      addr:port  check every 3s, fail after 3, recover after 2
    server web2 10.0.0.3:80 check
    server web3 10.0.0.4:80 check
\`\`\`

**Active:** LB sends periodic probes (HTTP GET /health, TCP connect).
**Passive:** LB detects failures from actual traffic errors (503 responses, connection timeouts). Slower but zero overhead.

---

## Practice Questions

1. **Q:** When would you use L4 load balancing instead of L7?
   **A:** For non-HTTP protocols (gRPC, WebSocket, MQTT, database connections), or when raw performance is the priority and no content-based routing is needed. L4 has lower overhead because it does not parse the application protocol.

2. **Q:** What is session affinity (sticky sessions) and why is it problematic?
   **A:** Session affinity routes the same client to the same backend server. It is needed if session data is stored in-memory on the server. Problem: if that server goes down, the user loses their session. Fix: store sessions in a shared cache (Redis) so any server can handle any request.

3. **Q:** How does a load balancer handle a server that is "slow" but not down?
   **A:** Least Connections algorithm helps — the slow server has more active connections (because it processes requests slowly), so it gets fewer new requests. The LB should also set timeouts to detect slow responses.

4. **Q:** Can an L7 load balancer terminate TLS?
   **A:** Yes. TLS termination is a primary function of L7 LBs. The LB handles the TLS handshake (decrypts), forwards plain HTTP to backends, and encrypts the response if needed. This offloads CPU-intensive crypto from application servers.

5. **Q:** What is the difference between a load balancer and a reverse proxy?
   **A:** A reverse proxy (Nginx, HAProxy in proxy mode) routes to a single backend or set of backends but is primarily about security, caching, and TLS. A load balancer specifically distributes traffic across multiple backends for capacity and reliability. Most modern LBs are also reverse proxies.

---

## Summary Cheat Sheet

\`\`\`
L4 LB: TCP/UDP level, fast, protocol-agnostic
L7 LB: HTTP level, inspect/modify requests, TLS termination

Algorithms:
  Round Robin → equal distribution
  Least Connections → balance by load
  IP Hash → sticky sessions without cookies

Health Checks:
  Active → periodic probe (detect failure quickly)
  Passive → observe traffic errors (zero overhead)

Session Affinity:
  stick-table (HAProxy) or cookies (nginx)
  Use shared session store (Redis) instead`,
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
            content: `## Why This Matters (Read This First)

A reverse proxy sits between clients and your servers. It is the first line of defense — handling TLS, buffering, and routing before traffic reaches your application.

Nginx is the most popular reverse proxy. Envoy is the modern, high-performance proxy used in service meshes. Kong adds API gateway features on top of a reverse proxy.

---

## What a Reverse Proxy Does

\`\`\`
Client                    Reverse Proxy               Backend
  │                            │                        │
  │── HTTPS ─────────────────→│── HTTP ────────────────→│
  │  (TLS handshake)          │  (plain HTTP)            │
  │  (slow connection)        │  (fast connection)       │
  │                            │                        │
  │←──────────────────────────│←────────────────────────│
       buffered response          response from app
\`\`\`

### TLS Termination

The proxy handles SSL/TLS, freeing backends from crypto overhead:

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://backend:3000;  # plain HTTP to backend
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

### Buffering

The proxy buffers slow clients so fast backends are not held up:

\`\`\`nginx
location /api/ {
    proxy_buffering on;
    proxy_buffers 8 16k;
    proxy_buffer_size 32k;
    client_body_buffer_size 128k;
    # Backend sends data quickly → proxy buffers it → slow client reads at its pace
}
\`\`\`

---

## Nginx vs Envoy vs Kong

| Feature | Nginx | Envoy | Kong |
|---------|-------|-------|------|
| Language | C | C++ | Lua (on Nginx) / Go |
| Config reload | Reload signal | Hot reload via API | Admin API + DB |
| Plugin system | Limited (3rd party modules) | HTTP/gRPC filters | 200+ plugins |
| Service mesh | Not designed | Primary mesh proxy | Via Kong Mesh |
| Dynamic config | No (reload needed) | Yes (xDS API) | Yes (Admin API) |
| Use case | Traditional reverse proxy | Modern mesh/proxy | API Gateway |

---

## Envoy — Modern L7 Proxy

Envoy uses a **listener + filter chain** architecture:

\`\`\`yaml
static_resources:
  listeners:
  - name: main
    address:
      socket_address: { address: 0.0.0.0, port_value: 8080 }
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          stat_prefix: ingress_http
          route_config:
            virtual_hosts:
            - name: backend
              domains: ["*"]
              routes:
              - match: { prefix: "/api/" }
                route: { cluster: api_backend }
          http_filters:
          - name: envoy.filters.http.router
  clusters:
  - name: api_backend
    type: STRICT_DNS
    lb_policy: ROUND_ROBIN
    endpoints:
    - lb_endpoints:
      - endpoint:
          address:
            socket_address: { address: api.example.com, port_value: 3000 }
\`\`\`

---

## Practice Questions

1. **Q:** What is TLS termination and why offload it to the proxy?
   **A:** TLS termination means the proxy handles the SSL/TLS handshake and decryption. Offloading it saves backend servers from CPU-intensive crypto operations, centralizes certificate management (one place to rotate certs), and allows the proxy to inspect request content for routing and caching.

2. **Q:** What does Nginx's proxy_buffering do and when would you disable it?
   **A:** \`proxy_buffering\` collects the entire response from the backend before sending it to the client. Disable it for streaming responses (Server-Sent Events, WebSocket, large file downloads) where the client should receive data immediately as it is produced.

3. **Q:** How does Envoy's hot reload differ from Nginx's reload?
   **A:** Nginx requires a SIGHUP signal to reload config, which forks new worker processes (brief connection disruption). Envoy supports true hot reload via the xDS API — listeners, routes, clusters can be added/removed without any connection interruption.

4. **Q:** What is X-Forwarded-For and why is it important?
   **A:** When a reverse proxy forwards requests, the backend sees the proxy's IP, not the client's IP. X-Forwarded-For is a header inserted by the proxy containing the original client IP. The backend uses this for logging, rate limiting, and geo-location.

5. **Q:** When would you use a reverse proxy vs an API gateway?
   **A:** A reverse proxy for simple needs: TLS, routing, buffering, caching. An API gateway for complex needs: authentication, rate limiting, request transformation, API key management, analytics. A gateway is a reverse proxy with added features.

---

## Summary Cheat Sheet

\`\`\`
Reverse Proxy Functions:
  • TLS termination — offload SSL from backends
  • Buffering — slow clients don't tie up fast backends
  • Routing — path/host-based → different backends
  • Caching — serve cached responses (not just pass-through)
  • Compression — gzip/brotli before sending to client
  • Access control — IP whitelist/blacklist, basic auth

Nginx: classic proxy, static config
Envoy: modern proxy, dynamic config via xDS API
Kong: API gateway built on Nginx + OpenResty

Headers the proxy adds:
  X-Forwarded-For: original client IP
  X-Forwarded-Proto: http or https
  X-Real-IP: client IP (simpler alternative)`,
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
            content: `## Why This Matters (Read This First)

A Content Delivery Network (CDN) serves your static assets from servers physically close to your users. Instead of every user in the world connecting to your single server in Virginia, they get files from a CDN edge server in their city.

CDNs reduce latency, offload traffic from your origin server, and absorb DDoS attacks. Cloudflare, Fastly, and AWS CloudFront are the major players.

---

## How a CDN Works

\`\`\`
User in Tokyo ───→ CDN Edge (Tokyo)
                        │
                        │ cache miss? fetch from origin
                        │
User in London ───→ CDN Edge (London)
                        │
                        │ cache miss? fetch from origin
                        │
                  ┌─────┴──────┐
                  │  Origin     │
                  │  Server     │
                  │  (Virginia) │
                  └────────────┘

Cache hit: file served from edge (5-20ms)
Cache miss: file fetched from origin (100-300ms)
\`\`\`

---

## Cache Control — The Critical Header

The origin server tells the CDN how long to cache:

\`\`\`javascript
// Server response headers (set by your nginx/app):

// Long cache — versioned assets (fingerprinted in URL)
Cache-Control: public, max-age=31536000, immutable
// "Cache for 1 year, never revalidate, never change URL"

// Short cache — HTML pages (may update)
Cache-Control: public, max-age=300, s-maxage=600
// "Browser caches 5min, CDN caches 10min"

// No cache — sensitive/user-specific data
Cache-Control: no-cache, no-store, private
\`\`\`

**CDN Cache Invalidation:** Purge by URL, tag, or regex:

\`\`\`bash
# Cloudflare — purge by URL
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE/purge_cache" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"files":["https://example.com/style.css","https://example.com/app.js"]}'

# Purge everything (use sparingly — expensive)
curl -X POST ... -d '{"purge_everything":true}'
\`\`\`

---

## CDN Features

### DDoS Protection
CDNs absorb traffic across thousands of edge servers, making it hard to overwhelm any single point. Cloudflare blocks 100+ Gbps attacks daily.

### Edge Computing
Run code at the edge — no origin round trip:

\`\`\`javascript
// Cloudflare Worker — rewrite response at the edge
addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);

    // A/B test at the edge (no origin server involved)
    if (url.pathname === "/landing") {
        const variant = Math.random() < 0.5 ? "A" : "B";
        return new Response(
            \`<html><body><h1>Variant \${variant}</h1></body></html>\`,
            { headers: { "Content-Type": "text/html" } }
        );
    }

    return fetch(request); // fallback to origin
}
\`\`\`

### Image Optimization
CDNs resize/convert images on-the-fly:

\`\`\`html
<!-- Original request -->
<img src="https://cdn.example.com/photo.jpg">
<!-- CDN can convert to WebP, resize to 300px, adjust quality -->
<!-- Query params trigger transformations -->
<img src="https://cdn.example.com/photo.jpg?width=300&format=webp&quality=80">
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between Cache-Control max-age and s-maxage?
   **A:** \`max-age\` sets cache duration for the browser. \`s-maxage\` overrides \`max-age\` specifically for shared caches (CDNs and proxies). This lets the browser cache for a short time (e.g. 5 minutes) while the CDN caches for longer (e.g. 60 minutes).

2. **Q:** What is cache hit ratio and how do you improve it?
   **A:** Cache hit ratio = percentage of requests served from edge cache vs forwarded to origin. Improve by: setting longer TTLs, using URL fingerprinting for immutable assets, warming cache after deployment, normalizing query parameters, avoiding cookies/cache-busting patterns.

3. **Q:** What is a CDN purge and why can it be slow?
   **A:** A purge removes cached content from edge servers. It can take seconds to minutes because the purge request must propagate to all edge servers globally. Fastly handles purges in <150ms via soft purge (invalidate via surrogate keys). Cloudflare takes ~30s for full purge.

4. **Q:** How does a CDN handle dynamic content (user-specific)?
   **A:** Dynamic content is either excluded from caching (Set-Cookie, Cache-Control: private) or cached with variation. Variation uses Vary header (e.g., "Vary: Cookie, Accept-Encoding") or Cloudflare workers to cache per-user/per-language. Most CDNs can cache dynamic HTML for short periods.

5. **Q:** What is origin pull vs push zones?
   **A:** Origin pull (most common): CDN fetches content from your origin on demand (cache miss → fetch → serve). Push zone: you upload content to the CDN proactively before any requests. Pull is simpler, push gives you control over exactly what is cached.

---

## Summary Cheat Sheet

\`\`\`
CDN Key Concepts:
  Edge: server physically close to user (5-20ms)
  Origin: your main server (100-300ms)
  Cache Hit: served from edge (fast, cheap)
  Cache Miss: fetched from origin (slow, expensive)

Cache Headers:
  Cache-Control: max-age → browser cache duration
  Cache-Control: s-maxage → CDN/proxy cache duration
  Cache-Control: immutable → file never changes
  Cache-Control: public/private → shared vs browser-only
  Expires: <date> → older alternative to Cache-Control

Invalidation:
  URL purge → delete specific URL
  Tag purge → delete by tag (surrogate-key)
  Wildcard purge → regex match URLs

Edge Computing:
  Cloudflare Workers, Fastly Compute@Edge, AWS Lambda@Edge
  Rewrite, redirect, A/B test, auth, modify HTML at edge`,
            tags: ["Networking", "CDN"],
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
            content: `## Why This Matters (Read This First)

BGP is the routing protocol that runs the internet. Every ISP and cloud provider uses BGP to announce which IP ranges they control and to learn which paths exist to reach other networks.

When you deploy a service, your cloud provider announces your IP range via BGP. When a user in another part of the world connects to your server, BGP determines the path their packets take.

---

## How BGP Works

\`\`\`
BGP is a path-vector protocol:
- Each AS (Autonomous System) announces prefixes it can reach
- Announcements include the AS path (list of AS numbers)
- Routers choose the shortest AS path (fewest AS hops)

Announcement: "AS 15169 can reach 8.8.8.0/24"
  Path: [15169]

After propagation:
  "To reach 8.8.8.0/24, go through AS 1239 → 15169"
  Path: [1239, 15169]
\`\`\`

---

## BGP Peering

Routers establish BGP sessions (TCP port 179):

\`\`\`bash
# Example: BGP config on a Cisco/JunOS router
router bgp 64501                # Your AS number
  neighbor 10.0.0.1 remote-as 64502  # Peer AS number
  neighbor 10.0.0.1 description "Peering with ISP-A"

  # Advertise your prefix
  network 203.0.113.0 mask 255.255.255.0

  # Receive routes from peer
  address-family ipv4 unicast
    neighbor 10.0.0.1 activate
    neighbor 10.0.0.1 prefix-list ISP-A-IN in
    neighbor 10.0.0.1 prefix-list ISP-A-OUT out
\`\`\`

---

## BGP in Cloud — Anycast

Cloudflare, AWS, and Google use **anycast** — the same IP prefix is announced from multiple locations:

\`\`\`
Cloudflare's DNS (1.1.1.1) is announced from:
  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │  London  │  │  Tokyo  │  │  Mumbai │  │  Sydney │
  └─────────┘  └─────────┘  └─────────┘  └─────────┘
     all announcing 1.1.1.0/24 via BGP

  User in Tokyo → packets routed to Tokyo edge (closest)
  User in London → packets routed to London edge

  BGP chooses the shortest path, which is usually the nearest location.
\`\`\`

---

## Route Selection — Tiebreakers

BGP picks one best route from many options:

| Priority | Criterion | Why |
|----------|-----------|-----|
| 1 | Highest local preference | Prefer routes you configured |
| 2 | Shortest AS path | Fewer AS hops = simpler path |
| 3 | Lowest origin type | IGP < EGP < Incomplete |
| 4 | Lowest MED | Multi-exit discriminator |
| 5 | eBGP preferred over iBGP | External > internal |
| 6 | Lowest IGP metric to next-hop | Physical distance |
| 7 | Oldest route | Stability |

---

## Practice Questions

1. **Q:** What is an Autonomous System (AS)?
   **A:** An AS is a network under a single administrative control, identified by an AS number (ASN). ISPs, cloud providers, and large companies each have their own AS. Internal routing within an AS uses IGP (OSPF, IS-IS). Routing between ASes uses BGP.

2. **Q:** What is BGP hijacking?
   **A:** An attacker (or misconfigured router) announces an IP prefix they do not own. If the bogus announcement has a shorter AS path, BGP prefers it and traffic goes to the attacker. Example: 2018 — someone hijacked AWS DNS servers via BGP and redirected traffic to their own server.

3. **Q:** What is the difference between eBGP and iBGP?
   **A:** eBGP runs between different ASes (e.g., your network to your ISP). iBGP runs within the same AS. eBGP has a default administrative distance of 20, iBGP has 200 (less preferred). eBGP propagates routes with TTL=1 (directly connected peers).

4. **Q:** What is MED and when is it used?
   **A:** MED (Multi-Exit Discriminator) is a metric sent to a neighboring AS to tell them "please prefer this path over others." It is used when you have multiple connections to the same ISP and want traffic to come in through a specific link.

5. **Q:** What is the role of BGP in Kubernetes? (MetalLB, Cilium)
   **A:** Kubernetes CNI plugins (Cilium, Calico) and load balancers (MetalLB) announce Service IPs via BGP to the physical network. This makes Service IPs routable from outside the cluster without a cloud LB — the network routers learn the Service IPs via BGP.

---

## Summary Cheat Sheet

\`\`\`
BGP Basics:
  AS: Autonomous System (your network)
  ASN: AS Number (16-bit or 32-bit)
  Prefix: IP range (e.g., 203.0.113.0/24)
  AS Path: list of ASNs the route traverses

Route Selection (top 3):
  Highest local preference → shortest AS path → lowest MED

Security:
  RPKI: cryptographically verify prefix ownership
  BGP Flowspec: BGP-based DDoS mitigation
  Prefix lists: filter what you accept/advertise
  Max prefix: limit routes from peers

BGP in Cloud:
  Anycast: same IP from multiple locations
  MetalLB: BGP for Kubernetes LoadBalancer IPs
  Cilium: BGP-based Service routing`,
            tags: ["Networking", "BGP"],
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
            content: `## Why This Matters (Read This First)

eBPF (extended Berkeley Packet Filter) lets you run sandboxed programs in the Linux kernel without changing kernel code or loading kernel modules. It is the technology behind Cilium (Kubernetes networking), Pixie (observability), Tracee (security), and many modern infrastructure tools.

Before eBPF, adding custom kernel logic meant writing a kernel module (risky, hard to maintain) or modifying the kernel source. eBPF lets you safely program the kernel at runtime.

---

## eBPF Architecture

\`\`\`
User Space                    Kernel
    │                            │
    │──(1) Load eBPF bytecode───→│
    │    (via bpf() syscall)     │
    │                            │──(2) Verifier checks safety
    │                            │    - No loops (before v5.3)
    │                            │    - No out-of-bounds access
    │                            │    - All paths must reach exit
    │                            │
    │──(3) Attach to hook ──────→│
    │                            │──(4) Kernel event fires → eBPF runs
    │                            │
    │←──(5) Read maps ──────────│    (shared data structures)
    │       or perf buffers      │
\`\`\`

---

## eBPF Programs — Hooks

eBPF programs attach to kernel events:

| Hook Type | What It Captures | Example Use |
|-----------|-----------------|-------------|
| XDP | Network packets before kernel stack | DDoS filtering at line rate |
| TC (Traffic Control) | Packets in the kernel's network stack | Load balancing (Cilium) |
| kprobe/kretprobe | Kernel function entry/return | Trace syscalls, detect malware |
| tracepoint | Pre-defined kernel tracepoints | File operations, TCP events |
| uprobe | User-space function hooks | Profile application code |
| perf_event | Hardware performance counters | CPU profiling, PMC monitoring |

---

## Example: XDP Drop Program

Drop packets from an attacker at the NIC driver level (before any kernel processing):

\`\`\`c
// xdp_drop.c — compile with clang to eBPF bytecode
#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/in.h>

#define SEC(NAME) __attribute__((section(NAME), used))

SEC("xdp")
int xdp_drop_attacker(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;

    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end) return XDP_PASS;

    struct iphdr *ip = data + sizeof(*eth);
    if ((void *)(ip + 1) > data_end) return XDP_PASS;

    // Drop packets from attacker IP 10.0.0.99
    if (ip->saddr == 0x6300000a) { // 10.0.0.99 in network byte order
        return XDP_DROP;  // Packet is dropped at the NIC driver level
    }

    return XDP_PASS;
}
\`\`\`

\`\`\`bash
# Compile and load
clang -O2 -target bpf -c xdp_drop.c -o xdp_drop.o
ip link set dev eth0 xdp obj xdp_drop.o sec xdp

# Remove
ip link set dev eth0 xdp off

# Check loaded programs
bpftool prog list | grep xdp
bpftool prog show id <id> --pretty
\`\`\`

---

## Cilium — eBPF-Based Kubernetes CNI

Cilium replaces kube-proxy and the standard CNI with eBPF:

\`\`\`yaml
# CiliumNetworkPolicy — eBPF enforces at the kernel level
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: api-server
spec:
  endpointSelector:
    matchLabels:
      app: api
  ingress:
  - fromEndpoints:
    - matchLabels:
        app: frontend
    toPorts:
    - ports:
      - port: "3000"
        protocol: TCP
---
# The policy is enforced by eBPF programs in the kernel.
# No iptables rules. No kernel conntrack. Pure eBPF maps.
# Result: 10x faster service routing than kube-proxy.
\`\`\`

---

## Practice Questions

1. **Q:** What makes eBPF safe compared to kernel modules?
   **A:** The eBPF verifier checks the program before loading: it verifies finite loop bounds, checks memory access bounds, ensures all code paths reach exit, and prevents unreachable instructions. A kernel module has none of these checks — a bug causes a kernel panic.

2. **Q:** What is the difference between XDP and tc hooks?
   **A:** XDP processes packets at the NIC driver level (before SKB allocation), making it the fastest hook — capable of processing millions of packets per second. tc hook (Traffic Control) processes packets after the SKB is allocated, giving access to socket metadata and higher-level protocol parsing.

3. **Q:** How does eBPF improve Kubernetes networking?
   **A:** eBPF replaces iptables (which has O(n) rule evaluation with thousands of services) with BPF maps (O(1) lookup). Services, endpoints, and routing rules are stored in maps rather than as iptables chains. Cilium uses eBPF for service routing, network policy, and observability.

4. **Q:** What is bpftool and what can it do?
   **A:** \`bpftool\` is the CLI tool for inspecting and managing eBPF programs and maps. It can list loaded programs (\`bpftool prog list\`), show map contents (\`bpftool map dump\`), pin/unpin programs, and show the control flow graph of loaded programs.

5. **Q:** Can eBPF be used for security? Give an example.
   **A:** Yes — Falco and Tracee use eBPF for runtime security. They attach kprobes to syscalls (execve, open, connect) and check against security rules. If a container tries to run a shell or read /etc/shadow, the eBPF program can send an alert to userspace.

---

## Summary Cheat Sheet

\`\`\`
eBPF Key Concepts:
  Verifier: checks safety before loading
  JIT Compiler: converts to native machine code
  Maps: kernel↔userspace shared data (hash, array, ringbuf)
  Hooks: XDP, TC, kprobe, tracepoint, uprobe, perf_event

Common Uses:
  Cilium: K8s networking & security (CNI)
  Pixie: Continuous profiling & tracing
  Falco/Tracee: Runtime security
  Cloudflare: DDoS mitigation
  Netflix: Performance monitoring

XDP Actions:
  XDP_DROP — discard packet (fastest)
  XDP_PASS — send to kernel
  XDP_TX — bounce back to same NIC
  XDP_REDIRECT — send to another NIC/CPU

Commands:
  bpftool prog list — list loaded programs
  bpftool map dump — inspect map contents
  bpftool net show — show attached programs`,
            tags: ["Networking", "eBPF"],
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
            content: `## Why This Matters (Read This First)

A service mesh adds a layer of infrastructure for microservices communication — handling retries, timeouts, traffic splitting, observability, and encryption. It uses a sidecar proxy (sidecar container injected into each pod) to intercept all network traffic.

Service meshes are useful when you have many microservices (20+) and need consistent traffic management, mutual TLS, and distributed tracing across all services without modifying application code.

---

## Istio Architecture

\`\`\`
┌──────────────────────────────────────────────────┐
│  Control Plane (istiod)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Pilot    │  │ Citadel  │  │ Galley        │   │
│  │ (routing)│  │ (certs)  │  │ (config)      │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
└──────────────────────────────────────────────────┘
           │               │
           ▼               ▼
┌─────────────────┐  ┌─────────────────┐
│ Data Plane      │  │ Data Plane      │
│ Service A       │  │ Service B       │
│ ┌───────┐       │  │ ┌───────┐       │
│ │ Envoy │◄──────┼──┼─►│ Envoy │       │
│ │(proxy)│       │  │ │(proxy)│       │
│ └───────┘       │  │ └───────┘       │
│ ┌───────┐       │  │ ┌───────┐       │
│ │ App   │       │  │ │ App   │       │
│ └───────┘       │  │ └───────┘       │
└─────────────────┘  └─────────────────┘
  Pod A                Pod B
\`\`\`

All traffic from Service A to Service B goes through their Envoy proxies. The proxies do the TLS, load balancing, retries, tracing, and metrics collection — the application code just sends plain HTTP.

---

## Traffic Splitting (Canary Deployments)

\`\`\`yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-service
spec:
  hosts:
  - api
  http:
  - route:
    - destination:
        host: api
        subset: stable
      weight: 90
    - destination:
        host: api
        subset: canary
      weight: 10
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: api-destination
spec:
  host: api
  subsets:
  - name: stable
    labels:
      version: v1
  - name: canary
    labels:
      version: v2
---
# Result: 10% of traffic goes to version v2 (canary).
# Envoy proxies do the splitting — no app-level load balancer needed.
\`\`\`

---

## Mutual TLS (mTLS)

Every Envoy-to-Envoy connection is encrypted and authenticated:

\`\`\`yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT  # All services must use mTLS
---
# Without mTLS: traffic encrypted between pods? ❌
# With mTLS: each Envoy has a certificate (Citadel CA)
#            → all inter-service traffic is TLS encrypted
#            → each service identity is verified (cert CN = service account)
\`\`\`

---

## LinkerD vs Istio vs Cilium Service Mesh

| Feature | Istio | LinkerD | Cilium |
|---------|-------|---------|--------|
| Proxy | Envoy (C++) | LinkerD-proxy (Rust) | eBPF (no sidecar) |
| Complexity | High | Medium | Low |
| Performance | ~5% overhead | ~2% overhead | ~1% overhead |
| Features | Full set (mTLS, routing, tracing, retries) | Core features + tap | Networking + policy |
| Control Plane | istiod (Go) | Controller (Go) | Cilium agent |

---

## Practice Questions

1. **Q:** What problem does a service mesh solve that a load balancer does not?
   **A:** A load balancer distributes traffic from external clients to servers. A service mesh handles INTERNAL service-to-service traffic across all services — adding mTLS, retries, timeouts, circuit breaking, distributed tracing, and traffic splitting between versions. These features would need to be built into every microservice without a mesh.

2. **Q:** What is the sidecar proxy pattern and why is it useful?
   **A:** A sidecar is a container deployed alongside the main application container in the same pod. It intercepts all network traffic via iptables rules. The app never needs to know about the sidecar — it sends plain HTTP and the sidecar handles encryption, routing, and metrics. Benefits: no app code changes, language-agnostic, centralized control.

3. **Q:** How does Istio issue certificates for mTLS?
   **A:** Citadel (Istio's CA component) issues certificates to each Envoy proxy. The certificate's SAN identifies the service account of the pod. Envoys verify each other's certificates during the TLS handshake. Certificates are rotated every 24 hours. All of this happens transparently to the application.

4. **Q:** What is the difference between STRICT and PERMISSIVE mTLS mode?
   **A:** STRICT: all traffic must be mTLS — plain HTTP is rejected. PERMISSIVE: the proxy accepts both mTLS and plain HTTP. Use PERMISSIVE during migration (gradually roll out sidecars) and switch to STRICT once all services have sidecars.

5. **Q:** How does a service mesh handle observability (tracing)?
   **A:** The sidecar proxy generates tracing spans for every request. Envoy propagates trace context (x-request-id, x-b3-traceid, x-datadog-trace-id) to the next service. Traces are collected and sent to Zipkin, Jaeger, or Datadog. The app does not need to instrument tracing — but it improves when it propagates the trace headers.

---

## Summary Cheat Sheet

\`\`\`
Service Mesh Concepts:
  Control Plane: configures proxies (istiod, LinkerD controller)
  Data Plane: proxies handling application traffic (Envoy, LinkerD-proxy)

Key Features:
  mTLS: mutual TLS between all services (encrypted + authenticated)
  Traffic Splitting: canary, blue-green, weighted routing
  Retries + Timeouts: configurable per-service
  Circuit Breaking: stop sending to failing services
  Tracing: distributed tracing via proxy (Zipkin, Jaeger)
  Metrics: RED metrics (Rate, Errors, Duration) for every request

Istio resources:
  VirtualService: traffic routing rules
  DestinationRule: subset definitions + load balancing
  PeerAuthentication: mTLS settings
  ServiceEntry: external services`,
            tags: ["Service Mesh", "Networking"],
          },
        ],
      },
      {
        id: "infra-container",
        title: "Containerization & Orchestration",
        description: "Containers, images versus processes, and container runtime internals.",
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
            content: `## Why This Matters (Read This First)

Linux namespaces are the kernel feature that makes containers possible. Each container gets its own view of the system — its own process tree, network interfaces, mount points, hostname, and user IDs. Without namespaces, containers are just processes with cgroup limits.

Docker creates 7 namespaces when starting a container. Kubernetes runs containers, which are processes with namespaces.

---

## The 7 Linux Namespaces

| Namespace | What It Isolates | Created By |
|-----------|-----------------|------------|
| PID | Process tree — container sees only its own processes | \`CLONE_NEWPID\` |
| Network | Network interfaces, IP, routing table, ports | \`CLONE_NEWNET\` |
| Mount | Filesystem mount points | \`CLONE_NEWNS\` |
| UTS | Hostname and domain name | \`CLONE_NEWUTS\` |
| IPC | System V IPC, POSIX message queues | \`CLONE_NEWIPC\` |
| User | User and group IDs (isolate root) | \`CLONE_NEWUSER\` |
| Cgroup | Cgroup root directory | \`CLONE_NEWCGROUP\` |

---

## Creating a Namespace — \`unshare\`

\`\`\`bash
# Create a new UTS + PID + mount namespace with a bash shell
sudo unshare --fork --pid --mount --uts --mount-proc /bin/bash

# Inside the namespace:
hostname my-container
ps aux
mount -t proc none /proc

# Check which namespaces a process uses
ls -la /proc/$$/ns/
# Each namespace has an inode number — same number = same namespace
\`\`\`

---

## Building a Container by Hand

\`\`\`bash
CONTAINER=/tmp/mycontainer
mkdir -p $CONTAINER/rootfs

docker export $(docker create alpine) | tar -C $CONTAINER/rootfs -xf -

sudo unshare --fork \
  --pid --mount --uts --ipc --net \
  --mount-proc=$CONTAINER/rootfs/proc \
  --root=$CONTAINER/rootfs /bin/sh

# This is essentially what Docker does internally
\`\`\`

---

## User Namespace — Rootless Containers

User namespaces map container uid/gid to non-root uids on the host:

\`\`\`bash
# /etc/subuid — user namespace mapping
# 1000:100000:65536
# "UID 1000 on the host can map container UIDs 100000-165535"

# Rootless containers are increasingly popular:
# - podman runs rootless by default
# - Docker rootless mode
# - Kubernetes user namespace support (alpha)
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between a namespace and a cgroup?
   **A:** A namespace makes a process SEE only its own view of the system (PID 1, own network stack). A cgroup LIMITS resource usage (CPU, memory, I/O). Containers need both.

2. **Q:** What is the veth pair in container networking?
   **A:** A veth (virtual Ethernet) pair connects the container's network namespace to the host's. One end is inside the container (eth0), the other is in the host namespace. The host end is connected to a Linux bridge (docker0) or overlay network.

3. **Q:** Can a container share the host's network namespace?
   **A:** Yes — Docker supports \`--network host\`. Use for: network diagnostics tools, performance-sensitive applications, daemon agents needing host-level network observation.

4. **Q:** Why can't you kill PID 1 from inside a PID namespace?
   **A:** PID 1 reaps orphaned child processes. The kernel prevents PID 1 from being killed via SIGKILL. When PID 1 exits, the kernel terminates all processes in the namespace.

5. **Q:** What are cgroup v2 and how are they different from v1?
   **A:** cgroup v2 has a single unified hierarchy (vs. multiple in v1), supports pressure stall information (PSI), and is the default in modern Linux distributions. All resource controllers are managed under a single tree.

---

## Summary Cheat Sheet

\`\`\`
7 Namespaces:
  PID: process tree → each container has PID 1
  NET: network stack → interfaces, IP, ports
  MNT: mount points → each container has its own /
  UTS: hostname → each container has its own hostname
  IPC: inter-process communication
  USER: uid/gid mapping → rootless containers
  CGROUP: cgroup hierarchy → resource limits

Commands: unshare (create), nsenter (enter), ls -la /proc/\$\$/ns (list)
Docker uses: namespaces (isolation) + cgroups (limits) + overlayfs (layers)
Podman: rootless containers via user namespaces`,
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
            content: `## Why This Matters (Read This First)

Hypervisors enable multiple virtual machines to run on a single physical machine. They are the foundation of cloud computing — AWS EC2, GCP Compute Engine, and Azure VMs all run on hypervisors.

There are three types: **Type-1** (bare-metal hypervisors for production), **Type-2** (hosted hypervisors for development), and **MicroVMs** (lightweight VMs for serverless).

---

## Type-1 Hypervisors — Bare-Metal

Run directly on the hardware (no host OS):

\`\`\`
Type-1 (KVM, Xen, VMware ESXi):
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │   VM 1       │ │   VM 2       │ │   VM 3       │
  │   Linux       │ │   Windows    │ │   FreeBSD     │
  └──────────────┘ └──────────────┘ └──────────────┘
  ┌──────────────────────────────────────────────────┐
  │          Hypervisor (KVM/Xen/ESXi)               │
  │          Directly on hardware                     │
  └──────────────────────────────────────────────────┘
  ┌──────────────────────────────────────────────────┐
  │              Physical Hardware                    │
  │        CPU (VT-x/AMD-V), RAM, NIC, Disk          │
  └──────────────────────────────────────────────────┘
\`\`\`

### KVM (Kernel-based Virtual Machine)

KVM turns Linux into a Type-1 hypervisor:

\`\`\`bash
# Check if CPU supports virtualization
grep -E '(vmx|svm)' /proc/cpuinfo

# Load KVM modules
modprobe kvm
modprobe kvm_intel    # or kvm_amd

# Create a VM with qemu-kvm
qemu-system-x86_64 \
  -enable-kvm \
  -m 2048 \
  -smp 2 \
  -drive file=ubuntu.qcow2,format=qcow2 \
  -netdev user,id=net0 \
  -device e1000,netdev=net0

# List running VMs
virsh list
#  Id   Name       State
#  ---  ---------  -----------
#  2    ubuntu-vm  running
\`\`\`

KVM uses hardware virtualization extensions (Intel VT-x, AMD-V) to run guest code directly on the CPU, making it near-native performance.

---

## Type-2 Hypervisors — Hosted

Run as an application on top of an OS:

\`\`\`
Type-2 (VirtualBox, VMware Workstation):
  ┌──────────────────────────────────────────────────┐
  │   VM 1    │   VM 2    │   VM 3                   │
  └───────────┴───────────┴──────────┘               │
  ┌──────────────────────────────────────────────────┐
  │         VirtualBox / VMware Workstation          │
  ├──────────────────────────────────────────────────┤
  │             Host OS (macOS, Windows)             │
  ├──────────────────────────────────────────────────┤
  │              Physical Hardware                    │
  └──────────────────────────────────────────────────┘
\`\`\`

Type-2 adds an OS layer → more overhead. Used for development and testing, not production.

---

## MicroVMs — Firecracker

Firecracker is an AWS-built VMM (Virtual Machine Manager) using KVM:

\`\`\`
Firecracker MicroVM:
  ┌────────────────────────────────┐
  │  Memory: ~5MB per VM           │
  │  Boot time: ~125ms (without    │
  │  network initialization)        │
  │  First request: ~200ms (1ms     │
  │  to get network + DHCP)         │
  │  Guest kernel: 4.14+ stripped  │
  │  Devices: virtio-net, virtio-blk│
  │  No BIOS, no ACPI, no VGA      │
  └────────────────────────────────┘
\`\`\`

\`\`\`bash
# Start a Firecracker microVM
# 1. Set up the jailer (security)
firecracker --no-api --id my-vm \
  --boot-timer \
  --seccomp-level 2

# 2. Configure via API
curl --unix-socket /tmp/firecracker.sock -i \
  -X PUT 'http://localhost/boot-source' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "kernel_image_path": "/path/to/vmlinux",
    "boot_args": "console=ttyS0 reboot=k panic=1 pci=off"
  }'

# 3. Add rootfs
curl --unix-socket /tmp/firecracker.sock -i \
  -X PUT 'http://localhost/drives/rootfs' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "drive_id": "rootfs",
    "path_on_host": "/path/to/rootfs.ext4",
    "is_root_device": true,
    "is_read_only": false
  }'
\`\`\`

AWS Lambda and Fargate use Firecracker — each function runs in its own microVM for strong isolation without the overhead of a full VM.

---

## Container vs VM Performance

\`\`\`
                       Container (Namespace)      VM (KVM)      MicroVM
Boot time:             <100ms                     30-60s        125ms
Memory overhead:       ~5MB                       1-2GB         ~5MB
Isolation boundary:    Kernel (shared)             Hardware      Hardware
Performance:           Native                      ~95% native   ~98% native
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between Type-1 and Type-2 hypervisors?
   **A:** Type-1 runs directly on hardware (KVM, Xen, ESXi) — better performance, used in production. Type-2 runs as an application on a host OS (VirtualBox, VMware Workstation) — convenient for development, but has more overhead due to the extra OS layer.

2. **Q:** How does KVM achieve near-native performance?
   **A:** KVM uses Intel VT-x or AMD-V hardware virtualization extensions. Guest code executes directly on the CPU (no emulation). Only privileged instructions trap to the hypervisor. This gives ~95% of native performance for CPU-intensive workloads.

3. **Q:** What makes Firecracker different from a full VM (e.g., QEMU)?
   **A:** Firecracker is a stripped-down VMM with no BIOS, no ACPI, no VGA, no USB, no PCI emulation (except virtio). It boots in ~125ms and uses ~5MB RAM. QEMU emulates a full PC with BIOS boot, ACPI power management, multiple device models — taking 30-60s to boot and 1-2GB of memory.

4. **Q:** When would you choose containers vs VMs vs microVMs?
   **A:** Containers for multi-tenant (less isolation, more density). VMs for strong isolation (different OS, untrusted tenants). MicroVMs for serverless/FaaS — where you need VM-level isolation but containers-like fast boot.

5. **Q:** What is the role of virtio in virtualization?
   **A:** virtio provides paravirtualized drivers for disk and network in KVM VMs. The guest VM knows it is virtualized and uses special drivers that communicate with the host via shared memory — much faster than emulating real hardware devices.

---

## Summary Cheat Sheet

\`\`\`
Type-1 (bare-metal): KVM, Xen, VMware ESXi
Type-2 (hosted): VirtualBox, VMware Workstation
MicroVM: Firecracker (AWS), Cloud Hypervisor

KVM: Linux kernel module + QEMU userspace
  - Uses VT-x/AMD-V hardware extensions
  - Near-native performance
  - virsh/qemu-system-x86_64 for management

Firecracker:
  - ~125ms boot, ~5MB memory overhead
  - virtio-net + virtio-blk only
  - No BIOS/ACPI/VGA
  - Used by AWS Lambda + Fargate

Performance: Container (native) ≈ MicroVM (~98%) > VM (~95%)
Isolation: VM ≈ MicroVM >> Container`,
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
            content: `## Why This Matters (Read This First)

IAM is the security model for all cloud platforms. Every API call to AWS/GCP/Azure passes through IAM — if the caller is not authenticated and authorized, the request is denied.

The principle of **least privilege** means granting only the permissions needed. Too broad policies (AdministratorAccess, "owner" role) are the root cause of most cloud breaches.

---

## AWS IAM — Core Concepts

\`\`\`
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User        │     │  Group       │     │  Role        │
│  (person)    │     │  (developers)│     │  (service)   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
                   ┌────────────────┐
                   │  Policy        │
                   │  (JSON doc)    │
                   └────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │  Effect: Allow │
                   │  Action: s3:* │ (too broad!)
                   │  Resource: *  │ (too broad!)
                   └────────────────┘
\`\`\`

---

## IAM Policy — Least Privilege Example

\`\`\`json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::my-app-assets/images/*"
        },
        {
            "Effect": "Deny",
            "Action": "s3:DeleteObject",
            "Resource": "*"
        }
    ]
}
// This policy:
// - Allows only GetObject and PutObject on images/ in one bucket
// - Explicitly denies any delete operation
// - This is the principle of least privilege in practice
\`\`\`

---

## IAM Roles — No Static Credentials

Applications should never use long-lived access keys. Instead, they **assume a role**:

\`\`\`python
import boto3

# ECS task or EC2 instance with attached IAM role
# No credentials in code, no .env file
session = boto3.Session()
sts = session.client("sts")

# The EC2 metadata service provides temporary credentials
# Automatically rotated by AWS every ~6 hours
credentials = sts.assume_role(
    RoleArn="arn:aws:iam::123456789012:role/my-app-role",
    RoleSessionName="my-app-session"
)
\`\`\`

---

## OIDC Federation — CI/CD Without Secrets

GitHub Actions can assume an AWS role using OIDC:

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
permissions:
  id-token: write  # Needed for OIDC
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions
          aws-region: us-east-1

      - name: Deploy
        run: aws s3 sync dist/ s3://my-app-website/
# No AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY stored anywhere
\`\`\`

---

## GCP IAM — Roles and Members

\`\`\`bash
# GCP IAM: bind roles to members
gcloud projects add-iam-policy-binding my-project \
  --member="serviceAccount:deployer@my-project.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Predefined roles (recommended over primitive):
# roles/storage.objectAdmin → full control over objects
# roles/storage.objectViewer → read-only objects
# roles/storage.objectCreator → write-only (create new objects)

# Custom roles: fine-grained control
gcloud iam roles create CustomStorageWriter \
  --project=my-project \
  --title="Custom Storage Writer" \
  --permissions=storage.objects.create,storage.objects.get
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between an IAM user and an IAM role?
   **A:** A user represents a person with long-term credentials (password, access keys). A role is assumed by a trusted entity (EC2 instance, Lambda, another AWS account) and gets temporary credentials via STS. Roles rotate credentials automatically; users do not.

2. **Q:** What is a service control policy (SCP) and how does it differ from an IAM policy?
   **A:** SCPs are applied at the AWS Organization level — they set permission guardrails that affect ALL accounts in the org. IAM policies are applied to individual users/roles. SCPs cannot grant permissions (they only restrict), while IAM policies can both grant and restrict.

3. **Q:** Why should you use OIDC federation for CI/CD instead of storing access keys?
   **A:** OIDC gives short-lived tokens (1 hour) that are automatically generated when the workflow runs. No secrets to rotate, no risk of leaked keys in logs or repos. GitHub Actions requests a token, AWS validates it based on the OIDC provider configuration.

4. **Q:** What is the difference between identity-based and resource-based policies?
   **A:** Identity-based policies are attached to the user/role and specify what actions that identity can take. Resource-based policies are attached to the resource (S3 bucket, Lambda function) and specify who can access it. Resource-based policies enable cross-account access without role assumption.

5. **Q:** What does the condition element do in an IAM policy?
   **A:** Conditions add extra constraints beyond "allow action X on resource Y". Examples: \`IpAddress\` (only allow from specific IPs), \`StringEquals\` (require tags), \`Bool\` (require MFA), \`DateLessThan\` (time-bound access). Conditions are critical for least privilege.

---

## Summary Cheat Sheet

\`\`\`
IAM Components:
  User → person with long-term credentials
  Group → collection of users
  Role → assumed by services, temporary credentials
  Policy → JSON document with allow/deny rules

Policy Structure:
  Effect: Allow or Deny
  Action: specific API calls (s3:GetObject, ec2:RunInstances)
  Resource: ARN of the resource (* too broad!)
  Condition: IP, time, MFA, tags

Best Practices:
  • Use roles not users for applications
  • Use OIDC federation for CI/CD (no secrets)
  • Apply SCPs for guardrails at org level
  • Use conditions to scope access
  • Tag resources and use tags in policies`,
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
            content: `## Why This Matters (Read This First)

A VPC is your private network in the cloud. Everything — EC2, RDS, Lambda, ECS — runs inside a VPC. How you design subnets, routing, and gateways determines your application's security, latency, and cost.

A poorly designed VPC leads to: public exposure of private resources, high data transfer costs, inability to connect services, and difficult compliance audits.

---

## VPC Architecture

\`\`\`
AWS Region (us-east-1)
┌──────────────────────────────────────────────────────┐
│  VPC (10.0.0.0/16)                                    │
│                                                        │
│  ┌─────────────── Availability Zone A ────────────────┐ │
│  │  Public Subnet (10.0.1.0/24)                       │ │
│  │  ┌──────────────────┐  ┌──────────────────┐       │ │
│  │  │  NAT Gateway     │  │  Load Balancer   │       │ │
│  │  │  (public IP)     │  │  (public IP)     │       │ │
│  │  └──────────────────┘  └──────────────────┘       │ │
│  │                                                     │ │
│  │  Private Subnet (10.0.2.0/24)                      │ │
│  │  ┌──────────────────┐  ┌──────────────────┐       │ │
│  │  │  EC2 (app)       │  │  RDS (database)   │       │ │
│  │  │  (no public IP)  │  │  (no public IP)   │       │ │
│  │  └──────────────────┘  └──────────────────┘       │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                        │
│  ┌─────────────── Availability Zone B ────────────────┐ │
│  │  Public Subnet (10.0.3.0/24)                       │ │
│  │  ... (replicated for HA)                           │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
\`\`\`

---

## Subnet Types

| Subnet | Route to Internet Gateway | Can have public IP | Use case |
|--------|--------------------------|-------------------|----------|
| Public | Yes | Yes | Load balancers, NAT Gateways, bastion hosts |
| Private | No | No | Application servers, databases |
| Isolated | No | No | No internet access at all (air-gapped) |

\`\`\`bash
# Create a VPC with AWS CLI
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --region us-east-1

# Create subnets
aws ec2 create-subnet \
  --vpc-id vpc-12345 \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a

# Create internet gateway
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway --vpc-id vpc-12345 --internet-gateway-id igw-12345

# Create route table for public subnets
aws ec2 create-route-table --vpc-id vpc-12345
aws ec2 create-route \
  --route-table-id rtb-12345 \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id igw-12345
\`\`\`

---

## Security Groups vs NACLs

| Feature | Security Group | Network ACL (NACL) |
|---------|---------------|-------------------|
| State | Stateful (return traffic allowed) | Stateless (must allow both directions) |
| Rule types | Allow only | Allow and Deny |
| Scope | Attached to ENI (instance-level) | Attached to subnet (subnet-level) |
| Evaluation | All rules evaluated together | Rules evaluated in order (lowest number first) |
| Default | Deny all inbound, allow all outbound | Allow all inbound and outbound |

\`\`\`json
// Security Group: allows HTTP from anywhere, SSH from office
{
    "IpPermissions": [
        {
            "IpProtocol": "tcp",
            "FromPort": 80,
            "ToPort": 80,
            "IpRanges": [{"CidrIp": "0.0.0.0/0"}]
        },
        {
            "IpProtocol": "tcp",
            "FromPort": 22,
            "ToPort": 22,
            "IpRanges": [{"CidrIp": "203.0.113.0/24"}]
        }
    ]
}
// Stateful: if inbound HTTP is allowed, outbound response is automatically allowed
\`\`\`

---

## VPC Endpoints — PrivateLink

Access AWS services without internet:

\`\`\`bash
# Gateway Endpoint (S3, DynamoDB) — free, uses route table
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-12345 \
  --service-name com.amazonaws.us-east-1.s3 \
  --route-table-ids rtb-12345

# Interface Endpoint (everything else) — uses ENI with private IP
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-12345 \
  --service-name com.amazonaws.us-east-1.kms \
  --subnet-id subnet-12345

# Benefits:
# - Traffic never leaves AWS network
# - No NAT Gateway needed for AWS service access
# - No public IPs needed
# - IAM policies can restrict which endpoints can be used
\`\`\`

---

## Practice Questions

1. **Q:** Why should databases be placed in private subnets?
   **A:** Private subnets have no direct route to the internet. Even if the RDS instance has a public IP (which should be disabled), the route table does not allow public traffic. The database can only be reached via the application servers (through security group rules) or through a bastion host.

2. **Q:** What is a NAT Gateway and why do private subnets need one?
   **A:** A NAT Gateway sits in a public subnet with an Elastic IP. Private subnets route 0.0.0.0/0 traffic to the NAT Gateway. This allows instances in private subnets to make outbound connections (yum updates, API calls) but prevents inbound connections from the internet.

3. **Q:** What is the difference between a Gateway Endpoint and an Interface Endpoint?
   **A:** Gateway Endpoints (S3, DynamoDB) are free and work by adding routes to the route table. Interface Endpoints (everything else) create an ENI in your subnet with a private IP and cost per hour + per GB. Both keep traffic within the AWS network.

4. **Q:** How does a security group reference another security group?
   **A:** Instead of allowing an IP range, you can reference another SG: \`sg-12345\` as the source. This allows any resource in that SG to connect — no IPs to manage. Used for: app SG allows DB SG to access port 5432. The DB SG references the app SG.

5. **Q:** What is a Transit Gateway and when would you use it?
   **A:** Transit Gateway (TGW) is a hub that connects VPCs, VPNs, and Direct Connect. Instead of VPC peering (1:1, non-transitive, hard to manage at scale), TGW provides a star topology — connect each VPC once. Use when you have 10+ VPCs that need to communicate.

---

## Summary Cheat Sheet

\`\`\`
VPC Design:
  CIDR: IP range (10.0.0.0/16 gives 65536 IPs)
  Subnets: /24 per AZ (256 IPs, ~251 usable)
  AZ: at least 2 for HA
  Public LB → private app → private DB

Networking Components:
  IGW (Internet Gateway) → public internet access
  NAT Gateway → outbound internet from private
  VPC Endpoint → AWS services without internet
  Peering → connect VPC to VPC (1:1)
  Transit Gateway → hub for many VPCs

Security:
  Security Group: stateful, allow rules, instance-level
  NACL: stateless, allow+deny, subnet-level
  Flow Logs: capture IP traffic metadata`,
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
            content: `## Why This Matters (Read This First)

Every service needs to survive failures. High Availability (HA) means your service stays up when a component fails. Disaster Recovery (DR) means your service can be restored in another region if the entire region goes down.

HA targets 99.99% uptime ("four nines" — ~52 minutes downtime per year). DR targets minutes-to-hours RTO depending on the strategy.

---

## Multi-AZ vs Multi-Region

\`\`\`
Multi-AZ (within a region):
  ┌───────────────────────────────────────┐
  │  Region (us-east-1)                    │
  │  ┌──────────┐   ┌──────────┐          │
  │  │ AZ A     │   │ AZ B     │          │
  │  │ App + DB ├───┤ App + DB │          │
  │  │ Active   │   │ Standby  │          │
  │  └──────────┘   └──────────┘          │
  │  AZ failure → DNS/health check fails  │
  │  → traffic routes to AZ B             │
  │  RTO: minutes, RPO: zero (sync repl)  │
  └───────────────────────────────────────┘

Multi-Region DR:
  ┌──────────────┐   ┌──────────────┐
  │ us-east-1    │   │ us-west-2    │
  │ Active       │───│ DR Standby   │
  │ (primary)    │   │ (secondary)  │
  └──────────────┘   └──────────────┘
  Region failure → Route53 failover → traffic to us-west-2
  RTO: depends on DR strategy (minutes to hours)
  RPO: depends on replication (seconds to hours)
\`\`\`

---

## Four DR Strategies

\`\`\`
Cost                        RTO          RPO
  ▲                            ▲           ▲
  │  Active-Active             minutes     seconds
  │    (traffic split across    <1min       <1s
  │     regions)
  │
  │  Warm Standby              minutes     minutes
  │    (reduced capacity        ~10min      ~5min
  │     replica)
  │
  │  Pilot Light               hours       minutes
  │    (core infra running,     ~1h         ~15min
  │     scale up on disaster)
  │
  │  Backup & Restore          hours       hours
  │    (restore from backup)    ~4h+        ~1h
  │
  └──────────────────────────────────────────────
\`\`\`

---

## AWS Multi-AZ Services

\`\`\`bash
# RDS Multi-AZ — synchronous replication, automatic failover
aws rds create-db-instance \
  --db-instance-identifier my-db \
  --multi-az \
  --db-instance-class db.r6g.large

# When AZ A fails:
# 1. RDS detects DB instance is unreachable
# 2. DNS record updated to standby in AZ B
# 3. Application reconnects (transparent, ~60-120s)
# 4. Standby promoted to primary
# 5. New standby created in another AZ
\`\`\`

\`\`\`yaml
# ECS Service with multi-AZ spread
services:
  app:
    deployment_configuration:
      minimum_healthy_percent: 100
      maximum_percent: 200
    capacity_provider_strategy:
      - capacity_provider: FARGATE_SPOT
        weight: 2
        base: 10
    # Service auto-heals: if a task fails, ECS replaces it
    # Spread across AZs: tasks distributed across 3 AZs
    placement_strategy:
      - type: spread
        field: attribute:ecs.availability-zone
\`\`\`

---

## Health Checks and Auto Recovery

\`\`\`yaml
# ALB Target Group — health check config
health_check:
  protocol: HTTP
  path: /healthz
  interval_seconds: 10
  timeout_seconds: 5
  healthy_threshold_count: 3
  unhealthy_threshold_count: 3
  # If 3 consecutive health checks fail:
  # → ALB marks target as unhealthy
  # → Stops sending traffic to that target
  # → Auto Scaling replaces the unhealthy instance
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between RTO and RPO?
   **A:** RTO (Recovery Time Objective) is how long you can be down after a failure — determines the speed of recovery. RPO (Recovery Point Objective) is how much data you can lose — determines the frequency of backups/replication. A bank might have RTO=5min, RPO=1sec. A blog might have RTO=4h, RPO=24h.

2. **Q:** What is the cheapest DR strategy and what are its tradeoffs?
   **A:** Backup & Restore: backup data to S3 in the DR region, restore when disaster strikes. Cheapest (no running infrastructure in DR region), but highest RTO (hours to restore) and RPO (hours of data loss). Suitable for non-critical workloads.

3. **Q:** Why does Multi-AZ not protect against region failure?
   **A:** Multi-AZ protects against an AZ (datacenter) failure within a single region. But if the entire region fails (earthquake, power grid, AWS service outage), all AZs in that region fail together. Only multi-region DR protects against region failure.

4. **Q:** What is a "blast radius" in the context of HA?
   **A:** Blast radius is the scope of impact when a component fails. Design principles: smaller blast radii = better. Use multiple AZs (blast radius = one AZ), multiple regions (blast radius = one region), cell-based architecture (blast radius = one cell).

5. **Q:** What is the difference between active-passive and active-active DR?
   **A:** Active-Passive: primary region serves all traffic; DR region is standby. On failover, DR region becomes active. Simpler, but DR infra costs money while idle. Active-Active: both regions serve traffic. No failover needed (traffic just shifts). More complex (data sync between regions) but better resource utilization.

---

## Summary Cheat Sheet

\`\`\`
HA (in-region): Multi-AZ, auto scaling, health checks
DR (cross-region): Backup & Restore, Pilot Light, Warm Standby, Active-Active

Metrics:
  RTO: max acceptable downtime
  RPO: max acceptable data loss

Design Principles:
  • Deploy across ≥2 AZs
  • Use health checks (application-level /healthz)
  • Set minimum healthy percent = 50-100
  • Use auto scaling groups with min/max/desired
  • Test failover regularly (chaos engineering)
  • Store data redundantly (RDS Multi-AZ, S3 11x9s)

AWS Services for HA:
  Route53: DNS failover, health checks
  ALB/NLB: health check-based routing
  RDS Multi-AZ: automatic DB failover
  Auto Scaling: replace failed instances
  ECS/EKS: reschedule failed tasks`,
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
            content: `## Why This Matters (Read This First)

Cloud security encompasses data encryption (KMS), secrets management, and compliance certifications. A data breach can cost millions — both in fines and customer trust.

Key concepts: **encryption at rest** (data is encrypted when stored), **encryption in transit** (TLS for data in motion), **secrets rotation** (regularly change credentials), and **audit logging** (record every API call).

---

## KMS — Key Management Service

KMS manages encryption keys and uses **envelope encryption**:

\`\`\`
Envelope Encryption (AWS KMS):
                    ┌──────────────┐
  Plaintext data ──→│  Encrypt     │──→ Ciphertext
    (large, any)    │  (DEK + KMS) │    (stored on disk)
                    └──────────────┘
                          ▲
                         DEK (Data Encryption Key)
                          ▲
                    ┌──────────────┐
                    │  KMS Master  │── Encrypts DEK
                    │  Key (CMK)   │   (key rotation = re-wrap DEK)
                    └──────────────┘
\`\`\`

\`\`\`python
import boto3

kms = boto3.client("kms")

# Encrypt a small secret (<4KB — use envelope encryption for larger)
response = kms.encrypt(
    KeyId="alias/my-key",
    Plaintext=b"my-secret-password"
)
ciphertext = response["CiphertextBlob"]

# Decrypt
response = kms.decrypt(CiphertextBlob=ciphertext)
plaintext = response["Plaintext"].decode()
\`\`\`

### Key Rotation

\`\`\`bash
# AWS KMS automatic rotation (once per year)
aws kms enable-key-rotation --key-id alias/my-key

# Manual rotation — create new key, update aliases
aws kms create-key --description "my-key-v2"
aws kms create-alias \
  --alias-name alias/my-key \
  --target-key-id new-key-id

# Old data encrypted with old key can still be decrypted
# (KMS keeps old backing keys)
# But new data uses the new key
\`\`\`

---

## Secrets Manager

\`\`\`python
import boto3
from botocore.exceptions import ClientError

sm = boto3.client("secretsmanager")


def get_db_password():
    try:
        response = sm.get_secret_value(SecretId="prod/db/password")
        return response["SecretString"]
    except ClientError as e:
        # Secrets Manager rotates automatically
        # If rotation fails → CloudWatch alarm
        # Access logged to CloudTrail
        raise
\`\`\`

\`\`\`bash
# Store a secret with automatic rotation
aws secretsmanager create-secret \
  --name prod/db/password \
  --secret-string '{"username":"admin","password":"MyP@ssw0rd!"}' \
  --rotation-rules '{"AutomaticallyRotateAfterDays": 30}'
\`\`\`

---

## CloudTrail — Audit Logging

Every API call recorded:

\`\`\`bash
# Look up recent API calls
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=CreateKeyPair

# Output:
# {
#     "Events": [{
#         "EventName": "CreateKeyPair",
#         "Username": "alice@company.com",
#         "EventTime": "2024-03-15T10:30:00Z",
#         "SourceIPAddress": "203.0.113.42",
#         "Resources": [{"ResourceName": "my-key", "ResourceType": "AWS::EC2::KeyPair"}]
#     }]
# }

# Stream to S3 for long-term retention
aws cloudtrail create-trail --name org-trail --s3-bucket-name my-cloudtrail-logs
\`\`\`

---

## Compliance Frameworks

| Framework | Focus | Key Requirements |
|-----------|-------|-----------------|
| SOC 2 | Controls for service organizations | Audit log, encryption, access control |
| ISO 27001 | Information security management | Risk assessment, incident response |
| PCI-DSS | Payment card data | Encryption, network segmentation, quarterly scans |
| HIPAA | Healthcare data (US) | BAA with provider, encryption, audit controls |
| GDPR | Personal data (EU) | Data processing records, breach notification, right to deletion |

---

## Practice Questions

1. **Q:** What is envelope encryption and why does KMS use it?
   **A:** Envelope encryption encrypts your data with a Data Encryption Key (DEK), then encrypts the DEK with a KMS master key. This allows encrypting arbitrary-sized data (KMS limits individual API calls to 4KB) and enables key rotation (rotate the master key, re-wrap the DEK — data stays encrypted with the same DEK).

2. **Q:** What is the difference between AWS Secrets Manager and Parameter Store?
   **A:** Secrets Manager supports automatic rotation (Lambda-based), cross-region replication, and costs $0.40/secret/month. Parameter Store is cheaper (free tiers), supports plain text and secure strings, but requires custom tooling for rotation. Use Secrets Manager for database passwords, Parameter Store for config values.

3. **Q:** How do you encrypt data at rest for EBS volumes?
   **A:** Enable EBS encryption by default using a KMS customer managed key. When you create an EC2 instance, its EBS volumes are encrypted. The EC2 instance reads/writes normally — encryption/decryption happens transparently at the hypervisor level. Snapshots and AMIs inherit the encryption.

4. **Q:** What logs does CloudTrail capture and what does it miss?
   **A:** CloudTrail captures management events (CreateInstance, DeleteBucket) by default. Data events (GetObject, PutObject) require additional configuration. It does NOT capture operating system logs — those need CloudWatch Agent. CloudTrail is for who-did-what in AWS; OS logs are for who-did-what in the instance.

5. **Q:** What is a compliance "scope" and why does it matter?
   **A:** The scope defines which systems, processes, and data are covered by a compliance certification. If your database is in scope for PCI-DSS, it must meet PCI requirements. You can reduce scope by using managed services (RDS handles encryption, patching) or by isolating cardholder data to specific systems.

---

## Summary Cheat Sheet

\`\`\`
KMS:
  Envelope encryption: DEK + KMS Master Key
  Key rotation: automatic (yearly) or manual
  Key types: AWS managed (free), Customer managed ($1/month)

Secrets Manager:
  Automatic rotation (30, 60, 90 days)
  Cross-region replication
  CloudTrail logging for all access

Encryption:
  At rest: EBS (KMS), S3 (SSE-S3/KMS/C), RDS (KMS)
  In transit: TLS everywhere (VPC-internal or internet)

Compliance:
  SOC 2: controls and monitoring
  ISO 27001: ISMS framework
  PCI-DSS: payment data
  HIPAA: healthcare data
  GDPR: personal data of EU citizens

Audit: CloudTrail (management + data events)`,
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
            content: `## Why This Matters (Read This First)

Cloud costs are the second-largest expense for most tech companies after payroll. Without FinOps practices, costs grow unpredictably — unused resources, over-provisioned instances, forgotten volumes, and expensive data transfer.

FinOps is not just "spend less" — it is "spend effectively." The goal is to get maximum value from every cloud dollar.

---

## The FinOps Lifecycle

\`\`\`
      ┌─────────────┐
      │  INFORM     │
      │  Visibility │
      │  + Tagging  │
      └──────┬──────┘
             │
      ┌──────▼──────┐
      │  OPTIMIZE   │
      │  Right-size │
      │  + Commit   │
      └──────┬──────┘
             │
      ┌──────▼──────┐
      │  OPERATE   │
      │  Governance │
      │  + Culture  │
      └──────┬──────┘
             │
      └──────┘ (continuous cycle)
\`\`\`

---

## Compute Optimization

### Right-Sizing

\`\`\`bash
# CloudWatch metrics — find over-provisioned instances
# CPU < 20% for 14 days → downsize
# Memory < 40% for 14 days → downsize

# Example: m5.xlarge → m5.large saves 50% cost
# Before: m5.xlarge (4 vCPU, 16 GB) ~$0.192/hr → ~$140/month
# After:  m5.large  (2 vCPU,  8 GB) ~$0.096/hr → ~$70/month
\`\`\`

### Reserved Instances / Savings Plans

\`\`\`
                       On-Demand    1yr Reserved    3yr Reserved     Spot
EC2 (m5.xlarge)        $0.192/hr    $0.122/hr        $0.087/hr       $0.057/hr
Savings vs On-Demand:   —            36%              55%             70%

AWS Savings Plan: commit to $X/hr compute spend
  - Covers EC2, Fargate, Lambda
  - 1yr: ~30% savings
  - 3yr: ~50% savings
  - Compute Savings Plan: flexible across instance family, region, OS
\`\`\`

### Spot Instances

\`\`\`yaml
# ECS with Spot + On-Demand mix
services:
  worker:
    capacity_provider_strategy:
      - capacity_provider: FARGATE_SPOT
        weight: 3   # 75% of tasks on Spot
        base: 5
      - capacity_provider: FARGATE
        weight: 1   # 25% on On-Demand

# Spot interruption: 2-minute warning before termination
# Handle graceful shutdown:
# - Task drains connections
# - Saves progress to SQS/S3
# - Another Spot task picks up the work
\`\`\`

---

## Storage Tiering

\`\`\`
S3 Storage Classes:
  Standard:    $0.023/GB   — frequent access, <30 days
  Intelligent: $0.023/GB   — auto-tiering (monitoring fee)
  Standard IA: $0.0125/GB  — infrequent, 30-90 days
  One Zone IA: $0.01/GB    — recreatable data
  Glacier:     $0.004/GB   — archives, retrieval 1-12h
  Deep Archive:$0.001/GB   — long-term, retrieval 12-48h

Example: 10TB of data, 50% >90 days old
Before: 10TB in Standard = $230/month
After:  5TB Standard + 5TB Glacier = $115 + $20 = $135/month
Savings: ~41%
\`\`\`

---

## Cost Allocation Tags

\`\`\`bash
# Assign tags to all resources
aws ec2 create-tags \
  --resources i-12345 \
  --tags Key=Environment,Value=production \
         Key=Team,Value=backend \
         Key=Service,Value=api \
         Key=CostCenter,Value=CC-1234

# View costs by tag in Cost Explorer
# Without tags: "I don't know who spent what"
# With tags: "Team backend spent $12,400 on production this month"
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between a Reserved Instance and a Savings Plan?
   **A:** RI: commit to a specific instance family in a specific region (m5.xlarge, us-east-1). Savings Plan: commit to a dollar amount of compute ($100/hour) — covers EC2, Fargate, Lambda. Savings Plan is more flexible because savings apply regardless of instance family, size, OS, or region.

2. **Q:** When should you use Spot instances vs On-Demand?
   **A:** Spot for: fault-tolerant, stateless, batch jobs, CI/CD runners, canary deployments. On-Demand for: stateful services, databases, critical real-time APIs, services that cannot tolerate interruption. Best practice: use a mix of Spot + On-Demand with a diversification strategy.

3. **Q:** What is the biggest hidden cost in cloud?
   **A:** Data transfer out (egress). Ingress is free (usually). Egress costs $0.05-0.09/GB. Common sources: cross-AZ traffic, direct-to-internet serving (instead of CloudFront), NAT Gateway data processing ($0.045/hr + $0.045/GB). Solution: use CloudFront for egress, keep traffic within same AZ when possible, use VPC endpoints.

4. **Q:** How do you detect unused resources?
   **A:** AWS Trusted Advisor, Cost Explorer Rightsizing Recommendations, and custom scripts check for: stopped instances, unattached EBS volumes (>30 days), unassociated Elastic IPs, idle load balancers (no traffic for 7 days), old snapshots, underutilized RDS instances.

5. **Q:** What is the FinOps "unit economics" metric?
   **A:** Instead of tracking total cloud spend, track cost per unit (cost per API request, cost per user, cost per transaction). As the business grows, total spend naturally goes up — but unit cost should go down (efficiency). If unit cost stays flat or increases, optimization efforts are not keeping up.

---

## Summary Cheat Sheet

\`\`\`
FinOps Lifecycle: Inform → Optimize → Operate

Compute Savings (vs On-Demand):
  Spot: 60-90% (interruptible)
  1yr Savings Plan: ~30%
  3yr Savings Plan: ~50%
  Right-sizing: 20-50%

Storage:
  Use S3 Lifecycle Policies (Standard → IA → Glacier)
  Delete unused EBS volumes and snapshots

Cost Allocation:
  Tag everything: Environment, Team, Service, CostCenter
  Use Cost Explorer + Budgets + Anomaly Detection

Biggest Cost Levers:
  1. Compute: Spot + Savings Plans + Right-sizing
  2. Storage: lifecycle policies, delete unused
  3. Data Transfer: CloudFront, keep traffic in AZ
  4. Networking: NAT Gateway costs, VPC endpoints`,
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
            content: `## Why This Matters (Read This First)

Zero Trust eliminates the concept of a "trusted internal network." In traditional security, being inside the corporate network means you are trusted. In Zero Trust, every request must authenticate and be authorized — regardless of where it comes from.

COVID-era remote work accelerated Zero Trust adoption. VPNs gave full network access to every device (including infected ones). Zero Trust gives app-level access based on user identity and device health.

---

## Core Principles

\`\`\`
Traditional (Castle-and-Moat):
  ┌──────────────────────────┐
  │  Corporate Network        │
  │  ┌──────────────────┐    │
  │  │  Everything is    │    │
  │  │  trusted inside    │    │
  │  │  the perimeter     │    │
  │  └──────────────────┘    │
  └──────────────────────────┘
         │ Firewall │
         └──────────┘
  ┌──────────────────────────┐
  │  Internet (untrusted)    │
  └──────────────────────────┘
  Problem: once inside, attacker has full access

Zero Trust (BeyondCorp):
  ┌──────────────────────────┐
  │  Every request:          │
  │  • Who is the user?      │
  │  • What device?          │
  │  • What app?             │
  │  • Is device healthy?    │
  │  • Is location allowed?  │
  │  → Allow or Deny         │
  └──────────────────────────┘
           │ │ │
           ▼ ▼ ▼
  ┌──────────────────────────┐
  │  Apps (no VPN needed)    │
  │  All apps are public-    │
  │  facing but protected    │
  │  by Identity-Aware Proxy │
  └──────────────────────────┘
\`\`\`

---

## Identity-Aware Proxy (IAP)

Google's BeyondCorp, Cloudflare Access, and Pomerium use IAP:

\`\`\`yaml
# Cloudflare Access — protect an internal app
# Before Access: anyone can reach app.internal.com
# After Access: user must authenticate via SSO + device check

# Access policy
policies:
  - name: "Internal App Access"
    decision: allow
    include:
      - email_domain: company.com
    require:
      - device_posture: "OS Version ≥ macOS 14 / Windows 11"
      - country: ["US", "GB", "DE"]

# How it works at network level:
# 1. User → cloudflare.com/app → Cloudflare edge
# 2. Cloudflare checks JWT token (set by Access)
# 3. If valid → forwards to origin server
# 4. Origin verifies JWT signature (optional)
\`\`\`

---

## Microsegmentation

Divide the network into small zones — each connection authenticated:

\`\`\`
Without Microsegmentation:
  ┌──────────────────────────────┐
  │  All workloads in same subnet │
  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐   │
  │  │DB│ │FE│ │BE│ │CV│ │RD│   │
  │  └──┘ └──┘ └──┘ └──┘ └──┘   │
  │  Any workload can reach any   │
  │  other — one breach = all     │
  └──────────────────────────────┘

With Microsegmentation:
  ┌──────────────────────────────┐
  │  ┌─────┐    ┌─────┐          │
  │  │ FE  │───→│ BE  │───→ DB   │
  │  └─────┘    └─────┘          │
  │    │                          │
  │    └──→ CV (only scm->cv)    │
  │                              │
  │  Each connection:            │
  │  • Authenticated (mTLS)      │
  │  • Authorized (policy)       │
  │  • Logged                    │
  └──────────────────────────────┘
\`\`\`

---

## ZTNA vs VPN

| Feature | VPN | ZTNA (Cloudflare Access, Zscaler) |
|---------|-----|-----------------------------------|
| Access scope | Full network | App-level only |
| Auth frequency | Once (on connect) | Every request |
| Device posture | Rarely checked | Checked per session |
| User experience | Requires client software | Browser-based |
| Lateral movement | Full access after breach | Contained to one app |
| Audit | IP-level | User + device + app-level |

---

## Practice Questions

1. **Q:** What is the fundamental difference between VPN and ZTNA?
   **A:** VPN grants access to the NETWORK (subnet, IP range) — once connected, the user can reach any resource. ZTNA grants access to specific APPLICATIONS — even if authenticated, the user can only reach the apps they are authorized for. ZTNA eliminates lateral movement.

2. **Q:** How does Google's BeyondCorp work in practice?
   **A:** BeyondCorp removes the VPN entirely. All applications are deployed publicly (accessible from the internet), but protected by an Identity-Aware Proxy. When a user tries to access an app, the proxy checks: user identity (SSO), device inventory (corporate-managed?), device posture (OS patched? disk encrypted?), and context (location, time). If all checks pass, access is granted.

3. **Q:** What is mTLS and how does it support Zero Trust?
   **A:** mTLS (mutual TLS) requires both the client and server to present certificates. The client verifies the server's cert (standard TLS) AND the server verifies the client's cert. This ensures both sides know who they are talking to. In a service mesh, mTLS ensures every service-to-service connection is authenticated.

4. **Q:** What is the "blast radius" benefit of Zero Trust?
   **A:** In Zero Trust, even if a user's credentials are compromised, the attacker can only access the specific apps that user has access to — not the entire network. With VPN, a compromised credential gives access to the full internal network. Zero Trust also enables microsegmentation, where each service can only reach specific other services.

5. **Q:** How does device posture verification work in Zero Trust?
   **A:** Device posture checks are done by an agent or browser-based check when the user authenticates. Checks include: OS version (not end-of-life?), disk encryption enabled?, antivirus running?, no known malware?, firewall enabled?, recent security patches applied? For managed devices, the device inventory is checked to ensure the device is corporate-registered.

---

## Summary Cheat Sheet

\`\`\`
Zero Trust Principles:
  Never trust, always verify
  Least privilege access
  Assume breach
  Verify every request

Key Technologies:
  IAP (Identity-Aware Proxy): Cloudflare Access, Google IAP, Pomerium
  mTLS: mutual TLS for service-to-service auth
  Microsegmentation: smallest possible network zones
  Device Posture: OS version, encryption, AV, patches

ZTNA vs VPN:
  ZTNA: app-level, browser-based, per-request auth, no lateral movement
  VPN: network-level, client software, one-time auth, full access

Implementation:
  User → IAP → App (authenticated + authorized)
  Service → mTLS → Service (authenticated + authorized)
  All access logged and audited`,
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
            content: `## Why This Matters (Read This First)

Serverless means you focus on code, not servers. No provisioning, no patching, no capacity planning — the cloud provider handles all infrastructure.

There are two serverless models: **FaaS** (functions — Lambda, Cloud Functions) for event-driven, short-lived work, and **Container Serverless** (Fargate, Cloud Run) for running any containerized application without managing servers.

---

## FaaS: AWS Lambda

\`\`\`python
import json
import boto3

def handler(event, context):
    # event: API Gateway request, S3 event, SQS message, etc.
    # context: runtime info (function name, timeout remaining, request ID)

    # S3 trigger example: resize image when uploaded
    bucket = event["Records"][0]["s3"]["bucket"]["name"]
    key = event["Records"][0]["s3"]["object"]["key"]

    # Process image (max 15 min execution time)
    s3 = boto3.client("s3")
    response = s3.get_object(Bucket=bucket, Key=key)
    # ... resize, transform ...

    return {"statusCode": 200, "body": json.dumps({"processed": key})}
\`\`\`

\`\`\`json
// Lambda configuration
{
    "functionName": "image-resizer",
    "runtime": "nodejs20.x",
    "memorySize": 512,       // 128MB - 10GB
    "timeout": 300,          // max 900 seconds (15 min)
    "reservedConcurrency": 100,  // limit concurrent executions
    "provisionedConcurrency": 10, // keep 10 warm to avoid cold starts
    "snapStart": { "Enabled": true }  // Java only: restore from snapshot
}
\`\`\`

---

## Cold Starts

\`\`\`
Function Execution Timeline (cold start):
  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐
  │ Download │ │ Extract  │ │ Init     │ │ Handler │
  │ code     │ │ runtime  │ │ (static  │ │ runs    │
  │ (S3)     │ │ (Node/   │ │  init)   │ │         │
  │ 50ms     │ │ Python)  │ │ 30ms     │ │         │
  │          │ │ 100ms    │ │          │ │         │
  └─────────┘ └──────────┘ └──────────┘ └────────┘
  Cold start total: ~200ms-1s
  Warm start: ~1-5ms (handler only — no init)

Mitigations:
  • Provisioned Concurrency: keep N instances warm (pay per instance)
  • SnapStart (Java): snapshot of init phase → restore in <200ms
  • Keep functions warm: periodic pings (crude but cheap)
  • Smaller package size: fewer code to download
  • Increase memory: more CPU = faster startup
\`\`\`

---

## Container Serverless: Fargate

Run any Docker container without managing EC2:

\`\`\`yaml
# ECS with Fargate — no EC2 instances
services:
  api:
    image: my-api:latest
    cpu: 512       # 0.25-16 vCPU
    memory: 1024   # 512MB-120GB
    network:
      vpc: my-vpc
      subnets: [private-subnet-1, private-subnet-2]
    scaling:
      min: 0       # Scale to zero when idle
      max: 100
      target: cpu=70  # Auto-scale based on CPU
    health_check:
      path: /healthz
      interval: 30s
\`\`\`

### Fargate vs Lambda

| Feature | Lambda | Fargate |
|---------|--------|---------|
| Unit | Function | Container |
| Max memory | 10GB | 120GB |
| Max timeout | 15 min | Unlimited |
| Cold start | ~200ms-1s | ~30s-2min |
| Scaling | Instant (burst) | Slower (new task) |
| State | Stateless | Can be stateful |
| Pricing | Per invocation + duration | Per vCPU-hour + memory-hour |
| Best for | Event-driven, bursty | Long-running, any container |

---

## Cloud Run (GCP)

Serverless containers with auto-scaling to zero:

\`\`\`yaml
# cloudbuild.yaml — deploy to Cloud Run
steps:
  - name: gcr.io/cloud-builders/docker
    args: ["build", "-t", "gcr.io/$PROJECT_ID/my-app", "."]
  - name: gcr.io/cloud-builders/docker
    args: ["push", "gcr.io/$PROJECT_ID/my-app"]
  - name: gcr.io/google.com/cloudsdktool/cloud-sdk
    entrypoint: gcloud
    args:
      - run
      - deploy
      - my-app
      - --image=gcr.io/$PROJECT_ID/my-app
      - --region=us-central1
      - --min-instances=0   # Scale to zero
      - --max-instances=100
      - --concurrency=80    # 80 concurrent requests per container
      - --cpu-boost         # More CPU during cold start
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between Lambda and Fargate in terms of pricing?
   **A:** Lambda charges per invocation + per GB-second of execution. For a function that runs 100ms, 1M invocations costs ~$0.20 + compute. Fargate charges per vCPU-hour + GB-hour. For a container running 24/7, Fargate costs ~$20/month. Lambda is cheaper for spiky workloads, Fargate is cheaper for steady-state.

2. **Q:** How do you handle database connections in Lambda?
   **A:** Open the connection outside the handler function (in the INIT phase). The connection is reused across invocations on the same warm execution environment. Use connection pooling (RDS Proxy) to avoid overwhelming the database when many concurrent Lambdas start.

3. **Q:** What is SnapStart and when should you use it?
   **A:** SnapStart takes a snapshot of the Lambda execution environment after the INIT phase (but before the handler runs). On cold start, the snapshot is restored instead of re-running INIT — reducing cold start from ~6s to ~200ms for Java functions. Only available for Java 11+ runtimes.

4. **Q:** When would you choose Fargate over Lambda?
   **A:** Fargate when: you need more than 15 minutes of execution, more than 10GB memory, GPU workloads, WebSocket servers, or when you want to run an existing containerized app without rewriting it as functions. Fargate also gives you a VPC IP for each task (Lambda needs a VPC config).

5. **Q:** What is the "scale to zero" concept in serverless?
   **A:** When there is no traffic, no containers are running — you pay nothing. When a request comes in, the provider starts a container (cold start). This is great for cost but adds latency on the first request. Cloud Run and Fargate support min=0 instances. Lambda scales to zero natively.

---

## Summary Cheat Sheet

\`\`\`
Serverless Models:
  FaaS (Lambda, Cloud Functions): event-driven, short-lived, per-invocation pricing
  Container (Fargate, Cloud Run): any container, auto-scaling, per-hour pricing

Lambda Constraints:
  Memory: 128MB-10GB
  Timeout: max 15 min
  Disk: 512MB-10GB (/tmp)
  Payload: 256KB (sync), 256KB (async)

Cold Start Mitigation:
  Provisioned Concurrency (pay to keep warm)
  SnapStart (Java snapshot restore)
  Minimize deployment package size
  Use faster runtimes (Python/Node > Java/.NET)

When to use serverless:
  Variable/spiky traffic, event processing, APIs, background jobs
When NOT to use:
  Steady high load, long-running, latency-sensitive,
  GPU workloads, stateful services`,
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
            content: `## Why This Matters (Read This First)

Choosing a cloud provider is a long-term architectural decision. Each provider has strengths: AWS has the deepest service catalog, GCP excels at data/ML, and Azure integrates best with Microsoft enterprise tools.

Multi-cloud is increasingly common — use each provider for what it does best, with Kubernetes and Terraform as the common layer.

---

## Compute Comparison

\`\`\`
                  AWS                     GCP                  Azure
VMs               EC2                     Compute Engine        Virtual Machines
Serverless FaaS   Lambda                  Cloud Functions       Azure Functions
Serverless Ctr    Fargate                 Cloud Run             Container Instances
Orchestration     ECS + EKS               GKE (Autopilot)       AKS
Edge              Lambda@Edge + CF        Cloud Functions       Azure Front Door
                  Workers

Kubernetes:
EKS:   $0.10/hr per cluster control plane (managed)
GKE:   $0.10/hr per cluster (Autopilot) or free (Standard) + $0.10/node
AKS:   Free control plane (pay only for worker nodes)
\`\`\`

---

## Data & AI

| Service Category | AWS | GCP | Azure |
|-----------------|-----|-----|-------|
| Relational DB | RDS / Aurora | Cloud SQL | Azure SQL |
| NoSQL | DynamoDB | Firestore | Cosmos DB |
| Data Warehouse | Redshift | BigQuery | Synapse |
| Data Streaming | Kinesis | Pub/Sub | Event Hubs |
| ML Platform | SageMaker | Vertex AI | Azure ML |
| Vector DB | OpenSearch (vect.) | Vertex AI Vector | Azure AI Search |
| Object Storage | S3 | Cloud Storage | Blob Storage |

### Key Differentiators

**AWS DynamoDB:** single-digit ms at any scale, auto-scaling, DAX cache, global tables. Best for: session store, game leaderboards, IoT event storage.

**GCP BigQuery:** serverless data warehouse, no cluster management, SQL:2011, real-time streaming, separates compute and storage. Best for: analytics, BI, data exploration.

**Azure Cosmos DB:** multi-model (document, key-value, graph, columnar), global distribution with multi-region writes, 99.999% read availability. Best for: globally distributed apps.

---

## Networking

\`\`\`
VPC:
  AWS: VPC (regional), subnet (AZ), IGW, NAT, TGW, VPC Peering
  GCP: VPC (global — spans regions), subnet (regional), Cloud NAT, VPC Peering
  Azure: VNet (regional), subnet (AZ), Azure Firewall, VPN Gateway, ExpressRoute

CDN:
  AWS: CloudFront (410+ POPs, Lambda@Edge, Origin Shield)
  GCP: Cloud CDN (150+ POPs, integrated with HTTP(S) LB)
  Azure: Azure CDN (130+ POPs, + Front Door + Verizon/Akamai)

DNS:
  Route53 (AWS) — fully managed, health checks, routing policies
  Cloud DNS (GCP) — global anycast, low latency
  Azure DNS — integrated with Azure AD, RBAC
\`\`\`

---

## Decision Framework

\`\`\`
Your primary ecosystem:
  Microsoft (.NET, Active Directory, SQL Server) → Azure
  Google (Kubernetes, BigQuery, Android/chrome) → GCP
  Everything else → AWS (largest ecosystem, most services)

Your requirements:
  Best ML/AI infrastructure → GCP (Vertex AI, TPUs)
  Best serverless ecosystem → AWS (Lambda + 200+ event sources)
  Best hybrid/on-prem → Azure (Azure Arc, Stack, Active Directory)
  Best Kubernetes → GKE (Autopilot, multi-cluster, Anthos)
  Most compliance certs → AWS (143+ certs) / Azure (90+) / GCP (50+)
  Lowest egress cost → GCP ($0.08-0.12/GB) / AWS ($0.05-0.09/GB)

Multi-cloud strategy:
  • Use Kubernetes as the portable orchestration layer
  • Use Terraform for infrastructure as code (provider-agnostic)
  • Use OpenTelemetry for observability (vendor-neutral)
  • Accept lock-in for differentiated services (DynamoDB, BigQuery)
\`\`\`

---

## Practice Questions

1. **Q:** When would you choose GCP over AWS?
   **A:** When data/ML workloads are the primary use case (BigQuery, Vertex AI, TPUs), when you want simple networking (global VPC — no peering), when you prefer Kubernetes-first (GKE Autopilot is the most mature managed K8s), or when your team is experienced with Google's tools.

2. **Q:** What is the biggest difference between AWS and Azure for enterprise?
   **A:** Azure's native integration with Microsoft enterprise tools: Active Directory (same identity for on-prem and cloud), SQL Server licensing, Power Platform, Office 365 integration, and hybrid scenarios with Azure Arc. AWS requires third-party tools for most enterprise integrations.

3. **Q:** How do you choose between DynamoDB, Firestore, and Cosmos DB?
   **A:** DynamoDB for: AWS-native workloads, high-traffic gaming/ads/IoT (provisioned throughput model), predictable performance at any scale. Firestore for: GCP-native, real-time sync (mobile apps), serverless (auto-scales). Cosmos DB for: multi-region writes (global apps), multi-model (one DB for document + graph + key-value).

4. **Q:** What is the cost comparison for data egress across providers?
   **A:** All providers charge for data leaving their network. AWS: $0.09/GB first 10TB (lower with volume). GCP: $0.12/GB first 10TB. Azure: $0.087/GB. Use CDNs (CloudFront, Cloud CDN) to reduce egress costs — CDN egress is $0.085/GB (AWS) vs direct egress $0.09/GB. Multi-cloud egress can be expensive — keep data within one provider when possible.

5. **Q:** What is the role of Terraform in multi-cloud?
   **A:** Terraform provides a single declarative language (HCL) to manage resources across all cloud providers. You define infrastructure in code, version it in git, and apply it anywhere. This reduces the mental overhead of learning three different CLIs and makes infrastructure reviewable. However, Terraform cannot abstract away provider-specific concepts (IAM roles vs service accounts) — those are still different in each provider.

---

## Summary Cheat Sheet

\`\`\`
AWS Strengths: most services (200+), serverless (Lambda), DynamoDB
GCP Strengths: data/ML (BigQuery, Vertex AI), Kubernetes (GKE)
Azure Strengths: enterprise (AD, SQL Server), hybrid

Compute:
  VMs: EC2 → Compute Engine → Virtual Machines
  K8s: EKS → GKE → AKS
  Serverless: Lambda → Cloud Functions → Azure Functions

Data:
  NoSQL: DynamoDB → Firestore → Cosmos DB
  Warehouse: Redshift → BigQuery → Synapse
  Streaming: Kinesis → Pub/Sub → Event Hubs

Multi-cloud:
  Common layer: K8s + Terraform + OpenTelemetry
  Accept lock-in on differentiated services
  Watch egress costs`,
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
            content: `## Why This Matters (Read This First)

Managed cloud services let you use powerful infrastructure without managing servers. Databases, queues, and event buses are the backbone of modern applications — and each cloud provider offers multiple options with different tradeoffs.

Choosing the wrong managed service leads to: vendor lock-in, unexpected costs (especially with NoSQL), scalability pain, operational complexity, or missing features you need (transactions, ordering, exactly-once delivery).

---

## Relational Databases

\`\`\`yaml
# AWS RDS — managed MySQL/PostgreSQL
Database:
  engine: aurora-mysql   # 5x throughput vs standard MySQL
  instance: db.r6g.large # $0.25/hr
  storage: 100GB         # auto-scaling up to 128TB
  multi_az: true         # synchronous standby replica
  backup: 35 days        # automated backups + PITR
  replicas:              # read replicas for read scaling
    - read-replica-1     # cross-region for DR
    - read-replica-2

# GCP Cloud SQL — managed MySQL/PostgreSQL/SQL Server
# Features: automatic replication, failover, backups, update
# No auto-scaling storage (unlike Aurora)

# Azure SQL — fully managed SQL Server
# Features: built-in AI, serverless tier (pause when idle)
# Geo-replication: active geo-replication up to 4 regions
\`\`\`

---

## NoSQL — DynamoDB, Firestore, Cosmos DB

\`\`\`javascript
// AWS DynamoDB — key-value + document
// Single-digit ms latency at any scale

// Table design (single table design pattern):
// PK: userId  SK: sortKey
// One table = all access patterns

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

// Put item — automatically replicates across 3 AZs
await dynamo.put({
    TableName: "my-app",
    Item: {
        pk: "user#123",
        sk: "profile",
        name: "Alice",
        email: "alice@example.com",
        ttl: Math.floor(Date.now() / 1000) + 86400 // auto-expire
    }
}).promise();

// Query by PK + SK range
const result = await dynamo.query({
    TableName: "my-app",
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    ExpressionAttributeValues: {
        ":pk": "user#123",
        ":sk": "order#"
    }
}).promise();

// DynamoDB capacities:
// On-Demand: pay per request (auto-scales, no capacity planning)
// Provisioned: specify RCU/WCU (25-50% cheaper, needs planning)
// DAX cache: in-memory cache for hot data (microsecond latency)
\`\`\`

---

## Message Queues

\`\`\`
SQS (AWS) — Simple Queue Service:
  • Pull-based (consumer polls)
  • At-least-once delivery (duplicates possible)
  • 256KB max message size
  • 14-day max retention
  • Dead-letter queue for failed messages
  • Delay queues (up to 15 min)
  • FIFO queues: exactly-once, ordered ($3.50/GB vs $0.40 Standard)

Pub/Sub (GCP) — Global messaging:
  • Push or pull delivery
  • Exactly-once delivery (per region)
  • 10MB max message size
  • 7-day max retention
  • Global: messages can be published anywhere, consumed anywhere
  • Filtering: subscribers filter by attributes (server-side)

Service Bus (Azure) — Enterprise messaging:
  • Sessions (group related messages)
  • Dead-letter + auto-forward
  • Scheduled delivery
  • Duplicate detection
  • FIFO ordering
  • AMQP + HTTP protocols
\`\`\`

### Choosing the Right Queue

\`\`\`
Simple decoupling: SQS Standard (cheapest, 0.40/GB)
Ordered + exactly-once: SQS FIFO (3.50/GB)
Global event routing: GCP Pub/Sub (best global delivery)
Enterprise features: Azure Service Bus (sessions, dead-letter, scheduled)
High throughput streaming: Kinesis / Kafka / Event Hubs
Event-driven workflows: AWS EventBridge (SaaS integration, filtering, archiving)
\`\`\`

---

## Event Streaming — Kinesis vs Kafka

\`\`\`
AWS Kinesis:
  • Shard: 1MB/s write, 2MB/s read per shard
  • Records: up to 1MB
  • Retention: 24h (default) to 365d (extended)
  • Replay: from any position (like Kafka)
  • Consumers: Lambda, KCL (Kinesis Client Library), Firehose

GCP Pub/Sub (streaming):
  • Topic: 1GB/s throughput (auto-scaling)
  • Messages: up to 10MB
  • Retention: 7 days (configurable up to 31 days)
  • No shards or partitions to manage
  • Exactly-once delivery (per region)

Azure Event Hubs:
  • Throughput Unit (TU): 1MB/s ingress, 2MB/s egress
  • Kafka-compatible protocol
  • Capture to Azure Data Lake / Blob Storage
  • Geo-disaster recovery
  • Schema Registry

Apache Kafka (self-managed or MSK):
  • Highest throughput and control
  • Requires expertise to operate
  • MSK (AWS Managed Kafka) handles the control plane
\`\`\`

---

## Practice Questions

1. **Q:** When should you use SQS vs Kinesis?
   **A:** SQS for: simple message queue, decoupling microservices, async processing with variable throughput, where each message is independent. Kinesis for: event streaming, real-time analytics, ordered processing across shards, where messages need to be replayed/reprocessed. Kinesis consumers maintain their position — SQS deletes consumed messages.

2. **Q:** What is the DynamoDB single-table design pattern?
   **A:** Instead of one table per entity, store all entities in one table using composite keys (PK = entity type, SK = identifier + sort key). This enables querying related data in a single request (no joins). Example: PK="user#1", SK="order#2024-01-01" stores the order; PK="user#1", SK="profile" stores the profile. One table, one query fetches all data for a user.

3. **Q:** How does Pub/Sub's exactly-once delivery work?
   **A:** Pub/Sub assigns a unique ID to each message and tracks acknowledgments. If a subscriber receives a message but crashes before acknowledging, Pub/Sub redelivers it. With exactly-once mode (available per region), Pub/Sub deduplicates based on the message ID, ensuring each message is delivered exactly once to the subscriber.

4. **Q:** What is a dead-letter queue and when should you use one?
   **A:** A DLQ receives messages that could not be processed successfully after N retries. Configure a DLQ for each queue — when a consumer fails to process a message (exhausts retries), the message moves to the DLQ. This prevents "poison pill" messages from blocking the main queue. Monitor the DLQ for undeliverable messages.

5. **Q:** What is the difference between SQL and NoSQL in terms of scalability?
   **A:** SQL databases (Aurora, Cloud SQL) scale vertically (bigger instance) and with read replicas. NoSQL databases (DynamoDB, Cosmos DB) scale horizontally — add partitions/shards automatically. NoSQL handles higher throughput and larger datasets, but sacrifices query flexibility and ACID transactions (though both DynamoDB and Cosmos DB support transactions now).

---

## Summary Cheat Sheet

\`\`\`
Relational DB:
  AWS: RDS (multi-engine), Aurora (MySQL/PG-compatible, 5x throughput)
  GCP: Cloud SQL (MySQL, PG, SQL Server)
  Azure: Azure SQL (fully managed SQL Server)

NoSQL:
  DynamoDB: key-value + document, single-digit ms, auto-scaling
  Firestore: real-time sync, mobile-friendly, serverless
  Cosmos DB: multi-model, global distribution, multi-region writes

Queues:
  SQS: pull-based, at-least-once, 256KB, 14-day retention
  Pub/Sub: push/pull, exactly-once, 10MB, global routing
  Service Bus: sessions, dead-letter, enterprise features

Streaming:
  Kinesis: shard-based, 1MB/s per shard, replayable
  Pub/Sub: auto-scaling, 1GB/s, global
  Event Hubs: Kafka-compatible, TUs

Event-Driven: EventBridge (SaaS integration, filtering, archiving)`,
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
            content: `## Why This Matters (Read This First)

Docker revolutionized deployment by packaging applications with their dependencies. Understanding Docker's architecture helps you debug container issues, optimize image builds, and choose the right container runtime for production.

The call chain for \`docker run\`: Docker CLI → Docker daemon (dockerd) → containerd → runc. Each layer has a specific responsibility.

---

## Docker Architecture

\`\`\`
┌─────────────────────────────────────────────┐
│  docker CLI                                 │
│  $ docker run --name myapp nginx:latest     │
└──────────────────┬──────────────────────────┘
                   │ REST API (Unix socket)
                   ▼
┌─────────────────────────────────────────────┐
│  Docker Daemon (dockerd)                    │
│  • Receives API requests                     │
│  • Manages images, networks, volumes         │
│  • Talks to containerd via gRPC              │
│  • NOT running in rootless setups            │
└──────────────────┬──────────────────────────┘
                   │ gRPC (containerd socket)
                   ▼
┌─────────────────────────────────────────────┐
│  containerd                                  │
│  • OCI-compliant container runtime           │
│  • Pulls images, manages snapshots/overlayfs │
│  • Starts/stop containers via runc           │
│  • Can be used standalone (no Docker CLI)    │
└──────────────────┬──────────────────────────┘
                   │ OCI runtime spec (bundle.json)
                   ▼
┌─────────────────────────────────────────────┐
│  runc                                        │
│  • The lowest-level OCI runtime              │
│  • Creates cgroups + namespaces              │
│  • Calls clone() syscall → new process       │
│  • The actual container process              │
└─────────────────────────────────────────────┘
\`\`\`

---

## Image Layers

\`\`\`dockerfile
FROM node:20-alpine       # Layer A: base OS (~120MB)
WORKDIR /app              # Layer B: metadata
COPY package*.json ./     # Layer C: dependency manifest
RUN npm ci                # Layer D: node_modules (~40MB)
COPY . .                  # Layer E: app code (~5MB)
RUN npm run build         # Layer F: compiled output (~10MB)
RUN rm -rf /tmp/*         # Layer G: cleanup (creates empty layer!)

# Total: 7 layers, ~175MB
# Cache: change package.json? Layer C+ are rebuilt
#        change app code? Layer E+ are rebuilt
\`\`\`

\`\`\`bash
# Inspect layers of an image
docker history nginx:latest
# IMAGE          CREATED       CREATED BY                                      SIZE
# c316d5a335a7   2 weeks ago   CMD ["nginx" "-g" "daemon off;"]               0B
# <missing>      2 weeks ago   STOPSIGNAL SIGQUIT                             0B
# <missing>      2 weeks ago   EXPOSE port 80                                 0B
# <missing>      2 weeks ago   ENTRYPOINT ["/docker-entrypoint.sh"]           0B
# <missing>      2 weeks ago   COPY ... /docker-entrypoint.sh ...             1.17kB
# <missing>      2 weeks ago   RUN /bin/sh -c ... # buildkit                  59.4MB

# Size of each layer
docker image history nginx:latest --no-trunc --format '{{.Size}}\t{{.CreatedBy}}'
\`\`\`

---

## BuildKit — Modern Builder

\`\`\`bash
# Enable BuildKit (Docker v18.09+)
export DOCKER_BUILDKIT=1

# Features:
# • Parallel builds (separate stages in parallel)
# • Cache mounts (apt, npm, maven)
# • Secret mounts (no baked-in secrets)
# • SSH agent forwarding (private repo access)
# • Better cache layer inspection

docker build \
  --secret id=npmrc,src=$HOME/.npmrc \
  --cache-from myapp:cache \
  --output type=image,name=myapp:latest,push=true \
  .

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag myrepo/myapp:latest \
  --push .
\`\`\`

---

## containerd vs runc vs CRI-O

| Runtime | Description | Used by |
|---------|-------------|---------|
| runc | OCI low-level runtime — direct kernel calls | containerd, CRI-O |
| containerd | High-level runtime — image management + lifecycle | Docker, Kubernetes (containerd) |
| CRI-O | CRI-compliant runtime, optimized for K8s | OpenShift, Kubernetes |
| gVisor | User-space kernel — stronger isolation (syscall interception) | GKE Sandbox |
| Kata | Lightweight VM for each container — hardware isolation | Kata Containers |
| Youki | Rust-based runc alternative — faster, safer | Soon: K8s |

---

## Practice Questions

1. **Q:** What happens when you run \`docker run nginx\`?
   **A:** 1) Docker CLI sends REST API request to dockerd. 2) dockerd requests containerd to create the container. 3) containerd pulls the image (if not cached), creates the rootfs via overlayfs, generates an OCI bundle. 4) containerd calls runc with the OCI bundle. 5) runc creates cgroups, namespaces, and calls clone() to start the nginx process.

2. **Q:** What is the difference between BuildKit's cache mount and a normal RUN layer?
   **A:** A normal RUN layer (apt install) persists the package cache IN the image layer — increasing image size permanently. BuildKit's \`--mount=type=cache,target=/var/cache/apt\` uses a host-side cache directory — the cache is NOT in the image, so package downloads are cached between builds but the image stays small.

3. **Q:** Why does \`docker history\` show <missing> for some layers?
   **A:** \`<missing>\` layers are intermediate layers from a multi-stage build or an image built with BuildKit. They exist in the local build cache but were not pushed to a registry. The final image has all the content, but the intermediate layers are only available locally for caching.

4. **Q:** When would you use containerd directly instead of Docker?
   **A:** Kubernetes uses containerd directly (via CRI). Google uses containerd directly for internal container management. Tools like nerdctl and ctr provide CLI access to containerd. Benefits: no Docker daemon dependency, smaller footprint, fewer moving parts.

5. **Q:** How does gVisor differ from runc for security?
   **A:** runc creates isolated processes using namespaces + cgroups (shared kernel). If the host kernel has a vulnerability, a container escape can compromise the host. gVisor intercepts system calls and runs them in a userspace kernel — even if the app is compromised, the attacker cannot exploit host kernel bugs. gVisor is slower (~50% performance) but more secure.

---

## Summary Cheat Sheet

\`\`\`
Docker Architecture:
  docker CLI → dockerd → containerd → runc → isolated process

Image Layers:
  Each Dockerfile instruction = 1 layer
  Layers are cached by content hash
  COPY/ADD changes = cache invalidated from that layer on

BuildKit:
  DOCKER_BUILDKIT=1
  Parallel builds, cache mounts, secret mounts
  docker buildx for multi-platform builds

Container Runtimes:
  runc: low-level, kernel namespaces + cgroups
  containerd: high-level, manages image + lifecycle
  CRI-O: K8s-focused runtime
  gVisor: security-focused (userspace kernel)
  Kata: VM-level isolation`,
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
            content: `## Why This Matters (Read This First)

Every package in your image is a potential vulnerability. The Ubuntu base image has ~600 packages — Alpine has ~60, distroless has ~5. Smaller images mean fewer CVEs, faster deployments, and simpler security audits.

Image hardening is the process of: minimizing the base image, running as non-root, never baking secrets, and scanning for known vulnerabilities.

---

## Minimal Base Images

\`\`\`
Image Size Comparison:
  ubuntu:22.04      → ~77MB (600+ packages)
  node:20-bookworm  → ~350MB (includes OS + Node + build tools)
  node:20-alpine    → ~126MB (musl libc + Node)
  node:20-slim      → ~240MB (Debian slim + Node)
  gcr.io/distroless/nodejs20 → ~180MB (just Node + minimal OS)
  scratch           → 0MB   (nothing — you bring everything)

Vulnerabilities:
  ubuntu:22.04      → ~150 CVEs (many unfixable due to kernel)
  node:20-alpine    → ~10 CVEs
  distroless        → ~0 CVEs (no shell, no package manager)
\`\`\`

\`\`\`dockerfile
# Best practice: distroless for production
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Distroless — minimal attack surface
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER 1000
CMD ["dist/index.js"]
# No shell, no apt, no curl, no wget
# Even if attacker gets RCE, they cannot install tools
\`\`\`

---

## Non-Root User

\`\`\`dockerfile
FROM node:20-alpine

# BAD: runs as root
# If attacker gets RCE, they can modify binaries, install packages
RUN npm install

# GOOD: create and use non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
WORKDIR /app
COPY --chown=appuser:appgroup . .
RUN npm install

# Kubernetes PodSecurityContext:
securityContext:
  runAsUser: 1000
  runAsGroup: 1000
  runAsNonRoot: true
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop: ["ALL"]
\`\`\`

---

## Secrets — Never Bake Into Images

\`\`\`dockerfile
# BAD: secret is in the image layer
RUN echo "API_KEY=abc123" > /app/.env

# BAD: secret is in build args (visible in docker history)
ARG NPM_TOKEN
RUN echo //registry.npmjs.org/:_authToken=$NPM_TOKEN > .npmrc

# GOOD: BuildKit secret mount (not stored in image)
RUN --mount=type=secret,id=npmrc \
    cp /run/secrets/npmrc .npmrc && \
    npm ci

# GOOD: Runtime env vars (injected at container start)
docker run -e DB_PASSWORD=secret myapp

# BEST: Secrets Manager (no env vars at all — fetch at runtime)
# The app fetches DB_PASSWORD from AWS Secrets Manager on startup
\`\`\`

---

## Vulnerability Scanning

\`\`\`bash
# Trivy — fast scanner, works without a registry
trivy image myapp:latest

# Output:
# myapp:latest (debian 12)
# ==========================
# Total: 3 (UNKNOWN: 0, LOW: 1, MEDIUM: 1, HIGH: 1, CRITICAL: 0)
#
# ┌──────────────┬────────────────┬──────────┬──────────────┐
# │   Library    │ Vulnerability  │ Severity │  Installed   │
# ├──────────────┼────────────────┼──────────┼──────────────┤
# │ libcrypto3   │ CVE-2024-1234  │ HIGH     │ 3.0.8-r4     │
# │ openssl      │ CVE-2024-1234  │ HIGH     │ 3.0.8-r4     │
# └──────────────┴────────────────┴──────────┴──────────────┘

# Scan in CI — fail on critical/high
trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:latest

# Compare before/after:
# Ubuntu base: 150+ vulnerabilities (many false positives)
# Distroless: 0-5 vulnerabilities (near zero)
# Alpine: 10-30 vulnerabilities (mostly medium/low)
\`\`\`

---

## Practice Questions

1. **Q:** Why does distroless have fewer vulnerabilities than Ubuntu?
   **A:** Distroless images contain only the application runtime and its direct dependencies — no shell, no package manager, no utilities (curl, wget, tar), no system daemons. Ubuntu ships with 600+ packages. Each package is a potential attack vector. Distroless typically has <5 CVEs vs 150+ for Ubuntu.

2. **Q:** What is the problem with building secrets into images?
   **A:** Secrets baked into image layers persist permanently. Anyone with access to the registry can pull the image and inspect its layers via \`docker history\` or \`dive\`. Secrets can be exposed if the image is pushed to a public registry, shared with a partner, or stored in a CI cache.

3. **Q:** Why use \`USER 1000\` instead of a named user?
   **A:** Named users require an entry in /etc/passwd, which adds an attack surface. Using \`USER 1000\` avoids needing user management infrastructure. However, for clarity, using \`USER nonroot\` (with RUN adduser) is common. Either is better than root.

4. **Q:** What is a "mount from secret" in BuildKit?
   **A:** BuildKit's \`--mount=type=secret\` provides a temporary file with the secret during the RUN instruction, but the file is NOT included in the final image layer. This allows using secrets (NPM tokens, SSH keys) during build without storing them in any layer.

5. **Q:** How often should you scan images for vulnerabilities?
   **A:** Every build (in CI). Scans should run before pushing to the registry. If a new CVE is discovered in a base image, rebuild and redeploy. Use tools that monitor registry images for new CVEs (Docker Scout, Snyk Monitor, Trivy Operator in K8s).

---

## Summary Cheat Sheet

\`\`\`
Image Size:
  distroless < Alpine < slim < Ubuntu < full OS

Image Security:
  • Use distroless or Alpine — minimize packages
  • Run as non-root (USER 1000)
  • Never bake secrets into layers
  • Scan every build (Trivy, Grype, Docker Scout)
  • Multi-stage builds (dev tools separate from runtime)
  • Read-only root filesystem in K8s
  • Drop all capabilities

BuildKit Secrets:
  --mount=type=secret,id=npm: secure build-time secrets
  --mount=type=ssh: SSH agent forwarding

Scanning Tools:
  Trivy: fast, no registry needed, K8s scanning
  Grype: from Anchore, Syft for SBOM
  Docker Scout: integrated with Docker Hub
  Snyk: developer-friendly, GitHub integration`,
            tags: ["Docker", "Security"],
          },
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
            content: `## Why This Matters (Read This First)

Kubernetes is the standard for container orchestration. Understanding its architecture is essential for operating production clusters.

The control plane manages the cluster. The worker nodes run your applications. All state is stored in etcd.

---

## Control Plane Components

\`\`\`
Control Plane:
  etcd → persistent key-value store (Raft consensus)
  API Server → REST API, authn/authz, validation (ONLY component touching etcd)
  Scheduler → watches for unscheduled Pods, picks best node
  Controller Manager → reconciliation loops (Deployment, ReplicaSet, Node, etc.)
  cloud-controller-manager → cloud-specific LBs, storage, nodes

Worker Node:
  kubelet → node agent, manages Pods via CRI (Container Runtime Interface)
  kube-proxy → Service networking (iptables/IPVS)
  Container Runtime → containerd / CRI-O

All components talk to API Server. No direct component-to-component communication.
\`\`\`

---

## etcd — The Source of Truth

\`\`\`bash
# etcd stores everything as key-value pairs
# /registry/pods/default/my-pod → {full pod spec + status}
# /registry/deployments/default/app → {deployment spec + status}
# /registry/services/default/svc → {service spec + status}

# Backup etcd (critical for DR):
ETCDCTL_API=3 etcdctl snapshot save /backup/etcd-snapshot-$(date +%Y%m%d).db

# Restore:
ETCDCTL_API=3 etcdctl snapshot restore /backup/etcd-snapshot-20240101.db \
  --data-dir /var/lib/etcd-restored

# 3 or 5 nodes for HA (odd number — Raft consensus)
# SSDs strongly recommended (etcd is I/O-sensitive)
\`\`\`

---

## Scheduler Algorithm

\`\`\`
Scheduler: Filters → Scores → Bind

Filtering (Predicates) — which nodes CAN run the Pod:
  • Resource requests (CPU/memory must fit)
  • Node selector and affinity/anti-affinity
  • Taints and tolerations
  • Port conflicts

Scoring (Priorities) — rank eligible nodes:
  • Most requested resources (bin packing) or least requested (spreading)
  • Pod topology spread constraints
  • Node scoring plugins

Binding: write the Pod-to-Node assignment to etcd via API Server.
kubelet watches its assigned Pods and starts containers.
\`\`\`

---

## Practice Questions

1. **Q:** What happens if etcd goes down?
   **A:** API Server cannot read/write state — no new Pods, no updates. EXISTING containers continue running (kubelet does not depend on etcd). Cluster is frozen until etcd recovers.

2. **Q:** Why is API Server the only etcd client?
   **A:** Consistency. All state changes go through authn/authz, admission webhooks, and validation. Direct etcd access would bypass these checks.

3. **Q:** What happens when a node fails?
   **A:** kubelet stops heartbeats (5s interval). After 40s, node marked Unhealthy. After 5 minutes, Pods are evicted and rescheduled on healthy nodes.

4. **Q:** How does a custom scheduler differ from the default scheduler?
   **A:** Multiple schedulers can run simultaneously. Each Pod specifies \`schedulerName\`. Custom schedulers implement their own Filter/Score plugins while the default scheduler continues for other Pods.

5. **Q:** What does the cloud-controller-manager do?
   **A:** It runs cloud-provider-specific controllers: Node controller (detects nodes terminated in cloud), Route controller (sets up cloud network routes), Service controller (creates cloud LBs for LoadBalancer Services).

---

## Summary Cheat Sheet

\`\`\`
Control Plane: etcd, API Server, Scheduler, Controller Manager
Workers: kubelet, kube-proxy, container runtime

Flow:
  kubectl apply → API Server (authn → authz → admission → etcd)
  Controller watches etcd changes → creates dependent resources
  Scheduler assigns Pods → kubelet starts containers via CRI

etcd: 3/5 nodes, SSDs, regular backups
API Server: REST gateway, the only etcd writer
Scheduler: Filter → Score → Bind
Controller Manager: Deployment → ReplicaSet → Pod`,
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
            content: `## Why This Matters (Read This First)

Kubernetes workloads are not just "run a container." Each workload type exists for a specific use case: stateless apps (Deployment), stateful services (StatefulSet), node agents (DaemonSet), and batch jobs (Job/CronJob).

Choosing the wrong workload type causes real problems: databases get deleted on reschedule, monitoring agents miss nodes, batch jobs never complete.

---

## Pod — The Atomic Unit

\`\`\`yaml
# Pod: smallest deployable unit in K8s
# One or more containers sharing:
#   • Network namespace (same IP, localhost)
#   • IPC namespace
#   • Volumes (shared storage)

apiVersion: v1
kind: Pod
metadata:
  name: web-app
  labels:
    app: web
spec:
  containers:
  - name: app
    image: myapp:v1.2.3
    ports:
    - containerPort: 3000
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        memory: 256Mi    # OOM-kill if exceeded
    readinessProbe:
      httpGet: { path: /health, port: 3000 }
  - name: sidecar
    image: sidecar:latest
    # Pod containers share the same IP — sidecar can reach app on localhost:3000
\`\`\`

---

## Deployment — Stateless Workloads

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 5
  revisionHistoryLimit: 3          # keep 3 old ReplicaSets for rollback
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1                  # can have 1 extra Pod during update
      maxUnavailable: 0            # must always have 5 available
  selector:
    matchLabels:
      app: api-server
  template:
    spec:
      containers:
      - name: api
        image: myapp:v1.2.3
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            memory: 256Mi
---
# Deployment creates ReplicaSet → ReplicaSet creates Pods
# Rolling update: new ReplicaSet created, old one scaled down
# Rollback: kubectl rollout undo deployment/api-server
\`\`\`

---

## StatefulSet — Stateful Workloads

\`\`\`yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres  # Headless Service for stable DNS: postgres-0.postgres
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    spec:
      containers:
      - name: postgres
        image: postgres:16
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:   # Dynamic PVC per Pod (postgres-data-postgres-0)
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi

# StatefulSet guarantees:
#   • Stable network identity (pod-N, not random hash)
#   • Ordered creation (0, 1, 2...)
#   • Ordered termination (...2, 1, 0)
#   • Each Pod gets its own PVC (data persists even if Pod is rescheduled)
\`\`\`

---

## DaemonSet and Job

\`\`\`yaml
# DaemonSet: one Pod per node (logging, monitoring, CNI)
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
spec:
  selector:
    matchLabels:
      name: fluentd
  template:
    spec:
      tolerations:          # Run on all nodes, including control-plane
      - operator: Exists
      containers:
      - name: fluentd
        image: fluentd:latest
        volumeMounts:
        - name: varlog
          mountPath: /var/log
      terminationGracePeriodSeconds: 30

# Job: run-to-completion (batch processing)
apiVersion: batch/v1
kind: Job
spec:
  backoffLimit: 4           # retry on failure
  completions: 1            # how many Pods must succeed
  parallelism: 1            # concurrent Pods
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: migration
        image: myapp-migration:v1

# CronJob: scheduled Job
apiVersion: batch/v1
kind: CronJob
spec:
  schedule: "0 2 * * *"    # daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cleanup
            image: cleanup-script
          restartPolicy: OnFailure
\`\`\`

---

## Practice Questions

1. **Q:** When would you use StatefulSet instead of Deployment?
   **A:** StatefulSet when: each Pod needs stable identity (DNS name like postgres-0.postgres), ordered startup/scaling, and persistent storage that survives rescheduling (each Pod gets its own PVC). Databases, message queues, key-value stores — anything where Pod identity must persist across restarts.

2. **Q:** What is the difference between a Probe and a Service?
   **A:** Readiness probe tells the Service when the Pod is ready to receive traffic (probe passes → endpoint added). Liveness probe tells kubelet when to restart the container (probe fails → restart). Startup probe delays liveness checks for slow-starting containers. Service uses readiness probe results to route traffic.

3. **Q:** What happens during a rolling update?
   **A:** 1) New ReplicaSet created with desired count=0. 2) One new Pod created in new RS. 3) One old Pod deleted from old RS (maxUnavailable=0, maxSurge=1). 4) New Pod passes readiness → old Pod fully removed. 5) Repeat until all Pods are in new RS. Old RS kept for rollback (revisionHistoryLimit).

4. **Q:** Why would a Pod restart but not be recreated?
   **A:** If the restartPolicy is Always (default for Deployments), the container restarts in-place (same Pod, same IP). If the Pod is deleted (kubectl delete pod), the ReplicaSet creates a new Pod with a new IP. Containers restart when: liveness probe fails, container exits, OOM-killed.

5. **Q:** What happens when a CronJob misses its scheduled time?
   **A:** CronJob controller looks back for missed runs within the startingDeadlineSeconds window (default: no limit). If the cluster was down, missed schedules are caught up on restart. If startingDeadlineSeconds is set and exceeded, the run is skipped — useful to prevent a backlog of missed jobs.

---

## Summary Cheat Sheet

\`\`\`
Workload Types:
  Deployment: stateless apps, rolling updates, replicas
  StatefulSet: stateful services, stable identity, ordered ops, per-Pod PVC
  DaemonSet: one per node (logging, monitoring, networking)
  Job: run once to completion
  CronJob: scheduled jobs

Probes:
  Readiness: traffic on/off (Service endpoints)
  Liveness: restart if unhealthy
  Startup: delay liveness checks (slow start)

Scaling:
  RollingUpdate: gradual replacement (maxSurge, maxUnavailable)
  Recreate: delete all, then create (downtime)
  HPA: auto-scale replicas by CPU/memory/custom metrics`,
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
            content: `## Why This Matters (Read This First)

Kubernetes networking has four distinct problems to solve: Pod-to-Pod (same node), Pod-to-Pod (across nodes), Service-to-Pod, and External-to-Service. Each layer has its own solution.

Without understanding these layers, you will be lost debugging network issues — why Pods cannot reach each other, why Services return connection refused, or why Ingress returns 503.

---

## Pod Networking (CNI)

\`\`\`
Pod-to-Pod communication (same node):
  Pod A (10.0.1.5) ── veth0 ──┐
                               ├── Linux Bridge (cbr0) ── veth1 ── Pod B (10.0.1.6)
  Both Pods on the same bridge → ARP → direct L2 communication

Pod-to-Pod communication (different nodes):
  Pod A (Node 1, 10.0.1.5) → cbr0 → eth0 → Node 2 → cbr0 → Pod B (10.0.2.6)

  How do packets get from Node 1 to Node 2?
  • Flannel: overlay network (VXLAN tunnel) — wraps packet in UDP
  • Calico: pure L3 routing (BGP) — no overlay, uses host routing table
  • Cilium: eBPF-based — replaces kube-proxy + CNI, faster routing
  • AWS VPC CNI: assigns ENI IPs directly — Pod IP = VPC IP (no NAT)
\`\`\`

---

## Services — Stable Endpoints

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  type: ClusterIP        # Default: cluster-internal virtual IP
  selector:
    app: my-app          # Routes to Pods with this label
  ports:
  - protocol: TCP
    port: 80             # Service port
    targetPort: 3000     # Pod container port
---
# kube-proxy watches Service + EndpointSlice changes
# Programs iptables rules:

# Example iptables rule (simplified):
# -A KUBE-SERVICES -d 10.96.0.1/32 -p tcp --dport 80 -j KUBE-SVC-XXXX
# -A KUBE-SVC-XXXX -m statistic --mode random --probability 0.333 -j KUBE-SEP-AAAA
# -A KUBE-SEP-AAAA -p tcp -j DNAT --to-destination 10.0.1.5:3000

# With eBPF (Cilium): no iptables, BPF maps for O(1) lookup
\`\`\`

---

## Service Types

\`\`\`yaml
# ClusterIP: internal virtual IP (default)
spec:
  type: ClusterIP
  # Service reachable only within the cluster (e.g., for inter-service communication)

# NodePort: expose on each node's IP at a specific port
spec:
  type: NodePort
  ports:
  - port: 80
    nodePort: 30080       # Listen on all nodes:30080 → Service:80 → Pod:3000

# LoadBalancer: cloud LB + NodePort
spec:
  type: LoadBalancer
  # Creates cloud LB (ALB/NLB) → forwards to NodePort → Service → Pods
  # AWS: NLB or ALB (via AWS Load Balancer Controller)
  # GCP: TCP/UDP LB
  # On-prem: MetalLB (BGP) or private cloud solution

# Headless Service: no cluster IP, direct Pod DNS
spec:
  clusterIP: None
  selector:
    app: postgres
  # DNS query for postgres-0.postgres → Pod IP
  # Used by StatefulSet for stable identity
\`\`\`

---

## Ingress — HTTP Routing

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: api-v1
            port:
              number: 80
      - path: /v2
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 80
  - host: admin.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin-ui
            port:
              number: 80

# Ingress Controller (nginx-ingress, Traefik, AWS ALB Ingress Controller):
# Watches Ingress resources → configures the LB/proxy accordingly
# Nginx: reloads nginx.conf when Ingress changes
# AWS ALB: creates ALB rules per Ingress path
\`\`\`

---

## Practice Questions

1. **Q:** How does a Service route traffic to Pods on different nodes?
   **A:** The Service has a stable ClusterIP (virtual IP). kube-proxy on each node programs iptables/IPVS rules that DNAT the Service IP to the Pod IP. Regardless of which node the Pod runs on, the iptables rule sends traffic to the correct node. With overlay CNIs (Calico, Flannel), cross-node traffic goes through the overlay tunnel.

2. **Q:** What is the difference between Ingress and LoadBalancer Service?
   **A:** LoadBalancer Service creates a L4 load balancer (NLB/ELB) per Service — each Service gets its own public IP and port (e.g., myapp.com:443). Ingress is a L7 HTTP router — one public IP, multiple hostnames/paths → different Services. Ingress is cheaper (one LB for many apps) and smarter (path-based, header-based routing).

3. **Q:** What is a headless Service and when would you use it?
   **A:** A headless Service (clusterIP: None) returns Pod IPs directly instead of a virtual IP. Used by StatefulSet (each Pod gets a stable DNS name like postgres-0.postgres). Also used by Kafka/ZooKeeper where clients need to discover individual Pod IPs. DNS query returns all Pod IPs.

4. **Q:** How does Calico implement network policies?
   **A:** Calico uses iptables rules on each node to enforce NetworkPolicy objects. Each node has a Felix agent that programs iptables based on K8s NetworkPolicy resources. Cilium uses eBPF instead of iptables. Both provide: ingress/egress rules, pod selector-based rules, IP block rules.

5. **Q:** What happens when a Pod IP changes?
   **A:** When a Pod is recreated, it gets a new IP. EndpointSlice (the list of Pod IPs for each Service) is updated by the EndpointSlice controller when the Pod changes. kube-proxy watches EndpointSlice changes and updates iptables rules. Traffic briefly goes to the old IP (until rules update) — TCP connections to the old Pod break.

---

## Summary Cheat Sheet

\`\`\`
Networking Layers:
  CNI: Pod-to-Pod (Calico, Cilium, Flannel, AWS VPC)
  kube-proxy: Service-to-Pod (iptables, IPVS, eBPF)
  Ingress: External-to-Service (host/path routing)

Service Types:
  ClusterIP: internal virtual IP
  NodePort: expose on node IP:port
  LoadBalancer: cloud LB + NodePort
  Headless: direct Pod DNS (for StatefulSet)

Ingress: one LB, multiple apps (hostname + path routing)
  Nginx Ingress: most common, feature-rich
  Traefik: dynamic config, auto TLS
  AWS ALB Ingress: AWS-native ALB per Ingress`,
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
            content: `## Why This Matters (Read This First)

The scheduler determines where Pods run. If you set wrong resource requests, your cluster can be over- or under-provisioned. HPA and VPA automate scaling decisions. Cluster Autoscaler and Karpenter automate infrastructure.

Without understanding these, you will: overpay for idle nodes, get OOM-killed apps, or have Pods stuck in Pending state.

---

## Resource Requests and Limits

\`\`\`yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    resources:
      requests:
        cpu: 250m          # 0.25 CPU core — guaranteed by scheduler
        memory: 256Mi      # 256 MB — guaranteed
      limits:
        memory: 512Mi      # Hard limit — OOM-kill at 512MB
                           # No CPU limit: avoids CPU throttling
---
# Scheduling decision:
# Node has 4 CPUs, 16 GB RAM
# Pod requests 250m CPU, 256Mi RAM
# Scheduler checks: remaining CPU > 250m AND remaining memory > 256Mi

# QoS classes:
#   Guaranteed: limits == requests (both set, both equal)
#   Burstable: requests < limits (requests set)
#   BestEffort: no requests, no limits

# Eviction order (when node runs out of memory):
#   BestEffort killed first → Burstable → Guaranteed last
\`\`\`

---

## Horizontal Pod Autoscaler (HPA)

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5 min before scaling down
      policies:
      - type: Pods
        value: 1          # Scale down 1 Pod at a time
        periodSeconds: 60
---
# How HPA works:
# 1. HPA controller queries metrics-server for Pod CPU/memory usage
# 2. desiredReplicas = currentReplicas × (currentUtilization / targetUtilization)
# 3. If CPU = 90%, target = 70%: desired = 3 × (90/70) = 3.85 → 4 replicas
# 4. Scales Deployment to 4 replicas
# 5. Re-evaluates every 15 seconds

# Custom metrics (KEDA, Prometheus Adapter):
# metrics:
# - type: Pods
#   pods:
#     metric:
#       name: requests_per_second
#     target:
#       type: AverageValue
#       averageValue: "1000"
\`\`\`

---

## Cluster Autoscaler vs Karpenter

\`\`\`
Cluster Autoscaler (AWS):
  • Watches for unschedulable Pods (Pending)
  • Creates new node group / ASG instances
  • Cannot change instance type — uses predefined node groups
  • Slow: creates EC2 → joins cluster → schedules Pods (2-5 min)
  • Downsizes when nodes are underutilized (removable nodes)

Karpenter (AWS):
  • Watches for unschedulable Pods
  • Directly calls EC2 API — selects optimal instance type
  • Faster: creates EC2 → joins cluster → schedules Pods (30-60s)
  • Consolidates: continuously optimizes instance types
  • Supports spot + on-demand with flexible instance types

# Karpenter provisioner:
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: default
spec:
  template:
    spec:
      requirements:
        - key: "karpenter.sh/capacity-type"
          operator: In
          values: ["on-demand", "spot"]
        - key: "kubernetes.io/arch"
          operator: In
          values: ["amd64"]
      nodeClassRef:
        name: default
  limits:
    cpu: 1000
  disruption:
    consolidationPolicy: WhenUnderutilized
    expireAfter: 720h
\`\`\`

---

## Practice Questions

1. **Q:** Why should you set CPU requests but NOT CPU limits?
   **A:** CPU is a compressible resource — if a Pod tries to use more than its request, it gets throttled (slowed down). CPU limits cause throttling that can be worse than letting the Pod use CPU when available. Memory is incompressible — a limit is necessary because exceeding it kills the Pod (OOM). Best practice: CPU request = what you need; CPU limit = none; memory request + limit = the same for Guaranteed QoS.

2. **Q:** What happens if HPA and VPA are used together?
   **A:** HPA and VPA should NOT target the same metrics simultaneously — they conflict (HPA adds Pods, VPA resizes Pods). Common pattern: VPA in "recommendation" mode (no actual changes) to suggest resource requests, then apply those recommendations to the HPA target manually or via a mutating webhook.

3. **Q:** How does Cluster Autoscaler decide when to scale down?
   **A:** A node is considered "removable" if: all Pods on the node can be scheduled elsewhere, and the node has been underutilized (CPU/memory < 50%) for more than 10 minutes. Some Pods block scale-down: PodDisruptionBudget-protected, local storage, not managed by controller.

4. **Q:** What is the difference between Karpenter and Cluster Autoscaler?
   **A:** CA manages node groups (ASG) — you choose instance types upfront. Karpenter directly calls EC2 — it picks the optimal type per workload. Karpenter is faster (30s vs 2-5min) and cheaper (finds cheaper instance types, consolidates). Karpenter is AWS-only; CA works on any cloud.

5. **Q:** Why would a Pod stay in "Pending" state?
   **A:** Scheduler cannot find a node that satisfies all constraints: insufficient CPU/memory resources, node selector labels not matching, taints not tolerated, persistent volume cannot be bound, port conflicts, affinity/anti-affinity rules. Check with \`kubectl describe pod <name>\` for events.

---

## Summary Cheat Sheet

\`\`\`
Resources:
  Requests: guaranteed amount — scheduler uses for placement
  Limits: hard ceiling (CPU throttles, memory OOM)

QoS:
  Guaranteed: limits = requests (most reliable)
  Burstable: requests < limits
  BestEffort: no requests (first to evict)

HPA: scale replicas by CPU/memory/custom metrics
  desiredReplicas = current × (current / target)

VPA: recommend/set resource requests
Cluster Autoscaler: add nodes via ASG (slow but multi-cloud)
Karpenter: add nodes via EC2 API (fast, AWS-only)`,
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
            content: `## Why This Matters (Read This First)

Containers are ephemeral — when a Pod restarts, local storage is lost. Persistent volumes let Pods store data that survives restarts, rescheduling, and node failures.

Stateful workloads (databases, message queues) need persistent storage. Understanding PV/PVC/StorageClass is essential for running them on Kubernetes.

---

## PV, PVC, and StorageClass

\`\`\`
┌────────────────────────────────────────────────────┐
│  Cluster Storage                                    │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ PV (100GB)   │  │ PV (50GB)    │  │ PV (250GB)│ │
│  │ EBS gp3      │  │ EBS gp3      │  │ EBS io2   │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                │        │
│         │     bind        │                │        │
│    ┌────▼─────┐           │                │        │
│    │ PVC (10GB)│           │                │        │
│    │ app-data  │           │                │        │
│    └────┬─────┘           │                │        │
│         │  mount          │                │        │
│    ┌────▼─────┐           │                │        │
│    │ Pod      │           │                │        │
│    │ app-data  │           │                │        │
│    │ /data    │           │                │        │
│    └──────────┘           │                │        │
└────────────────────────────┼────────────────┼────────┘
                             │                │
             StorageClass "fast"   StorageClass "archive"
             provisioner: ebs.csi.aws.com
             parameters: type=io2, iops=10000
\`\`\`

---

## StorageClass — Dynamic Provisioning

\`\`\`yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: fast
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer  # Create volume on the same node as Pod
parameters:
  type: io2
  iopsPerGB: "10"
  fsType: ext4
---
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: standard
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3
  encrypted: "true"
---
# When a PVC references "fast" StorageClass:
# • CSI driver creates the EBS volume
# • Kubernetes creates a PV object representing the volume
# • PVC binds to the new PV
# • Pod mounts the volume

# Default StorageClass: annotate with:
#   storageclass.kubernetes.io/is-default-class: "true"
\`\`\`

---

## PVC and Pod

\`\`\`yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
spec:
  accessModes:
    - ReadWriteOnce       # Single node read-write
  resources:
    requests:
      storage: 100Gi
  storageClassName: fast  # Use "fast" StorageClass
---
apiVersion: v1
kind: Pod
metadata:
  name: postgres
spec:
  containers:
  - name: postgres
    image: postgres:16
    volumeMounts:
    - name: data
      mountPath: /var/lib/postgresql/data
    - name: config
      mountPath: /etc/postgresql/config
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: postgres-data   # Reference the PVC
  - name: config
    configMap:
      name: postgres-config    # ConfigMap mounted as file
---
# When Pod is deleted and recreated:
# Same PVC → same PV → same data persists
# When StatefulSet manages it:
# volumeClaimTemplates creates per-Pod PVCs that survive rescheduling
\`\`\`

---

## CSI — Container Storage Interface

\`\`\`
CSI is the standard plugin interface for storage in Kubernetes:

  CSI Driver Components:
  • Controller Plugin: creates/deletes volumes in cloud API (runs as Deployment)
  • Node Plugin: attaches/mounts volumes on worker nodes (runs as DaemonSet)
  • Identity Plugin: advertises driver capabilities

  Popular CSI Drivers:
  • aws-ebs-csi-driver (EBS volumes)
  • aws-efs-csi-driver (EFS — ReadWriteMany)
  • gce-pd-csi-driver (GCP Persistent Disk)
  • csi-hostpath-driver (local storage for testing)

  Before CSI: in-tree cloud providers (AWS, GCP, Azure in kubelet code)
  After CSI: out-of-tree drivers (separate containers, faster updates)

  # Check CSI drivers in cluster:
  kubectl get csidrivers
  # NAME                        ATTACHREQUIRED   PODINFOONMOUNT
  # ebs.csi.aws.com             true             true
  # efs.csi.aws.com             false            true
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between ReadWriteOnce and ReadWriteMany?
   **A:** RWO: one node can mount the volume as read-write (used by most block storage — EBS, GCE PD). RWX: multiple nodes can mount as read-write simultaneously (used by network filesystems — EFS, NFS). Most databases need RWO (postgres, mysql, redis). File storage (media, logs) can use RWX.

2. **Q:** What does volumeBindingMode: WaitForFirstConsumer do?
   **A:** The PV (volume) is NOT created until the first Pod using the PVC is scheduled. This ensures the volume is created in the same AZ as the Pod. Without it, the volume might be created in us-east-1a while the Pod is scheduled in us-east-1b — causing a scheduling delay.

3. **Q:** What happens when a PVC is deleted?
   **A:** By default, reclaimPolicy is "Delete" — the PV and the underlying storage (EBS volume, GCE disk) are deleted. If reclaimPolicy is "Retain", the PV remains (in Released state) and the underlying storage is preserved for manual recovery. Use Retain for critical data.

4. **Q:** How does StatefulSet use volumeClaimTemplates?
   **A:** Each Pod in a StatefulSet gets its own PVC created from the template: postgres-data-postgres-0, postgres-data-postgres-1, postgres-data-postgres-2. When a Pod is rescheduled (e.g., to another node), it reuses its PVC → same data → same disk. The PVC survives Pod deletion.

5. **Q:** What is the difference between in-tree and CSI storage drivers?
   **A:** In-tree drivers are compiled into kubelet (requires Kubernetes version upgrade to update). CSI drivers run as separate containers (can be updated independently). All cloud providers are migrating to CSI. In-tree drivers were deprecated in v1.21 and removed in v1.25+.

---

## Summary Cheat Sheet

\`\`\`
Storage Flow:
  StorageClass → (dynamic provisioning) → PV → PVC → Pod mount

Access Modes:
  RWO: one node (block storage — EBS, PD)
  ROX: one node read-only
  RWX: many nodes (file storage — EFS, NFS)

Reclaim Policy:
  Delete: PV + cloud storage deleted when PVC deleted
  Retain: PV released, admin must recover manually
  Recycle: deprecated (was: scrub + re-use)

Volume Binding:
  Immediate: PV created when PVC created (may mismatch AZ)
  WaitForFirstConsumer: PV created on Pod schedule (matches AZ)

CSI:
  Standard plugin interface, out-of-tree drivers
  Controller (create/delete) + Node (attach/mount)`,
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
            content: `## Why This Matters (Read This First)

Helm packages multiple Kubernetes manifests into a single deployable unit (a Chart). Instead of maintaining 10+ YAML files per service, you maintain one chart with values that customize it per environment.

Helm is the standard package manager for K8s. Most open-source projects (Prometheus, nginx-ingress, cert-manager) distribute as Helm charts.

---

## Chart Structure

\`\`\`
my-chart/
├── Chart.yaml          # Metadata: name, version, dependencies
├── values.yaml         # Default configuration values
├── charts/             # Sub-chart dependencies
├── templates/          # Go template YAML files
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── _helpers.tpl    # Reusable template functions
│   └── tests/
│       └── test-connection.yaml
└── crds/               # CRDs installed before templates

# Chart.yaml
apiVersion: v2
name: my-app
description: My application Helm chart
type: application
version: 0.1.0
appVersion: "1.16.0"
dependencies:
  - name: postgresql
    version: 12.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
\`\`\`

---

## Templating Basics

\`\`\`yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    app.kubernetes.io/name: {{ include "my-app.name" . }}
    helm.sh/chart: {{ include "my-app.chart" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app.kubernetes.io/name: {{ include "my-app.name" . }}
  template:
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
        ports:
        - containerPort: {{ .Values.service.port }}
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
        env:
          {{- range $key, $value := .Values.env }}
          - name: {{ $key }}
            value: {{ $value | quote }}
          {{- end }}
---
# values.yaml (defaults)
replicaCount: 1
image:
  repository: nginx
  tag: ""
service:
  type: ClusterIP
  port: 80
resources: {}
env: {}
postgresql:
  enabled: false
---
# Install with overrides:
helm install my-release ./my-chart \
  --set replicaCount=3 \
  --set image.tag=v1.2.3 \
  --set env.DB_HOST=postgres-prod \
  -f prod-values.yaml
\`\`\`

---

## Helm Hooks

\`\`\`yaml
# templates/migration-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ .Release.Name }}-migration
  annotations:
    helm.sh/hook: pre-upgrade       # Run BEFORE upgrade
    helm.sh/hook-weight: "-5"       # Run first (lower = earlier)
    helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: migration
        image: myapp-migration:{{ .Values.image.tag }}
---
# Available hooks:
#   pre-install, post-install
#   pre-upgrade, post-upgrade
#   pre-rollback, post-rollback
#   pre-delete, post-delete
#   test (helm test)

# Hook resource lifecycle:
# 1. pre-upgrade job creates
# 2. Job runs migration
# 3. Job succeeds → hook-delete-policy removes it
# 4. Chart templates applied (upgrade continues)
\`\`\`

---

## Helm vs Kustomize

| Feature | Helm | Kustomize |
|---------|------|-----------|
| Approach | Template engine (Go templates) | Patch overlay (strategic merge) |
| Learning curve | Higher (template syntax) | Lower (plain YAML patches) |
| State tracking | Yes — releases in Secrets | No — stateless |
| Rollback | Built-in (\`helm rollback\`) | No — requires git revert |
| Dependencies | Chart dependencies, subcharts | No built-in dependency mgmt |
| Package distribution | Chart repositories (OCI, HTTP) | Git repos |
| Best for | Complex apps, sharing packages, state management | Simple overlays, env customization |

\`\`\`bash
# Helm workflow:
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-release bitnami/nginx --values prod-values.yaml
helm upgrade my-release bitnami/nginx --set replicaCount=3
helm rollback my-release 1
helm list

# With OCI registries:
helm install my-release oci://registry-1.docker.io/bitnamicharts/nginx
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between \`helm install\` and \`helm upgrade\`?
   **A:** \`helm install\` creates a new release (first time). \`helm upgrade\` updates an existing release — applies template changes, runs hooks, and creates a new revision in Secrets. \`helm upgrade --install\` does install if not present, upgrade if present (idempotent).

2. **Q:** How does Helm manage release state?
   **A:** Helm stores release metadata (manifests, values, revision) in Kubernetes Secrets in the release namespace. Each upgrade creates a new Secret with an incremented revision. \`helm rollback\` restores the previous revision's manifests. This makes upgrades auditable and reversible.

3. **Q:** What is the difference between \`--set\` and \`--values\`?
   **A:** \`--set\` sets individual values inline (\`--set replicaCount=3\`). \`--values -f\` loads a YAML file with overrides. Values follow this priority: \`--set\` > \`--values\` > \`values.yaml\` defaults. Use \`--values\` for environment-specific configs, \`--set\` for CI/CD pipeline variables.

4. **Q:** What is a \"Helm test\"?
   **A:** Tests are Pods annotated with \`helm.sh/hook: test\`. They run during \`helm test <release>\` and verify that the release is working correctly (e.g., connecting to the app, checking the DB). Tests use post-install hooks — they run after install but are not deleted automatically.

5. **Q:** When would you choose Kustomize over Helm?
   **A:** Kustomize for: simpler projects (no template syntax), when you want plain YAML with environment overlays, when you do not need rollback/dependency management, when your team finds Go templates confusing. Many projects use both: Helm for third-party packages, Kustomize for first-party apps.

---

## Summary Cheat Sheet

\`\`\`
Chart Structure:
  Chart.yaml → metadata + dependencies
  values.yaml → default configuration
  templates/ → Go template YAML
  charts/ → sub-charts
  crds/ → pre-install CRDs

Commands:
  helm create, helm install, helm upgrade, helm rollback
  helm list, helm history, helm get values
  helm dependency update, helm template

Templating:
  {{ .Values.xxx }} — values from values.yaml
  {{ include "chart.name" . }} — named template
  {{ range }}, {{ if }}, {{ toYaml }} — control flow + formatting

Hooks: pre/post install, upgrade, rollback, delete, test
vs Kustomize: template engine vs patch overlay`,
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
            content: `## Why This Matters (Read This First)

CRDs let you extend the Kubernetes API with your own resource types. An operator combines a CRD with a controller that automates operational tasks — like a human operator, but automated.

Operators encode domain expertise (how to back up a database, how to upgrade a message queue) into software that runs on Kubernetes. They are the standard way to manage stateful applications on K8s.

---

## CRD — Custom Resource Definition

\`\`\`yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: databases.example.com
spec:
  group: example.com
  names:
    kind: Database
    plural: databases
    singular: database
    shortNames:
    - db
  scope: Namespaced
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        required: ["spec"]
        properties:
          spec:
            type: object
            required: ["engine", "version", "storage"]
            properties:
              engine:
                type: string
                enum: [postgres, mysql, redis]
              version:
                type: string
              storage:
                type: string
                pattern: '^[0-9]+(Gi|Ti)$'
---
# After creating the CRD, you can create custom resources:
apiVersion: example.com/v1
kind: Database
metadata:
  name: my-app-db
spec:
  engine: postgres
  version: "16"
  storage: 100Gi
# This custom resource is stored in etcd, just like a Deployment
# It is accessible via: kubectl get databases
\`\`\`

---

## Controller — Reconciliation Loop

\`\`\`python
# Simplified Python controller using Kopf (Kubernetes Operator Framework)
import kopf
import kubernetes
import boto3

@kopf.on.create("example.com", "v1", "databases")
def create_database(spec, name, namespace, logger, **kwargs):
    """Called when a Database custom resource is created."""

    # 1. Create RDS instance in AWS
    rds = boto3.client("rds")
    response = rds.create_db_instance(
        DBInstanceIdentifier=name,
        Engine=spec["engine"],
        EngineVersion=spec["version"],
        AllocatedStorage=int(spec["storage"].replace("Gi", "")),
        DBInstanceClass="db.t3.medium",
        MasterUsername="admin",
        MasterPassword=generate_password(),
    )

    # 2. Store connection info as a Secret
    secret = kubernetes.client.V1Secret(
        metadata={"name": f"{name}-conn", "namespace": namespace},
        string_data={
            "host": response["DBInstance"]["Endpoint"]["Address"],
            "port": str(response["DBInstance"]["Endpoint"]["Port"]),
            "username": "admin",
            "password": generated_password,
        }
    )
    kubernetes.config.load_incluster_config()
    api = kubernetes.client.CoreV1Api()
    api.create_namespaced_secret(namespace, secret)

    return {"status": "created", "endpoint": response["DBInstance"]["Endpoint"]["Address"]}


@kopf.on.delete("example.com", "v1", "databases")
def delete_database(spec, name, logger, **kwargs):
    """Called when the Database resource is deleted."""
    rds = boto3.client("rds")
    rds.delete_db_instance(DBInstanceIdentifier=name, SkipFinalSnapshot=False)
    logger.info(f"Deleted database {name}")
\`\`\`

---

## Operator Pattern — The Loop

\`\`\`
The Reconciliation Loop (core of every operator):

  ┌─────────────────────────────────────────────┐
  │  Watch for changes (CRD)                      │
  │  ┌─────────────────────┐                     │
  │  │ Database my-app-db  │                     │
  │  │ spec: {engine:      │                     │
  │  │   postgres,         │                     │
  │  │   version: "16",    │                     │
  │  │   storage: 100Gi}   │                     │
  │  └─────────┬───────────┘                     │
  │            │                                 │
  │            ▼                                 │
  │  ┌─────────────────────┐                     │
  │  │ Read current state  │                     │
  │  │ (RDS API call)      │                     │
  │  └─────────┬───────────┘                     │
  │            │                                 │
  │            ▼                                 │
  │  ┌─────────────────────┐                     │
  │  │ Compare desired vs  │                     │
  │  │ actual state        │                     │
  │  └─────────┬───────────┘                     │
  │            │                                 │
  │            ▼                                 │
  │  ┌─────────────────────┐                     │
  │  │ Take action          │                     │
  │  │ (create/update/     │                     │
  │  │  delete RDS, update │                     │
  │  │  Secret)            │                     │
  │  └─────────────────────┘                     │
  │            │                                 │
  │            ▼                                 │
  │  ┌─────────────────────┐                     │
  │  │ Update status       │                     │
  │  │ (status conditions  │                     │
  │  │  = Ready)           │                     │
  │  └─────────────────────┘                     │
  │            │                                 │
  │            └─────────────────────────────────┘
  │            (loop back, watch for next change)
  └─────────────────────────────────────────────┘
\`\`\`

---

## Popular Operators

| Operator | What It Does |
|----------|-------------|
| cert-manager | Issues and renews TLS certificates (Let's Encrypt, Venafi, self-signed) |
| External Secrets | Syncs secrets from cloud providers (AWS Secrets Manager, GCP SM, Azure KV) |
| Prometheus Operator | Manages Prometheus instances, ServiceMonitors, alert rules |
| Strimzi | Manages Kafka clusters — topics, users, mirroring, upgrades |
| Crossplane | Manages cloud resources (RDS, S3, VPC) via K8s CRDs |
| Istio Operator | Manages Istio service mesh installation and upgrades |
| KubeDB | Creates and manages databases (Postgres, MySQL, Redis, MongoDB) |

\`\`\`yaml
# Example: cert-manager Certificate resource
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: my-app-tls
spec:
  secretName: my-app-tls-secret
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - app.example.com
# cert-manager controller:
# 1. Sees Certificate resource created
# 2. Creates Order + Challenge resources
# 3. Challenges domain ownership (HTTP-01/DNS-01)
# 4. Gets certificate from Let's Encrypt
# 5. Stores cert in Secret (my-app-tls-secret)
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between a CRD and an aggregated API?
   **A:** CRD: define a new resource type using a Kubernetes manifest — no code needed, stored in etcd as custom resource JSON. Aggregated API: run your own API server that extends the K8s API — more flexibility (validation, storage, auth) but more complex. Most operators use CRDs. Aggregated APIs are used when you need advanced features (subresources, protobuf).

2. **Q:** How does the controller know when a CRD instance changes?
   **A:** The controller uses an Informer (client-go library) that watches the CRD type via the API Server. When a new resource is created/updated/deleted, the API Server sends an event to the Informer. The controller adds the event to a work queue, and the reconciliation loop processes it. This is the same pattern used by all K8s controllers.

3. **Q:** What is the difference between a Helm chart and an operator?
   **A:** A Helm chart installs static resources at deploy time — it does not manage the resource after installation. An operator runs continuously — it watches CRD instances and reacts to changes. Example: Helm installs a Prometheus instance; Prometheus Operator watches ServiceMonitors and dynamically updates Prometheus config. Operators are needed for ongoing management.

4. **Q:** When should you write an operator instead of using Helm + scripts?
   **A:** Write an operator when: you need to react to configuration changes at runtime (not just at install), you manage stateful apps with complex lifecycle (backup, restore, upgrade, resize), you need to automate operational tasks (scaling, failover, recovery), or you need to expose domain-specific APIs (Database, Certificate, Topic).

5. **Q:** What is the status subresource and why do operators use it?
   **A:** The status subresource (spec.status) stores the current observed state of the resource. The controller writes status (Ready=True, conditions, observedGeneration). Users and other systems read status to know whether the resource is healthy. Status is separated from spec because only the controller can write status — preventing user mistakes from corrupting state tracking.

---

## Summary Cheat Sheet

\`\`\`
CRD: custom resource type (stored in etcd, accessible via kubectl)
Controller: reconciliation loop watches CRD + drives state
Operator = CRD + Controller + Domain Knowledge

Reconciliation Loop:
  Watch → Read current → Compare → Take action → Update status → Loop

Popular Operators:
  cert-manager: TLS certificates
  External Secrets: cloud secret sync
  Prometheus Operator: monitoring
  Strimzi: Kafka management
  Crossplane: cloud resource management

When to write: stateful apps, complex lifecycle, domain-specific automation
Framework: kubebuilder (Go), Kopf (Python), Java Operator SDK`,
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
            content: `## Why This Matters (Read This First)

Terraform lets you declare infrastructure as code. Instead of clicking in the AWS console, you write HCL files that describe your VPCs, databases, load balancers — and Terraform creates them.

The key concepts: **state** (Terraform's record of what exists), **providers** (plugins for cloud APIs), **modules** (reusable config units), and **plan/apply** (preview before changing).

---

## State — The Source of Truth

\`\`\`hcl
terraform {
  backend "s3" {
    bucket         = "my-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "tf-state-lock"   # Prevents concurrent applies
  }
}

# State file contains:
# {
#   "version": 4,
#   "terraform_version": "1.6.0",
#   "resources": [
#     {
#       "module": "root",
#       "type": "aws_vpc",
#       "name": "main",
#       "instances": [
#         {
#           "attributes": {
#             "id": "vpc-0a1b2c3d4e5f",
#             "cidr_block": "10.0.0.0/16",
#             ...
#           }
#         }
#       ]
#     }
#   ]
# }

# State commands:
terraform state list                  # List all resources
terraform state show aws_vpc.main     # Show attributes of a resource
terraform state mv aws_vpc.main module.vpc.aws_vpc.main  # Move between modules
terraform import aws_s3_bucket.my_bucket my-existing-bucket  # Import existing infra
\`\`\`

---

## Plan and Apply

\`\`\`hcl
provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  name    = "prod-vpc"
  cidr    = "10.0.0.0/16"
  azs     = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  enable_nat_gateway = true
  enable_vpn_gateway = false
  tags = {
    Terraform = "true"
    Environment = "prod"
  }
}
---
# Plan output shows what will change:
# Terraform will perform the following actions:
#   # module.vpc.aws_vpc.this[0] will be created
#   + resource "aws_vpc" "this" {
#       + arn                = (known after apply)
#       + cidr_block         = "10.0.0.0/16"
#       + enable_dns_hostnames = true
#       + enable_dns_support   = true
#       + id                 = (known after apply)
#       + tags               = {
#           + "Environment" = "prod"
#           + "Name"        = "prod-vpc"
#           + "Terraform"   = "true"
#         }
#     }
# Plan: 15 to add, 0 to change, 0 to destroy.
\`\`\`

---

## Providers and Modules

\`\`\`hcl
# Providers — plugins for cloud/service APIs
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

# Modules — reusable config units
module "eks_cluster" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.0.0"

  cluster_name    = "prod-eks"
  cluster_version = "1.28"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets

  node_groups = {
    main = {
      desired_size = 3
      instance_types = ["m5.large"]
    }
  }
}

output "cluster_endpoint" {
  value = module.eks_cluster.cluster_endpoint
}
\`\`\`

---

## Practice Questions

1. **Q:** What problem does remote state solve?
   **A:** Local state means each teammate has their own copy — applies conflict and overwrite each other. Remote state (S3 + DynamoDB locking) ensures one apply at a time, and everyone works from the same state. Locking prevents concurrent applies that could corrupt the state file.

2. **Q:** What is the difference between `terraform plan` and `terraform apply`?
   **A:** `plan` shows the diff between current state and desired config — read-only. `apply` executes the plan. Always review the plan output before applying in production. In CI/CD, the plan is reviewed in a PR (or run `plan`, wait for approval, then `apply`).

3. **Q:** What are Terraform workspaces used for?
   **A:** Workspaces create separate state files for the same config — commonly used for environments (dev, staging, prod). Each workspace has its own state file: `prod/terraform.tfstate`, `staging/terraform.tfstate`. However, most teams prefer separate directories/modules per environment for isolation.

4. **Q:** How do you handle secrets in Terraform?
   **A:** Never hardcode secrets in config files. Options: 1) `terraform.tfvars` (gitignored, local only). 2) Environment variables (`TF_VAR_db_password`). 3) AWS Secrets Manager / SSM Parameter Store via `data.aws_secretsmanager_secret`. 4) HashiCorp Vault provider. State files containing secrets should be encrypted (S3 server-side encryption + DynamoDB encryption at rest).

5. **Q:** What is the `terraform import` command?
   **A:** Import brings existing infrastructure into Terraform management — creates a state reference for the resource without modifying config. After import, you must write the resource config in HCL to match the imported state. Without import, Terraform cannot manage resources created outside Terraform.

---

## Summary Cheat Sheet

\`\`\`
Terraform Workflow:
  Write → Init → Plan → Apply → (loop)

State:
  Records real infrastructure IDs → maps to .tf config
  Remote: S3/GCS + DynamoDB/Bigtable locking
  Sensitive — protect and encrypt

Commands:
  init: download providers + modules
  plan: preview changes (read-only)
  apply: execute the plan
  destroy: delete all managed resources
  fmt: format HCL files
  validate: check syntax
  import: bring existing resources under management

Providers: AWS, GCP, Azure, K8s, Helm, etc.
Modules: reusable units from Terraform Registry`,
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
            content: `## Why This Matters (Read This First)

GitOps makes Git the single source of truth for your infrastructure. When you merge a PR, the cluster updates automatically — no kubectl commands, no CI push, no manual SSH.

Pull-based deployment is more secure than push-based: the cluster agent pulls changes from Git (or a container registry), so no CI system needs credentials to access the cluster.

---

## GitOps Flow

\`\`\`
Developer                Git Repository                Kubernetes
    │                         │                            │
    │── PR with changes ──────→│                            │
    │  (deployment replicas:   │                            │
    │   3 → 5)                 │                            │
    │                         │                            │
    │←─ PR approved ──────────│                            │
    │                         │                            │
    │── Merge to main ────────→│                            │
    │                         │                            │
    │                         │←── pull changes ──────────ArgoCD/Flux
    │                         │    (periodic or webhook)    │
    │                         │                            │
    │                         │                            │── reconcile
    │                         │                            │  (kubectl apply)
    │                         │                            │
    │                         │                            │── Deployment
    │                         │                            │  replicas: 3 → 5
\`\`\`

---

## ArgoCD Application

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/my-app-k8s
    path: overlays/production
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true        # Delete resources removed from Git
      selfHeal: true     # Revert manual changes to match Git
    syncOptions:
    - CreateNamespace=true
---
# ArgoCD features:
# • GUI with sync status, resource tree, pod logs
# • Sync waves and hooks (order of operations)
# • ApplicationSet: template applications from Git directories
# • SSO integration (OIDC, SAML)
# • RBAC per app/project

# ApplicationSet example — one app per cluster:
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
spec:
  generators:
  - clusters: {}                 # One app per cluster
  template:
    spec:
      source:
        repoURL: https://github.com/myorg/app-config
        targetRevision: HEAD
        path: "clusters/{{name}}"
      destination:
        server: "{{server}}"
        namespace: "{{name}}"
\`\`\`

---

## Flux — The Lighter Alternative

\`\`\`yaml
# Flux uses CRDs instead of a single Application resource:
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: my-app
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/myorg/my-app-k8s
  ref:
    branch: main
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: my-app
  namespace: flux-system
spec:
  interval: 10m
  path: ./overlays/production
  prune: true
  sourceRef:
    kind: GitRepository
    name: my-app
  healthChecks:
  - apiVersion: apps/v1
    kind: Deployment
    name: my-app
    namespace: production
---
# Flux features:
# • Image update automation (update git when new image tag available)
# • OCI-compatible sources (Helm charts in container registries)
# • Dependency management (order of reconciliation)
# • No separate CLI — everything is CRDs
# • Webhook receiver for instant sync (GitHub, GitLab, Bitbucket)
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between push-based and pull-based deployment?
   **A:** Push-based: CI/CD pipeline (GitHub Actions) has credentials to kubectl apply to the cluster. If CI is compromised, the attacker has cluster access. Pull-based: ArgoCD/Flux running IN the cluster pulls from Git. CI only pushes to Git — no cluster credentials in CI. Pull-based is more secure.

2. **Q:** What does Drift Detection mean in GitOps?
   **A:** If someone runs \`kubectl delete deploy my-app\`, the GitOps controller detects the cluster state diverging from Git. ArgoCD marks the app as "Out of Sync" (with auto-heal: reverts the deletion). Flux re-applies on its reconciliation interval. Drift detection ensures Git remains the source of truth.

3. **Q:** What is the difference between ArgoCD's Application and ApplicationSet?
   **A:** Application manages one deployment (single source + destination). ApplicationSet generates Applications from a template + generators — useful for multi-cluster (one app per cluster), multi-environment (one app per env), or per-git-directory patterns.

4. **Q:** How does Flux's ImageUpdateAutomation work?
   **A:** Flux watches a container registry for new image tags. When a new tag appears (matching a filter like semver range), Flux updates the Git repository with the new tag, commits, and pushes. The Kustomization controller then reconciles the change. This enables fully automated deployment pipelines.

5. **Q:** What are ArgoCD sync waves and hooks?
   **A:** Sync waves order resource application (wave 0, 1, 2...). CRDs in wave 0, namespaces in wave 1, deployments in wave 2. Hooks run at specific points (pre-sync, post-sync) for tasks like database migrations. Waves ensure proper ordering; hooks enable operational tasks during deployment.

---

## Summary Cheat Sheet

\`\`\`
GitOps Principles:
  Git as single source of truth
  Pull-based deployment (more secure)
  Drift detection + self-healing
  Declarative everything

ArgoCD:
  Application (single) / ApplicationSet (multi)
  GUI, SSO, RBAC, sync waves/hooks
  Auto-sync + prune + self-heal

Flux:
  GitRepository → Kustomization/HelmRelease
  Image update automation
  OCI-compatible sources
  CRD-driven (no separate CLI)

Both: support Helm, Kustomize, multi-cluster`,
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
            content: `## Why This Matters (Read This First)

Pulumi and AWS CDK let you define infrastructure using real programming languages — TypeScript, Python, Go, C#. Instead of learning HCL (Terraform's DSL), you use loops, conditionals, functions, and classes you already know.

Pulumi is multi-cloud (AWS, GCP, Azure, K8s). CDK is AWS-only. Both offer better IDE support (autocomplete, type checking, refactoring) than HCL.

---

## Pulumi — TypeScript Example

\`\`\`typescript
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const env = config.require("environment");

// Use real TypeScript: loops, conditionals, functions
const subnetCount = 3;
const azs = ["us-east-1a", "us-east-1b", "us-east-1c"];

const vpc = new aws.ec2.Vpc("main", {
    cidrBlock: "10.0.0.0/16",
    tags: { Name: `main-${env}`, Environment: env },
});

// Loop! Not possible in HCL without modules or count
const subnets = azs.map((az, i) =>
    new aws.ec2.Subnet(`subnet-${i}`, {
        vpcId: vpc.id,
        cidrBlock: `10.0.${i}.0/24`,
        availabilityZone: az,
        tags: { Name: `subnet-${i}`, Environment: env },
    })
);

// Export outputs
export const vpcId = vpc.id;
export const subnetIds = subnets.map(s => s.id);

// pulumi up → creates VPC + 3 subnets
// pulumi destroy → deletes everything
\`\`\`

---

## Pulumi Automation API

\`\`\`typescript
import { LocalWorkspace } from "@pulumi/pulumi/automation";

// Embed infrastructure provisioning in your app
async function deployEnvironment(userId: string) {
    const stack = await LocalWorkspace.createOrSelectStack({
        stackName: `env-${userId}`,
        projectName: "dynamic-infra",
        program: async () => {
            const bucket = new aws.s3.Bucket(`user-${userId}-assets`, {
                forceDestroy: true,
            });
            return { bucketName: bucket.bucket };
        },
    });

    await stack.up({ onOutput: console.log });
    console.log(`Deployed bucket for user ${userId}`);
}

// Each user gets their own infrastructure
// Completely dynamic — no Terraform plan/apply cycle
\`\`\`

---

## AWS CDK — TypeScript

\`\`\`typescript
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";

export class MyStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, "MyVpc", {
            maxAzs: 3,
            natGateways: 1,
        });

        const cluster = new ecs.Cluster(this, "MyCluster", { vpc });

        // L3 Construct: Fargate service + ALB + auto-scaling
        new ecs_patterns.ApplicationLoadBalancedFargateService(
            this, "MyService", {
                cluster,
                taskImageOptions: {
                    image: ecs.ContainerImage.fromAsset("./app"),
                    containerPort: 3000,
                },
                desiredCount: 3,
                publicLoadBalancer: true,
            }
        );
    }
}

const app = new cdk.App();
new MyStack(app, "MyStack");

// cdk deploy → generates CloudFormation → deploys
// cdk synth → prints CloudFormation template
\`\`\`

---

## Practice Questions

1. **Q:** What is the advantage of using real programming languages for IaC?
   **A:** IDEs provide autocomplete, type checking, and refactoring. Loops and conditionals are native (no count/for_each workarounds). Functions can be unit-tested. Code can be shared via npm/pip packages. The same language is used for app and infra code — fewer context switches.

2. **Q:** How does Pulumi's state management differ from Terraform's?
   **A:** Terraform stores state in a file (local or remote S3/GCS backend). Pulumi Cloud manages state by default (free for individuals, paid for teams). Pulumi also supports self-managed backends (S3, GCS, Azure Blob, local). Pulumi Cloud provides web UI, deployment history, and policy enforcement.

3. **Q:** What is the difference between CDK L1, L2, and L3 constructs?
   **A:** L1 (CloudFormationResource): raw CFN resource — every property is exposed. L2 (aws_ec2.Vpc): AWS best-practice defaults — simpler API, sensible defaults. L3 (patterns.*): multi-resource patterns — e.g., ApplicationLoadBalancedFargateService creates ALB + ECS service + auto-scaling in one construct.

4. **Q:** When would you use Pulumi's Automation API?
   **A:** When you need to provision infrastructure dynamically — not declaratively. Examples: per-user ephemeral environments (a preview deployment for each PR), multi-tenant SaaS (each tenant gets separate infra), CI/CD where the infra depends on the code being deployed. Automation API is the IaC equivalent of serverless functions.

5. **Q:** Is Pulumi or CDK better for existing teams?
   **A:** If your team already knows TypeScript/Python and needs multi-cloud: Pulumi. If you are AWS-only and want to stay in AWS ecosystem (CloudFormation, Service Catalog): CDK. CDK also has better integration with AWS services (Step Functions, EventBridge, Lambda). Terraform is best for multi-cloud with an established provider ecosystem.

---

## Summary Cheat Sheet

\`\`\`
Pulumi:
  Multi-cloud (AWS, GCP, Azure, K8s, 100+ providers)
  TypeScript, Python, Go, C#, Java, YAML
  State: Pulumi Cloud (default) or self-managed
  Automation API: dynamic, programmatic infrastructure

AWS CDK:
  AWS-only
  TypeScript, Python, Java, C#, Go (preview)
  Compiles to CloudFormation
  Constructs: L1 (raw) → L2 (defaults) → L3 (patterns)

Both:
  IDE support (autocomplete, type checking)
  Real programming constructs (loops, functions, classes)
  npm/PyPI package distribution`,
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
            content: `## Why This Matters (Read This First)

Terraform creates infrastructure; Ansible configures it. After Terraform provisions a server, Ansible installs packages, writes config files, and starts services. The two tools complement each other.

Ansible is agentless — it connects via SSH, runs commands, and disconnects. No agent to install, no certificate to manage, no daemon to monitor.

---

## Playbook Basics

\`\`\`yaml
---
- name: Configure web server
  hosts: webservers
  become: yes              # sudo
  vars:
    app_port: 3000
    node_version: "20"

  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present
        update_cache: yes

    - name: Write nginx config
      template:
        src: nginx.conf.j2    # Jinja2 template
        dest: /etc/nginx/sites-available/default
      notify: restart nginx   # Only triggers if config actually changed

    - name: Start nginx
      service:
        name: nginx
        state: started
        enabled: yes

  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
---
# Run:
ansible-playbook -i inventory/prod.yml playbooks/webserver.yml --check
ansible-playbook -i inventory/prod.yml playbooks/webserver.yml
\`\`\`

---

## Inventory

\`\`\`ini
# static inventory (production.ini)
[webservers]
web1.example.com ansible_user=deploy
web2.example.com ansible_user=deploy
web3.example.com ansible_user=deploy

[databases]
db-primary.example.com ansible_user=admin
db-replica.example.com ansible_user=admin

[production:children]
webservers
databases

[production:vars]
ansible_ssh_private_key_file=~/.ssh/prod_key
env=production

# dynamic inventory — AWS EC2
# ansible-inventory -i aws_ec2.yaml --graph
# Uses AWS API to discover instances by tags
plugin: aws_ec2
regions:
  - us-east-1
filters:
  tag:Environment: production
keyed_groups:
  - key: tags.Role
    prefix: role
\`\`\`

---

## Roles — Reusable Automation

\`\`\`
roles/
├── nginx/
│   ├── tasks/
│   │   └── main.yml       # install + configure
│   ├── handlers/
│   │   └── main.yml       # restart nginx
│   ├── templates/
│   │   └── nginx.conf.j2  # config template (Jinja2)
│   ├── vars/
│   │   └── main.yml       # role-specific variables
│   ├── defaults/
│   │   └── main.yml       # default values (lowest priority)
│   └── meta/
│       └── main.yml       # dependencies on other roles
└── app/
    ├── tasks/
    │   └── main.yml
    └── templates/
        └── app.service.j2

# Use roles in playbook:
- name: Configure full stack
  hosts: all
  roles:
    - role: nginx
      vars:
        nginx_port: 8080
    - role: app
      vars:
        app_version: "{{ app_version }}"
\`\`\`

---

## Ansible Vault

\`\`\`bash
# Encrypt a file
ansible-vault encrypt vars/secrets.yml

# View encrypted content
ansible-vault view vars/secrets.yml

# Edit
ansible-vault edit vars/secrets.yml

# Decrypt (for git diff, never commit decrypted)
ansible-vault decrypt vars/secrets.yml

# Run playbook with vault password
ansible-playbook playbook.yml --ask-vault-pass
ansible-playbook playbook.yml --vault-password-file ~/.vault_pass
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between Ansible and Terraform?
   **A:** Terraform declares infrastructure resources (VPC, EC2, RDS, S3) — it creates and manages cloud resources. Ansible configures those resources (install packages, write config files, start services). They are complementary: Terraform provisions the server, Ansible configures what runs on it.

2. **Q:** What does idempotent mean in Ansible?
   **A:** Running the same playbook multiple times produces the same result. Ansible modules check the current state before acting: \`apt: name=nginx state=present\` checks if nginx is installed — if yes, it does nothing. This makes playbooks safe to run repeatedly.

3. **Q:** What is the difference between Ansible variables and defaults?
   **A:** Variable precedence (highest to lowest): extra vars (\`--extra-vars\`) > playbook vars > inventory vars > role vars > role defaults. Defaults (in defaults/main.yml) have the LOWEST priority — they are meant to be overridden. Use defaults for sensible defaults that users can override.

4. **Q:** What does the \`--check\` flag do?
   **A:** Dry-run mode: Ansible runs the playbook but makes no actual changes. Modules report what they WOULD change without applying. Useful in CI/CD to validate playbooks before running them against production servers.

5. **Q:** When would you use dynamic inventory instead of static?
   **A:** Dynamic inventory queries cloud APIs to discover servers — no need to maintain host lists. Use when: servers are auto-scaled (new instances appear/disappear), you want to group by tags (environment=prod, role=webserver), or you manage 100+ servers. AWS, GCP, and Azure all have dynamic inventory plugins.

---

## Summary Cheat Sheet

\`\`\`
Ansible: agentless, push-based, SSH/WinRM
Idempotent: safe to run multiple times
Playbook: YAML automation (tasks run in order)
Inventory: static (INI/YAML) or dynamic (cloud API)
Roles: reusable units (tasks + handlers + templates + vars)
Vault: encrypted secrets in playbooks

Modules:
  apt/yum/dnf: package management
  copy/template: file management
  service/systemd: service management
  command/shell: arbitrary commands (avoid when possible)
  uri: HTTP requests (API testing, health checks)
  docker_*/kubernetes: container orchestration

Ansible vs Terraform:
  Terraform: create/update/delete infrastructure
  Ansible: configure what runs ON the infrastructure
  Use both: Terraform provisions, Ansible configures`,
            tags: ["Ansible", "Configuration Management", "Automation", "IaC"],
          },
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
            content: `## Why This Matters (Read This First)

GitHub Actions is the CI/CD platform for GitHub. Workflows are defined in YAML and run on GitHub's runners or self-hosted machines. OIDC integration lets pipelines authenticate to cloud providers without storing any secrets.

Key concepts: **workflows**, **jobs**, **steps**, **matrix builds**, **caching**, and **OIDC** for keyless cloud auth.

---

## Workflow Structure

\`\`\`yaml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:          # Manual trigger

env:
  NODE_VERSION: "20"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
    - run: npm ci
    - run: npm run lint

  test:
    needs: lint               # Run after lint
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: ["18", "20"]  # Test across versions
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - name: Cache node_modules
      uses: actions/cache@v4
      with:
        path: node_modules
        key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
    - run: npm test

  deploy:
    needs: [lint, test]       # Run after both pass
    if: github.ref == 'refs/heads/main'  # Only on main branch
    permissions:
      id-token: write          # Required for OIDC
      contents: read
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: arn:aws:iam::123456789012:role/github-actions
        aws-region: us-east-1
    - run: npm ci && npm run build
    - run: aws s3 sync dist/ s3://my-app-website/
\`\`\`

---

## Matrix Builds and Reusable Workflows

\`\`\`yaml
# Matrix builds: test multiple OS × language versions
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: ["18", "20", "22"]
        exclude:             # Remove invalid combinations
          - os: windows-latest
            node: "22"       # Windows Node 22 not supported yet
    runs-on: ${{ matrix.os }}
    steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node }}
    - run: npm test

---
# Reusable workflow — call another workflow
jobs:
  call-workflow:
    uses: ./.github/workflows/deploy.yml  # Same repo
    # or: myorg/my-repo/.github/workflows/deploy.yml@main
    with:
      environment: production
    secrets:
      # Inherit secrets from caller
      inherit: true
\`\`\`

---

## OIDC — Keyless Cloud Auth

\`\`\`yaml
# AWS side: create an OIDC identity provider for GitHub
# Trust policy allows GitHub Actions to assume a role

# GitHub Actions workflow:
jobs:
  deploy:
    permissions:
      id-token: write   # GitHub generates OIDC token
    steps:
    - uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: arn:aws:iam::123456789012:role/github-actions
        role-session-name: my-session
        aws-region: us-east-1
    # No AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY needed
    # The OIDC token authenticates the role assumption
    - run: aws s3 ls

# Trust policy in AWS:
{
    "Effect": "Allow",
    "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
        "StringEquals": {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            "token.actions.githubusercontent.com:sub": "repo:myorg/my-repo:ref:refs/heads/main"
        }
    }
}
\`\`\`

---

## Practice Questions

1. **Q:** What is OIDC and why is it better than storing access keys?
   **A:** OIDC (OpenID Connect) lets GitHub Actions request a short-lived token and exchange it for cloud provider credentials. No long-lived access keys are stored in GitHub Secrets. If the token is leaked, it expires in 5 minutes. Benefits: no secret rotation, no leaked keys, auditable per-workflow.

2. **Q:** What is the difference between needs and dependency in GitHub Actions?
   **A:** \`needs\` creates a dependency between jobs: \`job2 needs: [job1]\` means job2 waits for job1 to complete. If job1 fails, job2 is skipped. Matrix builds automatically create dependencies between the matrix generator and the matrix jobs. There is no \`dependency\` keyword — \`needs\` is the only way to order jobs.

3. **Q:** What happens when a matrix build has 12 combinations?
   **A:** 12 jobs run in parallel (up to the runner limit). Each gets its own runner. If one combination fails, the others continue. Use \`fail-fast: false\` to prevent cancelling all jobs when one fails — useful for collecting all test results.

4. **Q:** How does caching work in GitHub Actions?
   **A:** The \`actions/cache\` action saves a directory (node_modules, .m2, .nuget) keyed by a hash (package-lock.json). On subsequent runs, if the key matches, the cache is restored — saving minutes of dependency installation. Cache is limited to 10GB per repository. Cache is not available for pull requests from forks (security).

5. **Q:** What is the difference between \`push\` and \`pull_request\` triggers?
   **A:** \`push\` triggers on commits pushed directly to a branch. \`pull_request\` triggers when a PR is opened, synchronized (new commits pushed to the PR branch), or reopened. Separate triggers let you: run fast lint on push, run full test suite on PR, restrict deploy to main branch pushes only.

---

## Summary Cheat Sheet

\`\`\`
Workflow: YAML in .github/workflows/
Triggers: push, pull_request, schedule, workflow_dispatch, release

Jobs: run on runners, can have needs/dependencies
Matrix: run same job with multiple parameter combos
Caching: actions/cache for dependency caching (key by lockfile hash)
OIDC: keyless cloud auth (no stored secrets)
Reusable workflows: DRY principle for CI

Key Actions:
  actions/checkout — clone repo
  actions/setup-node/python/java — install language runtime
  actions/cache — cache dependencies
  aws-actions/configure-aws-credentials — OIDC auth to AWS
  docker/login-action — auth to container registry

Limits: 6h timeout, 72h max per workflow, ~35/month free`,
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
            content: `## Why This Matters (Read This First)

Deploying code is risky. A bad release can crash your site, lose data, or frustrate users. Deployment strategies mitigate this risk by controlling how new code reaches users.

The right strategy depends on: how critical your service is, how fast you need to roll out, how easy it is to roll back, and whether your database supports backward-incompatible changes.

---

## Rolling Update

\`\`\`
Standard K8s strategy — gradual replacement:

  v1: ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
       │A1│ │A2│ │A3│ │A4│ │A5│
       └──┘ └──┘ └──┘ └──┘ └──┘

  Step 1: ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
  (new)   │B1│ │A2│ │A3│ │A4│ │A5│
           └──┘ └──┘ └──┘ └──┘ └──┘

  Step 2: ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
           │B1│ │B2│ │A3│ │A4│ │A5│
           └──┘ └──┘ └──┘ └──┘ └──┘

  Done:   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
           │B1│ │B2│ │B3│ │B4│ │B5│
           └──┘ └──┘ └──┘ └──┘ └──┘

  Pros: no extra infra needed, gradual
  Cons: slow rollout, old + new versions run together
\`\`\`

---

## Blue-Green Deployment

\`\`\`
Blue-Green: two identical environments + instant switch

  ┌────────┐          ┌────────┐
  │ Blue   │          │ Green  │
  │ v1     │          │ v2     │
  │ 100%   │          │ 0%     │
  └────────┘          └────────┘

  Deploy to Green (v2), run tests, then switch:

  ┌────────┐          ┌────────┐
  │ Blue   │          │ Green  │
  │ v1     │          │ v2     │
  │ 0%     │          │ 100%   │ ← load balancer switch
  └────────┘          └────────┘

  If v2 fails: switch back to Blue (instant rollback)

  Pros: instant switch, instant rollback, canary testing
  Cons: 2x infra cost during deployment, DB schema compat

  # Kubernetes: two Deployments, one Service, patch selector
  kubectl patch service my-app -p '{"spec":{"selector":{"version":"green"}}}'
\`\`\`

---

## Canary Deployment

\`\`\`
Route small % of traffic to new version, observe, increase:

  ┌────────┐          ┌────────┐
  │ v1     │          │ v2     │
  │ 95%    │          │ 5%     │ ← canary
  └────────┘          └────────┘

  Metrics look good → increase:

  ┌────────┐          ┌────────┐
  │ v1     │          │ v2     │
  │ 50%    │          │ 50%    │
  └────────┘          └────────┘

  Errors spike → rollback to 0%:

  ┌────────┐          ┌────────┐
  │ v1     │          │ v2     │
  │ 100%   │          │ 0%     │ ← rollback
  └────────┘          └────────┘

  Pros: real traffic validation, small blast radius
  Cons: complex traffic routing, requires metrics monitoring

  # Istio VirtualService for canary:
  apiVersion: networking.istio.io/v1beta1
  kind: VirtualService
  spec:
    hosts: [my-app]
    http:
    - route:
      - destination: { host: my-app, subset: stable }
        weight: 95
      - destination: { host: my-app, subset: canary }
        weight: 5
\`\`\`

---

## Feature Flags

\`\`\`javascript
// LaunchDarkly / Flagsmith / custom flag system

const ldClient = LaunchDarkly.initialize("sdk-key", user);

// Deploy code WITH the new feature — but it is OFF
// The feature flag controls whether users see it

async function renderHomepage() {
    const showNewUI = await ldClient.variation("new-homepage", false);

    if (showNewUI) {
        return renderNewHomepage();  // new code — dark
    } else {
        return renderOldHomepage();  // old code — live
    }
}

// Enable flag for internal users first:
// "showNewUI = true for user.email contains @company.com"

// Then 10% of users:
// "showNewUI = true for 10% of users"

// Then 100%:
// "showNewUI = true for all"

// If bug found: flip flag off → old path immediately active
// No redeploy needed for rollback!

// Benefits:
// • Decouple deploy from release
// • Instant kill switch (no redeploy)
// • Target specific users (internal, beta, region)
// • A/B test different versions
// • No more long-lived feature branches
\`\`\`

---

## Practice Questions

1. **Q:** When would you use Blue-Green instead of Rolling Update?
   **A:** Blue-Green when: you need instant rollback (switch back to the old environment), you want to run smoke tests against the new version before serving traffic, or you want 0% chance of old and new versions interacting. Rolling update is simpler and cheaper (no 2x infra) but both versions coexist during the rollout.

2. **Q:** What is the database compatibility problem with deployments?
   **A:** During rolling updates, old and new code run simultaneously. If the new code adds a column, the old code must tolerate it (or fail). If the new code renames a column, old code breaks. Solution: deploy DB changes in phases (add column first, deploy code, then remove old column). This is called "expand and contract" migrations.

3. **Q:** How does a canary deployment detect problems?
   **A:** Monitor error rate, latency (p99), and business metrics (conversion rate) for the canary vs baseline. If error rate increases by >0.1%, or latency increases by >10%, or conversion drops by >1% — abort the canary. Tools: Flagger (K8s), Istio, Argo Rollouts automate canary analysis and rollback.

4. **Q:** What is the difference between feature flags and environment variables?
   **A:** Env vars are set at deploy time — changing them requires redeployment. Feature flags are evaluated at runtime — change them instantly without redeploy. Flags support targeting (specific users, percentages, A/B tests) and have audit trails. Use feature flags for: kill switches, gradual rollouts, beta programs.

5. **Q:** What is Argo Rollouts and how does it help?
   **A:** Argo Rollouts is a K8s controller that replaces Deployment for advanced strategies (Blue-Green, Canary). It provides: automated promotion/rollback based on metrics analysis (Datadog, Prometheus), traffic splitting (Service Mesh integration), and template-based step definitions. Standard K8s Deployments only support rolling updates.

---

## Summary Cheat Sheet

\`\`\`
Strategies:
  Rolling Update: gradual, no extra cost, both versions coexist
  Blue-Green: instant switch, 2x infra, instant rollback
  Canary: % traffic, metrics-based, small blast radius
  Feature Flags: decouple deploy/release, instant kill switch

Database:
  Expand and Contract: add → deploy → remove
  Never: rename/delete columns in same deploy as code change
  Always: backward-compatible migrations

Kubernetes:
  Deployment: rolling update only
  Argo Rollouts: Blue-Green and Canary with metrics analysis
  Istio/Service Mesh: fine-grained traffic splitting`,
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
            content: `## Why This Matters (Read This First)

The testing pyramid guides how to distribute testing effort: many fast unit tests at the base, fewer slower integration tests in the middle, and a handful of essential E2E tests at the top.

Investing in the wrong ratio (too many E2E, too few unit tests) leads to slow, flaky, expensive test suites that catch few bugs.

---

## The Pyramid

\`\`\`
          ┌─────┐
         /│ E2E │\        Few — critical user flows only
        / │ (5%) │ \      Slow (minutes), expensive ($), flaky
       /  └──────┘  \
      /───────────────\
     /│ Integration  │\  Some — test boundaries
    / │  (15%)       │ \ Medium speed, containerized deps
   /  └───────────────  \
  /───────────────────────\
 /│        Unit           │\ Many — test business logic
/ │        (80%)          │ \ Fast (ms), isolated, no deps
/ └───────────────────────┘ \
\`\`\`

---

## Unit Tests

\`\`\`typescript
// Pure function — easy to test, no dependencies
function calculateDiscount(items: CartItem[], coupon: Coupon): number {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    if (coupon.type === "percentage") {
        return subtotal * (coupon.value / 100);
    }
    if (coupon.type === "fixed") {
        return Math.min(coupon.value, subtotal);
    }
    return 0;
}

// Unit test:
test("percentage discount calculates correctly", () => {
    const items = [{ name: "shirt", price: 100 }];
    const coupon = { type: "percentage", value: 20 };

    expect(calculateDiscount(items, coupon)).toBe(20);
});

test("fixed discount cannot exceed subtotal", () => {
    const items = [{ name: "shirt", price: 10 }];
    const coupon = { type: "fixed", value: 50 };

    expect(calculateDiscount(items, coupon)).toBe(10);
});

// Unit tests: no HTTP calls, no DB, no filesystem
// Run in milliseconds, give fast feedback
\`\`\`

---

## Integration Tests

\`\`\`typescript
// Integration test: tests the boundary between your code and external systems
import { createContainer } from "testcontainers";  // Docker containers in tests

describe("User Repository", () => {
    let postgres: StartedTestContainer;

    beforeAll(async () => {
        // Spin up a real PostgreSQL container for the test
        postgres = await createContainer("postgres:16")
            .withExposedPorts(5432)
            .withEnvironment({ POSTGRES_PASSWORD: "test" })
            .start();

        // Run migrations on the test DB
        await runMigrations(`postgres://postgres:test@localhost:${postgres.getMappedPort(5432)}/test`);
    }, 30000);

    afterAll(async () => {
        await postgres.stop();
    });

    test("create and retrieve user", async () => {
        const repo = new UserRepository(testDbConnection);
        const user = await repo.create({ name: "Alice", email: "alice@test.com" });

        expect(user.id).toBeDefined();
        expect(user.name).toBe("Alice");

        const retrieved = await repo.findById(user.id);
        expect(retrieved?.name).toBe("Alice");
    });
});
\`\`\`

---

## Contract Tests (Pact)

\`\`\`typescript
// Consumer-side contract test (frontend)
// Proves: "the API I expect returns what I need"

// Pact test for the Order Service consumer:
describe("Order Service API", () => {
    const provider = new Pact({
        consumer: "WebApp",
        provider: "OrderService",
    });

    beforeAll(() => provider.setup());
    afterAll(() => provider.finalize());

    test("get order by ID", async () => {
        await provider
            .given("an order with ID 123 exists")
            .uponReceiving("a request for order 123")
            .withRequest({ method: "GET", path: "/orders/123" })
            .willRespondWith({
                status: 200,
                body: { id: "123", status: "shipped", items: [{ sku: "abc", qty: 2 }] },
            });

        const response = await fetchOrder("123");
        expect(response.id).toBe("123");
        expect(response.status).toBe("shipped");
    });
});

// Provider-side (backend) verifies the contract:
// Pact verifies that the OrderService actually returns
// what WebApp expects — catches breaking API changes
\`\`\`

---

## Practice Questions

1. **Q:** Why do unit tests make up 80% of the pyramid?
   **A:** Unit tests are fast (milliseconds), reliable (no network/DB), and easy to write and maintain. They catch logic bugs at the earliest stage — before integration issues. The ratio reflects the trade-off: you can run 1000 unit tests in the time one E2E test takes. Most bugs are logic bugs, not integration bugs.

2. **Q:** What is the difference between stubs and mocks?
   **A:** Both replace real dependencies. A stub returns fixed values — no behavior verification (used to control inputs). A mock records interactions — verifies that specific methods were called with specific arguments (used to verify outputs). In practice: use mocks sparingly — they couple tests to implementation details.

3. **Q:** What is a flaky test and how do you handle it?
   **A:** A flaky test passes and fails without code changes — caused by timing, race conditions, network timeouts, or test ordering. Solution: quarantine flaky tests (move them to a separate CI job), fix the root cause (add retries, remove shared state), and do not add new tests that depend on timing.

4. **Q:** What is the role of contract tests in microservices?
   **A:** In microservices, each service has its own deployment cycle. Contract tests (Pact) ensure that the API provider still satisfies all consumers' expectations before deployment. If a consumer expects a field that the provider removed, the contract test fails — preventing the breaking change from reaching production.

5. **Q:** What is test coverage and why is it not the goal?
   **A:** Test coverage measures what percentage of lines/branches are executed during tests. It is a proxy metric — high coverage does not mean good tests. 100% coverage with assertions like \`expect(true).toBe(true)\` is useless. Focus on meaningful assertions, not coverage percentage. 80% with good assertions beats 100% with trivial tests.

---

## Summary Cheat Sheet

\`\`\`
Testing Pyramid:
  Unit (80%): fast, isolated, business logic
  Integration (15%): DB, API, file system boundaries
  E2E (5%): critical user flows, full browser
  Contract: API compatibility between services

Best Practices:
  • Test behavior, not implementation
  • Use real dependencies in integration tests (containers)
  • Avoid mocks for external services (use testcontainers)
  • Quarantine flaky tests
  • Add tests when fixing bugs (red-green-refactor)
  • Coverage is a tool, not a target

Tools:
  Jest, Vitest (JS/TS), pytest (Python), JUnit (Java)
  testcontainers (integration tests with Docker)
  Pact (contract tests)
  Playwright, Cypress (E2E)`,
            tags: ["Testing", "CI-CD"],
          },
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
            content: `## Why This Matters (Read This First)

Prometheus is the standard for Kubernetes monitoring. It scrapes metrics from instrumented applications, stores them as time-series data, and powers Grafana dashboards and alerting.

The four metric types (Counter, Gauge, Histogram, Summary) cover every monitoring need: request counts, current resource usage, latency distributions, and quantiles.

---

## Metric Types

\`\`\`javascript
// Instrumentation example — Node.js with prom-client
const prometheus = require("prom-client");

// Counter: cumulative count (only increases)
const httpRequests = new prometheus.Counter({
    name: "http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["method", "path", "status"],
});

// Gauge: current value (goes up and down)
const memoryUsage = new prometheus.Gauge({
    name: "memory_usage_bytes",
    help: "Current memory usage",
});

// Histogram: distribution of values (bucketed)
const requestDuration = new prometheus.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request latency",
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],  // in seconds
});

// Summary: quantiles (p50, p90, p99)
const requestDurationSummary = new prometheus.Summary({
    name: "http_request_duration_summary",
    help: "HTTP request latency summary",
    percentiles: [0.5, 0.9, 0.99],
});

// Middleware:
app.use((req, res, next) => {
    const end = requestDuration.startTimer();
    res.on("finish", () => {
        httpRequests.inc({ method: req.method, path: req.path, status: res.statusCode });
        memoryUsage.set(process.memoryUsage().heapUsed);
        end({ method: req.method, path: req.path });
    });
    next();
});

// Expose /metrics endpoint:
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", prometheus.register.contentType);
    res.end(await prometheus.register.metrics());
});
\`\`\`

---

## PromQL — Query Language

\`\`\`promql
# Rate of requests per second over 5 minutes
rate(http_requests_total[5m])

# 99th percentile of request duration
histogram_quantile(0.99,
    rate(http_request_duration_seconds_bucket[5m])
)

# Error rate percentage
sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
* 100

# Memory usage by pod (top 5)
topk(5, memory_usage_bytes{namespace="production"})

# CPU usage rate by container
rate(container_cpu_usage_seconds_total{container!=""}[5m])

# Recording rules — precompute expensive queries
groups:
  - name: instance_metrics
    rules:
    - record: job:http_request_errors:rate5m
      expr: rate(http_requests_total{status=~"5.."}[5m])
\`\`\`

---

## AlertManager

\`\`\`yaml
# Alerting rules
groups:
  - name: example
    rules:
    - alert: HighErrorRate
      expr: |
        sum(rate(http_requests_total{status=~"5.."}[5m]))
        /
        sum(rate(http_requests_total[5m])) > 0.05
      for: 5m    # Fires after 5 minutes of sustained errors
      labels:
        severity: critical
      annotations:
        summary: "Error rate above 5%"
        description: "Error rate is {{ $value | humanizePercentage }}"
---
# AlertManager config
route:
  receiver: pagerduty-critical
  routes:
  - match:
      severity: critical
    receiver: pagerduty-critical
    repeat_interval: 1h
  - match:
      severity: warning
    receiver: slack-alerts

receivers:
- name: pagerduty-critical
  pagerduty_configs:
  - routing_key: <key>
- name: slack-alerts
  slack_configs:
  - channel: "#alerts"
    send_resolved: true
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between Counter and Gauge?
   **A:** Counter only increases (resets on restart) — used for accumulated values like request count, bytes served, errors. Gauge can go up and down — used for current values like memory usage, CPU temperature, queue depth. Using a Gauge for a counter-like metric is wrong (rate() does not work on Gauges).

2. **Q:** What is a histogram bucket and how does histogram_quantile work?
   **A:** A histogram records observations into predefined value buckets (e.g., request durations <0.01s, <0.05s, <0.1s). histogram_quantile estimates the quantile from the bucket counts. Accuracy depends on bucket granularity — more buckets near the SLO threshold for better precision (e.g., more buckets around 200ms if SLO is p99 < 200ms).

3. **Q:** What is the difference between rate() and increase()?
   **A:** rate() calculates per-second average over a time range. increase() is the total increase over the time range. rate(http_requests[5m]) = increase(http_requests[5m]) / 300s. Use rate() for auto-scaling (per-second metrics), increase() for dashboards showing "requests per 5 min."

4. **Q:** What is the for: duration in alerting rules?
   **A:** for prevents alert flapping. "HighErrorRate for: 5m" means the condition must be true for 5 consecutive minutes before the alert fires. If the error rate spikes for 30 seconds and recovers, no alert fires. This filters out transient issues.

5. **Q:** What are label best practices in Prometheus?
   **A:** Keep label cardinality bounded — never use user IDs, email addresses, or UUIDs as label values (each unique label value creates a new time series). Use labels for: service name, method, status code, endpoint. Maximum recommended: 20 unique label values per metric. High cardinality explodes storage.

---

## Summary Cheat Sheet

\`\`\`
Metric Types:
  Counter: cumulative, only increases (rate(), increase())
  Gauge: goes up and down (current value)
  Histogram: bucketed distribution (histogram_quantile)
  Summary: precomputed quantiles (no aggregation across instances)

PromQL:
  rate() — per-second rate
  increase() — total increase over window
  histogram_quantile() — pXX from histogram buckets
  topk() — highest N values
  sum()/avg()/min()/max() — aggregation

Best Practices:
  Four golden signals: Latency, Traffic, Errors, Saturation (USE/RED)
  USE: Utilization, Saturation, Errors (infra)
  RED: Rate, Errors, Duration (services)
  Recording rules for expensive queries`,
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
            content: `## Why This Matters (Read This First)

Structured logging emits JSON instead of text strings. Every field (user_id, order_id, error_code) is a separate key-value pair — queryable without regex. Correlation IDs link all log entries for a single request across services.

Loki and Elasticsearch are the two main log aggregation systems. Loki is cheaper (indexes only labels, not log content). Elasticsearch is more powerful (full-text search, but costs more).

---

## Structured Logging

\`\`\`typescript
// BAD: unstructured logging
console.log(`User ${userId} placed order ${orderId} for $${total}`);
// Query: grep "placed order" | awk '{print $2}'
// Fragile, slow, no structured fields

// GOOD: structured JSON logging (pino, winston, bunyan)
import pino from "pino";

const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    formatters: {
        level(label) {
            return { level: label };
        },
    },
    // Redact sensitive fields
    redact: ["password", "creditCard", "headers.authorization"],
});

logger.info({
    event: "order.placed",
    userId,
    orderId,
    total,
    currency: "USD",
    items: itemCount,
}, "Order placed successfully");

// Output:
// {"level":"info","time":"2024-01-15T10:30:00Z",
//  "event":"order.placed","userId":"usr_123","orderId":"ord_456",
//  "total":49.99,"currency":"USD","items":3,
//  "msg":"Order placed successfully"}
//
// Query in Loki: {app="order-service"} |= "order.placed" | json
// Query in ES: event: "order.placed" AND userId: "usr_123"
\`\`\`

---

## Correlation IDs

\`\`\`typescript
// Express middleware: attach correlation ID to every request
import { v4 as uuidv4 } from "uuid";

app.use((req, res, next) => {
    // Accept existing ID if caller provides one (service-to-service)
    const correlationId = req.headers["x-correlation-id"] || uuidv4();

    // Attach to request for downstream use
    req.correlationId = correlationId;

    // Add to response headers so caller can trace
    res.setHeader("x-correlation-id", correlationId);

    // Create per-request child logger
    req.log = logger.child({ correlationId });

    next();
});

// In downstream service calls:
// Pass x-correlation-id header to all HTTP/gRPC calls
// All services include the same correlationId in their logs
// Result: search for one ID → see the entire request journey
\`\`\`

---

## Loki vs Elasticsearch

\`\`\`
Loki (Grafana Labs):
  ├── Indexes: only labels (app, namespace, pod, level)
  ├── Storage: object storage (S3, GCS) — cheap
  ├── Query: LogQL (similar to PromQL)
  ├── Cost: ~10x cheaper than ES for same volume
  └── Best for: K8s-native, already using Grafana

Elasticsearch / OpenSearch:
  ├── Indexes: full-text (every field indexed)
  ├── Storage: local SSDs — expensive
  ├── Query: Lucene query syntax + aggregations
  ├── Cost: ~$1000/TB/month for managed ES
  └── Best for: complex full-text search, Kibana dashboards

# LogQL — Loki query examples
{app="order-service", level="error"}
|= "database connection failed"
| json
| line_format "{{.error}} (order: {{.orderId}})"

# Rate of errors per service
sum by (app) (
    rate({level="error"} [5m])
)

# ES query:
GET /logs-2024.01.15/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "level": "error" }},
        { "match": { "service": "order-service" }}
      ]
    }
  },
  "aggs": {
    "errors_by_hour": {
      "date_histogram": { "field": "@timestamp", "interval": "hour" }
    }
  }
}
\`\`\`

---

## Practice Questions

1. **Q:** Why is structured logging better than printf logging?
   **A:** Structured logs emit fields as machine-readable key-value pairs. You can query, filter, and aggregate by any field without regex parsing. printf logs require fragile regex to extract data. Structured logs also redact sensitive fields, handle multiline messages, and produce valid JSON for log aggregators.

2. **Q:** How does a correlation ID work across microservices?
   **A:** When Service A receives a request, it generates a correlation ID (UUID). It passes this ID to Service B, Service C, etc. via HTTP headers or message metadata. All log entries from all services include this ID. To debug a request: search for the correlation ID → find every log entry for that request across all services.

3. **Q:** What is the difference between Loki and Prometheus?
   **A:** Prometheus stores NUMERIC time-series metrics (cpu_usage, request_count). Loki stores LOG LINES (text with labels). Prometheus answers "what is the error rate?" Loki answers "what did the error log say?" They complement each other: Prometheus alerts on high error rate, Loki finds the specific error messages.

4. **Q:** What log level should you use in production?
   **A:** Default: INFO (or WARN for high-traffic services). DEBUG logs are too verbose and expensive — they increase storage costs significantly. Use "dynamic log level" (change level at runtime without restart) for temporary debugging. In Loki, you can filter by level — expensive queries for DEBUG logs waste resources.

5. **Q:** How do you handle sensitive data in logs?
   **A:** 1) Redact: configure pino/winston to replace sensitive fields with "[REDACTED]". 2) Never log: credit card numbers, passwords, tokens, PII. 3) Audit: periodically scan logs for leaked secrets. 4) Retention: limit log retention (7-30 days typical). 5) Access control: restrict log access to on-call engineers.

---

## Summary Cheat Sheet

\`\`\`
Structured Logging: JSON with key-value fields — queryable without regex
Correlation ID: UUID propagated across services — links all log entries

Log Levels: DEBUG < INFO < WARN < ERROR < FATAL
Production: INFO (or WARN). ERROR for incidents only.

Loki: label-indexed, cheap storage (S3), LogQL queries
Elasticsearch: full-text indexed, expensive, Lucene queries

Best Practices:
  • Log events (order.placed), not messages
  • Include correlation ID in every log entry
  • Redact sensitive fields
  • Set appropriate log levels
  • Use structured properties, not string interpolation
  • Query: first filter by labels, then search content`,
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
            content: `## Why This Matters (Read This First)

Distributed tracing follows a request across microservices. When a user's API call touches 5 services, tracing shows exactly how long each service took and where failures occurred.

OpenTelemetry is the industry standard for generating traces (and metrics and logs). It provides SDKs for every language and a collector for processing telemetry data.

---

## Traces and Spans

\`\`\`
┌─────────────────────────────────────────────────────────┐
│  Trace: 1 request — spans form a tree                    │
│                                                           │
│  [Frontend] ─────────────────────────────────────────    │
│   span: HTTP POST /api/orders      duration: 450ms       │
│   ├── [Auth Service] ───────────────────────────────     │
│   │   span: validate JWT            duration: 15ms       │
│   ├── [Order Service] ──────────────────────────────     │
│   │   span: create order            duration: 300ms      │
│   │   ├── [Database]              duration: 120ms        │
│   │   └── [Payment Service] ─────────────────────────    │
│   │       span: charge card         duration: 200ms      │
│   │       └── [Stripe API]        duration: 180ms        │
│   └── [Notification Service] ────────────────────────    │
│       span: send email              duration: 50ms        │
└─────────────────────────────────────────────────────────┘
\`\`\`

---

## OpenTelemetry SDK

\`\`\`typescript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

// Initialize OTel SDK
const sdk = new NodeSDK({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: "order-service",
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: "production",
    }),
    traceExporter: new OTLPTraceExporter({
        url: "http://otel-collector:4318/v1/traces",
    }),
    instrumentations: [
        new HttpInstrumentation(),    // Auto-instrument HTTP client/server
        new ExpressInstrumentation(), // Auto-instrument Express routes
    ],
});

sdk.start();

// Manual instrumentation:
import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("order-service");

async function createOrder(data: OrderData): Promise<Order> {
    // Create a child span
    return tracer.startActiveSpan("createOrder", async (span) => {
        span.setAttribute("order.items", data.items.length);
        span.setAttribute("order.total", data.total);

        try {
            const order = await db.saveOrder(data);

            // Add events for interesting moments
            span.addEvent("order.saved", { orderId: order.id });

            await chargePayment(order);

            span.setStatus({ code: SpanStatusCode.OK });
            return order;
        } catch (error) {
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error.message,
            });
            span.recordException(error);
            throw error;
        } finally {
            span.end();
        }
    });
}
\`\`\`

---

## Context Propagation

\`\`\`http
# Trace context is propagated via HTTP headers (W3C TraceContext standard):

# Service A → Service B HTTP request headers:
traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
#              | |        trace_id (16 bytes hex)          | span_id  |trace flags
#              | |                                         |          |
#               version                                    01 = sampled

# Service B reads traceparent, creates child span with new span_id
# All spans with the same trace_id belong to the same trace

# For message queues (SQS, Kafka): context is injected into message metadata
# For gRPC: context is propagated via gRPC metadata
\`\`\`

---

## OTel Collector

\`\`\`yaml
# otel-collector-config.yaml
# Receives traces from services, processes them, exports to backend
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  prometheus:
    config:
      scrape_configs:
        - job_name: "otel-collector"
          scrape_interval: 10s

processors:
  batch:            # Batch traces before exporting (efficiency)
    timeout: 1s
    send_batch_size: 1024
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
  attributes:
    actions:
      - key: environment
        value: production
        action: insert

exporters:
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true
  datadog:
    api:
      key: ${DATADOG_API_KEY}
  prometheus:
    endpoint: "0.0.0.0:8889"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, attributes]
      exporters: [jaeger, datadog]
    metrics:
      receivers: [prometheus]
      exporters: [prometheus]
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between logs and traces?
   **A:** Logs are discrete events with timestamps. Traces show the RELATIONSHIP between operations — which service called which, how long each took, and where errors occurred. Traces answer "what happened before the error?" Logs answer "what was the error message?" Both are needed for debugging.

2. **Q:** What is head-based vs tail-based sampling?
   **A:** Head-based: decide at the root span whether to sample (e.g., 1% of requests). Simple but may miss rare errors. Tail-based: record all spans temporarily, then decide which to keep based on criteria (all errors, slow requests, specific users). Tail-based captures important events better but requires more storage.

3. **Q:** How does context propagation work across async boundaries?
   **A:** W3C TraceContext headers carry trace_id + span_id in HTTP requests. For message queues (SQS, RabbitMQ), the trace context is injected into message headers/attributes. For async callbacks (setTimeout, Promise), the OpenTelemetry SDK uses Node.js AsyncLocalStorage to maintain context across async boundaries automatically.

4. **Q:** What is the role of the OTel Collector?
   **A:** The collector sits between your services and the backend (Jaeger, Datadog). It: receives telemetry in OTLP format, batches it for efficiency, filters/drops unwanted data, adds attributes (environment, datacenter), and exports to one or more backends. The collector reduces the load on both services and backends.

5. **Q:** What information should you add to a span as attributes?
   **A:** Attributes that help understand the operation: order ID, user ID, payment amount, cache hit/miss, HTTP status code, error message. DO NOT add high-cardinality values (timestamps, UUIDs, full request bodies) — they increase storage and reduce performance. Use span events for detailed debug info.

---

## Summary Cheat Sheet

\`\`\`
Trace: tree of spans — full request journey across services
Span: named, timed operation — start/end, attributes, status, events

OpenTelemetry:
  SDK: instrument your code (Node, Python, Java, Go)
  Collector: receive, process, export telemetry
  Exporters: Jaeger, Zipkin, Datadog, Honeycomb, New Relic
  Propagators: W3C TraceContext (standard)

Context Propagation:
  HTTP: traceparent header
  gRPC: gRPC metadata
  Message queues: message attributes/headers
  Async: AsyncLocalStorage / context API

Sampling:
  Head-based: decide at root (simple, may miss errors)
  Tail-based: decide after recording (captures errors, more complex)

Best Practices:
  Instrument all services (auto-instrumentation for quick wins)
  Add business-relevant span attributes
  Propagate context everywhere (HTTP, queue, async)
  Use OTel Collector for batching + filtering`,
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
            content: `## Why This Matters (Read This First)

SRE applies software engineering principles to operations. Instead of "the system is down, fix it," SRE defines measurable reliability targets, measures them, and uses the data to prioritize reliability work.

The core concepts: **SLI** (what you measure), **SLO** (the target), and **Error Budget** (how much unreliability is allowed).

---

## SLIs, SLOs, and Error Budgets

\`\`\`
SLI — Service Level Indicator (what we measure):
  • Latency: p99 of HTTP request duration < 200ms
  • Availability: % of requests that succeed (non-5xx)
  • Throughput: requests per second
  • Durability: % of data successfully persisted

SLO — Service Level Objective (the target):
  • "99.9% of requests complete with latency < 200ms (p99)"
  • "99.99% of requests return success (non-5xx)"

Error Budget = 100% - SLO:
  • 99.9% SLO = 0.1% Error Budget = 43.2 minutes/month
  • 99.99% SLO = 0.01% Error Budget = 4.32 minutes/month
  • 99.999% SLO = 0.001% Error Budget = 25.9 seconds/month

  ┌──────────────────────────────────────────┐
  │ Error Budget Usage (monthly)              │
  │                                           │
  │ ┌──────────────────┐                      │
  │ │ ████████████████ │ 60% used (26 min)    │
  │ │ ████████████████ │                      │
  │ │ ████████████████ │ Remaining: 17.2 min  │
  │ └──────────────────┘                      │
  │                                           │
  │ Policy:                                   │
  │ • < 50% used: deploy freely               │
  │ • 50-80%: slow down risky changes          │
  │ • > 80%: feature freeze — reliability      │
  │   improvements only                        │
  └──────────────────────────────────────────┘
\`\`\`

---

## Defining SLOs

\`\`\`yaml
# Example SLO definitions for an API service
slo_config:
  service: order-api

  slis:
    availability:
      good_events: requests_total{status!~"5.."}
      valid_events: requests_total
      objective: 99.99   # "four nines"

    latency:
      good_events: http_request_duration_seconds_bucket{le="0.2"}
      valid_events: http_request_duration_seconds_count
      objective: 99.9   # "three nines p99 < 200ms"

    freshness:
      # For data pipelines: how fresh is the data?
      good_events: data_age_seconds < 300   # < 5 min
      valid_events: total_data_updates
      objective: 99

# Multi-window, multi-burn-rate alerting:
# Alert when error budget burns faster than threshold
# (e.g., 2% of budget consumed in 1 hour = 14x burn rate)
alerts:
  - name: HighErrorBudgetBurnRate
    condition: burn_rate > 10 for 30m  # "We'll exhaust budget in 3 days"
    severity: page
  - name: CriticalErrorBudgetBurnRate
    condition: burn_rate > 20 for 5m   # "We'll exhaust budget in 12 hours"
    severity: page
\`\`\`

---

## Postmortems and Toil

\`\`\`
Postmortem template:
  Title: "Database connection pool exhaustion on Jan 15, 2024"

  Summary:
    At 14:30 UTC, all API services became unresponsive due to
    database connection pool exhaustion. Full recovery at 15:12 UTC.

  Duration: 42 minutes
  Impact: 100% of traffic affected (all API requests failed)

  Root Causes:
    1. A new migration ran a long-running query that held connections
    2. Connection pool max was set to 50 (too low for peak traffic)
    3. No alert on pool utilization > 80%

  Contributing Factors:
    - Migration was deployed during business hours (no canary)
    - No load test covered the migration scenario

  Action Items:
    [P0] Add alert on connection pool utilization > 80%   [SRE team, due: 1/18]
    [P0] Increase pool max to 150                         [SRE team, due: 1/16]
    [P1] Run migrations during off-peak hours             [All teams, due: 1/31]
    [P1] Add load test for migration scenarios             [QA team, due: 2/15]

Toil (manual, repetitive ops work):
  • Restarting pods manually → automate with health checks
  • Approving firewall changes → self-service via API
  • Running DB queries for support → build admin dashboard
  • Manual deployments → CI/CD pipeline
  SRE principle: if a human has done it twice, automate it.
\`\`\`

---

## Practice Questions

1. **Q:** What is a good SLO target for a new service?
   **A:** Start with 99.9% (3 nines = 43 min/month downtime). This gives enough error budget for experimentation. As the service matures and reliability improves, tighten to 99.99% (4 nines = 4 min/month). Do NOT set 99.999% (5 nines) unless absolutely necessary — it costs ~10x more and adds little value for most services.

2. **Q:** What happens when the error budget is exhausted?
   **A:** All non-critical changes are frozen — only reliability improvements and security patches are deployed. The team focuses on: reducing error rate (fix bugs, add retries, scale up), understanding root causes (postmortems), and adding reliability features. Once the budget recovers (good events accumulate), normal deployments resume.

3. **Q:** What is the difference between SLI and SLO?
   **A:** SLI is the MEASUREMENT — "p99 latency is 180ms." SLO is the TARGET — "p99 latency must be < 200ms 99.9% of the time." An SLI without an SLO is just a metric. An SLO without an SLI is unmeasurable. Both are needed.

4. **Q:** What is the burn rate alerting approach?
   **A:** Burn rate is how fast the error budget is being consumed. A burn rate of 1 means budget will last the full month. Burn rate of 10 means budget will be exhausted in 3 days. Alert when burn rate exceeds thresholds: page at 10x+ for 30min, page at 20x+ for 5min. This catches problems early without paging on every small blip.

5. **Q:** What is the SRE approach to on-call?
   **A:** On-call rotations of 4-6 engineers (1 week primary, 1 week secondary). Alerts should be actionable — if an alert fires, the engineer must do something (or silence/fix the alert). Alerts that nobody acts on become noise and are ignored. Primary handles pages; secondary handles PRs and support.

---

## Summary Cheat Sheet

\`\`\`
SLI: measurable metric (p99 latency, error rate, throughput)
SLO: target for SLI (99.9% < 200ms)
Error Budget: 100% - SLO = allowed downtime

Error Budget Policy:
  <50% consumed: deploy freely
  50-80%: slow down
  >80%: feature freeze, reliability only

Burn Rate Alerts:
  >10x for 30min: page (will exhaust in ~3 days)
  >20x for 5min: page (will exhaust in ~12 hours)

Postmortems: blameless, within 48h, action items with owners

Toil: automate repetitive ops work
  If done twice by a human, automate it`,
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
            content: `## Why This Matters (Read This First)

Chaos Engineering finds weaknesses BEFORE they cause customer-facing outages. By deliberately injecting failures (kill a pod, slow a network, crash a database), you discover how your system actually behaves under stress.

Netflix's Chaos Monkey was the first: it randomly kills production instances. If your service survives, it is resilient. If not, you find and fix the gap.

---

## Steady State Hypothesis

\`\`\`
Chaos Engineering Process:

  1. Define Steady State: "p99 latency < 200ms, error rate < 0.1%"
  2. Inject Failure: "kill 2 of 5 API-server pods"
  3. Measure: observe latency + error rate during failure
  4. Compare: did the system stay within steady state?
  5. Fix or automate: if failed → fix the gap; if passed → automate

  ┌─────────────────────────────────────────────────────┐
  │  Metrics during experiment                           │
  │                                                       │
  │  Error Rate                                          │
  │  5% ┤    ╔══╗                                         │
  │  4% ┤    ║  ║   ─── SLO violation!                    │
  │  3% ┤    ║  ║                                          │
  │  2% ┤    ║  ║                                          │
  │  1% ┤────║──║─── SLO threshold (1%)                    │
  │  0% ┤────╚══╝────────────────────                      │
  │       └────┬────┬────┬────┬────                       │
  │            │    │    │    │    Time                    │
  │         inject  │    │    │                           │
  │         failure │    │    │                           │
  │          detect │    │    │                           │
  │          anomaly│  recovery                           │
  └─────────────────────────────────────────────────────┘
\`\`\`

---

## LitmusChaos — K8s Chaos Engineering

\`\`\`yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: pod-delete-experiment
spec:
  engineState: "active"
  appinfo:
    appns: "production"
    applabel: "app=api-server"
    appkind: "deployment"
  chaosServiceAccount: litmus-admin
  experiments:
  - name: pod-delete
    spec:
      rank: 1
      probe:
      - name: "check-api-health"
        type: "httpProbe"
        httpProbe/inputs:
          url: "http://api-service:3000/healthz"
          insecureSkipVerify: false
          expectedResponseCode: "200"
      components:
        env:
        - name: TOTAL_CHAOS_DURATION
          value: "60"           # Run for 60 seconds
        - name: CHAOS_INTERVAL
          value: "10"           # Delete a pod every 10 seconds
        - name: FORCE
          value: "true"         # Force delete (kill -9)
---
# Experiment runs, measures steady state, generates a report:
# Summary:
#   Experiment: pod-delete
#   Target: production/api-server (3 pods)
#   Duration: 60s (6 pod deletions)
#   Steady State: latency p99 < 200ms
#   Result: ❌ FAILED
#     - Latency spiked to 5s during pod deletion
#     - Error rate: 2% during chaos
#   Action Item: add preStop hook + drain connections
\`\`\`

---

## AWS Fault Injection Simulator

\`\`\`yaml
# AWS FIS — inject failures into AWS infrastructure
apiVersion: fis.aws.amazon.com/v1
kind: ExperimentTemplate
spec:
  description: "Kill EC2 instance in ASG"
  targets:
    instances:
      resourceType: aws:ec2:instance
      selectionMode: PERCENT
      parameters:
        selectionMode: PERCENT
        percent: 20
      resourceTags:
        Environment: production
  actions:
    terminateInstances:
      actionId: aws:ec2:terminate-instances
      parameters:
        duration: PT1M
      targets:
        Instances: instances
  stopConditions:
  - source: aws:cloudwatch:alarm
    value: "high-error-rate-alarm"  # Auto-stop if error rate spikes
  roleArn: arn:aws:iam::123456789012:role/fis-role
  tags:
    ExperimentType: chaos
---
# Other FIS actions:
#   aws:ssm:send-command — run stress-ng (CPU, memory, IO)
#   aws:rds:failover-db-cluster — trigger RDS failover
#   aws:ecs:deregister-task — stop ECS tasks
#   aws:network:disrupt — network latency/packet loss
\`\`\`

---

## Game Days

\`\`\`
Game Day: a scheduled event where the team practices incident response.

  Scenario: "Primary database is corrupted"

  Timeline:
    09:00 — Announcement: "Game Day starts now. Incident: database issues."
    09:02 — On-call engineer acknowledges
    09:05 — Incident commander assigned
    09:08 — Team identifies: primary DB has corrupt page
    09:12 — Decision: failover to replica
    09:15 — Failover complete, service recovering
    09:22 — Service healthy, postmortem started

  What We Learned:
    • Failover script was outdated (took 3 min to find docs)
    • Did not have replica endpoint handy
    • Notified stakeholders late (15 min after failover)

  Improvements:
    • Document failover procedure in runbook
    • Automate failover with a single command
    • Add stakeholder notification step to incident checklist

  Game Day cadence: monthly for critical services, quarterly for others.
\`\`\`

---

## Practice Questions

1. **Q:** What is the first step in chaos engineering?
   **A:** Define the steady state — what does "normal" look like? (p99 latency, error rate, throughput). Without a steady state hypothesis, you cannot tell if the experiment passed or failed. Run the experiment in production only after proving it works in staging.

2. **Q:** What is blast radius and how do you control it?
   **A:** Blast radius is the scope of impact if something goes wrong during the experiment. Control it by: starting small (one pod, not the whole deployment), using a small percentage (5% of instances), limiting duration (60 seconds), setting automatic stop conditions (CloudWatch alarm halts the experiment), and running during off-peak hours.

3. **Q:** What is the difference between Chaos Monkey and LitmusChaos?
   **A:** Chaos Monkey randomly kills instances in Netflix's production — no experiment configuration. LitmusChaos defines experiments with specific targets, probes (verify service health), and steady-state validation. LitmusChaos is "controlled chaos" — you define the hypothesis and verify it programmatically.

4. **Q:** Why run chaos experiments in production, not just staging?
   **A:** Staging does not have production traffic patterns, data sizes, configuration, or dependencies. A resilience fix that works in staging may fail in production. Start with small blast radii in production (one pod, <5% of servers) and gradually increase as confidence grows. Netflix runs Chaos Monkey in production during business hours.

5. **Q:** What is a "noop" experiment and why start with one?
   **A:** A noop experiment injects no failure but runs the full observability pipeline. It validates that: metrics collection works, dashboards capture the data, alerts trigger correctly, and the team responds. If the noop experiment fails (no alert fired), fix the observability before running real chaos experiments.

---

## Summary Cheat Sheet

\`\`\`
Chaos Engineering Process:
  1. Define steady state (SLOs)
  2. Inject failure
  3. Measure impact
  4. Fix gaps
  5. Automate

Blast Radius Control:
  • Start with 1 pod, <5% of instances
  • Auto-stop conditions (CloudWatch alarm)
  • Limited duration
  • Off-peak hours

Tools:
  LitmusChaos: K8s-native chaos experiments with probes
  AWS FIS: infrastructure failure injection
  Chaos Mesh: K8s chaos (network latency, pod kill, disk failure)
  Gremlin: SaaS chaos engineering platform

Game Days: scheduled incident simulation — practice response, find gaps`,
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
            content: `## Why This Matters (Read This First)

When a critical incident happens, how you respond matters more than what caused it. A structured incident management process reduces downtime, prevents burnout, and ensures the right people are working on the right problems.

Without it: chaos, hero culture, incomplete fixes, repeated outages, and burned-out engineers.

---

## Severity Levels

\`\`\`
SEV1 — Critical (page immediately):
  • Service is down for all users
  • Data loss in progress
  • Response: < 5 minutes, any time of day/night
  • Escalation: IC → Engineering Manager → VP → CTO

SEV2 — High (page during business hours):
  • Service degraded for significant subset of users
  • Feature unavailable, but core functionality works
  • Response: < 15 minutes during business hours
  • Escalation: IC → Engineering Manager

SEV3 — Medium (no page, ticket):
  • Minor feature broken, workaround exists
  • Non-urgent performance degradation
  • Response: < 1 business day
  • Track in issue tracker, no pager

SEV4 — Low (ticket):
  • Cosmetic issue, documentation error
  • Response: next sprint planning
  • Track in issue tracker
\`\`\`

---

## Incident Response Process

\`\`\`
  ┌─────────────────────────────────────────────────────┐
  │  Alert fires                                          │
  └────────────────────┬────────────────────────────────┘
                       │
  ┌────────────────────▼────────────────────────────────┐
  │  Acknowledge (within 5 min)                          │
  │  • Primary on-call acknowledges the page              │
  │  • "I am looking at this" in #incident Slack channel  │
  └────────────────────┬────────────────────────────────┘
                       │
  ┌────────────────────▼────────────────────────────────┐
  │  Assess                                              │
  │  • What is the impact? (users affected, services)     │
  │  • What severity? (SEV1? SEV2?)                       │
  │  • Do I need help? (secondary, subject matter expert) │
  └────────────────────┬────────────────────────────────┘
                       │
  ┌────────────────────▼────────────────────────────────┐
  │  Incident Commander assigned (for SEV1/2)            │
  │  • IC owns: timeline, communication, task delegation  │
  │  • IC does NOT: debug the issue                       │
  │  • IC says: "You investigate DB. You deploy fix.      │
  │    I will update stakeholders every 15 min."          │
  └────────────────────┬────────────────────────────────┘
                       │
  ┌────────────────────▼────────────────────────────────┐
  │  Mitigate (not fix — stop the bleeding)              │
  │  • Rollback the deploy                               │
  │  • Scale up to handle load                           │
  │  • Failover to replica                               │
  │  • Disable the problematic feature                    │
  └────────────────────┬────────────────────────────────┘
                       │
  ┌────────────────────▼────────────────────────────────┐
  │  Resolve + Postmortem                                │
  │  • Service healthy → incident resolved                │
  │  • Postmortem within 48 hours                         │
  │  • Action items assigned with deadlines               │
  └─────────────────────────────────────────────────────┘
\`\`\`

---

## Blameless Postmortems

\`\`\`
Postmortem "5 Whys" Example:

  Problem: User data was lost during a deploy

  Why? → Deployment deleted the PVC attached to the database
  Why? → Helm chart had "Delete" reclaim policy instead of "Retain"
  Why? → We copied a staging chart template that uses Delete for ephemeral data
  Why? → No review process flagged the reclaim policy difference
  Why? → We do not have a checklist for production deployments

  Action Items:
  [P0] Change PVC reclaim policy to Retain for all production databases
  [P1] Add "verify PVC reclaim policy" to deployment checklist
  [P2] Create separate Helm values template for prod with safety defaults

Key: The goal is NOT to say "Alice made a mistake."
The goal IS to find: "What process allowed this mistake to reach production?"
\`\`\`

---

## On-Call Best Practices

\`\`\`
Rotation: 4-6 engineers per rotation
  • 1 week primary (pages only go to primary)
  • 1 week secondary (supports primary, handles non-urgent)
  • 1-2 weeks off (no on-call) between rotations

Alert quality:
  • Every alert must be actionable
  • If an alert fires and nobody acts → remove or fix it
  • Alerts that repeat → automate the response
  • Target: < 5 pages per on-call shift

Handover:
  • End of shift: document ongoing issues in Slack
  • Review alert history from your shift
  • Update runbooks for anything that was unclear on-call

Fatigue prevention:
  • No more than 1 week primary per month
  • Swap shifts if needed (vacation, conference)
  • Auto-escalation after 10 min with no acknowledgment
  • Secondary takes over if primary does not respond
\`\`\`

---

## Practice Questions

1. **Q:** What is the role of the Incident Commander?
   **A:** The IC manages the incident — they do NOT debug. They: declare severity, delegate tasks ("Alice, investigate the DB. Bob, check the CDN."), communicate status to stakeholders every 15-30 min, manage the timeline, and call the incident when resolved. The IC is often the most organized person, not the most technical.

2. **Q:** What is a blameless postmortem?
   **A:** A postmortem that focuses on SYSTEMIC causes, not individual mistakes. The assumption: everyone did their best with the information they had. The question is: "What in our system, process, or tooling allowed this to happen?" Blameless culture encourages reporting incidents without fear of punishment.

3. **Q:** What is the difference between MTTD and MTTR?
   **A:** MTTD (Mean Time to Detect): how long between the incident starting and someone acknowledging the page. MTTR (Mean Time to Resolve): how long between detection and service recovery. Track both — MTTD improves with better monitoring and alerting; MTTR improves with better runbooks and automation.

4. **Q:** How do you distinguish between a SEV1 and SEV2?
   **A:** SEV1: service is COMPLETELY down for all users, or data loss is in progress. SEV2: service is DEGRADED (slow, partial feature loss) for some users. SEV1 pages at 3 AM; SEV2 pages during business hours only. If unsure, declare SEV1 — you can always downgrade, but you cannot undo the delay of an escalation.

5. **Q:** How many on-call rotations should a team have?
   **A:** 4-6 engineers per rotation. Fewer than 4: too frequent (burnout risk). More than 6: too infrequent (engineers lose familiarity with the system). Example: 6-person team → on-call every 6 weeks. Each rotation: 1 week primary, 1 week secondary, 4 weeks off.

---

## Summary Cheat Sheet

\`\`\`
Severity Levels:
  SEV1: service down, page immediately (any time)
  SEV2: degraded, page business hours
  SEV3: minor, ticket
  SEV4: cosmetic, backlog

Incident Response:
  Acknowledge → Assess → Assign IC → Mitigate → Resolve → Postmortem

Incident Commander:
  Manages timeline, delegates tasks, communicates — does NOT debug

Postmortem:
  Blameless, within 48 hours
  Focus: systemic causes, not individual mistakes
  Action items: specific, with owners and deadlines

On-Call:
  4-6 per rotation, 1 week primary, actionable alerts only
  MTTD + MTTR: track trends, not absolute values`,
            tags: ["SRE", "Incident Management", "On-Call"],
          },
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
            content: `## Why This Matters (Read This First)

Supply chain attacks target your dependencies — malicious packages, compromised build systems, and unsigned artifacts. SBOMs, Sigstore signing, and SLSA levels help you know exactly what is in your software and verify it has not been tampered with.

The SolarWinds attack showed that compromising one build pipeline can infect thousands of downstream customers. Supply chain security is now a regulatory requirement (US Executive Order 14028, EU Cyber Resilience Act).

---

## SBOM — Software Bill of Materials

\`\`\`json
// CycloneDX SBOM format (machine-readable)
{
    "bomFormat": "CycloneDX",
    "specVersion": "1.5",
    "version": 1,
    "metadata": {
        "timestamp": "2024-01-15T10:00:00Z",
        "tools": [{
            "vendor": "anchore",
            "name": "syft",
            "version": "0.80.0"
        }],
        "component": {
            "name": "my-app",
            "version": "1.2.3",
            "type": "application"
        }
    },
    "components": [
        {"name": "express", "version": "4.18.2", "purl": "pkg:npm/express@4.18.2"},
        {"name": "lodash", "version": "4.17.21", "purl": "pkg:npm/lodash@4.17.21"},
        {"name": "postgres", "version": "16.1", "purl": "pkg:deb/debian/postgresql@16.1"}
    ]
}
\`\`\`

\`\`\`bash
# Generate SBOM with Syft
syft myapp:latest -o cyclonedx-json > sbom.json

# Scan SBOM for vulnerabilities with Grype
grype sbom:sbom.json

# Generate SBOM in CI and store it as a build artifact
# Upload to Dependency-Track or Guac for continuous monitoring
\`\`\`

---

## Sigstore — Keyless Signing

\`\`\`bash
# Sigstore: sign artifacts using OIDC identity (no GPG keys!)
# Fulcio: certificate authority issues short-lived code signing certs
# Rekor: transparency log records all signing events

# Sign a container image with Cosign:
cosign sign myrepo/myapp:latest

# This:
# 1. Gets your OIDC identity from GitHub/GitLab/Google (I am user@example.com)
# 2. Fulcio issues a cert binding your identity to a signing key
# 3. Signs the image digest
# 4. Records the signing event in Rekor (immutable transparency log)

# Verify the signature:
cosign verify myrepo/myapp:latest

# Verification output:
# Verification for index.docker.io/myrepo/myapp:latest --
# The following checks were performed on each of these signatures:
#   - The cosign claims were validated
#   - Existence of the claims in the transparency log was verified
#   - Any certificates were verified against the Fulcio roots.
#   - The identity (user@example.com) is authorized for this signing.

# Sign with keyless identity from GitHub Actions:
# GITHUB_ACTOR=deploy-bot → signed by deploy-bot
# Anyone can verify: "this image was built and signed by GitHub Actions"
\`\`\`

---

## SLSA — Supply Chain Levels

\`\`\`
SLSA 1: Build documented
  • Build steps are documented
  • Example: Dockerfile + README

SLSA 2: Signed + hosted build
  • Build runs on a hosted CI (GitHub Actions, GitLab CI)
  • Build artifacts are signed (Sigstore)
  • Example: GitHub Actions builds + cosign signs

SLSA 3: Hardened build
  • Build runs in an isolated environment (ephemeral runner)
  • Build is hermetic (no network access to arbitrary URLs)
  • Dependencies are verified
  • Example: hermetic build with dependency lockfiles, isolated runner

SLSA 4: Reproducible build
  • Same source + same build environment → same artifact
  • Two independent build systems produce identical output
  • Any discrepancy indicates tampering
  • Example: deterministic build, verified by two CI systems

# To reach SLSA 3:
# 1. Use GitHub Actions with id-token: write (OIDC-based)
# 2. Pin actions to SHA, not version tags
# 3. Generate SBOM + sign with cosign
# 4. Verify dependencies (lockfile + hash check)
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between SBOM, Sigstore, and SLSA?
   **A:** SBOM = what is in your software (dependency list). Sigstore = who built and signed it (identity + signature). SLSA = how trustworthy is the build process (maturity model). You need all three for comprehensive supply chain security.

2. **Q:** How does Sigstore's keyless signing work?
   **A:** Instead of managing GPG keys, Sigstore uses OIDC (OpenID Connect). Your CI system (GitHub Actions) requests an OIDC token proving its identity (repo, branch, workflow). Fulcio (Sigstore's CA) issues a short-lived code signing cert. Cosign signs the artifact. The cert + signature are recorded in Rekor's transparency log. Anyone can verify without prior trust setup.

3. **Q:** What is a "hermetic build" in SLSA context?
   **A:** A hermetic build has no network access except to explicitly allowed resources (with hashed content). All dependencies are pre-fetched and verified. This prevents: compromised package registries serving malware, build scripts downloading unauthorized code, and dependency confusion attacks. Hermetic builds produce deterministic artifacts.

4. **Q:** What is dependency confusion and how do you prevent it?
   **A:** Dependency confusion: an attacker publishes a public package with the same name as your internal private package. If your package manager is configured to prefer higher version numbers, it may download the attacker's malicious package. Prevention: use scoped packages (@myorg/internal-lib), verify package sources, use lockfiles, and configure package registries with priority rules.

5. **Q:** How do you verify a container image's provenance?
   **A:** 1) Verify the image signature (cosign verify). 2) Check the attestation (cosign verify-attestation — proves the build process). 3) Inspect the SBOM (grype, trivy — checks for known vulnerabilities). 4) Verify the SLSA provenance attestation (documents the build pipeline). All verifiable without trusting the image registry.

---

## Summary Cheat Sheet

\`\`\`
SBOM: list of all dependencies (CycloneDX, SPDX)
  Generate: syft, trivy image --format cyclonedx
  Scan: grype, trivy, snyk
  Monitor: Dependency-Track, Guac

Sigstore: keyless code signing
  cosign sign → Fulcio CA + Rekor transparency log
  cosign verify → verify identity + signature
  No GPG keys to manage!

SLSA: build integrity levels
  1: documented  2: signed hosted build
  3: hardened hermetic build  4: reproducible

Best Practices:
  • Generate SBOM in CI → upload to artifact store
  • Sign all images + attestations with cosign
  • Pin CI actions to SHA instead of version tags
  • Use lockfiles for all package managers
  • Verify dependencies before installing`,
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
            content: `## Why This Matters (Read This First)

Outdated dependencies accumulate security vulnerabilities. But updating dependencies manually is tedious and error-prone. Renovate automates the process: it scans your repo, detects outdated packages, and creates pull requests with updates.

Renovate handles grouping (related packages in one PR), scheduling (avoid Friday deploys), and security auto-merge (patch CVEs immediately).

---

## Renovate Configuration

\`\`\`json
// renovate.json
{
    "$schema": "https://docs.renovatebot.com/renovate-schema.json",
    "extends": [
        "config:recommended",
        "group:allNonMajor",        // Group all non-major updates
        ":separateMajorMinor"       // Separate PRs for major versions
    ],
    "schedule": ["before 9am on Monday"],  // Only create PRs on Monday
    "minimumReleaseAge": "3 days",          // Wait 3 days after release
    "labels": ["dependencies"],
    "packageRules": [
        {
            "description": "Group all AWS SDK updates",
            "matchPackagePrefixes": ["@aws-sdk/"],
            "groupName": "AWS SDK"
        },
        {
            "description": "Group all ESLint + Prettier updates",
            "matchPackageNames": ["eslint", "prettier", "@typescript-eslint/*"],
            "groupName": "Linting"
        },
        {
            "description": "Auto-merge patch updates",
            "matchUpdateTypes": ["patch"],
            "automerge": true,
            "automergeType": "pr",
            "platformAutomerge": true
        }
    ],
    "vulnerabilityAlerts": {
        "enabled": true,
        "labels": ["security"]
    }
}
\`\`\`

---

## Renovate in Practice

\`\`\`
Renovate workflow:

  1. Renovate bot scans your repo (on schedule or webhook)
  2. Detects outdated dependencies (package.json, Dockerfile, requirements.txt, etc.)
  3. Creates PRs with updates

  Example PR:
  ┌─────────────────────────────────────────────────┐
  │  renovate[bot] opened PR #123                   │
  │  Title: Update dependency express to 4.19.0      │
  │                                                   │
  │  Changes:                                         │
  │   package.json: "express": "4.18.2" → "4.19.0"  │
  │   package-lock.json: auto-updated                 │
  │                                                   │
  │  Release notes:                                   │
  │   https://github.com/expressjs/express/releases    │
  │                                                   │
  │  CI status: ✅ passed                             │
  │                                                   │
  │  Labels: dependencies, patch                       │
  │  Wait: minimumReleaseAge (2 days remaining)        │
  └─────────────────────────────────────────────────┘

  4. If automerge is enabled AND CI passes:
     Renovate merges the PR automatically
  5. If automerge is not enabled:
     Developer reviews and approves the PR
\`\`\`

---

## Advanced Config

\`\`\`jsonc
// Monorepo support (pnpm workspaces)
{
    "extends": ["config:recommended"],
    "enabledManagers": ["npm", "dockerfile", "github-actions"],
    "baseBranches": ["main", "next"],  // Update both branches

    // Lock file maintenance (keep lockfile fresh)
    "lockFileMaintenance": {
        "enabled": true,
        "schedule": ["before 9am on Monday"]
    },

    // Pin GitHub Actions to SHA (supply chain security)
    "pin": {
        "automerge": true,
        "matchManagers": ["github-actions"]
    },
    "pinDigests": true,

    // Range strategy
    "rangeStrategy": "bump",  // ^1.0.0 → ^1.1.0 (update range)

    // Branch naming
    "branchPrefix": "renovate/",

    // PR conventions
    "commitMessagePrefix": "chore(deps):",
    "prConcurrentLimit": 10,
    "prHourlyLimit": 2,
}
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between Renovate and Dependabot?
   **A:** Both create dependency update PRs. Renovate is more configurable (grouping, scheduling, regex matching, custom managers). Dependabot is simpler (fewer options) but GitHub-native. Renovate supports more ecosystems and has better monorepo support. Dependabot is great for simple projects; Renovate for complex setups.

2. **Q:** Why use minimumReleaseAge?
   **A:** Avoids rushing to update to a version that may be yanked (withdrawn due to bugs/security). Wait 3-7 days after release before creating a PR. If a critical bug is found in the new version, the yanked version is never proposed. Major types of packages may need longer wait.

3. **Q:** What is the purpose of grouping dependencies?
   **A:** Without grouping: each package gets its own PR — 20 PRs for 20 packages. With grouping: related packages (all AWS SDK, all ESLint) are in one PR — fewer CI runs, less review overhead, easier to manage. But large groups make rollback harder if one package in the group breaks something.

4. **Q:** How do you handle major version updates?
   **A:** Separately from minor/patch (separateMajorMinor: true). Major updates often have breaking changes — they need human review. Pin major versions in CI tests and schedule a dedicated upgrade effort. Use Renovate's "dependencyDashboardApproval" to require manual approval for major updates.

5. **Q:** How does Renovate handle security vulnerabilities?
   **A:** When GitHub/NPM/etc. reports a CVE, Renovate creates an urgent PR (even outside the schedule). If automerge is configured and CI passes, the security patch is merged automatically. This reduces the window between CVE disclosure and patch deployment from weeks to hours.

---

## Summary Cheat Sheet

\`\`\`
Renovate: automated dependency update PRs

Key Features:
  • Scheduling (avoid Friday deploys)
  • Grouping (related packages together)
  • Auto-merge (patch + security)
  • Minimum release age (avoid yanked versions)
  • Lockfile maintenance
  • Monorepo support
  • Regex-based custom managers
  • Presets (shareable config across org)

Config Best Practices:
  minimumReleaseAge: "3 days"
  schedule: "before 9am on Monday"
  automerge: true for patch and digest
  group: allNonMajor
  Separate major version PRs

Security:
  Auto-merge security patches
  Pin GitHub Actions to SHA
  Vulnerability alerts enabled`,
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
            content: `## Why This Matters (Read This First)

Backstage is Spotify's open-source developer portal. It provides a unified view of all your services (Catalog), project scaffolding (Templates), documentation (TechDocs), and operational data (Scorecards and Plugins).

Without Backstage: developers switch between 10+ tools (Grafana, PagerDuty, Datadog, Jenkins, ArgoCD, etc.) to understand and operate their services. With Backstage: one UI for everything.

---

## Software Catalog

\`\`\`yaml
# catalog-info.yaml — register a service in Backstage
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: order-service
  description: Order processing service
  annotations:
    backstage.io/techdocs-ref: dir:.           # Documentation in this repo
    github.com/project-slug: myorg/order-service
    pagerduty.com/service-id: PD12345           # Link to PagerDuty
    grafana/dashboard-selector: "order-*"       # Link to Grafana dashboards
    sonarqube.org/project-key: order-service    # Link to SonarQube
    backstage.io/kubernetes-id: order-service   # Link to K8s resources
spec:
  type: service
  lifecycle: production
  owner: team-payments
  system: payment-platform
  dependsOn:
    - component:payment-db
    - resource:payment-queue
  providesApis:
    - order-api
---
# Catalog entities:
# Component: service, library, website
# API: REST, gRPC, GraphQL specification
# Resource: infrastructure (DB, queue, bucket)
# System: group of components forming a bounded context
# Domain: group of systems aligned with business capability
\`\`\`

---

## Software Templates

\`\`\`yaml
# template.yaml — scaffold a new service
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: node-express-service
  title: Node.js Express Service
  description: Create a new Node.js Express microservice
spec:
  owner: platform-team
  type: service

  parameters:
    - title: Service Details
      required:
        - serviceName
        - owner
      properties:
        serviceName:
          title: Service Name
          type: string
          pattern: '^[a-z0-9-]+$'
        owner:
          title: Owner
          type: string
          ui:field: OwnerPicker
        enableDatabase:
          title: Include PostgreSQL Database?
          type: boolean
          default: false

  steps:
    - id: fetch-base
      name: Fetch Base Template
      action: fetch:template
      input:
        url: ./skeleton
        values:
          serviceName: ${{ parameters.serviceName }}
          owner: ${{ parameters.owner }}

    - id: create-repo
      name: Create Repository
      action: publish:github
      input:
        repoUrl: github.com?repo=${{ parameters.serviceName }}
        defaultBranch: main

    - id: register-catalog
      name: Register in Catalog
      action: catalog:register
      input:
        repoContentsUrl: ${{ steps['create-repo'].output.repoContentsUrl }}
        catalogInfoPath: /catalog-info.yaml

  output:
    links:
      - title: Repository
        url: ${{ steps['create-repo'].output.remoteUrl }}
      - title: Open in Catalog
        icon: catalog
        entityRef: ${{ steps['register-catalog'].output.entityRef }}
---
# Result: developer clicks "Create" → fills form →
# new service with CI/CD, linting, deployments, docs
# Golden path: opinionated, production-ready defaults
\`\`\`

---

## TechDocs — Documentation as Code

\`\`\`markdown
# docs/index.md — documentation lives in the repo

# Order Service

## Overview
The Order Service processes customer orders...

## API
See [OpenAPI spec](./openapi.yaml)

## Running Locally
\`\`\`bash
docker compose up
\`\`\`

## Deployment
Deployed via ArgoCD to production cluster.

## Monitoring
- [Grafana Dashboard](https://grafana.example.com/d/orders)
- [PagerDuty](https://myorg.pagerduty.com/services/PD12345)

---
# TechDocs features:
# • Renders markdown from the repo
# • Search across all service docs
# • Versioned (one doc version per service version)
# • Backstage UI shows documentation alongside catalog info
\`\`\`

---

## Practice Questions

1. **Q:** What is the main benefit of Backstage's Software Catalog?
   **A:** Single source of truth for all services. Instead of asking "who owns this service?" or "where is this service's documentation?", the catalog answers these questions immediately. Catalog metadata (owner, SLA, dependencies) is defined in code (catalog-info.yaml) and tracked in git.

2. **Q:** What are Software Templates and why are they important?
   **A:** Templates scaffold new projects with pre-configured CI/CD, linting, deployments, and documentation. They enforce organizational standards (golden paths) from day one. Developers get a production-ready setup without manually configuring each tool. Templates reduce the cognitive load of starting a new service.

3. **Q:** How does Backstage integrate with other tools?
   **A:** Via plugins — React components that embed data from other tools. Backstage has 150+ open source plugins for: Datadog (show dashboards), PagerDuty (show on-call status), Grafana (embed dashboards), ArgoCD (show deployment status), AWS (show resource details), Kubernetes (show pod status), and many more.

4. **Q:** What are scorecards in Backstage?
   **A:** Scorecards define standards (test coverage >80%, SLO attainment >99.9%, dependencies up to date, security scan clean) and measure each service against them. Scorecards are shown in the service catalog entry. They gamify operational excellence and help teams identify gaps without manual audits.

5. **Q:** What is the recommended adoption path for Backstage?
   **A:** 1) Deploy Backstage and register existing services in the Catalog. 2) Create Software Templates for new services. 3) Enable TechDocs and migrate documentation to repos. 4) Add plugins for existing tools (Grafana, PagerDuty, etc.). 5) Define Scorecards and measure standards. Do NOT try to build everything at once.

---

## Summary Cheat Sheet

\`\`\`
Backstage Core Features:
  Software Catalog: service registry with metadata
  Software Templates: golden path scaffolding
  TechDocs: documentation-as-code (markdown in repo)
  Plugins: Grafana, PagerDuty, ArgoCD, Datadog, 150+
  Scorecards: measure operational standards

Catalog Entities:
  Component: service/library/website
  API: API specification
  Resource: DB, queue, bucket
  System: group of components
  Domain: group of systems

Adoption Path:
  Catalog → Templates → TechDocs → Plugins → Scorecards

Key Benefits:
  One UI for all tooling
  Reduced cognitive load
  Enforced golden paths
  Service discoverability
  Ownership clarity`,
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
            content: `## Why This Matters (Read This First)

Platform engineering is about reducing cognitive load for developers. Every infrastructure decision (which DB, how to deploy, how to configure CI/CD) adds mental overhead. An Internal Developer Platform (IDP) provides paved paths for common tasks so developers can focus on business logic.

The goal is NOT to build a perfect platform. The goal is to reduce friction and accelerate delivery.

---

## Golden Paths

\`\`\`
Golden Path: the recommended, opinionated way to do common tasks.

  Without Golden Paths:
    ┌─────────────────────────────────────────────────┐
    │ Developer asks: "How do I add a database?"        │
    │                                                   │
    │ Options:                                           │
    │ • Ask on Slack → wait for answer                  │
    │ • Read 5 different wiki pages (outdated)          │
    │ • Look at 3 other services (all different)        │
    │ • Copy-paste config from an old service (wrong)   │
    │ • Give up and use a different tech (shadow IT)    │
    └─────────────────────────────────────────────────┘

  With Golden Paths:
    ┌─────────────────────────────────────────────────┐
    │ Developer asks: "How do I add a database?"        │
    │                                                   │
    │ Answer:                                            │
    │ 1. Run: idp add-database --name orders             │
    │ 2. Backstage template creates:                     │
    │    • RDS instance in staging                      │
    │    • IAM role for the service                     │
    │    • Connection secret in Secrets Manager         │
    │    • Read replica for production                  │
    │    • Backup schedule                              │
    │    • Monitoring dashboard                         │
    │    • Runbook for connection issues                │
    │ 3. Done in 10 minutes (no ticket, no Slack)       │
    └─────────────────────────────────────────────────┘
\`\`\`

Key principle: the golden path handles 80% of use cases. For the other 20%, developers can deviate — but they must understand the tradeoffs and maintain the custom setup themselves.

---

## IDP Architecture

\`\`\`
┌─────────────────────────────────────────────────────┐
│  Developer Self-Service Interface                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Backstage   │  │ CLI (idp)   │  │ API          │  │
│  │ Portal      │  │             │  │ (REST/gRPC)  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│  Orchestration Layer                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Terraform   │  │ Crossplane  │  │ Kubernetes  │  │
│  │ (IaC)       │  │ (K8s CRDs)  │  │ (operators) │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│  Infrastructure (Cloud APIs, K8s, Databases, etc.)    │
└─────────────────────────────────────────────────────┘
\`\`\`

---

## Cognitive Load Types

\`\`\`
IDP success = reducing these three types of cognitive load:

1. Intrinsic (domain complexity):
   • Business logic of the application
   • The IDP should NOT increase this

2. Extraneous (unnecessary complexity):
   • "Which port does Prometheus scrape? How do I add labels?"
   • IDP should REMOVE this (paved paths handle it)

3. Germane (learning):
   • New patterns, tools, practices
   • IDP should make this EASIER (templates, docs, examples)

Example: deploying a service
  Without IDP:                          With IDP:
  • Install kubectl                     • git push (CI/CD is automatic)
  • Learn K8s Deployments               • Golden path handles it
  • Configure 10 YAML files             • Just merge to main
  • Set up monitoring (Grafana/Prom)    • Monitoring is pre-configured
  • Configure alerts                    • Alerts have sensible defaults
  • Write runbook                       • Runbook template provided
  → Cognitive load: HIGH                → Cognitive load: LOW
\`\`\`

---

## Practice Questions

1. **Q:** What is the difference between a platform and a portal?
   **A:** A platform is the underlying infrastructure and APIs (Terraform modules, K8s operators, CI/CD pipelines). A portal (Backstage) is the UI that developers use to interact with the platform. Build the platform first (APIs and automation), then build the portal. A portal without a platform is just a pretty frontend with nothing behind it.

2. **Q:** What is the "paved road" principle in platform engineering?
   **A:** Make the right thing easy. The golden path should be the path of least resistance. If a developer needs to do something common (add a DB, deploy a service), the platform should make it easier to use the golden path than to do it manually. If the golden path is harder, developers will bypass it.

3. **Q:** How do you measure the success of an IDP?
   **A:** Developer satisfaction (survey using SPACE framework), lead time for new services (commit to production), time to provision infrastructure, number of tickets to the platform team, adoption rate of golden paths (are developers using them?), and platform team's ability to deliver new capabilities.

4. **Q:** What is the "team topologies" approach to platform teams?
   **A:** Platform team is an "enabling team" — they build tools and capabilities for stream-aligned teams. The platform team does NOT gatekeep or require tickets for every change. They provide self-service capabilities and treat the platform as a product. The platform team measures success by how well stream-aligned teams can deliver independently.

5. **Q:** What are common pitfalls when building an IDP?
   **A:** 1) Building the portal before having APIs. 2) Over-engineering for edge cases (golden path handles 80%). 3) Making the platform mandatory (developers should be able to deviate). 4) Not treating the platform as a product (no user research, no feedback loops). 5) Platform team becoming a bottleneck (ticket-based access). 6) Not measuring developer satisfaction.

---

## Summary Cheat Sheet

\`\`\`
IDP Goal: reduce cognitive load — let devs focus on business logic

Golden Paths: paved, opinionated, handles 80% of use cases
  Make the right thing easy
  Deviation allowed but owned by the dev team

Architecture:
  Interface: Portal (Backstage), CLI, API
  Orchestration: Terraform, Crossplane, K8s operators
  Infrastructure: cloud APIs, K8s, databases

Cognitive Load:
  Intrinsic: business logic (keep)
  Extraneous: unnecessary complexity (remove)
  Germane: learning (make easier)

Success Metrics:
  Developer satisfaction (SPACE survey)
  Lead time for new services
  Golden path adoption rate
  Platform team ticket volume

Pitfalls:
  Portal before APIs
  Over-engineering
  Mandatory platform (no deviation)
  Ticket-based access`,
            tags: ["Platform", "Developer Experience", "Architecture"],
          },
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
