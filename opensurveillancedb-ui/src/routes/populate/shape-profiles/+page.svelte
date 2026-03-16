<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Button, { Icon, Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import ShapeIcon from '$lib/ShapeIcon.svelte';
	import ErrorSnackbar from '$lib/ErrorSnackbar.svelte';
	import { getErrorMessage } from '$lib/errors';
	import { uploadIconFile, deleteIconFile } from '$lib/storage';
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
	const canEdit = $derived(!!data?.user);

	type ShapeProfileDialogRef = {
		openCreateDialog: () => void;
		openEditDialog: (shapeProfile: {
			id: string;
			short_name: string;
			icon?: string | null;
		}) => void;
	};

	type ErrorSnackbarRef = {
		show: (message: string) => void;
	};

	let dialogRef = $state(null) as ShapeProfileDialogRef | null;
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
		short_name: string;
		iconFile: File | null;
		selectedIcon: string | null;
	}) {
		try {
			if (detail.mode === 'create') {
				creatingPending = true;
				let uploadedIcon: string | null = null;
				try {
					if (detail.iconFile) {
						uploadedIcon = await uploadIconFile(detail.iconFile, detail.short_name);
					}

					await createDeviceShapeProfile({
						id: crypto.randomUUID(),
						short_name: detail.short_name,
						icon: uploadedIcon
					});
					await invalidateAll();
				} catch (error) {
					if (uploadedIcon) {
						try {
							await deleteIconFile(uploadedIcon);
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
				let uploadedIcon: string | null = null;
				const existingShapeProfile = shapeProfiles.find(
					(shapeProfile) => shapeProfile.id === detail.originalId
				);
				const currentIcon = existingShapeProfile?.icon ?? null;
				try {
					let nextIcon = detail.selectedIcon;
					if (detail.iconFile) {
						uploadedIcon = await uploadIconFile(detail.iconFile, detail.short_name);
						nextIcon = uploadedIcon;
					}

					await updateDeviceShapeProfile(detail.originalId, {
						id: detail.originalId,
						short_name: detail.short_name,
						icon: nextIcon
					});

					if (uploadedIcon && currentIcon && currentIcon !== uploadedIcon) {
						await deleteIconFile(currentIcon);
					}

					await invalidateAll();
				} catch (error) {
					if (uploadedIcon) {
						try {
							await deleteIconFile(uploadedIcon);
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
			throw new Error(showError(error, 'Failed to save shape profile.'));
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
			showError(error, 'Failed to delete shape profile.');
		} finally {
			deletingId = null;
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
			disabled={creatingPending || !!editingId || !!deletingId}
		>
			<Icon class="material-icons">add</Icon>
			<Label>Create Shape Profile</Label>
		</Button>
	</div>
{/if}

{#if canEdit}
	<ShapeProfileDialog bind:this={dialogRef} onDialogSubmit={handleDialogSubmit} />
{/if}

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
					{#if canEdit}
						<Cell>Actions</Cell>
					{/if}
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
						{#if canEdit}
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
								<CircularProgress style="height: 32px; width: 32px;" indeterminate />
							</Cell>
						{/if}
					</Row>
				{/if}
			</Body>
		</DataTable>
	</div>
{/if}
