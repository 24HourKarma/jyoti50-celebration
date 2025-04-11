// Database initialization module
const bcrypt = require('bcryptjs');
const { fetchGoogleSheetsData } = require('./google-sheets');

/**
 * Initializes the database with default data if collections are empty
 * 
 * @param {Object} models - Object containing all Mongoose models
 * @param {Object} config - Configuration object with environment variables
 * @returns {Promise<void>}
 */
async function initializeDatabase(models, config) {
    try {
        console.log('Starting database initialization...');
        
        const { User, Event, Contact, Reminder, Note, Gallery, Footer, Settings } = models;
        
        // Initialize in parallel for efficiency
        await Promise.all([
            initializeAdminUser(User, config),
            initializeFooter(Footer),
            initializeSettings(Settings),
            initializeEvents(Event, config),
            initializeContacts(Contact),
            initializeReminders(Reminder),
            initializeNotes(Note)
        ]);
        
        console.log('Database initialization complete');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

/**
 * Initializes admin user if none exists
 * 
 * @param {Object} User - User model
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
async function initializeAdminUser(User, config) {
    try {
        // Check if admin user exists
        const adminExists = await User.findOne({ email: 'shubham.pandey@gmail.com' });
        
        if (!adminExists) {
            // Create admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('jyoti50admin', salt);
            
            await User.create({
                email: 'shubham.pandey@gmail.com',
                password: hashedPassword,
                role: 'admin'
            });
            
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error initializing admin user:', error);
        throw error;
    }
}

/**
 * Initializes footer if none exists
 * 
 * @param {Object} Footer - Footer model
 * @returns {Promise<void>}
 */
async function initializeFooter(Footer) {
    try {
        // Check if footer exists
        const footerExists = await Footer.findOne();
        
        if (!footerExists) {
            // Create default footer
            await Footer.create({
                title: 'Jyoti\'s 50th Birthday Celebration',
                text: 'Join us for a memorable celebration in Kraków, Poland!',
                copyright: '© 2025 Jyoti\'s 50th Birthday'
            });
            
            console.log('Default footer created');
        } else {
            console.log('Footer already exists');
        }
    } catch (error) {
        console.error('Error initializing footer:', error);
        throw error;
    }
}

/**
 * Initializes settings if none exists
 * 
 * @param {Object} Settings - Settings model
 * @returns {Promise<void>}
 */
async function initializeSettings(Settings) {
    try {
        // Check if settings exist
        const settingsExist = await Settings.findOne();
        
        if (!settingsExist) {
            // Create default settings
            await Settings.create({
                siteTitle: 'Jyoti\'s 50th Birthday Celebration',
                eventDate: 'April 24-27, 2025',
                eventLocation: 'Kraków, Poland',
                primaryColor: '#d4af37',
                secondaryColor: '#121212'
            });
            
            console.log('Default settings created');
        } else {
            console.log('Settings already exist');
        }
    } catch (error) {
        console.error('Error initializing settings:', error);
        throw error;
    }
}

/**
 * Initializes events if none exist
 * 
 * @param {Object} Event - Event model
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
async function initializeEvents(Event, config) {
    try {
        // Check if events exist
        const eventsExist = await Event.countDocuments();
        
        if (eventsExist === 0) {
            try {
                // Try to fetch events from Google Sheets
                console.log('Attempting to import events from Google Sheets...');
                const sheetEvents = await fetchGoogleSheetsData(config.GOOGLE_SHEETS_ID);
                
                if (sheetEvents && sheetEvents.length > 0) {
                    // Create events from Google Sheets data
                    await Event.insertMany(sheetEvents);
                    console.log(`${sheetEvents.length} events imported from Google Sheets`);
                    return;
                } else {
                    console.log('No events found in Google Sheets, creating sample events');
                }
            } catch (error) {
                console.error('Error importing from Google Sheets:', error);
                console.log('Creating sample events instead');
            }
            
            // Create sample events if Google Sheets import fails
            await createSampleEvents(Event);
        } else {
            console.log(`${eventsExist} events already exist`);
        }
    } catch (error) {
        console.error('Error initializing events:', error);
        throw error;
    }
}

/**
 * Creates sample events
 * 
 * @param {Object} Event - Event model
 * @returns {Promise<void>}
 */
async function createSampleEvents(Event) {
    try {
        await Event.create([
            {
                title: 'Welcome Dinner',
                date: '2025-04-24',
                startTime: '19:00',
                endTime: '22:00',
                location: 'Hotel Restaurant',
                description: 'Join us for a welcome dinner to kick off the celebration weekend.',
                dressCode: 'Smart Casual',
                notes: 'Drinks and dinner will be provided.',
                day: 'Thursday, April 24, 2025',
                mapUrl: 'https://maps.google.com',
                websiteUrl: 'https://hotel-restaurant.com'
            },
            {
                title: 'City Tour',
                date: '2025-04-25',
                startTime: '10:00',
                endTime: '14:00',
                location: 'Kraków Old Town',
                description: 'Guided tour of Kraków\'s historic sites.',
                dressCode: 'Casual, comfortable shoes',
                notes: 'Please bring water and wear comfortable walking shoes.',
                day: 'Friday, April 25, 2025',
                mapUrl: 'https://maps.google.com',
                websiteUrl: ''
            },
            {
                title: 'Birthday Gala Dinner',
                date: '2025-04-25',
                startTime: '19:00',
                endTime: '23:00',
                location: 'Grand Ballroom',
                description: 'Formal dinner celebration for Jyoti\'s 50th birthday.',
                dressCode: 'Formal',
                notes: 'Special performances and speeches planned.',
                day: 'Friday, April 25, 2025',
                mapUrl: 'https://maps.google.com',
                websiteUrl: ''
            },
            {
                title: 'Farewell Brunch',
                date: '2025-04-26',
                startTime: '11:00',
                endTime: '14:00',
                location: 'Hotel Garden',
                description: 'Relaxed brunch to say goodbye.',
                dressCode: 'Casual',
                notes: 'Weather permitting, this will be held in the garden.',
                day: 'Saturday, April 26, 2025',
                mapUrl: 'https://maps.google.com',
                websiteUrl: ''
            }
        ]);
        
        console.log('Sample events created');
    } catch (error) {
        console.error('Error creating sample events:', error);
        throw error;
    }
}

/**
 * Initializes contacts if none exist
 * 
 * @param {Object} Contact - Contact model
 * @returns {Promise<void>}
 */
async function initializeContacts(Contact) {
    try {
        // Check if contacts exist
        const contactsExist = await Contact.countDocuments();
        
        if (contactsExist === 0) {
            await Contact.create([
                {
                    name: 'Shubham Pandey',
                    email: 'shubham.pandey@gmail.com',
                    phone: '+1 (123) 456-7890',
                    type: 'Host',
                    description: 'Main contact for all event inquiries'
                },
                {
                    name: 'Hotel Concierge',
                    email: 'concierge@hotel.com',
                    phone: '+48 12 345 6789',
                    type: 'Venue',
                    description: 'Contact for hotel-related questions'
                },
                {
                    name: 'Tour Guide',
                    email: 'guide@krakow-tours.com',
                    phone: '+48 98 765 4321',
                    type: 'Activities',
                    description: 'Contact for tour information'
                }
            ]);
            
            console.log('Sample contacts created');
        } else {
            console.log(`${contactsExist} contacts already exist`);
        }
    } catch (error) {
        console.error('Error initializing contacts:', error);
        throw error;
    }
}

/**
 * Initializes reminders if none exist
 * 
 * @param {Object} Reminder - Reminder model
 * @returns {Promise<void>}
 */
async function initializeReminders(Reminder) {
    try {
        // Check if reminders exist
        const remindersExist = await Reminder.countDocuments();
        
        if (remindersExist === 0) {
            await Reminder.create([
                {
                    title: 'Book Your Flight',
                    description: 'Remember to book your flight to Kraków as soon as possible for the best rates.',
                    date: '2025-01-15',
                    icon: 'Calendar'
                },
                {
                    title: 'Reserve Your Hotel Room',
                    description: 'Special rates are available at the event hotel until March 1, 2025.',
                    date: '2025-02-15',
                    icon: 'Bell'
                },
                {
                    title: 'Bring Formal Attire',
                    description: 'Don\'t forget to pack formal attire for the gala dinner on Friday.',
                    date: '2025-04-15',
                    icon: 'Info'
                },
                {
                    title: 'Weather Advisory',
                    description: 'April in Kraków can be unpredictable. Pack layers and a light raincoat.',
                    date: '2025-04-20',
                    icon: 'Warning'
                }
            ]);
            
            console.log('Sample reminders created');
        } else {
            console.log(`${remindersExist} reminders already exist`);
        }
    } catch (error) {
        console.error('Error initializing reminders:', error);
        throw error;
    }
}

/**
 * Initializes notes if none exist
 * 
 * @param {Object} Note - Note model
 * @returns {Promise<void>}
 */
async function initializeNotes(Note) {
    try {
        // Check if notes exist
        const notesExist = await Note.countDocuments();
        
        if (notesExist === 0) {
            await Note.create([
                {
                    title: 'Welcome to Jyoti\'s 50th Birthday Celebration!',
                    content: 'We\'re thrilled to have you join us for this special occasion. This website contains all the information you\'ll need for the celebration weekend.',
                    displayLocation: 'Home Page'
                },
                {
                    title: 'Schedule Information',
                    content: 'All events are optional, but we hope you\'ll join us for as many as possible. Please let us know if you have any dietary restrictions or special requirements.',
                    displayLocation: 'Schedule Page'
                },
                {
                    title: 'Photo Sharing',
                    content: 'Please share your photos from the celebration by uploading them to this gallery. They will be compiled into a memory book for Jyoti.',
                    displayLocation: 'Gallery Page'
                },
                {
                    title: 'Important Contacts',
                    content: 'If you need assistance during your stay in Kraków, please don\'t hesitate to reach out to any of the contacts listed here.',
                    displayLocation: 'Contacts Page'
                },
                {
                    title: 'Key Reminders',
                    content: 'Please review these important reminders to ensure you\'re prepared for the celebration weekend.',
                    displayLocation: 'Reminders Page'
                }
            ]);
            
            console.log('Sample notes created');
        } else {
            console.log(`${notesExist} notes already exist`);
        }
    } catch (error) {
        console.error('Error initializing notes:', error);
        throw error;
    }
}

module.exports = {
    initializeDatabase
};
