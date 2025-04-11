// Google Sheets Prepopulation Script
// This script fetches data from the Google Sheets and populates the database with events

require('dotenv').config();
const mongoose = require('mongoose');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const Event = require('./models/Event');

// Google Sheets document ID from the URL
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '1i3CI6gj54e63kR-fLza-2ncqzAof6H76iJj7pOzVP0I';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for Google Sheets import'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Function to format date string to YYYY-MM-DD
function formatDateForStorage(dateStr) {
    // Check if the date is in the format "April 24, 2025"
    if (dateStr.includes('April') && dateStr.includes('2025')) {
        const day = dateStr.match(/\d+/)[0];
        return `2025-04-${day.padStart(2, '0')}`;
    }
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    
    // Try to parse the date
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error(`Error parsing date: ${dateStr}`);
        // Default to April 24, 2025 if we can't parse the date
        return '2025-04-24';
    }
}

// Function to extract time from a time string
function formatTimeForStorage(timeStr) {
    if (!timeStr) return '';
    
    // Check if it's already in HH:MM format
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr;
    }
    
    // Check for AM/PM format
    const amPmMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
    if (amPmMatch) {
        let hours = parseInt(amPmMatch[1]);
        const minutes = amPmMatch[2] ? parseInt(amPmMatch[2]) : 0;
        const period = amPmMatch[3].toUpperCase();
        
        // Convert to 24-hour format
        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Try to parse as a time
    try {
        // Create a date object with the time string
        const date = new Date(`2025-01-01T${timeStr}`);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid time');
        }
        return date.toTimeString().substring(0, 5);
    } catch (error) {
        console.error(`Error parsing time: ${timeStr}`);
        return '12:00'; // Default time
    }
}

// Function to determine which day an event belongs to based on the date
function getDayFromDate(dateStr) {
    const formattedDate = formatDateForStorage(dateStr);
    const day = formattedDate.split('-')[2];
    
    switch (day) {
        case '24':
            return 'April 24, 2025';
        case '25':
            return 'April 25, 2025';
        case '26':
            return 'April 26, 2025';
        case '27':
            return 'April 27, 2025';
        default:
            return 'April 24, 2025';
    }
}

// Main function to import data from Google Sheets
async function importEventsFromGoogleSheets() {
    try {
        console.log('Starting Google Sheets import...');
        
        // Initialize the Google Sheets document
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        
        // Authenticate with the Google Sheets API
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
        });
        
        // Load the document properties and worksheets
        await doc.loadInfo();
        console.log(`Loaded document: ${doc.title}`);
        
        // Get the first sheet
        const sheet = doc.sheetsByIndex[0];
        console.log(`Sheet title: ${sheet.title}`);
        
        // Load all rows from the sheet
        const rows = await sheet.getRows();
        console.log(`Loaded ${rows.length} rows from the sheet`);
        
        // Clear existing events from the database
        await Event.deleteMany({});
        console.log('Cleared existing events from the database');
        
        // Process each row and create events
        const events = [];
        for (const row of rows) {
            // Skip header row or empty rows
            if (!row.Date || !row.Title || row.Title === 'Title') {
                continue;
            }
            
            const date = formatDateForStorage(row.Date);
            const startTime = formatTimeForStorage(row['Start Time']);
            const endTime = formatTimeForStorage(row['End Time']);
            
            const event = {
                title: row.Title,
                date: date,
                day: getDayFromDate(row.Date),
                startTime: startTime,
                endTime: endTime,
                location: row.Location || '',
                description: row.Description || '',
                dressCode: row['Dress Code'] || '',
                mapUrl: row['Map URL'] || '',
                websiteUrl: row['Website URL'] || '',
                notes: row.Notes || ''
            };
            
            events.push(event);
        }
        
        // Insert all events into the database
        if (events.length > 0) {
            await Event.insertMany(events);
            console.log(`Successfully imported ${events.length} events from Google Sheets`);
        } else {
            console.log('No events found in the Google Sheets');
        }
        
        return {
            success: true,
            message: `Successfully imported ${events.length} events from Google Sheets`,
            count: events.length
        };
    } catch (error) {
        console.error('Error importing events from Google Sheets:', error);
        return {
            success: false,
            message: `Error importing events: ${error.message}`,
            error: error
        };
    } finally {
        // Close the MongoDB connection
        // mongoose.connection.close();
    }
}

// Export the function for use in other files
module.exports = {
    importEventsFromGoogleSheets
};

// If this script is run directly, execute the import function
if (require.main === module) {
    importEventsFromGoogleSheets()
        .then(result => {
            console.log('Import result:', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('Import failed:', error);
            process.exit(1);
        });
}
