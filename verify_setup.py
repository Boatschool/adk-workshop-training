#!/usr/bin/env python3
"""
Google ADK Workshop Setup Verification Script

Run this script to verify your environment is ready for the workshop.

Usage:
    python verify_setup.py
"""

import os
import subprocess
import sys


def print_header(text):
    """Print formatted header"""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70 + "\n")

def print_check(passed, message):
    """Print check result"""
    icon = "✅" if passed else "❌"
    print(f"{icon} {message}")

def check_python_version():
    """Check Python version is 3.10+"""
    version = sys.version_info
    required = (3, 10)

    if version >= required:
        print_check(True, f"Python version: {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print_check(False, f"Python version: {version.major}.{version.minor}.{version.micro} (need 3.10+)")
        print("   → Install Python 3.10 or higher from python.org")
        return False

def check_venv():
    """Check if in virtual environment"""
    in_venv = hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    )

    if in_venv:
        print_check(True, f"Virtual environment: {sys.prefix}")
        return True
    else:
        print_check(False, "Not in virtual environment")
        print("   → Run: source ~/adk-workshop/bin/activate")
        return False

def check_adk_installed():
    """Check if google-adk is installed"""
    try:
        import google.adk
        version = google.adk.__version__
        print_check(True, f"Google ADK installed: v{version}")
        return True
    except ImportError:
        print_check(False, "Google ADK not installed")
        print("   → Run: pip install google-adk")
        return False
    except AttributeError:
        print_check(True, "Google ADK installed (version unknown)")
        return True

def check_gcloud_project():
    """Check Google Cloud project configuration"""
    project = os.environ.get('GOOGLE_CLOUD_PROJECT')

    if project:
        print_check(True, f"Google Cloud project: {project}")
        return True
    else:
        print_check(False, "GOOGLE_CLOUD_PROJECT not set")
        print("   → Run: export GOOGLE_CLOUD_PROJECT='your-project-id'")
        return False

def check_credentials():
    """Check for Google Cloud credentials"""
    creds_file = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')

    # Check for explicit credentials file
    if creds_file:
        if os.path.exists(creds_file):
            print_check(True, f"Service account key: {creds_file}")
            return True
        else:
            print_check(False, f"Credentials file not found: {creds_file}")
            return False

    # Check for gcloud CLI
    try:
        result = subprocess.run(
            ['gcloud', 'auth', 'list', '--filter=status:ACTIVE', '--format=value(account)'],
            capture_output=True,
            text=True,
            timeout=5
        )

        if result.returncode == 0 and result.stdout.strip():
            account = result.stdout.strip().split('\n')[0]
            print_check(True, f"Application default credentials: {account}")
            return True
        else:
            print_check(False, "No active gcloud authentication")
            print("   → Run: gcloud auth application-default login")
            return False
    except (FileNotFoundError, subprocess.TimeoutExpired):
        print_check(False, "gcloud CLI not found or not responding")
        print("   → Install gcloud CLI or set GOOGLE_APPLICATION_CREDENTIALS")
        return False

def check_network():
    """Check network connectivity to Google APIs"""
    try:
        import urllib.request
        urllib.request.urlopen('https://generativelanguage.googleapis.com', timeout=5)
        print_check(True, "Network connectivity to Google APIs")
        return True
    except Exception as e:
        print_check(False, f"Cannot reach Google APIs: {str(e)}")
        print("   → Check internet connection and firewall settings")
        return False

def test_agent_creation():
    """Test creating a simple agent"""
    try:
        from google.adk.agents import Agent

        agent = Agent(
            name="verification_test",
            model="gemini-2.5-flash",
            instruction="You are a test agent for setup verification.",
            description="Test agent"
        )
        print_check(True, "Successfully created test agent")
        return True
    except Exception as e:
        print_check(False, f"Failed to create test agent: {str(e)}")
        print(f"   → Error details: {e.__class__.__name__}")
        return False

