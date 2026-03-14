<script lang="ts">
	import Button from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import Select, { Option } from '@smui/select';
	import Checkbox from '@smui/checkbox';
	import ShapeIcon from '$lib/ShapeIcon.svelte';

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
		color_ids: string[];
		location_codes: string[];
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
	let selectedColorIds = $state<string[]>([]);
	let selectedLocationCodes = $state<string[]>([]);
	let saving = $state(false);
	let formError = $state('');

	function reset() {
		open = false;
		mode = 'create';
		originalId = '';
		name = '';
		manufacturerId = '';
		shapeProfileId = '';
		datasheetUrl = '';
		productUrl = '';
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
		selectedColorIds = [...(deviceModel.color_ids ?? [])];
		selectedLocationCodes = [...(deviceModel.location_codes ?? [])];
		formError = '';
		open = true;
	}

	async function save() {
		const trimmedName = name.trim();
		const trimmedDatasheet = datasheetUrl.trim();
		const trimmedProduct = productUrl.trim();

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
</script>

<Dialog
	bind:open
	aria-labelledby="device-model-dialog-title"
	aria-describedby="device-model-dialog-content"
>
	<Title id="device-model-dialog-title"
		>{mode === 'create' ? 'Create Device Model' : 'Edit Device Model'}</Title
	>
	<Content id="device-model-dialog-content" style="overflow: visible;">
		<div style="display:flex; flex-direction:column; gap:8px; min-width:360px;">
			<label for="device-model-name">Name</label>
			<input
				id="device-model-name"
				bind:value={name}
				placeholder="e.g. DS-2CD2120F"
				style="color:inherit; background:transparent; border:1px solid currentColor; border-radius:4px; padding:8px; caret-color:currentColor;"
			/>

			<p style="margin:0;">Manufacturer</p>
			<Select
				bind:value={manufacturerId}
				variant="filled"
				noLabel
				menu$fixed
				menu$fullWidth={false}
				style="width:100%;"
			>
				<Option value="">None</Option>
				{#each manufacturers as manufacturer}
					<Option value={manufacturer.id}>{manufacturer.name}</Option>
				{/each}
			</Select>

			<fieldset style="border:none; margin:0; padding:0;">
				<legend style="padding:0; margin-bottom:4px;">Shape Profile</legend>
				<div
					style="display:flex; flex-direction:column; gap:4px; max-height:180px; overflow:auto; border:1px solid currentColor; border-radius:4px; padding:8px;"
				>
					<div style="display:flex; align-items:center; gap:8px;">
						<input id="shape-profile-none" type="radio" bind:group={shapeProfileId} value="" />
						<label for="shape-profile-none">None</label>
					</div>
					{#if shapeProfiles.length === 0}
						<em>No shape profiles available.</em>
					{:else}
						{#each shapeProfiles as shapeProfile}
							<div style="display:flex; align-items:center; gap:8px;">
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
								<label for={`shape-profile-${shapeProfile.id}`}
									>{shapeProfile.short_name} ({shapeProfile.id})</label
								>
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
				style="color:inherit; background:transparent; border:1px solid currentColor; border-radius:4px; padding:8px; caret-color:currentColor;"
			/>

			<label for="device-model-product">Product URL</label>
			<input
				id="device-model-product"
				bind:value={productUrl}
				placeholder="https://..."
				style="color:inherit; background:transparent; border:1px solid currentColor; border-radius:4px; padding:8px; caret-color:currentColor;"
			/>

			<div>
				<p style="margin:0 0 4px 0;">Colors</p>
				<div
					style="display:flex; flex-direction:column; gap:4px; max-height:120px; overflow:auto; border:1px solid currentColor; border-radius:4px; padding:8px;"
				>
					{#if colors.length === 0}
						<em>No colors available.</em>
					{:else}
						{#each colors as color}
							<label style="display:flex; align-items:center; gap:8px;">
								<Checkbox bind:group={selectedColorIds} value={color.code} />
								<span>{color.name} ({color.code})</span>
							</label>
						{/each}
					{/if}
				</div>
			</div>

			<div>
				<p style="margin:0 0 4px 0;">Possible Locations</p>
				<div
					style="display:flex; flex-direction:column; gap:4px; max-height:120px; overflow:auto; border:1px solid currentColor; border-radius:4px; padding:8px;"
				>
					{#if locations.length === 0}
						<em>No locations available.</em>
					{:else}
						{#each locations as location}
							<label style="display:flex; align-items:center; gap:8px;">
								<Checkbox bind:group={selectedLocationCodes} value={location.code} />
								<span>{location.name} ({location.code})</span>
							</label>
						{/each}
					{/if}
				</div>
			</div>

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
