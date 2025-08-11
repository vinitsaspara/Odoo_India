import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Users,
  Wifi,
  Car,
  Coffee,
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  AlertCircle,
} from "lucide-react";
import api, { handleApiError } from "../utils/api";

const VenuesList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalVenues, setTotalVenues] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const venuesPerPage = 9;

  // Filters state
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    sport: searchParams.get("sport") || "All Sports",
    location: searchParams.get("location") || "All Locations",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    rating: searchParams.get("rating") || "",
    amenities: searchParams.get("amenities")?.split(",") || [],
  });

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Sports options
  const sportsOptions = [
    "All Sports",
    "Badminton",
    "Tennis",
    "Cricket", 
    "Football",
    "Basketball",
    "Table Tennis",
    "Squash",
    "Swimming",
    "Gym",
  ];

  // Location options
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

  // Amenities options
  const amenitiesOptions = [
    { name: "WiFi", icon: Wifi },
    { name: "Parking", icon: Car },
    { name: "Cafeteria", icon: Coffee },
    { name: "Changing Room", icon: Users },
    { name: "Security", icon: AlertCircle },
  ];

  // Fetch venues from API
  useEffect(() => {
    fetchVenues();
  }, [filters, currentPage]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "All Sports" && value !== "All Locations") {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(","));
        } else if (typeof value === "string" && value.trim()) {
          params.set(key, value);
        }
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const fetchVenues = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.sport && filters.sport !== "All Sports")
        params.append("sport", filters.sport);
      if (filters.location && filters.location !== "All Locations")
        params.append("city", filters.location);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.rating) params.append("minRating", filters.rating);
      if (filters.amenities.length > 0)
        params.append("amenities", filters.amenities.join(","));

      params.append("page", currentPage.toString());
      params.append("limit", venuesPerPage.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      params.append("status", "Active"); // Only show active venues

      // Make API call
      console.log("Fetching venues from API...");
      const response = await api.get(`/venues?${params.toString()}`);

      if (response.data.success) {
        setVenues(response.data.venues || []);
        setTotalVenues(response.data.pagination?.totalVenues || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
        console.log(`Found ${response.data.venues?.length || 0} venues`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch venues');
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
      setError("Unable to load venues. Please try again later.");
      setVenues([]);
      setTotalVenues(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
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
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      numbers.push(i);
    }
    return numbers;
  };

  const handleVenueClick = (venueId) => {
    navigate(`/venues/${venueId}`);
  };

  const getMinPrice = (courts) => {
    if (!courts || courts.length === 0) return 0;
    return Math.min(...courts.map(court => court.pricePerHour || 0));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Sports Venues</h1>
            <p className="mt-1 text-gray-600">
              Find and book your perfect sports venue
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    placeholder="Search venues..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Sport Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Type
                </label>
                <select
                  value={filters.sport}
                  onChange={(e) => handleFilterChange("sport", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sportsOptions.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (₹/hour)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange("rating", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="space-y-2">
                  {amenitiesOptions.map((amenity) => {
                    const IconComponent = amenity.icon;
                    return (
                      <label
                        key={amenity.name}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity.name)}
                          onChange={() => handleAmenityToggle(amenity.name)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <IconComponent className="h-4 w-4 ml-2 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {amenity.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isLoading ? "Loading..." : `${totalVenues} venues found`}
                </h2>
                {!isLoading && totalVenues > 0 && (
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * venuesPerPage + 1} -{" "}
                    {Math.min(currentPage * venuesPerPage, totalVenues)} of{" "}
                    {totalVenues} results
                  </p>
                )}
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <select
                  value={`${sortBy}_${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("_");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt_desc">Newest First</option>
                  <option value="createdAt_asc">Oldest First</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="rating_asc">Lowest Rated</option>
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(venuesPerPage)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && venues.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No venues found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Venues Grid */}
            {!isLoading && venues.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((venue) => (
                  <div
                    key={venue._id}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleVenueClick(venue._id)}
                  >
                    {/* Image */}
                    <div className="relative h-48">
                      <img
                        src={venue.coverImage?.url || venue.images?.[0]?.url || '/api/placeholder/400/250'}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {venue.name}
                        </h3>
                        {venue.rating > 0 && (
                          <div className="flex items-center text-sm">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-gray-600">
                              {venue.rating}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{venue.address || `${venue.city}, ${venue.state}`}</span>
                      </div>

                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{venue.sportTypes?.join(", ") || "Multiple Sports"}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            ₹{getMinPrice(venue.courts)}
                          </span>
                          <span className="text-gray-600 text-sm">/hour</span>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPaginationNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-lg ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenuesList;
