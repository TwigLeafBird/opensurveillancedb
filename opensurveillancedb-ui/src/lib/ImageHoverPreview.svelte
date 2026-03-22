<script lang="ts">
	type Props = {
		src: string;
		alt: string;
		ariaLabel?: string;
		thumbnailWidth?: number;
		thumbnailHeight?: number;
		previewWidth?: number;
		previewHeight?: number;
		buttonClass?: string;
		thumbnailFrameClass?: string;
		thumbnailImageClass?: string;
		previewFrameClass?: string;
		previewImageClass?: string;
	};

	let {
		src,
		alt,
		ariaLabel = alt,
		thumbnailWidth = 64,
		thumbnailHeight = 64,
		previewWidth = 208,
		previewHeight = 208,
		buttonClass = '',
		thumbnailFrameClass = '',
		thumbnailImageClass = '',
		previewFrameClass = '',
		previewImageClass = ''
	}: Props = $props();

	let previewRef = $state<HTMLDivElement | null>(null);

	function positionPreview(target: HTMLElement) {
		if (!previewRef) {
			return;
		}

		const rect = target.getBoundingClientRect();
		previewRef.style.top = `${rect.top - 12}px`;
		previewRef.style.left = `${rect.left + rect.width / 2}px`;
		previewRef.style.transform = 'translate(-50%, -100%)';
	}

	function showPreview(event: MouseEvent | FocusEvent) {
		const target = event.currentTarget as HTMLElement | null;
		if (!target || !previewRef) {
			return;
		}

		positionPreview(target);
		previewRef.style.display = 'flex';
	}

	function hidePreview() {
		if (!previewRef) {
			return;
		}

		previewRef.style.display = 'none';
	}
</script>

<button
	type="button"
	class={`image-hover-preview-trigger ${buttonClass}`.trim()}
	aria-label={ariaLabel}
	onmouseenter={showPreview}
	onmouseleave={hidePreview}
	onfocus={showPreview}
	onblur={hidePreview}
>
	<div class={`image-hover-preview-thumb ${thumbnailFrameClass}`.trim()}>
		<img
			{src}
			{alt}
			width={thumbnailWidth}
			height={thumbnailHeight}
			class={`image-hover-preview-thumb-image ${thumbnailImageClass}`.trim()}
		/>
	</div>
</button>

<div
	bind:this={previewRef}
	class={`image-hover-preview-panel ${previewFrameClass}`.trim()}
	role="tooltip"
	aria-hidden="true"
>
	<img
		{src}
		{alt}
		width={previewWidth}
		height={previewHeight}
		class={`image-hover-preview-panel-image ${previewImageClass}`.trim()}
	/>
</div>

<style>
	.image-hover-preview-trigger {
		all: unset;
		display: inline-flex;
		cursor: zoom-in;
	}

	.image-hover-preview-thumb {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image-hover-preview-thumb-image {
		display: block;
		object-fit: contain;
	}

	.image-hover-preview-panel {
		position: fixed;
		display: none;
		z-index: 9999;
		align-items: center;
		justify-content: center;
		min-width: 13.5rem;
		min-height: 13.5rem;
		padding: 1.125rem;
		border-radius: 0.75rem;
		background: #f5f5f5;
		border: 1px solid color-mix(in srgb, black 15%, transparent);
		box-shadow: 0 8px 24px color-mix(in srgb, black 35%, transparent);
		pointer-events: none;
	}

	.image-hover-preview-panel-image {
		display: block;
		object-fit: contain;
	}

	@media (prefers-color-scheme: dark) {
		.image-hover-preview-panel {
			box-shadow: 0 8px 24px color-mix(in srgb, black 55%, transparent);
		}
	}
</style>
