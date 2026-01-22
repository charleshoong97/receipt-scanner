# Update Instructions - Version 2.0

## If You're Updating from Version 1.x

Your receipt scanner has been upgraded! Here's what to do:

### Step 1: Update Dependencies

The old version used Tesseract.js for OCR. The new version doesn't need it!

```bash
npm install
```

This will:
- ✅ Remove tesseract.js automatically
- ✅ Keep all other dependencies
- ✅ Ensure @anthropic-ai/sdk is installed

### Step 2: Clean Up (Optional)

If you have old OCR training data, you can remove it:

```bash
# Windows
del eng.traineddata

# Mac/Linux
rm eng.traineddata
```

### Step 3: Restart Server

```bash
npm start
```

### Step 4: Test

Upload a receipt and verify it works!

---

## If This is a Fresh Install

Just run:

```bash
npm install
npm start
```

Then open http://localhost:3000

---

## What Changed?

### Removed
- ❌ Tesseract.js OCR library
- ❌ OCR training data files
- ❌ PDF support (not supported by Vision API)

### Added
- ✅ Claude AI Vision integration
- ✅ Direct image analysis
- ✅ Better accuracy and speed

### Your Data
- ✅ No changes needed
- ✅ No database migration
- ✅ Same API endpoints
- ✅ Same CSV export format

---

## Verify Installation

After running `npm install`, check:

```bash
npm list tesseract.js
```

Should show: `(empty)`

```bash
npm list @anthropic-ai/sdk
```

Should show: `@anthropic-ai/sdk@0.32.1` (or newer)

---

## Troubleshooting

### "Cannot find module 'tesseract.js'"

**Cause**: Server is trying to use old code
**Fix**: Make sure you have the latest server.js file

### "Module not found: @anthropic-ai/sdk"

**Fix**:
```bash
npm install @anthropic-ai/sdk
```

### Server won't start

**Fix**:
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json  # Mac/Linux
# or
rmdir /s node_modules & del package-lock.json  # Windows

# Reinstall
npm install
```

---

## Need Help?

See:
- `README.md` - Full documentation
- `QUICK_START.md` - Fast setup guide
- `TESTING.md` - How to test
- `UPGRADE_TO_VISION.md` - Detailed upgrade info

---

**You're all set! Enjoy the upgraded receipt scanner!** 🎉
