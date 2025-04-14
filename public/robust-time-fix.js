// Robust Time Fix for Jyoti50 Celebration Admin
// This script fixes the issue with time values not saving properly in the admin dashboard

(function() {
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Robust time fix script loaded');
        
        // Function to fix the event form submission
        function fixEventFormSubmission() {
            // Find the event form
            const eventForm = document.querySelector('#event-form');
            
            if (eventForm) {
                console.log('Event form found, adding direct submission fix');
                
                // Find the submit button instead of overriding the form submission
                const submitButton = eventForm.querySelector('button[type="submit"]');
                
                if (submitButton) {
                    // Create a new button to replace the original
                    const newSubmitButton = document.createElement('button');
                    newSubmitButton.type = 'button'; // Not submit to prevent form submission
                    newSubmitButton.className = submitButton.className;
                    newSubmitButton.innerHTML = submitButton.innerHTML;
                    
                    // Replace the original button
                    submitButton.parentNode.replaceChild(newSubmitButton, submitButton);
                    
                    // Add click handler to the new button
                    newSubmitButton.addEventListener('click', function(event) {
                        // Prevent any default behavior
                        event.preventDefault();
                        event.stopPropagation();
                        
                        console.log('Custom submit button clicked');
                        
                        // Get form data
                        const formData = new FormData(eventForm);
                        const eventData = {};
                        
                        // Convert FormData to a regular object
                        for (const [key, value] of formData.entries()) {
                            eventData[key] = value;
                        }
                        
                        // Get the time inputs directly
                        const startTimeInput = eventForm.querySelector('input[name="startTime"]');
                        const endTimeInput = eventForm.querySelector('input[name="endTime"]');
                        
                        // Ensure time values are properly formatted and included
                        if (startTimeInput && startTimeInput.value) {
                            // Store the original value for logging
                            const originalStartTime = startTimeInput.value;
                            
                            // Make sure startTime is in the correct format (HH:MM)
                            let formattedStartTime = originalStartTime;
                            
                            // Try to format if it contains AM/PM
                            if (originalStartTime.toLowerCase().includes('am') || originalStartTime.toLowerCase().includes('pm')) {
                                try {
                                    // Parse time with AM/PM
                                    const timeMatch = originalStartTime.match(/(\d+):(\d+)\s*(am|pm)?/i);
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
                                        formattedStartTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                                    }
                                } catch (error) {
                                    console.error('Error formatting start time:', error);
                                    formattedStartTime = originalStartTime;
                                }
                            }
                            
                            // Set the formatted time in the event data
                            eventData.startTime = formattedStartTime;
                            console.log(`Start time: Original=${originalStartTime}, Formatted=${formattedStartTime}`);
                        }
                        
                        if (endTimeInput && endTimeInput.value) {
                            // Store the original value for logging
                            const originalEndTime = endTimeInput.value;
                            
                            // Make sure endTime is in the correct format (HH:MM)
                            let formattedEndTime = originalEndTime;
                            
                            // Try to format if it contains AM/PM
                            if (originalEndTime.toLowerCase().includes('am') || originalEndTime.toLowerCase().includes('pm')) {
                                try {
                                    // Parse time with AM/PM
                                    const timeMatch = originalEndTime.match(/(\d+):(\d+)\s*(am|pm)?/i);
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
                                        formattedEndTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                                    }
                                } catch (error) {
                                    console.error('Error formatting end time:', error);
                                    formattedEndTime = originalEndTime;
                                }
                            }
                            
                            // Set the formatted time in the event data
                            eventData.endTime = formattedEndTime;
                            console.log(`End time: Original=${originalEndTime}, Formatted=${formattedEndTime}`);
                        }
                        
                        console.log('Submitting event with fixed time values:', eventData);
                        
                        // Determine if this is an edit or a new event
                        const eventId = eventData.id || '';
                        
                        // Remove id from the data object to avoid conflicts
                        delete eventData.id;
                        
                        // Use direct fetch instead of the API wrapper to avoid asynchronous issues
                        if (eventId) {
                            // Update existing event
                            console.log(`Updating event ${eventId} with direct fetch`);
                            
                            fetch(`/api/events/${eventId}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(eventData)
                            })
                            .then(response => {
                                if (!response.ok) {
                                    return response.json().then(err => {
                                        throw new Error(`Error updating event: ${err.message || response.statusText}`);
                                    });
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('Event updated successfully:', data);
                                // Close the modal and refresh the events list
                                closeModal('event-modal');
                                // Refresh the events list
                                if (typeof refreshEvents === 'function') {
                                    refreshEvents();
                                } else if (window.adminAPI && typeof window.adminAPI.refreshEvents === 'function') {
                                    window.adminAPI.refreshEvents();
                                } else {
                                    console.log('Refreshing page to show updated events');
                                    window.location.reload();
                                }
                            })
                            .catch(error => {
                                console.error('Error updating event:', error);
                                showStatus('event-status', `Error updating event: ${error.message}`, 'status-error');
                            });
                        } else {
                            // Create new event
                            console.log('Creating new event with direct fetch');
                            
                            fetch('/api/events', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(eventData)
                            })
                            .then(response => {
                                if (!response.ok) {
                                    return response.json().then(err => {
                                        throw new Error(`Error creating event: ${err.message || response.statusText}`);
                                    });
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('Event created successfully:', data);
                                // Close the modal and refresh the events list
                                closeModal('event-modal');
                                // Refresh the events list
                                if (typeof refreshEvents === 'function') {
                                    refreshEvents();
                                } else if (window.adminAPI && typeof window.adminAPI.refreshEvents === 'function') {
                                    window.adminAPI.refreshEvents();
                                } else {
                                    console.log('Refreshing page to show new event');
                                    window.location.reload();
                                }
                            })
                            .catch(error => {
                                console.error('Error creating event:', error);
                                showStatus('event-status', `Error creating event: ${error.message}`, 'status-error');
                            });
                        }
                    });
                    
                    console.log('Custom submit button installed');
                } else {
                    console.warn('Submit button not found in event form');
                }
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
                                        // Don't disconnect observer to handle multiple modal openings
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
        
        // Initialize fix
        fixEventFormSubmission();
        console.log('Robust time fix initialized');
    });
})();
