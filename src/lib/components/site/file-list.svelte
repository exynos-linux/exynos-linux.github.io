<script lang="ts">
	import DownloadIcon from '@lucide/svelte/icons/download';
	import type { ReleaseFile } from '#lib/records/types.js';
	import { KIND_LABEL } from '#lib/records/view.js';
	import { formatSize } from '#lib/format.js';
	import Hash from './hash.svelte';

	// A plain list of files (update parts, boot chain): label, name, size,
	// checksum. Wraps on narrow screens instead of scrolling.
	let { files }: { files: (Omit<ReleaseFile, 'kind'> & { kind?: string })[] } = $props();
</script>

{#snippet link(f: { url: string; name: string })}
	<a href={f.url} class="flex min-w-0 items-start gap-1.5 font-mono text-xs break-all" download>
		<DownloadIcon class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
		<span>{f.name}</span>
	</a>
{/snippet}

<ul class="divide-y rounded-lg border">
	{#each files as f (f.url)}
		<li class="grid gap-1 p-3">
			<div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
				{#if f.kind}
					<span class="text-sm font-medium">{KIND_LABEL[f.kind] ?? f.kind}</span>
				{:else}
					{@render link(f)}
				{/if}
				<span class="text-xs text-muted-foreground tabular-nums">{formatSize(f.size)}</span>
			</div>
			{#if f.kind}
				{@render link(f)}
			{/if}
			<Hash value={f.sha256} copyLabel="Copy SHA-256 of {f.name}" />
		</li>
	{/each}
</ul>
