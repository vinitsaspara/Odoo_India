// Simple test script to verify booking creation
import mongoose from 'mongoose';
import Booking from './src/models/Booking.js';

// Test database connection and booking creation
async function testBookingCreation() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/odoo_india');
        console.log('✅ Connected to MongoDB');

        // Check existing bookings
        const existingBookings = await Booking.find({});
        console.log(`📊 Found ${existingBookings.length} existing bookings in database`);

        // Display existing bookings
        if (existingBookings.length > 0) {
            console.log('\n📋 Existing Bookings:');
            existingBookings.forEach((booking, index) => {
                console.log(`${index + 1}. ${booking.bookingId} - ${booking.courtName} at ${booking.venueName}`);
                console.log(`   Date: ${booking.date}, Status: ${booking.status}`);
                console.log(`   Created: ${booking.createdAt}`);
                console.log('');
            });
        } else {
            console.log('📭 No bookings found in database');
        }

        // Check database collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📂 Available collections:', collections.map(c => c.name));

        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testBookingCreation();
