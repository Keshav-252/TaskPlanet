import React, { useState } from "react";
import CommentBox from "./CommentBox.jsx";
import { formatDate } from "../utils/formatDate.js";

export default function Feed({ posts, loading, onLike, submitComment, isAuthed }) {
  if (loading) return <div className="card">Loading feed...</div>;
  const [expandedComments, setExpandedComments] = useState({});
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return (
    <div className="feed">
      {posts.length === 0 && <div className="card">No posts yet</div>}
      {posts.map((post) => (
        <article key={post._id} className="card post-card">
          <header className="post-header">
            <div className="avatar">{(post.author || "U").slice(0, 1).toUpperCase()}</div>
            <div className="meta">
              <div className="name">{post.author || "Unknown"}</div>
              <div className="handle">@{post.author || "user"}</div>
              <div className="date">{formatDate(post.createdAt)}</div>
            </div>
          </header>
          <div className="post-body">
            {post.text && <p className="post-text">{post.text}</p>}
            {post.image && (
              <img
                className="post-image"
                src={`${API_BASE}${post.image.startsWith("/") ? post.image : `/${post.image}`}`}
                alt="post"
              />
            )}
          </div>
          <footer className="post-footer">
            <button
              className={`icon-btn ${post.likedByMe ? "liked" : ""}`}
              onClick={() => onLike(post._id)}
              type="button"
            >
              <img
                src={post.likedByMe ? "/icons/heart-filled.svg" : "/icons/heart-outline.svg"}
                alt="like"
                className="icon-svg"
              />
              <span>{post.likeCount ?? 0}</span>
            </button>
            <button
              className="icon-btn"
              onClick={() =>
                setExpandedComments((prev) => ({ ...prev, [post._id]: !prev[post._id] }))
              }
              type="button"
            >
              <img src="/icons/comment-outline.svg" alt="comment" className="icon-svg" />
              <span>{post.commentCount ?? 0}</span>
            </button>
          </footer>
          {expandedComments[post._id] && (
            <>
              <CommentBox
                onClose={() =>
                  setExpandedComments((prev) => ({ ...prev, [post._id]: false }))
                }
                onSubmit={(text) => submitComment(post._id, text)}
                isAuthed={isAuthed}
              />

              {post.comments && post.comments.length > 0 && (
                <div className="comments">
                  {post.comments.map((c) => (
                    <div className="comment" key={c._id}>
                      <div className="avatar small">
                        {(c.username || "U").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="comment-author">{c.username || "User"}</div>
                        <div className="comment-text">{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </article>
      ))}
    </div>
  );
}

