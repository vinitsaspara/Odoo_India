import {
  Star,
  MapPin,
  Users,
  Calendar,
  Clock,
  Zap,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    coverImage,
    rating = 0,
    totalReviews = 0,
    amenities = [],
    sportsTypes = [],
    priceRange,
    totalCourts = 0,
    isActive = true,
    operatingHours,
  } = venue;

  // Get the display image (prefer cover image, then first image, then placeholder)
  const getDisplayImage = () => {
    // First try cover image
    if (coverImage && coverImage.url) {
      return coverImage.url;
    }

    // Then try first image from images array
    if (images && images.length > 0) {
      const firstImage = images[0];
      // Handle both old format (direct URL) and new format (object with url property)
      const imageUrl =
        typeof firstImage === "string" ? firstImage : firstImage.url;
      if (imageUrl) {
        return imageUrl;
      }
    }

    // Fallback to placeholder
    return getVenuePlaceholder(name, 400, 250);
  };

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
    <motion.div
      whileHover={{ scale: 1.02, y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-white/95  backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/30 group relative"
    >
      {/* Image */}
      <div
        className="relative h-56 overflow-hidden cursor-pointer"
        onClick={handleViewDetails}
      >
        <img
          src={getDisplayImage()}
          alt={name || "Venue"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => handleImageError(e, `${name || "Venue"} Image`)}
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
              isActive
                ? "bg-green-500/90 text-white border-green-400/50"
                : "bg-red-500/90 text-white border-red-400/50"
            } shadow-lg`}
          >
            {isActive ? "Open Now" : "Closed"}
          </span>
        </div>

        {/* Courts Count */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-gray-800 shadow-lg border border-white/30">
            {totalCourts} Courts
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-4 right-4">
          <div className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/30">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-bold text-gray-800">
              {getRatingDisplay()}
            </span>
          </div>
        </div>

        {/* Floating Sparkle Effect */}
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="h-6 w-6 text-white drop-shadow-lg" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <div className="mb-4">
          <h3
            className="text-xl font-bold text-gray-900 line-clamp-1 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 cursor-pointer"
            onClick={handleViewDetails}
          >
            {name}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 mt-2">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
            <span className="text-sm line-clamp-1">
              {location?.address || location}
            </span>
          </div>
        </div>

        {/* Sports Types */}
        {sportsTypes && sportsTypes.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {sportsTypes.slice(0, 2).map((sport, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200/50 backdrop-blur-sm"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {sport}
                </span>
              ))}
              {sportsTypes.length > 2 && (
                <span className="inline-flex items-center px-3 py-1.5 bg-gray-100/80 backdrop-blur-sm text-gray-600 text-xs font-semibold rounded-full border border-gray-200/50">
                  +{sportsTypes.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Operating Hours */}
        {operatingHours && (
          <div className="flex items-center text-gray-600 mb-4 p-3 bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/30">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-green-600" />
            <span className="text-sm font-medium">
              {typeof operatingHours === "string"
                ? operatingHours
                : operatingHours.weekdays || "Check hours"}
            </span>
          </div>
        )}

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className="flex items-center text-gray-600 mb-4 p-3 bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl border border-purple-200/30">
            <Users className="h-4 w-4 mr-2 flex-shrink-0 text-purple-600" />
            <span className="text-sm font-medium">
              {amenities.slice(0, 2).join(", ")}
              {amenities.length > 2 && ` +${amenities.length - 2}`}
            </span>
          </div>
        )}

        {/* Price Range */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50/90 to-emerald-50/90 backdrop-blur-sm rounded-2xl border border-green-200/40 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-600 font-medium block mb-1">
                Starting from
              </span>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatPrice()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 font-medium">
                per hour
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={handleViewDetails}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-blue-400/30"
        >
          <span className="flex items-center justify-center">
            <Calendar className="w-5 h-5 mr-2" />
            Book Now
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default VenueCard;
