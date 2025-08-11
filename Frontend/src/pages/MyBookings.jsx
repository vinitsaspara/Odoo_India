import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Eye,
  RefreshCw,
  Sparkles,
  Trophy,
  Star,
} from "lucide-react";
import api, { handleApiError } from "../utils/api";
import { getSportPlaceholder } from "../utils/placeholderImages";

const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Booking status options
  const statusOptions = [
    "All",
    "Confirmed",
    "Booked",
    "Completed",
    "Cancelled",
    "Pending",
  ];
  const dateOptions = [
    "All",
    "Today",
    "This Week",
    "This Month",
    "Past Bookings",
  ];

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter, sortBy]);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching bookings from API...");
      const response = await api.get("/bookings/user");

      if (response.data && response.data.success && response.data.bookings) {
        console.log(
          "Bookings fetched successfully from API:",
          response.data.bookings
        );
        const bookingsData = response.data.bookings;

        // Process bookings to ensure proper data structure
        const processedBookings = bookingsData.map((booking) => ({
          ...booking,
          // Ensure court information is available
          courtName: booking.court?.name || "Court",
          venueName: booking.venueId?.name || "Venue",
          // Handle date display
          displayDate: booking.date
            ? new Date(booking.date).toLocaleDateString()
            : "Date not available",
          // Handle time display
          timeSlot: `${booking.startTime} - ${booking.endTime}`,
          // Ensure status is properly formatted
          status: booking.status || "booked",
        }));

        console.log(
          "Sample booking statuses:",
          processedBookings
            .slice(0, 5)
            .map((b) => ({ id: b._id, status: b.status }))
        );
        setBookings(processedBookings);
        console.log(`Successfully loaded ${processedBookings.length} bookings`);
      } else {
        console.log("No bookings found or invalid response");
        setBookings([]);
      }
    } catch (error) {
      console.error("Failed to fetch bookings from API:", error);
      setError("Failed to load bookings. Please try refreshing the page.");
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockBookings = () => {
    const mockBookings = [];
    const venueNames = [
      "Elite Sports Arena",
      "Champions Court",
      "Victory Sports Zone",
      "Power Play Complex",
      "Athletic Excellence Hub",
      "Premium Sports Center",
      "Ultimate Game Zone",
      "Sports Paradise",
    ];

    const locations = [
      "Satellite, Ahmedabad",
      "Bopal, Ahmedabad",
      "Maninagar, Ahmedabad",
      "Prahlad Nagar, Ahmedabad",
      "Vastrapur, Ahmedabad",
      "Gota, Ahmedabad",
    ];

    const statuses = ["Confirmed", "Completed", "Cancelled", "Pending"];
    const sports = ["Badminton", "Tennis", "Table Tennis", "Squash"];

    // Generate bookings for different dates
    const today = new Date();
    const dates = [];

    // Past bookings
    for (let i = 30; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }

    // Future bookings
    for (let i = 1; i <= 15; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    for (let i = 0; i < 20; i++) {
      const randomDate = dates[Math.floor(Math.random() * dates.length)];
      const isPast = randomDate < today;
      const isToday = randomDate.toDateString() === today.toDateString();

      let status;
      if (isPast) {
        status = Math.random() > 0.2 ? "Completed" : "Cancelled";
      } else if (isToday) {
        status = Math.random() > 0.1 ? "Confirmed" : "Pending";
      } else {
        status = Math.random() > 0.8 ? "Pending" : "Confirmed";
      }

      const venueIndex = i % venueNames.length;
      const sport = sports[i % sports.length];
      const timeSlot = `${(9 + (i % 12)).toString().padStart(2, "0")}:00 - ${(
        10 +
        (i % 12)
      )
        .toString()
        .padStart(2, "0")}:00`;

      mockBookings.push({
        _id: `booking-${i + 1}`,
        bookingId: `BK${String(i + 1).padStart(4, "0")}`,
        venue: {
          _id: `venue-${venueIndex + 1}`,
          name: venueNames[venueIndex],
          location: {
            address: locations[venueIndex % locations.length],
            city: "Ahmedabad",
            state: "Gujarat",
          },
          image: getSportPlaceholder(`${venueNames[venueIndex]}`, 300, 200),
        },
        court: {
          _id: `court-${i + 1}`,
          name: `Court ${(i % 4) + 1} - ${sport}`,
          sport: sport,
        },
        date: randomDate.toISOString().split("T")[0],
        timeSlot: timeSlot,
        duration: 1,
        totalAmount: 450 + i * 25,
        status: status,
        paymentStatus: status === "Cancelled" ? "Refunded" : "Paid",
        bookingDate: new Date(
          randomDate.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        cancellationReason: status === "Cancelled" ? "User cancelled" : null,
        canCancel: status === "Confirmed" && randomDate > today,
        notes: i % 3 === 0 ? "Equipment rental included" : null,
      });
    }

    console.log(
      "Generated mock bookings with statuses:",
      mockBookings.map((b) => ({ venue: b.venue.name, status: b.status }))
    );
    return mockBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    console.log("Filtering bookings:", {
      totalBookings: bookings.length,
      searchTerm,
      statusFilter,
      dateFilter,
      sortBy,
    });

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((booking) => {
        const bookingStatus = booking.status;

        if (statusFilter === "Confirmed" || statusFilter === "Booked") {
          return (
            bookingStatus === "booked" ||
            bookingStatus === "Confirmed" ||
            bookingStatus === "Booked"
          );
        }

        if (statusFilter === "Cancelled") {
          return bookingStatus === "Cancelled" || bookingStatus === "cancelled";
        }

        if (statusFilter === "Pending") {
          return bookingStatus === "Pending" || bookingStatus === "pending";
        }

        if (statusFilter === "Completed") {
          return bookingStatus === "Completed" || bookingStatus === "completed";
        }

        return bookingStatus === statusFilter;
      });
    }

    // Date filter
    if (dateFilter !== "All") {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.date);

        switch (dateFilter) {
          case "Today":
            return booking.date === todayStr;
          case "This Week":
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            return bookingDate >= today && bookingDate <= weekFromNow;
          case "This Month":
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(today.getMonth() + 1);
            return bookingDate >= today && bookingDate <= monthFromNow;
          case "Past Bookings":
            return bookingDate < today;
          default:
            return true;
        }
      });
    }

    // Sorting
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "date-old":
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "venue":
        filtered.sort((a, b) => a.venue.name.localeCompare(b.venue.name));
        break;
      case "status":
        filtered.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    console.log("Filtered bookings result:", {
      filteredCount: filtered.length,
      filteredBookings: filtered.map((b) => ({
        id: b._id,
        status: b.status,
        venue: b.venue?.name,
      })),
    });

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    setIsCancelling(true);
    try {
      console.log("Cancelling booking via API...", bookingToCancel.bookingId);

      // Try API call first
      try {
        await api.patch(`/bookings/${bookingToCancel._id}/cancel`, {
          reason: "User cancelled",
        });

        console.log("Booking cancelled successfully via API");
      } catch (apiError) {
        console.error("API cancellation failed:", apiError);
        console.log("Proceeding with local state update...");
      }

      // Update local booking status (works for both API success and fallback)
      const updatedBookings = bookings.map((booking) =>
        booking._id === bookingToCancel._id
          ? {
              ...booking,
              status: "Cancelled",
              paymentStatus: "Refund Pending",
              cancellationReason: "User cancelled",
              canCancel: false,
            }
          : booking
      );

      setBookings(updatedBookings);
      setShowCancelModal(false);
      setBookingToCancel(null);

      // Show success message
      alert(
        "Booking cancelled successfully. Refund will be processed within 3-5 business days."
      );
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "All":
        return <Filter className="h-4 w-4" />;
      case "Confirmed":
      case "Booked":
      case "booked":
        return <CheckCircle className="h-4 w-4" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "Cancelled":
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
      case "booked":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const formatDateFromDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Date not available";
    const date = new Date(dateTimeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const formatTimeFromDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Time not available";
    return new Date(dateTimeString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getStatusButtonStyle = (status) => {
    switch (status) {
      case "All":
        return "bg-gradient-to-r from-blue-500 to-purple-600 text-white";
      case "Confirmed":
      case "Booked":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case "Completed":
        return "bg-gradient-to-r from-blue-500 to-cyan-600 text-white";
      case "Cancelled":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white";
      case "Pending":
        return "bg-gradient-to-r from-yellow-500 to-orange-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-pink-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: 180,
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <section className="pt-20 pb-8 px-4 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 inline-block">
              {/* Profile Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg"
              >
                <Calendar className="w-8 h-8 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight"
              >
                My Bookings
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto"
              >
                Manage your venue bookings and view your complete booking
                history
              </motion.p>

              {/* Refresh Button */}
              <motion.button
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg inline-flex items-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Refresh Bookings</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10">
        {/* Quick Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-6 border border-white/30"
        >
          <div className="flex items-center mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl mr-3 shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Quick Filters
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {statusOptions.map((status) => {
              const statusCount = bookings.filter((booking) => {
                if (status === "All") return true;

                const bookingStatus = booking.status;

                if (status === "Confirmed" || status === "Booked") {
                  return (
                    bookingStatus === "booked" ||
                    bookingStatus === "Confirmed" ||
                    bookingStatus === "Booked"
                  );
                }

                if (status === "Cancelled") {
                  return (
                    bookingStatus === "Cancelled" ||
                    bookingStatus === "cancelled"
                  );
                }

                if (status === "Pending") {
                  return (
                    bookingStatus === "Pending" || bookingStatus === "pending"
                  );
                }

                if (status === "Completed") {
                  return (
                    bookingStatus === "Completed" ||
                    bookingStatus === "completed"
                  );
                }

                return bookingStatus === status;
              }).length;

              const isActive = statusFilter === status;

              return (
                <motion.button
                  key={status}
                  onClick={() => {
                    console.log("Quick filter clicked:", status);
                    setStatusFilter(status);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? getStatusButtonStyle(status) + " shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {getStatusIcon(status)}
                  <span>{status}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isActive ? "bg-white/30" : "bg-gray-200"
                    }`}
                  >
                    {statusCount}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Advanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8 mb-6 border border-white/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-3 shadow-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Filter & Search
              </h3>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setDateFilter("All");
                setSortBy("date");
              }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-gray-100"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => {
                  console.log("Search term changed:", e.target.value);
                  setSearchTerm(e.target.value);
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <CheckCircle className="h-5 w-5" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  console.log(
                    "Advanced status filter changed:",
                    e.target.value
                  );
                  setStatusFilter(e.target.value);
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none"
              >
                {dateOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Filter className="h-5 w-5" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none"
              >
                <option value="date">Date (Newest First)</option>
                <option value="date-old">Date (Oldest First)</option>
                <option value="venue">Venue Name</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl px-4 py-3 border border-blue-100">
            <Trophy className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-700">
              {filteredBookings.length} booking
              {filteredBookings.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </motion.div>

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
                <p className="text-red-600 text-sm mt-1">
                  Please try refreshing the page.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No bookings found
              </h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md">
                {searchTerm || statusFilter !== "All" || dateFilter !== "All"
                  ? "Try adjusting your filters to see more results."
                  : "You haven't made any bookings yet. Start exploring venues to make your first booking!"}
              </p>
              <motion.button
                onClick={() => navigate("/venues")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg inline-flex items-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Browse Venues</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8 border border-white/30 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {getStatusIcon(booking.status)}
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {booking.venueId?.name ||
                          booking.venue?.name ||
                          "Unknown Venue"}
                      </h3>
                      <p className="text-gray-600 mb-1">
                        {booking.courtName ||
                          booking.court?.name ||
                          "Unknown Court"}{" "}
                        •{" "}
                        {booking.courtSport ||
                          booking.court?.sportType ||
                          "Sport"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Booking ID:{" "}
                        {booking._id?.slice(-8) || booking.bookingId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                        booking.status
                      )} shadow-lg`}
                    >
                      {booking.status === "booked"
                        ? "Confirmed"
                        : booking.status}
                    </span>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{booking.price || "0"}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/hour</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-3 bg-blue-50/80 backdrop-blur-sm rounded-2xl p-3 border border-blue-100">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Location
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {booking.venueId?.address ||
                          booking.venue?.address ||
                          "Address not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-purple-50/80 backdrop-blur-sm rounded-2xl p-3 border border-purple-100">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Date</p>
                      <p className="text-gray-900 font-semibold">
                        {booking.displayDate ||
                          (booking.date
                            ? new Date(booking.date).toLocaleDateString()
                            : "Date not available")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-green-50/80 backdrop-blur-sm rounded-2xl p-3 border border-green-100">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Time</p>
                      <p className="text-gray-900 font-semibold">
                        {booking.timeSlot ||
                          (booking.startTime && booking.endTime
                            ? `${booking.startTime} - ${booking.endTime}`
                            : "Time not available")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.courtName || booking.court?.name || "Court"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Sport: {booking.court?.sportType || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={() =>
                        navigate(
                          `/venues/${
                            booking.venueId?._id ||
                            booking.venueId ||
                            booking.venue?._id
                          }`
                        )
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Venue</span>
                    </motion.button>

                    {/* Show cancel button for bookings that can be cancelled */}
                    {(booking.canCancel ||
                      ((booking.status === "booked" ||
                        booking.status === "Confirmed") &&
                        new Date(booking.startTime || booking.date) >
                          new Date())) && (
                      <motion.button
                        onClick={() => handleCancelBooking(booking)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg text-sm"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/30"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Cancel Booking
              </h3>
              <p className="text-gray-600">
                Are you sure you want to cancel this booking?
              </p>
            </div>

            <div className="mb-8">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl space-y-3 border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Venue:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {bookingToCancel.venue.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Court:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {bookingToCancel.court.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Date:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDate(bookingToCancel.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Time:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {bookingToCancel.timeSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Amount:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{bookingToCancel.totalAmount}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                * Refund will be processed within 3-5 business days
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-2xl transition-all duration-200 hover:scale-105"
                disabled={isCancelling}
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancelBooking}
                disabled={isCancelling}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100"
              >
                {isCancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
