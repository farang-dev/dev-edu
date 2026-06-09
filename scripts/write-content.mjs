import fs from "fs";

const srcPath = "src/data/curriculum.ts";
let src = fs.readFileSync(srcPath, "utf8");

function setContent(id, newContent) {
  const idRegex = new RegExp('id: "' + id + '"');
  const idMatch = idRegex.exec(src);
  if (!idMatch) { console.error("Not found:", id); return false; }
  const topicStart = idMatch.index;
  const fromContent = src.indexOf("content:", topicStart);
  if (fromContent === -1) { console.error("No content for:", id); return false; }

  let qPos = fromContent + 8;
  while (qPos < src.length && src[qPos] === " ") qPos++;
  const quoteChar = src[qPos];
  const contentValStart = qPos + 1;

  if (quoteChar === "`") {
    let depth = 1, i = contentValStart;
    while (i < src.length && depth > 0) {
      if (src[i] === "\\" && src[i+1]) { i += 2; continue; }
      if (src[i] === "`") depth--;
      if (depth > 0) i++;
    }
    const contentValEnd = i;
    const before = src.slice(0, fromContent);
    const after = src.slice(contentValEnd + 1);
    src = before + "content: `" + newContent.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${") + "`" + after;
  } else if (quoteChar === '"') {
    let i = contentValStart;
    while (i < src.length) {
      if (src[i] === "\\" && src[i+1]) { i += 2; continue; }
      if (src[i] === '"') break;
      i++;
    }
    const contentValEnd = i;
    const before = src.slice(0, fromContent);
    const after = src.slice(contentValEnd + 1);
    src = before + "content: `" + newContent.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${") + "`" + after;
  } else {
    console.error("Bad quote char:", JSON.stringify(quoteChar), "for", id);
    return false;
  }
  console.log("Updated:", id);
  return true;
}

const NL = "\n";
function md(lines) {
  return lines.join(NL);
}

// fe-crp
setContent("fe-crp", md([
  "## Overview",
  "",
  "Every time a user navigates to a web page, the browser must convert raw bytes into visible pixels through a sequence of steps known as the **Critical Rendering Path (CRP)**. Understanding this pipeline is essential because nearly every frontend performance optimization reduces to shortening or skipping one of these steps.",
  "",
  "## Step 1: DOM Construction",
  "",
  "The browser's HTML parser tokenizes bytes into tags, attributes, and text content, then assembles the **Document Object Model (DOM)**.",
  "",
  "- The parser builds the DOM **incrementally** as data arrives",
  "- Scripts without `async`/`defer` **block parsing** — this makes script placement one of the most impactful performance decisions",
  "",
  "> **Rule:** Place `<script>` tags at the bottom of `<body>` or use `async`/`defer`. Preload critical CSS in `<head>`.",
  "",
  "## Step 2: CSSOM Construction",
  "",
  "The CSSOM mirrors the cascade. **CSSOM is render-blocking** — the browser will not render until it is built. Use `media` attributes to defer non-critical stylesheets.",
  "",
  "## Step 3: Render Tree",
  "",
  "DOM + CSSOM combined. Includes every visible node (excludes `display: none`).",
  "",
  "## Step 4: Layout (Reflow)",
  "",
  "Geometry computation for every node. **Layout thrashing** occurs when reads and writes interleave:",
  "",
  "```javascript",
  "// BAD: forces reflow on every iteration",
  'elements.forEach(el => {',
  '  const h = el.offsetHeight;  // READ',
  '  el.style.height = (h + 10) + "px"; // WRITE',
  '});',
  '',
  '// GOOD: batch reads, then batch writes',
  'const heights = elements.map(el => el.offsetHeight);',
  'elements.forEach((el, i) => {',
  '  el.style.height = (heights[i] + 10) + "px";',
  '});',
  '```',
  '',
  '## Step 5: Paint & Composite',
  '',
  'Paint generates GPU draw commands. Composite blends layers on the GPU. Changing `transform` or `opacity` triggers **only compositing** — no layout or paint.',
  '',
  '| Step | Cost | Triggers |',
  '|------|------|----------|',
  '| DOM | Medium | HTML changes |',
  '| CSSOM | Medium | Stylesheet changes |',
  '| Render Tree | Low | Visibility changes |',
  '| Layout | **High** | Size/position changes |',
  '| Paint | Medium | Visual property changes |',
  '| Composite | Low | transform/opacity changes |',
]));

