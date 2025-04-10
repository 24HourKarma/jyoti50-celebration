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
    const eventData = {
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        startTime: document.getElementById('eventStartTime').value,
        endTime: document.getElementById('eventEndTime').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        dressCode: document.getElementById('eventDressCode').value,
        mapUrl: document.getElementById('eventMapUrl').value,
        websiteUrl: document.getElementById('eventWebsiteUrl').value,
        notes: document.getElementById('eventNotes').value,
        day: formatDay(document.getElementById('eventDate').value)
    };
    
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
        showSuccessMessage(`Event ${action === 'edit' ? '
(Content truncated due to size limit. Use line ranges to read in chunks)