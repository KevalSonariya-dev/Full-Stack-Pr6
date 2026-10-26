import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useState, lazy, Suspense } from "react";

import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/Spinner";

// Lazy-loaded route components
const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <AuthProvider>
      <div className={`app-shell ${darkMode ? "dark" : "light"}`}>
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <div className="container">
          <Suspense fallback={<Spinner message="Loading page..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;