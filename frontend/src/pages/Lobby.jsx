import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Users, Clock, Code, Plus, Zap, LogOut } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Lobby() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [quickJoining, setQuickJoining] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Create room form
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isPublic, setIsPublic] = useState(true);
  const [maxUsers, setMaxUsers] = useState(6);

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const data = await api.listRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const room = await api.createRoom(title, language, isPublic, maxUsers);
      toast({
        title: 'Room created!',
        description: isPublic ? 'Your room is now public' : 'Share the invite code with others',
      });
      setCreateDialogOpen(false);
      navigate(`/room/${room.room_id}`);
    } catch (error) {
      toast({
        title: 'Failed to create room',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleQuickJoin = async () => {
    setQuickJoining(true);
    try {
      const result = await api.quickJoin();
      toast({
        title: result.created ? 'Room created!' : 'Joined room!',
        description: result.created ? 'No available rooms, created a new one' : 'Found an active room for you',
      });
      navigate(`/room/${result.room.room_id}`);
    } catch (error) {
      toast({
        title: 'Quick join failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setQuickJoining(false);
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      await api.joinRoom(roomId);
      navigate(`/room/${roomId}`);
    } catch (error) {
      toast({
        title: 'Failed to join room',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BinarySearch</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{user?.display_name}</span>
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            size="lg"
            className="h-24 text-lg"
            onClick={handleQuickJoin}
            disabled={quickJoining}
          >
            <Zap className="w-6 h-6 mr-2" />
            {quickJoining ? 'Finding room...' : 'Quick Join'}
          </Button>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="h-24 text-lg">
                <Plus className="w-6 h-6 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateRoom}>
                <DialogHeader>
                  <DialogTitle>Create a New Room</DialogTitle>
                  <DialogDescription>
                    Set up your collaborative coding room
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
                  <Button type="submit">Create Room</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rooms List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Public Rooms</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading rooms...</p>
          ) : rooms.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No active rooms right now. Be the first to create one!</p>
              </CardContent>
            </Card>
          ) : (
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
                      {room.active_count >= room.max_users ? 'Room Full' : 'Join Room'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
