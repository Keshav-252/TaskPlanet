import React from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage({ onSignup, authLoading, authError }) {
  const navigate = useNavigate();
  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <div className="card auth-card" key="signup">
          <div className="tab-row">
            <button className="chip" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="chip chip-active">Sign up</button>
          </div>
          <form className="form" onSubmit={onSignup} autoComplete="off">
            <label>Username</label>
            <input name="username" type="text" placeholder="your handle" autoComplete="off" required />
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" autoComplete="off" required />
            <label>Password</label>
            <input name="password" type="password" placeholder="******" autoComplete="new-password" required minLength={6} />
            {authError && <div className="error">{authError}</div>}
            <button className="btn primary full" type="submit" disabled={authLoading}>
              {authLoading ? "Creating..." : "Create account"}
            </button>
            <button type="button" className="btn ghost full" onClick={() => navigate("/")} style={{ marginTop: 12 }}>
              Close
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

