// The in-browser refresh: pages render the records fetched at build time,
// then fetch them again on mount (revalidating with GitHub Pages) so the
// download links are never stale. A refresh that fails keeps whatever the
// build-time snapshot had.

import type { DeviceEntry } from '#lib/config/schema.js';
import { loadRecords } from './load.js';
import type { DeviceRecords } from './types.js';

export type RefreshState = 'pending' | 'live' | 'snapshot';

export function mergeRecords(snapshot: DeviceRecords, fresh: DeviceRecords): DeviceRecords {
	const device = fresh.device ?? snapshot.device;
	const releases = fresh.releases ?? snapshot.releases;
	// Keep only the problems that still leave something missing.
	const problems = fresh.problems.filter(
		(p) =>
			(p.startsWith('device.json') && !device) ||
			(p.startsWith('releases.json') && !releases) ||
			(!p.startsWith('device.json') && !p.startsWith('releases.json'))
	);
	const fetchedAt =
		fresh.device || fresh.releases ? fresh.fetchedAt : snapshot.fetchedAt;
	return { device, releases, problems, fetchedAt, sample: fresh.sample };
}

/**
 * Live records for a set of devices. `source` returns the build-time data;
 * it is re-read (and the refresh re-run) whenever it changes, e.g. on
 * client-side navigation between device pages.
 */
export function liveRecords(
	source: () => { entries: DeviceEntry[]; records: Record<string, DeviceRecords> }
) {
	let fresh = $state<{ key: string; records: Record<string, DeviceRecords> } | null>(null);
	let state = $state<RefreshState>('pending');

	const keyOf = (entries: DeviceEntry[]) => entries.map((e) => e.id).join('\n');

	$effect(() => {
		const { entries, records } = source();
		const key = keyOf(entries);
		let cancelled = false;
		state = 'pending';
		Promise.all(entries.map((e) => loadRecords(fetch, e, { fresh: true }))).then((list) => {
			if (cancelled) return;
			const merged: Record<string, DeviceRecords> = {};
			let anyLive = false;
			entries.forEach((e, i) => {
				const snap = records[e.id];
				const got = list[i];
				if (got.device || got.releases) anyLive = true;
				merged[e.id] = snap ? mergeRecords(snap, got) : got;
			});
			fresh = { key, records: merged };
			state = anyLive || entries.length === 0 ? 'live' : 'snapshot';
		});
		return () => {
			cancelled = true;
		};
	});

	return {
		get records(): Record<string, DeviceRecords> {
			const s = source();
			return fresh && fresh.key === keyOf(s.entries) ? fresh.records : s.records;
		},
		get state(): RefreshState {
			return state;
		}
	};
}
