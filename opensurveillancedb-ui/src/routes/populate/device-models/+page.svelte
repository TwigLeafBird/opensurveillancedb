<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Button, { Icon, Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import ShapeIcon from '$lib/ShapeIcon.svelte';
	import { sanitizeHref } from '$lib/url';
	import { createDeviceModel, updateDeviceModel, deleteDeviceModel } from '$lib/supabaseClient';
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
	const colors = $derived((data?.colors ?? []) as Array<{ code: string; name: string }>);
	const locations = $derived((data?.locations ?? []) as Array<{ code: string; name: string }>);

	type DeviceModelDialogRef = {
		openCreateDialog: () => void;
		openEditDialog: (deviceModel: {
			id: string;
			name: string;
			manufacturer_id?: string | null;
			shape_profile_id?: string | null;
			datasheet_url?: string | null;
			product_url?: string | null;
			color_ids?: string[];
			location_codes?: string[];
		}) => void;
	};

	let dialogRef = $state(null) as DeviceModelDialogRef | null;
	let deletingId = $state<string | null>(null);
	let editingId = $state<string | null>(null);
	let creatingPending = $state(false);

	async function handleDialogSubmit(detail: {
		mode: 'create' | 'edit';
		originalId: string | null;
		name: string;
		manufacturer: string | null;
		shape_profile: string | null;
		datasheet_url: string | null;
		product_url: string | null;
		color_ids: string[];
		location_codes: string[];
	}) {
		if (detail.mode === 'create') {
			creatingPending = true;
			try {
				await createDeviceModel({
					name: detail.name,
					manufacturer: detail.manufacturer,
					shape_profile: detail.shape_profile,
					datasheet_url: detail.datasheet_url,
					product_url: detail.product_url,
					color_ids: detail.color_ids,
					location_codes: detail.location_codes
				});
				await invalidateAll();
			} finally {
				creatingPending = false;
			}
		} else {
			if (!detail.originalId) {
				throw new Error('Missing original ID for edit operation.');
			}

			editingId = detail.originalId;
			try {
				await updateDeviceModel(detail.originalId, {
					name: detail.name,
					manufacturer: detail.manufacturer,
					shape_profile: detail.shape_profile,
					datasheet_url: detail.datasheet_url,
					product_url: detail.product_url,
					color_ids: detail.color_ids,
					location_codes: detail.location_codes
				});
				await invalidateAll();
			} finally {
				editingId = null;
			}
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
			alert(error instanceof Error ? error.message : 'Failed to delete device model.');
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
			color_ids: (model.device_color_option ?? []).map((option) => option.color_id),
			location_codes: (model.device_possible_location ?? []).map((option) => option.location_code)
		});
	}
</script>

<div style="margin-bottom:8px; display:flex; justify-content:flex-end;">
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

<DeviceModelDialog
	bind:this={dialogRef}
	{manufacturers}
	{shapeProfiles}
	{colors}
	{locations}
	onDialogSubmit={handleDialogSubmit}
/>

{#if deviceInfos.length === 0}
	<p><em>No device models found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Device models" style="width: 100%; table-layout: fixed;">
			<Head>
				<Row>
					<Cell style="width:20%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
						>Name</Cell
					>
					<Cell style="width:8%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
						>ID</Cell
					>
					<Cell style="width:15%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
						>Manufacturer</Cell
					>
					<Cell style="width:20%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
						>Shape Profile</Cell
					>
					<Cell style="width:12%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
						>Colors</Cell
					>
					<Cell style="width:15%; white-space:normal;">Possible Locations</Cell>
					<Cell style="width:5%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
						>Datasheet</Cell
					>
					<Cell style="width:5%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
						>Product</Cell
					>
					<Cell style="width:7%;">Actions</Cell>
				</Row>
			</Head>

			<Body>
				{#each deviceInfos as m (m.id)}
					<Row>
						<Cell style="width:20%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
							>{m.name}</Cell
						>
						<Cell style="width:8%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
							><code>{m.id}</code></Cell
						>
						<Cell style="width:15%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
							>{m.manufacturer?.name ?? '-'}</Cell
						>
						<Cell>
							<div style="display:flex; align-items:center; gap:8px; min-width:0;">
								<ShapeIcon
									filename={m.device_shape_profile?.icon ?? null}
									alt={m.device_shape_profile?.short_name ?? ''}
									size={40}
								/>
								<span style="flex:1; min-width:0; white-space:normal; word-break:break-word;"
									>{m.device_shape_profile?.short_name ?? m.shape_profile ?? '-'}</span
								>
							</div>
						</Cell>
						<Cell style="width:12%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
							{#if m.device_color_option && m.device_color_option.length > 0}
								{m.device_color_option.map((co) => co?.color?.name ?? co?.color?.code).join(', ')}
							{:else}
								-
							{/if}
						</Cell>
						<Cell style="width:15%; white-space:normal;">
							{#if m.device_possible_location && m.device_possible_location.length > 0}
								{m.device_possible_location
									.map((pl) => pl?.device_location?.name ?? pl?.location_code)
									.join(', ')}
							{:else}
								-
							{/if}
						</Cell>
						<Cell style="width:5%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
							{#if sanitizeHref(m.datasheet_url)}
								<a href={sanitizeHref(m.datasheet_url)} target="_blank" rel="noopener noreferrer"
									>link</a
								>
							{:else}
								-
							{/if}
						</Cell>
						<Cell style="width:5%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
							{#if sanitizeHref(m.product_url)}
								<a href={sanitizeHref(m.product_url)} target="_blank" rel="noopener noreferrer"
									>link</a
								>
							{:else}
								-
							{/if}
						</Cell>
						<Cell>
							{#if editingId === m.id}
								<CircularProgress style="height: 32px; width: 32px;" indeterminate />
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
								<CircularProgress style="height: 32px; width: 32px;" indeterminate />
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
						<Cell></Cell>
						<Cell>
							<CircularProgress style="height: 32px; width: 32px;" indeterminate />
						</Cell>
					</Row>
				{/if}
			</Body>
		</DataTable>
	</div>
{/if}
