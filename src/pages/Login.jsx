import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("user");
  const [loginId, setLoginId] = useState(location.state?.registeredEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (currentUser) return <Navigate to="/" replace />;

  const submit = (event) => {
    event.preventDefault();
    const identifier = event.currentTarget.email?.value || role;
    if (!login(identifier, password)) {
      setError("Incorrect email or password.");
      return;
    }
    const signedInUser = JSON.parse(localStorage.getItem("moviehub_user") || "null");
    navigate(location.state?.from?.pathname || "/", {
      replace: true,
      state: {
        welcomeType: location.state?.registeredName ? "new" : "returning",
        welcomeName: signedInUser?.name || "Movie Fan"
      }
    });
  };

  return (
    <section className="login-page">
      <div className="login-card">
        <p className="eyebrow">MovieHub access</p>
        <h1>Choose your workspace</h1>
        <p className="muted">Sign in as a catalog administrator or a movie reviewer.</p>

        <div className="role-switcher" aria-label="Account type">
          <button type="button" className={role === "user" ? "role-option selected" : "role-option"} onClick={() => setRole("user")}>
            <strong>User</strong>
            <span>Browse, filter and review</span>
          </button>
          <button type="button" className={role === "admin" ? "role-option selected" : "role-option"} onClick={() => { setRole("admin"); setLoginId("admincinemanage@gmail.com"); }}>
            <strong>Admin</strong>
            <span>Manage movies and genres</span>
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            {role === "admin" ? "Email" : "Login ID"}
            <input name="email" type={role === "admin" ? "email" : "text"} value={loginId} onChange={(event) => setLoginId(event.target.value)} placeholder={role === "admin" ? "admincinemanage@gmail.com" : "Enter login ID"} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="button button-primary full">Sign in as {role}</button>
        </form>
        <p className="login-hint">{role === "admin" ? <>Demo password: <strong>admin123</strong></> : <>Demo password: <strong>user123</strong></>}</p>
        <Link to="/register" className="button button-secondary full register-link">Register new user</Link>
      </div>
    </section>
  );
}

export default Login;