const express = require('express');
const router = express.Router();
const testAuth = require('../middleware/test-auth');
const Note = require('../models/note');

// Hardcoded notes for fallback
const hardcodedNotes = [
    {
        title: "Welcome to Jyoti's 50th Birthday Celebration",
        content: "We're thrilled to welcome you to Kraków, Poland for Jyoti's 50th birthday celebration. This weekend promises to be filled with wonderful experiences, delicious food, and great company. Please refer to the schedule for all planned activities and don't hesitate to contact Shubham with any questions.",
        location: "Welcome"
    },
    {
        title: "About Kraków",
        content: "Kraków is one of Poland's oldest and most beautiful cities, with a rich history dating back to the 7th century. The historic center is a UNESCO World Heritage site, featuring the magnificent Main Square (Rynek Główny), St. Mary's Basilica, and Wawel Castle. The city seamlessly blends medieval charm with modern amenities, making it the perfect backdrop for our celebration.",
        location: "Information"
    },
    {
        title: "Transportation Tips",
        content: "Getting around Kraków is easy with various transportation options:\n\n- Walking: The historic center is compact and pedestrian-friendly\n- Trams & Buses: Extensive network covering the entire city\n- Taxis: Readily available and reasonably priced\n- Uber: Operates throughout Kraków\n\nAll our main venues are within walking distance of the Grand Hotel.",
        location: "Information"
    },
    {
        title: "Dining Recommendations",
        content: "Beyond our planned meals, Kraków offers exceptional dining options if you're extending your stay:\n\n- Pod Aniolami: Traditional Polish cuisine in a medieval cellar\n- Starka Restaurant: Excellent Polish food with a modern twist\n- Nolio: Authentic Italian pizza\n- Hamsa: Middle Eastern cuisine in the Jewish Quarter\n- Café Camelot: Charming café for breakfast or lunch",
        location: "Information"
    }
];

// @route   GET /api/notes
// @desc    Get all notes
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Try to get notes from database
        const notes = await Note.find();
        
        // If no notes in database, use hardcoded data
        if (!notes || notes.length === 0) {
            return res.json(hardcodedNotes);
        }
        
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        // Return hardcoded data on error
        res.json(hardcodedNotes);
    }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private/Admin
router.post('/', testAuth, async (req, res) => {
    try {
        const newNote = new Note(req.body);
        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private/Admin
router.put('/:id', testAuth, async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }
        
        res.json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private/Admin
router.delete('/:id', testAuth, async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        
        if (!deletedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }
        
        res.json({ message: 'Note removed' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
