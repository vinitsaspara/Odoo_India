import api from '../utils/api.js';

// Test the Stripe integration
const testStripeIntegration = async () => {
    try {
        console.log('🧪 Testing Stripe Payment Integration...');

        // Mock booking data for testing
        const testBookingData = {
            venueId: '60d5f7b3e9b6d4a8c8f9a123', // Use a real venue ID from your database
            courtId: '60d5f7b3e9b6d4a8c8f9a124', // Use a real court ID from your database
            date: '2025-08-13',
            startTime: '10:00',
            endTime: '11:00',
            price: 500
        };

        console.log('📋 Test booking data:', testBookingData);

        // Call the create-checkout-session endpoint
        const response = await api.post('/payments/create-checkout-session', testBookingData);

        if (response.data.success) {
            console.log('✅ Stripe integration working!');
            console.log('🔗 Checkout URL:', response.data.sessionUrl);
            console.log('🆔 Session ID:', response.data.sessionId);
            console.log('📝 Booking ID:', response.data.bookingId);

            // In a real scenario, you would redirect to the checkout URL
            console.log('💡 Next step: Redirect user to checkout URL');
        } else {
            console.error('❌ Stripe integration failed:', response.data.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
};

// Run the test
testStripeIntegration();
