import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Camera,
  Upload,
  Star,
  Users,
  Building,
  Rocket,
  Mail,
  Lock,
  User,
  Shield,
  Heart,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Multi-step form configuration
  const steps = [
    { title: "Personal Info", icon: User },
    { title: "Account Setup", icon: Shield },
    { title: "Profile Picture", icon: Camera },
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (currentStep === 0) {
      if (!formData.name || !formData.role) {
        setError("Please fill in all fields");
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all fields");
        return;
      }
      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email");
        return;
      }
      if (!validatePassword(formData.password)) {
        setError(
          "Password must be at least 8 characters with uppercase, lowercase, and number"
        );
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }
    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role,
      };

      if (profileImage) registrationData.avatar = profileImage;

      const response = await register(registrationData);
      const userRole = response.user.role;

      switch (userRole) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "owner":
          navigate("/owner/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  };

  const roleOptions = [
    {
      value: "user",
      title: "Player",
      description: "Book and play",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
    },
    {
      value: "owner",
      title: "Owner",
      description: "Manage venues",
      icon: Building,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center p-4">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-200/30 to-pink-200/30 rounded-full blur-3xl"
        />
      </div>

      {/* Main Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg"
          >
            <Rocket className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Join QuickCourt
          </h1>
          <p className="text-gray-600 mt-1">
            Create your account in 3 simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{
                  scale: currentStep >= index ? 1 : 0.8,
                  opacity: currentStep >= index ? 1 : 0.5,
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep >= index
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                <step.icon className="w-5 h-5" />
              </motion.div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${
                    currentStep > index ? "bg-indigo-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I want to join as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {roleOptions.map((role) => (
                      <motion.label
                        key={role.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          formData.role === role.value
                            ? `border-indigo-500 ${role.bgColor}`
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <div
                          className={`p-2 rounded-lg mb-2 ${
                            formData.role === role.value
                              ? `bg-gradient-to-r ${role.color} text-white`
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <role.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {role.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          {role.description}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Account Setup */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Profile Picture */}
            {currentStep === 2 && (
              <div className="text-center space-y-6">
                <div>
                  <p className="text-gray-600 mb-6">
                    Add a profile picture (optional)
                  </p>
                  <div className="flex justify-center">
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full shadow-lg flex items-center justify-center overflow-hidden border-4 border-white cursor-pointer"
                      >
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="h-12 w-12 text-gray-400" />
                        )}
                      </motion.div>
                      <label
                        htmlFor="profile-upload"
                        className="absolute bottom-2 right-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                      >
                        <Upload className="h-4 w-4" />
                      </label>
                      <input
                        type="file"
                        id="profile-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-center space-x-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Almost there!</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    Click "Create Account" to complete your registration
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          {currentStep > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={prevStep}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Back
            </motion.button>
          )}

          {currentStep < steps.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextStep}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:from-green-600 hover:to-blue-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Create Account
                </span>
              )}
            </motion.button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05 }}
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
            >
              Sign in
            </motion.button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
