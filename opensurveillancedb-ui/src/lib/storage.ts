import { supabase } from '$lib/supabase/client';

// Bucket and folder constants for icons
export const ICON_BUCKET = 'shape_profiles';
export const ICON_FOLDER = '';
export const COLOR_SWATCH_BUCKET = 'color_swatches';
export const COLOR_SWATCH_FOLDER = '';
export const MANUFACTURER_ICON_BUCKET = 'brand_logos';
export const MANUFACTURER_ICON_FOLDER = '';
export const MODEL_EXAMPLE_IMAGE_BUCKET = 'model_example_images';
export const MODEL_EXAMPLE_IMAGE_FOLDER = '';
export const MODEL_PRODUCT_IMAGE_BUCKET = 'product_images';
export const MODEL_PRODUCT_IMAGE_FOLDER = '';

// S3-compliant filename validation: alphanumerics, dot, underscore, hyphen with image extension
const S3_FILENAME_RE = /^[a-zA-Z0-9._-]+\.(png|jpe?g|gif|svg)$/i;
// Matches Unicode combining diacritical marks (accents, umlauts, tildes, etc. in range U+0300–U+036F)
const DIACRITICS_RE = /[\u0300-\u036f]/g;
const NON_ALPHANUMERIC_RE = /[^a-z0-9]+/g;

function sanitizeStorageName(value: string): string {
    const sanitized = value
        .trim()
        .normalize('NFKD')
        .replace(DIACRITICS_RE, '')
        .toLowerCase()
        .replace(NON_ALPHANUMERIC_RE, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_');

    return sanitized || 'asset';
}

function buildUniqueIconFilename(
    baseName: string,
    extension: string,
    existingFilenames: Iterable<string>
): string {
    const maxFilenameLength = 255;
    const normalizedExtension = extension.toLowerCase();
    const suffixlessMaxBaseLength = maxFilenameLength - normalizedExtension.length - 1;
    const existing = new Set(existingFilenames);
    const sanitizedBase = sanitizeStorageName(baseName);

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

function buildStoragePath(filename: string, folder: string): string {
    const trimmedFolder = (folder ?? '').trim();
    const cleanFolder = trimmedFolder.replace(/^\/+|\/+$/g, '');
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
    const path = buildStoragePath(valid, ICON_FOLDER);
    try {
        const { data } = supabase.storage.from(ICON_BUCKET).getPublicUrl(path);
        // data may be { publicUrl }
        if (data && (data as any).publicUrl) return (data as any).publicUrl as string;
    } catch (e) {
        console.error('Error getting public url for', path, e);
    }
    return null;
}

const ALLOWED_IMAGE_EXTENSIONS_RE = /\.(png|jpe?g|gif|svg)$/i;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/svg+xml'
]);

export function validateImageFile(file?: File | null): boolean {
    if (!file || !file.name) return false;
    const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS_RE.test(file.name);
    const hasValidMime = !file.type || ALLOWED_IMAGE_MIME_TYPES.has(file.type);
    return hasValidExtension && hasValidMime;
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

    const path = buildStoragePath(validName, ICON_FOLDER);
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

    const path = buildStoragePath(validName, ICON_FOLDER);
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

export function getColorSwatchPublicUrl(filename?: string | null): string | null {
    const valid = validateFilename(filename);
    if (!valid) return null;
    const path = buildStoragePath(valid, COLOR_SWATCH_FOLDER);
    try {
        const { data } = supabase.storage.from(COLOR_SWATCH_BUCKET).getPublicUrl(path);
        if (data && (data as any).publicUrl) return (data as any).publicUrl as string;
    } catch (e) {
        console.error('Error getting public url for', path, e);
    }
    return null;
}

export async function uploadColorSwatchFile(file: File, colorName: string): Promise<string> {
    if (!validateImageFile(file)) {
        throw new Error('Please choose a PNG, JPG, JPEG, GIF, or SVG image.');
    }

    if (!colorName.trim()) {
        throw new Error('Color name is required to name the swatch file.');
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) {
        throw new Error('Invalid image filename.');
    }

    const existingFilenames = await listColorSwatchFilenames();
    const generatedName = buildUniqueIconFilename(colorName, ext, existingFilenames);
    const validName = validateFilename(generatedName);
    if (!validName) {
        throw new Error('Failed to generate a valid swatch filename.');
    }

    const path = buildStoragePath(validName, COLOR_SWATCH_FOLDER);
    const { error } = await supabase.storage.from(COLOR_SWATCH_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined
    });

    if (error) {
        throw new Error(error.message);
    }

    return validName;
}

