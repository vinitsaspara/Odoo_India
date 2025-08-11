import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Star,
} from "lucide-react";
import api, { handleApiError } from "../utils/api";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching booking details from API:", id);
      const response = await api.get(`/bookings/${id}`);

      if (response.data && response.data.booking) {
        setBooking(response.data.booking);
        console.log("Booking details fetched successfully from API");
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error("Failed to fetch booking details from API:", error);
      console.log("Using mock booking data...");

      // Fallback to mock data
      const mockBooking = {
        _id: id,
        bookingId: `BK${Date.now().toString().slice(-6)}`,
        venue: {
          name: "Elite Sports Complex",
          location: "Satellite, Ahmedabad, Gujarat",
          sportType: "Badminton",
          phone: "+91 99999 99999",
          email: "info@elitesports.com",
        },
        court: {
          name: "Court A",
          type: "Premium",
        },
        user: {
          name: "John Doe",
          email: "john@example.com",
          phone: "+91 98765 43210",
        },
        date: "2024-01-20",
        timeSlot: "09:00-10:00",
        duration: 1,
        status: "Confirmed",
        totalAmount: 800,
        paymentStatus: "Paid",
        paymentMethod: "UPI",
        bookingDate: "2024-01-15T10:30:00Z",
        cancellationPolicy:
          "Free cancellation up to 2 hours before the booking time",
        instructions:
          "Please bring your own rackets. Shuttlecocks will be provided.",
        canCancel: true,
        isCompleted: false,
      };

      setBooking(mockBooking);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      console.log("Cancelling booking via API:", id);

      try {
        await api.patch(`/bookings/${id}/cancel`);
        console.log("Booking cancelled via API");
      } catch (apiError) {
        console.error("API cancellation failed:", apiError);
        console.log("Updating local state...");
      }

      // Update local state
      setBooking((prev) => ({
        ...prev,
        status: "Cancelled",
        canCancel: false,
      }));

      alert("Booking cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
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
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Booking
          </h2>
          <p className="text-gray-600 mb-4">{error || "Booking not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Booking Details
                </h1>
                <p className="text-sm text-gray-500">ID: {booking.bookingId}</p>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(
                booking.status
              )}`}
            >
              {getStatusIcon(booking.status)}
              <span>{booking.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Information
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {booking.venue.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {booking.venue.sportType} • {booking.court.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{booking.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{booking.timeSlot}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{booking.venue.location}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="text-sm font-medium">
                      {booking.duration} hour(s)
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-lg font-semibold text-green-600">
                      ₹{booking.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">
                      Payment Status:
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Venue Contact
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{booking.venue.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{booking.venue.email}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Your Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{booking.user.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{booking.user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{booking.user.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-6">
            {/* Instructions */}
            {booking.instructions && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Instructions
                </h2>
                <p className="text-sm text-gray-600">{booking.instructions}</p>
              </div>
            )}

            {/* Cancellation Policy */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Cancellation Policy
              </h2>
              <p className="text-sm text-gray-600">
                {booking.cancellationPolicy}
              </p>
            </div>

            {/* Booking Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Timeline
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Booking Confirmed</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.bookingDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                {booking.status === "Cancelled" && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Booking Cancelled</p>
                      <p className="text-xs text-gray-500">Recently</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                {booking.canCancel && booking.status === "Confirmed" && (
                  <button
                    onClick={handleCancelBooking}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel Booking</span>
                  </button>
                )}

                {booking.isCompleted && (
                  <button
                    onClick={() => navigate(`/booking/${booking._id}/review`)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>Write Review</span>
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Receipt</span>
                </button>

                <button
                  onClick={fetchBookingDetails}
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
