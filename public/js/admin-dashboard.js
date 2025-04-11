// Admin dashboard JavaScript with real API integration
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        // Redirect to login page if not logged in
        window.location.href = '/admin-login.html';
        return;
    }
    
    // Setup navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target section
            const targetId = this.getAttribute('data-target');
            
            // Hide all sections
            contentSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show target section
            document.getElementById(targetId).style.display = 'block';
            
            // Update active nav link
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            this.classList.add('active');
        });
    });
    
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear login status
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminLoggedIn');
            
            // Redirect to login page
            window.location.href = '/admin-login.html';
        });
    }
    
    // Load data from API
    loadEvents();
    loadContacts();
    loadReminders();
    loadNotes();
    loadGallery();
    loadFooter();
    loadSettings();
    updateDashboardStats();
    
    // Setup add buttons
    setupAddButtons();
    
    // Setup form submissions
    setupFormSubmissions();
    
    // Show dashboard section by default
    document.getElementById('dashboardSection').style.display = 'block';
    document.querySelector('.nav-link[data-target="dashboardSection"]').classList.add('active');
});

// Update dashboard stats
function updateDashboardStats() {
    // Fetch counts from API
    Promise.all([
        fetch('/api/events').then(res => res.json()),
        fetch('/api/contacts').then(res => res.json()),
        fetch('/api/reminders').then(res => res.json()),
        fetch('/api/notes').then(res => res.json()),
        fetch('/api/gallery').then(res => res.json())
    ])
    .then(([events, contacts, reminders, notes, gallery]) => {
        document.getElementById('eventCount').textContent = events.length;
        document.getElementById('contactCount').textContent = contacts.length;
        document.getElementById('reminderCount').textContent = reminders.length;
        document.getElementById('noteCount').textContent = notes.length;
        
        // Check if galleryCount element exists
        const galleryCountElement = document.getElementById('galleryCount');
        if (galleryCountElement) {
            galleryCountElement.textContent = gallery.length;
        }
    })
    .catch(error => {
        console.error('Error updating dashboard stats:', error);
        showErrorMessage('Failed to load dashboard statistics');
    });
}

