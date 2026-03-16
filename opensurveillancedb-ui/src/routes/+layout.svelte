<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Button, { Label } from '@smui/button';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { supabase } from '$lib/supabaseClient';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();
	let signingIn = $state(false);
	let signingOut = $state(false);

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
<div
	style="position:fixed; top:12px; right:12px; z-index:1000; display:flex; align-items:center; gap:8px;"
>
	{#if data?.user}
		<span style="font-size:1rem; opacity:1;">Signed in as {signedInLabel}</span>
		<Button
			variant="outlined"
			color="primary"
			onclick={signOut}
			disabled={signingOut}
			style="color:#fff; border-color:#fff;"
		>
			<Label>{signingOut ? 'Logging out…' : 'Logout'}</Label>
		</Button>
	{:else}
		<Button
			variant="outlined"
			color="primary"
			onclick={signInWithGitHub}
			disabled={signingIn}
			style="color:#fff; border-color:#fff;"
		>
			<Label>{signingIn ? 'Redirecting…' : 'Sign in with GitHub'}</Label>
		</Button>
	{/if}
</div>
{@render children()}

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>
