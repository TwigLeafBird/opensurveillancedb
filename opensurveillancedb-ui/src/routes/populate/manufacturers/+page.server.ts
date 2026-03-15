import { listDeviceManufacturers } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const manufacturers = await listDeviceManufacturers(locals.supabase);
    return { manufacturers };
};
