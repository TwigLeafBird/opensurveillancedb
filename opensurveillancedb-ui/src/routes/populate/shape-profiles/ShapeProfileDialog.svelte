<script lang="ts">
	import Button from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Select, { Option } from '@smui/select';
	import { listIconFilenames, validateImageFile } from '$lib/storage';

	type DialogMode = 'create' | 'edit';
	type ShapeProfile = { id: string; short_name: string; icon?: string | null };
	type SubmitDetail = {
		mode: DialogMode;
		originalId: string | null;
		short_name: string;
		iconFile: File | null;
		selectedIcon: string | null;
	};

	let { onDialogSubmit } = $props<{
		onDialogSubmit?: (detail: SubmitDetail) => Promise<void> | void;
	}>();

	let open = $state(false);
	let mode = $state<DialogMode>('create');
	let originalId = $state('');
	let originalIcon = $state<string | null>(null);
	let selectedIcon = $state('');
	let shortName = $state('');
	let iconFile = $state<File | null>(null);
	let iconInputKey = $state(0);
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

	function reset() {
		open = false;
		mode = 'create';
		originalId = '';
		originalIcon = null;
		selectedIcon = '';
		shortName = '';
		iconFile = null;
		iconInputKey += 1;
		saving = false;
		formError = '';
	}

	export function openCreateDialog() {
		mode = 'create';
		originalId = '';
		originalIcon = null;
		selectedIcon = '';
		shortName = '';
		iconFile = null;
		iconInputKey += 1;
		formError = '';
		open = true;
	}

	export function openEditDialog(shapeProfile: ShapeProfile) {
		void ensureIconOptionsLoaded();
		mode = 'edit';
		originalId = shapeProfile.id;
		originalIcon = shapeProfile.icon ?? null;
		selectedIcon = shapeProfile.icon ?? '';
		shortName = shapeProfile.short_name;
		iconFile = null;
		iconInputKey += 1;
		formError = '';
		open = true;
	}

	function onIconInputChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		iconFile = input.files?.[0] ?? null;
	}

	async function save() {
		const trimmedShortName = shortName.trim();
		if (!trimmedShortName) {
			formError = 'Short Name is required.';
			return;
		}
		if (iconFile && !validateImageFile(iconFile)) {
			formError = 'Icon must be a PNG, JPG, JPEG, GIF, or SVG image.';
			return;
		}

		saving = true;
		formError = '';

		try {
			await onDialogSubmit?.({
				mode,
				originalId: originalId || null,
				short_name: trimmedShortName,
				iconFile,
				selectedIcon: selectedIcon.trim() || null
			});
			// Force refresh of icon list on next dialog open
			iconsLoaded = false;
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
			<label for="shape-profile-icon-file">Upload Icon (optional)</label>
			{#key iconInputKey}
				<input
					id="shape-profile-icon-file"
					type="file"
					accept=".png,.jpg,.jpeg,.gif,.svg,image/png,image/jpeg,image/gif,image/svg+xml"
					onchange={onIconInputChange}
					style="color:inherit; background:transparent; border:1px solid currentColor; border-radius:4px; padding:8px; caret-color:currentColor;"
				/>
			{/key}
			{#if mode === 'edit' && originalIcon && !iconFile}
				<p style="margin:0; opacity:0.8;">Current icon: {originalIcon}</p>
			{/if}
			{#if mode === 'edit'}
				<p style="margin:0;">Or select an existing icon</p>
				<Select
					bind:value={selectedIcon}
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
			{/if}
			{#if iconFile}
				<p style="margin:0; opacity:0.8;">Selected file: {iconFile.name}</p>
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