// fe-v8
setContent("fe-v8", md([
  "## Overview",
  "",
  "V8 is Google's open-source JavaScript engine powering Chrome, Node.js, Deno, and Edge (via Blink). It uses a **tiered architecture** balancing fast startup with peak throughput.",
  "",
  "## Ignition: Baseline Interpreter",
  "",
  "Source code \u2192 Parser \u2192 AST \u2192 **Ignition bytecode**",
  "- The **preparser** skips functions that are only declared but not executed",
  "- Most code runs fine at the bytecode level",
  "",
  "> **Pattern:** Wrap module-level work inside functions \u2014 V8 can skip parsing them during startup.",
  "",
  "## TurboFan: Optimizing JIT Compiler",
  "",
  "As functions execute, V8 collects **type feedback**. When a function becomes hot, TurboFan speculates on types and generates optimized machine code.",
  "- **Deoptimization**: if types mismatch, execution falls back to bytecode",
  "- Consistent types in hot paths are critical for performance",
  "",
  "## Hidden Classes & Inline Caches",
  "",
  "Objects use hidden classes (Shapes). Properties become fixed-offset loads instead of dictionary lookups.",
  "- Adding properties **out of order** or **deleting** them forces slow dictionary mode",
  "- **ICs**: Monomorphic (<2 shapes) \u2192 Polymorphic (2-4) \u2192 Megamorphic (4+) \u2192 slow lookup",
  "",
  "## Generational GC",
  "",
  "| Generation | Algorithm |",
  "|------------|-----------|",
  "| Young (Nursery) | Scavenger \u2014 fast copying collector |",
  "| Old | Mark-Sweep-Compact \u2014 concurrent marking |",
  "",
  "> **Watch out:** Long-lived closure references prevent GC of captured variables \u2014 common Node.js memory leak source.",
  "",
  "### Key Takeaways",
  "- Use consistent types in hot functions for better JIT optimization",
  "- Avoid dynamic property additions that force dictionary mode",
  "- Be mindful of closure memory retention in long-lived processes",
]));

// fe-event-loop
setContent("fe-event-loop", md([
  "## Overview",
  "",
  "The **event loop** is JavaScript's execution model for async processing with a single thread.",
  "",
  "## The Call Stack",
  "",
  "A LIFO structure for tracking execution contexts. The runtime cannot process events, paint, or fire timers while the stack is non-empty.",
  "",
  "## Task Queues",
  "",
  "**Macrotasks** (one per loop): `setTimeout`, `setInterval`, I/O events, HTML parsing",
  "",
  "**Microtasks** (drained entirely before next macrotask): `Promise.then`, `queueMicrotask`, `MutationObserver`",
  "",
  '```javascript',
  'console.log("1 - sync");',
  'setTimeout(() => console.log("4 - macrotask"), 0);',
  'Promise.resolve().then(() => console.log("3 - microtask"));',
  'console.log("2 - sync");',
  '// Output: 1, 2, 3, 4',
  '```',
  "",
  "## Execution Order",
  "",
  "> Macrotask \u2192 Microtasks (all) \u2192 rAF \u2192 Style \u2192 Layout \u2192 Paint \u2192 Composite",
  "",
  "Recursive `Promise.resolve().then(...)` can **starve the event loop**. Use `setTimeout` to yield to rendering.",
  "",
  "> **Key insight:** `requestAnimationFrame` is synchronized with paint. Use it for visual updates, not `setTimeout`.",
]));

