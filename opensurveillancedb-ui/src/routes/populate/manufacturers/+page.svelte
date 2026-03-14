<script lang="ts">
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	let { data } = $props();
	const manufacturers = $derived(data?.manufacturers ?? []);
</script>

{#if manufacturers.length === 0}
	<p><em>No manufacturers found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Manufacturers" style="width: 100%;">
			<Head>
				<Row>
					<Cell>Name</Cell>
					<Cell>ID</Cell>
					<Cell style="width:100%;">Alternate Names</Cell>
				</Row>
			</Head>
			<Body>
				{#each manufacturers as m (m.id)}
					<Row>
						<Cell>{m.name}</Cell>
						<Cell><code>{m.id}</code></Cell>
						<Cell>{m.alternate_names ? m.alternate_names.join(', ') : '-'}</Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
	</div>
{/if}
