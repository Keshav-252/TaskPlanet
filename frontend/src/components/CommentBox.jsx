import React, { useState } from "react";

export default function CommentBox({ onClose, onSubmit, isAuthed }) {
  const [text, setText] = useState("");
  return (
    <div className="comment-box">
      <textarea
        placeholder={isAuthed ? "Add a comment" : "Login to comment"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={!isAuthed}
      />
      <div className="comment-actions">
        <button className="btn ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn primary"
          onClick={() => {
            onSubmit(text);
            setText("");
          }}
          disabled={!isAuthed || !text.trim()}
        >
          Post
        </button>
      </div>
    </div>
  );
}

