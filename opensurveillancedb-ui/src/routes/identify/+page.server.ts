import {
    listDeviceColors,
    listDeviceInfos,
    listDeviceLocations,
    listDeviceManufacturers,
    listDeviceShapeProfiles
} from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const [deviceInfos, manufacturers, shapeProfiles, colors, locations] = await Promise.all([
        listDeviceInfos(locals.supabase),
        listDeviceManufacturers(locals.supabase),
        listDeviceShapeProfiles(locals.supabase),
        listDeviceColors(locals.supabase),
        listDeviceLocations(locals.supabase)
    ]);

    return {
        deviceInfos,
        manufacturers,
        shapeProfiles,
        colors,
        locations
    };
};
