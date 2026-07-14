"""
Simplified domain setup - for when domain is already in Cloudflare
"""
import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

# Load environment variables
env_file = Path(__file__).parent / ".env"
if env_file.exists():
    for line in env_file.read_text().split("\n"):
        if "=" in line and not line.startswith("#"):
            key, value = line.split("=", 1)
            os.environ[key.strip()] = value.strip()

# Configuration
DOMAIN = "toolstack.dpdns.org"
SITE_URL = f"https://{DOMAIN}"
DIGITALPLAT_API_KEY = os.environ.get("DIGITALPLAT_API_KEY", "")
CLOUDFLARE_API_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")
CLOUDFLARE_ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
PAGES_PROJECT = "mastertools"

def check_env():
    """Check required environment variables"""
    if not CLOUDFLARE_API_TOKEN:
        print("ERROR: CLOUDFLARE_API_TOKEN not set in .env file")
        sys.exit(1)
    if not CLOUDFLARE_ACCOUNT_ID:
        print("ERROR: CLOUDFLARE_ACCOUNT_ID not set in .env file")
        sys.exit(1)

def cf_api_call(method, endpoint, data=None):
    """Make Cloudflare API call"""
    url = f"https://api.cloudflare.com/client/v4/{endpoint}"
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json",
    }
    if data:
        req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers, method=method)
    else:
        req = urllib.request.Request(url, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"Cloudflare API error {e.code}: {body}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def setup_pages_domain():
    """Connect domain to Cloudflare Pages"""
    print(f"Connecting {DOMAIN} to Cloudflare Pages...")
    
    result = cf_api_call("GET", f"accounts/{CLOUDFLARE_ACCOUNT_ID}/pages/projects/{PAGES_PROJECT}")
    if not result or not result.get("success"):
        print(f"  [WARN] Could not find Pages project '{PAGES_PROJECT}'")
        print(f"  Please add the domain manually in Cloudflare Pages dashboard")
        return False
    
    project = result["result"]
    print(f"  [OK] Found Pages project: {project['name']}")
    
    result = cf_api_call("POST", 
        f"accounts/{CLOUDFLARE_ACCOUNT_ID}/pages/projects/{PAGES_PROJECT}/domains",
        {"name": DOMAIN}
    )
    
    if result and result.get("success"):
        print(f"  [OK] Custom domain {DOMAIN} connected to Pages")
        return True
    else:
        errors = result.get("errors", []) if result else []
        for err in errors:
            if "already" in str(err).lower():
                print(f"  [OK] Custom domain already configured")
                return True
        print(f"  [WARN] Could not connect domain: {errors}")
        print(f"  Please add the domain manually in Cloudflare Pages dashboard")
        return False

def update_site_config():
    """Update site configuration files with new domain"""
    print(f"Updating site configuration...")
    
    here = Path(__file__).parent
    
    # Update build_seo_pages.py
    build_script = here / "build_seo_pages.py"
    if build_script.exists():
        content = build_script.read_text(encoding="utf-8")
        content = content.replace(
            'SITE = "https://mastertools-501.pages.dev"',
            f'SITE = "{SITE_URL}"'
        )
        build_script.write_text(content, encoding="utf-8")
        print(f"  [OK] Updated build_seo_pages.py")
    
    # Update sitemap.xml
    sitemap = here / "sitemap.xml"
    if sitemap.exists():
        content = sitemap.read_text(encoding="utf-8")
        content = content.replace(
            "https://mastertools-501.pages.dev",
            SITE_URL
        )
        sitemap.write_text(content, encoding="utf-8")
        print(f"  [OK] Updated sitemap.xml")
    
    # Update index.html canonical
    index = here / "index.html"
    if index.exists():
        content = index.read_text(encoding="utf-8")
        content = content.replace(
            'https://mastertools-501.pages.dev/',
            f"{SITE_URL}/"
        )
        index.write_text(content, encoding="utf-8")
        print(f"  [OK] Updated index.html")

def regenerate_seo():
    """Regenerate SEO pages with new domain"""
    print(f"Regenerating SEO pages...")
    os.system(f'python "{Path(__file__).parent / "build_seo_pages.py"}"')
    print(f"  [OK] SEO pages regenerated")

def redeploy():
    """Redeploy the site"""
    print(f"Redeploying to Cloudflare Pages...")
    bat_file = Path(__file__).parent / "deploy_now.bat"
    if bat_file.exists():
        os.system(f'cmd /c "{bat_file}"')
    else:
        print("  [WARN] deploy_now.bat not found, skipping deploy")

def main():
    print("=" * 60)
    print(f"Domain Setup: {DOMAIN}")
    print("=" * 60)
    print()
    
    check_env()
    setup_pages_domain()
    update_site_config()
    regenerate_seo()
    redeploy()
    
    print()
    print("=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print()
    print(f"Your site will be available at: {SITE_URL}")
    print(f"DNS propagation may take 5-30 minutes")
    print()
    print("Next steps:")
    print(f"  1. Verify domain is active in Cloudflare Pages dashboard")
    print(f"  2. Test your site at: {SITE_URL}")
    print(f"  3. Submit sitemap to Google Search Console")
    print()

if __name__ == "__main__":
    main()