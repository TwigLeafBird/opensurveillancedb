import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DeviceResultsTable from './DeviceResultsTable.svelte';

vi.mock('$lib/storage', () => ({
	getModelExampleImagePublicUrl: (filename?: string | null) =>
		filename && filename.startsWith('ok-')
			? `https://cdn.example.test/model/${filename}`
			: null,
	getManufacturerIconPublicUrl: (filename?: string | null) =>
		filename ? `https://cdn.example.test/manufacturer/${filename}` : null,
	getColorSwatchPublicUrl: (filename?: string | null) =>
		filename ? `https://cdn.example.test/swatch/${filename}` : null,
	getIconPublicUrl: (filename?: string | null) =>
		filename ? `https://cdn.example.test/shape/${filename}` : null
}));

vi.mock('$lib/url', () => ({
	sanitizeHref: (u?: string | null) => (u && u.startsWith('https://') ? u : null)
}));

function createDevice(overrides: Record<string, unknown>) {
	return {
		id: 'dev-1',
		name: 'Default Device',
		example_images: [],
		manufacturer: null,
		device_shape_profile: null,
		shape_profile: null,
		device_color_option: [],
		device_possible_location: [],
		datasheet_url: null,
		product_url: null,
		...overrides
	} as any;
}

describe('DeviceResultsTable', () => {
	it('shows empty state when there are no results', async () => {
		render(DeviceResultsTable, { deviceInfos: [] });

		await expect.element(page.getByText('No matching device models found.')).toBeVisible();
		await expect
			.element(page.getByRole('table', { name: 'Possible device model results' }))
			.not.toBeInTheDocument();
	});

	it('renders the results table and core row content', async () => {
		render(DeviceResultsTable, {
			deviceInfos: [
				createDevice({
					id: 'cam-123',
					name: 'Street Camera X',
					manufacturer: { name: 'Acme Corp', icons: [] },
					device_shape_profile: { short_name: 'Dome', icon: 'dome.svg' }
				})
			]
		});

		await expect
			.element(page.getByRole('table', { name: 'Possible device model results' }))
			.toBeVisible();
		await expect.element(page.getByText('Street Camera X')).toBeVisible();
		await expect.element(page.getByText('cam-123')).toBeVisible();
		await expect.element(page.getByText('Acme Corp')).toBeVisible();
		await expect.element(page.getByText('Dome')).toBeVisible();
	});

	it('renders preview trigger only for rows with resolvable example images', async () => {
		render(DeviceResultsTable, {
			deviceInfos: [
				createDevice({
					name: 'Previewable Camera',
					example_images: ['ok-1.jpg', 'bad.jpg']
				}),
				createDevice({
					id: 'dev-2',
					name: 'No Preview Camera',
					example_images: ['bad.jpg']
				})
			]
		});

		const previewTrigger = page.getByRole('button', {
			name: 'Preview Previewable Camera example images'
		});
		await expect.element(previewTrigger).toBeVisible();
		await expect.element(previewTrigger).toHaveTextContent('1');

		await expect
			.element(page.getByRole('button', { name: 'Preview No Preview Camera example images' }))
			.not.toBeInTheDocument();
	});

	it('renders location names and falls back to location code when needed', async () => {
		render(DeviceResultsTable, {
			deviceInfos: [
				createDevice({
					name: 'Location Camera',
					device_possible_location: [
						{ location_code: 'LC-1', device_location: { name: 'Street Light' } },
						{ location_code: 'LC-2', device_location: null }
					]
				})
			]
		});

		await expect.element(page.getByText('Street Light, LC-2')).toBeVisible();
	});

	it('uses shape_profile fallback when shape object is missing', async () => {
		render(DeviceResultsTable, {
			deviceInfos: [
				createDevice({
					name: 'Fallback Shape Camera',
					device_shape_profile: null,
					shape_profile: 'Bullet'
				})
			]
		});

		await expect.element(page.getByText('Bullet')).toBeVisible();
	});

	it('renders only sanitized datasheet/product links', async () => {
		render(DeviceResultsTable, {
			deviceInfos: [
				createDevice({
					name: 'Safe Links Camera',
					datasheet_url: 'https://example.com/datasheet.pdf',
					product_url: 'javascript:alert(1)'
				})
			]
		});

		const links = page.getByRole('link', { name: 'link' }).all();
		expect(links.length).toBe(1);
		await expect.element(links[0]).toHaveAttribute('href', 'https://example.com/datasheet.pdf');
		await expect.element(links[0]).toHaveAttribute('target', '_blank');
		await expect.element(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
	});
});
