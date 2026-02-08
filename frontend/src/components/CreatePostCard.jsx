import React from "react";

export default function CreatePostCard({ isAuthed, postForm, setPostForm, onSubmit, loading }) {
  return (
    <div className="card create-card">
      <div className="create-header">
        <h2>Create Post</h2>
      </div>
      <form className="create-body" onSubmit={onSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={postForm.text}
          onChange={(e) => setPostForm((p) => ({ ...p, text: e.target.value }))}
          rows={3}
        />
        <div className="create-actions">
          <label className="file-pill">
            <img src="/icons/upload.svg" alt="upload" className="icon-upload" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPostForm((p) => ({ ...p, imageFile: e.target.files?.[0] || null }))
              }
              hidden
            />
          </label>
          {postForm.imageFile && (
            <span className="pill subtle">{postForm.imageFile.name}</span>
          )}
          <button className="btn primary" type="submit" disabled={loading || !isAuthed}>
            {isAuthed ? (loading ? "Posting..." : "Post") : "Login to Post"}
          </button>
        </div>
      </form>
    </div>
  );
}

