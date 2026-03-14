import { supabase } from '$lib/supabaseClient';

// Bucket and folder constants for icons
export const ICON_BUCKET = 'shape_profiles';
export const ICON_FOLDER = '';

// Validate filenames: allow alphanumerics, dot, underscore, hyphen; require safe extension
const FILENAME_RE = /^[a-zA-Z0-9._-]{1,255}\.(png|jpe?g|gif|svg)$/i;

export function validateFilename(filename?: string | null): string | null {
    if (!filename) return null;
    const name = filename.trim();
    if (!FILENAME_RE.test(name)) return null;
    if (name.includes('..') || name.includes('/')) return null;
    return name;
}

export function getIconPublicUrl(filename?: string | null): string | null {
    const valid = validateFilename(filename);
    if (!valid) return null;
    const folder = (ICON_FOLDER ?? '').trim();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const path = cleanFolder ? `${cleanFolder}/${valid}` : valid;
    try {
        const { data } = supabase.storage.from(ICON_BUCKET).getPublicUrl(path);
        // data may be { publicUrl }
        if (data && (data as any).publicUrl) return (data as any).publicUrl as string;
    } catch (e) {
        console.error('Error getting public url for', path, e);
    }
    return null;
}

export async function listIconFilenames(): Promise<string[]> {
    const folder = (ICON_FOLDER ?? '').trim();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');

    try {
        const { data, error } = await supabase.storage.from(ICON_BUCKET).list(cleanFolder, {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
        });
        console.info("Got icon list from bucket", ICON_BUCKET, "folder", cleanFolder, "count", data?.length ?? 0);

        if (error) {
            console.error('Error listing icon filenames:', error.message);
            return [];
        }

        return (data ?? [])
            .map((entry) => validateFilename(entry.name))
            .filter((name): name is string => !!name);
    } catch (e) {
        console.error('Error listing icon filenames', e);
        return [];
    }
}
