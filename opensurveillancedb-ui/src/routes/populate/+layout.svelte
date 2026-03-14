<script lang="ts">
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import TabBar from '@smui/tab-bar';
	import Tab, { Label } from '@smui/tab';
	import Button from '@smui/button';
	import { page } from '$app/state';
	import { redirect } from '@sveltejs/kit';

	type TabEntry = {
		route: string;
		label: string;
	};

	let tabs: TabEntry[] = [
		{ route: 'device-models', label: 'Device Models' },
		{ route: 'manufacturers', label: 'Manufacturers' },
		{ route: 'shape-profiles', label: 'Shape Profiles' },
		{ route: 'possible-locations', label: 'Possible Locations' },
		{ route: 'color-options', label: 'Color Options' }
	];

	let { children } = $props();
	if (page.route.id === '/populate') {
		redirect(308, `/populate/${tabs[0].route}`);
	}
	let currentlyModifying = page.route.id?.replace('/populate/', '');
	let active = $state(tabs.find((tab) => tab.route === currentlyModifying));
</script>

<TopAppBar variant="static">
	<Row>
		<Section>
			<Title>Populate Database</Title>
		</Section>
	</Row>
</TopAppBar>
<TabBar {tabs} key={(tab) => tab.route} bind:active>
	{#snippet tab(tabEntry: TabEntry)}
		<Tab tab={tabEntry} href={`/populate/${tabEntry.route}`}>
			<Label>{tabEntry.label}</Label>
		</Tab>
	{/snippet}
</TabBar>

<main style="padding:1rem; box-sizing: border-box;">
	<div style="max-width:100%;">
		{@render children()}
	</div>
</main>
