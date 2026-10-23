# exynos-linux.github.io

The org website (https://exynos-linux.github.io/). SvelteKit 3 (Svelte 5 runes)
+ TypeScript + Tailwind v4 + shadcn-svelte (`src/lib/components/ui`, add with
`npx shadcn-svelte@latest add <name>`) + adapter-static, fully prerendered, base
path "". Imports use `#lib/...` (package.json "imports"), not `$lib`. npm only;
versions are pinned exactly (`.npmrc save-exact`), commit package-lock.json.

## Commands

- `npm ci`, `npm run dev`, `npm run check` (svelte-check, must be 0 errors),
  `npm run build` (must prerender /, /port, /community, /devices/<id>)
- `npm run dev:sample` / `npm run build:sample`: sample fixtures
  (`src/lib/fixtures/<id>/`), local only. Restart `vite preview` after a rebuild.

## Layout

- `site.config.toml`: site, org, community links, `[[devices]]`. Parsed with
  smol-toml and validated (`src/lib/config/schema.ts`) by
  `tools/vite-plugin-site.ts`, exposed as `virtual:site-config`.
- `src/lib/records/`: data contract types, fetch + validation (`load.ts`),
  view model (`view.ts`), in-browser refresh (`live.svelte.ts`).
- `src/routes/devices/[id]/`: `+page.ts` has `entries()` from the config;
  `+page.server.ts` fetches the records at build time.

## Data contract (per device repo, at its `pages` URL)

- `device.json`: resolved config.toml + `generated`: project{repo,title,
  maintainers,community,template}, device{id,vendor,codename,name,models[],
  form_factor,soc,soc_name,status bring-up|testing|stable}, images{release,uis[],
  default_ui}, ui{<id>:{title,description}}, channels{dev,release,keep},
  update{base,pages,fingerprint}, bootchain{enabled,tag}.
- `releases.json` schema 1: {schema,generated,repo,channels:[{id,ui,flavour
  release|dev,title,description,prerelease,verified,latest,versions:[{version
  YYMMDDNN,date,files:[{name,size,sha256,url,kind}]}]}],bootchain?{tag,
  prerelease,date,files[]}}. kind: install-raw (full image) | uki | usr |
  usr-verity | sysext | confext | manifest | signature.
- `sysupdate-public-key.asc`.
Fetched at build time and again on mount; failures render the config fallbacks
and a "records unavailable" note, never a build failure. New fields are only
ever added upstream: read defensively.

## Rules

- No postmarketOS, Samsung, GNOME or Phosh logos or branding, and never imply
  being official. Say "for postmarketOS" / "based on postmarketOS Duranium".
  The logo mark (`logo-mark.svelte`, `static/favicon.svg`) is original.
- Never ship sample data as real records: fixtures only behind SAMPLE_DATA
  (refused in CI); production shows the fallback note instead.
- `site.config.toml` is the only place devices are listed.
- Sentence case headings; one accent colour (teal `--primary`); keep it
  accessible (semantic HTML, focus rings, contrast) and free of horizontal
  scroll down to 360 px.
