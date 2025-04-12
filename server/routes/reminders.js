const express = require('express');
const router = express.Router();
const testAuth = require('../middleware/test-auth');
const Reminder = require('../models/reminder');

// Hardcoded reminders for fallback
const hardcodedReminders = [
    {
        title: "Pack Formal Attire",
        description: "Don't forget to pack formal attire for the Gala Dinner on Friday",
        date: "2025-04-20T00:00:00.000Z",
        icon: "clothes"
    },
    {
        title: "Check Weather",
        description: "Check Kraków weather forecast before packing",
        date: "2025-04-22T00:00:00.000Z",
        icon: "weather"
    },
    {
        title: "Exchange Currency",
        description: "Exchange some currency to Polish Złoty (PLN)",
        date: "2025-04-23T00:00:00.000Z",
        icon: "money"
    },
    {
        title: "Confirm Arrival",
        description: "Confirm your arrival details with Shubham",
        date: "2025-04-23T00:00:00.000Z",
        icon: "plane"
    }
];

// @route   GET /api/reminders
// @desc    Get all reminders
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Try to get reminders from database
        const reminders = await Reminder.find();
        
        // If no reminders in database, use hardcoded data
        if (!reminders || reminders.length === 0) {
            return res.json(hardcodedReminders);
        }
        
        res.json(reminders);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        // Return hardcoded data on error
        res.json(hardcodedReminders);
    }
});

// @route   POST /api/reminders
// @desc    Create a new reminder
// @access  Private/Admin
router.post('/', testAuth, async (req, res) => {
    try {
        const newReminder = new Reminder(req.body);
        const savedReminder = await newReminder.save();
        res.status(201).json(savedReminder);
    } catch (error) {
        console.error('Error creating reminder:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/reminders/:id
// @desc    Update a reminder
// @access  Private/Admin
router.put('/:id', testAuth, async (req, res) => {
    try {
        const updatedReminder = await Reminder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedReminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        
        res.json(updatedReminder);
    } catch (error) {
        console.error('Error updating reminder:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete a reminder
// @access  Private/Admin
router.delete('/:id', testAuth, async (req, res) => {
    try {
        const deletedReminder = await Reminder.findByIdAndDelete(req.params.id);
        
        if (!deletedReminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        
        res.json({ message: 'Reminder removed' });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
