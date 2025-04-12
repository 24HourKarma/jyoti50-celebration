const express = require('express');
const router = express.Router();
const testAuth = require('../middleware/test-auth');
const Contact = require('../models/contact');

// Hardcoded contacts for fallback
const hardcodedContacts = [
    {
        name: "Shubham Pandey",
        title: "Event Organizer",
        phone: "+1 (555) 123-4567",
        email: "shubham.pandey@gmail.com",
        type: "Organizer",
        notes: "Main contact for all event inquiries"
    },
    {
        name: "Grand Hotel Kraków",
        title: "Accommodation",
        phone: "+48 12 424 08 00",
        email: "reception@grand.pl",
        type: "Venue",
        notes: "Main accommodation for all guests"
    },
    {
        name: "Kraków Tours",
        title: "Tour Provider",
        phone: "+48 12 429 44 99",
        email: "info@krakowtours.pl",
        type: "Service",
        notes: "Handling all guided tours"
    },
    {
        name: "Medical Emergency",
        title: "Emergency Service",
        phone: "112",
        email: "",
        type: "Emergency",
        notes: "European emergency number"
    }
];

// @route   GET /api/contacts
// @desc    Get all contacts
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Try to get contacts from database
        const contacts = await Contact.find();
        
        // If no contacts in database, use hardcoded data
        if (!contacts || contacts.length === 0) {
            return res.json(hardcodedContacts);
        }
        
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        // Return hardcoded data on error
        res.json(hardcodedContacts);
    }
});

// @route   POST /api/contacts
// @desc    Create a new contact
// @access  Private/Admin
router.post('/', testAuth, async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        const savedContact = await newContact.save();
        res.status(201).json(savedContact);
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/contacts/:id
// @desc    Update a contact
// @access  Private/Admin
router.put('/:id', testAuth, async (req, res) => {
    try {
        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        
        res.json(updatedContact);
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete a contact
// @access  Private/Admin
router.delete('/:id', testAuth, async (req, res) => {
    try {
        const deletedContact = await Contact.findByIdAndDelete(req.params.id);
        
        if (!deletedContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        
        res.json({ message: 'Contact removed' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
