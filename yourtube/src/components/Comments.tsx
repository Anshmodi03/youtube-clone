import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { ThumbsUp, ThumbsDown, Globe, MapPin } from "lucide-react";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  userCity?: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
}

interface Language {
  code: string;
  name: string;
}

// Special characters regex - matches what backend uses
const specialCharRegex = /[!@#$%^&*()_+=\[\]{};':"\\|<>\/?]+/;

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Translation state
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [showLangDropdown, setShowLangDropdown] = useState<string | null>(null);
  const [languages, setLanguages] = useState<Language[]>([
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "hi", name: "Hindi" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "ar", name: "Arabic" },
    { code: "pt", name: "Portuguese" },
  ]);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-foreground">Loading comments...</div>;
  }

  // Validate comment for special characters
  const validateComment = (text: string): boolean => {
    if (specialCharRegex.test(text)) {
      setError("Comments cannot contain special characters like !@#$%^&*()_+=[]{}|<>/?");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    
    // Validate before submitting
    if (!validateComment(newComment)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
      });
      
      if (res.data.comment) {
        const newCommentObj: Comment = res.data.data || {
          _id: Date.now().toString(),
          videoid: videoId,
          userid: user._id,
          commentbody: newComment,
          usercommented: user.name || "Anonymous",
          commentedon: new Date().toISOString(),
          userCity: "Unknown",
          likes: 0,
          dislikes: 0,
          likedBy: [],
          dislikedBy: [],
        };
        setComments([newCommentObj, ...comments]);
      }
      setNewComment("");
      setError(null);
    } catch (error: any) {
      console.error("Error adding comment:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    
    // Validate before updating
    if (!validateComment(editText)) {
      return;
    }
    
    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText }
      );
      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c
          )
        );
        setEditingCommentId(null);
        setEditText("");
        setError(null);
      }
    } catch (error: any) {
      console.log(error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;
    
    try {
      const res = await axiosInstance.post(`/comment/like/${commentId}`, {
        userid: user._id,
      });
      
      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? { ...c, likes: res.data.likes, dislikes: res.data.dislikes, likedBy: res.data.likedBy, dislikedBy: res.data.dislikedBy }
              : c
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDislike = async (commentId: string) => {
    if (!user) return;
    
    try {
      const res = await axiosInstance.post(`/comment/dislike/${commentId}`, {
        userid: user._id,
      });
      
      // Check if comment was deleted due to excessive dislikes
      if (res.data.deleted) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        return;
      }
      
      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? { ...c, likes: res.data.likes, dislikes: res.data.dislikes, likedBy: res.data.likedBy, dislikedBy: res.data.dislikedBy }
              : c
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleTranslate = async (commentId: string, text: string, targetLang: string) => {
    setTranslatingId(commentId);
    setShowLangDropdown(null);
    
    try {
      const res = await axiosInstance.post("/comment/translate", {
        text,
        targetLang,
      });
      
      if (res.data.translatedText) {
        setTranslatedTexts((prev) => ({
          ...prev,
          [commentId]: res.data.translatedText,
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTranslatingId(null);
    }
  };

  const isLikedByUser = (comment: Comment) => {
    return user && comment.likedBy?.includes(user._id);
  };

  const isDislikedByUser = (comment: Comment) => {
    return user && comment.dislikedBy?.includes(user._id);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">{comments.length} Comments</h2>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
          {error}
          <button
            className="absolute top-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment... (Special characters not allowed)"
              value={newComment}
              onChange={(e: any) => {
                setNewComment(e.target.value);
                if (error) validateComment(e.target.value);
              }}
              className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setNewComment("");
                  setError(null);
                }}
                disabled={!newComment.trim()}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm text-foreground">
                    {comment.usercommented}
                  </span>
                  {comment.userCity && comment.userCity !== "Unknown" && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      <MapPin size={12} />
                      {comment.userCity}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => {
                        setEditText(e.target.value);
                        if (error) validateComment(e.target.value);
                      }}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={handleUpdateComment}
                        disabled={!editText.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                          setError(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-foreground">{comment.commentbody}</p>
                    
                    {/* Show translated text if available */}
                    {translatedTexts[comment._id] && (
                      <p className="text-sm text-blue-600 mt-1 italic border-l-2 border-blue-400 pl-2">
                        {translatedTexts[comment._id]}
                      </p>
                    )}

                    {/* Like, Dislike, Translate buttons */}
                    <div className="flex items-center gap-4 mt-2">
                      {/* Like button */}
                      <button
                        onClick={() => handleLike(comment._id)}
                        className={`flex items-center gap-1 text-sm ${
                          isLikedByUser(comment) ? "text-blue-600" : "text-muted-foreground"
                        } hover:text-blue-600 transition-colors`}
                        disabled={!user}
                      >
                        <ThumbsUp size={16} fill={isLikedByUser(comment) ? "currentColor" : "none"} />
                        <span>{comment.likes || 0}</span>
                      </button>

                      {/* Dislike button */}
                      <button
                        onClick={() => handleDislike(comment._id)}
                        className={`flex items-center gap-1 text-sm ${
                          isDislikedByUser(comment) ? "text-red-600" : "text-muted-foreground"
                        } hover:text-red-600 transition-colors`}
                        disabled={!user}
                      >
                        <ThumbsDown size={16} fill={isDislikedByUser(comment) ? "currentColor" : "none"} />
                        <span>{comment.dislikes || 0}</span>
                      </button>

                      {/* Translate button */}
                      <div className="relative">
                        <button
                          onClick={() => setShowLangDropdown(showLangDropdown === comment._id ? null : comment._id)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-600 transition-colors"
                          disabled={translatingId === comment._id}
                        >
                          <Globe size={16} />
                          <span>{translatingId === comment._id ? "Translating..." : "Translate"}</span>
                        </button>
                        
                        {/* Language dropdown */}
                        {showLangDropdown === comment._id && (
                          <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                            {languages.map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => handleTranslate(comment._id, comment.commentbody, lang.code)}
                                className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary"
                              >
                                {lang.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Edit/Delete for own comments */}
                      {comment.userid === user?._id && (
                        <>
                          <button
                            onClick={() => handleEdit(comment)}
                            className="text-sm text-muted-foreground hover:text-foreground"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(comment._id)}
                            className="text-sm text-muted-foreground hover:text-red-600"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
