// Google Sheets integration endpoint
const express = require('express');
const router = express.Router();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Authentication middleware
function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token is not valid' });
    }
}

// Sync data with Google Sheets
router.post('/sync', auth, async (req, res) => {
    try {
        // Initialize the Google Sheets document
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
        
        // Authenticate with Google
        if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            await doc.useServiceAccountAuth({
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            });
        } else {
            return res.status(400).json({ message: 'Google Sheets credentials not configured' });
        }
        
        await doc.loadInfo();
        
        // Get the sheets
        const eventsSheet = doc.sheetsByIndex[0]; // Assuming events are in the first sheet
        const contactsSheet = doc.sheetsByIndex[1]; // Assuming contacts are in the second sheet
        const remindersSheet = doc.sheetsByIndex[2]; // Assuming reminders are in the third sheet
        
        // Load the rows
        const eventsRows = await eventsSheet.getRows();
        const contactsRows = await contactsSheet.getRows();
        const remindersRows = await remindersSheet.getRows();
        
        // Process events
        const events = eventsRows.map(row => ({
            title: row.Title,
            day: row.Day,
            date: row.Date,
            startTime: row.StartTime,
            endTime: row.EndTime,
            location: row.Location,
            description: row.Description,
            dressCode: row.DressCode,
            mapUrl: row.MapUrl,
            websiteUrl: row.WebsiteUrl,
            notes: row.Notes
        }));
        
        // Process contacts
        const contacts = contactsRows.map(row => ({
            name: row.Name,
            type: row.Type,
            email: row.Email,
            phone: row.Phone,
            notes: row.Notes
        }));
        
        // Process reminders
        const reminders = remindersRows.map(row => ({
            title: row.Title,
            description: row.Description,
            date: row.Date,
            icon: row.Icon
        }));
        
        // Return the data
        res.json({
            events,
            contacts,
            reminders,
            message: 'Data synced successfully from Google Sheets'
        });
    } catch (err) {
        console.error('Error syncing with Google Sheets:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
