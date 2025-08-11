import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ArrowRight,
  Filter,
  Star,
  Calendar,
  Users,
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
      // Try to fetch venues - this is usually a public endpoint
      const response = await api.get(API_ENDPOINTS.VENUES.LIST);

      if (response.data.success) {
        setVenues(response.data.venues);
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
        _id: "1",
        name: "Sports Complex Arena",
        location: { address: "Satellite, Ahmedabad, Gujarat" },
        images: [getSportPlaceholder("Sports Arena", 300, 200)],
        rating: 4.5,
        amenities: ["Parking", "Cafeteria", "Locker Room"],
        sportsTypes: ["Football", "Basketball", "Tennis"],
        priceRange: { min: 500, max: 1500 },
        totalCourts: 8,
      },
      {
        _id: "2",
        name: "Elite Sports Club",
        location: { address: "Bopal, Ahmedabad, Gujarat" },
        images: [getSportPlaceholder("Elite Club", 300, 200)],
        rating: 4.8,
        amenities: ["Swimming Pool", "Gym", "Spa"],
        sportsTypes: ["Swimming", "Tennis", "Badminton"],
        priceRange: { min: 800, max: 2000 },
        totalCourts: 12,
      },
      {
        _id: "3",
        name: "Community Sports Hub",
        location: { address: "Maninagar, Ahmedabad, Gujarat" },
        images: [getSportPlaceholder("Community Hub", 300, 200)],
        rating: 4.2,
        amenities: ["Parking", "Refreshments"],
        sportsTypes: ["Cricket", "Football"],
        priceRange: { min: 300, max: 800 },
        totalCourts: 6,
      },
      {
        _id: "4",
        name: "Premium Sports Center",
        location: { address: "Prahlad Nagar, Ahmedabad, Gujarat" },
        images: [getSportPlaceholder("Premium Center", 300, 200)],
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
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport =
      filterSport === "" || venue.sportsTypes.includes(filterSport);
    return matchesSearch && matchesSport;
  });

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            FIND PLAYERS & VENUES NEARBY
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Book sports venues, connect with players, and enjoy your favorite
            games in Ahmedabad and beyond
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search venues, sports, or locations..."
                  className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-lg border-0 focus:ring-4 focus:ring-white/30 text-lg"
                />
              </div>
              <select
                value={filterSport}
                onChange={(e) => setFilterSport(e.target.value)}
                className="px-4 py-4 text-gray-900 rounded-lg border-0 focus:ring-4 focus:ring-white/30 text-lg"
              >
                <option value="">All Sports</option>
                {sportsData.map((sport) => (
                  <option key={sport.name} value={sport.name}>
                    {sport.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                50+ Venues
              </h3>
              <p className="text-gray-600">
                Premium sports venues across the city
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                1000+ Players
              </h3>
              <p className="text-gray-600">
                Active community of sports enthusiasts
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                24/7 Booking
              </h3>
              <p className="text-gray-600">Book anytime, play anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Venues Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Book Venues
              </h2>
              <p className="text-gray-600">
                Discover the best sports venues in your area
              </p>
            </div>
            <button
              onClick={() => navigate("/venues")}
              className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              See all venues
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-800 text-sm">{error}</p>
                  <p className="text-red-600 text-xs mt-1">
                    Showing cached venues instead.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVenues.slice(0, 8).map((venue) => (
                <VenueCard key={venue._id} venue={venue} />
              ))}
            </div>
          )}

          {filteredVenues.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No venues found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterSport("");
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Popular Sports Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Sports
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose from a wide variety of sports and find the perfect venue
              for your game
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularSports.map((sport, index) => (
              <SportCard key={index} sport={sport} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Play?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of players who have already discovered their favorite
            venues through QuickCourt
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
                >
                  Login
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
