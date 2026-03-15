<script lang="ts">
	import Snackbar, { Actions, Label } from '@smui/snackbar';
	import IconButton from '@smui/icon-button';

	type SnackbarRef = {
		open: () => void;
		close: (reason?: string) => void;
	};

	let message = $state('');
	let snackbarRef = $state(null) as SnackbarRef | null;

	export function show(nextMessage: string) {
		message = nextMessage;
		snackbarRef?.open();
	}
</script>

<Snackbar bind:this={snackbarRef} timeoutMs={8000}>
	<Label>{message}</Label>
	<Actions>
		<IconButton
			class="material-icons"
			title="Dismiss"
			aria-label="Dismiss"
			onclick={() => snackbarRef?.close('dismiss')}>close</IconButton
		>
	</Actions>
</Snackbar>
