# Exercise 2: Adding Tools to Agents

**Difficulty:** Intermediate
**Time:** 45 minutes
**Method:** Visual Agent Builder + Code

## Learning Objectives

By the end of this exercise, you will:
- Understand what tools are and how they work
- Create custom tools for your agents
- Add tools to an agent in the Visual Builder
- Test tool usage and debug issues

## Scenario

The hospital's Training & Education department needs an agent that can:
1. Search for available training courses
2. Check if an employee has completed required courses
3. Enroll employees in courses
4. Generate certificates of completion

This requires building custom tools and integrating them with an agent.

## Prerequisites

1. Completed Exercise 1
2. Visual Agent Builder running
3. Basic Python knowledge

## Instructions

### Part 1: Understand Tools (5 min)

Tools extend what agents can do. Think of them as functions the agent can call.

**Without Tools:**
- Agent can only use knowledge in its training data
- Can't access real-time information
- Can't take actions in external systems

**With Tools:**
- Access databases
- Call APIs
- Process files
- Send emails
- Make calculations

**Example:**
```python
from google.adk.tools import FunctionTool

def get_weather(city: str) -> str:
    """Get current weather for a city."""
    # In production, would call weather API
    return f"The weather in {city} is sunny, 72°F"

weather_tool = FunctionTool(get_weather)
```

### Part 2: Create Custom Tools (15 min)

Create a new file: `exercises/exercise-2-training-tools.py`

