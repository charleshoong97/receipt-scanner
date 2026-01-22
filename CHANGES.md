# Changes Summary

## Version 2.0.0 - AI Vision Upgrade

### Major Change: Removed OCR, Added AI Vision

**BREAKING CHANGE**: The system now uses Claude AI Vision to directly analyze receipt images instead of using Tesseract OCR.

#### What's Different:
- ❌ **Removed**: Tesseract.js OCR dependency
- ✅ **Added**: Direct image analysis with Claude AI Vision
- 🚀 **Result**: Faster, more accurate, and more robust receipt processing

#### Technical Changes:
1. **Removed OCR Step**: No longer extracts text separately
2. **Direct Image Processing**: Images sent directly to Claude AI
3. **Single API Call**: One step instead of two (OCR + AI)
4. **Better Accuracy**: AI can see layout, structure, and context
5. **Supported Formats**: JPG, PNG, GIF, WEBP (PDF removed)

---

# Changes Summary

## Updates Made

### 1. Corrected Receipt Categories
The AI now uses the following categories (as specified):
- **FUEL** - Gas stations, petrol, diesel
- **FOOD** - Restaurants, cafes, convenience stores, groceries
- **HARDWARE** - Hardware stores, building materials, tools
- **MEDICAL** - Pharmacies, hospitals, clinics, medical supplies
- **OTHERS** - Everything else

### 2. Column Naming
- Changed from "Descriptions" to "Description" (singular)
- "Advance to Company (RM)" column always remains empty as requested

### 3. User API Key Input
Users can now enter their own Anthropic API key directly in the web interface:
- Optional API key input field at the top of the page
- Show/Hide toggle for security
- Falls back to server environment variable if not provided
- Perfect for multi-user scenarios

### 4. Updated Files

#### Frontend (`public/index.html`)
- Added API key input section with show/hide toggle
- Professional UI with key icon

#### Styles (`public/styles.css`)
- Added styling for API key section
- Responsive design for mobile devices
- Focus states and hover effects

#### JavaScript (`public/app.js`)
- API key toggle functionality
- Sends user API key with upload request
- Secure handling (sent in request, never stored)

#### Backend (`server.js`)
- Updated `parseReceiptDataWithAI()` to accept optional API key parameter
- Updated AI prompt with correct categories
- Enforces "Advance to Co" always empty
- Better category descriptions for AI

#### Documentation
- `README.md` - Updated with API key options and categories
- `SETUP.md` - Simplified setup, added API key options
- `.env` - Can be left empty if using web interface input

## Benefits

1. **Flexibility**: Users can use their own API keys
2. **Better Categorization**: Accurate categories (FUEL, FOOD, HARDWARE, MEDICAL, OTHERS)
3. **Consistency**: "Advance to Company" always empty as required
4. **User-Friendly**: Optional API key input with clear instructions
5. **Secure**: API keys can be entered per-session without server storage

## How to Use

### Option 1: User Provides API Key (Recommended)
1. Start the server: `npm start`
2. Open http://localhost:3000
3. Enter your Anthropic API key in the input field
4. Upload receipt and scan

### Option 2: Server Default Key
1. Add API key to `.env` file
2. Start the server: `npm start`
3. Upload receipts (no need to enter key)

## Testing

Upload the FamilyMart receipt to verify:
- Date extraction (DD-MMM-YY format)
- Company name: "FamilyMart"
- Category: "FOOD"
- Amount: "21.40"
- Payment Type: "CARD" (Visa)
