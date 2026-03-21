<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Button, { Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
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
	let isDarkMode = $state(false);
	let themeInitialized = $state(false);

	const THEME_COOKIE_NAME = 'theme-preference';
	const DARK_MODE_PREFERENCE = 'dark';
	const LIGHT_MODE_PREFERENCE = 'light';

	function getCookie(name: string): string | null {
		if (!browser) return null;
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
		return null;
	}

	function setCookie(name: string, value: string, days = 365) {
		if (!browser) return;
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		const expires = `expires=${date.toUTCString()}`;
		document.cookie = `${name}=${value}; ${expires}; path=/`;
	}

	function initializeTheme() {
		if (!browser) return;

		const savedTheme = getCookie(THEME_COOKIE_NAME);
		let prefersDark = false;

		if (savedTheme) {
			prefersDark = savedTheme === DARK_MODE_PREFERENCE;
		} else {
			prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}

		isDarkMode = prefersDark;
		applyTheme(prefersDark);
		themeInitialized = true;
	}

	function applyTheme(dark: boolean) {
		const htmlElement = document.documentElement;
		if (dark) {
			htmlElement.style.colorScheme = 'dark';
		} else {
			htmlElement.style.colorScheme = 'light';
		}

		// Toggle SMUI stylesheets
		const smuiLightSheet = document.querySelector('link[href="/smui.css"]') as HTMLLinkElement;
		const smuiDarkSheet = document.querySelector('link[href="/smui-dark.css"]') as HTMLLinkElement;

		if (smuiLightSheet && smuiDarkSheet) {
			if (dark) {
				smuiLightSheet.media = 'not all';
				smuiDarkSheet.media = 'screen';
			} else {
				smuiLightSheet.media = 'screen';
				smuiDarkSheet.media = 'not all';
			}
		}
	}

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		applyTheme(isDarkMode);
		setCookie(THEME_COOKIE_NAME, isDarkMode ? DARK_MODE_PREFERENCE : LIGHT_MODE_PREFERENCE);
	}

	$effect(() => {
		if (!themeInitialized) {
			initializeTheme();
		}
	});

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
				<IconButton
					class="material-icons"
					onclick={toggleTheme}
					aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
					title={isDarkMode ? 'Light mode' : 'Dark mode'}
				>
					{isDarkMode ? 'light_mode' : 'dark_mode'}
				</IconButton>
				{#if data?.user}
					<span class="text-[0.95rem] whitespace-nowrap">Signed in as {signedInLabel}</span>
					<Button
						variant="outlined"
						color="primary"
						onclick={signOut}
						disabled={signingOut}
						class="border-white text-white"
					>
						<Label>{signingOut ? 'Logging out…' : 'Logout'}</Label>
					</Button>
				{:else}
					<Button
						variant="outlined"
						color="primary"
						onclick={signInWithGitHub}
						disabled={signingIn}
						class="border-white text-white"
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

		<div class="min-w-0 flex-1 overflow-y-scroll">
			{@render children()}
		</div>
	</div>
</div>

<div class="hidden">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>
