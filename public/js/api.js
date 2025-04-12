// Enhanced API client for frontend
// This file should replace the existing api.js in public/js/

/**
 * API Client for Jyoti50 Birthday Celebration Website
 * Handles all API requests with improved error handling and logging
 */

class ApiClient {
  constructor() {
    this.baseUrl = '/api';
    this.token = localStorage.getItem('jyoti50_token');
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('jyoti50_token', token);
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('jyoti50_token');
  }

  /**
   * Get authentication headers
   * @returns {Object} Headers object with Authorization if token exists
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Handle API response with improved error handling
   * @param {Response} response - Fetch API response
   * @returns {Promise} Resolved with JSON data or rejected with error
   */
  async handleResponse(response) {
    // First get the response as text
    const text = await response.text();
    console.log(`Raw API response: ${text}`);
    
    // Try to parse as JSON
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.error('Raw response:', text);
      throw new Error('Invalid JSON response from server');
    }

    // Check if response is ok
    if (!response.ok) {
      const errorMessage = data.error || data.message || 'Unknown error occurred';
      console.error('API error:', errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  }

  /**
   * Make API request with improved error handling
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise} Resolved with JSON data or rejected with error
   */
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      console.log(`Making API request to: ${url}`, options);
      
      const response = await fetch(url, options);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Resolved with JSON data
   */
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise} Resolved with JSON data
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise} Resolved with JSON data
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Resolved with JSON data
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  /**
   * Upload file with form data
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @returns {Promise} Resolved with JSON data
   */
  async uploadFile(endpoint, formData) {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      console.log(`Uploading file to: ${url}`);
      
      const headers = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`File upload failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const data = await this.post('auth/login', { email, password });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async register(userData) {
    return this.post('auth/register', userData);
  }

  async logout() {
    this.clearToken();
    return { success: true };
  }

  // Check server and database connection
  async checkConnection() {
    try {
      return await this.get('debug');
    } catch (error) {
      console.error('Connection check failed:', error);
      throw error;
    }
  }

  // Check data in collections
  async checkCollections() {
    try {
      return await this.get('debug/collections');
    } catch (error) {
      console.error('Collections check failed:', error);
      throw error;
    }
  }
}

// Create and export API client instance
const api = new ApiClient();
