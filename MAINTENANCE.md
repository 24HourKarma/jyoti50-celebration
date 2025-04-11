# Wedding Website Maintenance Guide

This guide provides comprehensive instructions for maintaining and updating the Jyoti's 50th Birthday Celebration website.

## Table of Contents
1. [Accessing the Admin Panel](#accessing-the-admin-panel)
2. [Managing Event Schedule](#managing-event-schedule)
3. [Google Sheets Integration](#google-sheets-integration)
4. [Managing Contacts](#managing-contacts)
5. [Managing Reminders](#managing-reminders)
6. [Managing Notes](#managing-notes)
7. [Gallery Management](#gallery-management)
8. [Deployment Instructions](#deployment-instructions)
9. [Environment Variables](#environment-variables)
10. [Troubleshooting](#troubleshooting)

## Accessing the Admin Panel

The admin panel is accessible at `/admin-login.html`. Use the following credentials to log in:

- **Email**: shubham.pandey@gmail.com
- **Password**: jyoti50admin

For security reasons, it's recommended to change these credentials after the initial setup.

## Managing Event Schedule

### Adding Events
1. Log in to the admin panel
2. Navigate to the "Schedule" tab
3. Click "Add New Event"
4. Fill in the event details:
   - Title
   - Date (select from the calendar)
   - Start Time
   - End Time
   - Location
   - Description
   - Dress Code (optional)
   - Map URL (optional)
   - Website URL (optional)
   - Notes (optional)
5. Click "Save" to add the event

### Editing Events
1. Navigate to the "Schedule" tab in the admin panel
2. Find the event you want to edit
3. Click the "Edit" button
4. Update the event details
5. Click "Save" to apply changes

### Deleting Events
1. Navigate to the "Schedule" tab in the admin panel
2. Find the event you want to delete
3. Click the "Delete" button
4. Confirm deletion when prompted

## Google Sheets Integration

The website can import event data directly from Google Sheets, which is useful for bulk updates.

### Google Sheets Format
Your Google Sheet should have the following columns:
- Title
- Date (format: April 24, 2025 or YYYY-MM-DD)
- Start Time (format: HH:MM or H:MM AM/PM)
- End Time (format: HH:MM or H:MM AM/PM)
- Location
- Description
- Dress Code
- Notes
- Day (optional, will be auto-determined if not provided)
- Map URL
- Website URL

### Syncing with Google Sheets
1. Log in to the admin panel
2. Navigate to the "Schedule" tab
3. Click the "Sync with Google Sheets" button
4. Wait for the confirmation message

**Note**: Syncing will replace all existing events with the data from Google Sheets.

### Configuring Google Sheets ID
The Google Sheets ID is set in the environment variables. To change it:
1. Access your Render.com dashboard
2. Select your service
3. Go to "Environment" tab
4. Update the `GOOGLE_SHEETS_ID` variable
5. Redeploy the service

## Managing Contacts

### Adding Contacts
1. Log in to the admin panel
2. Navigate to the "Contacts" tab
3. Click "Add New Contact"
4. Fill in the contact details:
   - Name
   - Title/Role
   - Phone Number
   - Email
   - Type (e.g., Emergency, Venue, Transportation)
5. Click "Save" to add the contact

### Editing and Deleting Contacts
Follow the same pattern as for events, using the "Edit" and "Delete" buttons in the Contacts tab.

## Managing Reminders

### Adding Reminders
1. Log in to the admin panel
2. Navigate to the "Reminders" tab
3. Click "Add New Reminder"
4. Fill in the reminder details:
   - Title
   - Description
   - Priority (High, Medium, Low)
5. Click "Save" to add the reminder

### Editing and Deleting Reminders
Follow the same pattern as for events, using the "Edit" and "Delete" buttons in the Reminders tab.

## Managing Notes

### Adding Notes
1. Log in to the admin panel
2. Navigate to the "Notes" tab
3. Click "Add New Note"
4. Fill in the note details:
   - Title
   - Content
5. Click "Save" to add the note

### Editing and Deleting Notes
Follow the same pattern as for events, using the "Edit" and "Delete" buttons in the Notes tab.

## Gallery Management

### Uploading Images
1. Log in to the admin panel
2. Navigate to the "Gallery" tab
3. Click "Upload New Image"
4. Select an image file from your device
5. Add a description (optional)
6. Click "Upload" to add the image to the gallery

### Deleting Images
1. Navigate to the "Gallery" tab in the admin panel
2. Find the image you want to delete
3. Click the "Delete" button
4. Confirm deletion when prompted

## Deployment Instructions

### Deploying to Render.com

1. Log in to your Render.com account
2. Navigate to your dashboard
3. Select the existing service or create a new Web Service
4. Connect to your GitHub repository or upload the ZIP file
5. Configure the service:
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. Set up environment variables (see next section)
7. Click "Create Web Service" or "Update"

### Manual Deployment

If you need to manually deploy the website:

1. Upload the entire project directory to your server
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the server: `node server.js`

## Environment Variables

The following environment variables need to be configured:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `GOOGLE_SHEETS_ID`: ID of the Google Sheet for event data
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` (optional): For authenticated Google Sheets access
- `GOOGLE_PRIVATE_KEY` (optional): For authenticated Google Sheets access

To set these in Render.com:
1. Go to your service dashboard
2. Click on "Environment"
3. Add each variable and its value
4. Click "Save Changes"
5. Redeploy your service

## Troubleshooting

### Common Issues and Solutions

#### Website Shows 502 Bad Gateway
- Check if the service is running on Render.com
- Verify that the MongoDB connection is working
- Check the service logs for errors

#### Admin Panel Login Fails
- Verify you're using the correct credentials
- Check if the JWT_SECRET environment variable is set correctly
- Clear browser cookies and try again

#### Google Sheets Sync Not Working
- Verify the Google Sheets ID is correct
- Ensure the sheet has the correct column headers
- Check that the sheet is accessible (shared with "Anyone with the link")
- Review server logs for specific error messages

#### Images Not Displaying in Gallery
- Check if the uploads directory exists and has proper permissions
- Verify that the image paths in the database are correct
- Check for any file size limitations

#### Changes in Admin Panel Not Reflecting on Frontend
- Clear your browser cache
- Verify that the API requests are completing successfully
- Check browser console for JavaScript errors

### Getting Help

If you encounter issues not covered in this guide:
1. Check the server logs for error messages
2. Review the browser console for frontend errors
3. Refer to the MongoDB Atlas documentation for database issues
4. Consult the Render.com documentation for deployment issues

For additional assistance, please contact the website developer.
