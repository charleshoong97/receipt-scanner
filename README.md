# Receipt Scanner Website

A web application that allows users to upload receipt images and automatically extract information using **OpenAI Vision API**.

## Features

- Upload receipt images (JPG, PNG, GIF, WEBP)
- **OpenAI Vision Processing** - GPT-4o analyzes images directly
- **AI-Powered Data Extraction** with superior accuracy
- Parse and tabulate receipt information (Date, Receipt No, Company Name, Description, Amount, etc.)
- Export data to CSV format
- Responsive design
- **Secure** - API key required, never stored on server

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## API Key Configuration

**🔐 IMPORTANT: API Key is MANDATORY**

- Users MUST provide their own OpenAI API key
- API keys are sent securely with each request but NEVER stored
- No default or server-side API key is used
- This ensures your API usage and costs are under your control

### Get Your API Key:
1. Visit: https://platform.openai.com/api-keys
2. Sign up or log in to OpenAI
3. Create a new API key
4. Copy the key (starts with `sk-proj-...`)
5. Enter it in the web interface

## Usage

1. **Enter your OpenAI API key** (required - marked with *)
2. Click "Choose File" to select a receipt image or drag & drop
3. Click "Upload & Scan Receipt" to process
4. View extracted data in the table
5. Click "Export to CSV" to download

## Supported Categories

The AI automatically categorizes receipts into:
- **FUEL** - Gas stations, petrol, diesel
- **FOOD** - Restaurants, cafes, convenience stores, groceries
- **HARDWARE** - Hardware stores, building materials, tools
- **MEDICAL** - Pharmacies, hospitals, clinics, medical supplies
- **OTHERS** - Everything else

## Technologies

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express
- AI Vision: OpenAI GPT-4o Vision API
- File Upload: Multer

## How It Works

1. **User Provides API Key**: Required for each session
2. **Upload**: User uploads a receipt image
3. **AI Vision Analysis**: OpenAI GPT-4o directly analyzes the image
4. **Data Extraction**: AI extracts structured data:
   - Date (converts to DD-MMM-YY format)
   - Receipt/Invoice number
   - Company name
   - Category (FUEL, FOOD, HARDWARE, MEDICAL, OTHERS)
   - Total amount
   - Payment type (CASH, CARD, ONLINE)
   - Description of items/service
5. **Display**: Results shown in a structured table
6. **Export**: Download data as CSV file

## Security & Privacy

✅ **API keys never stored on server**
✅ **No sensitive data in server logs**
✅ **Files deleted immediately after processing**
✅ **User controls their own API usage**
✅ **No server-side API key fallback**

## Data Fields

| Field | Description | Example |
|-------|-------------|---------|
| Date | DD-MMM-YY format | 30-Dec-25 |
| Receipt No | Invoice/receipt number | 1000002419 |
| Company Name | Store/business name | FamilyMart |
| Description | Items purchased | Food items, Groceries |
| Amount (RM) | Total amount | 21.40 |
| Advance to Co(RM) | Always empty | (empty) |
| Category | FUEL/FOOD/etc | FOOD |
| Payment Type | CASH/CARD/ONLINE | CARD |

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## Troubleshooting

### "API key is required" error
- Enter your OpenAI API key in the input field
- Make sure it starts with `sk-proj-` or `sk-`

### "Upload failed" error
- Check your API key is valid
- Ensure image file is under 5MB
- Verify internet connection

### Poor extraction quality
- Use clear, well-lit images
- Ensure receipt is fully visible in frame
- Avoid excessive shadows or glare

## Cost Considerations

- You pay for your own API usage
- Typical cost per receipt: ~$0.005-0.01
- Vision API pricing: https://openai.com/api/pricing/
- You have full control over usage

## Why OpenAI Vision?

- **Superior Accuracy**: 95-98% on clear images
- **Better with Poor Quality**: Handles blurry/rotated images
- **Multi-language Support**: Works with various languages
- **Fast Processing**: 3-5 seconds per receipt
- **No OCR needed**: Direct image analysis

## License

MIT
