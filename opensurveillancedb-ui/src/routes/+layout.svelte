<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Button, { Label } from '@smui/button';
	import Drawer, { Content } from '@smui/drawer';
	import List, { Item, Text } from '@smui/list';
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { supabase } from '$lib/supabaseClient';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	type SectionEntry = {
		href: string;
		label: string;
		matches: (pathname: string) => boolean;
	};

	let { data, children } = $props();
	let signingIn = $state(false);
	let signingOut = $state(false);

	const sections: SectionEntry[] = [
		{
			href: '/',
			label: 'About',
			matches: (pathname) => pathname === '/'
		},
		{
			href: '/identify',
			label: 'Device Identifier',
			matches: (pathname) => pathname.startsWith('/identify')
		},
		{
			href: '/populate/device-models',
			label: 'Table View',
			matches: (pathname) => pathname.startsWith('/populate')
		}
	];

	const signedInLabel = $derived(
		data?.user?.email ??
			data?.user?.user_metadata?.user_name ??
			data?.user?.user_metadata?.full_name ??
			'Unknown user'
	);

	async function signInWithGitHub() {
		signingIn = true;

		const next = `${page.url.pathname}${page.url.search}`;
		const redirectTo = `${page.url.origin}/auth/callback?next=${encodeURIComponent(next)}`;

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: { redirectTo }
		});

		if (error) {
			signingIn = false;
		}
	}

	async function signOut() {
		signingOut = true;
		try {
			await supabase.auth.signOut();
			await invalidateAll();
		} finally {
			signingOut = false;
		}
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="flex h-screen flex-col">
	<TopAppBar variant="static">
		<Row>
			<Section>
				<Title>opensurveillancedb</Title>
			</Section>
			<Section align="end" class="gap-2 pr-4">
				{#if data?.user}
					<span class="text-[0.95rem] whitespace-nowrap">Signed in as {signedInLabel}</span>
					<Button
						variant="outlined"
						color="primary"
						onclick={signOut}
						disabled={signingOut}
						class="text-white border-white"
					>
						<Label>{signingOut ? 'Logging out…' : 'Logout'}</Label>
					</Button>
				{:else}
					<Button
						variant="outlined"
						color="primary"
						onclick={signInWithGitHub}
						disabled={signingIn}
						class="text-white border-white"
					>
						<Label>{signingIn ? 'Redirecting…' : 'Sign in with GitHub'}</Label>
					</Button>
				{/if}
			</Section>
		</Row>
	</TopAppBar>

	<div class="flex min-h-0 flex-1 items-stretch">
		<Drawer class="h-full self-stretch">
			<Content>
				<List>
					{#each sections as section}
						<Item href={section.href} activated={section.matches(page.url.pathname)}>
							<Text>{section.label}</Text>
						</Item>
					{/each}
				</List>
			</Content>
		</Drawer>

		<div class="min-w-0 flex-1">
			{@render children()}
		</div>
	</div>
</div>

<div class="hidden">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>
