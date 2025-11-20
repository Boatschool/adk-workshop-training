# Google ADK Workshop Training
## Building AI Agents for Healthcare Non-Clinical Use Cases

Welcome to the Google Agent Development Kit (ADK) workshop! This comprehensive training program is designed for healthcare professionals who want to build AI agents for **non-clinical use cases** using Google's Visual Agent Builder.

**Important:** This workshop focuses exclusively on administrative, operational, and support use cases. We will **NOT** process any PHI (Protected Health Information) or PII (Personally Identifiable Information).

## Who This Is For

- **Healthcare administrators** looking to automate routine tasks
- **IT and operations staff** managing facilities and resources
- **HR and training professionals** streamlining employee processes
- **Communications teams** creating content and managing announcements
- **Anyone interested in AI agents** with novice to intermediate technical skills

No extensive coding experience required - we'll use the Visual Agent Builder!

## What You'll Learn

By the end of this workshop, you will be able to:
- ✅ Understand what AI agents are and when to use them
- ✅ Build agents using Google's Visual Agent Builder (no-code/low-code)
- ✅ Create custom tools to extend agent capabilities
- ✅ Design multi-agent systems for complex workflows
- ✅ Test, debug, and deploy agents to production
- ✅ Identify automation opportunities in your department

## Workshop Structure

```
adk-workshop-training/
├── README.md                    # You are here!
├── WORKSHOP_AGENDA.md          # Detailed workshop schedules
├── verify_setup.py             # Setup verification script
├── examples/                   # Sample agents
│   ├── 01-simple-faq-agent.py
│   ├── 02-meeting-room-scheduler.py
│   └── 03-facilities-ticket-router.py
├── exercises/                  # Hands-on exercises
│   ├── exercise-1-basic-agent.md
│   ├── exercise-2-agents-with-tools.md
│   └── exercise-3-multi-agent-systems.md
├── solutions/                  # Exercise solutions (coming)
├── resources/                  # Guides and references
│   ├── quickstart-guide.md
│   ├── visual-agent-builder-guide.md
│   ├── troubleshooting-guide.md
│   └── cheat-sheet.md
└── frontend/                   # Web UI setup (optional)
```

## Quick Start (Pre-Workshop)

**Before the workshop, please complete these steps:**

### 1. Setup Google API Key

Create a `.env` file in the workshop directory:

```bash
# Navigate to workshop directory
cd ~/adk-workshop-training

# Create .env file with your Google API key
echo "GOOGLE_API_KEY=your-api-key-here" > .env
```

See **google_api_setup_guide.md** for detailed instructions on obtaining your API key.

### 2. Install Dependencies

```bash
# Create and activate virtual environment (if not already created)
python3 -m venv ~/adk-workshop
source ~/adk-workshop/bin/activate

# Install required packages
pip install google-adk flask markdown python-dotenv
```

### 3. Launch the Training Portal

```bash
# Launch the training portal (it will auto-load your .env file)
python training_portal.py
```

**The portal will automatically open at http://localhost:5001**

Features:
- 🚀 **One-click Visual Builder launch** (with stop/restart functionality!)
- 🔑 **Automatic API key loading from .env**
- 📚 **Browse all materials in clean HTML**
- ✅ **Track your progress**
- 🎨 **Customizable branding**
- ⌨️ **Keyboard shortcuts**

See **PORTAL_README.md** for customization and branding options.

### 4. Alternative: Use Shell Scripts

If you prefer command-line tools, we've included helper scripts:

```bash
# Start Visual Builder manually
./start_visual_builder.sh

# Stop Visual Builder
./stop_visual_builder.sh

# Restart Visual Builder
./restart_visual_builder.sh
```

### 5. Verify Your Setup

```bash
# Run verification script
python verify_setup.py
```

This will check:
- ✅ Python version (3.10+ required)
- ✅ Virtual environment
- ✅ Google ADK installation
- ✅ Google API key configuration
- ✅ Workshop materials

---

## Detailed Setup Instructions

### 1. Create Virtual Environment

```bash
cd /Users/ronwince
python3 -m venv adk-workshop
source adk-workshop/bin/activate
```

