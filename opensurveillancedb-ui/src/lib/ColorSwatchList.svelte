<script lang="ts">
	import '$lib/hex-swatch-border.css';
	import { normalizeHexColor } from '$lib/color';
	import { getColorSwatchPublicUrl } from '$lib/storage';

	type ColorOptionEntry = {
		color_id?: string | null;
		color?: {
			name?: string | null;
			hex_code?: string | null;
			swatch_icon?: string | null;
		} | null;
	};

	type Props = {
		colorOptions?: Array<ColorOptionEntry | null> | null;
	};

	let { colorOptions = [] }: Props = $props();

	const colorVisuals = $derived(
		(colorOptions ?? [])
			.map((option) => {
				const color = option?.color;
				const hexColor = normalizeHexColor(color?.hex_code);
				const swatchIconUrl = hexColor ? null : getColorSwatchPublicUrl(color?.swatch_icon);

				return {
					key: option?.color_id ?? color?.name ?? null,
					name: color?.name ?? 'Color',
					hexColor,
					swatchIconUrl
				};
			})
			.filter((visual) => visual.hexColor || visual.swatchIconUrl)
	);
</script>

{#if colorVisuals.length > 0}
	<div class="flex flex-wrap items-center gap-1.5">
		{#each colorVisuals as visual, index (`${visual.key ?? 'color'}-${index}`)}
			{#if visual.hexColor}
				<div
					class="hex-swatch-border"
					style="width:20px; height:20px; border-radius:4px; background-color:{visual.hexColor};"
					title={visual.name}
				></div>
			{:else}
				<img
					src={visual.swatchIconUrl}
					alt={`${visual.name} swatch`}
					title={visual.name}
					width="20"
					height="20"
					class="h-5 w-5 object-contain"
				/>
			{/if}
		{/each}
	</div>
{:else}
	-
{/if}
