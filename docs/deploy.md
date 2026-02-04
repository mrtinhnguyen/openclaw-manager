# Deployment

This guide is for maintainers, describing how to deploy Cloudflare Pages.

## Prerequisites

- Dependencies installed: `pnpm install`
- Cloudflare API Token prepared (required for non-interactive environments)

## Deploy to Pages

```bash
pnpm deploy:pages
```

Optional Environment Variables:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token (Required in non-interactive environments)
- `CLOUDFLARE_PAGES_PROJECT`: Project name (Default `blockclaw-manager`)
- `CLOUDFLARE_PAGES_BRANCH`: Branch name (Default `main`)

## Online Smoke Test

```bash
curl -fsS https://<project>.pages.dev
```
