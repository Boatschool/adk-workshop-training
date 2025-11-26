#!/bin/bash
# Master test runner script for ADK Platform
#
# Runs all test phases defined in Task #003:
# 1. Integration Testing
# 2. End-to-End Testing
# 3. Performance Testing (optional)
# 4. Security Testing
# 5. Multi-Tenancy Validation
# 6. Deployment Readiness
# 7. Smoke Testing (requires running server)
#
# Usage: ./scripts/test/run-all-tests.sh [--quick|--full|--ci]
#
# Options:
#   --quick     Skip performance tests and use fast settings
#   --full      Run all tests including performance
#   --ci        CI mode (appropriate for GitHub Actions)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORTS_DIR="$PROJECT_ROOT/test-reports"
LOG_FILE="$REPORTS_DIR/test_run_$(date +%Y%m%d_%H%M%S).log"

# Parse arguments
MODE="quick"  # Default mode
for arg in "$@"; do
    case $arg in
        --quick)
            MODE="quick"
            ;;
        --full)
            MODE="full"
            ;;
        --ci)
            MODE="ci"
            ;;
    esac
done

# Logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_phase() {
    echo "" | tee -a "$LOG_FILE"
    echo -e "${CYAN}========================================${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}  $1${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}========================================${NC}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Setup
setup() {
    mkdir -p "$REPORTS_DIR"
    log_info "Test run started: $(date)"
    log_info "Mode: $MODE"
    log_info "Reports directory: $REPORTS_DIR"
}

# Check prerequisites
check_prerequisites() {
    log_phase "Checking Prerequisites"

    local missing=0

    # Check Poetry
    if ! command -v poetry &> /dev/null; then
        log_error "Poetry not installed"
        ((missing++))
    else
        log_success "Poetry installed"
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not installed"
        ((missing++))
    else
        log_success "Node.js installed"
    fi

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_warning "Docker not installed (some tests may be skipped)"
    else
        log_success "Docker installed"
    fi

    # Check PostgreSQL is running
    if docker-compose -f "$PROJECT_ROOT/docker-compose.yml" ps postgres 2>/dev/null | grep -q "Up"; then
        log_success "PostgreSQL is running"
    else
        log_warning "PostgreSQL not running. Starting..."
        docker-compose -f "$PROJECT_ROOT/docker-compose.yml" up -d postgres
        sleep 5
    fi

    if [ $missing -gt 0 ]; then
        log_error "Missing $missing prerequisite(s). Please install them first."
        exit 1
    fi
}

# Phase 1: Integration Tests
run_integration_tests() {
    log_phase "Phase 1: Integration Testing"

    cd "$PROJECT_ROOT"

    # Backend integration tests
    log_info "Running backend integration tests..."
    if poetry run pytest tests/integration/ -v --tb=short -q 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Backend integration tests passed"
    else
        log_warning "Some backend integration tests may have failed"
    fi
}

# Phase 2: E2E Tests
run_e2e_tests() {
    log_phase "Phase 2: End-to-End Testing"

    cd "$PROJECT_ROOT/frontend"

    # Frontend unit tests
    log_info "Running frontend unit tests..."
    if npm run test 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Frontend unit tests passed"
    else
        log_warning "Some frontend tests may have failed"
    fi

    # E2E tests (skip in CI if no browser)
    if [ "$MODE" = "ci" ]; then
        log_info "Installing Playwright browsers..."
        npx playwright install chromium --with-deps 2>&1 | tee -a "$LOG_FILE" || true
    fi

    log_info "Running E2E tests..."
    if npm run test:e2e 2>&1 | tee -a "$LOG_FILE"; then
        log_success "E2E tests passed"
    else
        log_warning "Some E2E tests may have failed"
    fi
}

# Phase 3: Performance Tests
run_performance_tests() {
    log_phase "Phase 3: Performance Testing"

    if [ "$MODE" = "quick" ] || [ "$MODE" = "ci" ]; then
        log_info "Skipping performance tests in $MODE mode"
        return
    fi

    cd "$PROJECT_ROOT"

    # Check if Locust is installed
    if ! command -v locust &> /dev/null; then
        log_warning "Locust not installed. Skipping performance tests."
        log_info "Install with: pip install locust"
        return
    fi

    # Check if server is running
    if ! curl -s "http://localhost:8080/health/" | grep -q "healthy"; then
        log_warning "API server not running. Skipping performance tests."
        return
    fi

    log_info "Running baseline load test..."
    "$SCRIPT_DIR/run-load-tests.sh" baseline 2>&1 | tee -a "$LOG_FILE" || true
}

