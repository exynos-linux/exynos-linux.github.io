<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CpuIcon from '@lucide/svelte/icons/cpu';
	import GitForkIcon from '@lucide/svelte/icons/git-fork';
	import LayersIcon from '@lucide/svelte/icons/layers';
	import MessagesSquareIcon from '@lucide/svelte/icons/messages-square';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import DeviceCard from '#lib/components/site/device-card.svelte';
	import { config } from '#lib/config/index.js';
	import { liveRecords } from '#lib/records/live.svelte.js';
	import { deviceView } from '#lib/records/view.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const live = liveRecords(() => ({ entries: config.devices, records: data.records }));
	const views = $derived(config.devices.map((d) => deviceView(d, live.records[d.id])));

	const steps = [
		{
			icon: CpuIcon,
			title: 'Mainline kernel and drivers',
			body: 'Each port runs the upstream Linux kernel. We write and maintain the drivers and device tree the hardware needs, and send them upstream where we can.'
		},
		{
			icon: LayersIcon,
			title: 'postmarketOS Duranium images',
			body: 'The kernel and the device package go into images built with the postmarketOS Duranium tooling. The user interfaces and the rest of the OS come unchanged from postmarketOS.'
		},
		{
			icon: RefreshCwIcon,
			title: 'Signed A/B updates',
			body: 'Installed devices update themselves with systemd-sysupdate into the inactive slot, checking every image against the port’s signing key. When postmarketOS publishes a new Duranium build, the images are rebuilt automatically.'
		}
	];
</script>

<svelte:head>
	<title>{config.site.title}: mainline Linux on Samsung Exynos devices</title>
</svelte:head>

<section class="border-b bg-muted/30">
	<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
		<p class="mb-4 text-sm font-medium text-primary">Community ports for postmarketOS</p>
		<h1 class="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
			Mainline Linux on Samsung Exynos devices
		</h1>
		<p class="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
			{config.org.name} builds community ports of postmarketOS Duranium, the immutable edition of
			postmarketOS with systemd, unified kernel images and signed A/B updates, for Samsung phones
			and tablets with Exynos chips. Every port runs the upstream (“mainline”) Linux kernel with our
			drivers instead of the vendor’s Android kernel, and keeps itself up to date like any other
			Duranium install.
		</p>
		<div class="mt-8 flex flex-wrap gap-3">
			<Button href="#devices" size="lg">
				See the devices
				<ArrowRightIcon data-icon="inline-end" />
			</Button>
			<Button href="/port" size="lg" variant="outline">Port a device</Button>
		</div>
	</div>
</section>

<section id="devices" aria-labelledby="devices-heading" class="scroll-mt-16">
	<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
		<div class="mb-8 max-w-2xl">
			<h2 id="devices-heading" class="text-2xl font-semibold tracking-tight">Devices</h2>
			<p class="mt-2 text-muted-foreground">
				Each device has its own repository, release channels and maintainers. Pick one for
				downloads, checksums and install instructions.
			</p>
		</div>
		{#if views.length}
			<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each views as view (view.id)}
					<li class="grid min-w-0"><DeviceCard {view} /></li>
				{/each}
			</ul>
		{:else}
			<p class="text-muted-foreground">No devices are listed yet.</p>
		{/if}
		<p class="mt-6 text-sm text-muted-foreground">
			Have an Exynos device with an unlockable bootloader? <a href="/port">Port it</a>.
		</p>
	</div>
</section>

<section aria-labelledby="how-heading" class="border-y bg-muted/30">
	<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
		<h2 id="how-heading" class="text-2xl font-semibold tracking-tight">How it works</h2>
		<ol class="mt-8 grid gap-8 md:grid-cols-3">
			{#each steps as step, i (step.title)}
				<li>
					<div class="flex items-center gap-3">
						<span
							class="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary"
						>
							<step.icon class="size-5" aria-hidden="true" />
						</span>
						<span class="text-sm text-muted-foreground">Step {i + 1}</span>
					</div>
					<h3 class="mt-4 font-semibold">{step.title}</h3>
					<p class="mt-2 text-sm text-muted-foreground">{step.body}</p>
				</li>
			{/each}
		</ol>
		<p class="mt-10 max-w-3xl text-sm text-muted-foreground">
			The project maintains kernels, drivers and device packages only. Phosh, GNOME and everything
			else in the images are postmarketOS’s work, used as published.
		</p>
	</div>
</section>

<section aria-labelledby="community-heading">
	<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
		<Card.Root>
			<Card.Header>
				<Card.Title>
					<h2 id="community-heading" class="text-xl font-semibold tracking-tight">Get involved</h2>
				</Card.Title>
				<Card.Description>
					Questions, test reports and new ports are all welcome. Chat on Discord, or open issues
					and pull requests on GitHub.
				</Card.Description>
			</Card.Header>
			<Card.Content class="flex-row flex-wrap">
				<Button href={config.community.discord} rel="noopener">
					<MessagesSquareIcon />
					Join the Discord
				</Button>
				<Button href={config.org.github} rel="noopener" variant="outline">
					<GitForkIcon />
					GitHub organisation
				</Button>
				<Button href="/community" variant="ghost">
					More about the community
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</Card.Content>
		</Card.Root>
	</div>
</section>
