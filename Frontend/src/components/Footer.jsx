import "./Footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-left">
          <h2>Keval Sonariya</h2>
          <p>
            Java Programmer | B.Tech IT Student
          </p>
        </div>

        <div className="footer-center">

          <h3>Quick Links</h3>

          <a href="/">Home</a>
          <a href="/projects">Tasks</a>
          <a href="/contact">Contact</a>

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
            href="https://linkedin.com"
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
        © {year} Keval Sonariya. All Rights Reserved.
      </p>

    </footer>
  );
}

export default Footer;