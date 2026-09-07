import { URL } from 'node:url';

/**
 * Validates an external URL before making outbound HTTP requests (SSRF mitigation).
 * Restricts protocols to HTTP/HTTPS and blocks cloud metadata endpoints and loopback addresses by default.
 *
 * @param {string} inputUrl - The URL string to validate
 * @param {Object} options - Configuration options
 * @param {boolean} [options.allowLocal=false] - Whether to allow localhost / loopback addresses (e.g. for local Ollama)
 * @param {boolean} [options.requireHttps=false] - Whether to require HTTPS exclusively
 * @returns {URL} Parsed and validated URL object
 */
export function validateExternalUrl(inputUrl, options = {}) {
  const { allowLocal = false, requireHttps = false } = options;

  if (!inputUrl || typeof inputUrl !== 'string') {
    throw new Error('Invalid URL: URL must be a non-empty string.');
  }

  const trimmed = inputUrl.trim();

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (err) {
    throw new Error(`Invalid URL format: ${err.message}`);
  }

  // Enforce protocol
  const validProtocols = requireHttps ? ['https:'] : ['http:', 'https:'];
  if (!validProtocols.includes(parsed.protocol)) {
    throw new Error(`Invalid URL protocol '${parsed.protocol}'. Allowed protocols: ${validProtocols.join(', ')}`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block AWS / GCP / Azure cloud metadata IPs and domains
  const metadataHosts = [
    '169.254.169.254',
    'metadata.google.internal',
    'metadata',
    'instance-data'
  ];

  if (metadataHosts.includes(hostname) || hostname.startsWith('169.254.')) {
    throw new Error('Access denied: Cloud metadata endpoints are blocked for security.');
  }

  // Block loopback addresses unless explicitly allowed (e.g. local Ollama instance)
  const loopbackHosts = ['127.0.0.1', 'localhost', '0.0.0.0', '::1', '[::1]'];
  if (!allowLocal && (loopbackHosts.includes(hostname) || hostname.startsWith('127.'))) {
    throw new Error('Access denied: Local loopback addresses are blocked for external feeds.');
  }

  return parsed;
}

/**
 * Validates a Discord Webhook URL.
 * Strictly verifies HTTPS scheme and discord.com/discordapp.com webhook path.
 *
 * @param {string} url - Webhook URL to validate
 * @returns {boolean} True if valid Discord webhook URL
 */
export function validateDiscordWebhook(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') {
      return false;
    }

    const validHosts = ['discord.com', 'discordapp.com', 'canary.discord.com', 'ptb.discord.com'];
    if (!validHosts.includes(parsed.hostname.toLowerCase())) {
      return false;
    }

    // Path must begin with /api/webhooks/
    if (!parsed.pathname.startsWith('/api/webhooks/')) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Escapes text for RFC 5545 iCalendar compliance and prevents CRLF injection.
 *
 * @param {string} str - Raw text string
 * @returns {string} Escaped and sanitized string
 */
export function escapeICalText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n/g, '\\n')
    .replace(/\r/g, '\\n')
    .replace(/\n/g, '\\n');
}

/**
 * Sanitizes HTTP header values to only contain valid ISO-8859-1 / ASCII characters,
 * preventing Node.js ByteString TypeError crashes on outgoing fetch requests.
 *
 * @param {string} str - Raw header value
 * @returns {string} ASCII-safe header value
 */
export function sanitizeHeaderValue(str) {
  if (!str) return '';
  // Replace non-ASCII characters and control characters with spaces or remove
  return String(str).replace(/[^\x20-\x7E]/g, '').trim();
}
