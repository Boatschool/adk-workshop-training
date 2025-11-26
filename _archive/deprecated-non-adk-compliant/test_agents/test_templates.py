"""Tests for agent templates."""

import pytest

from src.agents.base import AgentCategory, AgentConfig
from src.agents.templates.faq_agent import FAQAgentTemplate, DEFAULT_FAQ_KNOWLEDGE
from src.agents.templates.scheduler_agent import (
    SchedulerAgentTemplate,
    search_available_rooms,
    book_meeting_room,
    get_room_details,
    MEETING_ROOMS,
)
from src.agents.templates.router_agent import (
    RouterAgentTemplate,
    IntakeAgentTemplate,
    CategorizationAgentTemplate,
    TicketAgentTemplate,
    categorize_request,
    create_ticket,
    check_ticket_status,
)


class TestFAQAgentTemplate:
    """Tests for FAQ agent template."""

    def test_agent_type(self):
        """Test agent type identifier."""
        assert FAQAgentTemplate.get_agent_type() == "faq"

    def test_category(self):
        """Test agent category."""
        assert FAQAgentTemplate.get_category() == AgentCategory.FAQ

    def test_default_config(self):
        """Test default configuration."""
        config = FAQAgentTemplate.get_default_config()

        assert config.name == "HR FAQ Assistant"
        assert config.model == "gemini-2.5-flash"
        assert config.knowledge_base == DEFAULT_FAQ_KNOWLEDGE
        assert "fallback_contact" in config.settings

    def test_display_name(self):
        """Test display name."""
        assert FAQAgentTemplate.get_display_name() == "HR FAQ Assistant"

    def test_description(self):
        """Test description."""
        desc = FAQAgentTemplate.get_description()
        assert "benefits" in desc.lower() or "questions" in desc.lower()

    def test_instance_with_default_config(self):
        """Test creating instance with defaults."""
        template = FAQAgentTemplate()

        assert template.config.name == "HR FAQ Assistant"
        assert template.get_tools() == []

    def test_instance_with_custom_config(self):
        """Test creating instance with custom config."""
        custom_config = AgentConfig(
            name="Custom FAQ",
            knowledge_base="Custom knowledge",
        )
        template = FAQAgentTemplate(config=custom_config)

        assert template.config.name == "Custom FAQ"
        assert template.config.knowledge_base == "Custom knowledge"


class TestSchedulerAgentTemplate:
    """Tests for scheduler agent template."""

    def test_agent_type(self):
        """Test agent type identifier."""
        assert SchedulerAgentTemplate.get_agent_type() == "scheduler"

    def test_category(self):
        """Test agent category."""
        assert SchedulerAgentTemplate.get_category() == AgentCategory.SCHEDULING

    def test_default_config(self):
        """Test default configuration."""
        config = SchedulerAgentTemplate.get_default_config()

        assert config.name == "Meeting Room Scheduler"
        assert "require_confirmation" in config.settings

    @pytest.mark.skip(reason="Requires google.adk which needs additional deps")
    def test_has_tools(self):
        """Test scheduler has tools."""
        template = SchedulerAgentTemplate()
        tools = template.get_tools()

        # Should have 3 tools
        assert len(tools) == 3


class TestSchedulerTools:
    """Tests for scheduler agent tools."""

    def test_search_available_rooms_basic(self):
        """Test basic room search."""
        rooms = search_available_rooms(
            date="2024-01-15",
            start_time="10:00",
            duration_hours=1,
            attendees=5,
        )

        # Should find rooms with capacity >= 5
        assert len(rooms) > 0
        for room in rooms:
            assert room["capacity"] >= 5

    def test_search_available_rooms_with_features(self):
        """Test room search with feature requirements."""
        rooms = search_available_rooms(
            date="2024-01-15",
            start_time="10:00",
            duration_hours=1,
            attendees=2,
            required_features=["Video conferencing"],
        )

        for room in rooms:
            assert "Video conferencing" in room["features"]

    def test_search_available_rooms_large_group(self):
        """Test room search for large group."""
        rooms = search_available_rooms(
            date="2024-01-15",
            start_time="10:00",
            duration_hours=1,
            attendees=30,
        )

        # Only training center has capacity > 30
        assert len(rooms) == 1
        assert rooms[0]["name"] == "Training Center"

    def test_book_meeting_room_success(self):
        """Test successful room booking."""
        result = book_meeting_room(
            room_id="boardroom_a",
            date="2024-01-15",
            start_time="10:00",
            duration_hours=2,
            meeting_title="Team Meeting",
            organizer="john@example.com",
        )

        assert result["success"] is True
        assert "confirmation_number" in result
        assert result["confirmation_number"].startswith("CONF-")
        assert result["room_name"] == "Board Room A"

    def test_book_meeting_room_not_found(self):
        """Test booking non-existent room."""
        result = book_meeting_room(
            room_id="nonexistent",
            date="2024-01-15",
            start_time="10:00",
            duration_hours=1,
            meeting_title="Test",
            organizer="test@example.com",
        )

        assert result["success"] is False
        assert "not found" in result["error"].lower()

    def test_get_room_details_success(self):
        """Test getting room details."""
        result = get_room_details("conference_201")

        assert result["room_id"] == "conference_201"
        assert result["name"] == "Conference Room 201"
        assert result["capacity"] == 8
        assert "location_notes" in result

    def test_get_room_details_not_found(self):
        """Test getting non-existent room."""
        result = get_room_details("nonexistent")

        assert "error" in result