```python
"""
Training Course Management Tools
"""
from google.adk.tools import FunctionTool
from typing import List, Dict
from datetime import datetime

# Simulated course database
COURSES = {
    "HIPAA101": {
        "id": "HIPAA101",
        "name": "HIPAA Privacy Training",
        "duration_hours": 1,
        "type": "compliance",
        "available_dates": ["2024-12-01", "2024-12-15", "2025-01-05"]
    },
    "FIRE101": {
        "id": "FIRE101",
        "name": "Fire Safety Training",
        "duration_hours": 0.5,
        "type": "safety",
        "available_dates": ["2024-12-05", "2024-12-20", "2025-01-10"]
    },
    "INFECT101": {
        "id": "INFECT101",
        "name": "Infection Control Basics",
        "duration_hours": 0.75,
        "type": "clinical",
        "available_dates": ["2024-12-03", "2024-12-17", "2025-01-07"]
    },
    "CPR101": {
        "id": "CPR101",
        "name": "CPR and Basic Life Support",
        "duration_hours": 4,
        "type": "clinical",
        "available_dates": ["2024-12-10", "2025-01-15"]
    }
}

# Simulated completion records
COMPLETIONS = {
    "john.doe@hospital.example.com": ["HIPAA101", "FIRE101"],
    "jane.smith@hospital.example.com": ["HIPAA101", "FIRE101", "INFECT101", "CPR101"]
}

def search_courses(course_type: str = None, keyword: str = None) -> List[Dict]:
    """
    Search for available training courses.

    Args:
        course_type: Filter by type (compliance, safety, clinical)
        keyword: Search in course name

    Returns:
        List of matching courses
    """
    results = []

    for course_id, course in COURSES.items():
        # Filter by type
        if course_type and course["type"] != course_type:
            continue

        # Filter by keyword
        if keyword and keyword.lower() not in course["name"].lower():
            continue

        results.append({
            "course_id": course["id"],
            "name": course["name"],
            "duration_hours": course["duration_hours"],
            "type": course["type"],
            "next_available": course["available_dates"][0] if course["available_dates"] else "TBD"
        })

    return results

def check_completion_status(employee_email: str, course_id: str = None) -> Dict:
    """
    Check which courses an employee has completed.

    Args:
        employee_email: Employee's email address
        course_id: Specific course ID to check (optional)

    Returns:
        Completion status information
    """
    completed = COMPLETIONS.get(employee_email, [])

    if course_id:
        # Check specific course
        is_completed = course_id in completed
        course_info = COURSES.get(course_id, {})
        return {
            "employee": employee_email,
            "course_id": course_id,
            "course_name": course_info.get("name", "Unknown"),
            "completed": is_completed,
            "completion_date": "2024-10-15" if is_completed else None
        }
    else:
        # Return all completions
        completed_courses = []
        for cid in completed:
            course_info = COURSES.get(cid, {})
            completed_courses.append({
                "course_id": cid,
                "course_name": course_info.get("name", "Unknown"),
                "completion_date": "2024-10-15"
            })

        return {
            "employee": employee_email,
            "total_completed": len(completed),
            "courses": completed_courses
        }

def enroll_in_course(
    employee_email: str,
    course_id: str,
    preferred_date: str
) -> Dict:
    """
    Enroll an employee in a training course.

    Args:
        employee_email: Employee's email
        course_id: Course ID to enroll in
        preferred_date: Preferred date (YYYY-MM-DD)

    Returns:
        Enrollment confirmation
    """
    if course_id not in COURSES:
        return {
            "success": False,
            "error": "Course not found"
        }

    course = COURSES[course_id]

    # Check if date is available
    if preferred_date not in course["available_dates"]:
        return {
            "success": False,
            "error": f"Date not available. Available dates: {', '.join(course['available_dates'])}"
        }

    # Create enrollment
    return {
        "success": True,
        "enrollment_id": f"ENR-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "employee": employee_email,
        "course_id": course_id,
        "course_name": course["name"],
        "scheduled_date": preferred_date,
        "duration_hours": course["duration_hours"],
        "message": f"Successfully enrolled in {course['name']} on {preferred_date}. " \
                   f"You will receive a calendar invite at {employee_email}."
    }

def generate_certificate(employee_email: str, course_id: str) -> Dict:
    """
    Generate a completion certificate (if course is completed).

    Args:
        employee_email: Employee's email
        course_id: Course ID

    Returns:
        Certificate information or error
    """
    completed = COMPLETIONS.get(employee_email, [])

    if course_id not in completed:
        return {
            "success": False,
            "error": "Course not completed yet. Cannot generate certificate."
        }

    course = COURSES.get(course_id, {})

    return {
        "success": True,
        "certificate_id": f"CERT-{datetime.now().strftime('%Y%m%d')}-{course_id}",
        "employee": employee_email,
        "course_name": course.get("name", "Unknown"),
        "completion_date": "2024-10-15",
        "download_url": f"https://training.hospital.example.com/certificates/CERT-{course_id}.pdf",
        "message": "Certificate generated successfully. Download link sent to your email."
    }

# Create tools from functions
search_courses_tool = FunctionTool(search_courses)
check_completion_tool = FunctionTool(check_completion_status)
enroll_course_tool = FunctionTool(enroll_in_course)
generate_cert_tool = FunctionTool(generate_certificate)

# Export tools for use in agents
__all__ = [
    'search_courses_tool',
    'check_completion_tool',
    'enroll_course_tool',
    'generate_cert_tool'
]
```

**Checkpoint:** Save this file and understand what each tool does.

### Part 3: Create Agent with Tools in Visual Builder (10 min)

**Option A: Visual Builder (Recommended)**

1. In Visual Builder, click **"New Agent"**
2. Name: `training_assistant`
3. Use AI Assistant:
   ```
   Create a training course assistant that helps employees:
   - Search for training courses
   - Check their completion status
   - Enroll in courses
   - Request certificates

   The agent should be helpful and guide employees through each step.
   ```

4. **Add your custom tools:**
   - Currently, Visual Builder primarily shows built-in tools
   - For custom tools, you'll export and modify the code (next step)

**Option B: Code Approach**

Create `exercises/exercise-2-training-agent.py`:

