// Create a floating debug panel
(function() {
  // Create panel container
  const panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.bottom = '10px';
  panel.style.right = '10px';
  panel.style.width = '300px';
  panel.style.maxHeight = '80vh';
  panel.style.overflow = 'auto';
  panel.style.backgroundColor = 'white';
  panel.style.border = '1px solid black';
  panel.style.padding = '10px';
  panel.style.zIndex = '9999';
  panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  panel.style.display = 'none';
  
  // Add toggle button
  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'Show Data';
  toggleButton.style.position = 'fixed';
  toggleButton.style.bottom = '10px';
  toggleButton.style.right = '10px';
  toggleButton.style.zIndex = '10000';
  toggleButton.style.padding = '5px 10px';
  
  toggleButton.addEventListener('click', function() {
    if (panel.style.display === 'none') {
      panel.style.display = 'block';
      toggleButton.textContent = 'Hide Data';
    } else {
      panel.style.display = 'none';
      toggleButton.textContent = 'Show Data';
    }
  });
  
  // Add panel content
  panel.innerHTML = '<h3>API Data</h3><div id="debug-content">Loading data...</div>';
  
  // Add to document
  document.body.appendChild(panel);
  document.body.appendChild(toggleButton);
  
  // Fetch and display data
  fetchAllData();
  
  async function fetchAllData() {
    const endpoints = ['events', 'contacts', 'reminders', 'notes', 'gallery', 'settings'];
    const results = {};
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`/api/${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          results[endpoint] = data;
        } else {
          results[endpoint] = `Error: ${response.status}`;
        }
      } catch (error) {
        results[endpoint] = `Error: ${error.message}`;
      }
    }
    
    // Display results
    const content = document.getElementById('debug-content');
    content.innerHTML = '';
    
    for (const [endpoint, data] of Object.entries(results)) {
      const section = document.createElement('div');
      section.style.marginBottom = '15px';
      
      const heading = document.createElement('h4');
      heading.textContent = endpoint;
      section.appendChild(heading);
      
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = Array.isArray(data) ? `${data.length} items` : 'View data';
      details.appendChild(summary);
      
      const pre = document.createElement('pre');
      pre.style.maxHeight = '200px';
      pre.style.overflow = 'auto';
      pre.style.backgroundColor = '#f5f5f5';
      pre.style.padding = '5px';
      pre.style.fontSize = '12px';
      pre.textContent = JSON.stringify(data, null, 2);
      details.appendChild(pre);
      
      section.appendChild(details);
      content.appendChild(section);
    }
  }
})();
