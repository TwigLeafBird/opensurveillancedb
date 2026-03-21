import { supabase } from './client';
import { SchemaName } from './schema';
import type { Database } from '../supabaseTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DeviceManufacturer } from './types';

export async function listDeviceManufacturers(
    client: SupabaseClient<Database> = supabase
): Promise<DeviceManufacturer[]> {
    const { data, error } = await client
        .schema(SchemaName)
        .from('device_manufacturer')
        .select<'device_manufacturer', DeviceManufacturer>();

    if (error) {
        console.error('Error loading device manufacturers:', error.message);
        return [];
    }

    return data ?? [];
}

export async function createDeviceManufacturer(input: {
    id: string;
    name: string;
    alternate_names?: string[] | null;
    icons?: string[];
}): Promise<DeviceManufacturer> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('device_manufacturer')
        .insert({
            id: input.id,
            name: input.name,
            alternate_names: input.alternate_names ?? null,
            icons: input.icons ?? []
        })
        .select<'device_manufacturer', DeviceManufacturer>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updateDeviceManufacturer(
    originalId: string,
    update: { id: string; name: string; alternate_names?: string[] | null; icons?: string[] }
): Promise<DeviceManufacturer> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('device_manufacturer')
        .update({
            id: update.id,
            name: update.name,
            alternate_names: update.alternate_names ?? null,
            icons: update.icons ?? []
        })
        .eq('id', originalId)
        .select<'device_manufacturer', DeviceManufacturer>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function deleteDeviceManufacturer(id: string): Promise<void> {
    const { error } = await supabase
        .schema(SchemaName)
        .from('device_manufacturer')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
}
