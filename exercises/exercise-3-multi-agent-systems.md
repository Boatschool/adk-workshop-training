# Exercise 3: Multi-Agent Systems

**Difficulty:** Intermediate to Advanced
**Time:** 60 minutes
**Method:** Visual Agent Builder

## Learning Objectives

By the end of this exercise, you will:
- Understand multi-agent orchestration patterns
- Build a team of specialized agents
- Use the Visual Builder to connect agents
- Test and debug multi-agent workflows

## Scenario

The hospital's Communications Department needs an automated system to create internal newsletters. The workflow involves:

1. **Content Gatherer** - Collects information from various departments
2. **Content Writer** - Writes newsletter sections in an engaging style
3. **Editor** - Reviews for clarity, accuracy, and appropriate tone
4. **Formatter** - Formats the final newsletter with proper structure

This requires multiple specialized agents working together.

## Prerequisites

1. Completed Exercises 1 and 2
2. Understanding of agent basics and tools
3. Visual Agent Builder running

## Multi-Agent Patterns

### Pattern 1: Sequential (Pipeline)
Agents work in order, each processing the previous output.
```
Input → Agent A → Agent B → Agent C → Output
```
**Use for:** Step-by-step transformations, assembly lines

### Pattern 2: Parallel
Agents work simultaneously, results are combined.
```
         ┌─ Agent A ─┐
Input ─┼─ Agent B ─┼─ Combiner → Output
         └─ Agent C ─┘
```
**Use for:** Independent tasks, faster processing

### Pattern 3: Hierarchical
Manager agent delegates to worker agents.
```
Input → Manager → [Worker A, Worker B] → Manager → Output
```
**Use for:** Complex coordination, decision-making

## Instructions

### Part 1: Plan Your Multi-Agent System (10 min)

**Newsletter Creation Workflow:**

```
User Request
     ↓
Coordinator Agent (Manager)
     ↓
Content Gatherer (collects topics/updates)
     ↓
Content Writer (writes sections)
     ↓
Editor (reviews and improves)
     ↓
Formatter (final formatting)
     ↓
Final Newsletter
```

**Agent Responsibilities:**

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| Coordinator | Orchestrates workflow | User request | Final newsletter |
| Content Gatherer | Collects information | Topic list | Raw content points |
| Writer | Creates content | Content points | Written sections |
| Editor | Reviews/improves | Written sections | Edited content |
| Formatter | Final formatting | Edited content | Formatted newsletter |

**Checkpoint:** Do you understand the workflow?

### Part 2: Create Specialized Agents (25 min)

#### Agent 1: Content Gatherer

**In Visual Builder:**
1. New Agent: `content_gatherer`
2. Model: `gemini-2.5-flash`
3. Instructions:

```
You are a content gathering specialist for hospital internal newsletters.

Your job:
- Take a topic or theme for the newsletter
- Identify 3-5 key content areas to cover
- For each area, provide:
  - Section title
  - 3-4 key points or updates
  - Any notable achievements or changes

Content areas might include:
- Department updates
- Employee recognition
- Facility improvements
- Policy changes
- Upcoming events
- Training opportunities

Output format:
Section: [Title]
Points:
- Point 1
- Point 2
- Point 3

Focus on collecting structured information, not writing prose yet.
```

#### Agent 2: Content Writer

1. New Agent: `content_writer`
2. Model: `gemini-2.5-pro` (better for creative writing)
3. Instructions:

```
You are a professional newsletter writer for a healthcare organization.

Your job:
- Take structured content points from the content gatherer
- Write engaging, professional newsletter sections
- Use a warm, informative tone
- Keep sections concise (2-3 paragraphs each)
- Include relevant details without being overly formal

Writing guidelines:
- Start with engaging opening sentences
- Use active voice
- Include specific examples
- End sections with forward-looking statements
- Maintain professional but friendly tone

This is for internal staff communication - be informative and uplifting.
```

#### Agent 3: Editor

1. New Agent: `content_editor`
2. Model: `gemini-2.5-flash`
3. Instructions:

```
You are a professional editor for healthcare communications.

Your job:
- Review written newsletter content
- Check for:
  - Clarity and readability
  - Appropriate tone (professional but warm)
  - Accuracy of information
  - Consistency in style
  - Grammar and spelling

Editing approach:
- Fix any errors
- Improve unclear sentences
- Ensure consistent formatting
- Maintain the writer's voice while enhancing clarity
- Flag any content that seems inappropriate or unclear

Return the edited content with a brief note about changes made.
```

#### Agent 4: Formatter

1. New Agent: `newsletter_formatter`
2. Model: `gemini-2.5-flash`
3. Instructions:

```
You are a newsletter formatting specialist.

Your job:
- Take edited content and create the final formatted newsletter
- Add proper structure with:
  - Newsletter header with date
  - Table of contents
  - Section headers
  - Clear section breaks
  - Closing/footer

Format using markdown:
- # for main title
- ## for section headers
- **bold** for emphasis
- Lists for multiple items
- --- for section breaks

Include:
- Newsletter title: "Hospital Happenings"
- Date: Current date
- Friendly greeting at start
- Professional sign-off at end

Make it visually appealing and easy to scan.
```

#### Agent 5: Coordinator (Manager)

1. New Agent: `newsletter_coordinator`
2. Model: `gemini-2.5-flash`
3. Instructions:

