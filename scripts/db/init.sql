-- Initialize database with shared schema for multi-tenant architecture

-- Create shared schema for platform metadata
CREATE SCHEMA IF NOT EXISTS adk_platform_shared;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA adk_platform_shared TO adk_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA adk_platform_shared TO adk_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA adk_platform_shared TO adk_user;

-- Set search path
ALTER DATABASE adk_platform SET search_path TO adk_platform_shared, public;
