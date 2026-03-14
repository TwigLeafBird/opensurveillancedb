<script lang="ts">
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	let { data } = $props();
	const locations = $derived(data?.locations ?? []);
</script>

{#if locations.length === 0}
	<p><em>No possible locations found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Possible locations" style="width: 100%;">
			<Head>
				<Row>
					<Cell>Location Code</Cell>
					<Cell style="width:100%;">Location Name</Cell>
				</Row>
			</Head>
			<Body>
				{#each locations as p (p.code)}
					<Row>
						<Cell
							>{#if p.code}<code>{p.code}</code>{:else}-{/if}</Cell
						>
						<Cell>{p.name ?? '-'}</Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
	</div>
{/if}