### 2. Install Google ADK

```bash
pip install google-adk
```

Verify installation:
```bash
python -c "import google.adk; print(f'Google ADK version: {google.adk.__version__}')"
```

### 3. Set Up Web UI (Optional but Recommended)

The ADK includes a built-in web interface for visual debugging and testing.

**Option A: Simple Command (if available)**
```bash
adk web
```

**Option B: Full Setup**
```bash
# Install adk-web dependencies
cd adk-workshop-training/frontend
# Clone adk-web if needed
git clone https://github.com/google/adk-web.git .
sudo npm install

# Terminal 1: Start the web interface
npm run serve --backend=http://localhost:8000

# Terminal 2: Start the API server
adk api_server --allow_origins=http://localhost:4200 --host=0.0.0.0

# Access at: http://localhost:4200
```

### 4. Configure Google Cloud Authentication

```bash
# Set your project ID
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Authenticate
gcloud auth application-default login
```

## Healthcare Use Case Examples (Non-Clinical Only)

### ✅ Safe for Workshop
These use cases do NOT involve PHI/PII:

**Administrative & HR:**
- Employee onboarding assistant (no personal data)
- Benefits FAQ chatbot
- Meeting room scheduler
- PTO policy explainer
- Training course enrollment

**Facilities & Operations:**
- Maintenance request routing
- Equipment scheduling
- Supply ordering assistant
- Conference room booking
- Parking pass requests

**Communications:**
- Internal newsletter generator
- Announcement writer
- Event planning assistant
- FAQ content creator

**IT Support:**
- Help desk ticket routing
- Software request handler
- Account setup workflows (no credentials)
- Knowledge base search

### ❌ Out of Scope for This Workshop
These would involve PHI/PII and are NOT covered:

- Patient scheduling or records
- Clinical documentation
- Medical histories or diagnoses
- Prescription management
- Billing with patient information
- Employee personal data processing

---

## Sample Agents Included

### 1. HR FAQ Agent (`examples/01-simple-faq-agent.py`)
Answers common employee questions about:
- Benefits enrollment periods
- Time off policies
- Payroll schedules
- Employee resources

**Perfect for:** Learning basic agent creation

### 2. Meeting Room Scheduler (`examples/02-meeting-room-scheduler.py`)
Helps staff find and book conference rooms:
- Search by capacity and features
- Check availability
- Book rooms
- Get directions

**Perfect for:** Learning about tools and functions

### 3. Facilities Ticket Router (`examples/03-facilities-ticket-router.py`)
Multi-agent system that:
- Gathers maintenance request details
- Categorizes and prioritizes issues
- Routes to appropriate department
- Provides ticket tracking

**Perfect for:** Learning multi-agent coordination

---

## Quick Start: Your First Agent

### Option 1: Visual Agent Builder (Recommended)

```bash
# Start the Visual Builder
adk web

# Open browser to: http://localhost:8000/dev-ui
# Follow the visual guide in resources/visual-agent-builder-guide.md
```

### Option 2: Python Code

Create a simple agent in Python:

```python
from google.adk.agents import Agent
from google.adk.tools import google_search

# Define your agent
root_agent = Agent(
    name="search_assistant",
    model="gemini-2.5-flash",
    instruction="You are a helpful assistant. Answer user questions using Google Search when needed.",
    description="An assistant that can search the web.",
    tools=[google_search]
)

# Run the agent
if __name__ == "__main__":
    root_agent.run()
```

## Testing Your Agents

ADK provides multiple ways to interact with your agents:

1. **CLI**: `adk run` - Quick command-line testing
2. **Web UI**: Visual interface with debugging tools
3. **API Server**: REST API for integration
4. **Programmatic**: Direct Python API calls

## Workshop Formats

We offer flexible workshop formats to suit your needs:

### Half-Day Workshop (4 hours)
- Introduction and Visual Builder basics
- Exercise 1: Build your first agent
- Exercise 2: Adding tools
- Multi-agent demo and Q&A

### Full-Day Workshop (6-7 hours)
- All half-day content PLUS:
- Exercise 3: Build multi-agent system
- Production deployment strategies
- Custom use case development
- Extended Q&A and office hours

