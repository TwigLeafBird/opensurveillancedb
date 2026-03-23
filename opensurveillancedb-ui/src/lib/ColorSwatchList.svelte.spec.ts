import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ColorSwatchList from './ColorSwatchList.svelte';

vi.mock('$lib/storage', () => ({
	getColorSwatchPublicUrl: (filename?: string | null) =>
		filename ? `https://cdn.example.test/swatch/${filename}` : null
}));

describe('ColorSwatchList', () => {
	it('renders placeholder when there are no valid visuals', async () => {
		render(ColorSwatchList, {
			colorOptions: [
				{ color_id: '1', color: { name: 'Broken', hex_code: 'not-a-color', swatch_icon: null } },
				null
			]
		});

		const placeholder = page.getByText('-');
		await expect.element(placeholder).toBeVisible();
	});

	it('renders hex swatches and image swatches when available', async () => {
		render(ColorSwatchList, {
			colorOptions: [
				{ color_id: '1', color: { name: 'Red', hex_code: 'f00', swatch_icon: 'ignored.png' } },
				{ color_id: '2', color: { name: 'Blue', hex_code: null, swatch_icon: 'blue.svg' } }
			]
		});

		const redSwatch = page.getByTitle('Red');
		await expect.element(redSwatch).toBeVisible();
		await expect.element(redSwatch).toHaveAttribute(
			'style',
			expect.stringContaining('background-color: rgb(255, 0, 0);')
		);

		const blueSwatch = page.getByRole('img', { name: 'Blue swatch' });
		await expect.element(blueSwatch).toBeVisible();
		await expect.element(blueSwatch).toHaveAttribute(
			'src',
			'https://cdn.example.test/swatch/blue.svg'
		);
	});

	it('accepts trimmed hex values with a leading hash and falls back to default title', async () => {
		render(ColorSwatchList, {
			colorOptions: [{ color_id: '3', color: { name: null, hex_code: '  #00ff88  ', swatch_icon: null } }]
		});

		const swatch = page.getByTitle('Color');
		await expect.element(swatch).toBeVisible();
		await expect.element(swatch).toHaveAttribute(
			'style',
			expect.stringContaining('background-color: rgb(0, 255, 136);')
		);
	});
});