export async function deleteColorSwatchFile(filename?: string | null): Promise<void> {
    const validName = validateFilename(filename);
    if (!validName) {
        return;
    }

    const path = buildStoragePath(validName, COLOR_SWATCH_FOLDER);
    const { error } = await supabase.storage.from(COLOR_SWATCH_BUCKET).remove([path]);

    if (error) {
        throw new Error(error.message);
    }
}

export async function listColorSwatchFilenames(): Promise<string[]> {
    const folder = (COLOR_SWATCH_FOLDER ?? '').trim();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');

    try {
        const { data, error } = await supabase.storage.from(COLOR_SWATCH_BUCKET).list(cleanFolder, {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
        });

        if (error) {
            console.error('Error listing color swatch filenames:', error.message);
            return [];
        }

        return (data ?? [])
            .map((entry) => validateFilename(entry.name))
            .filter((name): name is string => !!name);
    } catch (e) {
        console.error('Error listing color swatch filenames', e);
        return [];
    }
}

export function getManufacturerIconPublicUrl(filename?: string | null): string | null {
    const valid = validateFilename(filename);
    if (!valid) return null;
    const path = buildStoragePath(valid, MANUFACTURER_ICON_FOLDER);
    try {
        const { data } = supabase.storage.from(MANUFACTURER_ICON_BUCKET).getPublicUrl(path);
        if (data && (data as any).publicUrl) return (data as any).publicUrl as string;
    } catch (e) {
        console.error('Error getting public url for', path, e);
    }
    return null;
}

export async function uploadManufacturerIconFile(file: File, manufacturerName: string): Promise<string> {
    if (!validateImageFile(file)) {
        throw new Error('Please choose a PNG, JPG, JPEG, GIF, or SVG image.');
    }

    if (!manufacturerName.trim()) {
        throw new Error('Manufacturer name is required to name the icon file.');
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) {
        throw new Error('Invalid image filename.');
    }

    const existingFilenames = await listManufacturerIconFilenames();
    const generatedName = buildUniqueIconFilename(manufacturerName, ext, existingFilenames);
    const validName = validateFilename(generatedName);
    if (!validName) {
        throw new Error('Failed to generate a valid manufacturer icon filename.');
    }

    const path = buildStoragePath(validName, MANUFACTURER_ICON_FOLDER);
    const { error } = await supabase.storage.from(MANUFACTURER_ICON_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined
    });

    if (error) {
        throw new Error(error.message);
    }

    return validName;
}

export async function deleteManufacturerIconFile(filename?: string | null): Promise<void> {
    const validName = validateFilename(filename);
    if (!validName) {
        return;
    }

    const path = buildStoragePath(validName, MANUFACTURER_ICON_FOLDER);
    const { error } = await supabase.storage.from(MANUFACTURER_ICON_BUCKET).remove([path]);

    if (error) {
        throw new Error(error.message);
    }
}

export async function listManufacturerIconFilenames(): Promise<string[]> {
    const folder = (MANUFACTURER_ICON_FOLDER ?? '').trim();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');

    try {
        const { data, error } = await supabase.storage.from(MANUFACTURER_ICON_BUCKET).list(cleanFolder, {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
        });

        if (error) {
            console.error('Error listing manufacturer icon filenames:', error.message);
            return [];
        }

        return (data ?? [])
            .map((entry) => validateFilename(entry.name))
            .filter((name): name is string => !!name);
    } catch (e) {
        console.error('Error listing manufacturer icon filenames', e);
        return [];
    }
}

export function getModelExampleImagePublicUrl(filename?: string | null): string | null {
    const valid = validateFilename(filename);
    if (!valid) return null;
    const path = buildStoragePath(valid, MODEL_EXAMPLE_IMAGE_FOLDER);
    try {
        const { data } = supabase.storage.from(MODEL_EXAMPLE_IMAGE_BUCKET).getPublicUrl(path);
        if (data && (data as any).publicUrl) return (data as any).publicUrl as string;
    } catch (e) {
        console.error('Error getting public url for', path, e);
    }
    return null;
}

