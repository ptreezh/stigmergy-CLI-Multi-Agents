/**
 * Simple REST API Client
 * Provides basic HTTP methods for interacting with REST APIs
 */

class RestClient {
  /**
   * Create a new REST client
   * @param {string} baseURL - The base URL for API requests
   * @param {Object} defaultHeaders - Default headers to include in all requests
   */
  constructor(baseURL = '', defaultHeaders = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  /**
   * Make an HTTP request
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {string} url - Request URL (will be appended to baseURL)
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async request(method, url, options = {}) {
    const { headers = {}, body = null, params = {}, timeout = 10000 } = options;

    // Construct full URL
    let fullURL = this.baseURL + url;

    // Add query parameters
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams(params);
      fullURL += (fullURL.includes('?') ? '&' : '?') + queryParams.toString();
    }

    // Merge headers
    const mergedHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Prepare fetch options
    const fetchOptions = {
      method,
      headers: mergedHeaders,
      timeout,
    };

    // Add body for methods that support it
    if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      fetchOptions.body =
        typeof body === 'object' ? JSON.stringify(body) : body;
    }

    try {
      const response = await fetch(fullURL, fetchOptions);
      const contentType = response.headers.get('content-type');

      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      };
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  /**
   * Make a GET request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async get(url, options = {}) {
    return this.request('GET', url, options);
  }

  /**
   * Make a POST request
   * @param {string} url - Request URL
   * @param {Object} data - Data to send in request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async post(url, data, options = {}) {
    return this.request('POST', url, { ...options, body: data });
  }

  /**
   * Make a PUT request
   * @param {string} url - Request URL
   * @param {Object} data - Data to send in request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async put(url, data, options = {}) {
    return this.request('PUT', url, { ...options, body: data });
  }

  /**
   * Make a PATCH request
   * @param {string} url - Request URL
   * @param {Object} data - Data to send in request body
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async patch(url, data, options = {}) {
    return this.request('PATCH', url, { ...options, body: data });
  }

  /**
   * Make a DELETE request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async delete(url, options = {}) {
    return this.request('DELETE', url, options);
  }

  /**
   * Set default headers
   * @param {Object} headers - Headers to set as default
   */
  setDefaultHeaders(headers) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };
  }

  /**
   * Set authorization header
   * @param {string} token - Authorization token
   * @param {string} type - Authorization type (Bearer, Basic, etc.)
   */
  setAuthorization(token, type = 'Bearer') {
    this.setDefaultHeaders({
      Authorization: `${type} ${token}`,
    });
  }
}

module.exports = RestClient;
