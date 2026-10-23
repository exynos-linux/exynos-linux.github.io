<script lang="ts">
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import CopyPlusIcon from '@lucide/svelte/icons/copy-plus';
	import MessagesSquareIcon from '@lucide/svelte/icons/messages-square';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import CodeBlock from '#lib/components/site/code-block.svelte';
	import { config } from '#lib/config/index.js';

	const template = config.org.template;
	const templateName = template.split('/').pop() ?? 'device-template';

	const docs = [
		{
			file: 'docs/PORTING.md',
			title: 'Porting guide',
			body: 'The whole path from a stock device to published images: boot chain, kernel bring-up, device package, images and release channels.'
		},
		{
			file: 'docs/CONFIG.md',
			title: 'Configuration reference',
			body: 'Every key in config.toml: device names, the stock firmware checks, installer partitions, UIs and channels.'
		},
		{
			file: 'docs/STRUCTURE.md',
			title: 'Repository layout',
			body: 'What lives where in a device repo, and which parts are shared with the template.'
		}
	];

	const requirements = [
		{
			title: 'An unlockable bootloader',
			body: 'The device must allow OEM unlocking. Many carrier and some regional models do not; check before you start.'
		},
		{
			title: 'A Samsung Exynos SoC',
			body: 'The template, the installer and the boot chain are written for Exynos devices. Snapdragon variants of the same model are a different port.'
		},
		{
			title: 'Upstream kernel work',
			body: 'Ports run the mainline kernel, not the vendor’s. Expect to write a device tree and some drivers, and see how much of your SoC is already supported upstream.'
		},
		{
			title: 'A Linux computer and patience',
			body: 'Building, flashing and debugging happen from Linux. A USB or serial console makes early bring-up far easier.'
		}
	];
</script>

