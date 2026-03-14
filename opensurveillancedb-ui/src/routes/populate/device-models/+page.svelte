<script lang="ts">
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import ShapeIcon from '$lib/ShapeIcon.svelte';
	import { sanitizeHref } from '$lib/url';
	import type { DeviceInfo } from '$lib/supabaseClient';

	let { data } = $props();
	const deviceInfos = $derived((data?.deviceInfos ?? []) as DeviceInfo[]);
</script>

{#if deviceInfos.length === 0}
	<p><em>No device models found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Device models" style="width: 100%; table-layout: fixed;">
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
				{#each deviceInfos as m (m.id)}
					<Row>
						<Cell style="width:20%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
							>{m.name}</Cell
						>
						<Cell style="width:8%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
							><code>{m.id}</code></Cell
						>
						<Cell style="width:15%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
							>{m.manufacturer?.name ?? '-'}</Cell
						>
						<Cell>
							<div style="display:flex; align-items:center; gap:8px; min-width:0;">
								<ShapeIcon
									filename={m.device_shape_profile?.icon ?? null}
									alt={m.device_shape_profile?.short_name ?? ''}
									size={40}
								/>
								<span style="flex:1; min-width:0; white-space:normal; word-break:break-word;"
									>{m.device_shape_profile?.short_name ?? m.shape_profile ?? '-'}</span
								>
							</div>
						</Cell>
						<Cell style="width:12%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
							{#if m.device_color_option && m.device_color_option.length > 0}
								{m.device_color_option.map((co) => co?.color?.name ?? co?.color?.code).join(', ')}
							{:else}
								-
							{/if}
						</Cell>
						<Cell style="width:15%; white-space:normal;">
							{#if m.device_possible_location && m.device_possible_location.length > 0}
								{m.device_possible_location
									.map((pl) => pl?.device_location?.name ?? pl?.location_code)
									.join(', ')}
							{:else}
								-
							{/if}
						</Cell>
						<Cell style="width:5%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
							{#if sanitizeHref(m.datasheet_url)}
								<a href={sanitizeHref(m.datasheet_url)} target="_blank" rel="noopener noreferrer"
									>link</a
								>
							{:else}
								-
							{/if}
						</Cell>
						<Cell style="width:5%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
							{#if sanitizeHref(m.product_url)}
								<a href={sanitizeHref(m.product_url)} target="_blank" rel="noopener noreferrer"
									>link</a
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
