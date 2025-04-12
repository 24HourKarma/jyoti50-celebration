# AWS Integration for Jyoti's 50th Birthday Website

This document provides instructions for setting up AWS S3 for image storage in the Jyoti's 50th Birthday website.

## Prerequisites

1. An AWS account
2. AWS CLI installed and configured
3. Basic knowledge of AWS services

## Setting Up AWS S3 Bucket

1. Log in to the AWS Management Console
2. Navigate to S3 service
3. Create a new bucket:
   - Name: `jyoti50-gallery`
   - Region: Choose a region close to your users
   - Block all public access: Uncheck (we need public read access)
   - Enable versioning: Optional but recommended
   - Default encryption: Enable with Amazon S3 key (SSE-S3)

4. After creating the bucket, go to the bucket properties
5. Enable Static Website Hosting
6. Set up bucket policy for public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::jyoti50-gallery/*"
        }
    ]
}
```

7. Set up CORS configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

## Creating IAM User for S3 Access

1. Navigate to IAM service
2. Create a new user:
   - Name: `jyoti50-app`
   - Access type: Programmatic access

3. Attach the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::jyoti50-gallery",
                "arn:aws:s3:::jyoti50-gallery/*"
            ]
        }
    ]
}
```

4. Complete the user creation and save the Access Key ID and Secret Access Key

## Configuring the Application

1. Add the AWS credentials to your `.env` file:

```
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_selected_region
AWS_S3_BUCKET=jyoti50-gallery
```

2. Update the gallery upload functionality in the application to use AWS S3 instead of local storage.

## Testing the Integration

1. Start the application
2. Navigate to the admin panel
3. Upload an image to the gallery
4. Verify that the image is uploaded to S3 and displayed correctly on the website

## Troubleshooting

- If images are not uploading, check the AWS credentials in the `.env` file
- Verify that the bucket policy allows public read access
- Check the CORS configuration if you're experiencing cross-origin issues
- Ensure the IAM user has the necessary permissions for S3 operations
