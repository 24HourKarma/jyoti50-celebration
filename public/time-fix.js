// Time Fix for Jyoti50 Celebration Admin
// This script fixes the issue with AM/PM time values not saving properly in the admin dashboard

(function() {
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Time fix script loaded');
        
        // Function to fix time input handling
        function fixTimeInputs() {
            // Find all time input fields in the event form
            const timeInputs = document.querySelectorAll('input[type="time"]');
            
            timeInputs.forEach(input => {
                // Store the original value when the input is focused
                input.addEventListener('focus', function() {
                    this.setAttribute('data-original-value', this.value);
                    console.log('Time input focused:', this.value);
                });
                
                // Fix the time format when the input loses focus
                input.addEventListener('blur', function() {
                    // If the input is empty, don't do anything
                    if (!this.value) return;
                    
                    console.log('Time input blurred:', this.value);
                    
                    // Parse the time value to ensure it's in the correct format
                    try {
                        // Extract hours and minutes
                        const timeMatch = this.value.match(/(\d+):(\d+)\s*(am|pm)?/i);
                        
                        if (timeMatch) {
                            let hours = parseInt(timeMatch[1], 10);
                            const minutes = parseInt(timeMatch[2], 10);
                            const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
                            
                            // Convert to 24-hour format if AM/PM is specified
                            if (ampm === 'pm' && hours < 12) {
                                hours += 12;
                            } else if (ampm === 'am' && hours === 12) {
                                hours = 0;
                            }
                            
                            // Format the time in HH:MM format
                            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            this.value = formattedTime;
                            
                            console.log('Formatted time:', formattedTime);
                        }
                    } catch (error) {
                        console.error('Error formatting time:', error);
                        // Restore original value if there's an error
                        if (this.hasAttribute('data-original-value')) {
                            this.value = this.getAttribute('data-original-value');
                        }
                    }
                });
            });
        }
        
        // Function to fix the event form submission
        function fixEventFormSubmission() {
            // Find the event form
            const eventForm = document.querySelector('#event-form');
            
            if (eventForm) {
                console.log('Event form found, adding submission fix');
                
                // Override the form submission
                eventForm.addEventListener('submit', function(event) {
                    // Prevent the default form submission
                    event.preventDefault();
                    
                    // Get form data
                    const formData = new FormData(eventForm);
                    const eventData = {};
                    
                    // Convert FormData to a regular object
                    for (const [key, value] of formData.entries()) {
                        eventData[key] = value;
                    }
                    
                    // Ensure time values are properly formatted
                    if (eventData.startTime) {
                        // Make sure startTime is in the correct format (HH:MM)
                        const startTimeMatch = eventData.startTime.match(/(\d+):(\d+)/);
                        if (startTimeMatch) {
                            const hours = parseInt(startTimeMatch[1], 10);
                            const minutes = parseInt(startTimeMatch[2], 10);
                            eventData.startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        }
                    }
                    
                    if (eventData.endTime) {
                        // Make sure endTime is in the correct format (HH:MM)
                        const endTimeMatch = eventData.endTime.match(/(\d+):(\d+)/);
                        if (endTimeMatch) {
                            const hours = parseInt(endTimeMatch[1], 10);
                            const minutes = parseInt(endTimeMatch[2], 10);
                            eventData.endTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        }
                    }
                    
                    console.log('Submitting event with fixed time values:', eventData);
                    
                    // Get the API instance
                    const api = window.adminAPI;
                    
                    if (!api) {
                        console.error('API not found');
                        return;
                    }
                    
                    // Determine if this is an edit or a new event
                    const eventId = eventData.id || '';
                    
                    // Remove id from the data object to avoid conflicts
                    delete eventData.id;
                    
                    // Submit the event data
                    if (eventId) {
                        // Update existing event
                        api.put('events', eventId, eventData)
                            .then(response => {
                                console.log('Event updated successfully:', response);
                                // Close the modal and refresh the events list
                                closeModal('event-modal');
                                api.refreshEvents();
                            })
                            .catch(error => {
                                console.error('Error updating event:', error);
                                showStatus('event-status', `Error updating event: ${error.message}`, 'status-error');
                            });
                    } else {
                        // Create new event
                        api.post('events', eventData)
                            .then(response => {
                                console.log('Event created successfully:', response);
                                // Close the modal and refresh the events list
                                closeModal('event-modal');
                                api.refreshEvents();
                            })
                            .catch(error => {
                                console.error('Error creating event:', error);
                                showStatus('event-status', `Error creating event: ${error.message}`, 'status-error');
                            });
                    }
                });
            } else {
                console.log('Event form not found, will try again when modal opens');
                
                // Set up a mutation observer to detect when the form is added to the DOM
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                            for (let i = 0; i < mutation.addedNodes.length; i++) {
                                const node = mutation.addedNodes[i];
                                if (node.nodeType === 1 && node.matches('#event-modal')) {
                                    // Modal has been added, check for the form
                                    const form = node.querySelector('#event-form');
                                    if (form) {
                                        console.log('Event form found after modal opened');
                                        fixEventFormSubmission();
                                        // Stop observing once we've found and fixed the form
                                        observer.disconnect();
                                    }
                                }
                            }
                        }
                    });
                });
                
                // Start observing the document body for changes
                observer.observe(document.body, { childList: true, subtree: true });
            }
        }
        
        // Function to fix the event display and sorting
        function fixEventSorting() {
            // Override the displayEvents function to ensure proper sorting
            const originalDisplayEvents = window.displayEvents;
            
            if (typeof originalDisplayEvents === 'function') {
                window.displayEvents = function(container, events) {
                    console.log('Using enhanced event sorting');
                    
                    // Group events by day
                    const eventsByDay = {
                        'Thursday': [],
                        'Friday': [],
                        'Saturday': [],
                        'Sunday': []
                    };
                    
                    // Helper function to convert time string to minutes for comparison
                    function timeToMinutes(timeStr) {
                        if (!timeStr) return 0;
                        
                        const match = timeStr.match(/(\d+):(\d+)/);
                        if (!match) return 0;
                        
                        const hours = parseInt(match[1], 10);
                        const minutes = parseInt(match[2], 10);
                        
                        return hours * 60 + minutes;
                    }
                    
                    // Sort events by date and time
                    events.sort((a, b) => {
                        // First sort by date
                        const dateA = new Date(a.date);
                        const dateB = new Date(b.date);
                        
                        if (dateA.getTime() !== dateB.getTime()) {
                            return dateA - dateB;
                        }
                        
                        // Then sort by time
                        const timeA = timeToMinutes(a.startTime);
                        const timeB = timeToMinutes(b.startTime);
                        
                        return timeA - timeB;
                    });
                    
                    // Group events by day
                    events.forEach(event => {
                        // Try to determine the day from the date
                        let day = '';
                        try {
                            const date = new Date(event.date);
                            day = date.toLocaleDateString('en-US', { weekday: 'long' });
                        } catch (error) {
                            console.error('Error parsing date:', error);
                            // If we can't parse the date, use the day property
                            day = event.day;
                        }
                        
                        // Make sure the day is one of our predefined days
                        if (eventsByDay[day]) {
                            eventsByDay[day].push(event);
                        } else {
                            // If day doesn't match our predefined days, use the day property
                            if (eventsByDay[event.day]) {
                                eventsByDay[event.day].push(event);
                            } else {
                                // If all else fails, put in Thursday as default
                                eventsByDay['Thursday'].push(event);
                            }
                        }
                    });
                    
                    // Call the original function with our sorted events
                    originalDisplayEvents(container, events);
                };
                
                console.log('Event sorting function enhanced');
            } else {
                console.warn('Original displayEvents function not found');
            }
        }
        
        // Initialize all fixes
        function initFixes() {
            fixTimeInputs();
            fixEventFormSubmission();
            fixEventSorting();
            console.log('All time and sorting fixes initialized');
        }
        
        // Helper function to close a modal (copied from admin code)
        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        }
        
        // Helper function to show status messages (copied from admin code)
        function showStatus(elementId, message, className) {
            const statusElement = document.getElementById(elementId);
            if (statusElement) {
                statusElement.textContent = message;
                statusElement.className = className || '';
                statusElement.style.display = 'block';
                
                // Hide the status message after 5 seconds
                setTimeout(() => {
                    statusElement.style.display = 'none';
                }, 5000);
            }
        }
        
        // Initialize fixes
        initFixes();
    });
})();
