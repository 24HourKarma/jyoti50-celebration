# MongoDB Integration for Jyoti's 50th Birthday Website

This document provides instructions for setting up MongoDB for the Jyoti's 50th Birthday website.

## Prerequisites

1. MongoDB Atlas account or local MongoDB installation
2. Basic knowledge of MongoDB

## Option 1: Setting Up MongoDB Atlas (Recommended for Production)

### Creating a MongoDB Atlas Cluster

1. Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project named "Jyoti50Birthday"
3. Create a new cluster:
   - Choose the free tier (M0)
   - Select a cloud provider and region close to your users
   - Name your cluster "jyoti50-cluster"

4. Once the cluster is created, click on "Connect"
5. Add your connection IP address (or use 0.0.0.0/0 for development)
6. Create a database user with a secure username and password
7. Choose "Connect your application" and copy the connection string

### Configuring the Application

1. Add the MongoDB connection string to your `.env` file:

```
MONGO_URI=mongodb+srv://<username>:<password>@jyoti50-cluster.mongodb.net/jyoti50?retryWrites=true&w=majority
```

2. Replace `<username>` and `<password>` with your database user credentials

## Option 2: Setting Up Local MongoDB (Development Only)

### Installing MongoDB Community Edition

#### For Ubuntu:
```bash
sudo apt-get update
sudo apt-get install -y mongodb
```

#### For macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

#### For Windows:
Download and install from the [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### Starting MongoDB Service

#### For Ubuntu:
```bash
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### For macOS:
```bash
brew services start mongodb-community
```

#### For Windows:
MongoDB should be installed as a service and start automatically

### Configuring the Application for Local MongoDB

1. Add the local MongoDB connection string to your `.env` file:

```
MONGO_URI=mongodb://localhost:27017/jyoti50
```

## Initializing the Database

1. Start the application for the first time to create the database and collections
2. Use the admin panel to add initial data or import from Google Sheets

## Database Backup and Restore

### Creating a Backup

```bash
mongodump --uri="your_connection_string" --out=./backup
```

### Restoring from Backup

```bash
mongorestore --uri="your_connection_string" ./backup
```

## Troubleshooting

- If the application cannot connect to MongoDB, check the connection string in the `.env` file
- Verify that the MongoDB service is running
- Ensure the database user has the correct permissions
- Check network connectivity and firewall settings
- For Atlas, verify that your IP address is in the allowed list
