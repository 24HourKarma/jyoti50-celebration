const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Gallery = require('../models/gallery');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image');

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// @route   GET api/gallery
// @desc    Get all gallery items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ date: -1 });
    res.json(gallery);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/gallery/:id
// @desc    Get gallery item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ msg: 'Gallery item not found' });
    }
    
    res.json(gallery);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gallery item not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/gallery
// @desc    Create a gallery item
// @access  Private
router.post('/', auth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ msg: err.toString() });
    }
    
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    try {
      // Create relative URL for the image
      const imageUrl = `/uploads/${req.file.filename}`;
      
      const newGallery = new Gallery({
        title: req.body.title || 'Untitled',
        description: req.body.description || '',
        imageUrl: imageUrl,
      });

      const gallery = await newGallery.save();
      res.json(gallery);
    } catch (err) {
      console.error('Save error:', err.message);
      res.status(500).send('Server Error');
    }
  });
});

// @route   PUT api/gallery/:id
// @desc    Update a gallery item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ msg: 'Gallery item not found' });
    }
    
    // Update fields
    if (req.body.title) gallery.title = req.body.title;
    if (req.body.description) gallery.description = req.body.description;
    
    // If there's a new image, handle upload
    if (req.files && req.files.image) {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ msg: err });
        }
        
        // Create relative URL for the image
        gallery.imageUrl = `/uploads/${req.file.filename}`;
        
        gallery = await gallery.save();
        res.json(gallery);
      });
    } else {
      // Just save the updated text fields
      gallery = await gallery.save();
      res.json(gallery);
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gallery item not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/gallery/:id
// @desc    Delete a gallery item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({ msg: 'Gallery item not found' });
    }
    
    // Delete the image file if it exists
    if (gallery.imageUrl) {
      const imagePath = path.join(__dirname, '../../public', gallery.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await gallery.remove();
    res.json({ msg: 'Gallery item removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Gallery item not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
