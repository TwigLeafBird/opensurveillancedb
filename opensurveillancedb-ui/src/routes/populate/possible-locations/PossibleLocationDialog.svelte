<script lang="ts">
	import Button from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';

	type DialogMode = 'create' | 'edit';
	type LocationOption = { code: string; name: string };
	type SubmitDetail = {
		mode: DialogMode;
		originalCode: string | null;
		code: string;
		name: string;
	};

	let { onDialogSubmit } = $props<{
		onDialogSubmit?: (detail: SubmitDetail) => Promise<void> | void;
	}>();

	let open = $state(false);
	let mode = $state<DialogMode>('create');
	let originalCode = $state('');
	let code = $state('');
	let name = $state('');
	let saving = $state(false);
	let formError = $state('');

	function reset() {
		open = false;
		mode = 'create';
		originalCode = '';
		code = '';
		name = '';
		saving = false;
		formError = '';
	}

	export function openCreateDialog() {
		mode = 'create';
		originalCode = '';
		code = '';
		name = '';
		formError = '';
		open = true;
	}

	export function openEditDialog(location: LocationOption) {
		mode = 'edit';
		originalCode = location.code;
		code = location.code;
		name = location.name;
		formError = '';
		open = true;
	}

	async function save() {
		const trimmedCode = code.trim();
		const trimmedName = name.trim();
		if (!trimmedCode || !trimmedName) {
			formError = 'Code and Name are required.';
			return;
		}

		saving = true;
		formError = '';

		try {
			await onDialogSubmit?.({
				mode,
				originalCode: originalCode || null,
				code: trimmedCode,
				name: trimmedName
			});
			reset();
		} catch (error) {
			formError = error instanceof Error ? error.message : 'Failed to save location.';
		} finally {
			saving = false;
		}
	}
</script>

<Dialog
	bind:open
	aria-labelledby="possible-location-dialog-title"
	aria-describedby="possible-location-dialog-content"
>
	<Title id="possible-location-dialog-title"
		>{mode === 'create' ? 'Create Possible Location' : 'Edit Possible Location'}</Title
	>
	<Content id="possible-location-dialog-content">
		<div style="display:flex; flex-direction:column; gap:8px; min-width:280px;">
			{#if mode === 'create'}
				<label for="possible-location-code">Code</label>
				<input
					id="possible-location-code"
					bind:value={code}
					placeholder="e.g. FRONT_DOOR"
					style="color:inherit; background:transparent; border:1px solid currentColor; border-radius:4px; padding:8px; caret-color:currentColor;"
				/>
			{/if}
			<label for="possible-location-name">Name</label>
			<input
				id="possible-location-name"
				bind:value={name}
				placeholder="e.g. Front Door"
				style="color:inherit; background:transparent; border:1px solid currentColor; border-radius:4px; padding:8px; caret-color:currentColor;"
			/>
			{#if formError}
				<p style="margin:0; color:#ff8a80;">{formError}</p>
			{/if}
		</div>
	</Content>
	<Actions>
		<Button onclick={reset} disabled={saving}>
			<span class="mdc-button__label">Cancel</span>
		</Button>
		<Button onclick={save} disabled={saving}>
			<span class="mdc-button__label">{mode === 'create' ? 'Create' : 'Save'}</span>
		</Button>
	</Actions>
</Dialog>