// fe-browser-security
setContent("fe-browser-security", md([
  "## Overview",
  "",
  "The browser security model uses layered mechanisms to isolate websites from each other.",
  "",
  "## Same-Origin Policy (SOP)",
  "",
  "Origin = **scheme + host + port**. Documents from origin A cannot read resources from origin B. SOP does not prevent writes.",
  "",
  "## CORS",
  "",
  "| Header | Purpose |",
  '|--------|---------|',
  "| `Access-Control-Allow-Origin` | Which origins can read the response |",
  "| `Access-Control-Allow-Methods` | Allowed HTTP methods |",
  "| `Access-Control-Allow-Headers` | Allowed request headers |",
  "",
  '> **Misconfiguration:** Reflecting `Origin` back in ACAO allows any origin.',
  "",
  "## CSP (Content Security Policy)",
  "",
  "Declares a whitelist of allowed resource sources. Avoid `'unsafe-inline'` \u2014 use nonces or hashes. Enable CSP reporting.",
  "",
  "## Common Vulnerabilities",
  "",
  "| Attack | Prevention |",
  '|--------|------------|',
  "| XSS | Output encoding + CSP |",
  "| CSRF | `SameSite=Strict` + CSRF tokens |",
  "| Clickjacking | `X-Frame-Options: DENY` |",
]));

// fe-wasm
setContent("fe-wasm", md([
  "## Overview",
  "",
  "**WebAssembly (Wasm)** is a binary instruction format for portable compilation targets (C, C++, Rust, Go). Runs in a sandboxed VM achieving near-native speed.",
  "",
  "## Architecture",
  "",
  "Wasm module contains: typed functions, **linear memory** (contiguous byte array), function table, globals.",
  "",
  '```javascript',
  'const { instance } = await WebAssembly.instantiateStreaming(',
  '  fetch("module.wasm")',
  ');',
  'instance.exports.myFunction();',
  '```',
  "",
  "Linear memory: manual allocation (no GC), shared via ArrayBuffer with JS.",
  "",
  "## Use Cases",
  "",
  "| Domain | Examples |",
  '|--------|---------|',
  "| Compute-heavy | Video encoding, crypto |",
  "| Game engines | Unity, Unreal Engine |",
  "| Edge computing | Cloudflare Workers |",
  "| Plugin systems | Envoy, Istio (WASI) |",
  "",
  "## WASI",
  "",
  "POSIX-like API for Wasm outside the browser. Runtimes: Wasmtime, Wasmer.",
  "",
  "> **Value:** Compile once, run anywhere \u2014 browser, server, edge, embedded \u2014 with strong sandbox guarantees.",
]));

// ─────────────────────────────────────────────────────────────
// FE-JAVASCRIPT module
// ─────────────────────────────────────────────────────────────

// fe-closures
setContent("fe-closures", md([
  "## Overview",
  "",
  "JavaScript uses **lexical (static) scoping**: variable visibility is determined by where the code is written, not where it is called from.",
  "",
  "## Execution Context & Lexical Environment",
  "",
  "Every function invocation creates an **Execution Context** containing a **Lexical Environment** (variable-to-value mapping) plus a reference to the outer environment and the `this` binding.",
  "",
  "## Scope Chain",
  "",
  "Variable resolution walks the chain of nested environments until it reaches the global scope. If not found, a `ReferenceError` is thrown.",
  "",
  "## Closures",
  "",
  'A **closure** is a function that captures its defining lexical environment, persisting even after the outer function returns:',
  "",
  '```javascript',
  'function makeCounter() {',
  '  let count = 0;',
  '  return {',
  '    increment: () => ++count,',
  '    value: () => count,',
  '  };',
  '}',
  '',
  'const c = makeCounter();',
  'c.increment(); c.increment();',
  'console.log(c.value()); // 2',
  "// The 'count' variable is retained because the closures reference it",
  '```',
  "",
  "## Memory Implications",
  "",
  "Variables captured by a closure remain in memory as long as the closure is reachable. This is a common source of memory leaks \u2014 event listeners referencing large data structures prevent GC.",
  "",
  "Modern engines optimize: if a captured variable is never accessed, the engine may avoid retaining it. However, explicit nullification of large objects at end of lifecycle is the safest practice.",
]));

