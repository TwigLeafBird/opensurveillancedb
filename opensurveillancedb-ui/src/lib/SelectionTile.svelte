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
	class:selected
	class="selection-tile"
	{disabled}
	aria-pressed={selected}
	{onclick}
>
	{#if imageSrc || iconFilename}
		<div class="selection-tile__media" aria-hidden="true">
			{#if imageSrc}
				<img src={imageSrc} alt={imageAlt ?? label} width={mediaSize} height={mediaSize} />
			{:else}
				<ShapeIcon filename={iconFilename} alt={imageAlt ?? label} size={mediaSize} />
			{/if}
		</div>
	{/if}

	<div class="selection-tile__text">
		<span class="selection-tile__label">{label}</span>
		{#if supportingText}
			<span class="selection-tile__supporting">{supportingText}</span>
		{/if}
	</div>
</button>

<style>
	.selection-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		min-height: 10rem;
		min-width: 10rem;
		padding: 1rem;
		border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
		border-radius: 0.875rem;
		background: color-mix(in srgb, currentColor 4%, transparent);
		color: inherit;
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			background-color 0.15s ease,
			transform 0.15s ease,
			box-shadow 0.15s ease;
		text-align: center;
	}

	.selection-tile:hover:not(:disabled) {
		transform: translateY(-1px);
		border-color: color-mix(in srgb, currentColor 35%, transparent);
		background: color-mix(in srgb, currentColor 7%, transparent);
	}

	.selection-tile:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}

	.selection-tile.selected {
		border-color: var(--mdc-theme-primary, #6200ee);
		background: color-mix(in srgb, var(--mdc-theme-primary, #6200ee) 16%, transparent);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--mdc-theme-primary, #6200ee) 60%, transparent);
	}

	.selection-tile:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.selection-tile__media {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 4rem;
		height: 4rem;
	}

	.selection-tile__media :global(img) {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.selection-tile__text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		align-items: center;
	}

	.selection-tile__label {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.35;
	}

	.selection-tile__supporting {
		font-size: 0.875rem;
		opacity: 0.75;
		line-height: 1.3;
	}
</style>
