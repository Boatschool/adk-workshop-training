#!/usr/bin/env python3
"""
ADK Workshop Training Portal

A simple web interface for workshop participants to:
- Browse training materials
- Launch Visual Agent Builder
- Track progress
- Access examples and exercises

Run with: python training_portal.py
Access at: http://localhost:5000
"""

import os
import subprocess
import sys
import threading
import webbrowser
from pathlib import Path
from flask import Flask, render_template, send_from_directory, jsonify, request
import markdown
import json
from datetime import datetime
from dotenv import load_dotenv

app = Flask(__name__)

# Configuration
WORKSHOP_DIR = Path(__file__).parent

# Load environment variables from .env file
ENV_FILE = WORKSHOP_DIR / ".env"
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)
    print(f"✅ Loaded environment variables from {ENV_FILE}")
    if os.getenv('GOOGLE_API_KEY'):
        print(f"✅ GOOGLE_API_KEY is set")
    else:
        print(f"⚠️  Warning: GOOGLE_API_KEY not found in .env file")
else:
    print(f"⚠️  Warning: .env file not found at {ENV_FILE}")
RESOURCES_DIR = WORKSHOP_DIR / "resources"
EXAMPLES_DIR = WORKSHOP_DIR / "examples"
EXERCISES_DIR = WORKSHOP_DIR / "exercises"
PROGRESS_FILE = WORKSHOP_DIR / ".progress.json"

# Branding configuration (customize here!)
BRANDING = {
    "organization_name": "Your Healthcare Organization",
    "workshop_title": "AI Agent Development Workshop",
    "logo_url": "/static/logo.png",  # Place your logo in static/
    "primary_color": "#1a73e8",  # Google Blue
    "secondary_color": "#34a853",  # Google Green
    "support_email": "support@yourorg.com",
    "instructor_name": "Workshop Instructor"
}

# Visual Builder process
visual_builder_process = None

def load_progress():
    """Load user progress from file"""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f)
    return {
        "exercises_completed": [],
        "materials_viewed": [],
        "last_active": None
    }

def save_progress(progress):
    """Save user progress to file"""
    progress["last_active"] = datetime.now().isoformat()
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

def render_markdown_file(file_path):
    """Read and render markdown file to HTML"""
    if not file_path.exists():
        return "<p>File not found.</p>"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Configure markdown with extensions
    md = markdown.Markdown(extensions=[
        'fenced_code',
        'tables',
        'nl2br',
        'sane_lists',
        'toc'
    ])

    html_content = md.convert(content)
    return html_content

@app.route('/')
def index():
    """Main dashboard"""
    progress = load_progress()

    # Count materials
    resources_count = len(list(RESOURCES_DIR.glob('*.md')))
    examples_count = len(list(EXAMPLES_DIR.glob('*.py')))
    exercises_count = len(list(EXERCISES_DIR.glob('*.md')))

    return render_template('index.html',
                         branding=BRANDING,
                         progress=progress,
                         resources_count=resources_count,
                         examples_count=examples_count,
                         exercises_count=exercises_count)

@app.route('/getting-started')
def getting_started():
    """Getting started guide"""
    content = render_markdown_file(WORKSHOP_DIR / "GETTING_STARTED.md")
    return render_template('content.html',
                         title="Getting Started",
                         content=content,
                         branding=BRANDING)

@app.route('/guides/<guide_name>')
def guide(guide_name):
    """Display a guide from resources"""
    file_path = RESOURCES_DIR / f"{guide_name}.md"

    if not file_path.exists():
        return "Guide not found", 404

    content = render_markdown_file(file_path)

    # Track viewed materials
    progress = load_progress()
    if guide_name not in progress["materials_viewed"]:
        progress["materials_viewed"].append(guide_name)
        save_progress(progress)

    title = guide_name.replace('-', ' ').title()
    return render_template('content.html',
                         title=title,
                         content=content,
                         branding=BRANDING)

@app.route('/exercises/<exercise_name>')
def exercise(exercise_name):
    """Display an exercise"""
    file_path = EXERCISES_DIR / f"{exercise_name}.md"

    if not file_path.exists():
        return "Exercise not found", 404

    content = render_markdown_file(file_path)

    # Track viewed materials
    progress = load_progress()
    if exercise_name not in progress["materials_viewed"]:
        progress["materials_viewed"].append(exercise_name)
        save_progress(progress)

    # Check if completed
    is_completed = exercise_name in progress["exercises_completed"]

    title = exercise_name.replace('-', ' ').title()
    return render_template('exercise.html',
                         title=title,
                         exercise_name=exercise_name,
                         content=content,
                         is_completed=is_completed,
                         branding=BRANDING)

