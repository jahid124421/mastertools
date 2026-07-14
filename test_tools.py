"""
Test all tools for broken links, missing files, and errors
"""
import os
import re
from pathlib import Path

BASE = Path(__file__).parent / "tools"
ISSUES = []

def check_tool(tool_dir):
    """Check a single tool for common issues"""
    tool_name = tool_dir.name
    issues = []
    
    # Check for index.html
    index = tool_dir / "index.html"
    if not index.exists():
        issues.append("Missing index.html")
        return issues
    
    # Read index.html
    try:
        content = index.read_text(encoding="utf-8")
    except Exception as e:
        issues.append(f"Cannot read index.html: {e}")
        return issues
    
    # Check for old domain references
    old_domain = "mastertools-501.pages.dev"
    if old_domain in content:
        issues.append(f"Contains old domain: {old_domain}")
    
    # Check for broken relative links (basic check)
    links = re.findall(r'href="([^"]+)"', content)
    for link in links:
        if link.startswith("../../") or link.startswith("../"):
            # Relative link - check if it might be broken
            if "tools/" in link and "#/tool/" not in link:
                issues.append(f"Potential broken link: {link}")
    
    # Check for empty title or description
    if '<title></title>' in content or '<meta name="description" content="">' in content:
        issues.append("Empty title or description")
    
    return issues

def main():
    print("=" * 60)
    print("Testing All Tools")
    print("=" * 60)
    print()
    
    tools = sorted([d for d in BASE.iterdir() if d.is_dir()])
    total = len(tools)
    passed = 0
    failed = 0
    
    for i, tool_dir in enumerate(tools, 1):
        tool_name = tool_dir.name
        issues = check_tool(tool_dir)
        
        if issues:
            failed += 1
            print(f"[{i}/{total}] [FAIL] {tool_name}")
            for issue in issues:
                print(f"    - {issue}")
            ISSUES.append((tool_name, issues))
        else:
            passed += 1
            print(f"[{i}/{total}] [OK] {tool_name}")
    
    print()
    print("=" * 60)
    print(f"Results: {passed} passed, {failed} failed out of {total}")
    print("=" * 60)
    
    if ISSUES:
        print()
        print("Issues found:")
        for tool_name, issues in ISSUES:
            print(f"\n{tool_name}:")
            for issue in issues:
                print(f"  - {issue}")
    
    # Save report
    report = BASE.parent / "test_report.txt"
    with open(report, "w", encoding="utf-8") as f:
        f.write(f"Tool Testing Report\n")
        f.write(f"Generated: {Path(__file__).stat().st_mtime}\n")
        f.write(f"Total tools: {total}\n")
        f.write(f"Passed: {passed}\n")
        f.write(f"Failed: {failed}\n\n")
        
        if ISSUES:
            f.write("Issues:\n")
            for tool_name, issues in ISSUES:
                f.write(f"\n{tool_name}:\n")
                for issue in issues:
                    f.write(f"  - {issue}\n")
    
    print(f"\nReport saved to: {report}")

if __name__ == "__main__":
    main()