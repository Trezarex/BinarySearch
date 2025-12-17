from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Auth Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    display_name: str = Field(..., min_length=2, max_length=50)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class User(BaseModel):
    id: str
    email: str
    display_name: str
    created_at: datetime


class UserInDB(User):
    hashed_password: str


# Room Models
class ProgrammingLanguage(str, Enum):
    JAVASCRIPT = "javascript"
    PYTHON = "python"
    JAVA = "java"
    CPP = "cpp"
    GO = "go"
    RUST = "rust"


class RoomCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    language: ProgrammingLanguage = ProgrammingLanguage.JAVASCRIPT
    is_public: bool = True
    max_users: int = Field(default=6, ge=2, le=20)


class Room(BaseModel):
    room_id: str
    title: str
    language: str
    is_public: bool
    max_users: int
    created_by: str
    created_by_name: str
    created_at: datetime
    active_count: int = 0
    invite_code: Optional[str] = None


class RoomJoin(BaseModel):
    invite_code: Optional[str] = None


# Liveblocks Models
class LiveblocksAuthRequest(BaseModel):
    room: str


# Daily Models
class DailyRoomRequest(BaseModel):
    room_id: str


# Moderation Models
class KickUserRequest(BaseModel):
    user_id: str
    room_id: str


class ReportUserRequest(BaseModel):
    reported_user_id: str
    room_id: str
    reason: str = Field(..., max_length=500)


# Analytics Models
class EventType(str, Enum):
    ROOM_JOIN = "room_join"
    ROOM_LEAVE = "room_leave"
    VOICE_JOIN = "voice_join"
    VOICE_LEAVE = "voice_leave"
    MESSAGE_SENT = "message_sent"
    USER_KICKED = "user_kicked"
    USER_REPORTED = "user_reported"


class AnalyticsEvent(BaseModel):
    event_type: EventType
    user_id: str
    room_id: str
    metadata: Optional[dict] = None
