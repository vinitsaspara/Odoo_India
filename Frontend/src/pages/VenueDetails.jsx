import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Phone,
  Clock,
  Users,
  Wifi,
  Car,
  Coffee,
  Shield,
  Zap,
  ArrowLeft,
  Calendar,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api, { handleApiError } from "../utils/api";
import {
  getSportPlaceholder,
  handleImageError,
} from "../utils/placeholderImages";
import { useAuth } from "../hooks/useAuth";

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [venue, setVenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);

  // Function to fetch available slots when date changes
  const fetchAvailableSlots = async (venueId, courtId, selectedDate) => {
    if (!venueId || !courtId || !selectedDate) return;

    setIsLoadingSlots(true);
    try {
      console.log("Fetching available slots for:", {
        venueId,
        courtId,
        selectedDate,
      });
      const response = await api.get("/bookings/available-slots", {
        params: { venueId, courtId, selectedDate },
      });

      if (response.data.success) {
        const slots = response.data.availableSlots || [];
        setAvailableSlots(slots);
        console.log("Available slots fetched:", slots);
        console.log(
          `Total: ${response.data.totalSlots || 0}, Available: ${
            response.data.availableCount || 0
          }, Booked: ${response.data.bookedCount || 0}`
        );
      } else {
        console.error("Failed to fetch slots:", response.data.message);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
      // Show user-friendly message
      alert("Failed to load available time slots. Please try again.");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Generate fallback slots for demo purposes
  const generateFallbackSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
      slots.push({
        startTime,
        endTime,
        label: `${startTime} - ${endTime}`,
        available: true,
        price: selectedCourt?.pricePerHour || 500,
      });
    }
    return slots;
  };

  // Amenity icons mapping
  const amenityIcons = {
    Parking: Car,
    WiFi: Wifi,
    Cafeteria: Coffee,
    Security: Shield,
    Lighting: Zap,
    "Changing Room": Users,
    "First Aid": Shield,
    "Equipment Rental": Play,
  };

  useEffect(() => {
    if (id) {
      fetchVenueDetails();
    }
  }, [id]);

  useEffect(() => {
    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
  }, []);

  // Fetch available slots when date or court changes
  useEffect(() => {
    if (selectedDate && selectedCourt && venue) {
      fetchAvailableSlots(venue._id, selectedCourt._id, selectedDate);
    }
  }, [selectedDate, selectedCourt, venue]);

  const fetchVenueDetails = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching venue details from API for ID:", id);
      const response = await api.get(`/venues/${id}`);
      setVenue(response.data.venue || response.data);
    } catch (error) {
      console.error("Error fetching venue details:", error);

      // Fallback to mock data if API fails
      console.log("API failed, falling back to mock data...");
      const mockVenue = generateMockVenueDetails(id);
      setVenue(mockVenue);

      setError("API temporarily unavailable. Showing sample data.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockVenueDetails = (venueId) => {
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

    const index = parseInt(venueId?.replace("mock-", "") || "1") - 1;
    const safeIndex = Math.max(0, index % venueNames.length);

    return {
      _id: venueId || "mock-1",
      name: venueNames[safeIndex] || "Elite Sports Arena",
      description: `Premium sports facility offering world-class amenities and professional courts. Located in the heart of ${
        locations[safeIndex % locations.length]
      }, we provide an exceptional sporting experience for athletes of all levels.`,
      location: {
        address: locations[safeIndex % locations.length],
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380015",
      },
      contact: {
        phone: "+91 98765 43210",
        email: "info@elitesportsarena.com",
      },
      images: [
        getSportPlaceholder(`${venueNames[safeIndex]} Main Court`, 800, 400),
        getSportPlaceholder(`${venueNames[safeIndex]} Facilities`, 800, 400),
        getSportPlaceholder(`${venueNames[safeIndex]} Interior`, 800, 400),
        getSportPlaceholder(`${venueNames[safeIndex]} Equipment`, 800, 400),
      ],
      rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
      totalReviews: 156 + safeIndex * 23,
      amenities: [
        "Parking",
        "WiFi",
        "Cafeteria",
        "Security",
        "Lighting",
        "Changing Room",
        "First Aid",
        "Equipment Rental",
      ],
      sportsTypes: ["Badminton", "Tennis", "Table Tennis"],
      operatingHours: {
        weekdays: "06:00 AM - 11:00 PM",
        weekends: "06:00 AM - 12:00 AM",
      },
      priceRange: {
        min: 400 + safeIndex * 50,
        max: 800 + safeIndex * 100,
      },
      courts: [
        {
          _id: "court-1",
          name: "Court 1 - Badminton",
          sport: "Badminton",
          pricePerHour: 450 + safeIndex * 25,
          features: [
            "Professional Flooring",
            "LED Lighting",
            "Air Conditioning",
          ],
          isActive: true,
        },
        {
          _id: "court-2",
          name: "Court 2 - Badminton",
          sport: "Badminton",
          pricePerHour: 450 + safeIndex * 25,
          features: ["Professional Flooring", "LED Lighting"],
          isActive: true,
        },
        {
          _id: "court-3",
          name: "Court 3 - Tennis",
          sport: "Tennis",
          pricePerHour: 650 + safeIndex * 50,
          features: ["Clay Court", "Floodlights", "Seating Area"],
          isActive: true,
        },
        {
          _id: "court-4",
          name: "Court 4 - Table Tennis",
          sport: "Table Tennis",
          pricePerHour: 250 + safeIndex * 15,
          features: ["ITTF Approved Table", "Good Lighting"],
          isActive: true,
        },
      ],
      policies: {
        cancellation: "24 hours advance notice required",
        payment: "Full payment required at booking",
        equipment: "Equipment rental available at additional cost",
      },
      isActive: true,
    };
  };

  const handleBookNow = (court) => {
    setSelectedCourt(court);
    setSelectedTimeSlot("");
    setAvailableSlots([]);
    setShowBookingModal(true);
    // Slots will be fetched by useEffect when selectedCourt changes
  };

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      alert("Please select date and time slot");
      return;
    }

    // Find the selected slot object
    const selectedSlotObj = availableSlots.find(
      (slot) =>
        slot.label === selectedTimeSlot ||
        `${slot.startTime} - ${slot.endTime}` === selectedTimeSlot
    );

    if (!selectedSlotObj) {
      alert("Invalid time slot selected");
      return;
    }

    try {
      // Prepare booking data for Stripe checkout
      const bookingData = {
        venueId: venue._id,
        courtId: selectedCourt._id,
        date: selectedDate,
        startTime: selectedSlotObj.startTime,
        endTime: selectedSlotObj.endTime,
        price: selectedSlotObj.price || selectedCourt.pricePerHour,
      };

      console.log("Creating Stripe checkout session:", bookingData);

      // Call create-checkout-session endpoint
      const response = await api.post(
        "/payments/create-checkout-session",
        bookingData
      );

      if (response.data.success) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.sessionUrl;
      } else {
        alert(`Payment setup failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Checkout session creation error:", error);

      if (error.response?.data?.message) {
        alert(`Payment setup failed: ${error.response.data.message}`);
      } else {
        alert("Failed to setup payment. Please try again.");
      }
    }
  };

  // Helper function to get all images (cover + additional images)
  const getAllImages = () => {
    const allImages = [];

    // Add cover image first if it exists
    if (venue?.coverImage && venue.coverImage.url) {
      allImages.push(venue.coverImage.url);
    }

    // Add additional images
    if (venue?.images && venue.images.length > 0) {
      venue.images.forEach((image) => {
        // Handle both old format (direct URL) and new format (object with url property)
        const imageUrl = typeof image === "string" ? image : image.url;
        if (imageUrl) {
          allImages.push(imageUrl);
        }
      });
    }

    return allImages;
  };

  const nextImage = () => {
    const allImages = getAllImages();
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === allImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    const allImages = getAllImages();
    if (allImages.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? allImages.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchVenueDetails}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Venue not found</p>
          <button
            onClick={() => navigate("/venues")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Venues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/venues")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Venues
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-96">
                {/* Get images from both coverImage and images array */}
                {(() => {
                  const allImages = [];

                  // Add cover image first if it exists
                  if (venue.coverImage && venue.coverImage.url) {
                    allImages.push(venue.coverImage.url);
                  }

                  // Add additional images
                  if (venue.images && venue.images.length > 0) {
                    venue.images.forEach((image) => {
                      // Handle both old format (direct URL) and new format (object with url property)
                      const imageUrl =
                        typeof image === "string" ? image : image.url;
                      if (imageUrl) {
                        allImages.push(imageUrl);
                      }
                    });
                  }

                  return allImages.length > 0 ? (
                    <>
                      <img
                        src={allImages[currentImageIndex]}
                        alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          handleImageError(e, `${venue.name} Image`)
                        }
                      />
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {allImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-3 h-3 rounded-full ${
                                  index === currentImageIndex
                                    ? "bg-white"
                                    : "bg-white bg-opacity-50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No images available</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Venue Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    About this venue
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{venue.rating || 0}</span>
                      <span className="ml-1">
                        ({venue.totalReviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{venue.address || "Address not available"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                {venue.description || "No description available"}
              </p>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    {venue.phone ||
                      venue.contact?.phone ||
                      "Phone not available"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    {venue.operatingHours?.weekdays ||
                      "Operating hours not available"}
                  </span>
                </div>
              </div>

              {/* Sports Types */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Available Sports
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(venue.sportsTypes || venue.sportTypes || []).map(
                    (sport, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {sport}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(venue.amenities || []).map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity] || Users;
                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-gray-700"
                      >
                        <IconComponent className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Courts List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Available Courts
              </h3>
              <div className="space-y-4">
                {(venue.courts || []).map((court) => (
                  <div
                    key={court._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {court.name}
                        </h4>
                        <p className="text-sm text-gray-600">{court.sport}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          ₹{court.pricePerHour}/hr
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {(court.features || []).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {user?.role === "user" && (
                      <button
                        onClick={() => handleBookNow(court)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Booking */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Info
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Range:</span>
                  <span className="font-medium">
                    {venue.priceRange
                      ? `₹${venue.priceRange.min} - ₹${venue.priceRange.max}/hr`
                      : "Price not available"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Courts:</span>
                  <span className="font-medium">
                    {(venue.courts || []).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Operating Hours:</span>
                  <span className="font-medium">
                    {venue.operatingHours?.weekdays ||
                      "Operating hours not available"}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Policies</h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <p>
                    •{" "}
                    {venue.policies?.cancellation ||
                      venue.cancellationPolicy ||
                      "Cancellation policy not available"}
                  </p>
                  <p>
                    •{" "}
                    {venue.policies?.payment || "Payment policy not available"}
                  </p>
                  <p>
                    •{" "}
                    {venue.policies?.equipment ||
                      "Equipment policy not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {user?.role === "user" && showBookingModal && selectedCourt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Book {selectedCourt.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTimeSlot(""); // Reset time slot when date changes
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time Slot
                </label>
                {isLoadingSlots ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Loading available slots...
                  </div>
                ) : (
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={availableSlots.length === 0}
                  >
                    <option value="">
                      {availableSlots.length === 0
                        ? "No available slots"
                        : "Choose time slot"}
                    </option>
                    {availableSlots.map((slot, index) => (
                      <option
                        key={index}
                        value={
                          slot.label || `${slot.startTime} - ${slot.endTime}`
                        }
                      >
                        {slot.label || `${slot.startTime} - ${slot.endTime}`} -
                        ₹{slot.price}
                      </option>
                    ))}
                  </select>
                )}
                {!isLoadingSlots &&
                  availableSlots.length === 0 &&
                  selectedDate && (
                    <p className="text-sm text-red-600 mt-1">
                      No available slots for this date. All slots may be booked
                      or venue is closed.
                    </p>
                  )}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Court:</span>
                  <span className="font-medium">{selectedCourt.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price per hour:</span>
                  <span className="font-medium">
                    ₹{selectedCourt.pricePerHour}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedCourt(null);
                  setSelectedTimeSlot("");
                  setAvailableSlots([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={!selectedDate || !selectedTimeSlot || isLoadingSlots}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoadingSlots ? "Loading..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueDetails;
