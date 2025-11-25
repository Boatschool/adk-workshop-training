# NPI Lookup Agent

## Overview

A placeholder agent intended for National Provider Identifier (NPI) lookup functionality. Currently configured as a minimal template ready for implementation with healthcare provider database integration.

## Agent Configuration

- **Name:** `npi_lookup`
- **Model:** `gemini-2.5-flash`
- **Type:** LlmAgent (single agent)
- **Files:** `root_agent.yaml`

## Current Status

⚠️ **Placeholder** - This agent has a generic instruction and needs implementation.

### What Exists
- Basic YAML structure
- Valid ADK configuration
- Ready for Visual Builder editing

### What's Needed
- Specific NPI lookup instructions
- Integration with NPI Registry API
- Response formatting for provider data

## Intended Capabilities

When fully implemented, this agent should:
- Look up healthcare providers by NPI number
- Search providers by name, specialty, or location
- Return provider details (name, credentials, practice address)
- Validate NPI numbers

## Usage

### Running with ADK CLI

```bash
cd agents
adk web
# Access at http://localhost:8000/dev-ui
```

### Editing in Visual Builder

1. Open Visual Builder at http://localhost:8000/dev-ui
2. Select `npi_lookup` agent
3. Update the instruction with NPI-specific guidance
4. Add tools for NPI Registry API integration

## Implementation Guide

### Step 1: Update Instructions

Replace the generic instruction with domain-specific guidance:

```yaml
instruction: |
  You are an NPI lookup assistant for healthcare organizations.

  Your capabilities:
  - Look up providers by NPI number
  - Search providers by name, specialty, or location
  - Validate NPI number format (10 digits)

  When users provide an NPI:
  - Verify it's a valid 10-digit number
  - Query the NPI Registry
  - Return provider name, credentials, and practice info

  Important:
  - This is for provider lookup only
  - Do not process patient information
```

### Step 2: Add NPI Registry Tool

Create a tool to query the CMS NPI Registry API:

```yaml
tools:
  - name: lookup_npi
    description: Query the NPI Registry for provider information
```

### Step 3: Example Tool Implementation

```python
# tools/npi_tool.py
import httpx

async def lookup_npi(npi: str) -> dict:
    """Query the CMS NPI Registry API."""
    url = f"https://npiregistry.cms.hhs.gov/api/?number={npi}&version=2.1"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()
```

## NPI Registry API Reference

- **Endpoint:** `https://npiregistry.cms.hhs.gov/api/`
- **Version:** 2.1
- **Documentation:** [CMS NPI Registry](https://npiregistry.cms.hhs.gov/api-page)
- **Rate Limits:** Check CMS documentation

## Notes

- NPI numbers are 10-digit unique identifiers
- The CMS NPI Registry is publicly accessible (no API key required)
- Consider caching frequent lookups
- Handle API errors gracefully
