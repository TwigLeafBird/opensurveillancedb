<script lang="ts">
	import Button from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';

	type DialogMode = 'create' | 'edit';
	type Manufacturer = { id: string; name: string; alternate_names?: string[] | null };
	type SubmitDetail = {
		mode: DialogMode;
		originalId: string | null;
		name: string;
		alternate_names: string[] | null;
	};

	let { onDialogSubmit } = $props<{
		onDialogSubmit?: (detail: SubmitDetail) => Promise<void> | void;
	}>();

	let open = $state(false);
	let mode = $state<DialogMode>('create');
	let originalId = $state('');
	let name = $state('');
	let alternateNamesText = $state('');
	let saving = $state(false);
	let formError = $state('');

	function reset() {
		open = false;
		mode = 'create';
		originalId = '';
		name = '';
		alternateNamesText = '';
		saving = false;
		formError = '';
	}

	export function openCreateDialog() {
		mode = 'create';
		originalId = '';
		name = '';
		alternateNamesText = '';
		formError = '';
		open = true;
	}

	export function openEditDialog(manufacturer: Manufacturer) {
		mode = 'edit';
		originalId = manufacturer.id;
		name = manufacturer.name;
		alternateNamesText = (manufacturer.alternate_names ?? []).join(', ');
		formError = '';
		open = true;
	}

	function parseAlternateNames(value: string): string[] | null {
		const parsed = value
			.split(',')
			.map((entry) => entry.trim())
			.filter((entry, index, all) => entry.length > 0 && all.indexOf(entry) === index);

		return parsed.length > 0 ? parsed : null;
	}

	async function save() {
		const trimmedName = name.trim();
		if (!trimmedName) {
			formError = 'Name is required.';
			return;
		}

		saving = true;
		formError = '';

		try {
			await onDialogSubmit?.({
				mode,
				originalId: originalId || null,
				name: trimmedName,
				alternate_names: parseAlternateNames(alternateNamesText)
			});
			reset();
		} catch (error) {
			formError = error instanceof Error ? error.message : 'Failed to save manufacturer.';
		} finally {
			saving = false;
		}
	}
</script>

<Dialog
	bind:open
	aria-labelledby="manufacturer-dialog-title"
	aria-describedby="manufacturer-dialog-content"
>
	<Title id="manufacturer-dialog-title"
		>{mode === 'create' ? 'Create Manufacturer' : 'Edit Manufacturer'}</Title
	>
	<Content id="manufacturer-dialog-content">
		<div style="display:flex; flex-direction:column; gap:8px; min-width:320px;">
			<label for="manufacturer-name">Name</label>
			<input
				id="manufacturer-name"
				bind:value={name}
				placeholder="e.g. Hikvision"
				style="color:inherit; background:transparent; border:1px solid currentColor; border-radius:4px; padding:8px; caret-color:currentColor;"
			/>
			<label for="manufacturer-alt-names">Alternate Names (comma separated)</label>
			<input
				id="manufacturer-alt-names"
				bind:value={alternateNamesText}
				placeholder="e.g. Hangzhou Hikvision, Hik Vision"
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
