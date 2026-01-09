"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Crown, Clock } from "lucide-react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
  subscriptionPlan?: string;
  onUpgradeClick?: () => void;
}

// Watch time limits in seconds
const WATCH_LIMITS: Record<string, number> = {
  free: 5 * 60,    // 5 minutes
  bronze: 7 * 60,  // 7 minutes
  silver: 10 * 60, // 10 minutes
  gold: -1,        // Unlimited (-1)
};

export default function VideoPlayer({ 
  video, 
  subscriptionPlan = "free",
  onUpgradeClick 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const watchLimit = WATCH_LIMITS[subscriptionPlan] || WATCH_LIMITS.free;
  const isUnlimited = watchLimit === -1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isUnlimited) return;

    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Show warning 30 seconds before limit
    if (time >= watchLimit - 30 && !showWarning && !isLimitReached) {
      setShowWarning(true);
    }

    // Pause and show upgrade prompt when limit reached
    if (time >= watchLimit && !isLimitReached) {
      videoRef.current.pause();
      setIsLimitReached(true);
    }
  };

  const handleSeek = () => {
    if (!videoRef.current || isUnlimited) return;

    // Prevent seeking past the limit
    if (videoRef.current.currentTime >= watchLimit) {
      videoRef.current.currentTime = watchLimit - 1;
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

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeek}
        poster={`/placeholder.svg?height=480&width=854`}
      >
        <source
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video?.filepath}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Warning overlay - 30 seconds before limit */}
      {showWarning && !isLimitReached && !isUnlimited && (
        <div className="absolute top-4 right-4 bg-yellow-500/90 text-white px-3 py-2 rounded-lg flex items-center gap-2 animate-pulse">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formatTime(watchLimit - currentTime)} left
          </span>
        </div>
      )}

      {/* Limit reached overlay */}
      {isLimitReached && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
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
        <div className="absolute bottom-16 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <span className="capitalize">{subscriptionPlan}</span>
          <span className="text-gray-400">•</span>
          <span>{formatTime(watchLimit)} limit</span>
        </div>
      )}

      {/* Unlimited badge for Gold users */}
      {isUnlimited && (
        <div className="absolute bottom-16 left-4 bg-yellow-500/90 text-black px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Gold - Unlimited
        </div>
      )}
    </div>
  );
}
