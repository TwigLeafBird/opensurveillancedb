import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TextListHoverPreview from './TextListHoverPreview.svelte';

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('TextListHoverPreview', () => {
	it('opens after the long hover delay and renders each item', async () => {
		render(TextListHoverPreview, {
			items: ['Infrared LEDs under lens', 'Microphone hole near base'],
			ariaLabel: 'Preview demo distinguishing features',
			panelLabel: 'Demo distinguishing features',
			buttonLabel: '2'
		});

		const trigger = page.getByRole('button', { name: 'Preview demo distinguishing features' });
		const previewPanel = page.getByRole('dialog', {
			name: 'Demo distinguishing features',
			includeHidden: true
		});

		await expect.element(trigger).toBeVisible();
		await expect.element(previewPanel).not.toBeVisible();

		await trigger.hover();
		await sleep(300);
		await expect.element(previewPanel).not.toBeVisible();

		await sleep(450);
		await expect.element(previewPanel).toBeVisible();
		await expect.element(page.getByText('Infrared LEDs under lens')).toBeVisible();
		await expect.element(page.getByText('Microphone hole near base')).toBeVisible();
	});

	it('does not open when there are no items', async () => {
		render(TextListHoverPreview, {
			items: [],
			ariaLabel: 'Preview demo distinguishing features',
			panelLabel: 'Demo distinguishing features',
			buttonLabel: '0'
		});

		const trigger = page.getByRole('button', { name: 'Preview demo distinguishing features' });
		const previewPanel = page.getByRole('dialog', {
			name: 'Demo distinguishing features',
			includeHidden: true
		});

		await trigger.hover();
		await sleep(800);
		await expect.element(previewPanel).not.toBeVisible();
	});
});