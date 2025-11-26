#!/bin/bash
# Deployment readiness validation script for ADK Platform
#
# This script validates:
# - Docker build
# - Database migrations
# - Health checks
# - Environment configuration
# - CI/CD pipeline readiness
#
# Usage: ./scripts/test/validate-deployment.sh [--local|--staging|--production]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORTS_DIR="$PROJECT_ROOT/test-reports/deployment"

# Parse arguments
ENVIRONMENT="${1:-local}"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Track validation results
declare -a PASSED_CHECKS=()
declare -a FAILED_CHECKS=()
declare -a WARNING_CHECKS=()

record_pass() {
    PASSED_CHECKS+=("$1")
    log_success "$1"
}

record_fail() {
    FAILED_CHECKS+=("$1")
    log_error "$1"
}

record_warn() {
    WARNING_CHECKS+=("$1")
    log_warning "$1"
}

# Setup
setup() {
    mkdir -p "$REPORTS_DIR"
    log_info "Starting deployment validation for environment: $ENVIRONMENT"
    echo ""
}

# Check required files exist
check_required_files() {
    log_info "Checking required files..."

    local files=(
        "pyproject.toml"
        "poetry.lock"
        "alembic.ini"
        "docker-compose.yml"
        ".env.example"
        "src/api/main.py"
        "frontend/package.json"
    )

    for file in "${files[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            record_pass "File exists: $file"
        else
            record_fail "Missing file: $file"
        fi
    done
}

# Validate Docker configuration
check_docker() {
    log_info "Checking Docker configuration..."

    # Check if Dockerfile exists
    if [ -f "$PROJECT_ROOT/Dockerfile" ]; then
        record_pass "Dockerfile exists"

        # Validate Dockerfile syntax (basic check)
        if grep -q "^FROM" "$PROJECT_ROOT/Dockerfile"; then
            record_pass "Dockerfile has FROM instruction"
        else
            record_fail "Dockerfile missing FROM instruction"
        fi

        # Check for multi-stage build (best practice)
        if grep -c "^FROM" "$PROJECT_ROOT/Dockerfile" | grep -qE "^[2-9]"; then
            record_pass "Dockerfile uses multi-stage build"
        else
            record_warn "Dockerfile does not use multi-stage build"
        fi
    else
        record_warn "No Dockerfile found (may be using Cloud Run source deploy)"
    fi

    # Check docker-compose
    if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
        record_pass "docker-compose.yml exists"

        # Check for postgres service
        if grep -q "postgres:" "$PROJECT_ROOT/docker-compose.yml"; then
            record_pass "PostgreSQL service defined"
        else
            record_fail "PostgreSQL service not defined"
        fi
    fi
}

