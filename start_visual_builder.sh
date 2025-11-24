#!/bin/bash

# ADK Workshop - Start Script
# Starts the Visual Agent Builder with environment variables

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VENV_PATH="$HOME/adk-workshop"
PID_FILE="$SCRIPT_DIR/.adk-builder.pid"
ENV_FILE="$SCRIPT_DIR/.env"
ADK_PORT=8000

echo "=============================================="
echo "  ADK Workshop - Visual Agent Builder"
echo "=============================================="
echo ""

# Check if already running via PID file
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Visual Agent Builder is already running (PID: $PID)"
        echo "   URL: http://localhost:$ADK_PORT/dev-ui"
        echo ""
        echo "   Run ./stop_visual_builder.sh to stop it first"
        echo "   Run ./restart_visual_builder.sh to restart"
        exit 1
    else
        echo "🧹 Cleaning up stale PID file..."
        rm "$PID_FILE"
    fi
fi

# Check if port 8000 is already in use by another process
if lsof -i :$ADK_PORT > /dev/null 2>&1; then
    echo "❌ Port $ADK_PORT is already in use!"
    echo ""
    echo "   Another process is using this port. Check with:"
    echo "   lsof -i :$ADK_PORT"
    echo ""
    echo "   Note: FastAPI backend should run on port 8080, not 8000"
    exit 1
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
echo "🚀 Starting Visual Agent Builder on port $ADK_PORT..."
echo ""
echo "   URL: http://localhost:$ADK_PORT/dev-ui"
echo "   Log file: $SCRIPT_DIR/adk-builder.log"
echo ""
echo "   Use ./stop_visual_builder.sh to stop"
echo "   Use ./restart_visual_builder.sh to restart"
echo ""
echo "=============================================="
echo ""

# Start in background and save PID
nohup adk web --port $ADK_PORT > "$SCRIPT_DIR/adk-builder.log" 2>&1 &
PID=$!
echo $PID > "$PID_FILE"

# Wait a moment and check if it started successfully
sleep 2
if ps -p $PID > /dev/null 2>&1; then
    echo "✅ Visual Agent Builder started successfully (PID: $PID)"
    echo ""
    echo "📝 Logs: tail -f adk-builder.log"
    echo ""
    # Wait for server to be ready and do a health check
    echo "⏳ Waiting for server to be ready..."
    RETRY=0
    MAX_RETRIES=10
    while [ $RETRY -lt $MAX_RETRIES ]; do
        if curl -s "http://localhost:$ADK_PORT" > /dev/null 2>&1; then
            echo "✅ Server is responding at http://localhost:$ADK_PORT/dev-ui"
            exit 0
        fi
        sleep 1
        RETRY=$((RETRY + 1))
    done
    echo "⚠️  Server started but not responding yet. Check logs if issues persist."
else
    echo "❌ Failed to start Visual Agent Builder"
    echo "   Check adk-builder.log for details"
    rm "$PID_FILE"
    exit 1
fi
