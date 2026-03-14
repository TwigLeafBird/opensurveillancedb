<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Select, { Option } from '@smui/select';
	import { listIconFilenames, validateFilename } from '$lib/storage';

	type DialogMode = 'create' | 'edit';
	type ShapeProfile = { id: string; short_name: string; icon?: string | null };
	type SubmitDetail = {
		mode: DialogMode;
		originalId: string | null;
		short_name: string;
		icon: string | null;
	};

	let { onDialogSubmit } = $props<{
		onDialogSubmit?: (detail: SubmitDetail) => Promise<void> | void;
	}>();

	let open = $state(false);
	let mode = $state<DialogMode>('create');
	let originalId = $state('');
	let shortName = $state('');
	let icon = $state('');
	let iconOptions = $state<string[]>([]);
	let loadingIcons = $state(false);
	let iconOptionsError = $state('');
	let iconsLoaded = $state(false);
	let saving = $state(false);
	let formError = $state('');

	async function ensureIconOptionsLoaded() {
		if (iconsLoaded || loadingIcons) {
			return;
		}

		loadingIcons = true;
		iconOptionsError = '';
		try {
			iconOptions = await listIconFilenames();
			iconsLoaded = true;
		} catch (error) {
			iconOptionsError = error instanceof Error ? error.message : 'Failed to load icons.';
		} finally {
			loadingIcons = false;
		}
	}

	onMount(() => {
		void ensureIconOptionsLoaded();
	});

	function reset() {
		open = false;
		mode = 'create';
		originalId = '';
		shortName = '';
		icon = '';
		saving = false;
		formError = '';
	}

	export function openCreateDialog() {
		void ensureIconOptionsLoaded();
		mode = 'create';
		originalId = '';
		shortName = '';
		icon = '';
		formError = '';
		open = true;
	}

	export function openEditDialog(shapeProfile: ShapeProfile) {
		void ensureIconOptionsLoaded();
		mode = 'edit';
		originalId = shapeProfile.id;
		shortName = shapeProfile.short_name;
		icon = shapeProfile.icon ?? '';
		formError = '';
		open = true;
	}

	async function save() {
		const trimmedShortName = shortName.trim();
		const trimmedIcon = icon.trim();
		if (!trimmedShortName) {
			formError = 'Short Name is required.';
			return;
		}
		if (trimmedIcon && !validateFilename(trimmedIcon)) {
			formError = 'Icon must be a safe filename with png, jpg, jpeg, gif, or svg extension.';
			return;
		}

		saving = true;
		formError = '';

		try {
			await onDialogSubmit?.({
				mode,
				originalId: originalId || null,
				short_name: trimmedShortName,
				icon: trimmedIcon || null
			});
			reset();
		} catch (error) {
			formError = error instanceof Error ? error.message : 'Failed to save shape profile.';
		} finally {
			saving = false;
		}
	}
</script>

<Dialog
	bind:open
	aria-labelledby="shape-profile-dialog-title"
	aria-describedby="shape-profile-dialog-content"
>
	<Title id="shape-profile-dialog-title"
		>{mode === 'create' ? 'Create Shape Profile' : 'Edit Shape Profile'}</Title
	>
	<Content id="shape-profile-dialog-content" style="overflow: visible;">
		<div style="display:flex; flex-direction:column; gap:8px; min-width:320px;">
			<label for="shape-profile-short-name">Short Name</label>
			<input
				id="shape-profile-short-name"
				bind:value={shortName}
				placeholder="e.g. Bullet"
				style="color:inherit; background:transparent; border:1px solid currentColor; border-radius:4px; padding:8px; caret-color:currentColor;"
			/>
			<label for="shape-profile-icon">Icon Filename</label>
			<Select
				bind:value={icon}
				variant="filled"
				noLabel
				menu$fixed
				menu$fullWidth={false}
				style="width:100%;"
			>
				<Option value="">No icon</Option>
				{#each iconOptions as iconOption}
					<Option value={iconOption}>{iconOption}</Option>
				{/each}
			</Select>
			{#if loadingIcons}
				<p style="margin:0; opacity:0.8;">Loading icons…</p>
			{:else if iconOptionsError}
				<p style="margin:0; color:#ff8a80;">{iconOptionsError}</p>
			{/if}
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
