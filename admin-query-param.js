/**
 * admin-query-param.js - Standalone Admin Solution for Jyoti's 50th Birthday Website
 * 
 * This script transforms the main website into an admin panel when accessed with
 * a special query parameter: ?admin=jyoti50admin
 * 
 * To use:
 * 1. Add this script to your index.html file
 * 2. Access your website with the query parameter: https://jyoti50-celebration.onrender.com/?admin=jyoti50admin
 */

(function() {
    // Only run this script when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Admin query param script loaded');
        
        // Check if the admin query parameter is present
        const urlParams = new URLSearchParams(window.location.search);
        const adminParam = urlParams.get('admin');
        
        // Only activate admin mode if the correct parameter is provided
        if (adminParam === 'jyoti50admin') {
            console.log('Admin mode activated');
            activateAdminMode();
        }
    });
    
    // Function to activate admin mode
    function activateAdminMode() {
        // Create admin panel styles
        const adminStyles = document.createElement('style');
        adminStyles.textContent = `
            .admin-panel {
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                width: 80%;
                max-width: 500px;
                background-color: #fff;
                box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                overflow-y: auto;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .admin-panel.active {
                transform: translateX(0);
            }
            
            .admin-toggle {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #d4af37;
                color: #121212;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                font-size: 24px;
                cursor: pointer;
                z-index: 10000;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            .admin-panel-header {
                background-color: #121212;
                color: #d4af37;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .admin-panel-header h2 {
                margin: 0;
                font-size: 18px;
            }
            
            .admin-panel-close {
                background: none;
                border: none;
                color: #d4af37;
                font-size: 24px;
                cursor: pointer;
            }
            
            .admin-tabs {
                display: flex;
                background-color: #f0f0f0;
                border-bottom: 1px solid #ddd;
            }
            
            .admin-tab {
                padding: 10px 15px;
                cursor: pointer;
                border-bottom: 2px solid transparent;
            }
            
            .admin-tab.active {
                border-bottom-color: #d4af37;
                font-weight: bold;
            }
            
            .admin-tab-content {
                display: none;
                padding: 15px;
            }
            
            .admin-tab-content.active {
                display: block;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            
            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            .admin-button {
                background-color: #d4af37;
                color: #121212;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            }
            
            .admin-button:hover {
                opacity: 0.9;
            }
            
            .status-message {
                padding: 10px;
                margin-top: 10px;
                border-radius: 4px;
            }
            
            .status-success {
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
            
            .status-error {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
            
            .admin-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .admin-list-item {
                padding: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .admin-list-item:last-child {
                border-bottom: none;
            }
            
            .admin-gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 10px;
                margin-top: 15px;
            }
            
            .admin-gallery-item {
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .admin-gallery-item img {
                width: 100%;
                height: 100px;
                object-fit: cover;
            }
            
            .admin-gallery-item-content {
                padding: 5px;
                font-size: 12px;
            }
            
            .admin-debug {
                font-family: monospace;
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 4px;
                max-height: 200px;
                overflow-y: auto;
            }
        `;
        document.head.appendChild(adminStyles);
        
        // Create admin toggle button
        const adminToggle = document.createElement('button');
        adminToggle.className = 'admin-toggle';
        adminToggle.innerHTML = '⚙️';
        adminToggle.title = 'Toggle Admin Panel';
        document.body.appendChild(adminToggle);
        
        // Create admin panel
        const adminPanel = document.createElement('div');
        adminPanel.className = 'admin-panel';
        adminPanel.innerHTML = `
            <div class="admin-panel-header">
                <h2>Jyoti's 50th Birthday - Admin Panel</h2>
                <button class="admin-panel-close">&times;</button>
            </div>
            <div class="admin-tabs">
                <div class="admin-tab active" data-tab="events">Events</div>
                <div class="admin-tab" data-tab="gallery">Gallery</div>
                <div class="admin-tab" data-tab="contacts">Contacts</div>
                <div class="admin-tab" data-tab="debug">Debug</div>
            </div>
            <div class="admin-tab-content active" id="events-tab">
                <h3>Add New Event</h3>
                <form id="admin-event-form">
                    <div class="form-group">
                        <label for="event-title">Event Title:</label>
                        <input type="text" id="event-title" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="event-date">Date:</label>
                        <input type="date" id="event-date" name="date" required>
                    </div>
                    <div class="form-group">
                        <label for="event-time">Time:</label>
                        <input type="time" id="event-time" name="time" required>
                    </div>
                    <div class="form-group">
                        <label for="event-location">Location:</label>
                        <input type="text" id="event-location" name="location">
                    </div>
                    <div class="form-group">
                        <label for="event-description">Description:</label>
                        <textarea id="event-description" name="description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="event-day">Day:</label>
                        <select id="event-day" name="day">
                            <option value="day1">Day 1 (April 24)</option>
                            <option value="day2">Day 2 (April 25)</option>
                            <option value="day3">Day 3 (April 26)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="event-dress-code">Dress Code:</label>
                        <input type="text" id="event-dress-code" name="dressCode" placeholder="e.g., Formal, Casual">
                    </div>
                    <button type="submit" class="admin-button">Add Event</button>
                </form>
                <div id="event-status"></div>
                
                <h3>Current Events</h3>
                <button id="refresh-events" class="admin-button">Refresh Events</button>
                <ul id="admin-event-list" class="admin-list"></ul>
            </div>
            <div class="admin-tab-content" id="gallery-tab">
                <h3>Upload Image</h3>
                <form id="admin-gallery-form">
                    <div class="form-group">
                        <label for="gallery-image">Select Image:</label>
                        <input type="file" id="gallery-image" name="image" accept="image/*" required>
                    </div>
                    <div class="form-group">
                        <label for="gallery-title">Title:</label>
                        <input type="text" id="gallery-title" name="title">
                    </div>
                    <div class="form-group">
                        <label for="gallery-description">Description:</label>
                        <textarea id="gallery-description" name="description" rows="2"></textarea>
                    </div>
                    <button type="submit" class="admin-button">Upload Image</button>
                </form>
                <div id="gallery-status"></div>
                
                <h3>Gallery Images</h3>
                <button id="refresh-gallery" class="admin-button">Refresh Gallery</button>
                <div id="admin-gallery-grid" class="admin-gallery-grid"></div>
            </div>
            <div class="admin-tab-content" id="contacts-tab">
                <h3>Add Contact</h3>
                <form id="admin-contact-form">
                    <div class="form-group">
                        <label for="contact-name">Name:</label>
                        <input type="text" id="contact-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-email">Email:</label>
                        <input type="email" id="contact-email" name="email">
                    </div>
                    <div class="form-group">
                        <label for="contact-phone">Phone:</label>
                        <input type="tel" id="contact-phone" name="phone">
                    </div>
                    <div class="form-group">
                        <label for="contact-whatsapp">WhatsApp:</label>
                        <input type="tel" id="contact-whatsapp" name="whatsapp">
                    </div>
                    <button type="submit" class="admin-button">Add Contact</button>
                </form>
                <div id="contact-status"></div>
                
                <h3>Contact List</h3>
                <button id="refresh-contacts" class="admin-button">Refresh Contacts</button>
                <ul id="admin-contact-list" class="admin-list"></ul>
            </div>
            <div class="admin-tab-content" id="debug-tab">
                <h3>API Connection Test</h3>
                <button id="test-connection" class="admin-button">Test API Connection</button>
                <div id="connection-status"></div>
                
                <h3>Debug Log</h3>
                <div id="admin-debug-log" class="admin-debug"></div>
                <button id="clear-debug-log" class="admin-button">Clear Log</button>
            </div>
        `;
        document.body.appendChild(adminPanel);
        
        // Add event listeners
        adminToggle.addEventListener('click', function() {
            adminPanel.classList.toggle('active');
        });
        
        const closeButton = adminPanel.querySelector('.admin-panel-close');
        closeButton.addEventListener('click', function() {
            adminPanel.classList.remove('active');
        });
        
        // Tab switching
        const tabs = adminPanel.querySelectorAll('.admin-tab');
        const tabContents = adminPanel.querySelectorAll('.admin-tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                this.classList.add('active');
                document.getElementById(tabId + '-tab').classList.add('active');
            });
        });
        
        // Initialize admin functionality
        initializeAdminFunctionality();
    }
    
    // Function to initialize admin functionality
    function initializeAdminFunctionality() {
        // API client for admin operations
        const adminApi = {
            baseUrl: '',  // Empty for relative paths
            
            // Log messages to debug console
            log(message, data) {
                console.log(message, data);
                const debugLog = document.getElementById('admin-debug-log');
                if (debugLog) {
                    const logEntry = document.createElement('div');
                    logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
                    if (data) {
                        try {
                            logEntry.textContent += ` - ${JSON.stringify(data)}`;
                        } catch (e) {
                            logEntry.textContent += ` - [Object]`;
                        }
                    }
                    debugLog.appendChild(logEntry);
                    debugLog.scrollTop = debugLog.scrollHeight;
                }
            },
            
            // Get data from an API endpoint
            async get(endpoint) {
                try {
                    this.log(`Fetching from ${endpoint}...`);
                    const response = await fetch(`${this.baseUrl}/api/${endpoint}`);
                    
                    if (!response.ok) {
                        this.log(`Error fetching ${endpoint}:`, { status: response.status, statusText: response.statusText });
                        
                        // Try to get error details
                        let errorDetails = '';
                        try {
                            const errorText = await response.text();
                            errorDetails = errorText;
                        } catch (e) {}
                        
                        // For 401 errors, try to use localStorage as fallback
                        if (response.status === 401) {
                            this.log(`Authentication error, using localStorage fallback for ${endpoint}`);
                            return this.getFromLocalStorage(endpoint);
                        }
                        
                        throw new Error(`Error fetching ${endpoint}: ${response.status} ${response.statusText} ${errorDetails}`);
                    }
                    
                    const data = await response.json();
                    this.log(`Received ${Array.isArray(data) ? data.length : 1} items from ${endpoint}`);
                    
                    // Save to localStorage as backup
                    this.saveToLocalStorage(endpoint, data);
                    
                    return data;
                } catch (error) {
                    this.log(`Failed to fetch ${endpoint}:`, { error: error.message });
                    
                    // Try to get from localStorage as fallback
                    return this.getFromLocalStorage(endpoint);
                }
            },
            
            // Post data to an API endpoint
            async post(endpoint, data) {
                try {
                    this.log(`Posting to ${endpoint}...`, data);
                    const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data),
                        credentials: 'include'
                    });
                    
                    if (!response.ok) {
                        this.log(`Error posting to ${endpoint}:`, { status: response.status, statusText: response.statusText });
                        
                        // Try to get error details
                        let errorDetails = '';
                        try {
                            const errorText = await response.text();
                            errorDetails = errorText;
                        } catch (e) {}
                        
                        // For 401 errors, save to localStorage as fallback
                        if (response.status === 401) {
                            this.log(`Authentication error, saving to localStorage for ${endpoint}`);
                            return this.saveToLocalStorageAndReturn(endpoint, data);
                        }
                        
                        throw new Error(`Error posting to ${endpoint}: ${response.status} ${response.statusText} ${errorDetails}`);
                    }
                    
                    const responseData = await response.json();
                    this.log(`Successfully posted to ${endpoint}`, responseData);
                    
                    return responseData;
                } catch (error) {
                    this.log(`Failed to post to ${endpoint}:`, { error: error.message });
                    
                    // Save to localStorage as fallback
                    return this.saveToLocalStorageAndReturn(endpoint, data);
                }
            },
            
            // Upload a file to the gallery with enhanced error handling
            async uploadImage(file, title, description) {
                try {
                    this.log('Uploading image:', { fileName: file.name, fileSize: file.size, fileType: file.type });
                    
                    // Create FormData object for multipart/form-data upload
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('title', title || 'Untitled Image');
                    formData.append('description', description || '');
                    
                    // Make the fetch request with proper headers and credentials
                    const response = await fetch(`${this.baseUrl}/api/gallery/upload`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                    });
                    
                    // First check if the response is OK
                    if (!response.ok) {
                        // Get response as text for better error diagnosis
                        const errorText = await response.text();
                        this.log('Upload failed with status:', { status: response.status, statusText: response.statusText, body: errorText });
                        
                        // For 401 errors, save to localStorage as fallback
                        if (response.status === 401) {
                            this.log('Authentication error, saving to localStorage for gallery');
                            return this.saveImageToLocalStorage(file, title, description);
                        }
                        
                        // Try to parse as JSON if possible, otherwise use text
                        let errorData;
                        try {
                            errorData = JSON.parse(errorText);
                        } catch (e) {
                            // If it's not JSON, create an error object with the text
                            errorData = { error: true, message: errorText || response.statusText };
                        }
                        
                        throw new Error(`Error uploading image: ${errorData.message || response.statusText}`);
                    }
                    
                    // Try to parse response as JSON
                    let responseData;
                    try {
                        const responseText = await response.text();
                        responseData = responseText ? JSON.parse(responseText) : {};
                        this.log('Upload successful:', responseData);
                    } catch (parseError) {
                        this.log('Error parsing response:', { error: parseError.message });
                        throw new Error('Invalid response format from server');
                    }
                    
                    return responseData;
                } catch (error) {
                    this.log('Upload failed:', { error: error.message });
                    
                    // Save to localStorage as fallback
                    return this.saveImageToLocalStorage(file, title, description);
                }
            },
            
            // Debug method to check API connection
            async checkConnection() {
                try {
                    this.log('Testing API connection...');
                    const response = await fetch(`${this.baseUrl}/api/debug`);
                    
                    if (!response.ok) {
                        this.log('API connection test failed:', { status: response.status, statusText: response.statusText });
                        return { status: 'error', message: `API connection failed: ${response.status} ${response.statusText}` };
                    }
                    
                    const data = await response.json();
                    this.log('API connection test successful:', data);
                    return data;
                } catch (error) {
                    this.log('API connection test error:', { error: error.message });
                    return { status: 'error', message: `API connection failed: ${error.message}` };
                }
            },
            
            // LocalStorage fallback methods
            getFromLocalStorage(endpoint) {
                try {
                    const key = `jyoti50_${endpoint.replace(/\//g, '_')}`;
                    const data = localStorage.getItem(key);
                    if (data) {
                        const parsedData = JSON.parse(data);
                        this.log(`Retrieved ${endpoint} from localStorage:`, { count: Array.isArray(parsedData) ? parsedData.length : 1 });
                        return parsedData;
                    }
                    return endpoint.includes('gallery') ? [] : [];
                } catch (error) {
                    this.log(`Error retrieving ${endpoint} from localStorage:`, { error: error.message });
                    return [];
                }
            },
            
            saveToLocalStorage(endpoint, data) {
                try {
                    const key = `jyoti50_${endpoint.replace(/\//g, '_')}`;
                    localStorage.setItem(key, JSON.stringify(data));
                    this.log(`Saved ${endpoint} to localStorage`);
                } catch (error) {
                    this.log(`Error saving ${endpoint} to localStorage:`, { error: error.message });
                }
            },
            
            saveToLocalStorageAndReturn(endpoint, data) {
                try {
                    // For posts, we need to handle different endpoints differently
                    if (endpoint.includes('events')) {
                        return this.saveEventToLocalStorage(data);
                    } else if (endpoint.includes('contacts')) {
                        return this.saveContactToLocalStorage(data);
                    }
                    
                    // Generic fallback
                    const key = `jyoti50_${endpoint.replace(/\//g, '_')}`;
                    let existingData = [];
                    try {
                        const existing = localStorage.getItem(key);
                        if (existing) {
                            existingData = JSON.parse(existing);
                        }
                    } catch (e) {}
                    
                    // Add ID if not present
                    if (!data.id) {
                        data.id = `local_${Date.now()}`;
                    }
                    
                    // Add to array if it's an array, otherwise just save
                    if (Array.isArray(existingData)) {
                        existingData.push(data);
                        localStorage.setItem(key, JSON.stringify(existingData));
                    } else {
                        localStorage.setItem(key, JSON.stringify(data));
                    }
                    
                    this.log(`Saved to localStorage for ${endpoint}`);
                    return { success: true, id: data.id, message: 'Saved to local storage (offline mode)' };
                } catch (error) {
                    this.log(`Error saving to localStorage for ${endpoint}:`, { error: error.message });
                    return { success: false, error: error.message };
                }
            },
            
            saveEventToLocalStorage(eventData) {
                try {
                    // Get existing events
                    let events = [];
                    try {
                        const existing = localStorage.getItem('jyoti50_events');
                        if (existing) {
                            events = JSON.parse(existing);
                        }
                    } catch (e) {}
                    
                    // Add ID if not present
                    if (!eventData.id) {
                        eventData.id = `local_${Date.now()}`;
                    }
                    
                    // Add to events array
                    events.push(eventData);
                    localStorage.setItem('jyoti50_events', JSON.stringify(events));
                    
                    this.log('Saved event to localStorage:', eventData);
                    return { success: true, id: eventData.id, message: 'Event saved to local storage (offline mode)' };
                } catch (error) {
                    this.log('Error saving event to localStorage:', { error: error.message });
                    return { success: false, error: error.message };
                }
            },
            
            saveContactToLocalStorage(contactData) {
                try {
                    // Get existing contacts
                    let contacts = [];
                    try {
                        const existing = localStorage.getItem('jyoti50_contacts');
                        if (existing) {
                            contacts = JSON.parse(existing);
                        }
                    } catch (e) {}
                    
                    // Add ID if not present
                    if (!contactData.id) {
                        contactData.id = `local_${Date.now()}`;
                    }
                    
                    // Add to contacts array
                    contacts.push(contactData);
                    localStorage.setItem('jyoti50_contacts', JSON.stringify(contacts));
                    
                    this.log('Saved contact to localStorage:', contactData);
                    return { success: true, id: contactData.id, message: 'Contact saved to local storage (offline mode)' };
                } catch (error) {
                    this.log('Error saving contact to localStorage:', { error: error.message });
                    return { success: false, error: error.message };
                }
            },
            
            saveImageToLocalStorage(file, title, description) {
                return new Promise((resolve, reject) => {
                    try {
                        const reader = new FileReader();
                        
                        reader.onload = (e) => {
                            try {
                                // Get existing gallery items
                                let galleryItems = [];
                                try {
                                    const existing = localStorage.getItem('jyoti50_gallery');
                                    if (existing) {
                                        galleryItems = JSON.parse(existing);
                                    }
                                } catch (e) {}
                                
                                // Create new gallery item
                                const newItem = {
                                    id: `local_${Date.now()}`,
                                    title: title || 'Untitled Image',
                                    description: description || '',
                                    image: e.target.result,
                                    date: new Date().toISOString()
                                };
                                
                                // Add to gallery array
                                galleryItems.push(newItem);
                                localStorage.setItem('jyoti50_gallery', JSON.stringify(galleryItems));
                                
                                this.log('Saved image to localStorage:', { id: newItem.id, title: newItem.title });
                                resolve({ success: true, id: newItem.id, message: 'Image saved to local storage (offline mode)' });
                            } catch (error) {
                                this.log('Error saving image to localStorage:', { error: error.message });
                                reject(error);
                            }
                        };
                        
                        reader.onerror = (error) => {
                            this.log('Error reading file:', { error: error });
                            reject(new Error('Failed to read image file'));
                        };
                        
                        reader.readAsDataURL(file);
                    } catch (error) {
                        this.log('Error in saveImageToLocalStorage:', { error: error.message });
                        reject(error);
                    }
                });
            }
        };
        
        // Set up event handlers
        setupEventHandlers();
        
        // Load initial data
        loadEvents();
        loadGallery();
        loadContacts();
        
        // Log initialization
        adminApi.log('Admin panel initialized');
        
        // Function to set up event handlers
        function setupEventHandlers() {
            // Events
            const eventForm = document.getElementById('admin-event-form');
            if (eventForm) {
                eventForm.addEventListener('submit', handleEventSubmit);
            }
            
            const refreshEventsBtn = document.getElementById('refresh-events');
            if (refreshEventsBtn) {
                refreshEventsBtn.addEventListener('click', loadEvents);
            }
            
            // Gallery
            const galleryForm = document.getElementById('admin-gallery-form');
            if (galleryForm) {
                galleryForm.addEventListener('submit', handleGallerySubmit);
            }
            
            const refreshGalleryBtn = document.getElementById('refresh-gallery');
            if (refreshGalleryBtn) {
                refreshGalleryBtn.addEventListener('click', loadGallery);
            }
            
            // Contacts
            const contactForm = document.getElementById('admin-contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', handleContactSubmit);
            }
            
            const refreshContactsBtn = document.getElementById('refresh-contacts');
            if (refreshContactsBtn) {
                refreshContactsBtn.addEventListener('click', loadContacts);
            }
            
            // Debug
            const testConnectionBtn = document.getElementById('test-connection');
            if (testConnectionBtn) {
                testConnectionBtn.addEventListener('click', testApiConnection);
            }
            
            const clearDebugLogBtn = document.getElementById('clear-debug-log');
            if (clearDebugLogBtn) {
                clearDebugLogBtn.addEventListener('click', clearDebugLog);
            }
        }
        
        // Function to load events
        async function loadEvents() {
            const eventList = document.getElementById('admin-event-list');
            if (!eventList) return;
            
            try {
                // Clear existing events
                eventList.innerHTML = '<li class="admin-list-item">Loading events...</li>';
                
                // Fetch events from API
                const events = await adminApi.get('events');
                
                // Clear loading message
                eventList.innerHTML = '';
                
                if (Array.isArray(events) && events.length > 0) {
                    // Render events
                    events.forEach(event => {
                        const eventItem = document.createElement('li');
                        eventItem.className = 'admin-list-item';
                        
                        // Format date for display
                        let displayDate = 'N/A';
                        try {
                            displayDate = new Date(event.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        } catch (e) {
                            console.error('Error formatting date:', e);
                        }
                        
                        eventItem.innerHTML = `
                            <h4>${event.title || 'Untitled Event'}</h4>
                            <p><strong>Date:</strong> ${displayDate}</p>
                            <p><strong>Time:</strong> ${event.time || 'N/A'}</p>
                            <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
                            <p><strong>Dress Code:</strong> ${event.dressCode || 'Smart Casual'}</p>
                            <p>${event.description || 'No description provided.'}</p>
                            <button class="admin-button" data-action="edit" data-id="${event.id}">Edit</button>
                            <button class="admin-button" data-action="delete" data-id="${event.id}">Delete</button>
                        `;
                        
                        eventList.appendChild(eventItem);
                    });
                } else {
                    // No events found
                    eventList.innerHTML = '<li class="admin-list-item">No events found. Add your first event above.</li>';
                }
            } catch (error) {
                console.error('Error loading events:', error);
                eventList.innerHTML = `<li class="admin-list-item">Error loading events: ${error.message}</li>`;
            }
        }
        
        // Function to handle event form submission
        async function handleEventSubmit(e) {
            e.preventDefault();
            
            const statusElement = document.getElementById('event-status');
            
            try {
                // Get form values
                const title = document.getElementById('event-title').value;
                const date = document.getElementById('event-date').value;
                const time = document.getElementById('event-time').value;
                const location = document.getElementById('event-location').value;
                const description = document.getElementById('event-description').value;
                const day = document.getElementById('event-day').value;
                const dressCode = document.getElementById('event-dress-code').value;
                
                // Validate required fields
                if (!title || !date) {
                    throw new Error('Title and date are required');
                }
                
                // Create event object
                const eventData = {
                    title,
                    date,
                    time,
                    location,
                    description,
                    day,
                    dressCode: dressCode || 'Smart Casual'
                };
                
                // Show status
                if (statusElement) {
                    statusElement.className = 'status-message';
                    statusElement.textContent = 'Saving event...';
                }
                
                // Submit to API
                const result = await adminApi.post('events', eventData);
                
                // Show success message
                if (statusElement) {
                    statusElement.className = 'status-message status-success';
                    statusElement.textContent = 'Event added successfully!';
                }
                
                // Reset form
                e.target.reset();
                
                // Reload events
                loadEvents();
                
                // Clear status after delay
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                        statusElement.className = '';
                    }
                }, 3000);
            } catch (error) {
                console.error('Error adding event:', error);
                
                // Show error message
                if (statusElement) {
                    statusElement.className = 'status-message status-error';
                    statusElement.textContent = `Error adding event: ${error.message}`;
                }
            }
        }
        
        // Function to load gallery
        async function loadGallery() {
            const galleryGrid = document.getElementById('admin-gallery-grid');
            if (!galleryGrid) return;
            
            try {
                // Clear existing gallery items
                galleryGrid.innerHTML = '<div class="admin-gallery-item">Loading gallery...</div>';
                
                // Fetch gallery from API
                const galleryItems = await adminApi.get('gallery');
                
                // Clear loading message
                galleryGrid.innerHTML = '';
                
                if (Array.isArray(galleryItems) && galleryItems.length > 0) {
                    // Render gallery items
                    galleryItems.forEach(item => {
                        const galleryItem = document.createElement('div');
                        galleryItem.className = 'admin-gallery-item';
                        
                        // Determine image source
                        let imgSrc = item.image;
                        if (!imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
                            // If it's a relative path, make it absolute
                            imgSrc = `/uploads/${imgSrc}`;
                        }
                        
                        galleryItem.innerHTML = `
                            <img src="${imgSrc}" alt="${item.title || 'Gallery Image'}" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22200%22%20height%3D%22150%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2256.1953125%22%20y%3D%2279.5%22%3EImage%20not%20found%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';">
                            <div class="admin-gallery-item-content">
                                <div>${item.title || 'Untitled'}</div>
                                <button class="admin-button" data-action="delete" data-id="${item.id}">Delete</button>
                            </div>
                        `;
                        
                        galleryGrid.appendChild(galleryItem);
                    });
                } else {
                    // No gallery items found
                    galleryGrid.innerHTML = '<div class="admin-gallery-item">No images found. Upload your first image above.</div>';
                }
                
                // Also check localStorage for any offline uploads
                const localGallery = adminApi.getFromLocalStorage('gallery');
                if (Array.isArray(localGallery) && localGallery.length > 0) {
                    localGallery.forEach(item => {
                        // Check if this item is already displayed (by ID)
                        const existingItems = galleryGrid.querySelectorAll(`[data-id="${item.id}"]`);
                        if (existingItems.length === 0) {
                            const galleryItem = document.createElement('div');
                            galleryItem.className = 'admin-gallery-item';
                            galleryItem.setAttribute('data-id', item.id);
                            
                            galleryItem.innerHTML = `
                                <img src="${item.image}" alt="${item.title || 'Gallery Image'}" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22200%22%20height%3D%22150%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2256.1953125%22%20y%3D%2279.5%22%3EImage%20not%20found%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';">
                                <div class="admin-gallery-item-content">
                                    <div>${item.title || 'Untitled'} (Local)</div>
                                    <button class="admin-button" data-action="delete" data-id="${item.id}">Delete</button>
                                </div>
                            `;
                            
                            galleryGrid.appendChild(galleryItem);
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading gallery:', error);
                galleryGrid.innerHTML = `<div class="admin-gallery-item">Error loading gallery: ${error.message}</div>`;
            }
        }
        
        // Function to handle gallery form submission
        async function handleGallerySubmit(e) {
            e.preventDefault();
            
            const statusElement = document.getElementById('gallery-status');
            
            try {
                // Get form values
                const fileInput = document.getElementById('gallery-image');
                const title = document.getElementById('gallery-title').value;
                const description = document.getElementById('gallery-description').value;
                
                // Validate file
                if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                    throw new Error('Please select an image to upload');
                }
                
                const file = fileInput.files[0];
                
                // Show status
                if (statusElement) {
                    statusElement.className = 'status-message';
                    statusElement.textContent = 'Uploading image...';
                }
                
                // Submit to API
                const result = await adminApi.uploadImage(file, title, description);
                
                // Show success message
                if (statusElement) {
                    statusElement.className = 'status-message status-success';
                    statusElement.textContent = 'Image uploaded successfully!';
                }
                
                // Reset form
                e.target.reset();
                
                // Reload gallery
                loadGallery();
                
                // Clear status after delay
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                        statusElement.className = '';
                    }
                }, 3000);
            } catch (error) {
                console.error('Error uploading image:', error);
                
                // Show error message
                if (statusElement) {
                    statusElement.className = 'status-message status-error';
                    statusElement.textContent = `Error uploading image: ${error.message}`;
                }
            }
        }
        
        // Function to load contacts
        async function loadContacts() {
            const contactList = document.getElementById('admin-contact-list');
            if (!contactList) return;
            
            try {
                // Clear existing contacts
                contactList.innerHTML = '<li class="admin-list-item">Loading contacts...</li>';
                
                // Fetch contacts from API
                const contacts = await adminApi.get('contacts');
                
                // Clear loading message
                contactList.innerHTML = '';
                
                if (Array.isArray(contacts) && contacts.length > 0) {
                    // Render contacts
                    contacts.forEach(contact => {
                        const contactItem = document.createElement('li');
                        contactItem.className = 'admin-list-item';
                        
                        contactItem.innerHTML = `
                            <h4>${contact.name || 'Unnamed Contact'}</h4>
                            <p><strong>Email:</strong> ${contact.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> ${contact.phone || 'N/A'}</p>
                            <p><strong>WhatsApp:</strong> ${contact.whatsapp || 'N/A'}</p>
                            <button class="admin-button" data-action="edit" data-id="${contact.id}">Edit</button>
                            <button class="admin-button" data-action="delete" data-id="${contact.id}">Delete</button>
                        `;
                        
                        contactList.appendChild(contactItem);
                    });
                } else {
                    // No contacts found
                    contactList.innerHTML = '<li class="admin-list-item">No contacts found. Add your first contact above.</li>';
                }
            } catch (error) {
                console.error('Error loading contacts:', error);
                contactList.innerHTML = `<li class="admin-list-item">Error loading contacts: ${error.message}</li>`;
            }
        }
        
        // Function to handle contact form submission
        async function handleContactSubmit(e) {
            e.preventDefault();
            
            const statusElement = document.getElementById('contact-status');
            
            try {
                // Get form values
                const name = document.getElementById('contact-name').value;
                const email = document.getElementById('contact-email').value;
                const phone = document.getElementById('contact-phone').value;
                const whatsapp = document.getElementById('contact-whatsapp').value;
                
                // Validate required fields
                if (!name) {
                    throw new Error('Name is required');
                }
                
                // Create contact object
                const contactData = {
                    name,
                    email,
                    phone,
                    whatsapp
                };
                
                // Show status
                if (statusElement) {
                    statusElement.className = 'status-message';
                    statusElement.textContent = 'Saving contact...';
                }
                
                // Submit to API
                const result = await adminApi.post('contacts', contactData);
                
                // Show success message
                if (statusElement) {
                    statusElement.className = 'status-message status-success';
                    statusElement.textContent = 'Contact added successfully!';
                }
                
                // Reset form
                e.target.reset();
                
                // Reload contacts
                loadContacts();
                
                // Clear status after delay
                setTimeout(() => {
                    if (statusElement) {
                        statusElement.textContent = '';
                        statusElement.className = '';
                    }
                }, 3000);
            } catch (error) {
                console.error('Error adding contact:', error);
                
                // Show error message
                if (statusElement) {
                    statusElement.className = 'status-message status-error';
                    statusElement.textContent = `Error adding contact: ${error.message}`;
                }
            }
        }
        
        // Function to test API connection
        async function testApiConnection() {
            const statusElement = document.getElementById('connection-status');
            
            try {
                // Show status
                if (statusElement) {
                    statusElement.className = 'status-message';
                    statusElement.textContent = 'Testing API connection...';
                }
                
                // Test connection
                const result = await adminApi.checkConnection();
                
                // Show result
                if (statusElement) {
                    if (result.status === 'success') {
                        statusElement.className = 'status-message status-success';
                        statusElement.textContent = `API connection successful: ${result.message || 'Connected to API'}`;
                    } else {
                        statusElement.className = 'status-message status-error';
                        statusElement.textContent = `API connection failed: ${result.message || 'Unknown error'}`;
                    }
                }
            } catch (error) {
                console.error('Error testing API connection:', error);
                
                // Show error message
                if (statusElement) {
                    statusElement.className = 'status-message status-error';
                    statusElement.textContent = `Error testing API connection: ${error.message}`;
                }
            }
        }
        
        // Function to clear debug log
        function clearDebugLog() {
            const debugLog = document.getElementById('admin-debug-log');
            if (debugLog) {
                debugLog.innerHTML = '';
            }
        }
    }
})();
