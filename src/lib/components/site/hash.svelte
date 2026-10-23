<script lang="ts">
	import CopyButton from './copy-button.svelte';

	// A checksum or fingerprint: wraps anywhere (no horizontal scroll on
	// phones), monospace, with a copy button.
	let {
		value,
		label = 'SHA-256',
		copyLabel = `Copy ${label}`,
		breakWords = false
	}: { value: string; label?: string; copyLabel?: string; breakWords?: boolean } = $props();
</script>

<div class="flex min-w-0 items-start gap-1">
	<div class="min-w-0 flex-1">
		<span class="sr-only">{label}:</span>
		<code
			class={[
				'block font-mono text-xs leading-5 text-muted-foreground',
				breakWords ? 'break-words' : 'break-all'
			]}>{value}</code
		>
	</div>
	<CopyButton {value} label={copyLabel} class="-mt-1.5" />
</div>
