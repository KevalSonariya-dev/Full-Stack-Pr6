import { useState } from "react";
import "./Contact.css";

function Contact() {
  const [message, setMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="contact-page">

      <div className="contact-card">

        <div className="contact-left">

          <h1>Get In Touch</h1>

          <p>
            Have a question or want to collaborate?
            Feel free to send me a message.
          </p>

          <div className="contact-info">

            <h3>📧 Email</h3>
            <p>d25it126@charusat.edu.in</p>

            <h3>📍 Location</h3>
            <p>Gujarat, India</p>

            <h3>💻 Skills</h3>
            <p>Java • Python • Spring Boot</p>

          </div>

          <button
            className="toggle-btn"
            onClick={() => setShowInfo(!showInfo)}
          >
            {showInfo ? "Hide More Info" : "Show More Info"}
          </button>

          {showInfo && (
            <div className="extra-info">
              <p>
                I enjoy building responsive web applications,
                learning new technologies, and solving coding
                problems.
              </p>
            </div>
          )}

        </div>

        <div className="contact-right">

          <h2>Send Message</h2>

          <form>

            <input
              type="text"
              placeholder="Your Name"
            />

            <input
              type="email"
              placeholder="Your Email"
            />

            <textarea
              rows="6"
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <p className="counter">
              Characters : {message.length}
            </p>

            <button
              type="submit"
              className="submit-btn"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;