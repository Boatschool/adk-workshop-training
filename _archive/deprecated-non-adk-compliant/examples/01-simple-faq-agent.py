"""
Simple FAQ Agent for Healthcare HR Department

This agent answers common questions about:
- Benefits enrollment
- Time off policies
- Payroll schedules
- Employee resources

No PHI/PII processing - purely informational.
"""

from google.adk.agents import Agent

# FAQ knowledge base (in production, this could be from a database or document)
FAQ_KNOWLEDGE = """
BENEFITS ENROLLMENT:
- Open enrollment period: November 1-30 annually
- New employees: 30 days from hire date to enroll
- Life events: 30 days to make changes
- Contact: benefits@hospital.example.com

TIME OFF POLICIES:
- PTO accrual: 15 days/year for 0-5 years of service
- PTO accrual: 20 days/year for 5+ years of service
- Sick time: 10 days/year, does not roll over
- Holidays: 10 paid holidays per year
- Request process: Submit in Workday, requires manager approval

PAYROLL SCHEDULES:
- Pay frequency: Bi-weekly on Fridays
- Payroll deadline: Tuesday 5pm prior to pay date
- Direct deposit: Set up in Workday
- Pay stubs: Available in Workday portal

EMPLOYEE RESOURCES:
- Workday login: workday.hospital.example.com
- IT Help Desk: ext. 5555
- HR Main Line: ext. 5000
- Employee Assistance Program: 1-800-EAP-HELP
- Learning Portal: learning.hospital.example.com

WORKSPACE REQUESTS:
- Office supplies: Order via Workday catalog
- Equipment requests: Submit IT ticket
- Parking passes: Contact Facilities (ext. 5200)
- Building access: Contact Security (ext. 5100)
"""

# Create the FAQ agent
hr_faq_agent = Agent(
    name="hr_faq_assistant",
    model="gemini-2.5-flash",  # Fast model for simple Q&A
    instruction=f"""You are a helpful HR assistant for a healthcare organization.
    You answer common questions about benefits, time off, payroll, and employee resources.

    Use this knowledge base to answer questions:
    {FAQ_KNOWLEDGE}

    Guidelines:
    - Be friendly and professional
    - If you don't know the answer, direct them to HR (ext. 5000)
    - Never make up information
    - Keep responses concise
    - Do not process or ask for any personal employee information
    """,
    description="HR FAQ assistant for common employee questions"
)

# Example usage
if __name__ == "__main__":
    print("HR FAQ Agent - Type 'quit' to exit")
    print("=" * 50)

    # Example questions you can try:
    print("\nExample questions:")
    print("- When is open enrollment?")
    print("- How much PTO do I get?")
    print("- When is the next payday?")
    print("- How do I submit a time off request?")
    print("- How do I contact IT support?")
    print("\n" + "=" * 50 + "\n")

    # Run the agent in interactive mode
    hr_faq_agent.run()
