import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api.js";
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
  X,
  Sparkles,
  Heart,
  Share2,
  Phone,
  Mail,
} from "lucide-react";
import { useVenues } from "../hooks/useVenues.js";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Auth state from Redux
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const {
    allVenues,
    pendingVenues,
    isLoading,
    error,
    pagination,
    getAllVenues,
    updateStatus,
    approveVenueById,
    rejectVenueById,
    clearVenueError,
  } = useVenues();

  // Local state for UI interactions
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTimeRange, setSelectedTimeRange] = useState("this_month");
  const [processingVenue, setProcessingVenue] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showActionOptions, setShowActionOptions] = useState(null);

  const timeRangeOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "this_quarter", label: "This Quarter" },
    { value: "this_year", label: "This Year" },
  ];

  const statusOptions = [
    "All",
    "Pending Approval",
    "Active",
    "Rejected",
    "Under Maintenance",
  ];

  useEffect(() => {
    // Check authentication and admin role before fetching
    console.log("AdminDashboard Debug - Auth State:", {
      user: user?.email,
      role: user?.role,
      isAuthenticated,
      isAdmin,
      token: token ? "Present" : "Missing",
      tokenFromStorage: localStorage.getItem("token") ? "Present" : "Missing",
    });

    // Only fetch if properly authenticated as admin
    if (!isAuthenticated) {
      console.log(
        "AdminDashboard Debug - Not authenticated, redirecting to login"
      );
      navigate("/login");
      return;
    }

    if (!isAdmin) {
      console.log("AdminDashboard Debug - Not admin user, access denied");
      navigate("/");
      return;
    }

    // Ensure token is set in axios headers
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      console.log(
        "AdminDashboard Debug - No token found, redirecting to login"
      );
      navigate("/login");
      return;
    }

    // Manually set token in axios if not already set
    if (!api.defaults.headers.common["Authorization"]) {
      api.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
      console.log("AdminDashboard Debug - Token set in axios headers");
    }

    // Fetch all venues when component mounts
    const fetchData = async () => {
      try {
        console.log(
          "AdminDashboard Debug - Fetching all venues for admin dashboard..."
        );
        await getAllVenues({ page: 1, limit: 100 });
        console.log("AdminDashboard Debug - Venues fetched successfully");
      } catch (error) {
        console.error("AdminDashboard Debug - Error fetching venues:", error);
        // If authentication error, redirect to login
        if (error.message && error.message.includes("auth")) {
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin, token, getAllVenues, navigate]);

  // Debug effect to log venue data
  useEffect(() => {
    console.log("All venues from Redux store:", allVenues);
    console.log("Pending venues from Redux store:", pendingVenues);
    console.log("Loading state:", isLoading);
    console.log("Error state:", error);
  }, [allVenues, pendingVenues, isLoading, error]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearVenueError();
    };
  }, [clearVenueError]);

  // Calculate stats from venues
  const calculateStats = () => {
    console.log("Calculating stats with allVenues:", allVenues?.length || 0);

    const activeVenues =
      allVenues?.filter((v) => v.status === "Active" || v.status === "approved")
        ?.length || 0;
    const pending = pendingVenues?.length || 0;
    const totalVenues = allVenues?.length || 0;
    const rejectedVenues =
      allVenues?.filter(
        (v) => v.status === "Rejected" || v.status === "rejected"
      )?.length || 0;

    return {
      totalUsers: 1250,
      totalBookings: 856,
      totalVenues,
      totalRevenue: 89500,
      activeVenues,
      pendingVenues: pending,
      rejectedVenues,
      usersGrowth: 12.5,
      bookingsGrowth: 8.3,
      venuesGrowth: 15.2,
      revenueGrowth: 22.1,
    };
  };

  const stats = calculateStats();

  // Helper functions for growth indicators
  const getGrowthIcon = (growth) => {
    if (growth > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (growth < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) {
      return "text-green-600";
    } else if (growth < 0) {
      return "text-red-600";
    }
    return "text-gray-600";
  };

  // Filter venues based on search and status
  const filteredVenues =
    allVenues?.filter((venue) => {
      const matchesSearch =
        venue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || venue.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await getAllVenues({ page: 1, limit: 100 });
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Handle approve venue
  const handleApprove = async (venueId) => {
    setProcessingVenue(venueId);
    try {
      await approveVenueById(venueId);
    } catch (error) {
      console.error("Error approving venue:", error);
    } finally {
      setProcessingVenue(null);
      setShowActionOptions(null);
    }
  };

  // Handle reject venue
  const handleReject = async (venueId) => {
    setProcessingVenue(venueId);
    try {
      await rejectVenueById({ venueId, reason: "Does not meet requirements" });
    } catch (error) {
      console.error("Error rejecting venue:", error);
    } finally {
      setProcessingVenue(null);
      setShowActionOptions(null);
    }
  };

  // Show loading if checking authentication
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You need admin privileges to access this dashboard.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Login as Admin
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative backdrop-blur-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-4"
              >
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-blue-100 mt-1 font-medium">
                    Monitor platform activity and manage venue approvals
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/30 focus:border-transparent"
                >
                  {timeRangeOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="text-gray-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 disabled:opacity-50 transition-all duration-200"
                >
                  <RefreshCw
                    className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span className="font-medium">
                    {isLoading ? "Refreshing..." : "Refresh"}
                  </span>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-6 mb-8 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-red-700 font-medium">{error}</p>
                  <p className="text-red-600 text-sm mt-1">
                    Unable to load venue data. Please check your connection and
                    try again.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-200 transition-colors duration-200 font-medium"
              >
                Try Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debug Information - Remove in production */}
        {process.env.NODE_ENV === "development" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200/50 rounded-3xl p-8 mb-8 shadow-lg backdrop-blur-sm"
          >
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-2xl rotate-12"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-xl -rotate-12"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Debug Information
                </h3>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                  DEV MODE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Venue Statistics */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm"
                >
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    Venue Counts
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">All Venues:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {allVenues?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending:</span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        {pendingVenues?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Filtered:</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {filteredVenues?.length || 0}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* System Status */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm"
                >
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    System Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Loading:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isLoading
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isLoading ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Error:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          error
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {error ? "Yes" : "None"}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Filter Status */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm"
                >
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-purple-500" />
                    Active Filters
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Search:</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium max-w-20 truncate">
                        {searchTerm || "None"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {statusFilter}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Sample Venues Section */}
              {allVenues?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm"
                >
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    Sample Venue Data
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {allVenues.slice(0, 3).map((venue, index) => (
                      <motion.div
                        key={venue._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {venue.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            ID: {venue._id.slice(-6)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            venue.status === "Active" ||
                            venue.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : venue.status === "Pending Approval" ||
                                venue.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {venue.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Beautiful Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
        >
          {/* Total Users */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {stats.totalUsers?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                {getGrowthIcon(stats.usersGrowth)}
                <span
                  className={`text-sm font-bold ml-2 ${getGrowthColor(
                    stats.usersGrowth
                  )}`}
                >
                  {stats.usersGrowth > 0 ? "+" : ""}
                  {stats.usersGrowth}%
                </span>
                <span className="text-sm text-slate-500 ml-2">
                  vs last period
                </span>
              </div>
            </div>
          </motion.div>

          {/* Total Bookings */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Total Bookings
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {stats.totalBookings?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                {getGrowthIcon(stats.bookingsGrowth)}
                <span
                  className={`text-sm font-bold ml-2 ${getGrowthColor(
                    stats.bookingsGrowth
                  )}`}
                >
                  {stats.bookingsGrowth > 0 ? "+" : ""}
                  {stats.bookingsGrowth}%
                </span>
                <span className="text-sm text-slate-500 ml-2">
                  vs last period
                </span>
              </div>
            </div>
          </motion.div>

          {/* Total Venues */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Total Venues
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {allVenues?.length || "0"}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                {getGrowthIcon(stats.venuesGrowth)}
                <span
                  className={`text-sm font-bold ml-2 ${getGrowthColor(
                    stats.venuesGrowth
                  )}`}
                >
                  {stats.venuesGrowth > 0 ? "+" : ""}
                  {stats.venuesGrowth}%
                </span>
                <span className="text-sm text-slate-500 ml-2">
                  vs last period
                </span>
              </div>
            </div>
          </motion.div>

          {/* Revenue */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Revenue
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    ₹{stats.totalRevenue?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                {getGrowthIcon(stats.revenueGrowth)}
                <span
                  className={`text-sm font-bold ml-2 ${getGrowthColor(
                    stats.revenueGrowth
                  )}`}
                >
                  {stats.revenueGrowth > 0 ? "+" : ""}
                  {stats.revenueGrowth}%
                </span>
                <span className="text-sm text-slate-500 ml-2">
                  vs last period
                </span>
              </div>
            </div>
          </motion.div>

          {/* Pending Approvals */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-red-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Pending Approvals
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {pendingVenues?.length || "0"}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    pendingVenues?.length > 0
                      ? "bg-red-500 animate-pulse"
                      : "bg-green-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-bold ${
                    pendingVenues?.length > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {pendingVenues?.length > 0 ? "Action Required" : "All Clear"}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Simple Venue List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20"
        >
          <div className="p-8 border-b border-gray-100/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    All Venues
                  </h2>
                  <p className="text-slate-600 font-medium">
                    Venue requests from all owners ({allVenues?.length || 0}{" "}
                    total)
                  </p>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search venues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Venues List */}
          <div className="p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600">Loading venues...</span>
              </div>
            ) : filteredVenues?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map((venue) => (
                  <motion.div
                    key={venue._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {venue.name}
                          </h3>
                          <p className="text-gray-600 text-sm flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {venue.location || "Location not specified"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            venue.status === "Active" ||
                            venue.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : venue.status === "Pending Approval" ||
                                venue.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {venue.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Owner:</strong> {venue.ownerName || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Sports:</strong>{" "}
                          {venue.sports?.join(", ") || "Not specified"}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      {(venue.status === "Pending Approval" ||
                        venue.status === "pending") && (
                        <div className="flex space-x-2 pt-4 border-t border-gray-100">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApprove(venue._id)}
                            disabled={processingVenue === venue._id}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
                          >
                            {processingVenue === venue._id ? (
                              <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 inline mr-1" />
                                Approve
                              </>
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReject(venue._id)}
                            disabled={processingVenue === venue._id}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
                          >
                            {processingVenue === venue._id ? (
                              <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 inline mr-1" />
                                Reject
                              </>
                            )}
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No venues found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "All"
                    ? "Try adjusting your search or filter criteria."
                    : "No venue requests have been submitted yet."}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
