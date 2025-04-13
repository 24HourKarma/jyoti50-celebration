// main.js - Enhanced version with better error handling, day tab functionality, and dress code feature
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded - starting enhanced version');
  
  // Initialize the site
  initializeSite();
  
  // Set up event listeners for day tabs
  setupDayTabs();
  
  // Set up home button functionality
  setupHomeButton();
});

async function initializeSite() {
  try {
    // Fetch all data types
    await fetchAndDisplayData('events');
    await fetchAndDisplayData('contacts');
    await fetchAndDisplayData('reminders');
    await fetchAndDisplayData('notes');
    await fetchAndDisplayData('gallery');
    
    // Initialize UI components
    initializeUI();
  } catch (error) {
    console.error('Error initializing site:', error);
    displayErrorMessage('Failed to load content. Please try again later.');
  }
}

async function fetchAndDisplayData(endpoint) {
  try {
    console.log(`Fetching from ${endpoint}...`);
    const response = await fetch(`/api/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
    }
    
    // Get response as text first for debugging
    const text = await response.text();
    
    let data;
    try {
      // Try to parse as JSON
      data = text ? JSON.parse(text) : [];
      console.log(`Received ${data.length} items from ${endpoint}`);
    } catch (parseError) {
      console.error(`Error parsing JSON for ${endpoint}:`, parseError);
      throw new Error(`Invalid JSON response for ${endpoint}`);
    }
    
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
  const container = document.querySelector(`.${type}-container`);
  if (!container) {
    console.warn(`Container for ${type} not found`);
    return;
  }
  
  // Clear loading message
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
    default:
      console.warn(`No display function for ${type}`);
  }
}

function displayEvents(container, events) {
  // Group events by day
  const eventsByDay = {
    'Thursday': [],
    'Friday': [],
    'Saturday': [],
    'Sunday': []
  };
  
  // Sort events by date and time
  events.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB;
    }
    return a.startTime?.localeCompare(b.startTime) || 0;
  });
  
  // Group events by day
  events.forEach(event => {
    const date = new Date(event.date);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (eventsByDay[day]) {
      eventsByDay[day].push(event);
    } else {
      // If day doesn't match our predefined days, put in Thursday as default
      eventsByDay['Thursday'].push(event);
    }
  });
  
  // Create HTML for each day's events
  Object.keys(eventsByDay).forEach(day => {
    const dayEvents = eventsByDay[day];
    const dayContainer = document.createElement('div');
    dayContainer.className = `day-events ${day.toLowerCase()}`;
    dayContainer.style.display = day === 'Thursday' ? 'block' : 'none'; // Show Thursday by default
    
    if (dayEvents.length === 0) {
      dayContainer.innerHTML = `<p class="no-data">No events scheduled for ${day}.</p>`;
    } else {
      const eventsHTML = dayEvents.map(event => {
        // Determine dress code (use default if not specified)
        const dressCode = event.dressCode || 'Smart Casual';
        
        return `
          <div class="event-card">
            <h3>${event.title || 'Untitled Event'}</h3>
            <p class="event-date"><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}</p>
            <p class="event-time"><i class="fas fa-clock"></i> ${event.startTime || ''} ${event.endTime ? '- ' + event.endTime : ''}</p>
            <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location || 'No location specified'}</p>
            <p class="event-dress-code"><i class="fas fa-tshirt"></i> Dress Code: ${dressCode}</p>
            <button class="dress-code-button" onclick="toggleDressCode(this)">
              <i class="fas fa-info-circle"></i> Dress Code Details
            </button>
            <div class="dress-code-info" style="display: none;">
              ${getDressCodeDescription(dressCode)}
            </div>
            <p class="event-description">${event.description || 'No description available.'}</p>
          </div>
        `;
      }).join('');
      
      dayContainer.innerHTML = eventsHTML;
    }
    
    container.appendChild(dayContainer);
  });
  
  // Add event listeners for dress code buttons
  setupDressCodeButtons();
}

function getDressCodeDescription(dressCode) {
  // Provide descriptions for different dress codes
  const descriptions = {
    'Formal': 'Full evening wear. Men: Tuxedo or dark suit with tie. Women: Evening gown or cocktail dress.',
    'Semi-Formal': 'Business professional attire. Men: Suit and tie. Women: Cocktail dress or dressy separates.',
    'Smart Casual': 'Polished yet relaxed look. Men: Dress pants with button-down shirt. Women: Dress, skirt, or nice pants with blouse.',
    'Casual': 'Comfortable, everyday clothing. Jeans acceptable with nice top. No athletic wear.',
    'Beach Formal': 'Elegant beach attire. Men: Linen shirt and khakis. Women: Summer dress.',
    'Festive': 'Celebration attire with bright colors or holiday-themed clothing.'
  };
  
  return descriptions[dressCode] || 'Please dress appropriately for the occasion.';
}

function setupDressCodeButtons() {
  // This function is not needed as we're using inline onclick handlers
  // But it's kept here for potential future enhancements
}

// Global function to toggle dress code details visibility
window.toggleDressCode = function(button) {
  const infoDiv = button.nextElementSibling;
  if (infoDiv.style.display === 'none') {
    infoDiv.style.display = 'block';
    button.innerHTML = '<i class="fas fa-times-circle"></i> Hide Dress Code Details';
  } else {
    infoDiv.style.display = 'none';
    button.innerHTML = '<i class="fas fa-info-circle"></i> Dress Code Details';
  }
};

function displayContacts(container, contacts) {
  const contactsHTML = contacts.map(contact => `
    <div class="contact-card">
      <h3>${contact.name || 'Unnamed Contact'}</h3>
      <p><i class="fas fa-envelope"></i> ${contact.email || 'No email provided'}</p>
      <p><i class="fas fa-phone"></i> ${contact.phone || 'No phone provided'}</p>
      <p>${contact.notes || ''}</p>
    </div>
  `).join('');
  
  container.innerHTML = contactsHTML;
}

function displayReminders(container, reminders) {
  const remindersHTML = reminders.map(reminder => {
    const date = reminder.date ? new Date(reminder.date).toLocaleDateString() : 'No date specified';
    
    return `
      <div class="reminder-card">
        <h3>${reminder.title || 'Untitled Reminder'}</h3>
        <p><i class="fas fa-calendar"></i> ${date}</p>
        <p>${reminder.description || 'No description available.'}</p>
      </div>
    `;
  }).join('');
  
  container.innerHTML = remindersHTML;
}

function displayNotes(container, notes) {
  const notesHTML = notes.map(note => `
    <div class="note-card">
      <h3>${note.title || 'Untitled Note'}</h3>
      <p>${note.content || 'No content available.'}</p>
    </div>
  `).join('');
  
  container.innerHTML = notesHTML;
}

function displayGallery(container, images) {
  if (!images || images.length === 0) {
    container.innerHTML = '<p class="no-data">No images available in the gallery.</p>';
    return;
  }
  
  const galleryHTML = images.map(image => `
    <div class="gallery-item">
      <img class="gallery-image" src="${image.imageUrl}" alt="${image.title || 'Gallery image'}">
      <div class="gallery-caption">
        <h3>${image.title || 'Untitled Image'}</h3>
        <p>${image.description || ''}</p>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = galleryHTML;
}

function setupDayTabs() {
  const tabs = document.querySelectorAll('.day-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Hide all day events
      const dayEvents = document.querySelectorAll('.day-events');
      dayEvents.forEach(day => day.style.display = 'none');
      
      // Show selected day events
      const selectedDay = this.getAttribute('data-day');
      const selectedDayEvents = document.querySelector(`.day-events.${selectedDay.toLowerCase()}`);
      if (selectedDayEvents) {
        selectedDayEvents.style.display = 'block';
      }
    });
  });
}

function setupHomeButton() {
  const homeButton = document.querySelector('.home-button');
  if (homeButton) {
    homeButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function initializeUI() {
  // Any additional UI initialization
  console.log('UI initialized');
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
