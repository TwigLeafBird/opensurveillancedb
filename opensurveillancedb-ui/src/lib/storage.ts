import { supabase } from '$lib/supabase/client';

// Bucket and folder constants for icons
export const ICON_BUCKET = 'shape_profiles';
export const ICON_FOLDER = '';

// S3-compliant filename validation: alphanumerics, dot, underscore, hyphen with image extension
const S3_FILENAME_RE = /^[a-zA-Z0-9._-]+\.(png|jpe?g|gif|svg)$/i;
// Matches Unicode combining diacritical marks (accents, umlauts, tildes, etc. in range U+0300–U+036F)
const DIACRITICS_RE = /[\u0300-\u036f]/g;
const NON_ALPHANUMERIC_RE = /[^a-z0-9]+/g;

function sanitizeShapeProfileName(shapeProfileName: string): string {
    const sanitized = shapeProfileName
        .trim()
        .normalize('NFKD')
        .replace(DIACRITICS_RE, '')
        .toLowerCase()
        .replace(NON_ALPHANUMERIC_RE, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');

    return sanitized || 'shape_profile';
}

function buildUniqueIconFilename(
    shapeProfileName: string,
    extension: string,
    existingFilenames: Iterable<string>
): string {
    const maxFilenameLength = 255;
    const normalizedExtension = extension.toLowerCase();
    const suffixlessMaxBaseLength = maxFilenameLength - normalizedExtension.length - 1;
    const existing = new Set(existingFilenames);
    const sanitizedBase = sanitizeShapeProfileName(shapeProfileName);

    let attempt = 0;
    while (true) {
        const suffix = attempt === 0 ? '' : `_${attempt + 1}`;
        const maxBaseLength = Math.max(1, suffixlessMaxBaseLength - suffix.length);
        const truncatedBase = sanitizedBase.slice(0, maxBaseLength).replace(/^_+|_+$/g, '') || 'shape_profile';
        const candidate = `${truncatedBase}${suffix}.${normalizedExtension}`;

        if (!existing.has(candidate)) {
            return candidate;
        }

        attempt += 1;
    }
}

function buildStoragePath(filename: string): string {
    const folder = (ICON_FOLDER ?? '').trim();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    return cleanFolder ? `${cleanFolder}/${filename}` : filename;
}

export function validateFilename(filename?: string | null): string | null {
    if (!filename) return null;
    const name = filename.trim();
    if (!S3_FILENAME_RE.test(name)) return null;
    if (name.includes('..') || name.includes('/')) return null;
    return name;
}

export function getIconPublicUrl(filename?: string | null): string | null {
    const valid = validateFilename(filename);
    if (!valid) return null;
    const path = buildStoragePath(valid);
    try {
        const { data } = supabase.storage.from(ICON_BUCKET).getPublicUrl(path);
        // data may be { publicUrl }
        if (data && (data as any).publicUrl) return (data as any).publicUrl as string;
    } catch (e) {
        console.error('Error getting public url for', path, e);
    }
    return null;
}

export function validateImageFile(file?: File | null): boolean {
    if (!file || !file.name) return false;
    return S3_FILENAME_RE.test(file.name);
}

export async function uploadIconFile(file: File, shapeProfileName: string): Promise<string> {
    if (!validateImageFile(file)) {
        throw new Error('Please choose a PNG, JPG, JPEG, GIF, or SVG image.');
    }

    if (!shapeProfileName.trim()) {
        throw new Error('Shape profile name is required to name the icon file.');
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) {
        throw new Error('Invalid image filename.');
    }

    const existingFilenames = await listIconFilenames();
    const generatedName = buildUniqueIconFilename(shapeProfileName, ext, existingFilenames);
    const validName = validateFilename(generatedName);
    if (!validName) {
        throw new Error('Failed to generate a valid icon filename.');
    }

    const path = buildStoragePath(validName);
    const { error } = await supabase.storage.from(ICON_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined
    });

    if (error) {
        throw new Error(error.message);
    }

    return validName;
}

export async function deleteIconFile(filename?: string | null): Promise<void> {
    const validName = validateFilename(filename);
    if (!validName) {
        return;
    }

    const path = buildStoragePath(validName);
    const { error } = await supabase.storage.from(ICON_BUCKET).remove([path]);

    if (error) {
        throw new Error(error.message);
    }
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
