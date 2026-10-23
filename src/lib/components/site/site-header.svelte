<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import { page } from '$app/state';
	import { buttonVariants } from '#lib/components/ui/button/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { config } from '#lib/config/index.js';
	import { cn } from '#lib/utils.js';
	import LogoMark from './logo-mark.svelte';
	import ModeToggle from './mode-toggle.svelte';

	const nav = [
		{ href: '/#devices', label: 'Devices', match: (p: string) => p === '/' || p.startsWith('/devices') },
		{ href: '/port', label: 'Port a device', match: (p: string) => p.startsWith('/port') },
		{ href: '/community', label: 'Community', match: (p: string) => p.startsWith('/community') }
	];

	let open = $state(false);
	const path = $derived(page.url.pathname);
</script>

<header
	class="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70"
>
	<div class="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
		<a
			href="/"
			class="mr-auto flex items-center gap-2 rounded-md font-semibold tracking-tight text-foreground no-underline hover:no-underline"
		>
			<LogoMark class="size-7" />
			<span>{config.site.title}</span>
		</a>

		<nav aria-label="Main" class="hidden md:block">
			<ul class="flex items-center gap-1">
				{#each nav as item (item.href)}
					{@const current = item.match(path) && item.href !== '/#devices' ? 'page' : undefined}
					<li>
						<a
							href={item.href}
							aria-current={current}
							class={cn(
								buttonVariants({ variant: 'ghost', size: 'sm' }),
								'text-muted-foreground hover:no-underline',
								item.match(path) && 'text-foreground'
							)}>{item.label}</a
						>
					</li>
				{/each}
				<li>
					<a
						href={config.org.github}
						rel="noopener"
						class={cn(
							buttonVariants({ variant: 'ghost', size: 'sm' }),
							'text-muted-foreground hover:no-underline'
						)}>GitHub</a
					>
				</li>
			</ul>
		</nav>

		<ModeToggle />

		<Sheet.Root bind:open>
			<Sheet.Trigger
				class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
				aria-label="Open menu"
			>
				<MenuIcon />
			</Sheet.Trigger>
			<Sheet.Content side="right" class="w-72">
				<Sheet.Header>
					<Sheet.Title class="flex items-center gap-2">
						<LogoMark class="size-6" />
						{config.site.title}
					</Sheet.Title>
				</Sheet.Header>
				<nav aria-label="Main" class="px-4">
					<ul class="flex flex-col gap-1">
						<li>
							<a
								href="/"
								onclick={() => (open = false)}
								aria-current={path === '/' ? 'page' : undefined}
								class="block rounded-md px-3 py-2 text-base text-foreground hover:bg-muted hover:no-underline"
								>Home</a
							>
						</li>
						{#each nav as item (item.href)}
							<li>
								<a
									href={item.href}
									onclick={() => (open = false)}
									aria-current={item.match(path) && item.href !== '/#devices' ? 'page' : undefined}
									class="block rounded-md px-3 py-2 text-base text-foreground hover:bg-muted hover:no-underline"
									>{item.label}</a
								>
							</li>
						{/each}
						<li>
							<a
								href={config.org.github}
								rel="noopener"
								class="block rounded-md px-3 py-2 text-base text-foreground hover:bg-muted hover:no-underline"
								>GitHub</a
							>
						</li>
						<li>
							<a
								href={config.community.discord}
								rel="noopener"
								class="block rounded-md px-3 py-2 text-base text-foreground hover:bg-muted hover:no-underline"
								>Discord</a
							>
						</li>
					</ul>
				</nav>
			</Sheet.Content>
		</Sheet.Root>
	</div>
</header>
