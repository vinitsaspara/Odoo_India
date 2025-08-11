import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Login, Signup, Home } from "./pages";
import VenuesList from "./pages/VenuesList";
import VenueDetails from "./pages/VenueDetails";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/venues" element={<VenuesList />} />
          <Route path="/venues/:id" element={<VenueDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
