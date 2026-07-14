"""
Automated domain setup for DigitalPlat + Cloudflare + Cloudflare Pages

This script will:
1. Connect your custom domain to Cloudflare Pages
2. Update DNS records automatically
3. Regenerate SEO pages with the new domain
4. Redeploy the site

Usage:
  1. Get your Cloudflare API token from: https://dash.cloudflare.com/profile/api-tokens
     - Required permissions: Zone:Read, DNS:Edit, Pages:Edit
  2. Edit .env file and add: CLOUDFLARE_API_TOKEN=your_token_here
  3. Run: python setup_domain.py
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
    if not DIGITALPLAT_API_KEY:
        print("ERROR: DIGITALPLAT_API_KEY not set in .env file")
        print("Get your API key from: https://dash.domain.digitalplat.org")
        sys.exit(1)
    
    if not CLOUDFLARE_API_TOKEN:
        print("ERROR: CLOUDFLARE_API_TOKEN not set in .env file")
        print("Get your token from: https://dash.cloudflare.com/profile/api-tokens")
        print("Required permissions: Zone:Read, DNS:Edit, Pages:Edit, Zone:Create")
        sys.exit(1)
    
    if not CLOUDFLARE_ACCOUNT_ID:
        print("ERROR: CLOUDFLARE_ACCOUNT_ID not set in .env file")
        print("Find it in Cloudflare dashboard: Right side sidebar")
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
        sys.exit(1)

def get_or_create_zone():
    """Get or create Cloudflare zone for the domain"""
    print(f"Looking up zone for {DOMAIN}...")
    result = cf_api_call("GET", f"zones?name={DOMAIN}")
    
    if result.get("success") and result.get("result"):
        zone = result["result"][0]
        print(f"  [OK] Found existing zone: {zone['name']} (ID: {zone['id']})")
        print(f"  Status: {zone.get('status', 'unknown')}")
        return zone["id"]
    
    # Zone doesn't exist - provide clear instructions
    print(f"  [FAIL] Zone not found in Cloudflare")
    print(f"")
    print(f"  TROUBLESHOOTING:")
    print(f"  - Make sure you're logged into the correct Cloudflare account")
    print(f"  - Verify the domain is added at: https://dash.cloudflare.com")
    print(f"  - Check that your API token has 'Zone:Read' permission")
    print(f"")
    print(f"  ===========================================================")
    print(f"  MANUAL SETUP REQUIRED (2 minutes)")
    print(f"  ===========================================================")
    print(f"")
    print(f"  1. Open this link: https://dash.cloudflare.com/sign-up")
    print(f"     (or go to dash.cloudflare.com and log in)")
    print(f"")
    print(f"  2. Click 'Add a site' button")
    print(f"")
    print(f"  3. Enter domain: {DOMAIN}")
    print(f"")
    print(f"  4. Select 'Free' plan (bottom of the page)")
    print(f"     Click 'Continue'")
    print(f"")
    print(f"  5. Cloudflare will scan for DNS records (none found - that's OK)")
    print(f"     Click 'Continue' -> 'Done'")
    print(f"")
    print(f"  6. COPY THESE 2 NAMESERVERS (example):")
    print(f"     - alice.ns.cloudflare.com")
    print(f"     - bob.ns.cloudflare.com")
    print(f"")
    print(f"  7. Go to: https://dash.domain.digitalplat.org")
    print(f"     Find {DOMAIN} -> Click 'Manage' -> 'Nameservers'")
    print(f"     Replace with the Cloudflare nameservers from step 6")
    print(f"     Click 'Save'")
    print(f"")
    print(f"  8. Wait 5-30 minutes for DNS propagation")
    print(f"")
    print(f"  9. Run this script again:")
    print(f"     python setup_domain.py")
    print(f"")
    print(f"  ===========================================================")
    sys.exit(1)

def update_digitalplat_nameservers(zone_id):
    """Update nameservers at DigitalPlat via their API"""
    print(f"Updating nameservers at DigitalPlat for {DOMAIN}...")
    
    # Get nameservers from Cloudflare
    result = cf_api_call("GET", f"zones/{zone_id}")
    if not result.get("success"):
        print(f"  [WARN] Could not get zone details from Cloudflare")
        return False
    
    zone = result["result"]
    nameservers = zone.get("name_servers", [])
    
    if not nameservers:
        print(f"  [WARN] No nameservers found in Cloudflare zone")
        return False
    
    print(f"  Cloudflare nameservers: {', '.join(nameservers[:2])}")
    
    # Update via DigitalPlat API
    dp_api_url = f"https://dash.domain.digitalplat.org/api/v1/domains/{DOMAIN}/nameservers"
    headers = {
        "Authorization": f"Bearer {DIGITALPLAT_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "nameservers": nameservers[:2]  # Use first 2 nameservers
    }
    
    req = urllib.request.Request(
        dp_api_url,
        data=json.dumps(payload).encode(),
        headers=headers,
        method="PUT"
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  [OK] Nameservers updated at DigitalPlat")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  [WARN] Could not update nameservers: HTTP {e.code} - {body[:200]}")
        print(f"  Please update nameservers manually at https://dash.domain.digitalplat.org")
        return False
    except Exception as e:
        print(f"  [WARN] Error updating nameservers: {e}")
        print(f"  Please update nameservers manually at https://dash.domain.digitalplat.org")
        return False

def setup_pages_custom_domain(zone_id):
    """Connect custom domain to Cloudflare Pages"""
    print(f"Connecting {DOMAIN} to Cloudflare Pages...")
    
    # Get Pages project details
    result = cf_api_call("GET", f"accounts/{CLOUDFLARE_ACCOUNT_ID}/pages/projects/{PAGES_PROJECT}")
    
    if not result.get("success"):
        print(f"ERROR: Pages project '{PAGES_PROJECT}' not found")
        sys.exit(1)
    
    project = result["result"]
    print(f"  [OK] Found Pages project: {project['name']}")
    
    # Add custom domain
    result = cf_api_call("POST", 
        f"accounts/{CLOUDFLARE_ACCOUNT_ID}/pages/projects/{PAGES_PROJECT}/domains",
        {"name": DOMAIN}
    )
    
    if result.get("success"):
        print(f"  [OK] Custom domain {DOMAIN} connected to Pages")
        return True
    else:
        errors = result.get("errors", [])
        for err in errors:
            if "already" in str(err).lower():
                print(f"  [OK] Custom domain already configured")
                return True
        print(f"  [WARN] Could not connect domain: {errors}")
        return False

def create_dns_records(zone_id):
    """Create DNS records for the domain"""
    print(f"Creating DNS records for {DOMAIN}...")
    
    # Check if records already exist
    result = cf_api_call("GET", f"zones/{zone_id}/dns_records?name={DOMAIN}")
    existing = result.get("result", [])
    
    # Create A record for root domain
    root_records = [r for r in existing if r["name"] == DOMAIN and r["type"] == "A"]
    if not root_records:
        print(f"  Creating A record: {DOMAIN} -> Cloudflare Pages")
        cf_api_call("POST", f"zones/{zone_id}/dns_records", {
            "type": "A",
            "name": DOMAIN,
            "content": "192.0.2.1",  # Placeholder, Pages will handle this
            "ttl": 1,
            "proxied": True
        })
        print(f"    [OK] A record created")
    else:
        print(f"  [OK] A record already exists")
    
    # Create CNAME for www
    www_records = [r for r in existing if r["name"] == f"www.{DOMAIN}" and r["type"] == "CNAME"]
    if not www_records:
        print(f"  Creating CNAME record: www.{DOMAIN} -> {PAGES_PROJECT}.pages.dev")
        cf_api_call("POST", f"zones/{zone_id}/dns_records", {
            "type": "CNAME",
            "name": f"www.{DOMAIN}",
            "content": f"{PAGES_PROJECT}.pages.dev",
            "ttl": 1,
            "proxied": True
        })
        print(f"    [OK] CNAME record created")
    else:
        print(f"  [OK] CNAME record already exists")

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
    
    # Check environment
    check_env()
    
    # Get or create zone ID
    zone_id = get_or_create_zone()
    
    # Update nameservers at DigitalPlat
    update_digitalplat_nameservers(zone_id)
    
    # Setup Pages custom domain
    setup_pages_custom_domain(zone_id)
    
    # Create DNS records
    create_dns_records(zone_id)
    
    # Update site config
    update_site_config()
    
    # Regenerate SEO pages
    regenerate_seo()
    
    # Redeploy
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
    print("  1. Verify domain is active in Cloudflare Pages dashboard")
    print("  2. Test your site at the new domain")
    print("  3. Submit sitemap to Google Search Console")
    print("  4. Update any external links to use the new domain")
    print()

if __name__ == "__main__":
    main()