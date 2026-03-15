import { listDeviceShapeProfiles } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const shapeProfiles = await listDeviceShapeProfiles(locals.supabase);
    return { shapeProfiles };
};
