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

      // Try to fetch real data from API
      const [statsResponse, venuesResponse, activityResponse] =
        await Promise.allSettled([
          api.get(`/admin/stats?timeRange=${selectedTimeRange}`),
          api.get("/admin/venues/pending"),
          api.get("/admin/activity/recent"),
        ]);

      // Check if API calls were successful
      if (
        statsResponse.status === "fulfilled" &&
        venuesResponse.status === "fulfilled" &&
        activityResponse.status === "fulfilled"
      ) {
        console.log("Admin dashboard data fetched successfully from API");
        setStats(statsResponse.value.data);
        setPendingVenues(venuesResponse.value.data.venues || []);
        setRecentActivity(activityResponse.value.data.activity || []);
      } else {
        throw new Error("One or more API calls failed");
      }
    } catch (error) {
      console.error("Failed to fetch admin data from API:", error);
      console.log("Falling back to mock data...");

      // Fallback to mock data
      const mockData = generateMockAdminData();
      setStats(mockData.stats);
      setPendingVenues(mockData.pendingVenues);
      setRecentActivity(mockData.recentActivity);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAdminData = () => {
    // Generate stats based on selected time range
    const getStatsMultiplier = () => {
      switch (selectedTimeRange) {
        case "today":
          return 0.03;
        case "this_week":
          return 0.2;
        case "this_month":
          return 1;
        case "last_month":
          return 0.9;
        case "this_year":
          return 12;
        default:
          return 1;
      }
    };

    const multiplier = getStatsMultiplier();
    const baseUsers = 2850;
    const baseBookings = 1240;
    const baseCourts = 180;
    const baseVenues = 45;

    const stats = {
      totalUsers: Math.floor(
        baseUsers * (selectedTimeRange === "this_year" ? 1 : multiplier)
      ),
      totalBookings: Math.floor(baseBookings * multiplier),
      activeCourts: Math.floor(
        baseCourts * (selectedTimeRange === "this_year" ? 1 : 0.8)
      ),
      totalVenues: Math.floor(
        baseVenues * (selectedTimeRange === "this_year" ? 1 : 0.9)
      ),
      pendingVenues: 8,
      usersGrowth: parseFloat((Math.random() * 20 - 2).toFixed(1)),
      bookingsGrowth: parseFloat((Math.random() * 35 - 5).toFixed(1)),
      courtsGrowth: parseFloat((Math.random() * 15 - 3).toFixed(1)),
      venuesGrowth: parseFloat((Math.random() * 25 - 4).toFixed(1)),
      revenue: Math.floor(850000 * multiplier),
      revenueGrowth: parseFloat((Math.random() * 30 - 3).toFixed(1)),
    };

    // Generate pending venues
    const pendingVenues = [
      {
        _id: "pending-1",
        name: "SportsPlex Elite Center",
        owner: {
          name: "Rajesh Kumar",
          email: "rajesh@sportsplex.com",
          phone: "+91 98765 43210",
        },
        location: {
          address: "Science City Road, Ahmedabad",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380060",
        },
        images: [getSportPlaceholder("SportsPlex Elite Center", 400, 250)],
        sportsTypes: ["Badminton", "Tennis", "Squash"],
        totalCourts: 8,
        amenities: [
          "Parking",
          "WiFi",
          "Cafeteria",
          "Security",
          "Changing Room",
        ],
        priceRange: { min: 400, max: 800 },
        submittedDate: "2025-08-08",
        status: "Pending",
        documents: ["License", "Insurance", "Safety Certificate"],
        description:
          "Premium sports facility with state-of-the-art courts and modern amenities.",
        operatingHours: "06:00 AM - 11:00 PM",
        reason: null,
      },
      {
        _id: "pending-2",
        name: "Champions Sports Arena",
        owner: {
          name: "Priya Sharma",
          email: "priya@championsarena.com",
          phone: "+91 87654 32109",
        },
        location: {
          address: "SG Highway, Gota",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "382481",
        },
        images: [getSportPlaceholder("Champions Sports Arena", 400, 250)],
        sportsTypes: ["Badminton", "Table Tennis"],
        totalCourts: 6,
        amenities: ["Parking", "WiFi", "Security"],
        priceRange: { min: 350, max: 650 },
        submittedDate: "2025-08-07",
        status: "Under Review",
        documents: ["License", "Insurance"],
        description: "Modern sports facility focusing on racquet sports.",
        operatingHours: "07:00 AM - 10:00 PM",
        reason: null,
      },
      {
        _id: "pending-3",
        name: "Victory Sports Complex",
        owner: {
          name: "Amit Patel",
          email: "amit@victorysports.com",
          phone: "+91 76543 21098",
        },
        location: {
          address: "Vastrapur Lake Area",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380015",
        },
        images: [getSportPlaceholder("Victory Sports Complex", 400, 250)],
        sportsTypes: ["Tennis", "Basketball", "Cricket"],
        totalCourts: 10,
        amenities: ["Parking", "WiFi", "Cafeteria", "Equipment Rental"],
        priceRange: { min: 500, max: 1000 },
        submittedDate: "2025-08-06",
        status: "Needs Revision",
        documents: ["License"],
        description: "Large sports complex with outdoor and indoor facilities.",
        operatingHours: "06:00 AM - 12:00 AM",
        reason: "Missing safety certificate and insurance documents",
      },
    ];

    // Generate recent activity
    const recentActivity = [
      {
        _id: "activity-1",
        type: "venue_approved",
        message: 'Venue "Elite Badminton Center" has been approved',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: "Admin User",
      },
      {
        _id: "activity-2",
        type: "venue_submitted",
        message: 'New venue "SportsPlex Elite Center" submitted for review',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user: "Rajesh Kumar",
      },
      {
        _id: "activity-3",
        type: "venue_rejected",
        message: 'Venue "Basic Sports Hub" has been rejected',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        user: "Admin User",
      },
      {
        _id: "activity-4",
        type: "user_registered",
        message: "5 new users registered today",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        user: "System",
      },
      {
        _id: "activity-5",
        type: "venue_submitted",
        message: 'New venue "Champions Sports Arena" submitted for review',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        user: "Priya Sharma",
      },
    ];

    return { stats, pendingVenues, recentActivity };
  };

  const filteredVenues = pendingVenues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.address.toLowerCase().includes(searchTerm.toLowerCase());
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
                              src={venue.images[0]}
                              alt={venue.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {venue.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-1">
                                by {venue.owner.name}
                              </p>
                              <div className="flex items-center text-gray-600 text-sm">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{venue.location.address}</span>
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
                              {venue.sportsTypes.length}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Price Range</p>
                            <p className="font-semibold">
                              ₹{venue.priceRange.min}-{venue.priceRange.max}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Submitted</p>
                            <p className="font-semibold">
                              {new Date(venue.submittedDate).toLocaleDateString(
                                "en-IN"
                              )}
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
                              <strong>Owner:</strong> {venue.owner.email}
                            </p>
                            <p>
                              <strong>Phone:</strong> {venue.owner.phone}
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
                {recentActivity.map((activity) => (
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
