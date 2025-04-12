// Updated main.js with hardcoded data fallbacks
document.addEventListener('DOMContentLoaded', function() {
    // Navigation tabs
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const contentId = tab.getAttribute('data-tab');
            document.getElementById(contentId).classList.add('active');
            
            // Save active tab to localStorage
            localStorage.setItem('activeTab', contentId);
        });
    });
    
    // Restore active tab from localStorage or default to home
    const activeTab = localStorage.getItem('activeTab') || 'home';
    document.querySelector(`.tab[data-tab="${activeTab}"]`).click();
    
    // Countdown timer
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        const eventDate = new Date('April 24, 2025 19:00:00').getTime();
        
        function updateCountdown() {
            const now = new Date().getTime();
            const distance = eventDate - now;
            
            if (distance < 0) {
                countdownElement.innerHTML = 'The celebration has begun!';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            countdownElement.innerHTML = `
                <div class="countdown-item">
                    <span class="countdown-number">${days}</span>
                    <span class="countdown-label">Days</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${hours}</span>
                    <span class="countdown-label">Hours</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${minutes}</span>
                    <span class="countdown-label">Minutes</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${seconds}</span>
                    <span class="countdown-label">Seconds</span>
                </div>
            `;
        }
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    
    // Hardcoded data as fallback
    const hardcodedEvents = [
        {
            title: "Welcome Dinner",
            day: "Thursday",
            date: "April 24, 2025",
            startTime: "19:00",
            endTime: "22:00",
            location: "Szara Gęś Restaurant",
            description: "Join us for a welcome dinner at one of Kraków's finest restaurants.",
            dressCode: "Smart Casual",
            mapUrl: "https://maps.google.com/?q=Szara+Gęś+Kraków",
            websiteUrl: "https://szarages.com/",
            notes: "Located in the Main Square"
        },
        {
            title: "City Tour",
            day: "Friday",
            date: "April 25, 2025",
            startTime: "10:00",
            endTime: "13:00",
            location: "Kraków Old Town",
            description: "Guided tour of Kraków's historic Old Town and Jewish Quarter.",
            dressCode: "Casual",
            mapUrl: "https://maps.google.com/?q=Kraków+Old+Town",
            websiteUrl: "",
            notes: "Comfortable walking shoes recommended"
        },
        {
            title: "Lunch",
            day: "Friday",
            date: "April 25, 2025",
            startTime: "13:30",
            endTime: "15:30",
            location: "Miód Malina Restaurant",
            description: "Traditional Polish lunch in a charming setting.",
            dressCode: "Casual",
            mapUrl: "https://maps.google.com/?q=Miód+Malina+Kraków",
            websiteUrl: "https://miodmalina.pl/",
            notes: ""
        },
        {
            title: "Free Time",
            day: "Friday",
            date: "April 25, 2025",
            startTime: "15:30",
            endTime: "18:30",
            location: "",
            description: "Free time to explore Kraków on your own.",
            dressCode: "",
            mapUrl: "",
            websiteUrl: "",
            notes: ""
        },
        {
            title: "Gala Dinner",
            day: "Friday",
            date: "April 25, 2025",
            startTime: "19:00",
            endTime: "23:00",
            location: "Grand Hotel Kraków",
            description: "Formal celebration dinner with speeches and entertainment.",
            dressCode: "Formal",
            mapUrl: "https://maps.google.com/?q=Grand+Hotel+Kraków",
            websiteUrl: "https://grand.pl/en/",
            notes: "Black tie optional"
        },
        {
            title: "Auschwitz-Birkenau Tour",
            day: "Saturday",
            date: "April 26, 2025",
            startTime: "09:00",
            endTime: "15:00",
            location: "Auschwitz-Birkenau Memorial",
            description: "Guided tour of the historic site and memorial.",
            dressCode: "Respectful Attire",
            mapUrl: "https://maps.google.com/?q=Auschwitz-Birkenau+Memorial",
            websiteUrl: "http://auschwitz.org/en/",
            notes: "Transportation provided from hotel"
        },
        {
            title: "Farewell Dinner",
            day: "Saturday",
            date: "April 26, 2025",
            startTime: "19:00",
            endTime: "22:00",
            location: "Wierzynek Restaurant",
            description: "Final dinner together at one of Poland's oldest restaurants.",
            dressCode: "Smart Casual",
            mapUrl: "https://maps.google.com/?q=Wierzynek+Kraków",
            websiteUrl: "https://wierzynek.pl/en/",
            notes: "Dating back to 1364"
        },
        {
            title: "Departure",
            day: "Sunday",
            date: "April 27, 2025",
            startTime: "All Day",
            endTime: "",
            location: "",
            description: "Departures throughout the day. Airport transfers available upon request.",
            dressCode: "",
            mapUrl: "",
            websiteUrl: "",
            notes: "Contact Shubham for airport transfer arrangements"
        }
    ];
    
    const hardcodedContacts = [
        {
            name: "Shubham Pandey",
            title: "Event Organizer",
            phone: "+1 (555) 123-4567",
            email: "shubham.pandey@gmail.com",
            type: "Organizer",
            notes: "Main contact for all event inquiries"
        },
        {
            name: "Grand Hotel Kraków",
            title: "Accommodation",
            phone: "+48 12 424 08 00",
            email: "reception@grand.pl",
            type: "Venue",
            notes: "Main accommodation for all guests"
        },
        {
            name: "Kraków Tours",
            title: "Tour Provider",
            phone: "+48 12 429 44 99",
            email: "info@krakowtours.pl",
            type: "Service",
            notes: "Handling all guided tours"
        },
        {
            name: "Medical Emergency",
            title: "Emergency Service",
            phone: "112",
            email: "",
            type: "Emergency",
            notes: "European emergency number"
        }
    ];
    
    const hardcodedReminders = [
        {
            title: "Book Flights",
            description: "Remember to book your flights to Kraków well in advance for the best rates.",
            date: "2025-02-24",
            icon: "plane"
        },
        {
            title: "Reserve Hotel Room",
            description: "Book your room at the Grand Hotel Kraków using the group rate code: JYOTI50.",
            date: "2025-03-10",
            icon: "hotel"
        },
        {
            title: "Pack Formal Attire",
            description: "Don't forget to pack formal attire for the Gala Dinner on Friday night.",
            date: "2025-04-20",
            icon: "tshirt"
        },
        {
            title: "Exchange Currency",
            description: "Poland uses the Polish Złoty (PLN). Exchange some currency before arrival or at the airport.",
            date: "2025-04-22",
            icon: "money-bill"
        }
    ];
    
    const hardcodedNotes = [
        {
            title: "Accommodation Information",
            content: "The Grand Hotel Kraków is located in the heart of the Old Town, just steps from the Main Square. The hotel offers luxurious rooms, a spa, and a restaurant. A special group rate has been arranged for Jyoti's celebration guests. Use code JYOTI50 when booking.",
            location: "Information"
        },
        {
            title: "Weather in Kraków",
            content: "April in Kraków typically has temperatures ranging from 5°C to 15°C (41°F to 59°F). It can be quite variable, with occasional rain showers. Pack layers, a light jacket, and an umbrella or raincoat.",
            location: "Information"
        },
        {
            title: "Local Currency",
            content: "Poland uses the Polish Złoty (PLN). As of 2025, the exchange rate is approximately 1 USD = 3.8 PLN, 1 EUR = 4.3 PLN. Credit cards are widely accepted in Kraków, but it's good to have some cash for small purchases and tips.",
            location: "Information"
        },
        {
            title: "Transportation",
            content: "Kraków has an excellent public transportation system with trams and buses. Taxis and ride-sharing services are also readily available. The Old Town is very walkable, and most of our events will take place within walking distance of the hotel.",
            location: "Information"
        }
    ];
    
    // Load schedule data
    function loadSchedule() {
        const scheduleContainer = document.getElementById('schedule-container');
        if (!scheduleContainer) return;
        
        // Try to fetch from API first
        fetch('/api/events')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(events => {
                if (events && events.length > 0) {
                    displaySchedule(events);
                } else {
                    // If API returns empty array, use hardcoded data
                    displaySchedule(hardcodedEvents);
                }
            })
            .catch(error => {
                console.error('Error fetching events:', error);
                // On error, use hardcoded data
                displaySchedule(hardcodedEvents);
            });
    }
    
    function displaySchedule(events) {
        const scheduleContainer = document.getElementById('schedule-container');
        if (!scheduleContainer) return;
        
        // Group events by day
        const eventsByDay = {};
        events.forEach(event => {
            if (!eventsByDay[event.day]) {
                eventsByDay[event.day] = [];
            }
            eventsByDay[event.day].push(event);
        });
        
        // Clear container
        scheduleContainer.innerHTML = '';
        
        // Create day sections
        const days = ['Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => {
            if (!eventsByDay[day] || eventsByDay[day].length === 0) return;
            
            const daySection = document.createElement('div');
            daySection.className = 'day-section';
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            
            let dayIcon = '';
            switch(day) {
                case 'Thursday':
                    dayIcon = 'glass-cheers';
                    break;
                case 'Friday':
                    dayIcon = 'city';
                    break;
                case 'Saturday':
                    dayIcon = 'monument';
                    break;
                case 'Sunday':
                    dayIcon = 'plane-departure';
                    break;
                default:
                    dayIcon = 'calendar-day';
            }
            
            dayHeader.innerHTML = `
                <i class="fas fa-${dayIcon}"></i>
                <h2>${day} - ${eventsByDay[day][0].date}</h2>
            `;
            
            daySection.appendChild(dayHeader);
            
            // Create event cards
            eventsByDay[day].forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.className = 'event-card';
                
                let eventHtml = `
                    <div class="event-header">
                        <h3>${event.title}</h3>
                    </div>
                    <div class="event-details">
                `;
                
                if (event.startTime) {
                    eventHtml += `
                        <div class="event-detail">
                            <i class="fas fa-clock"></i>
                            <span>${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}</span>
                        </div>
                    `;
                }
                
                if (event.location) {
                    eventHtml += `
                        <div class="event-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                    `;
                }
                
                if (event.dressCode) {
                    eventHtml += `
                        <div class="event-detail">
                            <i class="fas fa-tshirt"></i>
                            <span>${event.dressCode}</span>
                        </div>
                    `;
                }
                
                if (event.description) {
                    eventHtml += `
                        <div class="event-description">
                            <p>${event.description}</p>
                        </div>
                    `;
                }
                
                if (event.notes) {
                    eventHtml += `
                        <div class="event-notes">
                            <p><i class="fas fa-sticky-note"></i> ${event.notes}</p>
                        </div>
                    `;
                }
                
                eventHtml += `<div class="event-buttons">`;
                
                if (event.mapUrl) {
                    eventHtml += `
                        <a href="${event.mapUrl}" target="_blank" class="event-button map-button">
                            <i class="fas fa-map"></i> View Map
                        </a>
                    `;
                }
                
                if (event.websiteUrl) {
                    eventHtml += `
                        <a href="${event.websiteUrl}" target="_blank" class="event-button website-button">
                            <i class="fas fa-globe"></i> View Website
                        </a>
                    `;
                }
                
                eventHtml += `</div></div>`;
                
                eventCard.innerHTML = eventHtml;
                daySection.appendChild(eventCard);
            });
            
            scheduleContainer.appendChild(daySection);
        });
    }
    
    // Load contacts data
    function loadContacts() {
        const contactsContainer = document.getElementById('contacts-container');
        if (!contactsContainer) return;
        
        // Try to fetch from API first
        fetch('/api/contacts')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(contacts => {
                if (contacts && contacts.length > 0) {
                    displayContacts(contacts);
                } else {
                    // If API returns empty array, use hardcoded data
                    displayContacts(hardcodedContacts);
                }
            })
            .catch(error => {
                console.error('Error fetching contacts:', error);
                // On error, use hardcoded data
                displayContacts(hardcodedContacts);
            });
    }
    
    function displayContacts(contacts) {
        const contactsContainer = document.getElementById('contacts-container');
        if (!contactsContainer) return;
        
        // Group contacts by type
        const contactsByType = {};
        contacts.forEach(contact => {
            if (!contactsByType[contact.type]) {
                contactsByType[contact.type] = [];
            }
            contactsByType[contact.type].push(contact);
        });
        
        // Clear container
        contactsContainer.innerHTML = '';
        
        // Create type sections
        Object.keys(contactsByType).forEach(type => {
            const typeSection = document.createElement('div');
            typeSection.className = 'contact-section';
            
            const typeHeader = document.createElement('h2');
            typeHeader.textContent = type;
            typeSection.appendChild(typeHeader);
            
            // Create contact cards
            contactsByType[type].forEach(contact => {
                const contactCard = document.createElement('div');
                contactCard.className = 'contact-card';
                
                let contactHtml = `
                    <div class="contact-header">
                        <h3>${contact.name}</h3>
                        ${contact.title ? `<p>${contact.title}</p>` : ''}
                    </div>
                    <div class="contact-details">
                `;
                
                if (contact.phone) {
                    contactHtml += `
                        <div class="contact-detail">
                            <i class="fas fa-phone"></i>
                            <a href="tel:${contact.phone}">${contact.phone}</a>
                        </div>
                    `;
                }
                
                if (contact.email) {
                    contactHtml += `
                        <div class="contact-detail">
                            <i class="fas fa-envelope"></i>
                            <a href="mailto:${contact.email}">${contact.email}</a>
                        </div>
                    `;
                }
                
                if (contact.notes) {
                    contactHtml += `
                        <div class="contact-notes">
                            <p>${contact.notes}</p>
                        </div>
                    `;
                }
                
                contactHtml += `</div>`;
                
                contactCard.innerHTML = contactHtml;
                typeSection.appendChild(contactCard);
            });
            
            contactsContainer.appendChild(typeSection);
        });
    }
    
    // Load reminders data
    function loadReminders() {
        const remindersContainer = document.getElementById('reminders-container');
        if (!remindersContainer) return;
        
        // Try to fetch from API first
        fetch('/api/reminders')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(reminders => {
                if (reminders && reminders.length > 0) {
                    displayReminders(reminders);
                } else {
                    // If API returns empty array, use hardcoded data
                    displayReminders(hardcodedReminders);
                }
            })
            .catch(error => {
                console.error('Error fetching reminders:', error);
                // On error, use hardcoded data
                displayReminders(hardcodedReminders);
            });
    }
    
    function displayReminders(reminders) {
        const remindersContainer = document.getElementById('reminders-container');
        if (!remindersContainer) return;
        
        // Sort reminders by date
        reminders.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });
        
        // Clear container
        remindersContainer.innerHTML = '';
        
        // Create reminder cards
        reminders.forEach(reminder => {
            const reminderCard = document.createElement('div');
            reminderCard.className = 'reminder-card';
            
            const icon = reminder.icon || 'bell';
            const formattedDate = formatDate(reminder.date);
            
            reminderCard.innerHTML = `
                <div class="reminder-icon">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="reminder-content">
                    <h3>${reminder.title}</h3>
                    <p class="reminder-date">${formattedDate}</p>
                    <p class="reminder-description">${reminder.description}</p>
                </div>
            `;
            
            remindersContainer.appendChild(reminderCard);
        });
    }
    
    // Load notes data
    function loadNotes() {
        const notesContainer = document.getElementById('notes-container');
        if (!notesContainer) return;
        
        // Try to fetch from API first
        fetch('/api/notes')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(notes => {
                if (notes && notes.length > 0) {
                    displayNotes(notes);
                } else {
                    // If API returns empty array, use hardcoded data
                    displayNotes(hardcodedNotes);
                }
            })
            .catch(error => {
                console.error('Error fetching notes:', error);
                // On error, use hardcoded data
                displayNotes(hardcodedNotes);
            });
    }
    
    function displayNotes(notes) {
        const notesContainer = document.getElementById('notes-container');
        if (!notesContainer) return;
        
        // Group notes by location
        const notesByLocation = {};
        notes.forEach(note => {
            const location = note.location || 'General';
            if (!notesByLocation[location]) {
                notesByLocation[location] = [];
            }
            notesByLocation[location].push(note);
        });
        
        // Clear container
        notesContainer.innerHTML = '';
        
        // Create location sections
        Object.keys(notesByLocation).forEach(location => {
            const locationSection = document.createElement('div');
            locationSection.className = 'note-section';
            
            const locationHeader = document.createElement('h2');
            locationHeader.textContent = location;
            locationSection.appendChild(locationHeader);
            
            // Create note cards
            notesByLocation[location].forEach(note => {
                const noteCard = document.createElement('div');
                noteCard.className = 'note-card';
                
                noteCard.innerHTML = `
                    <div class="note-header">
                        <h3>${note.title}</h3>
                    </div>
                    <div class="note-content">
                        <p>${note.content}</p>
                    </div>
                `;
                
                locationSection.appendChild(noteCard);
            });
            
            notesContainer.appendChild(locationSection);
        });
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Load all data
    loadSchedule();
    loadContacts();
    loadReminders();
    loadNotes();
});
