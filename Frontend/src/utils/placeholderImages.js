// Placeholder image service to replace broken external URLs
export const PLACEHOLDER_IMAGES = {
    // Sport placeholder images with local fallbacks
    SPORTS: {
        football: '/images/sports/football-placeholder.jpg',
        basketball: '/images/sports/basketball-placeholder.jpg',
        tennis: '/images/sports/tennis-placeholder.jpg',
        badminton: '/images/sports/badminton-placeholder.jpg',
        cricket: '/images/sports/cricket-placeholder.jpg',
        default: '/images/sports/default-sport.jpg',
    },

    // Venue placeholder images
    VENUES: {
        default: '/images/venues/default-venue.jpg',
        indoor: '/images/venues/indoor-venue.jpg',
        outdoor: '/images/venues/outdoor-venue.jpg',
    },

    // User placeholder images
    USER: {
        avatar: '/images/user/default-avatar.jpg',
        profile: '/images/user/default-profile.jpg',
    },
};

// Generate a placeholder image using local backend service or inline SVG
export const generatePlaceholderImage = (width = 300, height = 200, text = 'Image', bgColor = 'e2e8f0', textColor = '64748b') => {
    // First try to use local backend placeholder service
    const backendPlaceholder = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/placeholder/${width}x${height}?text=${encodeURIComponent(text)}&bg=${bgColor}&color=${textColor}`;

    // Return the backend placeholder URL
    return backendPlaceholder;
};

// Generate inline SVG placeholder as fallback
export const generateSVGPlaceholder = (width = 300, height = 200, text = 'Image', bgColor = '#e2e8f0', textColor = '#64748b') => {
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="16" fill="${textColor}">
        ${text}
      </text>
    </svg>
  `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Sport-specific placeholder images with color coding
export const getSportPlaceholder = (sportName, width = 200, height = 150) => {
    const sportColors = {
        football: { bg: '22c55e', text: 'ffffff' },
        basketball: { bg: 'f97316', text: 'ffffff' },
        tennis: { bg: '3b82f6', text: 'ffffff' },
        badminton: { bg: 'ec4899', text: 'ffffff' },
        cricket: { bg: '8b5cf6', text: 'ffffff' },
        default: { bg: 'e2e8f0', text: '64748b' },
    };

    const colors = sportColors[sportName.toLowerCase()] || sportColors.default;
    return generatePlaceholderImage(width, height, sportName, colors.bg, colors.text);
};

// Venue-specific placeholder images
export const getVenuePlaceholder = (venueName = 'Venue', width = 300, height = 200) => {
    return generatePlaceholderImage(width, height, `${venueName} Image`, 'e2e8f0', '64748b');
};

// Handle image loading errors with fallback
export const handleImageError = (event, fallbackText = 'Image') => {
    const img = event.target;
    const width = img.width || 300;
    const height = img.height || 200;

    // Set the fallback to inline SVG
    img.src = generateSVGPlaceholder(width, height, fallbackText);

    // Prevent infinite error loops
    img.onerror = null;
};
