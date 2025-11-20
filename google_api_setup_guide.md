# Google API Setup Guide for ADK Visual Agent Builder

This guide will help you resolve the `API_KEY_INVALID` error and properly configure Google API access for the ADK Visual Agent Builder.

## Error Context

If you're seeing this error:
```
400 INVALID_ARGUMENT. {'error': {'code': 400, 'message': 'API key not valid. Please pass a valid API key.', 'status': 'INVALID_ARGUMENT'}}
```

This means your Google API key is either missing, invalid, or the required APIs are not enabled.

---

## Prerequisites

- A Google Cloud account ([Create one here](https://cloud.google.com/))
- Access to Google Cloud Console

---

## Step 1: Create or Select a Google Cloud Project

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Either:
   - **Create a new project**: Click "New Project", enter a name, and click "Create"
   - **Select an existing project**: Choose from your list of projects

> [!TIP]
> It's recommended to create a dedicated project for your ADK workshop to keep resources organized.

---

## Step 2: Enable Required APIs

The ADK Visual Agent Builder requires the **Generative Language API** to be enabled.

### Enable Generative Language API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Generative Language API"
3. Click on the API from the search results
4. Click the **Enable** button

### Optional: Enable Vertex AI API

If you plan to use Vertex AI features:

1. In the API Library, search for "Vertex AI API"
2. Click on the API and click **Enable**

> [!IMPORTANT]
> Wait a few minutes after enabling APIs for the changes to propagate.

---

## Step 3: Create an API Key

1. In Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **API key** from the dropdown
4. A dialog will appear showing your new API key - **copy this key immediately**
5. Click **RESTRICT KEY** to add security restrictions (recommended)

### Restrict Your API Key (Recommended)

1. In the API key details page:
   - Under **API restrictions**, select "Restrict key"
   - Check "Generative Language API" (and "Vertex AI API" if needed)
   - Click **Save**

> [!CAUTION]
> Never commit API keys to version control or share them publicly. Treat them like passwords.

---

## Step 4: Configure the API Key for ADK

There are several ways to configure your API key. Choose the method that works best for your setup:

### Option A: Environment Variable (Recommended)

Set the `GOOGLE_API_KEY` environment variable:

**macOS/Linux:**
```bash
export GOOGLE_API_KEY="your-api-key-here"
```

**Windows (PowerShell):**
```powershell
$env:GOOGLE_API_KEY="your-api-key-here"
```

**Windows (Command Prompt):**
```cmd
set GOOGLE_API_KEY=your-api-key-here
```

> [!TIP]
> Add this to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.) to persist across sessions.

### Option B: .env File

1. Create a `.env` file in your project root:
   ```bash
   touch .env
   ```

2. Add your API key:
   ```
   GOOGLE_API_KEY=your-api-key-here
   ```

3. Add `.env` to your `.gitignore`:
   ```bash
   echo ".env" >> .gitignore
   ```

### Option C: Configuration File

If your ADK setup uses a configuration file, add the API key there according to your specific setup documentation.

---

## Step 5: Verify Your Setup

### Test 1: Check Environment Variable

Verify the environment variable is set:

**macOS/Linux:**
```bash
echo $GOOGLE_API_KEY
```

**Windows (PowerShell):**
```powershell
echo $env:GOOGLE_API_KEY
```

You should see your API key printed (first few characters are enough to confirm).

### Test 2: Test API Access

You can test your API key with a simple curl command:

```bash
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GOOGLE_API_KEY"
```

If successful, you'll receive a JSON response with generated content.

### Test 3: Restart ADK Visual Agent Builder

1. Stop your ADK Visual Agent Builder if it's running
2. Restart it to pick up the new environment variable
3. Try chatting with the agent builder again

---

## Troubleshooting

### Still Getting API_KEY_INVALID Error?

**Check these common issues:**

1. **API key not set correctly**
   - Verify the environment variable is set in the same terminal/session where you're running the agent builder
   - No extra spaces or quotes in the key value

2. **APIs not enabled**
   - Confirm Generative Language API is enabled in your project
   - Wait 5-10 minutes after enabling for changes to propagate

3. **Wrong project**
   - Ensure the API key is from the same project where you enabled the APIs

4. **API key restrictions**
   - If you restricted the key, ensure the correct APIs are allowed
   - Check if IP restrictions are blocking your requests

5. **Billing not enabled**
   - Some APIs require billing to be enabled on your Google Cloud project
   - Go to **Billing** in Cloud Console and link a billing account

### Error: "API key expired"

API keys don't expire by default, but if you see this:
- Create a new API key following Step 3
- Delete the old key from the Credentials page

### Error: "Quota exceeded"

- Check your quota limits in **APIs & Services** > **Quotas**
- Request a quota increase if needed
- Consider upgrading to a paid tier for higher limits

---

## Security Best Practices

> [!WARNING]
> Following these practices is crucial for protecting your API key and preventing unauthorized usage.

### 1. Never Commit Keys to Version Control

```bash
# Always add to .gitignore
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
```

### 2. Use API Key Restrictions

- Restrict to specific APIs only
- Add application restrictions (HTTP referrers, IP addresses, etc.)
- Regularly review and update restrictions

### 3. Rotate Keys Regularly

- Create a new key every 90 days
- Delete old keys after rotation
- Update all systems using the key

### 4. Monitor Usage

- Regularly check **APIs & Services** > **Credentials** for unusual activity
- Set up billing alerts to catch unexpected usage
- Review API usage metrics

### 5. Use Different Keys for Different Environments

- Development key
- Staging key  
- Production key

This limits the blast radius if a key is compromised.

---

## Next Steps

Once your API key is configured:

1. ✅ Restart your ADK Visual Agent Builder
2. ✅ Test the chat functionality
3. ✅ Monitor your API usage in Google Cloud Console
4. ✅ Review the [ADK documentation](https://cloud.google.com/generative-ai-app-builder/docs) for advanced features

---

## Additional Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Generative Language API Documentation](https://ai.google.dev/docs)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Google ADK Documentation](https://cloud.google.com/generative-ai-app-builder/docs)

---

## Need Help?

If you're still experiencing issues after following this guide:

1. Check the [Google Cloud Status Dashboard](https://status.cloud.google.com/)
2. Review your Cloud Console logs for detailed error messages
3. Consult the ADK Visual Agent Builder documentation for your specific version
4. Contact Google Cloud Support if you have a support plan
