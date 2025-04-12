// Fixed API client that uses relative paths
class ApiClient {
  constructor() {
    // Use relative path without domain
    this.baseUrl = 'api';
    this.token = localStorage.getItem('jyoti50_token');
  }

  async get(endpoint) {
    try {
      console.log(`Fetching from ${endpoint} using relative path...`);
      const response = await fetch(`/${this.baseUrl}/${endpoint}`);
      
      if (!response.ok) {
        console.warn(`Error fetching ${endpoint}: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      console.log(`Received data from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.warn(`Failed to fetch ${endpoint}:`, error);
      return [];
    }
  }
}

// Create and export API client instance
const api = new ApiClient();