class TestRouterAgentTemplate:
    """Tests for router agent template."""

    def test_agent_type(self):
        """Test agent type identifier."""
        assert RouterAgentTemplate.get_agent_type() == "router"

    def test_category(self):
        """Test agent category."""
        assert RouterAgentTemplate.get_category() == AgentCategory.ROUTING

    def test_default_config(self):
        """Test default configuration."""
        config = RouterAgentTemplate.get_default_config()

        assert config.name == "Facilities Coordinator"
        assert config.settings["enable_sub_agents"] is True

    def test_sub_agent_templates(self):
        """Test sub-agent template types."""
        assert IntakeAgentTemplate.get_agent_type() == "intake"
        assert CategorizationAgentTemplate.get_agent_type() == "categorizer"
        assert TicketAgentTemplate.get_agent_type() == "ticket_creator"


class TestRouterTools:
    """Tests for router agent tools."""

    def test_categorize_hvac(self):
        """Test HVAC categorization."""
        result = categorize_request("The HVAC system is not cooling properly")

        assert result["category"] == "HVAC"
        assert result["department"] == "Climate Control"

    def test_categorize_electrical(self):
        """Test electrical categorization."""
        result = categorize_request("The lights are flickering in the hallway")

        assert result["category"] == "Electrical"
        assert result["department"] == "Electrical Services"

    def test_categorize_plumbing(self):
        """Test plumbing categorization."""
        result = categorize_request("There's a water leak under the sink")

        assert result["category"] == "Plumbing"
        assert result["department"] == "Plumbing Services"

    def test_categorize_custodial(self):
        """Test custodial categorization."""
        result = categorize_request("The trash hasn't been emptied")

        assert result["category"] == "Custodial"
        assert result["department"] == "Environmental Services"

    def test_categorize_security(self):
        """Test security categorization."""
        result = categorize_request("I need a new key for my office")

        assert result["category"] == "Security"
        assert result["department"] == "Security Services"

    def test_categorize_general(self):
        """Test general maintenance categorization."""
        result = categorize_request("The carpet has a stain that needs attention")

        assert result["category"] == "General Maintenance"
        assert result["department"] == "General Facilities"

    def test_priority_high(self):
        """Test high priority detection."""
        result = categorize_request("Emergency! Water is flooding the floor")

        assert result["priority"] == "High"
        assert result["sla_hours"] == 2

    def test_priority_medium(self):
        """Test medium priority detection."""
        result = categorize_request("The printer is broken and not working")

        assert result["priority"] == "Medium"
        assert result["sla_hours"] == 24

    def test_priority_low(self):
        """Test low priority detection."""
        result = categorize_request("Could use another trash can")

        assert result["priority"] == "Low"
        assert result["sla_hours"] == 72

    def test_create_ticket(self):
        """Test ticket creation."""
        result = create_ticket(
            category="HVAC",
            department="Climate Control",
            priority="Medium",
            description="AC not cooling",
            location="Building A, Room 101",
            reporter_name="John Doe",
            reporter_contact="john@example.com",
        )

        assert result["ticket_number"].startswith("FAC-")
        assert result["category"] == "HVAC"
        assert result["department"] == "Climate Control"
        assert result["status"] == "Open"
        assert "estimated_response" in result

    def test_check_ticket_status(self):
        """Test ticket status check."""
        result = check_ticket_status("FAC-20241115-1234")

        assert result["ticket_number"] == "FAC-20241115-1234"
        assert result["status"] == "In Progress"
        assert "message" in result
