#!/bin/bash

# ADK Workshop - Start Script
# Starts the Visual Agent Builder with environment variables

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VENV_PATH="$HOME/adk-workshop"
PID_FILE="$SCRIPT_DIR/.adk-builder.pid"
ENV_FILE="$SCRIPT_DIR/.env"

echo "=============================================="
echo "  ADK Workshop - Visual Agent Builder"
echo "=============================================="
echo ""

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Visual Agent Builder is already running (PID: $PID)"
        echo "   URL: http://localhost:8000/dev-ui"
        echo ""
        echo "   Run ./stop.sh to stop it first, or ./restart.sh to restart"
        exit 1
    else
        echo "🧹 Cleaning up stale PID file..."
        rm "$PID_FILE"
    fi
fi

# Check if virtual environment exists
if [ ! -d "$VENV_PATH" ]; then
    echo "❌ Virtual environment not found at $VENV_PATH"
    echo ""
    echo "Please create it first:"
    echo "  python3 -m venv $VENV_PATH"
    echo "  source $VENV_PATH/bin/activate"
    echo "  pip install google-adk"
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source "$VENV_PATH/bin/activate"

# Load environment variables from .env file
if [ -f "$ENV_FILE" ]; then
    echo "🔑 Loading environment variables from .env..."
    export $(grep -v '^#' "$ENV_FILE" | xargs)

    if [ -z "$GOOGLE_API_KEY" ]; then
        echo "⚠️  Warning: GOOGLE_API_KEY not found in .env file"
    else
        echo "✅ GOOGLE_API_KEY loaded"
    fi
else
    echo "⚠️  Warning: .env file not found at $ENV_FILE"
    echo "   The Visual Agent Builder may not work without GOOGLE_API_KEY"
fi

# Check if google-adk is installed
echo ""
echo "🔍 Checking for google-adk..."
if ! command -v adk &> /dev/null; then
    echo "📥 Installing google-adk..."
    pip install google-adk
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install google-adk"
        exit 1
    fi
    echo "✅ google-adk installed"
else
    echo "✅ google-adk found"
fi

# Start the Visual Agent Builder
echo ""
echo "🚀 Starting Visual Agent Builder..."
echo ""
echo "   URL: http://localhost:8000/dev-ui"
echo "   Log file: $SCRIPT_DIR/adk-builder.log"
echo ""
echo "   Use ./stop.sh to stop"
echo "   Use ./restart.sh to restart"
echo ""
echo "=============================================="
echo ""

# Start in background and save PID
nohup adk web --port 8000 > "$SCRIPT_DIR/adk-builder.log" 2>&1 &
PID=$!
echo $PID > "$PID_FILE"

# Wait a moment and check if it started successfully
sleep 2
if ps -p $PID > /dev/null 2>&1; then
    echo "✅ Visual Agent Builder started successfully (PID: $PID)"
    echo ""
    echo "📝 Logs: tail -f adk-builder.log"
else
    echo "❌ Failed to start Visual Agent Builder"
    echo "   Check adk-builder.log for details"
    rm "$PID_FILE"
    exit 1
fi
