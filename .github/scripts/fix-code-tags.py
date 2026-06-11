import re
import html

FILEPATH = "src/data/curriculum.ts"

with open(FILEPATH) as f:
    content = f.read()

def replace_code(match):
    inner = match.group(1)
    decoded = html.unescape(inner)
    return f"`{decoded}`"

count_before = len(re.findall(r'<code>.*?</code>', content, re.DOTALL))

new_content = re.sub(r'<code>(.*?)</code>', replace_code, content, flags=re.DOTALL)

count_after = len(re.findall(r'<code>.*?</code>', new_content, re.DOTALL))

print(f"Before: {count_before} <code> tags found")
print(f"After:  {count_after} <code> tags remaining")

if count_after > 0:
    remaining = re.findall(r'<code>.*?</code>', new_content, re.DOTALL)
    print(f"WARNING: {count_after} <code> tags could not be replaced:")
    for r in remaining[:5]:
        print(f"  {r.strip()[:100]}")

with open(FILEPATH, "w") as f:
    f.write(new_content)

print(f"Done — wrote {FILEPATH}")
