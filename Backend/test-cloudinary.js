import cloudinary from './src/config/cloudinary.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Cloudinary configuration...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');

// Test connection
cloudinary.api.ping()
    .then(result => {
        console.log('✅ Cloudinary connection successful:', result);
    })
    .catch(error => {
        console.error('❌ Cloudinary connection failed:', error);
    });
