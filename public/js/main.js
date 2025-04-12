// Final version of main.js with fixes for all issues
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded and parsed');
  initApp();
});

// Global state to store data
const state = {
  events: [],
  contacts: [],
  reminders: [],
  notes: [],
  gallery: [],
  settings: []
};

// Initialize the application
async function initApp() {
  try {
    console.log('Initializing application...');
    
    // Fetch all data in parallel
    await Promise.all([
      fetchData('events'),
      fetchData('contacts'),
      fetchData('reminders'),
      fetchData('notes'),
      fetchData('gallery'),
      fetchData('settings')
    ]);
    
    // Render all sections
    renderAllSections();
    
    // Set up navigation
    setupNavigation();
    
    // Initialize countdown timer
    initCountdownTimer();
    
  } catch (error) {
    console.error('Error initializing application:', error);
    showError('Failed to load content. Please try again later.');
  }
}

// Fetch data from API
async function fetchData(endpoint) {
  try {
    console.log(`Fetching data from /api/${endpoint}...`);
    
    const response = await fetch(`/api/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Data from /api/${endpoint}:`, data);
    
    // Store data in state
    state[endpoint] = data;
    
    return data;
  } catch (error) {
    // Don't throw error for non-critical endpoints
    console.error(`Error fetching data from /api/${endpoint}:`, error);
    return [];
  }
}

// Set up navigation
function setupNavigation() {
  console.log('Setting up navigation...');
  
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');
  
  console.log('Available sections:');
  sections.forEach(section => {
    console.log(`- ${section.id}`);
  });
  
  // Add click event listeners to navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      showSection(targetId);
    });
  });
  
  // Show default section
  showSection('home');
}

// Show a specific section
function showSection(sectionId) {
  console.log(`Showing section: ${sectionId}`);
  
  const sections = document.querySelectorAll('section[id]');
  
  sections.forEach(section => {
    if (section.id === sectionId) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });
}

// Initialize countdown timer
function initCountdownTimer() {
  console.log('Initializing countdown timer...');
  
  const countdownElement = document.getElementById('countdown');
  if (!countdownElement) return;
  
  // Set the date we're counting down to (April 24, 2025 at 9:00 PM)
  const countDownDate = new Date('April 24, 2025 21:00:00').getTime();
  
  // Update the countdown every 1 second
  const x = setInterval(function() {
    // Get today's date and time
    const now = new Date().getTime();
    
    // Find the distance between now and the countdown date
    const distance = countDownDate - now;
    
    // Time calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Display the result
    countdownElement.innerHTML = `
      <div class="countdown-item">
        <span class="countdown-number">${days}</span>
        <span class="countdown-label">Days</span>
      </div>
      <div class="countdown-item">
        <span class="countdown-number">${hours}</span>
        <span class="countdown-label">Hours</span>
      </div>
      <div class="countdown-item">
        <span class="countdown-number">${minutes}</span>
        <span class="countdown-label">Minutes</span>
      </div>
      <div class="countdown-item">
        <span class="countdown-number">${seconds}</span>
        <span class="countdown-label">Seconds</span>
      </div>
    `;
    
    // If the countdown is finished, display celebration message
    if (distance < 0) {
      clearInterval(x);
      countdownElement.innerHTML = '<div class="celebration-message">The celebration has begun!</div>';
    }
  }, 1000);
}

// Render all sections with data
function renderAllSections() {
  renderEvents();
  renderContacts();
  renderReminders();
  renderNotes();
  renderGallery();
  applySettings();
}

// Render events section
function renderEvents() {
  const eventsContainer = document.querySelector('.events-container');
  if (!eventsContainer) return;
  
  if (!state.events || state.events.length === 0) {
    eventsContainer.innerHTML = '<p class="no-data">No events scheduled.</p>';
    return;
  }
  
  // Group events by day
  const eventsByDay = {};
  state.events.forEach(event => {
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
    
    eventsContainer.innerHTML = eventsHTML || '<p class="no-data">No events scheduled for this day.</p>';
  } else {
    eventsContainer.innerHTML = '<p class="no-data">No events scheduled.</p>';
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
        
        eventsContainer.innerHTML = eventsHTML || '<p class="no-data">No events scheduled for this day.</p>';
      } else {
        eventsContainer.innerHTML = '<p class="no-data">No events scheduled for this day.</p>';
      }
    });
  });
}

// Render contacts section
function renderContacts() {
  const contactsContainer = document.querySelector('.contacts-container');
  if (!contactsContainer) return;
  
  if (!state.contacts || state.contacts.length === 0) {
    contactsContainer.innerHTML = '<p class="no-data">No contacts available.</p>';
    return;
  }
  
  const contactsHTML = state.contacts.map(contact => `
    <div class="contact-card">
      <h3>${contact.name}</h3>
      <p><i class="fas fa-envelope"></i> ${contact.email}</p>
      <p><i class="fas fa-phone"></i> ${contact.phone}</p>
      <p>${contact.notes || ''}</p>
    </div>
  `).join('');
  
  contactsContainer.innerHTML = contactsHTML;
}

// Render reminders section
function renderReminders() {
  const remindersContainer = document.querySelector('.reminders-container');
  if (!remindersContainer) return;
  
  if (!state.reminders || state.reminders.length === 0) {
    remindersContainer.innerHTML = '<p class="no-data">No reminders available.</p>';
    return;
  }
  
  const remindersHTML = state.reminders.map(reminder => `
    <div class="reminder-card">
      <h3>${reminder.title}</h3>
      <p><i class="fas fa-calendar"></i> ${new Date(reminder.date).toLocaleDateString()}</p>
      <p>${reminder.description}</p>
    </div>
  `).join('');
  
  remindersContainer.innerHTML = remindersHTML;
}

// Render notes section
function renderNotes() {
  const notesContainer = document.querySelector('.notes-container');
  if (!notesContainer) return;
  
  if (!state.notes || state.notes.length === 0) {
    notesContainer.innerHTML = '<p class="no-data">No notes available.</p>';
    return;
  }
  
  const notesHTML = state.notes.map(note => `
    <div class="note-card">
      <h3>${note.title}</h3>
      <p>${note.content}</p>
    </div>
  `).join('');
  
  notesContainer.innerHTML = notesHTML;
}

// Render gallery section
function renderGallery() {
  const galleryContainer = document.querySelector('.gallery-container');
  if (!galleryContainer) return;
  
  if (!state.gallery || state.gallery.length === 0) {
    galleryContainer.innerHTML = '<p class="no-data">No images available.</p>';
    return;
  }
  
  const galleryHTML = state.gallery.map(image => `
    <div class="gallery-item">
      <img src="${image.imageUrl}" alt="${image.title || 'Gallery image'}">
      <div class="gallery-caption">
        <h3>${image.title || ''}</h3>
        <p>${image.description || ''}</p>
      </div>
    </div>
  `).join('');
  
  galleryContainer.innerHTML = galleryHTML;
}

// Apply settings
function applySettings() {
  if (!state.settings || state.settings.length === 0) return;
  
  const setting = state.settings[0]; // Use the first settings object
  
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

// Show error message
function showError(message) {
  const errorContainer = document.getElementById('error-container');
  if (!errorContainer) {
    const newErrorContainer = document.createElement('div');
    newErrorContainer.id = 'error-container';
    newErrorContainer.className = 'error-container';
    document.body.prepend(newErrorContainer);
    
    newErrorContainer.innerHTML = `<p>${message}</p>`;
    
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
