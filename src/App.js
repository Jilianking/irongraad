// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import ActiveProjects from "./pages/ActiveProjects";
import NewProject from "./pages/NewProject";
import ProjectPage from "./pages/ProjectPage"; // ✅ Import project advancement page

console.log("DASHBOARD LOADED");

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ActiveProjects" element={<ActiveProjects />} />
        <Route path="/NewProject" element={<NewProject />} />
        <Route path="/project/:id" element={<ProjectPage />} /> {/* ✅ Project advancement route */}
      </Routes>
    </Router>
  );
}

export default App;
