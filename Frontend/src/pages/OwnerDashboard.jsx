import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Building2,
  Clock,
  Star,
  Filter,
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Wrench,
  IndianRupee,
  Trophy,
  Sparkles,
  Crown,
  Settings,
} from "lucide-react";
import { useVenues } from "../hooks/useVenues";
import VenueStatsCard from "../components/VenueStatsCard";

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const {
    venues,
    isLoading,
    error,
    pagination,
    getOwnerVenues,
    clearVenueError,
  } = useVenues();

  // Local state for UI interactions
  const [selectedTimeRange, setSelectedTimeRange] = useState("this_month");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [recentBookings, setRecentBookings] = useState([]); // Added back for bookings display
  const [earningsData, setEarningsData] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  const timeRangeOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "this_year", label: "This Year" },
  ];

  const statusOptions = [
    "All",
    "Active",
    "Inactive",
    "Under Maintenance",
    "Pending Approval",
    "Rejected",
  ];

  useEffect(() => {
    // Fetch venues when component mounts
    getOwnerVenues({ page: 1, limit: 100 });
    fetchEarningsData();
  }, [getOwnerVenues]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearVenueError();
    };
  }, [clearVenueError]);

  const fetchEarningsData = async () => {
    try {
      setEarningsLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/owner/earnings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEarningsData(data.data);

        // Also fetch venue stats for each venue to get real-time data
        if (data.data.venueEarnings) {
          data.data.venueEarnings.forEach(async (venueEarning) => {
            if (venueEarning.venueId?._id) {
              await fetchVenueRealTimeStats(venueEarning.venueId._id);
            }
          });
        }
      }
    } catch (err) {
      console.error("Error fetching earnings:", err);
    } finally {
      setEarningsLoading(false);
    }
  };

  const fetchVenueRealTimeStats = async (venueId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/payments/venue-stats/${venueId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Real-time venue stats:", data.data);
        // You can store this in state if needed for individual venue updates
      }
    } catch (err) {
      console.error("Error fetching venue stats:", err);
    }
  };

  const fetchVenueDetails = async (venueId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/owner/earnings/venue/${venueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedVenue(data.data);
      }
    } catch (err) {
      console.error("Error fetching venue details:", err);
    }
  };

  // Calculate KPIs from venues and earnings
  const calculateKpis = () => {
    const activeVenues = venues.filter((v) => v.status === "Active").length;
    const pendingVenues = venues.filter(
      (v) => v.status === "Pending Approval"
    ).length;
    const rejectedVenues = venues.filter((v) => v.status === "Rejected").length;

    // Use real earnings data if available
    const totalEarnings = earningsData?.summary?.totalEarnings || 0;
    const pendingEarnings = earningsData?.summary?.pendingEarnings || 0;
    const totalBookings = earningsData?.summary?.totalBookings || 0;

    return {
      totalVenues: venues.length,
      activeVenues: activeVenues,
      pendingVenues: pendingVenues,
      rejectedVenues: rejectedVenues,
      totalBookings: totalBookings,
      totalEarnings: totalEarnings,
      pendingEarnings: pendingEarnings,
      occupancyRate: 0,
      totalRevenue: totalEarnings, // Revenue same as earnings for now
      bookingsGrowth: 0,
      earningsGrowth: 0,
      occupancyGrowth: 0,
      revenueGrowth: 0,
    };
  };

  const kpis = calculateKpis();

  const handleRefresh = () => {
    getOwnerVenues({ page: 1, limit: 100 });
    fetchEarningsData();
  };

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (venue.address || venue.location?.address || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (venue.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (venue.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || venue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddVenue = () => {
    navigate("/owner/venues/add");
  };

  const handleEditVenue = (venueId) => {
    navigate(`/owner/venues/edit/${venueId}`);
  };

  const handleViewVenue = (venueId) => {
    navigate(`/venues/${venueId}`);
  };

  const handleResubmitVenue = (venueId) => {
    // Navigate to edit page with resubmit flag
    navigate(`/owner/venues/edit/${venueId}?resubmit=true`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-40 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -120, 0],
              y: [0, 120, 0],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-white/30">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl mb-6 shadow-lg"
            >
              <Crown className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4"
            >
              Loading Your Empire
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-gray-600"
            >
              Preparing your dashboard...
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -120, 0],
            y: [0, 120, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header Section */}
      <section className="pt-20 pb-8 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 inline-block">
              {/* Profile Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl mb-6 shadow-lg"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent leading-tight"
              >
                Owner Dashboard
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto"
              >
                Manage your venue empire and track your success metrics
              </motion.p>

              {/* Header Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <div className="relative">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="pl-4 pr-10 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-gray-700 shadow-lg appearance-none"
                  >
                    {timeRangeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg inline-flex items-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-2xl shadow-lg"
          >
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <p className="font-medium">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {kpis.totalBookings}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getGrowthIcon(kpis.bookingsGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(
                  kpis.bookingsGrowth
                )}`}
              >
                {kpis.bookingsGrowth > 0 ? "+" : ""}
                {kpis.bookingsGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>

          {/* Total Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30 group relative"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Total Earnings
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatCurrency(kpis.totalEarnings)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getGrowthIcon(kpis.earningsGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(
                  kpis.earningsGrowth
                )}`}
              >
                {kpis.earningsGrowth > 0 ? "+" : ""}
                {kpis.earningsGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>

          {/* Pending Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30 group relative"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Pending Earnings
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {formatCurrency(kpis.pendingEarnings)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-gray-500">Awaiting payout</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>

          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/30 group relative"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(kpis.totalRevenue)}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getGrowthIcon(kpis.revenueGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(
                  kpis.revenueGrowth
                )}`}
              >
                {kpis.revenueGrowth > 0 ? "+" : ""}
                {kpis.revenueGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>
        </div>

        {/* Earnings Overview */}
        {earningsData &&
          earningsData.venueEarnings &&
          earningsData.venueEarnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl mb-8 border border-white/30"
            >
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mr-4 shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Earnings by Venue
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {earningsData.venueEarnings.map((venueEarning, index) => (
                    <motion.div
                      key={venueEarning._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <h3 className="font-bold text-gray-900 mb-4 text-lg">
                        {venueEarning.venueId?.name || "Unknown Venue"}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Total Earnings:
                          </span>
                          <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {formatCurrency(venueEarning.totalEarnings)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Pending:
                          </span>
                          <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            {formatCurrency(venueEarning.pendingEarnings)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Bookings:
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            {venueEarning.totalBookings}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          fetchVenueDetails(venueEarning.venueId._id)
                        }
                        className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg font-semibold"
                      >
                        View Details
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Owned Venues */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30"
            >
              <div className="p-6 sm:p-8 border-b border-gray-200/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mr-4 shadow-lg">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      My Venues
                    </h2>
                  </div>
                  <motion.button
                    onClick={handleAddVenue}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg font-semibold inline-flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Venue</span>
                  </motion.button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search venues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 shadow-lg"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-12 pr-10 py-3 bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 shadow-lg appearance-none"
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

              <div className="p-6 sm:p-8">
                {filteredVenues.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center py-12"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl mb-6">
                      <Building2 className="h-10 w-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No venues found
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchTerm || statusFilter !== "All"
                        ? "Try adjusting your filters to see more results."
                        : "Start building your venue empire by adding your first venue."}
                    </p>
                    <motion.button
                      onClick={handleAddVenue}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg font-semibold inline-flex items-center space-x-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Add Your First Venue</span>
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {filteredVenues.map((venue, index) => (
                      <motion.div
                        key={venue._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-6">
                            <div className="relative">
                              <img
                                src={
                                  venue.images?.[0]?.url ||
                                  venue.coverImage?.url ||
                                  `/api/placeholder/80/80?text=${encodeURIComponent(
                                    venue.name
                                  )}`
                                }
                                alt={venue.name}
                                className="w-20 h-20 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-all duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {venue.name}
                              </h3>
                              <div className="flex items-center text-gray-600 text-sm mb-3">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span className="truncate">
                                  {venue.address || "Address not available"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-6">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                  <span className="text-sm text-gray-600 font-medium">
                                    {venue.rating || 0} (
                                    {venue.totalReviews || 0} reviews)
                                  </span>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    venue.status === "Active"
                                      ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                                      : venue.status === "Inactive"
                                      ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-800"
                                      : venue.status === "Under Maintenance"
                                      ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800"
                                      : venue.status === "Pending Approval"
                                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800"
                                      : venue.status === "Rejected"
                                      ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-800"
                                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
                                  }`}
                                >
                                  {venue.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              <span id={`earnings-${venue._id}`}>
                                {formatCurrency(venue.monthlyEarnings || 0)}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                              This month
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/30">
                          <div className="text-center p-4 bg-white/40 backdrop-blur-sm rounded-2xl">
                            <p className="text-sm text-gray-600 font-medium mb-1">
                              Courts
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                              {venue.courts?.length || 0}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-white/40 backdrop-blur-sm rounded-2xl">
                            <p className="text-sm text-gray-600 font-medium mb-1">
                              Sports
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                              {venue.sportTypes?.length || 0}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-white/40 backdrop-blur-sm rounded-2xl">
                            <p className="text-sm text-gray-600 font-medium mb-1">
                              Status
                            </p>
                            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {venue.status}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-white/40 backdrop-blur-sm rounded-2xl">
                            <p className="text-sm text-gray-600 font-medium mb-1">
                              Rating
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                              {venue.rating || 0}/5
                            </p>
                          </div>
                        </div>

                        {/* Real-time Statistics */}
                        <VenueStatsCard
                          venueId={venue._id}
                          onStatsUpdate={(stats) => {
                            console.log(
                              "Stats updated for venue:",
                              venue.name,
                              stats
                            );
                          }}
                        />

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/30">
                          {/* Status-specific information */}
                          <div className="flex-1">
                            {venue.status === "Pending Approval" && (
                              <div className="text-sm text-blue-600 flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>
                                  Submitted on{" "}
                                  {venue.submittedAt
                                    ? new Date(
                                        venue.submittedAt
                                      ).toLocaleDateString()
                                    : "Recently"}
                                </span>
                              </div>
                            )}
                            {venue.status === "Rejected" &&
                              venue.adminComments && (
                                <div className="text-sm text-red-600 max-w-md flex items-start">
                                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">
                                      Rejected:
                                    </span>{" "}
                                    {venue.adminComments}
                                  </div>
                                </div>
                              )}
                            {venue.status === "Active" && (
                              <div className="text-sm text-green-600 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                <span>Live and accepting bookings</span>
                              </div>
                            )}
                            {venue.status === "Under Maintenance" && (
                              <div className="text-sm text-yellow-600 flex items-center">
                                <Wrench className="h-4 w-4 mr-2" />
                                <span>Temporarily unavailable</span>
                              </div>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center space-x-3">
                            <motion.button
                              onClick={() => handleViewVenue(venue._id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg text-sm font-medium"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View</span>
                            </motion.button>

                            {venue.status !== "Pending Approval" && (
                              <motion.button
                                onClick={() => handleEditVenue(venue._id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-xl hover:bg-white transition-all duration-200 shadow-lg text-sm font-medium border border-white/40"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                              </motion.button>
                            )}

                            {venue.status === "Rejected" && (
                              <motion.button
                                onClick={() => handleResubmitVenue(venue._id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg text-sm font-medium"
                              >
                                <RefreshCw className="h-4 w-4" />
                                <span>Resubmit</span>
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30"
          >
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl mr-4 shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Recent Bookings
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentBookings.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center py-12"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl mb-4">
                      <Calendar className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">
                      No recent bookings
                    </p>
                    <p className="text-gray-500 text-sm">
                      Bookings will appear here once customers start booking
                      your venues
                    </p>
                  </motion.div>
                ) : (
                  recentBookings.slice(0, 8).map((booking, index) => (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center justify-between py-4 px-4 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm rounded-2xl border border-white/40 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm mb-1">
                          {booking.customer.name}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          {booking.venue.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.court.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-sm">
                          {formatCurrency(booking.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.date).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Venue Earnings Details Modal */}
        {selectedVenue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mr-4 shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {selectedVenue.earnings?.venueId?.name || "Venue"} -
                    Detailed Earnings
                  </h3>
                </div>
                <motion.button
                  onClick={() => setSelectedVenue(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-gray-100 rounded-2xl transition-colors duration-200"
                >
                  <span className="text-2xl text-gray-400 hover:text-gray-600">
                    ✕
                  </span>
                </motion.button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-3xl border border-white/40">
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatCurrency(selectedVenue.earnings?.totalEarnings || 0)}
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-orange-50/80 to-amber-50/80 backdrop-blur-sm rounded-3xl border border-white/40">
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Pending
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {formatCurrency(
                      selectedVenue.earnings?.pendingEarnings || 0
                    )}
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-3xl border border-white/40">
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Paid Out
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {formatCurrency(selectedVenue.earnings?.paidEarnings || 0)}
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-sm rounded-3xl border border-white/40">
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Total Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedVenue.earnings?.totalBookings || 0}
                  </p>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/40">
                <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Recent Bookings
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200/50">
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                          Your Earnings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                      {selectedVenue.recentBookings?.length > 0 ? (
                        selectedVenue.recentBookings.map((booking, index) => (
                          <motion.tr
                            key={booking._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-white/40 transition-colors duration-200"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(booking.date).toLocaleDateString(
                                "en-IN"
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {booking.startTime} - {booking.endTime}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {booking.userId?.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              {formatCurrency(booking.price)}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              {formatCurrency(booking.ownerEarnings)}
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            No recent bookings
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
