<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import TabletIcon from '@lucide/svelte/icons/tablet';
	import CpuIcon from '@lucide/svelte/icons/cpu';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { DeviceView } from '#lib/records/view.js';
	import { formatDate } from '#lib/format.js';
	import StatusBadge from './status-badge.svelte';

	let { view }: { view: DeviceView } = $props();

	const uis = $derived(view.uis.filter((u) => u.release || u.dev || !view.hasReleaseRecord));
</script>

<Card.Root class="relative transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-md">
	<Card.Header>
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0">
				<Card.Title class="text-lg">
					<!-- The whole card is the link (the ::after covers it). -->
					<h3 class="font-semibold"><a
						href="/devices/{view.id}"
						class="text-foreground no-underline outline-none after:absolute after:inset-0 after:rounded-xl hover:no-underline"
					>
						{view.name}
					</a></h3>
				</Card.Title>
				<Card.Description class="mt-1">
					{view.models.join(', ') || view.id}
				</Card.Description>
			</div>
			{#if view.formFactor === 'phone'}
				<SmartphoneIcon class="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
			{:else}
				<TabletIcon class="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
			{/if}
		</div>
	</Card.Header>
	<Card.Content class="gap-4">
		<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
			<dt class="text-muted-foreground">SoC</dt>
			<dd class="flex items-center gap-1.5"><CpuIcon class="size-3.5 text-muted-foreground" aria-hidden="true" />{view.socName}</dd>
			<dt class="text-muted-foreground">Status</dt>
			<dd><StatusBadge status={view.status} /></dd>
			<dt class="text-muted-foreground">Interfaces</dt>
			<dd class="flex flex-wrap gap-1">
				{#each uis as ui (ui.id)}
					<Badge variant="outline">{ui.title}</Badge>
				{:else}
					<span class="text-muted-foreground">Not listed yet</span>
				{/each}
			</dd>
			<dt class="text-muted-foreground">Latest</dt>
			<dd>
				{#if view.latest}
					<span class="font-mono tabular-nums">{view.latest.version}</span>
					<span class="text-muted-foreground">
						· {formatDate(view.latest.date)}{view.latest.flavour === 'dev' ? ' · dev' : ''}</span
					>
				{:else if !view.hasReleaseRecord}
					<span class="text-muted-foreground">Records unavailable</span>
				{:else}
					<span class="text-muted-foreground">Nothing published yet</span>
				{/if}
			</dd>
		</dl>
		<p class="flex items-center gap-1 text-sm font-medium text-primary" aria-hidden="true">
			Downloads and details <ArrowRightIcon class="size-4" />
		</p>
	</Card.Content>
</Card.Root>
