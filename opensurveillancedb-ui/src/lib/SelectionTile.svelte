<script lang="ts">
	import ShapeIcon from '$lib/ShapeIcon.svelte';

	type Props = {
		label: string;
		supportingText?: string | null;
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
		selected = false,
		disabled = false,
		iconFilename = null,
		imageSrc = null,
		imageAlt = null,
		onclick
	}: Props = $props();

	const mediaSize = 56;
</script>

<button
	type="button"
	{disabled}
	aria-pressed={selected}
	{onclick}
	class="flex flex-col items-center justify-center gap-3 min-h-40 min-w-40 p-4 border rounded-[0.875rem] text-inherit cursor-pointer transition-all duration-150 ease-in-out text-center [&:hover:not(:disabled)]:-translate-y-px [&:hover:not(:disabled)]:[border-color:color-mix(in_srgb,currentColor_35%,transparent)] [&:hover:not(:disabled)]:[background:color-mix(in_srgb,currentColor_7%,transparent)] focus-visible:[outline:2px_solid_currentColor] focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed {selected ? '[border-color:var(--mdc-theme-primary,#6200ee)] [background:color-mix(in_srgb,var(--mdc-theme-primary,#6200ee)_16%,transparent)] [box-shadow:0_0_0_1px_color-mix(in_srgb,var(--mdc-theme-primary,#6200ee)_60%,transparent)]' : '[border-color:color-mix(in_srgb,currentColor_20%,transparent)] [background:color-mix(in_srgb,currentColor_4%,transparent)]'}"
>
	{#if imageSrc || iconFilename}
		<div class="flex items-center justify-center w-16 h-16" aria-hidden="true">
			{#if imageSrc}
				<img src={imageSrc} alt={imageAlt ?? label} width={mediaSize} height={mediaSize} />
			{:else}
				<ShapeIcon filename={iconFilename} alt={imageAlt ?? label} size={mediaSize} />
			{/if}
		</div>
	{/if}

	<div class="flex flex-col gap-1 items-center">
		<span class="text-base font-semibold leading-[1.35]">{label}</span>
		{#if supportingText}
			<span class="text-sm opacity-75 leading-[1.3]">{supportingText}</span>
		{/if}
	</div>
</button>

