<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Button, { Icon, Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import ShapeIcon from '$lib/ShapeIcon.svelte';
	import {
		createDeviceShapeProfile,
		deleteDeviceShapeProfile,
		updateDeviceShapeProfile
	} from '$lib/supabaseClient';
	import ShapeProfileDialog from './ShapeProfileDialog.svelte';

	let { data } = $props();
	const shapeProfiles = $derived(
		(data?.shapeProfiles ?? []) as Array<{
			id: string;
			short_name: string;
			icon?: string | null;
		}>
	);

	type ShapeProfileDialogRef = {
		openCreateDialog: () => void;
		openEditDialog: (shapeProfile: {
			id: string;
			short_name: string;
			icon?: string | null;
		}) => void;
	};

	let dialogRef = $state(null) as ShapeProfileDialogRef | null;
	let deletingId = $state<string | null>(null);
	let editingId = $state<string | null>(null);
	let creatingPending = $state(false);

	async function handleDialogSubmit(detail: {
		mode: 'create' | 'edit';
		originalId: string | null;
		short_name: string;
		icon: string | null;
	}) {
		if (detail.mode === 'create') {
			creatingPending = true;
			try {
				await createDeviceShapeProfile({
					id: crypto.randomUUID(),
					short_name: detail.short_name,
					icon: detail.icon
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
				await updateDeviceShapeProfile(detail.originalId, {
					id: detail.originalId,
					short_name: detail.short_name,
					icon: detail.icon
				});
				await invalidateAll();
			} finally {
				editingId = null;
			}
		}
	}

	async function handleDeleteShapeProfile(id: string) {
		if (creatingPending || editingId) {
			return;
		}

		if (!confirm(`Delete shape profile "${id}"?`)) {
			return;
		}

		deletingId = id;
		try {
			await deleteDeviceShapeProfile(id);
			await invalidateAll();
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete shape profile.');
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
		<Label>Create Shape Profile</Label>
	</Button>
</div>

<ShapeProfileDialog bind:this={dialogRef} onDialogSubmit={handleDialogSubmit} />

{#if shapeProfiles.length === 0}
	<p><em>No shape profiles found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Shape profiles" style="width: 100%;">
			<Head>
				<Row>
					<Cell>Short Name</Cell>
					<Cell>ID</Cell>
					<Cell style="width:100%;">Icon</Cell>
					<Cell>Actions</Cell>
				</Row>
			</Head>

			<Body>
				{#each shapeProfiles as s (s.id)}
					<Row>
						<Cell>{s.short_name}</Cell>
						<Cell><code>{s.id}</code></Cell>
						<Cell>
							<ShapeIcon filename={s.icon ?? null} alt={s.short_name} size={64} />
						</Cell>
						<Cell>
							{#if editingId === s.id}
								<CircularProgress style="height: 32px; width: 32px;" indeterminate />
							{:else}
								<IconButton
									class="material-icons"
									onclick={() => dialogRef?.openEditDialog(s)}
									aria-label="Edit"
									title="Edit"
									disabled={creatingPending || !!deletingId}>edit</IconButton
								>
							{/if}
							{#if deletingId === s.id}
								<CircularProgress style="height: 32px; width: 32px;" indeterminate />
							{:else}
								<IconButton
									class="material-icons"
									onclick={() => handleDeleteShapeProfile(s.id)}
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
