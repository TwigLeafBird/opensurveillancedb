<script lang="ts">
	import { onMount } from 'svelte';
	import Button, { Icon, Label } from '@smui/button';
	import { page } from '$app/state';
	import { supabase } from '$lib/supabaseClient';

	let signingIn = $state(false);
	let authError = $state('');

	function readAuthErrorFromUrl(): string {
		const hash = window.location.hash.startsWith('#')
			? window.location.hash.slice(1)
			: window.location.hash;

		const hashParams = new URLSearchParams(hash);
		const hashDescription = hashParams.get('error_description');
		const hashCode = hashParams.get('error_code');
		const hashError = hashParams.get('error');

		if (hashDescription || hashCode || hashError) {
			return hashDescription ?? hashCode ?? hashError ?? 'Authentication failed.';
		}

		const queryDescription = page.url.searchParams.get('error_description');
		const queryError = page.url.searchParams.get('error');

		return queryDescription ?? queryError ?? '';
	}

	onMount(() => {
		authError = readAuthErrorFromUrl();
	});

	async function signInWithGitHub() {
		signingIn = true;
		authError = '';

		const next = page.url.searchParams.get('next') ?? '/populate';
		const redirectTo = `${page.url.origin}/auth/callback?next=${encodeURIComponent(next)}`;

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: { redirectTo }
		});

		if (error) {
			authError = error.message;
			signingIn = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center p-6">
	<div class="w-full max-w-[420px] flex flex-col gap-3">
		<h1 class="m-0">Sign in</h1>
		<p class="m-0 opacity-85">Use GitHub to continue.</p>
		<Button variant="raised" color="primary" onclick={signInWithGitHub} disabled={signingIn}>
			<Icon class="material-icons">login</Icon>
			<Label>{signingIn ? 'Redirecting…' : 'Sign in with GitHub'}</Label>
		</Button>
		{#if authError}
			<p class="m-0 text-[#ff8a80]">{authError}</p>
		{/if}
	</div>
</div>
