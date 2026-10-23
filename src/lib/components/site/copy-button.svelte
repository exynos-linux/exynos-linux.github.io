<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { Button } from '#lib/components/ui/button/index.js';
	import { cn } from '#lib/utils.js';

	let {
		value,
		label = 'Copy',
		class: className = ''
	}: { value: string; label?: string; class?: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
		} catch {
			// Older browsers / insecure contexts: a hidden textarea.
			const ta = document.createElement('textarea');
			ta.value = value;
			ta.setAttribute('readonly', '');
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			ta.remove();
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}
</script>

<Button
	variant="ghost"
	size="icon-sm"
	class={cn('shrink-0 text-muted-foreground hover:text-foreground', className)}
	onclick={copy}
	aria-label={label}
	title={label}
>
	{#if copied}
		<CheckIcon class="text-primary" />
	{:else}
		<CopyIcon />
	{/if}
</Button>
<span class="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</span>
