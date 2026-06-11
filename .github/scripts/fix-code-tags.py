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

blocks = []  # [(start_pos, end_pos, delim)]

# Find matching close for each content field
for m in content_starts:
    start_pos = m.start()
    delim = m.group(1)
    delim_pos = m.end() - 1  # position of opening ` or "
    
    # Find the matching close by scanning for delim + , followed by structural keyword
    open_pos = delim_pos + 1  # content starts after the opening delimiter
    close_pos = None
    
    if delim == '`':
        # Template literal: find closing `,
        # Pattern: `  ,  followed by tags:/codeExample?:/},/], on same or next line
        search_start = open_pos
        
        while True:
            # Find next ` that's followed by ,
            bt_m = re.search(r'(?<!\\)`\s*,', text[search_start:])
            if not bt_m:
                break
            
            candidate_pos = search_start + bt_m.start()
            after_comma = text[candidate_pos + bt_m.group().index(','):]
            
            # Check if followed by a structural keyword within a few lines
            after_text = after_comma.strip()[:200]
            # Remove the comma and whitespace
            after_text = re.sub(r'^,\s*', '', after_text)
            
            if (after_text.startswith('tags:') or 
                after_text.startswith('codeExample?:') or
                after_text.startswith('},') or
                after_text.startswith('],')):
                close_pos = candidate_pos
                break
            else:
                # This backtick+comma is inside content — skip and continue
                search_start = candidate_pos + 1
    else:
        # String content: find closing ",
        search_start = open_pos
        while True:
            # Find next " that's followed by ,
            qt_m = re.search(r'(?<!\\)"\s*,', text[search_start:])
            if not qt_m:
                break
            candidate_pos = search_start + qt_m.start()
            after_comma = text[candidate_pos + qt_m.group().index(','):]
            after_text = after_comma.strip()[:200]
            after_text = re.sub(r'^,\s*', '', after_text)
            if (after_text.startswith('tags:') or 
                after_text.startswith('codeExample?:') or
                after_text.startswith('},') or
                after_text.startswith('],')):
                close_pos = candidate_pos
                break
            else:
                search_start = candidate_pos + 1
    
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
