<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Button, { Icon, Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import ErrorSnackbar from '$lib/ErrorSnackbar.svelte';
	import { getErrorMessage } from '$lib/errors';
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
	const canEdit = $derived(!!data?.user);

	type ManufacturerDialogRef = {
		openCreateDialog: () => void;
		openEditDialog: (manufacturer: {
			id: string;
			name: string;
			alternate_names?: string[] | null;
		}) => void;
	};

	type ErrorSnackbarRef = {
		show: (message: string) => void;
	};

	let dialogRef = $state(null) as ManufacturerDialogRef | null;
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
		alternate_names: string[] | null;
	}) {
		try {
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
		} catch (error) {
			throw new Error(showError(error, 'Failed to save manufacturer.'));
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
			showError(error, 'Failed to delete manufacturer.');
		} finally {
			deletingId = null;
		}
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
			<Label>Create Manufacturer</Label>
		</Button>
	</div>
{/if}

{#if canEdit}
	<ManufacturerDialog bind:this={dialogRef} onDialogSubmit={handleDialogSubmit} />
{/if}

{#if manufacturers.length === 0}
	<p><em>No manufacturers found.</em></p>
{:else}
	<div class="overflow-auto">
		<DataTable table$aria-label="Manufacturers" class="w-full">
			<Head>
				<Row>
					<Cell>Name</Cell>
					<Cell>ID</Cell>
					<Cell class="w-full">Alternate Names</Cell>
					{#if canEdit}
						<Cell>Actions</Cell>
					{/if}
				</Row>
			</Head>
			<Body>
				{#each manufacturers as m (m.id)}
					<Row>
						<Cell>{m.name}</Cell>
						<Cell><code>{m.id}</code></Cell>
						<Cell>{m.alternate_names ? m.alternate_names.join(', ') : '-'}</Cell>
						{#if canEdit}
							<Cell>
								{#if editingId === m.id}
									<CircularProgress class="h-8 w-8" indeterminate />
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
									<CircularProgress class="h-8 w-8" indeterminate />
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
						{/if}
					</Row>
				{/each}
				{#if creatingPending}
					<Row>
						<Cell></Cell>
						<Cell><code></code></Cell>
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
