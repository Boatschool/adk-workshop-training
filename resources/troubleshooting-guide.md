# Troubleshooting Guide for Google ADK Workshop

## Pre-Workshop Setup Verification

### Checklist

Run through this checklist before the workshop starts:

- [ ] Python 3.10+ installed
- [ ] Virtual environment created and activated
- [ ] Google ADK installed
- [ ] Google Cloud project created
- [ ] Authentication configured
- [ ] Visual Builder launches successfully
- [ ] Can run a simple test agent

---

## Common Setup Issues

### 1. Python Version Issues

**Problem:** "Python version not supported"

**Check your version:**
```bash
python3 --version
# Should show 3.10 or higher
```

**Solutions:**

**Mac:**
```bash
# Install via Homebrew
brew install python@3.11

# Use specific version
python3.11 -m venv adk-workshop
```

**Windows:**
```bash
# Download from python.org
# Use installer for Python 3.11+
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11

# CentOS/RHEL
sudo yum install python311
```

---

### 2. Virtual Environment Issues

**Problem:** "Command not found: adk"

**Cause:** Virtual environment not activated

**Solution:**
```bash
# Check if activated (you should see (adk-workshop) in prompt)
which python
# Should show: /Users/yourname/adk-workshop/bin/python

# If not, activate:
source ~/adk-workshop/bin/activate  # Mac/Linux
# or
adk-workshop\Scripts\activate       # Windows

# Verify:
pip list | grep google-adk
```

**Problem:** "Permission denied" when creating venv

**Solution:**
```bash
# Check directory permissions
ls -la ~

# Create in different location
mkdir ~/projects
cd ~/projects
python3 -m venv adk-workshop
```

---

### 3. Installation Issues

**Problem:** "Could not install google-adk"

**Check pip version:**
```bash
pip --version
# Should be 23.0 or higher

# Upgrade pip
pip install --upgrade pip
```

**Try with verbose output:**
```bash
pip install --upgrade google-adk -v
# Review error messages
```

**Common fixes:**
```bash
# Clear cache
pip cache purge

# Install with no cache
pip install --no-cache-dir google-adk

# Install specific version
pip install google-adk==1.18.0
```

**Problem:** "ERROR: Failed building wheel for X"

**Solution - Install build tools:**

**Mac:**
```bash
xcode-select --install
```

**Ubuntu/Debian:**
```bash
sudo apt install build-essential python3-dev
```

**Windows:**
```bash
# Install Microsoft C++ Build Tools
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

---

### 4. Google Cloud Authentication

**Problem:** "Could not automatically determine credentials"

**Solution 1: Application Default Credentials**
```bash
# Install gcloud CLI if needed
# Mac:
brew install google-cloud-sdk

# Then authenticate:
gcloud auth application-default login

# Set project:
gcloud config set project YOUR_PROJECT_ID
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
```

**Solution 2: Service Account Key**
```bash
# Download service account key from Cloud Console
# Save as key.json

export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

**Verify authentication:**
```bash
gcloud auth list
# Should show your account with asterisk (*)
```

**Problem:** "Permission denied" or "403 Forbidden"

**Check:**
1. Correct project ID?
2. Billing enabled on project?
3. Vertex AI API enabled?
4. Account has necessary permissions?

**Enable required APIs:**
```bash
gcloud services enable aiplatform.googleapis.com
gcloud services enable generativelanguage.googleapis.com
```

---

### 5. Visual Builder Issues

**Problem:** "Visual Builder won't load"

**Check if server is running:**
```bash
ps aux | grep adk
# Should see adk web process

# Check port
lsof -i :8000
# Should show adk process
```

**Try different port:**
```bash
adk web --port 8001
# Then open: http://localhost:8001/dev-ui
```

**Check for errors:**
```bash
adk web --verbose
# Watch for error messages
```

**Problem:** "Page loads but shows error"

**Check browser console:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

**Try different browser:**
- Chrome/Chromium (recommended)
- Firefox
- Safari (may have issues)
- Edge

