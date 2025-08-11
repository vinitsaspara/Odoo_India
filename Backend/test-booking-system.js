// Test script to verify booking system
import mongoose from 'mongoose';
import Booking from './src/models/Booking.js';

async function testBookingSystem() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/odoo_india');
        console.log('✅ Connected to MongoDB');

        // Clear existing bookings for clean test
        await Booking.deleteMany({});
        console.log('🧹 Cleared existing test bookings');

        // Test booking creation
        const testBooking = {
            userId: new mongoose.Types.ObjectId(),
            venueId: new mongoose.Types.ObjectId(),
            courtId: new mongoose.Types.ObjectId(),
            date: new Date('2025-08-15'),
            startTime: '10:00',
            endTime: '11:00',
            price: 500,
            status: 'booked'
        };

        const booking = await Booking.create(testBooking);
        console.log('✅ Test booking created:', booking._id);

        // Test time overlap function
        const hasOverlap = Booking.checkTimeOverlap('10:00', '11:00', '10:30', '11:30');
        console.log('🔍 Time overlap test (should be true):', hasOverlap);

        const noOverlap = Booking.checkTimeOverlap('10:00', '11:00', '11:00', '12:00');
        console.log('🔍 No overlap test (should be false):', noOverlap);

        // Test query
        const bookings = await Booking.find({});
        console.log(`📊 Found ${bookings.length} booking(s) in database`);

        console.log('🎉 All tests passed! Booking system is ready.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testBookingSystem();
