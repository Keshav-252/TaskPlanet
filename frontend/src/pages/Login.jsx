import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ onLogin, authLoading, authError }) {
  const navigate = useNavigate();
  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <div className="card auth-card" key="login">
          <div className="tab-row">
            <button className={`chip chip-active`}>Login</button>
            <button className="chip" onClick={() => navigate("/signup")}>
              Sign up
            </button>
          </div>
          <form className="form" onSubmit={onLogin} autoComplete="off">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" autoComplete="off" required />
            <label>Password</label>
            <input name="password" type="password" placeholder="******" autoComplete="new-password" required />
            {authError && <div className="error">{authError}</div>}
            <button className="btn primary full" type="submit" disabled={authLoading}>
              {authLoading ? "Logging in..." : "Login"}
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

