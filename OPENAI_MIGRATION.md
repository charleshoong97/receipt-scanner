# Migration to OpenAI Vision API - Version 3.0

## What Changed?

The receipt scanner has been migrated from **Claude AI (Anthropic)** to **OpenAI Vision API (GPT-4o)** with enhanced security measures.

## Major Changes

### 1. API Provider Change
- **Before**: Claude AI (Anthropic SDK)
- **After**: OpenAI GPT-4o Vision API

### 2. API Key Handling
- **Before**: Optional API key with server fallback
- **After**: **MANDATORY user-provided API key - NO server fallback**

### 3. Security Enhancements
- ✅ API keys NEVER stored on server
- ✅ No sensitive data in logs
- ✅ Immediate file cleanup after processing
- ✅ No default API key

## Why These Changes?

### Security First
1. **No Server-Side API Keys**: Eliminates risk of API key exposure
2. **User Control**: Each user uses their own API key and budget
3. **No Storage**: Keys sent only in request, never persisted
4. **Clean Logs**: No sensitive information logged

### Better Privacy
- Files uploaded to OpenAI temporarily
- Immediately deleted from our server
- No data retention
- User has full control

## Technical Changes

### Dependencies
```json
// Before
"@anthropic-ai/sdk": "^0.32.1"

// After
"openai": "^4.67.3"
```

### API Key Validation
```javascript
// Before (optional)
const apiKey = req.body.apiKey || process.env.ANTHROPIC_API_KEY;

// After (mandatory)
const apiKey = req.body.apiKey;
if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
}
```

### Vision API Call
```javascript
// Before (Claude)
const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    ...
});

// After (OpenAI)
const response = await openai.chat.completions.create({
    model: "gpt-4o",
    ...
});
```

## Migration Steps

1. **Update Dependencies**:
   ```bash
   npm install
   ```

2. **Get OpenAI API Key**:
   - Visit https://platform.openai.com/api-keys
   - Create new API key
   - Keep it secure!

3. **Start Server**:
   ```bash
   npm start
   ```

4. **Use the Application**:
   - Enter your API key in the web interface
   - Upload receipts as usual

## Cost Comparison

### Claude (Before)
- ~$0.0045 per receipt
- Server pays if using default key

### OpenAI (Now)
- ~$0.005-0.01 per receipt
- **User pays with their own key**

## Security Benefits

| Aspect | Before | After |
|--------|--------|-------|
| API Key Storage | Server .env file | Not stored |
| Key Exposure Risk | Medium | None |
| Cost Control | Server admin | Individual users |
| Data Logging | Some details | No sensitive data |
| File Retention | Until cleanup | Immediate deletion |

## Breaking Changes

⚠️ **API Key Now Required**

Users MUST provide their own OpenAI API key. No server fallback exists.

### Migration Checklist

- [ ] Get OpenAI API key
- [ ] Run `npm install`
- [ ] Remove old `.env` keys (if any)
- [ ] Test with your API key
- [ ] Verify data extraction works
- [ ] Check CSV export

## New User Flow

1. Open application
2. **See required API key field (marked with *)**
3. Enter OpenAI API key
4. Upload receipt
5. Get extracted data
6. Export if needed

## API Key Security Tips

✅ **DO**:
- Keep your API key private
- Use environment variables locally
- Rotate keys regularly
- Monitor usage on OpenAI dashboard

❌ **DON'T**:
- Share your API key
- Commit keys to git
- Use same key across multiple projects
- Leave keys in browser history

## Troubleshooting

### "API key is required" Error
**Solution**: Enter your OpenAI API key in the web form

### Invalid API Key
**Solution**:
1. Check key starts with `sk-proj-` or `sk-`
2. Verify key is active on OpenAI platform
3. Ensure key has vision API access

### High Costs
**Solution**:
- Check OpenAI usage dashboard
- Monitor tokens used per request
- Consider lower-cost models if needed

## Files Changed

### Modified:
- `package.json` - Updated dependencies
- `server.js` - New OpenAI integration, mandatory API key
- `public/index.html` - Updated UI, required field
- `public/app.js` - API key validation
- `.env` - Removed API key storage
- `README.md` - Updated documentation

### Removed:
- Anthropic SDK references
- Default API key fallback
- Optional API key logic

## Advantages of This Approach

1. **Better Security**: No server-side key exposure
2. **User Control**: Users manage their own costs
3. **Compliance**: Easier to meet data protection requirements
4. **Transparency**: Users know exactly what API is called
5. **Scalability**: No server API key limits

## Support

For issues:
1. Check API key is valid
2. Verify internet connection
3. Review OpenAI status page
4. Check browser console for errors

## Version History

- **v1.0**: OCR + Claude AI (optional key)
- **v2.0**: Claude AI Vision (optional key)
- **v3.0**: OpenAI Vision (mandatory key) ⭐ **Current**
