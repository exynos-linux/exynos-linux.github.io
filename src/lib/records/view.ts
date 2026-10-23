// What the pages render: a device's published records merged over the
// fallback fields from site.config.toml.

import type { DeviceEntry, DeviceStatus, FormFactor } from '#lib/config/schema.js';
import { FORM_FACTORS, STATUSES } from '#lib/config/schema.js';
import type { Bootchain, DeviceRecords, ReleaseChannel, ReleaseFile } from './types.js';

export interface UiView {
	id: string;
	title: string;
	description: string;
	isDefault: boolean;
	release: ReleaseChannel | null;
	dev: ReleaseChannel | null;
}

export interface DeviceView {
	id: string;
	repo: string;
	repoUrl: string;
	pages: string;
	name: string;
	models: string[];
	soc: string;
	socName: string;
	formFactor: FormFactor;
	status: DeviceStatus;
	maintainers: string[];
	/** postmarketOS release the images follow, e.g. "edge". */
	pmosRelease: string;
	fingerprint: string;
	keyUrl: string;
	uis: UiView[];
	bootchain: Bootchain | null;
	/** Newest version over all channels, preferring the release channels. */
	latest: { version: string; date: string; flavour: 'release' | 'dev' } | null;
	hasDeviceRecord: boolean;
	hasReleaseRecord: boolean;
	problems: string[];
	fetchedAt: string;
	generated: string;
	sample: boolean;
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function deviceView(entry: DeviceEntry, records: DeviceRecords): DeviceView {
	const d = records.device;
	const r = records.releases;
	const fb = entry.fallback;
	const dev = d?.device ?? {};

	const status = (STATUSES as readonly string[]).includes(dev.status ?? '')
		? (dev.status as DeviceStatus)
		: fb.status;
	const formFactor = (FORM_FACTORS as readonly string[]).includes(dev.form_factor ?? '')
		? (dev.form_factor as FormFactor)
		: fb.form_factor;

	const channels = r?.channels ?? [];
	// UI order: the device's configured list (default first), then anything
	// else that has published channels.
	const order: string[] = [];
	const defaultUi = d?.images?.default_ui;
	if (defaultUi) order.push(defaultUi);
	for (const u of d?.images?.uis ?? []) if (!order.includes(u)) order.push(u);
	for (const c of channels) if (!order.includes(c.ui)) order.push(c.ui);

	const pick = (ui: string, flavour: 'release' | 'dev') =>
		channels.find((c) => c.ui === ui && c.flavour === flavour) ?? null;

	const uis: UiView[] = order.map((id) => {
		const release = pick(id, 'release');
		const devc = pick(id, 'dev');
		const meta = d?.ui?.[id];
		return {
			id,
			title: meta?.title ?? release?.title ?? devc?.title ?? titleCase(id),
			description: meta?.description ?? '',
			isDefault: id === defaultUi,
			release,
			dev: devc
		};
	});

	let latest: DeviceView['latest'] = null;
	for (const flavour of ['release', 'dev'] as const) {
		for (const c of channels.filter((c) => c.flavour === flavour)) {
			const v = c.versions[0];
			if (v && (!latest || (latest.flavour === flavour && v.version > latest.version))) {
				latest = { version: v.version, date: v.date, flavour };
			}
		}
		if (latest) break;
	}

	return {
		id: entry.id,
		repo: entry.repo,
		repoUrl: `https://github.com/${entry.repo}`,
		pages: entry.pages,
		name: dev.name ?? fb.name,
		models: dev.models?.length ? dev.models : fb.models,
		soc: dev.soc ?? '',
		socName: dev.soc_name ?? fb.soc_name,
		formFactor,
		status,
		maintainers: d?.project?.maintainers ?? [],
		pmosRelease: d?.images?.release ?? '',
		fingerprint: d?.update?.fingerprint ?? '',
		keyUrl: `${entry.pages}/sysupdate-public-key.asc`,
		uis,
		bootchain: r?.bootchain ?? null,
		latest,
		hasDeviceRecord: d !== null,
		hasReleaseRecord: r !== null,
		problems: records.problems,
		fetchedAt: records.fetchedAt,
		generated: r?.generated || d?.generated || '',
		sample: records.sample
	};
}

export const installImage = (files: ReleaseFile[]) => files.find((f) => f.kind === 'install-raw');
export const updateParts = (files: ReleaseFile[]) => files.filter((f) => f.kind !== 'install-raw');

export const KIND_LABEL: Record<string, string> = {
	'install-raw': 'Install image',
	uki: 'Kernel (UKI)',
	usr: '/usr image',
	'usr-verity': '/usr verity',
	sysext: 'System extension',
	confext: 'Config extension',
	manifest: 'Checksums (SHA256SUMS)',
	signature: 'Signature'
};
