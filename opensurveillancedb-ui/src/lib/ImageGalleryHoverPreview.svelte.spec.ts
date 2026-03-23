import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ImageGalleryHoverPreview from './ImageGalleryHoverPreview.svelte';

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('ImageGalleryHoverPreview', () => {
	it('opens only after a long hover delay', async () => {
		render(ImageGalleryHoverPreview, {
			images: [
				{
					src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/%3E',
					alt: 'Example image 1',
					key: 'img-1'
				},
				{
					src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/%3E',
					alt: 'Example image 2',
					key: 'img-2'
				}
			],
			ariaLabel: 'Preview demo images',
			panelLabel: 'Demo image gallery',
			buttonLabel: '2'
		});

		const trigger = page.getByRole('button', { name: 'Preview demo images' });
		const previewPanel = page.getByRole('dialog', {
			name: 'Demo image gallery',
			includeHidden: true
		});

		await expect.element(trigger).toBeInTheDocument();
		await expect.element(previewPanel).not.toBeVisible();

		await trigger.hover();

		// Hover less than the configured delay to ensure it does not open immediately.
		await sleep(300);
		await expect.element(previewPanel).not.toBeVisible();

		// Wait past the long-hover threshold so the preview appears.
		await sleep(450);
		await expect.element(previewPanel).toBeVisible();

		const firstImage = page.getByRole('img', { name: 'Example image 1' });
		await expect.element(firstImage).toBeVisible();

		const secondImage = page.getByRole('img', { name: 'Example image 2' });
		await expect.element(secondImage).toBeVisible();
	});

	it('never opens when the images array is empty', async () => {
		render(ImageGalleryHoverPreview, {
			images: [],
			ariaLabel: 'Preview demo images',
			panelLabel: 'Demo image gallery',
			buttonLabel: '0'
		});

		const trigger = page.getByRole('button', { name: 'Preview demo images' });
		const previewPanel = page.getByRole('dialog', {
			name: 'Demo image gallery',
			includeHidden: true
		});

		await expect.element(trigger).toBeInTheDocument();
		await expect.element(previewPanel).not.toBeVisible();

		await trigger.hover();

		// Wait well past the threshold — no images means the panel should never open.
		await sleep(800);
		await expect.element(previewPanel).not.toBeVisible();
	});

	it('cancels the preview if the cursor leaves before the hover threshold', async () => {
		render(ImageGalleryHoverPreview, {
			images: [
				{
					src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/%3E',
					alt: 'Example image 1',
					key: 'img-1'
				}
			],
			ariaLabel: 'Preview demo images',
			panelLabel: 'Demo image gallery',
			buttonLabel: '1'
		});

		const trigger = page.getByRole('button', { name: 'Preview demo images' });
		const previewPanel = page.getByRole('dialog', {
			name: 'Demo image gallery',
			includeHidden: true
		});

		await expect.element(previewPanel).not.toBeVisible();

		await trigger.hover();

		// Back away before the delay threshold fires.
		await sleep(300);
		await trigger.unhover();

		// Wait well past the threshold — the panel should never have opened.
		await sleep(500);
		await expect.element(previewPanel).not.toBeVisible();
	});

	it('uses default buttonLabel and panelLabel when not provided', async () => {
		render(ImageGalleryHoverPreview, {
			images: [
				{
					src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/%3E',
					alt: 'Only image',
					key: 'img-1'
				}
			],
			ariaLabel: 'Library preview'
		});

		const trigger = page.getByRole('button', { name: 'Library preview' });
		await expect.element(trigger).toBeVisible();
		await expect.element(trigger).toHaveTextContent('1');

		await trigger.hover();
		await sleep(700);
		const defaultPanel = page.getByRole('dialog', { name: 'Library preview' });
		await expect.element(defaultPanel).toBeVisible();
	});
});
