# Getting Started with ADK Workshop

Welcome! This guide will get you up and running in 10 minutes.

## Step 1: Verify Your Environment (2 minutes)

```bash
cd ~/adk-workshop-training
python verify_setup.py
```

If you see "Your environment is ready for the workshop!" - you're all set!

If not, continue to Step 2.

---

## Step 2: Setup (If Needed) (5 minutes)

### Create Virtual Environment
```bash
cd ~
python3 -m venv adk-workshop
source adk-workshop/bin/activate
```

### Install Google ADK
```bash
pip install google-adk
```

### Configure Google Cloud
```bash
# Set your project ID
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Authenticate
gcloud auth application-default login
```

### Verify Again
```bash
cd ~/adk-workshop-training
python verify_setup.py
```

---

## Step 3: Try Visual Agent Builder (3 minutes)

```bash
# Make sure virtual environment is activated
source ~/adk-workshop/bin/activate

# Start Visual Builder
adk web

# Open browser to: http://localhost:8000/dev-ui
```

You should see the Visual Agent Builder interface!

---

## Step 4: Run a Sample Agent (2 minutes)

In a new terminal:

```bash
# Activate virtual environment
source ~/adk-workshop/bin/activate

# Navigate to examples
cd ~/adk-workshop-training/examples

# Run the FAQ agent
python 01-simple-faq-agent.py
```

Try asking: "When is open enrollment?"

---

## Quick Reference

### Essential Commands

```bash
# Activate virtual environment (do this first!)
source ~/adk-workshop/bin/activate

# Start Visual Builder
adk web

# Run verification
python verify_setup.py

# Run example agent
python examples/01-simple-faq-agent.py
```

### Key Files to Review Before Workshop

1. **resources/visual-agent-builder-guide.md** - Visual Builder tutorial (20 min read)
2. **resources/cheat-sheet.md** - Quick reference (5 min read)
3. **WORKSHOP_AGENDA.md** - Workshop schedule (5 min read)

### Troubleshooting

**Can't activate virtual environment?**
```bash
# Check if it exists
ls ~/adk-workshop/bin/activate

# If not, create it
python3 -m venv ~/adk-workshop
```

**Import errors?**
```bash
# Check ADK is installed
pip list | grep google-adk

# If not, install
pip install google-adk
```

**Authentication errors?**
```bash
# Make sure project is set
echo $GOOGLE_CLOUD_PROJECT

# If empty, set it
export GOOGLE_CLOUD_PROJECT="your-project-id"

# Re-authenticate
gcloud auth application-default login
```

**Visual Builder won't load?**
```bash
# Check if port 8000 is in use
lsof -i :8000

# Try different port
adk web --port 8001
# Then open: http://localhost:8001/dev-ui
```

For more help, see **resources/troubleshooting-guide.md**

---

## What to Expect in the Workshop

### Half-Day (4 hours)
1. **Introduction** (30 min) - What are AI agents?
2. **Visual Builder Tutorial** (45 min) - Hands-on walkthrough
3. **Exercise 1** (60 min) - Build your first agent
4. **Exercise 2** (60 min) - Add tools to agents
5. **Wrap-up** (15 min) - Q&A and next steps

### Full-Day (6-7 hours)
All of above PLUS:
- **Lunch & Networking** (60 min)
- **Exercise 3** (90 min) - Multi-agent systems
- **Production Deployment** (45 min)
- **Custom Use Cases** (30 min)
- **Extended Q&A** (30 min)

---

## Pre-Workshop Checklist

Before the workshop day:

- [ ] Environment verified (`python verify_setup.py` passes)
- [ ] Visual Builder launches successfully
- [ ] Reviewed Visual Builder guide
- [ ] Skimmed cheat sheet
- [ ] Thought about use cases in your work
- [ ] Prepared questions for instructor

---

## During the Workshop

### What to Bring
- Laptop with setup completed
- Ideas for automation in your department
- Questions about AI agents
- Enthusiasm to learn!

### Workshop Etiquette
- Raise hand for questions
- Use chat for technical issues
- Help your neighbor if you finish early
- Experiment and have fun!

### Materials Available
- Cheat sheet (keep handy!)
- Troubleshooting guide
- Sample agents for reference
- Exercise instructions

---

## After the Workshop

### Continue Learning
1. Complete any unfinished exercises
2. Build your own custom agent
3. Explore official ADK documentation
4. Join community forums
5. Share what you build!

### Getting Help Post-Workshop
- Review troubleshooting guide
- Check official documentation
- Post in community forums
- Email instructor for follow-up
- Attend office hours (if available)

### Share Your Success
Built something cool? We'd love to hear about it!
- Share in community
- Present to your team
- Submit to showcase (if available)

---

## Healthcare Use Cases to Consider

Think about these areas in your work:

**What takes too much time?**
- Answering the same questions repeatedly?
- Routing requests to the right department?
- Scheduling meetings or resources?
- Creating routine communications?

**What could be automated?**
- FAQs and policy questions
- Form routing and categorization
- Calendar and resource booking
- Content generation
- Data collection and summaries

**What frustrates your team?**
- Difficulty finding information?
- Waiting for approvals?
- Manual data entry?
- Inconsistent processes?

These are perfect candidates for AI agents!

---

## Quick Tips for Success

💡 **Start Simple**
Don't try to build everything at once. Start with one small use case.

💡 **Test Frequently**
Test your agent after each change. Don't wait until the end.

💡 **Use the Visual Builder**
It's designed for accessibility. Don't feel you need to write code.

💡 **Ask Questions**
No question is too basic. The instructor is here to help!

💡 **Learn by Doing**
The exercises are designed for hands-on learning. Do them!

💡 **Help Others**
Teaching reinforces learning. Help your neighbor when you can.

💡 **Have Fun**
AI agents are exciting! Enjoy exploring what's possible.

---

## Common First-Day Questions

**Q: Do I need to know Python?**
A: No! The Visual Builder is no-code. Python is optional for advanced customization.

**Q: Will we process patient data?**
A: No! All examples are non-clinical, administrative use cases only.

**Q: Can I use this at my organization?**
A: Yes! Google ADK is open-source and free to use.

**Q: What if I get stuck?**
A: Raise your hand, check the cheat sheet, or ask your neighbor. We're all learning together!

**Q: Can I get the materials after the workshop?**
A: Yes! You keep all materials and can reference them anytime.

**Q: What if I miss part of the workshop?**
A: All exercises have detailed written instructions. You can catch up or work through them later.

---

## Resources at Your Fingertips

| Need | Resource | Location |
|------|----------|----------|
| Quick command reference | Cheat Sheet | `resources/cheat-sheet.md` |
| Visual Builder help | VB Guide | `resources/visual-agent-builder-guide.md` |
| Setup issues | Troubleshooting | `resources/troubleshooting-guide.md` |
| ADK basics | Quickstart | `resources/quickstart-guide.md` |
| Workshop schedule | Agenda | `WORKSHOP_AGENDA.md` |
| Working examples | Sample Agents | `examples/` directory |
| Hands-on practice | Exercises | `exercises/` directory |

---

## Final Checklist

Right before the workshop:

- [ ] Virtual environment activated
- [ ] Visual Builder working (`adk web`)
- [ ] Cheat sheet accessible
- [ ] Workshop materials open
- [ ] Notebook for notes
- [ ] Ready to learn!

---

**You're Ready!**

See you at the workshop. Let's build some AI agents!

Questions? Contact your workshop instructor.

---

**Version 1.0** | Last Updated: 2024-11-18
