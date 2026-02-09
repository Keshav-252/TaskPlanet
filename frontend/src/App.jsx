import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./styles/app.css";
import FeedPage from "./pages/Feed.jsx";
import LoginPage from "./pages/Login.jsx";
import SignupPage from "./pages/Signup.jsx";

const API_BASE = import.meta.env.VITE_API_URL 

const emptyPost = { text: "", imageFile: null };

function App() {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [toast, setToast] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("tp_token") || "");
  const [currentUser, setCurrentUser] = useState(
    () => localStorage.getItem("tp_username") || localStorage.getItem("tp_email") || ""
  );
  const [postForm, setPostForm] = useState(emptyPost);
  const [commentingId, setCommentingId] = useState(null);

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  useEffect(() => {
    fetchPosts();
  }, [token]); // refetch to get fresh like state after login/logout

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchPosts = async (opts = {}) => {
    try {
      setFeedLoading(true);
      const useHeaders = opts.noAuth ? {} : headers;
      const res = await fetch(`${API_BASE}posts`, { headers: useHeaders });
      if (!res.ok) throw new Error("Failed to load feed");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to load feed");
    } finally {
      setFeedLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError("");
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const username = form.get("username");
    const password = form.get("password");
    if (!email || !password || !username) {
      setAuthError("Email, username, and password are required");
      return;
    }
    try {
      setAuthLoading(true);
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Signup failed");
      showToast("Account created. Please login.");
      navigate("/login");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");
    if (!email || !password) {
      setAuthError("Email and password are required");
      return;
    }
    try {
      setAuthLoading(true);
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.msg || "Login failed");
      setToken(data.token);
      const username = data.username || email;
      setCurrentUser(username);
      localStorage.setItem("tp_token", data.token);
      localStorage.setItem("tp_email", email);
      localStorage.setItem("tp_username", username);
      showToast("Logged in");
      navigate("/");
      fetchPosts();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setCurrentUser("");
    localStorage.removeItem("tp_token");
    localStorage.removeItem("tp_email");
    localStorage.removeItem("tp_username");
    showToast("Logged out");
    // Fetch posts without auth so likedByMe flags are cleared immediately
    fetchPosts({ noAuth: true });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!token) return showToast("Please login to post");
    if (!postForm.text && !postForm.imageFile) {
      showToast("Add text or image");
      return;
    }
    const fd = new FormData();
    if (postForm.text) fd.append("text", postForm.text);
    if (postForm.imageFile) fd.append("image", postForm.imageFile);
    try {
      setCreateLoading(true);
      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers,
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.msg || "Failed to create post");
      }
      setPostForm(emptyPost);
      showToast("Posted");
      fetchPosts();
    } catch (err) {
      showToast(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleLike = async (id) => {
    if (!token) return showToast("Login to like");
    try {
      const res = await fetch(`${API_BASE}/posts/${id}/like`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Failed to like");
      const data = await res.json().catch(() => ({}));
      // Optimistically update post likeCount and likedByMe without re-fetching full feed
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== id) return p;
          const currentLiked = !!p.likedByMe;
          const newCount =
            typeof data.likes === "number"
              ? data.likes
              : currentLiked
                ? Math.max(0, (p.likeCount || 0) - 1)
                : (p.likeCount || 0) + 1;
          return { ...p, likeCount: newCount, likedByMe: !currentLiked };
        })
      );
    } catch (err) {
      showToast(err.message);
    }
  };

  const submitComment = async (id, text) => {
    if (!token) return showToast("Login to comment");
    if (!text) return;
    try {
      const res = await fetch(`${API_BASE}/posts/${id}/comment`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to comment");
      const data = await res.json().catch(() => null); // backend returns post.comments
      // Optimistically prepend comment for the post so it's visible immediately
      setPosts((prev) =>
        prev.map((p) =>
          p._id === id
            ? {
              ...p,
              commentCount: data ? data.length : (p.commentCount || 0) + 1,
              comments: [
                { username: currentUser || "You", text, _id: `c-${Date.now()}` },
                ...(p.comments || []),
              ],
            }
            : p
        )
      );
      setCommentingId(null);
    } catch (err) {
      showToast(err.message);
    }
  };

  const isAuthed = Boolean(token);

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">TaskPlanet Social</div>
        <div className="top-actions">
          {isAuthed ? (
            <>
              <span className="pill subtle">Logged in as {currentUser}</span>
              <button className="btn secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="auth-toggle">
              <button className="btn primary" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="btn ghost" onClick={() => navigate("/signup")}>
                Sign up
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="layout">
        <Routes>
          <Route
            path="/"
            element={
              <FeedPage
                isAuthed={isAuthed}
                postForm={postForm}
                setPostForm={setPostForm}
                onCreatePost={handleCreatePost}
                createLoading={createLoading}
                posts={posts}
                feedLoading={feedLoading}
                onLike={toggleLike}
                onComment={(id) => setCommentingId((prev) => (prev === id ? null : id))}
                commentingId={commentingId}
                submitComment={submitComment}
              />
            }
          />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} authLoading={authLoading} authError={authError} />} />
          <Route path="/signup" element={<SignupPage onSignup={handleSignup} authLoading={authLoading} authError={authError} />} />
        </Routes>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
