import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";

const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-white text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white bg-opacity-20 mb-4">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-red-100">Your booking was not completed</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Don't worry, no charges were made
              </h2>
              <p className="text-gray-600 mb-6">
                Your payment was cancelled and no booking has been created. You
                can try booking again or browse other available courts.
              </p>
            </div>

            {/* What happened */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-medium text-gray-900 mb-3">What happened?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Payment was cancelled before completion</li>
                <li>• No charges were made to your payment method</li>
                <li>• The court booking was not confirmed</li>
                <li>• The time slot is still available for booking</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Try Booking Again</span>
              </button>

              <button
                onClick={() => navigate("/venues")}
                className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Browse Other Courts</span>
              </button>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-medium text-blue-900 mb-3">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-3">
                If you're experiencing issues with payment or have questions
                about booking:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Check if your payment method is valid and has sufficient
                  funds
                </li>
                <li>• Ensure your internet connection is stable</li>
                <li>• Try using a different browser or device</li>
                <li>• Contact our support team for assistance</li>
              </ul>
            </div>

            {/* Common Issues */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-medium text-yellow-800 mb-3">
                Common Issues
              </h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <div>
                  <p className="font-medium">Payment declined?</p>
                  <p>Contact your bank or try a different payment method.</p>
                </div>
                <div>
                  <p className="font-medium">Page closed accidentally?</p>
                  <p>
                    No problem! Just go back and start the booking process
                    again.
                  </p>
                </div>
                <div>
                  <p className="font-medium">Technical issues?</p>
                  <p>Try refreshing the page or clearing your browser cache.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