@app.route('/examples/<example_name>')
def example(example_name):
    """Display an example agent"""
    file_path = EXAMPLES_DIR / f"{example_name}.py"

    if not file_path.exists():
        return "Example not found", 404

    with open(file_path, 'r', encoding='utf-8') as f:
        code_content = f.read()

    title = example_name.replace('-', ' ').title()
    return render_template('example.html',
                         title=title,
                         example_name=example_name,
                         code_content=code_content,
                         branding=BRANDING)

@app.route('/api/complete-exercise', methods=['POST'])
def complete_exercise():
    """Mark an exercise as completed"""
    data = request.json
    exercise_name = data.get('exercise_name')

    progress = load_progress()
    if exercise_name not in progress["exercises_completed"]:
        progress["exercises_completed"].append(exercise_name)
        save_progress(progress)

    return jsonify({"success": True})

@app.route('/api/launch-visual-builder', methods=['POST'])
def launch_visual_builder():
    """Launch the Visual Agent Builder"""
    global visual_builder_process

    try:
        # Check if already running
        if visual_builder_process and visual_builder_process.poll() is None:
            return jsonify({
                "success": True,
                "message": "Visual Builder is already running",
                "url": "http://localhost:8000/dev-ui"
            })

        # Launch adk web in background with environment variables
        env = os.environ.copy()  # Include all current environment variables
        visual_builder_process = subprocess.Popen(
            ['adk', 'web', '--port', '8000'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            start_new_session=True,
            env=env
        )

        # Give it a moment to start
        import time
        time.sleep(2)

        return jsonify({
            "success": True,
            "message": "Visual Builder launched successfully",
            "url": "http://localhost:8000/dev-ui"
        })

    except FileNotFoundError:
        return jsonify({
            "success": False,
            "error": "ADK not installed or not in PATH"
        }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/visual-builder-status')
def visual_builder_status():
    """Check if Visual Builder is running"""
    global visual_builder_process

    is_running = visual_builder_process and visual_builder_process.poll() is None

    return jsonify({
        "running": is_running,
        "url": "http://localhost:8000/dev-ui" if is_running else None
    })

@app.route('/api/stop-visual-builder', methods=['POST'])
def stop_visual_builder():
    """Stop the Visual Agent Builder"""
    global visual_builder_process

    try:
        # Check if process exists and is running
        if not visual_builder_process or visual_builder_process.poll() is not None:
            return jsonify({
                "success": True,
                "message": "Visual Builder is not running"
            })

        # Terminate the process
        visual_builder_process.terminate()

        # Give it a moment to shut down gracefully
        import time
        time.sleep(1)

        # Force kill if still running
        if visual_builder_process.poll() is None:
            visual_builder_process.kill()
            time.sleep(0.5)

        return jsonify({
            "success": True,
            "message": "Visual Builder stopped successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/progress')
def get_progress():
    """Get user progress"""
    progress = load_progress()
    return jsonify(progress)

@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files"""
    static_dir = WORKSHOP_DIR / "static"
    return send_from_directory(static_dir, filename)

@app.route('/favicon.ico')
def favicon():
    """Serve favicon or return 204 if not found"""
    favicon_path = WORKSHOP_DIR / "static" / "images" / "favicon.ico"
    if favicon_path.exists():
        return send_from_directory(WORKSHOP_DIR / "static" / "images", "favicon.ico")
    else:
        # Return 204 No Content instead of 404
        return '', 204

def open_browser():
    """Open browser after short delay"""
    import time
    time.sleep(1.5)
    webbrowser.open('http://localhost:5000')

if __name__ == '__main__':
    # Use port 5001 since macOS ControlCenter uses 5000
    PORT = 5001

    print("=" * 70)
    print("ADK Workshop Training Portal")
    print("=" * 70)
    print()
    print("Starting training portal...")
    print()
    print(f"📚 Access training materials at: http://localhost:{PORT}")
    print("🚀 Launch Visual Builder from the portal dashboard")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 70)
    print()

    # Open browser automatically
    def open_browser_with_port():
        import time
        time.sleep(1.5)
        webbrowser.open(f'http://localhost:{PORT}')

    threading.Thread(target=open_browser_with_port, daemon=True).start()

    # Run Flask app
    app.run(debug=True, port=PORT, use_reloader=False, host='127.0.0.1')
