// admin.js - Admin dashboard JavaScript for Jyoti's 50th Birthday Celebration website

// DOM Elements
const loginContainer = document.getElementById('login-container');
const adminContainer = document.getElementById('admin-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const navLinks = document.querySelectorAll('.nav-link');
const adminSections = document.querySelectorAll('.admin-section');

// Event form elements
const eventsContainer = document.getElementById('events-container');
const addEventBtn = document.getElementById('add-event-btn');
const importEventsBtn = document.getElementById('import-events-btn');
const eventFormContainer = document.getElementById('event-form-container');
const eventForm = document.getElementById('event-form');
const eventFormTitle = document.getElementById('event-form-title');

// Contact form elements
const contactsContainer = document.getElementById('contacts-container');
const addContactBtn = document.getElementById('add-contact-btn');
const contactFormContainer = document.getElementById('contact-form-container');
const contactForm = document.getElementById('contact-form');
const contactFormTitle = document.getElementById('contact-form-title');

// Reminder form elements
const remindersContainer = document.getElementById('reminders-container');
const addReminderBtn = document.getElementById('add-reminder-btn');
const reminderFormContainer = document.getElementById('reminder-form-container');
const reminderForm = document.getElementById('reminder-form');
const reminderFormTitle = document.getElementById('reminder-form-title');

// Note form elements
const notesContainer = document.getElementById('notes-container');
const addNoteBtn = document.getElementById('add-note-btn');
const noteFormContainer = document.getElementById('note-form-container');
const noteForm = document.getElementById('note-form');
const noteFormTitle = document.getElementById('note-form-title');

// Gallery form elements
const galleryContainer = document.getElementById('gallery-container');
const addImageBtn = document.getElementById('add-image-btn');
const galleryFormContainer = document.getElementById('gallery-form-container');
const galleryForm = document.getElementById('gallery-form');
const captionFormContainer = document.getElementById('caption-form-container');
const captionForm = document.getElementById('caption-form');

// Settings form elements
const settingsContainer = document.getElementById('settings-container');
const settingsForm = document.getElementById('settings-form');

// Delete confirmation modal
const confirmationModal = document.getElementById('confirmation-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');

// Current item to delete
let currentDeleteItem = {
    type: null,
    id: null
};

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (api.auth.isAuthenticated()) {
        showAdminDashboard();
    } else {
        showLoginForm();
    }
    
    // Set up event listeners
    setupEventListeners();
});

// Show login form
function showLoginForm() {
    loginContainer.style.display = 'block';
    adminContainer.style.display = 'none';
}

// Show admin dashboard
function showAdminDashboard() {
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'block';
    
    // Load data for all sections
    loadEvents();
    loadContacts();
    loadReminders();
    loadNotes();
    loadGallery();
    loadSettings();
}

// Set up event listeners
function setupEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Add buttons
    addEventBtn.addEventListener('click', () => showEventForm());
    addContactBtn.addEventListener('click', () => showContactForm());
    addReminderBtn.addEventListener('click', () => showReminderForm());
    addNoteBtn.addEventListener('click', () => showNoteForm());
    addImageBtn.addEventListener('click', () => showGalleryForm());
    
    // Import events button
    importEventsBtn.addEventListener('click', handleImportEvents);
    
    // Form submissions
    eventForm.addEventListener('submit', handleEventSubmit);
    contactForm.addEventListener('submit', handleContactSubmit);
    reminderForm.addEventListener('submit', handleReminderSubmit);
    noteForm.addEventListener('submit', handleNoteSubmit);
    galleryForm.addEventListener('submit', handleGallerySubmit);
    captionForm.addEventListener('submit', handleCaptionSubmit);
    settingsForm.addEventListener('submit', handleSettingsSubmit);
    
    // Cancel form buttons
    document.querySelectorAll('.cancel-form-btn').forEach(btn => {
        btn.addEventListener('click', handleCancelForm);
    });
    
    // Delete confirmation modal
    cancelDeleteBtn.addEventListener('click', () => {
        confirmationModal.classList.remove('active');
    });
    
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        await api.auth.login({ username, password });
        showAdminDashboard();
        loginError.textContent = '';
    } catch (error) {
        loginError.textContent = error.message || 'Login failed. Please check your credentials.';
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    api.auth.logout();
    showLoginForm();
}

// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    
    const sectionId = e.target.getAttribute('data-section');
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
    });
    
    // Show active section
    adminSections.forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
}

// Handle import events from Google Sheet
async function handleImportEvents() {
    try {
        const confirmed = confirm('This will replace all existing events with data from the Google Sheet. Continue?');
        
        if (!confirmed) {
            return;
        }
        
        const result = await api.events.importFromSheet();
        alert(result.message || 'Events imported successfully!');
        loadEvents();
    } catch (error) {
        alert('Error importing events: ' + (error.message || 'Unknown error'));
    }
}

// Load events
async function loadEvents() {
    try {
        eventsContainer.innerHTML = '<div class="loading">Loading events...</div>';
        
        const events = await api.events.getAll();
        
        if (!events || events.length === 0) {
            eventsContainer.innerHTML = '<p class="no-data">No events found. Add some events to get started.</p>';
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
        
        // Sort days in order
        const orderedDays = ['Thursday', 'Friday', 'Saturday', 'Sunday'].filter(day => eventsByDay[day]);
        
        let html = '<table class="data-table">';
        html += '<thead><tr><th>Title</th><th>Day</th><th>Time</th><th>Location</th><th>Actions</th></tr></thead><tbody>';
        
        orderedDays.forEach(day => {
            // Sort events by start time
            eventsByDay[day].sort((a, b) => {
                if (a.startTime === 'All Day') return -1;
                if (b.startTime === 'All Day') return 1;
                return a.startTime.localeCompare(b.startTime);
            });
            
            eventsByDay[day].forEach(event => {
                html += `
                    <tr data-id="${event._id || ''}">
                        <td>${event.title}</td>
                        <td>${event.day}</td>
                        <td>${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}</td>
                        <td>${event.location || '-'}</td>
                        <td class="action-buttons">
                            <button class="edit-btn" data-action="edit-event" data-id="${event._id || ''}">Edit</button>
                            <button class="delete-btn" data-action="delete-event" data-id="${event._id || ''}">Delete</button>
                        </td>
                    </tr>
                `;
            });
        });
        
        html += '</tbody></table>';
        
        eventsContainer.innerHTML = html;
        
        // Add event listeners to action buttons
        eventsContainer.querySelectorAll('.edit-btn[data-action="edit-event"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const event = events.find(e => e._id === id);
                if (event) {
                    showEventForm(event);
                }
            });
        });
        
        eventsContainer.querySelectorAll('.delete-btn[data-action="delete-event"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                showDeleteConfirmation('event', id);
            });
        });
        
    } catch (error) {
        console.error('Error loading events:', error);
        eventsContainer.innerHTML = '<p class="error">Failed to load events. Please try again later.</p>';
    }
}

// Show event form
function showEventForm(event = null) {
    // Reset form
    eventForm.reset();
    
    // Set form title
    eventFormTitle.textContent = event ? 'Edit Event' : 'Add New Event';
    
    // Fill form with event data if editing
    if (event) {
        document.getElementById('event-id').value = event._id;
        document.getElementById('event-title').value = event.title;
        document.getElementById('event-day').value = event.day;
        document.getElementById('event-date').value = event.date;
        document.getElementById('event-start-time').value = event.startTime;
        document.getElementById('event-end-time').value = event.endTime;
        document.getElementById('event-location').value = event.location;
        document.getElementById('event-description').value = event.description;
        document.getElementById('event-dress-code').value = event.dressCode;
        document.getElementById('event-map-url').value = event.mapUrl;
        document.getElementById('event-website-url').value = event.websiteUrl;
        document.getElementById('event-notes').value = event.notes;
    } else {
        document.getElementById('event-id').value = '';
    }
    
    // Show form
    eventFormContainer.style.display = 'block';
    eventFormContainer.scrollIntoView({ behavior: 'smooth' });
}

