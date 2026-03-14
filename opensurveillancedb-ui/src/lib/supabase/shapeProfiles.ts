import { supabase } from './client';
import { SchemaName } from './schema';
import type { DeviceShapeProfile } from './types';

export async function listDeviceShapeProfiles(): Promise<DeviceShapeProfile[]> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('device_shape_profile')
        .select<'device_shape_profile', DeviceShapeProfile>();

    if (error) {
        console.error('Error loading device shape profiles:', error.message);
        return [];
    }

    return data ?? [];
}

export async function createDeviceShapeProfile(input: {
    id: string;
    short_name: string;
    icon?: string | null;
}): Promise<DeviceShapeProfile> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('device_shape_profile')
        .insert({ id: input.id, short_name: input.short_name, icon: input.icon ?? null })
        .select<'device_shape_profile', DeviceShapeProfile>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updateDeviceShapeProfile(
    originalId: string,
    update: { id: string; short_name: string; icon?: string | null }
): Promise<DeviceShapeProfile> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('device_shape_profile')
        .update({ id: update.id, short_name: update.short_name, icon: update.icon ?? null })
        .eq('id', originalId)
        .select<'device_shape_profile', DeviceShapeProfile>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function deleteDeviceShapeProfile(id: string): Promise<void> {
    const { error } = await supabase
        .schema(SchemaName)
        .from('device_shape_profile')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
}