```
You are the newsletter creation coordinator.

Your workflow:
1. Understand what the user wants in the newsletter (theme, topics, focus areas)
2. Delegate to content_gatherer to collect information
3. Pass gathered content to content_writer to write sections
4. Send written content to content_editor for review
5. Give edited content to newsletter_formatter for final formatting
6. Present final newsletter to user

Keep the process moving smoothly. Provide brief updates between steps.
Let the user know when each stage is complete.

Coordinate between all agents to create a high-quality newsletter.
```

**Checkpoint:** Are all 5 agents created?

### Part 3: Connect Agents Visually (10 min)

**In the Visual Builder Canvas:**

1. **Drag agents onto canvas:**
   - Place `newsletter_coordinator` at the top
   - Arrange other agents in workflow order below it

2. **Add agents to coordinator:**
   - Click on `newsletter_coordinator`
   - In the right panel, find "Sub-agents" section
   - Add all 4 specialist agents:
     - content_gatherer
     - content_writer
     - content_editor
     - newsletter_formatter

3. **Verify connections:**
   - The visual canvas should show the coordinator connected to all sub-agents
   - This creates a hierarchical pattern

**Checkpoint:** Can you see the agent connections on the canvas?

### Part 4: Test the Multi-Agent System (10 min)

**Test Scenario 1: Simple Newsletter**
```
Create a newsletter about November updates. Include sections on:
- New parking garage opening
- Employee wellness program launch
- Upcoming holiday schedule
```

**What to watch for:**
1. Coordinator assigns task to content_gatherer
2. Content points are collected
3. Writer creates narrative sections
4. Editor reviews and improves
5. Formatter creates final version

**Check Event Log:**
- See each agent activation
- View handoffs between agents
- Track the content evolution

**Test Scenario 2: Complex Newsletter**
```
Create a year-end newsletter highlighting:
- Top achievements of 2024
- Employee recognition
- Facility improvements
- 2025 priorities
```

**Test Scenario 3: Specific Focus**
```
Create a brief newsletter focused only on training opportunities
and professional development for Q1 2025.
```

**Checkpoint:** Does the multi-agent system produce a complete newsletter?

### Part 5: Debug and Optimize (5 min)

**Common Issues:**

**Problem:** Agents repeat work
**Solution:** Make coordinator instructions clearer about delegation

**Problem:** Information lost between agents
**Solution:** Ensure each agent explicitly passes content forward

**Problem:** Final output missing sections
**Solution:** Check editor and formatter aren't removing content

**Optimization Tips:**

1. **Parallel Processing:** Could content_writer handle multiple sections in parallel?
2. **Caching:** Could you save gathered content for similar newsletters?
3. **Quality Checks:** Add a review step before final output
4. **User Feedback:** Let user approve before final formatting

## Deliverables

- ✅ 5 specialized agents created
- ✅ Agents connected in hierarchical pattern
- ✅ Coordinator successfully orchestrates workflow
- ✅ Complete newsletter generated from test scenarios
- ✅ Understanding of multi-agent coordination

## Bonus Challenges

### Challenge 1: Add Parallel Processing
Modify the system so multiple writers can work on different sections simultaneously.

### Challenge 2: Add Approval Step
Add an agent that presents draft to user for approval before final formatting.

### Challenge 3: Add Data Tools
Create a tool that fetches real department updates from a (simulated) database.

### Challenge 4: Add Quality Metrics
Create an agent that scores the newsletter on readability, engagement, and completeness.

## Comparison of Approaches

**When to use each pattern:**

| Pattern | Best For | Example Use Case |
|---------|----------|------------------|
| Sequential | Step-by-step transformations | Newsletter creation, document processing |
| Parallel | Independent tasks | Gathering info from multiple sources |
| Hierarchical | Complex coordination | Managing multiple workflows |
| Loop | Iterative improvement | Quality refinement, research |

## Discussion Questions

1. What are the advantages of using multiple specialized agents vs. one complex agent?
2. How would you handle errors when one agent in the pipeline fails?
3. What information needs to be passed between agents vs. what can be kept internal?
4. How would you measure the quality of the multi-agent system's output?
5. In what scenarios would parallel processing be better than sequential?

## Real-World Applications

Multi-agent patterns work well for:

**Healthcare Administration:**
- Employee onboarding (gather info → verify → create accounts → notify)
- Report generation (collect data → analyze → format → distribute)
- Request routing (intake → categorize → assign → notify)

**Operations:**
- Facility maintenance (report → assess → assign → verify completion)
- Supply chain (check inventory → order → receive → stock)
- Event planning (propose → coordinate → execute → follow-up)

**Communications:**
- Newsletter creation (gather → write → edit → publish)
- Announcement distribution (draft → approve → format → send)
- FAQ generation (collect questions → research → write → review)

## Tips for Production

1. **Clear Boundaries:** Each agent should have a clear, specific responsibility
2. **Error Handling:** Plan for what happens when an agent fails
3. **Monitoring:** Track which agents are bottlenecks
4. **Testing:** Test each agent independently, then as a system
5. **Documentation:** Document the workflow and each agent's role

## Next Steps

Congratulations! You've built a complete multi-agent system.

**To continue learning:**
- Experiment with different agent architectures
- Try parallel processing patterns
- Add real tools and integrations
- Deploy a simple agent to production
- Explore ADK evaluation frameworks

## Resources

- Multi-agent patterns: https://google.github.io/adk-docs/agents/
- Agent orchestration: https://google.github.io/adk-docs/components/agents/
- Advanced examples: https://github.com/google/adk-samples

---

**Need Help?**
- Review `/examples/03-facilities-ticket-router.py`
- Check Visual Builder Guide
- Ask your instructor
- Experiment and iterate!