// Handle event form submission
async function handleEventSubmit(e) {
    e.preventDefault();
    
    const eventId = document.getElementById('event-id').value;
    
    const eventData = {
        title: document.getElementById('event-title').value,
        day: document.getElementById('event-day').value,
        date: document.getElementById('event-date').value,
        startTime: document.getElementById('event-start-time').value,
        endTime: document.getElementById('event-end-time').value,
        location: document.getElementById('event-location').value,
        description: document.getElementById('event-description').value,
        dressCode: document.getElementById('event-dress-code').value,
        mapUrl: document.getElementById('event-map-url').value,
        websiteUrl: document.getElementById('event-website-url').value,
        notes: document.getElementById('event-notes').value
    };
    
    try {
        if (eventId) {
            // Update existing event
            await api.events.update(eventId, eventData);
        } else {
            // Create new event
            await api.events.create(eventData);
        }
        
        // Hide form and reload events
        eventFormContainer.style.display = 'none';
        loadEvents();
    } catch (error) {
        alert('Error saving event: ' + (error.message || 'Unknown error'));
    }
}

// Load contacts
async function loadContacts() {
    try {
        contactsContainer.innerHTML = '<div class="loading">Loading contacts...</div>';
        
        const contacts = await api.contacts.getAll();
        
        if (!contacts || contacts.length === 0) {
            contactsContainer.innerHTML = '<p class="no-data">No contacts found. Add some contacts to get started.</p>';
            return;
        }
        
        let html = '<table class="data-table">';
        html += '<thead><tr><th>Name</th><th>Title</th><th>Phone</th><th>Email</th><th>Type</th><th>Actions</th></tr></thead><tbody>';
        
        contacts.forEach(contact => {
            html += `
                <tr data-id="${contact._id || ''}">
                    <td>${contact.name}</td>
                    <td>${contact.title || '-'}</td>
                    <td>${contact.phone || '-'}</td>
                    <td>${contact.email || '-'}</td>
                    <td>${contact.type || '-'}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" data-action="edit-contact" data-id="${contact._id || ''}">Edit</button>
                        <button class="delete-btn" data-action="delete-contact" data-id="${contact._id || ''}">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        
        contactsContainer.innerHTML = html;
        
        // Add event listeners to action buttons
        contactsContainer.querySelectorAll('.edit-btn[data-action="edit-contact"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const contact = contacts.find(c => c._id === id);
                if (contact) {
                    showContactForm(contact);
                }
            });
        });
        
        contactsContainer.querySelectorAll('.delete-btn[data-action="delete-contact"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                showDeleteConfirmation('contact', id);
            });
        });
        
    } catch (error) {
        console.error('Error loading contacts:', error);
        contactsContainer.innerHTML = '<p class="error">Failed to load contacts. Please try again later.</p>';
    }
}

// Show contact form
function showContactForm(contact = null) {
    // Reset form
    contactForm.reset();
    
    // Set form title
    contactFormTitle.textContent = contact ? 'Edit Contact' : 'Add New Contact';
    
    // Fill form with contact data if editing
    if (contact) {
        document.getElementById('contact-id').value = contact._id;
        document.getElementById('contact-name').value = contact.name;
        document.getElementById('contact-title').value = contact.title;
        document.getElementById('contact-phone').value = contact.phone;
        document.getElementById('contact-email').value = contact.email;
        document.getElementById('contact-type').value = contact.type;
        document.getElementById('contact-notes').value = contact.notes;
    } else {
        document.getElementById('contact-id').value = '';
    }
    
    // Show form
    contactFormContainer.style.display = 'block';
    contactFormContainer.scrollIntoView({ behavior: 'smooth' });
}

// Handle contact form submission
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const contactId = document.getElementById('contact-id').value;
    
    const contactData = {
        name: document.getElementById('contact-name').value,
        title: document.getElementById('contact-title').value,
        phone: document.getElementById('contact-phone').value,
        email: document.getElementById('contact-email').value,
        type: document.getElementById('contact-type').value,
        notes: document.getElementById('contact-notes').value
    };
    
    try {
        if (contactId) {
            // Update existing contact
            await api.contacts.update(contactId, contactData);
        } else {
            // Create new contact
            await api.contacts.create(contactData);
        }
        
        // Hide form and reload contacts
        contactFormContainer.style.display = 'none';
        loadContacts();
    } catch (error) {
        alert('Error saving contact: ' + (error.message || 'Unknown error'));
    }
}

// Load reminders
async function loadReminders() {
    try {
        remindersContainer.innerHTML = '<div class="loading">Loading reminders...</div>';
        
        const reminders = await api.reminders.getAll();
        
        if (!reminders || reminders.length === 0) {
            remindersContainer.innerHTML = '<p class="no-data">No reminders found. Add some reminders to get started.</p>';
            return;
        }
        
        // Sort reminders by date
        reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let html = '<table class="data-table">';
        html += '<thead><tr><th>Title</th><th>Date</th><th>Icon</th><th>Description</th><th>Actions</th></tr></thead><tbody>';
        
        reminders.forEach(reminder => {
            const date = reminder.date ? new Date(reminder.date) : null;
            const formattedDate = date ? date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }) : '-';
            
            html += `
                <tr data-id="${reminder._id || ''}">
                    <td>${reminder.title}</td>
                    <td>${formattedDate}</td>
                    <td>${reminder.icon || '-'}</td>
                    <td>${reminder.description || '-'}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" data-action="edit-reminder" data-id="${reminder._id || ''}">Edit</button>
                        <button class="delete-btn" data-action="delete-reminder" data-id="${reminder._id || ''}">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        
        remindersContainer.innerHTML = html;
        
        // Add event listeners to action buttons
        remindersContainer.querySelectorAll('.edit-btn[data-action="edit-reminder"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const reminder = reminders.find(r => r._id === id);
                if (reminder) {
                    showReminderForm(reminder);
                }
            });
        });
        
        remindersContainer.querySelectorAll('.delete-btn[data-action="delete-reminder"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                showDeleteConfirmation('reminder', id);
            });
        });
        
    } catch (error) {
        console.error('Error loading reminders:', error);
        remindersContainer.innerHTML = '<p class="error">Failed to load reminders. Please try again later.</p>';
    }
}

