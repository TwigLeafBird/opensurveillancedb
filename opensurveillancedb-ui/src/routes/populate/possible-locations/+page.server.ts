import { listDeviceLocations } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const locations = await listDeviceLocations(locals.supabase);
    return { locations };
};
