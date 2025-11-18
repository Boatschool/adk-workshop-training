# Complete Setup Guide - ADK Workshop Training Portal

This guide will walk you through setting up the complete ADK Workshop training environment with the beautiful web portal.

## What You're Setting Up

1. **Google ADK** - The Agent Development Kit for building AI agents
2. **Training Materials** - Comprehensive guides, exercises, and examples
3. **Training Portal** - A beautiful web interface for novices
4. **Visual Agent Builder** - Google's no-code agent builder

## Prerequisites

Before starting, ensure you have:
- ✅ Computer with macOS, Linux, or Windows
- ✅ Python 3.10 or higher installed
- ✅ Google Cloud account (free tier is fine)
- ✅ Internet connection
- ✅ Web browser (Chrome recommended)

## Step-by-Step Setup

### Step 1: Create Virtual Environment (5 minutes)

A virtual environment keeps your workshop dependencies isolated.

```bash
# Navigate to your home directory
cd ~

# Create virtual environment
python3 -m venv adk-workshop

# Activate it
source adk-workshop/bin/activate

# You should see (adk-workshop) in your prompt
```

**Windows users:**
```bash
adk-workshop\Scripts\activate
```

**Verify:**
```bash
which python
# Should show: /Users/yourname/adk-workshop/bin/python
```

### Step 2: Install Google ADK (3 minutes)

```bash
# Make sure virtual environment is activated
source ~/adk-workshop/bin/activate

# Install ADK
pip install --upgrade google-adk

# Verify installation
python -c "import google.adk; print('ADK installed successfully!')"
```

### Step 3: Configure Google Cloud (5 minutes)

**Option A: Using gcloud CLI (Recommended)**

```bash
# Install gcloud CLI if you haven't
# Mac: brew install google-cloud-sdk
# Windows: Download from cloud.google.com

# Authenticate
gcloud auth application-default login

# Set your project
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Add to your shell profile to persist
echo 'export GOOGLE_CLOUD_PROJECT="your-project-id"' >> ~/.bashrc
# or ~/.zshrc on Mac
```

**Option B: Using Service Account**

1. Go to Google Cloud Console
2. Create a service account
3. Download JSON key
4. Set environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

### Step 4: Navigate to Workshop Directory (1 minute)

```bash
cd ~/adk-workshop-training
```

If you don't have the materials yet:

```bash
# If materials were provided in a zip file
unzip adk-workshop-training.zip
cd adk-workshop-training

# Or if cloning from repository
git clone <repository-url> adk-workshop-training
cd adk-workshop-training
```

### Step 5: Install Portal Dependencies (2 minutes)

```bash
# Make sure you're in the workshop directory
cd ~/adk-workshop-training

# Install requirements
pip install -r requirements.txt
```

This installs:
- Flask (web framework)
- Markdown (for rendering training materials)
- Other utilities

### Step 6: Verify Setup (2 minutes)

Run the verification script:

```bash
python verify_setup.py
```

You should see:
```
✅ Python version: 3.11.x
✅ Virtual environment activated
✅ Google ADK installed
✅ Google Cloud project: your-project-id
✅ Authentication: configured
✅ Network connectivity to Google APIs
✅ Workshop materials found
✅ Successfully created test agent
✅ Port 8000 available for Visual Builder

🎉 Excellent! Your environment is fully ready for the workshop!
```

If you see any ❌ errors, the script will tell you how to fix them.

### Step 7: Launch Training Portal (2 minutes)

**Method 1: Using the launcher script (easiest)**

```bash
./start_portal.sh
```

**Method 2: Direct Python command**

```bash
python training_portal.py
```

The portal will automatically open in your browser at `http://localhost:5000`

### Step 8: Launch Visual Builder (1 minute)

From the training portal:
1. Click the big **"Launch Visual Builder"** button
2. Wait a few seconds
3. Visual Builder opens at `http://localhost:8000/dev-ui`

Or manually:

```bash
# In a new terminal
source ~/adk-workshop/bin/activate
adk web
```

### Step 9: Test Everything (5 minutes)

**Test the portal:**
- ✅ Browse to a guide (e.g., Visual Agent Builder Guide)
- ✅ Open an exercise (e.g., Exercise 1)
- ✅ View a code example
- ✅ Mark an exercise as complete

**Test Visual Builder:**
- ✅ Create a new agent
- ✅ Configure basic properties
- ✅ Test the agent
- ✅ Export configuration

**Test sample agents:**

```bash
# In a new terminal
cd ~/adk-workshop-training/examples
python 01-simple-faq-agent.py
```

Try asking: "When is open enrollment?"

## Customization (Optional)

### Add Your Branding

1. **Edit configuration** in `training_portal.py`:

