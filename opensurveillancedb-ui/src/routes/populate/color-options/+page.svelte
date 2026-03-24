<script lang="ts">
	import '$lib/hex-swatch-border.css';
	import { invalidateAll } from '$app/navigation';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import Button, { Icon, Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import CircularProgress from '@smui/circular-progress';
	import { createDeviceColor, deleteDeviceColor, updateDeviceColor } from '$lib/supabaseClient';
	import { normalizeHexColor } from '$lib/color';
	import {
		deleteColorSwatchFile,
		getColorSwatchPublicUrl,
		uploadColorSwatchFile
	} from '$lib/storage';
	import ErrorSnackbar from '$lib/ErrorSnackbar.svelte';
	import { getErrorMessage } from '$lib/errors';
	import ColorOptionDialog from './ColorOptionDialog.svelte';

	let { data } = $props();
	const colors = $derived(data?.colors ?? []);
	const canEdit = $derived(!!data?.user);

	type ColorOptionDialogRef = {
		openCreateDialog: () => void;
		openEditDialog: (color: {
			code: string;
			name: string;
			hex_code?: string | null;
			swatch_icon?: string | null;
		}) => void;
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
		hex_code: string | null;
		iconFile: File | null;
		selectedSwatchIcon: string | null;
	}) {
		try {
			if (detail.mode === 'create') {
				creatingPending = true;
				let uploadedSwatchIcon: string | null = null;
				try {
					let nextSwatchIcon = detail.selectedSwatchIcon;
					if (detail.iconFile) {
						uploadedSwatchIcon = await uploadColorSwatchFile(detail.iconFile, detail.name);
						nextSwatchIcon = uploadedSwatchIcon;
					}

					await createDeviceColor({
						code: detail.code,
						name: detail.name,
						hex_code: detail.hex_code,
						swatch_icon: nextSwatchIcon
					});
					await invalidateAll();
				} catch (error) {
					if (uploadedSwatchIcon) {
						try {
							await deleteColorSwatchFile(uploadedSwatchIcon);
						} catch {
							// no-op cleanup failure
						}
					}
					throw error;
				} finally {
					creatingPending = false;
				}
			} else {
				if (!detail.originalCode) {
					throw new Error('Missing original code for edit operation.');
				}

				editingCode = detail.originalCode;
				let uploadedSwatchIcon: string | null = null;
				const existingColor = colors.find((color) => color.code === detail.originalCode);
				const currentSwatchIcon = existingColor?.swatch_icon ?? null;
				try {
					let nextSwatchIcon = detail.selectedSwatchIcon;
					if (detail.iconFile) {
						uploadedSwatchIcon = await uploadColorSwatchFile(detail.iconFile, detail.name);
						nextSwatchIcon = uploadedSwatchIcon;
					}

					await updateDeviceColor(detail.originalCode, {
						code: detail.code,
						name: detail.name,
						hex_code: detail.hex_code,
						swatch_icon: nextSwatchIcon
					});

					if (uploadedSwatchIcon && currentSwatchIcon && currentSwatchIcon !== uploadedSwatchIcon) {
						await deleteColorSwatchFile(currentSwatchIcon);
					}

					await invalidateAll();
				} catch (error) {
					if (uploadedSwatchIcon) {
						try {
							await deleteColorSwatchFile(uploadedSwatchIcon);
						} catch {
							// no-op cleanup failure
						}
					}
					throw error;
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
	<div class="mb-2 flex justify-end">
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
	<div class="overflow-auto">
		<DataTable table$aria-label="Color options" class="w-full">
			<Head>
				<Row>
					<Cell>Code</Cell>
					<Cell>Name</Cell>
					<Cell>Hex</Cell>
					<Cell class="w-full">Swatch Icon</Cell>
					{#if canEdit}
						<Cell>Actions</Cell>
					{/if}
				</Row>
			</Head>
			<Body>
				{#each colors as c (c.code)}
					{@const hexColor = normalizeHexColor(c.hex_code)}
					{@const swatchIconUrl = getColorSwatchPublicUrl(c.swatch_icon)}
					<Row>
						<Cell><code>{c.code}</code></Cell>
						<Cell>{c.name}</Cell>
						<Cell>
							<div class="flex items-center gap-2">
								<div
									class="hex-swatch-border h-6 w-6 rounded-sm border"
									style={`background-color:${hexColor ?? 'transparent'}`}
								></div>
								<span>{hexColor ?? '-'}</span>
							</div>
						</Cell>
						<Cell>
							{#if swatchIconUrl}
								<div class="flex items-center gap-2">
									<img
										src={swatchIconUrl}
										alt={c.name}
										width="32"
										height="32"
										class="h-8 w-8 object-contain"
									/>
									<span>{c.swatch_icon}</span>
								</div>
							{:else}
								-
							{/if}
						</Cell>
						{#if canEdit}
							<Cell>
								{#if editingCode === c.code}
									<CircularProgress class="h-8 w-8" indeterminate />
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
									<CircularProgress class="h-8 w-8" indeterminate />
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
								<CircularProgress class="h-8 w-8" indeterminate /></Cell
							>
							<Cell>
								<CircularProgress class="h-8 w-8" indeterminate /></Cell
							>
							<Cell>
								<CircularProgress class="h-8 w-8" indeterminate /></Cell
							>
							<Cell>
								<CircularProgress class="h-8 w-8" indeterminate /></Cell
							>
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
