import { config } from '#lib/config/index.js';
import { loadRecords } from '#lib/records/load.js';
import type { PageServerLoad } from './$types';

// Build time: every device's records, so the grid is complete without JS.
export const load: PageServerLoad = async ({ fetch }) => {
	const list = await Promise.all(config.devices.map((d) => loadRecords(fetch, d)));
	return { records: Object.fromEntries(config.devices.map((d, i) => [d.id, list[i]])) };
};
