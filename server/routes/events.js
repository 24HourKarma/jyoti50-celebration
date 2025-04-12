const express = require('express');
const router = express.Router();
const testAuth = require('../middleware/test-auth');
const Event = require('../models/event');
const { google } = require('googleapis');

// Hardcoded events for fallback
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

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Try to get events from database
        const events = await Event.find();
        
        // If no events in database, use hardcoded data
        if (!events || events.length === 0) {
            return res.json(hardcodedEvents);
        }
        
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        // Return hardcoded data on error
        res.json(hardcodedEvents);
    }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private/Admin
router.post('/', testAuth, async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private/Admin
router.put('/:id', testAuth, async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private/Admin
router.delete('/:id', testAuth, async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json({ message: 'Event removed' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/events/import-from-sheet
// @desc    Import events from Google Sheet
// @access  Private/Admin
router.post('/import-from-sheet', testAuth, async (req, res) => {
    try {
        // This is a simplified version - in production, you would use OAuth2
        // For this example, we'll use a service account or API key approach
        const sheets = google.sheets({
            version: 'v4',
            auth: process.env.GOOGLE_API_KEY || 'YOUR_API_KEY' // Replace with actual API key in production
        });
        
        // The ID of the spreadsheet
        const spreadsheetId = '1i3CI6gj54e63kR-fLza-2ncqzAof6H76iJj7pOzVP0I';
        
        // The range of the spreadsheet
        const range = 'Sheet1!A2:K'; // Assuming headers are in row 1
        
        // Get the values from the spreadsheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        
        const rows = response.data.values;
        
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No data found in spreadsheet' });
        }
        
        // Map the rows to event objects
        const events = rows.map(row => ({
            title: row[0] || '',
            day: row[1] || '',
            date: row[2] || '',
            startTime: row[3] || '',
            endTime: row[4] || '',
            location: row[5] || '',
            description: row[6] || '',
            dressCode: row[7] || '',
            mapUrl: row[8] || '',
            websiteUrl: row[9] || '',
            notes: row[10] || ''
        }));
        
        // Delete all existing events
        await Event.deleteMany({});
        
        // Insert the new events
        const savedEvents = await Event.insertMany(events);
        
        res.status(201).json({
            message: `Successfully imported ${savedEvents.length} events from Google Sheet`,
            events: savedEvents
        });
    } catch (error) {
        console.error('Error importing events from Google Sheet:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
