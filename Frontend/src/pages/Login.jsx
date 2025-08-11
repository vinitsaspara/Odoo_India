import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Zap,
  Shield,
  Users,
  Trophy,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(formData);

      // Redirect based on role
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
      setError(error.message || "Login failed. Please try again.");
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    {
      icon: Users,
      title: "10K+ Players",
      description: "Active community",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Secure Booking",
      description: "Protected payments",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Trophy,
      title: "Premium Venues",
      description: "Best facilities",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center p-4">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
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
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-1">Sign in to continue your journey</p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <motion.form
          variants={containerVariants}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Email Field */}
          <motion.div variants={itemVariants}>
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
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white hover:border-gray-400"
                placeholder="Enter your email"
              />
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div variants={itemVariants}>
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
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white hover:border-gray-400"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Login Button */}
          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
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
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Sign In
                </span>
              )}
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Features Section */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">Why choose QuickCourt?</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="text-center p-3 bg-gray-50/50 rounded-xl border border-gray-100"
              >
                <div
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r ${feature.color} mb-2`}
                >
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-medium text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center space-y-3"
        >
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <motion.button
              onClick={() => navigate("/signup")}
              whileHover={{ scale: 1.05 }}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Sign up
            </motion.button>
          </p>
          <motion.button
            onClick={() => navigate("/forgot-password")}
            whileHover={{ scale: 1.05 }}
            className="text-gray-500 hover:text-gray-700 text-xs transition-colors duration-200"
          >
            Forgot password?
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
