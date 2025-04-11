// Add Google Sheets sync endpoint to server.js
app.post('/api/sync/google-sheets', auth, async (req, res) => {
    try {
        // Get Google Sheets ID from environment variables
        const sheetsId = process.env.GOOGLE_SHEETS_ID;
        
        if (!sheetsId) {
            return res.status(400).json({ error: 'Google Sheets ID not configured' });
        }
        
        // Sync events from Google Sheets to database
        const result = await syncGoogleSheetsToDatabase(sheetsId, Event);
        
        res.json(result);
    } catch (error) {
        console.error('Error syncing with Google Sheets:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});
