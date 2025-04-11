// server.js with preloaded data
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB with improved error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding_website', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // 5 second timeout
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    // Continue running the server even if MongoDB connection fails
    // This allows the static files to be served
});

// Define schemas and models
const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    day: { type: String, required: true },
    date: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    location: { type: String },
    description: { type: String },
    dressCode: { type: String },
    mapUrl: { type: String },
    websiteUrl: { type: String },
    notes: { type: String }
});

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String },
    phone: { type: String },
    email: { type: String },
    type: { type: String },
    notes: { type: String }
});

const reminderSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date },
    icon: { type: String }
});

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String },
    location: { type: String }
});

const gallerySchema = new mongoose.Schema({
    url: { type: String, required: true },
    caption: { type: String },
    uploadDate: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
});

const settingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String }
});

// Create models
const Event = mongoose.model('Event', eventSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Reminder = mongoose.model('Reminder', reminderSchema);
const Note = mongoose.model('Note', noteSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const User = mongoose.model('User', userSchema);
const Setting = mongoose.model('Setting', settingSchema);

// Preloaded data for events
const preloadedEvents = [
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

// Preloaded data for contacts
const preloadedContacts = [
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

// Preloaded data for reminders
const preloadedReminders = [
    {
        title: "Book Flights",
        description: "Remember to book your flights to Kraków well in advance for the best rates.",
        date: new Date("2025-02-24T00:00:00"),
        icon: "plane"
    },
    {
        title: "Reserve Hotel Room",
        description: "Book your room at the Grand Hotel Kraków using the group rate code: JYOTI50.",
        date: new Date("2025-03-10T00:00:00"),
        icon: "hotel"
    },
    {
        title: "Pack Formal Attire",
        description: "Don't forget to pack formal attire for the Gala Dinner on Friday night.",
        date: new Date("2025-04-20T00:00:00"),
        icon: "tshirt"
    },
    {
        title: "Exchange Currency",
        description: "Poland uses the Polish Złoty (PLN). Exchange some currency before arrival or at the airport.",
        date: new Date("2025-04-22T00:00:00"),
        icon: "money-bill"
    }
];

// Preloaded data for notes
const preloadedNotes = [
    {
        title: "Accommodation Information",
        content: "The Grand Hotel Kraków is located in the heart of the Old Town, just steps from the Main Square. The hotel offers luxurious rooms, a spa, and a restaurant. A special group rate has been arranged for Jyoti's celebration guests. Use code JYOTI50 when booking.",
        location: "Information"
    },
    {
        title: "Weather in Kraków",
        content: "April in Kraków typically has temperatures ranging from 5°C to 15°C (41°F to 59°F). It can be quite variable, with occasional rain showers. Pack layers, a light jacket, and an umbrella or raincoat.",
        location: "Information"
    },
    {
        title: "Local Currency",
        content: "Poland uses the Polish Złoty (PLN). As of 2025, the exchange rate is approximately 1 USD = 3.8 PLN, 1 EUR = 4.3 PLN. Credit cards are widely accepted in Kraków, but it's good to have some cash for small purchases and tips.",
        location: "Information"
    },
    {
        title: "Transportation",
        content: "Kraków has an excellent public transportation system with trams and buses. Taxis and ride-sharing services are also readily available. The Old Town is very walkable, and most of our events will take place within walking distance of the hotel.",
        location: "Information"
    }
];

// Initialize default settings, admin user, and preloaded data
async function initializeDefaults() {
    try {
        // Check if admin user exists
        const adminCount = await User.countDocuments({ isAdmin: true });
        if (adminCount === 0) {
            // Create default admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                email: 'admin@jyoti50celebration.com',
                password: hashedPassword,
                isAdmin: true
            });
            console.log('Default admin user created');
            
            // Create Shubham as admin
            const shubhamPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'shubham',
                email: 'shubham.pandey@gmail.com',
                password: shubhamPassword,
                isAdmin: true
            });
            console.log('Shubham admin user created');
        }
        
        // Check if settings exist
        const settingsCount = await Setting.countDocuments();
        if (settingsCount === 0) {
            // Create default settings
            await Setting.create([
                { key: 'siteTitle', value: 'Jyoti\'s 50th Birthday Celebration' },
                { key: 'eventDate', value: 'April 24-27, 2025' },
                { key: 'eventLocation', value: 'Kraków, Poland' },
                { key: 'primaryColor', value: '#d4af37' },
                { key: 'secondaryColor', value: '#121212' }
            ]);
            console.log('Default settings created');
        }
        
        // Check if events exist
        const eventsCount = await Event.countDocuments();
        if (eventsCount === 0) {
            // Create preloaded events
            await Event.insertMany(preloadedEvents);
            console.log('Preloaded events created');
        }
        
        // Check if contacts exist
        const contactsCount = await Contact.countDocuments();
        if (contactsCount === 0) {
            // Create preloaded contacts
            await Contact.insertMany(preloadedContacts);
            console.log('Preloaded contacts created');
        }
        
        // Check if reminders exist
        const remindersCount = await Reminder.countDocuments();
        if (remindersCount === 0) {
            // Create preloaded reminders
            await Reminder.insertMany(preloadedReminders);
            console.log('Preloaded reminders created');
        }
        
        // Check if notes exist
        const notesCount = await Note.countDocuments();
        if (notesCount === 0) {
            // Create preloaded notes
            await Note.insertMany(preloadedNotes);
            console.log('Preloaded notes created');
        }
    } catch (err) {
        console.error('Error initializing defaults:', err);
    }
}

