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
import Layout from "./components/Layout";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Pages with navbar */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/venues"
          element={
            <Layout>
              <VenuesList />
            </Layout>
          }
        />
        <Route
          path="/venues/:id"
          element={
            <Layout>
              <VenueDetails />
            </Layout>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <Layout>
              <MyBookings />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route
          path="/booking/:id"
          element={
            <Layout>
              <BookingDetails />
            </Layout>
          }
        />
        <Route
          path="/booking/:id/review"
          element={
            <Layout>
              <WriteReview />
            </Layout>
          }
        />
        <Route
          path="/owner/dashboard"
          element={
            <Layout>
              <OwnerDashboard />
            </Layout>
          }
        />
        <Route
          path="/owner/venues/add"
          element={
            <Layout>
              <AddVenue />
            </Layout>
          }
        />
        <Route
          path="/owner/venues/edit/:id"
          element={
            <Layout>
              <EditVenue />
            </Layout>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <Layout>
              <AdminDashboard />
            </Layout>
          }
        />

        {/* Auth pages without navbar */}
        <Route
          path="/login"
          element={
            <Layout showHeader={false} className="bg-white">
              <Login />
            </Layout>
          }
        />
        <Route
          path="/signup"
          element={
            <Layout showHeader={false} className="bg-white">
              <Signup />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
