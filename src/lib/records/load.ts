// Fetching and validating a device repo's published records. Used at build
// time (prerendering) and again in the browser on mount, so the download
// links never lag the releases. Never throws: whatever cannot be fetched or
// does not match the contract is reported in `problems` and left null.

import sampleData from 'virtual:sample-data';
import type { DeviceEntry } from '#lib/config/schema.js';
import {
	FILE_KINDS,
	type Bootchain,
	type DeviceJson,
	type DeviceRecords,
	type FileKind,
	type ReleaseChannel,
	type ReleaseFile,
	type ReleaseVersion,
	type ReleasesJson
} from './types.js';

/** True when built with SAMPLE_DATA=1 (local development only). */
export const SAMPLE_MODE = sampleData !== null;

const TIMEOUT_MS = 15_000;

type Fetch = typeof globalThis.fetch;
type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isUrl = (v: unknown): v is string => isStr(v) && /^https:\/\//.test(v);

function file(v: unknown): ReleaseFile | null {
	if (!isObj(v)) return null;
	const { name, size, sha256, url, kind } = v;
	if (!isStr(name) || !isNum(size) || !isStr(sha256) || !isUrl(url)) return null;
	if (!(FILE_KINDS as readonly string[]).includes(kind as string)) return null;
	return { name, size, sha256: sha256.toLowerCase(), url, kind: kind as FileKind };
}

function version(v: unknown): ReleaseVersion | null {
	if (!isObj(v) || !isStr(v.version) || !isStr(v.date) || !Array.isArray(v.files)) return null;
	const files = v.files.map(file).filter((f): f is ReleaseFile => f !== null);
	return { version: v.version, date: v.date, files };
}

function channel(v: unknown): ReleaseChannel | null {
	if (!isObj(v) || !isStr(v.id) || !isStr(v.ui) || !Array.isArray(v.versions)) return null;
	if (v.flavour !== 'release' && v.flavour !== 'dev') return null;
	const versions = v.versions
		.map(version)
		.filter((x): x is ReleaseVersion => x !== null)
		// YYMMDDNN (optionally with a suffix) sorts as a string.
		.sort((a, b) => (a.version < b.version ? 1 : a.version > b.version ? -1 : 0));
	if (versions.length === 0) return null;
	return {
		id: v.id,
		ui: v.ui,
		flavour: v.flavour,
		title: isStr(v.title) ? v.title : v.ui,
		description: isStr(v.description) ? v.description : '',
		prerelease: v.prerelease === true,
		verified: v.verified === true,
		latest: isStr(v.latest) ? v.latest : versions[0].version,
		versions
	};
}

function bootchain(v: unknown): Bootchain | undefined {
	if (!isObj(v) || !isStr(v.tag) || !Array.isArray(v.files)) return undefined;
	const files = v.files
		.filter(isObj)
		.filter((f) => isStr(f.name) && isNum(f.size) && isStr(f.sha256) && isUrl(f.url))
		.map((f) => ({
			name: f.name as string,
			size: f.size as number,
			sha256: (f.sha256 as string).toLowerCase(),
			url: f.url as string
		}));
	return {
		tag: v.tag,
		prerelease: v.prerelease === true,
		date: isStr(v.date) ? v.date : '',
		files
	};
}

/** Validate releases.json (schema 1). Returns null and a reason when it does not fit. */
export function parseReleases(v: unknown): { value: ReleasesJson | null; problem?: string } {
	if (!isObj(v)) return { value: null, problem: 'releases.json is not a JSON object' };
	if (v.schema !== 1) {
		return { value: null, problem: `releases.json has schema ${String(v.schema)}, expected 1` };
	}
	if (!Array.isArray(v.channels)) return { value: null, problem: 'releases.json has no channels' };
	return {
		value: {
			schema: 1,
			generated: isStr(v.generated) ? v.generated : '',
			repo: isStr(v.repo) ? v.repo : '',
			channels: v.channels.map(channel).filter((c): c is ReleaseChannel => c !== null),
			bootchain: bootchain(v.bootchain)
		}
	};
}

export function parseDevice(v: unknown): { value: DeviceJson | null; problem?: string } {
	if (!isObj(v) || !isObj(v.device)) {
		return { value: null, problem: 'device.json does not describe a device' };
	}
	return { value: v as DeviceJson };
}

async function getJson(fetch: Fetch, url: string, fresh: boolean): Promise<unknown> {
	const res = await fetch(url, {
		signal: AbortSignal.timeout(TIMEOUT_MS),
		headers: { accept: 'application/json' },
		...(fresh ? { cache: 'no-cache' as RequestCache } : {})
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}

/**
 * Fetch device.json and releases.json for one device.
 * `fresh` revalidates with the server (used for the in-browser refresh).
 */
export async function loadRecords(
	fetch: Fetch,
	entry: DeviceEntry,
	{ fresh = false }: { fresh?: boolean } = {}
): Promise<DeviceRecords> {
	const fetchedAt = new Date().toISOString();
	const problems: string[] = [];

	if (sampleData !== null) {
		const s = sampleData[entry.id];
		const device = s ? parseDevice(s.device).value : null;
		const releases = s ? parseReleases(s.releases).value : null;
		if (!s) problems.push(`no sample fixtures for ${entry.id}`);
		return { device, releases, problems, fetchedAt, sample: true };
	}

	const [device, releases] = await Promise.all(
		(
			[
				['device.json', parseDevice],
				['releases.json', parseReleases]
			] as const
		).map(async ([name, parse]) => {
			const url = `${entry.pages}/${name}`;
			try {
				const { value, problem } = parse(await getJson(fetch, url, fresh));
				if (problem) problems.push(problem);
				return value;
			} catch (e) {
				const why = e instanceof Error ? e.message : String(e);
				problems.push(`${name} could not be fetched (${why})`);
				return null;
			}
		})
	);

	return {
		device: device as DeviceJson | null,
		releases: releases as ReleasesJson | null,
		problems,
		fetchedAt,
		sample: false
	};
}
