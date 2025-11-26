#!/bin/bash
# Production smoke testing script for ADK Platform
#
# This script performs quick validation of a deployed environment:
# - Health endpoint checks
# - SSL/TLS validation
# - Basic API functionality
# - Response time validation
# - Error rate monitoring
#
# Usage: ./scripts/test/smoke-test.sh <base_url>
# Example: ./scripts/test/smoke-test.sh https://api.adk-platform.com

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BASE_URL="${1:-http://localhost:8080}"
TIMEOUT=10
MAX_RESPONSE_TIME=2000  # milliseconds

# Remove trailing slash
BASE_URL="${BASE_URL%/}"

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

# Track results
PASSED=0
FAILED=0
WARNINGS=0

record_pass() {
    ((PASSED++))
    log_success "$1"
}

record_fail() {
    ((FAILED++))
    log_error "$1"
}

record_warn() {
    ((WARNINGS++))
    log_warning "$1"
}

# Check if URL is accessible
check_connectivity() {
    log_info "Checking connectivity to $BASE_URL..."

    if curl -s --connect-timeout 5 "$BASE_URL" >/dev/null 2>&1; then
        record_pass "Base URL is accessible"
    else
        record_fail "Cannot connect to $BASE_URL"
        return 1
    fi
}

# Check SSL/TLS (if HTTPS)
check_ssl() {
    if [[ "$BASE_URL" == https://* ]]; then
        log_info "Checking SSL/TLS configuration..."

        # Check certificate validity
        local domain="${BASE_URL#https://}"
        domain="${domain%%/*}"
        domain="${domain%%:*}"

        if echo | openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | openssl x509 -noout -checkend 86400 >/dev/null 2>&1; then
            record_pass "SSL certificate is valid"
        else
            record_fail "SSL certificate is expired or invalid"
        fi

        # Check for TLS 1.2+
        if curl -s --tlsv1.2 "$BASE_URL/health/" >/dev/null 2>&1; then
            record_pass "TLS 1.2+ is supported"
        else
            record_warn "TLS 1.2 may not be supported"
        fi
    else
        log_info "Skipping SSL check (not HTTPS)"
    fi
}

# Check health endpoint
check_health() {
    log_info "Checking health endpoint..."

    local response=$(curl -s -w "\n%{http_code}\n%{time_total}" --connect-timeout $TIMEOUT "$BASE_URL/health/" 2>&1)
    local body=$(echo "$response" | sed -n '1p')
    local status_code=$(echo "$response" | sed -n '2p')
    local response_time=$(echo "$response" | sed -n '3p')

    # Check status code
    if [ "$status_code" = "200" ]; then
        record_pass "Health endpoint returns 200"
    else
        record_fail "Health endpoint returns $status_code (expected 200)"
    fi

    # Check response body
    if echo "$body" | grep -q "healthy"; then
        record_pass "Health endpoint indicates healthy status"
    else
        record_warn "Health endpoint response may indicate issues: $body"
    fi

    # Check response time
    local response_ms=$(echo "$response_time * 1000" | bc 2>/dev/null || echo "0")
    response_ms=${response_ms%.*}
    if [ "$response_ms" -lt "$MAX_RESPONSE_TIME" ]; then
        record_pass "Health endpoint response time: ${response_ms}ms"
    else
        record_warn "Health endpoint slow: ${response_ms}ms (threshold: ${MAX_RESPONSE_TIME}ms)"
    fi
}

# Check readiness endpoint
check_readiness() {
    log_info "Checking readiness endpoint..."

    local response=$(curl -s -w "\n%{http_code}" --connect-timeout $TIMEOUT "$BASE_URL/health/ready" 2>&1)
    local body=$(echo "$response" | sed -n '1p')
    local status_code=$(echo "$response" | sed -n '2p')

    if [ "$status_code" = "200" ]; then
        record_pass "Readiness endpoint returns 200"

        # Check database connectivity
        if echo "$body" | grep -q "database"; then
            record_pass "Database connectivity reported"
        fi
    elif [ "$status_code" = "503" ]; then
        record_warn "Service not ready (503): $body"
    else
        record_fail "Readiness endpoint returns $status_code"
    fi
}

# Check API documentation
check_docs() {
    log_info "Checking API documentation..."

    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$BASE_URL/docs" 2>&1)

    if [ "$status_code" = "200" ]; then
        record_pass "Swagger docs accessible"
    else
        record_warn "Swagger docs returned $status_code"
    fi

    # Check OpenAPI schema
    local openapi_response=$(curl -s --connect-timeout $TIMEOUT "$BASE_URL/openapi.json" 2>&1)

    if echo "$openapi_response" | grep -q "openapi"; then
        record_pass "OpenAPI schema available"
    else
        record_warn "OpenAPI schema may not be available"
    fi
}

# Check authentication endpoint
check_auth_endpoints() {
    log_info "Checking authentication endpoints..."

    # Check login endpoint exists (should return 422 for missing data)
    local login_response=$(curl -s -w "\n%{http_code}" --connect-timeout $TIMEOUT \
        -X POST "$BASE_URL/api/v1/users/login" \
        -H "Content-Type: application/json" \
        -d '{}' 2>&1)

    local status_code=$(echo "$login_response" | tail -1)

    if [ "$status_code" = "422" ] || [ "$status_code" = "400" ]; then
        record_pass "Login endpoint exists and validates input"
    elif [ "$status_code" = "500" ]; then
        record_warn "Login endpoint returns 500 (may need X-Tenant-ID header)"
    else
        record_warn "Login endpoint returns unexpected status: $status_code"
    fi

    # Check register endpoint exists
    local register_response=$(curl -s -w "\n%{http_code}" --connect-timeout $TIMEOUT \
        -X POST "$BASE_URL/api/v1/users/register" \
        -H "Content-Type: application/json" \
        -d '{}' 2>&1)

    status_code=$(echo "$register_response" | tail -1)

    if [ "$status_code" = "422" ] || [ "$status_code" = "400" ]; then
        record_pass "Register endpoint exists and validates input"
    elif [ "$status_code" = "500" ]; then
        record_warn "Register endpoint returns 500 (may need X-Tenant-ID header)"
    else
        record_warn "Register endpoint returns unexpected status: $status_code"
    fi
}

# Check protected endpoints require auth
check_auth_required() {
    log_info "Checking authentication requirements..."

    local me_response=$(curl -s -w "\n%{http_code}" --connect-timeout $TIMEOUT \
        "$BASE_URL/api/v1/users/me" 2>&1)

    local status_code=$(echo "$me_response" | tail -1)

    if [ "$status_code" = "401" ] || [ "$status_code" = "403" ]; then
        record_pass "Protected endpoints require authentication"
    else
        record_warn "Protected endpoint /users/me returns $status_code (expected 401/403)"
    fi
}

# Check CORS headers
check_cors() {
    log_info "Checking CORS configuration..."

    local cors_response=$(curl -s -I --connect-timeout $TIMEOUT \
        -H "Origin: http://localhost:4000" \
        "$BASE_URL/health/" 2>&1)

    if echo "$cors_response" | grep -iq "access-control"; then
        record_pass "CORS headers present"
    else
        record_warn "CORS headers may not be configured"
    fi
}

# Load test endpoint
load_test_light() {
    log_info "Running light load test (10 requests)..."

    local total_time=0
    local success_count=0

    for i in {1..10}; do
        local response=$(curl -s -w "%{http_code} %{time_total}" --connect-timeout $TIMEOUT \
            -o /dev/null "$BASE_URL/health/" 2>&1)

        local status=$(echo "$response" | awk '{print $1}')
        local time=$(echo "$response" | awk '{print $2}')

        if [ "$status" = "200" ]; then
            ((success_count++))
            total_time=$(echo "$total_time + $time" | bc)
        fi
    done

    if [ "$success_count" -eq 10 ]; then
        local avg_time=$(echo "scale=3; $total_time / 10 * 1000" | bc)
        record_pass "Light load test: 10/10 successful, avg ${avg_time}ms"
    elif [ "$success_count" -ge 8 ]; then
        record_warn "Light load test: $success_count/10 successful"
    else
        record_fail "Light load test: $success_count/10 successful"
    fi
}

# Print summary
print_summary() {
    echo ""
    echo "========================================"
    echo "  Smoke Test Summary"
    echo "========================================"
    echo ""
    echo "  Target: $BASE_URL"
    echo ""
    echo -e "  Passed:   ${GREEN}${PASSED}${NC}"
    echo -e "  Failed:   ${RED}${FAILED}${NC}"
    echo -e "  Warnings: ${YELLOW}${WARNINGS}${NC}"
    echo ""

    if [ "$FAILED" -eq 0 ]; then
        echo -e "${GREEN}All smoke tests passed!${NC}"
        return 0
    else
        echo -e "${RED}Some smoke tests failed. Review the output above.${NC}"
        return 1
    fi
}

# Print usage
print_usage() {
    echo "Usage: $0 <base_url>"
    echo ""
    echo "Examples:"
    echo "  $0 http://localhost:8080"
    echo "  $0 https://api-staging.adk-platform.com"
    echo "  $0 https://api.adk-platform.com"
}

# Main
main() {
    echo ""
    echo "========================================"
    echo "  ADK Platform Smoke Tests"
    echo "========================================"
    echo ""

    if [ -z "$BASE_URL" ]; then
        print_usage
        exit 1
    fi

    log_info "Testing: $BASE_URL"
    echo ""

    # Run all checks
    check_connectivity || exit 1
    check_ssl
    check_health
    check_readiness
    check_docs
    check_auth_endpoints
    check_auth_required
    check_cors
    load_test_light

    print_summary
}

main
