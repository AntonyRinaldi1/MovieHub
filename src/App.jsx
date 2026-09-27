import { useEffect } from "react";
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import MovieForm from "./pages/MovieForm";
import GenreManager from "./pages/GenreManager";
import Login from "./pages/Login";
import Series from "./pages/Series";
import SeriesForm from "./pages/SeriesForm";
import SeriesDetails from "./pages/SeriesDetails";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function RequireAuth({ children, role }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && currentUser.role !== role) return <Navigate to="/" replace />;
  return children;
}

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/movies", label: "Movies" },
    { to: "/series", label: "Series" },
    ...(currentUser?.role === "admin" ? [
      { to: "/movies/add", label: "Add Movie" },
      { to: "/series/add", label: "Add Series" },
      { to: "/genres", label: "Genres" }
    ] : [])
  ];

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <NavLink to="/" className="brand">
          <span className="brand-icon">MH</span>
          <span>MovieHub</span>
        </NavLink>

        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        {currentUser && (
          <div className="session-controls">
            <NavLink to="/profile" className="profile-link" aria-label="Open profile">
              {currentUser.profilePic ? <img src={currentUser.profilePic} alt="" /> : <span>{currentUser.name?.charAt(0).toUpperCase() || "U"}</span>}
            </NavLink>
            <span className="session-label">{currentUser.name} · {currentUser.role}</span>
            <button className="button button-secondary small" onClick={() => { logout(); navigate("/login"); }}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}

function App() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <>
      <ProtectedApp />
    </>
  );
}

function ProtectedApp() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { welcomeType, welcomeName } = location.state || {};
    if (!welcomeType) return;

    window.alert(welcomeType === "new" ? "Welcome to MovieHub!" : `Welcome back, ${welcomeName}!`);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  if (!currentUser) return null;

  return (
    <>
      <Navbar />
      <main className="container main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<Series />} />
          <Route path="/series/add" element={<RequireAuth role="admin"><SeriesForm /></RequireAuth>} />
          <Route path="/series/:id" element={<SeriesDetails />} />
          <Route path="/series/:id/edit" element={<RequireAuth role="admin"><SeriesForm /></RequireAuth>} />
          <Route path="/movies/add" element={<RequireAuth role="admin"><MovieForm /></RequireAuth>} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/movies/:id/edit" element={<RequireAuth role="admin"><MovieForm /></RequireAuth>} />
          <Route path="/genres" element={<RequireAuth role="admin"><GenreManager /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
