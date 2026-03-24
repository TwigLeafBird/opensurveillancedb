<script lang="ts">
	type Props = {
		items: string[];
		ariaLabel: string;
		buttonLabel?: string;
		panelLabel?: string;
		buttonClass?: string;
		panelClass?: string;
		listClass?: string;
	};

	let {
		items,
		ariaLabel,
		buttonLabel = `${items.length}`,
		panelLabel = ariaLabel,
		buttonClass = '',
		panelClass = '',
		listClass = ''
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
		if (!target || !previewRef || items.length === 0) {
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
		if (!target || !previewRef || items.length === 0) {
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
	class={`text-list-hover-trigger ${buttonClass}`.trim()}
	aria-label={ariaLabel}
	aria-haspopup="dialog"
	onmouseenter={() => scheduleOpenPreview()}
	onmouseleave={scheduleHide}
>
	<span class="material-icons text-list-hover-trigger-icon" aria-hidden="true">notes</span>
	<span class="text-list-hover-trigger-label">{buttonLabel}</span>
</button>

<div
	bind:this={previewRef}
	class={`text-list-hover-panel ${panelClass}`.trim()}
	role="dialog"
	tabindex="-1"
	aria-label={panelLabel}
	onmouseenter={() => openPreview()}
	onmouseleave={scheduleHide}
>
	<p class="text-list-hover-title">{panelLabel}</p>
	<ul class={`text-list-hover-list ${listClass}`.trim()}>
		{#each items as item, index (`${item}-${index}`)}
			<li>{item}</li>
		{/each}
	</ul>
</div>

<style>
	.text-list-hover-trigger {
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

	.text-list-hover-trigger:focus-visible {
		outline: 2px solid var(--mdc-theme-primary, #ff3e00);
		outline-offset: 2px;
	}

	.text-list-hover-trigger-icon {
		font-size: 0.95rem;
	}

	.text-list-hover-trigger-label {
		font-size: 0.72rem;
		font-weight: 600;
	}

	.text-list-hover-panel {
		position: fixed;
		display: none;
		z-index: 9999;
		max-width: min(28rem, calc(100vw - 1.5rem));
		max-height: min(24rem, calc(100vh - 1.5rem));
		overflow: auto;
		padding: 0.9rem 1rem;
		border-radius: 0.85rem;
		background: #f5f5f5;
		border: 1px solid color-mix(in srgb, black 15%, transparent);
		box-shadow: 0 12px 30px color-mix(in srgb, black 35%, transparent);
	}

	.text-list-hover-title {
		margin: 0 0 0.6rem;
		font-size: 0.9rem;
		font-weight: 700;
	}

	.text-list-hover-list {
		margin: 0;
		padding-left: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.text-list-hover-list li {
		line-height: 1.35;
		word-break: break-word;
	}

	@media (prefers-color-scheme: dark) {
		.text-list-hover-trigger {
			background: color-mix(in srgb, white 10%, transparent);
		}

		.text-list-hover-panel {
			box-shadow: 0 12px 30px color-mix(in srgb, black 55%, transparent);
		}
	}
</style>