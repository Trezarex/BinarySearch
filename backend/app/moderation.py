from datetime import datetime, timedelta
from typing import Dict, Set


class ModerationManager:
    """
    In-memory moderation manager for MVP.
    In production, use Redis or a proper database.
    """
    def __init__(self):
        # room_id -> set of kicked user_ids with expiry
        self.kicked_users: Dict[str, Dict[str, datetime]] = {}

    def kick_user(self, room_id: str, user_id: str, duration_minutes: int = 10):
        """Kick a user from a room for a specified duration"""
        if room_id not in self.kicked_users:
            self.kicked_users[room_id] = {}

        expiry = datetime.utcnow() + timedelta(minutes=duration_minutes)
        self.kicked_users[room_id][user_id] = expiry

    def is_user_kicked(self, room_id: str, user_id: str) -> bool:
        """Check if a user is currently kicked from a room"""
        if room_id not in self.kicked_users:
            return False

        if user_id not in self.kicked_users[room_id]:
            return False

        expiry = self.kicked_users[room_id][user_id]
        if datetime.utcnow() > expiry:
            # Kick expired, remove it
            del self.kicked_users[room_id][user_id]
            return False

        return True

    def cleanup_expired_kicks(self):
        """Remove expired kicks (call periodically)"""
        current_time = datetime.utcnow()
        for room_id in list(self.kicked_users.keys()):
            for user_id in list(self.kicked_users[room_id].keys()):
                if current_time > self.kicked_users[room_id][user_id]:
                    del self.kicked_users[room_id][user_id]

            # Remove empty room entries
            if not self.kicked_users[room_id]:
                del self.kicked_users[room_id]


# Global moderation manager
moderation = ModerationManager()
