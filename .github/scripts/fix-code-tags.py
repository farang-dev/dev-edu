import re
import html

FILEPATH = "src/data/curriculum.ts"
with open(FILEPATH) as f:
    text = f.read()

# Strategy:
# 1. Find all content fields (template literal `...`  or string "...")
# 2. For each field, determine its range
# 3. Inside each range, replace <code>text</code> with appropriate backtick syntax
# 4. For template literal content: use \`text\` (escaped backticks)
# 5. For string content: use `text` (plain backticks)

# Find all structural markers: content: followed by ` or "
content_starts = list(re.finditer(r'\bcontent:\s*([`"])', text))

# Pre-scan: identify positions inside template literals to filter false positives
# Find all template literal content blocks (content: `...`)
tl_ranges = []  # [(start_pos, end_pos)]

def find_delim_close(text, search_start, delim, content_starts_after_line=None):
    """Find the closing delimiter position for a content field.
    
    Returns (close_pos, after_text) or (None, None) if not found.
    The after_text starts at the structural marker (tags:, }, ], etc.) 
    that follows the closing delimiter.
    """
    # Try patterns in order: delimiter + comma, then delimiter + optional whitespace + } or ]
    # Build patterns that match delimiter not preceded by backslash (escape check)
    # followed by optional whitespace and either a comma, or }/]
    if delim == '`':
        patterns = [
            re.compile(r'(?<!\\)`\s*,'),
            re.compile(r'(?<!\\)`\s*[\]}]'),
        ]
    else:
        patterns = [
            re.compile(r'(?<!\\)"\s*,'),
            re.compile(r'(?<!\\)"\s*[\]}]'),
        ]
    
    while True:
        best_match = None
        best_start = None
        
        for pat in patterns:
            m = pat.search(text, search_start)
            if m and (best_match is None or m.start() < best_match.start()):
                best_match = m
                best_start = m.start()
        
        if best_match is None:
            return None, None
        
        m = best_match
        candidate_pos = m.start()
        
        # Determine where the structural text starts (after comma or at the }/])
        full_match = m.group()
        if ',' in full_match:
            after_start = candidate_pos + full_match.index(',') + 1
        else:
            # No comma — the marker ({ or ]) is the last char of the match
            marker_char = full_match[-1]
            after_start = candidate_pos + full_match.rindex(marker_char)
        
        after_text_marker = text[after_start:].strip()[:200]
        after_text_marker = re.sub(r'^,\s*', '', after_text_marker)
        
        if (after_text_marker.startswith('tags:') or 
            after_text_marker.startswith('codeExample?:') or
            after_text_marker.startswith('},') or
            after_text_marker.startswith('],') or
            after_text_marker.startswith('}') or
            after_text_marker.startswith(']')):
            return candidate_pos, after_text_marker
        else:
            search_start = candidate_pos + 1

for m in content_starts:
    if m.group(1) == '`':
        start_pos = m.start()
        open_pos = m.end()
        close_pos, _ = find_delim_close(text, open_pos, '`')
        if close_pos is not None:
            tl_ranges.append((start_pos, close_pos))

def inside_template_literal(pos):
    """Check if position pos is inside a template literal content block."""
    for tl_start, tl_end in tl_ranges:
        if tl_start < pos < tl_end:
            return True
    return False

blocks = []  # [(start_pos, end_pos, delim)]

# Find matching close for each content field
for m in content_starts:
    start_pos = m.start()
    delim = m.group(1)
    delim_pos = m.end() - 1  # position of opening ` or "
    
    # Find the matching close by scanning for delim + , followed by structural keyword
    open_pos = delim_pos + 1  # content starts after the opening delimiter
    close_pos = None
    
    close_pos, _ = find_delim_close(text, open_pos, delim)
    if delim == '"' and inside_template_literal(start_pos):
        continue
    if close_pos is not None:
        blocks.append((start_pos, close_pos, delim))

print(f"Found {len(blocks)} content blocks")

# Now apply replacements
# Process blocks from END to START to preserve positions
result = text
blocks.sort(key=lambda b: b[0], reverse=True)

tl_count = 0
str_count = 0
code_before = len(re.findall(r'<code>.*?</code>', text, re.DOTALL))

for start_pos, close_pos, delim in blocks:
    open_pos = text.index('`' if delim == '`' else '"', start_pos)  
    # Actually the opening delim position
    m = re.search(r'\bcontent:\s*([`"])', text[start_pos:])
    if m is None:
        continue
    open_delim_pos = start_pos + m.end() - 1
    
    content_start = open_delim_pos + 1  # first char after opening delimiter
    content_end = close_pos  # position of closing delimiter
    
    content = text[content_start:content_end]
    
    # Apply replacement
    if delim == '`':
        def replace_tl(m):
            inner = html.unescape(m.group(1))
            return '\\`' + inner + '\\`'
        new_content = re.sub(r'<code>(.*?)</code>', replace_tl, content, flags=re.DOTALL)
        tl_count += 1
    else:
        def replace_str(m):
            inner = html.unescape(m.group(1))
            return '`' + inner + '`'
        new_content = re.sub(r'<code>(.*?)</code>', replace_str, content, flags=re.DOTALL)
        str_count += 1
    
    # Reconstruct the full text
    before = text[:content_start]
    after = text[content_end:]
    text = before + new_content + after

code_after = len(re.findall(r'<code>.*?</code>', text, re.DOTALL))

print(f"TL blocks: {tl_count}")
print(f"String blocks: {str_count}")
print(f"<code> tags: {code_before} -> {code_after}")

with open(FILEPATH, 'w') as f:
    f.write(text)

print("Done")
