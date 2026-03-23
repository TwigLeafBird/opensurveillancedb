import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ImageHoverPreview from './ImageHoverPreview.svelte';

describe('ImageHoverPreview', () => {
	it('shows and hides the tooltip preview on hover and unhover', async () => {
		render(ImageHoverPreview, {
			src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/%3E',
			alt: 'Preview image'
		});

		const trigger = page.getByRole('button', { name: 'Preview image' });
		const tooltip = page.getByRole('tooltip', { includeHidden: true });

		await expect.element(tooltip).not.toBeVisible();

		await trigger.hover();
		await expect.element(tooltip).toBeVisible();

		await trigger.unhover();
		await expect.element(tooltip).not.toBeVisible();
	});

	it('uses custom dimensions for thumbnail and preview image', async () => {
		render(ImageHoverPreview, {
			src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/%3E',
			alt: 'Sized image',
			thumbnailWidth: 24,
			thumbnailHeight: 26,
			previewWidth: 300,
			previewHeight: 220
		});

		const trigger = page.getByRole('button', { name: 'Sized image' });
		const tooltip = page.getByRole('tooltip', { includeHidden: true });
		const thumbnailImage = trigger.getByAltText('Sized image');
		const previewImage = tooltip.getByAltText('Sized image');

		await expect.element(thumbnailImage).toHaveAttribute('width', '24');
		await expect.element(thumbnailImage).toHaveAttribute('height', '26');

		await trigger.hover();
		await expect.element(previewImage).toHaveAttribute('width', '300');
		await expect.element(previewImage).toHaveAttribute('height', '220');
	});

	it('uses ariaLabel when provided instead of alt text', async () => {
		render(ImageHoverPreview, {
			src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/%3E',
			alt: 'Underlying alt text',
			ariaLabel: 'Custom trigger label'
		});

		const trigger = page.getByRole('button', { name: 'Custom trigger label' });
		await expect.element(trigger).toBeInTheDocument();
	});

	it('shows and hides preview on focus and blur', async () => {
		render(ImageHoverPreview, {
			src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/%3E',
			alt: 'Focusable image'
		});

		const trigger = page.getByRole('button', { name: 'Focusable image' });
		const tooltip = page.getByRole('tooltip', { includeHidden: true });

		await expect.element(tooltip).not.toBeVisible();
		await trigger.click();
		await expect.element(tooltip).toBeVisible();
		await trigger.unhover();
		await expect.element(tooltip).not.toBeVisible();
	});
});
