# HR FAQ Assistant

## Overview

An HR FAQ assistant for healthcare organizations that answers common questions about benefits, time off, payroll, and employee resources. This agent demonstrates how to embed domain knowledge directly into agent instructions.

## Agent Configuration

- **Name:** `hr_faq_assistant`
- **Model:** `gemini-2.5-flash`
- **Type:** LlmAgent (single agent)
- **Files:** `root_agent.yaml`

## Capabilities

- Answer benefits enrollment questions
- Explain time off policies (PTO, sick time, holidays)
- Provide payroll schedule information
- Direct to employee resources and contacts
- Handle workspace and equipment requests

## Knowledge Base

### Benefits Enrollment
- Open enrollment: November 1-30 annually
- New employees: 30 days from hire to enroll
- Life events: 30 days to make changes
- Contact: benefits@hospital.example.com

### Time Off Policies
| Type | Allowance | Notes |
|------|-----------|-------|
| PTO (0-5 years) | 15 days/year | Accrual based |
| PTO (5+ years) | 20 days/year | Accrual based |
| Sick time | 10 days/year | Does not roll over |
| Holidays | 10 days/year | Paid holidays |

### Key Contacts
- HR Main Line: ext. 5000
- IT Help Desk: ext. 5555
- Facilities: ext. 5200
- Security: ext. 5100
- EAP: 1-800-EAP-HELP

## Usage

### Running with ADK CLI

```bash
cd agents
adk web
# Access at http://localhost:8000/dev-ui
```

### Example Conversations

```
User: When is open enrollment?

Agent: Open enrollment runs November 1-30 annually. During this period,
you can make changes to your benefits selections for the upcoming year.
If you have questions, contact benefits@hospital.example.com.
```

```
User: How much PTO do I get?

Agent: PTO accrual depends on your years of service:
- 0-5 years: 15 days per year
- 5+ years: 20 days per year

To request time off, submit your request in Workday. It requires manager approval.
```

## Customization

### Updating the Knowledge Base

Edit the `instruction` field in `root_agent.yaml` to:
- Update contact information
- Modify policies and procedures
- Add new categories of information
- Adjust response guidelines

### Adding Tools

For real-time data (e.g., PTO balances), add tools to integrate with HR systems:
- Workday API integration
- Calendar availability checks
- Ticket submission tools

## Notes

- This agent uses embedded knowledge (no external API calls)
- All information is example data for demonstration
- Does not process or store personal employee information
- For unknown questions, directs users to HR (ext. 5000)
