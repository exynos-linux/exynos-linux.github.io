<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button } from '#lib/components/ui/button/index.js';

	// Follows the system until toggled; the footer offers a way back.
	const label = $derived(mode.current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
</script>

<Button variant="ghost" size="icon" onclick={toggleMode} aria-label={label} title={label}>
	<SunIcon class="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
	<MoonIcon class="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
</Button>
