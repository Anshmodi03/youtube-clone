import React from "react";
import VideoCall from "@/components/VideoCall";
import Head from "next/head";

const VideoCallPage = () => {
  return (
    <>
      <Head>
        <title>Video Call - YourTube</title>
        <meta name="description" content="Make video calls with friends and share your screen" />
      </Head>
      <main className="flex-1 p-4">
        <VideoCall />
      </main>
    </>
  );
};

export default VideoCallPage;
