const express = require('express');
const router = express.Router();
const testAuth = require('../middleware/test-auth');
const Gallery = require('../models/gallery');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../public/uploads');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'gallery-' + uniqueSuffix + ext);
    }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
    fileFilter: fileFilter
});

// Hardcoded gallery items for fallback
const hardcodedGallery = [
    {
        title: "Kraków Main Square",
        description: "The historic main square of Kraków, one of the largest medieval town squares in Europe.",
        imageUrl: "/uploads/gallery-default-1.jpg",
        category: "Locations"
    },
    {
        title: "Wawel Castle",
        description: "The historic royal castle on Wawel Hill in Kraków, a symbol of Polish national identity.",
        imageUrl: "/uploads/gallery-default-2.jpg",
        category: "Locations"
    },
    {
        title: "Polish Cuisine",
        description: "Traditional Polish dishes that will be featured during our celebration.",
        imageUrl: "/uploads/gallery-default-3.jpg",
        category: "Food"
    },
    {
        title: "Jyoti's Birthday Cake",
        description: "Preview of the special cake being prepared for the celebration.",
        imageUrl: "/uploads/gallery-default-4.jpg",
        category: "Food"
    }
];

// @route   GET /api/gallery
// @desc    Get all gallery items
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Try to get gallery items from database
        const galleryItems = await Gallery.find();
        
        // If no gallery items in database, use hardcoded data
        if (!galleryItems || galleryItems.length === 0) {
            return res.json(hardcodedGallery);
        }
        
        res.json(galleryItems);
    } catch (error) {
        console.error('Error fetching gallery items:', error);
        // Return hardcoded data on error
        res.json(hardcodedGallery);
    }
});

// @route   POST /api/gallery
// @desc    Create a new gallery item
// @access  Private/Admin
router.post('/', testAuth, upload.single('image'), async (req, res) => {
    try {
        const { title, description, category } = req.body;
        
        // If no file was uploaded, return error
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }
        
        // Create relative URL for the uploaded file
        const imageUrl = `/uploads/${req.file.filename}`;
        
        const newGalleryItem = new Gallery({
            title,
            description,
            imageUrl,
            category
        });
        
        const savedGalleryItem = await newGalleryItem.save();
        res.status(201).json(savedGalleryItem);
    } catch (error) {
        console.error('Error creating gallery item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/gallery/:id
// @desc    Update a gallery item
// @access  Private/Admin
router.put('/:id', testAuth, upload.single('image'), async (req, res) => {
    try {
        const { title, description, category } = req.body;
        
        // Find the gallery item to update
        const galleryItem = await Gallery.findById(req.params.id);
        
        if (!galleryItem) {
            return res.status(404).json({ message: 'Gallery item not found' });
        }
        
        // Update fields
        galleryItem.title = title || galleryItem.title;
        galleryItem.description = description || galleryItem.description;
        galleryItem.category = category || galleryItem.category;
        
        // If a new image was uploaded, update the imageUrl
        if (req.file) {
            // Delete the old image if it exists and is not a default image
            if (galleryItem.imageUrl && !galleryItem.imageUrl.includes('default') && fs.existsSync(path.join(__dirname, '../../public', galleryItem.imageUrl))) {
                fs.unlinkSync(path.join(__dirname, '../../public', galleryItem.imageUrl));
            }
            
            // Update with new image URL
            galleryItem.imageUrl = `/uploads/${req.file.filename}`;
        }
        
        const updatedGalleryItem = await galleryItem.save();
        res.json(updatedGalleryItem);
    } catch (error) {
        console.error('Error updating gallery item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete a gallery item
// @access  Private/Admin
router.delete('/:id', testAuth, async (req, res) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id);
        
        if (!galleryItem) {
            return res.status(404).json({ message: 'Gallery item not found' });
        }
        
        // Delete the image file if it exists and is not a default image
        if (galleryItem.imageUrl && !galleryItem.imageUrl.includes('default') && fs.existsSync(path.join(__dirname, '../../public', galleryItem.imageUrl))) {
            fs.unlinkSync(path.join(__dirname, '../../public', galleryItem.imageUrl));
        }
        
        await galleryItem.remove();
        
        res.json({ message: 'Gallery item removed' });
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
