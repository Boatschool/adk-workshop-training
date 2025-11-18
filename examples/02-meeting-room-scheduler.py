"""
Meeting Room Scheduler Agent

This agent helps staff find and book conference rooms in a hospital facility.
It checks room availability, features, and capacity to make recommendations.

No PHI/PII processing - facilities management only.
"""

from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from datetime import datetime, timedelta
from typing import List, Dict

# Simulated room database (in production, this would be a real database)
MEETING_ROOMS = {
    "boardroom_a": {
        "name": "Board Room A",
        "capacity": 20,
        "floor": 3,
        "features": ["TV screen", "Video conferencing", "Whiteboard"],
        "bookings": []  # Would be populated from calendar system
    },
    "conference_201": {
        "name": "Conference Room 201",
        "capacity": 8,
        "floor": 2,
        "features": ["TV screen", "Whiteboard"],
        "bookings": []
    },
    "huddle_301": {
        "name": "Huddle Room 301",
        "capacity": 4,
        "floor": 3,
        "features": ["Monitor", "Whiteboard"],
        "bookings": []
    },
    "training_center": {
        "name": "Training Center",
        "capacity": 50,
        "floor": 1,
        "features": ["Projector", "Sound system", "Video conferencing", "Catering access"],
        "bookings": []
    }
}

def search_available_rooms(
    date: str,
    start_time: str,
    duration_hours: int,
    attendees: int,
    required_features: List[str] = None
) -> List[Dict]:
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
        # For demo, all rooms are available
        available_rooms.append({
            "room_id": room_id,
            "name": room["name"],
            "capacity": room["capacity"],
            "floor": room["floor"],
            "features": room["features"]
        })

    return available_rooms

def book_meeting_room(
    room_id: str,
    date: str,
    start_time: str,
    duration_hours: int,
    meeting_title: str,
    organizer: str
) -> Dict:
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
        "features": room["features"]
    }

    return booking

def get_room_details(room_id: str) -> Dict:
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
        "location_notes": f"Located on floor {room['floor']}, accessible via main elevators"
    }

# Create tools from functions
search_rooms_tool = FunctionTool(search_available_rooms)
book_room_tool = FunctionTool(book_meeting_room)
room_details_tool = FunctionTool(get_room_details)

# Create the meeting room scheduler agent
room_scheduler_agent = Agent(
    name="meeting_room_scheduler",
    model="gemini-2.5-flash",
    instruction="""You are a helpful meeting room booking assistant for a healthcare facility.

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
    """,
    description="Assistant for booking meeting rooms in hospital facilities",
    tools=[search_rooms_tool, book_room_tool, room_details_tool]
)

# Example usage
if __name__ == "__main__":
    print("Meeting Room Scheduler - Type 'quit' to exit")
    print("=" * 60)

    print("\nExample requests:")
    print("- I need a room for 10 people tomorrow at 2pm")
    print("- Find a room with video conferencing for 5 people")
    print("- Book the board room for Friday at 10am for 2 hours")
    print("- Where is Conference Room 201?")
    print("\n" + "=" * 60 + "\n")

    # Run the agent
    room_scheduler_agent.run()
