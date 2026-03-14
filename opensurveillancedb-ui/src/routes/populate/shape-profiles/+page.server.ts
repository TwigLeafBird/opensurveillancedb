import { listDeviceShapeProfiles } from '$lib/supabaseClient';

export const load = async () => {
    const shapeProfiles = await listDeviceShapeProfiles();
    return { shapeProfiles };
};
