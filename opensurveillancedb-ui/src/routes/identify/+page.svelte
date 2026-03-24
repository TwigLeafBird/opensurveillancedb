<script lang="ts">
	import { browser } from '$app/environment';
	import Button, { Label } from '@smui/button';
	import { page } from '$app/state';
	import SelectionTile from '$lib/SelectionTile.svelte';
	import { normalizeHexColor } from '$lib/color';
	import DeviceResultsTable from './DeviceResultsTable.svelte';
	import FilterSelectionGrid from './FilterSelectionGrid.svelte';
	import {
		buildSelectionUrl,
		DEFAULT_FILTER_QUERY_KEYS,
		parseSelectionStateFromParams
	} from './filterSync';
	import { getColorSwatchPublicUrl, getManufacturerIconPublicUrl } from '$lib/storage';
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

	$effect(() => {
		if (!browser) {
			return;
		}

		const { manufacturerIds, shapeProfileIds, colorCodes } = parseSelectionStateFromParams(
			page.url.searchParams,
			{
				manufacturerIds: new Set(manufacturers.map((manufacturer) => manufacturer.id)),
				shapeProfileIds: new Set(shapeProfiles.map((shapeProfile) => shapeProfile.id)),
				colorCodes: new Set(colors.map((color) => color.code))
			},
			DEFAULT_FILTER_QUERY_KEYS
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

		const nextUrl = buildSelectionUrl(
			window.location.pathname,
			page.url.search,
			window.location.hash,
			{
				manufacturerIds: selectedManufacturerIds,
				shapeProfileIds: selectedShapeProfileIds,
				colorCodes: selectedColorCodes
			},
			DEFAULT_FILTER_QUERY_KEYS
		);
		const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

		if (nextUrl !== currentUrl) {
			window.history.replaceState(window.history.state, '', nextUrl);
		}
	});

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
		<div class="w-fit">
			<Button variant="outlined" onclick={clearSelections}>
				<Label>Clear selections</Label>
			</Button>
		</div>

		<FilterSelectionGrid title="Manufacturer">
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
		</FilterSelectionGrid>

		<FilterSelectionGrid
			title="Shape Profile"
			wrapperClass="flex flex-col"
			gridClass=""
			gridStyle="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:1rem;"
		>
			{#each shapeProfiles as shapeProfile (shapeProfile.id)}
				<SelectionTile
					label={shapeProfile.short_name}
					iconFilename={shapeProfile.icon ?? null}
					selected={selectedShapeProfileIds.includes(shapeProfile.id)}
					onclick={() => toggleShapeProfile(shapeProfile.id)}
				/>
			{/each}
		</FilterSelectionGrid>

		<FilterSelectionGrid
			title="Color"
			wrapperClass="flex flex-col"
			gridClass=""
			gridStyle="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:1rem;"
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
		</FilterSelectionGrid>
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

		<DeviceResultsTable deviceInfos={filteredDeviceInfos} />
	</section>
</div>
