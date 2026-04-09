const mongoose = require('mongoose');
const User = require('./models/User');

async function test() {
    await mongoose.connect('mongodb://localhost:27017/hostel_hq');
    try {
        const user = new User({
            name: "John Doe",
            rollNo: "21BDS00100",
            password: "hashedpassword123",
            year: "1st Year"
        });
        await user.save();
        console.log("SUCCESS!");
    } catch (err) {
        console.error("MONGOOSE Validation Error:", err.message);
    }
    process.exit(0);
}
test();
