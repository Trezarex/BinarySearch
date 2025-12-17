import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Users, Clock, Code, Plus, Zap, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { mockUser, mockRooms } from '@/lib/mockData';

export default function LobbyDemo() {
  const [rooms, setRooms] = useState(mockRooms);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Create room form
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isPublic, setIsPublic] = useState(true);
  const [maxUsers, setMaxUsers] = useState(6);

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    const newRoom = {
      room_id: `room-${Date.now()}`,
      title,
      language,
      is_public: isPublic,
      max_users: maxUsers,
      created_by: mockUser.id,
      created_by_name: mockUser.display_name,
      created_at: new Date().toISOString(),
      active_count: 1,
    };

    setRooms([newRoom, ...rooms]);

    toast({
      title: 'Room created! (Demo Mode)',
      description: 'This is a demo. No real room was created.',
    });

    setCreateDialogOpen(false);
    setTitle('');
  };

  const handleQuickJoin = () => {
    toast({
      title: 'Demo Mode',
      description: 'Quick join is disabled in demo mode. Connect backend to enable.',
    });
  };

  const handleJoinRoom = (roomId) => {
    toast({
      title: 'Demo Mode',
      description: 'Room joining is disabled in demo mode. Connect backend to enable.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BinarySearch</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              <AlertCircle className="w-4 h-4" />
              Demo Mode
            </div>
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{mockUser.display_name}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Notice */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Demo Mode Active</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  You're viewing the UI without backend connections. Rooms are mock data.
                  To enable full functionality, set up the backend and configure your .env file.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            size="lg"
            className="h-24 text-lg"
            onClick={handleQuickJoin}
          >
            <Zap className="w-6 h-6 mr-2" />
            Quick Join (Demo)
          </Button>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="h-24 text-lg">
                <Plus className="w-6 h-6 mr-2" />
                Create Room (Demo)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateRoom}>
                <DialogHeader>
                  <DialogTitle>Create a New Room (Demo)</DialogTitle>
                  <DialogDescription>
                    Set up your collaborative coding room (demo only - no real room created)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Room Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Algorithm Practice"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Programming Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select value={isPublic ? 'public' : 'private'} onValueChange={(v) => setIsPublic(v === 'public')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public (visible in lobby)</SelectItem>
                        <SelectItem value="private">Private (invite only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxUsers">Max Participants</Label>
                    <Select value={maxUsers.toString()} onValueChange={(v) => setMaxUsers(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Room (Demo)</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rooms List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Public Rooms (Demo Data)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Card key={room.room_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="truncate">{room.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    {room.language.toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{room.active_count} / {room.max_users} participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Created {formatDistanceToNow(new Date(room.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm">
                    Created by <span className="font-medium">{room.created_by_name}</span>
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleJoinRoom(room.room_id)}
                    disabled={room.active_count >= room.max_users}
                  >
                    {room.active_count >= room.max_users ? 'Room Full' : 'Join Room (Demo)'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
