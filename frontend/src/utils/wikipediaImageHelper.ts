const normalizeProtocol = (url: string): string =>
  url.startsWith('//') ? `https:${url}` : url;

const stripSizeSuffix = (url: string): string => {
  const lastSlash = url.lastIndexOf('/');
  if (lastSlash === -1) return url;

  const path = url.substring(0, lastSlash);
  const filename = url.substring(lastSlash + 1).replace(/^\d+px-/, '');
  return `${path}/${filename}`;
};

export const isWikipediaImage = (url?: string | null): boolean => {
  if (!url) return false;
  const normalized = normalizeProtocol(url);
  return normalized.includes('wikimedia.org/') || normalized.includes('wikipedia.org/');
};

export const getHighResolutionUrl = (imageUrl: string): string => {
  if (!imageUrl) return imageUrl;

  const normalizedUrl = normalizeProtocol(imageUrl);

  try {
    if (normalizedUrl.includes('/thumb/') && normalizedUrl.includes('px-')) {
      let cleanUrl = normalizedUrl.replace('/thumb/', '/');
      const lastSlash = cleanUrl.lastIndexOf('/');
      if (lastSlash !== -1) {
        const path = cleanUrl.substring(0, lastSlash);
        const filename = cleanUrl.substring(lastSlash + 1);
        const pxIndex = filename.indexOf('px-');

        if (pxIndex !== -1) {
          const actualFilename = filename.substring(pxIndex + 3);
          return `${path}/${actualFilename}`;
        }
      }
    }

    if (normalizedUrl.includes('.org/') && normalizedUrl.includes('/thumb/')) {
      const uri = new URL(normalizedUrl);
      if (uri.searchParams.has('width')) {
        const params = new URLSearchParams(uri.searchParams);
        params.delete('width');
        params.delete('height');
        uri.search = params.toString() ? `?${params}` : '';
        let cleanUrl = uri.toString().replace('/thumb/', '/');
        if (cleanUrl.includes('px-')) return stripSizeSuffix(cleanUrl);
        return cleanUrl;
      }
    }
  } catch (error) {
    console.warn('Wikipedia URL conversion failed:', error);
  }

  return normalizedUrl;
};

export const getOptimizedUrl = (imageUrl: string, targetWidth = 1024): string => {
  const baseUrl = getHighResolutionUrl(imageUrl);
  if (!isWikipediaImage(baseUrl)) return baseUrl;

  const sanitizedWidth = Math.max(1, Math.round(targetWidth));

  try {
    const url = new URL(baseUrl);
    const segments = url.pathname.split('/').filter(Boolean);

    if (!segments.includes('thumb') && segments.length > 2) {
      segments.splice(2, 0, 'thumb');
    }

    if (!segments.length) return baseUrl;

    const filename = segments[segments.length - 1];
    const prefixSegments = segments.slice(0, -1);
    const prefix = prefixSegments.length
      ? `${url.origin}/${prefixSegments.join('/')}`
      : url.origin;

    return `${prefix}/${sanitizedWidth}px-${filename}`;
  } catch (error) {
    console.warn('Wikipedia optimize failure:', error);
    return baseUrl;
  }
};

export const getDisplayUrl = (imageUrl?: string | null, targetWidth = 1024): string => {
  if (!imageUrl) return '';
  if (isWikipediaImage(imageUrl)) {
    return getOptimizedUrl(imageUrl, targetWidth);
  }
  return normalizeProtocol(imageUrl);
};

export default {
  getHighResolutionUrl,
  getOptimizedUrl,
  getDisplayUrl,
  isWikipediaImage,
};
