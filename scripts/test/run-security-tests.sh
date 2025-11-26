#!/bin/bash
# Security testing script for ADK Platform
#
# This script runs various security scans and tests:
# - Python dependency vulnerability scanning (safety, pip-audit)
# - Python code security linting (bandit)
# - Node.js dependency scanning (npm audit)
# - Application security tests (pytest security markers)
#
# Usage: ./scripts/test/run-security-tests.sh [--full] [--quick] [--ci]
#
# Options:
#   --full   Run all security scans
#   --quick  Run only bandit and security tests
#   --ci     CI mode - fail on any security findings (enforcing mode)

set -e
set -o pipefail

# Track failures for CI mode
BANDIT_FAILED=0
DEPS_FAILED=0
NPM_FAILED=0
TESTS_FAILED=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORTS_DIR="$PROJECT_ROOT/test-reports/security"

# Parse arguments
FULL_SCAN=false
QUICK_SCAN=false
CI_MODE=false

for arg in "$@"; do
    case $arg in
        --full)
            FULL_SCAN=true
            ;;
        --quick)
            QUICK_SCAN=true
            ;;
        --ci)
            CI_MODE=true
            ;;
    esac
done

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Setup reports directory
setup_reports() {
    mkdir -p "$REPORTS_DIR"
    log_success "Reports directory: $REPORTS_DIR"
}

# Check for installed tools
check_tools() {
    log_info "Checking security tools..."

    local missing_tools=()

    if ! command -v bandit &> /dev/null; then
        missing_tools+=("bandit (pip install bandit)")
    fi

    if ! command -v safety &> /dev/null; then
        log_warning "safety not installed (pip install safety)"
    fi

    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_warning "Some tools are missing. Install with poetry/pip:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
    fi
}

# Run Bandit security linter
run_bandit() {
    log_info "Running Bandit security linter..."

    cd "$PROJECT_ROOT"

    if command -v bandit &> /dev/null; then
        local report_file="$REPORTS_DIR/bandit_report.txt"
        local json_report="$REPORTS_DIR/bandit_report.json"
        local exit_code=0

        # Run bandit with medium severity and above
        bandit -r src/ -ll -ii -f txt -o "$report_file" 2>/dev/null || exit_code=$?
        bandit -r src/ -ll -ii -f json -o "$json_report" 2>/dev/null || true

        log_success "Bandit report: $report_file"

        # Show summary
        if [ -f "$report_file" ]; then
            echo ""
            echo "Bandit Summary:"
            tail -20 "$report_file"
        fi

        # In CI mode, fail if bandit found issues (exit code 1 = issues found)
        if [ "$CI_MODE" = true ] && [ $exit_code -ne 0 ]; then
            log_error "Bandit found security issues (exit code: $exit_code)"
            BANDIT_FAILED=1
        fi
    else
        log_warning "Bandit not installed, skipping"
        if [ "$CI_MODE" = true ]; then
            log_error "Bandit is required in CI mode"
            BANDIT_FAILED=1
        fi
    fi
}

# Run dependency vulnerability scan (Python)
run_python_deps_scan() {
    log_info "Scanning Python dependencies for vulnerabilities..."

    cd "$PROJECT_ROOT"

    local report_file="$REPORTS_DIR/python_deps_scan.txt"
    local exit_code=0

    # Try safety first
    if command -v safety &> /dev/null; then
        log_info "Running safety check..."
        poetry export -f requirements.txt --without-hashes 2>/dev/null | \
            safety check --stdin --output text > "$report_file" 2>&1 || exit_code=$?

        log_success "Python deps report: $report_file"

        # In CI mode, fail if vulnerabilities found (exit code 64 = vulnerabilities, 0 = clean)
        if [ "$CI_MODE" = true ] && [ $exit_code -ne 0 ]; then
            log_error "Safety found vulnerable dependencies (exit code: $exit_code)"
            DEPS_FAILED=1
        fi
    else
        log_warning "safety not installed"

        # Fall back to pip-audit if available
        if command -v pip-audit &> /dev/null; then
            log_info "Running pip-audit..."
            pip-audit > "$report_file" 2>&1 || exit_code=$?

            if [ "$CI_MODE" = true ] && [ $exit_code -ne 0 ]; then
                log_error "pip-audit found vulnerable dependencies"
                DEPS_FAILED=1
            fi
        elif [ "$CI_MODE" = true ]; then
            log_error "Neither safety nor pip-audit installed - required for CI"
            DEPS_FAILED=1
        fi
    fi
}

# Run npm audit
run_npm_audit() {
    log_info "Scanning Node.js dependencies for vulnerabilities..."

    cd "$PROJECT_ROOT/frontend"

    local report_file="$REPORTS_DIR/npm_audit_report.json"
    local text_report="$REPORTS_DIR/npm_audit_report.txt"
    local exit_code=0

    npm audit --json > "$report_file" 2>/dev/null || exit_code=$?
    npm audit > "$text_report" 2>/dev/null || true

    log_success "npm audit report: $text_report"

    # Show summary
    if [ -f "$text_report" ]; then
        echo ""
        echo "npm audit Summary:"
        head -30 "$text_report"
    fi

    # In CI mode, fail on high/critical vulnerabilities
    # npm audit returns: 0 = no vulns, non-zero = vulns found
    if [ "$CI_MODE" = true ] && [ $exit_code -ne 0 ]; then
        # Check if there are high or critical vulnerabilities
        local high_critical=$(jq -r '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical' "$report_file" 2>/dev/null || echo "0")
        if [ "$high_critical" != "0" ] && [ "$high_critical" != "null" ]; then
            log_error "npm audit found $high_critical high/critical vulnerabilities"
            NPM_FAILED=1
        else
            log_warning "npm audit found lower severity issues (not failing CI)"
        fi
    fi
}

