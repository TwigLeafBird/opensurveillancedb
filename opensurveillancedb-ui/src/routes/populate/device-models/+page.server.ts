import { listDeviceInfos } from '$lib/supabaseClient';

export const load = async () => {
    const deviceInfos = await listDeviceInfos();
    return { deviceInfos };
};