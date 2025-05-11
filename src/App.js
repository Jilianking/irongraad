// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import ActiveProjects from "./pages/ActiveProjects";
import NewProject from "./pages/NewProject";
import ProjectPage from "./pages/ProjectPage";
import Calendar from "./pages/Calendar";
import CustomerTracking from "./pages/CustomerTracking";
import Inbox from "./pages/Inbox";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/activeprojects" element={<ActiveProjects />} />
        <Route path="/newproject" element={<NewProject />} />
        <Route path="/project/:id" element={<ProjectPage />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/track/:trackingLinkId" element={<CustomerTracking />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="*" element={<div className="text-white p-6">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
