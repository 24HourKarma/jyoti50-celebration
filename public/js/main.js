// Main JavaScript for Jyoti's 50th Birthday Celebration Website

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize countdown timer
  initCountdown();
  
  // Initialize tab navigation
  initTabNavigation();
  
  // Load content for each section
  loadHomeContent();
  loadSchedule();
  loadGallery();
  loadReminders();
  loadContacts();
  loadNotes();
});

// Initialize countdown timer
function initCountdown() {
  const eventDate = new Date('April 24, 2025 00:00:00').getTime();
  
  // Update countdown every second
  const countdownInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = eventDate - now;
    
    // Calculate days, hours, minutes, seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Display countdown
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
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
    }
    
    // If countdown is over
    if (distance < 0) {
      clearInterval(countdownInterval);
      if (countdownElement) {
        countdownElement.innerHTML = "The celebration has begun!";
      }
    }
  }, 1000);
}

// Initialize tab navigation
function initTabNavigation() {
  // Get all tabs and sections
  const tabs = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('[id$="-section"]');
  
  // Map of tab href values to section IDs
  const tabToSectionMap = {
    '#home': 'home-section',
    '#schedule': 'schedule-section',
    '#gallery': 'gallery-section',
    '#reminders': 'reminders-section',
    '#contacts': 'contacts-section',
    '#notes': 'notes-section'
  };
  
  // Function to show a specific section and hide others
  function showSection(sectionId) {
    // Get the full section ID from our mapping
    const fullSectionId = tabToSectionMap[sectionId] || sectionId;
    
    // Hide all sections
    sections.forEach(section => {
      section.style.display = 'none';
    });
    
    // Show the selected section
    const targetSection = document.getElementById(fullSectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
    }
    
    // Update active state in navigation
    tabs.forEach(tab => {
      tab.classList.remove('active');
      const href = tab.getAttribute('href');
      if (href === sectionId) {
        tab.classList.add('active');
      }
    });
  }
  
  // Add click event listeners to all tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      showSection(href);
      window.location.hash = href.substring(1);
      
      // If schedule tab is clicked, format the schedule
      if (href === '#schedule') {
        setTimeout(formatSchedule, 100);
      }
    });
  });
  
  // Handle initial page load based on hash
  function handleHashChange() {
    const hash = window.location.hash;
    if (hash) {
      showSection(hash);
      
      // If schedule hash, format the schedule
      if (hash === '#schedule') {
        setTimeout(formatSchedule, 100);
      }
    } else {
      // Default to home section if no hash
      showSection('#home');
    }
  }
  
  // Listen for hash changes
  window.addEventListener('hashchange', handleHashChange);
  
  // Handle initial page load
  handleHashChange();
}

// Load home content
function loadHomeContent() {
  // Home content is static, no need to load dynamically
}

