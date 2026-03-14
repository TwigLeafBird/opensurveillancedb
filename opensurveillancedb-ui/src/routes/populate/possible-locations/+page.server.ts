import { listDeviceLocations } from '$lib/supabaseClient';

export const load = async () => {
    const locations = await listDeviceLocations();
    return { locations };
};