// Load events from API
function loadEvents() {
    const eventsTable = document.getElementById('eventsTable');
    if (!eventsTable) return;
    
    const eventsTableBody = eventsTable.querySelector('tbody');
    eventsTableBody.innerHTML = '<tr><td colspan="5" class="loading-message">Loading events...</td></tr>';
    
    fetch('/api/events')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load events');
            }
            return response.json();
        })
        .then(events => {
            eventsTableBody.innerHTML = '';
            
            if (events.length === 0) {
                eventsTableBody.innerHTML = '<tr><td colspan="5" class="empty-message">No events found. Add your first event!</td></tr>';
                return;
            }
            
            events.forEach(event => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${event.title}</td>
                    <td>${event.date}</td>
                    <td>${event.startTime} - ${event.endTime}</td>
                    <td>${event.location}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-event" data-id="${event._id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-event" data-id="${event._id}">Delete</button>
                    </td>
                `;
                eventsTableBody.appendChild(row);
            });
            
            // Add event listeners for edit buttons
            document.querySelectorAll('.edit-event').forEach(button => {
                button.addEventListener('click', function() {
                    const eventId = this.getAttribute('data-id');
                    
                    // Show loading in modal
                    const modal = document.getElementById('eventModal');
                    modal.style.display = 'block';
                    
                    const modalContent = modal.querySelector('.modal-content');
                    modalContent.innerHTML = '<div class="loading">Loading event data...</div>';
                    
                    // Fetch event data
                    fetch(`/api/events/${eventId}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to load event');
                            }
                            return response.json();
                        })
                        .then(event => {
                            // Restore modal content
                            modalContent.innerHTML = `
                                <div class="modal-header">
                                    <h3 class="modal-title">Edit Event</h3>
                                    <span class="close-modal">&times;</span>
                                </div>
                                <form id="eventForm">
                                    <input type="hidden" id="eventId" value="${event._id}">
                                    <div class="form-group">
                                        <label for="eventTitle">Title</label>
                                        <input type="text" id="eventTitle" class="form-control" value="${event.title}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="eventDate">Date</label>
                                        <input type="date" id="eventDate" class="form-control" value="${event.date}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="eventStartTime">Start Time</label>
                                        <input type="time" id="eventStartTime" class="form-control" value="${event.startTime}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="eventEndTime">End Time</label>
                                        <input type="time" id="eventEndTime" class="form-control" value="${event.endTime}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="eventLocation">Location</label>
                                        <input type="text" id="eventLocation" class="form-control" value="${event.location}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="eventDescription">Description</label>
                                        <textarea id="eventDescription" class="form-control" rows="2">${event.description || ''}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="eventDressCode">Dress Code</label>
                                        <input type="text" id="eventDressCode" class="form-control" value="${event.dressCode || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="eventMapUrl">Map URL</label>
                                        <input type="url" id="eventMapUrl" class="form-control" value="${event.mapUrl || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="eventWebsiteUrl">Website URL</label>
                                        <input type="url" id="eventWebsiteUrl" class="form-control" value="${event.websiteUrl || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="eventNotes">Notes</label>
                                        <textarea id="eventNotes" class="form-control" rows="3">${event.notes || ''}</textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button type="button" class="btn close-modal">Cancel</button>
                                        <button type="submit" class="btn">Save</button>
                                    </div>
                                </form>
                            `;
                            
                            // Set form action
                            document.getElementById('eventForm').setAttribute('data-action', 'edit');
                            
                            // Setup close modal functionality
                            setupModalClose();
                            
                            // Setup form submission
                            document.getElementById('eventForm').addEventListener('submit', handleEventFormSubmit);
                        })
                        .catch(error => {
                            console.error('Error loading event:', error);
                            modalContent.innerHTML = `
                                <div class="modal-header">
                                    <h3 class="modal-title">Error</h3>
                                    <span class="close-modal">&times;</span>
                                </div>
                                <div class="modal-body">
                                    <p>Failed to load event data. Please try again.</p>
                                </div>
                                <div class="modal-footer">
                                    <button class="btn close-modal">Close</button>
                                </div>
                            `;
                            
                            // Setup close modal functionality
                            setupModalClose();
                        });
                });
            });
            
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-event').forEach(button => {
                button.addEventListener('click', function() {
                    const eventId = this.getAttribute('data-id');
                    
                    if (confirm('Are you sure you want to delete this event?')) {
                        // Get token from localStorage
                        const token = localStorage.getItem('adminToken');
                        
                        fetch(`/api/events/${eventId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to delete event');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Reload events table
                            loadEvents();
                            
                            // Update dashboard stats
                            updateDashboardStats();
                            
                            // Show success message
                            showSuccessMessage('Event deleted successfully!');
                        })
                        .catch(error => {
                            console.error('Error deleting event:', error);
                            showErrorMessage('Failed to delete event. Please try again.');
                        });
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading events:', error);
            eventsTableBody.innerHTML = '<tr><td colspan="5" class="error-message">Failed to load events. Please refresh the page to try again.</td></tr>';
        });
}

// Handle event form submission
function handleEventFormSubmit(e) {
    e.preventDefault();
    
    const form = this;
    const action = form.getAttribute('data-action');
    const eventId = document.getElementById('eventId').value;
    const token = localStorage.getItem('adminToken');
    
    // Get form data
    const eventDate = document.getElementById('eventDate').value;
    
    const eventData = {
        title: document.getElementById('eventTitle').value,
        date: eventDate, // Keep the original date format (YYYY-MM-DD)
        startTime: document.getElementById('eventStartTime').value,
        endTime: document.getElementById('eventEndTime').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        dressCode: document.getElementById('eventDressCode').value,
        mapUrl: document.getElementById('eventMapUrl').value,
        websiteUrl: document.getElementById('eventWebsiteUrl').value,
        notes: document.getElementById('eventNotes').value
    };
    
    // Add day property using the date to determine which day it belongs to
    // Extract just the day part (e.g., "2025-04-24" -> "24")
    const dayNumber = new Date(eventDate).getDate();
    
    // Map day numbers to specific event days
    if (dayNumber === 24) {
        eventData.day = "April 24, 2025";
    } else if (dayNumber === 25) {
        eventData.day = "April 25, 2025";
    } else if (dayNumber === 26) {
        eventData.day = "April 26, 2025";
    } else if (dayNumber === 27) {
        eventData.day = "April 27, 2025";
    } else {
        // Fallback for any other dates
        eventData.day = formatDateForDisplay(eventDate);
    }
    
    // Disable form submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;
    
    let url = '/api/events';
    let method = 'POST';
    
    if (action === 'edit') {
        url = `/api/events/${eventId}`;
        method = 'PUT';
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to ${action} event`);
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        document.getElementById('eventModal').style.display = 'none';
        
        // Reload events table
        loadEvents();
        
        // Update dashboard stats
        updateDashboardStats();
        
        // Show success message
        showSuccessMessage(`Event ${action === 'edit' ? 'updated' : 'added'} successfully!`);
    })
    .catch(error => {
        console.error(`Error ${action} event:`, error);
        showErrorMessage(`Failed to ${action} event. Please try again.`);
        
        // Reset button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    });
}

// Load contacts from API
function loadContacts() {
    const contactsTable = document.getElementById('contactsTable');
    if (!contactsTable) return;
    
    const contactsTableBody = contactsTable.querySelector('tbody');
    contactsTableBody.innerHTML = '<tr><td colspan="5" class="loading-message">Loading contacts...</td></tr>';
    
    fetch('/api/contacts')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load contacts');
            }
            return response.json();
        })
        .then(contacts => {
            contactsTableBody.innerHTML = '';
            
            if (contacts.length === 0) {
                contactsTableBody.innerHTML = '<tr><td colspan="5" class="empty-message">No contacts found. Add your first contact!</td></tr>';
                return;
            }
            
            contacts.forEach(contact => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${contact.name}</td>
                    <td>${contact.email}</td>
                    <td>${contact.phone}</td>
                    <td>${contact.type || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-contact" data-id="${contact._id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-contact" data-id="${contact._id}">Delete</button>
                    </td>
                `;
                contactsTableBody.appendChild(row);
            });
            
            // Add event listeners for edit buttons
            document.querySelectorAll('.edit-contact').forEach(button => {
                button.addEventListener('click', function() {
                    const contactId = this.getAttribute('data-id');
                    
                    // Show loading in modal
                    const modal = document.getElementById('contactModal');
                    modal.style.display = 'block';
                    
                    const modalContent = modal.querySelector('.modal-content');
                    modalContent.innerHTML = '<div class="loading">Loading contact data...</div>';
                    
                    // Fetch contact data
                    fetch(`/api/contacts/${contactId}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to load contact');
                            }
                            return response.json();
                        })
                        .then(contact => {
                            // Restore modal content
                            modalContent.innerHTML = `
                                <div class="modal-header">
                                    <h3 class="modal-title">Edit Contact</h3>
                                    <span class="close-modal">&times;</span>
                                </div>
                                <form id="contactForm">
                                    <input type="hidden" id="contactId" value="${contact._id}">
                                    <div class="form-group">
                                        <label for="contactName">Name</label>
                                        <input type="text" id="contactName" class="form-control" value="${contact.name}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="contactEmail">Email</label>
                                        <input type="email" id="contactEmail" class="form-control" value="${contact.email}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="contactPhone">Phone</label>
                                        <input type="tel" id="contactPhone" class="form-control" value="${contact.phone}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="contactType">Type</label>
                                        <input type="text" id="contactType" class="form-control" value="${contact.type || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="contactDescription">Description</label>
                                        <textarea id="contactDescription" class="form-control" rows="3">${contact.description || ''}</textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button type="button" class="btn close-modal">Cancel</button>
                                        <button type="submit" class="btn">Save</button>
                                    </div>
                                </form>
                            `;
                            
                            // Set form action
                            document.getElementById('contactForm').setAttribute('data-action', 'edit');
                            
                            // Setup close modal functionality
                            setupModalClose();
                            
                            // Setup form submission
                            document.getElementById('contactForm').addEventListener('submit', handleContactFormSubmit);
                        })
                        .catch(error => {
                            console.error('Error loading contact:', error);
                            modalContent.innerHTML = `
                                <div class="modal-header">
                                    <h3 class="modal-title">Error</h3>
                                    <span class="close-modal">&times;</span>
                                </div>
                                <div class="modal-body">
                                    <p>Failed to load contact data. Please try again.</p>
                                </div>
                                <div class="modal-footer">
                                    <button class="btn close-modal">Close</button>
                                </div>
                            `;
                            
                            // Setup close modal functionality
                            setupModalClose();
                        });
                });
            });
            
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-contact').forEach(button => {
                button.addEventListener('click', function() {
                    const contactId = this.getAttribute('data-id');
                    
                    if (confirm('Are you sure you want to delete this contact?')) {
                        // Get token from localStorage
                        const token = localStorage.getItem('adminToken');
                        
                        fetch(`/api/contacts/${contactId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to delete contact');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Reload contacts table
                            loadContacts();
                            
                            // Update dashboard stats
                            updateDashboardStats();
                            
                            // Show success message
                            showSuccessMessage('Contact deleted successfully!');
                        })
                        .catch(error => {
                            console.error('Error deleting contact:', error);
                            showErrorMessage('Failed to delete contact. Please try again.');
                        });
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading contacts:', error);
            contactsTableBody.innerHTML = '<tr><td colspan="5" class="error-message">Failed to load contacts. Please refresh the page to try again.</td></tr>';
        });
}

// Handle contact form submission
function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const form = this;
    const action = form.getAttribute('data-action');
    const contactId = document.getElementById('contactId').value;
    const token = localStorage.getItem('adminToken');
    
    // Get form data
    const contactData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        type: document.getElementById('contactType').value,
        description: document.getElementById('contactDescription').value
    };
    
    // Disable form submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;
    
    let url = '/api/contacts';
    let method = 'POST';
    
    if (action === 'edit') {
        url = `/api/contacts/${contactId}`;
        method = 'PUT';
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contactData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to ${action} contact`);
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        document.getElementById('contactModal').style.display = 'none';
        
        // Reload contacts table
        loadContacts();
        
        // Update dashboard stats
        updateDashboardStats();
        
        // Show success message
        showSuccessMessage(`Contact ${action === 'edit' ? 'updated' : 'added'} successfully!`);
    })
    .catch(error => {
        console.error(`Error ${action} contact:`, error);
        showErrorMessage(`Failed to ${action} contact. Please try again.`);
        
        // Reset button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    });
}

// Load reminders from API
function loadReminders() {
    const remindersTable = document.getElementById('remindersTable');
    if (!remindersTable) return;
    
    const remindersTableBody = remindersTable.querySelector('tbody');
    remindersTableBody.innerHTML = '<tr><td colspan="4" class="loading-message">Loading reminders...</td></tr>';
    
    fetch('/api/reminders')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load reminders');
            }
            return response.json();
        })
        .then(reminders => {
            remindersTableBody.innerHTML = '';
            
            if (reminders.length === 0) {
                remindersTableBody.innerHTML = '<tr><td colspan="4" class="empty-message">No reminders found. Add your first reminder!</td></tr>';
                return;
            }
            
            reminders.forEach(reminder => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reminder.title}</td>
                    <td>${reminder.date}</td>
                    <td>${reminder.description}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-reminder" data-id="${reminder._id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-reminder" data-id="${reminder._id}">Delete</button>
                    </td>
                `;
                remindersTableBody.appendChild(row);
            });
            
            // Add event listeners for edit buttons
            document.querySelectorAll('.edit-reminder').forEach(button => {
                button.addEventListener('click', function() {
                    const reminderId = this.getAttribute('data-id');
                    
                    // Show loading in modal
                    const modal = document.getElementById('reminderModal');
                    modal.style.display = 'block';
                    
                    const modalContent = modal.querySelector('.modal-content');
                    modalContent.innerHTML = '<div class="loading">Loading reminder data...</div>';
                    
                    // Fetch reminder data
                    fetch(`/api/reminders/${reminderId}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to load reminder');
                            }
                            return response.json();
                        })
                        .then(reminder => {
                            // Restore modal content
                            modalContent.innerHTML = `
                                <div class="modal-header">
                                    <h3 class="modal-title">Edit Reminder</h3>
                                    <span class="close-modal">&times;</span>
                                </div>
                                <form id="reminderForm">
                                    <input type="hidden" id="reminderId" value="${reminder._id}">
                                    <div class="form-group">
                                        <label for="reminderTitle">Title</label>
                                        <input type="text" id="reminderTitle" class="form-control" value="${reminder.title}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="reminderDate">Date</label>
                                        <input type="date" id="reminderDate" class="form-control" value="${reminder.date}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="reminderDescription">Description</label>
                                        <textarea id="reminderDescription" class="form-control" rows="3">${reminder.description}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="reminderIcon">Icon</label>
                                        <select id="reminderIcon" class="form-control">
                                            <option value="fa-calendar" ${reminder.icon === 'fa-calendar' ? 'selected' : ''}>Calendar</option>
                                            <option value="fa-clock" ${reminder.icon === 'fa-clock' ? 'selected' : ''}>Clock</option>
                                            <option value="fa-exclamation-circle" ${reminder.icon === 'fa-exclamation-circle' ? 'selected' : ''}>Alert</option>
                                            <option value="fa-info-circle" ${reminder.icon === 'fa-info-circle' ? 'selected' : ''}>Info</option>
                                            <option value="fa-map-marker-alt" ${reminder.icon === 'fa-map-marker-alt' ? 'selected' : ''}>Location</option>
                                            <option value="fa-plane" ${reminder.icon === 'fa-plane' ? 'selected' : ''}>Travel</option>
                                            <option value="fa-utensils" ${reminder.icon === 'fa-utensils' ? 'selected' : ''}>Food</option>
                                            <option value="fa-hotel" ${reminder.icon === 'fa-hotel' ? 'selected' : ''}>Hotel</option>
                                        </select>
                                    </div>
                                    <div class="form-actions">
                                        <button type="button" class="btn close-modal">Cancel</button>
                                        <button type="submit" class="btn">Save</button>
                                    </div>
                                </form>
                            `;
                            
                            // Set form action
                            document.getElementById('reminderForm').setAttribute('data-action', 'edit');
                            
                            // Setup close modal functionality
                            setupModalClose();
                            
                            // Setup form submission
                            document.getElementById('reminderForm').addEventListener('submit', handleReminderFormSubmit);
                        })
                        .catch(error => {
                            console.error('Error loading reminder:', error);
                            modalContent.innerHTML = `
                                <div class="modal-header">
                                    <h3 class="modal-title">Error</h3>
                                    <span class="close-modal">&times;</span>
                                </div>
                                <div class="modal-body">
                                    <p>Failed to load reminder data. Please try again.</p>
                                </div>
                                <div class="modal-footer">
                                    <button class="btn close-modal">Close</button>
                                </div>
                            `;
                            
                            // Setup close modal functionality
                            setupModalClose();
                        });
                });
            });
            
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-reminder').forEach(button => {
                button.addEventListener('click', function() {
                    const reminderId = this.getAttribute('data-id');
                    
                    if (confirm('Are you sure you want to delete this reminder?')) {
                        // Get token from localStorage
                        const token = localStorage.getItem('adminToken');
                        
                        fetch(`/api/reminders/${reminderId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to delete reminder');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Reload reminders table
                            loadReminders();
                            
                            // Update dashboard stats
                            updateDashboardStats();
                            
                            // Show success message
                            showSuccessMessage('Reminder deleted successfully!');
                        })
                        .catch(error => {
                            console.error('Error deleting reminder:', error);
                            showErrorMessage('Failed to delete reminder. Please try again.');
                        });
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading reminders:', error);
            remindersTableBody.innerHTML = '<tr><td colspan="4" class="error-message">Failed to load reminders. Please refresh the page to try again.</td></tr>';
        });
}

// Handle reminder form submission
function handleReminderFormSubmit(e) {
    e.preventDefault();
    
    const form = this;
    const action = form.getAttribute('data-action');
    const reminderId = document.getElementById('reminderId').value;
    const token = localStorage.getItem('adminToken');
    
    // Get form data
    const reminderData = {
        title: document.getElementById('reminderTitle').value,
        date: document.getElementById('reminderDate').value,
        description: document.getElementById('reminderDescription').value,
        icon: document.getElementById('reminderIcon').value
    };
    
    // Disable form submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;
    
    let url = '/api/reminders';
    let method = 'POST';
    
    if (action === 'edit') {
        url = `/api/reminders/${reminderId}`;
        method = 'PUT';
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reminderData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to ${action} reminder`);
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        document.getElementById('reminderModal').style.display = 'none';
        
        // Reload reminders table
        loadReminders();
        
        // Update dashboard stats
        updateDashboardStats();
        
        // Show success message
        showSuccessMessage(`Reminder ${action === 'edit' ? 'updated' : 'added'} successfully!`);
    })
    .catch(error => {
        console.error(`Error ${action} reminder:`, error);
        showErrorMessage(`Failed to ${action} reminder. Please try again.`);
        
        // Reset button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    });
}

// Load notes from API
function loadNotes() {
    const notesTable = document.getElementById('notesTable');
    if (!notesTable) return;
    
    const notesTableBody = notesTable.querySelector('tbody');
    notesTableBody.innerHTML = '<tr><td colspan="4" class="loading-message">Loading notes...</td></tr>';
    
    fetch('/api/notes')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load notes');
            }
            return response.json();
        })
        .then(notes => {
            notesTableBody.innerHTML = '';
            
            if (notes.length === 0) {
                notesTableBody.innerHTML = '<tr><td colspan="4" class="empty-message">No notes found. Add your first note!</td></tr>';
                return;
            }
            
            notes.forEach(note => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${note.title}</td>
                    <td>${note.content}</td>
                    <td>${note.displayLocation || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-note" data-id="${note._id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-note" data-id="${note._id}">Delete</button>
                    </td>
                `;
                notesTableBody.appendChild(row);
            });
            
            // Add event listeners for edit buttons
            document.querySelectorAll('.edit-note').forEach(button => {
                button.addEventListener('click', function() {
                    const noteId = this.getAttribute('data-id');
                    
                    // Show loading in modal
                    const modal = document.getElementById('noteModal');
                    modal.style.display = 'block';
                    
                    const modalContent = modal.querySelector('.modal-content');
                    modalContent.innerHTML = '<div class="loading">Loading note data...</div>';
                    
                    // Fetch note data
                    fetch(`/api/notes/${noteId}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to load note');
                            }
                            return response.json();
                        })
                        .then(note => {
                            // Restore modal content
                            modalContent.innerHTML = `
                                <div class="modal-header">
                                    <h3 class="modal-title">Edit Note</h3>
                                    <span class="close-modal">&times;</span>
                                </div>
                                <form id="noteForm">
                                    <input type="hidden" id="noteId" value="${note._id}">
                                    <div class="form-group">
                                        <label for="noteTitle">Title</label>
                                        <input type="text" id="noteTitle" class="form-control" value="${note.title}" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="noteContent">Content</label>
                                        <textarea id="noteContent" class="form-control" rows="4" required>${note.content}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="noteDisplayLocation">Display Location</label>
                                        <select id="noteDisplayLocation" class="form-control">
                                            <option value="Home Page" ${note.displayLocation === 'Home Page' ? 'selected' : ''}>Home Page</option>
                                            <option value="Schedule Page" ${note.displayLocation === 'Schedule Page' ? 'selected' : ''}>Schedule Page</option>
                                            <option value="Gallery Page" ${note.displayLocation === 'Gallery Page' ? 'selected' : ''}>Gallery Page</option>
                                            <option value="Reminders Page" ${note.displayLocation === 'Reminders Page' ? 'selected' : ''}>Reminders Page</option>
                                            <option value="Contacts Page" ${note.displayLocation === 'Contacts Page' ? 'selected' : ''}>Contacts Page</option>
                                        </select>
                                    </div>
                                    <div class="form-actions">
                                        <button type="button" class="btn close-modal">Cancel</button>
                                        <button type="submit" class="btn">Save</button>
                                    </div>
                                </form>
                            `;
                            
                            // Set form action
                            document.getElementById('noteForm').setAttribute('data-action', 'edit');
                            
                            // Setup close modal functionality
                            setupModalClose();
                            
                            // Setup form submission
                            document.getElementById('noteForm').addEventListener('submit', handleNoteFormSubmit);
                        })
                        .catch(error => {
                            console.error('Error loading note:', error);
                            modalContent.innerHTML = `
                                <div class="modal-header">
                                    <h3 class="modal-title">Error</h3>
                                    <span class="close-modal">&times;</span>
                                </div>
                                <div class="modal-body">
                                    <p>Failed to load note data. Please try again.</p>
                                </div>
                                <div class="modal-footer">
                                    <button class="btn close-modal">Close</button>
                                </div>
                            `;
                            
                            // Setup close modal functionality
                            setupModalClose();
                        });
                });
            });
            
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-note').forEach(button => {
                button.addEventListener('click', function() {
                    const noteId = this.getAttribute('data-id');
                    
                    if (confirm('Are you sure you want to delete this note?')) {
                        // Get token from localStorage
                        const token = localStorage.getItem('adminToken');
                        
                        fetch(`/api/notes/${noteId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to delete note');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Reload notes table
                            loadNotes();
                            
                            // Update dashboard stats
                            updateDashboardStats();
                            
                            // Show success message
                            showSuccessMessage('Note deleted successfully!');
                        })
                        .catch(error => {
                            console.error('Error deleting note:', error);
                            showErrorMessage('Failed to delete note. Please try again.');
                        });
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading notes:', error);
            notesTableBody.innerHTML = '<tr><td colspan="4" class="error-message">Failed to load notes. Please refresh the page to try again.</td></tr>';
        });
}

// Handle note form submission
function handleNoteFormSubmit(e) {
    e.preventDefault();
    
    const form = this;
    const action = form.getAttribute('data-action');
    const noteId = document.getElementById('noteId').value;
    const token = localStorage.getItem('adminToken');
    
    // Get form data
    const noteData = {
        title: document.getElementById('noteTitle').value,
        content: document.getElementById('noteContent').value,
        displayLocation: document.getElementById('noteDisplayLocation').value
    };
    
    // Disable form submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;
    
    let url = '/api/notes';
    let method = 'POST';
    
    if (action === 'edit') {
        url = `/api/notes/${noteId}`;
        method = 'PUT';
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noteData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to ${action} note`);
        }
        return response.json();
    })
    .then(data => {
        // Close modal
        document.getElementById('noteModal').style.display = 'none';
        
        // Reload notes table
        loadNotes();
        
        // Update dashboard stats
        updateDashboardStats();
        
        // Show success message
        showSuccessMessage(`Note ${action === 'edit' ? 'updated' : 'added'} successfully!`);
    })
    .catch(error => {
        console.error(`Error ${action} note:`, error);
        showErrorMessage(`Failed to ${action} note. Please try again.`);
        
        // Reset button
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    });
}

