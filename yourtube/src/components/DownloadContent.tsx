"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Download, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import PremiumDialog from "./PremiumDialog";

export default function DownloadContent() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const { user, login } = useUser();

  useEffect(() => {
    if (user) {
      loadDownloads();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDownloads = async () => {
    if (!user) return;

    try {
      const response = await axiosInstance.get(`/download/history/${user?._id}`);
      setDownloads(response.data.downloads || []);
    } catch (error) {
      console.error("Error loading downloads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumSuccess = async (paymentId: string) => {
    try {
      const response = await axiosInstance.post(`/download/premium/${user?._id}`, { paymentId });
      if (response.data.success) {
        login(response.data.user);
      }
    } catch (error) {
      console.error("Premium upgrade error:", error);
    }
    setShowPremiumDialog(false);
  };

  if (loading) {
    return <div className="p-4">Loading downloads...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Download className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your Downloads</h2>
        <p className="text-gray-600">
          Sign in to see your downloaded videos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Download className="w-6 h-6" />
            Downloads
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {downloads.length} video{downloads.length !== 1 ? "s" : ""} downloaded
          </p>
        </div>
        {!user?.isPremium && (
          <Button 
            onClick={() => setShowPremiumDialog(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Crown className="w-4 h-4 mr-2" />
            Go Premium
          </Button>
        )}
        {user?.isPremium && (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Premium</span>
          </div>
        )}
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-12">
          <Download className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No downloads yet</h2>
          <p className="text-gray-600">
            Videos you download will appear here.
          </p>
          {!user?.isPremium && (
            <p className="text-sm text-gray-500 mt-2">
              Free users can download 1 video per day.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {downloads.map((item) => (
            <div key={item._id} className="flex gap-4 group">
              <Link href={`/watch/${item._id}`} className="flex-shrink-0">
                <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">
                  <video
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.filepath}`}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/watch/${item._id}`}>
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 mb-1">
                    {item.videotitle}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600">
                  {item.videochanel}
                </p>
                <p className="text-sm text-gray-600">
                  {item.views?.toLocaleString()} views •{" "}
                  {item.createdAt && formatDistanceToNow(new Date(item.createdAt))} ago
                </p>
                {item.downloadedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Downloaded {formatDistanceToNow(new Date(item.downloadedAt))} ago
                  </p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.filepath}`;
                      link.download = item.videotitle || "video";
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download again
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <PremiumDialog
        isOpen={showPremiumDialog}
        onClose={() => setShowPremiumDialog(false)}
        onSuccess={handlePremiumSuccess}
      />
    </div>
  );
}
