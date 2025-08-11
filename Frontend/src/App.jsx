import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Login, Signup, Home } from "./pages";
import VenuesList from "./pages/VenuesList";
import VenueDetails from "./pages/VenueDetails";
import MyBookings from "./pages/MyBookings";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import BookingDetails from "./pages/BookingDetails";
import WriteReview from "./pages/WriteReview";
import AddVenue from "./pages/AddVenue";
import EditVenue from "./pages/EditVenue";
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
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
          <Route path="/booking/:id/review" element={<WriteReview />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/venues/add" element={<AddVenue />} />
          <Route path="/owner/venues/edit/:id" element={<EditVenue />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
