// src/lib/imageUtils.ts

/**
 * Ensures any image URL delivers modern high-performance WebP format.
 * - For remote Unsplash / Imgix CDN URLs: injects `&fm=webp` query parameter, forcing the CDN to deliver `image/webp`.
 * - For local raster images (.jpg, .jpeg, .png): rewrites to `.webp`.
 */
export function toWebpUrl(url?: string): string {
  if (!url) return '';
  
  // Unsplash / Imgix CDN format optimization
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('fm=webp')) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}fm=webp`;
    }
    return url;
  }

  // Local assets converted to WebP
  if (url.includes('/images/elhaj-avatar.jpg')) {
    return url.replace('/images/elhaj-avatar.jpg', '/images/elhaj-avatar.webp');
  }
  if (url.includes('/images/elhaj.jpg')) {
    return url.replace('/images/elhaj.jpg', '/images/elhaj.webp');
  }
  if (url.includes('/logo.jpg')) {
    return url.replace('/logo.jpg', '/logo.webp');
  }

  return url;
}
