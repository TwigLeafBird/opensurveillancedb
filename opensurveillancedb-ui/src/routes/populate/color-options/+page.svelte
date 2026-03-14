<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Button, { Icon, Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import { createDeviceColor, deleteDeviceColor, updateDeviceColor } from '$lib/supabaseClient';
	import ColorOptionDialog from './ColorOptionDialog.svelte';

	let { data } = $props();
	const colors = $derived(data?.colors ?? []);

	type ColorOptionDialogRef = {
		openCreateDialog: () => void;
		openEditDialog: (color: { code: string; name: string }) => void;
	};

	let dialogRef = $state(null) as ColorOptionDialogRef | null;
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
				await createDeviceColor({ code: detail.code, name: detail.name });
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
				await updateDeviceColor(detail.originalCode, { code: detail.code, name: detail.name });
				await invalidateAll();
			} finally {
				editingCode = null;
			}
		}
	}

	async function handleDeleteColor(code: string) {
		if (creatingPending || editingCode) {
			return;
		}

		if (!confirm(`Delete color option "${code}"?`)) {
			return;
		}

		deletingCode = code;
		try {
			await deleteDeviceColor(code);
			await invalidateAll();
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete color option.');
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
		<Label>Create Color</Label>
	</Button>
</div>

<ColorOptionDialog bind:this={dialogRef} onDialogSubmit={handleDialogSubmit} />

{#if colors.length === 0}
	<p><em>No colors found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Color options" style="width: 100%;">
			<Head>
				<Row>
					<Cell>Code</Cell>
					<Cell style="width:100%;">Name</Cell>
					<Cell>Actions</Cell>
				</Row>
			</Head>
			<Body>
				{#each colors as c (c.code)}
					<Row>
						<Cell><code>{c.code}</code></Cell>
						<Cell>{c.name}</Cell>
						<Cell>
							{#if editingCode === c.code}
								<CircularProgress style="height: 32px; width: 32px;" indeterminate />
							{:else}
								<IconButton
									class="material-icons"
									onclick={() => dialogRef?.openEditDialog(c)}
									aria-label="Edit"
									title="Edit"
									disabled={creatingPending || !!deletingCode}
								>edit</IconButton
								>
							{/if}
							{#if deletingCode === c.code}
								<CircularProgress style="height: 32px; width: 32px;" indeterminate />
							{:else}
								<IconButton
									class="material-icons"
									onclick={() => handleDeleteColor(c.code)}
									aria-label="Delete"
									title="Delete"
									disabled={creatingPending || !!editingCode}
								>delete</IconButton
								>
							{/if}
						</Cell>
					</Row>
				{/each}
				{#if creatingPending}
					<Row>
						<Cell>
							<CircularProgress style="height: 32px; width: 32px;" indeterminate /></Cell
						>
						<Cell>
							<CircularProgress style="height: 32px; width: 32px;" indeterminate /></Cell
						>
						<Cell>
							<CircularProgress style="height: 32px; width: 32px;" indeterminate />
						</Cell>
					</Row>
				{/if}
			</Body>
		</DataTable>
	</div>
{/if}
