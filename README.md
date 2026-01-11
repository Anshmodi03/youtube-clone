<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" alt="YourTube Logo" width="200"/>
</p>

<h1 align="center">🎬 YourTube - A Feature-Rich YouTube Clone</h1>

<p align="center">
  <strong>A full-stack video streaming platform with advanced features including video calls, smart theming, and premium subscriptions</strong>
</p>

<p align="center">
  <a href="https://youtube-clone-pearl-zeta.vercel.app/">🌐 Live Demo</a> •
  <a href="#-features">✨ Features</a> •
  <a href="#-tech-stack">🛠️ Tech Stack</a> •
  <a href="#-getting-started">🚀 Getting Started</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel" alt="Vercel"/>
</p>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
  - [1. 🌍 Multilingual Comment System](#1--multilingual-comment-system)
  - [2. 📥 Video Download System](#2--video-download-system)
  - [3. 👑 Subscription Plans](#3--subscription-plans)
  - [4. 🎨 Smart Theme System](#4--smart-theme-system)
  - [5. 🎮 Custom Video Player](#5--custom-video-player)
  - [6. 📹 Video Call Feature](#6--video-call-feature)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🔗 API Endpoints](#-api-endpoints)
- [📄 License](#-license)

---

## 🎯 Overview

**YourTube** is a comprehensive YouTube clone that goes beyond basic video streaming. Built with modern web technologies, it offers a rich set of features including multilingual support, premium subscriptions, video calling, and an intelligent theming system based on user location and time.

🌐 **Live Demo:** [https://youtube-clone-pearl-zeta.vercel.app/](https://youtube-clone-pearl-zeta.vercel.app/)

---

## ✨ Features

### 1. 🌍 Multilingual Comment System

Our advanced comment system supports global users with powerful features:

<table>
<tr>
<td width="50%">

**Key Features:**
- 💬 **Multi-language Comments** - Post comments in any language
- 🔄 **Real-time Translation** - Translate comments to your preferred language
- 📍 **Location Display** - Shows user's city name with each comment
- 👍👎 **Like & Dislike** - Interact with comments
- 🛡️ **Auto-moderation** - Comments with special characters are blocked
- 🗑️ **Smart Removal** - Comments automatically removed after 2 dislikes

</td>
<td width="50%">

**How to Use:**
1. Navigate to any video
2. Scroll down to the comments section
3. Type your comment in any language
4. Click the 🌐 translate icon to translate other comments
5. Like or dislike comments to interact

</td>
</tr>
</table>

---

### 2. 📥 Video Download System

Download your favorite videos with our smart download management:

<table>
<tr>
<td width="50%">

**Key Features:**
- 📥 **One Free Download/Day** - All users get 1 free download daily
- 👑 **Premium Unlimited** - Premium users can download unlimited videos
- 💳 **Razorpay Integration** - Secure test payment gateway
- 📂 **Download History** - View all downloads in your profile
- ⚡ **Direct Download** - No redirects, downloads directly

</td>
<td width="50%">

**How to Use:**
1. Go to any video page
2. Click the **Download** button
3. If you've used your free download:
   - Click "Go Premium" 
   - Complete payment via Razorpay
   - Enjoy unlimited downloads!
4. View downloads in Profile → Downloads

</td>
</tr>
</table>

---

### 3. 👑 Subscription Plans

Unlock extended watch time with our tiered subscription model:

| Plan | Watch Time | Price | Features |
|------|------------|-------|----------|
| 🆓 **Free** | 5 minutes | Free | Basic access |
| 🥉 **Bronze** | 7 minutes | ₹10 | Extended viewing |
| 🥈 **Silver** | 10 minutes | ₹50 | Premium support |
| 🥇 **Gold** | ∞ Unlimited | ₹100 | Full access + Email invoice |

**How to Upgrade:**
1. While watching a video, you'll see a plan indicator
2. When time limit is reached, click "Upgrade Plan"
3. Select your desired plan (Bronze/Silver/Gold)
4. Complete payment via Razorpay
5. Receive email confirmation with invoice
6. Enjoy extended/unlimited watch time!

---

### 4. 🎨 Smart Theme System

Our intelligent theming system adapts to your location and time:

<table>
<tr>
<td width="50%">

**Theme Logic:**

| Condition | Theme |
|-----------|-------|
| 10 AM - 12 PM + South India | ☀️ Light |
| Other times + Other states | 🌙 Dark |

**South Indian States:**
- Tamil Nadu
- Kerala
- Karnataka
- Andhra Pradesh
- Telangana

</td>
<td width="50%">

**Authentication by Region:**

| Region | Verification Method |
|--------|-------------------|
| **South India** | 📧 Email OTP |
| **Other States** | 📱 Mobile OTP |

*The system automatically detects your location and applies the appropriate theme and authentication method.*

</td>
</tr>
</table>

---

### 5. 🎮 Custom Video Player

Experience intuitive gesture-based video controls:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ◀◀ LEFT ZONE    │   ▶ CENTER ZONE   │  RIGHT ZONE ▶▶│
│                                                     │
│  Double-tap:     │   Single-tap:     │  Double-tap:  │
│  ⏪ -10 seconds  │   ⏯️ Play/Pause   │  ⏩ +10 seconds│
│                                                     │
│  Triple-tap:     │   Triple-tap:     │  Triple-tap:  │
│  💬 Comments     │   ⏭️ Next Video   │  ❌ Close Tab  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Gesture Controls Summary:**

| Gesture | Left Zone | Center Zone | Right Zone |
|---------|-----------|-------------|------------|
| **Single Tap** | - | ⏯️ Play/Pause | - |
| **Double Tap** | ⏪ Rewind 10s | - | ⏩ Forward 10s |
| **Triple Tap** | 💬 Show Comments | ⏭️ Next Video | ❌ Close Website |

---

### 6. 📹 Video Call Feature

Connect with friends using our built-in video calling:

<table>
<tr>
<td width="50%">

**Key Features:**
- 🎥 **HD Video Calls** - Crystal clear video quality
- 🖥️ **Screen Sharing** - Share your YouTube experience
- 🎙️ **Audio Controls** - Mute/unmute with one click
- 📹 **Session Recording** - Record calls locally
- 🔗 **Room-based Calls** - Create/join rooms easily

</td>
<td width="50%">

**How to Use:**
1. Click "Video Call" in the sidebar
2. Click "Create a Room" or enter a Room ID
3. Share the Room ID with your friend
4. Start your video call!
5. Use toolbar for:
   - 🎤 Mute/Unmute
   - 📹 Camera On/Off
   - 🖥️ Screen Share
   - ⏺️ Record Session
   - 📞 End Call

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React Framework with SSR |
| **React 19** | UI Component Library |
| **Tailwind CSS** | Utility-first Styling |
| **Lucide Icons** | Beautiful Icon Library |
| **React Player** | Video Playback |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime Environment |
| **Express.js** | Web Framework |
| **MongoDB Atlas** | Cloud Database |
| **Mongoose** | ODM for MongoDB |

### Integrations
| Service | Purpose |
|---------|---------|
| **Razorpay** | Payment Gateway |
| **Firebase** | Authentication |
| **Vercel** | Frontend Hosting |
| **Render** | Backend Hosting |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anshmodi03/youtube-clone.git
   cd youtube-clone
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../yourtube
   npm install
   ```

4. **Configure Environment Variables**

   **Server (.env):**
   ```env
   PORT=5000
   DB_URL=your_mongodb_atlas_url
   ```

   **Frontend (.env):**
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```

5. **Run the Application**

   **Backend:**
   ```bash
   cd server
   npm start
   ```

   **Frontend:**
   ```bash
   cd yourtube
   npm run dev
   ```

6. **Open in Browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
youtube-clone/
├── 📂 server/                 # Backend API
│   ├── 📂 controllers/        # Route handlers
│   ├── 📂 Modals/            # MongoDB schemas
│   ├── 📂 routes/            # API routes
│   ├── 📂 filehelper/        # File upload utilities
│   └── 📄 index.js           # Server entry point
│
├── 📂 yourtube/              # Frontend Application
│   ├── 📂 src/
│   │   ├── 📂 components/    # React components
│   │   ├── 📂 pages/         # Next.js pages
│   │   ├── 📂 lib/           # Utilities & helpers
│   │   └── 📂 styles/        # Global styles
│   └── 📄 package.json
│
└── 📄 README.md              # This file
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/video/getall` | Get all videos |
| `POST` | `/video/upload` | Upload new video |
| `GET` | `/user/login` | User login |
| `POST` | `/user/register` | User registration |
| `POST` | `/comment/add` | Add comment |
| `GET` | `/comment/:id` | Get video comments |
| `POST` | `/like/add` | Like a video |
| `GET` | `/history/:userId` | Get watch history |
| `POST` | `/download/add` | Record download |
| `POST` | `/subscription/upgrade` | Upgrade plan |

---

## 🌟 Screenshots

<p align="center">
  <em>Experience the full application at our live demo!</em>
</p>

<p align="center">
  <a href="https://youtube-clone-pearl-zeta.vercel.app/">
    <img src="https://img.shields.io/badge/Visit%20Live%20Demo-Click%20Here-red?style=for-the-badge&logo=youtube" alt="Live Demo"/>
  </a>
</p>

---

## 👨‍💻 Developer

<p align="center">
  <strong>Built with ❤️ by Ansh Modi</strong>
</p>

<p align="center">
  <a href="https://github.com/Anshmodi03">
    <img src="https://img.shields.io/badge/GitHub-Anshmodi03-181717?style=for-the-badge&logo=github" alt="GitHub"/>
  </a>
</p>

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>⭐ Star this repository if you found it helpful!</strong>
</p>

<p align="center">
  Made with Next.js, React, Node.js, and MongoDB
</p>
