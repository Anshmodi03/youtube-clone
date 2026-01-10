"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "./ui/button";
import { Crown, Clock, Play, Pause, FastForward, Rewind, SkipForward, MessageSquare, X } from "lucide-react";

// Dynamic import for react-player to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black text-white">
      Loading player...
    </div>
  )
});

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
  subscriptionPlan?: string;
  onUpgradeClick?: () => void;
  onNavigateNext?: () => void;
  onToggleComments?: () => void;
  onCloseWebsite?: () => void;
}

// Watch time limits in seconds
const WATCH_LIMITS: Record<string, number> = {
  free: 5 * 60,    // 5 minutes
  bronze: 7 * 60,  // 7 minutes
  silver: 10 * 60, // 10 minutes
  gold: -1,        // Unlimited (-1)
};

// Tap detection constants
const TAP_TIMEOUT = 400; // ms to wait for next tap
const SEEK_SECONDS = 10;

export default function VideoPlayer({ 
  video, 
  subscriptionPlan = "free",
  onUpgradeClick,
  onNavigateNext,
  onToggleComments,
  onCloseWebsite
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);
  const lastTapZoneRef = useRef<string>("");
  
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [playing, setPlaying] = useState(false);
  
  // Gesture feedback states
  const [gestureIndicator, setGestureIndicator] = useState<{
    show: boolean;
    type: "forward" | "backward" | "play" | "pause" | "next" | "comments" | "close" | null;
    zone: "left" | "center" | "right" | null;
  }>({ show: false, type: null, zone: null });

  const watchLimit = WATCH_LIMITS[subscriptionPlan] || WATCH_LIMITS.free;
  const isUnlimited = watchLimit === -1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine the video URL
  const getVideoUrl = () => {
    if (!video?.filepath) return "";
    
    // Check if it's already a full URL (external video)
    if (video.filepath.startsWith("http://") || video.filepath.startsWith("https://")) {
      return video.filepath;
    }
    
    // Otherwise, it's a local file
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`;
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    if (isUnlimited) return;

    const time = state.playedSeconds;
    setCurrentTime(time);

    // Show warning 30 seconds before limit
    if (time >= watchLimit - 30 && !showWarning && !isLimitReached) {
      setShowWarning(true);
    }

    // Pause when limit reached
    if (time >= watchLimit && !isLimitReached) {
      setPlaying(false);
      setIsLimitReached(true);
    }
  };

  // Reset when plan changes
  useEffect(() => {
    const newLimit = WATCH_LIMITS[subscriptionPlan] || WATCH_LIMITS.free;
    if (newLimit === -1 || currentTime < newLimit) {
      setIsLimitReached(false);
      setShowWarning(false);
    }
  }, [subscriptionPlan, currentTime]);

  // Show gesture indicator with auto-hide
  const showGestureIndicator = useCallback((
    type: typeof gestureIndicator.type,
    zone: typeof gestureIndicator.zone
  ) => {
    setGestureIndicator({ show: true, type, zone });
    setTimeout(() => {
      setGestureIndicator({ show: false, type: null, zone: null });
    }, 800);
  }, []);

  // Seek video using ReactPlayer's built-in methods
  const seekVideo = useCallback((seconds: number) => {
    if (playerRef.current) {
      try {
        // Use ReactPlayer's getCurrentTime and seekTo methods
        const current = playerRef.current.getCurrentTime() || 0;
        const newTime = Math.max(0, current + seconds);
        playerRef.current.seekTo(newTime, "seconds");
      } catch (error) {
        console.log("Seek error:", error);
      }
    }
  }, []);


  // Handle gesture actions
  const executeGesture = useCallback((tapCount: number, zone: string) => {
    // Double-tap actions
    if (tapCount === 2) {
      if (zone === "right") {
        seekVideo(SEEK_SECONDS);
        showGestureIndicator("forward", "right");
      } else if (zone === "left") {
        seekVideo(-SEEK_SECONDS);
        showGestureIndicator("backward", "left");
      }
    }
    // Single-tap in center - toggle play/pause
    else if (tapCount === 1 && zone === "center") {
      setPlaying(prev => !prev);
      showGestureIndicator(playing ? "pause" : "play", "center");
    }
    // Triple-tap actions
    else if (tapCount === 3) {
      if (zone === "center") {
        // Navigate to next video
        showGestureIndicator("next", "center");
        setTimeout(() => {
          onNavigateNext?.();
        }, 300);
      } else if (zone === "right") {
        // Close website
        showGestureIndicator("close", "right");
        setTimeout(() => {
          if (onCloseWebsite) {
            onCloseWebsite();
          } else {
            window.close();
          }
        }, 300);
      } else if (zone === "left") {
        // Show comments
        showGestureIndicator("comments", "left");
        setTimeout(() => {
          onToggleComments?.();
        }, 300);
      }
    }
  }, [seekVideo, showGestureIndicator, playing, onNavigateNext, onCloseWebsite, onToggleComments]);

  // Determine tap zone based on click position
  const getTapZone = useCallback((e: React.MouseEvent<HTMLDivElement>): string => {
    if (!containerRef.current) return "center";
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const thirdWidth = width / 3;
    
    if (x < thirdWidth) return "left";
    if (x > thirdWidth * 2) return "right";
    return "center";
  }, []);

  // Handle tap with detection for single, double, triple
  const handleTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent default to avoid triggering player controls
    e.preventDefault();
    e.stopPropagation();
    
    const zone = getTapZone(e);
    
    // If tapping a different zone, reset the count
    if (zone !== lastTapZoneRef.current) {
      tapCountRef.current = 0;
    }
    
    lastTapZoneRef.current = zone;
    tapCountRef.current += 1;
    
    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    const currentTapCount = tapCountRef.current;
    
    // Wait to see if there are more taps
    tapTimeoutRef.current = setTimeout(() => {
      executeGesture(currentTapCount, zone);
      tapCountRef.current = 0;
      lastTapZoneRef.current = "";
    }, TAP_TIMEOUT);
    
  }, [getTapZone, executeGesture]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  const videoUrl = getVideoUrl();

  // Render gesture indicator icon
  const renderGestureIcon = () => {
    if (!gestureIndicator.show || !gestureIndicator.type) return null;

    const iconClass = "w-12 h-12 text-white drop-shadow-lg";
    
    switch (gestureIndicator.type) {
      case "forward":
        return (
          <div className="flex items-center gap-2">
            <FastForward className={iconClass} />
            <span className="text-white text-xl font-bold">+10s</span>
          </div>
        );
      case "backward":
        return (
          <div className="flex items-center gap-2">
            <Rewind className={iconClass} />
            <span className="text-white text-xl font-bold">-10s</span>
          </div>
        );
      case "play":
        return <Play className={iconClass} />;
      case "pause":
        return <Pause className={iconClass} />;
      case "next":
        return (
          <div className="flex flex-col items-center gap-1">
            <SkipForward className={iconClass} />
            <span className="text-white text-sm font-medium">Next Video</span>
          </div>
        );
      case "comments":
        return (
          <div className="flex flex-col items-center gap-1">
            <MessageSquare className={iconClass} />
            <span className="text-white text-sm font-medium">Comments</span>
          </div>
        );
      case "close":
        return (
          <div className="flex flex-col items-center gap-1">
            <X className={iconClass} />
            <span className="text-white text-sm font-medium">Close</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Get position for gesture indicator
  const getIndicatorPosition = () => {
    switch (gestureIndicator.zone) {
      case "left":
        return "left-8";
      case "right":
        return "right-8";
      default:
        return "left-1/2 -translate-x-1/2";
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-black rounded-lg overflow-hidden"
    >
      {videoUrl ? (
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          playing={playing}
          controls={!isLimitReached}
          onProgress={handleProgress}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          config={{
            file: {
              attributes: {
                crossOrigin: "anonymous",
              },
            },
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white">
          No video URL available
        </div>
      )}

      {/* Gesture detection overlay - sits above the video but below other overlays */}
      <div 
        className="absolute inset-0 z-15 cursor-pointer"
        onClick={handleTap}
        style={{ pointerEvents: isLimitReached ? "none" : "auto" }}
      />

      {/* Gesture indicator */}
      {gestureIndicator.show && (
        <div 
          className={`absolute top-1/2 -translate-y-1/2 ${getIndicatorPosition()} z-30 pointer-events-none`}
        >
          <div className="bg-black/60 rounded-full p-4 animate-pulse">
            {renderGestureIcon()}
          </div>
        </div>
      )}

      {/* Warning overlay - 30 seconds before limit */}
      {showWarning && !isLimitReached && !isUnlimited && (
        <div className="absolute top-4 right-4 bg-yellow-500/90 text-white px-3 py-2 rounded-lg flex items-center gap-2 animate-pulse z-20">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formatTime(watchLimit - currentTime)} left
          </span>
        </div>
      )}

      {/* Limit reached overlay */}
      {isLimitReached && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="text-center text-white p-6 max-w-md">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Watch Time Limit Reached</h3>
            <p className="text-gray-300 mb-4">
              You've reached your {formatTime(watchLimit)} watch limit on the{" "}
              <span className="capitalize font-semibold">{subscriptionPlan}</span> plan.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Upgrade your plan to unlock more watch time!
            </p>
            <Button
              onClick={onUpgradeClick}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold px-6"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          </div>
        </div>
      )}

      {/* Current plan indicator */}
      {!isUnlimited && !isLimitReached && (
        <div className="absolute bottom-16 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1 z-10">
          <span className="capitalize">{subscriptionPlan}</span>
          <span className="text-gray-400">•</span>
          <span>{formatTime(watchLimit)} limit</span>
        </div>
      )}

      {/* Unlimited badge for Gold users */}
      {isUnlimited && (
        <div className="absolute bottom-16 left-4 bg-yellow-500/90 text-black px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 z-10">
          <Crown className="w-3 h-3" />
          Gold - Unlimited
        </div>
      )}

      {/* Gesture hint - shows briefly on first load */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white/80 px-3 py-1 rounded text-xs z-10 pointer-events-none">
        Double-tap sides to seek • Tap center to pause
      </div>
    </div>
  );
}
