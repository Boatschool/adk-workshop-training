# GraymatterLab Ecosystem

## Overview

The GraymatterLab Ecosystem provides a complete learning-to-production pipeline for AI agent development, powered by Google's Agent Development Kit (ADK). Our three interconnected platforms guide you from beginner to production deployment.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GraymatterLab Ecosystem                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. LEARN                    2. PRACTICE                3. BUILD           │
│   ─────────────────          ─────────────────          ─────────────────   │
│   ADK Training Portal   →    ADK Visual Builder    →    GraymatterStudio    │
│   (This Platform)            (Google's Tool)            (Production)        │
│                                                                              │
│   • Courses                  • Local sandbox            • Multi-tenant      │
│   • Exercises                • Experiment               • Production agents │
│   • Progress tracking        • Learn by doing           • Enterprise features│
│   • Certificates             • Export configs           • Team collaboration │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Platform Details

### 1. ADK Training Portal (This Platform)

**Purpose:** Structured learning environment for mastering AI agent development

**What You'll Learn:**
- Fundamentals of Google's Agent Development Kit (ADK)
- Agent architecture: prompts, tools, memory, routing
- Building conversational agents with LangChain integration
- Testing and debugging agent behaviors
- Best practices for production-ready agents

**Key Features:**
- **Interactive Workshops:** Hands-on courses with step-by-step exercises
- **Progress Tracking:** Monitor your learning journey with achievements and badges
- **Code Examples:** Ready-to-run agent templates and patterns
- **Integrated Documentation:** Quick reference guides and API documentation
- **Setup Wizard:** Guided installation of local development environment

**Who It's For:**
- Developers new to AI agents
- Teams learning ADK together
- Organizations building internal agent capabilities
- Students exploring conversational AI

**Access:** Cloud-hosted web application (no installation required)

---

### 2. ADK Visual Builder (Local Development)

**Purpose:** Visual interface for building and testing agents locally

**What It Is:**
The Visual Builder is Google's official web-based interface for ADK development. It runs locally on your machine, providing a sandbox environment for experimentation.

**Key Features:**
- **Visual Agent Designer:** Drag-and-drop interface for agent configuration
- **Live Testing:** Test your agents in real-time with interactive chat
- **Tool Configuration:** Visually configure agent tools and capabilities
- **Prompt Engineering:** Iterate on system prompts with instant feedback
- **Export/Import:** Save agent configurations as JSON files
- **Debug Console:** Inspect agent decision-making and tool usage

**Setup:**
```bash
# Install Google ADK
pip install google-adk

# Set your Google API Key
export GOOGLE_API_KEY=your_key_here

# Launch Visual Builder
adk web

# Access at http://localhost:8000/dev-ui
```

**When to Use:**
- Experimenting with new agent ideas
- Prototyping before production deployment
- Learning agent patterns hands-on
- Debugging agent behavior
- Practicing workshop exercises locally

**Integration with Training Portal:**
- Exercises include "Try in Visual Builder" links
- Workshop examples can be imported directly
- Settings page lets you configure your local URL
- Auto-detection shows when your builder is running

---

### 3. GraymatterStudio (Production Platform)

**Purpose:** Enterprise-grade platform for deploying production AI agents

**What It Is:**
GraymatterStudio is GraymatterLab's flagship product for building, deploying, and managing production AI agents at scale. It's a multi-tenant SaaS platform with enterprise features.

**Key Features:**
- **Multi-Tenant Architecture:** Isolated environments for healthcare organizations
- **Production Deployment:** Deploy agents to Google Cloud Run with one click
- **Team Collaboration:** Share agents, templates, and configurations across teams
- **Version Control:** Track agent versions and rollback when needed
- **Analytics & Monitoring:** Real-time metrics, usage tracking, error monitoring
- **Enterprise Security:** SSO, RBAC, audit logs, HIPAA compliance
- **API Access:** RESTful API for programmatic agent management
- **Template Library:** Pre-built healthcare agent templates

**Healthcare-Focused:**
- Medical record summarization agents
- Patient communication automation
- Clinical documentation assistants
- Appointment scheduling bots
- Insurance verification agents
- Non-clinical workflow automation

**When to Use:**
- Deploying agents to production
- Building agents for healthcare organizations
- Managing multiple agents across teams
- Enterprise-grade security and compliance requirements
- Integration with existing healthcare systems

**Migration Path:**
1. Learn agent fundamentals on Training Portal
2. Build and test prototypes in Visual Builder
3. Export agent configs from Visual Builder
4. Import to GraymatterStudio
5. Configure production settings (auth, integrations)
6. Deploy to production environment
7. Monitor usage and iterate

**Access:**
- Contact GraymatterLab for enterprise licensing
- Free tier available for evaluation
- URL: `https://studio.graymatterlab.ai` (coming soon)

---

## Learning Journey

### Beginner Path (0-2 weeks)

**Start Here:** ADK Training Portal

1. **Complete Setup Wizard** (30 minutes)
   - Install Python and ADK
   - Configure Google API Key
   - Launch Visual Builder locally
   - Verify environment

2. **Take Foundational Workshop** (2-4 hours)
   - "Introduction to AI Agents"
   - "Your First ADK Agent"
   - "Understanding Agent Architecture"

3. **Practice in Visual Builder** (1-2 hours)
   - Import workshop examples
   - Modify prompts and tools
   - Test agent responses
   - Experiment with configurations

**Achievement:** Earn "Environment Setup" and "First Steps" badges

---

### Intermediate Path (2-4 weeks)

**Continue Learning:**

4. **Advanced Workshops** (4-8 hours)
   - "Multi-Agent Systems"
   - "Custom Tool Development"
   - "Agent Memory and State"
   - "Testing and Debugging"

5. **Build Your Own Agents** (4-8 hours)
   - Design agents for your use case
   - Implement custom tools
   - Refine prompts iteratively
   - Test edge cases

6. **Export and Refine** (2-4 hours)
   - Export configs from Visual Builder
   - Review JSON structure
   - Understand configuration options
   - Document your agent

**Achievement:** Earn "Workshop Graduate" and "Visual Builder Master" badges

---

### Production Path (1-2 months)

**Graduate to GraymatterStudio:**

7. **Studio Onboarding** (1-2 hours)
   - Create Studio account
   - Configure team and permissions
   - Import your first agent
   - Set up production environment

8. **Production Deployment** (2-4 hours)
   - Configure authentication
   - Set up integrations
   - Deploy to Cloud Run
   - Test production endpoint

9. **Monitoring and Iteration** (Ongoing)
   - Monitor agent performance
   - Analyze user interactions
   - Refine based on feedback
   - Version and update agents

**Outcome:** Production-ready agents serving real users

---

## Common Workflows

### Workflow 1: Solo Developer Learning

```
Training Portal → Visual Builder → Personal Projects
```

**Use Case:** Developer learning ADK for personal/side projects

**Steps:**
1. Complete training workshops at your own pace
2. Experiment with Visual Builder locally
3. Build agents for your own use cases
4. Export configs for deployment (GCP, AWS, etc.)

---

### Workflow 2: Healthcare Organization Training

```
Training Portal → Visual Builder → GraymatterStudio → Production
```

**Use Case:** Hospital IT team building clinical workflow automation

**Steps:**
1. Team completes training together (instructor-led or self-paced)
2. Each developer practices locally with Visual Builder
3. Team imports agents to shared GraymatterStudio tenant
4. Collaborative refinement in Studio
5. Deploy to hospital's production environment
6. Monitor and iterate based on clinical feedback

---

### Workflow 3: Enterprise Pilot Program

```
Training Portal (select users) → GraymatterStudio (team deployment)
```

**Use Case:** Large organization piloting AI agents for specific departments

**Steps:**
1. Pilot team completes foundational training
2. Team builds agents directly in GraymatterStudio (skips local Visual Builder)
3. Deploy to staging environment for testing
4. Refine based on user feedback
5. Roll out to production for pilot departments
6. Expand to more teams based on success

---

## Navigation Between Platforms

### From Training Portal

**Header Navigation:**
- Click "Ecosystem" dropdown in header
- Select "ADK Visual Builder" to open your local instance
- Select "GraymatterStudio" to access production platform

**Dashboard:**
- Visual Builder Status card shows connection status
- "Launch Visual Builder" button when running locally
- Settings page to configure your local builder URL

**Workshops:**
- "Try in Visual Builder" links in exercise descriptions
- "Import to Studio" buttons for premium users (coming soon)

---

### From Visual Builder

**After Building an Agent:**
1. Click "Export" to download agent config JSON
2. Open GraymatterStudio
3. Navigate to "Import Agent"
4. Upload your config file
5. Configure production settings
6. Deploy

---

### From GraymatterStudio

**Need to Learn More?**
- Link back to Training Portal from Studio dashboard
- "Learning Resources" section with workshop recommendations
- "Community" tab for questions and discussions

---

## Platform Comparison

| Feature | Training Portal | Visual Builder | GraymatterStudio |
|---------|----------------|----------------|-------------------|
| **Purpose** | Learn | Practice | Build Production |
| **Hosting** | Cloud | Local | Cloud |
| **Cost** | Free | Free (Google ADK) | Subscription |
| **Use Case** | Education | Experimentation | Deployment |
| **Multi-User** | Individual progress | Single user | Team collaboration |
| **Agent Deployment** | ❌ | ❌ | ✅ |
| **Production Features** | ❌ | ❌ | ✅ (monitoring, SSO, etc.) |
| **Version Control** | ❌ | ❌ | ✅ |
| **API Access** | Read-only | Local only | Full REST API |
| **Healthcare Compliance** | ❌ | ❌ | ✅ (HIPAA ready) |
| **Support** | Documentation | Google Docs | Enterprise SLA |

---

## Getting Started

### I'm New to AI Agents

**Start:** ADK Training Portal (you're here!)

1. Click "Get Started" or "Setup Wizard" on dashboard
2. Follow the guided setup (30 minutes)
3. Complete "Introduction to AI Agents" workshop
4. Practice in Visual Builder
5. Build your first agent

### I Know ADK Basics

**Start:** Visual Builder + GraymatterStudio

1. Install ADK locally: `pip install google-adk`
2. Launch Visual Builder: `adk web`
3. Build your agent visually
4. Export and import to GraymatterStudio
5. Deploy to production

### I'm an Organization

**Start:** Contact GraymatterLab

- Schedule demo of GraymatterStudio
- Discuss team training options (instructor-led or self-paced)
- Plan pilot program
- Get enterprise pricing
- Set up SSO and team onboarding

**Contact:** [sales@graymatterlab.ai](mailto:sales@graymatterlab.ai)

---

## Frequently Asked Questions

### Do I need all three platforms?

**No.** Each platform serves a different purpose:
- **Training Portal only:** If you just want to learn ADK concepts
- **Visual Builder only:** If you're experimenting locally (no need for Training Portal)
- **GraymatterStudio only:** If you're deploying production agents (assumes you know ADK)

**Recommended:** Use all three for the complete learning-to-production journey.

### Can I deploy agents without GraymatterStudio?

**Yes.** ADK agents are standard Python applications. You can deploy them to:
- Google Cloud Run (manual setup)
- AWS Lambda
- Azure Functions
- Your own servers

**GraymatterStudio advantage:** One-click deployment, monitoring, team collaboration, version control, healthcare compliance.

### Is Visual Builder required?

**No.** You can build ADK agents entirely with code (Python). Visual Builder is optional for:
- Learning agent concepts visually
- Rapid prototyping
- Testing configurations quickly
- Debugging agent behavior

Many developers prefer code-first workflows after learning the basics.

### What's the difference between Visual Builder and GraymatterStudio?

| | Visual Builder | GraymatterStudio |
|---|---|---|
| **Created by** | Google | GraymatterLab |
| **Purpose** | Local development | Production deployment |
| **User interface** | Web UI (local) | Web UI (cloud) |
| **Collaboration** | Single user | Teams |
| **Deployment** | Export only | One-click deploy |
| **Monitoring** | None | Full analytics |
| **Cost** | Free | Subscription |

### How do I get access to GraymatterStudio?

**Early Access:** GraymatterStudio is currently in private beta for healthcare organizations.

**Sign up:** [studio.graymatterlab.ai/signup](https://studio.graymatterlab.ai/signup) (coming soon)

**Enterprise:** Contact [sales@graymatterlab.ai](mailto:sales@graymatterlab.ai) for team deployments

### Can I use my own LLM (not Google)?

**Training Portal:** Courses focus on Google ADK + Gemini models

**Visual Builder:** Requires Google API (Gemini models only)

**GraymatterStudio:** Supports multiple LLM providers:
- Google Gemini (default)
- OpenAI GPT-4
- Anthropic Claude (coming soon)
- Custom models via API

### Is my data secure?

**Training Portal:**
- No production data—for learning only
- Progress stored in your browser (localStorage)
- Authentication via JWT tokens

**Visual Builder:**
- Runs locally on your machine
- Data stays on your computer
- API calls to Google for LLM responses only

**GraymatterStudio:**
- Multi-tenant isolation (schema-per-tenant)
- HIPAA compliance ready
- Encryption at rest and in transit
- SOC 2 Type II certified (in progress)
- Audit logging for all actions

---

## Support and Resources

### Documentation

- **ADK Official Docs:** [https://cloud.google.com/adk/docs](https://cloud.google.com/adk/docs)
- **Training Portal Docs:** `/docs` (this site)
- **GraymatterStudio Docs:** [docs.graymatterlab.ai](https://docs.graymatterlab.ai) (coming soon)

### Community

- **GitHub Discussions:** [github.com/graymatterlab/community](https://github.com/graymatterlab/community)
- **Discord:** [discord.gg/graymatterlab](https://discord.gg/graymatterlab)
- **Office Hours:** Weekly live Q&A (check calendar)

### Training

- **Self-Paced:** Complete workshops on Training Portal at your own pace
- **Instructor-Led:** Live workshops with GraymatterLab experts
- **Enterprise Training:** Custom onboarding for your organization

### Contact

- **General Questions:** [support@graymatterlab.ai](mailto:support@graymatterlab.ai)
- **Sales/Enterprise:** [sales@graymatterlab.ai](mailto:sales@graymatterlab.ai)
- **Technical Support:** [support.graymatterlab.ai](https://support.graymatterlab.ai)

---

## Roadmap

### Q1 2025
- ✅ ADK Training Portal launch
- ✅ Setup Wizard and onboarding
- 🚧 GraymatterStudio private beta
- 📅 First 10 workshops published

### Q2 2025
- 📅 GraymatterStudio public launch
- 📅 Visual Builder deep integration (import/export)
- 📅 Advanced workshops (multi-agent, custom tools)
- 📅 Certification program

### Q3 2025
- 📅 Healthcare-specific agent templates
- 📅 SSO integrations (Okta, Azure AD)
- 📅 API marketplace for agent tools
- 📅 Mobile app for monitoring agents

### Q4 2025
- 📅 Enterprise features (advanced analytics, compliance reporting)
- 📅 Multi-cloud deployment (AWS, Azure support)
- 📅 AI agent marketplace
- 📅 White-label options for partners

---

**Ready to start?** Head to the [Setup Wizard](/getting-started) to configure your environment!
