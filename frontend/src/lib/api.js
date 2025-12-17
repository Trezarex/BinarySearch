const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new APIError(data?.detail || 'An error occurred', response.status);
  }

  return data;
}

export const api = {
  // Auth
  signup: (email, password, displayName) =>
    fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        display_name: displayName,
      }),
      skipAuth: true,
    }),

  login: (email, password) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),

  me: () => fetchAPI('/auth/me'),

  // Rooms
  createRoom: (title, language, isPublic, maxUsers) =>
    fetchAPI('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        title,
        language,
        is_public: isPublic,
        max_users: maxUsers,
      }),
    }),

  listRooms: () => fetchAPI('/rooms'),

  getRoom: (roomId) => fetchAPI(`/rooms/${roomId}`),

  joinRoom: (roomId, inviteCode = null) =>
    fetchAPI(`/rooms/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
    }),

  leaveRoom: (roomId) =>
    fetchAPI(`/rooms/${roomId}/leave`, {
      method: 'POST',
    }),

  quickJoin: () => fetchAPI('/rooms/quick-join/find'),

  // Liveblocks
  getLiveblocksToken: (room) =>
    fetchAPI('/liveblocks/auth', {
      method: 'POST',
      body: JSON.stringify({ room }),
    }),

  // Daily
  getDailyToken: (roomId) =>
    fetchAPI('/daily/token', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId }),
    }),

  // Moderation
  kickUser: (roomId, userId) =>
    fetchAPI('/moderation/kick', {
      method: 'POST',
      body: JSON.stringify({
        room_id: roomId,
        user_id: userId,
      }),
    }),

  reportUser: (roomId, reportedUserId, reason) =>
    fetchAPI('/moderation/report', {
      method: 'POST',
      body: JSON.stringify({
        room_id: roomId,
        reported_user_id: reportedUserId,
        reason,
      }),
    }),

  // Analytics
  logEvent: (eventType, userId, roomId, metadata = null) =>
    fetchAPI('/events/log', {
      method: 'POST',
      body: JSON.stringify({
        event_type: eventType,
        user_id: userId,
        room_id: roomId,
        metadata,
      }),
    }),
};

export { APIError };
