// Validation of site.config.toml. Pure TypeScript with no SvelteKit imports:
// vite.config.ts runs it at build time and exposes the result as the
// virtual module "virtual:site-config" (see src/virtual.d.ts).

export const STATUSES = ['bring-up', 'testing', 'stable'] as const;
export type DeviceStatus = (typeof STATUSES)[number];

export const FORM_FACTORS = ['tablet', 'phone', 'other'] as const;
export type FormFactor = (typeof FORM_FACTORS)[number];

export interface DeviceFallback {
	name: string;
	models: string[];
	soc_name: string;
	status: DeviceStatus;
	form_factor: FormFactor;
}

export interface DeviceEntry {
	id: string;
	/** owner/name on GitHub */
	repo: string;
	/** Base URL of the repo's GitHub Pages, no trailing slash. */
	pages: string;
	fallback: DeviceFallback;
}

export interface SiteConfig {
	site: { title: string; description: string; url: string };
	org: { name: string; github: string; template: string };
	community: { discord: string; code_of_conduct: string };
	devices: DeviceEntry[];
}

class ConfigError extends Error {
	constructor(key: string, problem: string) {
		super(`site.config.toml: ${key}: ${problem}`);
	}
}

type Table = Record<string, unknown>;

function table(v: unknown, key: string): Table {
	if (v === undefined) return {};
	if (typeof v !== 'object' || v === null || Array.isArray(v)) {
		throw new ConfigError(key, 'must be a table');
	}
	return v as Table;
}

function str(t: Table, key: string, path: string, fallback?: string): string {
	const v = t[key];
	if (v === undefined) {
		if (fallback !== undefined) return fallback;
		throw new ConfigError(`${path}.${key}`, 'is required');
	}
	if (typeof v !== 'string' || v.trim() === '') {
		throw new ConfigError(`${path}.${key}`, 'must be a non-empty string');
	}
	return v.trim();
}

function url(t: Table, key: string, path: string, fallback?: string): string {
	const v = str(t, key, path, fallback);
	if (!/^https:\/\/[^\s]+$/.test(v)) {
		throw new ConfigError(`${path}.${key}`, `must be an https:// URL (got "${v}")`);
	}
	return v.replace(/\/+$/, '');
}

function oneOf<T extends string>(
	t: Table,
	key: string,
	path: string,
	allowed: readonly T[],
	fallback: T
): T {
	const v = str(t, key, path, fallback);
	if (!(allowed as readonly string[]).includes(v)) {
		throw new ConfigError(`${path}.${key}`, `must be one of ${allowed.join(', ')} (got "${v}")`);
	}
	return v as T;
}

const KNOWN_DEVICE_KEYS = new Set([
	'id',
	'repo',
	'pages',
	'name',
	'models',
	'soc_name',
	'status',
	'form_factor'
]);

function device(raw: unknown, i: number): DeviceEntry {
	const path = `devices[${i}]`;
	const t = table(raw, path);
	for (const k of Object.keys(t)) {
		if (!KNOWN_DEVICE_KEYS.has(k)) throw new ConfigError(`${path}.${k}`, 'unknown key');
	}
	const id = str(t, 'id', path);
	if (!/^[a-z0-9]+(-[a-z0-9]+)+$/.test(id)) {
		throw new ConfigError(`${path}.id`, `must look like "<vendor>-<codename>" (got "${id}")`);
	}
	const repo = str(t, 'repo', path);
	const m = /^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/.exec(repo);
	if (!m) throw new ConfigError(`${path}.repo`, `must be "owner/name" (got "${repo}")`);
	const [, owner, name] = m;
	const pages = url(t, 'pages', path, `https://${owner.toLowerCase()}.github.io/${name}`);

	let models: string[] = [];
	if (t.models !== undefined) {
		if (!Array.isArray(t.models) || !t.models.every((x) => typeof x === 'string')) {
			throw new ConfigError(`${path}.models`, 'must be a list of strings');
		}
		models = t.models as string[];
	}

	return {
		id,
		repo,
		pages,
		fallback: {
			name: str(t, 'name', path, id),
			models,
			soc_name: str(t, 'soc_name', path, 'Exynos'),
			status: oneOf(t, 'status', path, STATUSES, 'bring-up'),
			form_factor: oneOf(t, 'form_factor', path, FORM_FACTORS, 'other')
		}
	};
}

/** Validate the parsed TOML and fill in the defaults. Throws on mistakes. */
export function normalizeConfig(raw: unknown): SiteConfig {
	const root = table(raw, '(root)');
	const site = table(root.site, 'site');
	const org = table(root.org, 'org');
	const community = table(root.community, 'community');
	const orgName = str(org, 'name', 'org');

	if (root.devices !== undefined && !Array.isArray(root.devices)) {
		throw new ConfigError('devices', 'must be an array of tables ([[devices]])');
	}
	const devices = ((root.devices as unknown[] | undefined) ?? []).map(device);
	const seen = new Set<string>();
	for (const d of devices) {
		if (seen.has(d.id)) throw new ConfigError('devices', `duplicate id "${d.id}"`);
		seen.add(d.id);
	}

	return {
		site: {
			title: str(site, 'title', 'site'),
			description: str(site, 'description', 'site'),
			url: url(site, 'url', 'site')
		},
		org: {
			name: orgName,
			github: url(org, 'github', 'org'),
			template: url(org, 'template', 'org')
		},
		community: {
			discord: url(community, 'discord', 'community'),
			code_of_conduct: url(community, 'code_of_conduct', 'community')
		},
		devices
	};
}