**Clear browser cache:**
```bash
# Hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

### 6. Agent Runtime Issues

**Problem:** "Agent doesn't respond"

**Debug steps:**
1. Check Event Log in test console
2. Look for error messages
3. Verify model is selected
4. Check API quotas

**Enable debug logging:**
```bash
export ADK_LOG_LEVEL="DEBUG"
adk run
```

**Test minimal agent:**
```python
from google.adk.agents import Agent

test_agent = Agent(
    name="test",
    model="gemini-2.5-flash",
    instruction="Say hello"
)

# Test
print(test_agent.query("Hi"))
```

**Problem:** "Rate limit exceeded"

**Solution:**
- Wait a few minutes
- Use different model
- Check project quotas in Cloud Console
- Upgrade project tier if needed

**Problem:** "Invalid API key" or "Authentication failed"

**Solution:**
```bash
# Re-authenticate
gcloud auth application-default revoke
gcloud auth application-default login

# Verify project
gcloud config get-value project

# Set explicitly
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

---

### 7. Tool-Related Issues

**Problem:** "Tool not found" or "Tool failed to execute"

**Debug steps:**
```python
# Test tool independently
from google.adk.tools import FunctionTool

def test_tool(param: str) -> str:
    """Test tool"""
    return f"Received: {param}"

tool = FunctionTool(test_tool)

# Call directly
result = tool.function("test input")
print(result)  # Should print: Received: test input
```

**Check tool definition:**
- Has docstring?
- Type hints present?
- Returns correct type?
- Function name descriptive?

**Problem:** "Agent doesn't use tools"

**Fix instructions:**
```python
instruction = """
IMPORTANT: You have access to tools. ALWAYS use the appropriate
tool when you need information or to take action. Do not make
up information when a tool is available.

Available tools:
- search_tool: Use this to find information
- create_tool: Use this to create items
"""
```

---

### 8. Import Errors

**Problem:** "ModuleNotFoundError: No module named 'google.adk'"

**Verify installation:**
```bash
pip list | grep google-adk

# If not found, install:
pip install google-adk

# Verify Python is from venv:
which python
```

**Problem:** "ImportError: cannot import name X"

**Check ADK version:**
```bash
python -c "import google.adk; print(google.adk.__version__)"

# Upgrade if needed:
pip install --upgrade google-adk
```

---

### 9. Network Issues

**Problem:** "Connection timeout" or "Network unreachable"

**Check connectivity:**
```bash
# Test Google API access
curl https://generativelanguage.googleapis.com

# Check DNS
nslookup generativelanguage.googleapis.com
```

**Proxy issues:**
```bash
# If behind corporate proxy
export HTTP_PROXY="http://proxy.company.com:8080"
export HTTPS_PROXY="http://proxy.company.com:8080"
```

**Firewall issues:**
- Ensure ports 8000, 8080 are open
- Check corporate firewall rules
- Try from different network

---

### 10. Workshop-Specific Issues

**Problem:** "Example code doesn't work"

**Check file paths:**
```python
# Use absolute paths
import os
print(os.getcwd())  # Check current directory

# Or relative from project root
os.chdir('/Users/yourname/adk-workshop-training')
```

**Problem:** "Can't find workshop materials"

**Verify location:**
```bash
ls ~/adk-workshop-training/
# Should show: examples, exercises, resources, solutions

# If missing, check if in different location
find ~ -name "adk-workshop-training" 2>/dev/null
```

---

## Verification Script

Save this as `verify_setup.py` and run before workshop:

