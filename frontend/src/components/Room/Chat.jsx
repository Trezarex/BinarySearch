import { useState, useEffect, useRef } from 'react';
import { useRoom } from '@/lib/liveblocks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Chat({ currentUser }) {
  const room = useRoom();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!room) return;

    // Subscribe to broadcast events for chat messages
    const unsubscribe = room.subscribe('chat-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return unsubscribe;
  }, [room]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      text: inputMessage,
      userId: currentUser.id,
      userName: currentUser.display_name,
      timestamp: new Date().toISOString(),
    };

    room.broadcastEvent({ type: 'chat-message', ...message });
    setMessages((prev) => [...prev, message]);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Chat</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{msg.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{msg.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
