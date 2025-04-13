/**
 * enhanced-admin-query-param.js - Enhanced Admin Solution for Jyoti's 50th Birthday Website
 * 
 * This script transforms the main website into an admin panel when accessed with
 * a special query parameter: ?admin=jyoti50admin
 * 
 * Enhanced version includes:
 * - Edit and delete functionality for events, contacts, reminders, and notes
 * - Additional fields for events (end time, notes, website, map)
 * - Notes field for contacts
 * - Management for reminders, notes, and footer/header content
 */

(function() {
    // Only run this script when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Enhanced Admin query param script loaded');
        
        // Check if the admin query parameter is present
        const urlParams = new URLSearchParams(window.location.search);
        const adminParam = urlParams.get('admin');
        
        // Only activate admin mode if the correct parameter is provided
        if (adminParam === 'jyoti50admin') {
            console.log('Enhanced Admin mode activated');
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
                width: 85%;
                max-width: 1000px;
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
                flex-wrap: wrap;
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
                margin-right: 5px;
                margin-bottom: 5px;
            }
            
            .admin-button:hover {
                opacity: 0.9;
            }
            
            .admin-button.delete {
                background-color: #dc3545;
                color: white;
            }
            
            .admin-button.edit {
                background-color: #007bff;
                color: white;
            }
            
            .admin-button.cancel {
                background-color: #6c757d;
                color: white;
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
                padding: 15px;
                border-bottom: 1px solid #eee;
                margin-bottom: 10px;
                background-color: #f9f9f9;
                border-radius: 4px;
            }
            
            .admin-list-item:last-child {
                border-bottom: none;
            }
            
            .admin-gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .admin-gallery-item {
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;
                background-color: #f9f9f9;
            }
            
            .admin-gallery-item img {
                width: 100%;
                height: 120px;
                object-fit: cover;
            }
            
            .admin-gallery-item-content {
                padding: 10px;
            }
            
            .admin-debug {
                font-family: monospace;
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 4px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .admin-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 10001;
                justify-content: center;
                align-items: center;
            }
            
            .admin-modal.active {
                display: flex;
            }
            
            .admin-modal-content {
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .admin-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .admin-modal-header h3 {
                margin: 0;
            }
            
            .admin-modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
            }
            
            .admin-modal-footer {
                margin-top: 20px;
                display: flex;
                justify-content: flex-end;
            }
            
            .admin-tabs-secondary {
                display: flex;
                margin-bottom: 15px;
                border-bottom: 1px solid #ddd;
            }
            
            .admin-tab-secondary {
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                margin-right: 5px;
            }
            
            .admin-tab-secondary.active {
                border-bottom-color: #d4af37;
                font-weight: bold;
            }
            
            .admin-section {
                margin-bottom: 30px;
            }
            
            .admin-section h3 {
                border-bottom: 1px solid #eee;
                padding-bottom: 8px;
                margin-top: 25px;
            }
            
            .admin-form-row {
                display: flex;
                flex-wrap: wrap;
                margin: 0 -10px;
            }
            
            .admin-form-col {
                flex: 1;
                padding: 0 10px;
                min-width: 200px;
            }
            
            .admin-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
            }
            
            .admin-table th,
            .admin-table td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            
            .admin-table th {
                background-color: #f5f5f5;
                font-weight: bold;
            }
            
            .admin-table tr:hover {
                background-color: #f9f9f9;
            }
            
            .admin-search {
                margin-bottom: 15px;
            }
            
            .admin-search input {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            .admin-pagination {
                display: flex;
                justify-content: center;
                margin-top: 15px;
            }
            
            .admin-pagination button {
                margin: 0 5px;
            }
            
            .admin-checkbox-group {
                display: flex;
                align-items: center;
            }
            
            .admin-checkbox-group input[type="checkbox"] {
                width: auto;
                margin-right: 5px;
            }
            
            .admin-checkbox-group label {
                display: inline;
                font-weight: normal;
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
                <h2>Jyoti's 50th Birthday - Enhanced Admin Panel</h2>
                <button class="admin-panel-close">&times;</button>
            </div>
            <div class="admin-tabs">
                <div class="admin-tab active" data-tab="events">Events</div>
                <div class="admin-tab" data-tab="gallery">Gallery</div>
                <div class="admin-tab" data-tab="contacts">Contacts</div>
                <div class="admin-tab" data-tab="reminders">Reminders</div>
                <div class="admin-tab" data-tab="notes">Notes</div>
                <div class="admin-tab" data-tab="settings">Settings</div>
                <div class="admin-tab" data-tab="debug">Debug</div>
            </div>
            
            <!-- Events Tab -->
            <div class="admin-tab-content active" id="events-tab">
                <div class="admin-section">
                    <h3>Manage Events</h3>
                    <button id="add-event-btn" class="admin-button">Add New Event</button>
                    <button id="refresh-events" class="admin-button">Refresh Events</button>
                    
                    <div class="admin-search">
                        <input type="text" id="event-search" placeholder="Search events...">
                    </div>
                    
                    <div id="event-status" class="status-message" style="display: none;"></div>
                    
                    <div id="events-list-container">
                        <table class="admin-table" id="events-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Location</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="events-table-body">
                                <tr>
                                    <td colspan="5">Loading events...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Gallery Tab -->
            <div class="admin-tab-content" id="gallery-tab">
                <div class="admin-section">
                    <h3>Upload Image</h3>
                    <form id="admin-gallery-form">
                        <div class="admin-form-row">
                            <div class="admin-form-col">
                                <div class="form-group">
                                    <label for="gallery-image">Select Image:</label>
                                    <input type="file" id="gallery-image" name="image" accept="image/*" required>
                                </div>
                            </div>
                            <div class="admin-form-col">
                                <div class="form-group">
                                    <label for="gallery-title">Title:</label>
                                    <input type="text" id="gallery-title" name="title">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="gallery-description">Description:</label>
                            <textarea id="gallery-description" name="description" rows="2"></textarea>
                        </div>
                        <button type="submit" class="admin-button">Upload Image</button>
                    </form>
                    <div id="gallery-status" class="status-message" style="display: none;"></div>
                </div>
                
                <div class="admin-section">
                    <h3>Gallery Images</h3>
                    <button id="refresh-gallery" class="admin-button">Refresh Gallery</button>
                    <div id="admin-gallery-grid" class="admin-gallery-grid">
                        <div class="admin-gallery-item">Loading gallery...</div>
                    </div>
                </div>
            </div>
            
            <!-- Contacts Tab -->
            <div class="admin-tab-content" id="contacts-tab">
                <div class="admin-section">
                    <h3>Manage Contacts</h3>
                    <button id="add-contact-btn" class="admin-button">Add New Contact</button>
                    <button id="refresh-contacts" class="admin-button">Refresh Contacts</button>
                    
                    <div class="admin-search">
                        <input type="text" id="contact-search" placeholder="Search contacts...">
                    </div>
                    
                    <div id="contact-status" class="status-message" style="display: none;"></div>
                    
                    <div id="contacts-list-container">
                        <table class="admin-table" id="contacts-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>WhatsApp</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="contacts-table-body">
                                <tr>
                                    <td colspan="5">Loading contacts...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Reminders Tab -->
            <div class="admin-tab-content" id="reminders-tab">
                <div class="admin-section">
                    <h3>Manage Reminders</h3>
                    <button id="add-reminder-btn" class="admin-button">Add New Reminder</button>
                    <button id="refresh-reminders" class="admin-button">Refresh Reminders</button>
                    
                    <div id="reminder-status" class="status-message" style="display: none;"></div>
                    
                    <div id="reminders-list-container">
                        <table class="admin-table" id="reminders-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Message</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="reminders-table-body">
                                <tr>
                                    <td colspan="4">Loading reminders...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Notes Tab -->
            <div class="admin-tab-content" id="notes-tab">
                <div class="admin-section">
                    <h3>Manage Notes</h3>
                    <button id="add-note-btn" class="admin-button">Add New Note</button>
                    <button id="refresh-notes" class="admin-button">Refresh Notes</button>
                    
                    <div id="note-status" class="status-message" style="display: none;"></div>
                    
                    <div id="notes-list-container">
                        <table class="admin-table" id="notes-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Content</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="notes-table-body">
                                <tr>
                                    <td colspan="3">Loading notes...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Settings Tab -->
            <div class="admin-tab-content" id="settings-tab">
                <div class="admin-section">
                    <h3>Website Settings</h3>
                    <form id="admin-settings-form">
                        <div class="form-group">
                            <label for="settings-site-title">Site Title:</label>
                            <input type="text" id="settings-site-title" name="siteTitle">
                        </div>
                        <div class="form-group">
                            <label for="settings-tagline">Tagline:</label>
                            <input type="text" id="settings-tagline" name="tagline">
                        </div>
                        <div class="form-group">
                            <label for="settings-important-info">Important Information:</label>
                            <textarea id="settings-important-info" name="importantInfo" rows="4"></textarea>
                        </div>
                        <button type="submit" class="admin-button">Save Settings</button>
                    </form>
                    <div id="settings-status" class="status-message" style="display: none;"></div>
                </div>
                
                <div class="admin-section">
                    <h3>Header & Footer</h3>
                    <div class="admin-tabs-secondary">
                        <div class="admin-tab-secondary active" data-section="header">Header</div>
                        <div class="admin-tab-secondary" data-section="footer">Footer</div>
                    </div>
                    
                    <div id="header-section" class="admin-section-content">
                        <form id="admin-header-form">
                            <div class="form-group">
                                <label for="header-logo-text">Logo Text:</label>
                                <input type="text" id="header-logo-text" name="logoText">
                            </div>
                            <div class="form-group">
                                <label for="header-menu-items">Menu Items (one per line):</label>
                                <textarea id="header-menu-items" name="menuItems" rows="4"></textarea>
                            </div>
                            <button type="submit" class="admin-button">Save Header</button>
                        </form>
                    </div>
                    
                    <div id="footer-section" class="admin-section-content" style="display: none;">
                        <form id="admin-footer-form">
                            <div class="form-group">
                                <label for="footer-copyright">Copyright Text:</label>
                                <input type="text" id="footer-copyright" name="copyright">
                            </div>
                            <div class="form-group">
                                <label for="footer-contact-info">Contact Information:</label>
                                <textarea id="footer-contact-info" name="contactInfo" rows="3"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="footer-about">About the Celebration:</label>
                                <textarea id="footer-about" name="about" rows="4"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="footer-quick-links">Quick Links (one per line):</label>
                                <textarea id="footer-quick-links" name="quickLinks" rows="4"></textarea>
                            </div>
                            <button type="submit" class="admin-button">Save Footer</button>
                        </form>
                    </div>
                    <div id="header-footer-status" class="status-message" style="display: none;"></div>
                </div>
            </div>
            
            <!-- Debug Tab -->
            <div class="admin-tab-content" id="debug-tab">
                <div class="admin-section">
                    <h3>API Connection Test</h3>
                    <button id="test-connection" class="admin-button">Test API Connection</button>
                    <div id="connection-status" class="status-message" style="display: none;"></div>
                </div>
                
                <div class="admin-section">
                    <h3>Debug Log</h3>
                    <div id="admin-debug-log" class="admin-debug"></div>
                    <button id="clear-debug-log" class="admin-button">Clear Log</button>
                </div>
                
                <div class="admin-section">
                    <h3>Local Storage</h3>
                    <button id="view-local-storage" class="admin-button">View Local Storage</button>
                    <button id="clear-local-storage" class="admin-button">Clear Local Storage</button>
                    <div id="local-storage-content" class="admin-debug" style="margin-top: 10px;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(adminPanel);
        
        // Create modals for add/edit forms
        createModals();
        
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
        
        // Secondary tabs (header/footer)
        const secondaryTabs = adminPanel.querySelectorAll('.admin-tab-secondary');
        const sectionContents = adminPanel.querySelectorAll('.admin-section-content');
        
        secondaryTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                
                // Remove active class from all tabs
                secondaryTabs.forEach(t => t.classList.remove('active'));
                sectionContents.forEach(c => c.style.display = 'none');
                
                // Add active class to clicked tab and show corresponding content
                this.classList.add('active');
                document.getElementById(sectionId + '-section').style.display = 'block';
            });
        });
        
        // Initialize admin functionality
        initializeAdminFunctionality();
    }
    
    // Function to create modals for add/edit forms
    function createModals() {
        // Event Modal
        const eventModal = document.createElement('div');
        eventModal.className = 'admin-modal';
        eventModal.id = 'event-modal';
        eventModal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3 id="event-modal-title">Add New Event</h3>
                    <button class="admin-modal-close">&times;</button>
                </div>
                <form id="admin-event-form">
                    <input type="hidden" id="event-id" name="id">
                    <div class="admin-form-row">
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="event-title">Event Title:</label>
                                <input type="text" id="event-title" name="title" required>
                            </div>
                        </div>
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="event-day">Day:</label>
                                <select id="event-day" name="day">
                                    <option value="day1">Day 1 (April 24)</option>
                                    <option value="day2">Day 2 (April 25)</option>
                                    <option value="day3">Day 3 (April 26)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="admin-form-row">
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="event-date">Date:</label>
                                <input type="date" id="event-date" name="date" required>
                            </div>
                        </div>
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="event-time">Start Time:</label>
                                <input type="time" id="event-time" name="time" required>
                            </div>
                        </div>
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="event-end-time">End Time:</label>
                                <input type="time" id="event-end-time" name="endTime">
                            </div>
                        </div>
                    </div>
                    <div class="admin-form-row">
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="event-location">Location:</label>
                                <input type="text" id="event-location" name="location">
                            </div>
                        </div>
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="event-dress-code">Dress Code:</label>
                                <input type="text" id="event-dress-code" name="dressCode" placeholder="e.g., Formal, Casual">
                            </div>
                        </div>
                    </div>
                    <div class="admin-form-row">
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="event-website">Website URL:</label>
                                <input type="url" id="event-website" name="website" placeholder="https://...">
                            </div>
                        </div>
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="event-map">Map URL:</label>
                                <input type="url" id="event-map" name="map" placeholder="https://maps.google.com/...">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="event-description">Description:</label>
                        <textarea id="event-description" name="description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="event-notes">Notes:</label>
                        <textarea id="event-notes" name="notes" rows="3"></textarea>
                    </div>
                    <div class="admin-modal-footer">
                        <button type="button" class="admin-button cancel" id="event-cancel">Cancel</button>
                        <button type="submit" class="admin-button" id="event-save">Save Event</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(eventModal);
        
        // Contact Modal
        const contactModal = document.createElement('div');
        contactModal.className = 'admin-modal';
        contactModal.id = 'contact-modal';
        contactModal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3 id="contact-modal-title">Add New Contact</h3>
                    <button class="admin-modal-close">&times;</button>
                </div>
                <form id="admin-contact-form">
                    <input type="hidden" id="contact-id" name="id">
                    <div class="admin-form-row">
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="contact-name">Name:</label>
                                <input type="text" id="contact-name" name="name" required>
                            </div>
                        </div>
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="contact-email">Email:</label>
                                <input type="email" id="contact-email" name="email">
                            </div>
                        </div>
                    </div>
                    <div class="admin-form-row">
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="contact-phone">Phone:</label>
                                <input type="tel" id="contact-phone" name="phone">
                            </div>
                        </div>
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="contact-whatsapp">WhatsApp:</label>
                                <input type="tel" id="contact-whatsapp" name="whatsapp">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="contact-notes">Notes:</label>
                        <textarea id="contact-notes" name="notes" rows="3"></textarea>
                    </div>
                    <div class="admin-modal-footer">
                        <button type="button" class="admin-button cancel" id="contact-cancel">Cancel</button>
                        <button type="submit" class="admin-button" id="contact-save">Save Contact</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(contactModal);
        
        // Reminder Modal
        const reminderModal = document.createElement('div');
        reminderModal.className = 'admin-modal';
        reminderModal.id = 'reminder-modal';
        reminderModal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3 id="reminder-modal-title">Add New Reminder</h3>
                    <button class="admin-modal-close">&times;</button>
                </div>
                <form id="admin-reminder-form">
                    <input type="hidden" id="reminder-id" name="id">
                    <div class="form-group">
                        <label for="reminder-title">Title:</label>
                        <input type="text" id="reminder-title" name="title" required>
                    </div>
                    <div class="admin-form-row">
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="reminder-date">Date:</label>
                                <input type="date" id="reminder-date" name="date" required>
                            </div>
                        </div>
                        <div class="admin-form-col">
                            <div class="form-group">
                                <label for="reminder-time">Time:</label>
                                <input type="time" id="reminder-time" name="time">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="reminder-message">Message:</label>
                        <textarea id="reminder-message" name="message" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <div class="admin-checkbox-group">
                            <input type="checkbox" id="reminder-send-whatsapp" name="sendWhatsapp">
                            <label for="reminder-send-whatsapp">Send to WhatsApp contacts</label>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button type="button" class="admin-button cancel" id="reminder-cancel">Cancel</button>
                        <button type="submit" class="admin-button" id="reminder-save">Save Reminder</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(reminderModal);
        
        // Note Modal
        const noteModal = document.createElement('div');
        noteModal.className = 'admin-modal';
        noteModal.id = 'note-modal';
        noteModal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3 id="note-modal-title">Add New Note</h3>
                    <button class="admin-modal-close">&times;</button>
                </div>
                <form id="admin-note-form">
                    <input type="hidden" id="note-id" name="id">
                    <div class="form-group">
                        <label for="note-title">Title:</label>
                        <input type="text" id="note-title" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="note-content">Content:</label>
                        <textarea id="note-content" name="content" rows="5" required></textarea>
                    </div>
                    <div class="admin-modal-footer">
                        <button type="button" class="admin-button cancel" id="note-cancel">Cancel</button>
                        <button type="submit" class="admin-button" id="note-save">Save Note</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(noteModal);
        
        // Add event listeners for modals
        document.querySelectorAll('.admin-modal-close, .admin-button.cancel').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.admin-modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });
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
            
            // Show status message
            showStatus(elementId, message, type) {
                const statusElement = document.getElementById(elementId);
                if (statusElement) {
                    statusElement.className = `status-message ${type || ''}`;
                    statusElement.textContent = message;
                    statusElement.style.display = 'block';
                    
                    // Auto-hide after 5 seconds
                    setTimeout(() => {
                        statusElement.style.display = 'none';
                    }, 5000);
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
            
            // Update data at an API endpoint
            async put(endpoint, id, data) {
                try {
                    this.log(`Updating ${endpoint}/${id}...`, data);
                    const response = await fetch(`${this.baseUrl}/api/${endpoint}/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data),
                        credentials: 'include'
                    });
                    
                    if (!response.ok) {
                        this.log(`Error updating ${endpoint}/${id}:`, { status: response.status, statusText: response.statusText });
                        
                        // Try to get error details
                        let errorDetails = '';
                        try {
                            const errorText = await response.text();
                            errorDetails = errorText;
                        } catch (e) {}
                        
                        // For 401 errors, update in localStorage as fallback
                        if (response.status === 401) {
                            this.log(`Authentication error, updating in localStorage for ${endpoint}/${id}`);
                            return this.updateInLocalStorage(endpoint, id, data);
                        }
                        
                        throw new Error(`Error updating ${endpoint}/${id}: ${response.status} ${response.statusText} ${errorDetails}`);
                    }
                    
                    const responseData = await response.json();
                    this.log(`Successfully updated ${endpoint}/${id}`, responseData);
                    
                    // Update in localStorage as backup
                    this.updateInLocalStorage(endpoint, id, data);
                    
                    return responseData;
                } catch (error) {
                    this.log(`Failed to update ${endpoint}/${id}:`, { error: error.message });
                    
                    // Update in localStorage as fallback
                    return this.updateInLocalStorage(endpoint, id, data);
                }
            },
            
            // Delete data at an API endpoint
            async delete(endpoint, id) {
                try {
                    this.log(`Deleting ${endpoint}/${id}...`);
                    const response = await fetch(`${this.baseUrl}/api/${endpoint}/${id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    
                    if (!response.ok) {
                        this.log(`Error deleting ${endpoint}/${id}:`, { status: response.status, statusText: response.statusText });
                        
                        // Try to get error details
                        let errorDetails = '';
                        try {
                            const errorText = await response.text();
                            errorDetails = errorText;
                        } catch (e) {}
                        
                        // For 401 errors, delete from localStorage as fallback
                        if (response.status === 401) {
                            this.log(`Authentication error, deleting from localStorage for ${endpoint}/${id}`);
                            return this.deleteFromLocalStorage(endpoint, id);
                        }
                        
                        throw new Error(`Error deleting ${endpoint}/${id}: ${response.status} ${response.statusText} ${errorDetails}`);
                    }
                    
                    const responseData = await response.json();
                    this.log(`Successfully deleted ${endpoint}/${id}`, responseData);
                    
                    // Delete from localStorage as backup
                    this.deleteFromLocalStorage(endpoint, id);
                    
                    return responseData;
                } catch (error) {
                    this.log(`Failed to delete ${endpoint}/${id}:`, { error: error.message });
                    
                    // Delete from localStorage as fallback
                    return this.deleteFromLocalStorage(endpoint, id);
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
                    return [];
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
                    } else if (endpoint.includes('reminders')) {
                        return this.saveReminderToLocalStorage(data);
                    } else if (endpoint.includes('notes')) {
                        return this.saveNoteToLocalStorage(data);
                    } else if (endpoint.includes('settings')) {
                        return this.saveSettingsToLocalStorage(data);
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
            
            updateInLocalStorage(endpoint, id, data) {
                try {
                    const key = `jyoti50_${endpoint.replace(/\//g, '_')}`;
                    let existingData = [];
                    try {
                        const existing = localStorage.getItem(key);
                        if (existing) {
                            existingData = JSON.parse(existing);
                        }
                    } catch (e) {}
                    
                    // Make sure existingData is an array
                    if (!Array.isArray(existingData)) {
                        existingData = [];
                    }
                    
                    // Find and update the item
                    const index = existingData.findIndex(item => item.id === id);
                    if (index !== -1) {
                        // Update existing item
                        existingData[index] = { ...existingData[index], ...data, id };
                    } else {
                        // Add as new item if not found
                        existingData.push({ ...data, id });
                    }
                    
                    // Save back to localStorage
                    localStorage.setItem(key, JSON.stringify(existingData));
                    
                    this.log(`Updated ${endpoint}/${id} in localStorage`);
                    return { success: true, id, message: 'Updated in local storage (offline mode)' };
                } catch (error) {
                    this.log(`Error updating ${endpoint}/${id} in localStorage:`, { error: error.message });
                    return { success: false, error: error.message };
                }
            },
            
            deleteFromLocalStorage(endpoint, id) {
                try {
                    const key = `jyoti50_${endpoint.replace(/\//g, '_')}`;
                    let existingData = [];
                    try {
                        const existing = localStorage.getItem(key);
                        if (existing) {
                            existingData = JSON.parse(existing);
                        }
                    } catch (e) {}
                    
                    // Make sure existingData is an array
                    if (!Array.isArray(existingData)) {
                        existingData = [];
                    }
                    
                    // Filter out the item to delete
                    const newData = existingData.filter(item => item.id !== id);
                    
                    // Save back to localStorage
                    localStorage.setItem(key, JSON.stringify(newData));
                    
                    this.log(`Deleted ${endpoint}/${id} from localStorage`);
                    return { success: true, id, message: 'Deleted from local storage (offline mode)' };
                } catch (error) {
                    this.log(`Error deleting ${endpoint}/${id} from localStorage:`, { error: error.message });
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
            
            saveReminderToLocalStorage(reminderData) {
                try {
                    // Get existing reminders
                    let reminders = [];
                    try {
                        const existing = localStorage.getItem('jyoti50_reminders');
                        if (existing) {
                            reminders = JSON.parse(existing);
                        }
                    } catch (e) {}
                    
                    // Add ID if not present
                    if (!reminderData.id) {
                        reminderData.id = `local_${Date.now()}`;
                    }
                    
                    // Add to reminders array
                    reminders.push(reminderData);
                    localStorage.setItem('jyoti50_reminders', JSON.stringify(reminders));
                    
                    this.log('Saved reminder to localStorage:', reminderData);
                    return { success: true, id: reminderData.id, message: 'Reminder saved to local storage (offline mode)' };
                } catch (error) {
                    this.log('Error saving reminder to localStorage:', { error: error.message });
                    return { success: false, error: error.message };
                }
            },
            
            saveNoteToLocalStorage(noteData) {
                try {
                    // Get existing notes
                    let notes = [];
                    try {
                        const existing = localStorage.getItem('jyoti50_notes');
                        if (existing) {
                            notes = JSON.parse(existing);
                        }
                    } catch (e) {}
                    
                    // Add ID if not present
                    if (!noteData.id) {
                        noteData.id = `local_${Date.now()}`;
                    }
                    
                    // Add to notes array
                    notes.push(noteData);
                    localStorage.setItem('jyoti50_notes', JSON.stringify(notes));
                    
                    this.log('Saved note to localStorage:', noteData);
                    return { success: true, id: noteData.id, message: 'Note saved to local storage (offline mode)' };
                } catch (error) {
                    this.log('Error saving note to localStorage:', { error: error.message });
                    return { success: false, error: error.message };
                }
            },
            
            saveSettingsToLocalStorage(settingsData) {
                try {
                    localStorage.setItem('jyoti50_settings', JSON.stringify(settingsData));
                    this.log('Saved settings to localStorage:', settingsData);
                    return { success: true, message: 'Settings saved to local storage (offline mode)' };
                } catch (error) {
                    this.log('Error saving settings to localStorage:', { error: error.message });
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
        loadReminders();
        loadNotes();
        loadSettings();
        
        // Log initialization
        adminApi.log('Enhanced Admin panel initialized');
        
        // Function to set up event handlers
        function setupEventHandlers() {
            // Events
            document.getElementById('add-event-btn').addEventListener('click', function() {
                openEventModal();
            });
            
            document.getElementById('admin-event-form').addEventListener('submit', handleEventSubmit);
            document.getElementById('refresh-events').addEventListener('click', loadEvents);
            
            // Gallery
            document.getElementById('admin-gallery-form').addEventListener('submit', handleGallerySubmit);
            document.getElementById('refresh-gallery').addEventListener('click', loadGallery);
            
            // Contacts
            document.getElementById('add-contact-btn').addEventListener('click', function() {
                openContactModal();
            });
            
            document.getElementById('admin-contact-form').addEventListener('submit', handleContactSubmit);
            document.getElementById('refresh-contacts').addEventListener('click', loadContacts);
            
            // Reminders
            document.getElementById('add-reminder-btn').addEventListener('click', function() {
                openReminderModal();
            });
            
            document.getElementById('admin-reminder-form').addEventListener('submit', handleReminderSubmit);
            document.getElementById('refresh-reminders').addEventListener('click', loadReminders);
            
            // Notes
            document.getElementById('add-note-btn').addEventListener('click', function() {
                openNoteModal();
            });
            
            document.getElementById('admin-note-form').addEventListener('submit', handleNoteSubmit);
            document.getElementById('refresh-notes').addEventListener('click', loadNotes);
            
            // Settings
            document.getElementById('admin-settings-form').addEventListener('submit', handleSettingsSubmit);
            document.getElementById('admin-header-form').addEventListener('submit', handleHeaderSubmit);
            document.getElementById('admin-footer-form').addEventListener('submit', handleFooterSubmit);
            
            // Debug
            document.getElementById('test-connection').addEventListener('click', testApiConnection);
            document.getElementById('clear-debug-log').addEventListener('click', clearDebugLog);
            document.getElementById('view-local-storage').addEventListener('click', viewLocalStorage);
            document.getElementById('clear-local-storage').addEventListener('click', clearLocalStorage);
            
            // Search functionality
            document.getElementById('event-search').addEventListener('input', function() {
                filterEvents(this.value);
            });
            
            document.getElementById('contact-search').addEventListener('input', function() {
                filterContacts(this.value);
            });
        }
        
        // Function to open event modal for adding/editing
        function openEventModal(eventData) {
            const modal = document.getElementById('event-modal');
            const form = document.getElementById('admin-event-form');
            const modalTitle = document.getElementById('event-modal-title');
            
            // Reset form
            form.reset();
            
            if (eventData) {
                // Edit mode
                modalTitle.textContent = 'Edit Event';
                
                // Fill form with event data
                document.getElementById('event-id').value = eventData.id;
                document.getElementById('event-title').value = eventData.title || '';
                document.getElementById('event-date').value = eventData.date || '';
                document.getElementById('event-time').value = eventData.time || '';
                document.getElementById('event-end-time').value = eventData.endTime || '';
                document.getElementById('event-location').value = eventData.location || '';
                document.getElementById('event-description').value = eventData.description || '';
                document.getElementById('event-day').value = eventData.day || 'day1';
                document.getElementById('event-dress-code').value = eventData.dressCode || '';
                document.getElementById('event-website').value = eventData.website || '';
                document.getElementById('event-map').value = eventData.map || '';
                document.getElementById('event-notes').value = eventData.notes || '';
            } else {
                // Add mode
                modalTitle.textContent = 'Add New Event';
                document.getElementById('event-id').value = '';
            }
            
            // Show modal
            modal.classList.add('active');
        }
        
        // Function to open contact modal for adding/editing
        function openContactModal(contactData) {
            const modal = document.getElementById('contact-modal');
            const form = document.getElementById('admin-contact-form');
            const modalTitle = document.getElementById('contact-modal-title');
            
            // Reset form
            form.reset();
            
            if (contactData) {
                // Edit mode
                modalTitle.textContent = 'Edit Contact';
                
                // Fill form with contact data
                document.getElementById('contact-id').value = contactData.id;
                document.getElementById('contact-name').value = contactData.name || '';
                document.getElementById('contact-email').value = contactData.email || '';
                document.getElementById('contact-phone').value = contactData.phone || '';
                document.getElementById('contact-whatsapp').value = contactData.whatsapp || '';
                document.getElementById('contact-notes').value = contactData.notes || '';
            } else {
                // Add mode
                modalTitle.textContent = 'Add New Contact';
                document.getElementById('contact-id').value = '';
            }
            
            // Show modal
            modal.classList.add('active');
        }
        
        // Function to open reminder modal for adding/editing
        function openReminderModal(reminderData) {
            const modal = document.getElementById('reminder-modal');
            const form = document.getElementById('admin-reminder-form');
            const modalTitle = document.getElementById('reminder-modal-title');
            
            // Reset form
            form.reset();
            
            if (reminderData) {
                // Edit mode
                modalTitle.textContent = 'Edit Reminder';
                
                // Fill form with reminder data
                document.getElementById('reminder-id').value = reminderData.id;
                document.getElementById('reminder-title').value = reminderData.title || '';
                document.getElementById('reminder-date').value = reminderData.date || '';
                document.getElementById('reminder-time').value = reminderData.time || '';
                document.getElementById('reminder-message').value = reminderData.message || '';
                document.getElementById('reminder-send-whatsapp').checked = reminderData.sendWhatsapp || false;
            } else {
                // Add mode
                modalTitle.textContent = 'Add New Reminder';
                document.getElementById('reminder-id').value = '';
            }
            
            // Show modal
            modal.classList.add('active');
        }
        
        // Function to open note modal for adding/editing
        function openNoteModal(noteData) {
            const modal = document.getElementById('note-modal');
            const form = document.getElementById('admin-note-form');
            const modalTitle = document.getElementById('note-modal-title');
            
            // Reset form
            form.reset();
            
            if (noteData) {
                // Edit mode
                modalTitle.textContent = 'Edit Note';
                
                // Fill form with note data
                document.getElementById('note-id').value = noteData.id;
                document.getElementById('note-title').value = noteData.title || '';
                document.getElementById('note-content').value = noteData.content || '';
            } else {
                // Add mode
                modalTitle.textContent = 'Add New Note';
                document.getElementById('note-id').value = '';
            }
            
            // Show modal
            modal.classList.add('active');
        }
        
        // Function to load events
        async function loadEvents() {
            const tableBody = document.getElementById('events-table-body');
            if (!tableBody) return;
            
            try {
                // Show loading
                tableBody.innerHTML = '<tr><td colspan="5">Loading events...</td></tr>';
                
                // Fetch events from API
                const events = await adminApi.get('events');
                
                // Clear loading message
                tableBody.innerHTML = '';
                
                if (Array.isArray(events) && events.length > 0) {
                    // Render events
                    events.forEach(event => {
                        const row = document.createElement('tr');
                        
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
                        
                        row.innerHTML = `
                            <td>${event.title || 'Untitled Event'}</td>
                            <td>${displayDate}</td>
                            <td>${event.time || 'N/A'}</td>
                            <td>${event.location || 'N/A'}</td>
                            <td>
                                <button class="admin-button edit" data-id="${event.id}">Edit</button>
                                <button class="admin-button delete" data-id="${event.id}">Delete</button>
                            </td>
                        `;
                        
                        // Add event listeners for edit and delete buttons
                        row.querySelector('.edit').addEventListener('click', function() {
                            openEventModal(event);
                        });
                        
                        row.querySelector('.delete').addEventListener('click', function() {
                            if (confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
                                deleteEvent(event.id);
                            }
                        });
                        
                        tableBody.appendChild(row);
                    });
                } else {
                    // No events found
                    tableBody.innerHTML = '<tr><td colspan="5">No events found. Add your first event using the button above.</td></tr>';
                }
            } catch (error) {
                console.error('Error loading events:', error);
                tableBody.innerHTML = `<tr><td colspan="5">Error loading events: ${error.message}</td></tr>`;
                adminApi.showStatus('event-status', `Error loading events: ${error.message}`, 'status-error');
            }
        }
        
        // Function to filter events based on search input
        function filterEvents(searchText) {
            const tableBody = document.getElementById('events-table-body');
            const rows = tableBody.querySelectorAll('tr');
            
            searchText = searchText.toLowerCase();
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchText)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
        
        // Function to handle event form submission
        async function handleEventSubmit(e) {
            e.preventDefault();
            
            try {
                // Get form values
                const id = document.getElementById('event-id').value;
                const title = document.getElementById('event-title').value;
                const date = document.getElementById('event-date').value;
                const time = document.getElementById('event-time').value;
                const endTime = document.getElementById('event-end-time').value;
                const location = document.getElementById('event-location').value;
                const description = document.getElementById('event-description').value;
                const day = document.getElementById('event-day').value;
                const dressCode = document.getElementById('event-dress-code').value;
                const website = document.getElementById('event-website').value;
                const map = document.getElementById('event-map').value;
                const notes = document.getElementById('event-notes').value;
                
                // Validate required fields
                if (!title || !date) {
                    throw new Error('Title and date are required');
                }
                
                // Create event object
                const eventData = {
                    title,
                    date,
                    time,
                    endTime,
                    location,
                    description,
                    day,
                    dressCode: dressCode || 'Smart Casual',
                    website,
                    map,
                    notes
                };
                
                let result;
                
                if (id) {
                    // Update existing event
                    result = await adminApi.put('events', id, eventData);
                    adminApi.showStatus('event-status', 'Event updated successfully!', 'status-success');
                } else {
                    // Add new event
                    result = await adminApi.post('events', eventData);
                    adminApi.showStatus('event-status', 'Event added successfully!', 'status-success');
                }
                
                // Close modal
                document.getElementById('event-modal').classList.remove('active');
                
                // Reload events
                loadEvents();
            } catch (error) {
                console.error('Error saving event:', error);
                adminApi.showStatus('event-status', `Error saving event: ${error.message}`, 'status-error');
            }
        }
        
        // Function to delete an event
        async function deleteEvent(id) {
            try {
                await adminApi.delete('events', id);
                adminApi.showStatus('event-status', 'Event deleted successfully!', 'status-success');
                loadEvents();
            } catch (error) {
                console.error('Error deleting event:', error);
                adminApi.showStatus('event-status', `Error deleting event: ${error.message}`, 'status-error');
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
                                <p>${item.description || ''}</p>
                                <button class="admin-button delete" data-id="${item.id}">Delete</button>
                            </div>
                        `;
                        
                        // Add event listener for delete button
                        galleryItem.querySelector('.delete').addEventListener('click', function() {
                            if (confirm(`Are you sure you want to delete this image?`)) {
                                deleteGalleryItem(item.id);
                            }
                        });
                        
                        galleryGrid.appendChild(galleryItem);
                    });
                } else {
                    // No gallery items found
                    galleryGrid.innerHTML = '<div class="admin-gallery-item">No images found. Upload your first image using the form above.</div>';
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
                                    <p>${item.description || ''}</p>
                                    <button class="admin-button delete" data-id="${item.id}">Delete</button>
                                </div>
                            `;
                            
                            // Add event listener for delete button
                            galleryItem.querySelector('.delete').addEventListener('click', function() {
                                if (confirm(`Are you sure you want to delete this image?`)) {
                                    deleteGalleryItem(item.id);
                                }
                            });
                            
                            galleryGrid.appendChild(galleryItem);
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading gallery:', error);
                galleryGrid.innerHTML = `<div class="admin-gallery-item">Error loading gallery: ${error.message}</div>`;
                adminApi.showStatus('gallery-status', `Error loading gallery: ${error.message}`, 'status-error');
            }
        }
        
        // Function to handle gallery form submission
        async function handleGallerySubmit(e) {
            e.preventDefault();
            
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
                adminApi.showStatus('gallery-status', 'Uploading image...', '');
                
                // Submit to API
                const result = await adminApi.uploadImage(file, title, description);
                
                // Show success message
                adminApi.showStatus('gallery-status', 'Image uploaded successfully!', 'status-success');
                
                // Reset form
                e.target.reset();
                
                // Reload gallery
                loadGallery();
            } catch (error) {
                console.error('Error uploading image:', error);
                adminApi.showStatus('gallery-status', `Error uploading image: ${error.message}`, 'status-error');
            }
        }
        
        // Function to delete a gallery item
        async function deleteGalleryItem(id) {
            try {
                await adminApi.delete('gallery', id);
                adminApi.showStatus('gallery-status', 'Image deleted successfully!', 'status-success');
                loadGallery();
            } catch (error) {
                console.error('Error deleting image:', error);
                adminApi.showStatus('gallery-status', `Error deleting image: ${error.message}`, 'status-error');
            }
        }
        
        // Function to load contacts
        async function loadContacts() {
            const tableBody = document.getElementById('contacts-table-body');
            if (!tableBody) return;
            
            try {
                // Show loading
                tableBody.innerHTML = '<tr><td colspan="5">Loading contacts...</td></tr>';
                
                // Fetch contacts from API
                const contacts = await adminApi.get('contacts');
                
                // Clear loading message
                tableBody.innerHTML = '';
                
                if (Array.isArray(contacts) && contacts.length > 0) {
                    // Render contacts
                    contacts.forEach(contact => {
                        const row = document.createElement('tr');
                        
                        row.innerHTML = `
                            <td>${contact.name || 'Unnamed Contact'}</td>
                            <td>${contact.email || 'N/A'}</td>
                            <td>${contact.phone || 'N/A'}</td>
                            <td>${contact.whatsapp || 'N/A'}</td>
                            <td>
                                <button class="admin-button edit" data-id="${contact.id}">Edit</button>
                                <button class="admin-button delete" data-id="${contact.id}">Delete</button>
                            </td>
                        `;
                        
                        // Add event listeners for edit and delete buttons
                        row.querySelector('.edit').addEventListener('click', function() {
                            openContactModal(contact);
                        });
                        
                        row.querySelector('.delete').addEventListener('click', function() {
                            if (confirm(`Are you sure you want to delete the contact "${contact.name}"?`)) {
                                deleteContact(contact.id);
                            }
                        });
                        
                        tableBody.appendChild(row);
                    });
                } else {
                    // No contacts found
                    tableBody.innerHTML = '<tr><td colspan="5">No contacts found. Add your first contact using the button above.</td></tr>';
                }
            } catch (error) {
                console.error('Error loading contacts:', error);
                tableBody.innerHTML = `<tr><td colspan="5">Error loading contacts: ${error.message}</td></tr>`;
                adminApi.showStatus('contact-status', `Error loading contacts: ${error.message}`, 'status-error');
            }
        }
        
        // Function to filter contacts based on search input
        function filterContacts(searchText) {
            const tableBody = document.getElementById('contacts-table-body');
            const rows = tableBody.querySelectorAll('tr');
            
            searchText = searchText.toLowerCase();
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchText)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
        
        // Function to handle contact form submission
        async function handleContactSubmit(e) {
            e.preventDefault();
            
            try {
                // Get form values
                const id = document.getElementById('contact-id').value;
                const name = document.getElementById('contact-name').value;
                const email = document.getElementById('contact-email').value;
                const phone = document.getElementById('contact-phone').value;
                const whatsapp = document.getElementById('contact-whatsapp').value;
                const notes = document.getElementById('contact-notes').value;
                
                // Validate required fields
                if (!name) {
                    throw new Error('Name is required');
                }
                
                // Create contact object
                const contactData = {
                    name,
                    email,
                    phone,
                    whatsapp,
                    notes
                };
                
                let result;
                
                if (id) {
                    // Update existing contact
                    result = await adminApi.put('contacts', id, contactData);
                    adminApi.showStatus('contact-status', 'Contact updated successfully!', 'status-success');
                } else {
                    // Add new contact
                    result = await adminApi.post('contacts', contactData);
                    adminApi.showStatus('contact-status', 'Contact added successfully!', 'status-success');
                }
                
                // Close modal
                document.getElementById('contact-modal').classList.remove('active');
                
                // Reload contacts
                loadContacts();
            } catch (error) {
                console.error('Error saving contact:', error);
                adminApi.showStatus('contact-status', `Error saving contact: ${error.message}`, 'status-error');
            }
        }
        
        // Function to delete a contact
        async function deleteContact(id) {
            try {
                await adminApi.delete('contacts', id);
                adminApi.showStatus('contact-status', 'Contact deleted successfully!', 'status-success');
                loadContacts();
            } catch (error) {
                console.error('Error deleting contact:', error);
                adminApi.showStatus('contact-status', `Error deleting contact: ${error.message}`, 'status-error');
            }
        }
        
        // Function to load reminders
        async function loadReminders() {
            const tableBody = document.getElementById('reminders-table-body');
            if (!tableBody) return;
            
            try {
                // Show loading
                tableBody.innerHTML = '<tr><td colspan="4">Loading reminders...</td></tr>';
                
                // Fetch reminders from API
                const reminders = await adminApi.get('reminders');
                
                // Clear loading message
                tableBody.innerHTML = '';
                
                if (Array.isArray(reminders) && reminders.length > 0) {
                    // Render reminders
                    reminders.forEach(reminder => {
                        const row = document.createElement('tr');
                        
                        // Format date for display
                        let displayDate = 'N/A';
                        try {
                            displayDate = new Date(reminder.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        } catch (e) {
                            console.error('Error formatting date:', e);
                        }
                        
                        row.innerHTML = `
                            <td>${reminder.title || 'Untitled Reminder'}</td>
                            <td>${displayDate}</td>
                            <td>${reminder.message || 'No message'}</td>
                            <td>
                                <button class="admin-button edit" data-id="${reminder.id}">Edit</button>
                                <button class="admin-button delete" data-id="${reminder.id}">Delete</button>
                            </td>
                        `;
                        
                        // Add event listeners for edit and delete buttons
                        row.querySelector('.edit').addEventListener('click', function() {
                            openReminderModal(reminder);
                        });
                        
                        row.querySelector('.delete').addEventListener('click', function() {
                            if (confirm(`Are you sure you want to delete the reminder "${reminder.title}"?`)) {
                                deleteReminder(reminder.id);
                            }
                        });
                        
                        tableBody.appendChild(row);
                    });
                } else {
                    // No reminders found
                    tableBody.innerHTML = '<tr><td colspan="4">No reminders found. Add your first reminder using the button above.</td></tr>';
                }
            } catch (error) {
                console.error('Error loading reminders:', error);
                tableBody.innerHTML = `<tr><td colspan="4">Error loading reminders: ${error.message}</td></tr>`;
                adminApi.showStatus('reminder-status', `Error loading reminders: ${error.message}`, 'status-error');
            }
        }
        
        // Function to handle reminder form submission
        async function handleReminderSubmit(e) {
            e.preventDefault();
            
            try {
                // Get form values
                const id = document.getElementById('reminder-id').value;
                const title = document.getElementById('reminder-title').value;
                const date = document.getElementById('reminder-date').value;
                const time = document.getElementById('reminder-time').value;
                const message = document.getElementById('reminder-message').value;
                const sendWhatsapp = document.getElementById('reminder-send-whatsapp').checked;
                
                // Validate required fields
                if (!title || !date || !message) {
                    throw new Error('Title, date, and message are required');
                }
                
                // Create reminder object
                const reminderData = {
                    title,
                    date,
                    time,
                    message,
                    sendWhatsapp
                };
                
                let result;
                
                if (id) {
                    // Update existing reminder
                    result = await adminApi.put('reminders', id, reminderData);
                    adminApi.showStatus('reminder-status', 'Reminder updated successfully!', 'status-success');
                } else {
                    // Add new reminder
                    result = await adminApi.post('reminders', reminderData);
                    adminApi.showStatus('reminder-status', 'Reminder added successfully!', 'status-success');
                }
                
                // Close modal
                document.getElementById('reminder-modal').classList.remove('active');
                
                // Reload reminders
                loadReminders();
            } catch (error) {
                console.error('Error saving reminder:', error);
                adminApi.showStatus('reminder-status', `Error saving reminder: ${error.message}`, 'status-error');
            }
        }
        
        // Function to delete a reminder
        async function deleteReminder(id) {
            try {
                await adminApi.delete('reminders', id);
                adminApi.showStatus('reminder-status', 'Reminder deleted successfully!', 'status-success');
                loadReminders();
            } catch (error) {
                console.error('Error deleting reminder:', error);
                adminApi.showStatus('reminder-status', `Error deleting reminder: ${error.message}`, 'status-error');
            }
        }
        
        // Function to load notes
        async function loadNotes() {
            const tableBody = document.getElementById('notes-table-body');
            if (!tableBody) return;
            
            try {
                // Show loading
                tableBody.innerHTML = '<tr><td colspan="3">Loading notes...</td></tr>';
                
                // Fetch notes from API
                const notes = await adminApi.get('notes');
                
                // Clear loading message
                tableBody.innerHTML = '';
                
                if (Array.isArray(notes) && notes.length > 0) {
                    // Render notes
                    notes.forEach(note => {
                        const row = document.createElement('tr');
                        
                        row.innerHTML = `
                            <td>${note.title || 'Untitled Note'}</td>
                            <td>${note.content || 'No content'}</td>
                            <td>
                                <button class="admin-button edit" data-id="${note.id}">Edit</button>
                                <button class="admin-button delete" data-id="${note.id}">Delete</button>
                            </td>
                        `;
                        
                        // Add event listeners for edit and delete buttons
                        row.querySelector('.edit').addEventListener('click', function() {
                            openNoteModal(note);
                        });
                        
                        row.querySelector('.delete').addEventListener('click', function() {
                            if (confirm(`Are you sure you want to delete the note "${note.title}"?`)) {
                                deleteNote(note.id);
                            }
                        });
                        
                        tableBody.appendChild(row);
                    });
                } else {
                    // No notes found
                    tableBody.innerHTML = '<tr><td colspan="3">No notes found. Add your first note using the button above.</td></tr>';
                }
            } catch (error) {
                console.error('Error loading notes:', error);
                tableBody.innerHTML = `<tr><td colspan="3">Error loading notes: ${error.message}</td></tr>`;
                adminApi.showStatus('note-status', `Error loading notes: ${error.message}`, 'status-error');
            }
        }
        
        // Function to handle note form submission
        async function handleNoteSubmit(e) {
            e.preventDefault();
            
            try {
                // Get form values
                const id = document.getElementById('note-id').value;
                const title = document.getElementById('note-title').value;
                const content = document.getElementById('note-content').value;
                
                // Validate required fields
                if (!title || !content) {
                    throw new Error('Title and content are required');
                }
                
                // Create note object
                const noteData = {
                    title,
                    content
                };
                
                let result;
                
                if (id) {
                    // Update existing note
                    result = await adminApi.put('notes', id, noteData);
                    adminApi.showStatus('note-status', 'Note updated successfully!', 'status-success');
                } else {
                    // Add new note
                    result = await adminApi.post('notes', noteData);
                    adminApi.showStatus('note-status', 'Note added successfully!', 'status-success');
                }
                
                // Close modal
                document.getElementById('note-modal').classList.remove('active');
                
                // Reload notes
                loadNotes();
            } catch (error) {
                console.error('Error saving note:', error);
                adminApi.showStatus('note-status', `Error saving note: ${error.message}`, 'status-error');
            }
        }
        
        // Function to delete a note
        async function deleteNote(id) {
            try {
                await adminApi.delete('notes', id);
                adminApi.showStatus('note-status', 'Note deleted successfully!', 'status-success');
                loadNotes();
            } catch (error) {
                console.error('Error deleting note:', error);
                adminApi.showStatus('note-status', `Error deleting note: ${error.message}`, 'status-error');
            }
        }
        
        // Function to load settings
        async function loadSettings() {
            try {
                // Fetch settings from API
                const settings = await adminApi.get('settings');
                
                // Fill settings form
                if (settings) {
                    document.getElementById('settings-site-title').value = settings.siteTitle || '';
                    document.getElementById('settings-tagline').value = settings.tagline || '';
                    document.getElementById('settings-important-info').value = settings.importantInfo || '';
                }
                
                // Fill header form
                if (settings && settings.header) {
                    document.getElementById('header-logo-text').value = settings.header.logoText || '';
                    document.getElementById('header-menu-items').value = Array.isArray(settings.header.menuItems) ? settings.header.menuItems.join('\n') : '';
                }
                
                // Fill footer form
                if (settings && settings.footer) {
                    document.getElementById('footer-copyright').value = settings.footer.copyright || '';
                    document.getElementById('footer-contact-info').value = settings.footer.contactInfo || '';
                    document.getElementById('footer-about').value = settings.footer.about || '';
                    document.getElementById('footer-quick-links').value = Array.isArray(settings.footer.quickLinks) ? settings.footer.quickLinks.join('\n') : '';
                }
            } catch (error) {
                console.error('Error loading settings:', error);
                adminApi.showStatus('settings-status', `Error loading settings: ${error.message}`, 'status-error');
            }
        }
        
        // Function to handle settings form submission
        async function handleSettingsSubmit(e) {
            e.preventDefault();
            
            try {
                // Get form values
                const siteTitle = document.getElementById('settings-site-title').value;
                const tagline = document.getElementById('settings-tagline').value;
                const importantInfo = document.getElementById('settings-important-info').value;
                
                // Create settings object
                const settingsData = {
                    siteTitle,
                    tagline,
                    importantInfo
                };
                
                // Submit to API
                const result = await adminApi.post('settings', settingsData);
                
                // Show success message
                adminApi.showStatus('settings-status', 'Settings saved successfully!', 'status-success');
            } catch (error) {
                console.error('Error saving settings:', error);
                adminApi.showStatus('settings-status', `Error saving settings: ${error.message}`, 'status-error');
            }
        }
        
        // Function to handle header form submission
        async function handleHeaderSubmit(e) {
            e.preventDefault();
            
            try {
                // Get form values
                const logoText = document.getElementById('header-logo-text').value;
                const menuItemsText = document.getElementById('header-menu-items').value;
                
                // Parse menu items
                const menuItems = menuItemsText.split('\n').filter(item => item.trim() !== '');
                
                // Create header object
                const headerData = {
                    logoText,
                    menuItems
                };
                
                // Submit to API
                const result = await adminApi.post('settings/header', headerData);
                
                // Show success message
                adminApi.showStatus('header-footer-status', 'Header settings saved successfully!', 'status-success');
            } catch (error) {
                console.error('Error saving header settings:', error);
                adminApi.showStatus('header-footer-status', `Error saving header settings: ${error.message}`, 'status-error');
            }
        }
        
        // Function to handle footer form submission
        async function handleFooterSubmit(e) {
            e.preventDefault();
            
            try {
                // Get form values
                const copyright = document.getElementById('footer-copyright').value;
                const contactInfo = document.getElementById('footer-contact-info').value;
                const about = document.getElementById('footer-about').value;
                const quickLinksText = document.getElementById('footer-quick-links').value;
                
                // Parse quick links
                const quickLinks = quickLinksText.split('\n').filter(item => item.trim() !== '');
                
                // Create footer object
                const footerData = {
                    copyright,
                    contactInfo,
                    about,
                    quickLinks
                };
                
                // Submit to API
                const result = await adminApi.post('settings/footer', footerData);
                
                // Show success message
                adminApi.showStatus('header-footer-status', 'Footer settings saved successfully!', 'status-success');
            } catch (error) {
                console.error('Error saving footer settings:', error);
                adminApi.showStatus('header-footer-status', `Error saving footer settings: ${error.message}`, 'status-error');
            }
        }
        
        // Function to test API connection
        async function testApiConnection() {
            const statusElement = document.getElementById('connection-status');
            
            try {
                // Show status
                adminApi.showStatus('connection-status', 'Testing API connection...', '');
                
                // Test connection
                const result = await adminApi.checkConnection();
                
                // Show result
                if (result.status === 'success') {
                    adminApi.showStatus('connection-status', `API connection successful: ${result.message || 'Connected to API'}`, 'status-success');
                } else {
                    adminApi.showStatus('connection-status', `API connection failed: ${result.message || 'Unknown error'}`, 'status-error');
                }
            } catch (error) {
                console.error('Error testing API connection:', error);
                adminApi.showStatus('connection-status', `Error testing API connection: ${error.message}`, 'status-error');
            }
        }
        
        // Function to clear debug log
        function clearDebugLog() {
            const debugLog = document.getElementById('admin-debug-log');
            if (debugLog) {
                debugLog.innerHTML = '';
            }
        }
        
        // Function to view local storage
        function viewLocalStorage() {
            const localStorageContent = document.getElementById('local-storage-content');
            if (localStorageContent) {
                let content = '';
                
                // Get all jyoti50_ keys
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('jyoti50_')) {
                        try {
                            const value = localStorage.getItem(key);
                            const parsedValue = JSON.parse(value);
                            content += `<strong>${key}:</strong> ${Array.isArray(parsedValue) ? parsedValue.length + ' items' : 'Object'}<br>`;
                        } catch (e) {
                            content += `<strong>${key}:</strong> Error parsing value<br>`;
                        }
                    }
                }
                
                if (content === '') {
                    content = 'No Jyoti50 data found in local storage.';
                }
                
                localStorageContent.innerHTML = content;
            }
        }
        
        // Function to clear local storage
        function clearLocalStorage() {
            if (confirm('Are you sure you want to clear all Jyoti50 data from local storage? This cannot be undone.')) {
                // Get all jyoti50_ keys
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('jyoti50_')) {
                        keysToRemove.push(key);
                    }
                }
                
                // Remove all keys
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                // Update view
                viewLocalStorage();
                
                // Show message
                adminApi.log('Cleared all Jyoti50 data from local storage');
                alert('Local storage cleared successfully.');
            }
        }
    }
})();
