import express from "express";
import { 
  deletecomment, 
  getallcomment, 
  postcomment, 
  editcomment,
  likecomment,
  dislikecomment,
  translatecomment,
  getsupportedlanguages
} from "../controllers/comment.js";

const routes = express.Router();

// Get all comments for a video
routes.get("/:videoid", getallcomment);

// Post a new comment
routes.post("/postcomment", postcomment);

// Delete a comment
routes.delete("/deletecomment/:id", deletecomment);

// Edit a comment
routes.post("/editcomment/:id", editcomment);

// Like a comment
routes.post("/like/:id", likecomment);

// Dislike a comment
routes.post("/dislike/:id", dislikecomment);

// Translate a comment
routes.post("/translate", translatecomment);

// Get supported languages
routes.get("/languages/list", getsupportedlanguages);

export default routes;
