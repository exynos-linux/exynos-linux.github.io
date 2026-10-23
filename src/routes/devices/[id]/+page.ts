import { error } from '@sveltejs/kit';
import { config, findDevice } from '#lib/config/index.js';
import type { EntryGenerator, PageLoad } from './$types';

// One page per [[devices]] block in site.config.toml.
export const entries: EntryGenerator = () => config.devices.map((d) => ({ id: d.id }));

export const load: PageLoad = ({ data, params }) => {
	const entry = findDevice(params.id);
	if (!entry) error(404, `No device called ${params.id}`);
	return { ...data, entry };
};
