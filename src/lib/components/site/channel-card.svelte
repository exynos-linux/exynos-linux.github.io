<script lang="ts">
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Collapsible from '#lib/components/ui/collapsible/index.js';
	import type { ReleaseChannel } from '#lib/records/types.js';
	import { installImage, updateParts } from '#lib/records/view.js';
	import { formatDate, formatSize } from '#lib/format.js';
	import FileList from './file-list.svelte';
	import Hash from './hash.svelte';

	let {
		channel,
		flavour,
		uiTitle,
		recordsAvailable
	}: {
		channel: ReleaseChannel | null;
		flavour: 'release' | 'dev';
		uiTitle: string;
		recordsAvailable: boolean;
	} = $props();

	const latest = $derived(channel?.versions[0] ?? null);
	const image = $derived(latest ? installImage(latest.files) : undefined);
	const parts = $derived(latest ? updateParts(latest.files) : []);
	const older = $derived(channel?.versions.slice(1) ?? []);
	const heading = $derived(flavour === 'release' ? 'Release' : 'Development');
	const headingId = $derived(`${flavour}-${channel?.ui ?? uiTitle.toLowerCase()}`);
</script>

<Card.Root class="min-w-0">
	<Card.Header>
		<Card.Title>
			<h3 id={headingId} class="text-base font-semibold">{heading}</h3>
		</Card.Title>
		<Card.Description>
			{#if flavour === 'release'}
				For everyday use. Only builds verified on the device reach this channel.
			{:else}
				Newest builds, with a debug layer. For development devices.
			{/if}
		</Card.Description>
	</Card.Header>

	<Card.Content class="space-y-4">
		{#if flavour === 'dev'}
			<Alert.Root class="border-amber-600/40 dark:border-amber-400/40">
				<TriangleAlertIcon class="text-amber-700 dark:text-amber-400" />
				<Alert.Title>Root over USB, no password</Alert.Title>
				<Alert.Description>
					Development builds include the USB debug layer: anyone with a USB cable gets a root
					shell, ssh and adb on the device without a password. Do not use them on a device that
					holds personal data or leaves your desk.
				</Alert.Description>
			</Alert.Root>
		{/if}

		{#if !channel || !latest}
			<p class="text-sm text-muted-foreground">
				{#if recordsAvailable}
					No {heading.toLowerCase()} build of {uiTitle} has been published yet.
				{:else}
					Release records are unavailable right now.
				{/if}
			</p>
		{:else}
			<div class="flex flex-wrap items-center gap-2">
				<span class="font-mono text-lg font-semibold tabular-nums">{latest.version}</span>
				<span class="text-sm text-muted-foreground">
					<time datetime={latest.date}>{formatDate(latest.date)}</time>
				</span>
				{#if channel.verified}
					<Badge variant="secondary">
						<BadgeCheckIcon class="text-primary" />
						Verified on device
					</Badge>
				{:else}
					<Badge variant="outline">Not verified on device</Badge>
				{/if}
				{#if channel.prerelease}
					<Badge variant="outline">Pre-release</Badge>
				{/if}
			</div>

			{#if image}
				<div class="space-y-2 rounded-lg border bg-muted/40 p-3">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div class="min-w-0">
							<p class="text-sm font-medium">Install image</p>
							<p class="text-xs text-muted-foreground">
								Full disk image for a fresh install · {formatSize(image.size)}
							</p>
						</div>
						<Button
							href={image.url}
							size="sm"
							variant={flavour === 'release' ? 'default' : 'outline'}
							download
						>
							<DownloadIcon />
							Download
						</Button>
					</div>
					<p class="font-mono text-xs break-all">{image.name}</p>
					<Hash value={image.sha256} copyLabel="Copy SHA-256 of the install image" />
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">
					This version has no install image; installed devices update to it on their own.
				</p>
			{/if}

			{#if parts.length}
				<Collapsible.Root>
					<Collapsible.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="sm" class="group -ml-2.5">
								<ChevronDownIcon
									class="transition-transform group-data-[state=open]:rotate-180"
								/>
								A/B update parts ({parts.length})
							</Button>
						{/snippet}
					</Collapsible.Trigger>
					<Collapsible.Content class="space-y-2 pt-2">
						<p class="text-xs text-muted-foreground">
							Installed devices fetch these themselves (systemd-sysupdate) and check them
							against the signed SHA256SUMS. Listed for reference and mirrors.
						</p>
						<FileList files={parts} />
					</Collapsible.Content>
				</Collapsible.Root>
			{/if}

			{#if older.length}
				<Collapsible.Root>
					<Collapsible.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="sm" class="group -ml-2.5">
								<ChevronDownIcon
									class="transition-transform group-data-[state=open]:rotate-180"
								/>
								Older versions ({older.length})
							</Button>
						{/snippet}
					</Collapsible.Trigger>
					<Collapsible.Content class="pt-2">
						<ul class="divide-y rounded-lg border">
							{#each older as v (v.version)}
								{@const img = installImage(v.files)}
								<li class="grid gap-1 p-3">
									<div class="flex flex-wrap items-baseline justify-between gap-x-3">
										<span class="font-mono text-sm font-medium tabular-nums">{v.version}</span>
										<time class="text-xs text-muted-foreground" datetime={v.date}
											>{formatDate(v.date)}</time
										>
									</div>
									{#if img}
										<a href={img.url} class="font-mono text-xs break-all" download
											>{img.name}</a
										>
										<span class="text-xs text-muted-foreground">{formatSize(img.size)}</span>
										<Hash value={img.sha256} copyLabel="Copy SHA-256 of {img.name}" />
									{:else}
										<span class="text-xs text-muted-foreground">Update parts only</span>
									{/if}
								</li>
							{/each}
						</ul>
					</Collapsible.Content>
				</Collapsible.Root>
			{/if}
		{/if}
	</Card.Content>
</Card.Root>
