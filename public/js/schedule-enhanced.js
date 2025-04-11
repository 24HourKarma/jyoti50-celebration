// Enhanced Schedule Display JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get the schedule container
    const scheduleContainer = document.getElementById('schedule-container');
    
    // Function to format time in a more readable format
    function formatTime(timeString) {
        if (!timeString) return '';
        
        // Check if it's already in HH:MM format
        if (/^\d{2}:\d{2}$/.test(timeString)) {
            // Convert 24-hour format to 12-hour format with AM/PM
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12; // Convert 0 to 12
            return `${hour12}:${minutes} ${ampm}`;
        }
        
        return timeString;
    }
    
    // Function to get appropriate icon for event type
    function getEventIcon(title, description) {
        const lowerTitle = title.toLowerCase();
        const lowerDesc = description ? description.toLowerCase() : '';
        
        if (lowerTitle.includes('breakfast') || lowerDesc.includes('breakfast')) {
            return 'fas fa-coffee';
        } else if (lowerTitle.includes('lunch') || lowerDesc.includes('lunch')) {
            return 'fas fa-utensils';
        } else if (lowerTitle.includes('dinner') || lowerDesc.includes('dinner')) {
            return 'fas fa-utensils';
        } else if (lowerTitle.includes('tour') || lowerDesc.includes('tour')) {
            return 'fas fa-map-marked-alt';
        } else if (lowerTitle.includes('party') || lowerDesc.includes('party') || 
                  lowerTitle.includes('celebration') || lowerDesc.includes('celebration')) {
            return 'fas fa-glass-cheers';
        } else if (lowerTitle.includes('ceremony') || lowerDesc.includes('ceremony')) {
            return 'fas fa-heart';
        } else if (lowerTitle.includes('photo') || lowerDesc.includes('photo')) {
            return 'fas fa-camera';
        } else if (lowerTitle.includes('speech') || lowerDesc.includes('speech') || 
                  lowerTitle.includes('talk') || lowerDesc.includes('talk')) {
            return 'fas fa-microphone';
        } else if (lowerTitle.includes('travel') || lowerDesc.includes('travel') || 
                  lowerTitle.includes('transport') || lowerDesc.includes('transport')) {
            return 'fas fa-shuttle-van';
        } else if (lowerTitle.includes('check') || lowerDesc.includes('check')) {
            return 'fas fa-hotel';
        } else {
            return 'fas fa-calendar-day';
        }
    }
    
    // Function to get day icon
    function getDayIcon(day) {
        if (day.includes('24')) {
            return 'fas fa-calendar-day';
        } else if (day.includes('25')) {
            return 'fas fa-calendar-day';
        } else if (day.includes('26')) {
            return 'fas fa-calendar-day';
        } else if (day.includes('27')) {
            return 'fas fa-calendar-day';
        } else {
            return 'fas fa-calendar-day';
        }
    }
    
    // Function to create a loading spinner
    function createLoadingSpinner() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'schedule-loading';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        
        const loadingText = document.createElement('p');
        loadingText.textContent = 'Loading schedule...';
        
        loadingDiv.appendChild(spinner);
        loadingDiv.appendChild(loadingText);
        
        return loadingDiv;
    }
    
    // Function to create empty state
    function createEmptyState() {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-schedule';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-calendar-times';
        
        const emptyText = document.createElement('h3');
        emptyText.textContent = 'No events scheduled yet';
        
        const subText = document.createElement('p');
        subText.textContent = 'Check back later for updates to the schedule';
        
        emptyDiv.appendChild(icon);
        emptyDiv.appendChild(emptyText);
        emptyDiv.appendChild(subText);
        
        return emptyDiv;
    }
    
    // Function to render the schedule
    function renderSchedule() {
        // Show loading state
        scheduleContainer.innerHTML = '';
        scheduleContainer.appendChild(createLoadingSpinner());
        
        // Fetch events from the API
        fetch('/api/events')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                return response.json();
            })
            .then(events => {
                // Clear the loading spinner
                scheduleContainer.innerHTML = '';
                
                if (!events || events.length === 0) {
                    scheduleContainer.appendChild(createEmptyState());
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
                
                // Sort days chronologically
                const sortedDays = Object.keys(eventsByDay).sort((a, b) => {
                    const dateA = new Date(a);
                    const dateB = new Date(b);
                    return dateA - dateB;
                });
                
                // Create a section for each day
                sortedDays.forEach(day => {
                    // Sort events by start time
                    const dayEvents = eventsByDay[day].sort((a, b) => {
                        if (a.startTime < b.startTime) return -1;
                        if (a.startTime > b.startTime) return 1;
                        return 0;
                    });
                    
                    // Create day section
                    const daySection = document.createElement('div');
                    daySection.className = 'schedule-day';
                    
                    // Create day header
                    const dayHeader = document.createElement('div');
                    dayHeader.className = 'day-header';
                    
                    const dayIcon = document.createElement('i');
                    dayIcon.className = getDayIcon(day);
                    
                    const dayTitle = document.createElement('h2');
                    dayTitle.className = 'day-title';
                    dayTitle.textContent = day;
                    
                    dayHeader.appendChild(dayIcon);
                    dayHeader.appendChild(dayTitle);
                    daySection.appendChild(dayHeader);
                    
                    // Create event cards for each event
                    dayEvents.forEach(event => {
                        const eventCard = document.createElement('div');
                        eventCard.className = 'event-card';
                        
                        // Event header with title and time
                        const eventHeader = document.createElement('div');
                        eventHeader.className = 'event-header';
                        
                        const eventTitle = document.createElement('h3');
                        eventTitle.className = 'event-title';
                        eventTitle.textContent = event.title;
                        
                        const eventTime = document.createElement('div');
                        eventTime.className = 'event-time';
                        
                        const timeIcon = document.createElement('i');
                        timeIcon.className = 'fas fa-clock';
                        
                        const timeText = document.createElement('span');
                        if (event.startTime && event.endTime) {
                            timeText.textContent = `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
                        } else if (event.startTime) {
                            timeText.textContent = formatTime(event.startTime);
                        } else {
                            timeText.textContent = 'All day';
                        }
                        
                        eventTime.appendChild(timeIcon);
                        eventTime.appendChild(timeText);
                        
                        eventHeader.appendChild(eventTitle);
                        eventHeader.appendChild(eventTime);
                        eventCard.appendChild(eventHeader);
                        
                        // Event location if available
                        if (event.location) {
                            const eventLocation = document.createElement('div');
                            eventLocation.className = 'event-location';
                            
                            const locationIcon = document.createElement('i');
                            locationIcon.className = 'fas fa-map-marker-alt';
                            
                            const locationText = document.createElement('span');
                            locationText.textContent = event.location;
                            
                            eventLocation.appendChild(locationIcon);
                            eventLocation.appendChild(locationText);
                            eventCard.appendChild(eventLocation);
                        }
                        
                        // Event description if available
                        if (event.description) {
                            const eventDescription = document.createElement('div');
                            eventDescription.className = 'event-description';
                            eventDescription.textContent = event.description;
                            eventCard.appendChild(eventDescription);
                        }
                        
                        // Event details (dress code, notes)
                        const eventDetails = document.createElement('div');
                        eventDetails.className = 'event-details';
                        
                        if (event.dressCode) {
                            const dressCode = document.createElement('div');
                            dressCode.className = 'event-detail';
                            
                            const dressIcon = document.createElement('i');
                            dressIcon.className = 'fas fa-tshirt';
                            
                            const dressText = document.createElement('span');
                            dressText.textContent = event.dressCode;
                            
                            dressCode.appendChild(dressIcon);
                            dressCode.appendChild(dressText);
                            eventDetails.appendChild(dressCode);
                        }
                        
                        if (event.notes) {
                            const notes = document.createElement('div');
                            notes.className = 'event-detail';
                            
                            const notesIcon = document.createElement('i');
                            notesIcon.className = 'fas fa-sticky-note';
                            
                            const notesText = document.createElement('span');
                            notesText.textContent = 'Notes available';
                            
                            notes.appendChild(notesIcon);
                            notes.appendChild(notesText);
                            notes.title = event.notes;
                            eventDetails.appendChild(notes);
                        }
                        
                        if (eventDetails.children.length > 0) {
                            eventCard.appendChild(eventDetails);
                        }
                        
                        // Event links (map, website)
                        const eventLinks = document.createElement('div');
                        eventLinks.className = 'event-links';
                        
                        if (event.mapUrl) {
                            const mapLink = document.createElement('a');
                            mapLink.className = 'event-link';
                            mapLink.href = event.mapUrl;
                            mapLink.target = '_blank';
                            mapLink.rel = 'noopener noreferrer';
                            
                            const mapIcon = document.createElement('i');
                            mapIcon.className = 'fas fa-map';
                            
                            const mapText = document.createElement('span');
                            mapText.textContent = 'View Map';
                            
                            mapLink.appendChild(mapIcon);
                            mapLink.appendChild(mapText);
                            eventLinks.appendChild(mapLink);
                        }
                        
                        if (event.websiteUrl) {
                            const websiteLink = document.createElement('a');
                            websiteLink.className = 'event-link';
                            websiteLink.href = event.websiteUrl;
                            websiteLink.target = '_blank';
                            websiteLink.rel = 'noopener noreferrer';
                            
                            const websiteIcon = document.createElement('i');
                            websiteIcon.className = 'fas fa-globe';
                            
                            const websiteText = document.createElement('span');
                            websiteText.textContent = 'Visit Website';
                            
                            websiteLink.appendChild(websiteIcon);
                            websiteLink.appendChild(websiteText);
                            eventLinks.appendChild(websiteLink);
                        }
                        
                        if (eventLinks.children.length > 0) {
                            eventCard.appendChild(eventLinks);
                        }
                        
                        daySection.appendChild(eventCard);
                    });
                    
                    scheduleContainer.appendChild(daySection);
                });
            })
            .catch(error => {
                console.error('Error fetching events:', error);
                scheduleContainer.innerHTML = '';
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'empty-schedule';
                
                const errorIcon = document.createElement('i');
                errorIcon.className = 'fas fa-exclamation-triangle';
                
                const errorText = document.createElement('h3');
                errorText.textContent = 'Error loading schedule';
                
                const errorSubText = document.createElement('p');
                errorSubText.textContent = 'Please try again later';
                
                errorDiv.appendChild(errorIcon);
                errorDiv.appendChild(errorText);
                errorDiv.appendChild(errorSubText);
                
                scheduleContainer.appendChild(errorDiv);
            });
    }
    
    // Initial render
    renderSchedule();
});
