import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!register(form.name, form.email, form.password)) {
      setError("An account with that email already exists.");
      return;
    }
    navigate("/login", { replace: true, state: { registeredEmail: form.email, registeredName: form.name.trim() } });
  };

  return (
    <section className="login-page">
      <div className="login-card">
        <p className="eyebrow">MovieHub access</p>
        <h1>Create your account</h1>
        <p className="muted">Register as a user to browse, filter, and review movies and series.</p>
        <form onSubmit={submit}>
          <label>Name<input name="name" value={form.name} onChange={handleChange} placeholder="Your name" autoFocus /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" /></label>
          <label>Confirm password<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} /></label>
          {error && <p className="error">{error}</p>}
          <button className="button button-primary full">Register</button>
        </form>
        <p className="login-hint">Already registered? <Link to="/login">Sign in</Link></p>
      </div>
    </section>
  );
}

export default Register;