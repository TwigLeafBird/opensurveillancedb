<script lang="ts">
	import Button from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Select, { Option } from '@smui/select';
	import Checkbox from '@smui/checkbox';
	import ImageHoverPreview from '$lib/ImageHoverPreview.svelte';
	import ShapeIcon from '$lib/ShapeIcon.svelte';
	import { getModelExampleImagePublicUrl, validateImageFile } from '$lib/storage';

	type DialogMode = 'create' | 'edit';
	type ManufacturerOption = { id: string; name: string };
	type ShapeProfileOption = { id: string; short_name: string; icon?: string | null };
	type ColorOption = { code: string; name: string };
	type LocationOption = { code: string; name: string };
	type DeviceModel = {
		id: string;
		name: string;
		manufacturer_id?: string | null;
		shape_profile_id?: string | null;
		datasheet_url?: string | null;
		product_url?: string | null;
		distinguishing_features?: string[];
		example_images?: string[] | null;
		color_ids?: string[];
		location_codes?: string[];
	};
	type SubmitDetail = {
		mode: DialogMode;
		originalId: string | null;
		name: string;
		manufacturer: string | null;
		shape_profile: string | null;
		datasheet_url: string | null;
		product_url: string | null;
		distinguishing_features: string[];
		existing_example_images: string[];
		new_example_image_files: File[];
		color_ids: string[];
		location_codes: string[];
	};

	type PendingExampleImageFile = {
		file: File;
		previewUrl: string;
	};

	let {
		onDialogSubmit,
		manufacturers = [],
		shapeProfiles = [],
		colors = [],
		locations = []
	} = $props<{
		onDialogSubmit?: (detail: SubmitDetail) => Promise<void> | void;
		manufacturers?: ManufacturerOption[];
		shapeProfiles?: ShapeProfileOption[];
		colors?: ColorOption[];
		locations?: LocationOption[];
	}>();

	let open = $state(false);
	let mode = $state<DialogMode>('create');
	let originalId = $state('');
	let name = $state('');
	let manufacturerId = $state('');
	let shapeProfileId = $state('');
	let datasheetUrl = $state('');
	let productUrl = $state('');
	let distinguishingFeatureDrafts = $state<string[]>(['']);
	let existingExampleImages = $state<string[]>([]);
	let newExampleImageFiles = $state<PendingExampleImageFile[]>([]);
	let exampleImageInputKey = $state(0);
	let selectedColorIds = $state<string[]>([]);
	let selectedLocationCodes = $state<string[]>([]);
	let saving = $state(false);
	let formError = $state('');

	const exampleImageItems = $derived([
		...existingExampleImages.map((filename) => ({
			key: `existing:${filename}`,
			filename,
			isExisting: true,
			previewUrl: getModelExampleImagePublicUrl(filename)
		})),
		...newExampleImageFiles.map((pendingFile, index) => ({
			key: `new:${index}`,
			filename: pendingFile.file.name,
			isExisting: false,
			previewUrl: pendingFile.previewUrl
		}))
	]);

	function revokePendingExampleImagePreviews() {
		for (const pendingFile of newExampleImageFiles) {
			URL.revokeObjectURL(pendingFile.previewUrl);
		}
	}

	function reset() {
		revokePendingExampleImagePreviews();
		open = false;
		mode = 'create';
		originalId = '';
		name = '';
		manufacturerId = '';
		shapeProfileId = '';
		datasheetUrl = '';
		productUrl = '';
		distinguishingFeatureDrafts = [''];
		existingExampleImages = [];
		newExampleImageFiles = [];
		exampleImageInputKey += 1;
		selectedColorIds = [];
		selectedLocationCodes = [];
		saving = false;
		formError = '';
	}

	export function openCreateDialog() {
		mode = 'create';
		originalId = '';
		name = '';
		manufacturerId = '';
		shapeProfileId = '';
		datasheetUrl = '';
		productUrl = '';
		distinguishingFeatureDrafts = [''];
		existingExampleImages = [];
		newExampleImageFiles = [];
		exampleImageInputKey += 1;
		selectedColorIds = [];
		selectedLocationCodes = [];
		formError = '';
		open = true;
	}

	export function openEditDialog(deviceModel: DeviceModel) {
		mode = 'edit';
		originalId = deviceModel.id;
		name = deviceModel.name;
		manufacturerId = deviceModel.manufacturer_id ?? '';
		shapeProfileId = deviceModel.shape_profile_id ?? '';
		datasheetUrl = deviceModel.datasheet_url ?? '';
		productUrl = deviceModel.product_url ?? '';
		distinguishingFeatureDrafts =
			deviceModel.distinguishing_features && deviceModel.distinguishing_features.length > 0
				? [...deviceModel.distinguishing_features]
				: [''];
		existingExampleImages = [...(deviceModel.example_images ?? [])];
		newExampleImageFiles = [];
		exampleImageInputKey += 1;
		selectedColorIds = [...(deviceModel.color_ids ?? [])];
		selectedLocationCodes = [...(deviceModel.location_codes ?? [])];
		formError = '';
		open = true;
	}

	function onExampleImageFilesChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const selectedFiles = Array.from(input.files ?? []);

		if (selectedFiles.length === 0) {
			return;
		}

		const invalidFile = selectedFiles.find((file) => !validateImageFile(file));
		if (invalidFile) {
			formError = 'All example images must be PNG, JPG, JPEG, GIF, or SVG images.';
			return;
		}

		newExampleImageFiles = [
			...newExampleImageFiles,
			...selectedFiles.map((file) => ({
				file,
				previewUrl: URL.createObjectURL(file)
			}))
		];
		exampleImageInputKey += 1;
	}

	function removeExistingExampleImage(filename: string) {
		existingExampleImages = existingExampleImages.filter((entry) => entry !== filename);
	}

	function removeNewExampleImage(index: number) {
		const pendingFile = newExampleImageFiles[index];
		if (pendingFile) {
			URL.revokeObjectURL(pendingFile.previewUrl);
		}
		newExampleImageFiles = newExampleImageFiles.filter((_, itemIndex) => itemIndex !== index);
	}

	async function save() {
		const trimmedName = name.trim();
		const trimmedDatasheet = datasheetUrl.trim();
		const trimmedProduct = productUrl.trim();
		const distinguishingFeatures = distinguishingFeatureDrafts
			.map((detail) => detail.trim())
			.filter((detail) => detail.length > 0);

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
				manufacturer: manufacturerId || null,
				shape_profile: shapeProfileId || null,
				datasheet_url: trimmedDatasheet || null,
				product_url: trimmedProduct || null,
				distinguishing_features: distinguishingFeatures,
				existing_example_images: [...existingExampleImages],
				new_example_image_files: newExampleImageFiles.map((pendingFile) => pendingFile.file),
				color_ids: [...selectedColorIds],
				location_codes: [...selectedLocationCodes]
			});
			reset();
		} catch (error) {
			formError = error instanceof Error ? error.message : 'Failed to save device model.';
		} finally {
			saving = false;
		}
	}

	function addDistinguishingFeatureField() {
		distinguishingFeatureDrafts = [...distinguishingFeatureDrafts, ''];
	}

	function updateDistinguishingFeature(index: number, value: string) {
		distinguishingFeatureDrafts = distinguishingFeatureDrafts.map((detail, detailIndex) =>
			detailIndex === index ? value : detail
		);
	}

	function removeDistinguishingFeature(index: number) {
		const nextDistinguishingFeatureDrafts = distinguishingFeatureDrafts.filter(
			(_, detailIndex) => detailIndex !== index
		);
		distinguishingFeatureDrafts =
			nextDistinguishingFeatureDrafts.length > 0 ? nextDistinguishingFeatureDrafts : [''];
	}
