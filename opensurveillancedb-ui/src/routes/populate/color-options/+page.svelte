<script lang="ts">
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	let { data } = $props();
	const colors = $derived(data?.colors ?? []);
</script>

{#if colors.length === 0}
	<p><em>No colors found.</em></p>
{:else}
	<div style="overflow:auto">
		<DataTable table$aria-label="Color options" style="width: 100%;">
			<Head>
				<Row>
					<Cell>Code</Cell>
					<Cell style="width:100%;">Name</Cell>
				</Row>
			</Head>
			<Body>
				{#each colors as c (c.code)}
					<Row>
						<Cell><code>{c.code}</code></Cell>
						<Cell>{c.name}</Cell>
					</Row>
				{/each}
			</Body>
		</DataTable>
	</div>
{/if}
