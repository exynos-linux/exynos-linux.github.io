/** 2040109465 -> "1.9 GiB" */
export function formatSize(n: number): string {
	const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
	let i = 0;
	while (n >= 1024 && i < units.length - 1) {
		n /= 1024;
		i++;
	}
	return i === 0 ? `${n} B` : `${n.toFixed(1)} ${units[i]}`;
}

/** ISO 8601 -> "22 Oct 2026" (UTC, so build and browser agree). */
export function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});
}

/** ISO 8601 -> "22 Oct 2026, 18:04 UTC" */
export function formatDateTime(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return (
		d.toLocaleString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'UTC'
		}) + ' UTC'
	);
}

export const STATUS_LABEL = {
	'bring-up': 'Bring-up',
	testing: 'Testing',
	stable: 'Stable'
} as const;

export const STATUS_HINT = {
	'bring-up': 'Hardware support is being brought up; nothing is published for users yet.',
	testing: 'Development builds are published; release builds follow device verification.',
	stable: 'Release builds are verified on the device before they are published.'
} as const;

export const FORM_FACTOR_LABEL = { tablet: 'Tablet', phone: 'Phone', other: 'Device' } as const;
