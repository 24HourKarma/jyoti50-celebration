// Admin Dashboard JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/admin-login.html';
        return;
    }

    // Set up navigation
    setupNavigation();
    
    // Load initial content
    loadEvents();
    
    // Set up event listeners for other tabs
    document.getElementById('contacts-tab').addEventListener('click', loadContacts);
    document.getElementById('reminders-tab').addEventListener('click', loadReminders);
    document.getElementById('notes-tab').addEventListener('click', loadNotes);
    document.getElementById('gallery-tab').addEventListener('click', loadGallery);
    document.getElementById('settings-tab').addEventListener('click', loadSettings);
    
    // Set up logout functionality
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = '/admin-login.html';
    });
});

// Set up navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all nav items
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Add active class to clicked nav item
            this.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show corresponding content section
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).style.display = 'block';
        });
    });
}

// Load events
function loadEvents() {
    const eventsContainer = document.getElementById('events-container');
    eventsContainer.innerHTML = '<div class="loading">Loading events...</div>';
    
    fetch('/api/events', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        return response.json();
    })
    .then(events => {
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
        
        // Clear loading message
        eventsContainer.innerHTML = '';
        
        // Add "Add Event" button
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-primary mb-4';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Add New Event';
        addButton.addEventListener('click', () => showEventModal());
        eventsContainer.appendChild(addButton);
        
        // Add Google Sheets sync button if available
        if (typeof syncWithGoogleSheets === 'function') {
            const syncButton = document.createElement('button');
            syncButton.className = 'btn btn-success mb-4 ml-2';
            syncButton.innerHTML = '<i class="fas fa-sync"></i> Sync with Google Sheets';
            syncButton.addEventListener('click', syncWithGoogleSheets);
            eventsContainer.appendChild(syncButton);
        }
        
        // Create a section for each day
        sortedDays.forEach(day => {
            const dayEvents = eventsByDay[day];
            
            // Create day header
            const dayHeader = document.createElement('h3');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            eventsContainer.appendChild(dayHeader);
            
            // Create table for events
            const table = document.createElement('table');
            table.className = 'table table-striped';
            
            // Create table header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            const headers = ['Title', 'Time', 'Location', 'Actions'];
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Create table body
            const tbody = document.createElement('tbody');
            
            // Sort events by start time
            dayEvents.sort((a, b) => {
                if (a.startTime < b.startTime) return -1;
                if (a.startTime > b.startTime) return 1;
                return 0;
            });
            
            // Add events to table
            dayEvents.forEach(event => {
                const row = document.createElement('tr');
                
                // Title cell
                const titleCell = document.createElement('td');
                titleCell.textContent = event.title;
                row.appendChild(titleCell);
                
                // Time cell
                const timeCell = document.createElement('td');
                if (event.startTime && event.endTime) {
                    timeCell.textContent = `${event.startTime} - ${event.endTime}`;
                } else if (event.startTime) {
                    timeCell.textContent = event.startTime;
                } else {
                    timeCell.textContent = 'All day';
                }
                row.appendChild(timeCell);
                
                // Location cell
                const locationCell = document.createElement('td');
                locationCell.textContent = event.location || 'N/A';
                row.appendChild(locationCell);
                
                // Actions cell
                const actionsCell = document.createElement('td');
                
                // Edit button
                const editButton = document.createElement('button');
                editButton.className = 'btn btn-sm btn-primary mr-2';
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.addEventListener('click', () => showEventModal(event));
                actionsCell.appendChild(editButton);
                
                // Delete button
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-sm btn-danger';
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.addEventListener('click', () => deleteEvent(event._id));
                actionsCell.appendChild(deleteButton);
                
                row.appendChild(actionsCell);
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            eventsContainer.appendChild(table);
        });
        
        // Show message if no events
        if (events.length === 0) {
            const noEventsMessage = document.createElement('div');
            noEventsMessage.className = 'alert alert-info';
            noEventsMessage.textContent = 'No events found. Click "Add New Event" to create one.';
            eventsContainer.appendChild(noEventsMessage);
        }
    })
    .catch(error => {
        console.error('Error loading events:', error);
        eventsContainer.innerHTML = `
            <div class="alert alert-danger">
                Failed to load events. Please try again.
            </div>
        `;
    });
}

// Show event modal for adding or editing an event
function showEventModal(event = null) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Set modal title based on whether we're adding or editing
    const modalTitle = event ? 'Edit Event' : 'Add New Event';
    
    // Create specific date options for April 24-27, 2025
    const dateOptions = [
        { value: '2025-04-24', label: 'April 24, 2025' },
        { value: '2025-04-25', label: 'April 25, 2025' },
        { value: '2025-04-26', label: 'April 26, 2025' },
        { value: '2025-04-27', label: 'April 27, 2025' }
    ];
    
    // Format the event date for the form if editing
    let eventDate = '';
    if (event && event.date) {
        eventDate = event.date;
    } else if (event && event.day) {
        // Extract date from day string (e.g., "April 24, 2025")
        const dayMatch = event.day.match(/April (\d+), 2025/);
        if (dayMatch && dayMatch[1]) {
            const day = dayMatch[1].padStart(2, '0');
            eventDate = `2025-04-${day}`;
        }
    }
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${modalTitle}</h5>
                <button type="button" class="close" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="event-form">
                    <div class="form-group">
                        <label for="event-title">Title</label>
                        <input type="text" class="form-control" id="event-title" value="${event ? event.title : ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="event-date">Date</label>
                        <select class="form-control" id="event-date" required>
                            ${dateOptions.map(option => `
                                <option value="${option.value}" ${eventDate === option.value ? 'selected' : ''}>
                                    ${option.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="event-start-time">Start Time</label>
                            <input type="time" class="form-control" id="event-start-time" value="${event ? event.startTime : ''}">
                        </div>
                        <div class="form-group col-md-6">
                            <label for="event-end-time">End Time</label>
                            <input type="time" class="form-control" id="event-end-time" value="${event ? event.endTime : ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="event-location">Location</label>
                        <input type="text" class="form-control" id="event-location" value="${event ? event.location : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="event-description">Description</label>
                        <textarea class="form-control" id="event-description" rows="3">${event ? event.description : ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="event-dress-code">Dress Code</label>
                        <input type="text" class="form-control" id="event-dress-code" value="${event ? event.dressCode : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="event-map-url">Map URL</label>
                        <input type="url" class="form-control" id="event-map-url" value="${event ? event.mapUrl : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="event-website-url">Website URL</label>
                        <input type="url" class="form-control" id="event-website-url" value="${event ? event.websiteUrl : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="event-notes">Notes</label>
                        <textarea class="form-control" id="event-notes" rows="3">${event ? event.notes : ''}</textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                <button type="button" class="btn btn-primary" id="save-btn">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners to modal buttons
    modal.querySelector('.close').addEventListener('click', closeModal);
    modal.querySelector('#cancel-btn').addEventListener('click', closeModal);
    modal.querySelector('#save-btn').addEventListener('click', () => {
        handleEventFormSubmit(event ? event._id : null);
    });
    
    // Function to close the modal
    function closeModal() {
        document.body.removeChild(modal);
        document.body.removeChild(backdrop);
    }
    
    // Function to handle form submission
    function handleEventFormSubmit(eventId) {
        // Get form values
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const startTime = document.getElementById('event-start-time').value;
        const endTime = document.getElementById('event-end-time').value;
        const location = document.getElementById('event-location').value;
        const description = document.getElementById('event-description').value;
        const dressCode = document.getElementById('event-dress-code').value;
        const mapUrl = document.getElementById('event-map-url').value;
        const websiteUrl = document.getElementById('event-website-url').value;
        const notes = document.getElementById('event-notes').value;
        
        // Validate required fields
        if (!title || !date) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Format day based on the selected date
        const day = formatDateForDisplay(date);
        
        // Create event object
        const eventData = {
            title,
            date,
            day,
            startTime,
            endTime,
            location,
            description,
            dressCode,
            mapUrl,
            websiteUrl,
            notes
        };
        
        // Determine if we're adding or updating
        const method = eventId ? 'PUT' : 'POST';
        const url = eventId ? `/api/events/${eventId}` : '/api/events';
        
        // Send request to API
        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(eventData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save event');
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            closeModal();
            
            // Reload events
            loadEvents();
            
            // Show success message
            showAlert('success', `Event ${eventId ? 'updated' : 'added'} successfully`);
        })
        .catch(error => {
            console.error('Error saving event:', error);
            showAlert('danger', `Failed to ${eventId ? 'update' : 'add'} event`);
        });
    }
}

// Format date for display (YYYY-MM-DD to "April XX, 2025")
function formatDateForDisplay(dateStr) {
    // Check if it's already in the format "April XX, 2025"
    if (/^April \d+, 2025$/.test(dateStr)) {
        return dateStr;
    }
    
    try {
        // Parse the date string
        const [year, month, day] = dateStr.split('-').map(Number);
        
        // Ensure it's April 2025
        if (year === 2025 && month === 4 && day >= 24 && day <= 27) {
            return `April ${day}, 2025`;
        } else {
            // Default to April 24, 2025 if outside range
            return 'April 24, 2025';
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'April 24, 2025';
    }
}

// Delete event
function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete event');
        }
        return response.json();
    })
    .then(data => {
        // Reload events
        loadEvents();
        
        // Show success message
        showAlert('success', 'Event deleted successfully');
    })
    .catch(error => {
        console.error('Error deleting event:', error);
        showAlert('danger', 'Failed to delete event');
    });
}

// Load contacts
function loadContacts() {
    const contactsContainer = document.getElementById('contacts-container');
    contactsContainer.innerHTML = '<div class="loading">Loading contacts...</div>';
    
    fetch('/api/contacts', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch contacts');
        }
        return response.json();
    })
    .then(contacts => {
        // Clear loading message
        contactsContainer.innerHTML = '';
        
        // Add "Add Contact" button
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-primary mb-4';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Add New Contact';
        addButton.addEventListener('click', () => showContactModal());
        contactsContainer.appendChild(addButton);
        
        // Create table for contacts
        const table = document.createElement('table');
        table.className = 'table table-striped';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Name', 'Title/Role', 'Phone', 'Email', 'Type', 'Actions'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Add contacts to table
        contacts.forEach(contact => {
            const row = document.createElement('tr');
            
            // Name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = contact.name;
            row.appendChild(nameCell);
            
            // Title cell
            const titleCell = document.createElement('td');
            titleCell.textContent = contact.title || 'N/A';
            row.appendChild(titleCell);
            
            // Phone cell
            const phoneCell = document.createElement('td');
            phoneCell.textContent = contact.phone || 'N/A';
            row.appendChild(phoneCell);
            
            // Email cell
            const emailCell = document.createElement('td');
            emailCell.textContent = contact.email || 'N/A';
            row.appendChild(emailCell);
            
            // Type cell
            const typeCell = document.createElement('td');
            typeCell.textContent = contact.type || 'N/A';
            row.appendChild(typeCell);
            
            // Actions cell
            const actionsCell = document.createElement('td');
            
            // Edit button
            const editButton = document.createElement('button');
            editButton.className = 'btn btn-sm btn-primary mr-2';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', () => showContactModal(contact));
            actionsCell.appendChild(editButton);
            
            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-sm btn-danger';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.addEventListener('click', () => deleteContact(contact._id));
            actionsCell.appendChild(deleteButton);
            
            row.appendChild(actionsCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        contactsContainer.appendChild(table);
        
        // Show message if no contacts
        if (contacts.length === 0) {
            const noContactsMessage = document.createElement('div');
            noContactsMessage.className = 'alert alert-info';
            noContactsMessage.textContent = 'No contacts found. Click "Add New Contact" to create one.';
            contactsContainer.appendChild(noContactsMessage);
        }
    })
    .catch(error => {
        console.error('Error loading contacts:', error);
        contactsContainer.innerHTML = `
            <div class="alert alert-danger">
                Failed to load contacts. Please try again.
            </div>
        `;
    });
}

// Show contact modal for adding or editing a contact
function showContactModal(contact = null) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Set modal title based on whether we're adding or editing
    const modalTitle = contact ? 'Edit Contact' : 'Add New Contact';
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${modalTitle}</h5>
                <button type="button" class="close" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="contact-form">
                    <div class="form-group">
                        <label for="contact-name">Name</label>
                        <input type="text" class="form-control" id="contact-name" value="${contact ? contact.name : ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="contact-title">Title/Role</label>
                        <input type="text" class="form-control" id="contact-title" value="${contact ? contact.title : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="contact-phone">Phone</label>
                        <input type="tel" class="form-control" id="contact-phone" value="${contact ? contact.phone : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="contact-email">Email</label>
                        <input type="email" class="form-control" id="contact-email" value="${contact ? contact.email : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="contact-type">Type</label>
                        <select class="form-control" id="contact-type">
                            <option value="Emergency" ${contact && contact.type === 'Emergency' ? 'selected' : ''}>Emergency</option>
                            <option value="Venue" ${contact && contact.type === 'Venue' ? 'selected' : ''}>Venue</option>
                            <option value="Transportation" ${contact && contact.type === 'Transportation' ? 'selected' : ''}>Transportation</option>
                            <option value="Accommodation" ${contact && contact.type === 'Accommodation' ? 'selected' : ''}>Accommodation</option>
                            <option value="Other" ${contact && contact.type === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                <button type="button" class="btn btn-primary" id="save-btn">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners to modal buttons
    modal.querySelector('.close').addEventListener('click', closeModal);
    modal.querySelector('#cancel-btn').addEventListener('click', closeModal);
    modal.querySelector('#save-btn').addEventListener('click', () => {
        handleContactFormSubmit(contact ? contact._id : null);
    });
    
    // Function to close the modal
    function closeModal() {
        document.body.removeChild(modal);
        document.body.removeChild(backdrop);
    }
    
    // Function to handle form submission
    function handleContactFormSubmit(contactId) {
        // Get form values
        const name = document.getElementById('contact-name').value;
        const title = document.getElementById('contact-title').value;
        const phone = document.getElementById('contact-phone').value;
        const email = document.getElementById('contact-email').value;
        const type = document.getElementById('contact-type').value;
        
        // Validate required fields
        if (!name) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Create contact object
        const contactData = {
            name,
            title,
            phone,
            email,
            type
        };
        
        // Determine if we're adding or updating
        const method = contactId ? 'PUT' : 'POST';
        const url = contactId ? `/api/contacts/${contactId}` : '/api/contacts';
        
        // Send request to API
        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(contactData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save contact');
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            closeModal();
            
            // Reload contacts
            loadContacts();
            
            // Show success message
            showAlert('success', `Contact ${contactId ? 'updated' : 'added'} successfully`);
        })
        .catch(error => {
            console.error('Error saving contact:', error);
            showAlert('danger', `Failed to ${contactId ? 'update' : 'add'} contact`);
        });
    }
}

// Delete contact
function deleteContact(contactId) {
    if (!confirm('Are you sure you want to delete this contact?')) {
        return;
    }
    
    fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete contact');
        }
        return response.json();
    })
    .then(data => {
        // Reload contacts
        loadContacts();
        
        // Show success message
        showAlert('success', 'Contact deleted successfully');
    })
    .catch(error => {
        console.error('Error deleting contact:', error);
        showAlert('danger', 'Failed to delete contact');
    });
}

// Load reminders
function loadReminders() {
    const remindersContainer = document.getElementById('reminders-container');
    remindersContainer.innerHTML = '<div class="loading">Loading reminders...</div>';
    
    fetch('/api/reminders', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch reminders');
        }
        return response.json();
    })
    .then(reminders => {
        // Clear loading message
        remindersContainer.innerHTML = '';
        
        // Add "Add Reminder" button
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-primary mb-4';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Add New Reminder';
        addButton.addEventListener('click', () => showReminderModal());
        remindersContainer.appendChild(addButton);
        
        // Create table for reminders
        const table = document.createElement('table');
        table.className = 'table table-striped';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Title', 'Description', 'Priority', 'Actions'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Add reminders to table
        reminders.forEach(reminder => {
            const row = document.createElement('tr');
            
            // Title cell
            const titleCell = document.createElement('td');
            titleCell.textContent = reminder.title;
            row.appendChild(titleCell);
            
            // Description cell
            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = reminder.description || 'N/A';
            row.appendChild(descriptionCell);
            
            // Priority cell
            const priorityCell = document.createElement('td');
            const priorityBadge = document.createElement('span');
            priorityBadge.className = `badge badge-${getPriorityClass(reminder.priority)}`;
            priorityBadge.textContent = reminder.priority || 'Medium';
            priorityCell.appendChild(priorityBadge);
            row.appendChild(priorityCell);
            
            // Actions cell
            const actionsCell = document.createElement('td');
            
            // Edit button
            const editButton = document.createElement('button');
            editButton.className = 'btn btn-sm btn-primary mr-2';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', () => showReminderModal(reminder));
            actionsCell.appendChild(editButton);
            
            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-sm btn-danger';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.addEventListener('click', () => deleteReminder(reminder._id));
            actionsCell.appendChild(deleteButton);
            
            row.appendChild(actionsCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        remindersContainer.appendChild(table);
        
        // Show message if no reminders
        if (reminders.length === 0) {
            const noRemindersMessage = document.createElement('div');
            noRemindersMessage.className = 'alert alert-info';
            noRemindersMessage.textContent = 'No reminders found. Click "Add New Reminder" to create one.';
            remindersContainer.appendChild(noRemindersMessage);
        }
    })
    .catch(error => {
        console.error('Error loading reminders:', error);
        remindersContainer.innerHTML = `
            <div class="alert alert-danger">
                Failed to load reminders. Please try again.
            </div>
        `;
    });
}

// Get priority badge class
function getPriorityClass(priority) {
    switch (priority) {
        case 'High':
            return 'danger';
        case 'Medium':
            return 'warning';
        case 'Low':
            return 'info';
        default:
            return 'secondary';
    }
}

// Show reminder modal for adding or editing a reminder
function showReminderModal(reminder = null) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Set modal title based on whether we're adding or editing
    const modalTitle = reminder ? 'Edit Reminder' : 'Add New Reminder';
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${modalTitle}</h5>
                <button type="button" class="close" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="reminder-form">
                    <div class="form-group">
                        <label for="reminder-title">Title</label>
                        <input type="text" class="form-control" id="reminder-title" value="${reminder ? reminder.title : ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="reminder-description">Description</label>
                        <textarea class="form-control" id="reminder-description" rows="3">${reminder ? reminder.description : ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="reminder-priority">Priority</label>
                        <select class="form-control" id="reminder-priority">
                            <option value="High" ${reminder && reminder.priority === 'High' ? 'selected' : ''}>High</option>
                            <option value="Medium" ${reminder && reminder.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                            <option value="Low" ${reminder && reminder.priority === 'Low' ? 'selected' : ''}>Low</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                <button type="button" class="btn btn-primary" id="save-btn">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners to modal buttons
    modal.querySelector('.close').addEventListener('click', closeModal);
    modal.querySelector('#cancel-btn').addEventListener('click', closeModal);
    modal.querySelector('#save-btn').addEventListener('click', () => {
        handleReminderFormSubmit(reminder ? reminder._id : null);
    });
    
    // Function to close the modal
    function closeModal() {
        document.body.removeChild(modal);
        document.body.removeChild(backdrop);
    }
    
    // Function to handle form submission
    function handleReminderFormSubmit(reminderId) {
        // Get form values
        const title = document.getElementById('reminder-title').value;
        const description = document.getElementById('reminder-description').value;
        const priority = document.getElementById('reminder-priority').value;
        
        // Validate required fields
        if (!title) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Create reminder object
        const reminderData = {
            title,
            description,
            priority
        };
        
        // Determine if we're adding or updating
        const method = reminderId ? 'PUT' : 'POST';
        const url = reminderId ? `/api/reminders/${reminderId}` : '/api/reminders';
        
        // Send request to API
        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(reminderData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save reminder');
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            closeModal();
            
            // Reload reminders
            loadReminders();
            
            // Show success message
            showAlert('success', `Reminder ${reminderId ? 'updated' : 'added'} successfully`);
        })
        .catch(error => {
            console.error('Error saving reminder:', error);
            showAlert('danger', `Failed to ${reminderId ? 'update' : 'add'} reminder`);
        });
    }
}

// Delete reminder
function deleteReminder(reminderId) {
    if (!confirm('Are you sure you want to delete this reminder?')) {
        return;
    }
    
    fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete reminder');
        }
        return response.json();
    })
    .then(data => {
        // Reload reminders
        loadReminders();
        
        // Show success message
        showAlert('success', 'Reminder deleted successfully');
    })
    .catch(error => {
        console.error('Error deleting reminder:', error);
        showAlert('danger', 'Failed to delete reminder');
    });
}

// Load notes
function loadNotes() {
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '<div class="loading">Loading notes...</div>';
    
    fetch('/api/notes', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch notes');
        }
        return response.json();
    })
    .then(notes => {
        // Clear loading message
        notesContainer.innerHTML = '';
        
        // Add "Add Note" button
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-primary mb-4';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Add New Note';
        addButton.addEventListener('click', () => showNoteModal());
        notesContainer.appendChild(addButton);
        
        // Create notes grid
        const notesGrid = document.createElement('div');
        notesGrid.className = 'row';
        
        // Add notes to grid
        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'col-md-4 mb-4';
            
            noteCard.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${note.title}</h5>
                        <p class="card-text">${note.content || 'No content'}</p>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-primary edit-note"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn btn-sm btn-danger delete-note"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners to buttons
            noteCard.querySelector('.edit-note').addEventListener('click', () => showNoteModal(note));
            noteCard.querySelector('.delete-note').addEventListener('click', () => deleteNote(note._id));
            
            notesGrid.appendChild(noteCard);
        });
        
        notesContainer.appendChild(notesGrid);
        
        // Show message if no notes
        if (notes.length === 0) {
            const noNotesMessage = document.createElement('div');
            noNotesMessage.className = 'alert alert-info';
            noNotesMessage.textContent = 'No notes found. Click "Add New Note" to create one.';
            notesContainer.appendChild(noNotesMessage);
        }
    })
    .catch(error => {
        console.error('Error loading notes:', error);
        notesContainer.innerHTML = `
            <div class="alert alert-danger">
                Failed to load notes. Please try again.
            </div>
        `;
    });
}

// Show note modal for adding or editing a note
function showNoteModal(note = null) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Set modal title based on whether we're adding or editing
    const modalTitle = note ? 'Edit Note' : 'Add New Note';
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${modalTitle}</h5>
                <button type="button" class="close" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="note-form">
                    <div class="form-group">
                        <label for="note-title">Title</label>
                        <input type="text" class="form-control" id="note-title" value="${note ? note.title : ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="note-content">Content</label>
                        <textarea class="form-control" id="note-content" rows="5">${note ? note.content : ''}</textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                <button type="button" class="btn btn-primary" id="save-btn">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners to modal buttons
    modal.querySelector('.close').addEventListener('click', closeModal);
    modal.querySelector('#cancel-btn').addEventListener('click', closeModal);
    modal.querySelector('#save-btn').addEventListener('click', () => {
        handleNoteFormSubmit(note ? note._id : null);
    });
    
    // Function to close the modal
    function closeModal() {
        document.body.removeChild(modal);
        document.body.removeChild(backdrop);
    }
    
    // Function to handle form submission
    function handleNoteFormSubmit(noteId) {
        // Get form values
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        
        // Validate required fields
        if (!title) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Create note object
        const noteData = {
            title,
            content
        };
        
        // Determine if we're adding or updating
        const method = noteId ? 'PUT' : 'POST';
        const url = noteId ? `/api/notes/${noteId}` : '/api/notes';
        
        // Send request to API
        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(noteData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save note');
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            closeModal();
            
            // Reload notes
            loadNotes();
            
            // Show success message
            showAlert('success', `Note ${noteId ? 'updated' : 'added'} successfully`);
        })
        .catch(error => {
            console.error('Error saving note:', error);
            showAlert('danger', `Failed to ${noteId ? 'update' : 'add'} note`);
        });
    }
}

// Delete note
function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete note');
        }
        return response.json();
    })
    .then(data => {
        // Reload notes
        loadNotes();
        
        // Show success message
        showAlert('success', 'Note deleted successfully');
    })
    .catch(error => {
        console.error('Error deleting note:', error);
        showAlert('danger', 'Failed to delete note');
    });
}

// Load gallery
function loadGallery() {
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = '<div class="loading">Loading gallery...</div>';
    
    fetch('/api/gallery', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch gallery');
        }
        return response.json();
    })
    .then(images => {
        // Clear loading message
        galleryContainer.innerHTML = '';
        
        // Add upload form
        const uploadForm = document.createElement('div');
        uploadForm.className = 'card mb-4';
        uploadForm.innerHTML = `
            <div class="card-header">
                <h5 class="mb-0">Upload New Image</h5>
            </div>
            <div class="card-body">
                <form id="upload-form" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="image-file">Select Image</label>
                        <input type="file" class="form-control-file" id="image-file" accept="image/*" required>
                    </div>
                    <div class="form-group">
                        <label for="image-description">Description (optional)</label>
                        <input type="text" class="form-control" id="image-description">
                    </div>
                    <button type="submit" class="btn btn-primary">Upload</button>
                </form>
            </div>
        `;
        
        galleryContainer.appendChild(uploadForm);
        
        // Add event listener to upload form
        document.getElementById('upload-form').addEventListener('submit', function(e) {
            e.preventDefault();
            uploadImage();
        });
        
        // Create gallery grid
        const galleryGrid = document.createElement('div');
        galleryGrid.className = 'row';
        
        // Add images to grid
        images.forEach(image => {
            const imageCard = document.createElement('div');
            imageCard.className = 'col-md-4 mb-4';
            
            imageCard.innerHTML = `
                <div class="card">
                    <img src="${image.path}" class="card-img-top" alt="${image.description || 'Gallery Image'}">
                    <div class="card-body">
                        <p class="card-text">${image.description || 'No description'}</p>
                        <button class="btn btn-sm btn-danger delete-image"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            `;
            
            // Add event listener to delete button
            imageCard.querySelector('.delete-image').addEventListener('click', () => deleteImage(image._id));
            
            galleryGrid.appendChild(imageCard);
        });
        
        galleryContainer.appendChild(galleryGrid);
        
        // Show message if no images
        if (images.length === 0) {
            const noImagesMessage = document.createElement('div');
            noImagesMessage.className = 'alert alert-info mt-4';
            noImagesMessage.textContent = 'No images found. Use the form above to upload images.';
            galleryContainer.appendChild(noImagesMessage);
        }
    })
    .catch(error => {
        console.error('Error loading gallery:', error);
        galleryContainer.innerHTML = `
            <div class="alert alert-danger">
                Failed to load gallery. Please try again.
            </div>
        `;
    });
}

// Upload image
function uploadImage() {
    const fileInput = document.getElementById('image-file');
    const description = document.getElementById('image-description').value;
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select an image to upload');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('description', description);
    
    fetch('/api/gallery/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        document.getElementById('upload-form').reset();
        
        // Reload gallery
        loadGallery();
        
        // Show success message
        showAlert('success', 'Image uploaded successfully');
    })
    .catch(error => {
        console.error('Error uploading image:', error);
        showAlert('danger', 'Failed to upload image');
    });
}

// Delete image
function deleteImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }
    
    fetch(`/api/gallery/${imageId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        
        // Show success message
        showAlert('success', 'Image deleted successfully');
    })
    .catch(error => {
        console.error('Error deleting image:', error);
        showAlert('danger', 'Failed to delete image');
    });
}

// Load settings
function loadSettings() {
    const settingsContainer = document.getElementById('settings-container');
    settingsContainer.innerHTML = '<div class="loading">Loading settings...</div>';
    
    // Fetch footer settings
    fetch('/api/footer', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch footer settings');
        }
        return response.json();
    })
    .then(footer => {
        // Clear loading message
        settingsContainer.innerHTML = '';
        
        // Create footer settings form
        const footerForm = document.createElement('div');
        footerForm.className = 'card mb-4';
        footerForm.innerHTML = `
            <div class="card-header">
                <h5 class="mb-0">Footer Settings</h5>
            </div>
            <div class="card-body">
                <form id="footer-form">
                    <div class="form-group">
                        <label for="footer-title">Title</label>
                        <input type="text" class="form-control" id="footer-title" value="${footer.title || ''}">
                    </div>
                    <div class="form-group">
                        <label for="footer-text">Text</label>
                        <textarea class="form-control" id="footer-text" rows="3">${footer.text || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="footer-copyright">Copyright</label>
                        <input type="text" class="form-control" id="footer-copyright" value="${footer.copyright || ''}">
                    </div>
                    <button type="submit" class="btn btn-primary">Save Footer Settings</button>
                </form>
            </div>
        `;
        
        settingsContainer.appendChild(footerForm);
        
        // Add event listener to footer form
        document.getElementById('footer-form').addEventListener('submit', function(e) {
            e.preventDefault();
            saveFooterSettings(footer._id);
        });
    })
    .catch(error => {
        console.error('Error loading settings:', error);
        settingsContainer.innerHTML = `
            <div class="alert alert-danger">
                Failed to load settings. Please try again.
            </div>
        `;
    });
}

// Save footer settings
function saveFooterSettings(footerId) {
    const title = document.getElementById('footer-title').value;
    const text = document.getElementById('footer-text').value;
    const copyright = document.getElementById('footer-copyright').value;
    
    const footerData = {
        title,
        text,
        copyright
    };
    
    fetch(`/api/footer`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(footerData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save footer settings');
        }
        return response.json();
    })
    .then(data => {
        // Show success message
        showAlert('success', 'Footer settings saved successfully');
    })
    .catch(error => {
        console.error('Error saving footer settings:', error);
        showAlert('danger', 'Failed to save footer settings');
    });
}

// Show alert message
function showAlert(type, message) {
    const alertContainer = document.getElementById('alert-container');
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    
    // Add alert to container
    alertContainer.appendChild(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            alertContainer.removeChild(alert);
        }, 150);
    }, 5000);
    
    // Add event listener to close button
    alert.querySelector('.close').addEventListener('click', function() {
        alert.classList.remove('show');
        setTimeout(() => {
            alertContainer.removeChild(alert);
        }, 150);
    });
}
