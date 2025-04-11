// Fixed main.js with improved tab navigation
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
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
        console.log('Initializing application...');
        
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
        
        console.log('All data fetched successfully');
        
        // Initialize each section
        initSchedule(events);
        initContacts(contacts);
        initReminders(reminders);
        initNotes(notes);
        initFooter(footer);
        updateSettings(settings);
        
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
    console.log('Setting up navigation...');
    const navLinks = document.querySelectorAll('.main-nav a');
    const sections = document.querySelectorAll('section.section');
    
    // Log all sections for debugging
    console.log('Available sections:');
    sections.forEach(section => {
        console.log(`- ${section.id}`);
    });
    
    // Show home section by default
    hideAllSections();
    showSection('home');
    
    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section ID from the link's href
            const targetId = this.getAttribute('href').substring(1);
            console.log(`Navigation clicked: ${targetId}`);
            
            // Hide all sections
            hideAllSections();
            
            // Show the target section
            showSection(targetId);
            
            // Update active link
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

// Hide all sections
function hideAllSections() {
    const sections = document.querySelectorAll('section.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
}

// Show a specific section
function showSection(sectionId) {
    console.log(`Showing section: ${sectionId}`);
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    } else {
        console.error(`Section not found: ${sectionId}`);
    }
}

// Initialize countdown timer
function initCountdown() {
    console.log('Initializing countdown timer...');
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) {
        console.warn('Countdown element not found');
        return;
    }
    
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
    console.log('Initializing schedule section...');
    const scheduleContainer = document.getElementById('schedule-container');
    if (!scheduleContainer) {
        console.warn('Schedule container not found');
        return;
    }
    
    // Clear existing content
    scheduleContainer.innerHTML = '';
    
    if (!events || events.length === 0) {
        scheduleContainer.innerHTML = '<div class="empty-schedule"><i class="fas fa-calendar-times"></i><h3>No events scheduled yet</h3><p>Check back later for updates to the schedule</p></div>';
        return;
    }
    
    console.log(`Displaying ${events.length} events`);
    
    // Group events by day
    const eventsByDay = {};
    events.forEach(event => {
        if (!eventsByDay[event.day]) {
            eventsByDay[event.day] = [];
        }
        eventsByDay[event.day].push(event);
    });
    
    // Sort days chronologically
    const sortedDays = Object.keys(eventsByDay).sort((a, b) => {
        // Extract day number from "April XX, 2025" format
        const dayA = parseInt(a.match(/\d+/)[0]);
        const dayB = parseInt(b.match(/\d+/)[0]);
        return dayA - dayB;
    });
    
    // Create HTML for each day
    sortedDays.forEach(day => {
        const dayEvents = eventsByDay[day];
        
        // Sort events by start time
        dayEvents.sort((a, b) => {
            if (a.startTime < b.startTime) return -1;
            if (a.startTime > b.startTime) return 1;
            return 0;
        });
        
        // Create day container
        const dayContainer = document.createElement('div');
        dayContainer.className = 'schedule-day';
        
        // Add day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        
        // Get appropriate icon for the day
        let dayIconClass = 'fas fa-calendar-day';
        
        const dayIcon = document.createElement('i');
        dayIcon.className = dayIconClass;
        
        const dayTitle = document.createElement('h2');
        dayTitle.className = 'day-title';
        dayTitle.textContent = day;
        
        dayHeader.appendChild(dayIcon);
        dayHeader.appendChild(dayTitle);
        dayContainer.appendChild(dayHeader);
        
        // Add events for this day
        dayEvents.forEach(event => {
            // Get appropriate icon for event type
            let eventIconClass = 'fas fa-calendar-day';
            const lowerTitle = event.title.toLowerCase();
            
            if (lowerTitle.includes('breakfast') || (event.description && event.description.toLowerCase().includes('breakfast'))) {
                eventIconClass = 'fas fa-coffee';
            } else if (lowerTitle.includes('lunch') || (event.description && event.description.toLowerCase().includes('lunch'))) {
                eventIconClass = 'fas fa-utensils';
            } else if (lowerTitle.includes('dinner') || (event.description && event.description.toLowerCase().includes('dinner'))) {
                eventIconClass = 'fas fa-utensils';
            } else if (lowerTitle.includes('tour') || (event.description && event.description.toLowerCase().includes('tour'))) {
                eventIconClass = 'fas fa-map-marked-alt';
            } else if (lowerTitle.includes('party') || (event.description && event.description.toLowerCase().includes('party'))) {
                eventIconClass = 'fas fa-glass-cheers';
            } else if (lowerTitle.includes('ceremony') || (event.description && event.description.toLowerCase().includes('ceremony'))) {
                eventIconClass = 'fas fa-heart';
            } else if (lowerTitle.includes('brunch') || (event.description && event.description.toLowerCase().includes('brunch'))) {
                eventIconClass = 'fas fa-coffee';
            } else if (lowerTitle.includes('welcome') || (event.description && event.description.toLowerCase().includes('welcome'))) {
                eventIconClass = 'fas fa-glass-cheers';
            } else if (lowerTitle.includes('farewell') || (event.description && event.description.toLowerCase().includes('farewell'))) {
                eventIconClass = 'fas fa-hand-peace';
            } else if (lowerTitle.includes('gala') || (event.description && event.description.toLowerCase().includes('gala'))) {
                eventIconClass = 'fas fa-star';
            }
            
            // Format time
            function formatTime(timeString) {
                if (!timeString) return '';
                
                // Check if it's already in HH:MM format
                if (/^\d{2}:\d{2}$/.test(timeString)) {
                    // Convert 24-hour format to 12-hour format with AM/PM
                    const [hours, minutes] = timeString.split(':');
                    const hour = parseInt(hours);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const hour12 = hour % 12 || 12; // Convert 0 to 12
                    return `${hour12}:${minutes} ${ampm}`;
                }
                
                return timeString;
            }
            
            const eventElement = document.createElement('div');
            eventElement.className = 'event-card';
            
            // Create event header with title and time
            const eventHeader = document.createElement('div');
            eventHeader.className = 'event-header';
            
            const eventTitle = document.createElement('h3');
            eventTitle.className = 'event-title';
            eventTitle.textContent = event.title;
            
            const eventTime = document.createElement('div');
            eventTime.className = 'event-time';
            
            const timeIcon = document.createElement('i');
            timeIcon.className = 'fas fa-clock';
            
            const timeText = document.createElement('span');
            if (event.startTime && event.endTime) {
                timeText.textContent = `${event.startTime} - ${event.endTime}`;
            } else if (event.startTime) {
                timeText.textContent = event.startTime;
            } else {
                timeText.textContent = 'All day';
            }
            
            eventTime.appendChild(timeIcon);
            eventTime.appendChild(timeText);
            
            eventHeader.appendChild(eventTitle);
            eventHeader.appendChild(eventTime);
            eventElement.appendChild(eventHeader);
            
            // Event location if available
            if (event.location) {
                const eventLocation = document.createElement('div');
                eventLocation.className = 'event-location';
                
                const locationIcon = document.createElement('i');
                locationIcon.className = 'fas fa-map-marker-alt';
                
                const locationText = document.createElement('span');
                locationText.textContent = event.location;
                
                eventLocation.appendChild(locationIcon);
                eventLocation.appendChild(locationText);
                eventElement.appendChild(eventLocation);
            }
            
            // Event description if available
            if (event.description) {
                const eventDescription = document.createElement('div');
                eventDescription.className = 'event-description';
                eventDescription.textContent = event.description;
                eventElement.appendChild(eventDescription);
            }
            
            // Event details (dress code, notes)
            const eventDetails = document.createElement('div');
            eventDetails.className = 'event-details';
            
            if (event.dressCode) {
                const dressCode = document.createElement('div');
                dressCode.className = 'event-detail';
                
                const dressIcon = document.createElement('i');
                dressIcon.className = 'fas fa-tshirt';
                
                const dressText = document.createElement('span');
                dressText.textContent = event.dressCode;
                
                dressCode.appendChild(dressIcon);
                dressCode.appendChild(dressText);
                eventDetails.appendChild(dressCode);
            }
            
            if (event.notes) {
                const notes = document.createElement('div');
                notes.className = 'event-detail';
                
                const notesIcon = document.createElement('i');
                notesIcon.className = 'fas fa-sticky-note';
                
                const notesText = document.createElement('span');
                notesText.textContent = 'Notes available';
                
                notes.appendChild(notesIcon);
                notes.appendChild(notesText);
                notes.title = event.notes;
                eventDetails.appendChild(notes);
            }
            
            if (eventDetails.children.length > 0) {
                eventElement.appendChild(eventDetails);
            }
            
            // Event links (map, website)
            const eventLinks = document.createElement('div');
            eventLinks.className = 'event-links';
            
            if (event.mapUrl) {
                const mapLink = document.createElement('a');
                mapLink.className = 'event-link';
                mapLink.href = event.mapUrl;
                mapLink.target = '_blank';
                mapLink.rel = 'noopener noreferrer';
                
                const mapIcon = document.createElement('i');
                mapIcon.className = 'fas fa-map';
                
                const mapText = document.createElement('span');
                mapText.textContent = 'View Map';
                
                mapLink.appendChild(mapIcon);
                mapLink.appendChild(mapText);
                eventLinks.appendChild(mapLink);
            }
            
            if (event.websiteUrl) {
                const websiteLink = document.createElement('a');
                websiteLink.className = 'event-link';
                websiteLink.href = event.websiteUrl;
                websiteLink.target = '_blank';
                websiteLink.rel = 'noopener noreferrer';
                
                const websiteIcon = document.createElement('i');
                websiteIcon.className = 'fas fa-globe';
                
                const websiteText = document.createElement('span');
                websiteText.textContent = 'Visit Website';
                
                websiteLink.appendChild(websiteIcon);
                websiteLink.appendChild(websiteText);
                eventLinks.appendChild(websiteLink);
            }
            
            if (eventLinks.children.length > 0) {
                eventElement.appendChild(eventLinks);
            }
            
            dayContainer.appendChild(eventElement);
        });
        
        scheduleContainer.appendChild(dayContainer);
    });
}
}

