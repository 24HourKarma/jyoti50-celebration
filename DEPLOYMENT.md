# Deployment Instructions for Jyoti's 50th Birthday Celebration Website

This document provides step-by-step instructions for deploying the fixed wedding website to Render.com.

## Prerequisites

- A Render.com account
- Access to the MongoDB Atlas database (or another MongoDB provider)
- Google Sheets API credentials (if using Google Sheets integration)

## Deployment Steps

### 1. Prepare Your Environment Variables

Make sure you have the following environment variables ready:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `GOOGLE_SHEETS_ID`: ID of the Google Sheets document (if using Google Sheets integration)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: (Optional) Service account email for Google Sheets API
- `GOOGLE_PRIVATE_KEY`: (Optional) Private key for Google Sheets API

### 2. Deploy to Render.com

#### Option 1: Deploy via the Render Dashboard

1. Log in to your Render.com account
2. Go to the Dashboard and click "New +"
3. Select "Web Service"
4. Choose "Upload" for the deployment method
5. Upload the `wedding_website_final_fixed.zip` file
6. Configure the following settings:
   - **Name**: `jyoti50-celebration` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
7. Add the environment variables listed above
8. Click "Create Web Service"

#### Option 2: Update Existing Service

If you already have a service deployed at https://jyoti50-celebration.onrender.com/:

1. Log in to your Render.com account
2. Go to the Dashboard and select your existing service
3. Go to the "Manual Deploy" section
4. Choose "Upload Files"
5. Upload the `wedding_website_final_fixed.zip` file
6. Verify that all environment variables are set correctly
7. Click "Deploy"

### 3. Verify Deployment

1. Wait for the deployment to complete (this may take a few minutes)
2. Once deployed, visit your website URL (e.g., https://jyoti50-celebration.onrender.com/)
3. Verify that the home page loads correctly
4. Click on the "Schedule" tab and verify that the schedule is properly formatted with attractive styling
5. Log in to the admin panel at `/admin-login.html` (default credentials: username: `admin`, password: `admin123`)
6. Test the admin functionality, particularly editing events and verifying that dates are saved correctly

## Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection issues:

1. Verify that your MongoDB Atlas cluster is running and accessible
2. Check that the IP address of your Render.com service is whitelisted in MongoDB Atlas
3. Verify that the connection string in the `MONGODB_URI` environment variable is correct

### Google Sheets Integration Issues

If the Google Sheets integration is not working:

1. Verify that the Google Sheets ID is correct
2. Check that the service account has access to the Google Sheets document
3. Ensure the private key is properly formatted in the environment variable (replace newlines with `\n`)

### Admin Login Issues

If you cannot log in to the admin panel:

1. Try the default credentials (username: `admin`, password: `admin123`)
2. If that doesn't work, you may need to reset the admin password in the MongoDB database

## Support

If you encounter any issues during deployment, please contact the development team for assistance.
