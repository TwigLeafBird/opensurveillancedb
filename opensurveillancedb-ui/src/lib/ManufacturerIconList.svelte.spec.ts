import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ManufacturerIconList from './ManufacturerIconList.svelte';

vi.mock('$lib/storage', () => ({
	getManufacturerIconPublicUrl: (filename?: string | null) =>
		filename === 'valid-a.svg' || filename === 'valid-b.png'
			? `https://cdn.example.test/manufacturer/${filename}`
			: null
}));

describe('ManufacturerIconList', () => {
	it('renders empty text when no icon resolves to a URL', async () => {
		render(ManufacturerIconList, {
			icons: ['broken.svg', 'invalid-name'],
			manufacturerName: 'Acme',
			emptyText: 'No icons yet'
		});

		const emptyText = page.getByText('No icons yet');
		await expect.element(emptyText).toBeVisible();
	});

	it('renders hover previews for all valid icon URLs', async () => {
		render(ManufacturerIconList, {
			icons: ['valid-a.svg', 'ignored.jpg', 'valid-b.png'],
			manufacturerName: 'Acme'
		});

		const firstTrigger = page.getByRole('button', { name: 'Acme icon 1' });
		const secondTrigger = page.getByRole('button', { name: 'Acme icon 2' });
		await expect.element(firstTrigger).toBeVisible();
		await expect.element(secondTrigger).toBeVisible();

		const firstThumb = page.getByRole('img', { name: 'Acme icon 1' });
		const secondThumb = page.getByRole('img', { name: 'Acme icon 2' });
		await expect.element(firstThumb).toHaveAttribute(
			'src',
			'https://cdn.example.test/manufacturer/valid-a.svg'
		);
		await expect.element(secondThumb).toHaveAttribute(
			'src',
			'https://cdn.example.test/manufacturer/valid-b.png'
		);
	});

	it('uses default empty text when icons are null', async () => {
		render(ManufacturerIconList, {
			icons: null,
			manufacturerName: 'Acme'
		});

		const emptyText = page.getByText('-');
		await expect.element(emptyText).toBeVisible();
	});
});
