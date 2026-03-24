<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		gridClass?: string;
		gridStyle?: string;
		wrapperClass?: string;
		children: Snippet;
	};

	let {
		title,
		gridClass = 'grid [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))] gap-4',
		gridStyle = '',
		wrapperClass = 'flex flex-col gap-3',
		children
	}: Props = $props();
</script>

<div class={wrapperClass}>
	<p class="m-0 text-base leading-5 font-semibold">{title}</p>
	<div class={gridClass} style={gridStyle}>
		{@render children()}
	</div>
</div>