<svelte:head>
	<title>Port a device · {config.site.title}</title>
	<meta
		name="description"
		content="How to port postmarketOS Duranium on the mainline kernel to a new Samsung Exynos device, starting from the exynos-linux device template."
	/>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-14 px-4 py-10 sm:px-6 sm:py-14">
	<header class="space-y-4">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Port a new device</h1>
		<p class="text-lg text-muted-foreground">
			Every port starts from the same template: it carries the build, release and installer
			plumbing, so a new device is mostly its kernel, its drivers and one configuration file.
		</p>
	</header>

	<section aria-labelledby="req-heading" class="space-y-4">
		<h2 id="req-heading" class="text-2xl font-semibold tracking-tight">What you need</h2>
		<ul class="grid gap-4 *:min-w-0 sm:grid-cols-2">
			{#each requirements as r (r.title)}
				<li class="rounded-xl border p-4">
					<h3 class="font-medium">{r.title}</h3>
					<p class="mt-1 text-sm text-muted-foreground">{r.body}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="steps-heading" class="space-y-6">
		<h2 id="steps-heading" class="text-2xl font-semibold tracking-tight">Steps</h2>
		<ol class="space-y-8 border-l pl-6">
			<li class="relative">
				<span
					class="absolute top-0 -left-[2.3rem] flex size-7 items-center justify-center rounded-full border bg-background text-sm font-medium"
					aria-hidden="true">1</span
				>
				<h3 class="font-semibold">Create your repo from the template</h3>
				<p class="mt-1 text-muted-foreground">
					Open <a href={template} rel="noopener">{templateName}</a> and choose
					<strong class="font-medium text-foreground">Use this template</strong>. Name the new repo
					after the postmarketOS device name, <code class="text-sm">samsung-&lt;codename&gt;</code>.
				</p>
				<div class="mt-3">
					<Button href={template} rel="noopener">
						<CopyPlusIcon />
						Open the template
					</Button>
				</div>
			</li>
			<li class="relative">
				<span
					class="absolute top-0 -left-[2.3rem] flex size-7 items-center justify-center rounded-full border bg-background text-sm font-medium"
					aria-hidden="true">2</span
				>
				<h3 class="font-semibold">Initialise it for your device</h3>
				<p class="mt-1 mb-3 text-muted-foreground">
					Clone it and run <code class="text-sm">scripts/init-device</code>. It fills in the
					device’s names and switches off template mode, so CI starts building for real.
				</p>
				<CodeBlock
					lines={[
						'git clone https://github.com/<you>/samsung-<codename>',
						'cd samsung-<codename>',
						'scripts/init-device'
					]}
				/>
			</li>
			<li class="relative">
				<span
					class="absolute top-0 -left-[2.3rem] flex size-7 items-center justify-center rounded-full border bg-background text-sm font-medium"
					aria-hidden="true">3</span
				>
				<h3 class="font-semibold">Edit config.toml</h3>
				<p class="mt-1 text-muted-foreground">
					Everything device-specific is in one file: models, SoC, the stock firmware checks, the
					partitions the installer may touch, the UIs and channels to publish.
					<code class="text-sm">scripts/config check</code> validates it, and
					<a href="{template}/blob/main/docs/CONFIG.md" rel="noopener">docs/CONFIG.md</a> documents
					every key.
				</p>
			</li>
			<li class="relative">
				<span
					class="absolute top-0 -left-[2.3rem] flex size-7 items-center justify-center rounded-full border bg-background text-sm font-medium"
					aria-hidden="true">4</span
				>
				<h3 class="font-semibold">Bring up the kernel and publish</h3>
				<p class="mt-1 text-muted-foreground">
					Follow <a href="{template}/blob/main/docs/PORTING.md" rel="noopener">docs/PORTING.md</a>:
					boot the mainline kernel, add drivers, then let CI build the images. Development builds
					are published first; a device moves from bring-up to testing to stable as it proves
					itself.
				</p>
			</li>
			<li class="relative">
				<span
					class="absolute top-0 -left-[2.3rem] flex size-7 items-center justify-center rounded-full border bg-background text-sm font-medium"
					aria-hidden="true">5</span
				>
				<h3 class="font-semibold">Get listed here</h3>
				<p class="mt-1 text-muted-foreground">
					Once the repo publishes its records on GitHub Pages, open a pull request against
					<a href="{config.org.github}/exynos-linux.github.io" rel="noopener"
						>exynos-linux.github.io</a
					>
					adding one <code class="text-sm">[[devices]]</code> block to
					<code class="text-sm">site.config.toml</code>. Talk to us on Discord about moving the repo
					into the organisation.
				</p>
			</li>
		</ol>
	</section>

	<section aria-labelledby="docs-heading" class="space-y-4">
		<h2 id="docs-heading" class="text-2xl font-semibold tracking-tight">Template documentation</h2>
		<ul class="grid gap-4 *:min-w-0 md:grid-cols-3">
			{#each docs as d (d.file)}
				<li class="grid">
					<Card.Root size="sm">
						<Card.Header>
							<Card.Title>
								<h3 class="font-medium">
									<a href="{template}/blob/main/{d.file}" rel="noopener">{d.title}</a>
								</h3>
							</Card.Title>
							<Card.Description class="font-mono text-xs">{d.file}</Card.Description>
						</Card.Header>
						<Card.Content>
							<p class="text-sm text-muted-foreground">{d.body}</p>
						</Card.Content>
					</Card.Root>
				</li>
			{/each}
		</ul>
	</section>

	<Card.Root>
		<Card.Content class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-sm text-muted-foreground">
				Stuck, or not sure your device is a good candidate? Ask before you sink a weekend into it.
			</p>
			<div class="flex flex-wrap gap-2">
				<Button href={config.community.discord} rel="noopener" size="sm">
					<MessagesSquareIcon />
					Ask on Discord
				</Button>
				<Button href="{template}/blob/main/docs/PORTING.md" rel="noopener" size="sm" variant="outline">
					<BookOpenIcon />
					Porting guide
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>
