from google.cloud import bigquery
from datetime import datetime
from typing import Optional, Dict
import json
from app.config import settings


class BigQueryLogger:
    """
    Logger for analytics events to BigQuery.
    """
    def __init__(self):
        self.client = None
        self.enabled = False
        try:
            self.client = bigquery.Client(project=settings.GOOGLE_CLOUD_PROJECT)
            self.enabled = True
        except Exception as e:
            print(f"BigQuery client initialization failed: {e}")
            print("Analytics logging disabled. Set up Google Cloud credentials to enable.")

    def _get_table_id(self, table_name: str) -> str:
        return f"{settings.GOOGLE_CLOUD_PROJECT}.{settings.BIGQUERY_DATASET}.{table_name}"

    def log_event(self, event_type: str, user_id: str, room_id: str,
                  metadata: Optional[Dict] = None):
        """Log an analytics event to BigQuery"""
        if not self.enabled:
            print(f"[Analytics] {event_type}: user={user_id}, room={room_id}")
            return

        try:
            table_id = self._get_table_id("events")
            rows_to_insert = [{
                "event_id": f"{user_id}_{room_id}_{event_type}_{datetime.utcnow().timestamp()}",
                "event_type": event_type,
                "user_id": user_id,
                "room_id": room_id,
                "metadata": json.dumps(metadata) if metadata else None,
                "timestamp": datetime.utcnow().isoformat()
            }]

            errors = self.client.insert_rows_json(table_id, rows_to_insert)
            if errors:
                print(f"BigQuery insert errors: {errors}")
        except Exception as e:
            print(f"Failed to log event to BigQuery: {e}")

    def log_room_session(self, room_id: str, room_title: str, created_by: str,
                         started_at: datetime, ended_at: Optional[datetime] = None,
                         participants: Optional[list] = None):
        """Log a room session to BigQuery"""
        if not self.enabled:
            return

        try:
            table_id = self._get_table_id("room_sessions")
            rows_to_insert = [{
                "session_id": f"{room_id}_{started_at.timestamp()}",
                "room_id": room_id,
                "room_title": room_title,
                "created_by": created_by,
                "started_at": started_at.isoformat(),
                "ended_at": ended_at.isoformat() if ended_at else None,
                "participants": json.dumps(participants) if participants else None,
                "participant_count": len(participants) if participants else 0
            }]

            errors = self.client.insert_rows_json(table_id, rows_to_insert)
            if errors:
                print(f"BigQuery insert errors: {errors}")
        except Exception as e:
            print(f"Failed to log room session to BigQuery: {e}")

    def log_report(self, reporter_id: str, reported_user_id: str,
                   room_id: str, reason: str):
        """Log a user report to BigQuery"""
        if not self.enabled:
            print(f"[Report] Reporter={reporter_id}, Reported={reported_user_id}, Reason={reason}")
            return

        try:
            table_id = self._get_table_id("reports")
            rows_to_insert = [{
                "report_id": f"{reporter_id}_{reported_user_id}_{datetime.utcnow().timestamp()}",
                "reporter_id": reporter_id,
                "reported_user_id": reported_user_id,
                "room_id": room_id,
                "reason": reason,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "pending"
            }]

            errors = self.client.insert_rows_json(table_id, rows_to_insert)
            if errors:
                print(f"BigQuery insert errors: {errors}")
        except Exception as e:
            print(f"Failed to log report to BigQuery: {e}")


# Global BigQuery logger instance
bq_logger = BigQueryLogger()
