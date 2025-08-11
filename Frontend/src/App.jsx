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
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import Layout from "./components/Layout";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
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
              <RoleProtectedRoute allowedRoles={["user"]} redirectTo="/">
                <VenuesList />
              </RoleProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/venues/:id"
          element={
            <Layout>
              <RoleProtectedRoute
                allowedRoles={["user", "admin", "owner"]}
                redirectTo="/"
              >
                <VenueDetails />
              </RoleProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <Layout>
              <RoleProtectedRoute allowedRoles={["user"]} redirectTo="/">
                <MyBookings />
              </RoleProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <RoleProtectedRoute>
                <Profile />
              </RoleProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/booking/:id"
          element={
            <Layout>
              <RoleProtectedRoute allowedRoles={["user"]} redirectTo="/">
                <BookingDetails />
              </RoleProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/booking/:id/review"
          element={
            <Layout>
              <RoleProtectedRoute allowedRoles={["user"]} redirectTo="/">
                <WriteReview />
              </RoleProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/owner/dashboard"
          element={
            <Layout>
              <RoleProtectedRoute allowedRoles={["owner"]} redirectTo="/">
                <OwnerDashboard />
              </RoleProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/owner/venues/add"
          element={
            <Layout>
              <RoleProtectedRoute
                allowedRoles={["owner"]}
                redirectTo="/owner/dashboard"
              >
                <AddVenue />
              </RoleProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/owner/venues/edit/:id"
          element={
            <Layout>
              <RoleProtectedRoute
                allowedRoles={["owner"]}
                redirectTo="/owner/dashboard"
              >
                <EditVenue />
              </RoleProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <Layout>
              <RoleProtectedRoute allowedRoles={["admin"]} redirectTo="/">
                <AdminDashboard />
              </RoleProtectedRoute>
            </Layout>
          }
        />

        {/* Payment pages */}
        <Route
          path="/payment-success"
          element={
            <Layout>
              <RoleProtectedRoute allowedRoles={["user"]} redirectTo="/">
                <PaymentSuccess />
              </RoleProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/payment-cancelled"
          element={
            <Layout>
              <RoleProtectedRoute allowedRoles={["user"]} redirectTo="/">
                <PaymentCancelled />
              </RoleProtectedRoute>
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
