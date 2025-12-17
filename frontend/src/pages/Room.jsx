import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomProvider } from '@/lib/liveblocks';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Copy, AlertTriangle } from 'lucide-react';
import CodeEditor from '@/components/Room/CodeEditor';
import Chat from '@/components/Room/Chat';
import Presence from '@/components/Room/Presence';
import VoiceChat from '@/components/Room/VoiceChat';

function RoomContent({ room, currentUser }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportUserId, setReportUserId] = useState('');

  const handleLeaveRoom = async () => {
    try {
      await api.leaveRoom(room.room_id);
      navigate('/');
    } catch (error) {
      console.error('Failed to leave room:', error);
      navigate('/');
    }
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/room/${room.room_id}${
      room.invite_code ? `?invite=${room.invite_code}` : ''
    }`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Invite link copied!',
      description: 'Share this link with others to invite them',
    });
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      await api.reportUser(room.room_id, reportUserId, reportReason);
      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe',
      });
      setReportDialogOpen(false);
      setReportReason('');
      setReportUserId('');
    } catch (error) {
      toast({
        title: 'Failed to submit report',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleLeaveRoom}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave
          </Button>
          <div>
            <h1 className="font-semibold">{room.title}</h1>
            <p className="text-xs text-muted-foreground">
              {room.language.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Presence />
          {!room.is_public && room.invite_code && (
            <Button variant="outline" size="sm" onClick={handleCopyInvite}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Invite
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <CodeEditor language={room.language} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none">
              <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
              <TabsTrigger value="voice" className="flex-1">Voice</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-1 m-0 overflow-hidden">
              <Chat currentUser={currentUser} />
            </TabsContent>
            <TabsContent value="voice" className="flex-1 m-0 p-4">
              <VoiceChat roomId={room.room_id} currentUser={currentUser} />
            </TabsContent>
          </Tabs>

          {/* Report Button */}
          <div className="p-4 border-t">
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleReport}>
                  <DialogHeader>
                    <DialogTitle>Report a User</DialogTitle>
                    <DialogDescription>
                      Help us keep the community safe by reporting inappropriate behavior
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportUserId">User ID</Label>
                      <input
                        id="reportUserId"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Enter user ID from chat"
                        value={reportUserId}
                        onChange={(e) => setReportUserId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reportReason">Reason</Label>
                      <Textarea
                        id="reportReason"
                        placeholder="Describe the issue..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Submit Report</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Room() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const loadRoom = async () => {
    try {
      const roomData = await api.getRoom(roomId);
      setRoom(roomData);
    } catch (error) {
      toast({
        title: 'Room not found',
        description: 'This room may not exist or you may not have access',
        variant: 'destructive',
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading room...</p>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{}}
      initialStorage={{
        code: '// Start coding here!\n',
      }}
    >
      <RoomContent room={room} currentUser={user} />
    </RoomProvider>
  );
}