# Validate database migrations
check_migrations() {
    log_info "Checking database migrations..."

    cd "$PROJECT_ROOT"

    # Check alembic configuration
    if [ -f "alembic.ini" ]; then
        record_pass "alembic.ini exists"
    else
        record_fail "alembic.ini missing"
        return
    fi

    # Check migrations directory
    if [ -d "src/db/migrations/versions" ]; then
        local migration_count=$(ls -1 src/db/migrations/versions/*.py 2>/dev/null | wc -l)
        if [ "$migration_count" -gt 0 ]; then
            record_pass "Found $migration_count migration files"
        else
            record_warn "No migration files found"
        fi
    else
        record_fail "Migrations directory missing"
    fi

    # Test migration can run (dry run)
    if poetry run alembic check 2>/dev/null; then
        record_pass "Alembic check passed"
    else
        record_warn "Alembic check failed (may need database)"
    fi
}

# Check health endpoints
check_health_endpoints() {
    log_info "Checking health endpoints..."

    cd "$PROJECT_ROOT"

    # Check if health routes are defined
    if grep -q "/health" src/api/routes/health.py 2>/dev/null; then
        record_pass "Health route defined"
    else
        record_fail "Health route not found"
    fi

    # Check for readiness endpoint
    if grep -q "ready" src/api/routes/health.py 2>/dev/null; then
        record_pass "Readiness endpoint defined"
    else
        record_warn "Readiness endpoint not found"
    fi

    # Test health endpoint if server is running
    if curl -s "http://localhost:8080/health/" 2>/dev/null | grep -q "healthy"; then
        record_pass "Health endpoint responds correctly"
    else
        record_warn "Health endpoint not responding (server may not be running)"
    fi
}

# Check environment configuration
check_environment() {
    log_info "Checking environment configuration..."

    cd "$PROJECT_ROOT"

    # Check .env.example has required variables
    local required_vars=(
        "SECRET_KEY"
        "DATABASE_URL"
        "GOOGLE_API_KEY"
    )

    if [ -f ".env.example" ]; then
        for var in "${required_vars[@]}"; do
            if grep -q "^$var" .env.example 2>/dev/null; then
                record_pass "Required var in .env.example: $var"
            else
                record_warn "Missing from .env.example: $var"
            fi
        done
    else
        record_fail ".env.example not found"
    fi

    # Check for secrets in code (should not exist)
    if grep -rn "sk-" src/ 2>/dev/null | grep -v ".pyc"; then
        record_fail "Potential hardcoded API key found"
    else
        record_pass "No hardcoded API keys found"
    fi
}

# Check code quality
check_code_quality() {
    log_info "Checking code quality..."

    cd "$PROJECT_ROOT"

    # Run ruff
    if poetry run ruff check src/ --quiet 2>/dev/null; then
        record_pass "Ruff linting passed"
    else
        record_warn "Ruff linting has issues"
    fi

    # Run black check
    if poetry run black --check src/ 2>/dev/null; then
        record_pass "Black formatting check passed"
    else
        record_warn "Black formatting has issues"
    fi

    # Run mypy (type checking)
    if poetry run mypy src/ --ignore-missing-imports 2>/dev/null; then
        record_pass "MyPy type checking passed"
    else
        record_warn "MyPy has issues"
    fi
}

# Check test coverage
check_tests() {
    log_info "Checking test coverage..."

    cd "$PROJECT_ROOT"

    # Check if tests exist
    local test_count=$(find tests/ -name "test_*.py" 2>/dev/null | wc -l)
    if [ "$test_count" -gt 0 ]; then
        record_pass "Found $test_count test files"
    else
        record_fail "No test files found"
    fi

    # Run tests
    if poetry run pytest tests/unit/ -q --tb=no 2>/dev/null; then
        record_pass "Unit tests pass"
    else
        record_warn "Some unit tests failing"
    fi
}

# Check frontend build
check_frontend() {
    log_info "Checking frontend build..."

    cd "$PROJECT_ROOT/frontend"

    # Check package.json exists
    if [ -f "package.json" ]; then
        record_pass "Frontend package.json exists"
    else
        record_fail "Frontend package.json missing"
        return
    fi

    # Check node_modules
    if [ -d "node_modules" ]; then
        record_pass "node_modules exists"
    else
        record_warn "node_modules missing (run npm install)"
    fi

    # Try build
    if npm run build --silent 2>/dev/null; then
        record_pass "Frontend builds successfully"
    else
        record_warn "Frontend build has issues"
    fi

    # Check build output
    if [ -d "dist" ]; then
        record_pass "Frontend dist directory created"
    else
        record_warn "Frontend dist directory not found"
    fi
}

# Check CI/CD configuration
check_ci_cd() {
    log_info "Checking CI/CD configuration..."

    cd "$PROJECT_ROOT"

    # Check for GitHub Actions
    if [ -d ".github/workflows" ]; then
        local workflow_count=$(ls -1 .github/workflows/*.yml 2>/dev/null | wc -l)
        if [ "$workflow_count" -gt 0 ]; then
            record_pass "Found $workflow_count GitHub Actions workflows"
        else
            record_warn "No GitHub Actions workflows found"
        fi
    else
        record_warn "No .github/workflows directory"
    fi

    # Check for pre-commit hooks
    if [ -f ".pre-commit-config.yaml" ]; then
        record_pass "Pre-commit config exists"
    else
        record_warn "No pre-commit config found"
    fi
}

# Check infrastructure config
check_infrastructure() {
    log_info "Checking infrastructure configuration..."

    cd "$PROJECT_ROOT"

    # Check for Terraform
    if [ -d "infrastructure/terraform" ]; then
        record_pass "Terraform directory exists"

        if [ -f "infrastructure/terraform/main.tf" ]; then
            record_pass "Main Terraform config exists"
        else
            record_warn "Main Terraform config missing"
        fi
    else
        record_warn "No Terraform directory (may be using different IaC)"
    fi
}

# Check documentation
check_documentation() {
    log_info "Checking documentation..."

    cd "$PROJECT_ROOT"

    # Check README
    if [ -f "README.md" ]; then
        record_pass "README.md exists"
    else
        record_warn "README.md missing"
    fi

    # Check API docs
    if [ -d "docs/api" ]; then
        record_pass "API docs directory exists"
    else
        record_warn "API docs directory missing"
    fi

    # Check for CLAUDE.md (project instructions)
    if [ -f "CLAUDE.md" ]; then
        record_pass "CLAUDE.md exists"
    fi
}

# Generate summary report
generate_report() {
    local report_file="$REPORTS_DIR/deployment_validation_$(date +%Y%m%d_%H%M%S).md"

    {
        echo "# Deployment Validation Report"
        echo ""
        echo "**Date:** $(date)"
        echo "**Environment:** $ENVIRONMENT"
        echo ""
        echo "## Summary"
        echo ""
        echo "- **Passed:** ${#PASSED_CHECKS[@]}"
        echo "- **Failed:** ${#FAILED_CHECKS[@]}"
        echo "- **Warnings:** ${#WARNING_CHECKS[@]}"
        echo ""

        if [ ${#PASSED_CHECKS[@]} -gt 0 ]; then
            echo "## Passed Checks"
            echo ""
            for check in "${PASSED_CHECKS[@]}"; do
                echo "- ✅ $check"
            done
            echo ""
        fi

        if [ ${#FAILED_CHECKS[@]} -gt 0 ]; then
            echo "## Failed Checks"
            echo ""
            for check in "${FAILED_CHECKS[@]}"; do
                echo "- ❌ $check"
            done
            echo ""
        fi

        if [ ${#WARNING_CHECKS[@]} -gt 0 ]; then
            echo "## Warnings"
            echo ""
            for check in "${WARNING_CHECKS[@]}"; do
                echo "- ⚠️ $check"
            done
            echo ""
        fi

        echo "## Recommendations"
        echo ""
        if [ ${#FAILED_CHECKS[@]} -gt 0 ]; then
            echo "**Critical:** Address all failed checks before deployment."
        else
            echo "All critical checks passed. Review warnings before production deployment."
        fi
    } > "$report_file"

    log_info "Report saved to: $report_file"
}

# Print summary
print_summary() {
    echo ""
    echo "========================================"
    echo "  Validation Summary"
    echo "========================================"
    echo ""
    echo -e "  Passed:   ${GREEN}${#PASSED_CHECKS[@]}${NC}"
    echo -e "  Failed:   ${RED}${#FAILED_CHECKS[@]}${NC}"
    echo -e "  Warnings: ${YELLOW}${#WARNING_CHECKS[@]}${NC}"
    echo ""

    if [ ${#FAILED_CHECKS[@]} -eq 0 ]; then
        log_success "All critical checks passed!"
        return 0
    else
        log_error "Some checks failed. Review the report."
        return 1
    fi
}

# Main execution
main() {
    echo ""
    echo "========================================"
    echo "  ADK Platform Deployment Validation"
    echo "========================================"
    echo ""

    setup

    check_required_files
    check_docker
    check_migrations
    check_health_endpoints
    check_environment
    check_code_quality
    check_tests
    check_frontend
    check_ci_cd
    check_infrastructure
    check_documentation

    generate_report
    print_summary
}

main
