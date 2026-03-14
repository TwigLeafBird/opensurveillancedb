import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY } from '$env/static/public';
import type { Database } from './supabaseTypes';

export const SchemaName = "opensurveillancedb-alphav1";
export type DeviceModel = Database[typeof SchemaName]['Tables']['device_model']['Row'];
export type Color = Database[typeof SchemaName]['Tables']['color']['Row'];
export type DeviceLocation = Database[typeof SchemaName]['Tables']['device_location']['Row'];
export type DevicePossibleLocation = Database[typeof SchemaName]['Tables']['device_possible_location']['Row'];
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

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY, {
    db: {
        schema: SchemaName,
    }
});

export async function listDeviceModels(): Promise<DeviceModel[]> {
    const { data, error } = await supabase.schema(SchemaName).from('device_model').select<"device_model", DeviceModel>();
    if (error) {
        console.error('Error loading device models:', error.message);
        return [];
    }
    return data ?? [];
}

// Returns device models with joined color options and possible locations
export async function listDeviceInfos(): Promise<DeviceInfo[]> {
    const selectQuery = `*, manufacturer (*), device_color_option (*, color (*)), device_possible_location (*, device_location (*)), device_shape_profile (*)`;

    const { data, error } = await supabase.schema(SchemaName).from('device_model').select(selectQuery);

    if (error) {
        console.error('Error loading device infos:', error.message);
        return [];
    }
    return data ?? [];
}

export async function listDeviceColors(): Promise<Color[]> {
    const { data, error } = await supabase.schema(SchemaName).from('color').select<"color", Color>();
    if (error) {
        console.error('Error loading device colors:', error.message);
        return [];
    }
    return data ?? [];
}

export async function listDeviceLocations(): Promise<DeviceLocation[]> {
    const { data, error } = await supabase.schema(SchemaName).from('device_location').select<"device_location", DeviceLocation>();
    if (error) {
        console.error('Error loading device locations:', error.message);
        return [];
    }
    return data ?? [];
}

export async function listDevicePossibleLocations(): Promise<DevicePossibleLocation[]> {
    const { data, error } = await supabase.schema(SchemaName).from('device_possible_location').select<"device_possible_location", DevicePossibleLocation>();
    if (error) {
        console.error('Error loading device possible locations:', error.message);
        return [];
    }
    return data ?? [];
}

export async function listDeviceShapeProfiles(): Promise<DeviceShapeProfile[]> {
    const { data, error } = await supabase.schema(SchemaName).from('device_shape_profile').select<"device_shape_profile", DeviceShapeProfile>();
    if (error) {
        console.error('Error loading device shape profiles:', error.message);
        return [];
    }
    return data ?? [];
}

export async function listDeviceManufacturers(): Promise<DeviceManufacturer[]> {
    const { data, error } = await supabase.schema(SchemaName).from('device_manufacturer').select<"device_manufacturer", DeviceManufacturer>();
    if (error) {
        console.error('Error loading device manufacturers:', error.message);
        return [];
    }
    return data ?? [];
}