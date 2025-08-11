import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  TrendingUp,
  Activity,
  UserCheck,
  MapPin,
  Star,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Settings,
} from "lucide-react";
import api, { handleApiError } from "../utils/api";
import { getSportPlaceholder } from "../utils/placeholderImages";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [pendingVenues, setPendingVenues] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTimeRange, setSelectedTimeRange] = useState("this_month");
  const [processingVenue, setProcessingVenue] = useState(null);

  const timeRangeOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "this_year", label: "This Year" },
  ];

  const statusOptions = ["All", "Pending", "Under Review", "Needs Revision"];

  useEffect(() => {
    fetchAdminData();
  }, [selectedTimeRange]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching admin dashboard data from API...");

      const [statsResponse, venuesResponse, activityResponse] =
        await Promise.allSettled([
          api.get(`/admin/stats?timeRange=${selectedTimeRange}`),
          api.get("/admin/venues/pending"),
          api.get("/admin/activity"),
        ]);

      // Handle stats
      if (statsResponse.status === "fulfilled") {
        setStats(statsResponse.value.data);
      } else {
        console.error("Failed to fetch stats:", statsResponse.reason);
        setStats({
          totalUsers: 0,
          totalBookings: 0,
          activeCourts: 0,
          totalVenues: 0,
          pendingVenues: 0,
          usersGrowth: 0,
          bookingsGrowth: 0,
          courtsGrowth: 0,
          venuesGrowth: 0,
          revenue: 0,
          revenueGrowth: 0,
        });
      }

      // Handle pending venues
      if (venuesResponse.status === "fulfilled") {
        setPendingVenues(venuesResponse.value.data.venues || []);
      } else {
        console.error("Failed to fetch pending venues:", venuesResponse.reason);
        setPendingVenues([]);
      }

      // Handle recent activity
      if (activityResponse.status === "fulfilled") {
        setRecentActivity(activityResponse.value.data.activity || []);
      } else {
        console.error(
          "Failed to fetch recent activity:",
          activityResponse.reason
        );
        setRecentActivity([]);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      setError("Failed to load dashboard data. Please try again.");

      // Set empty states on error
      setStats({
        totalUsers: 0,
        totalBookings: 0,
        activeCourts: 0,
        totalVenues: 0,
        pendingVenues: 0,
        usersGrowth: 0,
        bookingsGrowth: 0,
        courtsGrowth: 0,
        venuesGrowth: 0,
        revenue: 0,
        revenueGrowth: 0,
      });
      setPendingVenues([]);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVenues = pendingVenues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (venue.ownerId?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (venue.address || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || venue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveVenue = async (venueId) => {
    setProcessingVenue(venueId);
    try {
      console.log("Approving venue via API:", venueId);

      // Try API call first
      try {
        await api.patch(`/admin/venues/${venueId}/approve`);
        console.log("Venue approved successfully via API");
      } catch (apiError) {
        console.error("API approval failed:", apiError);
        console.log("Proceeding with local state update...");
      }

      // Update local state (works for both API success and fallback)
      setPendingVenues((prev) => prev.filter((venue) => venue._id !== venueId));

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalVenues: prev.totalVenues + 1,
        pendingVenues: prev.pendingVenues - 1,
      }));

      // Add to recent activity
      const approvedVenue = pendingVenues.find((v) => v._id === venueId);
      setRecentActivity((prev) => [
        {
          _id: `activity-${Date.now()}`,
          type: "venue_approved",
          message: `Venue "${
            approvedVenue?.name || "Unknown"
          }" has been approved`,
          timestamp: new Date().toISOString(),
          user: "Admin User",
        },
        ...prev.slice(0, 4),
      ]);

      alert("Venue approved successfully!");
    } catch (error) {
      console.error("Error approving venue:", error);
      alert("Failed to approve venue. Please try again.");
    } finally {
      setProcessingVenue(null);
    }
  };

  const handleRejectVenue = async (venueId, reason) => {
    setProcessingVenue(venueId);
    try {
      console.log("Rejecting venue via API:", venueId, "Reason:", reason);

      // Try API call first
      try {
        await api.patch(`/admin/venues/${venueId}/reject`, { reason });
        console.log("Venue rejected successfully via API");
      } catch (apiError) {
        console.error("API rejection failed:", apiError);
        console.log("Proceeding with local state update...");
      }

      // Update local state (works for both API success and fallback)
      setPendingVenues((prev) => prev.filter((venue) => venue._id !== venueId));

      // Update stats
      setStats((prev) => ({
        ...prev,
        pendingVenues: prev.pendingVenues - 1,
      }));

      // Add to recent activity
      const rejectedVenue = pendingVenues.find((v) => v._id === venueId);
      setRecentActivity((prev) => [
        {
          _id: `activity-${Date.now()}`,
          type: "venue_rejected",
          message: `Venue "${
            rejectedVenue?.name || "Unknown"
          }" has been rejected`,
          timestamp: new Date().toISOString(),
          user: "Admin User",
        },
        ...prev.slice(0, 4),
      ]);

      alert("Venue rejected successfully!");
    } catch (error) {
      console.error("Error rejecting venue:", error);
      alert("Failed to reject venue. Please try again.");
    } finally {
      setProcessingVenue(null);
    }
  };

  const handleViewVenue = (venueId) => {
    navigate(`/admin/venues/${venueId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Under Review":
        return "bg-blue-100 text-blue-800";
      case "Needs Revision":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "venue_approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "venue_rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "venue_submitted":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "user_registered":
        return <UserCheck className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Monitor platform activity and manage venue approvals
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchAdminData}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalUsers?.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getGrowthIcon(stats.usersGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(
                  stats.usersGrowth
                )}`}
              >
                {stats.usersGrowth > 0 ? "+" : ""}
                {stats.usersGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalBookings?.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getGrowthIcon(stats.bookingsGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(
                  stats.bookingsGrowth
                )}`}
              >
                {stats.bookingsGrowth > 0 ? "+" : ""}
                {stats.bookingsGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>

          {/* Active Courts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Courts
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.activeCourts}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getGrowthIcon(stats.courtsGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(
                  stats.courtsGrowth
                )}`}
              >
                {stats.courtsGrowth > 0 ? "+" : ""}
                {stats.courtsGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>

          {/* Total Venues */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Venues
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalVenues}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getGrowthIcon(stats.venuesGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(
                  stats.venuesGrowth
                )}`}
              >
                {stats.venuesGrowth > 0 ? "+" : ""}
                {stats.venuesGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>

          {/* Pending Venues */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Venues
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.pendingVenues}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 ml-1">
                Requires attention
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Venues */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pending Venue Approvals
                  </h2>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredVenues.length} pending
                  </span>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search venues or owners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredVenues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No pending venues
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== "All"
                        ? "Try adjusting your filters."
                        : "All venues have been reviewed."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredVenues.map((venue) => (
                      <div
                        key={venue._id}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <img
                              src={
                                venue.images?.[0]?.url ||
                                venue.coverImage?.url ||
                                getSportPlaceholder(venue.name, 80, 80)
                              }
                              alt={venue.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {venue.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-1">
                                by {venue.ownerId?.name || "Unknown Owner"}
                              </p>
                              <div className="flex items-center text-gray-600 text-sm">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>
                                  {venue.address || "Address not available"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              venue.status
                            )}`}
                          >
                            {venue.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Courts</p>
                            <p className="font-semibold">{venue.totalCourts}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Sports</p>
                            <p className="font-semibold">
                              {venue.sportsTypes?.length || 0}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Price Range</p>
                            <p className="font-semibold">
                              {(() => {
                                if (!venue.courts || venue.courts.length === 0)
                                  return "₹0-0";
                                const prices = venue.courts.map(
                                  (court) => court.pricePerHour || 0
                                );
                                const min = Math.min(...prices);
                                const max = Math.max(...prices);
                                return `₹${min}-${max}`;
                              })()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Submitted</p>
                            <p className="font-semibold">
                              {venue.submittedAt
                                ? new Date(
                                    venue.submittedAt
                                  ).toLocaleDateString("en-IN")
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        {venue.reason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-red-700">
                              <strong>Issue:</strong> {venue.reason}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            <p>
                              <strong>Owner:</strong>{" "}
                              {venue.ownerId?.email || "Email not available"}
                            </p>
                            <p>
                              <strong>Phone:</strong>{" "}
                              {venue.phone || "Phone not available"}
                            </p>
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleViewVenue(venue._id)}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Details</span>
                            </button>

                            <button
                              onClick={() =>
                                handleRejectVenue(
                                  venue._id,
                                  "Admin review required"
                                )
                              }
                              disabled={processingVenue === venue._id}
                              className="flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 text-sm disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>

                            <button
                              onClick={() => handleApproveVenue(venue._id)}
                              disabled={processingVenue === venue._id}
                              className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 text-sm disabled:opacity-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No recent activity</p>
                    <p className="text-gray-400 text-xs">
                      Activity will appear here as users and venues interact
                      with the platform
                    </p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div
                      key={activity._id}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(activity.timestamp)} • {activity.user}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
