#!/usr/bin/env python3
"""
Training Portal User Testing Script

This script tests the portal's functionality by simulating user interactions.
Tests navigation, content loading, progress tracking, and API endpoints.
"""

import requests
import time
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5001"
RESULTS = []

def log_test(test_name, passed, details=""):
    """Log test result"""
    result = {
        "test": test_name,
        "passed": passed,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    RESULTS.append(result)

    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"    {details}")

def test_homepage():
    """Test that homepage loads"""
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        passed = response.status_code == 200
        passed = passed and "ADK Workshop" in response.text
        passed = passed and "Launch Visual Builder" in response.text
        log_test("Homepage loads", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Homepage loads", False, str(e))
        return False

def test_getting_started():
    """Test Getting Started page"""
    try:
        response = requests.get(f"{BASE_URL}/getting-started", timeout=5)
        passed = response.status_code == 200
        passed = passed and "Getting Started" in response.text
        log_test("Getting Started page", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Getting Started page", False, str(e))
        return False

def test_visual_builder_guide():
    """Test Visual Builder Guide"""
    try:
        response = requests.get(f"{BASE_URL}/guides/visual-agent-builder-guide", timeout=5)
        passed = response.status_code == 200
        passed = passed and "Visual Agent Builder" in response.text
        log_test("Visual Builder Guide", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Visual Builder Guide", False, str(e))
        return False

def test_quickstart_guide():
    """Test Quickstart Guide"""
    try:
        response = requests.get(f"{BASE_URL}/guides/quickstart-guide", timeout=5)
        passed = response.status_code == 200
        passed = passed and "Quickstart" in response.text or "Quick" in response.text
        log_test("Quickstart Guide", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Quickstart Guide", False, str(e))
        return False

def test_cheat_sheet():
    """Test Cheat Sheet"""
    try:
        response = requests.get(f"{BASE_URL}/guides/cheat-sheet", timeout=5)
        passed = response.status_code == 200
        passed = passed and ("cheat" in response.text.lower() or "reference" in response.text.lower())
        log_test("Cheat Sheet", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Cheat Sheet", False, str(e))
        return False

def test_troubleshooting_guide():
    """Test Troubleshooting Guide"""
    try:
        response = requests.get(f"{BASE_URL}/guides/troubleshooting-guide", timeout=5)
        passed = response.status_code == 200
        passed = passed and "troubleshoot" in response.text.lower()
        log_test("Troubleshooting Guide", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Troubleshooting Guide", False, str(e))
        return False

def test_exercise_1():
    """Test Exercise 1"""
    try:
        response = requests.get(f"{BASE_URL}/exercises/exercise-1-basic-agent", timeout=5)
        passed = response.status_code == 200
        passed = passed and "exercise" in response.text.lower()
        passed = passed and "Mark as Complete" in response.text or "Completed" in response.text
        log_test("Exercise 1 page", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Exercise 1 page", False, str(e))
        return False

def test_exercise_2():
    """Test Exercise 2"""
    try:
        response = requests.get(f"{BASE_URL}/exercises/exercise-2-agents-with-tools", timeout=5)
        passed = response.status_code == 200
        passed = passed and "tool" in response.text.lower()
        log_test("Exercise 2 page", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Exercise 2 page", False, str(e))
        return False

def test_exercise_3():
    """Test Exercise 3"""
    try:
        response = requests.get(f"{BASE_URL}/exercises/exercise-3-multi-agent-systems", timeout=5)
        passed = response.status_code == 200
        passed = passed and "multi-agent" in response.text.lower()
        log_test("Exercise 3 page", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Exercise 3 page", False, str(e))
        return False

def test_example_1():
    """Test Example 1 - FAQ Agent"""
    try:
        response = requests.get(f"{BASE_URL}/examples/01-simple-faq-agent", timeout=5)
        passed = response.status_code == 200
        passed = passed and ("faq" in response.text.lower() or "agent" in response.text.lower())
        passed = passed and "Copy Code" in response.text
        log_test("Example 1 - FAQ Agent", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Example 1 - FAQ Agent", False, str(e))
        return False

def test_example_2():
    """Test Example 2 - Room Scheduler"""
    try:
        response = requests.get(f"{BASE_URL}/examples/02-meeting-room-scheduler", timeout=5)
        passed = response.status_code == 200
        passed = passed and ("room" in response.text.lower() or "meeting" in response.text.lower())
        log_test("Example 2 - Room Scheduler", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Example 2 - Room Scheduler", False, str(e))
        return False

def test_example_3():
    """Test Example 3 - Ticket Router"""
    try:
        response = requests.get(f"{BASE_URL}/examples/03-facilities-ticket-router", timeout=5)
        passed = response.status_code == 200
        passed = passed and ("ticket" in response.text.lower() or "facilities" in response.text.lower())
        log_test("Example 3 - Ticket Router", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Example 3 - Ticket Router", False, str(e))
        return False

def test_static_css():
    """Test CSS loads"""
    try:
        response = requests.get(f"{BASE_URL}/static/css/style.css", timeout=5)
        passed = response.status_code == 200
        passed = passed and "root" in response.text  # CSS variables
        log_test("CSS stylesheet loads", passed, f"Status: {response.status_code}, Size: {len(response.text)} bytes")
        return passed
    except Exception as e:
        log_test("CSS stylesheet loads", False, str(e))
        return False

def test_static_js():
    """Test JavaScript loads"""
    try:
        response = requests.get(f"{BASE_URL}/static/js/main.js", timeout=5)
        passed = response.status_code == 200
        passed = passed and "Visual Builder" in response.text
        log_test("JavaScript loads", passed, f"Status: {response.status_code}, Size: {len(response.text)} bytes")
        return passed
    except Exception as e:
        log_test("JavaScript loads", False, str(e))
        return False

def test_api_progress():
    """Test progress API"""
    try:
        response = requests.get(f"{BASE_URL}/api/progress", timeout=5)
        passed = response.status_code == 200
        data = response.json()
        passed = passed and "exercises_completed" in data
        passed = passed and "materials_viewed" in data
        log_test("Progress API", passed, f"Status: {response.status_code}, Data: {data}")
        return passed
    except Exception as e:
        log_test("Progress API", False, str(e))
        return False

def test_api_vb_status():
    """Test Visual Builder status API"""
    try:
        response = requests.get(f"{BASE_URL}/api/visual-builder-status", timeout=5)
        passed = response.status_code == 200
        data = response.json()
        passed = passed and "running" in data
        log_test("Visual Builder Status API", passed, f"Status: {response.status_code}, Running: {data.get('running')}")
        return passed
    except Exception as e:
        log_test("Visual Builder Status API", False, str(e))
        return False

def test_complete_exercise_api():
    """Test marking exercise as complete"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/complete-exercise",
            json={"exercise_name": "test-exercise"},
            timeout=5
        )
        passed = response.status_code == 200
        data = response.json()
        passed = passed and data.get("success") == True
        log_test("Complete Exercise API", passed, f"Status: {response.status_code}, Success: {data.get('success')}")
        return passed
    except Exception as e:
        log_test("Complete Exercise API", False, str(e))
        return False

def test_navigation_links():
    """Test that homepage contains navigation links"""
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        passed = response.status_code == 200

        # Check for key navigation elements
        checks = {
            "Dashboard link": "Dashboard" in response.text,
            "Guides menu": "Guides" in response.text,
            "Exercises menu": "Exercises" in response.text,
            "Examples menu": "Examples" in response.text,
            "Getting Started link": "Getting Started" in response.text
        }

        all_passed = all(checks.values())
        details = ", ".join([f"{k}: {'✓' if v else '✗'}" for k, v in checks.items()])

        log_test("Navigation elements present", all_passed, details)
        return all_passed
    except Exception as e:
        log_test("Navigation elements present", False, str(e))
        return False

def test_branding_present():
    """Test that branding elements are present"""
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        passed = response.status_code == 200

        # Check for branding elements
        checks = {
            "Organization name": "Healthcare Organization" in response.text,
            "Workshop title": "Workshop" in response.text,
            "Primary color": "--primary-color" in response.text,
            "Support email": "@" in response.text
        }

        all_passed = all(checks.values())
        details = ", ".join([f"{k}: {'✓' if v else '✗'}" for k, v in checks.items()])

        log_test("Branding elements present", all_passed, details)
        return all_passed
    except Exception as e:
        log_test("Branding elements present", False, str(e))
        return False

def run_all_tests():
    """Run all tests"""
    print("=" * 70)
    print("ADK Workshop Training Portal - User Testing")
    print("=" * 70)
    print()
    print(f"Testing portal at: {BASE_URL}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    print("-" * 70)
    print("Running tests...")
    print("-" * 70)
    print()

    # Core pages
    test_homepage()
    test_getting_started()

    # Guides
    test_visual_builder_guide()
    test_quickstart_guide()
    test_cheat_sheet()
    test_troubleshooting_guide()

    # Exercises
    test_exercise_1()
    test_exercise_2()
    test_exercise_3()

    # Examples
    test_example_1()
    test_example_2()
    test_example_3()

    # Static resources
    test_static_css()
    test_static_js()

    # APIs
    test_api_progress()
    test_api_vb_status()
    test_complete_exercise_api()

    # UI elements
    test_navigation_links()
    test_branding_present()

    # Summary
    print()
    print("=" * 70)
    print("Test Summary")
    print("=" * 70)
    print()

    total_tests = len(RESULTS)
    passed_tests = sum(1 for r in RESULTS if r["passed"])
    failed_tests = total_tests - passed_tests
    pass_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0

    print(f"Total Tests:  {total_tests}")
    print(f"Passed:       {passed_tests} ✅")
    print(f"Failed:       {failed_tests} ❌")
    print(f"Pass Rate:    {pass_rate:.1f}%")
    print()

    if failed_tests > 0:
        print("Failed tests:")
        for result in RESULTS:
            if not result["passed"]:
                print(f"  - {result['test']}: {result['details']}")
        print()

    # Save results to file
    results_file = "test_results.json"
    with open(results_file, 'w') as f:
        json.dump({
            "summary": {
                "total": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "pass_rate": pass_rate,
                "timestamp": datetime.now().isoformat()
            },
            "tests": RESULTS
        }, f, indent=2)

    print(f"Detailed results saved to: {results_file}")
    print("=" * 70)

    return passed_tests == total_tests

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
