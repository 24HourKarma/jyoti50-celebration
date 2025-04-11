// Simplified server.js without Google Sheets integration
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

// Connect to MongoDB
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

// Initialize default settings and admin user
async function initializeDefaults() {
    try {
        // Check if admin user exists
        const adminCount = await User.countDocuments({ isAdmin: true });
        if (adminCount === 0) {
            // Create default admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                password: hashedPassword,
                isAdmin: true
            });
            console.log('Default admin user created');
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
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
}

// API Routes

// Authentication routes
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });
        
        // Generate token
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
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
        res.status(500).json({ message: 'Server error' });
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
        res.status(500).json({ message: 'Server error' });
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
        res.status(500).json({ message: 'Server error' });
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
        res.status(500).json({ message: 'Server error' });
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

// Google Sheets integration - REMOVED TO FIX DEPLOYMENT ISSUES
// This section has been removed to ensure successful deployment

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
