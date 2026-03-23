import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ShapeIcon from './ShapeIcon.svelte';

vi.mock('$lib/storage', () => ({
	getIconPublicUrl: (filename?: string | null) =>
		filename && filename !== 'missing.svg' ? `https://cdn.example.test/shape/${filename}` : null
}));

describe('ShapeIcon', () => {
	it('renders an image when the icon URL resolves', () => {
		const { container } = render(ShapeIcon, {
			filename: 'dome.svg',
			alt: 'Dome icon',
			size: 48
		});

		const image = container.querySelector('img[alt="Dome icon"]') as HTMLImageElement | null;
		expect(image).not.toBeNull();
		expect(image?.getAttribute('src')).toBe('https://cdn.example.test/shape/dome.svg');
		expect(image?.getAttribute('width')).toBe('48');
		expect(image?.getAttribute('height')).toBe('48');
	});

	it('renders filename fallback text when URL is unavailable', () => {
		const { container } = render(ShapeIcon, {
			filename: null,
			size: 40
		});

		const fallback = container.querySelector('span') as HTMLSpanElement | null;
		expect(fallback).not.toBeNull();
		expect(fallback?.textContent?.trim()).toBe('-');
		expect(fallback?.style.width).toBe('40px');
		expect(fallback?.style.height).toBe('40px');
	});

	it('hides the image element after an error event', () => {
		const { container } = render(ShapeIcon, {
			filename: 'broken.svg',
			alt: 'Broken icon'
		});

		const image = container.querySelector('img[alt="Broken icon"]') as HTMLImageElement | null;
		expect(image).not.toBeNull();

		image?.dispatchEvent(new Event('error'));
		expect(image?.style.display).toBe('none');
	});

	it('renders the provided filename in fallback text when URL is unavailable', () => {
		const { container } = render(ShapeIcon, {
			filename: 'missing.svg',
			alt: null,
			size: 24
		});

		const fallback = container.querySelector('span') as HTMLSpanElement | null;
		expect(fallback).not.toBeNull();
		expect(fallback?.textContent?.trim()).toBe('missing.svg');
	});
});
