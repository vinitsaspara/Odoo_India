import {
  getSportPlaceholder,
  handleImageError,
} from "../utils/placeholderImages.js";

const SportCard = ({ sport }) => {
  const { name, image, icon } = sport;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
      <div className="relative h-32 overflow-hidden">
        <img
          src={image || getSportPlaceholder(name, 200, 150)}
          alt={name || "Sport"}
          className="w-full h-full object-cover"
          onError={(e) => handleImageError(e, name || "Sport")}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-3 left-3">
          <h3 className="text-white font-semibold text-lg">{name}</h3>
        </div>
      </div>
    </div>
  );
};

export default SportCard;
