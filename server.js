const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Event = require('./models/Event');
const Contact = require('./models/Contact');
const Reminder = require('./models/Reminder');
const Note = require('./models/Note');
const Gallery = require('./models/Gallery');
const Footer = require('./models/Footer');
const Settings = require('./models/Settings');

// Import modules
const { fetchGoogleSheetsData, syncGoogleSheetsToDatabase } = require('./google-sheets');
const { initializeDatabase } = require('./db-init');
const localStorage = require('./local-storage');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB successfully');
    
    // Initialize database with models and config
    const models = { User, Event, Contact, Reminder, Note, Gallery, Footer, Settings };
    const config = { 
        GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID,
        JWT_SECRET: process.env.JWT_SECRET
    };
    
    initializeDatabase(models, config)
        .then(() => {
            console.log('Database initialization completed successfully');
        })
        .catch(err => {
            console.error('Database initialization error:', err);
        });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('No authentication token provided');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: 'Authentication required', details: error.message });
    }
};

// API Routes

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Events routes
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1, startTime: 1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.get('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.post('/api/events', auth, async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.put('/api/events/:id', auth, async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json(event);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.delete('/api/events/:id', auth, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Contacts routes
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ type: 1, name: 1 });
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.get('/api/contacts/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        
        res.json(contact);
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.post('/api/contacts', auth, async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        await newContact.save();
        res.status(201).json(newContact);
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.put('/api/contacts/:id', auth, async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        
        res.json(contact);
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.delete('/api/contacts/:id', auth, async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Reminders routes
app.get('/api/reminders', async (req, res) => {
    try {
        const reminders = await Reminder.find().sort({ date: 1 });
        res.json(reminders);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.get('/api/reminders/:id', async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);
        
        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }
        
        res.json(reminder);
    } catch (error) {
        console.error('Error fetching reminder:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.post('/api/reminders', auth, async (req, res) => {
    try {
        const newReminder = new Reminder(req.body);
        await newReminder.save();
        res.status(201).json(newReminder);
    } catch (error) {
        console.error('Error creating reminder:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.put('/api/reminders/:id', auth, async (req, res) => {
    try {
        const reminder = await Reminder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }
        
        res.json(reminder);
    } catch (error) {
        console.error('Error updating reminder:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.delete('/api/reminders/:id', auth, async (req, res) => {
    try {
        const reminder = await Reminder.findByIdAndDelete(req.params.id);
        
        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }
        
        res.json({ message: 'Reminder deleted successfully' });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Notes routes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await Note.find();
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.get('/api/notes/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        res.json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.post('/api/notes', auth, async (req, res) => {
    try {
        const newNote = new Note(req.body);
        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.put('/api/notes/:id', auth, async (req, res) => {
    try {
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        res.json(note);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.delete('/api/notes/:id', auth, async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Google Sheets sync endpoint
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

// Gallery routes
app.get('/api/gallery', async (req, res) => {
    try {
        const gallery = await Gallery.find().sort({ uploadDate: -1 });
        res.json(gallery);
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Use local storage for image uploads
app.post('/api/gallery/upload', localStorage.upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        // Create relative path for storage in database
        const relativePath = `/uploads/${req.file.filename}`;
        
        const newImage = new Gallery({
            path: relativePath,
            description: req.body.description || 'Gallery Image'
        });
        
        await newImage.save();
        
        res.status(201).json(newImage);
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.delete('/api/gallery/:id', auth, async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        // Delete file from filesystem
        const filePath = path.join(__dirname, 'public', image.path);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Delete from database
        await Gallery.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Footer routes
app.get('/api/footer', async (req, res) => {
    try {
        let footer = await Footer.findOne();
        
        if (!footer) {
            // Create default footer if none exists
            footer = await Footer.create({
                title: 'Jyoti\'s 50th Birthday Celebration',
                text: 'Join us for a memorable celebration in Kraków, Poland!',
                copyright: '© 2025 Jyoti\'s 50th Birthday'
            });
        }
        
        res.json(footer);
    } catch (error) {
        console.error('Error fetching footer:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.put('/api/footer', auth, async (req, res) => {
    try {
        let footer = await Footer.findOne();
        
        if (!footer) {
            // Create new footer if none exists
            footer = new Footer(req.body);
            await footer.save();
        } else {
            // Update existing footer
            footer = await Footer.findByIdAndUpdate(
                footer._id,
                req.body,
                { new: true, runValidators: true }
            );
        }
        
        res.json(footer);
    } catch (error) {
        console.error('Error updating footer:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Settings routes
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        if (!settings) {
            // Create default settings if none exist
            settings = await Settings.create({
                siteTitle: 'Jyoti\'s 50th Birthday Celebration',
                eventDate: 'April 24-27, 2025',
                eventLocation: 'Kraków, Poland',
                primaryColor: '#d4af37',
                secondaryColor: '#121212'
            });
        }
        
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

app.put('/api/settings', auth, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        if (!settings) {
            // Create new settings if none exist
            settings = new Settings(req.body);
            await settings.save();
        } else {
            // Update existing settings
            settings = await Settings.findByIdAndUpdate(
                settings._id,
                req.body,
                { new: true, runValidators: true }
            );
        }
        
        res.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Google Sheets sync route
app.get('/api/sync-google-sheets', async (req, res) => {
    try {
        if (!process.env.GOOGLE_SHEETS_ID) {
            return res.status(400).json({ error: 'Google Sheets ID not configured' });
        }
        
        const result = await syncGoogleSheetsToDatabase(process.env.GOOGLE_SHEETS_ID, Event);
        res.json(result);
    } catch (error) {
        console.error('Error syncing Google Sheets:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Debug route to check database connection
app.get('/api/debug/db-status', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        const statusMap = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        const counts = {
            users: await User.countDocuments(),
            events: await Event.countDocuments(),
            contacts: await Contact.countDocuments(),
            reminders: await Reminder.countDocuments(),
            notes: await Note.countDocuments(),
            gallery: await Gallery.countDocuments(),
            footer: await Footer.countDocuments(),
            settings: await Settings.countDocuments()
        };
        
        res.json({
            dbStatus: statusMap[dbStatus] || 'unknown',
            connectionString: process.env.MONGODB_URI ? 'configured' : 'missing',
            collections: counts,
            environment: {
                nodeEnv: process.env.NODE_ENV,
                port: process.env.PORT,
                googleSheetsId: process.env.GOOGLE_SHEETS_ID ? 'configured' : 'missing',
                jwtSecret: process.env.JWT_SECRET ? 'configured' : 'missing'
            }
        });
    } catch (error) {
        console.error('Error checking database status:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Force database initialization route (for troubleshooting)
app.get('/api/debug/force-init', async (req, res) => {
    try {
        const models = { User, Event, Contact, Reminder, Note, Gallery, Footer, Settings };
        const config = { 
            GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID,
            JWT_SECRET: process.env.JWT_SECRET
        };
        
        await initializeDatabase(models, config);
        
        const counts = {
            users: await User.countDocuments(),
            events: await Event.countDocuments(),
            contacts: await Contact.countDocuments(),
            reminders: await Reminder.countDocuments(),
            notes: await Note.countDocuments(),
            gallery: await Gallery.countDocuments(),
            footer: await Footer.countDocuments(),
            settings: await Settings.countDocuments()
        };
        
        res.json({
            message: 'Database initialization forced successfully',
            collections: counts
        });
    } catch (error) {
        console.error('Error forcing database initialization:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Serve index.html for all other routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
