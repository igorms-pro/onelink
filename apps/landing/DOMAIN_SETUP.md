# Domain Configuration Guide

This document outlines the steps needed to configure the domain for the landing page.

## Prerequisites

- Domain `getonelink.io` purchased and managed via Hostinger
- Vercel account with project `onelink-landing` created
- Landing page deployed to Vercel

## Step 1: Add Domains to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Add the following domains:
   - `getonelink.io` (apex/root domain)
   - `www.getonelink.io` (www subdomain)

Vercel will provide DNS configuration instructions for each domain.

## Step 2: Configure DNS in Hostinger

Log in to your Hostinger account and navigate to DNS management for `getonelink.io`.

### For Apex Domain (getonelink.io)

Add an **A record**:

- **Type:** A
- **Name:** @ (or leave blank for root domain)
- **Value:** [Vercel IP address] (provided by Vercel)
- **TTL:** Auto (or 3600)

**Note:** Vercel will provide the IP address when you add the domain. Common Vercel IPs:

- `76.76.21.21` (may vary)

### For WWW Subdomain (www.getonelink.io)

Add a **CNAME record**:

- **Type:** CNAME
- **Name:** www
- **Value:** `cname.vercel-dns.com`
- **TTL:** Auto (or 3600)

### For App Subdomain (app.getonelink.io)

Add a **CNAME record**:

- **Type:** CNAME
- **Name:** app
- **Value:** `cname.vercel-dns.com`
- **TTL:** Auto (or 3600)

## Step 3: DNS Propagation

After adding DNS records:

- DNS changes typically propagate within **5 minutes to 48 hours**
- Most changes are visible within **1-2 hours**
- You can check propagation status using tools like:
  - [whatsmydns.net](https://www.whatsmydns.net/)
  - [dnschecker.org](https://dnschecker.org/)

## Step 4: SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt:

- SSL certificates are issued automatically once DNS is configured correctly
- This usually happens within **5-15 minutes** after DNS propagation
- Certificates are automatically renewed

## Step 5: Verification

### Test Domain Resolution

```bash
# Test apex domain
dig getonelink.io

# Test www subdomain
dig www.getonelink.io

# Test app subdomain
dig app.getonelink.io
```

### Test HTTPS

Visit the following URLs and verify:

- ✅ `https://getonelink.io` - Should load landing page
- ✅ `https://www.getonelink.io` - Should redirect to `getonelink.io` or load landing page
- ✅ `https://app.getonelink.io` - Should load the main application

### Verify SSL Certificates

Check SSL certificate status:

- Visit [SSL Labs](https://www.ssllabs.com/ssltest/) and test `getonelink.io`
- Should show A or A+ rating

## Troubleshooting

### Domain Not Resolving

1. **Check DNS records** - Verify records are correctly added in Hostinger
2. **Wait for propagation** - DNS changes can take up to 48 hours
3. **Clear DNS cache** - Flush your local DNS cache:

   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Windows
   ipconfig /flushdns

   # Linux
   sudo systemd-resolve --flush-caches
   ```

### SSL Certificate Not Issued

1. **Verify DNS is correct** - SSL certificates require correct DNS configuration
2. **Check Vercel logs** - Look for SSL certificate errors in Vercel dashboard
3. **Wait longer** - SSL provisioning can take up to 15 minutes after DNS propagation

### WWW Not Redirecting

Configure redirect in Vercel:

1. Go to **Settings** → **Domains**
2. Set `www.getonelink.io` to redirect to `getonelink.io`
3. Or configure both to serve the same content

## Summary

**DNS Records Required:**

| Type  | Name | Value                | Purpose       |
| ----- | ---- | -------------------- | ------------- |
| A     | @    | [Vercel IP]          | Apex domain   |
| CNAME | www  | cname.vercel-dns.com | WWW subdomain |
| CNAME | app  | cname.vercel-dns.com | App subdomain |

**Expected Timeline:**

- DNS propagation: 5 minutes - 48 hours (typically 1-2 hours)
- SSL certificate: 5-15 minutes after DNS propagation
- Total setup time: ~2-3 hours typically

## Next Steps

After domain configuration:

1. ✅ Test all pages load correctly
2. ✅ Verify SSL certificates are active
3. ✅ Test redirects work (www → apex)
4. ✅ Submit sitemap to Google Search Console
5. ✅ Update any hardcoded URLs in codebase
