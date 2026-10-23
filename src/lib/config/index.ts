// site.config.toml, parsed and validated at build time (tools/vite-plugin-site.ts).
import config from 'virtual:site-config';
import type { DeviceEntry } from './schema.js';

export type { DeviceEntry, SiteConfig, DeviceStatus, FormFactor } from './schema.js';
export { config };

export function findDevice(id: string): DeviceEntry | undefined {
	return config.devices.find((d) => d.id === id);
}
