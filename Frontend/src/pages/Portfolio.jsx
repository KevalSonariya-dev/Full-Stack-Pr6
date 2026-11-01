import { useState } from "react";
import { Link } from "react-router-dom";
import "./Portfolio.css";

// Keval's verified projects catalog
const projectsData = [
  {
    id: "task-manager-fullstack",
    title: "Full-Stack Task & Productivity Platform",
    category: "fullstack",
    categoryLabel: "Full-Stack MERN + AI",
    badge: "Live App on This Site",
    description:
      "The flagship production web application built directly for this website. Features complete per-user private data isolation, real-time multi-tab synchronization via Server-Sent Events (SSE) and browser BroadcastChannel, Google Gemini AI task breakdown, and high-performance in-memory caching.",
    techStack: [
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "Google Gemini AI",
      "Server-Sent Events",
      "JWT Auth",
      "Node-Cache"
    ],
    githubUrl: "https://github.com/KevalSonariya-dev/Full-Stack-Pr6",
    liveUrl: "/tasks",
    isInternal: true,
    highlights: [
      "Strict per-user data isolation with secure bcrypt + JWT authentication",
      "Zero-latency real-time dual sync via SSE stream & cross-tab BroadcastChannel",
      "Google Gemini AI integration for contextual task breakdowns with graceful offline fallback",
      "Automated CI/CD test pipeline with Jest and Supertest validation"
    ]
  },
  {
    id: "investment-risk-analyser",
    title: "AI-Powered Investment Risk Analyser",
    category: "ai-ml",
    categoryLabel: "FinTech • ML / Analytics",
    badge: "Machine Learning",
    description:
      "A comprehensive full-stack portfolio risk analysis platform integrating real-world market APIs (Zerodha, Upstox, and Angel One). Utilizes engineered financial features and a trained Random Forest classification model to evaluate risk profiles and generate personalized rebalancing recommendations.",
    techStack: [
      "Python",
      "Machine Learning",
      "Random Forest",
      "FinTech APIs",
      "JWT Auth",
      "Data Encryption",
      "Financial Engineering"
    ],
    githubUrl: null, // Private / institutional repository
    liveUrl: null,   // No live link available
    isInternal: false,
    highlights: [
      "Real broker integrations with Zerodha, Upstox, and Angel One APIs",
      "Calculates institutional metrics: Volatility, Value at Risk (VaR), Sharpe Ratio, Beta, and Concentration Risk",
      "Trained Random Forest machine learning model to classify asset and portfolio risk levels",
      "End-to-end security: JWT authentication, encrypted sensitive data, and ISIN-based aggregation"
    ]
  },
  {
    id: "local-llm-aatma-ai",
    title: "Local LLM Prototype (Aatma AI)",
    category: "ai-ml",
    categoryLabel: "Local AI • Privacy-First",
    badge: "Offline AI Engine",
    description:
      "A privacy-first, fully offline conversational AI prototype developed using Ollama and the Qwen 4B parameter model. Operates completely on-device without internet connectivity or external cloud APIs, guaranteeing total user data privacy and zero telemetry.",
    techStack: [
      "Python",
      "Ollama",
      "Qwen 4B",
      "Local LLMs",
      "Edge AI",
      "Privacy-First Architecture"
    ],
    githubUrl: "https://github.com/kevalsonariya/aatma-ai",
    liveUrl: null, // Offline local engine - no live link
    isInternal: false,
    highlights: [
      "100% on-device local model inference with zero internet requirement",
      "Utilizes Ollama with Qwen 4B parameter model for high-efficiency local execution",
      "Zero third-party telemetry, retaining all chat histories and parameters securely on device",
      "Explores local AI application engineering without reliance on proprietary cloud APIs"
    ]
  },
  {
    id: "vehicle-alert-system-ssip",
    title: "Vehicle Alert System — SSIP Granted",
    category: "iot-cv",
    categoryLabel: "Embedded AI • SSIP Funded",
    badge: "Govt. SSIP Granted",
    description:
      "A government-funded smart vehicle safety and accident prevention system granted under the Student Startup & Innovation Policy (SSIP). Combines Raspberry Pi edge computing, sensor fusion, and computer vision algorithms to monitor driver alertness and road hazards in real time.",
    techStack: [
      "Raspberry Pi",
      "Computer Vision (OpenCV)",
      "Python",
      "IoT Sensors",
      "Edge AI",
      "Hardware Fusion"
    ],
    githubUrl: "https://github.com/KevalSonariya-dev/vehicle-alert-system",
    liveUrl: null, // Embedded hardware project - no live link
    isInternal: false,
    highlights: [
      "Recipient of Student Startup & Innovation Policy (SSIP) grant for engineering innovation",
      "Real-time driver fatigue and drowsiness detection using computer vision algorithms",
      "Automated traffic sign recognition and obstacle distance sensing",
      "Accident prevention, impact sensing, and automated emergency notification pipeline"
    ]
  }
];

const skillCategories = [
  {
    category: "Languages & Frameworks",
    skills: ["Python", "Java", "JavaScript (ES6+)", "React.js", "Spring Boot", "Node.js", "Express.js"]
  },
  {
    category: "AI, Machine Learning & Vision",
    skills: ["Local LLMs (Ollama / Qwen)", "Random Forest (ML)", "Computer Vision (OpenCV)", "Prompt Engineering"]
  },
  {
    category: "Hardware & Edge Computing",
    skills: ["Raspberry Pi", "IoT Sensors Fusion", "Edge AI Execution", "Hardware Interfaces"]
  },
  {
    category: "Databases, Cloud & Tools",
    skills: ["MongoDB & Mongoose", "SQL", "RESTful APIs", "JWT Auth", "Git & GitHub", "Vite", "Jest Testing"]
  }
];

