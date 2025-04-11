const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
require('dotenv').config();

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Configure multer for S3 storage
const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'images/image-' + uniqueSuffix + ext);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed!'));
  }
});

// Function to upload image to S3
const uploadImageToS3 = (file) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `images/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error('Error uploading to S3:', err);
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
};

// Function to delete image from S3
const deleteImageFromS3 = (imageUrl) => {
  return new Promise((resolve, reject) => {
    // Extract key from URL
    const key = imageUrl.split('/').slice(3).join('/');
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.error('Error deleting from S3:', err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = {
  uploadToS3,
  uploadImageToS3,
  deleteImageFromS3
};