// Show reminder form
function showReminderForm(reminder = null) {
    // Reset form
    reminderForm.reset();
    
    // Set form title
    reminderFormTitle.textContent = reminder ? 'Edit Reminder' : 'Add New Reminder';
    
    // Fill form with reminder data if editing
    if (reminder) {
        document.getElementById('reminder-id').value = reminder._id;
        document.getElementById('reminder-title').value = reminder.title;
        document.getElementById('reminder-description').value = reminder.description;
        
        if (reminder.date) {
            const date = new Date(reminder.date);
            const formattedDate = date.toISOString().split('T')[0];
            document.getElementById('reminder-date').value = formattedDate;
        }
        
        document.getElementById('reminder-icon').value = reminder.icon;
    } else {
        document.getElementById('reminder-id').value = '';
    }
    
    // Show form
    reminderFormContainer.style.display = 'block';
    reminderFormContainer.scrollIntoView({ behavior: 'smooth' });
}

// Handle reminder form submission
async function handleReminderSubmit(e) {
    e.preventDefault();
    
    const reminderId = document.getElementById('reminder-id').value;
    
    const reminderData = {
        title: document.getElementById('reminder-title').value,
        description: document.getElementById('reminder-description').value,
        date: document.getElementById('reminder-date').value,
        icon: document.getElementById('reminder-icon').value
    };
    
    try {
        if (reminderId) {
            // Update existing reminder
            await api.reminders.update(reminderId, reminderData);
        } else {
            // Create new reminder
            await api.reminders.create(reminderData);
        }
        
        // Hide form and reload reminders
        reminderFormContainer.style.display = 'none';
        loadReminders();
    } catch (error) {
        alert('Error saving reminder: ' + (error.message || 'Unknown error'));
    }
}

