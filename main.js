// Main JavaScript for the website
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Set up navigation
    setupNavigation();
    
    // Initialize countdown timer
    initCountdown();
});

// Initialize the application
async function initApp() {
    try {
        // Fetch all data in parallel
        const [events, contacts, reminders, notes, footer, settings, gallery] = await Promise.all([
            fetchData('/api/events'),
            fetchData('/api/contacts'),
            fetchData('/api/reminders'),
            fetchData('/api/notes'),
            fetchData('/api/footer'),
            fetchData('/api/settings'),
            fetchData('/api/gallery')
        ]);
        
        // Initialize each section
        initSchedule(events);
        initContacts(contacts);
        initReminders(reminders);
        initNotes(notes);
        initFooter(footer);
        updateSettings(settings);
        
        // Initialize gallery if on gallery page
        if (document.getElementById('gallery-container')) {
            initGallery(gallery);
        }
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to load data. Please refresh the page or try again later.');
    }
}

// Fetch data from API
async function fetchData(endpoint) {
    try {
        console.log(`Fetching data from ${endpoint}...`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Data from ${endpoint}:`, data);
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        throw error;
    }
}

// Set up navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');
    
    // Hide all sections initially
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show home section by default
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.style.display = 'block';
    }
    
    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section ID from the link's href
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show the target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // Update active link
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

// Initialize countdown timer
function initCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    // Set the date we're counting down to (April 24, 2025 at 19:00)
    const countdownDate = new Date('April 24, 2025 19:00:00').getTime();
    
    // Update the countdown every 1 second
    const countdownInterval = setInterval(function() {
        // Get current date and time
        const now = new Date().getTime();
        
        // Calculate the time remaining
        const distance = countdownDate - now;
        
        // Calculate days, hours, minutes, and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Display the countdown
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
        
        // If the countdown is over, display a message
        if (distance < 0) {
            clearInterval(countdownInterval);
            countdownElement.innerHTML = '<div class="countdown-complete">The celebration has begun!</div>';
        }
    }, 1000);
}

// Initialize schedule section
function initSchedule(events) {
    const scheduleContainer = document.getElementById('schedule-container');
    if (!scheduleContainer) return;
    
    // Clear existing content
    scheduleContainer.innerHTML = '';
    
    if (!events || events.length === 0) {
        scheduleContainer.innerHTML = '<p class="no-data">No events scheduled yet.</p>';
        return;
    }
    
    // Group events by day
    const eventsByDay = {};
    events.forEach(event => {
        if (!eventsByDay[event.day]) {
            eventsByDay[event.day] = [];
        }
        eventsByDay[event.day].push(event);
    });
    
    // Create HTML for each day
    Object.keys(eventsByDay).forEach(day => {
        const dayEvents = eventsByDay[day];
        
        // Create day container
        const dayContainer = document.createElement('div');
        dayContainer.className = 'day-container';
        
        // Add day header
        const dayHeader = document.createElement('h2');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        dayContainer.appendChild(dayHeader);
        
        // Add events for this day
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-card';
            
            eventElement.innerHTML = `
                <h3 class="event-title">${event.title}</h3>
                <div class="event-details">
                    <div class="event-detail">
                        <i class="fas fa-clock"></i>
                        <span>${event.startTime} - ${event.endTime}</span>
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-tshirt"></i>
                        <span>${event.dressCode}</span>
                    </div>
                </div>
                <p class="event-description">${event.description}</p>
                <div class="event-notes">${event.notes}</div>
                <div class="event-actions">
                    ${event.mapUrl ? `<a href="${event.mapUrl}" target="_blank" class="btn btn-secondary"><i class="fas fa-map"></i> View Map</a>` : ''}
                    ${event.websiteUrl ? `<a href="${event.websiteUrl}" target="_blank" class="btn btn-secondary"><i class="fas fa-globe"></i> View Website</a>` : ''}
                </div>
            `;
            
            dayContainer.appendChild(eventElement);
        });
        
        scheduleContainer.appendChild(dayContainer);
    });
}

// Initialize contacts section
function initContacts(contacts) {
    const contactsContainer = document.getElementById('contacts-container');
    if (!contactsContainer) return;
    
    // Clear existing content
    contactsContainer.innerHTML = '';
    
    if (!contacts || contacts.length === 0) {
        contactsContainer.innerHTML = '<p class="no-data">No contacts available yet.</p>';
        return;
    }
    
    // Group contacts by type
    const contactsByType = {};
    contacts.forEach(contact => {
        if (!contactsByType[contact.type]) {
            contactsByType[contact.type] = [];
        }
        contactsByType[contact.type].push(contact);
    });
    
    // Create HTML for each contact type
    Object.keys(contactsByType).forEach(type => {
        const typeContacts = contactsByType[type];
        
        // Create type container
        const typeContainer = document.createElement('div');
        typeContainer.className = 'contact-type-container';
        
        // Add type header
        const typeHeader = document.createElement('h2');
        typeHeader.className = 'contact-type-header';
        typeHeader.textContent = type;
        typeContainer.appendChild(typeHeader);
        
        // Add contacts for this type
        typeContacts.forEach(contact => {
            const contactElement = document.createElement('div');
            contactElement.className = 'contact-card';
            
            contactElement.innerHTML = `
                <h3 class="contact-name">${contact.name}</h3>
                <div class="contact-details">
                    <div class="contact-detail">
                        <i class="fas fa-envelope"></i>
                        <a href="mailto:${contact.email}">${contact.email}</a>
                    </div>
                    <div class="contact-detail">
                        <i class="fas fa-phone"></i>
                        <a href="tel:${contact.phone}">${contact.phone}</a>
                    </div>
                </div>
                <p class="contact-description">${contact.description}</p>
            `;
            
            typeContainer.appendChild(contactElement);
        });
        
        contactsContainer.appendChild(typeContainer);
    });
}

// Initialize reminders section
function initReminders(reminders) {
    const remindersContainer = document.getElementById('reminders-container');
    if (!remindersContainer) return;
    
    // Clear existing content
    remindersContainer.innerHTML = '';
    
    if (!reminders || reminders.length === 0) {
        remindersContainer.innerHTML = '<p class="no-data">No reminders available yet.</p>';
        return;
    }
    
    // Sort reminders by date
    reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Create HTML for each reminder
    reminders.forEach(reminder => {
        const reminderElement = document.createElement('div');
        reminderElement.className = 'reminder-card';
        
        // Determine icon class
        let iconClass = 'fas fa-bell';
        if (reminder.icon === 'Calendar') iconClass = 'fas fa-calendar-alt';
        if (reminder.icon === 'Info') iconClass = 'fas fa-info-circle';
        if (reminder.icon === 'Warning') iconClass = 'fas fa-exclamation-triangle';
        
        reminderElement.innerHTML = `
            <div class="reminder-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="reminder-content">
                <h3 class="reminder-title">${reminder.title}</h3>
                <p class="reminder-description">${reminder.description}</p>
                <div class="reminder-date">${formatDate(reminder.date)}</div>
            </div>
        `;
        
        remindersContainer.appendChild(reminderElement);
    });
}

// Initialize notes section
function initNotes(notes) {
    const notesContainer = document.getElementById('notes-container');
    if (!notesContainer) return;
    
    // Clear existing content
    notesContainer.innerHTML = '';
    
    if (!notes || notes.length === 0) {
        notesContainer.innerHTML = '<p class="no-data">No notes available yet.</p>';
        return;
    }
    
    // Create HTML for each note
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        
        noteElement.innerHTML = `
            <h3 class="note-title">${note.title}</h3>
            <div class="note-content">${note.content}</div>
        `;
        
        notesContainer.appendChild(noteElement);
    });
}

// Initialize footer
function initFooter(footer) {
    const footerContainer = document.querySelector('footer');
    if (!footerContainer) return;
    
    if (!footer) {
        return;
    }
    
    // Update footer content
    footerContainer.innerHTML = `
        <div class="footer-content">
            <div class="footer-title">${footer.title}</div>
            <div class="footer-text">${footer.text}</div>
            <div class="footer-copyright">${footer.copyright}</div>
        </div>
    `;
}

// Update settings
function updateSettings(settings) {
    if (!settings) return;
    
    // Update page title
    document.title = settings.siteTitle;
    
    // Update site header
    const siteHeader = document.querySelector('.site-header h1');
    if (siteHeader) {
        siteHeader.textContent = settings.siteTitle;
    }
    
    // Update event info
    const eventInfo = document.querySelector('.event-info');
    if (eventInfo) {
        eventInfo.innerHTML = `
            <div class="event-date">${settings.eventDate}</div>
            <div class="event-location">${settings.eventLocation}</div>
        `;
    }
    
    // Update colors
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show error message
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    document.body.appendChild(errorElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Refresh data periodically (every 30 seconds)
setInterval(async function() {
    try {
        // Fetch all data in parallel
        const [events, contacts, reminders, notes, footer, settings, gallery] = await Promise.all([
            fetchData('/api/events'),
            fetchData('/api/contacts'),
            fetchData('/api/reminders'),
            fetchData('/api/notes'),
            fetchData('/api/footer'),
            fetchData('/api/settings'),
            fetchData('/api/gallery')
        ]);
        
        // Update each section
        initSchedule(events);
        initContacts(contacts);
        initReminders(reminders);
        initNotes(notes);
        initFooter(footer);
        updateSettings(settings);
        
        // Update gallery if on gallery page
        if (document.getElementById('gallery-container')) {
            initGallery(gallery);
        }
        
        console.log('Data refreshed successfully');
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
}, 30000); // 30 seconds
