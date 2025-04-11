// Enhanced Google Sheets integration module
const fetch = require('node-fetch');
const { GoogleSpreadsheet } = require('google-spreadsheet');

/**
 * Fetches data from Google Sheets using a public/shared link approach
 * This method doesn't require OAuth and works with sheets that are shared with "anyone with the link"
 * 
 * @param {string} sheetsId - The ID of the Google Sheet
 * @returns {Promise<Array>} - Array of event objects parsed from the sheet
 */
async function fetchGoogleSheetsData(sheetsId) {
    try {
        if (!sheetsId) {
            throw new Error('Google Sheets ID is required');
        }

        // Construct URL for public access to the sheet
        const url = `https://docs.google.com/spreadsheets/d/${sheetsId}/gviz/tq?tqx=out:json`;
        
        console.log(`Fetching Google Sheets data from: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch Google Sheets data: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        
        // Extract the JSON part from the response
        // Google's response is not pure JSON, it's wrapped in a callback
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error('Invalid response format from Google Sheets');
        }
        
        const jsonString = text.substring(jsonStart, jsonEnd);
        
        const data = JSON.parse(jsonString);
        
        if (!data.table || !data.table.rows) {
            throw new Error('No data found in Google Sheets response');
        }
        
        // Process the data
        const rows = data.table.rows;
        const events = [];
        
        console.log(`Found ${rows.length} rows in Google Sheets`);
        
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].c;
            
            // Skip empty rows
            if (!row || !row[0] || !row[0].v) continue;
            
            const event = {
                title: row[0]?.v || '',
                date: row[1]?.v || '',
                startTime: row[2]?.v || '',
                endTime: row[3]?.v || '',
                location: row[4]?.v || '',
                description: row[5]?.v || '',
                dressCode: row[6]?.v || '',
                notes: row[7]?.v || '',
                day: row[8]?.v || '',
                mapUrl: row[9]?.v || '',
                websiteUrl: row[10]?.v || ''
            };
            
            events.push(event);
        }
        
        console.log(`Successfully processed ${events.length} events from Google Sheets`);
        return events;
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
        throw error;
    }
}

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

/**
 * Enhanced synchronization of events from Google Sheets to the database
 * Uses the google-spreadsheet library for more reliable data extraction
 * 
 * @param {string} sheetsId - The ID of the Google Sheet
 * @param {Object} Event - Mongoose model for events
 * @returns {Promise<Object>} - Result of the synchronization
 */
async function syncGoogleSheetsToDatabase(sheetsId, Event) {
    try {
        console.log('Starting Google Sheets import...');
        
        // Initialize the Google Sheets document
        const doc = new GoogleSpreadsheet(sheetsId);
        
        // Authenticate with the Google Sheets API if credentials are available
        if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            await doc.useServiceAccountAuth({
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
            });
            console.log('Authenticated with Google Sheets API using service account');
        } else {
            console.log('No service account credentials found, using public access method');
            // Fall back to the public access method if no credentials
            return await syncGoogleSheetsUsingPublicAccess(sheetsId, Event);
        }
        
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
        const deleteResult = await Event.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing events`);
        
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
        let insertResult;
        if (events.length > 0) {
            insertResult = await Event.insertMany(events);
            console.log(`Successfully imported ${events.length} events from Google Sheets`);
        } else {
            console.log('No events found in the Google Sheets');
        }
        
        return {
            success: true,
            message: `Successfully imported ${events.length} events from Google Sheets`,
            count: events.length,
            deleted: deleteResult.deletedCount,
            inserted: events.length
        };
    } catch (error) {
        console.error('Error importing events from Google Sheets:', error);
        
        // Fall back to the public access method if the service account method fails
        console.log('Falling back to public access method...');
        return await syncGoogleSheetsUsingPublicAccess(sheetsId, Event);
    }
}

/**
 * Fallback method to sync Google Sheets using public access
 * Used when service account authentication fails or is not available
 */
async function syncGoogleSheetsUsingPublicAccess(sheetsId, Event) {
    try {
        const events = await fetchGoogleSheetsData(sheetsId);
        
        if (!events || events.length === 0) {
            throw new Error('No events found in Google Sheets');
        }
        
        // Process events to ensure proper formatting
        const processedEvents = events.map(event => {
            return {
                ...event,
                date: formatDateForStorage(event.date),
                startTime: formatTimeForStorage(event.startTime),
                endTime: formatTimeForStorage(event.endTime),
                day: event.day || getDayFromDate(event.date)
            };
        });
        
        // Clear existing events
        const deleteResult = await Event.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing events`);
        
        // Insert new events
        const insertResult = await Event.insertMany(processedEvents);
        console.log(`Inserted ${insertResult.length} new events`);
        
        return {
            success: true,
            message: 'Events synced successfully using public access method',
            count: processedEvents.length,
            deleted: deleteResult.deletedCount,
            inserted: insertResult.length
        };
    } catch (error) {
        console.error('Error syncing Google Sheets to database using public access:', error);
        throw error;
    }
}

module.exports = {
    fetchGoogleSheetsData,
    syncGoogleSheetsToDatabase
};
