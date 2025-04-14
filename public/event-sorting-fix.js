// Event Sorting Fix for Jyoti50 Celebration Website
// This script enhances the event sorting functionality to ensure events display in chronological order

(function() {
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Event sorting fix script loaded');
        
        // Function to enhance event sorting
        function enhanceEventSorting() {
            // Override the displayEvents function to ensure proper sorting
            const originalDisplayEvents = window.displayEvents;
            
            if (typeof originalDisplayEvents === 'function') {
                window.displayEvents = function(container, events) {
                    console.log('Enhanced event sorting activated');
                    
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
                        
                        // Handle various time formats
                        // Format: HH:MM
                        const standardMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
                        if (standardMatch) {
                            const hours = parseInt(standardMatch[1], 10);
                            const minutes = parseInt(standardMatch[2], 10);
                            return hours * 60 + minutes;
                        }
                        
                        // Format: HH:MM AM/PM
                        const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
                        if (ampmMatch) {
                            let hours = parseInt(ampmMatch[1], 10);
                            const minutes = parseInt(ampmMatch[2], 10);
                            const period = ampmMatch[3].toLowerCase();
                            
                            // Convert to 24-hour format
                            if (period === 'pm' && hours < 12) {
                                hours += 12;
                            } else if (period === 'am' && hours === 12) {
                                hours = 0;
                            }
                            
                            return hours * 60 + minutes;
                        }
                        
                        // Special case for "All Day" events - put them at the beginning
                        if (timeStr.toLowerCase().includes('all day')) {
                            return -1;
                        }
                        
                        // Default to 0 if format is unrecognized
                        return 0;
                    }
                    
                    // Sort events by date and time
                    events.sort((a, b) => {
                        // First sort by date
                        const dateA = new Date(a.date);
                        const dateB = new Date(b.date);
                        
                        if (!isNaN(dateA) && !isNaN(dateB) && dateA.getTime() !== dateB.getTime()) {
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
                            if (!isNaN(date)) {
                                day = date.toLocaleDateString('en-US', { weekday: 'long' });
                            } else {
                                day = event.day;
                            }
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
                    
                    // Clear the container
                    container.innerHTML = '';
                    
                    // Create HTML for each day's events
                    Object.keys(eventsByDay).forEach(day => {
                        const dayEvents = eventsByDay[day];
                        const dayContainer = document.createElement('div');
                        dayContainer.className = `day-events ${day.toLowerCase()}`;
                        dayContainer.style.display = day === 'Thursday' ? 'block' : 'none'; // Show Thursday by default
                        
                        if (dayEvents.length === 0) {
                            dayContainer.innerHTML = `<p class="no-data">No events scheduled for ${day}.</p>`;
                        } else {
                            const eventsHTML = dayEvents.map(event => {
                                // Determine dress code (use default if not specified)
                                const dressCode = event.dressCode || 'Smart Casual';
                                
                                // Format time display
                                let timeDisplay = 'Time not specified';
                                if (event.startTime) {
                                    timeDisplay = event.startTime;
                                    if (event.endTime) {
                                        timeDisplay += ` - ${event.endTime}`;
                                    }
                                }
                                
                                return `
                                    <div class="event-card">
                                        <h3>${event.title || 'Untitled Event'}</h3>
                                        <p class="event-date"><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}</p>
                                        <p class="event-time"><i class="fas fa-clock"></i> ${timeDisplay}</p>
                                        <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location || 'No location specified'}</p>
                                        <p class="event-dress-code"><i class="fas fa-tshirt"></i> Dress Code: ${dressCode}</p>
                                        <button class="dress-code-button" onclick="toggleDressCode(this)">
                                            <i class="fas fa-info-circle"></i> Dress Code Details
                                        </button>
                                        <div class="dress-code-info" style="display: none;">
                                            ${getDressCodeDescription(dressCode)}
                                        </div>
                                        <p class="event-description">${event.description || 'No description available.'}</p>
                                        ${event.mapUrl ? `<a href="${event.mapUrl}" target="_blank" class="event-button"><i class="fas fa-map"></i> View Map</a>` : ''}
                                        ${event.websiteUrl ? `<a href="${event.websiteUrl}" target="_blank" class="event-button"><i class="fas fa-globe"></i> View Website</a>` : ''}
                                    </div>
                                `;
                            }).join('');
                            
                            dayContainer.innerHTML = eventsHTML;
                        }
                        
                        container.appendChild(dayContainer);
                    });
                    
                    // Add event listeners for dress code buttons
                    setupDressCodeButtons();
                };
                
                console.log('Event sorting function enhanced');
            } else {
                console.warn('Original displayEvents function not found, will try again later');
                
                // Try again after a short delay to allow other scripts to load
                setTimeout(enhanceEventSorting, 1000);
            }
        }
        
        // Initialize the enhancement
        enhanceEventSorting();
    });
})();
