<script lang="ts">
	import Button, { Label } from '@smui/button';
	import DataTable, { Body, Cell, Head, Row } from '@smui/data-table';
	import SelectionTile from '$lib/SelectionTile.svelte';
	import ShapeIcon from '$lib/ShapeIcon.svelte';
	import { sanitizeHref } from '$lib/url';
	import type { DeviceInfo } from '$lib/supabaseClient';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const deviceInfos = $derived((data?.deviceInfos ?? []) as DeviceInfo[]);
	const manufacturers = $derived(
		(data?.manufacturers ?? []) as Array<{ id: string; name: string }>
	);
	const shapeProfiles = $derived(
		(data?.shapeProfiles ?? []) as Array<{ id: string; short_name: string; icon?: string | null }>
	);
	const colors = $derived((data?.colors ?? []) as Array<{ code: string; name: string }>);

	let selectedManufacturerIds = $state<string[]>([]);
	let selectedShapeProfileIds = $state<string[]>([]);
	let selectedColorCodes = $state<string[]>([]);

	function toggleValue(values: string[], value: string): string[] {
		return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
	}

	function toggleManufacturer(id: string) {
		selectedManufacturerIds = toggleValue(selectedManufacturerIds, id);
	}

	function toggleShapeProfile(id: string) {
		selectedShapeProfileIds = toggleValue(selectedShapeProfileIds, id);
	}

	function toggleColor(code: string) {
		selectedColorCodes = toggleValue(selectedColorCodes, code);
	}

	function clearSelections() {
		selectedManufacturerIds = [];
		selectedShapeProfileIds = [];
		selectedColorCodes = [];
	}

	const filteredDeviceInfos = $derived(
		deviceInfos.filter((deviceInfo) => {
			const manufacturerMatch =
				selectedManufacturerIds.length === 0 ||
				(deviceInfo.manufacturer?.id != null &&
					selectedManufacturerIds.includes(deviceInfo.manufacturer.id));

			const shapeProfileId =
				deviceInfo.device_shape_profile?.id ?? deviceInfo.shape_profile ?? null;
			const shapeProfileMatch =
				selectedShapeProfileIds.length === 0 ||
				(shapeProfileId != null && selectedShapeProfileIds.includes(shapeProfileId));

			const deviceColorCodes = (deviceInfo.device_color_option ?? []).map(
				(option) => option.color_id
			);
			const colorMatch =
				selectedColorCodes.length === 0 ||
				selectedColorCodes.every((selectedCode) => deviceColorCodes.includes(selectedCode));

			return manufacturerMatch && shapeProfileMatch && colorMatch;
		})
	);
</script>