// Load notes
async function loadNotes() {
    try {
        notesContainer.innerHTML = '<div class="loading">Loading notes...</div>';
        
        const notes = await api.notes.getAll();
        
        if (!notes || notes.length === 0) {
            notesContainer.innerHTML = '<p class="no-data">No notes found. Add some notes to get started.</p>';
            return;
        }
        
        let html = '<table class="data-table">';
        html += '<thead><tr><th>Title</th><th>Location</th><th>Content</th><th>Actions</th></tr></thead><tbody>';
        
        notes.forEach(note => {
            // Truncate content for display
            const truncatedContent = note.content && note.content.length > 100 
                ? note.content.substring(0, 100) + '...' 
                : note.content || '-';
            
            html += `
                <tr data-id="${note._id || ''}">
                    <td>${note.title}</td>
                    <td>${note.location || '-'}</td>
                    <td>${truncatedContent}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" data-action="edit-note" data-id="${note._id || ''}">Edit</button>
                        <button class="delete-btn" data-action="delete-note" data-id="${note._id || ''}">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        
        notesContainer.innerHTML = html;
        
        // Add event listeners to action buttons
        notesContainer.querySelectorAll('.edit-btn[data-action="edit-note"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const note = notes.find(n => n._id === id);
                if (note) {
                    showNoteForm(note);
                }
            });
        });
        
        notesContainer.querySelectorAll('.delete-btn[data-action="delete-note"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                showDeleteConfirmation('note', id);
            });
        });
        
    } catch (error) {
        console.error('Error loading notes:', error);
        notesContainer.innerHTML = '<p class="error">Failed to load notes. Please try again later.</p>';
    }
}

// Show note form
function showNoteForm(note = null) {
    // Reset form
    noteForm.reset();
    
    // Set form title
    noteFormTitle.textContent = note ? 'Edit Note' : 'Add New Note';
    
    // Fill form with note data if editing
    if (note) {
        document.getElementById('note-id').value = note._id;
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-content').value = note.content;
        document.getElementById('note-location').value = note.location;
    } else {
        document.getElementById('note-id').value = '';
    }
    
    // Show form
    noteFormContainer.style.display = 'block';
    noteFormContainer.scrollIntoView({ behavior: 'smooth' });
}

// Handle note form submission
async function handleNoteSubmit(e) {
    e.preventDefault();
    
    const noteId = document.getElementById('note-id').value;
    
    const noteData = {
        title: document.getElementById('note-title').value,
        content: document.getElementById('note-content').value,
        location: document.getElementById('note-location').value
    };
    
    try {
        if (noteId) {
            // Update existing note
            await api.notes.update(noteId, noteData);
        } else {
            // Create new note
            await api.notes.create(noteData);
        }
        
        // Hide form and reload notes
        noteFormContainer.style.display = 'none';
        loadNotes();
    } catch (error) {
        alert('Error saving note: ' + (error.message || 'Unknown error'));
    }
}

// Load gallery
async function loadGallery() {
    try {
        galleryContainer.innerHTML = '<div class="loading">Loading gallery...</div>';
        
        const gallery = await api.gallery.getAll();
        
        if (!gallery || gallery.length === 0) {
            galleryContainer.innerHTML = '<p class="no-data">No images found. Add some images to get started.</p>';
            return;
        }
        
        let html = '<div class="admin-gallery">';
        
        gallery.forEach(item => {
            html += `
                <div class="admin-gallery-item" data-id="${item._id || ''}">
                    <img src="${item.url}" alt="${item.caption || 'Gallery image'}" class="admin-gallery-image">
                    <div class="admin-gallery-caption">${item.caption || 'No caption'}</div>
                    <div class="admin-gallery-actions">
                        <button class="edit-caption-btn" data-action="edit-caption" data-id="${item._id || ''}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-image-btn" data-action="delete-image" data-id="${item._id || ''}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        galleryContainer.innerHTML = html;
        
        // Add event listeners to action buttons
        galleryContainer.querySelectorAll('.edit-caption-btn[data-action="edit-caption"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const galleryItem = gallery.find(g => g._id === id);
                if (galleryItem) {
                    showCaptionForm(galleryItem);
                }
            });
        });
        
        galleryContainer.querySelectorAll('.delete-image-btn[data-action="delete-image"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                showDeleteConfirmation('gallery', id);
            });
        });
        
    } catch (error) {
        console.error('Error loading gallery:', error);
        galleryContainer.innerHTML = '<p class="error">Failed to load gallery. Please try again later.</p>';
    }
}

// Show gallery form
function showGalleryForm() {
    // Reset form
    galleryForm.reset();
    
    // Show form
    galleryFormContainer.style.display = 'block';
    galleryFormContainer.scrollIntoView({ behavior: 'smooth' });
}

// Show caption form
function showCaptionForm(galleryItem) {
    // Reset form
    captionForm.reset();
    
    // Fill form with gallery item data
    document.getElementById('caption-gallery-id').value = galleryItem._id;
    document.getElementById('caption-text').value = galleryItem.caption || '';
    
    // Show form
    captionFormContainer.style.display = 'block';
    captionFormContainer.scrollIntoView({ behavior: 'smooth' });
}

