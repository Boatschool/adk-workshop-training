#!/bin/bash

# ADK Workshop - Stop Script
# Stops the Visual Agent Builder

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PID_FILE="$SCRIPT_DIR/.adk-builder.pid"

echo "=============================================="
echo "  ADK Workshop - Stop Visual Agent Builder"
echo "=============================================="
echo ""

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo "⚠️  Visual Agent Builder is not running (no PID file found)"
    exit 0
fi

# Read PID
PID=$(cat "$PID_FILE")

# Check if process is running
if ! ps -p $PID > /dev/null 2>&1; then
    echo "⚠️  Process not found (PID: $PID)"
    echo "🧹 Cleaning up PID file..."
    rm "$PID_FILE"
    exit 0
fi

# Stop the process
echo "🛑 Stopping Visual Agent Builder (PID: $PID)..."
kill $PID

# Wait for process to stop (max 10 seconds)
COUNTER=0
while ps -p $PID > /dev/null 2>&1 && [ $COUNTER -lt 10 ]; do
    sleep 1
    COUNTER=$((COUNTER + 1))
done

# Check if stopped
if ps -p $PID > /dev/null 2>&1; then
    echo "⚠️  Process did not stop gracefully, forcing..."
    kill -9 $PID
    sleep 1
fi

# Clean up PID file
rm "$PID_FILE"

echo "✅ Visual Agent Builder stopped"
echo ""
