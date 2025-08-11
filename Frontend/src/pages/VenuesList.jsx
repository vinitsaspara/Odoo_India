import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Search,
  Filter,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Wifi,
  Car,
  Coffee,
  Waves,
  Dumbbell,
  Heart,
  Snowflake,
  ShoppingBag,
  GraduationCap,
  Sandwich,
  Shield,
  Clock,
} from "lucide-react";
import Header from "../components/Header";
import VenueCard from "../components/VenueCard";
import { API_ENDPOINTS } from "../config/api.js";
import api, { handleApiError } from "../utils/api.js";
import { getSportPlaceholder } from "../utils/placeholderImages";

const VenuesList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Component state
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVenues, setTotalVenues] = useState(0);
  const venuesPerPage = 9;

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    sport: "All Sports",
    location: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    amenities: [],
  });

  // Initialize filters from URL params
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);

    setFilters({
      search: searchParams.get("search") || "",
      sport: searchParams.get("sport") || "All Sports",
      location: searchParams.get("location") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      rating: searchParams.get("rating") || "",
      amenities:
        searchParams.get("amenities")?.split(",").filter(Boolean) || [],
    });
  }, [searchParams]);

  // Static options
  const sportsOptions = [
    "All Sports",
    "Badminton",
    "Tennis",
    "Football",
    "Basketball",
    "Cricket",
    "Swimming",
    "Volleyball",
    "Table Tennis",
    "Squash",
  ];

  const amenitiesOptions = [
    { name: "WiFi", icon: Wifi },
    { name: "Parking", icon: Car },
    { name: "Cafeteria", icon: Coffee },
    { name: "Swimming Pool", icon: Waves },
    { name: "Gym", icon: Dumbbell },
    { name: "Spa", icon: Heart },
    { name: "AC Rooms", icon: Snowflake },
    { name: "Pro Shop", icon: ShoppingBag },
    { name: "Coaching", icon: GraduationCap },
    { name: "Refreshments", icon: Sandwich },
    { name: "First Aid", icon: Shield },
    { name: "Locker Room", icon: Clock },
  ];

  const locationOptions = [
    "All Locations",
    "Satellite",
    "Bopal",
    "Maninagar",
    "Prahlad Nagar",
    "Vastrapur",
    "Gota",
    "Thaltej",
    "Navrangpura",
  ];

  // Fetch venues with filters
  useEffect(() => {
    fetchVenues();
  }, [searchParams, currentPage]);

  // Update URL when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (
        value &&
        value !== "" &&
        value !== "All Sports" &&
        value !== "All Locations"
      ) {
        if (key === "amenities" && Array.isArray(value) && value.length > 0) {
          newSearchParams.set(key, value.join(","));
        } else if (key !== "amenities") {
          newSearchParams.set(key, value);
        }
      }
    });

    if (currentPage > 1) {
      newSearchParams.set("page", currentPage.toString());
    }

    setSearchParams(newSearchParams);
  }, [filters, currentPage, setSearchParams]);

  const fetchVenues = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Skip API call and use mock data directly
      console.log("Using mock data for venues");
      setVenues(generateMockVenues());
      setTotalVenues(24);
      setTotalPages(Math.ceil(24 / venuesPerPage));
    } catch (error) {
      console.error("Error generating mock venues:", error);
      setError("Failed to load venues");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock venues for fallback
  const generateMockVenues = () => {
    const allMockVenues = [];
    const venueNames = [
      "Elite Sports Arena",
      "Champions Court",
      "Victory Sports Zone",
      "Power Play Complex",
      "Athletic Excellence Hub",
      "Premium Sports Center",
      "Ultimate Game Zone",
      "Sports Paradise",
      "Fitness First Arena",
      "Play Zone Complex",
      "Active Life Center",
      "Game Time Sports",
      "Winners Sports Club",
      "Athletic Arena Pro",
      "Sports Complex Elite",
      "Champions Arena",
      "Victory Courts",
      "Premier Sports Hub",
      "Ultimate Athletic Center",
      "Elite Game Zone",
      "Sports Excellence",
      "Athletic Champions",
      "Victory Elite",
      "Premier Play Zone",
    ];

    const locations = [
      "Satellite, Ahmedabad",
      "Bopal, Ahmedabad",
      "Maninagar, Ahmedabad",
      "Prahlad Nagar, Ahmedabad",
      "Vastrapur, Ahmedabad",
      "Gota, Ahmedabad",
      "Thaltej, Ahmedabad",
      "Navrangpura, Ahmedabad",
    ];

    // Generate all venues first
    for (let i = 0; i < 24; i++) {
      const rating = parseFloat((3.8 + Math.random() * 1.2).toFixed(1));
      const minPrice = 400 + i * 50;
      const maxPrice = 800 + i * 100;

      allMockVenues.push({
        _id: `mock-${i + 1}`,
        name: venueNames[i] || `Sports Venue ${i + 1}`,
        location: {
          address: locations[i % locations.length],
          city: "Ahmedabad",
          state: "Gujarat",
        },
        images: [getSportPlaceholder(`Venue ${i + 1}`, 400, 250)],
        rating: rating,
        amenities: amenitiesOptions.slice(0, 3 + (i % 5)).map((a) => a.name),
        sportsTypes: sportsOptions.slice(1, 3 + (i % 3)),
        priceRange: {
          min: minPrice,
          max: maxPrice,
        },
        totalCourts: 3 + (i % 6),
        isActive: true,
        description: `Premium sports facility in ${
          locations[i % locations.length]
        } with modern amenities and professional courts.`,
      });
    }

    // Apply filters
    let filteredVenues = allMockVenues.filter((venue) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (
          !venue.name.toLowerCase().includes(searchTerm) &&
          !venue.location.address.toLowerCase().includes(searchTerm)
        ) {
          return false;
        }
      }

      // Sport filter
      if (filters.sport && filters.sport !== "All Sports") {
        if (!venue.sportsTypes.includes(filters.sport)) {
          return false;
        }
      }

      // Location filter
      if (filters.location && filters.location !== "All Locations") {
        if (!venue.location.address.includes(filters.location)) {
          return false;
        }
      }

      // Price range filter
      if (
        filters.minPrice &&
        venue.priceRange.min < parseInt(filters.minPrice)
      ) {
        return false;
      }
      if (
        filters.maxPrice &&
        venue.priceRange.max > parseInt(filters.maxPrice)
      ) {
        return false;
      }

      // Rating filter
      if (filters.rating && venue.rating < parseFloat(filters.rating)) {
        return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((amenity) =>
          venue.amenities.includes(amenity)
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });

    // Update total venues count
    setTotalVenues(filteredVenues.length);
    setTotalPages(Math.ceil(filteredVenues.length / venuesPerPage));

    // Return paginated results
    const startIndex = (currentPage - 1) * venuesPerPage;
    const endIndex = startIndex + venuesPerPage;
    return filteredVenues.slice(startIndex, endIndex);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleAmenityToggle = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      sport: "All Sports",
      location: "All Locations",
      minPrice: "",
      maxPrice: "",
      rating: "",
      amenities: [],
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const numbers = [];
    const showPages = 5;
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      numbers.push(i);
    }

    return numbers;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Venue
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover and book premium sports venues across the city
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search venues..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-lg border-0 focus:ring-4 focus:ring-white/30 text-lg"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white text-blue-600 px-6 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Panel */}
      {showFilters && (
        <section className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sport Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport
                </label>
                <select
                  value={filters.sport}
                  onChange={(e) => handleFilterChange("sport", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sportsOptions.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (₹/hr)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange("rating", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {amenitiesOptions.map((amenity) => {
                  const Icon = amenity.icon;
                  return (
                    <label
                      key={amenity.name}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity.name)}
                        onChange={() => handleAmenityToggle(amenity.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {amenity.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isLoading ? "Loading..." : `${totalVenues} Venues Found`}
              </h2>
              {!isLoading && (
                <p className="text-gray-600 mt-1">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>

            {/* Active Filters Display */}
            {Object.values(filters).some((value) =>
              Array.isArray(value)
                ? value.length > 0
                : value !== "" &&
                  value !== "All Sports" &&
                  value !== "All Locations"
            ) && (
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Search: {filters.search}
                  </span>
                )}
                {filters.sport && filters.sport !== "All Sports" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Sport: {filters.sport}
                  </span>
                )}
                {filters.location && filters.location !== "All Locations" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Location: {filters.location}
                  </span>
                )}
                {filters.amenities.length > 0 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    +{filters.amenities.length} amenities
                  </span>
                )}
              </div>
            )}
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
                    Showing sample venues instead.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(venuesPerPage)].map((_, index) => (
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
          ) : venues.length > 0 ? (
            <>
              {/* Venues Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {venues.map((venue) => (
                  <VenueCard key={venue._id} venue={venue} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {getPaginationNumbers().map((number) => (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`px-4 py-2 rounded-lg border ${
                        currentPage === number
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* No Results */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No venues found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VenuesList;
