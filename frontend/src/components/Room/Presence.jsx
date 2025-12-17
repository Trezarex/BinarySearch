import { useOthers, useSelf } from '@/lib/liveblocks';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Presence() {
  const others = useOthers();
  const self = useSelf();

  const allUsers = [
    ...(self ? [{ connectionId: self.connectionId, presence: self.presence, info: self.info }] : []),
    ...others.map(other => ({ connectionId: other.connectionId, presence: other.presence, info: other.info }))
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getColorForUser = (index) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {allUsers.length} {allUsers.length === 1 ? 'person' : 'people'} in room
      </span>
      <div className="flex -space-x-2">
        {allUsers.map((user, index) => (
          <Avatar
            key={user.connectionId}
            className={`border-2 border-background ${getColorForUser(index)}`}
          >
            <AvatarFallback className="text-white">
              {getInitials(user.info?.name || 'User')}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
}
