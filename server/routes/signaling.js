import express from "express";

const router = express.Router();

// In-memory storage for rooms (simple approach for demo)
const rooms = new Map();

// Generate a simple room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new room
router.post("/create-room", (req, res) => {
  try {
    const { userId, userName } = req.body;
    const roomCode = generateRoomCode();
    
    rooms.set(roomCode, {
      id: roomCode,
      createdAt: Date.now(),
      participants: [{
        id: userId,
        name: userName,
        joinedAt: Date.now()
      }],
      signals: []
    });
    
    res.json({ success: true, roomCode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Join an existing room
router.post("/join-room", (req, res) => {
  try {
    const { roomCode, userId, userName } = req.body;
    const room = rooms.get(roomCode);
    
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }
    
    // Check if user already in room
    const existingParticipant = room.participants.find(p => p.id === userId);
    if (!existingParticipant) {
      room.participants.push({
        id: userId,
        name: userName,
        joinedAt: Date.now()
      });
    }
    
    res.json({ 
      success: true, 
      room: {
        id: room.id,
        participants: room.participants
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get room info and pending signals
router.get("/room/:roomCode", (req, res) => {
  try {
    const { roomCode } = req.params;
    const { userId } = req.query;
    const room = rooms.get(roomCode);
    
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }
    
    // Get signals meant for this user
    const userSignals = room.signals.filter(s => s.to === userId);
    
    // Remove delivered signals
    room.signals = room.signals.filter(s => s.to !== userId);
    
    res.json({ 
      success: true, 
      room: {
        id: room.id,
        participants: room.participants
      },
      signals: userSignals
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send signaling data (offer, answer, ICE candidates)
router.post("/signal/:roomCode", (req, res) => {
  try {
    const { roomCode } = req.params;
    const { from, to, type, data } = req.body;
    const room = rooms.get(roomCode);
    
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }
    
    room.signals.push({
      from,
      to,
      type,
      data,
      timestamp: Date.now()
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Leave room
router.post("/leave-room", (req, res) => {
  try {
    const { roomCode, userId } = req.body;
    const room = rooms.get(roomCode);
    
    if (room) {
      room.participants = room.participants.filter(p => p.id !== userId);
      
      // Delete room if empty
      if (room.participants.length === 0) {
        rooms.delete(roomCode);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cleanup old rooms (call periodically or on each request)
function cleanupOldRooms() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [code, room] of rooms.entries()) {
    if (room.createdAt < oneHourAgo) {
      rooms.delete(code);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupOldRooms, 10 * 60 * 1000);

export default router;
