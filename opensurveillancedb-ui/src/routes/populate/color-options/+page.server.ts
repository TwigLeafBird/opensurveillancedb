import { listDeviceColors } from '$lib/supabaseClient';

export const load = async () => {
    const colors = await listDeviceColors();
    return { colors };
};
