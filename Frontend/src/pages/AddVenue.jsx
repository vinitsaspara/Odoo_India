import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Wifi,
  Car,
  Coffee,
  AirVent,
  Zap,
  Shield,
  Camera,
  Save,
  RotateCcw,
} from "lucide-react";
import api from "../utils/api";

const AddVenue = () => {
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [venueData, setVenueData] = useState({
    // Basic Information
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    
    // Contact Information
    contactName: "",
    phone: "",
    email: "",
    website: "",
    
    // Venue Details
    sportTypes: [],
    totalCourts: 1,
    courts: [
      {
        name: "Court 1",
        sportType: "",
        pricePerHour: "",
        dimensions: "",
        surface: "",
        isIndoor: true,
      }
    ],
    
    // Amenities
    amenities: [],
    
    // Operating Hours
    operatingHours: {
      monday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      tuesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      wednesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      thursday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      friday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      saturday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      sunday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
    },
    
    // Policies
    cancellationPolicy: "Free cancellation up to 2 hours before booking",
    rules: "",
    
    // Images
    images: [],
    coverImage: null,
  });

  const [errors, setErrors] = useState({});

  // Sport types options
  const sportTypesOptions = [
    "Badminton", "Tennis", "Cricket", "Football", "Basketball", 
    "Squash", "Table Tennis", "Volleyball", "Swimming", "Gym"
  ];

  // Available amenities
  const amenitiesOptions = [
    { id: "wifi", label: "Wi-Fi", icon: Wifi },
    { id: "parking", label: "Parking", icon: Car },
    { id: "cafeteria", label: "Cafeteria", icon: Coffee },
    { id: "ac", label: "Air Conditioning", icon: AirVent },
    { id: "lighting", label: "Floodlighting", icon: Zap },
    { id: "security", label: "Security", icon: Shield },
    { id: "cctv", label: "CCTV", icon: Camera },
    { id: "changing_room", label: "Changing Rooms", icon: Users },
  ];

  const steps = [
    { id: 1, title: "Basic Information", description: "Venue details and location" },
    { id: 2, title: "Courts & Pricing", description: "Add courts and set prices" },
    { id: 3, title: "Amenities & Hours", description: "Facilities and operating hours" },
    { id: 4, title: "Images & Policies", description: "Upload images and set policies" },
  ];

  const handleInputChange = (field, value) => {
    setVenueData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleSportTypeToggle = (sport) => {
    setVenueData(prev => ({
      ...prev,
      sportTypes: prev.sportTypes.includes(sport)
        ? prev.sportTypes.filter(s => s !== sport)
        : [...prev.sportTypes, sport]
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setVenueData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleCourtChange = (index, field, value) => {
    setVenueData(prev => ({
      ...prev,
      courts: prev.courts.map((court, i) => 
        i === index ? { ...court, [field]: value } : court
      )
    }));
  };

  const addCourt = () => {
    setVenueData(prev => ({
      ...prev,
      courts: [
        ...prev.courts,
        {
          name: `Court ${prev.courts.length + 1}`,
          sportType: prev.sportTypes[0] || "",
          pricePerHour: "",
          dimensions: "",
          surface: "",
          isIndoor: true,
        }
      ],
      totalCourts: prev.totalCourts + 1
    }));
  };

  const removeCourt = (index) => {
    if (venueData.courts.length > 1) {
      setVenueData(prev => ({
        ...prev,
        courts: prev.courts.filter((_, i) => i !== index),
        totalCourts: prev.totalCourts - 1
      }));
    }
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setVenueData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleImageUpload = (e, iscover = false) => {
    const files = Array.from(e.target.files);
    
    if (iscover && files.length > 0) {
      setVenueData(prev => ({
        ...prev,
        coverImage: files[0]
      }));
    } else {
      setVenueData(prev => ({
        ...prev,
        images: [...prev.images, ...files].slice(0, 10) // Max 10 images
      }));
    }
  };

  const removeImage = (index, isCover = false) => {
    if (isCover) {
      setVenueData(prev => ({
        ...prev,
        coverImage: null
      }));
    } else {
      setVenueData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!venueData.name.trim()) newErrors.name = "Venue name is required";
        if (!venueData.description.trim()) newErrors.description = "Description is required";
        if (!venueData.address.trim()) newErrors.address = "Address is required";
        if (!venueData.city.trim()) newErrors.city = "City is required";
        if (!venueData.state.trim()) newErrors.state = "State is required";
        if (!venueData.pincode.trim()) newErrors.pincode = "Pincode is required";
        if (!venueData.contactName.trim()) newErrors.contactName = "Contact name is required";
        if (!venueData.phone.trim()) newErrors.phone = "Phone number is required";
        if (!venueData.email.trim()) newErrors.email = "Email is required";
        if (venueData.sportTypes.length === 0) newErrors.sportTypes = "Select at least one sport type";
        break;

      case 2:
        venueData.courts.forEach((court, index) => {
          if (!court.name.trim()) newErrors[`court_${index}_name`] = "Court name is required";
          if (!court.sportType) newErrors[`court_${index}_sport`] = "Sport type is required";
          if (!court.pricePerHour || court.pricePerHour <= 0) newErrors[`court_${index}_price`] = "Valid price is required";
        });
        break;

      case 3:
        // Operating hours validation is optional
        break;

      case 4:
        if (!venueData.coverImage) newErrors.coverImage = "Cover image is required";
        if (!venueData.cancellationPolicy.trim()) newErrors.cancellationPolicy = "Cancellation policy is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    try {
      console.log('Submitting venue data to API...');
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add venue data
      const venuePayload = {
        ...venueData,
        images: undefined, // Remove images from JSON data
        coverImage: undefined // Remove coverImage from JSON data
      };
      
      formData.append('venueData', JSON.stringify(venuePayload));
      
      // Add cover image
      if (venueData.coverImage) {
        formData.append('coverImage', venueData.coverImage);
      }
      
      // Add other images
      venueData.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      try {
        const response = await api.post('/owner/venues', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Venue created successfully via API:', response.data);
        alert('Venue submitted successfully! It will be reviewed by admin before going live.');
        navigate('/owner/dashboard');
        
      } catch (apiError) {
        console.error('API venue creation failed:', apiError);
        alert(`Failed to submit venue: ${apiError.response?.data?.message || apiError.message}`);
      }

    } catch (error) {
      console.error('Error submitting venue:', error);
      alert('Failed to submit venue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      setVenueData({
        name: "",
        description: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        latitude: "",
        longitude: "",
        contactName: "",
        phone: "",
        email: "",
        website: "",
        sportTypes: [],
        totalCourts: 1,
        courts: [
          {
            name: "Court 1",
            sportType: "",
            pricePerHour: "",
            dimensions: "",
            surface: "",
            isIndoor: true,
          }
        ],
        amenities: [],
        operatingHours: {
          monday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          tuesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          wednesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          thursday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          friday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          saturday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
          sunday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
        },
        cancellationPolicy: "Free cancellation up to 2 hours before booking",
        rules: "",
        images: [],
        coverImage: null,
      });
      setCurrentStep(1);
      setErrors({});
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Name *
            </label>
            <input
              type="text"
              value={venueData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter venue name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={venueData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe your venue"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={venueData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter complete address"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={venueData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter city"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              type="text"
              value={venueData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter state"
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincode *
            </label>
            <input
              type="text"
              value={venueData.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.pincode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter pincode"
            />
            {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude (Optional)
            </label>
            <input
              type="number"
              step="any"
              value={venueData.latitude}
              onChange={(e) => handleInputChange('latitude', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter latitude"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude (Optional)
            </label>
            <input
              type="number"
              step="any"
              value={venueData.longitude}
              onChange={(e) => handleInputChange('longitude', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter longitude"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person Name *
            </label>
            <input
              type="text"
              value={venueData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.contactName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter contact person name"
            />
            {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={venueData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={venueData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website (Optional)
            </label>
            <input
              type="url"
              value={venueData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter website URL"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sport Types *</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {sportTypesOptions.map((sport) => (
            <label
              key={sport}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                venueData.sportTypes.includes(sport)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={venueData.sportTypes.includes(sport)}
                onChange={() => handleSportTypeToggle(sport)}
                className="sr-only"
              />
              <span className="text-sm font-medium">{sport}</span>
            </label>
          ))}
        </div>
        {errors.sportTypes && <p className="text-red-500 text-sm mt-1">{errors.sportTypes}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Courts & Pricing</h3>
        <button
          onClick={addCourt}
          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Court</span>
        </button>
      </div>

      <div className="space-y-6">
        {venueData.courts.map((court, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Court {index + 1}</h4>
              {venueData.courts.length > 1 && (
                <button
                  onClick={() => removeCourt(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  value={court.name}
                  onChange={(e) => handleCourtChange(index, 'name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`court_${index}_name`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter court name"
                />
                {errors[`court_${index}_name`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`court_${index}_name`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Type *
                </label>
                <select
                  value={court.sportType}
                  onChange={(e) => handleCourtChange(index, 'sportType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`court_${index}_sport`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select sport type</option>
                  {venueData.sportTypes.map((sport) => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
                {errors[`court_${index}_sport`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`court_${index}_sport`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Hour (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={court.pricePerHour}
                  onChange={(e) => handleCourtChange(index, 'pricePerHour', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`court_${index}_price`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter price per hour"
                />
                {errors[`court_${index}_price`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`court_${index}_price`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (Optional)
                </label>
                <input
                  type="text"
                  value={court.dimensions}
                  onChange={(e) => handleCourtChange(index, 'dimensions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 40ft x 20ft"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface Type (Optional)
                </label>
                <input
                  type="text"
                  value={court.surface}
                  onChange={(e) => handleCourtChange(index, 'surface', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Synthetic, Wooden, Grass"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={court.isIndoor}
                      onChange={() => handleCourtChange(index, 'isIndoor', true)}
                      className="mr-2"
                    />
                    Indoor
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!court.isIndoor}
                      onChange={() => handleCourtChange(index, 'isIndoor', false)}
                      className="mr-2"
                    />
                    Outdoor
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {amenitiesOptions.map((amenity) => {
            const IconComponent = amenity.icon;
            return (
              <label
                key={amenity.id}
                className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  venueData.amenities.includes(amenity.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={venueData.amenities.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="sr-only"
                />
                <IconComponent className="h-4 w-4" />
                <span className="text-sm font-medium">{amenity.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
        <div className="space-y-3">
          {Object.entries(venueData.operatingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
              <div className="w-20">
                <span className="font-medium text-gray-900 capitalize">{day}</span>
              </div>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hours.isOpen}
                  onChange={(e) => handleOperatingHoursChange(day, 'isOpen', e.target.checked)}
                  className="mr-2"
                />
                Open
              </label>

              {hours.isOpen && (
                <>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={hours.openTime}
                      onChange={(e) => handleOperatingHoursChange(day, 'openTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={hours.closeTime}
                      onChange={(e) => handleOperatingHoursChange(day, 'closeTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Image *</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          {venueData.coverImage ? (
            <div className="relative">
              <img
                src={URL.createObjectURL(venueData.coverImage)}
                alt="Cover"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(0, true)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Upload Cover Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
              </label>
              <p className="text-gray-500 text-sm mt-2">JPG, PNG up to 10MB</p>
            </div>
          )}
        </div>
        {errors.coverImage && <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Images (Optional)</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {venueData.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          
          {venueData.images.length < 10 && (
            <div className="text-center">
              <label className="cursor-pointer">
                <span className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add More Images</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-gray-500 text-sm mt-2">
                {venueData.images.length}/10 images uploaded
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Policies</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Policy *
            </label>
            <textarea
              value={venueData.cancellationPolicy}
              onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cancellationPolicy ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe your cancellation policy"
            />
            {errors.cancellationPolicy && (
              <p className="text-red-500 text-sm mt-1">{errors.cancellationPolicy}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rules & Regulations (Optional)
            </label>
            <textarea
              value={venueData.rules}
              onChange={(e) => handleInputChange('rules', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter any specific rules or regulations for your venue"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Add New Venue</h1>
                <p className="text-sm text-gray-500">Step {currentStep} of 4</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>

            <div>
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVenue;
