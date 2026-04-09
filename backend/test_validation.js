const mongoose = require('mongoose');
const User = require('./models/User');

async function test() {
    try {
        await mongoose.connect('mongodb://localhost:27017/hostelDB'); // Adjust if DB name is different
        console.log('Connected to DB');
        
        const testAdmin = new User({
            name: 'Test Admin',
            rollNo: 'testadmin_unique_' + Date.now(),
            password: 'Password123!',
            role: 'admin',
            year: 'Admin'
        });

        await testAdmin.validate();
        console.log('Validation successful!');
        
        process.exit(0);
    } catch (err) {
        console.error('Validation failed:', err.message);
        process.exit(1);
    }
}

test();