// Handle gallery form submission
async function handleGallerySubmit(e) {
    e.preventDefault();
    
    const imageFile = document.getElementById('gallery-image').files[0];
    const caption = document.getElementById('gallery-caption').value;
    
    if (!imageFile) {
        alert('Please select an image to upload.');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('caption', caption);
        
        await api.gallery.upload(formData);
        
        // Hide form and reload gallery
        galleryFormContainer.style.display = 'none';
        loadGallery();
    } catch (error) {
        alert('Error uploading image: ' + (error.message || 'Unknown error'));
    }
}

// Handle caption form submission
async function handleCaptionSubmit(e) {
    e.preventDefault();
    
    const galleryId = document.getElementById('caption-gallery-id').value;
    const caption = document.getElementById('caption-text').value;
    
    try {
        await api.gallery.updateCaption(galleryId, caption);
        
        // Hide form and reload gallery
        captionFormContainer.style.display = 'none';
        loadGallery();
    } catch (error) {
        alert('Error updating caption: ' + (error.message || 'Unknown error'));
    }
}

// Load settings
async function loadSettings() {
    try {
        settingsContainer.innerHTML = '<div class="loading">Loading settings...</div>';
        
        const settings = await api.settings.getAll();
        
        if (!settings || settings.length === 0) {
            settingsContainer.innerHTML = '<p class="no-data">No settings found.</p>';
            return;
        }
        
        // Convert settings array to object for easier access
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });
        
        // Fill settings form
        document.getElementById('site-title').value = settingsObj.siteTitle || '';
        document.getElementById('event-date-setting').value = settingsObj.eventDate || '';
        document.getElementById('event-location-setting').value = settingsObj.eventLocation || '';
        document.getElementById('primary-color').value = settingsObj.primaryColor || '#d4af37';
        document.getElementById('secondary-color').value = settingsObj.secondaryColor || '#121212';
        
        // Show settings form
        settingsContainer.innerHTML = '<p>Update website settings below:</p>';
    } catch (error) {
        console.error('Error loading settings:', error);
        settingsContainer.innerHTML = '<p class="error">Failed to load settings. Please try again later.</p>';
    }
}

// Handle settings form submission
async function handleSettingsSubmit(e) {
    e.preventDefault();
    
    const settings = {
        siteTitle: document.getElementById('site-title').value,
        eventDate: document.getElementById('event-date-setting').value,
        eventLocation: document.getElementById('event-location-setting').value,
        primaryColor: document.getElementById('primary-color').value,
        secondaryColor: document.getElementById('secondary-color').value
    };
    
    try {
        // Update each setting
        for (const [key, value] of Object.entries(settings)) {
            await api.settings.update(key, value);
        }
        
        alert('Settings saved successfully!');
    } catch (error) {
        alert('Error saving settings: ' + (error.message || 'Unknown error'));
    }
}

// Show delete confirmation modal
function showDeleteConfirmation(type, id) {
    currentDeleteItem = { type, id };
    confirmationModal.classList.add('active');
}

// Handle confirm delete
async function handleConfirmDelete() {
    const { type, id } = currentDeleteItem;
    
    try {
        switch (type) {
            case 'event':
                await api.events.delete(id);
                loadEvents();
                break;
            case 'contact':
                await api.contacts.delete(id);
                loadContacts();
                break;
            case 'reminder':
                await api.reminders.delete(id);
                loadReminders();
                break;
            case 'note':
                await api.notes.delete(id);
                loadNotes();
                break;
            case 'gallery':
                await api.gallery.delete(id);
                loadGallery();
                break;
        }
        
        confirmationModal.classList.remove('active');
    } catch (error) {
        alert('Error deleting item: ' + (error.message || 'Unknown error'));
    }
}

// Handle cancel form
function handleCancelForm() {
    // Hide all form containers
    eventFormContainer.style.display = 'none';
    contactFormContainer.style.display = 'none';
    reminderFormContainer.style.display = 'none';
    noteFormContainer.style.display = 'none';
    galleryFormContainer.style.display = 'none';
    captionFormContainer.style.display = 'none';
}
