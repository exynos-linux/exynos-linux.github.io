<script lang="ts">
	// The exynos-linux mark: a chip outline with pins and a slab "e".
	// Original artwork; drawn with currentColor so it follows the theme.
	// static/favicon.svg is the same drawing with fixed colours.
	let { class: className = '', title = '' }: { class?: string; title?: string } = $props();
</script>

<svg
	viewBox="0 0 32 32"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class={className}
	role={title ? 'img' : undefined}
	aria-hidden={title ? undefined : 'true'}
	aria-label={title || undefined}
>
	<rect x="6" y="6" width="20" height="20" rx="4" stroke="currentColor" stroke-width="2" />
	<path
		d="M11 2v4M16 2v4M21 2v4M11 26v4M16 26v4M21 26v4M2 11h4M2 16h4M2 21h4M26 11h4M26 16h4M26 21h4"
		stroke="currentColor"
		stroke-width="2"
	/>
	<path
		d="M11 16h10a5 5 0 1 0-1.46 3.54"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="square"
		class="text-primary"
	/>
</svg>
