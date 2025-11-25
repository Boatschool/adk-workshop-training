# Meeting Room Scheduler

## Overview

A meeting room booking assistant for healthcare facilities that helps staff find and book conference rooms. This agent demonstrates embedded room inventory data and booking workflow guidance.

## Agent Configuration

- **Name:** `meeting_room_scheduler`
- **Model:** `gemini-2.5-flash`
- **Type:** LlmAgent (single agent)
- **Files:** `root_agent.yaml`

## Capabilities

- Find available meeting rooms by capacity
- Match rooms to required features
- Provide room location and directions
- Guide through booking process
- Suggest alternatives when preferred rooms are unavailable

## Room Inventory

| Room | Floor | Capacity | Features |
|------|-------|----------|----------|
| Board Room A | 3 | 20 | TV, Video conferencing, Whiteboard |
| Conference Room 201 | 2 | 8 | TV, Whiteboard |
| Huddle Room 301 | 3 | 4 | Monitor, Whiteboard |
| Training Center | 1 | 50 | Projector, Sound system, Video conferencing, Catering |

## Usage

### Running with ADK CLI

```bash
cd agents
adk web
# Access at http://localhost:8000/dev-ui
```

### Example Conversations

```
User: I need a room for 15 people with video conferencing.

Agent: For 15 people with video conferencing, I recommend Board Room A on Floor 3.
It has a capacity of 20 and includes TV screen, video conferencing, and whiteboard.

What date and time would you like to book?
```

```
User: What's available for a quick 4-person meeting?

Agent: For a 4-person meeting, Huddle Room 301 on Floor 3 would be perfect.
It has a monitor and whiteboard for quick collaboration.

Shall I check availability for a specific time?
```

## Booking Workflow

1. **Gather requirements:** Number of attendees, required features
2. **Suggest rooms:** Match capacity and features
3. **Check availability:** Confirm time slot (simulated in demo)
4. **Confirm booking:** Provide confirmation with room details
5. **Alternative options:** Suggest other times if unavailable

## Customization

### Updating Room Inventory

Edit the `AVAILABLE ROOMS` section in `root_agent.yaml` to:
- Add or remove rooms
- Update capacities and features
- Change floor locations

### Adding Real Booking Integration

To connect with actual calendar systems, add tools for:
- Google Calendar / Microsoft 365 integration
- Room availability API calls
- Booking confirmation systems

```yaml
tools:
  - name: check_room_availability
    description: Check if a room is available at a specific time
  - name: create_booking
    description: Create a room booking
```

## Notes

- Demo version simulates booking functionality
- Does not process patient information or clinical data
- Focused on non-clinical facility scheduling
- Integrate with calendar APIs for production use