// Initialize contacts section
function initContacts(contacts) {
    console.log('Initializing contacts section...');
    const contactsContainer = document.getElementById('contacts-container');
    if (!contactsContainer) {
        console.warn('Contacts container not found');
        return;
    }
    
    // Clear existing content
    contactsContainer.innerHTML = '';
    
    if (!contacts || contacts.length === 0) {
        contactsContainer.innerHTML = '<p class="no-data">No contacts available yet.</p>';
        return;
    }
    
    console.log(`Displaying ${contacts.length} contacts`);
    
    // Group contacts by type
    const contactsByType = {};
    contacts.forEach(contact => {
        const type = contact.type || 'General';
        if (!contactsByType[type]) {
            contactsByType[type] = [];
        }
        contactsByType[type].push(contact);
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
                ${contact.title ? `<div class="contact-title">${contact.title}</div>` : ''}
                <div class="contact-details">
                    ${contact.email ? `
                        <div class="contact-detail">
                            <i class="fas fa-envelope"></i>
                            <a href="mailto:${contact.email}">${contact.email}</a>
                        </div>
                    ` : ''}
                    ${contact.phone ? `
                        <div class="contact-detail">
                            <i class="fas fa-phone"></i>
                            <a href="tel:${contact.phone}">${contact.phone}</a>
                        </div>
                    ` : ''}
                </div>
                ${contact.description ? `<p class="contact-description">${contact.description}</p>` : ''}
            `;
            
            typeContainer.appendChild(contactElement);
        });
        
        contactsContainer.appendChild(typeContainer);
    });
}

// Initialize reminders section
function initReminders(reminders) {
    console.log('Initializing reminders section...');
    const remindersContainer = document.getElementById('reminders-container');
    if (!remindersContainer) {
        console.warn('Reminders container not found');
        return;
    }
    
    // Clear existing content
    remindersContainer.innerHTML = '';
    
    if (!reminders || reminders.length === 0) {
        remindersContainer.innerHTML = '<p class="no-data">No reminders available yet.</p>';
        return;
    }
    
    console.log(`Displaying ${reminders.length} reminders`);
    
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
                <p class="reminder-description">${reminder.description || ''}</p>
                ${reminder.date ? `<div class="reminder-date">${formatDate(reminder.date)}</div>` : ''}
            </div>
        `;
        
        remindersContainer.appendChild(reminderElement);
    });
}

