<script lang="ts">
	import { browser } from '$app/environment';
	import Button, { Label } from '@smui/button';
	import { page } from '$app/state';
	import DataTable, { Body, Cell, Head, Row } from '@smui/data-table';
	import SelectionTile from '$lib/SelectionTile.svelte';
	import ShapeIcon from '$lib/ShapeIcon.svelte';
	import ColorSwatchList from '$lib/ColorSwatchList.svelte';
	import ManufacturerIconList from '$lib/ManufacturerIconList.svelte';
	import { getColorSwatchPublicUrl, getManufacturerIconPublicUrl } from '$lib/storage';
	import { sanitizeHref } from '$lib/url';
	import type { DeviceInfo } from '$lib/supabaseClient';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const deviceInfos = $derived((data?.deviceInfos ?? []) as DeviceInfo[]);
	const manufacturers = $derived(
		(data?.manufacturers ?? []) as Array<{ id: string; name: string; icons?: string[] | null }>
	);
	const shapeProfiles = $derived(
		(data?.shapeProfiles ?? []) as Array<{ id: string; short_name: string; icon?: string | null }>
	);
	const colors = $derived(
		(data?.colors ?? []) as Array<{
			code: string;
			name: string;
			hex_code?: string | null;
			swatch_icon?: string | null;
		}>
	);

	let selectedManufacturerIds = $state<string[]>([]);
	let selectedShapeProfileIds = $state<string[]>([]);
	let selectedColorCodes = $state<string[]>([]);
	let syncingFromUrl = $state(false);

	const QUERY_MANUFACTURER = 'manufacturer';
	const QUERY_SHAPE = 'shape';
	const QUERY_COLOR = 'color';

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

	function parseMultiValueParam(params: URLSearchParams, key: string): string[] {
		const repeatedValues = params.getAll(key).flatMap((value) => value.split(','));
		const trimmedValues = repeatedValues.map((value) => value.trim()).filter(Boolean);
		return [...new Set(trimmedValues)];
	}

	function parseSelectionState(params: URLSearchParams) {
		const validManufacturerIds = new Set(manufacturers.map((manufacturer) => manufacturer.id));
		const validShapeProfileIds = new Set(shapeProfiles.map((shapeProfile) => shapeProfile.id));
		const validColorCodes = new Set(colors.map((color) => color.code));

		const manufacturerIds = parseMultiValueParam(params, QUERY_MANUFACTURER).filter((id) =>
			validManufacturerIds.has(id)
		);
		const shapeProfileIds = parseMultiValueParam(params, QUERY_SHAPE).filter((id) =>
			validShapeProfileIds.has(id)
		);
		const colorCodes = parseMultiValueParam(params, QUERY_COLOR).filter((code) =>
			validColorCodes.has(code)
		);

		return { manufacturerIds, shapeProfileIds, colorCodes };
	}

	$effect(() => {
		if (!browser) {
			return;
		}

		const { manufacturerIds, shapeProfileIds, colorCodes } = parseSelectionState(
			page.url.searchParams
		);

		syncingFromUrl = true;
		selectedManufacturerIds = manufacturerIds;
		selectedShapeProfileIds = shapeProfileIds;
		selectedColorCodes = colorCodes;
		syncingFromUrl = false;
	});

	$effect(() => {
		if (!browser || syncingFromUrl) {
			return;
		}

		const nextParams = new URLSearchParams(page.url.search);
		nextParams.delete(QUERY_MANUFACTURER);
		nextParams.delete(QUERY_SHAPE);
		nextParams.delete(QUERY_COLOR);

		for (const manufacturerId of selectedManufacturerIds) {
			nextParams.append(QUERY_MANUFACTURER, manufacturerId);
		}

		for (const shapeProfileId of selectedShapeProfileIds) {
			nextParams.append(QUERY_SHAPE, shapeProfileId);
		}

		for (const colorCode of selectedColorCodes) {
			nextParams.append(QUERY_COLOR, colorCode);
		}

		const nextSearch = nextParams.toString();
		const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
		const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

		if (nextUrl !== currentUrl) {
			window.history.replaceState(window.history.state, '', nextUrl);
		}
	});

	function normalizeHexColor(value?: string | null): string | null {
		if (!value) {
			return null;
		}

		const trimmedValue = value.trim();
		if (!trimmedValue) {
			return null;
		}

		const candidate = trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`;
		return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(candidate)
			? candidate
			: null;
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

<div class="flex flex-col gap-6 p-6">
	<section class="flex flex-col gap-6">
		<div class="flex flex-col gap-3">
			<div class="w-fit">
				<Button variant="outlined" onclick={clearSelections}>
					<Label>Clear selections</Label>
				</Button>
			</div>
			<p class="m-0 text-base leading-5 font-semibold">Manufacturer</p>
			<div class="grid [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))] gap-4">
				{#each manufacturers as manufacturer (manufacturer.id)}
					{@const primaryLogoUrl = getManufacturerIconPublicUrl(manufacturer.icons?.[0] ?? null)}
					<SelectionTile
						label={manufacturer.name}
						hideLabel={!!primaryLogoUrl}
						imageSrc={primaryLogoUrl}
						imageAlt={manufacturer.name}
						selected={selectedManufacturerIds.includes(manufacturer.id)}
						onclick={() => toggleManufacturer(manufacturer.id)}
					/>
				{/each}
			</div>
		</div>

		<div style="display:flex; flex-direction:column; gap:0.75rem;">
			<p class="m-0 text-base leading-5 font-semibold">Shape Profile</p>
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
			<p class="m-0 text-base leading-5 font-semibold">Color</p>
			<div
				style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:1rem;"
			>
				{#each colors as color (color.code)}
					{@const hexColor = normalizeHexColor(color.hex_code)}
					{@const swatchIconUrl = getColorSwatchPublicUrl(color.swatch_icon)}
					<SelectionTile
						label={color.name}
						colorHex={hexColor}
						imageSrc={hexColor ? null : swatchIconUrl}
						imageAlt={color.name}
						selected={selectedColorCodes.includes(color.code)}
						onclick={() => toggleColor(color.code)}
					/>
				{/each}
			</div>
		</div>
	</section>

	<section style="display:flex; flex-direction:column; gap:0.75rem;">
		<p class="m-0 text-base leading-5 font-semibold">Follow-up Questions</p>
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
				<p style="margin:0; font-size:2rem; line-height:1.5rem; font-weight:600;">
					Possible Results
				</p>
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
								<Cell style="width:15%;">
									<ManufacturerIconList
										icons={deviceInfo.manufacturer?.icons ?? []}
										manufacturerName={deviceInfo.manufacturer?.name ?? 'Manufacturer'}
										emptyText={deviceInfo.manufacturer?.name ?? '-'}
									/>
								</Cell>
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
									<ColorSwatchList colorOptions={deviceInfo.device_color_option ?? []} />
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
