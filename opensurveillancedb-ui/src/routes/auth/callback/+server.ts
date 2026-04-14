import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';
const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY } = env;

function sanitizeNext(next: string | null): string {
    if (!next || !next.startsWith('/') || next.startsWith('//')) {
        return '/populate';
    }

    if (next.startsWith('/login') || next.startsWith('/auth/callback')) {
        return '/populate';
    }

    return next;
}

export const GET: RequestHandler = async (event) => {
    const code = event.url.searchParams.get('code');
    const next = sanitizeNext(event.url.searchParams.get('next'));

    if (!code) {
        throw redirect(303, '/login');
    }

    const supabase = createServerClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
        {
            cookies: {
                getAll() {
                    return event.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    for (const { name, value, options } of cookiesToSet) {
                        event.cookies.set(name, value, { ...options, path: '/' });
                    }
                }
            },
            global: {
                fetch: event.fetch
            }
        }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        const message = encodeURIComponent(error.message);
        throw redirect(303, `/login?error=${message}`);
    }

    throw redirect(303, next);
};
