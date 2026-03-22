<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Button, { Icon, Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import ShapeIcon from '$lib/ShapeIcon.svelte';
	import ColorSwatchList from '$lib/ColorSwatchList.svelte';
	import { sanitizeHref } from '$lib/url';
	import ErrorSnackbar from '$lib/ErrorSnackbar.svelte';
	import { getErrorMessage } from '$lib/errors';
	import { createDeviceModel, updateDeviceModel, deleteDeviceModel } from '$lib/supabaseClient';
	import { deleteModelExampleImageFile, uploadModelExampleImageFile } from '$lib/storage';
	import type { DeviceInfo } from '$lib/supabaseClient';
	import DeviceModelDialog from './DeviceModelDialog.svelte';

	let { data } = $props();
	const deviceInfos = $derived((data?.deviceInfos ?? []) as DeviceInfo[]);
	const manufacturers = $derived(
		(data?.manufacturers ?? []) as Array<{ id: string; name: string }>
	);
	const shapeProfiles = $derived(
		(data?.shapeProfiles ?? []) as Array<{ id: string; short_name: string; icon?: string | null }>
	);
	const colors = $derived(
		(data?.colors ?? []) as Array<{
			code: string;
			name: string;
			hex_code?: string | null;
			swatch_icon?: string | null;
		}>
	);
	const locations = $derived((data?.locations ?? []) as Array<{ code: string; name: string }>);
	const canEdit = $derived(!!data?.user);

	type DeviceModelDialogRef = {
		openCreateDialog: () => void;
		openEditDialog: (deviceModel: {
			id: string;
			name: string;
			manufacturer_id?: string | null;
			shape_profile_id?: string | null;
			datasheet_url?: string | null;
			product_url?: string | null;
			example_images?: string[] | null;
			color_ids?: string[];
			location_codes?: string[];
		}) => void;
	};

	type ErrorSnackbarRef = {
		show: (message: string) => void;
	};

	let dialogRef = $state(null) as DeviceModelDialogRef | null;
	let errorSnackbarRef = $state(null) as ErrorSnackbarRef | null;
	let deletingId = $state<string | null>(null);
	let editingId = $state<string | null>(null);
	let creatingPending = $state(false);

	function showError(error: unknown, fallback: string) {
		const message = getErrorMessage(error, fallback);
		errorSnackbarRef?.show(message);
		return message;
	}

	async function handleDialogSubmit(detail: {
		mode: 'create' | 'edit';
		originalId: string | null;
		name: string;
		manufacturer: string | null;
		shape_profile: string | null;
		datasheet_url: string | null;
		product_url: string | null;
		existing_example_images: string[];
		new_example_image_files: File[];
		color_ids: string[];
		location_codes: string[];
	}) {
		try {
			if (detail.mode === 'create') {
				creatingPending = true;
				const uploadedExampleImages: string[] = [];
				try {
					for (const file of detail.new_example_image_files) {
						uploadedExampleImages.push(await uploadModelExampleImageFile(file, detail.name));
					}

					await createDeviceModel({
						name: detail.name,
						manufacturer: detail.manufacturer,
						shape_profile: detail.shape_profile,
						datasheet_url: detail.datasheet_url,
						product_url: detail.product_url,
						example_images: [...detail.existing_example_images, ...uploadedExampleImages],
						color_ids: detail.color_ids,
						location_codes: detail.location_codes
					});
					await invalidateAll();
				} catch (error) {
					for (const uploadedExampleImage of uploadedExampleImages) {
						try {
							await deleteModelExampleImageFile(uploadedExampleImage);
						} catch {
							// no-op cleanup failure
						}
					}
					throw error;
				} finally {
					creatingPending = false;
				}
			} else {
				if (!detail.originalId) {
					throw new Error('Missing original ID for edit operation.');
				}

				editingId = detail.originalId;
				const uploadedExampleImages: string[] = [];
				const existingModel = deviceInfos.find((deviceInfo) => deviceInfo.id === detail.originalId);
				const currentExampleImages = existingModel?.example_images ?? [];
				try {
					for (const file of detail.new_example_image_files) {
						uploadedExampleImages.push(await uploadModelExampleImageFile(file, detail.name));
					}

					const nextExampleImages = [...detail.existing_example_images, ...uploadedExampleImages];

					await updateDeviceModel(detail.originalId, {
						name: detail.name,
						manufacturer: detail.manufacturer,
						shape_profile: detail.shape_profile,
						datasheet_url: detail.datasheet_url,
						product_url: detail.product_url,
						example_images: nextExampleImages,
						color_ids: detail.color_ids,
						location_codes: detail.location_codes
					});

					const removedExampleImages = currentExampleImages.filter(
						(filename) => !nextExampleImages.includes(filename)
					);
					for (const removedExampleImage of removedExampleImages) {
						try {
							await deleteModelExampleImageFile(removedExampleImage);
						} catch {
							// no-op cleanup failure
						}
					}
					await invalidateAll();
				} catch (error) {
					for (const uploadedExampleImage of uploadedExampleImages) {
						try {
							await deleteModelExampleImageFile(uploadedExampleImage);
						} catch {
							// no-op cleanup failure
						}
					}
					throw error;
				} finally {
					editingId = null;
				}
			}
		} catch (error) {
			throw new Error(showError(error, 'Failed to save device model.'));
		}
	}

	async function handleDeleteDeviceModel(id: string) {
		if (creatingPending || editingId) {
			return;
		}

		if (!confirm(`Delete device model "${id}"?`)) {
			return;
		}

		deletingId = id;
		try {
			await deleteDeviceModel(id);
			await invalidateAll();
		} catch (error) {
			showError(error, 'Failed to delete device model.');
		} finally {
			deletingId = null;
		}
	}

	function openEditDialog(model: DeviceInfo) {
		dialogRef?.openEditDialog({
			id: model.id,
			name: model.name,
			manufacturer_id: model.manufacturer?.id ?? null,
			shape_profile_id: model.device_shape_profile?.id ?? model.shape_profile ?? null,
			datasheet_url: model.datasheet_url ?? null,
			product_url: model.product_url ?? null,
			example_images: model.example_images ?? [],
			color_ids: (model.device_color_option ?? []).map((option) => option.color_id),
			location_codes: (model.device_possible_location ?? []).map((option) => option.location_code)
		});
	}
</script>

<ErrorSnackbar bind:this={errorSnackbarRef} />

{#if canEdit}
	<div class="mb-2 flex justify-end">
		<Button
			variant="raised"
			color="primary"
			onclick={() => dialogRef?.openCreateDialog()}
			disabled={creatingPending || !!editingId || !!deletingId}
		>
			<Icon class="material-icons">add</Icon>
			<Label>Create Device Model</Label>
		</Button>
	</div>
{/if}

{#if canEdit}
	<DeviceModelDialog
		bind:this={dialogRef}
		{manufacturers}
		{shapeProfiles}
		{colors}
		{locations}
		onDialogSubmit={handleDialogSubmit}
	/>
{/if}

{#if deviceInfos.length === 0}
	<p><em>No device models found.</em></p>
{:else}
	<div class="overflow-auto">
		<DataTable table$aria-label="Device models" class="w-full [table-layout:fixed]">
			<Head>
				<Row>
					<Cell class="w-[20%] overflow-hidden text-ellipsis whitespace-nowrap">Name</Cell>
					<Cell class="w-[10%] overflow-hidden text-ellipsis whitespace-nowrap">Manufacturer</Cell>
					<Cell class="w-[20%] overflow-hidden text-ellipsis whitespace-nowrap">Shape Profile</Cell>
					<Cell class="w-[12%] overflow-hidden text-ellipsis whitespace-nowrap">Colors</Cell>
					<Cell class="w-[15%] whitespace-normal">Possible Locations</Cell>
					<Cell class="w-[5%] overflow-hidden text-ellipsis whitespace-nowrap">Datasheet</Cell>
					<Cell class="w-[5%] overflow-hidden text-ellipsis whitespace-nowrap">Product</Cell>
					{#if canEdit}
						<Cell class="w-[7%]">Actions</Cell>
					{/if}
				</Row>
			</Head>

			<Body>
				{#each deviceInfos as m (m.id)}
					<Row>
						<Cell class="w-[20%] overflow-hidden">
							<div class="flex min-w-0 flex-col gap-0.5">
								<strong class="overflow-hidden text-[0.95rem] text-ellipsis whitespace-nowrap"
									>{m.name}</strong
								>
								<code class="text-[0.7rem] opacity-80">{m.id}</code>
							</div>
						</Cell>
						<Cell class="w-[10%] overflow-hidden text-ellipsis whitespace-nowrap"
							>{m.manufacturer?.name ?? '-'}</Cell
						>
						<Cell>
							<div class="flex min-w-0 items-center gap-2">
								<ShapeIcon
									filename={m.device_shape_profile?.icon ?? null}
									alt={m.device_shape_profile?.short_name ?? ''}
									size={40}
								/>
								<span class="min-w-0 flex-1 break-words whitespace-normal"
									>{m.device_shape_profile?.short_name ?? m.shape_profile ?? '-'}</span
								>
							</div>
						</Cell>
						<Cell class="w-[12%] overflow-hidden text-ellipsis whitespace-nowrap">
							<ColorSwatchList colorOptions={m.device_color_option ?? []} />
						</Cell>
						<Cell class="w-[15%] whitespace-normal">
							{#if m.device_possible_location && m.device_possible_location.length > 0}
								{m.device_possible_location
									.map((pl) => pl?.device_location?.name ?? pl?.location_code)
									.join(', ')}
							{:else}
								-
							{/if}
						</Cell>
						<Cell class="w-[5%] overflow-hidden text-ellipsis whitespace-nowrap">
							{#if sanitizeHref(m.datasheet_url)}
								<a href={sanitizeHref(m.datasheet_url)} target="_blank" rel="noopener noreferrer"
									>link</a
								>
							{:else}
								-
							{/if}
						</Cell>
						<Cell class="w-[5%] overflow-hidden text-ellipsis whitespace-nowrap">
							{#if sanitizeHref(m.product_url)}
								<a href={sanitizeHref(m.product_url)} target="_blank" rel="noopener noreferrer"
									>link</a
								>
							{:else}
								-
							{/if}
						</Cell>
						{#if canEdit}
							<Cell>
								{#if editingId === m.id}
									<CircularProgress class="h-8 w-8" indeterminate />
								{:else}
									<IconButton
										class="material-icons"
										onclick={() => openEditDialog(m)}
										aria-label="Edit"
										title="Edit"
										disabled={creatingPending || !!deletingId}>edit</IconButton
									>
								{/if}
								{#if deletingId === m.id}
									<CircularProgress class="h-8 w-8" indeterminate />
								{:else}
									<IconButton
										class="material-icons"
										onclick={() => handleDeleteDeviceModel(m.id)}
										aria-label="Delete"
										title="Delete"
										disabled={creatingPending || !!editingId}>delete</IconButton
									>
								{/if}
							</Cell>
						{/if}
					</Row>
				{/each}
				{#if creatingPending}
					<Row>
						<Cell></Cell>
						<Cell></Cell>
						<Cell></Cell>
						<Cell></Cell>
						<Cell></Cell>
						<Cell></Cell>
						<Cell></Cell>
						{#if canEdit}
							<Cell>
								<CircularProgress class="h-8 w-8" indeterminate />
							</Cell>
						{/if}
					</Row>
				{/if}
			</Body>
		</DataTable>
	</div>
{/if}
