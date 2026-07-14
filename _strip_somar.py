import os, re

ROOT = r"c:\Users\96650\OneDrive\Desktop\AI_BA_WORKSPACE\mastertools-deploy"
total_files = 0
total_subs = 0

def process(text):
    global total_subs
    # 1. Possessive proper-case first
    text, n = re.subn(r"Somar's All Free Tools'", "ToolStack's", text)
    total_subs += n
    # 2. Proper-case full name -> ToolStack
    text, n = re.subn(r"Somar's All Free Tools", "ToolStack", text)
    total_subs += n
    # 3. Lowercase keyword form -> toolstack
    text, n = re.subn(r"somar's all free tools", "toolstack", text, flags=re.IGNORECASE)
    total_subs += n
    # 4. Standalone "All Free Tools" (brand accent) -> remove
    text, n = re.subn(r"All Free Tools", "", text)
    total_subs += n
    # 5. Clean up leftover empty brand-accent span
    text, n = re.subn(r'<span class="brand-accent"></span>', "", text)
    total_subs += n
    # 6. Clean up "ToolStack </span>" -> "ToolStack</span>"
    text, n = re.subn(r"ToolStack </span>", "ToolStack</span>", text)
    total_subs += n
    return text

for dirpath, dirnames, filenames in os.walk(ROOT):
    for fn in filenames:
        if fn.endswith(".html"):
            p = os.path.join(dirpath, fn)
            with open(p, "r", encoding="utf-8") as f:
                orig = f.read()
            new = process(orig)
            if new != orig:
                with open(p, "w", encoding="utf-8") as f:
                    f.write(new)
                total_files += 1

print(f"Files changed: {total_files}")
print(f"Total substitutions: {total_subs}")