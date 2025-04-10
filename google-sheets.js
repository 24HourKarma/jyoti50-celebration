const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Event = require('./models/Event');
const Contact = require('./models/Contact');
const Reminder = require('./models/Reminder');
const Note = require('./models/Note');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for Google Sheets import'))
  .catch(err => console.log('MongoDB connection error:', err));

// Google Sheets ID from .env file
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

// Function to fetch data from Google Sheets
async function fetchGoogleSheetsData() {
  try {
    // Initialize the Sheets API client (using API key-less access for public sheets)
    const sheets = google.sheets({ version: 'v4' });
    
    // Get the data from the spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:D100', // Adjust range as needed to cover all data
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in the spreadsheet.');
      return null;
    }
    
    console.log(`Fetched ${rows.length} rows from Google Sheets`);
    return rows;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return null;
  }
}

// Function to process and import events
async function processEvents(rows) {
  try {
    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');
    
    // Find the events section in the spreadsheet
    let eventStartIndex = -1;
    let currentDay = '';
    const events = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row || row.length === 0) continue;
      
      // Check for "Events" header and date
      if (row[0] === 'Events' && row[1] && row[1].includes('April')) {
        currentDay = row[1];
        console.log(`Found event day: ${currentDay}`);
        continue;
      }
      
      // Process event data
      if (currentDay && row[0] && (row[0] === 'Nigh Activity' || row[0] === 'Day Activity' || 
          row[0] === 'Breakfast' || row[0] === 'Dinner' || row[0] === 'Hours' || 
          row[0].includes('Activity'))) {
        
        // Skip header rows
        if (row[0] === 'Dress Code') continue;
        
        // Get the next rows for additional information
        const timeRow = rows[i+1] && rows[i+1][0] ? rows[i+1] : null;
        const locationRow = rows[i+2] && rows[i+2][0] ? rows[i+2] : null;
        const notesRow = rows[i+3] && rows[i+3][0] && rows[i+3][0] === 'NOtes for dinner' ? rows[i+3] : null;
        
        if (timeRow && timeRow[0].includes('PM') || timeRow[0].includes('AM')) {
          // Extract time information
          const timeInfo = timeRow[0].split('-');
          const startTime = timeInfo[0].trim();
          const endTime = timeInfo.length > 1 ? timeInfo[1].trim() : 'Late';
          
          // Create event object
          const event = {
            title: row[1] || row[0],
            date: new Date(currentDay),
            startTime: startTime,
            endTime: endTime,
            location: locationRow ? locationRow[0] : 'TBD',
            description: '',
            dressCode: row[2] || '',
            notes: notesRow ? notesRow[1] : '',
            day: currentDay,
            order: events.length
          };
          
          events.push(event);
          console.log(`Added event: ${event.title} on ${event.day}`);
        }
      }
    }
    
    // Save events to database
    if (events.length > 0) {
      await Event.insertMany(events);
      console.log(`Imported ${events.length} events to database`);
    }
    
    return events;
  } catch (error) {
    console.error('Error processing events:', error);
    return [];
  }
}

// Function to process and import contacts
async function processContacts(rows) {
  try {
    // Clear existing contacts
    await Contact.deleteMany({});
    console.log('Cleared existing contacts');
    
    const contacts = [];
    
    // Find the attendees section in the spreadsheet
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row || row.length === 0) continue;
      
      // Check for "Attendees" header
      if (row[0] === 'Attendees') {
        // Process attendees
        let j = i + 1;
        while (j < rows.length && rows[j] && rows[j][0] && rows[j][0] !== 'Events') {
          const attendeeRow = rows[j];
          
          if (attendeeRow[0] && attendeeRow[0] !== 'Extra Room') {
            // Create contact object
            const contact = {
              name: attendeeRow[0],
              email: '',
              phone: '',
              type: attendeeRow[0].includes('Pandey') ? 'Host' : 'Guest',
              description: ''
            };
            
            contacts.push(contact);
            console.log(`Added contact: ${contact.name}`);
          }
          
          j++;
        }
        break;
      }
    }
    
    // Add hosts if not found
    if (!contacts.find(c => c.name === 'Shubham Pandey')) {
      contacts.push({
        name: 'Shubham Pandey',
        email: 'shubham.pandey@gmail.com',
        phone: '+1 123-456-7890',
        type: 'Host',
        description: 'Main host and organizer for the celebration.'
      });
    }
    
    if (!contacts.find(c => c.name === 'Jyoti Pandey')) {
      contacts.push({
        name: 'Jyoti Pandey',
        email: 'jyoti.pandey@gmail.com',
        phone: '+1 123-456-7891',
        type: 'Birthday Person',
        description: 'Birthday celebrant'
      });
    }
    
    // Save contacts to database
    if (contacts.length > 0) {
      await Contact.insertMany(contacts);
      console.log(`Imported ${contacts.length} contacts to database`);
    }
    
    return contacts;
  } catch (error) {
    console.error('Error processing contacts:', error);
    return [];
  }
}

