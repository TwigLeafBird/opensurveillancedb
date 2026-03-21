<script lang="ts">
	import '$lib/hex-swatch-border.css';
	import ShapeIcon from './ShapeIcon.svelte';
	import { validateFilename } from '$lib/storage';

	type Props = {
		label: string;
		hideLabel?: boolean;
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
		hideLabel = false,
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
	aria-label={label}
	aria-pressed={selected}
	{onclick}
	class="flex min-h-40 min-w-40 cursor-pointer flex-col items-center {imageSrc
		? 'justify-start'
		: 'justify-center'} gap-2 rounded-[0.875rem] border [border-color:color-mix(in_srgb,#1a1a1a_20%,transparent)] [background-color:#f5f5f5] p-3 text-center [color:#1a1a1a] transition-all duration-150 ease-in-out focus-visible:[outline:2px_solid_currentColor] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 [&:hover:not(:disabled)]:-translate-y-px [&:hover:not(:disabled)]:[border-color:color-mix(in_srgb,#1a1a1a_35%,transparent)] {selected
		? '[border-color:var(--mdc-theme-primary,#ff3e00)] [box-shadow:0_0_0_3px_var(--mdc-theme-primary,#ff3e00)]'
		: ''}"
>
	{#if colorHex || imageSrc || safeIconFilename}
		<div
			class="{imageSrc || colorHex
				? 'w-full flex-1'
				: 'h-16 w-16'} flex items-center justify-center"
			aria-hidden="true"
		>
			{#if colorHex}
				<div
					class="hex-swatch-border aspect-square max-h-full w-full max-w-full rounded-sm border"
					style="background-color:{colorHex};"
				></div>
			{:else if imageSrc}
				<img
					src={imageSrc}
					alt={resolvedImageAlt}
					class="m-2 max-h-full max-w-full object-contain"
				/>
			{:else}
				<ShapeIcon filename={safeIconFilename} alt={resolvedImageAlt} size={mediaSize} />
			{/if}
		</div>
	{/if}

	<div class="flex flex-col items-center gap-1">
		{#if !hideLabel}
			<span
				class="{colorHex || imageSrc || safeIconFilename
					? 'text-base'
					: 'text-[2rem]'} leading-[1.35] font-semibold">{label}</span
			>
		{/if}
		{#if supportingText}
			<span class="text-sm leading-[1.3] opacity-75">{supportingText}</span>
		{/if}
	</div>
</button>
