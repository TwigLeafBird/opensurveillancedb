import { supabase } from './client';
import { SchemaName } from './schema';
import type { Database } from '../supabaseTypes';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Color } from './types';

export async function listDeviceColors(client: SupabaseClient<Database> = supabase): Promise<Color[]> {
    const { data, error } = await client.schema(SchemaName).from('color').select<'color', Color>();

    if (error) {
        console.error('Error loading device colors:', error.message);
        return [];
    }

    return data ?? [];
}

export async function createDeviceColor(input: {
    code: string;
    name: string;
    hex_code?: string | null;
    swatch_icon?: string | null;
}): Promise<Color> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('color')
        .insert({
            code: input.code,
            name: input.name,
            hex_code: input.hex_code ?? null,
            swatch_icon: input.swatch_icon ?? null
        })
        .select<'color', Color>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updateDeviceColor(
    originalCode: string,
    update: {
        code: string;
        name: string;
        hex_code?: string | null;
        swatch_icon?: string | null;
    }
): Promise<Color> {
    const { data, error } = await supabase
        .schema(SchemaName)
        .from('color')
        .update({
            code: update.code,
            name: update.name,
            hex_code: update.hex_code ?? null,
            swatch_icon: update.swatch_icon ?? null
        })
        .eq('code', originalCode)
        .select<'color', Color>()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function deleteDeviceColor(code: string): Promise<void> {
    const { error } = await supabase.schema(SchemaName).from('color').delete().eq('code', code);

    if (error) {
        throw new Error(error.message);
    }
}
