#!/bin/bash

# ADK Workshop Training Portal Launcher
# Simple script to start the training portal

echo "=============================================="
echo "  ADK Workshop Training Portal"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "training_portal.py" ]; then
    echo "❌ Error: training_portal.py not found"
    echo "   Please run this script from the adk-workshop-training directory"
    exit 1
fi

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Virtual environment not activated"
    echo ""
    echo "Attempting to activate ~/adk-workshop/bin/activate..."

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

echo ""
echo "📦 Checking dependencies..."

# Check if requirements are installed
if ! python -c "import flask" 2>/dev/null; then
    echo "📥 Installing requirements..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install requirements"
        exit 1
    fi
else
    echo "✅ Dependencies installed"
fi

echo ""
echo "🚀 Starting training portal..."
echo ""
echo "   Portal will open at: http://localhost:5000"
echo "   Press Ctrl+C to stop"
echo ""
echo "=============================================="
echo ""

# Start the portal
python training_portal.py
