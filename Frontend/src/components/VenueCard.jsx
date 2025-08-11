import { Star, MapPin, Users, Calendar } from "lucide-react";
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
    amenities = [],
    sportsTypes = [],
    priceRange,
    totalCourts = 0,
  } = venue;

  const handleViewDetails = () => {
    navigate(`/venues/${_id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={images[0] || getVenuePlaceholder(name, 300, 200)}
          alt={name || "Venue"}
          className="w-full h-full object-cover"
          onError={(e) => handleImageError(e, `${name || "Venue"} Image`)}
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-gray-800">
            {totalCourts} Courts
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center space-x-1 ml-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {rating > 0 ? rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm line-clamp-1">{location.address}</span>
        </div>

        {/* Sports Types */}
        {sportsTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {sportsTypes.slice(0, 3).map((sport, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {sport}
              </span>
            ))}
            {sportsTypes.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{sportsTypes.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex items-center text-gray-600 mb-3">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {amenities.slice(0, 2).join(", ")}
              {amenities.length > 2 && ` +${amenities.length - 2} more`}
            </span>
          </div>
        )}

        {/* Price Range */}
        {priceRange && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Starting from</span>
            <span className="text-lg font-bold text-green-600">
              ₹{priceRange.min}/hr
            </span>
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={handleViewDetails}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default VenueCard;
