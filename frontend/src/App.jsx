import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import EmploymentOverview from "./pages/EmploymentOverview";

const App = () => (
  <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/district/:name" element={<Dashboard />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/employment" element={<EmploymentOverview />} />
      </Routes>
    </Router>
);

export default App;
