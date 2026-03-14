export { SchemaName } from './schema';
export { supabase } from './client';

export type {
    DeviceModel,
    Color,
    DeviceLocation,
    DevicePossibleLocation,
    DeviceShapeProfile,
    DeviceManufacturer,
    DeviceColorOption,
    DeviceInfo
} from './types';

export {
    listDeviceModels,
    listDeviceInfos,
    createDeviceModel,
    updateDeviceModel,
    deleteDeviceModel
} from './deviceModels';
export { listDeviceColors, createDeviceColor, updateDeviceColor, deleteDeviceColor } from './colors';
export {
    listDeviceLocations,
    listDevicePossibleLocations,
    createDeviceLocation,
    updateDeviceLocation,
    deleteDeviceLocation
} from './locations';
export {
    listDeviceShapeProfiles,
    createDeviceShapeProfile,
    updateDeviceShapeProfile,
    deleteDeviceShapeProfile
} from './shapeProfiles';
export {
    listDeviceManufacturers,
    createDeviceManufacturer,
    updateDeviceManufacturer,
    deleteDeviceManufacturer
} from './manufacturers';
