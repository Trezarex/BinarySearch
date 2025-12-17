from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
import httpx
import time
from typing import List

from app.config import settings
from app.models import (
    UserCreate, UserLogin, Token, User, RoomCreate, Room,
    RoomJoin, LiveblocksAuthRequest, DailyRoomRequest,
    KickUserRequest, ReportUserRequest, AnalyticsEvent
)
from app.auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_user
)
from app.database import db
from app.moderation import moderation
from app.bigquery_logger import bq_logger

app = FastAPI(title="BinarySearch API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}


# ==================== AUTH ENDPOINTS ====================

@app.post("/auth/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = db.create_user(
        email=user_data.email,
        display_name=user_data.display_name,
        hashed_password=hashed_password
    )

    # Create access token
    access_token = create_access_token(data={"sub": user.id})

    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login with email and password"""
    user = authenticate_user(credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


# ==================== ROOM ENDPOINTS ====================

@app.post("/rooms", response_model=Room, status_code=status.HTTP_201_CREATED)
async def create_room(
    room_data: RoomCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new room"""
    room = db.create_room(
        title=room_data.title,
        language=room_data.language.value,
        is_public=room_data.is_public,
        max_users=room_data.max_users,
        created_by=current_user.id,
        created_by_name=current_user.display_name
    )

    # Log room creation
    bq_logger.log_room_session(
        room_id=room.room_id,
        room_title=room.title,
        created_by=current_user.id,
        started_at=room.created_at
    )

    return room


@app.get("/rooms", response_model=List[Room])
async def list_rooms(current_user: User = Depends(get_current_user)):
    """List all public rooms"""
    rooms = db.get_public_rooms()
    return rooms


@app.get("/rooms/{room_id}", response_model=Room)
async def get_room(room_id: str, current_user: User = Depends(get_current_user)):
    """Get room details"""
    room = db.get_room(room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    return room


@app.post("/rooms/{room_id}/join")
async def join_room(
    room_id: str,
    join_data: RoomJoin,
    current_user: User = Depends(get_current_user)
):
    """Join a room"""
    room = db.get_room(room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Check if user is kicked
    if moderation.is_user_kicked(room_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have been temporarily banned from this room"
        )

    # Check if room is full
    if db.is_room_full(room_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is full"
        )

    # For private rooms, check invite code
    if not room.is_public:
        if not join_data.invite_code or join_data.invite_code != room.invite_code:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid invite code"
            )

    # Add participant
    db.add_participant(room_id, current_user.id)

    # Log join event
    bq_logger.log_event(
        event_type="room_join",
        user_id=current_user.id,
        room_id=room_id,
        metadata={"display_name": current_user.display_name}
    )

    return {"success": True, "room": room}


@app.post("/rooms/{room_id}/leave")
async def leave_room(
    room_id: str,
    current_user: User = Depends(get_current_user)
):
    """Leave a room"""
    room = db.get_room(room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Remove participant
    db.remove_participant(room_id, current_user.id)

    # Log leave event
    bq_logger.log_event(
        event_type="room_leave",
        user_id=current_user.id,
        room_id=room_id
    )

    return {"success": True}


@app.get("/rooms/quick-join/find")
async def quick_join(current_user: User = Depends(get_current_user)):
    """Find an available public room or create a new one"""
    # Try to find a room with fewer than 5 people
    room = db.find_available_public_room(max_participants=5)

    if room:
        # Join the found room
        db.add_participant(room.room_id, current_user.id)
        bq_logger.log_event(
            event_type="room_join",
            user_id=current_user.id,
            room_id=room.room_id,
            metadata={"quick_join": True}
        )
        return {"room": room, "created": False}
    else:
        # Create a new room
        new_room = db.create_room(
            title=f"{current_user.display_name}'s Room",
            language="javascript",
            is_public=True,
            max_users=6,
            created_by=current_user.id,
            created_by_name=current_user.display_name
        )
        db.add_participant(new_room.room_id, current_user.id)

        bq_logger.log_room_session(
            room_id=new_room.room_id,
            room_title=new_room.title,
            created_by=current_user.id,
            started_at=new_room.created_at
        )
        bq_logger.log_event(
            event_type="room_join",
            user_id=current_user.id,
            room_id=new_room.room_id,
            metadata={"quick_join": True, "auto_created": True}
        )

        return {"room": new_room, "created": True}


# ==================== LIVEBLOCKS ENDPOINTS ====================

@app.post("/liveblocks/auth")
async def liveblocks_auth(
    auth_request: LiveblocksAuthRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate Liveblocks access token for a room.
    This endpoint is called by Liveblocks client SDK.
    """
    room_id = auth_request.room

    # Verify room exists
    room = db.get_room(room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Check if user is kicked
    if moderation.is_user_kicked(room_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are banned from this room"
        )

    # Create Liveblocks token
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.liveblocks.io/v2/rooms/{}/authorize".format(room_id),
                headers={
                    "Authorization": f"Bearer {settings.LIVEBLOCKS_SECRET_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "userId": current_user.id,
                    "userInfo": {
                        "name": current_user.display_name,
                        "email": current_user.email
                    }
                },
                timeout=10.0
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to generate Liveblocks token"
                )

            return response.json()

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Liveblocks API error: {str(e)}"
        )


# ==================== DAILY.CO ENDPOINTS ====================

@app.post("/daily/token")
async def get_daily_token(
    request: DailyRoomRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get Daily.co room token for voice chat.
    Creates a Daily room if it doesn't exist.
    """
    room_id = request.room_id

    # Verify room exists
    room = db.get_room(room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Check if user is kicked
    if moderation.is_user_kicked(room_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are banned from this room"
        )

    daily_room_name = f"binarysearch-{room_id}"

    try:
        async with httpx.AsyncClient() as client:
            # Create or get Daily room
            room_response = await client.post(
                "https://api.daily.co/v1/rooms",
                headers={
                    "Authorization": f"Bearer {settings.DAILY_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "name": daily_room_name,
                    "properties": {
                        "max_participants": room.max_users,
                        "enable_chat": False,
                        "enable_screenshare": True,
                        "start_video_off": True,
                        "start_audio_off": False
                    }
                },
                timeout=10.0
            )

            # Room might already exist (409), which is fine
            if room_response.status_code not in [200, 409]:
                print(f"Daily room creation failed: {room_response.text}")

            # Create meeting token
            token_response = await client.post(
                "https://api.daily.co/v1/meeting-tokens",
                headers={
                    "Authorization": f"Bearer {settings.DAILY_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "properties": {
                        "room_name": daily_room_name,
                        "user_name": current_user.display_name,
                        "enable_screenshare": True,
                        "start_video_off": True,
                        "start_audio_off": False
                    }
                },
                timeout=10.0
            )

            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to generate Daily token"
                )

            token_data = token_response.json()

            # Log voice join
            bq_logger.log_event(
                event_type="voice_join",
                user_id=current_user.id,
                room_id=room_id
            )

            return {
                "token": token_data["token"],
                "room_url": f"https://{settings.DAILY_DOMAIN}/{daily_room_name}"
            }

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Daily API error: {str(e)}"
        )


# ==================== MODERATION ENDPOINTS ====================

@app.post("/moderation/kick")
async def kick_user(
    request: KickUserRequest,
    current_user: User = Depends(get_current_user)
):
    """Kick a user from a room (room owner only)"""
    room = db.get_room(request.room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Only room owner can kick
    if room.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only room owner can kick users"
        )

    # Kick the user
    moderation.kick_user(request.room_id, request.user_id, duration_minutes=10)
    db.remove_participant(request.room_id, request.user_id)

    # Log kick event
    bq_logger.log_event(
        event_type="user_kicked",
        user_id=request.user_id,
        room_id=request.room_id,
        metadata={"kicked_by": current_user.id}
    )

    return {"success": True, "message": "User kicked for 10 minutes"}


@app.post("/moderation/report")
async def report_user(
    request: ReportUserRequest,
    current_user: User = Depends(get_current_user)
):
    """Report a user for inappropriate behavior"""
    room = db.get_room(request.room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Log report
    bq_logger.log_report(
        reporter_id=current_user.id,
        reported_user_id=request.reported_user_id,
        room_id=request.room_id,
        reason=request.reason
    )

    bq_logger.log_event(
        event_type="user_reported",
        user_id=request.reported_user_id,
        room_id=request.room_id,
        metadata={
            "reporter_id": current_user.id,
            "reason": request.reason
        }
    )

    return {"success": True, "message": "Report submitted"}


# ==================== ANALYTICS ENDPOINTS ====================

@app.post("/events/log")
async def log_event(
    event: AnalyticsEvent,
    current_user: User = Depends(get_current_user)
):
    """Log an analytics event"""
    # Verify the user is logging their own events
    if event.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot log events for other users"
        )

    bq_logger.log_event(
        event_type=event.event_type.value,
        user_id=event.user_id,
        room_id=event.room_id,
        metadata=event.metadata
    )

    return {"success": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
