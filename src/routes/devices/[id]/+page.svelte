<script lang="ts">
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import BugIcon from '@lucide/svelte/icons/bug';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Collapsible from '#lib/components/ui/collapsible/index.js';
	import * as Tabs from '#lib/components/ui/tabs/index.js';
	import ChannelCard from '#lib/components/site/channel-card.svelte';
	import CodeBlock from '#lib/components/site/code-block.svelte';
	import FileList from '#lib/components/site/file-list.svelte';
	import Hash from '#lib/components/site/hash.svelte';
	import RecordsNote from '#lib/components/site/records-note.svelte';
	import StatusBadge from '#lib/components/site/status-badge.svelte';
	import { config } from '#lib/config/index.js';
	import { FORM_FACTOR_LABEL, STATUS_HINT, formatDate } from '#lib/format.js';
	import { liveRecords } from '#lib/records/live.svelte.js';
	import { deviceView } from '#lib/records/view.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const live = liveRecords(() => ({
		entries: [data.entry],
		records: { [data.entry.id]: data.records }
	}));
	const view = $derived(deviceView(data.entry, live.records[data.entry.id]));
	const repoName = $derived(view.repo.split('/')[1]);

	// The selected UI tab: the device's default UI unless the visitor picked one.
	let picked = $state<string | null>(null);
	const tab = $derived(
		picked && view.uis.some((u) => u.id === picked)
			? picked
			: (view.uis.find((u) => u.isDefault) ?? view.uis[0])?.id
	);
</script>

