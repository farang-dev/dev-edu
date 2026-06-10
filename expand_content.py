#!/usr/bin/env python3
"""
Expand backend topic content in curriculum.ts.
Usage: python3 expand_content.py <json_file>

json_file format: a JSON dict mapping topic_id -> dict with:
  - "new_content": the COMPLETE new content string (existing + additions)
  The script replaces the entire content field body.
  
  OR:
  - "append": string to append before the closing backtick

Important: The content string should NOT include the opening/closing backticks
or the "content: `" prefix. It should be the raw template literal body.
All escaping for the template literal must be handled:
  - ` (backtick) in content → \`
  - ${ must be → \${ (backslash-dollar-brace)
"""

import json
import re
import sys
import os

FILE_PATH = "/home/runner/work/dev-edu/dev-edu/src/data/curriculum.ts"

def main():
    if len(sys.argv) < 2:
        print("Usage: expand_content.py <json_file>")
        sys.exit(1)

    json_path = sys.argv[1]
    with open(json_path) as f:
        expansions = json.load(f)

    with open(FILE_PATH) as f:
        content = f.read()

    lines = content.split("\n")

    modified_count = 0

    for i, line in enumerate(lines):
        m = re.match(r'^            id: "(be-[^"]+)"', line)
        if not m:
            continue

        tid = m.group(1)
        if tid not in expansions:
            continue

        # Find content start: line containing 'content: `'
        content_start_line = None
        for j in range(i, min(i+50, len(lines))):
            if "content: `" in lines[j]:
                content_start_line = j
                break

        if content_start_line is None:
            print(f"ERROR: {tid}: content field not found")
            continue

        # Find the end: line ending with `,
        content_end_line = None
        for j in range(content_start_line + 1, len(lines)):
            stripped = lines[j].rstrip()
            if stripped.endswith("`,"):
                content_end_line = j
                break

        if content_end_line is None:
            print(f"ERROR: {tid}: content end not found")
            continue

        entry = expansions[tid]

        if "new_content" in entry:
            # Full replacement
            new_body = entry["new_content"]

            # Determine indentation from the line before content_start
            # The content line is like: "            content: `"
            content_line = lines[content_start_line]
            # Extract "            content: `" part
            indent_match = re.match(r'^(\s*)(content: )`', content_line)
            if not indent_match:
                print(f"ERROR: {tid}: cannot parse content line: {content_line!r}")
                continue
            indent = indent_match.group(1)

            # The closing line
            close_line = lines[content_end_line]
            close_indent_match = re.match(r'^(\s*)`', close_line)
            close_indent = close_indent_match.group(1) if close_indent_match else indent

            # Build new lines for the content body
            new_body_lines = new_body.split("\n")

            # Remove old content lines and closing line
            # We keep content_start_line as "            content: `"
            # Then insert new body
            # Then add closing "            `,"
            body_start = content_start_line + 1
            body_end = content_end_line

            # Replace the content block
            new_closing_line = close_indent + "`,"

            # Build the replacement
            replacement = []
            for bl in new_body_lines:
                if bl.strip() == "":
                    replacement.append("")
                else:
                    replacement.append(indent + bl)
            replacement.append(new_closing_line)

            # Replace lines[body_start-1:body_end]  (the original content line is kept)
            old_len = body_end - body_start + 1
            lines[body_start:body_end+1] = replacement

            print(f"OK: {tid}: fully replaced content (was {body_end-body_start+1} lines, now {len(replacement)} lines)")

        elif "append" in entry:
            # Append mode: insert text before the closing backtick
            append_text = entry["append"]

            old_line = lines[content_end_line]
            assert old_line.rstrip().endswith("`,"), f"Expected `, at end of line {content_end_line+1}: {old_line!r}"

            indent_match = re.match(r'^(\s*)', old_line)
            indent = indent_match.group(1) if indent_match else ""

            new_lines = append_text.split("\n")

            indented_new_lines = []
            for nl in new_lines:
                if nl.strip() == "":
                    indented_new_lines.append("")
                else:
                    indented_new_lines.append(indent + nl)

            leading_space = old_line[:len(old_line) - len(old_line.lstrip())]
            new_closing = "\n".join(indented_new_lines) + "\n" + leading_space + "`,"

            lines[content_end_line] = new_closing

            print(f"OK: {tid}: appended content at line {content_end_line+1}")

        else:
            print(f"ERROR: {tid}: no 'new_content' or 'append' key")
            continue

        modified_count += 1

    with open(FILE_PATH, "w") as f:
        f.write("\n".join(lines))

    print(f"\nDone. Modified {modified_count} topics.")


if __name__ == "__main__":
    main()
