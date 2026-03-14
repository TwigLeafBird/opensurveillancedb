<script lang="ts">
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import { sanitizeHref } from '$lib/url';
	import type { DeviceInfo } from '$lib/supabaseClient';

	let { data } = $props();
	const deviceInfos = $derived((data?.deviceInfos ?? []) as DeviceInfo[]);
</script>

{#if deviceInfos.length === 0}
	<p><em>No device models found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Device models" style="width: 100%;">
			<Head>
				<Row>
					<Cell>Name</Cell>
					<Cell>ID</Cell>
					<Cell>Manufacturer</Cell>
					<Cell>Shape Profile</Cell>
					<Cell>Colors</Cell>
					<Cell style="width:100%;">Possible Locations</Cell>
					<Cell>Datasheet</Cell>
					<Cell>Product</Cell>
				</Row>
			</Head>

			<Body>
				{#each deviceInfos as m (m.id)}
					<Row>
						<Cell>{m.name}</Cell>
						<Cell><code>{m.id}</code></Cell>
						<Cell>{m.manufacturer?.name ?? '-'}</Cell>
						<Cell>{m.device_shape_profile?.short_name ?? m.shape_profile ?? '-'}</Cell>
						<Cell>
							{#if m.device_color_option && m.device_color_option.length > 0}
								{m.device_color_option.map((co) => co?.color?.name ?? co?.color?.code).join(', ')}
							{:else}
								-
							{/if}
						</Cell>
						<Cell>
							{#if m.device_possible_location && m.device_possible_location.length > 0}
								{m.device_possible_location
									.map((pl) => pl?.device_location?.name ?? pl?.location_code)
									.join(', ')}
							{:else}
								-
							{/if}
						</Cell>
						<Cell>
							{#if sanitizeHref(m.datasheet_url)}
								<a href={sanitizeHref(m.datasheet_url)} target="_blank" rel="noopener noreferrer"
									>link</a
								>
							{:else}
								-
							{/if}
						</Cell>
						<Cell>
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
