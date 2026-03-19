<script lang="ts">
	import { goto } from '$app/navigation';
	import TabBar from '@smui/tab-bar';
	import Tab, { Label } from '@smui/tab';
	import { page } from '$app/state';

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
	let active = $state<TabEntry | undefined>(tabs[0]);

	$effect(() => {
		// Redirect to first tab if at /populate
		if (page.url.pathname === '/populate') {
			void goto(`/populate/${tabs[0].route}`, { replaceState: true });
		}
	});

	$effect(() => {
		// Update active tab based on URL
		const currentTabRoute = page.route.id?.replace('/populate/', '');
		active = tabs.find((tab) => tab.route === currentTabRoute) ?? tabs[0];
	});
</script>

<TabBar {tabs} key={(tab) => tab.route} bind:active>
	{#snippet tab(tabEntry: TabEntry)}
		<Tab tab={tabEntry} href={`/populate/${tabEntry.route}`}>
			<Label>{tabEntry.label}</Label>
		</Tab>
	{/snippet}
</TabBar>

<main class="p-4 box-border">
	<div class="max-w-full">
		{@render children()}
	</div>
</main>
