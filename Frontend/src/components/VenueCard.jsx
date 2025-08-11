import { Star, MapPin, Users, Calendar, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getVenuePlaceholder,
  handleImageError,
} from "../utils/placeholderImages.js";

const VenueCard = ({ venue }) => {
  const navigate = useNavigate();

  const {
    _id,
    name,
    location,
    images = [],
    rating = 0,
    totalReviews = 0,
    amenities = [],
    sportsTypes = [],
    priceRange,
    totalCourts = 0,
    isActive = true,
    operatingHours,
  } = venue;

  const handleViewDetails = () => {
    navigate(`/venues/${_id}`);
  };

  // Format price display
  const formatPrice = () => {
    if (!priceRange) return "Price on request";

    if (priceRange.min === priceRange.max) {
      return `₹${priceRange.min}/hr`;
    }

    return `₹${priceRange.min} - ₹${priceRange.max}/hr`;
  };

  // Get status color
  const getStatusColor = () => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  // Get rating display
  const getRatingDisplay = () => {
    if (rating > 0) {
      return totalReviews > 0
        ? `${rating.toFixed(1)} (${totalReviews})`
        : rating.toFixed(1);
    }
    return "New";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100">
      {/* Image */}
      <div
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={handleViewDetails}
      >
        <img
          src={images[0] || getVenuePlaceholder(name, 400, 250)}
          alt={name || "Venue"}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          onError={(e) => handleImageError(e, `${name || "Venue"} Image`)}
          loading="lazy"
        />

        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
          >
            {isActive ? "Open" : "Closed"}
          </span>
        </div>

        {/* Courts Count */}
        <div className="absolute top-3 right-3">
          <span className="bg-white bg-opacity-95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800 shadow-sm">
            {totalCourts} Courts
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3">
          <div className="flex items-center space-x-1 bg-white bg-opacity-95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-xs font-semibold text-gray-800">
              {getRatingDisplay()}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <div className="mb-3">
          <h3
            className="text-xl font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={handleViewDetails}
          >
            {name}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 mt-1">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="text-sm line-clamp-1">
              {location?.address || location}
            </span>
          </div>
        </div>

        {/* Sports Types */}
        {sportsTypes && sportsTypes.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {sportsTypes.slice(0, 3).map((sport, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {sport}
                </span>
              ))}
              {sportsTypes.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                  +{sportsTypes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Operating Hours */}
        {operatingHours && (
          <div className="flex items-center text-gray-600 mb-3">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {typeof operatingHours === "string"
                ? operatingHours
                : operatingHours.weekdays || "Check hours"}
            </span>
          </div>
        )}

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className="flex items-center text-gray-600 mb-4">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {amenities.slice(0, 2).join(", ")}
              {amenities.length > 2 && ` +${amenities.length - 2} more`}
            </span>
          </div>
        )}

        {/* Price Range */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
          <div>
            <span className="text-sm text-gray-600 block">Starting from</span>
            <span className="text-xl font-bold text-green-700">
              {formatPrice()}
            </span>
          </div>
          {priceRange && priceRange.min !== priceRange.max && (
            <div className="text-right">
              <span className="text-xs text-gray-500">per hour</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleViewDetails}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
        >
          View Details & Book Now
        </button>
      </div>
    </div>
  );
};

export default VenueCard;
