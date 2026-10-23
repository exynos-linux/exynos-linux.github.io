# exynos-linux.github.io

The website of the [exynos-linux](https://github.com/exynos-linux) organisation,
served at <https://exynos-linux.github.io/>: community ports of postmarketOS
Duranium to Samsung Exynos devices, running the mainline Linux kernel with our
drivers.

The site lists the devices, and for each one its published images (per UI and
channel), checksums, signing key and install pointers. It holds no release data
of its own: every device repo publishes machine-readable records on its GitHub
Pages, and the site reads them at build time and again in the visitor's browser.

Not affiliated with postmarketOS, Samsung, GNOME or the Phosh project.

## Stack

SvelteKit (Svelte 5, runes) + TypeScript, Tailwind CSS v4, shadcn-svelte
components (`src/lib/components/ui`), mode-watcher for light/dark,
`@sveltejs/adapter-static` with every page prerendered. Node 22, npm.

## Local development

```sh
npm ci
npm run dev            # http://localhost:5173
npm run check          # svelte-check
npm run build          # static site in build/
npm run preview        # serve build/ on http://localhost:4173
```

The device repos may not publish records yet, so pages show the fallback
fields from `site.config.toml` and a "records unavailable" note. To see the
downloads UI filled in, use the sample fixtures in `src/lib/fixtures/`:

```sh
npm run dev:sample     # SAMPLE_DATA=1 vite dev
npm run build:sample && npm run preview
```

Sample builds show a "Sample data" banner on every page. A normal build
contains no sample records (the `virtual:sample-data` module is `null`), and
the build refuses `SAMPLE_DATA` in CI, so fabricated data can never be
deployed. `vite preview` lists the files of `build/` when it starts: restart it
after rebuilding.

## Adding a device

Add one `[[devices]]` block to `site.config.toml`:

```toml
[[devices]]
id = "samsung-gtactive5"                  # postmarketOS device name, the page URL
repo = "exynos-linux/samsung-gtactive5"   # owner/name on GitHub
# pages = "https://exynos-linux.github.io/samsung-gtactive5"   (the default)
name = "Galaxy Tab Active5"               # fallbacks, used until device.json is readable
models = ["SM-X300"]
soc_name = "Exynos 1380"
status = "bring-up"
form_factor = "tablet"
```

That is the only place devices are listed: the home page grid, the device page
(`/devices/<id>`, prerendered from this list) and the community page all follow
it. Every key is documented in the comments of
[`site.config.toml`](site.config.toml); a mistake fails the build with the key's
name (`src/lib/config/schema.ts`).

## Data contract

Each device repo's Pages (`pages` in the config) publish, via `ci/pages` in the
[device template](https://github.com/exynos-linux/device-template):

- `device.json`: the repo's resolved `config.toml` as JSON plus `generated`.
- `releases.json` (schema 1): channels per UI and flavour (`release`, `dev`),
  their versions (`YYMMDDNN`) and files (`install-raw` is the full disk image,
  the other kinds are A/B update parts), and the optional boot chain release.
- `sysupdate-public-key.asc`: the public signing key.

The types are in `src/lib/records/types.ts`; validation and fetching in
`src/lib/records/load.ts`. Anything missing or malformed is reported on the
page instead of failing the build.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages (Settings >
Pages > Source: GitHub Actions) on every push to `main`, every 6 hours (so the
prerendered records stay fresh), on manual dispatch, and on a
`repository_dispatch` of type `device-records-updated`, which a device repo's
`pages.yml` sends after publishing new records (it needs a `SITE_DISPATCH_TOKEN`
secret in that repo). Pull requests run `.github/workflows/check.yml`
(`npm ci`, `npm run check`, `npm run build`).

## Licence

The site code is under the [MIT licence](LICENSE). The device ports, images and
the software in them have their own licences.