export async function uploadModelExampleImageFile(file: File, modelName: string): Promise<string> {
    if (!validateImageFile(file)) {
        throw new Error('Please choose a PNG, JPG, JPEG, GIF, or SVG image.');
    }

    if (!modelName.trim()) {
        throw new Error('Device model name is required to name the example image file.');
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) {
        throw new Error('Invalid image filename.');
    }

    const existingFilenames = await listModelExampleImageFilenames();
    const generatedName = buildUniqueIconFilename(modelName, ext, existingFilenames);
    const validName = validateFilename(generatedName);
    if (!validName) {
        throw new Error('Failed to generate a valid example image filename.');
    }

    const path = buildStoragePath(validName, MODEL_EXAMPLE_IMAGE_FOLDER);
    const { error } = await supabase.storage.from(MODEL_EXAMPLE_IMAGE_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined
    });

    if (error) {
        throw new Error(error.message);
    }

    return validName;
}

export async function deleteModelExampleImageFile(filename?: string | null): Promise<void> {
    const validName = validateFilename(filename);
    if (!validName) {
        return;
    }

    const path = buildStoragePath(validName, MODEL_EXAMPLE_IMAGE_FOLDER);
    const { error } = await supabase.storage.from(MODEL_EXAMPLE_IMAGE_BUCKET).remove([path]);

    if (error) {
        throw new Error(error.message);
    }
}

export async function listModelExampleImageFilenames(): Promise<string[]> {
    const folder = (MODEL_EXAMPLE_IMAGE_FOLDER ?? '').trim();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');

    try {
        const { data, error } = await supabase.storage.from(MODEL_EXAMPLE_IMAGE_BUCKET).list(cleanFolder, {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
        });

        if (error) {
            console.error('Error listing model example image filenames:', error.message);
            return [];
        }

        return (data ?? [])
            .map((entry) => validateFilename(entry.name))
            .filter((name): name is string => !!name);
    } catch (e) {
        console.error('Error listing model example image filenames', e);
        return [];
    }
}

export function getModelProductImagePublicUrl(filename?: string | null): string | null {
    const valid = validateFilename(filename);
    if (!valid) return null;
    const path = buildStoragePath(valid, MODEL_PRODUCT_IMAGE_FOLDER);
    try {
        const { data } = supabase.storage.from(MODEL_PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
        if (data && (data as any).publicUrl) return (data as any).publicUrl as string;
    } catch (e) {
        console.error('Error getting public url for', path, e);
    }
    return null;
}

export async function uploadModelProductImageFile(file: File, modelName: string): Promise<string> {
    if (!validateImageFile(file)) {
        throw new Error('Please choose a PNG, JPG, JPEG, GIF, or SVG image.');
    }

    if (!modelName.trim()) {
        throw new Error('Device model name is required to name the product image file.');
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) {
        throw new Error('Invalid image filename.');
    }

    const existingFilenames = await listModelProductImageFilenames();
    const generatedName = buildUniqueIconFilename(modelName, ext, existingFilenames);
    const validName = validateFilename(generatedName);
    if (!validName) {
        throw new Error('Failed to generate a valid product image filename.');
    }

    const path = buildStoragePath(validName, MODEL_PRODUCT_IMAGE_FOLDER);
    const { error } = await supabase.storage.from(MODEL_PRODUCT_IMAGE_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined
    });

    if (error) {
        throw new Error(error.message);
    }

    return validName;
}

export async function deleteModelProductImageFile(filename?: string | null): Promise<void> {
    const validName = validateFilename(filename);
    if (!validName) {
        return;
    }

    const path = buildStoragePath(validName, MODEL_PRODUCT_IMAGE_FOLDER);
    const { error } = await supabase.storage.from(MODEL_PRODUCT_IMAGE_BUCKET).remove([path]);

    if (error) {
        throw new Error(error.message);
    }
}

export async function listModelProductImageFilenames(): Promise<string[]> {
    const folder = (MODEL_PRODUCT_IMAGE_FOLDER ?? '').trim();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');

    try {
        const { data, error } = await supabase.storage.from(MODEL_PRODUCT_IMAGE_BUCKET).list(cleanFolder, {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
        });

        if (error) {
            console.error('Error listing model product image filenames:', error.message);
            return [];
        }

        return (data ?? [])
            .map((entry) => validateFilename(entry.name))
            .filter((name): name is string => !!name);
    } catch (e) {
        console.error('Error listing model product image filenames', e);
        return [];
    }
}
