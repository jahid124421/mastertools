"""
IndexNow URL submission script.
Submits all tool URLs to Bing IndexNow API for fast crawling.

Usage:  python indexnow_submit.py
"""
import json
import urllib.request
import urllib.error
import time
import sys
from pathlib import Path

HERE = Path(__file__).parent
SITE = "https://mastertools-501.pages.dev"
INDEXNOW_KEY = "399bcfb85d253200d756fa23a6a13fc1"
INDEXNOW_URL = "https://api.indexnow.org/IndexNow"

def get_all_urls():
    """Extract all URLs from sitemap.xml"""
    sm_path = HERE / "sitemap.xml"
    if not sm_path.exists():
        print("ERROR: sitemap.xml not found. Run build_seo_pages.py first.")
        sys.exit(1)

    sm = sm_path.read_text(encoding="utf-8")
    urls = []
    for line in sm.split("\n"):
        if "<loc>" in line:
            start = line.index("<loc>") + 5
            end = line.index("</loc>")
            urls.append(line[start:end])
    return urls

def submit_urls(urls, batch_size=100):
    """Submit URLs to IndexNow in batches"""
    total = len(urls)
    print(f"Submitting {total} URLs to IndexNow in batches of {batch_size}...")

    successful = 0
    failed = 0

    for i in range(0, total, batch_size):
        batch = urls[i:i + batch_size]
        payload = {
            "host": SITE.replace("https://", ""),
            "key": INDEXNOW_KEY,
            "keyLocation": f"{SITE}/{INDEXNOW_KEY}.txt",
            "urlList": batch,
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            INDEXNOW_URL,
            data=data,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status in (200, 202):
                    print(f"  [OK] Batch {i//batch_size + 1}/{(total-1)//batch_size + 1}: {len(batch)} URLs submitted (HTTP {resp.status})")
                    successful += len(batch)
                else:
                    print(f"  [?] Batch {i//batch_size + 1}: HTTP {resp.status}")
                    failed += len(batch)
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            print(f"  [FAIL] Batch {i//batch_size + 1}: HTTP {e.code} - {body[:200]}")
            failed += len(batch)
        except urllib.error.URLError as e:
            print(f"  [FAIL] Batch {i//batch_size + 1}: Network error - {e.reason}")
            failed += len(batch)

        # Be polite: 1 second between batches
        if i + batch_size < total:
            time.sleep(1)

    return successful, failed

def create_key_file():
    """Create the IndexNow key file at the root for verification"""
    key_path = HERE / f"{INDEXNOW_KEY}.txt"
    if not key_path.exists():
        key_path.write_text(INDEXNOW_KEY, encoding="utf-8")
        print(f"  [OK] Created verification file: {key_path.name}")
    else:
        print(f"  [OK] Verification file already exists: {key_path.name}")
    return key_path.name

if __name__ == "__main__":
    print("=" * 60)
    print("IndexNow URL Submission")
    print("=" * 60)

    # Create verification key file
    key_file = create_key_file()

    # Get all URLs
    urls = get_all_urls()
    print(f"Found {len(urls)} URLs in sitemap.xml")

    if not urls:
        print("No URLs to submit. Exiting.")
        sys.exit(0)

    # Submit in batches
    successful, failed = submit_urls(urls, batch_size=100)

    print()
    print("=" * 60)
    print(f"Results: {successful} submitted, {failed} failed")
    print(f"Key file: {key_file} (must be accessible at {SITE}/{key_file})")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Verify the key file is deployed at https://mastertools-501.pages.dev/<key>.txt")
    print("  2. Submit sitemap to Google Search Console manually")
    print("  3. Monitor Bing Webmaster Tools for crawl status")