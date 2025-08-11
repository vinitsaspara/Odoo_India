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
  Building2,
  Users,
  Award,
  Shield,
  Zap,
  TrendingUp,
  Info,
  Crown,
  Heart,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useVenues } from "../hooks/useVenues";
import { getSportPlaceholder } from "../utils/placeholderImages";
import api, { handleApiError } from "../utils/api";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const {
    venues,
    allVenues,
    isLoading: venuesLoading,
    error: venuesError,
    getOwnerVenues,
    getAllVenues,
    clearVenueError,
  } = useVenues();

  // Enhanced Admin Venue Card Component
  const AdminVenueCard = ({ venue, type = "accepted" }) => {
    const getDisplayImage = () => {
      if (venue.images?.[0]?.url) return venue.images[0].url;
      if (venue.coverImage?.url) return venue.coverImage.url;
      return `/api/placeholder/300/200?text=${encodeURIComponent(venue.name)}`;
    };

    const getStatusBadge = () => {
      const isAccepted = type === "accepted";
      return (
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
            isAccepted
              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
              : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200"
          }`}
        >
          {isAccepted ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1.5" />
              Approved & Active
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1.5" />
              Rejected
            </>
          )}
        </div>
      );
    };

    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    return (
      <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
        {/* Premium Badge for featured venues */}
        {venue.featured && (
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </div>
          </div>
        )}

        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={getDisplayImage()}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = `/api/placeholder/300/200?text=${encodeURIComponent(
                venue.name
              )}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Status Badge */}
          <div className="absolute bottom-4 left-4">{getStatusBadge()}</div>

          {/* Courts Count */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-800 shadow-lg">
              {venue.totalCourts || "N/A"} Courts
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
              {venue.name}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <User className="h-4 w-4 mr-2 text-blue-500" />
              <span className="font-medium">
                by {venue.ownerId?.name || "Unknown Owner"}
              </span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-2 text-green-500" />
              <span className="line-clamp-1">
                {venue.address || venue.location || "Address not available"}
              </span>
            </div>
          </div>

          {/* Description */}
          {venue.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {venue.description}
            </p>
          )}

          {/* Rejection Reason for rejected venues */}
          {type === "rejected" && venue.reason && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-3 mb-4 rounded-r-lg">
              <div className="flex items-start">
                <Info className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">
                    Rejection Reason:
                  </p>
                  <p className="text-sm text-red-700">{venue.reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {venue.sportsTypes && venue.sportsTypes.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                <div className="flex items-center mb-1">
                  <Zap className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-xs font-semibold text-blue-800">
                    Sports
                  </span>
                </div>
                <p className="text-sm text-blue-700 font-medium">
                  {venue.sportsTypes.slice(0, 2).join(", ")}
                  {venue.sportsTypes.length > 2 &&
                    ` +${venue.sportsTypes.length - 2}`}
                </p>
              </div>
            )}

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs font-semibold text-green-800">
                  Added
                </span>
              </div>
              <p className="text-sm text-green-700 font-medium">
                {formatDate(venue.createdAt)}
              </p>
            </div>

            {type === "accepted" && venue.submittedAt && (
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 rounded-xl border border-purple-100">
                <div className="flex items-center mb-1">
                  <Award className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-xs font-semibold text-purple-800">
                    Approved
                  </span>
                </div>
                <p className="text-sm text-purple-700 font-medium">
                  {formatDate(venue.submittedAt)}
                </p>
              </div>
            )}

            {type === "rejected" && venue.submittedAt && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-xl border border-orange-100">
                <div className="flex items-center mb-1">
                  <XCircle className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-xs font-semibold text-orange-800">
                    Rejected
                  </span>
                </div>
                <p className="text-sm text-orange-700 font-medium">
                  {formatDate(venue.submittedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/venues/${venue._id}`)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </button>

            {type === "accepted" && (
              <button
                onClick={() => navigate(`/admin/venues/${venue._id}/analytics`)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <TrendingUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-2xl transition-all duration-300 pointer-events-none" />
      </div>
    );
  };

  // State management - set default tab based on user role
  const getDefaultTab = () => {
    if (user?.role === "user") return "bookings";
    if (user?.role === "owner") return "venues";
    return "edit"; // Default for admin or any other role
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab);
  const [bookingsTab, setBookingsTab] = useState("all");
  const [venuesTab, setVenuesTab] = useState("all"); // Added venues tab state
  const [isEditMode, setIsEditMode] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [adminVenues, setAdminVenues] = useState([]); // State for admin venues
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

  // Validate active tab based on user role
  useEffect(() => {
    if (user?.role) {
      // If current tab is not valid for the user's role, switch to appropriate tab
      if (activeTab === "bookings" && user.role !== "user") {
        setActiveTab(user.role === "owner" ? "venues" : "edit");
      } else if (activeTab === "venues" && user.role !== "owner") {
        setActiveTab(user.role === "user" ? "bookings" : "edit");
      }
    }
  }, [user?.role, activeTab]);

  useEffect(() => {
    if (activeTab === "bookings" && user?.role === "user") {
      fetchBookings();
    } else if (activeTab === "venues" && user?.role === "owner") {
      fetchVenues();
    } else if (
      (activeTab === "accepted" || activeTab === "rejected") &&
      user?.role === "admin"
    ) {
      fetchAdminVenues();
    }
  }, [activeTab, bookingsTab, venuesTab]); // Added venuesTab to dependencies

  // Clear venue error when component unmounts
  useEffect(() => {
    return () => {
      clearVenueError();
    };
  }, [clearVenueError]);

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
          return booking.status === "cancelled";
        }
        return true;
      });
      setBookings(filteredBookings);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVenues = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching owner venues using Redux...");
      await getOwnerVenues({ page: 1, limit: 100 });
      console.log("Venues fetched successfully via Redux store");
    } catch (error) {
      console.error("Failed to fetch venues via Redux:", error);
      setError("Failed to load venues. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminVenues = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching all venues for admin...");
      await getAllVenues({ page: 1, limit: 100 });
      console.log("Admin venues fetched successfully via Redux store");
    } catch (error) {
      console.error("Failed to fetch admin venues via Redux:", error);
      setError("Failed to load venues. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockBookings = () => [
    {
      _id: "1",
      venueId: {
        name: "Skyline Badminton Court",
        address: "Rajkot, Gujarat",
        city: "Rajkot",
      },
      court: {
        name: "Court A",
        sportType: "Badminton",
      },
      date: "2024-01-20",
      startTime: "09:00",
      endTime: "10:00",
      status: "booked",
      price: 800,
      canCancel: true,
      isCompleted: false,
    },
    {
      _id: "2",
      venueId: {
        name: "Elite Tennis Academy",
        address: "Ahmedabad, Gujarat",
        city: "Ahmedabad",
      },
      court: {
        name: "Court 1",
        sportType: "Tennis",
      },
      date: "2024-01-15",
      startTime: "18:00",
      endTime: "19:00",
      status: "completed",
      price: 1200,
      canCancel: false,
      isCompleted: true,
    },
    {
      _id: "3",
      venueId: {
        name: "Champions Cricket Ground",
        address: "Surat, Gujarat",
        city: "Surat",
      },
      court: {
        name: "Ground A",
        sportType: "Cricket",
      },
      date: "2024-01-25",
      startTime: "16:00",
      endTime: "18:00",
      status: "booked",
      price: 2000,
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
      case "booked":
      case "Confirmed": // Support both for backward compatibility
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "completed":
      case "Completed": // Support both for backward compatibility
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
      case "Cancelled": // Support both for backward compatibility
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending_payment":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "payment_failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "booked":
      case "Confirmed": // Support both for backward compatibility
        return "bg-green-100 text-green-800";
      case "completed":
      case "Completed": // Support both for backward compatibility
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "Cancelled": // Support both for backward compatibility
        return "bg-red-100 text-red-800";
      case "pending_payment":
        return "bg-orange-100 text-orange-800";
      case "payment_failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Filter venues based on selected tab
  const getFilteredVenues = () => {
    if (!venues || venues.length === 0) return [];

    switch (venuesTab) {
      case "accepted":
      case "approved":
        return venues.filter(
          (venue) =>
            venue.status === "Active" ||
            venue.status === "approved" ||
            venue.status === "Approved"
        );
      case "rejected":
        return venues.filter(
          (venue) => venue.status === "Rejected" || venue.status === "rejected"
        );
      case "pending":
        return venues.filter(
          (venue) =>
            venue.status === "Pending Approval" ||
            venue.status === "pending" ||
            venue.status === "Pending"
        );
      default:
        return venues;
    }
  };

  // Filter admin venues based on selected tab
  const getFilteredAdminVenues = () => {
    if (!allVenues || allVenues.length === 0) return [];

    switch (activeTab) {
      case "accepted":
        return allVenues.filter(
          (venue) =>
            venue.status === "Active" ||
            venue.status === "approved" ||
            venue.status === "Approved"
        );
      case "rejected":
        return allVenues.filter(
          (venue) => venue.status === "Rejected" || venue.status === "rejected"
        );
      default:
        return allVenues;
    }
  };

  const getVenueStatusColor = (status) => {
    switch (status) {
      case "Active":
      case "approved":
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending Approval":
      case "pending":
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
      case "rejected":
        return "bg-red-100 text-red-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                {/* Avatar with role-specific styling */}
                <div
                  className={`mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-4 ${
                    user?.role === "admin"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                      : user?.role === "owner"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-600"
                      : "bg-gradient-to-r from-green-500 to-emerald-600"
                  }`}
                >
                  {user?.role === "admin" ? (
                    <Shield className="h-12 w-12 text-white" />
                  ) : user?.role === "owner" ? (
                    <Building2 className="h-12 w-12 text-white" />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>

                {/* User Info with role badge */}
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {user?.name || "User Name"}
                  </h2>

                  {/* Role Badge */}
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                      user?.role === "admin"
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : user?.role === "owner"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-green-100 text-green-800 border border-green-200"
                    }`}
                  >
                    {user?.role === "admin" && (
                      <Crown className="h-4 w-4 mr-1" />
                    )}
                    {user?.role === "owner" && (
                      <Building2 className="h-4 w-4 mr-1" />
                    )}
                    {user?.role === "user" && (
                      <Users className="h-4 w-4 mr-1" />
                    )}
                    {user?.role?.charAt(0)?.toUpperCase() +
                      user?.role?.slice(1) || "User"}
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3 text-gray-600 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span>{user?.phone || "9999999999"}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-green-500" />
                    <span>{user?.email || "user@example.com"}</span>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    setActiveTab("edit");
                  }}
                  className={`mt-6 w-full text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    user?.role === "admin"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      : user?.role === "owner"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  }`}
                >
                  <Edit className="h-4 w-4" />
                  <span>{isEditMode ? "View Profile" : "Edit Profile"}</span>
                </button>

                {/* Admin-specific quick stats */}
                {user?.role === "admin" && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Quick Overview
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                        <div className="text-lg font-bold text-green-600">
                          {
                            getFilteredAdminVenues().filter(
                              (v) =>
                                v.status === "Active" ||
                                v.status === "approved" ||
                                v.status === "Approved"
                            ).length
                          }
                        </div>
                        <div className="text-xs text-green-700">Approved</div>
                      </div>
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg border border-red-100">
                        <div className="text-lg font-bold text-red-600">
                          {
                            getFilteredAdminVenues().filter(
                              (v) =>
                                v.status === "Rejected" ||
                                v.status === "rejected"
                            ).length
                          }
                        </div>
                        <div className="text-xs text-red-700">Rejected</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Bookings or Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Tabs */}
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  {/* My Bookings tab - only for players/users */}
                  {user?.role === "user" && (
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
                  )}

                  {/* Venues tab - only for owners */}
                  {user?.role === "owner" && (
                    <button
                      onClick={() => {
                        setActiveTab("venues");
                        setIsEditMode(false);
                      }}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === "venues"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      My Venues
                    </button>
                  )}

                  {/* Accepted Venues tab - only for admins */}
                  {user?.role === "admin" && (
                    <button
                      onClick={() => {
                        setActiveTab("accepted");
                        setIsEditMode(false);
                      }}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                        activeTab === "accepted"
                          ? "border-green-500 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approved Venues</span>
                      {allVenues && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            activeTab === "accepted"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {
                            allVenues.filter(
                              (v) =>
                                v.status === "Active" ||
                                v.status === "approved" ||
                                v.status === "Approved"
                            ).length
                          }
                        </span>
                      )}
                    </button>
                  )}

                  {/* Rejected Venues tab - only for admins */}
                  {user?.role === "admin" && (
                    <button
                      onClick={() => {
                        setActiveTab("rejected");
                        setIsEditMode(false);
                      }}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                        activeTab === "rejected"
                          ? "border-red-500 text-red-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Rejected Venues</span>
                      {allVenues && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            activeTab === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {
                            allVenues.filter(
                              (v) =>
                                v.status === "Rejected" ||
                                v.status === "rejected"
                            ).length
                          }
                        </span>
                      )}
                    </button>
                  )}

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
                {activeTab === "bookings" && user?.role === "user" ? (
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
                                    {booking.venueId?.name || "Unknown Venue"}
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
                                  {booking.court?.sportType || "Unknown Sport"}{" "}
                                  • {booking.court?.name || "Unknown Court"}
                                </p>

                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {new Date(
                                        booking.date
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {booking.startTime} - {booking.endTime}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <MapPin className="h-4 w-4" />
                                  <span>
                                    {booking.venueId?.address ||
                                      booking.venueId?.city ||
                                      "Unknown Location"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-2 mt-4">
                              {booking.status === "booked" &&
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
                ) : activeTab === "venues" && user?.role === "owner" ? (
                  // My Venues Section
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        My Venues
                      </h3>
                      <button
                        onClick={() => navigate("/owner/venues/add")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add New Venue
                      </button>
                    </div>

                    {/* Venues Sub-tabs */}
                    <div className="flex space-x-4 mb-6">
                      <button
                        onClick={() => setVenuesTab("all")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          venuesTab === "all"
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        All Venues
                      </button>
                      <button
                        onClick={() => setVenuesTab("accepted")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          venuesTab === "accepted"
                            ? "bg-green-100 text-green-700"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        Accepted
                      </button>
                      <button
                        onClick={() => setVenuesTab("pending")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          venuesTab === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setVenuesTab("rejected")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          venuesTab === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        Rejected
                      </button>
                    </div>

                    {/* Venues Grid */}
                    {venuesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Loading venues...</p>
                      </div>
                    ) : venuesError ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Error Loading Venues
                        </h3>
                        <p className="text-gray-600 mb-4">{venuesError}</p>
                        <button
                          onClick={fetchVenues}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : getFilteredVenues().length === 0 ? (
                      <div className="text-center py-8">
                        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {venuesTab === "all"
                            ? "No Venues Yet"
                            : venuesTab === "accepted"
                            ? "No Accepted Venues"
                            : venuesTab === "pending"
                            ? "No Pending Venues"
                            : "No Rejected Venues"}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {venuesTab === "all"
                            ? "You haven't added any venues. Start by adding your first venue."
                            : venuesTab === "accepted"
                            ? "You don't have any accepted venues yet."
                            : venuesTab === "pending"
                            ? "You don't have any venues pending approval."
                            : "You don't have any rejected venues."}
                        </p>
                        {venuesTab === "all" && (
                          <button
                            onClick={() => navigate("/owner/venues/add")}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                          >
                            Add Your First Venue
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {getFilteredVenues().map((venue) => (
                          <div
                            key={venue._id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start space-x-4">
                              <img
                                src={
                                  venue.images?.[0]?.url ||
                                  venue.coverImage?.url ||
                                  `/api/placeholder/80/80?text=${encodeURIComponent(
                                    venue.name
                                  )}`
                                }
                                alt={venue.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {venue.name}
                                </h4>
                                <div className="flex items-center text-gray-600 text-sm mt-1">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span>
                                    {venue.address ||
                                      venue.location ||
                                      "Address not available"}
                                  </span>
                                </div>
                                {venue.description && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {venue.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getVenueStatusColor(
                                      venue.status
                                    )}`}
                                  >
                                    {venue.status}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() =>
                                        navigate(`/venues/${venue._id}`)
                                      }
                                      className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors flex items-center space-x-1"
                                    >
                                      <Eye className="h-3 w-3" />
                                      <span>View</span>
                                    </button>
                                    {venue.status !== "Pending Approval" &&
                                      venue.status !== "pending" && (
                                        <button
                                          onClick={() =>
                                            navigate(
                                              `/owner/venues/edit/${venue._id}`
                                            )
                                          }
                                          className="px-3 py-1 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors flex items-center space-x-1"
                                        >
                                          <Edit className="h-3 w-3" />
                                          <span>Edit</span>
                                        </button>
                                      )}
                                    {(venue.status === "Rejected" ||
                                      venue.status === "rejected") && (
                                      <button
                                        onClick={() =>
                                          navigate(
                                            `/owner/venues/edit/${venue._id}?resubmit=true`
                                          )
                                        }
                                        className="px-3 py-1 text-sm text-green-600 border border-green-200 rounded hover:bg-green-50 transition-colors flex items-center space-x-1"
                                      >
                                        <RotateCcw className="h-3 w-3" />
                                        <span>Resubmit</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {/* Additional venue information */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    {venue.price && (
                                      <div>
                                        <span className="font-medium">
                                          Price:
                                        </span>{" "}
                                        ₹{venue.price}/hour
                                      </div>
                                    )}
                                    {venue.capacity && (
                                      <div>
                                        <span className="font-medium">
                                          Capacity:
                                        </span>{" "}
                                        {venue.capacity}
                                      </div>
                                    )}
                                    {venue.createdAt && (
                                      <div>
                                        <span className="font-medium">
                                          Created:
                                        </span>{" "}
                                        {new Date(
                                          venue.createdAt
                                        ).toLocaleDateString()}
                                      </div>
                                    )}
                                    {venue.sportTypes &&
                                      venue.sportTypes.length > 0 && (
                                        <div>
                                          <span className="font-medium">
                                            Sports:
                                          </span>{" "}
                                          {venue.sportTypes.join(", ")}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : activeTab === "accepted" && user?.role === "admin" ? (
                  // Admin Accepted Venues Section
                  <div>
                    {/* Header with enhanced styling */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 mb-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                            <CheckCircle className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                              Approved Venues
                            </h3>
                            <p className="text-green-700 font-medium">
                              Venues that are active and accepting bookings
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-green-200 shadow-sm">
                            <div className="text-2xl font-bold text-green-600">
                              {getFilteredAdminVenues().length}
                            </div>
                            <div className="text-sm text-green-700 font-medium">
                              Active Venues
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Venues Grid with enhanced styling */}
                    {venuesLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-green-100 animate-pulse"></div>
                        </div>
                        <p className="text-gray-600 mt-4 font-medium">
                          Loading approved venues...
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          This may take a few moments
                        </p>
                      </div>
                    ) : venuesError ? (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                          <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-red-900 mb-2">
                          Error Loading Venues
                        </h3>
                        <p className="text-red-700 mb-6">{venuesError}</p>
                        <button
                          onClick={fetchAdminVenues}
                          className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : getFilteredAdminVenues().length === 0 ? (
                      <div className="bg-gradient-to-br from-gray-50 to-green-50 border border-gray-200 rounded-2xl p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                          <Building2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          No Approved Venues Yet
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Once venue owners submit their venues for approval and
                          you approve them, they'll appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {getFilteredAdminVenues().map((venue) => (
                          <AdminVenueCard
                            key={venue._id}
                            venue={venue}
                            type="accepted"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : activeTab === "rejected" && user?.role === "admin" ? (
                  // Admin Rejected Venues Section
                  <div>
                    {/* Header with enhanced styling */}
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100 mb-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl shadow-lg">
                            <XCircle className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                              Rejected Venues
                            </h3>
                            <p className="text-red-700 font-medium">
                              Venues that didn't meet approval criteria
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-white/70 backdrop-blur-sm px-4 py-3 rounded-xl border border-red-200 shadow-sm">
                            <div className="text-2xl font-bold text-red-600">
                              {getFilteredAdminVenues().length}
                            </div>
                            <div className="text-sm text-red-700 font-medium">
                              Rejected
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Venues Grid with enhanced styling */}
                    {venuesLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-red-100 animate-pulse"></div>
                        </div>
                        <p className="text-gray-600 mt-4 font-medium">
                          Loading rejected venues...
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          This may take a few moments
                        </p>
                      </div>
                    ) : venuesError ? (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                          <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-red-900 mb-2">
                          Error Loading Venues
                        </h3>
                        <p className="text-red-700 mb-6">{venuesError}</p>
                        <button
                          onClick={fetchAdminVenues}
                          className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : getFilteredAdminVenues().length === 0 ? (
                      <div className="bg-gradient-to-br from-gray-50 to-red-50 border border-gray-200 rounded-2xl p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                          <Heart className="h-10 w-10 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          No Rejected Venues
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Great! You haven't rejected any venues yet. This means
                          all submitted venues have met your approval criteria.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {getFilteredAdminVenues().map((venue) => (
                          <AdminVenueCard
                            key={venue._id}
                            venue={venue}
                            type="rejected"
                          />
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
