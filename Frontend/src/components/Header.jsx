import { Link } from "react-router-dom";
import "./Header.css";

function Header({ name }) {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>Hi, I'm <span>{name}</span></h1>
        <h2>B.Tech Information Technology Student</h2>
        <p>
          Passionate about Web Development, Java,
          Spring Boot and building modern applications.
        </p>

        <div className="hero-btn-group">
          <Link to="/portfolio" className="hero-btn primary-btn">
            Explore Portfolio
          </Link>
          <Link to="/tasks" className="hero-btn secondary-btn">
            View Tasks
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Header;
