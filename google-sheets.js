// Google Sheets integration module
const fetch = require('node-fetch');

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

/**
 * Synchronizes events from Google Sheets to the database
 * 
 * @param {string} sheetsId - The ID of the Google Sheet
 * @param {Object} Event - Mongoose model for events
 * @returns {Promise<Object>} - Result of the synchronization
 */
async function syncGoogleSheetsToDatabase(sheetsId, Event) {
    try {
        const events = await fetchGoogleSheetsData(sheetsId);
        
        if (!events || events.length === 0) {
            throw new Error('No events found in Google Sheets');
        }
        
        // Clear existing events
        const deleteResult = await Event.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing events`);
        
        // Insert new events
        const insertResult = await Event.insertMany(events);
        console.log(`Inserted ${insertResult.length} new events`);
        
        return {
            success: true,
            message: 'Events synced successfully',
            count: events.length,
            deleted: deleteResult.deletedCount,
            inserted: insertResult.length
        };
    } catch (error) {
        console.error('Error syncing Google Sheets to database:', error);
        throw error;
    }
}

module.exports = {
    fetchGoogleSheetsData,
    syncGoogleSheetsToDatabase
};
