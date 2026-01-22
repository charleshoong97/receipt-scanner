# Testing the AI Vision Receipt Scanner

## Quick Test

1. Start the server:
   ```bash
   npm start
   ```

2. Open http://localhost:3000

3. Enter your Anthropic API key (or leave empty if configured in .env)

4. Upload the FamilyMart receipt image you provided

5. Expected results:
   - **Date**: 30-Dec-25
   - **Receipt No**: 1000002419 (or similar)
   - **Company Name**: FamilyMart
   - **Description**: Food items / Groceries
   - **Amount**: 21.40
   - **Category**: FOOD
   - **Payment Type**: CARD

## Test Cases

### Test 1: Clear Receipt (Easy)
- Upload a high-quality, well-lit receipt
- Should extract all fields with 95%+ accuracy

### Test 2: Blurry Receipt (Medium)
- Upload a slightly blurry photo
- AI Vision should still extract correctly
- OCR would likely fail here

### Test 3: Rotated Receipt (Medium)
- Upload a receipt that's rotated 15-45 degrees
- AI Vision should handle it
- OCR would fail without preprocessing

### Test 4: Crumpled Receipt (Hard)
- Upload a photo of a wrinkled receipt
- AI Vision should still extract key info
- OCR would have very poor accuracy

### Test 5: Low Light Photo (Hard)
- Upload a dark/shadowy receipt photo
- AI Vision should extract main details
- OCR would likely fail completely

## What to Check

### ✅ Successful Test
- All fields populated correctly
- Date in DD-MMM-YY format
- Amount as number only (no currency symbol)
- Category matches store type
- Payment type detected

### ⚠️ Partial Success
- Most fields correct, 1-2 fields missing
- This is acceptable for poor quality images

### ❌ Failed Test
- Multiple wrong fields
- Total amount incorrect
- Wrong category assignment

## Common Issues & Solutions

### Issue: "No data extracted"
**Cause**: API key invalid or image too large
**Solution**:
- Verify API key is correct
- Compress image to under 5MB

### Issue: Wrong total amount
**Cause**: Receipt has multiple totals (subtotal, tax, etc.)
**Solution**:
- AI should pick the final total
- If wrong, the image might be unclear

### Issue: Wrong category
**Cause**: Ambiguous store name
**Solution**:
- This is expected for generic stores
- Description field should still be useful

### Issue: Date format wrong
**Cause**: Unusual date format on receipt
**Solution**:
- AI tries to convert to DD-MMM-YY
- May default to current date if unreadable

## Performance Benchmarks

Expected processing times:
- Small image (~500KB): 2-3 seconds
- Medium image (~1-2MB): 3-5 seconds
- Large image (~3-5MB): 5-8 seconds

If slower:
- Check internet connection
- Check API rate limits
- Check server logs for errors

## Categories to Test

Upload receipts from different store types:

1. **FUEL**: Gas station receipt → Should detect "FUEL"
2. **FOOD**: Restaurant/grocery → Should detect "FOOD"
3. **HARDWARE**: Hardware store → Should detect "HARDWARE"
4. **MEDICAL**: Pharmacy/clinic → Should detect "MEDICAL"
5. **OTHERS**: General store → Should detect "OTHERS"

## API Key Testing

### Test with User API Key:
1. Enter your key in the web interface
2. Upload receipt
3. Should work even if .env is empty

### Test with Server API Key:
1. Leave web interface key field empty
2. Ensure .env has ANTHROPIC_API_KEY set
3. Upload receipt
4. Should use server's key

### Test with No API Key:
1. Leave web interface empty
2. Empty .env file
3. Upload receipt
4. Should show error about missing API key

## Browser Console Testing

Open browser DevTools (F12) and check:

### Network Tab:
- POST to /api/upload should succeed (200 status)
- Response should contain JSON with data array

### Console Tab:
- Should see: "Processing image with Claude AI Vision"
- Should see: "Parsed data: [...]"
- No errors should appear

## Export Testing

1. After successful extraction:
2. Click "Export to CSV"
3. CSV file should download
4. Open in Excel/Google Sheets
5. Verify all columns present:
   - Date
   - Receipt No
   - Company Name
   - Description
   - Amount (RM)
   - Advance to Co(RM) - should be empty
   - Category
   - Payment Type

## Multiple Receipt Testing

Test uploading multiple receipts in sequence:

1. Upload receipt #1 → Verify
2. Click "Remove"
3. Upload receipt #2 → Verify
4. Repeat 5-10 times

Check:
- No memory leaks
- Consistent accuracy
- No leftover data from previous uploads

## Mobile Testing

If accessible from mobile:
1. Take photo of receipt with phone
2. Upload directly from phone
3. Should work same as desktop

AI Vision handles phone photos better than OCR!

## Edge Cases

### Very Long Receipt
- Upload receipt with 20+ line items
- Should still extract total correctly

### Receipt with Logo
- Upload receipt with large logo/watermark
- AI should see through it

### Faded Thermal Receipt
- Upload old thermal receipt (faded text)
- AI Vision should still read it

### Handwritten Receipt
- Upload handwritten receipt
- AI should attempt to read it (OCR would fail)

### Non-English Receipt
- Upload receipt in another language
- AI should still extract amount and date

## Success Criteria

✅ **Passing Grade**:
- 90%+ accuracy on clear receipts
- 70%+ accuracy on poor quality receipts
- Processes in under 10 seconds
- No crashes or errors

⚠️ **Needs Improvement**:
- 80-90% accuracy on clear receipts
- Issues with specific receipt types
- Slow processing (>15 seconds)

❌ **Failing**:
- <80% accuracy on clear receipts
- Frequent errors
- Crashes

## Reporting Issues

If you find issues, note:
1. Receipt type (store name)
2. Image quality (clear/blurry/rotated)
3. What was extracted wrong
4. What should have been extracted
5. Screenshot of results

This helps improve the AI prompts!
