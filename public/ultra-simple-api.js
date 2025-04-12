// Ultra-simplified API client
const api = {
  async get(endpoint) {
    try {
      console.log(`Fetching from ${endpoint}...`);
      const response = await fetch(`/api/${endpoint}`);
      
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
};
