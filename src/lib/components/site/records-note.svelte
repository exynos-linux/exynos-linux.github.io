<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import type { RefreshState } from '#lib/records/live.svelte.js';
	import type { DeviceView } from '#lib/records/view.js';
	import { formatDateTime } from '#lib/format.js';

	let { view, refresh }: { view: DeviceView; refresh: RefreshState } = $props();
	const missing = $derived(!view.hasDeviceRecord || !view.hasReleaseRecord);
</script>

{#if missing}
	<Alert.Root>
		<InfoIcon />
		<Alert.Title>
			{#if !view.hasDeviceRecord && !view.hasReleaseRecord}
				Records unavailable
			{:else if !view.hasReleaseRecord}
				Release records unavailable
			{:else}
				Device record unavailable
			{/if}
		</Alert.Title>
		<Alert.Description>
			<p>
				{#if !view.hasDeviceRecord}
					The details below come from this site's configuration, not from the device repo.
				{/if}
				{#if !view.hasReleaseRecord}
					No downloads can be listed until
					<a href={view.repoUrl}>{view.repo}</a> publishes its release records.
				{/if}
				{#if refresh === 'pending'}
					Checking again…
				{/if}
			</p>
			{#if view.problems.length}
				<ul class="mt-1 list-disc pl-5 text-xs">
					{#each view.problems as p (p)}
						<li>{p}</li>
					{/each}
				</ul>
			{/if}
		</Alert.Description>
	</Alert.Root>
{/if}

<p class="text-xs text-muted-foreground" aria-live="polite">
	{#if view.generated}
		Records published {formatDateTime(view.generated)}.
	{/if}
	{#if refresh === 'live'}
		Checked {formatDateTime(view.fetchedAt)}.
	{:else if refresh === 'pending'}
		Checking for newer records…
	{:else}
		Showing the records from when this page was built ({formatDateTime(view.fetchedAt)}).
	{/if}
</p>
