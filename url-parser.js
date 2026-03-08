/**
 * Parses and validates a URL string.
 *
 * @param {string} urlString - The URL string to parse and validate.
 * @returns {{valid: boolean, parsed: Object, errors: string[]}} An object containing:
 *   - valid {boolean}: Whether the URL is valid
 *   - parsed {Object}: The parsed URL components (protocol, host, path, queryParams)
 *   - errors {string[]}: Array of error messages if any
 *
 * @example
 * parseAndValidateURL('https://example.com/path?query=value');
 * // Returns: { valid: true, parsed: { protocol: 'https:', host: 'example.com', path: '/path', queryParams: { query: 'value' } }, errors: [] }
 *
 * @example
 * parseAndValidateURL('invalid-url');
 * // Returns: { valid: false, parsed: {}, errors: ['Missing or invalid protocol'] }
 */
function parseAndValidateURL(urlString) {
  const result = {
    valid: false,
    parsed: {},
    errors: []
  };

  // Check if input is a string
  if (typeof urlString !== 'string') {
    result.errors.push('Input must be a string');
    return result;
  }

  // Trim whitespace
  const trimmedUrl = urlString.trim();

  // Check for empty string
  if (trimmedUrl.length === 0) {
    result.errors.push('URL cannot be empty');
    return result;
  }

  // Check for invalid characters (control characters)
  if (/[\x00-\x1F\x7F]/.test(trimmedUrl)) {
    result.errors.push('URL contains invalid control characters');
    return result;
  }

  // Handle missing protocol - try to add one
  let urlToParse = trimmedUrl;
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmedUrl);

  if (!hasProtocol) {
    // Default to http if no protocol provided
    urlToParse = 'http://' + trimmedUrl;
  }

  let url;
  try {
    url = new URL(urlToParse);
  } catch (e) {
    result.errors.push('Invalid URL format');
    return result;
  }

  // Validate protocol
  const validProtocols = ['http:', 'https:', 'ftp:', 'ws:', 'wss:', 'file:'];
  if (!validProtocols.includes(url.protocol)) {
    result.errors.push(`Invalid protocol: ${url.protocol}`);
    return result;
  }

  // Validate host (must exist for non-file protocols)
  if (url.protocol !== 'file:' && !url.hostname) {
    result.errors.push('Missing host');
    return result;
  }

  // Validate hostname format if present
  if (url.hostname) {
    const hostnameRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(url.hostname) ||
                        /^\[([0-9a-fA-F:]+)\]$/.test(url.hostname);

    if (!isIPAddress && !hostnameRegex.test(url.hostname)) {
      result.errors.push('Invalid hostname format');
      return result;
    }

    // Validate IP address octets if it's an IPv4
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(url.hostname)) {
      const octets = url.hostname.split('.');
      const validOctets = octets.every(octet => {
        const num = parseInt(octet, 10);
        return num >= 0 && num <= 255;
      });
      if (!validOctets) {
        result.errors.push('Invalid IP address octets');
        return result;
      }
    }
  }

  // Parse query parameters
  const queryParams = {};
  if (url.search) {
    const searchParams = url.searchParams;
    for (const [key, value] of searchParams) {
      queryParams[key] = value;
    }
  }

  // Build parsed object
  result.parsed = {
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port || null,
    path: url.pathname,
    queryParams: queryParams,
    hash: url.hash || null,
    origin: url.origin
  };

  result.valid = result.errors.length === 0;
  return result;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = parseAndValidateURL;
}
