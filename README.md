# Wedding/Event Website Project

This repository contains a full-stack web application for Jyoti's 50th Birthday Celebration website. The application is built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- Responsive design with black and gold theme
- Event schedule management with Google Sheets integration
- Photo gallery with upload functionality
- Contacts management
- Reminders and notes sections
- Admin panel for content management
- PWA support with "add to home screen" functionality
- MongoDB Atlas integration for data persistence
- AWS S3 integration for image storage

## Project Structure

```
wedding_website/
├── models/             # MongoDB models
├── public/             # Static files
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   ├── images/         # Static images
│   ├── uploads/        # Uploaded images (local development)
│   ├── index.html      # Main website
│   └── admin-*.html    # Admin pages
├── .env                # Environment variables
├── server.js           # Express server
├── s3-storage.js       # AWS S3 integration
├── google-sheets.js    # Google Sheets integration
└── render.yaml         # Deployment configuration
```

## Setup Instructions

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/wedding_website
   JWT_SECRET=your_secret_key
   GOOGLE_SHEETS_ID=your_google_sheets_id
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=your_aws_region
   S3_BUCKET_NAME=your_s3_bucket
   ```
4. Start the server:
   ```
   node server.js
   ```
5. Access the website at `http://localhost:3000`
6. Access the admin panel at `http://localhost:3000/admin-login.html`

### Production Deployment

#### Using Render.com

1. Create an account on [Render.com](https://render.com)
2. Connect your GitHub repository
3. Render will automatically detect the `render.yaml` file and deploy the application
4. Set up the environment variables in the Render dashboard

#### Using Other Hosting Platforms

1. Deploy the application to any Node.js hosting platform
2. Set up the environment variables as specified in the `.env` file
3. Ensure MongoDB Atlas and AWS S3 are properly configured

## Admin Access

- URL: `/admin-login.html`
- Email: shubham.pandey@gmail.com
- Password: jyoti50admin

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB, MongoDB Atlas
- **Storage**: AWS S3
- **Authentication**: JWT
- **Deployment**: Render.com

## License

This project is licensed under the MIT License.
