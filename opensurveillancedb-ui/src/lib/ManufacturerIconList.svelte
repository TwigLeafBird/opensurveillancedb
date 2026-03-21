<script lang="ts">
	import { getManufacturerIconPublicUrl } from '$lib/storage';

	type Props = {
		icons?: string[] | null;
		manufacturerName: string;
		emptyText?: string;
	};

	let { icons = [], manufacturerName, emptyText = '-' }: Props = $props();

	const iconUrls = $derived(
		(icons ?? [])
			.map((filename) => ({ filename, url: getManufacturerIconPublicUrl(filename) }))
			.filter((entry) => !!entry.url)
	);

	let previewPos = $state({ top: '0px', left: '0px', display: 'none' });
	let triggerRefs: HTMLDivElement[] = [];

	function updatePreviewPosition(trigger: HTMLDivElement, preview: HTMLDivElement) {
		const triggerRect = trigger.getBoundingClientRect();
		const triggerCenterX = triggerRect.left + triggerRect.width / 2;
		const triggerTopY = triggerRect.top;

		preview.style.top = triggerTopY - 12 + 'px';
		preview.style.left = triggerCenterX + 'px';
		preview.style.transform = 'translate(-50%, -100%)';
	}

	function handleTriggerMouseEnter(event: MouseEvent, preview: HTMLDivElement) {
		const trigger = event.currentTarget as HTMLDivElement;
		updatePreviewPosition(trigger, preview);
	}
</script>

{#if iconUrls.length > 0}
	<div class="manufacturer-icons-wrap">
		{#each iconUrls as icon, index (`${icon.filename}-${index}`)}
			<button
				type="button"
				class="manufacturer-icon-trigger"
				aria-label={`${manufacturerName} icon ${index + 1}`}
				style="all: unset; cursor: default;"
				onmouseenter={(e) => {
					const preview = (e.currentTarget as HTMLElement).querySelector(
						'.manufacturer-icon-preview'
					) as HTMLDivElement;
					if (preview) {
						preview.style.display = 'flex';
						handleTriggerMouseEnter(e as any, preview);
					}
				}}
				onmouseleave={(e) => {
					const preview = (e.currentTarget as HTMLElement).querySelector(
						'.manufacturer-icon-preview'
					) as HTMLDivElement;
					if (preview) {
						preview.style.display = 'none';
					}
				}}
			>
				<div class:manufacturer-icon-thumb-primary={index === 0} class="manufacturer-icon-thumb">
					<img
						src={icon.url}
						alt={`${manufacturerName} icon ${index + 1}`}
						width="24"
						height="24"
						class="h-6 w-6 object-contain"
					/>
				</div>
				<div class="manufacturer-icon-preview" role="tooltip" aria-hidden="true">
					<img
						src={icon.url}
						alt={`${manufacturerName} icon preview ${index + 1}`}
						width="112"
						height="112"
						class="max-h-28 max-w-28 object-contain"
					/>
				</div>
			</button>
		{/each}
	</div>
{:else}
	{emptyText}
{/if}

<style>
	.manufacturer-icons-wrap {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		overflow-x: auto;
		overflow-y: visible;
		padding-block: 0.25rem;
		padding-left: 0.5rem;
		white-space: nowrap;
	}

	.manufacturer-icon-trigger {
		position: relative;
		display: inline-flex;
	}

	.manufacturer-icon-thumb {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0.2rem;
		border-radius: 0.4rem;
		background: #f5f5f5;
		border: 1px solid color-mix(in srgb, black 15%, transparent);
	}

	.manufacturer-icon-thumb-primary {
		outline: 2px solid var(--mdc-theme-primary, #ff3e00);
		outline-offset: 1px;
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--mdc-theme-primary, #ff3e00) 35%, transparent);
	}

	.manufacturer-icon-preview {
		position: fixed;
		display: none;
		z-index: 9999;
		align-items: center;
		justify-content: center;
		min-width: 7.5rem;
		min-height: 7.5rem;
		padding: 0.75rem;
		border-radius: 0.75rem;
		background: #f5f5f5;
		border: 1px solid color-mix(in srgb, black 15%, transparent);
		box-shadow: 0 8px 24px color-mix(in srgb, black 35%, transparent);
		pointer-events: none;
	}

	@media (prefers-color-scheme: dark) {
		.manufacturer-icon-preview {
			box-shadow: 0 8px 24px color-mix(in srgb, black 55%, transparent);
		}
	}
</style>
