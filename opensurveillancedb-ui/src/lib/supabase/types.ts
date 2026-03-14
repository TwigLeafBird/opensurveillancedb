import type { Database } from '../supabaseTypes';
import { SchemaName } from './schema';

export type DeviceModel = Database[typeof SchemaName]['Tables']['device_model']['Row'];
export type Color = Database[typeof SchemaName]['Tables']['color']['Row'];
export type DeviceLocation = Database[typeof SchemaName]['Tables']['device_location']['Row'];
export type DevicePossibleLocation =
    Database[typeof SchemaName]['Tables']['device_possible_location']['Row'];
export type DeviceShapeProfile = Database[typeof SchemaName]['Tables']['device_shape_profile']['Row'];
export type DeviceManufacturer = Database[typeof SchemaName]['Tables']['device_manufacturer']['Row'];
export type DeviceColorOption = Database[typeof SchemaName]['Tables']['device_color_option']['Row'];

export type DeviceInfo = Omit<DeviceModel, 'manufacturer'> & {
    manufacturer?: DeviceManufacturer | null;
    device_color_option?: Array<DeviceColorOption & { color?: Color | null }> | null;
    device_possible_location?: Array<
        DevicePossibleLocation & { device_location?: DeviceLocation | null }
    > | null;
    device_shape_profile?: DeviceShapeProfile | null;
};
