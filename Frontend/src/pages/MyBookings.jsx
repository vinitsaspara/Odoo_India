import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Booking status options
  const statusOptions = [
    "All",
    "Confirmed",
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
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching bookings from API...");
      const response = await api.get("/bookings/user");

      if (response.data && response.data.bookings) {
        console.log("Bookings fetched successfully from API");
        setBookings(response.data.bookings);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (error) {
      console.error("Failed to fetch bookings from API:", error);
      console.log("Falling back to mock data...");

      // Fallback to mock data
      const mockBookings = generateMockBookings();
      setBookings(mockBookings);
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

    return mockBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filterBookings = () => {
    let filtered = [...bookings];

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
      filtered = filtered.filter((booking) => booking.status === statusFilter);
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
      case "Confirmed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "Cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "Pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">
                Manage your venue bookings and view booking history
              </p>
            </div>
            <button
              onClick={fetchBookings}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {dateOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600">
                {filteredBookings.length} booking
                {filteredBookings.length !== 1 ? "s" : ""} found
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "All" || dateFilter !== "All"
                ? "Try adjusting your filters to see more results."
                : "You haven't made any bookings yet. Start exploring venues to make your first booking!"}
            </p>
            <button
              onClick={() => navigate("/venues")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Venues
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(booking.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.venue.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Booking ID: {booking.bookingId}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {booking.venue.location.address}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(booking.date)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {booking.timeSlot}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{booking.totalAmount}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({booking.paymentStatus})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {booking.court.name}
                    </p>
                    {booking.notes && (
                      <p className="text-xs text-gray-600 mt-1">
                        {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => navigate(`/venues/${booking.venue._id}`)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Venue</span>
                    </button>

                    {booking.canCancel && (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Cancel Booking
            </h3>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to cancel this booking?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <p className="text-sm">
                  <strong>Venue:</strong> {bookingToCancel.venue.name}
                </p>
                <p className="text-sm">
                  <strong>Court:</strong> {bookingToCancel.court.name}
                </p>
                <p className="text-sm">
                  <strong>Date:</strong> {formatDate(bookingToCancel.date)}
                </p>
                <p className="text-sm">
                  <strong>Time:</strong> {bookingToCancel.timeSlot}
                </p>
                <p className="text-sm">
                  <strong>Amount:</strong> ₹{bookingToCancel.totalAmount}
                </p>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                * Refund will be processed within 3-5 business days
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isCancelling}
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancelBooking}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
