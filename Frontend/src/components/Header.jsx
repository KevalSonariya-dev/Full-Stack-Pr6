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

        <a href="/projects">
          <button className="hero-btn">
            View Tasks
          </button>
        </a>

      </div>

    </section>
  );
}

export default Header;