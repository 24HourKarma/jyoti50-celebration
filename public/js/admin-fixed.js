// Fixed Admin Dashboard Date Handling

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the admin dashboard page
    if (!document.getElementById('events-container')) return;
    
    // Override the formatDateForDisplay function to fix date handling
    window.formatDateForDisplay = function(dateStr) {
        // If it's already in the format "April XX, 2025", return it as is
        if (/^April \d+, 2025$/.test(dateStr)) {
            return dateStr;
        }
        
        try {
            // If it's in YYYY-MM-DD format (from the date input)
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                const [year, month, day] = dateStr.split('-').map(Number);
                
                // Ensure it's April 2025 and within the valid range (24-27)
                if (year === 2025 && month === 4 && day >= 24 && day <= 27) {
                    return `April ${day}, 2025`;
                }
            }
            
            // If it's in the format "April 24-27, 2025", extract the specific day if possible
            const rangeMatch = dateStr.match(/April (\d+)-\d+, 2025/);
            if (rangeMatch && rangeMatch[1]) {
                return `April ${rangeMatch[1]}, 2025`;
            }
            
            // If we have a specific day in the string, extract and format it
            const dayMatch = dateStr.match(/April (\d+)/);
            if (dayMatch && dayMatch[1]) {
                const day = parseInt(dayMatch[1]);
                if (day >= 24 && day <= 27) {
                    return `April ${day}, 2025`;
                }
            }
            
            // Default to April 24, 2025 only as a last resort
            console.warn('Date outside expected range or invalid format:', dateStr);
            return 'April 24, 2025';
        } catch (error) {
            console.error('Error formatting date:', error, dateStr);
            return 'April 24, 2025';
        }
    };
    
    // Override the showEventModal function to fix date handling in the form
    const originalShowEventModal = window.showEventModal;
    if (typeof originalShowEventModal === 'function') {
        window.showEventModal = function(event = null) {
            // Call the original function
            originalShowEventModal(event);
            
            // Add additional event listener to the form submission
            const saveBtn = document.querySelector('#save-btn');
            if (saveBtn) {
                // Remove any existing event listeners
                const newSaveBtn = saveBtn.cloneNode(true);
                saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
                
                // Add our fixed event listener
                newSaveBtn.addEventListener('click', function() {
                    handleFixedEventFormSubmit(event ? event._id : null);
                });
            }
        };
    }
    
    // Fixed event form submission handler
    function handleFixedEventFormSubmit(eventId) {
        // Get form values
        const title = document.getElementById('event-title').value;
        const dateSelect = document.getElementById('event-date');
        const date = dateSelect ? dateSelect.value : '';
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
        
        // Format day based on the selected date - FIXED VERSION
        let day;
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            // Extract day from YYYY-MM-DD format
            const dayNum = parseInt(date.split('-')[2]);
            day = `April ${dayNum}, 2025`;
        } else {
            // If somehow the date is already formatted or invalid, use the formatDateForDisplay function
            day = window.formatDateForDisplay(date);
        }
        
        // Create event object
        const eventData = {
            title,
            date,
            day, // This is the fixed day value
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
            const modal = document.querySelector('.modal');
            const backdrop = document.querySelector('.modal-backdrop');
            if (modal) document.body.removeChild(modal);
            if (backdrop) document.body.removeChild(backdrop);
            
            // Reload events
            if (typeof loadEvents === 'function') {
                loadEvents();
            }
            
            // Show success message
            if (typeof showAlert === 'function') {
                showAlert('success', `Event ${eventId ? 'updated' : 'added'} successfully`);
            }
        })
        .catch(error => {
            console.error('Error saving event:', error);
            if (typeof showAlert === 'function') {
                showAlert('danger', `Failed to ${eventId ? 'update' : 'add'} event`);
            }
        });
    }
});