function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects =
    activeCategory === "all"
      ? projectsData
      : projectsData.filter((p) => p.category === activeCategory);

  return (
    <div className="portfolio-page">
      {/* Developer Hero & Overview */}
      <section className="portfolio-hero">
        <div className="hero-content">
          <div className="status-badge">
            <span className="status-dot"></span> B.Tech IT Student & Full-Stack Developer
          </div>
          <h1>
            Keval <span className="highlight-text">Sonariya</span>
          </h1>
          <p className="hero-subtitle">
            Information Technology undergraduate at <strong>CHARUSAT</strong>. Passionate about
            building scalable web applications, full-stack systems with <strong>React & Node.js</strong>,
            and engineering solutions with <strong>Python, Machine Learning, and Embedded AI</strong>.
          </p>

          <div className="hero-actions">
            <a
              href="https://github.com/KevalSonariya-dev"
              target="_blank"
              rel="noreferrer"
              className="btn btn-github"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub Profile
            </a>

            <a
              href="https://www.linkedin.com/in/sonariya-keval-5b10392a5/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-linkedin"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 1.53-1.53A1.53 1.53 0 0 0 6.46 5.7a1.53 1.53 0 0 0-1.53 1.53c0 .85.68 1.53 1.53 1.53m1.39 9.74v-8.37H5.07v8.37h2.78z" />
              </svg>
              LinkedIn
            </a>

            <Link to="/tasks" className="btn btn-primary">
              Launch Task Manager
            </Link>

            <Link to="/contact" className="btn btn-secondary">
              Get In Touch
            </Link>
          </div>

          <div className="hero-meta-bar">
            <div className="meta-item">
              <span className="meta-label">University</span>
              <span className="meta-value">CHARUSAT</span>
            </div>
            <div className="meta-divider"></div>
            <div className="meta-item">
              <span className="meta-label">Location</span>
              <span className="meta-value">Gujarat, India</span>
            </div>
            <div className="meta-divider"></div>
            <div className="meta-item">
              <span className="meta-label">Email</span>
              <span className="meta-value">d25it126@charusat.edu.in</span>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase Section */}
      <section className="projects-showcase">
        <div className="section-head">
          <p className="section-tag">Featured Work</p>
          <h2>Projects & Implementations</h2>
          <p className="section-desc">
            Explore live applications, local AI models, machine learning systems, and hardware projects.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="filter-tabs">
          <button
            className={`filter-btn ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            All Projects ({projectsData.length})
          </button>
          <button
            className={`filter-btn ${activeCategory === "fullstack" ? "active" : ""}`}
            onClick={() => setActiveCategory("fullstack")}
          >
            Full-Stack Web
          </button>
          <button
            className={`filter-btn ${activeCategory === "ai-ml" ? "active" : ""}`}
            onClick={() => setActiveCategory("ai-ml")}
          >
            AI & Machine Learning
          </button>
          <button
            className={`filter-btn ${activeCategory === "iot-cv" ? "active" : ""}`}
            onClick={() => setActiveCategory("iot-cv")}
          >
            IoT & Embedded AI
          </button>
        </div>

        {/* Project Cards Grid */}
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <article key={project.id} className="project-card">
              <div className="project-header">
                <span className="category-tag">{project.categoryLabel}</span>
                <span className="badge-tag">{project.badge}</span>
              </div>

              <h3>{project.title}</h3>
              <p className="project-description">{project.description}</p>

              <div className="highlights-box">
                <h4>Key Highlights</h4>
                <ul>
                  {project.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="tech-stack-wrap">
                {project.techStack.map((tech, i) => (
                  <span key={i} className="tech-badge">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="project-footer">
                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="card-btn btn-outline"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub Code
                  </a>
                ) : (
                  <span className="card-btn btn-disabled" title="Repository is private / confidential">
                    🔒 Private Repository
                  </span>
                )}

                {/* Only render live link button if a valid liveUrl exists */}
                {project.liveUrl && (
                  project.isInternal ? (
                    <Link to={project.liveUrl} className="card-btn btn-accent">
                      Live App &rarr;
                    </Link>
                  ) : (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="card-btn btn-accent"
                    >
                      Live Demo &rarr;
                    </a>
                  )
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Technical Skills & Domains */}
      <section className="skills-overview">
        <div className="section-head">
          <p className="section-tag">Competencies</p>
          <h2>Technical Skills & Expertise</h2>
          <p className="section-desc">
            Technologies and tools applied throughout academic research, SSIP innovation grant, and project engineering.
          </p>
        </div>

        <div className="skills-category-grid">
          {skillCategories.map((group, idx) => (
            <div key={idx} className="skill-category-card">
              <h3>{group.category}</h3>
              <div className="skill-pills">
                {group.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="portfolio-cta">
        <div className="cta-inner">
          <h2>Ready to Collaborate or Review Code?</h2>
          <p>
            Test the live multi-user Task Management application or send a message directly.
          </p>
          <div className="cta-buttons">
            <Link to="/tasks" className="btn btn-primary">
              Test Live Task Manager
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Contact Developer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Portfolio;