// Load gallery from API
function loadGallery() {
    const adminGallery = document.getElementById('adminGallery');
    if (!adminGallery) return;
    
    adminGallery.innerHTML = '<div class="loading-message">Loading gallery...</div>';
    
    fetch('/api/gallery')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load gallery');
            }
            return response.json();
        })
        .then(gallery => {
            adminGallery.innerHTML = '';
            
            if (gallery.length === 0) {
                adminGallery.innerHTML = '<p class="empty-message">No images yet. Upload some images to get started.</p>';
                return;
            }
            
            gallery.forEach(image => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'admin-gallery-item';
                
                galleryItem.innerHTML = `
                    <div class="gallery-image-container">
                        <img src="${image.path}" alt="${image.description}" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Error'">
                    </div>
                    <div class="gallery-image-info">
                        <p>${image.description}</p>
                        <div class="gallery-image-actions">
                            <button class="btn btn-sm btn-danger delete-gallery-image" data-id="${image._id}">Delete</button>
                        </div>
                    </div>
                `;
                
                adminGallery.appendChild(galleryItem);
            });
            
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-gallery-image').forEach(button => {
                button.addEventListener('click', function() {
                    const imageId = this.getAttribute('data-id');
                    
                    if (confirm('Are you sure you want to delete this image?')) {
                        // Get token from localStorage
                        const token = localStorage.getItem('adminToken');
                        
                        fetch(`/api/gallery/${imageId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to delete image');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Reload gallery
                            loadGallery();
                            
                            // Update dashboard stats
                            updateDashboardStats();
                            
                            // Show success message
                            showSuccessMessage('Image deleted successfully!');
                        })
                        .catch(error => {
                            console.error('Error deleting image:', error);
                            showErrorMessage('Failed to delete image. Please try again.');
                        });
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading gallery:', error);
            adminGallery.innerHTML = '<div class="error-message">Failed to load gallery. Please refresh the page to try again.</div>';
        });
        
    // Setup gallery upload form
    const galleryUploadForm = document.getElementById('galleryUploadForm');
    if (galleryUploadForm) {
        galleryUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('galleryImage');
            const description = document.getElementById('imageDescription').value || 'Gallery Image';
            
            if (!fileInput.files || fileInput.files.length === 0) {
                showErrorMessage('Please select an image to upload.');
                return;
            }
            
            const file = fileInput.files[0];
            
            // Create form data
            const formData = new FormData();
            formData.append('image', file);
            formData.append('description', description);
            
            // Get token from localStorage
            const token = localStorage.getItem('adminToken');
            
            // Disable form submission
            const submitButton = galleryUploadForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Uploading...';
            submitButton.disabled = true;
            
            fetch('/api/gallery/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }
                return response.json();
            })
            .then(data => {
                // Reset form
                galleryUploadForm.reset();
                
                // Reload gallery
                loadGallery();
                
                // Update dashboard stats
                updateDashboardStats();
                
                // Show success message
                showSuccessMessage('Image uploaded successfully!');
                
                // Reset button
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            })
            .catch(error => {
                console.error('Error uploading image:', error);
                showErrorMessage('Failed to upload image. Please try again.');
                
                // Reset button
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }
}

// Load footer from API
function loadFooter() {
    const footerForm = document.getElementById('footerForm');
    if (!footerForm) return;
    
    // Show loading state
    footerForm.innerHTML = '<div class="loading-message">Loading footer data...</div>';
    
    fetch('/api/footer')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load footer');
            }
            return response.json();
        })
        .then(footer => {
            // Restore form
            footerForm.innerHTML = `
                <div class="form-group">
                    <label for="footerTitle">Footer Title</label>
                    <input type="text" id="footerTitle" class="form-control" value="${footer.title}">
                </div>
                <div class="form-group">
                    <label for="footerText">Footer Text</label>
                    <textarea id="footerText" class="form-control" rows="3">${footer.text}</textarea>
                </div>
                <div class="form-group">
                    <label for="footerCopyright">Copyright Text</label>
                    <input type="text" id="footerCopyright" class="form-control" value="${footer.copyright}">
                </div>
                <button type="submit" class="btn">Save Changes</button>
            `;
            
            // Add event listener for form submission
            footerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const token = localStorage.getItem('adminToken');
                
                const footerData = {
                    title: document.getElementById('footerTitle').value,
                    text: document.getElementById('footerText').value,
                    copyright: document.getElementById('footerCopyright').value
                };
                
                // Disable form submission
                const submitButton = footerForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.textContent = 'Saving...';
                submitButton.disabled = true;
                
                fetch('/api/footer', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(footerData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update footer');
                    }
                    return response.json();
                })
                .then(data => {
                    // Show success message
                    showSuccessMessage('Footer updated successfully!');
                    
                    // Reset button
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                })
                .catch(error => {
                    console.error('Error updating footer:', error);
                    showErrorMessage('Failed to update footer. Please try again.');
                    
                    // Reset button
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                });
            });
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            footerForm.innerHTML = '<div class="error-message">Failed to load footer data. Please refresh the page to try again.</div>';
        });
}

// Load settings from API
function loadSettings() {
    const settingsForm = document.getElementById('settingsForm');
    if (!settingsForm) return;
    
    // Show loading state
    settingsForm.innerHTML = '<div class="loading-message">Loading settings data...</div>';
    
    fetch('/api/settings')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load settings');
            }
            return response.json();
        })
        .then(settings => {
            // Restore form
            settingsForm.innerHTML = `
                <div class="form-group">
                    <label for="siteTitle">Site Title</label>
                    <input type="text" id="siteTitle" class="form-control" value="${settings.siteTitle}">
                </div>
                <div class="form-group">
                    <label for="eventDate">Event Date</label>
                    <input type="text" id="eventDate" class="form-control" value="${settings.eventDate}">
                </div>
                <div class="form-group">
                    <label for="eventLocation">Event Location</label>
                    <input type="text" id="eventLocation" class="form-control" value="${settings.eventLocation}">
                </div>
                <div class="form-group">
                    <label for="primaryColor">Primary Color</label>
                    <input type="color" id="primaryColor" class="form-control" value="${settings.primaryColor}">
                </div>
                <div class="form-group">
                    <label for="secondaryColor">Secondary Color</label>
                    <input type="color" id="secondaryColor" class="form-control" value="${settings.secondaryColor}">
                </div>
                <button type="submit" class="btn">Save Settings</button>
            `;
            
            // Add event listener for form submission
            settingsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const token = localStorage.getItem('adminToken');
                
                const settingsData = {
                    siteTitle: document.getElementById('siteTitle').value,
                    eventDate: document.getElementById('eventDate').value,
                    eventLocation: document.getElementById('eventLocation').value,
                    primaryColor: document.getElementById('primaryColor').value,
                    secondaryColor: document.getElementById('secondaryColor').value
                };
                
                // Disable form submission
                const submitButton = settingsForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.textContent = 'Saving...';
                submitButton.disabled = true;
                
                fetch('/api/settings', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(settingsData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update settings');
                    }
                    return response.json();
                })
                .then(data => {
                    // Show success message
                    showSuccessMessage('Settings updated successfully!');
                    
                    // Reset button
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                })
                .catch(error => {
                    console.error('Error updating settings:', error);
                    showErrorMessage('Failed to update settings. Please try again.');
                    
                    // Reset button
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                });
            });
        })
        .catch(error => {
            console.error('Error loading settings:', error);
            settingsForm.innerHTML = '<div class="error-message">Failed to load settings data. Please refresh the page to try again.</div>';
        });
}

// Setup add buttons
function setupAddButtons() {
    const addButtons = document.querySelectorAll('.add-button');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-target');
            const modal = document.getElementById(modalId);
            
            if (!modal) return;
            
            // Reset form
            const form = modal.querySelector('form');
            if (!form) return;
            
            form.reset();
            
            // Clear hidden ID field if it exists
            const idField = form.querySelector('input[type="hidden"]');
            if (idField) idField.value = '';
            
            // Set form action
            form.setAttribute('data-action', 'add');
            
            // Set modal title
            const modalTitle = modal.querySelector('.modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Add ' + modalId.replace('Modal', '');
            }
            
            // Show modal
            modal.style.display = 'block';
            
            // Setup form submission
            if (modalId === 'eventModal') {
                form.addEventListener('submit', handleEventFormSubmit);
            } else if (modalId === 'contactModal') {
                form.addEventListener('submit', handleContactFormSubmit);
            } else if (modalId === 'reminderModal') {
                form.addEventListener('submit', handleReminderFormSubmit);
            } else if (modalId === 'noteModal') {
                form.addEventListener('submit', handleNoteFormSubmit);
            }
            
            // Setup close modal functionality
            setupModalClose();
        });
    });
}

// Setup modal close functionality
function setupModalClose() {
    // Setup modal close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Setup form submissions
function setupFormSubmissions() {
    // Gallery upload form submission is handled in loadGallery function
    // Other form submissions are handled in their respective handler functions
}

// Helper function to format date for display (used for UI display only, not for data storage)
function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper function to show success message
function showSuccessMessage(message) {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('successMessage');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'successMessage';
        messageElement.className = 'success-message';
        messageElement.style.position = 'fixed';
        messageElement.style.top = '20px';
        messageElement.style.right = '20px';
        messageElement.style.backgroundColor = 'var(--primary-color)';
        messageElement.style.color = 'var(--secondary-color)';
        messageElement.style.padding = '10px 20px';
        messageElement.style.borderRadius = '5px';
        messageElement.style.zIndex = '1000';
        messageElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        document.body.appendChild(messageElement);
    }
    
    // Set message text
    messageElement.textContent = message;
    
    // Show message
    messageElement.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}

// Helper function to show error message
function showErrorMessage(message) {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('errorMessage');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'errorMessage';
        messageElement.className = 'error-message';
        messageElement.style.position = 'fixed';
        messageElement.style.top = '20px';
        messageElement.style.right = '20px';
        messageElement.style.backgroundColor = '#ff0000';
        messageElement.style.color = '#ffffff';
        messageElement.style.padding = '10px 20px';
        messageElement.style.borderRadius = '5px';
        messageElement.style.zIndex = '1000';
        messageElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        document.body.appendChild(messageElement);
    }
    
    // Set message text
    messageElement.textContent = message;
    
    // Show message
    messageElement.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}
