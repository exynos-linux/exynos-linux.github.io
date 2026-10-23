<script lang="ts">
	import type { Snippet } from 'svelte';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	// A link off the site, marked with a small icon.
	let {
		href,
		children,
		class: className = '',
		icon = true
	}: { href: string; children: Snippet; class?: string; icon?: boolean } = $props();
</script>

<a {href} class={className} rel="noopener"
	>{@render children()}{#if icon}<ExternalLinkIcon
			class="ml-1 inline size-3.5 -translate-y-px align-middle opacity-70"
			aria-hidden="true"
		/>{/if}</a
>
