import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

export default function VoiceChat({ roomId, currentUser }) {
  const [inVoice, setInVoice] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const callFrameRef = useRef(null);
  const containerRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load Daily.co script
    if (!window.DailyIframe) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@daily-co/daily-js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
    };
  }, []);

  const joinVoice = async () => {
    setLoading(true);
    try {
      const { token, room_url } = await api.getDailyToken(roomId);

      // Wait for Daily script to load
      while (!window.DailyIframe) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create call frame
      callFrameRef.current = window.DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: false,
        showFullscreenButton: false,
        iframeStyle: {
          width: '100%',
          height: '200px',
          border: '0',
          borderRadius: '8px',
        },
      });

      // Join the call
      await callFrameRef.current.join({ url: room_url, token });
      setInVoice(true);

      toast({
        title: 'Joined voice chat',
        description: 'You are now connected to voice',
      });

      // Listen for events
      callFrameRef.current.on('left-meeting', () => {
        setInVoice(false);
        setMuted(false);
      });

    } catch (error) {
      toast({
        title: 'Failed to join voice',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const leaveVoice = async () => {
    if (callFrameRef.current) {
      await callFrameRef.current.leave();
      callFrameRef.current.destroy();
      callFrameRef.current = null;
      setInVoice(false);
      setMuted(false);

      toast({
        title: 'Left voice chat',
        description: 'You have disconnected from voice',
      });
    }
  };

  const toggleMute = async () => {
    if (callFrameRef.current) {
      const newMutedState = !muted;
      await callFrameRef.current.setLocalAudio(!newMutedState);
      setMuted(newMutedState);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Voice Chat</h3>
        <div className="flex gap-2">
          {inVoice && (
            <Button
              variant={muted ? 'destructive' : 'secondary'}
              size="sm"
              onClick={toggleMute}
            >
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}
          <Button
            variant={inVoice ? 'destructive' : 'default'}
            size="sm"
            onClick={inVoice ? leaveVoice : joinVoice}
            disabled={loading}
          >
            {inVoice ? (
              <>
                <PhoneOff className="w-4 h-4 mr-1" />
                Leave
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-1" />
                Join Voice
              </>
            )}
          </Button>
        </div>
      </div>

      <div ref={containerRef} className={inVoice ? 'block' : 'hidden'} />

      {!inVoice && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Click "Join Voice" to start talking with others
        </p>
      )}
    </div>
  );
}
