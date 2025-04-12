// Updated main.js with CORS fixes - uses relative paths for API requests
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the site
  initializeSite();
});

async function initializeSite() {
  try {
    // Fetch all data types
    await fetchAndDisplayData('events');
    await fetchAndDisplayData('contacts');
    await fetchAndDisplayData('reminders');
    await fetchAndDisplayData('notes');
    await fetchAndDisplayData('gallery');
    await fetchAndDisplayData('settings');
    
    // Initialize UI components
    initializeUI();
  } catch (error) {
    console.error('Error initializing site:', error);
    displayErrorMessage('Failed to load content. Please try again later.');
  }
}

async function fetchAndDisplayData(endpoint) {
  try {
    console.log(`Fetching data from: api/${endpoint}`);
    // Use relative path without leading slash
    const response = await fetch(`api/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text(); // Get response as text first
    console.log(`Raw response for ${endpoint}:`, text);
    
    let data;
    try {
      // Try to parse as JSON
      data = text ? JSON.parse(text) : [];
      console.log(`Parsed data for ${endpoint}:`, data);
    } catch (parseError) {
      console.error(`Error parsing JSON for ${endpoint}:`, parseError);
      throw new Error(`Invalid JSON response for ${endpoint}`);
    }
    
    // Store data in global state
    window[endpoint] = data;
    
    // Display the data in the appropriate section
    displayData(endpoint, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    displayErrorMessage(`Failed to load ${endpoint}: ${error.message}`);
    return [];
  }
}

function displayData(type, data) {
  // Find the container based on the type
  // This matches the exact container class names in index.html
  const container = document.querySelector(`.${type}-container`);
  if (!container) {
    console.warn(`Container for ${type} not found: .${type}-container`);
    return;
  }
  
  // Clear existing content including loading message
  container.innerHTML = '';
  
  if (!data || data.length === 0) {
    container.innerHTML = `<p class="no-data">No ${type} available.</p>`;
    return;
  }
  
  switch (type) {
    case 'events':
      displayEvents(container, data);
      break;
    case 'contacts':
      displayContacts(container, data);
      break;
    case 'reminders':
      displayReminders(container, data);
      break;
    case 'notes':
      displayNotes(container, data);
      break;
    case 'gallery':
      displayGallery(container, data);
      break;
    case 'settings':
      applySettings(data);
      break;
    default:
      console.warn(`No display function for ${type}`);
  }
}

function displayEvents(container, events) {
  // Group events by day
  const eventsByDay = {};
  events.forEach(event => {
    if (!eventsByDay[event.day]) {
      eventsByDay[event.day] = [];
    }
    eventsByDay[event.day].push(event);
  });
  
  // Get all day tabs
  const dayTabs = document.querySelectorAll('.day-tab');
  
  // Set the first day with events as active if no tab is active
  let activeDay = null;
  dayTabs.forEach(tab => {
    if (tab.classList.contains('active')) {
      activeDay = tab.getAttribute('data-day');
    }
  });
  
  if (!activeDay && dayTabs.length > 0) {
    activeDay = dayTabs[0].getAttribute('data-day');
    dayTabs[0].classList.add('active');
  }
  
  // Display events for the active day
  if (activeDay && eventsByDay[activeDay]) {
    const dayEvents = eventsByDay[activeDay];
    const eventsHTML = dayEvents.map(event => `
      <div class="event-card">
        <h3>${event.title}</h3>
        <p class="event-date"><i class="fas fa-calendar"></i> ${event.date}</p>
        <p class="event-time"><i class="fas fa-clock"></i> ${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}</p>
        <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
        <p class="event-description">${event.description}</p>
        <div class="event-actions">
          ${event.mapUrl ? `<a href="${event.mapUrl}" target="_blank" class="btn btn-map"><i class="fas fa-map"></i> View Map</a>` : ''}
          ${event.websiteUrl ? `<a href="${event.websiteUrl}" target="_blank" class="btn btn-website"><i class="fas fa-globe"></i> View Website</a>` : ''}
        </div>
      </div>
    `).join('');
    
    container.innerHTML = eventsHTML || '<p class="no-data">No events scheduled for this day.</p>';
  } else {
    container.innerHTML = '<p class="no-data">No events scheduled.</p>';
  }
  
  // Add event listeners to day tabs
  dayTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      dayTabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Get the day from the data attribute
      const day = this.getAttribute('data-day');
      
      // Display events for the selected day
      if (eventsByDay[day]) {
        const dayEvents = eventsByDay[day];
        const eventsHTML = dayEvents.map(event => `
          <div class="event-card">
            <h3>${event.title}</h3>
            <p class="event-date"><i class="fas fa-calendar"></i> ${event.date}</p>
            <p class="event-time"><i class="fas fa-clock"></i> ${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}</p>
            <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            <p class="event-description">${event.description}</p>
            <div class="event-actions">
              ${event.mapUrl ? `<a href="${event.mapUrl}" target="_blank" class="btn btn-map"><i class="fas fa-map"></i> View Map</a>` : ''}
              ${event.websiteUrl ? `<a href="${event.websiteUrl}" target="_blank" class="btn btn-website"><i class="fas fa-globe"></i> View Website</a>` : ''}
            </div>
          </div>
        `).join('');
        
        container.innerHTML = eventsHTML || '<p class="no-data">No events scheduled for this day.</p>';
      } else {
        container.innerHTML = '<p class="no-data">No events scheduled for this day.</p>';
      }
    });
  });
}

function displayContacts(container, contacts) {
  const contactsHTML = contacts.map(contact => `
    <div class="contact-card">
      <h3>${contact.name}</h3>
      <p><i class="fas fa-envelope"></i> ${contact.email}</p>
      <p><i class="fas fa-phone"></i> ${contact.phone}</p>
      <p>${contact.notes || ''}</p>
    </div>
  `).join('');
  
  container.innerHTML = contactsHTML || '<p class="no-data">No contacts available.</p>';
}

function displayReminders(container, reminders) {
  const remindersHTML = reminders.map(reminder => `
    <div class="reminder-card">
      <h3>${reminder.title}</h3>
      <p><i class="fas fa-calendar"></i> ${new Date(reminder.date).toLocaleDateString()}</p>
      <p>${reminder.description}</p>
    </div>
  `).join('');
  
  container.innerHTML = remindersHTML || '<p class="no-data">No reminders available.</p>';
}

function displayNotes(container, notes) {
  const notesHTML = notes.map(note => `
    <div class="note-card">
      <h3>${note.title}</h3>
      <p>${note.content}</p>
    </div>
  `).join('');
  
  container.innerHTML = notesHTML || '<p class="no-data">No notes available.</p>';
}

function displayGallery(container, images) {
  const galleryHTML = images.map(image => `
    <div class="gallery-item">
      <img src="${image.imageUrl}" alt="${image.title || 'Gallery image'}">
      <div class="gallery-caption">
        <h3>${image.title || ''}</h3>
        <p>${image.description || ''}</p>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = galleryHTML || '<p class="no-data">No images available.</p>';
}

function applySettings(settings) {
  if (!settings || settings.length === 0) return;
  
  const setting = settings[0]; // Use the first settings object
  
  // Apply site title
  if (setting.siteTitle) {
    document.title = setting.siteTitle;
    const titleElements = document.querySelectorAll('h1');
    titleElements.forEach(el => el.textContent = setting.siteTitle);
  }
  
  // Apply welcome message
  if (setting.welcomeMessage) {
    const welcomeElements = document.querySelectorAll('.welcome-message');
    welcomeElements.forEach(el => el.textContent = setting.welcomeMessage);
  }
  
  // Apply theme colors if needed
  if (setting.primaryColor) {
    document.documentElement.style.setProperty('--primary-color', setting.primaryColor);
  }
  
  if (setting.secondaryColor) {
    document.documentElement.style.setProperty('--secondary-color', setting.secondaryColor);
  }
}

function initializeUI() {
  // Initialize any UI components, event listeners, etc.
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
  }
}

function toggleMobileMenu() {
  const navMenu = document.querySelector('nav ul');
  if (navMenu) {
    navMenu.classList.toggle('active');
  }
}

function displayErrorMessage(message) {
  console.error(message);
  
  // Create error container if it doesn't exist
  let errorContainer = document.getElementById('error-container');
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    errorContainer.className = 'error-container';
    document.body.prepend(errorContainer);
  }
  
  // Add error message
  errorContainer.innerHTML = `<p>${message}</p>`;
  errorContainer.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorContainer.style.display = 'none';
  }, 5000);
}
