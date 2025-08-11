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
  const [popularSports, setPopularSports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [error, setError] = useState("");

  // Mock data for popular sports with proper placeholder images
  const sportsData = [
    {
      name: "Football",
      image: getSportPlaceholder("Football", 200, 150),
    },
    {
      name: "Basketball",
      image: getSportPlaceholder("Basketball", 200, 150),
    },
    {
      name: "Tennis",
      image: getSportPlaceholder("Tennis", 200, 150),
    },
    {
      name: "Badminton",
      image: getSportPlaceholder("Badminton", 200, 150),
    },
    {
      name: "Cricket",
      image: getSportPlaceholder("Cricket", 200, 150),
    },
    {
      name: "Swimming",
      image: getSportPlaceholder("Swimming", 200, 150),
    },
  ];

  // Fetch venues from API
  useEffect(() => {
    fetchVenues();
    setPopularSports(sportsData);
  }, []);

  const fetchVenues = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Try to fetch venues - this is a public endpoint
      // Make the call without any auth headers to avoid auth issues
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}${
          API_ENDPOINTS.VENUES.LIST
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success && Array.isArray(data.venues)) {
        // Ensure venues have proper structure
        const validVenues = data.venues.filter(
          (venue) => venue && venue._id && venue.name && venue.location
        );
        setVenues(validVenues);
      } else {
        throw new Error("Failed to fetch venues");
      }
    } catch (error) {
      console.error("Error fetching venues:", error);

      // Handle the error appropriately
      const errorMessage = handleApiError(error, setError);

      // Fallback to mock data if API fails
      console.log("Using mock data as fallback");
      setVenues(generateMockVenues());
    } finally {
      setIsLoading(false);
    }
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
        amenities: ["Parking", "Cafeteria", "Locker Room"],
        sportsTypes: ["Football", "Basketball", "Tennis"],
        priceRange: { min: 500, max: 1500 },
        totalCourts: 8,
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
        amenities: ["Swimming Pool", "Gym", "Spa"],
        sportsTypes: ["Swimming", "Tennis", "Badminton"],
        priceRange: { min: 800, max: 2000 },
        totalCourts: 12,
      },
      {
        _id: "mock-3",
        name: "Community Sports Hub",
        location: { address: "Maninagar, Ahmedabad, Gujarat" },
        coverImage: { url: getSportPlaceholder("Community Hub", 300, 200) },
        images: [{ url: getSportPlaceholder("Community Hub Field", 300, 200) }],
        rating: 4.2,
        amenities: ["Parking", "Refreshments"],
        sportsTypes: ["Cricket", "Football"],
        priceRange: { min: 300, max: 800 },
        totalCourts: 6,
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
        amenities: ["AC Rooms", "Pro Shop", "Coaching"],
        sportsTypes: ["Badminton", "Table Tennis", "Squash"],
        priceRange: { min: 600, max: 1800 },
        totalCourts: 10,
      },
    ];
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Build search parameters
    const searchParams = new URLSearchParams();

    if (searchQuery.trim()) {
      searchParams.set("search", searchQuery.trim());
    }

    if (filterSport && filterSport !== "") {
      searchParams.set("sport", filterSport);
    }

    if (filterLocation.trim()) {
      searchParams.set("location", filterLocation.trim());
    }

    // Navigate to venues page with search parameters
    const searchString = searchParams.toString();
    if (searchString) {
      navigate(`/venues?${searchString}`);
    } else {
      navigate("/venues");
    }
  };

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location?.address
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesSport =
      filterSport === "" || venue.sportsTypes?.includes(filterSport);
    const matchesLocation =
      filterLocation === "" ||
      venue.location?.address
        ?.toLowerCase()
        .includes(filterLocation.toLowerCase()) ||
      venue.location?.city
        ?.toLowerCase()
        .includes(filterLocation.toLowerCase()) ||
      venue.location?.area
        ?.toLowerCase()
        .includes(filterLocation.toLowerCase());
    return matchesSearch && matchesSport && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-white relative overflow-hidden pt-16">
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 bg-white">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Main Hero Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/30 mb-12"
          >
            {/* Hero Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-8 shadow-lg"
            >
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>

            {/* Hero Text */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight"
            >
              QuickCourt
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Your gateway to premium sports venues. Book instantly, play
              passionately, connect with champions.
            </motion.p>

            {/* Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40">
                <form onSubmit={handleSearch} className="flex flex-col gap-4">
                  {/* First Row - Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search venues, sports, or activities..."
                      className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    />
                  </div>

                  {/* Second Row - Filters and Search Button */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        placeholder="Enter location (e.g., Ahmedabad, Satellite)"
                        className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                      />
                    </div>
                    <select
                      value={filterSport}
                      onChange={(e) => setFilterSport(e.target.value)}
                      className="px-4 py-4 text-gray-900 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white md:min-w-[180px]"
                    >
                      <option value="">All Sports</option>
                      {sportsData.map((sport) => (
                        <option key={sport.name} value={sport.name}>
                          {sport.name}
                        </option>
                      ))}
                    </select>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg md:min-w-[140px]"
                    >
                      <Zap className="w-5 h-5 mr-2 inline" />
                      Search
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Quick Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {!isAuthenticated ? (
                <>
                  <motion.button
                    onClick={() => navigate("/signup")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <Zap className="w-5 h-5 mr-2 inline" />
                    Get Started
                  </motion.button>
                  <motion.button
                    onClick={() => navigate("/login")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/95 backdrop-blur-sm text-blue-600 px-8 py-4 rounded-xl font-semibold border border-blue-200 hover:bg-white transition-all duration-200 shadow-lg"
                  >
                    <ArrowRight className="w-5 h-5 mr-2 inline" />
                    Sign In
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={() => {
                    if (user?.role === "admin") navigate("/admin/dashboard");
                    else if (user?.role === "owner")
                      navigate("/owner/dashboard");
                    else navigate("/dashboard");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200"
                >
                  <Target className="w-5 h-5 mr-2 inline" />
                  Go to Dashboard
                </motion.button>
              )}
            </motion.div>
          </motion.div>

          {/* Stats Cards */}
        </div>
      </section>

      {/* Role-specific Welcome Sections */}
      {isAuthenticated && user?.role === "owner" && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-8 text-white text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h2 className="text-3xl font-bold mb-4">
                  Welcome back, {user.name}! 👑
                </h2>
                <p className="text-xl mb-6 text-purple-100">
                  Manage your empire of venues and track your success
                </p>
                <motion.button
                  onClick={() => navigate("/owner/dashboard")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg"
                >
                  <TrendingUp className="w-5 h-5 mr-2 inline" />
                  Owner Dashboard
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {isAuthenticated && user?.role === "admin" && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <Shield className="w-16 h-16 mx-auto mb-4 text-blue-300" />
                <h2 className="text-3xl font-bold mb-4">
                  Welcome back, Admin {user.name}! ⚡
                </h2>
                <p className="text-xl mb-6 text-indigo-100">
                  Command center for platform operations and insights
                </p>
                <motion.button
                  onClick={() => navigate("/admin/dashboard")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg"
                >
                  <Globe className="w-5 h-5 mr-2 inline" />
                  Admin Dashboard
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Book Venues Section - Only for players/users */}
      {(!isAuthenticated || user?.role === "user") && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 inline-block">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Featured Venues
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl">
                  Discover premium sports venues near you
                </p>
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
                  <div className="w-5 h-5 text-red-500 mr-3">⚠️</div>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredVenues.slice(0, 8).map((venue, index) => (
                <motion.div
                  key={venue._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <VenueCard venue={venue} />
                </motion.div>
              ))}
            </motion.div>

            {/* View All Button */}
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
                View All Venues
              </motion.button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Popular Sports Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 inline-block">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Popular Sports
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl">
                Choose from a variety of sports and find your perfect game
              </p>
            </div>
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
                className="group"
              >
                <SportCard sport={sport} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 inline-block">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Why Choose QuickCourt?
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl">
                Experience the future of sports venue booking
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Instant Booking",
                desc: "Book in seconds",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "Protected transactions",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                desc: "Always here to help",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Award,
                title: "Premium Quality",
                desc: "Top-tier facilities",
                color: "from-purple-500 to-pink-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 text-center group"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden"
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
                  onClick={() => {
                    if (user?.role === "admin") navigate("/admin/dashboard");
                    else if (user?.role === "owner")
                      navigate("/owner/dashboard");
                    else navigate("/dashboard");
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <Target className="w-5 h-5 mr-2 inline" />
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