// fe-prototypes
setContent("fe-prototypes", md([
  "## Overview",
  "",
  "Unlike classical inheritance (Java, C++, Python), JavaScript uses **prototypal inheritance**: objects inherit directly from other objects.",
  "",
  "## The Prototype Chain",
  "",
  "Every object has an internal `[[Prototype]]` slot. Property lookup checks own properties first, then walks the chain:",
  "",
  '- `Object.getPrototypeOf(obj)` to access the prototype',
  '- Walking continues until `[[Prototype]]` is `null` (returns `undefined`)',
  '',
  '## `class` Is Syntactic Sugar',
  '',
  'The `class` keyword creates a constructor function and sets its `.prototype` property. `extends` chains prototypes: `B.prototype.[[Prototype]]` points to `A.prototype`.',
  '',
  '## `Object.create(proto)`',
  '',
  'Creates a new object with the given prototype. More explicit than constructor functions:',
  '',
  '```javascript',
  'const animal = { speak() { console.log(this.sound); } };',
  'const dog = Object.create(animal);',
  "dog.sound = 'woof';",
  'dog.speak(); // woof',
  '```',
  '',
  '## Performance',
  '',
  'Deep prototype chains add lookup cost. V8\'s Inline Caches optimize repeated accesses on the same shape, but deep chains increase cache miss likelihood. Minimize chain depth in hot paths.',
]));

// fe-async
setContent("fe-async", md([
  "## Overview",
  "",
  "JavaScript's async evolution: Callbacks \u2192 Promises \u2192 async/await.",
  "",
  "## Callbacks",
  "",
  'The original async pattern. Leads to "callback hell" with deep nesting and error handling complexity.',
  "",
  "## Promises",
  "",
  "Represent an eventual value. States: pending \u2192 fulfilled | rejected (one-way transitions).",
  "",
  "- `.then()` chains return new Promises \u2014 enables flat chaining",
  "- `.catch()` catches rejections in the chain",
  "- `.finally()` runs regardless of outcome",
  "",
  "## async/await",
  "",
  "Syntactic sugar over Promises:",
  "",
  '```javascript',
  'async function fetchUser(id) {',
  '  try {',
  '    const res = await fetch(`/api/users/${id}`);',
  '    return await res.json();',
  '  } catch (err) {',
  '    console.error("Failed:", err);',
  '    throw err;',
  '  }',
  '}',
  '```',
  "",
  "- `await` suspends the function (not the thread)",
  "- `try/catch` works naturally with await",
  "- Unhandled rejections cause global warnings",
  "",
  "## Concurrent Patterns",
  "",
  '| Method | Behavior |',
  '|--------|----------|',
  '| `Promise.all` | Rejects fast — fails on first rejection |',
  '| `Promise.allSettled` | Waits for all — never rejects |',
  '| `Promise.race` | Resolves/rejects with the first settled |',
  '| `Promise.any` | Resolves with first fulfillment |',
]));

// fe-modules
setContent("fe-modules", md([
  "## Overview",
  "",
  "JavaScript has two module systems: **CommonJS** (Node.js, `require`) and **ES Modules** (ESM, `import`/`export`).",
  "",
  "## CommonJS (CJS)",
  "",
  "- `require()` is **synchronous**, evaluated at runtime",
  "- Exports are plain objects (`module.exports`)",
  "- Used by Node.js (default before ESM support)",
  "",
  "## ES Modules (ESM)",
  "",
  "- `import`/`export` are **static** \u2014 resolved at parse time, not runtime",
  "- **Live bindings**: exports are live references \u2014 mutating the export updates all importers",
  "- **Tree-shaking**: only possible with ESM because static analysis determines unused exports",
  "",
  "## Interoperability",
  "",
  'Mixing CJS and ESM requires special handling:',
  "- ESM can `import` CJS modules (default import only)",
  "- CJS cannot `require` ESM modules",
  "- Bundlers (Webpack, Rollup, Vite) handle interop automatically",
  "",
  '```javascript',
  '// ESM — static, tree-shakeable',
  'export const sum = (a, b) => a + b;',
  '',
  '// CJS — dynamic, not tree-shakeable',
  'module.exports = { sum: (a, b) => a + b };',
  '```',
  '',
  '> **Key insight:** ESM\'s static structure enables optimizations (tree-shaking, scope hoisting) that CJS cannot achieve.',
]));

fs.writeFileSync(srcPath, src, "utf8");
console.log("All done!");
