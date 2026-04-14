import { createBrowserClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY } = env;
import type { Database } from '../supabaseTypes';
import { SchemaName } from './schema';

export const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
        auth: {
            flowType: 'pkce'
        },
        db: {
            schema: SchemaName
        }
    }
);
