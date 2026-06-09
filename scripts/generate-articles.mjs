#!/usr/bin/env node
/**
 * generate-articles.mjs
 *
 * Reads curriculum.ts, finds all placeholder topics (content: "// Content coming soon"),
 * and generates full articles for each using OpenAI API.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-articles.mjs
 *
 * Environment variables:
 *   OPENAI_API_KEY  (required) — OpenAI API key
 *   AI_MODEL        (optional) — model name, default: gpt-4o-mini
 *   BATCH_SIZE      (optional) — articles per run, default: 5 (use 0 for all)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_PATH = path.resolve(__dirname, "../src/data/curriculum.ts");

const API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "0", 10);

if (!API_KEY) {
  console.error("❌ OPENAI_API_KEY is required");
  console.error("   Usage: OPENAI_API_KEY=sk-... node scripts/generate-articles.mjs");
  process.exit(1);
}

// ─── Reference article IDs (fully written, used as style examples) ──────────
const REFERENCE_IDS = ["fe-crp", "fe-v8", "fe-event-loop"];

// ─── Utility: set content for a topic ID (adapted from fix-content.mjs) ─────
function replaceTopicContent(src, id, newContent) {
  const idRegex = new RegExp('id: "' + id + '"');
  const idMatch = idRegex.exec(src);
  if (!idMatch) { console.error("  Not found:", id); return null; }

  const topicStart = idMatch.index;
  const fromContent = src.indexOf("content:", topicStart);
  if (fromContent === -1) { console.error("  No content field for:", id); return null; }

  let qPos = fromContent + 8;
  while (qPos < src.length && src[qPos] === " ") qPos++;
  const restAfterContent = src.slice(qPos + 1);

  const fieldPatterns = [
    ',\n            codeExample:',
    ',\n            tags:',
    ',\n            keyPoints:',
  ];
  let earliestPos = -1;
  for (const fp of fieldPatterns) {
    const pos = restAfterContent.indexOf(fp);
    if (pos !== -1 && (earliestPos === -1 || pos < earliestPos)) {
      earliestPos = pos;
    }
  }
  if (earliestPos === -1) {
    console.error("  Cannot find next field boundary for:", id);
    return null;
  }

  const contentFieldEnd = qPos + 1 + earliestPos;
  const before = src.slice(0, fromContent);
  const after = src.slice(contentFieldEnd);
  const escaped = newContent
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\${/g, "\\${");
  return before + "content: `" + escaped + "`" + after;
}

// ─── Extract topic by ID ────────────────────────────────────────────────────
function extractTopic(src, id) {
  const idRegex = new RegExp('id: "' + id + '"');
  const idMatch = idRegex.exec(src);
  if (!idMatch) return null;

  const start = src.lastIndexOf("{", idMatch.index);
  // Find the closing "}," — count braces
  let depth = 0;
  let end = start;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  const block = src.slice(start, end);

  // Extract fields via simple regex
  const title = (block.match(/title: "([^"]+)"/) || [])[1] || id;
  const shortDesc = (block.match(/shortDesc: "([^"]+)"/) || [])[1] || "";
  const difficulty = (block.match(/difficulty: "([^"]+)"/) || [])[1] || "intermediate";
  const readTimeMin = parseInt((block.match(/readTimeMin: (\d+)/) || [])[1] || "8", 10);

  const keyPointsMatch = block.match(/keyPoints: \[([\s\S]*?)\],/);
  const keyPoints = keyPointsMatch
    ? [...keyPointsMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1])
    : [];

  const tagsMatch = block.match(/tags: \[([\s\S]*?)\]/);
  const tags = tagsMatch
    ? [...tagsMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1])
    : [];

  return { id, title, shortDesc, difficulty, readTimeMin, keyPoints, tags, block };
}

// ─── Extract FULL content for a reference article ───────────────────────────
function extractFullContent(src, id) {
  const idRegex = new RegExp('id: "' + id + '"');
  const idMatch = idRegex.exec(src);
  if (!idMatch) return null;

  const topicStart = idMatch.index;
  const fromContent = src.indexOf("content:", topicStart);
  if (fromContent === -1) return null;

  let qPos = fromContent + 8;
  while (qPos < src.length && src[qPos] === " ") qPos++;
  const quoteChar = src[qPos];
  if (quoteChar !== "`") return null;

  const contentValStart = qPos + 1;
  let depth = 1;
  let i = contentValStart;
  while (i < src.length && depth > 0) {
    if (src[i] === "\\" && src[i + 1]) { i += 2; continue; }
    if (src[i] === "`") depth--;
    if (depth > 0) i++;
  }
  const contentRaw = src.slice(contentValStart, i);

  // Unescape: replace \` with ` and \\ with \ but only for the template literal
  // The raw content has `\`` for backticks inside the template literal
  return contentRaw
    .replace(/\\`/g, "`")
    .replace(/\\\$/g, "$");
}

// ─── OpenAI API call ────────────────────────────────────────────────────────
async function callAI(systemPrompt, userPrompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── Build prompt for article generation ────────────────────────────────────
function buildPrompt(topic, referenceArticles) {
  const systemPrompt = `You are a senior engineer and technical writer creating educational content for "Dev-Edu", a developer education platform. Your audience is coding bootcamp graduates and junior developers who want to deeply understand how technology works — not just how to use it.

Write in a clear, direct, practical style. Follow these structural requirements exactly:

1. Start with "## Why This Matters (Read This First)" — a relatable analogy or real-world scenario that hooks the reader and explains why this topic is valuable
2. Use ## and ### section headers to organize content
3. Include code examples with language annotations (\`\`\`javascript, \`\`\`python, etc.) where relevant
4. Use tables (| col1 | col2 |) for comparisons
5. Use ASCII diagrams where helpful
6. End with "## Practice Questions" — exactly 5 questions in this format:
   1. **Q:** ... **A:** ...
   2. **Q:** ... **A:** ...
7. End with "## Summary Cheat Sheet" in a code block (\`\`\`)
8. Write in English
9. Do NOT use emojis
10. Do NOT add comments in code examples unless essential
11. For "foundational" difficulty: explain every term on first use, use simple analogies
12. For "intermediate": assume basic familiarity, focus on practical patterns and trade-offs
13. For "advanced": assume strong fundamentals, focus on internals, edge cases, and production implications`;

  const userPrompt = `Write a full educational article for the following topic. Match the style and depth shown in the reference articles below.

---

## Topic Metadata

- **ID:** ${topic.id}
- **Title:** ${topic.title}
- **Short Description:** ${topic.shortDesc}
- **Difficulty:** ${topic.difficulty}
- **Estimated Read Time:** ${topic.readTimeMin} minutes
- **Key Points to Cover:**
${topic.keyPoints.map(kp => `  - ${kp}`).join("\n")}
- **Tags:** ${topic.tags.join(", ")}

---

## Reference Article 1: Critical Rendering Path

${referenceArticles[0]}

---

## Reference Article 2: V8 Engine

${referenceArticles[1]}

---

## Reference Article 3: Event Loop, Tasks & Microtasks

${referenceArticles[2]}

---

Generate the full article now. Remember: start with "## Why This Matters (Read This First)" and end with "## Practice Questions" and "## Summary Cheat Sheet".`;

  return { systemPrompt, userPrompt };
}

// ─── Sleep helper ───────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("📖 Reading curriculum.ts...");
  let src = fs.readFileSync(SRC_PATH, "utf-8");
  const originalSrc = src;

  // Extract reference articles
  console.log("📚 Loading reference articles...");
  const referenceArticles = [];
  for (const refId of REFERENCE_IDS) {
    const content = extractFullContent(src, refId);
    if (content) {
      referenceArticles.push(content);
      console.log(`  ✓ Loaded: ${refId} (${content.length} chars)`);
    } else {
      console.error(`  ✗ Failed to load reference: ${refId}`);
    }
  }

  if (referenceArticles.length < 3) {
    console.error("❌ Need all 3 reference articles to proceed");
    process.exit(1);
  }

  // Find all placeholder topics
  const placeholderRegex = /content: "\/\/ Content coming soon"/g;
  const matches = [];
  let m;
  while ((m = placeholderRegex.exec(src)) !== null) {
    matches.push(m.index);
  }

  console.log(`\n🔍 Found ${matches.length} topics with placeholder content`);

  // Extract topic metadata for each placeholder
  const topics = [];
  for (const idx of matches) {
    // Scan backwards from placeholder to find the opening { of the topic block
    let depth = 0;
    let blockStart = idx;
    for (let i = idx; i >= 0; i--) {
      if (src[i] === "}") depth++;
      else if (src[i] === "{") {
        if (depth === 0) { blockStart = i; break; }
        depth--;
      }
    }
    const block = src.slice(blockStart, idx);
    const idMatch = block.match(/id: "([^"]+)"/);
    if (!idMatch) continue;

    const id = idMatch[1];
    const topic = extractTopic(src, id);
    if (topic) topics.push(topic);
  }

  // Deduplicate (shouldn't happen but just in case)
  const seen = new Set();
  const uniqueTopics = topics.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  console.log(`📋 Found ${uniqueTopics.length} unique topics needing articles\n`);

  if (uniqueTopics.length === 0) {
    console.log("✅ All topics already have content!");
    return;
  }

  // Determine batch
  const batch = BATCH_SIZE > 0
    ? uniqueTopics.slice(0, BATCH_SIZE)
    : uniqueTopics;

  console.log(`🎯 Generating ${batch.length} article(s)...\n`);

  let updatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < batch.length; i++) {
    const topic = batch[i];
    console.log(`[${i + 1}/${batch.length}] ${topic.id} — ${topic.title}`);

    try {
      const { systemPrompt, userPrompt } = buildPrompt(topic, referenceArticles);
      const generated = await callAI(systemPrompt, userPrompt);

      // Replace in file
      const newSrc = replaceTopicContent(src, topic.id, generated);
      if (newSrc) {
        src = newSrc;
        // Write after every successful generation for safety
        fs.writeFileSync(SRC_PATH, src, "utf-8");
        updatedCount++;
        console.log(`  ✓ Done (${generated.length} chars)`);
      } else {
        errorCount++;
        console.error(`  ✗ Failed to replace content`);
      }
    } catch (err) {
      errorCount++;
      console.error(`  ✗ Error: ${err.message}`);
    }

    // Delay between API calls to avoid rate limits
    if (i < batch.length - 1) {
      const delay = 2000 + Math.random() * 1000;
      await sleep(delay);
    }
  }

  console.log(`\n✅ Done! Generated: ${updatedCount}, Errors: ${errorCount}`);
  if (updatedCount > 0) {
    console.log(`📝 Updated file: ${SRC_PATH}`);
  }

  // Report remaining
  const remaining = uniqueTopics.length - updatedCount;
  if (remaining > 0) {
    console.log(`\n⏳ ${remaining} topic(s) remaining for next run.`);
  }
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