<svelte:head>
	<title>{view.name} ({view.models.join(', ') || view.id}) · {config.site.title}</title>
	<meta
		name="description"
		content="postmarketOS Duranium for the Samsung {view.name} ({view.models.join(
			', '
		)}, {view.socName}) on the mainline Linux kernel: downloads, checksums and install instructions."
	/>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 sm:py-12">
	<!-- Overview -->
	<header class="space-y-4">
		<nav aria-label="Breadcrumb" class="text-sm text-muted-foreground">
			<ol class="flex flex-wrap items-center gap-1.5">
				<li><a href="/#devices">Devices</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page" class="text-foreground">{view.name}</li>
			</ol>
		</nav>
		<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
			<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{view.name}</h1>
			<StatusBadge status={view.status} />
		</div>
		<p class="max-w-3xl text-muted-foreground">
			postmarketOS Duranium for the Samsung {view.name} on the mainline Linux kernel. {STATUS_HINT[
				view.status
			]}
		</p>
		<RecordsNote {view} refresh={live.state} />
	</header>

	<section aria-labelledby="details-heading">
		<h2 id="details-heading" class="sr-only">Details</h2>
		<dl class="grid gap-x-6 gap-y-4 rounded-xl border p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
			<div class="min-w-0">
				<dt class="text-muted-foreground">Models</dt>
				<dd class="mt-1 font-medium">{view.models.join(', ') || '—'}</dd>
			</div>
			<div class="min-w-0">
				<dt class="text-muted-foreground">SoC</dt>
				<dd class="mt-1 font-medium">
					Samsung {view.socName}
					{#if view.soc}<span class="font-mono text-xs text-muted-foreground">({view.soc})</span>{/if}
				</dd>
			</div>
			<div class="min-w-0">
				<dt class="text-muted-foreground">Form factor</dt>
				<dd class="mt-1 font-medium">{FORM_FACTOR_LABEL[view.formFactor]}</dd>
			</div>
			<div class="min-w-0">
				<dt class="text-muted-foreground">postmarketOS release</dt>
				<dd class="mt-1 font-medium">{view.pmosRelease || '—'}</dd>
			</div>
			<div class="min-w-0">
				<dt class="text-muted-foreground">Device id</dt>
				<dd class="mt-1 font-mono text-xs break-all">{view.id}</dd>
			</div>
			<div class="min-w-0 sm:col-span-1 lg:col-span-2">
				<dt class="text-muted-foreground">Repository</dt>
				<dd class="mt-1 break-all"><a href={view.repoUrl} rel="noopener">{view.repo}</a></dd>
			</div>
			<div class="min-w-0">
				<dt class="text-muted-foreground">Maintainers</dt>
				<dd class="mt-1">
					{#if view.maintainers.length}
						<ul class="flex flex-wrap gap-x-3 gap-y-1">
							{#each view.maintainers as m (m)}
								<li>
									{#if /^@[A-Za-z0-9-]+$/.test(m)}
										<a href="https://github.com/{m.slice(1)}" rel="noopener">{m}</a>
									{:else}
										{m}
									{/if}
								</li>
							{/each}
						</ul>
					{:else}
						<span class="text-muted-foreground">See the repository</span>
					{/if}
				</dd>
			</div>
		</dl>
	</section>

	<!-- Downloads -->
	<section aria-labelledby="downloads-heading" class="space-y-6">
		<div class="max-w-3xl">
			<h2 id="downloads-heading" class="text-2xl font-semibold tracking-tight">Downloads</h2>
			<p class="mt-2 text-muted-foreground">
				One image per user interface. A device keeps the interface it was installed with and
				updates within it. Release builds are for everyday use; development builds are for working
				on the port.
			</p>
		</div>

		{#if view.uis.length && tab}
			<Tabs.Root value={tab} onValueChange={(v) => (picked = v)}>
				<Tabs.List aria-label="User interface" class="max-w-full">
					{#each view.uis as ui (ui.id)}
						<Tabs.Trigger value={ui.id} class="px-3">{ui.title}</Tabs.Trigger>
					{/each}
				</Tabs.List>
				{#each view.uis as ui (ui.id)}
					<Tabs.Content value={ui.id} class="mt-4 space-y-4">
						{#if ui.description}
							<p class="text-sm text-muted-foreground">
								<span class="font-medium text-foreground">{ui.title}:</span>
								{ui.description}
								{#if ui.isDefault}<span class="whitespace-nowrap">(the default)</span>{/if}
							</p>
						{/if}
						<div class="grid items-start gap-4 *:min-w-0 lg:grid-cols-2">
							<ChannelCard
								channel={ui.release}
								flavour="release"
								uiTitle={ui.title}
								recordsAvailable={view.hasReleaseRecord}
							/>
							<ChannelCard
								channel={ui.dev}
								flavour="dev"
								uiTitle={ui.title}
								recordsAvailable={view.hasReleaseRecord}
							/>
						</div>
					</Tabs.Content>
				{/each}
			</Tabs.Root>
		{:else}
			<p class="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
				{#if view.hasReleaseRecord}
					Nothing has been published for this device yet.
				{:else}
					Downloads will be listed here once the release records of
					<a href={view.repoUrl} rel="noopener">{view.repo}</a> can be read.
				{/if}
			</p>
		{/if}
	</section>

	<div class="grid items-start gap-6 *:min-w-0 lg:grid-cols-2">
		<!-- Install -->
		<section aria-labelledby="install-heading">
			<Card.Root>
				<Card.Header>
					<Card.Title>
						<h2 id="install-heading" class="text-xl font-semibold tracking-tight">Install</h2>
					</Card.Title>
					<Card.Description>
						Installing is done from a Linux computer with the device repo’s installer. Read the
						install guide first: it explains what is erased and how to get back.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<CodeBlock
						lines={[`git clone https://github.com/${view.repo}`, `cd ${repoName}`, './setup.sh']}
					/>
					<div>
						<Button href="{view.repoUrl}/blob/main/docs/INSTALL.md" variant="outline" rel="noopener">
							<BookOpenIcon />
							Read the install guide
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</section>

		<!-- Signing key -->
		<section aria-labelledby="key-heading">
			<Card.Root>
				<Card.Header>
					<Card.Title>
						<h2 id="key-heading" class="text-xl font-semibold tracking-tight">Signing key</h2>
					</Card.Title>
					<Card.Description>
						Each release’s SHA256SUMS is signed with this key. Installed devices only accept updates
						it signed; check the fingerprint before you trust a download.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-3">
					{#if view.fingerprint}
						<div>
							<p class="mb-1 text-sm font-medium">Fingerprint</p>
							<Hash value={view.fingerprint} label="Fingerprint" breakWords />
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">
							The fingerprint is unavailable until the device record can be read.
						</p>
					{/if}
					<div>
						<Button href={view.keyUrl} variant="outline" size="sm" rel="noopener">
							<KeyRoundIcon />
							Public key (sysupdate-public-key.asc)
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</section>

		{#if view.bootchain}
			<section aria-labelledby="bootchain-heading">
				<Card.Root>
					<Card.Header>
						<Card.Title>
							<h2 id="bootchain-heading" class="text-xl font-semibold tracking-tight">
								Boot chain
							</h2>
						</Card.Title>
						<Card.Description>
							The boot loader payload the installer writes, signed with the same key. Published {formatDate(
								view.bootchain.date
							)}{view.bootchain.prerelease ? ' as a pre-release' : ''}.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<Collapsible.Root>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="ghost" size="sm" class="group -ml-2.5">
										<ChevronDownIcon
											class="transition-transform group-data-[state=open]:rotate-180"
										/>
										Files ({view.bootchain?.files.length ?? 0})
									</Button>
								{/snippet}
							</Collapsible.Trigger>
							<Collapsible.Content class="pt-2">
								<FileList files={view.bootchain.files} />
							</Collapsible.Content>
						</Collapsible.Root>
					</Card.Content>
				</Card.Root>
			</section>
		{/if}

		<!-- Issues -->
		<section aria-labelledby="issues-heading">
			<Card.Root>
				<Card.Header>
					<Card.Title>
						<h2 id="issues-heading" class="text-xl font-semibold tracking-tight">
							Report a problem
						</h2>
					</Card.Title>
					<Card.Description>
						Problems with this device’s kernel, drivers, images or installer belong in its
						repository. Include the image version and, if you can, the output of
						<code class="text-xs">journalctl -b</code>.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div>
						<Button href="{view.repoUrl}/issues" variant="outline" size="sm" rel="noopener">
							<BugIcon />
							Open an issue
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	</div>
</div>
