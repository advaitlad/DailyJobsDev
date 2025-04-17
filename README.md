# Job Scraper

A tool that automatically scrapes job postings from major tech companies and sends email notifications for new positions.

## Setup Instructions

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up Firebase:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the downloaded JSON file and update the path in `.env`

3. Configure Email:
   - For Gmail, you'll need to create an App Password:
     - Go to your Google Account settings
     - Security > 2-Step Verification > App passwords
     - Generate a new app password
   - Update the `.env` file with your email credentials

4. Update the `.env` file with your specific values:
   - `FIREBASE_CREDENTIALS_PATH`: Path to your Firebase credentials JSON file
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASSWORD`: Your Gmail app password
   - `RECIPIENT_EMAIL`: Email address to receive notifications

5. Run the script:
```bash
python job_scraper.py
```

## Features
- Scrapes job postings from major tech companies
- Checks for new positions every 12 hours
- Sends email notifications for new job openings
- Stores job data in Firebase for tracking

## Current Companies
- Google
- Meta
- Microsoft
- Netflix
- Pinterest
- Amazon
- Apple

## Note
The scraping logic for each company's career page will need to be customized as each company has a different website structure. The current implementation includes placeholder code that needs to be updated with specific selectors for each company. 