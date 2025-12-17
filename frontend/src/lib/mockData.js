// Mock data for local development without backend

export const mockUser = {
  id: 'mock-user-123',
  email: 'demo@example.com',
  display_name: 'Demo User',
  created_at: new Date().toISOString(),
};

export const mockRooms = [
  {
    room_id: 'room-1',
    title: 'Algorithm Practice',
    language: 'javascript',
    is_public: true,
    max_users: 6,
    created_by: 'user-1',
    created_by_name: 'Alice',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
    active_count: 3,
  },
  {
    room_id: 'room-2',
    title: 'Python Data Structures',
    language: 'python',
    is_public: true,
    max_users: 4,
    created_by: 'user-2',
    created_by_name: 'Bob',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    active_count: 2,
  },
  {
    room_id: 'room-3',
    title: 'LeetCode Daily Challenge',
    language: 'cpp',
    is_public: true,
    max_users: 8,
    created_by: 'user-3',
    created_by_name: 'Charlie',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
    active_count: 5,
  },
  {
    room_id: 'room-4',
    title: 'Web Dev Collaboration',
    language: 'javascript',
    is_public: true,
    max_users: 6,
    created_by: 'user-4',
    created_by_name: 'Diana',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    active_count: 1,
  },
  {
    room_id: 'room-5',
    title: 'Rust Study Group',
    language: 'rust',
    is_public: true,
    max_users: 10,
    created_by: 'user-5',
    created_by_name: 'Eve',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    active_count: 6,
  },
];

export const mockRoom = {
  room_id: 'room-1',
  title: 'Algorithm Practice',
  language: 'javascript',
  is_public: true,
  max_users: 6,
  created_by: 'user-1',
  created_by_name: 'Alice',
  created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  active_count: 3,
  invite_code: null,
};
