import { listDeviceColors } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const colors = await listDeviceColors(locals.supabase);
    return { colors };
};
