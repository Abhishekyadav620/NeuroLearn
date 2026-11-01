/**
 * YouTube Utility Helper
 * Validates, extracts, and sanitizes YouTube video links and identifiers.
 * Strictly prevents arbitrary HTML/iframe injection.
 */

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const YOUTUBE_URL_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)([a-zA-Z0-9_-]{11})/i,
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
];

/**
 * Extract and validate 11-character YouTube video ID
 * @param {string} input - YouTube URL or raw ID
 * @returns {string|null}
 */
export const extractYouTubeVideoId = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // Direct 11-character video ID
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  // Handle accidental <iframe> tag pasted by admin: extract src
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const target = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;

  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = target.match(pattern);
    if (match && match[1] && YOUTUBE_ID_REGEX.test(match[1])) {
      return match[1];
    }
  }

  return null;
};

/**
 * Generate a secure, sanitized YouTube embed URL
 * @param {string} videoId
 * @returns {string}
 */
export const buildSafeEmbedUrl = (videoId) => {
  if (!videoId || !YOUTUBE_ID_REGEX.test(videoId)) return '';
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`;
};

/**
 * Validate YouTube video URL and return structured metadata
 * @param {string} url
 * @returns {{ isValid: boolean, videoId: string|null, embedUrl: string|null, error: string|null }}
 */
export const validateYouTubeVideo = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return {
      isValid: false,
      videoId: null,
      embedUrl: null,
      error: 'YouTube URL is required for video lessons.',
    };
  }

  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return {
      isValid: false,
      videoId: null,
      embedUrl: null,
      error: 'Invalid YouTube link. Please provide a standard YouTube video URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)',
    };
  }

  return {
    isValid: true,
    videoId,
    embedUrl: buildSafeEmbedUrl(videoId),
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    error: null,
  };
};

export default {
  extractYouTubeVideoId,
  buildSafeEmbedUrl,
  validateYouTubeVideo,
};
