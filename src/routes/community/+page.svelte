<script lang="ts">
	import BugIcon from '@lucide/svelte/icons/bug';
	import GitForkIcon from '@lucide/svelte/icons/git-fork';
	import MessagesSquareIcon from '@lucide/svelte/icons/messages-square';
	import ScaleIcon from '@lucide/svelte/icons/scale';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { config } from '#lib/config/index.js';
</script>

<svelte:head>
	<title>Community · {config.site.title}</title>
	<meta
		name="description"
		content="Where the exynos-linux community talks, how to report problems with a device port, and the code of conduct."
	/>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
	<header class="space-y-4">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Community</h1>
		<p class="text-lg text-muted-foreground">
			{config.org.name} is run by volunteers. Testers, porters and people who just want to try a
			mainline kernel on their device are all welcome.
		</p>
	</header>

	<div class="grid gap-4 *:min-w-0 md:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>
					<h2 class="flex items-center gap-2 text-lg font-semibold">
						<MessagesSquareIcon class="size-5 text-primary" aria-hidden="true" />
						Discord
					</h2>
				</Card.Title>
				<Card.Description>
					Chat with maintainers and other users: questions, test results, porting help.
				</Card.Description>
			</Card.Header>
			<Card.Content class="mt-auto items-start">
				<Button href={config.community.discord} rel="noopener">Join the Discord</Button>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>
					<h2 class="flex items-center gap-2 text-lg font-semibold">
						<GitForkIcon class="size-5 text-primary" aria-hidden="true" />
						GitHub
					</h2>
				</Card.Title>
				<Card.Description>
					All code lives in the organisation: one repo per device, the device template and this
					site. Pull requests are welcome.
				</Card.Description>
			</Card.Header>
			<Card.Content class="mt-auto items-start">
				<Button href={config.org.github} rel="noopener" variant="outline">
					Open the GitHub organisation
				</Button>
			</Card.Content>
		</Card.Root>
	</div>

	<section aria-labelledby="issues-heading" class="space-y-4">
		<h2 id="issues-heading" class="flex items-center gap-2 text-2xl font-semibold tracking-tight">
			<BugIcon class="size-5 text-muted-foreground" aria-hidden="true" />
			Reporting problems
		</h2>
		<p class="text-muted-foreground">
			Each device repo has its own issue tracker. Report problems with a device’s kernel, drivers,
			images or installer there, with the image version (<code class="text-sm">cat /etc/os-release</code
			>) and what you did. Problems in Phosh, GNOME or other postmarketOS packages that are not
			specific to the device belong upstream with postmarketOS.
		</p>
		{#if config.devices.length}
			<ul class="divide-y rounded-xl border">
				{#each config.devices as d (d.id)}
					<li class="flex flex-wrap items-center justify-between gap-3 p-4">
						<div class="min-w-0">
							<p class="font-medium"><a href="/devices/{d.id}">{d.fallback.name}</a></p>
							<p class="font-mono text-xs break-all text-muted-foreground">{d.repo}</p>
						</div>
						<Button href="https://github.com/{d.repo}/issues" rel="noopener" size="sm" variant="outline">
							Issues
						</Button>
					</li>
				{/each}
			</ul>
		{/if}
		<p class="text-sm text-muted-foreground">
			Problems with this website go to
			<a href="{config.org.github}/exynos-linux.github.io/issues" rel="noopener"
				>exynos-linux.github.io</a
			>.
		</p>
	</section>

	<section aria-labelledby="coc-heading" class="space-y-3">
		<h2 id="coc-heading" class="flex items-center gap-2 text-2xl font-semibold tracking-tight">
			<ScaleIcon class="size-5 text-muted-foreground" aria-hidden="true" />
			Code of conduct
		</h2>
		<p class="text-muted-foreground">
			Be kind, be patient and assume good faith. The same code of conduct applies on Discord, on
			GitHub and anywhere else the project meets.
		</p>
		<Button href={config.community.code_of_conduct} rel="noopener" variant="outline" size="sm">
			Read the code of conduct
		</Button>
	</section>
</div>
