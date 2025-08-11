import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  Plus,
  Edit,
  Eye,
  Settings,
  BarChart3,
  Building2,
  Clock,
  Star,
  Filter,
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import api, { handleApiError } from "../utils/api";
import { getSportPlaceholder } from "../utils/placeholderImages";

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState({});
  const [venues, setVenues] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("this_month");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const timeRangeOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "this_year", label: "This Year" },
  ];

  const statusOptions = ["All", "Active", "Inactive", "Under Maintenance"];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching owner dashboard data from API...");

      // Try to fetch real data from API
      const [kpisResponse, venuesResponse, bookingsResponse] =
        await Promise.allSettled([
          api.get(`/owner/kpis?timeRange=${selectedTimeRange}`),
          api.get("/owner/venues"),
          api.get("/owner/bookings/recent"),
        ]);

      // Check if API calls were successful
      if (
        kpisResponse.status === "fulfilled" &&
        venuesResponse.status === "fulfilled" &&
        bookingsResponse.status === "fulfilled"
      ) {
        console.log("Dashboard data fetched successfully from API");
        setKpis(kpisResponse.value.data);
        setVenues(venuesResponse.value.data.venues || []);
        setRecentBookings(bookingsResponse.value.data.bookings || []);
      } else {
        throw new Error("One or more API calls failed");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data from API:", error);
      console.log("Falling back to mock data...");

      // Fallback to mock data
      const mockData = generateMockDashboardData();
      setKpis(mockData.kpis);
      setVenues(mockData.venues);
      setRecentBookings(mockData.recentBookings);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockDashboardData = () => {
    // Generate KPIs based on selected time range
    const getKPIMultiplier = () => {
      switch (selectedTimeRange) {
        case "today":
          return 0.1;
        case "this_week":
          return 0.3;
        case "this_month":
          return 1;
        case "last_month":
          return 0.9;
        case "this_year":
          return 12;
        default:
          return 1;
      }
    };

    const multiplier = getKPIMultiplier();
    const baseBookings = 156;
    const baseEarnings = 45600;
    const baseOccupancy = 72;
    const baseRevenue = 52800;

    const kpis = {
      totalBookings: Math.floor(baseBookings * multiplier),
      totalEarnings: Math.floor(baseEarnings * multiplier),
      occupancyRate: Math.min(
        95,
        Math.floor(baseOccupancy + (Math.random() * 20 - 10))
      ),
      totalRevenue: Math.floor(baseRevenue * multiplier),
      bookingsGrowth: parseFloat((Math.random() * 30 - 5).toFixed(1)),
      earningsGrowth: parseFloat((Math.random() * 25 - 3).toFixed(1)),
      occupancyGrowth: parseFloat((Math.random() * 15 - 5).toFixed(1)),
      revenueGrowth: parseFloat((Math.random() * 28 - 4).toFixed(1)),
    };

    // Generate owned venues
    const venues = [
      {
        _id: "venue-owner-1",
        name: "Elite Sports Arena",
        location: {
          address: "Satellite, Ahmedabad",
          city: "Ahmedabad",
          state: "Gujarat",
        },
        images: [getSportPlaceholder("Elite Sports Arena", 400, 250)],
        totalCourts: 6,
        activeCourts: 5,
        status: "Active",
        rating: 4.5,
        totalReviews: 128,
        monthlyEarnings: 18500,
        monthlyBookings: 89,
        occupancyRate: 78,
        sportsTypes: ["Badminton", "Tennis", "Table Tennis"],
        amenities: ["Parking", "WiFi", "Cafeteria", "Security"],
        createdAt: "2024-01-15",
        lastUpdated: "2025-08-10",
      },
      {
        _id: "venue-owner-2",
        name: "Champions Court Complex",
        location: {
          address: "Bopal, Ahmedabad",
          city: "Ahmedabad",
          state: "Gujarat",
        },
        images: [getSportPlaceholder("Champions Court Complex", 400, 250)],
        totalCourts: 4,
        activeCourts: 4,
        status: "Active",
        rating: 4.2,
        totalReviews: 76,
        monthlyEarnings: 14200,
        monthlyBookings: 67,
        occupancyRate: 72,
        sportsTypes: ["Badminton", "Squash"],
        amenities: ["Parking", "WiFi", "Changing Room"],
        createdAt: "2024-03-22",
        lastUpdated: "2025-08-09",
      },
      {
        _id: "venue-owner-3",
        name: "Victory Sports Zone",
        location: {
          address: "Prahlad Nagar, Ahmedabad",
          city: "Ahmedabad",
          state: "Gujarat",
        },
        images: [getSportPlaceholder("Victory Sports Zone", 400, 250)],
        totalCourts: 3,
        activeCourts: 2,
        status: "Under Maintenance",
        rating: 4.0,
        totalReviews: 45,
        monthlyEarnings: 8900,
        monthlyBookings: 34,
        occupancyRate: 45,
        sportsTypes: ["Tennis", "Basketball"],
        amenities: ["Parking", "Security"],
        createdAt: "2024-06-10",
        lastUpdated: "2025-08-05",
      },
    ];

    // Generate recent bookings
    const recentBookings = [];
    const customerNames = [
      "Rahul Sharma",
      "Priya Patel",
      "Amit Kumar",
      "Sneha Singh",
      "Rohan Mehta",
    ];
    const sports = ["Badminton", "Tennis", "Table Tennis", "Squash"];

    for (let i = 0; i < 10; i++) {
      const venueIndex = i % venues.length;
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 7));

      recentBookings.push({
        _id: `booking-owner-${i + 1}`,
        bookingId: `BK${String(i + 1001).padStart(4, "0")}`,
        customer: {
          name: customerNames[i % customerNames.length],
          phone:` +91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        },
        venue: venues[venueIndex],
        court: {
          name: `Court ${(i % 4) + 1} - ${sports[i % sports.length]}`,
          sport: sports[i % sports.length],
        },
        date: randomDate.toISOString().split("T")[0],
        timeSlot: `${(9 + (i % 12)).toString().padStart(2, "0")}:00 - ${(
          10 +
          (i % 12)
        )
          .toString()
          .padStart(2, "0")}:00`,
        amount: 450 + i * 25,
        status: i % 8 === 0 ? "Cancelled" : "Confirmed",
        paymentStatus: "Paid",
        bookingDate: new Date(
          randomDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    return { kpis, venues, recentBookings };
  };

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || venue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddVenue = () => {
    navigate("/owner/venues/add");
  };

  const handleEditVenue = (venueId) => {
    navigate(`/owner/venues/edit/${venueId}`);
  };

  const handleViewVenue = (venueId) => {
    navigate(`/venues/${venueId}`);
  };

  const handleManageCourts = (venueId) => {
    navigate(`/owner/venues/${venueId}/courts`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">
                Owner Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your venues and track performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchDashboardData}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {kpis.totalBookings}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getGrowthIcon(kpis.bookingsGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(
                  kpis.bookingsGrowth
                )}`}
              >
                {kpis.bookingsGrowth > 0 ? "+" : ""}
                {kpis.bookingsGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(kpis.totalEarnings)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getGrowthIcon(kpis.earningsGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(
                  kpis.earningsGrowth
                )}`}
              >
                {kpis.earningsGrowth > 0 ? "+" : ""}
                {kpis.earningsGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Occupancy Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {kpis.occupancyRate}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getGrowthIcon(kpis.occupancyGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(
                  kpis.occupancyGrowth
                )}`}
              >
                {kpis.occupancyGrowth > 0 ? "+" : ""}
                {kpis.occupancyGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(kpis.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {getGrowthIcon(kpis.revenueGrowth)}
              <span
                className={`text-sm font-medium ml-1 ${getGrowthColor(
                  kpis.revenueGrowth
                )}`}
              >
                {kpis.revenueGrowth > 0 ? "+" : ""}
                {kpis.revenueGrowth}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Owned Venues */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Venues
                  </h2>
                  <button
                    onClick={handleAddVenue}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Venue</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search venues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredVenues.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No venues found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== "All"
                        ? "Try adjusting your filters."
                        : "Start by adding your first venue."}
                    </p>
                    <button
                      onClick={handleAddVenue}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Add Your First Venue
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredVenues.map((venue) => (
                      <div
                        key={venue._id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <img
                              src={venue.images[0]}
                              alt={venue.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {venue.name}
                              </h3>
                              <div className="flex items-center text-gray-600 text-sm mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{venue.location.address}</span>
                              </div>
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                  <span className="text-sm text-gray-600">
                                    {venue.rating} ({venue.totalReviews})
                                  </span>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    venue.status === "Active"
                                      ? "bg-green-100 text-green-800"
                                      : venue.status === "Inactive"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {venue.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-semibold text-green-600">
                              {formatCurrency(venue.monthlyEarnings)}
                            </p>
                            <p className="text-sm text-gray-600">This month</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Courts</p>
                            <p className="font-semibold">
                              {venue.activeCourts}/{venue.totalCourts}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Bookings</p>
                            <p className="font-semibold">
                              {venue.monthlyBookings}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Occupancy</p>
                            <p className="font-semibold">
                              {venue.occupancyRate}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Sports</p>
                            <p className="font-semibold">
                              {venue.sportsTypes.length}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => handleViewVenue(venue._id)}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleEditVenue(venue._id)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 text-sm"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleManageCourts(venue._id)}
                            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Courts</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Bookings
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentBookings.slice(0, 8).map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {booking.customer.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {booking.venue.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.court.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 text-sm">
                        {formatCurrency(booking.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;