/**
 * Example Page
 * Displays code examples with copy/download functionality
 */

import { Link, useParams } from 'react-router-dom'
import { CodeViewer } from '@components/exercise'

// Mock data - will be replaced with API call
const mockExamples: Record<string, { title: string; code: string; filename: string }> = {
  '01-simple-faq-agent': {
    title: 'HR FAQ Agent',
    filename: '01_simple_faq_agent.py',
    code: `"""
HR FAQ Agent
A simple agent that answers frequently asked questions about HR policies.
"""

from google.adk import Agent

# Define common HR FAQs
HR_FAQS = """
You are an HR FAQ assistant. Answer questions about company policies.

Common policies:
- PTO: Employees get 15 days per year
- Remote work: Hybrid schedule (3 days in office)
- Benefits enrollment: Open enrollment is in November
- Dress code: Business casual
"""

agent = Agent(
    name="hr_faq_agent",
    model="gemini-2.0-flash",
    instructions=HR_FAQS,
)

if __name__ == "__main__":
    agent.run()
`,
  },
  '02-meeting-room-scheduler': {
    title: 'Meeting Room Scheduler',
    filename: '02_meeting_room_scheduler.py',
    code: `"""
Meeting Room Scheduler Agent
An agent that helps schedule meeting rooms.
"""

from google.adk import Agent, Tool

# Define available meeting rooms
ROOMS = {
    "Conference A": {"capacity": 10, "equipment": ["projector", "whiteboard"]},
    "Conference B": {"capacity": 6, "equipment": ["TV", "webcam"]},
    "Huddle Space": {"capacity": 4, "equipment": ["TV"]},
}

@Tool
def list_available_rooms(date: str, time: str, duration_minutes: int) -> str:
    """List available meeting rooms for a given time slot."""
    # In a real app, this would check a calendar system
    return f"Available rooms for {date} at {time}: Conference A, Huddle Space"

@Tool
def book_room(room_name: str, date: str, time: str, duration_minutes: int) -> str:
    """Book a meeting room."""
    if room_name in ROOMS:
        return f"Successfully booked {room_name} for {date} at {time}"
    return f"Room {room_name} not found"

agent = Agent(
    name="meeting_scheduler",
    model="gemini-2.0-flash",
    instructions="Help users find and book meeting rooms.",
    tools=[list_available_rooms, book_room],
)

if __name__ == "__main__":
    agent.run()
`,
  },
  '03-facilities-ticket-router': {
    title: 'Facilities Ticket Router',
    filename: '03_facilities_ticket_router.py',
    code: `"""
Facilities Ticket Router
An agent that routes facilities requests to the appropriate team.
"""

from google.adk import Agent, Tool

TEAMS = {
    "electrical": ["lights", "outlets", "power", "electrical"],
    "plumbing": ["water", "sink", "toilet", "plumbing", "leak"],
    "hvac": ["temperature", "heating", "cooling", "ac", "air"],
    "general": ["cleaning", "furniture", "keys", "access"],
}

@Tool
def create_ticket(description: str, priority: str, team: str) -> str:
    """Create a facilities ticket and route to appropriate team."""
    ticket_id = f"FAC-{hash(description) % 10000:04d}"
    return f"Ticket {ticket_id} created for {team} team with {priority} priority"

@Tool
def get_ticket_status(ticket_id: str) -> str:
    """Get the status of a facilities ticket."""
    # In a real app, this would query a ticketing system
    return f"Ticket {ticket_id}: In Progress - Assigned to technician"

agent = Agent(
    name="facilities_router",
    model="gemini-2.0-flash",
    instructions="""You are a facilities ticket router.
    Help users submit facilities requests and route them to the correct team.
    Ask for a description and assess priority (low, medium, high, urgent).""",
    tools=[create_ticket, get_ticket_status],
)

if __name__ == "__main__":
    agent.run()
`,
  },
}

export function ExamplePage() {
  const { id } = useParams<{ id: string }>()

  const example = id ? mockExamples[id] : null

  if (!example) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Example Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The example you're looking for doesn't exist.
          </p>
          <Link to="/" className="text-primary-600 dark:text-primary-400 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{example.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          {example.title}
        </h1>
      </div>

      {/* Code */}
      <CodeViewer
        code={example.code}
        language="python"
        filename={example.filename}
      />

      {/* How to Run */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How to Run This Example
        </h3>
        <ol className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <span className="font-medium">1.</span>
            <span>Activate your virtual environment:
              <code className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-800/50 rounded">source ~/adk-workshop/bin/activate</code>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium">2.</span>
            <span>Navigate to the examples directory:
              <code className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-800/50 rounded">cd ~/adk-workshop-training/examples</code>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium">3.</span>
            <span>Run the example:
              <code className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-800/50 rounded">python {example.filename}</code>
            </span>
          </li>
        </ol>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
