import { supabase } from './client';
import { SchemaName } from './schema';
import type { Database } from '../supabaseTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DeviceLocation, DevicePossibleLocation } from './types';

export async function listDeviceLocations(
    client: SupabaseClient<Database> = supabase
): Promise<DeviceLocation[]> {
    const { data, error } = await client
        .schema(SchemaName)
        .from('device_location')
        .select<'device_location', DeviceLocation>();

    if (error) {
        console.error('Error loading device locations:', error.message);
        return [];
    }

    return data ?? [];
}

export async function listDevicePossibleLocations(): Promise<DevicePossibleLocation[]> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('device_possible_location')
        .select<'device_possible_location', DevicePossibleLocation>();

    if (error) {
        console.error('Error loading device possible locations:', error.message);
        return [];
    }

    return data ?? [];
}

export async function createDeviceLocation(input: {
    code: string;
    name: string;
}): Promise<DeviceLocation> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('device_location')
        .insert({ code: input.code, name: input.name })
        .select<'device_location', DeviceLocation>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updateDeviceLocation(
    originalCode: string,
    update: { code: string; name: string }
): Promise<DeviceLocation> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('device_location')
        .update({ code: update.code, name: update.name })
        .eq('code', originalCode)
        .select<'device_location', DeviceLocation>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function deleteDeviceLocation(code: string): Promise<void> {
    const { error } = await supabase.schema(SchemaName).from('device_location').delete().eq('code', code);

    if (error) {
        throw new Error(error.message);
    }
}
