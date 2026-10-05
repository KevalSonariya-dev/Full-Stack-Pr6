import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
import "../pages/Auth.css";

function Navbar({ darkMode, setDarkMode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand" aria-label="Go to home page">
        <span className="brand-mark">K</span>
        <span>Task Management</span>
      </Link>

      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>

        {isAuthenticated ? (
          <>
            <li>
              <Link to="/projects">Tasks</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <span className="user-badge" title={user?.email || "Logged in"}>
                👤 {user?.email || "User"}
              </span>
            </li>
            <li>
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </>
        )}
      </ul>

      <button
        type="button"
        className="mode-btn"
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "☀ Light" : "🌙 Dark"}
      </button>
    </nav>
  );
}

export default Navbar;