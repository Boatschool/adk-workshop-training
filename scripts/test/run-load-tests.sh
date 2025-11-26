#!/bin/bash
# Load testing script for ADK Platform
# Uses Locust for load testing
#
# Usage:
#   ./scripts/test/run-load-tests.sh [baseline|normal|stress|spike]
#
# Profiles:
#   baseline: 10 users, 2/sec spawn, 5 min (establish baseline)
#   normal:   50 users, 5/sec spawn, 10 min (normal load)
#   stress:   100 users, 10/sec spawn, 10 min (stress test)
#   spike:    200 users, 50/sec spawn, 5 min (spike test)

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
LOCUSTFILE="$PROJECT_ROOT/tests/load/locustfile.py"
REPORTS_DIR="$PROJECT_ROOT/test-reports/load"
HOST="${HOST:-http://localhost:8080}"

# Default profile
PROFILE="${1:-baseline}"

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Locust is installed
check_locust() {
    if ! command -v locust &> /dev/null; then
        log_error "Locust is not installed. Install with: pip install locust"
        exit 1
    fi
    log_success "Locust is installed"
}

# Check if API is running
check_api() {
    log_info "Checking API availability at $HOST..."

    if curl -s "$HOST/health/" | grep -q "healthy"; then
        log_success "API is healthy"
        return 0
    else
        log_error "API is not available at $HOST"
        log_info "Please start the API server first with:"
        log_info "  poetry run uvicorn src.api.main:app --reload --port 8080"
        exit 1
    fi
}

# Create reports directory
setup_reports_dir() {
    mkdir -p "$REPORTS_DIR"
    log_success "Reports directory ready: $REPORTS_DIR"
}

# Run load test with specified parameters
run_load_test() {
    local users=$1
    local spawn_rate=$2
    local run_time=$3
    local test_name=$4

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local report_file="$REPORTS_DIR/${test_name}_${timestamp}.html"
    local csv_prefix="$REPORTS_DIR/${test_name}_${timestamp}"

    log_info "Starting $test_name load test..."
    log_info "  Users: $users"
    log_info "  Spawn rate: $spawn_rate/sec"
    log_info "  Duration: $run_time"
    log_info "  Target: $HOST"

    locust \
        -f "$LOCUSTFILE" \
        --host "$HOST" \
        --users "$users" \
        --spawn-rate "$spawn_rate" \
        --run-time "$run_time" \
        --headless \
        --html "$report_file" \
        --csv "$csv_prefix" \
        --only-summary

    log_success "Load test complete"
    log_info "HTML Report: $report_file"
    log_info "CSV Files: ${csv_prefix}_*.csv"
}

# Profile configurations
run_baseline() {
    run_load_test 10 2 "5m" "baseline"
}

run_normal() {
    run_load_test 50 5 "10m" "normal"
}

run_stress() {
    run_load_test 100 10 "10m" "stress"
}

run_spike() {
    run_load_test 200 50 "5m" "spike"
}

# Print usage
print_usage() {
    echo "Usage: $0 [baseline|normal|stress|spike|ui]"
    echo ""
    echo "Profiles:"
    echo "  baseline  - 10 users, 5 min (establish baseline)"
    echo "  normal    - 50 users, 10 min (normal load)"
    echo "  stress    - 100 users, 10 min (stress test)"
    echo "  spike     - 200 users, 5 min (spike test)"
    echo "  ui        - Launch Locust web UI"
    echo ""
    echo "Environment Variables:"
    echo "  HOST      - Target host (default: http://localhost:8080)"
}

# Main
main() {
    echo ""
    echo "========================================"
    echo "  ADK Platform Load Testing"
    echo "========================================"
    echo ""

    check_locust
    check_api
    setup_reports_dir

    case "$PROFILE" in
        baseline)
            run_baseline
            ;;
        normal)
            run_normal
            ;;
        stress)
            run_stress
            ;;
        spike)
            run_spike
            ;;
        ui)
            log_info "Starting Locust web UI..."
            log_info "Open http://localhost:8089 in your browser"
            locust -f "$LOCUSTFILE" --host "$HOST"
            ;;
        help|--help|-h)
            print_usage
            ;;
        *)
            log_error "Unknown profile: $PROFILE"
            print_usage
            exit 1
            ;;
    esac

    echo ""
    echo "========================================"
    log_success "Load testing complete!"
    echo "========================================"
}

main
