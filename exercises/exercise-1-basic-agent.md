# Exercise 1: Build Your First Agent

**Difficulty:** Beginner
**Time:** 30 minutes
**Method:** Visual Agent Builder

## Learning Objectives

By the end of this exercise, you will:
- Launch the Visual Agent Builder
- Create a simple agent using the visual interface
- Configure agent instructions and model
- Test your agent
- Export the configuration

## Scenario

You work in the HR department of a hospital. You need to create an agent that helps new employees understand the onboarding process. The agent should be able to answer questions about:
- First day logistics (where to go, what to bring)
- Required training courses
- How to set up email and system access
- Who to contact for questions

## Prerequisites

1. Virtual environment activated: `source ~/adk-workshop/bin/activate`
2. Google ADK installed: `pip install google-adk`

## Instructions

### Part 1: Launch Visual Builder (5 min)

1. Open your terminal
2. Run: `adk web`
3. Open browser to: `http://localhost:8000/dev-ui`
4. You should see the Visual Agent Builder interface

**Checkpoint:** Can you see the canvas, agent library, and configuration panel?

### Part 2: Create Agent (10 min)

**Using AI Assistant Method:**

1. Click the **"New Agent"** button
2. Click **"AI Assistant"** in the configuration panel
3. Type this prompt:
   ```
   Create an onboarding assistant agent for new hospital employees.
   It should answer questions about first day logistics, required training,
   system access setup, and who to contact for help. Use a friendly,
   welcoming tone.
   ```
4. Review the generated configuration
5. Name your agent: `onboarding_assistant`

**OR Manual Method:**

1. Click **"New Agent"**
2. Fill in the configuration:
   - **Name:** `onboarding_assistant`
   - **Model:** `gemini-2.5-flash`
   - **Instructions:** (see below)

**Agent Instructions (if doing manual):**
```
You are a friendly onboarding assistant for new employees at a healthcare organization.

You help new hires understand their first day and onboarding process:

FIRST DAY:
- Report to Main Lobby at 8:00 AM on your start date
- Bring: Photo ID, completed new hire paperwork, direct deposit form
- You'll receive your badge, parking pass, and welcome packet
- Orientation runs 8 AM - 12 PM in Training Center

REQUIRED TRAINING:
- HIPAA Privacy Training (online, 1 hour) - must complete in first 3 days
- Fire Safety (online, 30 min) - first week
- Infection Control (online, 45 min) - first week
- Department-specific training - scheduled by your manager

SYSTEM ACCESS:
- Email: Set up during orientation, username is first.last@hospital.example.com
- Workday: HR will create account, you'll receive setup email
- Building access badge: Activated during orientation
- Computer login: IT will assist on first day

CONTACTS:
- HR Main: ext. 5000 or hr@hospital.example.com
- IT Help Desk: ext. 5555 or helpdesk@hospital.example.com
- Your manager: Contact info provided in welcome email
- Onboarding buddy: Assigned during orientation

Be welcoming, clear, and helpful. If you don't know something, direct them to HR.
```

**Checkpoint:** Is your agent configuration complete?

### Part 3: Test Your Agent (10 min)

1. Click the **"Test"** tab at the bottom of the screen
2. Try these test questions:

**Test Question 1:**
```
What time should I arrive on my first day?
```
**Expected:** Should mention 8:00 AM, Main Lobby

**Test Question 2:**
```
What training do I need to complete?
```
**Expected:** Should list HIPAA, Fire Safety, Infection Control, and department training

**Test Question 3:**
```
I forgot to bring my completed paperwork. What should I do?
```
**Expected:** Should suggest contacting HR (might not have specific answer, should redirect appropriately)

**Test Question 4:**
```
How do I get my email set up?
```
**Expected:** Should mention it's set up during orientation

**Review the Event Log:**
- Click "Events" tab in test console
- See how the agent processes each question
- Note: token usage, response time

**Checkpoint:** Does your agent answer all questions appropriately?

### Part 4: Refine (Optional - 5 min)

If any answers weren't quite right:
1. Click on your agent in the canvas
2. Edit the instructions in the right panel
3. Click "Save"
4. Re-test the questions

**Tips for better instructions:**
- Be more specific
- Add examples
- Include edge cases
- Specify tone clearly

### Part 5: Export (5 min)

1. Click the **"Export"** button (top right)
2. Choose export format:
   - **YAML** - for version control and deployment
   - **Python** - to see the code equivalent
3. Save both formats:
   - `onboarding_assistant.yaml`
   - `onboarding_assistant.py`

**Checkpoint:** Do you have both exported files?

## Deliverables

At the end of this exercise, you should have:
- ✅ Running Visual Agent Builder
- ✅ Functioning onboarding assistant agent
- ✅ Tested with multiple questions
- ✅ Exported YAML and Python files

## Bonus Challenges

If you finish early:

1. **Add personality:** Make the agent more welcoming with specific phrases
2. **Add structure:** Format responses with bullet points or numbered lists
3. **Add FAQ:** Include answers to other common new hire questions
4. **Multiple languages:** Make the agent bilingual (English/Spanish)

## Common Issues

**Problem:** Visual Builder won't load
**Solution:** Check that `adk web` is running, try `http://localhost:8000/dev-ui`

**Problem:** Agent gives generic answers
**Solution:** Instructions might be too vague - add more specific information

**Problem:** Can't export
**Solution:** Save the configuration first, then try export again

## Discussion Questions

1. How would you improve this agent based on your testing?
2. What other onboarding tasks could an agent help with?
3. How could you keep the information up-to-date as policies change?
4. What safety measures would you add before deploying to real employees?

## Next Steps

Once complete, move to **Exercise 2: Adding Tools to Agents**

---

**Need Help?**
- Check the Visual Builder Guide in `/resources`
- Ask your instructor
- Review sample agents in `/examples`
