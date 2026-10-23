<script lang="ts">
	import CopyButton from './copy-button.svelte';

	// Shell commands with a copy button. Long lines wrap (no horizontal
	// scroll on phones); the "$ " prompts are not copied.
	let {
		lines,
		label = 'Copy commands',
		title = 'Terminal'
	}: { lines: string[]; label?: string; title?: string } = $props();
	const text = $derived(lines.join('\n'));
</script>

<div class="overflow-hidden rounded-lg border bg-muted/50">
	<div class="flex items-center justify-between border-b py-1 pr-1 pl-4">
		<span class="text-xs text-muted-foreground">{title}</span>
		<CopyButton value={text} {label} />
	</div>
	<pre
		class="p-4 text-[0.8125rem] leading-6 whitespace-pre-wrap [overflow-wrap:anywhere]"><code
			>{#each lines as line, i (i)}<span class="text-muted-foreground select-none" aria-hidden="true"
					>$ </span
				>{line}{'\n'}{/each}</code
		></pre>
</div>
