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
	<Content id="shape-profile-dialog-content" class="overflow-visible">
		<div class="flex min-w-80 flex-col gap-2">
			<label for="shape-profile-short-name">Short Name</label>
			<input
				id="shape-profile-short-name"
				bind:value={shortName}
				placeholder="e.g. Bullet"
				class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
			/>
			<label for="shape-profile-icon-file">Upload Icon (optional)</label>
			{#key iconInputKey}
				<input
					id="shape-profile-icon-file"
					type="file"
					accept=".png,.jpg,.jpeg,.gif,.svg,image/png,image/jpeg,image/gif,image/svg+xml"
					onchange={onIconInputChange}
					class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
				/>
			{/key}
			{#if mode === 'edit' && originalIcon && !iconFile}
				<p class="m-0 opacity-80">Current icon: {originalIcon}</p>
			{/if}
			{#if mode === 'edit'}
				<p class="m-0">Or select an existing icon</p>
				<Select
					bind:value={selectedIcon}
					variant="filled"
					noLabel
					menu$fixed
					menu$fullWidth={false}
					class="w-full"
				>
					<Option value="">No icon</Option>
					{#each iconOptions as iconOption}
						<Option value={iconOption}>{iconOption}</Option>
					{/each}
				</Select>
				{#if loadingIcons}
					<p class="m-0 opacity-80">Loading icons…</p>
				{:else if iconOptionsError}
					<p class="m-0 text-[#ff8a80]">{iconOptionsError}</p>
				{/if}
			{/if}
			{#if iconFile}
				<p class="m-0 opacity-80">Selected file: {iconFile.name}</p>
			{/if}
			{#if formError}
				<p class="m-0 text-[#ff8a80]">{formError}</p>
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
