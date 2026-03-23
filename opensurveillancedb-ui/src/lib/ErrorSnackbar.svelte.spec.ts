import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ErrorSnackbar from './ErrorSnackbar.svelte';

describe('ErrorSnackbar', () => {
	it('renders a dismiss action button', async () => {
		render(ErrorSnackbar);

		const dismissButton = page.getByRole('button', { name: 'Dismiss' });
		await expect.element(dismissButton).toBeInTheDocument();
	});

	it('updates the snackbar message via the exported show function', async () => {
		const { component } = render(ErrorSnackbar);

		component.show('Could not save your changes');

		const message = page.getByText('Could not save your changes');
		await expect.element(message).toBeInTheDocument();
	});

	it('replaces the existing message when show is called again', async () => {
		const { component } = render(ErrorSnackbar);

		component.show('First message');
		await expect.element(page.getByText('First message')).toBeInTheDocument();

		component.show('Second message');
		await expect.element(page.getByText('Second message')).toBeInTheDocument();
	});
});
