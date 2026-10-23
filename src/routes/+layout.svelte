<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import type { LayoutProps } from './$types';
	import SiteFooter from '#lib/components/site/site-footer.svelte';
	import SiteHeader from '#lib/components/site/site-header.svelte';
	import SampleBanner from '#lib/components/site/sample-banner.svelte';
	import { config } from '#lib/config/index.js';
	import { SAMPLE_MODE } from '#lib/records/load.js';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<meta name="description" content={config.site.description} />
	<meta property="og:site_name" content={config.site.title} />
	{#if SAMPLE_MODE}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<ModeWatcher defaultMode="system" />

<a
	href="#main"
	class="sr-only z-50 rounded-md bg-background px-4 py-2 text-foreground ring-2 ring-ring focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
	>Skip to content</a
>

<div class="flex min-h-dvh flex-col overflow-x-clip">
	{#if SAMPLE_MODE}
		<SampleBanner />
	{/if}
	<SiteHeader />
	<main id="main" tabindex="-1" class="flex-1 outline-none">
		{@render children()}
	</main>
	<SiteFooter />
</div>
