<script lang="ts">
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

	function normalizeHexColor(value?: string | null): string | null {
		if (!value) {
			return null;
		}

		const trimmedValue = value.trim();
		if (!trimmedValue) {
			return null;
		}

		const candidate = trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`;
		return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(candidate)
			? candidate
			: null;
	}

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
					style="width:20px; height:20px; border-radius:4px; border-width:1px; border-style:solid; background-color:{visual.hexColor};"
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

<style>
	.hex-swatch-border {
		border-color: color-mix(in srgb, currentColor 55%, transparent);
	}

	@media (prefers-color-scheme: dark) {
		.hex-swatch-border {
			border-color: color-mix(in srgb, white 80%, transparent);
		}
	}
</style>
