# ADK Workshop Training Portal

A beautiful, user-friendly web interface for the Google ADK Workshop training materials.

## Features

- **One-Click Visual Builder Launch** - Start the Visual Agent Builder with a single button click
- **Beautiful Material Browser** - Browse guides, exercises, and examples in clean HTML
- **Progress Tracking** - Track which exercises you've completed
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Custom Branding** - Easy to customize with your organization's branding
- **Keyboard Shortcuts** - Quick navigation for power users

## Quick Start

### 1. Install Dependencies

```bash
cd ~/adk-workshop-training
source ~/adk-workshop/bin/activate
pip install -r requirements.txt
```

### 2. Launch the Portal

```bash
python training_portal.py
```

The portal will automatically open in your browser at `http://localhost:5000`

### 3. Launch Visual Builder

Click the big "Launch Visual Builder" button on the dashboard!

## Customizing Branding

Edit the `BRANDING` dictionary in `training_portal.py`:

```python
BRANDING = {
    "organization_name": "Your Healthcare Organization",
    "workshop_title": "AI Agent Development Workshop",
    "logo_url": "/static/logo.png",  # Place your logo in static/images/
    "primary_color": "#1a73e8",      # Main brand color
    "secondary_color": "#34a853",    # Accent color
    "support_email": "support@yourorg.com",
    "instructor_name": "Workshop Instructor"
}
```

### Adding Your Logo

1. Place your logo file in `static/images/logo.png`
2. Update `logo_url` in the branding configuration
3. Recommended size: 200x50 pixels (PNG with transparent background)

## Portal Structure

```
training_portal.py          # Main Flask application
requirements.txt            # Python dependencies
templates/                  # HTML templates
  ├── base.html            # Base template with navigation
  ├── index.html           # Dashboard page
  ├── content.html         # Guide display template
  ├── exercise.html        # Exercise page with completion tracking
  └── example.html         # Code example viewer
static/
  ├── css/
  │   └── style.css       # Main stylesheet
  ├── js/
  │   └── main.js         # JavaScript functionality
  └── images/
      └── logo.png        # Your organization logo
```

## Features in Detail

### Dashboard

The main landing page shows:
- Quick launch button for Visual Builder
- Progress overview (exercises completed, materials viewed)
- Quick start guide cards
- All workshop materials organized by category
- Pro tips for workshop success

### Navigation

Top navigation bar provides access to:
- Dashboard
- Getting Started guide
- Guides (Visual Builder, Quickstart, Cheat Sheet, Troubleshooting)
- Exercises (with completion tracking)
- Examples (code samples)

### Visual Builder Integration

The portal can launch the Visual Agent Builder automatically:
- Status indicator shows if Visual Builder is running
- One-click launch from any page
- Automatically opens in new tab
- Error handling with troubleshooting tips

### Progress Tracking

The portal tracks:
- Which exercises you've completed (with checkmarks)
- Which materials you've viewed
- Last activity date
- Progress percentages

Progress is saved in `.progress.json` in the workshop directory.

### Markdown Rendering

All training materials are automatically converted from Markdown to beautiful HTML:
- Syntax highlighted code blocks
- Formatted tables
- Styled headers and lists
- Responsive images
- Copy/download buttons for code examples

## Keyboard Shortcuts

- **Ctrl/Cmd + K** - Launch Visual Builder
- **Ctrl/Cmd + H** - Go to Dashboard
- **?** - Show keyboard shortcuts help

## Customization Options

### Change Colors

Edit CSS variables in `static/css/style.css`:

```css
:root {
    --primary-color: #1a73e8;     /* Main brand color */
    --secondary-color: #34a853;   /* Accent color */
    --accent-color: #fbbc04;      /* Highlight color */
    --danger-color: #ea4335;      /* Error/warning color */
}
```

### Add Custom Pages

1. Create a new route in `training_portal.py`:

```python
@app.route('/custom-page')
def custom_page():
    return render_template('custom.html', branding=BRANDING)
```

2. Create template in `templates/custom.html`:

```html
{% extends "base.html" %}
{% block title %}Custom Page{% endblock %}
{% block content %}
    <h1>Your Custom Content</h1>
{% endblock %}
```

3. Add link to navigation in `templates/base.html`

### Add Custom Tracking

Edit the progress tracking in `training_portal.py`:

```python
def save_progress(progress):
    # Add custom fields
    progress["custom_field"] = "value"
    # ... rest of function
```

## Troubleshooting

### Portal Won't Start

**Check Python and Flask:**
```bash
python --version  # Should be 3.10+
pip list | grep Flask
```

**Reinstall dependencies:**
```bash
pip install -r requirements.txt
```

### Visual Builder Launch Fails

**Check ADK installation:**
```bash
which adk
adk --version
```

**Check if port 8000 is available:**
```bash
lsof -i :8000
```

### Materials Not Displaying

**Check file paths:**
```bash
ls resources/  # Should show .md files
ls examples/   # Should show .py files
ls exercises/  # Should show .md files
```

### Styles Not Loading

**Check static files:**
```bash
ls static/css/style.css
ls static/js/main.js
```

**Hard refresh browser:**
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R

## Production Deployment

For production use (not just workshop):

### Option 1: Gunicorn (Recommended)

```bash
pip install gunicorn

gunicorn -w 4 -b 0.0.0.0:5000 training_portal:app
```

### Option 2: uWSGI

```bash
pip install uwsgi

uwsgi --http :5000 --wsgi-file training_portal.py --callable app
```

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . /app

RUN pip install -r requirements.txt

EXPOSE 5000

CMD ["python", "training_portal.py"]
```

Build and run:

```bash
docker build -t adk-workshop-portal .
docker run -p 5000:5000 adk-workshop-portal
```

## Security Considerations

**For workshop use (local network):**
- Default settings are fine
- Runs on localhost by default

**For internet deployment:**
- Add authentication (Flask-Login)
- Use HTTPS (Let's Encrypt)
- Set secure session keys
- Rate limit API endpoints
- Input validation and sanitization

## Advanced Features

### Add User Accounts

Install Flask-Login:

```bash
pip install Flask-Login
```

Add authentication to routes:

```python
from flask_login import login_required

@app.route('/dashboard')
@login_required
def dashboard():
    # ... your code
```

### Add Database

Install SQLAlchemy:

```bash
pip install Flask-SQLAlchemy
```

Replace JSON progress tracking with database.

### Add Analytics

Track workshop metrics:
- Time spent on each page
- Most viewed materials
- Exercise completion rates
- Common sticking points

## Support

**Issues with the portal?**
- Check this README
- Review Flask error logs
- Check browser console (F12)
- Contact workshop instructor

**Feature requests?**
- Submit an issue
- Fork and customize
- Share your improvements!

## Credits

Built with:
- Flask (web framework)
- Markdown (content rendering)
- Font Awesome (icons)
- Google ADK (agent development)

---

**Version:** 1.0
**Last Updated:** 2024-11-18
**Maintained by:** Workshop Training Team
