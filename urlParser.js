/**
 * @typedef {Object} ParsedURL
 * @property {string} protocol - The URL protocol (e.g., 'http', 'https')
 * @property {string} host - The host name (e.g., 'example.com')
 * @property {number|null} port - The port number if specified
 * @property {string} path - The URL path (e.g., '/api/users')
 * @property {Object<string, string>} query - Query parameters as key-value pairs
 * @property {string} hash - URL fragment/hash (e.g., '#section1')
 */

/**
 * @typedef {Object} URLValidationResult
 * @property {boolean} valid - Whether the URL is valid
 * @property {ParsedURL|null} parsed - Parsed URL components (null if invalid)
 * @property {string[]} errors - Array of validation error messages
 */

/**
 * Parses and validates a URL string.
 * 
 * @param {string} urlString - The URL string to parse and validate
 * @param {Object} [options] - Validation options
 * @param {string[]} [options.allowedProtocols=['http', 'https']] - Allowed protocols
 * @param {boolean} [options.requireProtocol=true] - Whether protocol is required
 * @param {boolean} [options.allowLocalhost=true] - Whether localhost is allowed
 * @param {boolean} [options.allowPrivateIPs=true] - Whether private IP ranges are allowed
 * @returns {URLValidationResult} Validation result with parsed components and errors
 * 
 * @example
 * // Valid URL
 * parseAndValidateURL('https://example.com:8080/api/users?id=123#top');
 * // Returns: { valid: true, parsed: { protocol: 'https', host: 'example.com', ... }, errors: [] }
 * 
 * @example
 * // Invalid URL
 * parseAndValidateURL('not a url');
 * // Returns: { valid: false, parsed: null, errors: ['Invalid URL format'] }
 */
function parseAndValidateURL(urlString, options = {}) {
  const defaultOptions = {
    allowedProtocols: ['http', 'https'],
    requireProtocol: true,
    allowLocalhost: true,
    allowPrivateIPs: true
  };

  const config = { ...defaultOptions, ...options };
  const errors = [];

  // Input validation
  if (typeof urlString !== 'string') {
    return {
      valid: false,
      parsed: null,
      errors: ['Input must be a string']
    };
  }

  const trimmedUrl = urlString.trim();

  if (trimmedUrl.length === 0) {
    return {
      valid: false,
      parsed: null,
      errors: ['URL cannot be empty']
    };
  }

  // Check for invalid characters
  const invalidCharsPattern = /[\s<>{}|\\^`[\]]/;
  if (invalidCharsPattern.test(trimmedUrl)) {
    errors.push('URL contains invalid characters');
  }

  // Handle missing protocol
  let urlToParse = trimmedUrl;
  let hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmedUrl);

  if (!hasProtocol) {
    if (config.requireProtocol) {
      errors.push('URL must include a protocol (e.g., https://)');
    } else {
      // Default to http if protocol not required
      urlToParse = 'http://' + trimmedUrl;
      hasProtocol = true;
    }
  }

  // Parse URL using URL API
  let parsedUrl;
  try {
    parsedUrl = new URL(urlToParse);
  } catch (e) {
    errors.push('Invalid URL format');
    return {
      valid: false,
      parsed: null,
      errors
    };
  }

  // Extract protocol (without colon)
  const protocol = parsedUrl.protocol.replace(':', '').toLowerCase();

  // Validate protocol
  if (!config.allowedProtocols.includes(protocol)) {
    errors.push(`Protocol '${protocol}' is not allowed. Allowed protocols: ${config.allowedProtocols.join(', ')}`);
  }

  // Validate host
  const host = parsedUrl.hostname;

  if (!host) {
    errors.push('Host is required');
  } else {
    // Validate host format
    const hostValidation = validateHost(host, config);
    errors.push(...hostValidation.errors);
  }

  // Parse port
  const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : null;

  // Validate port range
  if (port !== null && (port < 1 || port > 65535)) {
    errors.push('Port must be between 1 and 65535');
  }

  // Parse query parameters
  const query = {};
  if (parsedUrl.search) {
    const searchParams = parsedUrl.searchParams;
    for (const [key, value] of searchParams) {
      query[key] = value;
    }
  }

  // Extract path
  const path = parsedUrl.pathname || '/';

  // Extract hash
  const hash = parsedUrl.hash || '';

  // Build parsed result
  const parsed = {
    protocol,
    host,
    port,
    path,
    query,
    hash: hash.replace('#', '')
  };

  return {
    valid: errors.length === 0,
    parsed: errors.length === 0 ? parsed : null,
    errors
  };
}

/**
 * Validates a host name or IP address.
 * 
 * @param {string} host - The host name or IP address
 * @param {Object} config - Configuration options
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
function validateHost(host, config) {
  const errors = [];

  // Check for localhost
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    if (!config.allowLocalhost) {
      errors.push('localhost is not allowed');
    }
    return { valid: errors.length === 0, errors };
  }

  // Check for IPv4 private ranges
  if (isIPv4(host)) {
    if (!config.allowPrivateIPs && isPrivateIPv4(host)) {
      errors.push('Private IP addresses are not allowed');
    }
    return { valid: errors.length === 0, errors };
  }

  // Check for IPv6
  if (isIPv6(host)) {
    return { valid: true, errors: [] };
  }

  // Validate domain name format
  const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z]{2,}$/;
  if (!domainPattern.test(host)) {
    // Check if it might be a valid IP that failed other checks
    if (!isIPv4(host) && !isIPv6(host)) {
      errors.push(`Invalid host format: '${host}'`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Checks if a string is a valid IPv4 address.
 * 
 * @param {string} str - String to check
 * @returns {boolean} True if valid IPv4
 */
function isIPv4(str) {
  const parts = str.split('.');
  if (parts.length !== 4) return false;

  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && part === String(num);
  });
}

/**
 * Checks if a string is a valid IPv6 address.
 * 
 * @param {string} str - String to check
 * @returns {boolean} True if valid IPv6
 */
function isIPv6(str) {
  // Basic IPv6 validation (handles common formats)
  const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){0,6}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$/;
  
  // Also handle IPv4-mapped IPv6
  const ipv4MappedPattern = /^::(?:ffff:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i;
  
  return ipv6Pattern.test(str) || ipv4MappedPattern.test(str);
}

/**
 * Checks if an IPv4 address is in a private range.
 * 
 * @param {string} ip - IPv4 address
 * @returns {boolean} True if private IP
 */
function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  
  // 10.0.0.0 - 10.255.255.255
  if (parts[0] === 10) return true;
  
  // 172.16.0.0 - 172.31.255.255
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  // 192.168.0.0 - 192.168.255.255
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  // 169.254.0.0 - 169.254.255.255 (link-local)
  if (parts[0] === 169 && parts[1] === 254) return true;
  
  return false;
}

module.exports = { parseAndValidateURL };
