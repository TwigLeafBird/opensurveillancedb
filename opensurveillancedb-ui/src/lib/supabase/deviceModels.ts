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
        '*, manufacturer (*), device_color_option (*, color (*)), device_possible_location (*, device_location (*)), device_shape_profile (*), device_model_defining_characteristic (characteristic_id, defining_characteristic (id, name))';

    const { data, error } = await client.schema(SchemaName).from('device_model').select(selectQuery);

    if (error) {
        console.error('Error loading device infos:', error.message);
        return [];
    }

    return (data ?? []).map((item) => ({
        ...item,
        distinguishing_features: (item.device_model_defining_characteristic ?? [])
            .map((dc: { characteristic_id: number; defining_characteristic?: { id: number; name: string } | null }) => dc.defining_characteristic?.name ?? null)
            .filter((name: string | null): name is string => name !== null)
    }));
}

export async function createDeviceModel(input: {
    name: string;
    manufacturer?: string | null;
    shape_profile?: string | null;
    datasheet_url?: string | null;
    product_url?: string | null;
    distinguishing_features?: string[];
    example_images?: string[];
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
            product_url: input.product_url ?? null,
            example_images: input.example_images ?? []
        })
        .select<'device_model', DeviceModel>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    const featureNames = input.distinguishing_features ?? [];
    const { error: deleteCharError } = await supabase
        .schema(SchemaName)
        .from('device_model_defining_characteristic')
        .delete()
        .eq('model_id', data.id);
    if (deleteCharError) throw new Error(deleteCharError.message);

    if (featureNames.length > 0) {
        const { data: chars, error: upsertCharError } = await supabase
            .schema(SchemaName)
            .from('defining_characteristic')
            .upsert(featureNames.map((name) => ({ name })), { onConflict: 'name' })
            .select('id');
        if (upsertCharError) throw new Error(upsertCharError.message);

        const { error: linkError } = await supabase
            .schema(SchemaName)
            .from('device_model_defining_characteristic')
            .insert((chars ?? []).map((c) => ({ model_id: data.id, characteristic_id: c.id })));
        if (linkError) throw new Error(linkError.message);
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
        distinguishing_features?: string[];
        example_images?: string[];
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
            product_url: update.product_url ?? null,
            example_images: update.example_images ?? []
        })
        .eq('id', originalId)
        .select<'device_model', DeviceModel>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    const featureNames = update.distinguishing_features ?? [];
    const { error: deleteCharError } = await supabase
        .schema(SchemaName)
        .from('device_model_defining_characteristic')
        .delete()
        .eq('model_id', originalId);
    if (deleteCharError) throw new Error(deleteCharError.message);

    if (featureNames.length > 0) {
        const { data: chars, error: upsertCharError } = await supabase
            .schema(SchemaName)
            .from('defining_characteristic')
            .upsert(featureNames.map((name) => ({ name })), { onConflict: 'name' })
            .select('id');
        if (upsertCharError) throw new Error(upsertCharError.message);

        const { error: linkError } = await supabase
            .schema(SchemaName)
            .from('device_model_defining_characteristic')
            .insert((chars ?? []).map((c) => ({ model_id: originalId, characteristic_id: c.id })));
        if (linkError) throw new Error(linkError.message);
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
