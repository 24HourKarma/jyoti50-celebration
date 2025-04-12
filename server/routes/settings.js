const express = require('express');
const router = express.Router();
const testAuth = require('../middleware/test-auth');
const Setting = require('../models/setting');

// Hardcoded settings for fallback
const hardcodedSettings = [
    {
        key: "siteTitle",
        value: "Jyoti's 50th Birthday Celebration"
    },
    {
        key: "siteSubtitle",
        value: "April 24-27, 2025 | Kraków, Poland"
    },
    {
        key: "headerImage",
        value: "/uploads/header-image.jpg"
    },
    {
        key: "primaryColor",
        value: "#000000"
    },
    {
        key: "secondaryColor",
        value: "#D4AF37"
    },
    {
        key: "footerText",
        value: "© 2025 Jyoti's 50th Birthday Celebration"
    }
];

// @route   GET /api/settings
// @desc    Get all settings
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Try to get settings from database
        const settings = await Setting.find();
        
        // If no settings in database, use hardcoded data
        if (!settings || settings.length === 0) {
            return res.json(hardcodedSettings);
        }
        
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        // Return hardcoded data on error
        res.json(hardcodedSettings);
    }
});

// @route   GET /api/settings/:key
// @desc    Get setting by key
// @access  Public
router.get('/:key', async (req, res) => {
    try {
        // Try to get setting from database
        const setting = await Setting.findOne({ key: req.params.key });
        
        // If setting not found in database, check hardcoded data
        if (!setting) {
            const hardcodedSetting = hardcodedSettings.find(s => s.key === req.params.key);
            if (hardcodedSetting) {
                return res.json(hardcodedSetting);
            } else {
                return res.status(404).json({ message: 'Setting not found' });
            }
        }
        
        res.json(setting);
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/settings/:key
// @desc    Update or create a setting
// @access  Private/Admin
router.put('/:key', testAuth, async (req, res) => {
    try {
        const { value } = req.body;
        
        if (!value) {
            return res.status(400).json({ message: 'Value is required' });
        }
        
        // Find and update setting, or create if it doesn't exist
        const setting = await Setting.findOneAndUpdate(
            { key: req.params.key },
            { key: req.params.key, value },
            { new: true, upsert: true, runValidators: true }
        );
        
        res.json(setting);
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/settings/:key
// @desc    Delete a setting
// @access  Private/Admin
router.delete('/:key', testAuth, async (req, res) => {
    try {
        const deletedSetting = await Setting.findOneAndDelete({ key: req.params.key });
        
        if (!deletedSetting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        
        res.json({ message: 'Setting removed' });
    } catch (error) {
        console.error('Error deleting setting:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
