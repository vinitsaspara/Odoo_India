import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
} from "lucide-react";
import api from "../utils/api";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!sessionId) {
        setError("No session ID found");
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get(`/payments/booking-status/${sessionId}`);
        if (response.data.success) {
          setBooking(response.data.booking);
        } else {
          setError("Failed to fetch booking details");
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
        setError("Failed to fetch booking details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/venues")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Venues
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white bg-opacity-20 mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-green-100">
              Your court booking has been confirmed
            </p>
          </div>

          {/* Booking Details */}
          {booking && (
            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Booking Details
                </h2>

                <div className="space-y-4">
                  {/* Venue Info */}
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.venueId?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.venueId?.address}
                      </p>
                    </div>
                  </div>

                  {/* Court Info */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Court: {booking.court?.name || "Court"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Sport: {booking.court?.sportType || "General"}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.date).toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Time</p>
                        <p className="text-sm text-gray-600">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          Total Amount Paid
                        </p>
                        <p className="text-sm text-gray-600">
                          Payment Status: {booking.paymentStatus}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ₹{booking.price}
                        </p>
                        <p className="text-sm text-green-600">Paid</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking ID */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-mono text-sm text-gray-900">
                      {booking._id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>View My Bookings</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => navigate("/venues")}
                  className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span>Book Another Court</span>
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">
                  Important Information
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>
                    • Please arrive 10-15 minutes before your booking time
                  </li>
                  <li>• Bring valid ID for verification</li>
                  <li>• Cancellation policy applies as per venue terms</li>
                  <li>• Contact venue directly for any immediate concerns</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
