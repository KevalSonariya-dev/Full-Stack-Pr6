import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`app-shell ${darkMode ? "dark" : "light"}`}>
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;