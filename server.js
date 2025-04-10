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

// Import local storage module
const localStorage = require('./local-storage');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    initializeDatabase();
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            throw new Error();
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication required' });
    }
};

// Initialize database with default data if empty
async function initializeDatabase() {
    try {
        // Check if admin user exists
        const adminExists = await User.findOne({ email: 'shubham.pandey@gmail.com' });
        
        if (!adminExists) {
            // Create admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('jyoti50admin', salt);
            
            await User.create({
                email: 'shubham.pandey@gmail.com',
                password: hashedPassword,
                role: 'admin'
            });
            
            console.log('Admin user created');
        }
        
        // Check if footer exists
        const footerExists = await Footer.findOne();
        
        if (!footerExists) {
            // Create default footer
            await Footer.create({
                title: 'Jyoti\'s 50th Birthday Celebration',
                text: 'Join us for a memorable celebration in Kraków, Poland!',
                copyright: '© 2025 Jyoti\'s 50th Birthday'
            });
            
            console.log('Default footer created');
        }
        
        // Check if settings exist
        const settingsExist = await Settings.findOne();
        
        if (!settingsExist) {
            // Create default settings
            await Settings.create({
                siteTitle: 'Jyoti\'s 50th Birthday Celebration',
                eventDate: 'April 24-27, 2025',
                eventLocation: 'Kraków, Poland',
                primaryColor: '#d4af37',
                secondaryColor: '#121212'
            });
            
            console.log('Default settings created');
        }
        
        // Check if sample data exists
        const eventsExist = await Event.countDocuments();
        
        if (eventsExist === 0) {
            // Create sample events
            await Event.create([
                {
                    title: 'Welcome Dinner',
                    date: '2025-04-24',
                    startTime: '19:00',
                    endTime: '22:00',
                    location: 'Hotel Restaurant',
                    description: 'Join us for a welcome dinner to kick off the celebration weekend.',
                    dressCode: 'Smart Casual',
                    notes: 'Drinks and dinner will be provided.',
                    day: 'Thursday, April 24, 2025',
                    mapUrl: 'https://maps.google.com',
                    websiteUrl: 'https://hotel-restaurant.com'
                },
                {
                    title: 'City Tour',
                    date: '2025-04-25',
                    startTime: '10:00',
                    endTime: '14:00',
                    location: 'Kraków Old Town',
                    description: 'Guided tour of Kraków\'s historic sites.',
                    dressCode: 'Casual, comfortable shoes',
                    notes: 'Please bring water and wear comfortable walking shoes.',
                    day: 'Friday, April 25, 2025',
                    mapUrl: 'https://maps.google.com',
                    websiteUrl: ''
                },
                {
                    title: 'Birthday Gala Dinner',
                    date: '2025-04-25',
                    startTime: '19:00',
                    endTime: '23:00',
                    location: 'Grand Ballroom',
                    description: 'Formal dinner celebration for Jyoti\'s 50th birthday.',
                    dressCode: 'Formal',
                    notes: 'Special performances and speeches planned.',
                    day: 'Friday, April 25, 2025',
                    mapUrl: 'https://maps.google.com',
                    websiteUrl: ''
                },
                {
                    title: 'Farewell Brunch',
                    date: '2025-04-26',
                    startTime: '11:00',
                    endTime: '14:00',
                    location: 'Hotel Garden',
                    description: 'Relaxed brunch to say goodbye.',
                    dressCode: 'Casual',
                    notes: 'Weather permitting, this will be held in the garden.',
                    day: 'Saturday, April 26, 2025',
                    mapUrl: 'https://maps.google.com',
                    websiteUrl: ''
                }
            ]);
            
            console.log('Sample events created');
            
            // Create sample contacts
            await Contact.create([
                {
                    name: 'Shubham Pandey',
                    email: 'shubham.pandey@gmail.com',
                    phone: '+1 (123) 456-7890',
                    type: 'Host',
                    description: 'Main contact for all event inquiries'
                },
                {
                    name: 'Hotel Concierge',
                    email: 'concierge@hotel.com',
                    phone: '+48 12 345 6789',
                    type: 'Venue',
                    description: 'Contact for hotel-related questions'
                },
                {
                    name: 'Tour Guide',
                    email: 'guide@krakow-tours.com',
                    phone: '+48 98 765 4321',
                    type: 'Activities',
                    description: 'Contact for tour information'
                }
            ]);
            
            console.log('Sample contacts created');
            
            // Create sample reminders
            await Reminder.create([
                {
                    title: 'Book Your Flight',
                    description: 'Remember to book your flight to Kraków as soon as possible for the best rates.',
                    date: '2025-01-15',
                    icon: 'Calendar'
                },
                {
                    title: 'Reserve Your Hotel Room',
                    description: 'Special rates are available at the event hotel until March 1, 2025.',
                    date: '2025-02-15',
                    icon: 'Bell'
                },
                {
                    title: 'Bring Formal Attire',
                    description: 'Don\'t forget to pack formal attire for the gala dinner on Friday.',
                    date: '2025-04-15',
                    icon: 'Info'
                },
                {
                    title: 'Weather Advisory',
                    description: 'April in Kraków can be unpredictable. Pack layers and a light raincoat.',
                    date: '2025-04-20',
                    icon: 'Warning'
                }
            ]);
            
            console.log('Sample reminders created');
            
            // Create sample notes
            await Note.create([
                {
                    title: 'Welcome to Jyoti\'s 50th Birthday Celebration!',
                    content: 'We\'re thrilled to have you join us for this special occasion. This website contains all the information you\'ll need for the celebration weekend.',
                    displayLocation: 'Home Page'
                },
                {
                    title: 'Schedule Information',
                    content: 'All events are optional, but we hope you\'ll join us for as many as possible. Please let us know if you have any dietary restrictions or special requirements.',
                    displayLocation: 'Schedule Page'
                },
                {
                    title: 'Photo Sharing',
                    content: 'Please share your photos from the celebration by uploading them to this gallery. They will be compiled into a memory book for Jyoti.',
                    displayLocation: 'Gallery Page'
                },
                {
                    title: 'Important Contacts',
                    content: 'If you need assistance during your stay in Kraków, please don\'t hesitate to reach out to any of the contacts listed here.',
                    displayLocation: 'Contacts Page'
                },
                {
                    title: 'Key Reminders',
                    content: 'Please review these important reminders to ensure you\'re prepared for the celebration weekend.',
                    displayLocation: 'Reminders Page'
                }
            ]);
            
            console.log('Sample notes created');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// API Routes

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
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
        res.status(500).json({ error: 'Server error' });
    }
});

// Events routes
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1, startTime: 1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/events', auth, async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
    }
});

// Contacts routes
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ type: 1, name: 1 });
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/contacts', auth, async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        await newContact.save();
        res.status(201).json(newContact);
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
    }
});

// Reminders routes
app.get('/api/reminders', async (req, res) => {
    try {
        const reminders = await Reminder.find().sort({ date: 1 });
        res.json(reminders);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/reminders', auth, async (req, res) => {
    try {
        const newReminder = new Reminder(req.body);
        await newReminder.save();
        res.status(201).json(newReminder);
    } catch (error) {
        console.error('Error creating reminder:', error);
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
    }
});

// Notes routes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await Note.find();
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/notes', auth, async (req, res) => {
    try {
        const newNote = new Note(req.body);
        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
    }
});

// Gallery routes
app.get('/api/gallery', async (req, res) => {
    try {
        const gallery = await Gallery.find().sort({ uploadDate: -1 });
        res.json(gallery);
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
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
        res.status(500).json({ error: 'Server error' });
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