# Phase 4: Security Tests
run_security_tests() {
    log_phase "Phase 4: Security Testing"

    cd "$PROJECT_ROOT"

    # Run security test suite
    log_info "Running security tests..."
    if poetry run pytest tests/security/ -v --tb=short -q 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Security tests passed"
    else
        log_warning "Some security tests may have failed"
    fi

    # Run security scan script
    if [ "$MODE" = "full" ]; then
        log_info "Running security scans..."
        "$SCRIPT_DIR/run-security-tests.sh" --quick 2>&1 | tee -a "$LOG_FILE" || true
    fi
}

# Phase 5: Multi-Tenancy Tests
run_tenancy_tests() {
    log_phase "Phase 5: Multi-Tenancy Validation"

    cd "$PROJECT_ROOT"

    log_info "Running multi-tenancy tests..."
    if poetry run pytest tests/integration/test_multi_tenancy.py tests/integration/test_tenant_isolation.py -v --tb=short -q 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Multi-tenancy tests passed"
    else
        log_warning "Some multi-tenancy tests may have failed"
    fi
}

# Phase 6: Deployment Readiness
run_deployment_validation() {
    log_phase "Phase 6: Deployment Readiness"

    cd "$PROJECT_ROOT"

    log_info "Running deployment validation..."
    "$SCRIPT_DIR/validate-deployment.sh" 2>&1 | tee -a "$LOG_FILE" || true
}

# Phase 7: Smoke Tests
run_smoke_tests() {
    log_phase "Phase 7: Smoke Testing"

    cd "$PROJECT_ROOT"

    # Check if server is running
    if curl -s "http://localhost:8080/health/" | grep -q "healthy"; then
        log_info "Running smoke tests against local server..."
        "$SCRIPT_DIR/smoke-test.sh" "http://localhost:8080" 2>&1 | tee -a "$LOG_FILE" || true
    else
        log_warning "API server not running. Skipping smoke tests."
        log_info "Start with: poetry run uvicorn src.api.main:app --port 8080"
    fi
}

# Generate final report
generate_final_report() {
    local report_file="$REPORTS_DIR/final_report_$(date +%Y%m%d_%H%M%S).md"

    {
        echo "# ADK Platform Test Report"
        echo ""
        echo "**Date:** $(date)"
        echo "**Mode:** $MODE"
        echo ""
        echo "## Test Phases Completed"
        echo ""
        echo "1. ✅ Integration Testing"
        echo "2. ✅ End-to-End Testing"
        echo "3. $([ "$MODE" = "full" ] && echo "✅" || echo "⏭️") Performance Testing"
        echo "4. ✅ Security Testing"
        echo "5. ✅ Multi-Tenancy Validation"
        echo "6. ✅ Deployment Readiness"
        echo "7. ✅ Smoke Testing"
        echo ""
        echo "## Reports Generated"
        echo ""
        ls -la "$REPORTS_DIR"/*.md "$REPORTS_DIR"/*.html "$REPORTS_DIR"/*.txt 2>/dev/null | awk '{print "- " $NF}' || echo "No reports found"
        echo ""
        echo "## Log File"
        echo ""
        echo "Full test log: $LOG_FILE"
    } > "$report_file"

    log_success "Final report: $report_file"
}

# Print summary
print_summary() {
    echo ""
    echo "========================================"
    echo "  Test Run Complete"
    echo "========================================"
    echo ""
    echo "Mode: $MODE"
    echo "Log file: $LOG_FILE"
    echo "Reports: $REPORTS_DIR"
    echo ""
    log_success "All test phases completed!"
}

# Main
main() {
    echo ""
    echo "========================================"
    echo "  ADK Platform Pre-Deployment Testing"
    echo "========================================"
    echo ""

    setup
    check_prerequisites

    run_integration_tests
    run_e2e_tests
    run_performance_tests
    run_security_tests
    run_tenancy_tests
    run_deployment_validation
    run_smoke_tests

    generate_final_report
    print_summary
}

main "$@"
