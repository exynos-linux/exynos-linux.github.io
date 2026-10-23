// The data contract with the device repos. Each repo's GitHub Pages
// publishes device.json and releases.json (written by ci/pages in the
// device template). New fields are only ever added, so everything here is
// read defensively: unknown fields are ignored, missing ones are optional.

import type { DeviceStatus, FormFactor } from '#lib/config/schema.js';

/** <pages>/device.json: the repo's resolved config.toml plus "generated". */
export interface DeviceJson {
	generated?: string;
	project?: {
		repo?: string;
		title?: string;
		maintainers?: string[];
		community?: string;
		template?: boolean;
	};
	device?: {
		id?: string;
		vendor?: string;
		codename?: string;
		name?: string;
		models?: string[];
		form_factor?: FormFactor | string;
		soc?: string;
		soc_name?: string;
		status?: DeviceStatus | string;
	};
	images?: { release?: string; uis?: string[]; default_ui?: string };
	ui?: Record<string, { title?: string; description?: string }>;
	channels?: { dev?: boolean; release?: boolean; keep?: number };
	update?: { base?: string; pages?: string; fingerprint?: string };
	bootchain?: { enabled?: boolean; tag?: string };
}

export const FILE_KINDS = [
	'install-raw',
	'uki',
	'usr',
	'usr-verity',
	'sysext',
	'confext',
	'manifest',
	'signature'
] as const;
export type FileKind = (typeof FILE_KINDS)[number];

export interface ReleaseFile {
	name: string;
	size: number;
	sha256: string;
	url: string;
	kind: FileKind;
}

export interface ReleaseVersion {
	/** YYMMDDNN */
	version: string;
	date: string;
	files: ReleaseFile[];
}

export interface ReleaseChannel {
	id: string;
	ui: string;
	flavour: 'release' | 'dev';
	title: string;
	description: string;
	prerelease: boolean;
	verified: boolean;
	latest: string;
	/** Newest first. */
	versions: ReleaseVersion[];
}

export interface BootchainFile {
	name: string;
	size: number;
	sha256: string;
	url: string;
}

export interface Bootchain {
	tag: string;
	prerelease: boolean;
	date: string;
	files: BootchainFile[];
}

/** <pages>/releases.json, schema 1. */
export interface ReleasesJson {
	schema: 1;
	generated: string;
	repo: string;
	channels: ReleaseChannel[];
	bootchain?: Bootchain;
}

/** What one fetch of a device's records produced. */
export interface DeviceRecords {
	device: DeviceJson | null;
	releases: ReleasesJson | null;
	/** Human-readable reasons for whatever is missing. */
	problems: string[];
	/** When this snapshot was taken (iso8601). */
	fetchedAt: string;
	/** True only for local development with the sample fixtures. */
	sample: boolean;
}
