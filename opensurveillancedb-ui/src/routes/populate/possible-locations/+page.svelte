<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Button, { Icon, Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import {
		createDeviceLocation,
		deleteDeviceLocation,
		updateDeviceLocation
	} from '$lib/supabaseClient';
	import PossibleLocationDialog from './PossibleLocationDialog.svelte';

	let { data } = $props();
	const locations = $derived(data?.locations ?? []);

	type PossibleLocationDialogRef = {
		openCreateDialog: () => void;
		openEditDialog: (location: { code: string; name: string }) => void;
	};

	let dialogRef = $state(null) as PossibleLocationDialogRef | null;
	let deletingCode = $state<string | null>(null);
	let editingCode = $state<string | null>(null);
	let creatingPending = $state(false);

	async function handleDialogSubmit(detail: {
		mode: 'create' | 'edit';
		originalCode: string | null;
		code: string;
		name: string;
	}) {
		if (detail.mode === 'create') {
			creatingPending = true;
			try {
				await createDeviceLocation({ code: detail.code, name: detail.name });
				await invalidateAll();
			} finally {
				creatingPending = false;
			}
		} else {
			if (!detail.originalCode) {
				throw new Error('Missing original code for edit operation.');
			}

			editingCode = detail.originalCode;
			try {
				await updateDeviceLocation(detail.originalCode, { code: detail.code, name: detail.name });
				await invalidateAll();
			} finally {
				editingCode = null;
			}
		}
	}

	async function handleDeleteLocation(code: string) {
		if (creatingPending || editingCode) {
			return;
		}

		if (!confirm(`Delete possible location "${code}"?`)) {
			return;
		}

		deletingCode = code;
		try {
			await deleteDeviceLocation(code);
			await invalidateAll();
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete possible location.');
		} finally {
			deletingCode = null;
		}
	}
</script>

<div style="margin-bottom:8px; display:flex; justify-content:flex-end;">
	<Button
		variant="raised"
		color="primary"
		onclick={() => dialogRef?.openCreateDialog()}
		disabled={creatingPending || !!editingCode || !!deletingCode}
	>
		<Icon class="material-icons">add</Icon>
		<Label>Create Possible Location</Label>
	</Button>
</div>

<PossibleLocationDialog bind:this={dialogRef} onDialogSubmit={handleDialogSubmit} />

{#if locations.length === 0}
	<p><em>No possible locations found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Possible locations" style="width: 100%;">
			<Head>
				<Row>
					<Cell>Location Code</Cell>
					<Cell style="width:100%;">Location Name</Cell>
					<Cell>Actions</Cell>
				</Row>
			</Head>
			<Body>
				{#each locations as p (p.code)}
					<Row>
						<Cell
							>{#if p.code}<code>{p.code}</code>{:else}-{/if}</Cell
						>
						<Cell>{p.name ?? '-'}</Cell>
						<Cell>
							{#if editingCode === p.code}
								<CircularProgress style="height: 32px; width: 32px;" indeterminate />
							{:else}
								<IconButton
									class="material-icons"
									onclick={() => dialogRef?.openEditDialog({ code: p.code, name: p.name ?? '' })}
									aria-label="Edit"
									title="Edit"
									disabled={creatingPending || !!deletingCode}>edit</IconButton
								>
							{/if}
							{#if deletingCode === p.code}
								<CircularProgress style="height: 32px; width: 32px;" indeterminate />
							{:else}
								<IconButton
									class="material-icons"
									onclick={() => handleDeleteLocation(p.code)}
									aria-label="Delete"
									title="Delete"
									disabled={creatingPending || !!editingCode}>delete</IconButton
								>
							{/if}
						</Cell>
					</Row>
				{/each}
				{#if creatingPending}
					<Row>
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
