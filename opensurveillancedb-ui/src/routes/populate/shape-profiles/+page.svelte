<script lang="ts">
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	let { data } = $props();
	const shapeProfiles = $derived(data?.shapeProfiles ?? []);
</script>

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
				</Row>
			</Head>
			<Body>
				{#each shapeProfiles as s (s.id)}
					<Row>
						<Cell>{s.short_name}</Cell>
						<Cell><code>{s.id}</code></Cell>
						<Cell>{s.icon ? s.icon : '-'}</Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
	</div>
{/if}
