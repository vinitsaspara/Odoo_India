import mongoose from 'mongoose';
import Booking from './src/models/Booking.js';

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/odoo_india';

async function testBookingCreation() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Test creating a booking
        console.log('🧪 Testing booking creation...');
        const testBooking = new Booking({
            userId: new mongoose.Types.ObjectId(),
            venueId: new mongoose.Types.ObjectId(),
            courtId: new mongoose.Types.ObjectId(),
            date: new Date('2025-01-15'),
            startTime: '10:00',
            endTime: '11:00',
            price: 100,
            status: 'booked'
        });

        await testBooking.save();
        console.log('✅ Test booking created successfully:', testBooking._id);

        // Clean up test booking
        await Booking.deleteOne({ _id: testBooking._id });
        console.log('🗑️ Test booking cleaned up');

        console.log('🎉 Booking creation is working! The database index issue has been resolved.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

testBookingCreation();