// Initialize notes section
function initNotes(notes) {
    console.log('Initializing notes section...');
    const notesContainer = document.getElementById('notes-container');
    if (!notesContainer) {
        console.warn('Notes container not found');
        return;
    }
    
    // Clear existing content
    notesContainer.innerHTML = '';
    
    if (!notes || notes.length === 0) {
        notesContainer.innerHTML = '<p class="no-data">No notes available yet.</p>';
        return;
    }
    
    console.log(`Displaying ${notes.length} notes`);
    
    // Create HTML for each note
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        
        noteElement.innerHTML = `
            <h3 class="note-title">${note.title}</h3>
            <div class="note-content">${note.content || ''}</div>
        `;
        
        notesContainer.appendChild(noteElement);
    });
}

// Initialize footer
function initFooter(footer) {
    console.log('Initializing footer...');
    const footerTitleElement = document.querySelector('.footer-title');
    const footerTextElement = document.querySelector('.footer-text');
    const footerCopyrightElement = document.querySelector('.footer-copyright');
    
    if (footer && footerTitleElement) {
        footerTitleElement.textContent = footer.title || 'Jyoti\'s 50th Birthday Celebration';
    }
    
    if (footer && footerTextElement) {
        footerTextElement.textContent = footer.text || '';
    }
    
    if (footer && footerCopyrightElement) {
        footerCopyrightElement.textContent = footer.copyright || `© ${new Date().getFullYear()} Jyoti's 50th Birthday Celebration`;
    }
}

// Update settings
function updateSettings(settings) {
    console.log('Updating settings...');
    if (!settings) return;
    
    // Update theme colors if provided
    if (settings.primaryColor || settings.secondaryColor || settings.backgroundColor) {
        const root = document.documentElement;
        
        if (settings.primaryColor) {
            root.style.setProperty('--primary-color', settings.primaryColor);
        }
        
        if (settings.secondaryColor) {
            root.style.setProperty('--secondary-color', settings.secondaryColor);
        }
        
        if (settings.backgroundColor) {
            root.style.setProperty('--background-color', settings.backgroundColor);
        }
    }
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
