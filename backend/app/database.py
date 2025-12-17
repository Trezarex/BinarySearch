from typing import Dict, List, Optional
from datetime import datetime
import uuid
from app.models import UserInDB, Room


class Database:
    """
    In-memory database for MVP.
    In production, replace with PostgreSQL/MongoDB.
    """
    def __init__(self):
        self.users: Dict[str, UserInDB] = {}
        self.users_by_email: Dict[str, str] = {}  # email -> user_id
        self.rooms: Dict[str, Room] = {}
        self.room_participants: Dict[str, set] = {}  # room_id -> set of user_ids
        self.active_rooms: List[str] = []  # List of active public room IDs

    # User methods
    def create_user(self, email: str, display_name: str, hashed_password: str) -> UserInDB:
        user_id = str(uuid.uuid4())
        user = UserInDB(
            id=user_id,
            email=email,
            display_name=display_name,
            hashed_password=hashed_password,
            created_at=datetime.utcnow()
        )
        self.users[user_id] = user
        self.users_by_email[email.lower()] = user_id
        return user

    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        user_id = self.users_by_email.get(email.lower())
        if user_id:
            return self.users.get(user_id)
        return None

    def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        return self.users.get(user_id)

    # Room methods
    def create_room(self, title: str, language: str, is_public: bool,
                   max_users: int, created_by: str, created_by_name: str) -> Room:
        room_id = str(uuid.uuid4())
        invite_code = None if is_public else str(uuid.uuid4())[:8]

        room = Room(
            room_id=room_id,
            title=title,
            language=language,
            is_public=is_public,
            max_users=max_users,
            created_by=created_by,
            created_by_name=created_by_name,
            created_at=datetime.utcnow(),
            active_count=0,
            invite_code=invite_code
        )
        self.rooms[room_id] = room
        self.room_participants[room_id] = set()

        if is_public:
            self.active_rooms.append(room_id)

        return room

    def get_room(self, room_id: str) -> Optional[Room]:
        return self.rooms.get(room_id)

    def get_public_rooms(self) -> List[Room]:
        """Get all active public rooms sorted by creation time (newest first)"""
        public_rooms = [
            room for room in self.rooms.values()
            if room.is_public
        ]
        return sorted(public_rooms, key=lambda x: x.created_at, reverse=True)

    def add_participant(self, room_id: str, user_id: str):
        if room_id in self.room_participants:
            self.room_participants[room_id].add(user_id)
            if room_id in self.rooms:
                self.rooms[room_id].active_count = len(self.room_participants[room_id])

    def remove_participant(self, room_id: str, user_id: str):
        if room_id in self.room_participants:
            self.room_participants[room_id].discard(user_id)
            if room_id in self.rooms:
                self.rooms[room_id].active_count = len(self.room_participants[room_id])

    def get_room_participants(self, room_id: str) -> set:
        return self.room_participants.get(room_id, set())

    def is_room_full(self, room_id: str) -> bool:
        room = self.get_room(room_id)
        if not room:
            return True
        participants = self.get_room_participants(room_id)
        return len(participants) >= room.max_users

    def find_available_public_room(self, max_participants: int = 5) -> Optional[Room]:
        """Find a public room with fewer than max_participants people"""
        for room in self.get_public_rooms():
            if room.active_count < max_participants and room.active_count < room.max_users:
                return room
        return None


# Global database instance
db = Database()
