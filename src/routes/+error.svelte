<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import { config } from '#lib/config/index.js';

	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Page not found' : 'Something went wrong'} · {config.site.title}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-20 sm:px-6 sm:py-28">
	<p class="font-mono text-sm text-primary">{page.status}</p>
	<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
		{notFound ? 'Page not found' : 'Something went wrong'}
	</h1>
	<p class="text-muted-foreground">
		{#if notFound}
			There is nothing at <code class="text-sm break-all">{page.url.pathname}</code>. The device may
			have been renamed, or the link is mistyped.
		{:else}
			{page.error?.message ?? 'An unexpected error occurred.'}
		{/if}
	</p>
	<div class="flex flex-wrap gap-3 pt-2">
		<Button href="/">Go to the home page</Button>
		<Button href="/#devices" variant="outline">See all devices</Button>
	</div>
</div>
