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
  Heart,
  Share2,
  Award,
  CheckCircle,
  Info,
  Crown,
  Sparkles,
  MapPinIcon,
  PhoneCall,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

  // Enhanced Amenity icons mapping with modern icons
  const amenityIcons = {
    Parking: Car,
    WiFi: Wifi,
    Cafeteria: Coffee,
    Security: Shield,
    Lighting: Zap,
    "Changing Room": Users,
    "First Aid": Shield,
    "Equipment Rental": Play,
    "Air Conditioning": Sparkles,
    "Professional Court": Award,
    "LED Lighting": Zap,
    "Premium Facilities": Crown,
  };

  // Enhanced sport type icons
  const sportIcons = {
    Badminton: "🏸",
    Tennis: "🎾",
    "Table Tennis": "🏓",
    Cricket: "🏏",
    Football: "⚽",
    Basketball: "🏀",
    Volleyball: "🏐",
    Swimming: "🏊",
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/30"
        >
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
          </div>
          <motion.h3
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl font-semibold text-gray-800 mb-2"
          >
            Loading Venue Details
          </motion.h3>
          <p className="text-gray-600">
            Preparing an amazing experience for you...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/30 max-w-md"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Unable to Load Venue
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchVenueDetails}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/30 max-w-md"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPinIcon className="h-10 w-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Venue Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find the venue you're looking for.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/venues")}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
          >
            Back to Venues
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/30 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/venues")}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors bg-white/80 px-4 py-2 rounded-xl shadow-md border border-gray-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Venues
              </motion.button>

              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {venue.name}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{venue.rating || 4.5}</span>
                  <span>•</span>
                  <span>{venue.totalReviews || 156} reviews</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-3 rounded-xl shadow-md border transition-all duration-200 ${
                  isWishlisted
                    ? "bg-red-500 text-white border-red-400"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-500"
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`}
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShareModal(true)}
                className="p-3 bg-white text-gray-600 rounded-xl shadow-md border border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <Share2 className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Enhanced Image Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/30"
            >
              <div className="relative h-96 md:h-[500px]">
                {(() => {
                  const allImages = getAllImages();
                  return allImages.length > 0 ? (
                    <>
                      <motion.img
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        src={allImages[currentImageIndex]}
                        alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          handleImageError(e, `${venue.name} Image`)
                        }
                      />

                      {/* Gradient Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

                      {/* Premium Badge */}
                      <div className="absolute top-6 left-6">
                        <div className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg backdrop-blur-sm">
                          <Crown className="h-4 w-4 mr-2" />
                          Premium Venue
                        </div>
                      </div>

                      {/* Image Counter */}
                      <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>

                      {/* Navigation Buttons */}
                      {allImages.length > 1 && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={prevImage}
                            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm border border-white/30 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-200 shadow-lg"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={nextImage}
                            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm border border-white/30 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-200 shadow-lg"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </motion.button>
                        </>
                      )}

                      {/* Image Indicators */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {allImages.map((_, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                              index === currentImageIndex
                                ? "bg-white shadow-lg"
                                : "bg-white/50 hover:bg-white/75"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">
                          No images available
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>

            {/* Enhanced Venue Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30"
            >
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                      About This Venue
                    </h2>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-200">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-bold text-yellow-700">
                          {venue.rating || 4.5}
                        </span>
                        <span className="text-yellow-600">
                          ({venue.totalReviews || 156} reviews)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-700 font-medium">
                          {venue.address ||
                            venue.location?.address ||
                            "Premium Location"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                  {venue.description ||
                    "Experience world-class sports facilities with premium amenities and professional-grade equipment. Perfect for athletes of all skill levels."}
                </p>

                {/* Enhanced Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200"
                  >
                    <div className="p-2 bg-green-500 rounded-lg">
                      <PhoneCall className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Contact Number
                      </p>
                      <p className="text-green-800 font-semibold">
                        {venue.phone ||
                          venue.contact?.phone ||
                          "+91 98765 43210"}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200"
                  >
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Operating Hours
                      </p>
                      <p className="text-blue-800 font-semibold">
                        {venue.operatingHours?.weekdays ||
                          "06:00 AM - 11:00 PM"}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Enhanced Sports Types */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                    Available Sports
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(
                      venue.sportsTypes ||
                      venue.sportTypes || [
                        "Badminton",
                        "Tennis",
                        "Table Tennis",
                      ]
                    ).map((sport, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <span className="text-lg">
                          {sportIcons[sport] || "🏅"}
                        </span>
                        <span>{sport}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Amenities */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Crown className="h-5 w-5 text-purple-500 mr-2" />
                    Premium Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(
                      venue.amenities || [
                        "Parking",
                        "WiFi",
                        "Cafeteria",
                        "Security",
                        "Lighting",
                        "Changing Room",
                      ]
                    ).map((amenity, index) => {
                      const IconComponent = amenityIcons[amenity] || Users;
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 text-center">
                            {amenity}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Courts List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-6 w-6 text-green-500 mr-3" />
                Available Courts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(venue.courts || []).map((court, index) => (
                  <motion.div
                    key={court._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Court Index Badge */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>

                    <div className="relative z-10">
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">
                            {sportIcons[court.sport] || "🏅"}
                          </span>
                          <h4 className="text-xl font-bold text-gray-900">
                            {court.name}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                            {court.sport}
                          </span>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">
                              Available
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 font-medium">
                              Starting from
                            </p>
                            <p className="text-2xl font-bold text-green-700">
                              ₹{court.pricePerHour}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-600">per hour</p>
                            <div className="flex items-center space-x-1">
                              <Sparkles className="h-4 w-4 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">
                                Best Rate
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mb-6">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">
                          Court Features
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {(
                            court.features || [
                              "Standard Court",
                              "Good Lighting",
                            ]
                          ).map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Book Button */}
                      {user?.role === "user" && (
                        <motion.button
                          onClick={() => handleBookNow(court)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                        >
                          <Calendar className="h-5 w-5" />
                          <span>Book Now</span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Quick Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sticky top-24 border border-white/30"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                Quick Info
              </h3>

              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                >
                  <span className="text-gray-700 font-medium">Price Range</span>
                  <span className="font-bold text-green-700">
                    {venue.priceRange
                      ? `₹${venue.priceRange.min} - ₹${venue.priceRange.max}/hr`
                      : "₹400 - ₹800/hr"}
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                >
                  <span className="text-gray-700 font-medium">
                    Total Courts
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-700">
                      {(venue.courts || []).length}
                    </span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                >
                  <span className="text-gray-700 font-medium">
                    Operating Hours
                  </span>
                  <span className="font-bold text-purple-700">
                    {venue.operatingHours?.weekdays?.split(" - ")[0] ||
                      "06:00 AM"}
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
                >
                  <span className="text-gray-700 font-medium">Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-yellow-700">
                      {venue.rating || 4.5}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Contact Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <PhoneCall className="h-4 w-4 text-green-500 mr-2" />
                  Contact Details
                </h4>
                <div className="space-y-3">
                  <motion.a
                    href={`tel:${
                      venue.phone || venue.contact?.phone || "+919876543210"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <PhoneCall className="h-4 w-4 text-green-600" />
                    <span className="text-green-800 font-medium">
                      {venue.phone || venue.contact?.phone || "+91 98765 43210"}
                    </span>
                  </motion.a>

                  {venue.contact?.email && (
                    <motion.a
                      href={`mailto:${venue.contact.email}`}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800 font-medium">
                        {venue.contact.email}
                      </span>
                    </motion.a>
                  )}
                </div>
              </div>

              {/* Policies Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-4 w-4 text-purple-500 mr-2" />
                  Venue Policies
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {venue.policies?.cancellation ||
                        venue.cancellationPolicy ||
                        "24 hours advance notice required for cancellation"}
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {venue.policies?.payment ||
                        "Full payment required at time of booking"}
                    </span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {venue.policies?.equipment ||
                        "Equipment rental available at additional cost"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Action Button */}
              {user?.role === "user" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const firstCourt = venue.courts?.[0];
                    if (firstCourt) handleBookNow(firstCourt);
                  }}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Quick Book</span>
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Booking Modal */}
      <AnimatePresence>
        {user?.role === "user" && showBookingModal && selectedCourt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/30"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Book {selectedCourt.name}
                </h3>
                <p className="text-gray-600">
                  Select your preferred date and time
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Select Date
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTimeSlot("");
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Select Time Slot
                  </label>
                  {isLoadingSlots ? (
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-3"></div>
                      <span className="text-gray-600">
                        Loading available slots...
                      </span>
                    </div>
                  ) : (
                    <motion.select
                      whileFocus={{ scale: 1.02 }}
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                          {slot.label || `${slot.startTime} - ${slot.endTime}`}{" "}
                          - ₹{slot.price}
                        </option>
                      ))}
                    </motion.select>
                  )}
                  {!isLoadingSlots &&
                    availableSlots.length === 0 &&
                    selectedDate && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-600 mt-2 p-3 bg-red-50 rounded-xl border border-red-200"
                      >
                        No available slots for this date. All slots may be
                        booked or venue is closed.
                      </motion.p>
                    )}
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200"
                >
                  <h4 className="font-bold text-gray-900 mb-3">
                    Booking Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Court:</span>
                      <span className="font-medium text-gray-900">
                        {selectedCourt.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sport:</span>
                      <span className="font-medium text-gray-900">
                        {selectedCourt.sport}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price per hour:</span>
                      <span className="font-bold text-green-600">
                        ₹{selectedCourt.pricePerHour}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="flex space-x-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedCourt(null);
                    setSelectedTimeSlot("");
                    setAvailableSlots([]);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBookingSubmit}
                  disabled={
                    !selectedDate || !selectedTimeSlot || isLoadingSlots
                  }
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg"
                >
                  {isLoadingSlots ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    "Proceed to Payment"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-sm w-full p-8 shadow-2xl border border-white/30"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Share Venue
                </h3>
                <p className="text-gray-600">
                  Share this amazing venue with friends
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors"
                >
                  <Facebook className="h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-xs text-blue-700 font-medium">
                    Facebook
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center p-4 bg-sky-50 rounded-2xl hover:bg-sky-100 transition-colors"
                >
                  <Twitter className="h-6 w-6 text-sky-600 mb-2" />
                  <span className="text-xs text-sky-700 font-medium">
                    Twitter
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center p-4 bg-pink-50 rounded-2xl hover:bg-pink-100 transition-colors"
                >
                  <Instagram className="h-6 w-6 text-pink-600 mb-2" />
                  <span className="text-xs text-pink-700 font-medium">
                    Instagram
                  </span>
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShareModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VenueDetails;
