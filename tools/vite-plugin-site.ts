/// <reference types="node" />
// Build-time data for the site, as two virtual modules:
//
//   virtual:site-config  site.config.toml, parsed with smol-toml and
//                        validated (src/lib/config/schema.ts).
//   virtual:sample-data  the fixtures in src/lib/fixtures/<device id>/
//                        when SAMPLE_DATA=1, otherwise `null`. A normal
//                        build therefore contains no sample records at all.
//
// SAMPLE_DATA=1 is for local development and screenshots only; it is
// refused in CI so a deployed build can never show fabricated releases.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'smol-toml';
import type { Plugin } from 'vite';
import { normalizeConfig } from '../src/lib/config/schema.ts';

const CONFIG_ID = 'virtual:site-config';
const SAMPLE_ID = 'virtual:sample-data';

export function sampleDataEnabled(): boolean {
	const v = process.env.SAMPLE_DATA;
	return v !== undefined && v !== '' && v !== '0' && v !== 'false';
}

export function sitePlugin(root = process.cwd()): Plugin {
	const configFile = resolve(root, 'site.config.toml');
	const fixturesDir = resolve(root, 'src/lib/fixtures');
	const sample = sampleDataEnabled();

	if (sample && (process.env.CI || process.env.GITHUB_ACTIONS)) {
		throw new Error(
			'SAMPLE_DATA is set in CI. Sample records are for local development only and must never be deployed.'
		);
	}

	function loadConfig() {
		let text: string;
		try {
			text = readFileSync(configFile, 'utf8');
		} catch {
			throw new Error(`site.config.toml not found at ${configFile}`);
		}
		let raw: unknown;
		try {
			raw = parse(text);
		} catch (e) {
			throw new Error(`site.config.toml: ${(e as Error).message}`);
		}
		return normalizeConfig(raw);
	}

	function loadSample() {
		const out: Record<string, { device: unknown; releases: unknown }> = {};
		if (!existsSync(fixturesDir)) return out;
		for (const ent of readdirSync(fixturesDir, { withFileTypes: true })) {
			if (!ent.isDirectory()) continue;
			const id = ent.name;
			const dir = join(fixturesDir, id);
			const read = (f: string) =>
				existsSync(join(dir, f)) ? JSON.parse(readFileSync(join(dir, f), 'utf8')) : null;
			out[id] = { device: read('device.json'), releases: read('releases.json') };
		}
		return out;
	}

	return {
		name: 'exynos-linux-site',
		enforce: 'pre',
		config() {
			if (sample) console.warn('\n  SAMPLE_DATA=1: showing the sample fixtures, not real records.\n');
		},
		resolveId(id) {
			if (id === CONFIG_ID || id === SAMPLE_ID) return '\0' + id;
		},
		load(id) {
			if (id === '\0' + CONFIG_ID) {
				this.addWatchFile(configFile);
				return `export default ${JSON.stringify(loadConfig())};`;
			}
			if (id === '\0' + SAMPLE_ID) {
				if (!sample) return 'export default null;';
				return `export default ${JSON.stringify(loadSample())};`;
			}
		},
		configureServer(server) {
			server.watcher.add(configFile);
			server.watcher.on('change', (file) => {
				if (resolve(file) !== configFile && !resolve(file).startsWith(fixturesDir)) return;
				for (const id of ['\0' + CONFIG_ID, '\0' + SAMPLE_ID]) {
					for (const env of Object.values(server.environments)) {
						const mod = env.moduleGraph.getModuleById(id);
						if (mod) env.moduleGraph.invalidateModule(mod);
					}
				}
				server.ws.send({ type: 'full-reload' });
			});
		}
	};
}
