<script lang="ts">
	import { getIconPublicUrl } from '$lib/storage';

	export let filename: string | null = null;
	export let alt: string | null = '';
	export let size: number = 64;

	const url = getIconPublicUrl(filename ?? null);

	function hideImage(e: Event) {
		const el = e.currentTarget as HTMLImageElement | null;
		if (el && el.style) el.style.display = 'none';
	}
</script>

{#if url}
	<img
		src={url}
		alt={alt ?? ''}
		width={size}
		height={size}
		style="object-fit:contain; display:inline-block;"
		onerror={hideImage}
	/>
{:else}
	<span
		style="display:inline-block; width:{size}px; height:{size}px; line-height:{size}px; text-align:center; font-family: monospace;"
		>{filename ?? '-'}</span
	>
{/if}