<div style="padding:1.5rem; display:flex; flex-direction:column; gap:1.5rem;">
	<section style="display:flex; flex-direction:column; gap:0.5rem;">
		<h1 style="margin:0; font-size:1.8rem;">Identify</h1>
		<p style="margin:0; opacity:0.8;">
			Answer the high-level questions below to narrow down the most likely device models.
		</p>
	</section>

	<section style="display:flex; flex-direction:column; gap:1.5rem;">
		<div style="display:flex; flex-direction:column; align-items:flex-start; gap:0.75rem;">
			<h2 style="margin:0; font-size:1.25rem;">Main Questions</h2>
			<Button variant="outlined" onclick={clearSelections}>
				<Label>Clear selections</Label>
			</Button>
		</div>

		<div style="display:flex; flex-direction:column; gap:0.75rem;">
			<h3 style="margin:0; font-size:1rem;">Manufacturer</h3>
			<div
				style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:1rem;"
			>
				{#each manufacturers as manufacturer (manufacturer.id)}
					<SelectionTile
						label={manufacturer.name}
						selected={selectedManufacturerIds.includes(manufacturer.id)}
						onclick={() => toggleManufacturer(manufacturer.id)}
					/>
				{/each}
			</div>
		</div>

		<div style="display:flex; flex-direction:column; gap:0.75rem;">
			<h3 style="margin:0; font-size:1rem;">Shape Profile</h3>
			<div
				style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:1rem;"
			>
				{#each shapeProfiles as shapeProfile (shapeProfile.id)}
					<SelectionTile
						label={shapeProfile.short_name}
						iconFilename={shapeProfile.icon ?? null}
						selected={selectedShapeProfileIds.includes(shapeProfile.id)}
						onclick={() => toggleShapeProfile(shapeProfile.id)}
					/>
				{/each}
			</div>
		</div>

		<div style="display:flex; flex-direction:column; gap:0.75rem;">
			<h3 style="margin:0; font-size:1rem;">Color</h3>
			<div
				style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:1rem;"
			>
				{#each colors as color (color.code)}
					<SelectionTile
						label={color.name}
						supportingText={color.code}
						selected={selectedColorCodes.includes(color.code)}
						onclick={() => toggleColor(color.code)}
					/>
				{/each}
			</div>
		</div>
	</section>

	<section style="display:flex; flex-direction:column; gap:0.75rem;">
		<h2 style="margin:0; font-size:1.25rem;">Follow-up Questions</h2>
		<div
			style="min-height:96px; border:1px dashed color-mix(in srgb, currentColor 20%, transparent); border-radius:0.875rem; background:color-mix(in srgb, currentColor 3%, transparent); display:flex; align-items:center; justify-content:center; padding:1rem;"
		>
			<p style="margin:0; opacity:0.7; font-style:italic; text-align:center;">Coming soon</p>
		</div>
	</section>

	<section style="display:flex; flex-direction:column; gap:0.75rem; min-width:0;">
		<div
			style="display:flex; align-items:flex-end; justify-content:space-between; gap:1rem; flex-wrap:wrap;"
		>
			<div style="display:flex; flex-direction:column; gap:0.25rem;">
				<h2 style="margin:0; font-size:1.25rem;">Possible Results</h2>
				<p style="margin:0; opacity:0.8;">{filteredDeviceInfos.length} matching device models</p>
			</div>
		</div>

		{#if filteredDeviceInfos.length === 0}
			<p><em>No matching device models found.</em></p>
		{:else}
			<div style="overflow:auto">
				<DataTable
					table$aria-label="Possible device model results"
					style="width: 100%; table-layout: fixed;"
				>
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
						</Row>
					</Head>

					<Body>
						{#each filteredDeviceInfos as deviceInfo (deviceInfo.id)}
							<Row>
								<Cell
									style="width:20%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
									>{deviceInfo.name}</Cell
								>
								<Cell
									style="width:8%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
								>
									<code>{deviceInfo.id}</code>
								</Cell>
								<Cell
									style="width:15%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
									>{deviceInfo.manufacturer?.name ?? '-'}</Cell
								>
								<Cell>
									<div style="display:flex; align-items:center; gap:8px; min-width:0;">
										<ShapeIcon
											filename={deviceInfo.device_shape_profile?.icon ?? null}
											alt={deviceInfo.device_shape_profile?.short_name ?? ''}
											size={40}
										/>
										<span style="flex:1; min-width:0; white-space:normal; word-break:break-word;">
											{deviceInfo.device_shape_profile?.short_name ??
												deviceInfo.shape_profile ??
												'-'}
										</span>
									</div>
								</Cell>
								<Cell
									style="width:12%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
								>
									{#if deviceInfo.device_color_option && deviceInfo.device_color_option.length > 0}
										{deviceInfo.device_color_option
											.map((option) => option?.color?.name ?? option?.color?.code)
											.join(', ')}
									{:else}
										-
									{/if}
								</Cell>
								<Cell style="width:15%; white-space:normal;">
									{#if deviceInfo.device_possible_location && deviceInfo.device_possible_location.length > 0}
										{deviceInfo.device_possible_location
											.map((location) => location?.device_location?.name ?? location?.location_code)
											.join(', ')}
									{:else}
										-
									{/if}
								</Cell>
								<Cell
									style="width:5%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
								>
									{#if sanitizeHref(deviceInfo.datasheet_url)}
										<a
											href={sanitizeHref(deviceInfo.datasheet_url)}
											target="_blank"
											rel="noopener noreferrer">link</a
										>
									{:else}
										-
									{/if}
								</Cell>
								<Cell
									style="width:5%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
								>
									{#if sanitizeHref(deviceInfo.product_url)}
										<a
											href={sanitizeHref(deviceInfo.product_url)}
											target="_blank"
											rel="noopener noreferrer">link</a
										>
									{:else}
										-
									{/if}
								</Cell>
							</Row>
						{/each}
					</Body>
				</DataTable>
			</div>
		{/if}
	</section>
</div>
