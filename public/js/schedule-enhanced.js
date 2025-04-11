// Enhanced Schedule Display JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced schedule script loaded');
    
    // Initialize the schedule display if on the schedule tab
    if (document.getElementById('schedule')) {
        enhanceScheduleDisplay();
    }
    
    // Add event listener for tab navigation to enhance schedule when tab is clicked
    const scheduleTab = document.querySelector('a[href="#schedule"]');
    if (scheduleTab) {
        scheduleTab.addEventListener('click', function() {
            setTimeout(enhanceScheduleDisplay, 100); // Small delay to ensure content is loaded
        });
    }
});

// Function to enhance the schedule display
function enhanceScheduleDisplay() {
    console.log('Enhancing schedule display');
    
    // Get the schedule container
    const scheduleContainer = document.getElementById('schedule-container');
    if (!scheduleContainer) {
        console.warn('Schedule container not found');
        return;
    }
    
    // Add the schedule-section class to the parent for styling
    scheduleContainer.parentElement.classList.add('schedule-section');
    
    // Get all day containers
    const dayContainers = scheduleContainer.querySelectorAll('.day-container');
    if (dayContainers.length === 0) {
        console.warn('No day containers found in schedule');
        return;
    }
    
    console.log(`Found ${dayContainers.length} day containers`);
    
    // Enhance each day container
    dayContainers.forEach(dayContainer => {
        enhanceDayContainer(dayContainer);
    });
}

// Function to enhance a day container
function enhanceDayContainer(dayContainer) {
    // Get the day header
    const dayHeader = dayContainer.querySelector('.day-header');
    if (dayHeader) {
        // Add icon to day header
        const headerText = dayHeader.textContent;
        dayHeader.innerHTML = `<i class="fas fa-calendar-day"></i> ${headerText}`;
    }
    
    // Get all event cards in this day
    const eventCards = dayContainer.querySelectorAll('.event-card');
    console.log(`Found ${eventCards.length} event cards in day container`);
    
    // Enhance each event card
    eventCards.forEach((eventCard, index) => {
        enhanceEventCard(eventCard, index);
    });
}

// Function to enhance an event card
function enhanceEventCard(eventCard, index) {
    // Add animation delay based on index
    eventCard.style.animationDelay = `${0.1 * (index + 1)}s`;
    
    // Get event elements
    const eventTitle = eventCard.querySelector('.event-title');
    const eventDetails = eventCard.querySelector('.event-details');
    const eventDescription = eventCard.querySelector('.event-description');
    const eventNotes = eventCard.querySelector('.event-notes');
    const eventActions = eventCard.querySelector('.event-actions');
    
    // Enhance time display
    const timeDetail = eventCard.querySelector('.event-detail:has(i.fa-clock)');
    if (timeDetail) {
        const timeText = timeDetail.querySelector('span').textContent;
        const timeBadge = document.createElement('div');
        timeBadge.className = 'event-time-badge';
        timeBadge.innerHTML = `<i class="far fa-clock"></i> ${timeText}`;
        
        // Insert time badge before event details
        if (eventDetails && eventDetails.parentNode) {
            eventDetails.parentNode.insertBefore(timeBadge, eventDetails);
        }
    }
    
    // Enhance dress code display
    const dressCodeDetail = eventCard.querySelector('.event-detail:has(i.fa-tshirt)');
    if (dressCodeDetail) {
        const dressCodeText = dressCodeDetail.querySelector('span').textContent;
        if (dressCodeText && dressCodeText !== 'No dress code specified') {
            const dressCodeBadge = document.createElement('div');
            dressCodeBadge.className = 'dress-code-badge';
            dressCodeBadge.innerHTML = `<i class="fas fa-tshirt"></i> ${dressCodeText}`;
            
            // Append dress code badge after event details
            if (eventDetails && eventDetails.parentNode) {
                if (eventDescription) {
                    eventDetails.parentNode.insertBefore(dressCodeBadge, eventDescription);
                } else {
                    eventDetails.parentNode.appendChild(dressCodeBadge);
                }
            }
        }
    }
    
    // Enhance action buttons
    if (eventActions) {
        const buttons = eventActions.querySelectorAll('a.btn');
        buttons.forEach(button => {
            button.classList.add('btn-secondary');
        });
    }
}

// Function to format date for display
function formatEventDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
