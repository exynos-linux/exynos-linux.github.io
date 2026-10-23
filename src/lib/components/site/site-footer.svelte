<script lang="ts">
	import { resetMode, userPrefersMode } from 'mode-watcher';
	import { config } from '#lib/config/index.js';
	import LogoMark from './logo-mark.svelte';
</script>

<footer class="mt-auto border-t">
	<div class="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:grid-cols-[1fr_auto]">
		<div class="max-w-prose space-y-2">
			<p class="flex items-center gap-2 font-medium text-foreground">
				<LogoMark class="size-5" />
				{config.org.name}
			</p>
			<p>
				A community project, based on postmarketOS Duranium. Not affiliated with or endorsed by
				postmarketOS, Samsung, GNOME or the Phosh project; their names are used only to describe
				what the images contain and run on.
			</p>
			<p>
				Site code under the <a href="{config.org.github}/exynos-linux.github.io/blob/main/LICENSE"
					>MIT licence</a
				>. Each device repo states its own licence.
			</p>
		</div>
		<nav aria-label="Footer">
			<ul class="flex flex-wrap gap-x-5 gap-y-2 md:flex-col md:items-end">
				<li><a href="/port">Port a device</a></li>
				<li><a href="/community">Community</a></li>
				<li><a href={config.org.github} rel="noopener">GitHub</a></li>
				<li><a href={config.community.discord} rel="noopener">Discord</a></li>
				{#if userPrefersMode.current !== 'system'}
					<li>
						<button
							type="button"
							class="text-primary underline-offset-4 hover:underline"
							onclick={resetMode}>Use system theme</button
						>
					</li>
				{/if}
			</ul>
		</nav>
	</div>
</footer>
