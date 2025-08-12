import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  ArrowRight,
  Filter,
  Star,
  Calendar,
  Users,
  Zap,
  Crown,
  Trophy,
  Play,
  Shield,
  Heart,
  Sparkles,
  Target,
  Rocket,
  Globe,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  ChevronRight,
  Grid3X3,
  SlidersHorizontal,
  Compass,
  Activity,
  Building2,
  DollarSign,
  Wifi,
  Car,
  Coffee,
  ChevronDown,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import VenueCard from "../components/VenueCard";
import SportCard from "../components/SportCard";
import api, { handleApiError } from "../utils/api.js";
import { API_ENDPOINTS } from "../config/api.js";
import { getSportPlaceholder } from "../utils/placeholderImages.js";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State for venues and sports
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [popularSports, setPopularSports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All Prices");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter options
  const sportsOptions = [
    "All Sports",
    "Football",
    "Basketball",
    "Tennis",
    "Badminton",
    "Cricket",
    "Swimming",
    "Volleyball",
    "Table Tennis",
  ];
  const locationOptions = [
    "All Locations",
    "Ahmedabad",
    "Satellite",
    "Bopal",
    "Maninagar",
    "Prahlad Nagar",
    "SG Highway",
  ];
  const priceRanges = [
    "All Prices",
    "₹0-500",
    "₹500-1000",
    "₹1000-1500",
    "₹1500-2000",
    "₹2000+",
  ];
  const amenityOptions = [
    "Parking",
    "WiFi",
    "Cafeteria",
    "Locker Room",
    "AC",
    "Shower",
    "Equipment Rental",
  ];

  // Mock data for popular sports with proper placeholder images
  const sportsData = [
    {
      name: "Football",
      image: getSportPlaceholder("Football", 200, 150),
      venues: 45,
    },
    {
      name: "Basketball",
      image: getSportPlaceholder("Basketball", 200, 150),
      venues: 32,
    },
    {
      name: "Tennis",
      image: getSportPlaceholder("Tennis", 200, 150),
      venues: 28,
    },
    {
      name: "Badminton",
      image: getSportPlaceholder("Badminton", 200, 150),
      venues: 56,
    },
    {
      name: "Cricket",
      image: getSportPlaceholder("Cricket", 200, 150),
      venues: 23,
    },
    {
      name: "Swimming",
      image: getSportPlaceholder("Swimming", 200, 150),
      venues: 18,
    },
  ];

  // Fetch venues from API
  useEffect(() => {
    fetchVenues();
    setPopularSports(sportsData);
  }, []);

  // Filter venues when filters change
  useEffect(() => {
    applyFilters();
  }, [
    venues,
    searchQuery,
    selectedSport,
    selectedLocation,
    selectedPriceRange,
    selectedAmenities,
  ]);

  const fetchVenues = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}${
          API_ENDPOINTS.VENUES.LIST
        }`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (data.success && Array.isArray(data.venues)) {
        const validVenues = data.venues.filter(
          (venue) => venue && venue._id && venue.name && venue.location
        );
        setVenues(validVenues);
      } else {
        throw new Error("Failed to fetch venues");
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
      setVenues(generateMockVenues());
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to venues
  const applyFilters = () => {
    let filtered = [...venues];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (venue) =>
          venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          venue.location?.address
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Sport filter
    if (selectedSport !== "All Sports") {
      filtered = filtered.filter((venue) =>
        venue.sportsTypes?.includes(selectedSport)
      );
    }

    // Location filter
    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter((venue) =>
        venue.location?.address
          ?.toLowerCase()
          .includes(selectedLocation.toLowerCase())
      );
    }

    // Price range filter
    if (selectedPriceRange !== "All Prices") {
      const [min, max] = getPriceRange(selectedPriceRange);
      filtered = filtered.filter((venue) => {
        if (!venue.courts || venue.courts.length === 0) return false;
        const prices = venue.courts.map((court) => court.pricePerHour || 0);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        return avgPrice >= min && (max === Infinity || avgPrice <= max);
      });
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((venue) =>
        selectedAmenities.every((amenity) => venue.amenities?.includes(amenity))
      );
    }

    setFilteredVenues(filtered);
  };

  const getPriceRange = (range) => {
    switch (range) {
      case "₹0-500":
        return [0, 500];
      case "₹500-1000":
        return [500, 1000];
      case "₹1000-1500":
        return [1000, 1500];
      case "₹1500-2000":
        return [1500, 2000];
      case "₹2000+":
        return [2000, Infinity];
      default:
        return [0, Infinity];
    }
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSport("All Sports");
    setSelectedLocation("All Locations");
    setSelectedPriceRange("All Prices");
    setSelectedAmenities([]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      `/venues?search=${encodeURIComponent(
        searchQuery
      )}&sport=${encodeURIComponent(
        selectedSport
      )}&location=${encodeURIComponent(selectedLocation)}`
    );
  };

  // Generate mock venues for demonstration
  const generateMockVenues = () => {
    return [
      {
        _id: "mock-1",
        name: "Sports Complex Arena",
        location: { address: "Satellite, Ahmedabad, Gujarat" },
        coverImage: { url: getSportPlaceholder("Sports Arena", 300, 200) },
        images: [
          { url: getSportPlaceholder("Sports Arena Court 1", 300, 200) },
          { url: getSportPlaceholder("Sports Arena Court 2", 300, 200) },
        ],
        rating: 4.5,
        amenities: ["Parking", "Cafeteria", "Locker Room", "AC"],
        sportsTypes: ["Football", "Basketball", "Tennis"],
        priceRange: { min: 500, max: 1500 },
        totalCourts: 8,
        courts: [{ pricePerHour: 800 }, { pricePerHour: 1200 }],
      },
      {
        _id: "mock-2",
        name: "Elite Sports Club",
        location: { address: "Bopal, Ahmedabad, Gujarat" },
        coverImage: { url: getSportPlaceholder("Elite Club", 300, 200) },
        images: [
          { url: getSportPlaceholder("Elite Club Pool", 300, 200) },
          { url: getSportPlaceholder("Elite Club Court", 300, 200) },
        ],
        rating: 4.8,
        amenities: ["Swimming Pool", "WiFi", "Spa", "Parking"],
        sportsTypes: ["Swimming", "Tennis", "Badminton"],
        priceRange: { min: 800, max: 2000 },
        totalCourts: 12,
        courts: [{ pricePerHour: 1500 }, { pricePerHour: 1800 }],
      },
      {
        _id: "mock-3",
        name: "Community Sports Hub",
        location: { address: "Maninagar, Ahmedabad, Gujarat" },
        coverImage: { url: getSportPlaceholder("Community Hub", 300, 200) },
        images: [{ url: getSportPlaceholder("Community Hub Field", 300, 200) }],
        rating: 4.2,
        amenities: ["Parking", "Cafeteria"],
        sportsTypes: ["Cricket", "Football"],
        priceRange: { min: 300, max: 800 },
        totalCourts: 6,
        courts: [{ pricePerHour: 400 }, { pricePerHour: 600 }],
      },
      {
        _id: "mock-4",
        name: "Premium Sports Center",
        location: { address: "Prahlad Nagar, Ahmedabad, Gujarat" },
        coverImage: { url: getSportPlaceholder("Premium Center", 300, 200) },
        images: [
          { url: getSportPlaceholder("Premium Center Court 1", 300, 200) },
          { url: getSportPlaceholder("Premium Center Court 2", 300, 200) },
          { url: getSportPlaceholder("Premium Center Lounge", 300, 200) },
        ],
        rating: 4.7,
        amenities: ["AC", "WiFi", "Equipment Rental", "Locker Room"],
        sportsTypes: ["Badminton", "Table Tennis", "Volleyball"],
        priceRange: { min: 600, max: 1800 },
        totalCourts: 10,
        courts: [{ pricePerHour: 1000 }, { pricePerHour: 1400 }],
      },
      {
        _id: "mock-5",
        name: "Urban Sports Complex",
        location: { address: "SG Highway, Ahmedabad, Gujarat" },
        coverImage: { url: getSportPlaceholder("Urban Complex", 300, 200) },
        images: [{ url: getSportPlaceholder("Urban Complex Court", 300, 200) }],
        rating: 4.4,
        amenities: ["Parking", "WiFi", "Shower", "Cafeteria"],
        sportsTypes: ["Basketball", "Volleyball", "Tennis"],
        priceRange: { min: 700, max: 1600 },
        totalCourts: 14,
        courts: [{ pricePerHour: 900 }, { pricePerHour: 1300 }],
      },
      {
        _id: "mock-6",
        name: "Sports Paradise",
        location: { address: "Satellite, Ahmedabad, Gujarat" },
        coverImage: { url: getSportPlaceholder("Sports Paradise", 300, 200) },
        images: [{ url: getSportPlaceholder("Paradise Pool", 300, 200) }],
        rating: 4.6,
        amenities: ["Swimming Pool", "AC", "Locker Room", "Parking"],
        sportsTypes: ["Swimming", "Water Polo"],
        priceRange: { min: 1000, max: 2500 },
        totalCourts: 4,
        courts: [{ pricePerHour: 1800 }, { pricePerHour: 2200 }],
      },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header Section */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"></div>
        <div className="relative container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg"
            >
              <Rocket className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              QuickCourt
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Your gateway to premium sports venues. Book instantly, play
              passionately, connect with champions.
            </p>

            {/* Professional Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 max-w-3xl mx-auto"
            >
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Main Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search venues, sports, or locations..."
                    className="w-full pl-12 pr-4 py-4 text-slate-700 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/90"
                  />
                </div>

                {/* Quick Filters Row */}
                <div className="flex flex-wrap gap-3 items-center justify-center">
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white/90 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    {sportsOptions.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white/90 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    {locationOptions.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowFilters(!showFilters)}
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 bg-white/90 border border-gray-200 rounded-lg text-slate-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>More Filters</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  >
                    <Search className="w-4 h-4 mr-2 inline" />
                    Search
                  </motion.button>
                </div>

                {/* Advanced Filters Panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Price Range */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Price Range
                          </label>
                          <select
                            value={selectedPriceRange}
                            onChange={(e) =>
                              setSelectedPriceRange(e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
                          >
                            {priceRanges.map((range) => (
                              <option key={range} value={range}>
                                {range}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Amenities */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Amenities
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {amenityOptions.map((amenity) => (
                              <motion.button
                                key={amenity}
                                type="button"
                                onClick={() => toggleAmenity(amenity)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                  selectedAmenities.includes(amenity)
                                    ? "bg-blue-500 text-white"
                                    : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                {amenity}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          className="text-sm text-slate-500 hover:text-slate-700 flex items-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Clear All</span>
                        </button>
                        <span className="text-sm text-slate-500">
                          {filteredVenues.length} venues found
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* All Venues Section - Professional Display */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/50">
              <Building2 className="h-6 w-6 text-blue-600" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                All Venues
              </h2>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                {filteredVenues.length} Available
              </span>
            </div>
            <p className="text-slate-600 mt-4 text-lg">
              Discover premium sports venues tailored to your needs
            </p>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-slate-600 font-medium">
                  Loading amazing venues...
                </span>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl shadow-lg max-w-2xl mx-auto"
            >
              <div className="flex items-center text-red-800">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="font-medium">{error}</p>
                  <p className="text-red-600 text-sm mt-1">
                    Showing demo venues instead.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Venues Grid */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {filteredVenues.map((venue, index) => (
                  <motion.div
                    key={venue._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group"
                  >
                    <VenueCard venue={venue} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && filteredVenues.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-white/50 max-w-md mx-auto">
                <Compass className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  No venues found
                </h3>
                <p className="text-slate-600 mb-6">
                  Try adjusting your search filters or explore different
                  locations.
                </p>
                <motion.button
                  onClick={clearAllFilters}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Clear Filters
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* View All Button */}
          {!isLoading && filteredVenues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-12"
            >
              <motion.button
                onClick={() => navigate("/venues")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-4 rounded-2xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-400/30"
              >
                <Grid3X3 className="w-5 h-5 mr-2 inline" />
                View All Venues
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Popular Sports Section */}
      <section className="py-16 px-6 bg-white/50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/50">
              <Trophy className="h-6 w-6 text-purple-600" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Popular Sports
              </h2>
            </div>
            <p className="text-slate-600 mt-4 text-lg">
              Choose from a variety of sports and find your perfect game
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {popularSports.map((sport, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                onClick={() => {
                  setSelectedSport(sport.name);
                  applyFilters();
                }}
                className="group cursor-pointer"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="w-16 h-16 mx-auto mb-4 rounded-xl object-cover"
                  />
                  <h3 className="font-bold text-slate-800 text-sm mb-1">
                    {sport.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {sport.venues} venues
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose QuickCourt Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/50">
              <Sparkles className="h-6 w-6 text-green-600" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Why Choose QuickCourt?
              </h2>
            </div>
            <p className="text-slate-600 mt-4 text-lg">
              Experience the future of sports venue booking
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Instant Booking",
                desc: "Book courts in seconds with real-time availability",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "Protected transactions with multiple payment options",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                desc: "Round-the-clock customer service and assistance",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Award,
                title: "Premium Quality",
                desc: "Carefully curated top-tier sports facilities",
                color: "from-purple-500 to-pink-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 text-center group hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Continue Playing Button */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white shadow-2xl"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Play?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of athletes who've discovered their perfect
                venues through QuickCourt
              </p>

              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={() => navigate("/signup")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <Heart className="w-5 h-5 mr-2 inline" />
                    Start Your Journey
                  </motion.button>
                  <motion.button
                    onClick={() => navigate("/login")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/30 hover:bg-white/30 transition-all duration-200"
                  >
                    <Play className="w-5 h-5 mr-2 inline" />
                    Sign In
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => navigate("/venues")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-600 px-12 py-4 rounded-xl font-bold shadow-lg hover:bg-gray-50 transition-all duration-200 text-lg"
                >
                  <Play className="w-6 h-6 mr-3 inline" />
                  Continue Playing
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
