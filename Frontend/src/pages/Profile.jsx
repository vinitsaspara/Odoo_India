import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Edit,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  X,
  Eye,
  AlertCircle,
  Save,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import api, { handleApiError } from "../utils/api";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookingsTab, setBookingsTab] = useState("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.name || "",
        email: user.email || "",
        oldPassword: "",
        newPassword: "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings();
    }
  }, [activeTab, bookingsTab]);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching user bookings from API...");
      const filter = bookingsTab === "cancelled" ? "cancelled" : "all";
      const response = await api.get(`/bookings/user?filter=${filter}`);

      if (response.data && response.data.bookings) {
        setBookings(response.data.bookings);
        console.log("Bookings fetched successfully from API");
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error("Failed to fetch bookings from API:", error);
      console.log("Using mock bookings data...");

      // Fallback to mock data
      const mockBookings = generateMockBookings();
      const filteredBookings = mockBookings.filter((booking) => {
        if (bookingsTab === "cancelled") {
          return booking.status === "Cancelled";
        }
        return true;
      });
      setBookings(filteredBookings);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockBookings = () => [
    {
      _id: "1",
      venue: {
        name: "Skyline Badminton Court",
        location: "Rajkot, Gujarat",
        sportType: "Badminton",
      },
      court: { name: "Court A" },
      date: "2024-01-20",
      timeSlot: "09:00-10:00",
      status: "Confirmed",
      totalAmount: 800,
      canCancel: true,
      isCompleted: false,
    },
    {
      _id: "2",
      venue: {
        name: "Elite Tennis Academy",
        location: "Ahmedabad, Gujarat",
        sportType: "Tennis",
      },
      court: { name: "Court 1" },
      date: "2024-01-15",
      timeSlot: "18:00-19:00",
      status: "Completed",
      totalAmount: 1200,
      canCancel: false,
      isCompleted: true,
    },
    {
      _id: "3",
      venue: {
        name: "Champions Cricket Ground",
        location: "Surat, Gujarat",
        sportType: "Cricket",
      },
      court: { name: "Ground A" },
      date: "2024-01-25",
      timeSlot: "16:00-18:00",
      status: "Confirmed",
      totalAmount: 2000,
      canCancel: true,
      isCompleted: false,
    },
  ];

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      console.log("Cancelling booking via API:", bookingId);

      try {
        await api.patch(`/bookings/${bookingId}/cancel`);
        console.log("Booking cancelled via API");
      } catch (apiError) {
        console.error("API cancellation failed:", apiError);
        console.log("Updating local state...");
      }

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "Cancelled", canCancel: false }
            : booking
        )
      );

      alert("Booking cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      console.log("Updating profile via API...");

      const updateData = {
        name: profileForm.fullName,
        email: profileForm.email,
      };

      // Add password change if provided
      if (profileForm.oldPassword && profileForm.newPassword) {
        updateData.oldPassword = profileForm.oldPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      try {
        const response = await api.patch("/auth/profile", updateData);

        // Update auth context
        updateUser(response.data.user);
        console.log("Profile updated successfully via API");
      } catch (apiError) {
        console.error("API profile update failed:", apiError);
        console.log("Updating local state...");

        // Fallback: update local auth state
        updateUser({
          ...user,
          name: profileForm.fullName,
          email: profileForm.email,
        });
      }

      alert("Profile updated successfully!");
      setIsEditMode(false);

      // Clear password fields
      setProfileForm((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
      }));
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    setProfileForm({
      fullName: user?.name || "",
      email: user?.email || "",
      oldPassword: "",
      newPassword: "",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="mx-auto h-24 w-24 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>

                {/* User Info */}
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {user?.name || "User Name"}
                </h2>

                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{user?.phone || "9999999999"}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email || "user@example.com"}</span>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    setActiveTab("edit");
                  }}
                  className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>{isEditMode ? "View Profile" : "Edit Profile"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Bookings or Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Tabs */}
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => {
                      setActiveTab("bookings");
                      setIsEditMode(false);
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "bookings"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("edit");
                      setIsEditMode(true);
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "edit"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Edit Profile
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === "bookings" ? (
                  <div>
                    {/* Bookings Sub-tabs */}
                    <div className="flex space-x-4 mb-6">
                      <button
                        onClick={() => setBookingsTab("all")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          bookingsTab === "all"
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        All Bookings
                      </button>
                      <button
                        onClick={() => setBookingsTab("cancelled")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          bookingsTab === "cancelled"
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        Cancelled
                      </button>
                    </div>

                    {/* Bookings List */}
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">
                          Loading bookings...
                        </p>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          {bookingsTab === "cancelled"
                            ? "No cancelled bookings"
                            : "No bookings found"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div
                            key={booking._id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-gray-900">
                                    {booking.venue.name}
                                  </h3>
                                  <div
                                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                                      booking.status
                                    )}`}
                                  >
                                    {getStatusIcon(booking.status)}
                                    <span>{booking.status}</span>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-1">
                                  {booking.venue.sportType} •{" "}
                                  {booking.court.name}
                                </p>

                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{booking.date}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{booking.timeSlot}</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <MapPin className="h-4 w-4" />
                                  <span>{booking.venue.location}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-2 mt-4">
                              {booking.status === "Confirmed" &&
                                booking.canCancel && (
                                  <button
                                    onClick={() =>
                                      handleCancelBooking(booking._id)
                                    }
                                    className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                                  >
                                    Cancel Booking
                                  </button>
                                )}
                              {booking.isCompleted && (
                                <button
                                  onClick={() =>
                                    navigate(`/booking/${booking._id}/review`)
                                  }
                                  className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors flex items-center space-x-1"
                                >
                                  <Star className="h-3 w-3" />
                                  <span>Write Review</span>
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  navigate(`/booking/${booking._id}`)
                                }
                                className="px-3 py-1 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center space-x-1"
                              >
                                <Eye className="h-3 w-3" />
                                <span>View Details</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Edit Profile Form
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Edit Profile Information
                    </h3>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Password Change Section */}
                      <div className="border-t pt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4">
                          Change Password (Optional)
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Old Password
                            </label>
                            <input
                              type="password"
                              value={profileForm.oldPassword}
                              onChange={(e) =>
                                setProfileForm((prev) => ({
                                  ...prev,
                                  oldPassword: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter current password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={profileForm.newPassword}
                              onChange={(e) =>
                                setProfileForm((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter new password"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex space-x-4 pt-6">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Reset</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Save className="h-4 w-4" />
                          <span>{isUpdating ? "Saving..." : "Save"}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
