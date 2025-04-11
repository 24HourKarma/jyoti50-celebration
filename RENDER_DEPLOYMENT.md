# Render Deployment Instructions for Dynamic Wedding Website

## Overview

This document provides step-by-step instructions for deploying the fixed dynamic wedding website to Render.com. The website includes all requested functionality:
- Schedule formatting with proper display
- Admin panel with correct date handling
- Google Sheets integration
- Full backend control and database functionality

## Deployment Steps

### 1. Prepare Your GitHub Repository

1. Create a new GitHub repository or clean your existing one
2. Upload the contents of `wedding_website_dynamic_fixed.zip` to your repository

### 2. Set Up Render Web Service

1. Log in to your Render dashboard
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the following settings:
   - **Name**: jyoti50-celebration (or your preferred name)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (or select a paid plan for better performance)

### 3. Configure Environment Variables

In the Render dashboard, add the following environment variables:
- `NODE_VERSION`: 16.x
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT authentication
- `GOOGLE_SHEETS_ID`: Your Google Sheets document ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Your Google service account email
- `GOOGLE_PRIVATE_KEY`: Your Google service account private key (with newlines as \n)

### 4. Deploy the Service

1. Click "Create Web Service"
2. Wait for the deployment to complete (this may take a few minutes)
3. Your website will be available at `https://jyoti50-celebration.onrender.com` (or your custom name)

## Key Fixes Implemented

1. **Google Sheets Integration Fix**:
   - Fixed the module structure to use Express Router instead of direct app references
   - Properly implemented authentication middleware
   - Added comprehensive error handling

2. **Schedule Formatting Fix**:
   - Implemented proper formatting for schedule items
   - Added day headers with icons
   - Created well-structured event cards with all details

3. **Admin Date Handling Fix**:
   - Fixed date parsing and formatting in the admin panel
   - Implemented dropdown selection for specific dates
   - Ensured proper date storage and retrieval

## Troubleshooting

If you encounter deployment issues:

1. **Check Render Logs**:
   - In the Render dashboard, go to your service and click "Logs"
   - Look for any error messages that might indicate the problem

2. **Verify Environment Variables**:
   - Ensure all environment variables are correctly set
   - Check that the Google Sheets credentials are properly formatted

3. **Node.js Version**:
   - Confirm that the NODE_VERSION environment variable is set to 16.x
   - Render may default to a newer version that could cause compatibility issues

4. **MongoDB Connection**:
   - Verify that your MongoDB connection string is correct
   - Ensure your MongoDB instance is accessible from Render

## Maintenance

For future updates:

1. Make changes to your GitHub repository
2. Render will automatically deploy the updated code
3. Monitor the deployment logs for any issues

## Support

If you need further assistance, please refer to:
- The GOOGLE_SHEETS_FIX.md file for details on the Google Sheets integration
- The CHANGES.md file for a complete list of changes made
- The MAINTENANCE.md file for ongoing maintenance instructions
