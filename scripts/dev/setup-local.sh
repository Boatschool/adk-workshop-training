#!/bin/bash
# =============================================================================
# ADK Platform - Local Development Setup Script
# =============================================================================
# This script sets up a complete local development environment.
# Run from the project root: ./scripts/dev/setup-local.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ADK Platform - Local Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# -----------------------------------------------------------------------------
# Check prerequisites
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Checking prerequisites...${NC}"

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}ERROR: $1 is not installed${NC}"
        echo "Please install $1 and try again"
        exit 1
    fi
    echo -e "  ${GREEN}✓${NC} $1 found"
}

check_command "python3"
check_command "poetry"
check_command "docker"
check_command "node"
check_command "npm"

# Check Python version
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
if [[ "$PYTHON_VERSION" < "3.11" ]]; then
    echo -e "${RED}ERROR: Python 3.11+ required (found $PYTHON_VERSION)${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Python $PYTHON_VERSION"

echo ""

# -----------------------------------------------------------------------------
# Setup environment file
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Setting up environment...${NC}"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "  ${GREEN}✓${NC} Created .env from .env.example"
        echo -e "  ${YELLOW}!${NC} Please edit .env with your actual values"
    else
        echo -e "${RED}ERROR: .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "  ${GREEN}✓${NC} .env already exists"
fi

echo ""

# -----------------------------------------------------------------------------
# Install Python dependencies
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Installing Python dependencies...${NC}"

poetry install
echo -e "  ${GREEN}✓${NC} Python dependencies installed"

echo ""

# -----------------------------------------------------------------------------
# Install pre-commit hooks
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Setting up pre-commit hooks...${NC}"

poetry run pre-commit install
echo -e "  ${GREEN}✓${NC} Pre-commit hooks installed"

echo ""

# -----------------------------------------------------------------------------
# Start PostgreSQL container
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Starting PostgreSQL...${NC}"

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

# Start PostgreSQL
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "  Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U adk_user -d adk_platform &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}ERROR: PostgreSQL failed to start${NC}"
        docker-compose logs postgres
        exit 1
    fi
    sleep 1
done

echo ""

# -----------------------------------------------------------------------------
# Run database migrations
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Running database migrations...${NC}"

poetry run alembic upgrade head
echo -e "  ${GREEN}✓${NC} Database migrations applied"

echo ""

# -----------------------------------------------------------------------------
# Install frontend dependencies
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Installing frontend dependencies...${NC}"

cd frontend
npm ci
echo -e "  ${GREEN}✓${NC} Frontend dependencies installed"
cd ..

echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Start the services:"
echo ""
echo -e "  ${BLUE}Backend API (port 8080):${NC}"
echo "    poetry run uvicorn src.api.main:app --reload --port 8080"
echo ""
echo -e "  ${BLUE}Frontend (port 4000):${NC}"
echo "    cd frontend && npm run dev"
echo ""
echo -e "  ${BLUE}ADK Visual Builder (port 8000):${NC}"
echo "    ./start_visual_builder.sh"
echo ""
echo -e "Access points:"
echo "  - API Docs:       http://localhost:8080/docs"
echo "  - Frontend:       http://localhost:4000"
echo "  - Visual Builder: http://localhost:8000/dev-ui"
echo ""
echo -e "${YELLOW}Note: Edit .env if you haven't configured your API keys${NC}"
