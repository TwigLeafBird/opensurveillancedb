<script lang="ts">
	import DataTable, { Body, Cell, Head, Row } from '@smui/data-table';
	import ShapeIcon from '$lib/ShapeIcon.svelte';
	import ColorSwatchList from '$lib/ColorSwatchList.svelte';
	import ManufacturerIconList from '$lib/ManufacturerIconList.svelte';
	import ImageGalleryHoverPreview from '$lib/ImageGalleryHoverPreview.svelte';
	import TextListHoverPreview from '$lib/TextListHoverPreview.svelte';
	import { getModelExampleImagePublicUrl } from '$lib/storage';
	import { sanitizeHref } from '$lib/url';
	import type { DeviceInfo } from '$lib/supabaseClient';

	type Props = {
		deviceInfos: DeviceInfo[];
	};

	let { deviceInfos }: Props = $props();
</script>

{#if deviceInfos.length === 0}
	<p><em>No matching device models found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Possible device model results" style="width: 100%; table-layout: fixed;">
			<Head>
				<Row>
					<Cell style="width:20%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
						>Name</Cell
					>
					<Cell style="width:10%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
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
				{#each deviceInfos as deviceInfo (deviceInfo.id)}
					{@const exampleImageEntries = (deviceInfo.example_images ?? []).flatMap((filename, index) => {
						const url = getModelExampleImagePublicUrl(filename);
						return url
							? [{
									src: url,
									alt: `${deviceInfo.name} example image ${index + 1}`,
									key: `${deviceInfo.id}-${filename}-${index}`
							  }]
							: [];
					})}
					<Row>
						<Cell style="width:20%; white-space:normal; overflow:hidden; text-overflow:ellipsis;">
							<div style="display:flex; flex-direction:column; gap:0.25rem; min-width:0;">
								<div
									style="display:flex; align-items:flex-start; justify-content:space-between; gap:0.5rem; min-width:0;"
								>
									<strong
										style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:0.95rem; min-width:0; flex:1;"
										>{deviceInfo.name}</strong
									>
									{#if exampleImageEntries.length > 0}
										<ImageGalleryHoverPreview
											images={exampleImageEntries}
											ariaLabel={`Preview ${deviceInfo.name} example images`}
											panelLabel={`${deviceInfo.name} example images`}
											buttonLabel={String(exampleImageEntries.length)}
											buttonClass="mt-0.5 flex-none"
										/>
									{/if}
									{#if (deviceInfo.distinguishing_features ?? []).length > 0}
										<TextListHoverPreview
											items={deviceInfo.distinguishing_features ?? []}
											ariaLabel={`Preview ${deviceInfo.name} distinguishing features`}
											panelLabel={`${deviceInfo.name} distinguishing features`}
											buttonLabel={String((deviceInfo.distinguishing_features ?? []).length)}
											buttonClass="mt-0.5 flex-none"
										/>
									{/if}
								</div>
								<code style="font-size:0.7rem; opacity:0.8;">{deviceInfo.id}</code>
							</div>
						</Cell>
						<Cell style="width:10%;">
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
									{deviceInfo.device_shape_profile?.short_name ?? deviceInfo.shape_profile ?? '-'}
								</span>
							</div>
						</Cell>
						<Cell style="width:12%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
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
						<Cell style="width:5%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
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
						<Cell style="width:5%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
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
