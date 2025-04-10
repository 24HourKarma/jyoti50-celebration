// Main JavaScript file with real API integration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    
    // Load data from API
    loadEvents();
    loadContacts();
    loadReminders();
    loadNotes();
    loadGallery();
    loadFooter();
    
    // Initialize countdown timer
    initCountdownTimer();
    
    // Setup gallery upload form
    setupGalleryUpload();
});

// Initialize navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            document.getElementById(targetId).classList.add('active');
            
            // Update active nav link
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            this.classList.add('active');
            
            // Close mobile menu if open
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
            }
        });
    });
    
    // Show home section by default
    document.getElementById('home').classList.add('active');
    document.querySelector('nav a[href="#home"]').classList.add('active');
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('open');
        });
    }
}

// Initialize countdown timer
function initCountdownTimer() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    // Fetch settings to get event date
    fetch('/api/settings')
        .then(response => response.json())
        .then(settings => {
            const eventDateString = settings.eventDate;
            
            // Parse event date
            let eventDate;
            if (eventDateString.includes('-')) {
                // If date range (e.g., "April 24-27, 2025"), use first date
                const dateParts = eventDateString.split('-')[0].trim().split(' ');
                const month = getMonthNumber(dateParts[0]);
                const day = parseInt(dateParts[1]);
                const year = parseInt(dateParts[2]) || new Date().getFullYear();
                eventDate = new Date(year, month, day);
            } else {
                // Try to parse the date string
                eventDate = new Date(eventDateString);
            }
            
            // If date is invalid, use a default date
            if (isNaN(eventDate.getTime())) {
                eventDate = new Date(2025, 3, 24); // April 24, 2025
            }
            
            // Update countdown every second
            updateCountdown(eventDate);
            setInterval(() => updateCountdown(eventDate), 1000);
        })
        .catch(error => {
            console.error('Error loading settings:', error);
            
            // Use default date if settings can't be loaded
            const eventDate = new Date(2025, 3, 24); // April 24, 2025
            
            // Update countdown every second
            updateCountdown(eventDate);
            setInterval(() => updateCountdown(eventDate), 1000);
        });
}

// Update countdown timer
function updateCountdown(eventDate) {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    const now = new Date();
    const difference = eventDate - now;
    
    if (difference <= 0) {
        // Event has already happened
        countdownElement.innerHTML = `
            <div class="countdown-item">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Minutes</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Seconds</span>
            </div>
        `;
        return;
    }
    
    // Calculate days, hours, minutes, seconds
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    // Update countdown display
    countdownElement.innerHTML = `
        <div class="countdown-item">
            <span class="countdown-value">${days}</span>
            <span class="countdown-label">Days</span>
        </div>
        <div class="countdown-item">
            <span class="countdown-value">${hours}</span>
            <span class="countdown-label">Hours</span>
        </div>
        <div class="countdown-item">
            <span class="countdown-value">${minutes}</span>
            <span class="countdown-label">Minutes</span>
        </div>
        <div class="countdown-item">
            <span class="countdown-value">${seconds}</span>
            <span class="countdown-label">Seconds</span>
        </div>
    `;
}

// Helper function to get month number from name
function getMonthNumber(monthName) {
    const months = {
        'january': 0,
        'february': 1,
        'march': 2,
        'april': 3,
        'may': 4,
        'june': 5,
        'july': 6,
        'august': 7,
        'september': 8,
        'october': 9,
        'november': 10,
        'december': 11
    };
    
    return months[monthName.toLowerCase()] || 0;
}

// Load events from API
function loadEvents() {
    const scheduleSection = document.getElementById('schedule');
    if (!scheduleSection) return;
    
    const scheduleContent = scheduleSection.querySelector('.schedule-content');
    if (!scheduleContent) return;
    
    scheduleContent.innerHTML = '<div class="loading">Loading schedule...</div>';
    
    fetch('/api/events')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load events');
            }
            return response.json();
        })
        .then(events => {
            if (events.length === 0) {
                scheduleContent.innerHTML = '<p class="empty-message">No events scheduled yet.</p>';
                return;
            }
            
            // Group events by day
            const eventsByDay = {};
            
            events.forEach(event => {
                const day = event.day || formatDay(event.date);
                
                if (!eventsByDay[day]) {
                    eventsByDay[day] = [];
                }
                
                eventsByDay[day].push(event);
            });
            
            // Sort events by start time within each day
            for (const day in eventsByDay) {
                eventsByDay[day].sort((a, b) => {
                    return a.startTime.localeCompare(b.startTime);
                });
            }
            
            // Clear schedule content
            scheduleContent.innerHTML = '';
            
            // Create schedule for each day
            for (const day in eventsByDay) {
                const daySection = document.createElement('div');
                daySection.className = 'day-section';
                
                daySection.innerHTML = `
                    <h3 class="day-title">${day}</h3>
                    <div class="day-events"></div>
                `;
                
                const dayEvents = daySection.querySelector('.day-events');
                
                eventsByDay[day].forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.className = 'event-card';
                    
                    // Create buttons HTML if URLs are provided
                    let buttonsHtml = '';
                    
                    if (event.mapUrl) {
                        buttonsHtml += `<a href="${event.mapUrl}" target="_blank" class="btn btn-map">Map</a>`;
                    }
                    
                    if (event.websiteUrl) {
                        buttonsHtml += `<a href="${event.websiteUrl}" target="_blank" class="btn btn-website">Website</a>`;
                    }
                    
                    // Create dress code HTML if provided
                    let dressCodeHtml = '';
                    
                    if (event.dressCode) {
                        dressCodeHtml = `<p class="event-dress-code"><strong>Dress Code:</strong> ${event.dressCode}</p>`;
                    }
                    
                    // Create notes HTML if provided
                    let notesHtml = '';
                    
                    if (event.notes) {
                        notesHtml = `<p class="event-notes">${event.notes}</p>`;
                    }
                    
                    eventElement.innerHTML = `
                        <div class="event-time">${event.startTime} - ${event.endTime}</div>
                        <div class="event-details">
                            <h4 class="event-title">${event.title}</h4>
                            <p class="event-location">${event.location}</p>
                            ${dressCodeHtml}
                            <p class="event-description">${event.description || ''}</p>
                            ${notesHtml}
                            <div class="event-buttons">
                                ${buttonsHtml}
                            </div>
                        </div>
                    `;
                    
                    dayEvents.appendChild(eventElement);
                });
                
                scheduleContent.appendChild(daySection);
            }
        })
        .catch(error => {
            console.error('Error loading events:', error);
            scheduleContent.innerHTML = '<div class="error-message">Failed to load schedule. Please refresh the page to try again.</div>';
        });
}

