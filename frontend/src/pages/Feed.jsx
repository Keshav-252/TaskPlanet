import React from "react";
import CreatePostCard from "../components/CreatePostCard.jsx";
import Feed from "../components/Feed.jsx";

export default function FeedPage({
  isAuthed,
  postForm,
  setPostForm,
  onCreatePost,
  createLoading,
  posts,
  feedLoading,
  onLike,
  onComment,
  commentingId,
  submitComment,
}) {
  return (
    <section className="left">
      <CreatePostCard
        isAuthed={isAuthed}
        postForm={postForm}
        setPostForm={setPostForm}
        onSubmit={onCreatePost}
        loading={createLoading}
      />
      <Feed
        posts={posts}
        loading={feedLoading}
        onLike={onLike}
        onComment={onComment}
        commentingId={commentingId}
        submitComment={submitComment}
        isAuthed={isAuthed}
      />
    </section>
  );
}