# Run security unit tests
run_security_tests() {
    log_info "Running security tests..."

    cd "$PROJECT_ROOT"

    local report_file="$REPORTS_DIR/security_tests_report.txt"
    local exit_code=0

    # Run pytest with security marker
    poetry run pytest tests/security/ -v --tb=short > "$report_file" 2>&1 || exit_code=$?

    log_success "Security tests report: $report_file"

    # Show summary
    if [ -f "$report_file" ]; then
        echo ""
        echo "Security Tests Summary:"
        tail -30 "$report_file"
    fi

    # In CI mode, fail if tests fail
    if [ "$CI_MODE" = true ] && [ $exit_code -ne 0 ]; then
        log_error "Security tests failed (exit code: $exit_code)"
        TESTS_FAILED=1
    fi
}

# Check for hardcoded secrets
check_secrets() {
    log_info "Checking for hardcoded secrets..."

    cd "$PROJECT_ROOT"

    local report_file="$REPORTS_DIR/secrets_scan.txt"

    # Simple pattern-based secret detection
    {
        echo "=== Potential Secrets Scan ==="
        echo ""

        # Check for common secret patterns
        echo "Checking for API keys..."
        grep -rn --include="*.py" --include="*.ts" --include="*.tsx" \
            -E "(api_key|apikey|API_KEY).*=.*['\"][^'\"]{10,}" src/ frontend/src/ 2>/dev/null || echo "None found"

        echo ""
        echo "Checking for passwords..."
        grep -rn --include="*.py" --include="*.ts" --include="*.tsx" \
            -E "(password|PASSWORD|passwd).*=.*['\"][^'\"]{5,}" src/ frontend/src/ 2>/dev/null || echo "None found"

        echo ""
        echo "Checking for secrets..."
        grep -rn --include="*.py" --include="*.ts" --include="*.tsx" \
            -E "(secret|SECRET).*=.*['\"][^'\"]{10,}" src/ frontend/src/ 2>/dev/null || echo "None found"

        echo ""
        echo "Checking for tokens..."
        grep -rn --include="*.py" --include="*.ts" --include="*.tsx" \
            -E "(token|TOKEN).*=.*['\"][^'\"]{20,}" src/ frontend/src/ 2>/dev/null || echo "None found"

    } > "$report_file"

    log_success "Secrets scan report: $report_file"

    # Show summary
    echo ""
    echo "Secrets Scan Summary:"
    cat "$report_file"
}

# Check SSL/TLS configuration (if applicable)
check_tls_config() {
    log_info "Checking for insecure TLS usage..."

    cd "$PROJECT_ROOT"

    local report_file="$REPORTS_DIR/tls_config_check.txt"

    {
        echo "=== TLS Configuration Check ==="
        echo ""

        # Check for disabled SSL verification
        echo "Checking for disabled SSL verification..."
        grep -rn --include="*.py" "verify=False" src/ 2>/dev/null || echo "None found"
        grep -rn --include="*.py" "ssl=False" src/ 2>/dev/null || echo "None found"

        echo ""
        echo "Checking for insecure protocols..."
        grep -rn --include="*.py" -E "SSLv2|SSLv3|TLSv1[^.]" src/ 2>/dev/null || echo "None found"

    } > "$report_file"

    log_success "TLS config report: $report_file"
}

# Generate summary report
generate_summary() {
    local summary_file="$REPORTS_DIR/security_summary.md"

    {
        echo "# Security Scan Summary"
        echo ""
        echo "Date: $(date)"
        echo ""
        echo "## Reports Generated"
        echo ""
        ls -la "$REPORTS_DIR"/*.txt "$REPORTS_DIR"/*.json 2>/dev/null | awk '{print "- " $NF}'
        echo ""
        echo "## Quick Recommendations"
        echo ""
        echo "1. Review Bandit findings for code security issues"
        echo "2. Update vulnerable dependencies identified by safety/npm audit"
        echo "3. Address any failing security tests"
        echo "4. Remove any hardcoded secrets and use environment variables"
        echo ""
    } > "$summary_file"

    log_success "Summary report: $summary_file"
}

# Main execution
main() {
    echo ""
    echo "========================================"
    echo "  ADK Platform Security Testing"
    echo "========================================"
    echo ""

    if [ "$CI_MODE" = true ]; then
        log_info "Running in CI mode (enforcing)"
    fi

    setup_reports
    check_tools

    if [ "$QUICK_SCAN" = true ]; then
        log_info "Running quick scan..."
        run_bandit
        run_security_tests
    else
        # Full scan
        run_bandit
        run_python_deps_scan
        run_npm_audit
        run_security_tests
        check_secrets
        check_tls_config
    fi

    generate_summary

    echo ""
    echo "========================================"

    # In CI mode, return proper exit code
    if [ "$CI_MODE" = true ]; then
        local total_failures=$((BANDIT_FAILED + DEPS_FAILED + NPM_FAILED + TESTS_FAILED))
        if [ $total_failures -gt 0 ]; then
            log_error "Security testing failed with $total_failures issue(s):"
            [ $BANDIT_FAILED -eq 1 ] && log_error "  - Bandit found code security issues"
            [ $DEPS_FAILED -eq 1 ] && log_error "  - Vulnerable Python dependencies found"
            [ $NPM_FAILED -eq 1 ] && log_error "  - Vulnerable npm dependencies found"
            [ $TESTS_FAILED -eq 1 ] && log_error "  - Security tests failed"
            echo "Reports available in: $REPORTS_DIR"
            echo "========================================"
            exit 1
        fi
    fi

    log_success "Security testing complete!"
    echo "Reports available in: $REPORTS_DIR"
    echo "========================================"
}

main
