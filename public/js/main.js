// public/js/main.js - Complete file
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
    console.log(`Fetching data from: /api/${endpoint}`);
    const response = await fetch(`/api/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Data received for ${endpoint}:`, data);
    
    // Store data in global state
    window[endpoint] = data;
    
    // Display the data in the appropriate section
    displayData(endpoint, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    displayErrorMessage(`Failed to load ${endpoint}. Please try again later.`);
  }
}

function displayData(type, data) {
  const container = document.getElementById(`${type}-container`);
  if (!container) {
    console.warn(`Container for ${type} not found`);
    return;
  }
  
  // Clear existing content
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
  const eventsHTML = events.map(event => `
    <div class="event-card">
      <h3>${event.title}</h3>
      <p class="event-date"><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}</p>
      <p class="event-time"><i class="fas fa-clock"></i> ${event.time}</p>
      <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
      <p class="event-description">${event.description}</p>
    </div>
  `).join('');
  
  container.innerHTML = eventsHTML || '<p class="no-data">No events scheduled.</p>';
}

function displayContacts(container, contacts) {
  const contactsHTML = contacts.map(contact => `
    <div class="contact-card">
      <h3>${contact.name}</h3>
      <p><i class="fas fa-envelope"></i> ${contact.email}</p>
      <p><i class="fas fa-phone"></i> ${contact.phone}</p>
      <p>${contact.notes}</p>
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
      <img src="${image.imageUrl}" alt="${image.title}">
      <div class="gallery-caption">
        <h3>${image.title}</h3>
        <p>${image.description}</p>
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
    const titleElements = document.querySelectorAll('.site-title');
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
  const navMenu = document.querySelector('.nav-menu');
  navMenu.classList.toggle('active');
}

function displayErrorMessage(message) {
  const errorContainer = document.getElementById('error-container');
  if (!errorContainer) {
    const newErrorContainer = document.createElement('div');
    newErrorContainer.id = 'error-container';
    newErrorContainer.className = 'error-container';
    document.body.prepend(newErrorContainer);
    
    const errorMessage = document.createElement('p');
    errorMessage.textContent = message;
    newErrorContainer.appendChild(errorMessage);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      newErrorContainer.style.display = 'none';
    }, 5000);
  } else {
    errorContainer.innerHTML = `<p>${message}</p>`;
    errorContainer.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorContainer.style.display = 'none';
    }, 5000);
  }
}