</script>

<Dialog
	bind:open
	aria-labelledby="device-model-dialog-title"
	aria-describedby="device-model-dialog-content"
>
	<Title id="device-model-dialog-title"
		>{mode === 'create' ? 'Create Device Model' : 'Edit Device Model'}</Title
	>
	<Content id="device-model-dialog-content" class="overflow-visible">
		<div class="flex min-w-[360px] flex-col gap-2">
			<label for="device-model-name">Name</label>
			<input
				id="device-model-name"
				bind:value={name}
				placeholder="e.g. DS-2CD2120F"
				class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
			/>

			<p class="m-0">Manufacturer</p>
			<Select
				bind:value={manufacturerId}
				variant="filled"
				noLabel
				menu$fixed
				menu$fullWidth={false}
				class="w-full"
			>
				<Option value="">None</Option>
				{#each manufacturers as manufacturer}
					<Option value={manufacturer.id}>{manufacturer.name}</Option>
				{/each}
			</Select>

			<fieldset class="m-0 border-none p-0">
				<legend class="mb-1 p-0">Shape Profile</legend>
				<div
					class="flex max-h-[180px] flex-col gap-1 overflow-auto rounded border border-current p-2"
				>
					<div class="flex items-center gap-2">
						<input id="shape-profile-none" type="radio" bind:group={shapeProfileId} value="" />
						<label for="shape-profile-none">None</label>
					</div>
					{#if shapeProfiles.length === 0}
						<em>No shape profiles available.</em>
					{:else}
						{#each shapeProfiles as shapeProfile}
							<div class="flex items-center gap-2">
								<input
									id={`shape-profile-${shapeProfile.id}`}
									type="radio"
									bind:group={shapeProfileId}
									value={shapeProfile.id}
								/>
								<ShapeIcon
									filename={shapeProfile.icon ?? null}
									alt={shapeProfile.short_name}
									size={24}
								/>
								<label for={`shape-profile-${shapeProfile.id}`}>{shapeProfile.short_name}</label>
							</div>
						{/each}
					{/if}
				</div>
			</fieldset>

			<label for="device-model-datasheet">Datasheet URL</label>
			<input
				id="device-model-datasheet"
				bind:value={datasheetUrl}
				placeholder="https://..."
				class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
			/>

			<label for="device-model-product">Product URL</label>
			<input
				id="device-model-product"
				bind:value={productUrl}
				placeholder="https://..."
				class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
			/>

			<label for="device-model-example-images">Upload Example Images</label>
			{#key exampleImageInputKey}
				<input
					id="device-model-example-images"
					type="file"
					multiple
					accept=".png,.jpg,.jpeg,.gif,.svg,image/png,image/jpeg,image/gif,image/svg+xml"
					onchange={onExampleImageFilesChange}
					class="rounded border border-current bg-transparent p-2 text-inherit caret-current"
				/>
			{/key}

			{#if exampleImageItems.length > 0}
				<p class="m-0 text-sm opacity-80">Example images are shown in a horizontal scroller.</p>
				<div class="overflow-x-auto rounded border border-current/30 p-2">
					<div class="flex min-w-max gap-3">
						{#each exampleImageItems as item (item.key)}
							<div
								class="flex w-36 min-w-36 flex-shrink-0 flex-col items-center gap-2 rounded border border-current/30 p-2"
							>
								{#if item.previewUrl}
									<ImageHoverPreview
										src={item.previewUrl}
										alt={`${name || 'Device model'} example image`}
										ariaLabel={`Preview ${item.filename}`}
										thumbnailWidth={96}
										thumbnailHeight={96}
										previewWidth={512}
										previewHeight={512}
										thumbnailFrameClass="example-image-frame"
										thumbnailImageClass="h-24 w-24 object-contain"
										previewImageClass="max-h-[30rem] max-w-[30rem] object-contain"
									/>
								{:else}
									<div
										class="example-image-frame flex h-24 w-24 items-center justify-center rounded-md text-center text-[11px] leading-tight opacity-70"
									>
										no preview
									</div>
								{/if}
								<div class="w-full text-center text-xs break-all opacity-80">{item.filename}</div>
								<Button
									variant="outlined"
									onclick={() => {
										if (item.isExisting) {
											removeExistingExampleImage(item.filename);
										} else {
											removeNewExampleImage(Number(item.key.replace('new:', '')));
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

			<div>
				<p class="mt-0 mr-0 mb-1 ml-0">Colors</p>
				<div
					class="flex max-h-[120px] flex-col gap-1 overflow-auto rounded border border-current p-2"
				>
					{#if colors.length === 0}
						<em>No colors available.</em>
					{:else}
						{#each colors as color}
							<label class="flex items-center gap-2">
								<Checkbox bind:group={selectedColorIds} value={color.code} />
								<span>{color.name}</span>
							</label>
						{/each}
					{/if}
				</div>
			</div>

			<div>
				<p class="mt-0 mr-0 mb-1 ml-0">Possible Locations</p>
				<div
					class="flex max-h-[120px] flex-col gap-1 overflow-auto rounded border border-current p-2"
				>
					{#if locations.length === 0}
						<em>No locations available.</em>
					{:else}
						{#each locations as location}
							<label class="flex items-center gap-2">
								<Checkbox bind:group={selectedLocationCodes} value={location.code} />
								<span>{location.name}</span>
							</label>
						{/each}
					{/if}
				</div>
			</div>

			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between gap-2">
					<p class="m-0">Distinguishing Features</p>
					<Button variant="outlined" onclick={addDistinguishingFeatureField} disabled={saving}>
						<span class="mdc-button__label">Add Feature</span>
					</Button>
				</div>
				<p class="m-0 text-sm opacity-80">
					Add details that make this specific model unique from others that look similar.
				</p>
				<div class="flex flex-col gap-2">
					{#each distinguishingFeatureDrafts as detail, index (`detail-${index}`)}
						<div class="flex items-start gap-2">
							<input
								id={`device-model-distinguishing-feature-${index}`}
								value={detail}
								oninput={(event) =>
									updateDistinguishingFeature(index, (event.currentTarget as HTMLInputElement).value)}
								placeholder={`Distinguishing feature ${index + 1}`}
								class="min-w-0 flex-1 rounded border border-current bg-transparent p-2 text-inherit caret-current"
							/>
							<Button
								variant="outlined"
								onclick={() => removeDistinguishingFeature(index)}
								disabled={saving}
							>
								<span class="mdc-button__label">Remove</span>
							</Button>
						</div>
					{/each}
				</div>
			</div>

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
	.example-image-frame {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 0.5rem;
		background: color-mix(in srgb, black 82%, white 18%);
		border: 1px solid color-mix(in srgb, black 65%, transparent);
	}

	@media (prefers-color-scheme: dark) {
		.example-image-frame {
			background: color-mix(in srgb, white 92%, transparent);
			border-color: color-mix(in srgb, white 78%, transparent);
		}
	}
</style>
