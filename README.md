# README.md - Jyoti's 50th Birthday Celebration Website

A comprehensive website for Jyoti's 50th Birthday Celebration taking place in Kraków, Poland from April 24-27, 2025.

## Features

- **Responsive Design**: Mobile-friendly interface with black and gold color scheme
- **Event Schedule**: Detailed information about all events with times, locations, and dress codes
- **Interactive Gallery**: Photo sharing functionality with AWS S3 integration
- **Admin Dashboard**: Complete CRUD functionality for managing all content
- **Google Sheets Integration**: Import events and contact information from Google Sheets
- **Reminders System**: Send notifications to registered guests
- **User Registration**: Allow guests to register for updates and reminders
- **Important Information**: Details about accommodations, weather, local currency, etc.

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, Responsive Design
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Storage**: AWS S3 for image storage
- **Authentication**: JWT-based authentication system
- **External APIs**: Google Sheets API for data import

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- AWS account for S3 storage
- Google Sheets API credentials

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

See the [Deployment Guide](./docs/deployment-guide.md) for detailed instructions on deploying the website.

## Configuration

### MongoDB Setup

See the [MongoDB Integration Guide](./docs/mongodb-integration.md) for instructions on setting up the database.

### AWS S3 Setup

See the [AWS Integration Guide](./docs/aws-integration.md) for instructions on setting up image storage.

## Admin Access

The admin dashboard is accessible at `/admin.html`. Default credentials:

- Username: admin@jyoti50.com
- Password: jyoti50admin

**Important**: Change the default password after first login.

## Project Structure

```
jyoti50/
├── docs/                  # Documentation
├── public/                # Static assets
│   ├── css/               # Stylesheets
│   ├── js/                # Client-side JavaScript
│   ├── uploads/           # Local uploads (development only)
│   ├── index.html         # Main website
│   └── admin.html         # Admin dashboard
├── server/                # Backend code
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── server.js          # Entry point
├── .env.example           # Example environment variables
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Mobile Compatibility

The website is designed to be fully responsive and works on all modern mobile devices. Key features:

- Adaptive layout that adjusts to screen size
- Touch-friendly interface
- Optimized images for faster loading on mobile
- PWA capabilities for app-like experience

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For any questions or issues, please contact Shubham Pandey at shubham.pandey@gmail.com.
