import { listDeviceManufacturers } from '$lib/supabaseClient';

export const load = async () => {
    const manufacturers = await listDeviceManufacturers();
    return { manufacturers };
};
