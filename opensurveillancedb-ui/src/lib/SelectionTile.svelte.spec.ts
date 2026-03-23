import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SelectionTile from './SelectionTile.svelte';

vi.mock('$lib/storage', () => ({
	validateFilename: (filename?: string | null) => {
		if (!filename) {
			return null;
		}
		return /^[a-zA-Z0-9._-]+\.(png|jpe?g|gif|svg)$/i.test(filename) ? filename : null;
	},
	getIconPublicUrl: (filename?: string | null) =>
		filename
			? 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22/%3E'
			: null
}));

describe('SelectionTile', () => {
	it('renders label, supporting text, and pressed/disabled state', async () => {
		render(SelectionTile, {
			label: 'Dome',
			supportingText: 'Often on ceilings',
			selected: true,
			disabled: true
		});

		const button = page.getByRole('button', { name: 'Dome' });
		await expect.element(button).toBeVisible();
		await expect.element(button).toHaveAttribute('aria-pressed', 'true');
		await expect.element(button).toBeDisabled();

		const supportingText = page.getByText('Often on ceilings');
		await expect.element(supportingText).toBeVisible();
	});

	it('renders a color swatch when colorHex is provided', async () => {
		const { container } = render(SelectionTile, {
			label: 'Green',
			colorHex: '#00ff00'
		});

		await expect.element(page.getByRole('button', { name: 'Green' })).toBeVisible();

		const swatch = container.querySelector('.hex-swatch-border') as HTMLElement | null;
		expect(swatch).not.toBeNull();
		expect(swatch?.style.backgroundColor).toBe('rgb(0, 255, 0)');
	});

	it('renders the provided image with fallback alt text from label', async () => {
		const { container } = render(SelectionTile, {
			label: 'Pole camera',
			imageSrc: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/%3E',
			imageAlt: '   '
		});

		const image = container.querySelector('img[alt="Pole camera image"]') as HTMLImageElement | null;
		expect(image).not.toBeNull();
		expect(image?.getAttribute('src')).toContain('data:image/svg+xml');
	});

	it('renders shape icon image for a valid icon filename', async () => {
		const { container } = render(SelectionTile, {
			label: 'Box camera',
			iconFilename: 'box.svg'
		});

		const image = container.querySelector('img[alt="Box camera image"]') as HTMLImageElement | null;
		expect(image).not.toBeNull();
		expect(image?.getAttribute('src')).toContain('data:image/svg+xml');
	});

	it('hides the visual label text when hideLabel is true', async () => {
		render(SelectionTile, {
			label: 'Hidden label tile',
			hideLabel: true,
			supportingText: 'Only supporting text'
		});

		const button = page.getByRole('button', { name: 'Hidden label tile' });
		await expect.element(button).toBeVisible();
		await expect.element(page.getByText('Only supporting text')).toBeVisible();
		await expect.element(page.getByText('Hidden label tile')).not.toBeInTheDocument();
	});

	it('invokes onclick when clicked', async () => {
		const onclick = vi.fn();
		render(SelectionTile, {
			label: 'Clickable tile',
			onclick
		});

		const button = page.getByRole('button', { name: 'Clickable tile' });
		await button.click();
		expect(onclick).toHaveBeenCalledTimes(1);
	});
});