def test_web_server():
    """Check if Visual Builder can start"""
    try:
        import socket

        # Check if port 8000 is available
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', 8000))
        sock.close()

        if result == 0:
            print_check(False, "Port 8000 already in use (Visual Builder may be running)")
            print("   → This is OK if you already have it running")
            print("   → Otherwise run: lsof -i :8000 to find what's using it")
            return True
        else:
            print_check(True, "Port 8000 available for Visual Builder")
            return True
    except Exception as e:
        print_check(False, f"Cannot check port availability: {str(e)}")
        return False

def check_workshop_materials():
    """Verify workshop materials are present"""
    current_dir = os.path.dirname(os.path.abspath(__file__))

    required_dirs = ['examples', 'exercises', 'resources', 'solutions']
    all_present = True

    for dir_name in required_dirs:
        dir_path = os.path.join(current_dir, dir_name)
        if os.path.isdir(dir_path):
            print_check(True, f"Workshop materials: {dir_name}/ found")
        else:
            print_check(False, f"Workshop materials: {dir_name}/ missing")
            all_present = False

    return all_present

def main():
    """Run all verification checks"""
    print_header("Google ADK Workshop Setup Verification")

    print("This script will verify that your environment is ready for the workshop.\n")

    # Define all checks
    checks = [
        ("Python Version", check_python_version),
        ("Virtual Environment", check_venv),
        ("ADK Installation", check_adk_installed),
        ("Google Cloud Project", check_gcloud_project),
        ("Authentication", check_credentials),
        ("Network Connectivity", check_network),
        ("Workshop Materials", check_workshop_materials),
        ("Agent Creation", test_agent_creation),
        ("Web Server Port", test_web_server),
    ]

    # Run checks
    results = {}
    for name, check_func in checks:
        try:
            result = check_func()
            results[name] = result
        except Exception as e:
            print_check(False, f"{name}: Unexpected error - {str(e)}")
            results[name] = False

    # Print summary
    print_header("Verification Summary")

    passed = sum(results.values())
    total = len(results)
    percentage = (passed / total) * 100

    print(f"Checks passed: {passed}/{total} ({percentage:.0f}%)\n")

    # Categorize results
    critical = ["Python Version", "ADK Installation", "Google Cloud Project", "Authentication"]
    critical_passed = all(results.get(check, False) for check in critical)

    if passed == total:
        print("🎉 Excellent! Your environment is fully ready for the workshop!")
        print("\nNext steps:")
        print("  1. Keep your virtual environment activated")
        print("  2. Launch Visual Builder: adk web")
        print("  3. Open http://localhost:8000/dev-ui in your browser")
        print("  4. See you at the workshop!")
    elif critical_passed:
        print("✅ Good! Core requirements are met.")
        print("\nYou can participate in the workshop, but consider fixing the warnings above")
        print("for the best experience.")
        print("\nNext steps:")
        print("  1. Review any warnings above")
        print("  2. Launch Visual Builder: adk web")
        print("  3. Open http://localhost:8000/dev-ui")
    else:
        print("⚠️  Setup incomplete. Please fix critical issues above.")
        print("\nRequired for workshop:")
        for check in critical:
            if not results.get(check, False):
                print(f"  ❌ {check}")

        print("\nPlease:")
        print("  1. Fix the issues marked with ❌ above")
        print("  2. Run this script again: python verify_setup.py")
        print("  3. Contact the instructor if you need help")

    print_header("Additional Information")

    print("📚 Resources:")
    print("   • Quickstart Guide: resources/quickstart-guide.md")
    print("   • Visual Builder Guide: resources/visual-agent-builder-guide.md")
    print("   • Troubleshooting: resources/troubleshooting-guide.md")
    print("   • Cheat Sheet: resources/cheat-sheet.md")

    print("\n💡 Need Help?")
    print("   • Check the troubleshooting guide")
    print("   • Contact workshop instructor")
    print("   • Review setup instructions in README.md")

    print("\n" + "=" * 70 + "\n")

    # Exit code based on critical checks
    sys.exit(0 if critical_passed else 1)

if __name__ == "__main__":
    main()
