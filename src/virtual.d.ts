declare module 'virtual:site-config' {
	import type { SiteConfig } from '#lib/config/schema.js';
	const config: SiteConfig;
	export default config;
}

declare module 'virtual:sample-data' {
	/** The fixtures by device id when built with SAMPLE_DATA=1, otherwise null. */
	const sample: Record<string, { device: unknown; releases: unknown }> | null;
	export default sample;
}