```python
BRANDING = {
    "organization_name": "Your Hospital Name",
    "workshop_title": "AI Agent Workshop",
    "logo_url": "/static/images/logo.png",
    "primary_color": "#1a73e8",  # Your brand color
    "secondary_color": "#34a853",
    "support_email": "your-email@hospital.com",
    "instructor_name": "Your Name"
}
```

2. **Add your logo:**

```bash
# Copy your logo to:
cp ~/path/to/your-logo.png static/images/logo.png
```

3. **Restart the portal** to see changes

### Change Colors

Edit `static/css/style.css`:

```css
:root {
    --primary-color: #1a73e8;    /* Change to your brand color */
    --secondary-color: #34a853;
    --accent-color: #fbbc04;
}
```

## Troubleshooting

### Virtual Environment Issues

**Problem:** "Command not found: adk"

**Solution:**
```bash
source ~/adk-workshop/bin/activate
which python  # Verify you're in the venv
```

### Portal Won't Start

**Problem:** "Port 5000 already in use"

**Solution:**
```bash
# Check what's using port 5000
lsof -i :5000

# Kill the process or change port
# Edit training_portal.py, change last line to:
app.run(debug=True, port=5001, use_reloader=False)
```

### Visual Builder Won't Launch

**Problem:** Visual Builder launch fails

**Check ADK installation:**
```bash
which adk
adk --version
```

**Reinstall if needed:**
```bash
pip uninstall google-adk
pip install google-adk
```

### Authentication Errors

**Problem:** "Could not determine credentials"

**Solution:**
```bash
# Re-authenticate
gcloud auth application-default revoke
gcloud auth application-default login

# Verify
gcloud auth list
```

### Import Errors

**Problem:** "ModuleNotFoundError"

**Solution:**
```bash
# Check virtual environment is activated
echo $VIRTUAL_ENV

# Reinstall requirements
pip install -r requirements.txt
```

## Daily Usage

Once set up, here's your daily workflow:

### Starting Your Day

```bash
# 1. Activate virtual environment
source ~/adk-workshop/bin/activate

# 2. Navigate to workshop directory
cd ~/adk-workshop-training

# 3. Launch training portal
./start_portal.sh

# Portal opens automatically at http://localhost:5000
```

### During the Workshop

- Use the portal to browse materials
- Click "Launch Visual Builder" when needed
- Mark exercises as complete
- Reference the cheat sheet

### Ending Your Day

```bash
# Stop the portal: Ctrl+C

# Stop Visual Builder (if running separately)
# Find the terminal and Ctrl+C

# Deactivate virtual environment (optional)
deactivate
```

## Quick Reference

### Essential Commands

```bash
# Activate environment
source ~/adk-workshop/bin/activate

# Launch portal
./start_portal.sh
# or
python training_portal.py

# Launch Visual Builder (manually)
adk web

# Run example agent
cd examples
python 01-simple-faq-agent.py

# Verify setup
python verify_setup.py
```

### Essential URLs

- **Training Portal:** http://localhost:5000
- **Visual Builder:** http://localhost:8000/dev-ui
- **Official ADK Docs:** https://google.github.io/adk-docs/

### Essential Files

- **GETTING_STARTED.md** - Quick start guide
- **README.md** - Main workshop overview
- **PORTAL_README.md** - Portal customization guide
- **WORKSHOP_AGENDA.md** - Workshop schedule
- **resources/cheat-sheet.md** - Command reference

## Getting Help

### Before the Workshop

1. Run `python verify_setup.py`
2. Check **resources/troubleshooting-guide.md**
3. Email instructor with specific error messages

### During the Workshop

1. Raise hand for instructor
2. Check portal for guides
3. Ask neighbor for help
4. Reference cheat sheet

### After the Workshop

1. Review materials in portal
2. Check official ADK documentation
3. Post in community forums
4. Email instructor for follow-up

## Pre-Workshop Checklist

Print this and check off before the workshop:

- [ ] Virtual environment created and working
- [ ] Google ADK installed
- [ ] Google Cloud authentication configured
- [ ] Workshop materials downloaded
- [ ] Portal dependencies installed
- [ ] `python verify_setup.py` passes all checks
- [ ] Training portal launches successfully
- [ ] Visual Builder can be launched
- [ ] Sample agent runs without errors
- [ ] Reviewed "Getting Started" guide
- [ ] Know where to find help resources

## Success!

If you've completed all steps and the checklist, you're ready for the workshop!

🎉 **Congratulations!** 🎉

Key things to remember:
1. Always activate virtual environment first
2. Use the portal for easy navigation
3. Launch Visual Builder with one click
4. Don't hesitate to ask questions

See you at the workshop!

---

**Having issues?** Contact your workshop instructor:
- Email: [instructor email]
- Office hours: [schedule]

**Version:** 1.0 | **Last Updated:** 2024-11-18
