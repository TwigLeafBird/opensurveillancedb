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
		class="object-contain inline-block"
		onerror={hideImage}
	/>
{:else}
	<span
		class="inline-block text-center font-mono"
		style="width:{size}px; height:{size}px; line-height:{size}px;"
		>{filename ?? '-'}</span
	>
{/if}
