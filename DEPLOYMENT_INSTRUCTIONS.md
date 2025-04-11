# Deployment Instructions for Jyoti's 50th Birthday Celebration Website

This document provides step-by-step instructions for deploying the wedding website to Render.com.

## Prerequisites

1. A GitHub account
2. A Render.com account
3. A MongoDB Atlas account (optional, as the site works with preloaded data)

## Step 1: Update package.json

Before deploying, make sure your package.json file includes the correct dependencies and Node.js version:

```json
{
  "name": "jyoti50-celebration",
  "version": "1.0.0",
  "description": "Jyoti's 50th Birthday Celebration Website",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "16.x"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^6.9.2",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

## Step 2: Upload to GitHub

1. Create a new repository on GitHub
2. Upload all the files from the wedding_website_dynamic_fixed.zip to this repository

## Step 3: Deploy to Render.com

1. Log in to your Render.com account
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the following settings:
   - **Name**: jyoti50-celebration
   - **Environment**: Node
   - **Build Command**: npm install
   - **Start Command**: node server.js
   - **Plan**: Free (or select a paid plan for better performance)

5. Add the following environment variables:
   - `NODE_VERSION`: 16.x
   - `JWT_SECRET`: jyoti50secretkey
   - `MONGODB_URI`: (Your MongoDB connection string, if you have one)

6. Click "Create Web Service"

## Step 4: Access Your Website

Once deployment is complete:

1. **Frontend Website**: https://jyoti50-celebration.onrender.com
2. **Admin Login**: https://jyoti50-celebration.onrender.com/admin-login

## Admin Login Credentials

Use these credentials to log in to the admin panel:

- **Email**: shubham.pandey@gmail.com
- **Password**: jyoti50admin

Alternatively, you can use:
- **Email**: admin@jyoti50celebration.com
- **Password**: jyoti50admin

## Important Notes

1. **Preloaded Data**: The website includes preloaded data for events, contacts, reminders, and notes. This ensures content is displayed even if the MongoDB connection fails.

2. **Hardcoded Authentication**: The admin login is hardcoded to work with the credentials above, ensuring you can always access the admin panel.

3. **Google Sheets Integration**: The Google Sheets integration has been simplified to avoid dependency issues. If you need full Google Sheets functionality, you'll need to install additional dependencies.

4. **MongoDB Connection**: While the site works without MongoDB, connecting to a database allows you to persist changes made through the admin panel.

## Troubleshooting

If you encounter deployment issues:

1. Check Render logs for specific error messages
2. Verify that you're using Node.js v16.x (set via environment variable)
3. Make sure all required environment variables are set
4. If you see dependency errors, try updating the package.json file with the exact versions listed above

## Support

If you need further assistance, please contact the developer.
