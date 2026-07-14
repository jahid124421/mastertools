"""
Rename website from "Somar's All Free Tools" to "ToolStack"
"""
import os
from pathlib import Path

BASE = Path(__file__).parent

# Replacements
REPLACEMENTS = [
    ("Somar's All Free Tools", "ToolStack"),
]

def replace_in_file(filepath):
    """Replace text in a file"""
    try:
        content = filepath.read_text(encoding='utf-8')
        original = content
        
        for old, new in REPLACEMENTS:
            content = content.replace(old, new)
        
        if content != original:
            filepath.write_text(content, encoding='utf-8')
            return True
    except Exception as e:
        print(f"  Error processing {filepath}: {e}")
    return False

def main():
    print("Renaming website from 'Somar's All Free Tools' to 'ToolStack'...")
    print()
    
    # Find all HTML files
    html_files = list(BASE.rglob("*.html"))
    print(f"Found {len(html_files)} HTML files")
    
    updated = 0
    for filepath in html_files:
        if replace_in_file(filepath):
            updated += 1
            print(f"  Updated: {filepath.relative_to(BASE)}")
    
    print()
    print(f"Updated {updated} files")
    print()
    print("Done! Your website is now called 'ToolStack'")

if __name__ == "__main__":
    main()