import { error } from '@sveltejs/kit';
import { findDevice } from '#lib/config/index.js';
import { loadRecords } from '#lib/records/load.js';
import type { PageServerLoad } from './$types';

// Build time: the device's published records (or the reasons they are missing).
export const load: PageServerLoad = async ({ fetch, params }) => {
	const entry = findDevice(params.id);
	if (!entry) error(404, `No device called ${params.id}`);
	return { records: await loadRecords(fetch, entry) };
};
