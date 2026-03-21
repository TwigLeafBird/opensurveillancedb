<script lang="ts">
	import '$lib/hex-swatch-border.css';
	import Button from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Select, { Option } from '@smui/select';
	import { listColorSwatchFilenames, validateFilename, validateImageFile } from '$lib/storage';

	type DialogMode = 'create' | 'edit';
	type ColorOption = {
		code: string;
		name: string;
		hex_code?: string | null;
		swatch_icon?: string | null;
	};
	type SubmitDetail = {
		mode: DialogMode;
		originalCode: string | null;
		code: string;
		name: string;
		hex_code: string | null;
		iconFile: File | null;
		selectedSwatchIcon: string | null;
	};

	let { onDialogSubmit } = $props<{
		onDialogSubmit?: (detail: SubmitDetail) => Promise<void> | void;
	}>();

	let open = $state(false);
	let mode = $state<DialogMode>('create');
	let originalCode = $state('');
	let code = $state('');
	let name = $state('');
	let hexCodeInput = $state('');
	let selectedSwatchIcon = $state('');
	let originalSwatchIcon = $state<string | null>(null);
	let iconFile = $state<File | null>(null);
	let iconInputKey = $state(0);
	let swatchOptions = $state<string[]>([]);
	let loadingSwatches = $state(false);
	let swatchOptionsError = $state('');
	let swatchesLoaded = $state(false);
	let saving = $state(false);
	let formError = $state('');

	const normalizedHex = $derived(normalizeHexColor(hexCodeInput));

	function normalizeHexColor(value?: string | null): string | null {
		if (!value) {
			return null;
		}

		const trimmedValue = value.trim();
		if (!trimmedValue) {
			return null;
		}

		const candidate = trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`;
		return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(candidate)
			? candidate
			: null;
	}

	async function ensureSwatchOptionsLoaded() {
		if (swatchesLoaded || loadingSwatches) {
			return;
		}

		loadingSwatches = true;
		swatchOptionsError = '';
		try {
			swatchOptions = await listColorSwatchFilenames();
			swatchesLoaded = true;
		} catch (error) {
			swatchOptionsError = error instanceof Error ? error.message : 'Failed to load swatch icons.';
		} finally {
			loadingSwatches = false;
		}
	}

	function reset() {
		open = false;
		mode = 'create';
		originalCode = '';
		code = '';
		name = '';
		hexCodeInput = '';
		selectedSwatchIcon = '';
		originalSwatchIcon = null;
		iconFile = null;
		iconInputKey += 1;
		saving = false;
		formError = '';
	}

	export function openCreateDialog() {
		void ensureSwatchOptionsLoaded();
		mode = 'create';
		originalCode = '';
		code = '';
		name = '';
		hexCodeInput = '';
		selectedSwatchIcon = '';
		originalSwatchIcon = null;
		iconFile = null;
		iconInputKey += 1;
		formError = '';
		open = true;
	}

	export function openEditDialog(color: ColorOption) {
		void ensureSwatchOptionsLoaded();
		mode = 'edit';
		originalCode = color.code;
		code = color.code;
		name = color.name;
		hexCodeInput = color.hex_code ?? '';
		selectedSwatchIcon = color.swatch_icon ?? '';
		originalSwatchIcon = color.swatch_icon ?? null;
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
		const trimmedCode = code.trim();
		const trimmedName = name.trim();
		const trimmedSelectedIcon = selectedSwatchIcon.trim();
		const validatedSelectedIcon = validateFilename(trimmedSelectedIcon || null);
		if (!trimmedCode || !trimmedName) {
			formError = 'Code and Name are required.';
			return;
		}
		if (hexCodeInput.trim() && !normalizedHex) {
			formError = 'Hex code must be a valid 3, 4, 6, or 8 digit hex value.';
			return;
		}
		if (iconFile && !validateImageFile(iconFile)) {
			formError = 'Swatch icon must be a PNG, JPG, JPEG, GIF, or SVG image.';
			return;
		}
		if (trimmedSelectedIcon && !validatedSelectedIcon) {
			formError = 'Selected swatch icon filename is invalid.';
			return;
		}

		saving = true;
		formError = '';

		try {
			await onDialogSubmit?.({
				mode,
				originalCode: originalCode || null,
				code: trimmedCode,
				name: trimmedName,
				hex_code: normalizedHex,
				iconFile,
				selectedSwatchIcon: validatedSelectedIcon
			});
			swatchesLoaded = false;
			reset();
		} catch (error) {
			formError = error instanceof Error ? error.message : 'Failed to save color option.';
		} finally {
			saving = false;
		}
	}
</script>

<Dialog
	bind:open
	aria-labelledby="color-option-dialog-title"
	aria-describedby="color-option-dialog-content"
>
	<Title id="color-option-dialog-title"
		>{mode === 'create' ? 'Create Color Option' : 'Edit Color Option'}</Title
	>
	<Content id="color-option-dialog-content">
		<div class="flex min-w-[320px] flex-col gap-2">
			{#if mode === 'create'}
				<label for="color-option-code">Code</label>
				<input
					id="color-option-code"
					bind:value={code}
					placeholder="e.g. RED"
					class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
				/>
			{/if}
			<label for="color-option-name">Name</label>
			<input
				id="color-option-name"
				bind:value={name}
				placeholder="e.g. Red"
				class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
			/>
			<label for="color-option-hex">Hex Code (optional)</label>
			<div class="flex items-center gap-2">
				<input
					id="color-option-hex"
					bind:value={hexCodeInput}
					placeholder="e.g. #FF0000"
					class="flex-1 rounded border border-current bg-transparent p-2 text-inherit caret-current"
				/>
				<div
					class="hex-swatch-border h-8 w-8 rounded-sm border"
					style={`background-color:${normalizedHex ?? 'transparent'}`}
					aria-label="Hex color preview"
				></div>
			</div>
			<label for="color-option-icon-file">Upload Swatch Icon (optional)</label>
			{#key iconInputKey}
				<input
					id="color-option-icon-file"
					type="file"
					accept=".png,.jpg,.jpeg,.gif,.svg,image/png,image/jpeg,image/gif,image/svg+xml"
					onchange={onIconInputChange}
					class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
				/>
			{/key}
			{#if mode === 'edit' && originalSwatchIcon && !iconFile}
				<p class="m-0 opacity-80">Current swatch icon: {originalSwatchIcon}</p>
			{/if}
			<p class="m-0">Or select an existing swatch icon</p>
			<Select
				bind:value={selectedSwatchIcon}
				variant="filled"
				noLabel
				menu$fixed
				menu$fullWidth={false}
				class="w-full"
			>
				<Option value="">No swatch icon</Option>
				{#each swatchOptions as swatchOption}
					<Option value={swatchOption}>{swatchOption}</Option>
				{/each}
			</Select>
			{#if loadingSwatches}
				<p class="m-0 opacity-80">Loading swatch icons…</p>
			{:else if swatchOptionsError}
				<p class="m-0 text-[#ff8a80]">{swatchOptionsError}</p>
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