### Self-Paced Learning
- Work through materials at your own pace
- All exercises include detailed instructions
- Join optional weekly office hours
- Community support via Slack/Discord

See **WORKSHOP_AGENDA.md** for detailed schedules.

## Resources

- **Official Documentation**: https://google.github.io/adk-docs/
- **GitHub Repository**: https://github.com/google/adk-python
- **Sample Applications**: https://github.com/google/adk-samples
- **Community Contributions**: https://github.com/google/adk-python-community

## Getting Help

### Before the Workshop
- 📧 Email instructor with setup issues
- 📖 Check `resources/troubleshooting-guide.md`
- 🔧 Run `python verify_setup.py` to diagnose issues

### During the Workshop
- 🙋 Raise your hand for instructor assistance
- 💬 Use workshop chat for questions
- 👥 Pair programming encouraged
- 📚 Reference materials in `resources/`

### After the Workshop
- 📖 Review workshop materials (you keep everything!)
- 🏢 Office hours: [Schedule TBD]
- 💬 Community: [Slack/Discord TBD]
- 📧 Email for follow-up questions

## Key Workshop Materials

| Resource | Description | Best For |
|----------|-------------|----------|
| **visual-agent-builder-guide.md** | Complete Visual Builder tutorial | Main workshop guide |
| **cheat-sheet.md** | Quick reference | Keep handy during exercises |
| **quickstart-guide.md** | ADK basics and concepts | Understanding fundamentals |
| **troubleshooting-guide.md** | Common issues and fixes | When things don't work |
| **WORKSHOP_AGENDA.md** | Detailed schedules | Planning and pacing |

## Next Steps

### Pre-Workshop Checklist
- [ ] Run `python verify_setup.py`
- [ ] Fix any issues identified
- [ ] Review `resources/quickstart-guide.md`
- [ ] Skim `resources/visual-agent-builder-guide.md`
- [ ] Think about automation ideas in your work

### Workshop Day
- [ ] Activate virtual environment
- [ ] Launch Visual Builder (`adk web`)
- [ ] Have cheat sheet handy
- [ ] Bring questions and use case ideas

### Post-Workshop
- [ ] Complete any unfinished exercises
- [ ] Build your own custom agent
- [ ] Share with your team
- [ ] Identify deployment opportunities
- [ ] Provide feedback to improve workshop

## Success Stories (Use Case Ideas)

**What could you build after this workshop?**

- **HR Department:** Automated onboarding assistant saved 5 hours/week
- **Facilities Team:** Maintenance ticket routing reduced response time by 40%
- **Training Dept:** Course enrollment bot handled 80% of routine requests
- **Communications:** Newsletter creation time cut from 4 hours to 30 minutes
- **IT Support:** Help desk agent resolved 60% of Tier 1 tickets automatically

**What will YOU build?**

## Additional Resources

### Official Documentation
- **ADK Docs:** https://google.github.io/adk-docs/
- **API Reference:** https://google.github.io/adk-docs/api/
- **Tool Catalog:** https://google.github.io/adk-docs/components/tools/

### Code & Examples
- **GitHub:** https://github.com/google/adk-python
- **Samples:** https://github.com/google/adk-samples
- **Community:** https://github.com/google/adk-python-community

### Tutorials & Guides
- **Visual Builder Tutorial:** https://www.datacamp.com/tutorial/google-adk-visual-agent-builder-tutorial-with-demo-project
- **Google Developers Blog:** https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/
- **Medium Articles:** Search "Google ADK Visual Agent Builder"

## Feedback

We want to hear from you!

- **What worked well?**
- **What was challenging?**
- **What topics need more coverage?**
- **What use cases would you like to see?**
- **How can we improve the workshop?**

Your feedback helps us create better training for future participants.

## License & Attribution

These workshop materials are provided for educational purposes. Google ADK is open-source and maintained by Google. See the official repository for licensing details.

---

**Ready to build AI agents? Let's get started!**

Questions? Contact: [Your workshop instructor email]

Version 1.0 | Last Updated: 2024-11-18
