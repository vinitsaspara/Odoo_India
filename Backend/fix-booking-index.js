// Script to fix the duplicate key error by d        const testBooking = new Booking({
userId: new mongoose.Types.ObjectId(),
    venueId: new mongoose.Types.ObjectId(),
        courtId: new mongoose.Types.ObjectId(),
            date: new Date('2025-08-15'),
                startTime: '10:00', // Use valid time format
                    endTime: '11:00',
                        price: 100,
                            status: 'booked'
        });e old bookingId index
import mongoose from 'mongoose';
import Booking from './src/models/Booking.js';

async function fixBookingIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/odoo_india');
        console.log('✅ Connected to MongoDB');

        // Get the collection
        const collection = Booking.collection;

        // List current indexes
        const indexes = await collection.indexes();
        console.log('📊 Current indexes:');
        indexes.forEach((index, i) => {
            console.log(`${i + 1}. ${index.name}:`, Object.keys(index.key));
        });

        // Check if bookingId index exists and drop it
        try {
            await collection.dropIndex('bookingId_1');
            console.log('🗑️ Dropped bookingId_1 index successfully');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️ bookingId_1 index does not exist (already removed)');
            } else {
                console.log('⚠️ Error dropping index:', error.message);
            }
        }

        // List indexes after cleanup
        const indexesAfter = await collection.indexes();
        console.log('📊 Indexes after cleanup:');
        indexesAfter.forEach((index, i) => {
            console.log(`${i + 1}. ${index.name}:`, Object.keys(index.key));
        });

        // Check if we can create a test booking now
        console.log('🧪 Testing booking creation...');

        // Clear any existing test bookings
        await Booking.deleteMany({ startTime: '99:99' });

        const testBooking = await Booking.create({
            userId: new mongoose.Types.ObjectId(),
            venueId: new mongoose.Types.ObjectId(),
            courtId: new mongoose.Types.ObjectId(),
            date: new Date('2025-08-15'),
            startTime: '99:99', // Use invalid time so we can easily find and delete it
            endTime: '99:99',
            price: 100,
            status: 'booked'
        });

        console.log('✅ Test booking created successfully:', testBooking._id);

        // Clean up test booking
        await Booking.deleteOne({ _id: testBooking._id });
        console.log('🧹 Test booking cleaned up');

        console.log('🎉 Database index issue fixed! You can now create bookings.');

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Fix failed:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

fixBookingIndex();
