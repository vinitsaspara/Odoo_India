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
  Crown,
  Sparkles,
  Heart,
  Share2,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Target,
  Award,
  ChevronRight,
  Globe,
  Clock3,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { useVenues } from "../hooks/useVenues";
import { getSportPlaceholder } from "../utils/placeholderImages";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Auth state from Redux
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

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
  const [showActionOptions, setShowActionOptions] = useState(null); // Track which venue shows action options

  const timeRangeOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
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
      token: token ? 'Present' : 'Missing',
      tokenFromStorage: localStorage.getItem('token') ? 'Present' : 'Missing'
    });

    // Only fetch if properly authenticated as admin
    if (!isAuthenticated) {
      console.log("AdminDashboard Debug - Not authenticated, redirecting to login");
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      console.log("AdminDashboard Debug - Not admin user, access denied");
      navigate('/');
      return;
    }

    // Ensure token is set in axios headers
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) {
      console.log("AdminDashboard Debug - No token found, redirecting to login");
      navigate('/login');
      return;
    }

    // Manually set token in axios if not already set
    if (!api.defaults.headers.common['Authorization']) {
      api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      console.log("AdminDashboard Debug - Token set in axios headers");
    }

    // Fetch all venues when component mounts
    const fetchData = async () => {
      try {
        console.log('AdminDashboard Debug - Fetching all venues for admin dashboard...');
        await getAllVenues({ page: 1, limit: 100 });
        console.log('AdminDashboard Debug - Venues fetched successfully');
      } catch (error) {
        console.error('AdminDashboard Debug - Error fetching venues:', error);
        // If authentication error, redirect to login
        if (error.message && error.message.includes('auth')) {
          navigate('/login');
        }
      }
    };
    
    fetchData();
  }, [isAuthenticated, isAdmin, token, getAllVenues, navigate]);

  // Debug effect to log venue data
  useEffect(() => {
    console.log('All venues from Redux store:', allVenues);
    console.log('Pending venues from Redux store:', pendingVenues);
    console.log('Loading state:', isLoading);
    console.log('Error state:', error);
  }, [allVenues, pendingVenues, isLoading, error]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearVenueError();
    };
  }, [clearVenueError]);

  // Calculate stats from venues
  const calculateStats = () => {
    console.log('Calculating stats with allVenues:', allVenues?.length || 0);
    
    const activeVenues = allVenues?.filter((v) => v.status === "Active" || v.status === "approved")?.length || 0;
    const pending = pendingVenues?.length || 0;
    const totalVenues = allVenues?.length || 0;
    const rejectedVenues = allVenues?.filter((v) => v.status === "Rejected" || v.status === "rejected")?.length || 0;

    console.log('Stats calculated:', {
      totalVenues,
      activeVenues,
      pending,
      rejectedVenues
    });

    return {
      totalUsers: 0, // Will be updated when user API is integrated
      totalBookings: 0, // Will be updated when booking API is integrated
      activeCourts: 0, // Will be updated when court API is integrated
      totalVenues: totalVenues,
      pendingVenues: pending,
      activeVenues: activeVenues,
      rejectedVenues: rejectedVenues,
      usersGrowth: 0,
      bookingsGrowth: 0,
      courtsGrowth: 0,
      venuesGrowth: 0,
      revenue: 0,
      revenueGrowth: 0,
    };
  };

  const stats = calculateStats();

  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    setSearchTerm("");
    setStatusFilter("All");
    
    try {
      await getAllVenues({ page: 1, limit: 100 });
      console.log('Manual refresh completed successfully');
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  const filteredVenues = (allVenues || []).filter((venue) => {
    if (!venue) return false;
    
    const matchesSearch =
      (venue.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (venue.ownerId?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (venue.location?.address || venue.address || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || 
      venue.status === statusFilter ||
      (statusFilter === "Pending Approval" && (venue.status === "Pending" || venue.status === "pending")) ||
      (statusFilter === "Active" && (venue.status === "Active" || venue.status === "approved")) ||
      (statusFilter === "Rejected" && (venue.status === "Rejected" || venue.status === "rejected"));
    
    return matchesSearch && matchesStatus;
  });

  console.log('Filtered venues:', filteredVenues?.length || 0, 'out of', allVenues?.length || 0);

  // Simplified: Only Accept and Reject actions - Accept function
  const handleActivateVenue = async (venueId) => {
    setProcessingVenue(venueId);
    setShowActionOptions(null);
    try {
      await approveVenueById(venueId);

      // Refresh the venues list to show updated data
      await getAllVenues({ page: 1, limit: 100 });

      // Add to recent activity
      const venue = allVenues.find((v) => v._id === venueId);
      setRecentActivity((prev) => [
        {
          _id: `activity-${Date.now()}`,
          type: "venue_approved",
          message: `Venue "${venue?.name || "Unknown"}" has been accepted`,
          timestamp: new Date().toISOString(),
          user: "Admin User",
        },
        ...prev.slice(0, 4),
      ]);
    } catch (error) {
      console.error("Error accepting venue:", error);
    } finally {
      setProcessingVenue(null);
    }
  };

  // Simplified: Only Accept and Reject actions - Reject function
  const handleDeactivateVenue = async (venueId) => {
    setProcessingVenue(venueId);
    setShowActionOptions(null);
    try {
      await rejectVenueById(venueId, "Admin review - venue rejected");

      // Refresh the venues list to show updated data
      await getAllVenues({ page: 1, limit: 100 });

      // Add to recent activity
      const venue = allVenues.find((v) => v._id === venueId);
      setRecentActivity((prev) => [
        {
          _id: `activity-${Date.now()}`,
          type: "venue_rejected",
          message: `Venue "${venue?.name || "Unknown"}" has been rejected`,
          timestamp: new Date().toISOString(),
          user: "Admin User",
        },
        ...prev.slice(0, 4),
      ]);
    } catch (error) {
      console.error("Error rejecting venue:", error);
    } finally {
      setProcessingVenue(null);
    }
  };

  // Removed complex status management functions - simplified to Accept/Reject only

  const handleCancelAction = () => {
    setShowActionOptions(null);
  };

  const handleApproveVenue = async (venueId) => {
    setProcessingVenue(venueId);
    try {
      await approveVenueById(venueId);

      // Refresh the venues list to show updated data
      await getAllVenues({ page: 1, limit: 100 });

      // Add to recent activity
      const venue = allVenues.find((v) => v._id === venueId);
      setRecentActivity((prev) => [
        {
          _id: `activity-${Date.now()}`,
          type: "venue_approved",
          message: `Venue "${venue?.name || "Unknown"}" has been approved`,
          timestamp: new Date().toISOString(),
          user: "Admin User",
        },
        ...prev.slice(0, 4),
      ]);
    } catch (error) {
      console.error("Error approving venue:", error);
    } finally {
      setProcessingVenue(null);
    }
  };

  const handleRejectVenue = async (venueId, reason) => {
    setProcessingVenue(venueId);
    try {
      await rejectVenueById(venueId, reason);

      // Refresh the venues list to show updated data
      await getAllVenues({ page: 1, limit: 100 });

      // Add to recent activity
      const venue = allVenues.find((v) => v._id === venueId);
      setRecentActivity((prev) => [
        {
          _id: `activity-${Date.now()}`,
          type: "venue_rejected",
          message: `Venue "${venue?.name || "Unknown"}" has been rejected`,
          timestamp: new Date().toISOString(),
          user: "Admin User",
        },
        ...prev.slice(0, 4),
      ]);
    } catch (error) {
      console.error("Error rejecting venue:", error);
    } finally {
      setProcessingVenue(null);
    }
  };

  const handleViewVenue = (venueId) => {
    navigate(`/venues/${venueId}`);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-4 border-gradient-to-r from-blue-500 to-purple-600 border-t-transparent mx-auto mb-6"
          ></motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-lg font-medium"
          >
            Loading admin dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You need admin privileges to access this dashboard.
          </p>
          <button
            onClick={() => navigate('/login')}
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
                    Unable to load venue data. Please check your connection and try again.
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
        {process.env.NODE_ENV === 'development' && (
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
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">DEV MODE</span>
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isLoading 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isLoading ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Error:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        error 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {error ? 'Yes' : 'None'}
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
                        {searchTerm || 'None'}
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          venue.status === 'Active' || venue.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : venue.status === 'Pending Approval' || venue.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
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
                    {stats.totalUsers?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                {getGrowthIcon(stats.usersGrowth)}
                <span className={`text-sm font-bold ml-2 ${getGrowthColor(stats.usersGrowth)}`}>
                  {stats.usersGrowth > 0 ? "+" : ""}{stats.usersGrowth}%
                </span>
                <span className="text-sm text-slate-500 ml-2">vs last period</span>
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
                    {stats.totalBookings?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                {getGrowthIcon(stats.bookingsGrowth)}
                <span className={`text-sm font-bold ml-2 ${getGrowthColor(stats.bookingsGrowth)}`}>
                  {stats.bookingsGrowth > 0 ? "+" : ""}{stats.bookingsGrowth}%
                </span>
                <span className="text-sm text-slate-500 ml-2">vs last period</span>
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
                    {allVenues?.length || '0'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                {getGrowthIcon(stats.venuesGrowth)}
                <span className={`text-sm font-bold ml-2 ${getGrowthColor(stats.venuesGrowth)}`}>
                  {stats.venuesGrowth > 0 ? "+" : ""}{stats.venuesGrowth}%
                </span>
                <span className="text-sm text-slate-500 ml-2">vs last period</span>
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
                    ₹{stats.totalRevenue?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                {getGrowthIcon(stats.revenueGrowth)}
                <span className={`text-sm font-bold ml-2 ${getGrowthColor(stats.revenueGrowth)}`}>
                  {stats.revenueGrowth > 0 ? "+" : ""}{stats.revenueGrowth}%
                </span>
                <span className="text-sm text-slate-500 ml-2">vs last period</span>
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
                    {pendingVenues?.length || '0'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${pendingVenues?.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className={`text-sm font-bold ${pendingVenues?.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {pendingVenues?.length > 0 ? 'Action Required' : 'All Clear'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
          {/* Total Users */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {stats.totalUsers?.toLocaleString()}
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
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Total Bookings
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {stats.totalBookings?.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
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

          {/* Active Courts */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Active Courts
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {stats.activeCourts}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                {getGrowthIcon(stats.courtsGrowth)}
                <span
                  className={`text-sm font-bold ml-2 ${getGrowthColor(
                    stats.courtsGrowth
                  )}`}
                >
                  {stats.courtsGrowth > 0 ? "+" : ""}
                  {stats.courtsGrowth}%
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
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Total Venues
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {stats.totalVenues}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
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

          {/* Pending Venues */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Pending Venues
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {stats.pendingVenues}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-500 ml-2 font-medium">
                  Requires attention
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Owner Request Cards - Beautiful Layout */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
                <div className="p-8 border-b border-gray-100/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                          All Venues
                        </h2>
                        <p className="text-slate-600 font-medium">
                          Venue requests from all owners
                        </p>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg"
                    >
                      {filteredVenues.length} venues
                    </motion.div>
                  </div>

                  {/* Enhanced Filters */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Search venues, owners, or locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all duration-200 text-slate-700 placeholder-slate-400"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-12 pr-10 py-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 appearance-none min-w-[200px] text-slate-700"
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

                <div className="p-8">
                  <AnimatePresence mode="wait">
                    {filteredVenues.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-16"
                      >
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                          <CheckCircle className="h-12 w-12 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">
                          {isLoading ? "Loading venues..." : "No venues found"}
                        </h3>
                        <p className="text-slate-600 max-w-md mx-auto">
                          {isLoading 
                            ? "Please wait while we fetch venue data..."
                            : (searchTerm || statusFilter !== "All"
                            ? "Try adjusting your filters to see more results."
                            : error 
                              ? "There was an error loading venues. Please try refreshing the page."
                              : "No venue requests have been submitted yet.")
                          }
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div layout className="space-y-6">
                        {filteredVenues.map((venue, index) => (
                          <motion.div
                            key={venue._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4 }}
                            className="group relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 group-hover:shadow-xl transition-all duration-300">
                              {/* Header with Image and Basic Info */}
                              <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start space-x-4">
                                  <div className="relative">
                                    <img
                                      src={
                                        venue.images?.[0]?.url ||
                                        venue.coverImage?.url ||
                                        getSportPlaceholder(venue.name, 80, 80)
                                      }
                                      alt={venue.name}
                                      className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white/50"
                                    />
                                    {venue.status === "Pending Approval" && (
                                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <Clock className="h-3 w-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h3 className="text-xl font-bold text-slate-800">
                                        {venue.name}
                                      </h3>
                                      {venue.featured && (
                                        <Sparkles className="h-5 w-5 text-yellow-500" />
                                      )}
                                    </div>
                                    <div className="flex items-center text-slate-600 text-sm mb-2">
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      <span className="font-medium">
                                        by{" "}
                                        {venue.ownerId?.name || "Unknown Owner"}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-slate-600 text-sm">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      <span className="truncate max-w-xs">
                                        {venue.address ||
                                          "Address not available"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide ${getStatusColor(
                                    venue.status
                                  )}`}
                                >
                                  {venue.status}
                                </motion.div>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-4 bg-white/70 rounded-xl">
                                  <div className="flex items-center justify-center mb-2">
                                    <Target className="h-5 w-5 text-blue-500" />
                                  </div>
                                  <p className="text-sm text-slate-600 font-medium">
                                    Courts
                                  </p>
                                  <p className="text-lg font-bold text-slate-800">
                                    {venue.totalCourts}
                                  </p>
                                </div>
                                <div className="text-center p-4 bg-white/70 rounded-xl">
                                  <div className="flex items-center justify-center mb-2">
                                    <Activity className="h-5 w-5 text-green-500" />
                                  </div>
                                  <p className="text-sm text-slate-600 font-medium">
                                    Sports
                                  </p>
                                  <p className="text-lg font-bold text-slate-800">
                                    {venue.sportsTypes?.length || 0}
                                  </p>
                                </div>
                                <div className="text-center p-4 bg-white/70 rounded-xl">
                                  <div className="flex items-center justify-center mb-2">
                                    <DollarSign className="h-5 w-5 text-purple-500" />
                                  </div>
                                  <p className="text-sm text-slate-600 font-medium">
                                    Price Range
                                  </p>
                                  <p className="text-lg font-bold text-slate-800">
                                    {(() => {
                                      if (
                                        !venue.courts ||
                                        venue.courts.length === 0
                                      )
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
                                <div className="text-center p-4 bg-white/70 rounded-xl">
                                  <div className="flex items-center justify-center mb-2">
                                    <CalendarIcon className="h-5 w-5 text-orange-500" />
                                  </div>
                                  <p className="text-sm text-slate-600 font-medium">
                                    Submitted
                                  </p>
                                  <p className="text-lg font-bold text-slate-800">
                                    {venue.submittedAt
                                      ? new Date(
                                          venue.submittedAt
                                        ).toLocaleDateString("en-IN", {
                                          month: "short",
                                          day: "numeric",
                                        })
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>

                              {/* Issue Alert */}
                              {venue.reason && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl p-4 mb-6"
                                >
                                  <div className="flex items-start space-x-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-bold text-red-800 mb-1">
                                        Issue Reported
                                      </p>
                                      <p className="text-sm text-red-700">
                                        {venue.reason}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {/* Footer with Owner Info and Actions */}
                              <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
                                <div className="flex items-center space-x-6">
                                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                                    <Mail className="h-4 w-4" />
                                    <span className="font-medium">
                                      {venue.ownerId?.email ||
                                        "Email not available"}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                                    <Phone className="h-4 w-4" />
                                    <span className="font-medium">
                                      {venue.phone || "Phone not available"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleViewVenue(venue._id)}
                                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors duration-200"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span>View Details</span>
                                  </motion.button>

                                  {/* Action Buttons */}
                                  {venue.status === "Pending Approval" && (
                                    <div className="flex items-center space-x-2">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                          handleRejectVenue(
                                            venue._id,
                                            "Admin review required"
                                          )
                                        }
                                        disabled={processingVenue === venue._id}
                                        className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 disabled:opacity-50 font-medium text-sm shadow-lg transition-all duration-200"
                                      >
                                        <XCircle className="h-4 w-4" />
                                        <span>Reject</span>
                                      </motion.button>

                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                          handleApproveVenue(venue._id)
                                        }
                                        disabled={processingVenue === venue._id}
                                        className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 font-medium text-sm shadow-lg transition-all duration-200"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Approve</span>
                                      </motion.button>
                                    </div>
                                  )}

                                  {venue.status === "pending" && (
                                    <div className="flex items-center space-x-2">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                          handleDeactivateVenue(venue._id)
                                        }
                                        disabled={processingVenue === venue._id}
                                        className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 disabled:opacity-50 font-medium text-sm shadow-lg"
                                      >
                                        <XCircle className="h-4 w-4" />
                                        <span>Reject</span>
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                          handleActivateVenue(venue._id)
                                        }
                                        disabled={processingVenue === venue._id}
                                        className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 font-medium text-sm shadow-lg"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Accept</span>
                                      </motion.button>
                                    </div>
                                  )}

                                  {(venue.status === "approved" ||
                                    venue.status === "Inactive") && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() =>
                                        venue.status === "approved"
                                          ? handleDeactivateVenue(venue._id)
                                          : handleActivateVenue(venue._id)
                                      }
                                      disabled={processingVenue === venue._id}
                                      className={`flex items-center space-x-2 ${
                                        venue.status === "approved"
                                          ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                                          : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                      } text-white px-4 py-2 rounded-xl disabled:opacity-50 font-medium text-sm shadow-lg transition-all duration-200`}
                                    >
                                      {venue.status === "approved" ? (
                                        <XCircle className="h-4 w-4" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4" />
                                      )}
                                      <span>
                                        {venue.status === "approved"
                                          ? "Reject"
                                          : "Activate"}
                                      </span>
                                    </motion.button>
                                  )}

                                  {(venue.status === "rejected" ||
                                    venue.status === "Rejected" ||
                                    venue.status === "Under Maintenance") && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() =>
                                        venue.status === "rejected"
                                          ? handleActivateVenue(venue._id)
                                          : handleApproveVenue(venue._id)
                                      }
                                      disabled={processingVenue === venue._id}
                                      className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 font-medium text-sm shadow-lg transition-all duration-200"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      <span>
                                        {venue.status === "rejected"
                                          ? "Accept"
                                          : "Approve"}
                                      </span>
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Recent Activity */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
                <div className="p-8 border-b border-gray-100/50">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        Recent Activity
                      </h2>
                      <p className="text-slate-600 font-medium">
                        Platform updates
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <AnimatePresence mode="wait">
                    {recentActivity.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-12"
                      >
                        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                          <Activity className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-3">
                          No recent activity
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                          Activity will appear here as users and venues interact
                          with the platform
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div layout className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <motion.div
                            key={activity._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex-shrink-0 mt-1 p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 mb-1">
                                {activity.message}
                              </p>
                              <div className="flex items-center space-x-3 text-xs text-slate-500">
                                <span className="flex items-center">
                                  <Clock3 className="h-3 w-3 mr-1" />
                                  {formatTimeAgo(activity.timestamp)}
                                </span>
                                <span className="flex items-center">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  {activity.user}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