```python
#!/usr/bin/env python3
"""
ADK Workshop Setup Verification Script
Run this to verify your environment is ready.
"""

import sys
import os

def check_python_version():
    """Check Python version is 3.10+"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 10:
        print("✅ Python version:", f"{version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print("❌ Python version too old:", f"{version.major}.{version.minor}.{version.micro}")
        print("   Need Python 3.10 or higher")
        return False

def check_venv():
    """Check if in virtual environment"""
    in_venv = hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    )
    if in_venv:
        print("✅ Virtual environment activated")
        return True
    else:
        print("⚠️  Not in virtual environment (optional but recommended)")
        return True

def check_adk_installed():
    """Check if google-adk is installed"""
    try:
        import google.adk
        print("✅ Google ADK installed, version:", google.adk.__version__)
        return True
    except ImportError:
        print("❌ Google ADK not installed")
        print("   Run: pip install google-adk")
        return False

def check_gcloud_auth():
    """Check Google Cloud authentication"""
    project = os.environ.get('GOOGLE_CLOUD_PROJECT')
    if project:
        print("✅ GOOGLE_CLOUD_PROJECT set:", project)
        return True
    else:
        print("⚠️  GOOGLE_CLOUD_PROJECT not set")
        print("   Run: export GOOGLE_CLOUD_PROJECT='your-project-id'")
        return False

def check_credentials():
    """Check for credentials"""
    creds = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if creds:
        print("✅ GOOGLE_APPLICATION_CREDENTIALS set")
        return True
    else:
        print("⚠️  GOOGLE_APPLICATION_CREDENTIALS not set")
        print("   This is OK if using gcloud auth")
        return True

def test_simple_agent():
    """Test creating a simple agent"""
    try:
        from google.adk.agents import Agent

        agent = Agent(
            name="test_agent",
            model="gemini-2.5-flash",
            instruction="You are a test agent. Respond with 'Hello!'",
            description="Test agent for verification"
        )
        print("✅ Successfully created test agent")
        return True
    except Exception as e:
        print("❌ Failed to create test agent:", str(e))
        return False

def main():
    print("=" * 60)
    print("Google ADK Workshop Setup Verification")
    print("=" * 60)
    print()

    checks = [
        ("Python Version", check_python_version),
        ("Virtual Environment", check_venv),
        ("ADK Installation", check_adk_installed),
        ("Google Cloud Project", check_gcloud_auth),
        ("Credentials", check_credentials),
        ("Agent Creation", test_simple_agent),
    ]

    results = []
    for name, check_func in checks:
        result = check_func()
        results.append(result)
        print()

    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Verification Complete: {passed}/{total} checks passed")

    if passed == total:
        print("✅ Your environment is ready for the workshop!")
    elif passed >= total - 1:
        print("⚠️  Almost ready! Review warnings above.")
    else:
        print("❌ Setup incomplete. Please fix errors above.")

    print("=" * 60)

if __name__ == "__main__":
    main()
```

**Run verification:**
```bash
python verify_setup.py
```

---

## Getting Help

### During Workshop
1. **Raise hand** for instructor assistance
2. **Check chat** for answers to similar questions
3. **Ask neighbor** - peer support encouraged
4. **Check cheat sheet** in resources folder

### After Workshop
1. **Review documentation** - Most answers are in official docs
2. **Search GitHub issues** - Someone may have had same problem
3. **Check workshop materials** - Examples and solutions provided
4. **Contact instructor** - Email for follow-up support
5. **Community forums** - Post questions with details

### Useful Information to Include When Asking for Help
- Operating system and version
- Python version
- ADK version
- Complete error message
- What you were trying to do
- What you've already tried

### Template for Questions
```
**Environment:**
- OS: macOS 14.0
- Python: 3.11.5
- ADK: 1.18.0

**Issue:**
Visual Builder won't load

**Error Message:**
[Paste complete error]

**Steps to Reproduce:**
1. Run `adk web`
2. Open http://localhost:8000/dev-ui
3. See error

**What I've Tried:**
- Cleared browser cache
- Tried different port
- Checked with different browser
```

---

## Emergency Workarounds

If all else fails during the workshop:

### Can't use Visual Builder?
✅ Use Python code approach (all examples have code versions)

### Authentication issues?
✅ Use simulated tools that don't need API access

### Network problems?
✅ Work with pre-recorded demos and focus on concepts

### Installation problems?
✅ Pair program with someone who has working setup

### Computer issues?
✅ Follow along and work through exercises later

---

**Remember:** Technical issues happen. Don't let them discourage you from learning about AI agents!

**Last Updated:** 2024-11-18
