import {
    listDeviceInfos,
    listDeviceManufacturers,
    listDeviceShapeProfiles,
    listDeviceColors,
    listDeviceLocations
} from '$lib/supabaseClient';

export const load = async () => {
    const [deviceInfos, manufacturers, shapeProfiles, colors, locations] = await Promise.all([
        listDeviceInfos(),
        listDeviceManufacturers(),
        listDeviceShapeProfiles(),
        listDeviceColors(),
        listDeviceLocations()
    ]);

    return {
        deviceInfos,
        manufacturers,
        shapeProfiles,
        colors,
        locations
    };
};