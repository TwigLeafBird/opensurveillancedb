import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY } from '$env/static/public';
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
