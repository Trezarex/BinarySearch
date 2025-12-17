-- BinarySearch BigQuery Schemas
-- Run these commands in Google Cloud Console or bq CLI to set up your BigQuery tables

-- Create the dataset
CREATE SCHEMA IF NOT EXISTS `your-project-id.binarysearch`
OPTIONS (
  description = "BinarySearch analytics and logs",
  location = "US"
);

-- Table 1: Events
-- Logs all user events (joins, leaves, voice activity, messages, etc.)
CREATE OR REPLACE TABLE `your-project-id.binarysearch.events` (
  event_id STRING NOT NULL,
  event_type STRING NOT NULL,
  user_id STRING NOT NULL,
  room_id STRING NOT NULL,
  metadata STRING,
  timestamp TIMESTAMP NOT NULL
)
PARTITION BY DATE(timestamp)
CLUSTER BY event_type, user_id
OPTIONS (
  description = "All user events in the platform",
  labels = [("app", "binarysearch")]
);

-- Table 2: Room Sessions
-- Logs room lifecycle (creation, participants, duration)
CREATE OR REPLACE TABLE `your-project-id.binarysearch.room_sessions` (
  session_id STRING NOT NULL,
  room_id STRING NOT NULL,
  room_title STRING NOT NULL,
  created_by STRING NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  participants STRING,
  participant_count INT64
)
PARTITION BY DATE(started_at)
CLUSTER BY room_id, created_by
OPTIONS (
  description = "Room session logs with participants and duration",
  labels = [("app", "binarysearch")]
);

-- Table 3: Reports
-- User reports for moderation
CREATE OR REPLACE TABLE `your-project-id.binarysearch.reports` (
  report_id STRING NOT NULL,
  reporter_id STRING NOT NULL,
  reported_user_id STRING NOT NULL,
  room_id STRING NOT NULL,
  reason STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  status STRING NOT NULL
)
PARTITION BY DATE(timestamp)
CLUSTER BY reported_user_id, status
OPTIONS (
  description = "User reports for moderation",
  labels = [("app", "binarysearch")]
);

-- Table 4: Submissions (Optional)
-- Code submissions if you add a "run code" feature later
CREATE OR REPLACE TABLE `your-project-id.binarysearch.submissions` (
  submission_id STRING NOT NULL,
  user_id STRING NOT NULL,
  room_id STRING NOT NULL,
  language STRING NOT NULL,
  code STRING NOT NULL,
  output STRING,
  status STRING,
  submitted_at TIMESTAMP NOT NULL,
  execution_time_ms INT64
)
PARTITION BY DATE(submitted_at)
CLUSTER BY user_id, language
OPTIONS (
  description = "Code submissions and execution results",
  labels = [("app", "binarysearch")]
);

-- ========================================
-- Example Queries
-- ========================================

-- Query 1: Most active users by event count
-- SELECT
--   user_id,
--   COUNT(*) as event_count,
--   COUNTIF(event_type = 'room_join') as rooms_joined,
--   COUNTIF(event_type = 'voice_join') as voice_sessions
-- FROM `your-project-id.binarysearch.events`
-- WHERE DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
-- GROUP BY user_id
-- ORDER BY event_count DESC
-- LIMIT 100;

-- Query 2: Room statistics
-- SELECT
--   room_id,
--   room_title,
--   COUNT(DISTINCT session_id) as total_sessions,
--   AVG(participant_count) as avg_participants,
--   MAX(participant_count) as max_participants
-- FROM `your-project-id.binarysearch.room_sessions`
-- WHERE DATE(started_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
-- GROUP BY room_id, room_title
-- ORDER BY total_sessions DESC
-- LIMIT 50;

-- Query 3: Daily active users
-- SELECT
--   DATE(timestamp) as date,
--   COUNT(DISTINCT user_id) as daily_active_users,
--   COUNT(*) as total_events
-- FROM `your-project-id.binarysearch.events`
-- WHERE DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
-- GROUP BY date
-- ORDER BY date DESC;

-- Query 4: Pending reports for moderation
-- SELECT
--   report_id,
--   reported_user_id,
--   room_id,
--   reason,
--   timestamp,
--   status
-- FROM `your-project-id.binarysearch.reports`
-- WHERE status = 'pending'
-- ORDER BY timestamp DESC;
