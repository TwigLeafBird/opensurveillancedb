<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Button, { Icon, Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import { createDeviceColor, deleteDeviceColor, updateDeviceColor } from '$lib/supabaseClient';
	import ErrorSnackbar from '$lib/ErrorSnackbar.svelte';
	import { getErrorMessage } from '$lib/errors';
	import ColorOptionDialog from './ColorOptionDialog.svelte';

	let { data } = $props();
	const colors = $derived(data?.colors ?? []);
	const canEdit = $derived(!!data?.user);

	type ColorOptionDialogRef = {
		openCreateDialog: () => void;
		openEditDialog: (color: { code: string; name: string }) => void;
	};

	type ErrorSnackbarRef = {
		show: (message: string) => void;
	};

	let dialogRef = $state(null) as ColorOptionDialogRef | null;
	let errorSnackbarRef = $state(null) as ErrorSnackbarRef | null;
	let deletingCode = $state<string | null>(null);
	let editingCode = $state<string | null>(null);
	let creatingPending = $state(false);

	function showError(error: unknown, fallback: string) {
		const message = getErrorMessage(error, fallback);
		errorSnackbarRef?.show(message);
		return message;
	}

	async function handleDialogSubmit(detail: {
		mode: 'create' | 'edit';
		originalCode: string | null;
		code: string;
		name: string;
	}) {
		try {
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
		} catch (error) {
			throw new Error(showError(error, 'Failed to save color option.'));
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
			showError(error, 'Failed to delete color option.');
		} finally {
			deletingCode = null;
		}
	}
</script>

<ErrorSnackbar bind:this={errorSnackbarRef} />

{#if canEdit}
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
{/if}

{#if canEdit}
	<ColorOptionDialog bind:this={dialogRef} onDialogSubmit={handleDialogSubmit} />
{/if}

{#if colors.length === 0}
	<p><em>No colors found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Color options" style="width: 100%;">
			<Head>
				<Row>
					<Cell>Code</Cell>
					<Cell style="width:100%;">Name</Cell>
					{#if canEdit}
						<Cell>Actions</Cell>
					{/if}
				</Row>
			</Head>
			<Body>
				{#each colors as c (c.code)}
					<Row>
						<Cell><code>{c.code}</code></Cell>
						<Cell>{c.name}</Cell>
						{#if canEdit}
							<Cell>
								{#if editingCode === c.code}
									<CircularProgress style="height: 32px; width: 32px;" indeterminate />
								{:else}
									<IconButton
										class="material-icons"
										onclick={() => dialogRef?.openEditDialog(c)}
										aria-label="Edit"
										title="Edit"
										disabled={creatingPending || !!deletingCode}>edit</IconButton
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
										disabled={creatingPending || !!editingCode}>delete</IconButton
									>
								{/if}
							</Cell>
						{/if}
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
						{#if canEdit}
							<Cell>
								<CircularProgress style="height: 32px; width: 32px;" indeterminate />
							</Cell>
						{/if}
					</Row>
				{/if}
			</Body>
		</DataTable>
	</div>
{/if}
