#!/bin/bash

# ADK Workshop Frontend Launcher
# Provides options to start different frontend components

echo "=============================================="
echo "  ADK Workshop Frontend Launcher"
echo "=============================================="
echo ""
echo "What would you like to start?"
echo ""
echo "  1) Training Portal (http://localhost:5001)"
echo "     - Browse workshop materials"
echo "     - Track your progress"
echo "     - Launch Visual Builder from UI"
echo ""
echo "  2) Visual Agent Builder (http://localhost:8000/dev-ui)"
echo "     - Build and test agents"
echo "     - Visual debugging interface"
echo ""
echo "  3) Both (Portal + Visual Builder)"
echo "     - Full workshop environment"
echo ""
echo "  4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

# Check if we're in the right directory
if [ ! -f "training_portal.py" ]; then
    echo ""
    echo "❌ Error: Must run from adk-workshop-training directory"
    exit 1
fi

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo ""
    echo "⚠️  Virtual environment not activated"
    echo ""

    if [ -f ~/adk-workshop/bin/activate ]; then
        source ~/adk-workshop/bin/activate
        echo "✅ Virtual environment activated"
    else
        echo "❌ Virtual environment not found at ~/adk-workshop"
        echo ""
        echo "Please create it first:"
        echo "  python3 -m venv ~/adk-workshop"
        echo "  source ~/adk-workshop/bin/activate"
        exit 1
    fi
fi

# Function to start training portal
start_portal() {
    echo ""
    echo "🚀 Starting Training Portal..."
    echo ""

    # Check dependencies
    if ! python -c "import flask" 2>/dev/null; then
        echo "📥 Installing requirements..."
        pip install -r requirements.txt
    fi

    echo "   Portal URL: http://localhost:5001"
    echo "   Press Ctrl+C to stop"
    echo ""
    python training_portal.py
}

# Function to start Visual Agent Builder
start_visual_builder() {
    echo ""
    echo "🚀 Starting Visual Agent Builder..."
    echo ""

    # Check if ADK is installed
    if ! command -v adk &> /dev/null; then
        echo "❌ ADK not found. Installing..."
        pip install google-adk
    fi

    echo "   Visual Builder URL: http://localhost:8000/dev-ui"
    echo "   Press Ctrl+C to stop"
    echo ""
    adk web --port 8000
}

# Function to start both
start_both() {
    echo ""
    echo "🚀 Starting both Portal and Visual Builder..."
    echo ""

    # Check dependencies
    if ! python -c "import flask" 2>/dev/null; then
        echo "📥 Installing requirements..."
        pip install -r requirements.txt
    fi

    if ! command -v adk &> /dev/null; then
        echo "❌ ADK not found. Installing..."
        pip install google-adk
    fi

    echo ""
    echo "📚 Training Portal: http://localhost:5001"
    echo "🎨 Visual Builder: http://localhost:8000/dev-ui"
    echo ""
    echo "Opening in new terminals..."
    echo ""

    # Detect OS and open terminals accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && source ~/adk-workshop/bin/activate && echo \"Training Portal\" && python training_portal.py"'
        osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && source ~/adk-workshop/bin/activate && echo \"Visual Agent Builder\" && adk web --port 8000"'
        echo "✅ Opened in new Terminal windows"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        gnome-terminal -- bash -c "source ~/adk-workshop/bin/activate && python training_portal.py; exec bash" &
        gnome-terminal -- bash -c "source ~/adk-workshop/bin/activate && adk web --port 8000; exec bash" &
        echo "✅ Opened in new terminal windows"
    else
        # Fallback - run sequentially
        echo "⚠️  Could not detect terminal. Starting in background..."
        python training_portal.py &
        PORTAL_PID=$!
        adk web --port 8000 &
        BUILDER_PID=$!

        echo ""
        echo "Both services started in background"
        echo "Portal PID: $PORTAL_PID"
        echo "Builder PID: $BUILDER_PID"
        echo ""
        echo "To stop them:"
        echo "  kill $PORTAL_PID $BUILDER_PID"

        wait
    fi
}

# Handle user choice
case $choice in
    1)
        start_portal
        ;;
    2)
        start_visual_builder
        ;;
    3)
        start_both
        ;;
    4)
        echo ""
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Please run again and select 1-4."
        exit 1
        ;;
esac
