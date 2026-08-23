import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ darkMode, setDarkMode }) {
  return (
    <nav className="navbar">
      <Link to="/" className="brand" aria-label="Go to home page">
        <span className="brand-mark">K</span>
        <span>Keval's Portfolio</span>
      </Link>

      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/projects">Tasks</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
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