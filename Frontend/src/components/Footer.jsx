import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h2>Keval Sonariya</h2>
          <p>
            Full-Stack Developer | B.Tech IT Student @ CHARUSAT
          </p>
        </div>

        <div className="footer-center">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/portfolio">Portfolio</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-right">
          <h3>Connect</h3>
          <a
            href="https://github.com/KevalSonariya-dev"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/sonariya-keval-5b10392a5/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <a href="mailto:d25it126@charusat.edu.in">
            Email
          </a>
        </div>
      </div>

      <hr />

      <p className="copyright">
        &copy; {year} Keval Sonariya. All Rights Reserved.
      </p>
    </footer>
  );
}

export default Footer;
