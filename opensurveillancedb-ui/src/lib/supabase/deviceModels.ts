import { supabase } from './client';
import { SchemaName } from './schema';
import type { Database } from '../supabaseTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DeviceInfo, DeviceModel } from './types';

export async function listDeviceModels(
    client: SupabaseClient<Database> = supabase
): Promise<DeviceModel[]> {
    const { data, error } = await client
        .schema(SchemaName)
        .from('device_model')
        .select<'device_model', DeviceModel>();

    if (error) {
        console.error('Error loading device models:', error.message);
        return [];
    }

    return data ?? [];
}

export async function listDeviceInfos(client: SupabaseClient<Database> = supabase): Promise<DeviceInfo[]> {
    const selectQuery =
        '*, manufacturer (*), device_color_option (*, color (*)), device_possible_location (*, device_location (*)), device_shape_profile (*)';

    const { data, error } = await client.schema(SchemaName).from('device_model').select(selectQuery);

    if (error) {
        console.error('Error loading device infos:', error.message);
        return [];
    }

    return data ?? [];
}

export async function createDeviceModel(input: {
    name: string;
    manufacturer?: string | null;
    shape_profile?: string | null;
    datasheet_url?: string | null;
    product_url?: string | null;
    color_ids?: string[];
    location_codes?: string[];
}): Promise<DeviceModel> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('device_model')
        .insert({
            name: input.name,
            manufacturer: input.manufacturer ?? null,
            shape_profile: input.shape_profile ?? null,
            datasheet_url: input.datasheet_url ?? null,
            product_url: input.product_url ?? null
        })
        .select<'device_model', DeviceModel>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    const colorIds = input.color_ids ?? [];
    if (colorIds.length > 0) {
        const { error: colorError } = await supabase
            .schema(SchemaName)
            .from('device_color_option')
            .insert(colorIds.map((colorId) => ({ model_id: data.id, color_id: colorId })));

        if (colorError) {
            throw new Error(colorError.message);
        }
    }

    const locationCodes = input.location_codes ?? [];
    if (locationCodes.length > 0) {
        const { error: locationError } = await supabase
            .schema(SchemaName)
            .from('device_possible_location')
            .insert(
                locationCodes.map((locationCode) => ({
                    model_id: data.id,
                    location_code: locationCode
                }))
            );

        if (locationError) {
            throw new Error(locationError.message);
        }
    }

    return data;
}

export async function updateDeviceModel(
    originalId: string,
    update: {
        name: string;
        manufacturer?: string | null;
        shape_profile?: string | null;
        datasheet_url?: string | null;
        product_url?: string | null;
        color_ids?: string[];
        location_codes?: string[];
    }
): Promise<DeviceModel> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('device_model')
        .update({
            name: update.name,
            manufacturer: update.manufacturer ?? null,
            shape_profile: update.shape_profile ?? null,
            datasheet_url: update.datasheet_url ?? null,
            product_url: update.product_url ?? null
        })
        .eq('id', originalId)
        .select<'device_model', DeviceModel>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    const { error: deleteColorError } = await supabase
        .schema(SchemaName)
        .from('device_color_option')
        .delete()
        .eq('model_id', originalId);

    if (deleteColorError) {
        throw new Error(deleteColorError.message);
    }

    const colorIds = update.color_ids ?? [];
    if (colorIds.length > 0) {
        const { error: insertColorError } = await supabase
            .schema(SchemaName)
            .from('device_color_option')
            .insert(colorIds.map((colorId) => ({ model_id: originalId, color_id: colorId })));

        if (insertColorError) {
            throw new Error(insertColorError.message);
        }
    }

    const { error: deleteLocationError } = await supabase
        .schema(SchemaName)
        .from('device_possible_location')
        .delete()
        .eq('model_id', originalId);

    if (deleteLocationError) {
        throw new Error(deleteLocationError.message);
    }

    const locationCodes = update.location_codes ?? [];
    if (locationCodes.length > 0) {
        const { error: insertLocationError } = await supabase
            .schema(SchemaName)
            .from('device_possible_location')
            .insert(
                locationCodes.map((locationCode) => ({
                    model_id: originalId,
                    location_code: locationCode
                }))
            );

        if (insertLocationError) {
            throw new Error(insertLocationError.message);
        }
    }

    return data;
}

export async function deleteDeviceModel(id: string): Promise<void> {
    const { error: deleteColorError } = await supabase
        .schema(SchemaName)
        .from('device_color_option')
        .delete()
        .eq('model_id', id);

    if (deleteColorError) {
        throw new Error(deleteColorError.message);
    }

    const { error: deleteLocationError } = await supabase
        .schema(SchemaName)
        .from('device_possible_location')
        .delete()
        .eq('model_id', id);

    if (deleteLocationError) {
        throw new Error(deleteLocationError.message);
    }

    const { error } = await supabase.schema(SchemaName).from('device_model').delete().eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
}
