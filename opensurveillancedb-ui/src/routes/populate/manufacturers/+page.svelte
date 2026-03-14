<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Button, { Icon, Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import {
		createDeviceManufacturer,
		updateDeviceManufacturer,
		deleteDeviceManufacturer
	} from '$lib/supabaseClient';
	import ManufacturerDialog from './ManufacturerDialog.svelte';

	let { data } = $props();
	const manufacturers = $derived(
		(data?.manufacturers ?? []) as Array<{
			id: string;
			name: string;
			alternate_names?: string[] | null;
		}>
	);

	type ManufacturerDialogRef = {
		openCreateDialog: () => void;
		openEditDialog: (manufacturer: {
			id: string;
			name: string;
			alternate_names?: string[] | null;
		}) => void;
	};

	let dialogRef = $state(null) as ManufacturerDialogRef | null;
	let deletingId = $state<string | null>(null);
	let editingId = $state<string | null>(null);
	let creatingPending = $state(false);

	async function handleDialogSubmit(detail: {
		mode: 'create' | 'edit';
		originalId: string | null;
		name: string;
		alternate_names: string[] | null;
	}) {
		if (detail.mode === 'create') {
			creatingPending = true;
			try {
				await createDeviceManufacturer({
					id: crypto.randomUUID(),
					name: detail.name,
					alternate_names: detail.alternate_names
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
				await updateDeviceManufacturer(detail.originalId, {
					id: detail.originalId,
					name: detail.name,
					alternate_names: detail.alternate_names
				});
				await invalidateAll();
			} finally {
				editingId = null;
			}
		}
	}

	async function handleDeleteManufacturer(id: string) {
		if (creatingPending || editingId) {
			return;
		}

		if (!confirm(`Delete manufacturer "${id}"?`)) {
			return;
		}

		deletingId = id;
		try {
			await deleteDeviceManufacturer(id);
			await invalidateAll();
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete manufacturer.');
		} finally {
			deletingId = null;
		}
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
		<Label>Create Manufacturer</Label>
	</Button>
</div>

<ManufacturerDialog bind:this={dialogRef} onDialogSubmit={handleDialogSubmit} />

{#if manufacturers.length === 0}
	<p><em>No manufacturers found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Manufacturers" style="width: 100%;">
			<Head>
				<Row>
					<Cell>Name</Cell>
					<Cell>ID</Cell>
					<Cell style="width:100%;">Alternate Names</Cell>
					<Cell>Actions</Cell>
				</Row>
			</Head>
			<Body>
				{#each manufacturers as m (m.id)}
					<Row>
						<Cell>{m.name}</Cell>
						<Cell><code>{m.id}</code></Cell>
						<Cell>{m.alternate_names ? m.alternate_names.join(', ') : '-'}</Cell>
						<Cell>
							{#if editingId === m.id}
								<CircularProgress style="height: 32px; width: 32px;" indeterminate />
							{:else}
								<IconButton
									class="material-icons"
									onclick={() => dialogRef?.openEditDialog(m)}
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
									onclick={() => handleDeleteManufacturer(m.id)}
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
						<Cell><code></code></Cell>
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
