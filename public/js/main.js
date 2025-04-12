// main.js - Main JavaScript for Jyoti's 50th Birthday Celebration website

// DOM Elements
const eventsContainer = document.querySelector('.events-container');
const contactsContainer = document.querySelector('.contacts-container');
const remindersContainer = document.querySelector('.reminders-container');
const notesContainer = document.querySelector('.notes-container');
const galleryContainer = document.querySelector('.gallery-container');
const dayTabs = document.querySelectorAll('.day-tab');

// Current active day
let activeDay = 'Thursday';

// Initialize the website
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load all data
        await Promise.all([
            loadEvents(),
            loadContacts(),
            loadReminders(),
            loadNotes(),
            loadGallery()
        ]);
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing website:', error);
        showError('Failed to load website data. Please try refreshing the page.');
    }
});

// Load events
async function loadEvents() {
    try {
        eventsContainer.innerHTML = '<div class="loading">Loading events...</div>';
        
        const events = await api.events.getAll();
        
        if (!events || events.length === 0) {
            eventsContainer.innerHTML = '<p class="no-data">No events found.</p>';
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
        
        // Sort events by start time
        Object.keys(eventsByDay).forEach(day => {
            eventsByDay[day].sort((a, b) => {
                if (a.startTime === 'All Day') return -1;
                if (b.startTime === 'All Day') return 1;
                return a.startTime.localeCompare(b.startTime);
            });
        });
        
        // Display events for active day
        displayEvents(eventsByDay[activeDay] || []);
        
        // Update day tabs
        updateDayTabs(Object.keys(eventsByDay));
        
    } catch (error) {
        console.error('Error loading events:', error);
        eventsContainer.innerHTML = '<p class="error">Failed to load events. Please try again later.</p>';
    }
}

// Display events for the active day
function displayEvents(events) {
    if (!events || events.length === 0) {
        eventsContainer.innerHTML = `<p class="no-data">No events scheduled for ${activeDay}.</p>`;
        return;
    }
    
    let html = '';
    
    events.forEach(event => {
        html += `
            <div class="event-card" data-id="${event._id || ''}">
                <div class="event-card-header">
                    <h3>${event.title}</h3>
                    <div class="event-time">${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}</div>
                </div>
                <div class="event-card-body">
                    ${event.location ? `<div class="event-detail"><strong>Location:</strong> ${event.location}</div>` : ''}
                    ${event.description ? `<div class="event-detail"><strong>Description:</strong> ${event.description}</div>` : ''}
                    ${event.dressCode ? `<div class="event-detail"><strong>Dress Code:</strong> ${event.dressCode}</div>` : ''}
                    ${event.notes ? `<div class="event-detail"><strong>Notes:</strong> ${event.notes}</div>` : ''}
                    
                    <div class="event-links">
                        ${event.mapUrl ? `<a href="${event.mapUrl}" target="_blank"><i class="fas fa-map-marker-alt"></i> Map</a>` : ''}
                        ${event.websiteUrl ? `<a href="${event.websiteUrl}" target="_blank"><i class="fas fa-globe"></i> Website</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    eventsContainer.innerHTML = html;
}

// Update day tabs
function updateDayTabs(days) {
    // Ensure all days are in the correct order
    const orderedDays = ['Thursday', 'Friday', 'Saturday', 'Sunday'].filter(day => days.includes(day));
    
    // Update active state
    dayTabs.forEach(tab => {
        const day = tab.getAttribute('data-day');
        if (orderedDays.includes(day)) {
            tab.style.display = 'block';
            tab.classList.toggle('active', day === activeDay);
        } else {
            tab.style.display = 'none';
        }
    });
}

// Load contacts
async function loadContacts() {
    try {
        contactsContainer.innerHTML = '<div class="loading">Loading contacts...</div>';
        
        const contacts = await api.contacts.getAll();
        
        if (!contacts || contacts.length === 0) {
            contactsContainer.innerHTML = '<p class="no-data">No contacts found.</p>';
            return;
        }
        
        let html = '';
        
        contacts.forEach(contact => {
            html += `
                <div class="contact-card" data-id="${contact._id || ''}">
                    <h3>${contact.name}</h3>
                    ${contact.title ? `<div class="contact-detail"><i class="fas fa-briefcase"></i> ${contact.title}</div>` : ''}
                    ${contact.phone ? `<div class="contact-detail"><i class="fas fa-phone"></i> ${contact.phone}</div>` : ''}
                    ${contact.email ? `<div class="contact-detail"><i class="fas fa-envelope"></i> ${contact.email}</div>` : ''}
                    ${contact.type ? `<div class="contact-detail"><i class="fas fa-tag"></i> ${contact.type}</div>` : ''}
                    ${contact.notes ? `<div class="contact-detail"><i class="fas fa-sticky-note"></i> ${contact.notes}</div>` : ''}
                </div>
            `;
        });
        
        contactsContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading contacts:', error);
        contactsContainer.innerHTML = '<p class="error">Failed to load contacts. Please try again later.</p>';
    }
}

// Load reminders
async function loadReminders() {
    try {
        remindersContainer.innerHTML = '<div class="loading">Loading reminders...</div>';
        
        const reminders = await api.reminders.getAll();
        
        if (!reminders || reminders.length === 0) {
            remindersContainer.innerHTML = '<p class="no-data">No reminders found.</p>';
            return;
        }
        
        // Sort reminders by date
        reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let html = '';
        
        reminders.forEach(reminder => {
            const date = reminder.date ? new Date(reminder.date) : null;
            const formattedDate = date ? date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }) : '';
            
            const iconClass = reminder.icon ? `fa-${reminder.icon}` : 'fa-bell';
            
            html += `
                <div class="reminder-card" data-id="${reminder._id || ''}">
                    <div class="reminder-icon">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <h3>${reminder.title}</h3>
                    ${formattedDate ? `<div class="reminder-date">${formattedDate}</div>` : ''}
                    ${reminder.description ? `<p>${reminder.description}</p>` : ''}
                </div>
            `;
        });
        
        remindersContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading reminders:', error);
        remindersContainer.innerHTML = '<p class="error">Failed to load reminders. Please try again later.</p>';
    }
}

// Load notes
async function loadNotes() {
    try {
        notesContainer.innerHTML = '<div class="loading">Loading notes...</div>';
        
        const notes = await api.notes.getAll();
        
        if (!notes || notes.length === 0) {
            notesContainer.innerHTML = '<p class="no-data">No notes found.</p>';
            return;
        }
        
        let html = '';
        
        notes.forEach(note => {
            html += `
                <div class="note-card" data-id="${note._id || ''}">
                    <h3>${note.title}</h3>
                    ${note.content ? `<p>${note.content}</p>` : ''}
                </div>
            `;
        });
        
        notesContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading notes:', error);
        notesContainer.innerHTML = '<p class="error">Failed to load notes. Please try again later.</p>';
    }
}

// Load gallery
async function loadGallery() {
    try {
        galleryContainer.innerHTML = '<div class="loading">Loading gallery...</div>';
        
        const gallery = await api.gallery.getAll();
        
        if (!gallery || gallery.length === 0) {
            galleryContainer.innerHTML = '<p class="no-data">No images found.</p>';
            return;
        }
        
        let html = '';
        
        gallery.forEach(item => {
            html += `
                <div class="gallery-item" data-id="${item._id || ''}">
                    <img src="${item.url}" alt="${item.caption || 'Gallery image'}" class="gallery-image">
                    ${item.caption ? `<div class="gallery-caption">${item.caption}</div>` : ''}
                </div>
            `;
        });
        
        galleryContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading gallery:', error);
        galleryContainer.innerHTML = '<p class="error">Failed to load gallery. Please try again later.</p>';
    }
}

// Set up event listeners
function setupEventListeners() {
    // Day tab click
    dayTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const day = tab.getAttribute('data-day');
            if (day !== activeDay) {
                activeDay = day;
                loadEvents();
            }
        });
    });
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
