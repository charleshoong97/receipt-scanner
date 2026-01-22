# Quick Setup Guide

## What You'll Get

A powerful receipt scanner that uses **Claude AI Vision** to directly analyze receipt images with superior accuracy - no OCR needed!

## Step 1: Install Node.js
Make sure you have Node.js installed (version 14 or higher)
- Download from: https://nodejs.org/

## Step 2: Install Dependencies
Open terminal in the project directory and run:
```bash
npm install
```

**Note**: This version no longer requires Tesseract OCR. It uses Claude AI Vision directly!

## Step 3: Start the Server
```bash
npm start
```

You should see:
```
🚀 Receipt Scanner server running on http://localhost:3000
📄 Upload receipts at http://localhost:3000
```

## Step 4: Open Browser
Navigate to: http://localhost:3000

## Step 5: Configure API Key

You have two options:

### Option A: Enter API Key in Web Interface (Recommended)
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Create a new API key
4. Copy the key
5. Paste it into the "Anthropic API Key" field on the website
6. Start uploading receipts!

### Option B: Set Server Default API Key
1. Open the `.env` file in the project root
2. Add your API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
   ```
3. Save the file and restart the server

## Troubleshooting

### "ANTHROPIC_API_KEY is not set" or "Invalid API Key"
- Option 1: Enter your API key directly in the web interface (recommended)
- Option 2: Make sure you added your API key to the `.env` file and restarted the server
- Verify your key is valid at https://console.anthropic.com/

### "Module not found"
- Run `npm install` again
- Make sure you're in the correct directory

### Port 3000 already in use
- Change the PORT in `.env` file:
  ```
  PORT=3001
  ```
- Restart the server

## Receipt Categories

The system automatically categorizes receipts as:
- **FUEL** - Gas stations, petrol
- **FOOD** - Restaurants, groceries, convenience stores
- **HARDWARE** - Building materials, tools
- **MEDICAL** - Pharmacies, hospitals, clinics
- **OTHERS** - Everything else

## Testing
Upload the sample FamilyMart receipt to test the extraction!
