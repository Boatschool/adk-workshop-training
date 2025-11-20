#!/bin/bash

# ADK Workshop - Restart Script
# Restarts the Visual Agent Builder

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "=============================================="
echo "  ADK Workshop - Restart Visual Agent Builder"
echo "=============================================="
echo ""

# Stop the builder
"$SCRIPT_DIR/stop.sh"

# Give it a moment
sleep 1

# Start the builder
"$SCRIPT_DIR/start.sh"
