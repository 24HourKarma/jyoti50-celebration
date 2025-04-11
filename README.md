# Jyoti's 50th Birthday Celebration Website Documentation

## Overview
This documentation provides comprehensive information about the Jyoti's 50th Birthday Celebration website, including its architecture, features, and maintenance instructions. The website was built to provide information about the celebration taking place in Kraków, Poland from April 24-27, 2025.

## Table of Contents
1. [Website Structure](#website-structure)
2. [Features](#features)
3. [Technical Implementation](#technical-implementation)
4. [Admin Panel](#admin-panel)
5. [Google Sheets Integration](#google-sheets-integration)
6. [Mobile Responsiveness](#mobile-responsiveness)
7. [PWA Functionality](#pwa-functionality)
8. [Maintenance Instructions](#maintenance-instructions)
9. [Troubleshooting](#troubleshooting)

## Website Structure
The website consists of the following main sections:

### Home
- Displays a hero image of Jyoti
- Features a countdown timer to the event
- Shows important information about accommodations, weather, local currency, and transportation

### Schedule
- Displays all events organized by day
- Shows event details including time, location, dress code, and description
- Includes links to maps and related websites when available

### Gallery
- Displays photos related to the celebration
- Allows users to upload their own photos
- Features a lightbox for viewing larger images

### Reminders
- Lists important reminders for attendees
- Includes dates and descriptions

### Contacts
- Lists important contact information
- Organized by type (e.g., Organizers, Venue, Transportation)

### Notes
- Displays additional notes and information

## Features

### Countdown Timer
The website features a countdown timer on the home page that shows the days, hours, minutes, and seconds until the celebration begins.

### Tab Navigation
The website uses a tab-based navigation system that allows users to switch between different sections without page reloads.

### Photo Gallery
The gallery section allows users to:
- View photos in a responsive grid layout
- Click on photos to view them in a lightbox
- Upload their own photos with descriptions

### Admin Panel
The admin panel allows authorized users to:
- Manage event schedules
- Add/edit/delete contacts
- Manage reminders and notes
- Update footer information
- Sync data with Google Sheets

### PWA Functionality
The website functions as a Progressive Web App (PWA), which means users can:
- Install it on their home screen
- Use it offline
- Receive notifications about updates

### Mobile Responsiveness
The website is fully responsive and works well on:
- Desktop computers
- Tablets
- Mobile phones (both portrait and landscape orientations)

## Technical Implementation

### Frontend
- HTML5, CSS3, and JavaScript
- Responsive design using CSS Grid and Flexbox
- Font Awesome for icons
- Custom CSS for styling

### Backend
- Node.js with Express
- MongoDB for data storage
- Authentication for admin access
- File upload handling for gallery images

### Files Structure
```
wedding_website/
├── public/
│   ├── css/
│   │   ├── styles.css
│   │   ├── gallery.css
│   │   └── mobile-optimization.css
│   ├── js/
│   │   ├── main.js
│   │   ├── gallery.js
│   │   └── pwa.js
│   ├── images/
│   ├── uploads/
│   ├── index.html
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   ├── manifest.json
│   └── service-worker.js
├── models/
│   ├── Event.js
│   ├── Contact.js
│   ├── Reminder.js
│   ├── Note.js
│   ├── Gallery.js
│   ├── Footer.js
│   ├── Settings.js
│   └── User.js
├── server.js
├── google-sheets.js
├── google-sheets-endpoint.js
├── s3-storage.js
├── local-storage.js
└── .env
```

## Admin Panel

### Access
The admin panel can be accessed at `/admin-login.html` with the following credentials:
- Email: shubham.pandey@gmail.com
- Password: jyoti50admin

### Features
1. **Schedule Management**
   - Add, edit, and delete events
   - Set event details including time, location, dress code, and description
   - Add links to maps and websites

2. **Contacts Management**
   - Add, edit, and delete contacts
   - Organize contacts by type
   - Include contact details and descriptions

3. **Reminders Management**
   - Add, edit, and delete reminders
   - Set reminder icons and dates

4. **Notes Management**
   - Add, edit, and delete notes
   - Format note content

5. **Footer Management**
   - Update footer title, text, and copyright information

6. **Gallery Management**
   - View uploaded photos
   - Delete photos
   - Moderate user uploads

7. **Google Sheets Sync**
   - Sync event data from Google Sheets
   - Update website content automatically

## Google Sheets Integration

The website can sync event data from a Google Sheets document. This allows for easy updating of event schedules without needing to access the admin panel.

### Setup
1. The Google Sheets ID is configured in the `.env` file
2. The sheet must follow a specific format with columns for:
   - Day
   - Title
   - Start Time
   - End Time
   - Location
   - Description
   - Dress Code
   - Map URL
   - Website URL
   - Notes

### Syncing
1. Log in to the admin panel
2. Navigate to the Schedule section
3. Click the "Sync with Google Sheets" button
4. The website will fetch the latest data and update the database

## Mobile Responsiveness

The website is fully responsive and adapts to different screen sizes:

### Desktop (>768px)
- Full navigation menu
- Multi-column layouts for gallery and contacts
- Larger font sizes and spacing

### Tablet (480px-768px)
- Scrollable navigation menu
- Adjusted layouts with fewer columns
- Optimized image sizes

### Mobile (<480px)
- Compact navigation
- Single-column layouts
- Touch-friendly buttons and controls
- Optimized for portrait and landscape orientations

## PWA Functionality

The website functions as a Progressive Web App with the following features:

### Installation
- Users can add the website to their home screen
- Custom icons and splash screens are provided
- The website appears as a standalone app

### Offline Support
- Key assets are cached for offline use
- Users can view previously loaded content without an internet connection
- Offline status is indicated to users

### Performance
- Assets are cached for faster loading
- The service worker manages cache updates
- The website loads quickly even on slow connections

## Maintenance Instructions

### Updating Content
1. **Via Admin Panel**
   - Log in to the admin panel
   - Navigate to the appropriate section
   - Make changes and save

2. **Via Google Sheets**
   - Update the Google Sheets document
   - Log in to the admin panel
   - Sync the changes

### Adding New Features
1. Modify the appropriate files in the `public` directory
2. Update the backend models and routes if necessary
3. Test thoroughly before deploying

### Updating Dependencies
1. Review the package.json file
2. Update dependencies as needed
3. Test for compatibility issues

### Backup Procedures
1. Regularly backup the MongoDB database
2. Keep copies of all uploaded images
3. Maintain a backup of the Google Sheets document

## Troubleshooting

### Common Issues

#### Content Not Displaying
- Check browser console for JavaScript errors
- Verify that the API endpoints are responding correctly
- Ensure the database connection is working

#### Admin Panel Access Issues
- Verify credentials are correct
- Check for session timeout
- Clear browser cache and cookies

#### Image Upload Problems
- Verify the uploads directory has proper permissions
- Check for file size limitations
- Ensure the file format is supported

#### Google Sheets Sync Issues
- Verify the Google Sheets ID is correct
- Check that the sheet follows the required format
- Ensure API access is properly configured

### Support Contacts
For technical support, please contact:
- Shubham Pandey: shubham.pandey@gmail.com

---

This documentation was last updated on April 11, 2025.