```python
from google.adk.agents import Agent
from exercise_2_training_tools import (
    search_courses_tool,
    check_completion_tool,
    enroll_course_tool,
    generate_cert_tool
)

training_assistant = Agent(
    name="training_assistant",
    model="gemini-2.5-flash",
    instruction="""You are a helpful training and education assistant for hospital staff.

    Your capabilities:
    - Help employees search for available training courses
    - Check course completion status
    - Enroll employees in training courses
    - Generate completion certificates

    Guidelines:
    - Always confirm the employee's email before checking records or enrolling
    - When enrolling, ask for preferred date from available options
    - Be encouraging about continuing education
    - Explain what each course covers if asked

    For this demo system, use these test emails:
    - john.doe@hospital.example.com (has completed 2 courses)
    - jane.smith@hospital.example.com (has completed 4 courses)

    Remember: This is for training records only, no patient information.
    """,
    description="Training course assistant for employee education",
    tools=[
        search_courses_tool,
        check_completion_tool,
        enroll_course_tool,
        generate_cert_tool
    ]
)

if __name__ == "__main__":
    print("Training Assistant - Type 'quit' to exit")
    print("=" * 60)
    print("\nExample requests:")
    print("- What compliance training is available?")
    print("- Check completion status for john.doe@hospital.example.com")
    print("- Enroll me in CPR training")
    print("- Generate certificate for HIPAA training")
    print("\n" + "=" * 60 + "\n")

    training_assistant.run()
```

**Checkpoint:** Do you have an agent with tools configured?

### Part 4: Test Tool Usage (10 min)

Test these scenarios:

**Test 1: Search Courses**
```
What compliance training courses are available?
```
**Expected:** Should use search_courses_tool with type="compliance"

**Test 2: Check Completion**
```
Check what courses jane.smith@hospital.example.com has completed
```
**Expected:** Should use check_completion_tool and show 4 completed courses

**Test 3: Enroll in Course**
```
Enroll john.doe@hospital.example.com in CPR training on 2024-12-10
```
**Expected:** Should use enroll_course_tool and return confirmation

**Test 4: Generate Certificate**
```
Generate a certificate for jane.smith@hospital.example.com for HIPAA training
```
**Expected:** Should use generate_cert_tool and provide download link

**Review Event Log:**
- Watch how the agent decides to use tools
- See the tool inputs and outputs
- Note the reasoning process

**Checkpoint:** Do all tools work as expected?

### Part 5: Debug and Improve (5 min)

Common issues and fixes:

**Problem:** Agent doesn't use the right tool
**Fix:** Make instructions more specific about when to use each tool

**Problem:** Tool returns error
**Fix:** Check the tool function - are parameters being passed correctly?

**Problem:** Agent makes up information instead of using tool
**Fix:** Emphasize in instructions to "ALWAYS use the tools provided"

Try this enhanced instruction snippet:
```
IMPORTANT: You have access to tools for course data. ALWAYS use these tools
rather than making assumptions. If you need course information, use the
search_courses tool. If you need completion status, use check_completion_status.
```

## Deliverables

- ✅ Custom training tools created
- ✅ Training assistant agent with tools
- ✅ All 4 test scenarios passing
- ✅ Understanding of how tools work

## Bonus Challenges

1. **Add a new tool:** Create a `get_course_details(course_id)` tool
2. **Add error handling:** What if someone requests a course that doesn't exist?
3. **Add validation:** Check email format before using tools
4. **Multi-step workflow:** "Enroll me in all compliance courses"

## Discussion Questions

1. When should you create a custom tool vs. using built-in tools?
2. How do you decide what information to include in tool responses?
3. What safety checks should you add before enrolling someone in a course?
4. How would you handle tools that modify data vs. read-only tools?

## Next Steps

Move to **Exercise 3: Multi-Agent Systems** to learn about agent teams!

---

**Need Help?**
- Review example tools in `/examples/02-meeting-room-scheduler.py`
- Check ADK tool documentation
- Ask your instructor
