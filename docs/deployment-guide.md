# Deployment Guide for Jyoti's 50th Birthday Website

This document provides comprehensive instructions for deploying the Jyoti's 50th Birthday website to GitHub and setting up all necessary integrations.

## Prerequisites

1. GitHub account
2. MongoDB Atlas account (or local MongoDB installation)
3. AWS account for S3 image storage
4. Node.js and npm installed on your local machine

## Step 1: Clone the Repository

1. Create a new repository on GitHub named `jyoti50-birthday-website`
2. Clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/jyoti50-birthday-website.git
cd jyoti50-birthday-website
```

3. Extract the contents of the provided zip file into this directory

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key

# MongoDB Configuration
MONGO_URI=your_mongodb_connection_string

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=jyoti50-gallery

# Google Sheets Configuration
GOOGLE_SHEET_ID=1i3CI6gj54e63kR-fLza-2ncqzAof6H76iJj7pOzVP0I
```

Replace the placeholder values with your actual credentials.

## Step 3: Set Up MongoDB

Follow the instructions in `docs/mongodb-integration.md` to set up your MongoDB database.

## Step 4: Set Up AWS S3

Follow the instructions in `docs/aws-integration.md` to set up your AWS S3 bucket for image storage.

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Build the Frontend

```bash
npm run build
```

## Step 7: Test the Application Locally

```bash
npm start
```

Visit `http://localhost:3000` to verify that the application is working correctly.

## Step 8: Deploy to GitHub Pages (Frontend Only)

1. Install the GitHub Pages package:

```bash
npm install --save-dev gh-pages
```

2. Add the following to your `package.json`:

```json
"homepage": "https://yourusername.github.io/jyoti50-birthday-website",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

3. Deploy to GitHub Pages:

```bash
npm run deploy
```

## Step 9: Deploy Backend to a Hosting Service

For the backend, you'll need a Node.js hosting service. Here are some options:

### Option 1: Heroku

1. Install the Heroku CLI and log in
2. Create a new Heroku app:

```bash
heroku create jyoti50-birthday-api
```

3. Set up environment variables on Heroku:

```bash
heroku config:set JWT_SECRET=your_jwt_secret_key
heroku config:set MONGO_URI=your_mongodb_connection_string
heroku config:set AWS_ACCESS_KEY_ID=your_aws_access_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_aws_secret_key
heroku config:set AWS_REGION=your_aws_region
heroku config:set AWS_S3_BUCKET=jyoti50-gallery
heroku config:set GOOGLE_SHEET_ID=1i3CI6gj54e63kR-fLza-2ncqzAof6H76iJj7pOzVP0I
```

4. Deploy to Heroku:

```bash
git push heroku main
```

### Option 2: Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command to `npm install && npm run build`
4. Set the start command to `npm start`
5. Add the environment variables in the Render dashboard

### Option 3: AWS Elastic Beanstalk

1. Install the AWS EB CLI
2. Initialize your EB application:

```bash
eb init
```

3. Create an environment:

```bash
eb create jyoti50-birthday-env
```

4. Set environment variables:

```bash
eb setenv JWT_SECRET=your_jwt_secret_key MONGO_URI=your_mongodb_connection_string ...
```

5. Deploy:

```bash
eb deploy
```

## Step 10: Update API Endpoint in Frontend

After deploying the backend, update the API endpoint in the frontend code:

1. Open `src/config.js`
2. Update the `API_URL` to point to your deployed backend

## Step 11: Redeploy Frontend

```bash
npm run deploy
```

## Step 12: Set Up Custom Domain (Optional)

If you have a custom domain:

1. Configure your domain's DNS settings to point to your hosting service
2. Set up HTTPS for secure connections

## Troubleshooting

- If the frontend is not displaying data, check the API endpoint configuration
- If images are not loading, verify the AWS S3 configuration
- If the database is not connecting, check the MongoDB connection string
- For deployment issues, check the logs of your hosting service

## Maintenance

- Regularly back up your MongoDB database
- Monitor your AWS S3 usage to avoid unexpected charges
- Keep your dependencies updated for security patches
