import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  PhoneOff,
  Circle,
  Square,
  Copy,
  Users,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
}

const VideoCall: React.FC = () => {
  const { user } = useUser();
  
  // State
  const [roomCode, setRoomCode] = useState<string>("");
  const [joinRoomCode, setJoinRoomCode] = useState<string>("");
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string>("");
  
  // Media state
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoomRef = useRef<string>("");
  
  // ICE servers for WebRTC
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Initialize local media
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError("Could not access camera/microphone. Please grant permissions.");
      throw err;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(iceServers);
    
    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }
    
    // Handle remote track
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    
    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && currentRoomRef.current) {
        try {
          await axiosInstance.post(`/signaling/signal/${currentRoomRef.current}`, {
            from: user?._id,
            to: "all",
            type: "ice-candidate",
            data: event.candidate,
          });
        } catch (err) {
          console.error("Error sending ICE candidate:", err);
        }
      }
    };
    
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setIsConnecting(false);
      }
    };
    
    peerConnectionRef.current = pc;
    return pc;
  }, [user]);

  // Poll for signaling data
  const startPolling = useCallback((roomCodeValue: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axiosInstance.get(
          `/signaling/room/${roomCodeValue}?userId=${user?._id}`
        );
        
        if (response.data.success) {
          setParticipants(response.data.room.participants);
          
          // Process signals
          for (const signal of response.data.signals) {
            await handleSignal(signal);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);
  }, [user]);

  // Handle incoming signals
  const handleSignal = async (signal: any) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;
    
    try {
      if (signal.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        await axiosInstance.post(`/signaling/signal/${currentRoomRef.current}`, {
          from: user?._id,
          to: signal.from,
          type: "answer",
          data: answer,
        });
      } else if (signal.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
      } else if (signal.type === "ice-candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(signal.data));
      }
    } catch (err) {
      console.error("Error handling signal:", err);
    }
  };

  // Create a new room
  const createRoom = async () => {
    if (!user) return;
    
    setIsConnecting(true);
    setError("");
    
    try {
      // First create the room on server
      const response = await axiosInstance.post("/signaling/create-room", {
        userId: user._id,
        userName: user.name,
      });
      
      if (response.data.success) {
        const newRoomCode = response.data.roomCode;
        setRoomCode(newRoomCode);
        currentRoomRef.current = newRoomCode;
        setParticipants([{ id: user._id, name: user.name }]);
        
        // Then try to initialize media
        try {
          await initializeMedia();
          createPeerConnection();
        } catch (mediaErr) {
          console.error("Media access error:", mediaErr);
          setError("Camera/microphone access denied. Please grant permissions and try again.");
          // Still stay in room but without video
        }
        
        setIsInCall(true);
        startPolling(newRoomCode);
        setIsConnecting(false);
      }
    } catch (err: any) {
      console.error("Error creating room:", err);
      setError(err.response?.data?.error || "Failed to create room. Please check your connection.");
      setIsConnecting(false);
    }
  };

  // Join an existing room
  const joinRoom = async () => {
    if (!user || !joinRoomCode.trim()) return;
    
    setIsConnecting(true);
    setError("");
    
    try {
      // First join the room on server
      const response = await axiosInstance.post("/signaling/join-room", {
        roomCode: joinRoomCode.toUpperCase(),
        userId: user._id,
        userName: user.name,
      });
      
      if (response.data.success) {
        const joinedRoomCode = joinRoomCode.toUpperCase();
        setRoomCode(joinedRoomCode);
        currentRoomRef.current = joinedRoomCode;
        setParticipants(response.data.room.participants);
        
        // Then try to initialize media
        try {
          await initializeMedia();
          const pc = createPeerConnection();
          
          // Create and send offer to existing participants
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          await axiosInstance.post(`/signaling/signal/${joinedRoomCode}`, {
            from: user._id,
            to: "all",
            type: "offer",
            data: offer,
          });
        } catch (mediaErr) {
          console.error("Media access error:", mediaErr);
          setError("Camera/microphone access denied. Please grant permissions and try again.");
          // Still stay in room but without video
        }
        
        setIsInCall(true);
        startPolling(joinedRoomCode);
        setIsConnecting(false);
      }
    } catch (err: any) {
      console.error("Error joining room:", err);
      setError(err.response?.data?.error || "Failed to join room. Please check the room code.");
      setIsConnecting(false);
    }
  };

  // Leave the call
  const leaveCall = async () => {
    // Stop polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    
    // Stop screen share
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    
    // Notify server
    if (currentRoomRef.current && user) {
      try {
        await axiosInstance.post("/signaling/leave-room", {
          roomCode: currentRoomRef.current,
          userId: user._id,
        });
      } catch (err) {
        console.error("Error leaving room:", err);
      }
    }
    
    // Reset state
    currentRoomRef.current = "";
    setRoomCode("");
    setJoinRoomCode("");
    setIsInCall(false);
    setIsConnecting(false);
    setParticipants([]);
    setIsScreenSharing(false);
    setIsRecording(false);
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      
      // Revert to camera
      if (peerConnectionRef.current && localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peerConnectionRef.current
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      }
      
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        screenStreamRef.current = screenStream;
        
        // Replace video track in peer connection
        if (peerConnectionRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
        
        // Update local video preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Handle screen share stop from browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
        
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
        setError("Could not share screen. Please try again.");
      }
    }
  };

  // Start recording
  const startRecording = () => {
    const streams: MediaStream[] = [];
    
    if (localStreamRef.current) {
      streams.push(localStreamRef.current);
    }
    
    if (remoteVideoRef.current?.srcObject) {
      streams.push(remoteVideoRef.current.srcObject as MediaStream);
    }
    
    if (streams.length === 0) {
      setError("No streams available to record");
      return;
    }
    
    // Use local stream for recording (or create a combined stream)
    const recordStream = localStreamRef.current || streams[0];
    
    try {
      const mediaRecorder = new MediaRecorder(recordStream, {
        mimeType: "video/webm;codecs=vp9",
      });
      
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create and download the recording
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `video-call-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
      
      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not start recording. Your browser may not support this feature.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  };

  // Copy room code to clipboard
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveCall();
    };
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <Video className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Video Calls</h2>
        <p className="text-muted-foreground">Please sign in to make video calls with friends.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 bg-background">
      {!isInCall ? (
        // Room selection UI
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <div className="text-center">
            <Video className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Video Call</h1>
            <p className="text-muted-foreground">
              Start a video call and share your screen with friends
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl">
            {/* Create Room */}
            <div className="flex-1 bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Create a Room</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Start a new video call room and share the code with your friend
              </p>
              <Button
                onClick={createRoom}
                disabled={isConnecting}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isConnecting ? "Creating..." : "Create New Room"}
              </Button>
            </div>

            {/* Join Room */}
            <div className="flex-1 bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Join a Room</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Enter a room code to join an existing video call
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter room code"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  className="flex-1"
                  maxLength={6}
                />
                <Button
                  onClick={joinRoom}
                  disabled={isConnecting || !joinRoomCode.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isConnecting ? "Joining..." : "Join"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // In-call UI
        <div className="flex flex-col h-full gap-4">
          {/* Room info bar */}
          <div className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Room Code:</span>
                <span className="font-mono font-bold text-foreground">{roomCode}</span>
                <Button variant="ghost" size="icon" onClick={copyRoomCode} title="Copy room code">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500">
                <Circle className="w-3 h-3 fill-current animate-pulse" />
                <span className="text-sm font-medium">Recording</span>
              </div>
            )}
          </div>

          {/* Video container */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
            {/* Local video */}
            <div className="relative bg-muted rounded-xl overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
                You {isScreenSharing && "(Screen)"}
              </div>
            </div>

            {/* Remote video */}
            <div className="relative bg-muted rounded-xl overflow-hidden flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {participants.length < 2 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <Users className="w-12 h-12 mb-2" />
                  <p>Waiting for others to join...</p>
                  <p className="text-sm mt-1">Share the room code: <strong>{roomCode}</strong></p>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 py-4">
            <Button
              variant={isVideoOn ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleVideo}
              className="w-12 h-12 rounded-full"
              title={isVideoOn ? "Turn off camera" : "Turn on camera"}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            <Button
              variant={isAudioOn ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleAudio}
              className="w-12 h-12 rounded-full"
              title={isAudioOn ? "Mute" : "Unmute"}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="icon"
              onClick={toggleScreenShare}
              className="w-12 h-12 rounded-full"
              title={isScreenSharing ? "Stop sharing" : "Share screen"}
            >
              {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </Button>

            <Button
              variant={isRecording ? "destructive" : "secondary"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className="w-12 h-12 rounded-full"
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              onClick={leaveCall}
              className="w-12 h-12 rounded-full"
              title="End call"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoCall;
