<script lang="ts">
	type GalleryImage = {
		src: string;
		alt: string;
		key?: string;
	};

	type Props = {
		images: GalleryImage[];
		ariaLabel: string;
		buttonLabel?: string;
		panelLabel?: string;
		buttonClass?: string;
		panelClass?: string;
		imageClass?: string;
		cardClass?: string;
	};

	let {
		images,
		ariaLabel,
		buttonLabel = `${images.length}`,
		panelLabel = ariaLabel,
		buttonClass = '',
		panelClass = '',
		imageClass = '',
		cardClass = ''
	}: Props = $props();

	let triggerRef = $state<HTMLButtonElement | null>(null);
	let previewRef = $state<HTMLDivElement | null>(null);
	let openTimeout = 0;
	let hideTimeout = 0;
	const HOVER_OPEN_DELAY_MS = 650;

	function clearOpenTimeout() {
		if (!openTimeout) {
			return;
		}

		window.clearTimeout(openTimeout);
		openTimeout = 0;
	}

	function clearHideTimeout() {
		if (!hideTimeout) {
			return;
		}

		window.clearTimeout(hideTimeout);
		hideTimeout = 0;
	}

	function positionPreview(target: HTMLElement) {
		if (!previewRef) {
			return;
		}

		const margin = 12;
		const rect = target.getBoundingClientRect();
		const panelWidth = previewRef.offsetWidth;
		const panelHeight = previewRef.offsetHeight;
		const centeredLeft = rect.left + rect.width / 2 - panelWidth / 2;
		const maxLeft = Math.max(margin, window.innerWidth - panelWidth - margin);
		const topAbove = rect.top - panelHeight - margin;
		const topBelow = rect.bottom + margin;
		const maxTop = Math.max(margin, window.innerHeight - panelHeight - margin);

		previewRef.style.left = `${Math.min(Math.max(centeredLeft, margin), maxLeft)}px`;
		previewRef.style.top = `${Math.min(topAbove >= margin ? topAbove : topBelow, maxTop)}px`;
	}

	function openPreview(target: HTMLElement | null = triggerRef) {
		if (!target || !previewRef || images.length === 0) {
			return;
		}

		clearOpenTimeout();
		clearHideTimeout();
		previewRef.style.display = 'block';
		previewRef.style.visibility = 'hidden';
		positionPreview(target);
		previewRef.style.visibility = 'visible';
	}

	function scheduleOpenPreview(target: HTMLElement | null = triggerRef) {
		if (!target || !previewRef || images.length === 0) {
			return;
		}

		clearOpenTimeout();
		openTimeout = window.setTimeout(() => {
			openPreview(target);
		}, HOVER_OPEN_DELAY_MS);
	}

	function scheduleHide() {
		if (!previewRef) {
			return;
		}

		clearOpenTimeout();
		clearHideTimeout();
		hideTimeout = window.setTimeout(() => {
			if (!previewRef) {
				return;
			}

			previewRef.style.display = 'none';
			previewRef.style.visibility = 'hidden';
		}, 120);
	}

	function handleViewportChange() {
		if (!previewRef || !triggerRef || previewRef.style.display === 'none') {
			return;
		}

		positionPreview(triggerRef);
	}
	</script>

<svelte:window onscroll={handleViewportChange} onresize={handleViewportChange} />

<button
	bind:this={triggerRef}
	type="button"
	class={`image-gallery-hover-trigger ${buttonClass}`.trim()}
	aria-label={ariaLabel}
	aria-haspopup="dialog"
	onmouseenter={() => scheduleOpenPreview()}
	onmouseleave={scheduleHide}
>
	<span class="material-icons image-gallery-hover-trigger-icon" aria-hidden="true">photo_library</span>
	<span class="image-gallery-hover-trigger-label">{buttonLabel}</span>
</button>

<div
	bind:this={previewRef}
	class={`image-gallery-hover-panel ${panelClass}`.trim()}
	role="dialog"
	tabindex="-1"
	aria-label={panelLabel}
	onmouseenter={() => openPreview()}
	onmouseleave={scheduleHide}
>
	<div class="image-gallery-hover-scroller">
		{#each images as image, index (image.key ?? `${image.src}-${index}`)}
			<figure class={`image-gallery-hover-card ${cardClass}`.trim()}>
				<img
					src={image.src}
					alt={image.alt}
					class={`image-gallery-hover-image ${imageClass}`.trim()}
				/>
				<figcaption class="image-gallery-hover-caption">{index + 1}</figcaption>
			</figure>
		{/each}
	</div>
</div>

<style>
	.image-gallery-hover-trigger {
		all: unset;
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		padding: 0.12rem 0.35rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, black 14%, transparent);
		background: color-mix(in srgb, white 92%, transparent);
		color: inherit;
		cursor: pointer;
		line-height: 1;
	}

	.image-gallery-hover-trigger:focus-visible {
		outline: 2px solid var(--mdc-theme-primary, #ff3e00);
		outline-offset: 2px;
	}

	.image-gallery-hover-trigger-icon {
		font-size: 0.95rem;
	}

	.image-gallery-hover-trigger-label {
		font-size: 0.72rem;
		font-weight: 600;
	}

	.image-gallery-hover-panel {
		position: fixed;
		display: none;
		z-index: 9999;
		max-width: min(99vw, 140rem);
		max-height: 92vh;
		padding: 1.5rem;
		border-radius: 0.85rem;
		background: #f5f5f5;
		border: 1px solid color-mix(in srgb, black 15%, transparent);
		box-shadow: 0 12px 30px color-mix(in srgb, black 35%, transparent);
	}

	.image-gallery-hover-scroller {
		display: flex;
		gap: 1.25rem;
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 0.35rem;
		scrollbar-width: thin;
	}

	.image-gallery-hover-card {
		margin: 0;
		width: clamp(20rem, 42vw, 30rem);
		min-width: clamp(20rem, 42vw, 30rem);
		flex: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		align-items: center;
	}

	.image-gallery-hover-image {
		display: block;
		width: 100%;
		height: clamp(20rem, 42vw, 30rem);
		object-fit: contain;
		border-radius: 0.7rem;
		border: 1px solid color-mix(in srgb, black 12%, transparent);
		background: white;
		padding: 0.9rem;
	}

	.image-gallery-hover-caption {
		font-size: 0.88rem;
		opacity: 0.72;
		line-height: 1;
	}

	@media (prefers-color-scheme: dark) {
		.image-gallery-hover-trigger {
			background: color-mix(in srgb, white 10%, transparent);
		}

		.image-gallery-hover-panel {
			box-shadow: 0 12px 30px color-mix(in srgb, black 55%, transparent);
		}

		.image-gallery-hover-image {
			background: color-mix(in srgb, white 4%, transparent);
		}
	}
</style>