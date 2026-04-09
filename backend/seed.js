const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');

dotenv.config();

const rooms = [];

// Helper function to generate rooms for a given block, floor range, and assigned years.
const generateRooms = (block, startFloor, endFloor, allowedYears) => {
    for (let floor = startFloor; floor <= endFloor; floor++) {
        // 10 rooms per floor
        for (let num = 1; num <= 10; num++) {
            // Room numbering: Floor 1 -> 101-110. Floor 12 -> 1201-1210.
            const roomNumber = `${block}-${floor}${num.toString().padStart(2, '0')}`;
            rooms.push({
                roomNumber,
                block: `Block ${block}`,
                floor: floor,
                capacity: 3, // Default capacity size 3 as requested
                occupancy: 0,
                yearRestriction: allowedYears // e.g ['1st Year']
            });
        }
    }
};

const seedDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/hostel_hq');

        console.log('MongoDB Connected. Dropping existing rooms...');
        await Room.deleteMany({}); // Wipe old rooms to reset

        console.log('Generating structured rooms...');
        
        // --- Block A Constraints ---
        // 1st year: Floors 1 to 4
        generateRooms('A', 1, 4, ['1st Year']);
        // 2nd year: Floors 5 to 8
        generateRooms('A', 5, 8, ['2nd Year']);
        // 3rd & 4th year: Floors 9 to 12
        generateRooms('A', 9, 12, ['3rd Year', '4th Year']);

        // --- Block B Constraints ---
        // 2nd year: Floors 1 to 8
        generateRooms('B', 1, 8, ['2nd Year']);
        // 3rd & 4th year: Floors 9 to 12
        generateRooms('B', 9, 12, ['3rd Year', '4th Year']);

        await Room.insertMany(rooms);
        console.log(`Successfully seeded ${rooms.length} fully structured rooms!`);

        process.exit();
    } catch (err) {
        console.error('Seeding completely failed:', err);
        process.exit(1);
    }
};

seedDB();
