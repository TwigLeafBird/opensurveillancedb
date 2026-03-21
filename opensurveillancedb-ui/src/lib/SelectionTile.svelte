<script lang="ts">
	import ShapeIcon from '$lib/ShapeIcon.svelte';
	import { validateFilename } from '$lib/storage';

	type Props = {
		label: string;
		supportingText?: string | null;
		colorHex?: string | null;
		selected?: boolean;
		disabled?: boolean;
		iconFilename?: string | null;
		imageSrc?: string | null;
		imageAlt?: string | null;
		onclick?: ((event: MouseEvent) => void) | undefined;
	};

	let {
		label,
		supportingText = null,
		colorHex = null,
		selected = false,
		disabled = false,
		iconFilename = null,
		imageSrc = null,
		imageAlt = null,
		onclick
	}: Props = $props();

	const mediaSize = 56;
	const safeIconFilename = $derived(validateFilename(iconFilename));
	const resolvedImageAlt = $derived(imageAlt?.trim() || `${label} image`);
</script>

<button
	type="button"
	{disabled}
	aria-pressed={selected}
	{onclick}
	class="flex min-h-40 min-w-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-[0.875rem] border p-4 text-center text-inherit transition-all duration-150 ease-in-out focus-visible:[outline:2px_solid_currentColor] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 [&:hover:not(:disabled)]:-translate-y-px [&:hover:not(:disabled)]:[border-color:color-mix(in_srgb,currentColor_35%,transparent)] [&:hover:not(:disabled)]:[background:color-mix(in_srgb,currentColor_7%,transparent)] {selected
		? '[border-color:var(--mdc-theme-primary,#6200ee)] [box-shadow:0_0_0_1px_color-mix(in_srgb,var(--mdc-theme-primary,#6200ee)_60%,transparent)] [background:color-mix(in_srgb,var(--mdc-theme-primary,#6200ee)_16%,transparent)]'
		: '[border-color:color-mix(in_srgb,currentColor_20%,transparent)] [background:color-mix(in_srgb,currentColor_4%,transparent)]'}"
>
	{#if colorHex || imageSrc || safeIconFilename}
		<div class="flex h-16 w-16 items-center justify-center" aria-hidden="true">
			{#if colorHex}
				<div
					class="hex-swatch-border rounded-sm border"
					style="width:{mediaSize}px; height:{mediaSize}px; background-color:{colorHex};"
				></div>
			{:else if imageSrc}
				<img src={imageSrc} alt={resolvedImageAlt} width={mediaSize} height={mediaSize} />
			{:else}
				<ShapeIcon filename={safeIconFilename} alt={resolvedImageAlt} size={mediaSize} />
			{/if}
		</div>
	{/if}

	<div class="flex flex-col items-center gap-1">
		<span class="text-base leading-[1.35] font-semibold">{label}</span>
		{#if supportingText}
			<span class="text-sm leading-[1.3] opacity-75">{supportingText}</span>
		{/if}
	</div>
</button>

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
