<script lang="ts">
	import Button from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import { getManufacturerIconPublicUrl, validateImageFile } from '$lib/storage';

	type DialogMode = 'create' | 'edit';
	type Manufacturer = {
		id: string;
		name: string;
		alternate_names?: string[] | null;
		icons?: string[] | null;
	};
	type SubmitDetail = {
		mode: DialogMode;
		originalId: string | null;
		name: string;
		alternate_names: string[] | null;
		existing_icons: string[];
		new_icon_files: File[];
		primary_icon_key: string | null;
	};

	type PendingIconFile = {
		file: File;
		previewUrl: string;
	};

	let { onDialogSubmit } = $props<{
		onDialogSubmit?: (detail: SubmitDetail) => Promise<void> | void;
	}>();

	let open = $state(false);
	let mode = $state<DialogMode>('create');
	let originalId = $state('');
	let name = $state('');
	let alternateNamesText = $state('');
	let existingIcons = $state<string[]>([]);
	let newIconFiles = $state<PendingIconFile[]>([]);
	let iconInputKey = $state(0);
	let primaryIconKey = $state<string | null>(null);
	let saving = $state(false);
	let formError = $state('');

	const iconItems = $derived([
		...existingIcons.map((filename) => ({
			key: `existing:${filename}`,
			filename,
			isExisting: true,
			previewUrl: getManufacturerIconPublicUrl(filename)
		})),
		...newIconFiles.map((pendingFile, index) => ({
			key: `new:${index}`,
			filename: pendingFile.file.name,
			isExisting: false,
			previewUrl: pendingFile.previewUrl
		}))
	]);

	function revokePendingIconPreviews() {
		for (const pendingFile of newIconFiles) {
			URL.revokeObjectURL(pendingFile.previewUrl);
		}
	}

	function reset() {
		revokePendingIconPreviews();
		open = false;
		mode = 'create';
		originalId = '';
		name = '';
		alternateNamesText = '';
		existingIcons = [];
		newIconFiles = [];
		iconInputKey += 1;
		primaryIconKey = null;
		saving = false;
		formError = '';
	}

	export function openCreateDialog() {
		mode = 'create';
		originalId = '';
		name = '';
		alternateNamesText = '';
		existingIcons = [];
		newIconFiles = [];
		iconInputKey += 1;
		primaryIconKey = null;
		formError = '';
		open = true;
	}

	export function openEditDialog(manufacturer: Manufacturer) {
		mode = 'edit';
		originalId = manufacturer.id;
		name = manufacturer.name;
		alternateNamesText = (manufacturer.alternate_names ?? []).join(', ');
		existingIcons = [...(manufacturer.icons ?? [])];
		newIconFiles = [];
		iconInputKey += 1;
		primaryIconKey =
			(manufacturer.icons ?? []).length > 0 ? `existing:${manufacturer.icons?.[0]}` : null;
		formError = '';
		open = true;
	}

	function onIconFilesChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const selectedFiles = Array.from(input.files ?? []);

		if (selectedFiles.length === 0) {
			return;
		}

		const invalidFile = selectedFiles.find((file) => !validateImageFile(file));
		if (invalidFile) {
			formError = 'All icons must be PNG, JPG, JPEG, GIF, or SVG images.';
			return;
		}

		newIconFiles = [
			...newIconFiles,
			...selectedFiles.map((file) => ({
				file,
				previewUrl: URL.createObjectURL(file)
			}))
		];
		if (!primaryIconKey && existingIcons.length === 0 && newIconFiles.length === 0) {
			primaryIconKey = 'new:0';
		}
		iconInputKey += 1;
	}

	function removeExistingIcon(filename: string) {
		existingIcons = existingIcons.filter((entry) => entry !== filename);
		if (primaryIconKey === `existing:${filename}`) {
			primaryIconKey = iconItems.find((item) => item.key !== `existing:${filename}`)?.key ?? null;
		}
	}

	function removeNewIcon(index: number) {
		const pendingFile = newIconFiles[index];
		if (pendingFile) {
			URL.revokeObjectURL(pendingFile.previewUrl);
		}
		newIconFiles = newIconFiles.filter((_, itemIndex) => itemIndex !== index);
		if (primaryIconKey?.startsWith('new:')) {
			const primaryIndex = Number(primaryIconKey.replace('new:', ''));
			if (Number.isFinite(primaryIndex)) {
				if (primaryIndex === index) {
					primaryIconKey = null;
				} else if (primaryIndex > index) {
					primaryIconKey = `new:${primaryIndex - 1}`;
				}
			}
		}

		if (!primaryIconKey) {
			const fallback = existingIcons[0]
				? `existing:${existingIcons[0]}`
				: newIconFiles[0]
					? 'new:0'
					: null;
			primaryIconKey = fallback;
		}
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
		if (!primaryIconKey && (existingIcons.length > 0 || newIconFiles.length > 0)) {
			formError = 'Choose a primary icon.';
			return;
		}

		saving = true;
		formError = '';

		try {
			await onDialogSubmit?.({
				mode,
				originalId: originalId || null,
				name: trimmedName,
				alternate_names: parseAlternateNames(alternateNamesText),
				existing_icons: [...existingIcons],
				new_icon_files: newIconFiles.map((pendingFile) => pendingFile.file),
				primary_icon_key: primaryIconKey
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
		<div class="flex max-w-[360px] min-w-[280px] flex-col gap-2">
			<label for="manufacturer-name">Name</label>
			<input
				id="manufacturer-name"
				bind:value={name}
				placeholder="e.g. Hikvision"
				class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
			/>
			<label for="manufacturer-alt-names">Alternate Names (comma separated)</label>
			<input
				id="manufacturer-alt-names"
				bind:value={alternateNamesText}
				placeholder="e.g. Hangzhou Hikvision, Hik Vision"
				class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
			/>
			<label for="manufacturer-icon-files">Upload Icons (optional)</label>
			{#key iconInputKey}
				<input
					id="manufacturer-icon-files"
					type="file"
					multiple
					accept=".png,.jpg,.jpeg,.gif,.svg,image/png,image/jpeg,image/gif,image/svg+xml"
					onchange={onIconFilesChange}
					class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
				/>
			{/key}

			{#if iconItems.length > 0}
				<p class="m-0 text-sm opacity-80">Select primary icon and remove any you do not want.</p>
				<div class="overflow-x-auto">
					<div class="flex min-w-max gap-2 py-1 pr-1">
						{#each iconItems as item, index (item.key)}
							<div
								class="flex w-28 min-w-28 flex-shrink-0 flex-col items-center gap-2 rounded border border-current/30 p-2"
							>
								<div
									class="logo-preview-frame flex h-20 min-h-20 w-20 min-w-20 items-center justify-center rounded-md border p-2"
								>
									{#if item.previewUrl}
										<img
											src={item.previewUrl}
											alt={`${name || 'Manufacturer'} icon ${index + 1}`}
											width="64"
											height="64"
											class="max-h-16 max-w-16 object-contain"
										/>
									{:else}
										<div class="text-center text-[11px] leading-tight opacity-70">no preview</div>
									{/if}
								</div>
								<label class="flex items-center gap-1 text-xs">
									<input
										type="radio"
										name="primary-manufacturer-icon"
										checked={primaryIconKey === item.key}
										onchange={() => (primaryIconKey = item.key)}
									/>
									Primary
								</label>
								<Button
									variant="outlined"
									onclick={() => {
										if (item.isExisting) {
											removeExistingIcon(item.filename);
										} else {
											removeNewIcon(Number(item.key.replace('new:', '')));
										}
									}}
								>
									<span class="mdc-button__label">Remove</span>
								</Button>
							</div>
						{/each}
					</div>
				</div>
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

<style>
	.logo-preview-frame {
		background: color-mix(in srgb, black 82%, white 18%);
		border-color: color-mix(in srgb, black 65%, transparent);
	}

	@media (prefers-color-scheme: dark) {
		.logo-preview-frame {
			background: color-mix(in srgb, white 92%, transparent);
			border-color: color-mix(in srgb, white 78%, transparent);
		}
	}
</style>