// Load and format schedule
function loadSchedule() {
  const scheduleContainer = document.getElementById('schedule-container');
  if (!scheduleContainer) return;
  
  // Add CSS for schedule formatting
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .day-header {
      background-color: #1a1a1a;
      border-left: 4px solid #d4af37;
      padding: 10px 15px;
      margin-bottom: 20px;
      margin-top: 30px;
    }
    
    .day-header h2 {
      color: #d4af37;
      margin: 0;
      font-size: 24px;
    }
    
    .event-card {
      background-color: #222;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      border-left: 3px solid #d4af37;
    }
    
    .event-title {
      color: #d4af37;
      font-size: 20px;
      margin-top: 0;
      margin-bottom: 10px;
    }
    
    .event-time, .event-location {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }
    
    .event-time i, .event-location i {
      color: #d4af37;
      margin-right: 10px;
      width: 16px;
      text-align: center;
    }
    
    .event-description {
      margin-top: 15px;
      line-height: 1.5;
    }
    
    .event-details {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }
    
    .event-detail {
      background-color: rgba(212, 175, 55, 0.1);
      padding: 5px 10px;
      border-radius: 4px;
      display: flex;
      align-items: center;
    }
    
    .event-detail i {
      color: #d4af37;
      margin-right: 5px;
    }
    
    .event-links {
      margin-top: 15px;
      display: flex;
      gap: 10px;
    }
    
    .event-link {
      display: inline-flex;
      align-items: center;
      background-color: #d4af37;
      color: #000;
      padding: 8px 15px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
    }
    
    .event-link i {
      margin-right: 5px;
    }
    
    @media (max-width: 768px) {
      .event-links {
        flex-direction: column;
      }
    }
  `;
  document.head.appendChild(styleElement);
}

// Format schedule with events from API
function formatSchedule() {
  const scheduleContainer = document.getElementById('schedule-container');
  if (!scheduleContainer) return;
  
  // Fetch events from API
  fetch('/api/events')
    .then(response => response.json())
    .then(events => {
      // Group events by day
      const eventsByDay = {};
      
      events.forEach(event => {
        // Extract day from event.day or default to April 24
        let day = 'April 24, 2025';
        
        if (event.day) {
          // If day is in format "April XX, 2025", use it directly
          if (/^April \d+, 2025$/.test(event.day)) {
            day = event.day;
          } 
          // If day is in format "April 24-27, 2025", extract first day
          else if (event.day.includes('April 24-27, 2025')) {
            // Try to determine the actual day based on event title or time
            if (event.title.toLowerCase().includes('welcome')) {
              day = 'April 24, 2025';
            } else if (event.title.toLowerCase().includes('farewell')) {
              day = 'April 27, 2025';
            } else if (event.title.toLowerCase().includes('gala')) {
              day = 'April 25, 2025';
            }
          }
        }
        
        if (!eventsByDay[day]) {
          eventsByDay[day] = [];
        }
        
        eventsByDay[day].push(event);
      });
      
      // Sort days chronologically
      const sortedDays = Object.keys(eventsByDay).sort((a, b) => {
        const dayA = parseInt(a.match(/\d+/)[0]);
        const dayB = parseInt(b.match(/\d+/)[0]);
        return dayA - dayB;
      });
      
      // Clear the container
      scheduleContainer.innerHTML = '';
      
      // Create HTML for each day
      sortedDays.forEach(day => {
        const dayEvents = eventsByDay[day];
        
        // Sort events by start time
        dayEvents.sort((a, b) => {
          if (!a.startTime) return 1;
          if (!b.startTime) return -1;
          return a.startTime.localeCompare(b.startTime);
        });
        
        // Create day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        
        const dayTitle = document.createElement('h2');
        dayTitle.textContent = day;
        dayHeader.appendChild(dayTitle);
        
        scheduleContainer.appendChild(dayHeader);
        
        // Create event cards
        dayEvents.forEach(event => {
          const eventCard = document.createElement('div');
          eventCard.className = 'event-card';
          
          // Event title
          const eventTitle = document.createElement('h3');
          eventTitle.className = 'event-title';
          eventTitle.textContent = event.title;
          eventCard.appendChild(eventTitle);
          
          // Event time
          if (event.startTime) {
            const eventTime = document.createElement('div');
            eventTime.className = 'event-time';
            
            const timeIcon = document.createElement('i');
            timeIcon.className = 'fas fa-clock';
            eventTime.appendChild(timeIcon);
            
            const timeText = document.createElement('span');
            if (event.endTime) {
              timeText.textContent = `${event.startTime} - ${event.endTime}`;
            } else {
              timeText.textContent = event.startTime;
            }
            eventTime.appendChild(timeText);
            
            eventCard.appendChild(eventTime);
          }
          
          // Event location
          if (event.location) {
            const eventLocation = document.createElement('div');
            eventLocation.className = 'event-location';
            
            const locationIcon = document.createElement('i');
            locationIcon.className = 'fas fa-map-marker-alt';
            eventLocation.appendChild(locationIcon);
            
            const locationText = document.createElement('span');
            locationText.textContent = event.location;
            eventLocation.appendChild(locationText);
            
            eventCard.appendChild(eventLocation);
          }
          
          // Event description
          if (event.description) {
            const eventDescription = document.createElement('div');
            eventDescription.className = 'event-description';
            eventDescription.textContent = event.description;
            eventCard.appendChild(eventDescription);
          }
          
          // Event details (dress code, notes)
          const eventDetails = document.createElement('div');
          eventDetails.className = 'event-details';
          
          if (event.dressCode) {
            const dressCode = document.createElement('div');
            dressCode.className = 'event-detail';
            
            const dressIcon = document.createElement('i');
            dressIcon.className = 'fas fa-tshirt';
            dressCode.appendChild(dressIcon);
            
            const dressText = document.createElement('span');
            dressText.textContent = event.dressCode;
            dressCode.appendChild(dressText);
            
            eventDetails.appendChild(dressCode);
          }
          
          if (event.notes) {
            const notes = document.createElement('div');
            notes.className = 'event-detail';
            
            const notesIcon = document.createElement('i');
            notesIcon.className = 'fas fa-sticky-note';
            notes.appendChild(notesIcon);
            
            const notesText = document.createElement('span');
            notesText.textContent = 'Notes available';
            notes.appendChild(notesText);
            
            notes.title = event.notes;
            eventDetails.appendChild(notes);
          }
          
          if (eventDetails.children.length > 0) {
            eventCard.appendChild(eventDetails);
          }
          
          // Event links (map, website)
          const eventLinks = document.createElement('div');
          eventLinks.className = 'event-links';
          
          if (event.mapUrl) {
            const mapLink = document.createElement('a');
            mapLink.className = 'event-link';
            mapLink.href = event.mapUrl;
            mapLink.target = '_blank';
            
            const mapIcon = document.createElement('i');
            mapIcon.className = 'fas fa-map';
            mapLink.appendChild(mapIcon);
            
            const mapText = document.createElement('span');
            mapText.textContent = 'View Map';
            mapLink.appendChild(mapText);
            
            eventLinks.appendChild(mapLink);
          }
          
          if (event.websiteUrl) {
            const websiteLink = document.createElement('a');
            websiteLink.className = 'event-link';
            websiteLink.href = event.websiteUrl;
            websiteLink.target = '_blank';
            
            const websiteIcon = document.createElement('i');
            websiteIcon.className = 'fas fa-globe';
            websiteLink.appendChild(websiteIcon);
            
            const websiteText = document.createElement('span');
            websiteText.textContent = 'Visit Website';
            websiteLink.appendChild(websiteText);
            
            eventLinks.appendChild(websiteLink);
          }
          
          if (eventLinks.children.length > 0) {
            eventCard.appendChild(eventLinks);
          }
          
          scheduleContainer.appendChild(eventCard);
        });
      });
    })
    .catch(error => {
      console.error('Error fetching events:', error);
      scheduleContainer.innerHTML = '<p>Error loading schedule. Please try again later.</p>';
    });
}

// Load gallery
function loadGallery() {
  const galleryContainer = document.getElementById('gallery-container');
  if (!galleryContainer) return;
  
  // Fetch gallery images from API
  fetch('/api/gallery')
    .then(response => response.json())
    .then(images => {
      if (images.length === 0) {
        galleryContainer.innerHTML = '<p>No images yet. Be the first to upload!</p>';
        return;
      }
      
      // Clear container
      galleryContainer.innerHTML = '';
      
      // Create gallery grid
      const galleryGrid = document.createElement('div');
      galleryGrid.className = 'gallery-grid';
      
      // Add images to grid
      images.forEach(image => {
        const imageItem = document.createElement('div');
        imageItem.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.caption || 'Gallery image';
        img.loading = 'lazy';
        
        imageItem.appendChild(img);
        
        // Add click event for lightbox
        imageItem.addEventListener('click', function() {
          openLightbox(image.url, image.caption);
        });
        
        galleryGrid.appendChild(imageItem);
      });
      
      galleryContainer.appendChild(galleryGrid);
    })
    .catch(error => {
      console.error('Error loading gallery:', error);
      galleryContainer.innerHTML = '<p>Error loading gallery. Please try again later.</p>';
    });
}

// Open lightbox for gallery images
function openLightbox(imageUrl, caption) {
  // Create lightbox elements
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  
  const lightboxContent = document.createElement('div');
  lightboxContent.className = 'lightbox-content';
  
  const closeButton = document.createElement('span');
  closeButton.className = 'lightbox-close';
  closeButton.innerHTML = '&times;';
  
  const image = document.createElement('img');
  image.src = imageUrl;
  image.alt = caption || 'Gallery image';
  
  // Add caption if available
  if (caption) {
    const captionElement = document.createElement('div');
    captionElement.className = 'lightbox-caption';
    captionElement.textContent = caption;
    lightboxContent.appendChild(captionElement);
  }
  
  // Add elements to DOM
  lightboxContent.appendChild(closeButton);
  lightboxContent.appendChild(image);
  lightbox.appendChild(lightboxContent);
  document.body.appendChild(lightbox);
  
  // Prevent scrolling while lightbox is open
  document.body.style.overflow = 'hidden';
  
  // Close lightbox when clicking close button or outside the image
  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  // Close lightbox when pressing Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });
  
  function closeLightbox() {
    document.body.removeChild(lightbox);
    document.body.style.overflow = '';
  }
}

// Load reminders
function loadReminders() {
  const remindersContainer = document.getElementById('reminders-container');
  if (!remindersContainer) return;
  
  // Fetch reminders from API
  fetch('/api/reminders')
    .then(response => response.json())
    .then(reminders => {
      if (reminders.length === 0) {
        remindersContainer.innerHTML = '<p>No reminders yet.</p>';
        return;
      }
      
      // Clear container
      remindersContainer.innerHTML = '';
      
      // Create reminders list
      const remindersList = document.createElement('div');
      remindersList.className = 'reminders-list';
      
      // Add reminders to list
      reminders.forEach(reminder => {
        const reminderItem = document.createElement('div');
        reminderItem.className = 'reminder-item';
        
        const reminderTitle = document.createElement('h3');
        reminderTitle.className = 'reminder-title';
        reminderTitle.textContent = reminder.title;
        
        const reminderDescription = document.createElement('p');
        reminderDescription.className = 'reminder-description';
        reminderDescription.textContent = reminder.description;
        
        reminderItem.appendChild(reminderTitle);
        reminderItem.appendChild(reminderDescription);
        
        remindersList.appendChild(reminderItem);
      });
      
      remindersContainer.appendChild(remindersList);
    })
    .catch(error => {
      console.error('Error loading reminders:', error);
      remindersContainer.innerHTML = '<p>Error loading reminders. Please try again later.</p>';
    });
}

// Load contacts
function loadContacts() {
  const contactsContainer = document.getElementById('contacts-container');
  if (!contactsContainer) return;
  
  // Fetch contacts from API
  fetch('/api/contacts')
    .then(response => response.json())
    .then(contacts => {
      if (contacts.length === 0) {
        contactsContainer.innerHTML = '<p>No contacts yet.</p>';
        return;
      }
      
      // Clear container
      contactsContainer.innerHTML = '';
      
      // Create contacts list
      const contactsList = document.createElement('div');
      contactsList.className = 'contacts-list';
      
      // Add contacts to list
      contacts.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        
        const contactName = document.createElement('h3');
        contactName.className = 'contact-name';
        contactName.textContent = contact.name;
        
        const contactDetails = document.createElement('div');
        contactDetails.className = 'contact-details';
        
        if (contact.title) {
          const contactTitle = document.createElement('p');
          contactTitle.className = 'contact-title';
          contactTitle.textContent = contact.title;
          contactDetails.appendChild(contactTitle);
        }
        
        if (contact.phone) {
          const contactPhone = document.createElement('p');
          contactPhone.className = 'contact-phone';
          
          const phoneIcon = document.createElement('i');
          phoneIcon.className = 'fas fa-phone';
          
          const phoneLink = document.createElement('a');
          phoneLink.href = `tel:${contact.phone}`;
          phoneLink.textContent = contact.phone;
          
          contactPhone.appendChild(phoneIcon);
          contactPhone.appendChild(document.createTextNode(' '));
          contactPhone.appendChild(phoneLink);
          
          contactDetails.appendChild(contactPhone);
        }
        
        if (contact.email) {
          const contactEmail = document.createElement('p');
          contactEmail.className = 'contact-email';
          
          const emailIcon = document.createElement('i');
          emailIcon.className = 'fas fa-envelope';
          
          const emailLink = document.createElement('a');
          emailLink.href = `mailto:${contact.email}`;
          emailLink.textContent = contact.email;
          
          contactEmail.appendChild(emailIcon);
          contactEmail.appendChild(document.createTextNode(' '));
          contactEmail.appendChild(emailLink);
          
          contactDetails.appendChild(contactEmail);
        }
        
        contactItem.appendChild(contactName);
        contactItem.appendChild(contactDetails);
        
        contactsList.appendChild(contactItem);
      });
      
      contactsContainer.appendChild(contactsList);
    })
    .catch(error => {
      console.error('Error loading contacts:', error);
      contactsContainer.innerHTML = '<p>Error loading contacts. Please try again later.</p>';
    });
}

// Load notes
function loadNotes() {
  const notesContainer = document.getElementById('notes-container');
  if (!notesContainer) return;
  
  // Fetch notes from API
  fetch('/api/notes')
    .then(response => response.json())
    .then(notes => {
      if (notes.length === 0) {
        notesContainer.innerHTML = '<p>No notes yet.</p>';
        return;
      }
      
      // Clear container
      notesContainer.innerHTML = '';
      
      // Create notes list
      const notesList = document.createElement('div');
      notesList.className = 'notes-list';
      
      // Add notes to list
      notes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        
        const noteTitle = document.createElement('h3');
        noteTitle.className = 'note-title';
        noteTitle.textContent = note.title;
        
        const noteContent = document.createElement('div');
        noteContent.className = 'note-content';
        noteContent.textContent = note.content;
        
        noteItem.appendChild(noteTitle);
        noteItem.appendChild(noteContent);
        
        notesList.appendChild(noteItem);
      });
      
      notesContainer.appendChild(notesList);
    })
    .catch(error => {
      console.error('Error loading notes:', error);
      notesContainer.innerHTML = '<p>Error loading notes. Please try again later.</p>';
    });
}
