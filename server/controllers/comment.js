import comment from "../Modals/comment.js";
import mongoose from "mongoose";
import { translateText, supportedLanguages } from "../services/translateService.js";
import { getCityFromIP, getClientIP } from "../services/geoService.js";

// Regex to detect special characters (blocking these in comments)
const specialCharRegex = /[!@#$%^&*()_+=\[\]{};':"\\|<>\/?]+/;

/**
 * Validate comment for special characters
 */
const hasSpecialCharacters = (text) => {
  return specialCharRegex.test(text);
};

export const postcomment = async (req, res) => {
  const commentdata = req.body;
  
  // Block comments with special characters
  if (hasSpecialCharacters(commentdata.commentbody)) {
    return res.status(400).json({ 
      message: "Comments cannot contain special characters like !@#$%^&*()_+=[]{}|<>/?" 
    });
  }

  try {
    // Get user's city from IP
    const clientIP = getClientIP(req);
    const userCity = await getCityFromIP(clientIP);
    
    const postcommentData = new comment({
      ...commentdata,
      userCity: userCity,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    });
    
    await postcommentData.save();
    
    // Return the full comment object so frontend can display it
    return res.status(200).json({ 
      comment: true, 
      data: postcommentData 
    });
  } catch (error) {
    console.error("Post comment error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  
  // Block edited comments with special characters
  if (hasSpecialCharacters(commentbody)) {
    return res.status(400).json({ 
      message: "Comments cannot contain special characters like !@#$%^&*()_+=[]{}|<>/?" 
    });
  }
  
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    });
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const likecomment = async (req, res) => {
  const { id: _id } = req.params;
  const { userid } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Comment unavailable");
  }

  try {
    const existingComment = await comment.findById(_id);
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userIdObj = new mongoose.Types.ObjectId(userid);
    const alreadyLiked = existingComment.likedBy.some(id => id.equals(userIdObj));
    const alreadyDisliked = existingComment.dislikedBy.some(id => id.equals(userIdObj));

    let updateQuery = {};

    if (alreadyLiked) {
      // Unlike: remove from likedBy and decrease likes
      updateQuery = {
        $pull: { likedBy: userIdObj },
        $inc: { likes: -1 },
      };
    } else {
      // Like: add to likedBy and increase likes
      updateQuery = {
        $addToSet: { likedBy: userIdObj },
        $inc: { likes: 1 },
      };
      
      // If user had disliked, remove that dislike
      if (alreadyDisliked) {
        updateQuery.$pull = { dislikedBy: userIdObj };
        updateQuery.$inc.dislikes = -1;
      }
    }

    const updatedComment = await comment.findByIdAndUpdate(_id, updateQuery, { new: true });
    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Like comment error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const dislikecomment = async (req, res) => {
  const { id: _id } = req.params;
  const { userid } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Comment unavailable");
  }

  try {
    const existingComment = await comment.findById(_id);
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userIdObj = new mongoose.Types.ObjectId(userid);
    const alreadyLiked = existingComment.likedBy.some(id => id.equals(userIdObj));
    const alreadyDisliked = existingComment.dislikedBy.some(id => id.equals(userIdObj));

    let updateQuery = {};

    if (alreadyDisliked) {
      // Un-dislike: remove from dislikedBy and decrease dislikes
      updateQuery = {
        $pull: { dislikedBy: userIdObj },
        $inc: { dislikes: -1 },
      };
    } else {
      // Dislike: add to dislikedBy and increase dislikes
      updateQuery = {
        $addToSet: { dislikedBy: userIdObj },
        $inc: { dislikes: 1 },
      };
      
      // If user had liked, remove that like
      if (alreadyLiked) {
        updateQuery.$pull = { likedBy: userIdObj };
        updateQuery.$inc.likes = -1;
      }
    }

    const updatedComment = await comment.findByIdAndUpdate(_id, updateQuery, { new: true });

    // Auto-delete if dislikes >= 2
    if (updatedComment.dislikes >= 2) {
      await comment.findByIdAndDelete(_id);
      return res.status(200).json({ 
        deleted: true, 
        message: "Comment removed due to excessive dislikes" 
      });
    }

    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Dislike comment error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const translatecomment = async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ message: "Text and target language are required" });
  }

  try {
    const result = await translateText(text, targetLang);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Translation error:", error);
    return res.status(500).json({ message: "Translation failed" });
  }
};

export const getsupportedlanguages = async (req, res) => {
  return res.status(200).json(supportedLanguages);
};
