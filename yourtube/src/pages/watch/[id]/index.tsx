import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import SubscriptionDialog from "@/components/SubscriptionDialog";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const WatchPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, login } = useUser();
  
  const [videos, setvideo] = useState<any>(null);
  const [video, setvide] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!videos) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Video not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Videopplayer 
              video={videos} 
              subscriptionPlan={subscriptionPlan}
              onUpgradeClick={handleUpgradeClick}
            />
            <VideoInfo video={videos} />
            <Comments videoId={id} />
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
