import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import SubscriptionDialog from "@/components/SubscriptionDialog";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

const WatchPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, login } = useUser();
  
  const [videos, setvideo] = useState<any>(null);
  const [video, setvide] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showComments, setShowComments] = useState(true);

  // Get user's subscription plan (default to 'free')
  const subscriptionPlan = user?.subscriptionPlan || "free";

  useEffect(() => {
    const fetchvideo = async () => {
      if (!id || typeof id !== "string") return;
      try {
        const res = await axiosInstance.get("/video/getall");
        const video = res.data?.filter((vid: any) => vid._id === id);
        setvideo(video[0]);
        setvide(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, [id]);

  const handleUpgradeClick = () => {
    setShowSubscriptionDialog(true);
  };

  const handleSubscriptionSuccess = async (plan: string, paymentId: string) => {
    try {
      // Call backend to upgrade subscription
      const response = await axiosInstance.post(`/subscription/upgrade/${user?._id}`, {
        plan,
        paymentId,
      });

      if (response.data.success) {
        // Update local user state with new subscription
        login(response.data.user);
        setShowSubscriptionDialog(false);
      }
    } catch (error) {
      console.error("Upgrade error:", error);
    }
  };

  // Navigate to next video in the list
  const handleNavigateNext = () => {
    if (!video || video.length === 0) return;
    
    // Find current video index
    const currentIndex = video.findIndex((v: any) => v._id === id);
    if (currentIndex === -1) return;
    
    // Get next video (wrap around to first if at end)
    const nextIndex = (currentIndex + 1) % video.length;
    const nextVideo = video[nextIndex];
    
    if (nextVideo) {
      router.push(`/watch/${nextVideo._id}`);
    }
  };

  // Toggle comments section visibility
  const handleToggleComments = () => {
    setShowComments(prev => !prev);
  };

  // Close the website/tab
  const handleCloseWebsite = () => {
    // Try to close the window
    window.close();
    // If window.close() doesn't work (common in most browsers for security),
    // navigate to a blank page or home
    if (!window.closed) {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
  }

  if (!videos) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">Video not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Videopplayer 
              video={videos} 
              subscriptionPlan={subscriptionPlan}
              onUpgradeClick={handleUpgradeClick}
              onNavigateNext={handleNavigateNext}
              onToggleComments={handleToggleComments}
              onCloseWebsite={handleCloseWebsite}
            />
            <VideoInfo video={videos} />
            
            {/* Comments section with toggle */}
            <div className="space-y-2">
              <button
                onClick={handleToggleComments}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors w-full justify-between bg-muted/50 px-4 py-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Comments</span>
                </div>
                {showComments ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              
              {showComments && <Comments videoId={id} />}
            </div>
          </div>
          <div className="space-y-4">
            <RelatedVideos videos={video} />
          </div>
        </div>
      </div>

      {/* Subscription Upgrade Dialog */}
      <SubscriptionDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        onSuccess={handleSubscriptionSuccess}
        currentPlan={subscriptionPlan}
      />
    </div>
  );
};

export default WatchPage;

