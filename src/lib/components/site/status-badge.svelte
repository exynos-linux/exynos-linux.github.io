<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import type { DeviceStatus } from '#lib/config/schema.js';
	import { STATUS_HINT, STATUS_LABEL } from '#lib/format.js';

	let { status }: { status: DeviceStatus } = $props();
	const variant = $derived(
		status === 'stable' ? 'default' : status === 'testing' ? 'secondary' : 'outline'
	);
</script>

<Badge {variant} title={STATUS_HINT[status]}>
	<span
		class={[
			'size-1.5 rounded-full',
			status === 'stable' ? 'bg-primary-foreground' : status === 'testing' ? 'bg-primary' : 'bg-muted-foreground'
		]}
		aria-hidden="true"
	></span>
	{STATUS_LABEL[status]}
</Badge>