// Load contacts from API
function loadContacts() {
    const contactsSection = document.getElementById('contacts');
    if (!contactsSection) return;
    
    const contactsContent = contactsSection.querySelector('.contacts-content');
    if (!contactsContent) return;
    
    contactsContent.innerHTML = '<div class="loading">Loading contacts...</div>';
    
    fetch('/api/contacts')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load contacts');
            }
            return response.json();
        })
        .then(contacts => {
            if (contacts.length === 0) {
                contactsContent.innerHTML = '<p class="empty-message">No contacts available yet.</p>';
                return;
            }
            
            // Group contacts by type
            const contactsByType = {};
            
            contacts.forEach(contact => {
                const type = contact.type || 'General';
                
                if (!contactsByType[type]) {
                    contactsByType[type] = [];
                }
                
                contactsByType[type].push(contact);
            });
            
            // Clear contacts content
            contactsContent.innerHTML = '';
            
            // Create contacts for each type
            for (const type in contactsByType) {
                const typeSection = document.createElement('div');
                typeSection.className = 'contact-type-section';
                
                typeSection.innerHTML = `
                    <h3 class="contact-type-title">${type}</h3>
                    <div class="contact-type-items"></div>
                `;
                
                const typeItems = typeSection.querySelector('.contact-type-items');
                
                contactsByType[type].forEach(contact => {
                    const contactElement = document.createElement('div');
                    contactElement.className = 'contact-card';
                    
                    contactElement.innerHTML = `
                        <h4 class="contact-name">${contact.name}</h4>
                        <p class="contact-email"><a href="mailto:${contact.email}">${contact.email}</a></p>
                        <p class="contact-phone"><a href="tel:${contact.phone}">${contact.phone}</a></p>
                        <p class="contact-description">${contact.description || ''}</p>
                    `;
                    
                    typeItems.appendChild(contactElement);
                });
                
                contactsContent.appendChild(typeSection);
            }
        })
        .catch(error => {
            console.error('Error loading contacts:', error);
            contactsContent.innerHTML = '<div class="error-message">Failed to load contacts. Please refresh the page to try again.</div>';
        });
}

// Load reminders from API
function loadReminders() {
    const remindersSection = document.getElementById('reminders');
    if (!remindersSection) return;
    
    const remindersContent = remindersSection.querySelector('.reminders-content');
    if (!remindersContent) return;
    
    remindersContent.innerHTML = '<div class="loading">Loading reminders...</div>';
    
    fetch('/api/reminders')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load reminders');
            }
            return response.json();
        })
        .then(reminders => {
            if (reminders.length === 0) {
                remindersContent.innerHTML = '<p class="empty-message">No reminders available yet.</p>';
                return;
            }
            
            // Sort reminders by date
            reminders.sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });
            
            // Clear reminders content
            remindersContent.innerHTML = '';
            
            // Create reminder cards
            reminders.forEach(reminder => {
                const reminderElement = document.createElement('div');
                reminderElement.className = 'reminder-card';
                
                // Get icon class based on icon name
                let iconClass = 'fa-bell';
                
                if (reminder.icon === 'Info') {
                    iconClass = 'fa-info-circle';
                } else if (reminder.icon === 'Warning') {
                    iconClass = 'fa-exclamation-triangle';
                } else if (reminder.icon === 'Calendar') {
                    iconClass = 'fa-calendar';
                }
                
                reminderElement.innerHTML = `
                    <div class="reminder-icon">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="reminder-details">
                        <h4 c
(Content truncated due to size limit. Use line ranges to read in chunks)