// src/utils/imageOptimizer.ts
// Converts uploaded images to WebP format client-side before upload to Supabase Storage
// Adheres strictly to AGENTS.md (Rule 12: Performance & lean dependencies)

import { supabase } from '@/lib/supabase';

/**
 * Converts a standard image File (JPEG, PNG, WebP) to an optimized WebP Blob
 * using the browser's native canvas API.
 */
export async function convertFileToWebP(
  file: File,
  quality = 0.85,
  maxWidth = 1920,
  maxHeight = 1080
): Promise<Blob> {
  // If running in an environment without browser DOM (e.g. Node tests), return raw file or buffer
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image into DOM'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context not available'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas WebP encoding failed'));
            }
            resolve(blob);
          },
          'image/webp',
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image (converting to WebP first if browser canvas available)
 * to the `places-media` Supabase Storage bucket under `places/`.
 */
export async function uploadPlaceImage(
  file: File,
  customPrefix = 'place'
): Promise<{ storagePath: string; publicUrl: string }> {
  let blobToUpload: Blob;

  try {
    blobToUpload = await convertFileToWebP(file);
  } catch (err) {
    console.warn('WebP conversion failed, uploading original file:', err);
    blobToUpload = file;
  }

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const storagePath = `places/${customPrefix}-${timestamp}-${randomSuffix}.webp`;

  const { error: uploadError } = await supabase.storage
    .from('places-media')
    .upload(storagePath, blobToUpload, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('places-media')
    .getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Deletes an image from the `places-media` bucket.
 */
export async function deletePlaceImageFromStorage(storagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('places-media')
    .remove([storagePath]);

  if (error) {
    throw new Error(`Failed to delete storage object: ${error.message}`);
  }
}