// Call initialization function
initializeDefaults();

// Set up file storage for gallery uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'image-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
    jwt.verify(token, process.env.JWT_SECRET || 'jyoti50secretkey', (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
}

// API Routes

// Authentication routes
app.post('/api/login', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        // Find user by username or email
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else {
            user = await User.findOne({ username });
        }
        
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });
        
        // Generate token
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'jyoti50secretkey', { expiresIn: '24h' });
        
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Event routes
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ day: 1 });
        res.json(events);
    } catch (err) {
        console.error('Error fetching events:', err);
        // Return preloaded events as fallback
        res.json(preloadedEvents);
    }
});

app.post('/api/events', authenticateToken, async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
        res.json(updatedEvent);
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Contact routes
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ name: 1 });
        res.json(contacts);
    } catch (err) {
        console.error('Error fetching contacts:', err);
        // Return preloaded contacts as fallback
        res.json(preloadedContacts);
    }
});

app.post('/api/contacts', authenticateToken, async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        await newContact.save();
        res.status(201).json(newContact);
    } catch (err) {
        console.error('Error creating contact:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/contacts/:id', authenticateToken, async (req, res) => {
    try {
        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedContact) return res.status(404).json({ message: 'Contact not found' });
        res.json(updatedContact);
    } catch (err) {
        console.error('Error updating contact:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
    try {
        const deletedContact = await Contact.findByIdAndDelete(req.params.id);
        if (!deletedContact) return res.status(404).json({ message: 'Contact not found' });
        res.json({ message: 'Contact deleted successfully' });
    } catch (err) {
        console.error('Error deleting contact:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reminder routes
app.get('/api/reminders', async (req, res) => {
    try {
        const reminders = await Reminder.find().sort({ date: 1 });
        res.json(reminders);
    } catch (err) {
        console.error('Error fetching reminders:', err);
        // Return preloaded reminders as fallback
        res.json(preloadedReminders);
    }
});

app.post('/api/reminders', authenticateToken, async (req, res) => {
    try {
        const newReminder = new Reminder(req.body);
        await newReminder.save();
        res.status(201).json(newReminder);
    } catch (err) {
        console.error('Error creating reminder:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/reminders/:id', authenticateToken, async (req, res) => {
    try {
        const updatedReminder = await Reminder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedReminder) return res.status(404).json({ message: 'Reminder not found' });
        res.json(updatedReminder);
    } catch (err) {
        console.error('Error updating reminder:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/reminders/:id', authenticateToken, async (req, res) => {
    try {
        const deletedReminder = await Reminder.findByIdAndDelete(req.params.id);
        if (!deletedReminder) return res.status(404).json({ message: 'Reminder not found' });
        res.json({ message: 'Reminder deleted successfully' });
    } catch (err) {
        console.error('Error deleting reminder:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Note routes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await Note.find().sort({ title: 1 });
        res.json(notes);
    } catch (err) {
        console.error('Error fetching notes:', err);
        // Return preloaded notes as fallback
        res.json(preloadedNotes);
    }
});

app.post('/api/notes', authenticateToken, async (req, res) => {
    try {
        const newNote = new Note(req.body);
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        console.error('Error creating note:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/notes/:id', authenticateToken, async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
        res.json(updatedNote);
    } catch (err) {
        console.error('Error updating note:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Gallery routes
app.get('/api/gallery', async (req, res) => {
    try {
        const images = await Gallery.find().sort({ uploadDate: -1 });
        res.json(images);
    } catch (err) {
        console.error('Error fetching gallery:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/gallery', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        const newImage = new Gallery({
            url: imageUrl,
            caption: req.body.caption || ''
        });
        
        await newImage.save();
        res.status(201).json(newImage);
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/gallery/:id', authenticateToken, async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found' });
        
        // Delete file from filesystem
        const filePath = path.join(__dirname, 'public', image.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Delete from database
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        console.error('Error deleting image:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Settings routes
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await Setting.find();
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });
        res.json(settingsObj);
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        const updatePromises = [];
        
        for (const [key, value] of Object.entries(updates)) {
            updatePromises.push(
                Setting.findOneAndUpdate(
                    { key },
                    { value },
                    { upsert: true, new: true }
                )
            );
        }
        
        await Promise.all(updatePromises);
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        console.error('Error updating settings:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Serve the admin dashboard
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Serve the admin login page
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Serve the main index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
