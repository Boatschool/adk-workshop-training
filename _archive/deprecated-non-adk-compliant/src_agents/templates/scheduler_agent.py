"""
Meeting Room Scheduler Agent Template.

An agent with tools that helps staff find and book conference rooms.
Demonstrates tool usage with Google ADK FunctionTool.

No PHI/PII processing - facilities management only.
"""

from datetime import datetime
from typing import Any

from src.agents.base import BaseAgentTemplate, AgentConfig, AgentCategory
from src.agents.registry import AgentRegistry


# Simulated room database (in production, this would be from a database)
MEETING_ROOMS = {
    "boardroom_a": {
        "name": "Board Room A",
        "capacity": 20,
        "floor": 3,
        "features": ["TV screen", "Video conferencing", "Whiteboard"],
        "bookings": [],
    },
    "conference_201": {
        "name": "Conference Room 201",
        "capacity": 8,
        "floor": 2,
        "features": ["TV screen", "Whiteboard"],
        "bookings": [],
    },
    "huddle_301": {
        "name": "Huddle Room 301",
        "capacity": 4,
        "floor": 3,
        "features": ["Monitor", "Whiteboard"],
        "bookings": [],
    },
    "training_center": {
        "name": "Training Center",
        "capacity": 50,
        "floor": 1,
        "features": ["Projector", "Sound system", "Video conferencing", "Catering access"],
        "bookings": [],
    },
}


def search_available_rooms(
    date: str,
    start_time: str,
    duration_hours: int,
    attendees: int,
    required_features: list[str] | None = None,
) -> list[dict]:
    """
    Search for available meeting rooms that match criteria.

    Args:
        date: Date in YYYY-MM-DD format
        start_time: Start time in HH:MM format
        duration_hours: Meeting duration in hours
        attendees: Number of expected attendees
        required_features: List of required room features (optional)

    Returns:
        List of available rooms with details
    """
    available_rooms = []

    for room_id, room in MEETING_ROOMS.items():
        # Check capacity
        if room["capacity"] < attendees:
            continue

        # Check features if specified
        if required_features:
            if not all(feature in room["features"] for feature in required_features):
                continue

        # In production, would check actual calendar bookings
        available_rooms.append({
            "room_id": room_id,
            "name": room["name"],
            "capacity": room["capacity"],
            "floor": room["floor"],
            "features": room["features"],
        })

    return available_rooms


def book_meeting_room(
    room_id: str,
    date: str,
    start_time: str,
    duration_hours: int,
    meeting_title: str,
    organizer: str,
) -> dict:
    """
    Book a meeting room.

    Args:
        room_id: ID of the room to book
        date: Date in YYYY-MM-DD format
        start_time: Start time in HH:MM format
        duration_hours: Meeting duration in hours
        meeting_title: Title of the meeting
        organizer: Name/email of meeting organizer

    Returns:
        Booking confirmation details
    """
    if room_id not in MEETING_ROOMS:
        return {"success": False, "error": "Room not found"}

    room = MEETING_ROOMS[room_id]

    # In production, would create actual calendar event
    booking = {
        "success": True,
        "confirmation_number": f"CONF-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "room_name": room["name"],
        "date": date,
        "start_time": start_time,
        "duration_hours": duration_hours,
        "meeting_title": meeting_title,
        "organizer": organizer,
        "floor": room["floor"],
        "features": room["features"],
    }

    return booking


def get_room_details(room_id: str) -> dict:
    """Get detailed information about a specific room."""
    if room_id not in MEETING_ROOMS:
        return {"error": "Room not found"}

    room = MEETING_ROOMS[room_id]
    return {
        "room_id": room_id,
        "name": room["name"],
        "capacity": room["capacity"],
        "floor": room["floor"],
        "features": room["features"],
        "location_notes": f"Located on floor {room['floor']}, accessible via main elevators",
    }


@AgentRegistry.register
class SchedulerAgentTemplate(BaseAgentTemplate):
    """Meeting Room Scheduler Agent with tool usage.

    Features:
    - Search for available rooms by criteria
    - Book meeting rooms
    - Get room details and directions
    - Configurable room database

    Tools:
    - search_available_rooms: Find rooms matching requirements
    - book_meeting_room: Create room booking
    - get_room_details: Get information about a room
    """

    @classmethod
    def get_agent_type(cls) -> str:
        return "scheduler"

    @classmethod
    def get_category(cls) -> AgentCategory:
        return AgentCategory.SCHEDULING

    @classmethod
    def get_default_config(cls) -> AgentConfig:
        return AgentConfig(
            name="Meeting Room Scheduler",
            model="gemini-2.5-flash",
            description="Helps staff find and book conference rooms in hospital facilities",
            instruction="",  # Built dynamically
            settings={
                "require_confirmation": True,
                "suggest_alternatives": True,
            },
        )

    def create_agent(self) -> Any:
        """Create the Google ADK Agent with room scheduling tools."""
        from google.adk.agents import Agent
        from google.adk.tools import FunctionTool

        instruction = """You are a helpful meeting room booking assistant for a healthcare facility.

Your responsibilities:
- Help staff find available meeting rooms
- Check room features and capacity
- Book rooms when requested
- Provide directions to rooms

Guidelines:
- Always confirm the number of attendees before suggesting rooms
- Ask about required features (video conferencing, whiteboard, etc.)
- Confirm booking details before finalizing
- Provide clear confirmation with room location
- Suggest alternative times if preferred room is unavailable
- Be efficient and professional

IMPORTANT: This system handles only facilities/meeting room scheduling.
Do not process or ask for any patient information or clinical data.
"""

        if self.config.instruction:
            instruction = self.config.instruction

        # Create tools
        tools = [
            FunctionTool(search_available_rooms),
            FunctionTool(book_meeting_room),
            FunctionTool(get_room_details),
        ]

        return Agent(
            name=self.config.name.lower().replace(" ", "_"),
            model=self.config.model,
            instruction=instruction,
            description=self.config.description,
            tools=tools,
        )

    def get_tools(self) -> list[Any]:
        """Return list of tools used by this agent."""
        from google.adk.tools import FunctionTool

        return [
            FunctionTool(search_available_rooms),
            FunctionTool(book_meeting_room),
            FunctionTool(get_room_details),
        ]
