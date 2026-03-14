import type { PageServerLoad } from './$types';
import { listDeviceColors } from '$lib/supabaseClient';

export const load: PageServerLoad = async () => {
    const colors = await listDeviceColors();
    return { colors };
};
