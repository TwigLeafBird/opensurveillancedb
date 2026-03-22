<script lang="ts">
	import ImageHoverPreview from '$lib/ImageHoverPreview.svelte';
	import { getManufacturerIconPublicUrl } from '$lib/storage';

	type Props = {
		icons?: string[] | null;
		manufacturerName: string;
		emptyText?: string;
	};

	let { icons = [], manufacturerName, emptyText = '-' }: Props = $props();

	const iconUrls = $derived.by(() =>
		(icons ?? []).flatMap((filename) => {
			const url = getManufacturerIconPublicUrl(filename);
			return url ? [{ filename, url }] : [];
		})
	);
</script>

{#if iconUrls.length > 0}
	<div
		class="relative flex items-center gap-1.5 overflow-x-auto overflow-y-visible py-1 pl-2 whitespace-nowrap"
	>
		{#each iconUrls as icon, index (`${icon.filename}-${index}`)}
			<ImageHoverPreview
				src={icon.url}
				alt={`${manufacturerName} icon ${index + 1}`}
				ariaLabel={`${manufacturerName} icon ${index + 1}`}
				thumbnailWidth={24}
				thumbnailHeight={24}
				thumbnailFrameClass={`flex h-8 w-8 flex-none items-center justify-center rounded-[0.4rem] border border-[color:color-mix(in_srgb,black_15%,transparent)] bg-[#f5f5f5] p-[0.2rem] ${index === 0 ? 'outline-2 outline-offset-[1px] outline-[var(--mdc-theme-primary,#ff3e00)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--mdc-theme-primary,#ff3e00)_35%,transparent)]' : ''}`}
				thumbnailImageClass="h-6 w-6 object-contain"
				previewImageClass="max-h-52 max-w-52 object-contain"
			/>
		{/each}
	</div>
{:else}
	{emptyText}
{/if}