// Function to create default reminders
async function createDefaultReminders() {
  try {
    // Clear existing reminders
    await Reminder.deleteMany({});
    console.log('Cleared existing reminders');
    
    const reminders = [
      {
        title: 'Bring Passport',
        description: 'Don\'t forget to bring your passport for the trip',
        date: new Date('2025-04-20'),
        icon: 'Bell',
        order: 0
      },
      {
        title: 'Exchange Money',
        description: 'Exchange some money to Polish Zloty before the trip',
        date: new Date('2025-04-22'),
        icon: 'Info',
        order: 1
      },
      {
        title: 'Check Weather',
        description: 'Check the weather forecast for Kraków before packing',
        date: new Date('2025-04-21'),
        icon: 'Calendar',
        order: 2
      },
      {
        title: 'Dress Codes',
        description: 'Remember to pack clothes according to the dress codes for each event',
        date: new Date('2025-04-23'),
        icon: 'Warning',
        order: 3
      }
    ];
    
    // Save reminders to database
    await Reminder.insertMany(reminders);
    console.log(`Created ${reminders.length} default reminders`);
    
    return reminders;
  } catch (error) {
    console.error('Error creating default reminders:', error);
    return [];
  }
}

// Function to create default notes
async function createDefaultNotes() {
  try {
    // Clear existing notes
    await Note.deleteMany({});
    console.log('Cleared existing notes');
    
    const notes = [
      {
        title: 'Dress Codes Information',
        content: 'Please check the schedule page for specific dress code requirements for each event.',
        displayLocation: 'Schedule Page',
        order: 0
      },
      {
        title: 'Weather Information',
        content: 'April in Kraków typically has temperatures between 5°C and 15°C. Pack layers and a light jacket.',
        displayLocation: 'Home Page',
        order: 1
      },
      {
        title: 'Transportation',
        content: 'Transportation will be provided for all scheduled activities. Meeting point is the hotel lobby.',
        displayLocation: 'Both',
        order: 2
      },
      {
        title: 'Local Currency',
        content: 'Polish Złoty (PLN) is the local currency. Current exchange rate: 1 USD ≈ 3.8 PLN, 1 EUR ≈ 4.3 PLN',
        displayLocation: 'Home Page',
        order: 3
      }
    ];
    
    // Save notes to database
    await Note.insertMany(notes);
    console.log(`Created ${notes.length} default notes`);
    
    return notes;
  } catch (error) {
    console.error('Error creating default notes:', error);
    return [];
  }
}

// Main function to run the import process
async function importGoogleSheetsData() {
  try {
    console.log('Starting Google Sheets import process...');
    
    // Fetch data from Google Sheets
    const rows = await fetchGoogleSheetsData();
    if (!rows) {
      console.log('No data to import. Exiting...');
      return false;
    }
    
    // Process and import events
    const events = await processEvents(rows);
    
    // Process and import contacts
    const contacts = await processContacts(rows);
    
    // Create default reminders
    const reminders = await createDefaultReminders();
    
    // Create default notes
    const notes = await createDefaultNotes();
    
    console.log('Google Sheets import process completed successfully!');
    console.log(`Imported: ${events.length} events, ${contacts.length} contacts, ${reminders.length} reminders, ${notes.length} notes`);
    
    return true;
  } catch (error) {
    console.error('Error in Google Sheets import process:', error);
    return false;
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
  }
}

// Run the import process if this file is executed directly
if (require.main === module) {
  importGoogleSheetsData()
    .then(result => {
      console.log(`Import process ${result ? 'succeeded' : 'failed'}`);
      process.exit(result ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error in import process:', error);
      process.exit(1);
    });
}

module.exports = {
  importGoogleSheetsData,
  fetchGoogleSheetsData
};
