import React, { useState, useEffect } from "react";
import { IndianRupee, Calendar, BarChart3, Clock } from "lucide-react";

const VenueStatsCard = ({ venueId, onStatsUpdate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenueStats();
    // Set up polling to refresh stats every 30 seconds
    const interval = setInterval(fetchVenueStats, 30000);
    return () => clearInterval(interval);
  }, [venueId]);

  const fetchVenueStats = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/payments/venue-stats/${venueId}`
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
        if (onStatsUpdate) {
          onStatsUpdate(data.data);
        }

        // Update the earnings display in the venue header
        const earningsElement = document.getElementById(`earnings-${venueId}`);
        if (earningsElement && data.data.statistics) {
          earningsElement.textContent = formatCurrency(
            data.data.statistics.monthlyOwnerEarnings || 0
          );
        }
      }
    } catch (err) {
      console.error("Error fetching venue stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { statistics } = stats;

  return (
    <div className="relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="font-semibold text-blue-600">
            {statistics.totalBookings || 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="font-semibold text-green-600">
            {statistics.monthlyBookings || 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Monthly Earnings</p>
          <p className="font-semibold text-green-600">
            {formatCurrency(statistics.monthlyOwnerEarnings || 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Occupancy</p>
          <p className="font-semibold text-purple-600">
            {statistics.occupancyRate || 0}%
          </p>
        </div>
      </div>

      {/* Refresh indicator */}
      <div className="absolute top-2 right-2">
        <button
          onClick={fetchVenueStats}
          className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
          title="Refresh stats"
        >
          🔄
        </button>
      </div>

      {/* Live indicator */}
      <div className="absolute top-2 left-2">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600">Live</span>
        </div>
      </div>
    </div>
  );
};

export default VenueStatsCard;
