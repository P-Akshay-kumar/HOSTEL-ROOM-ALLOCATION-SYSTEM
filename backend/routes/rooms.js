const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Application = require('../models/Application');
const User = require('../models/User');

// Fetch rooms based on block and strict year restrictions
router.get('/', async (req, res) => {
    try {
        const { block, year } = req.query;
        let query = {};
        if (block) query.block = `Block ${block}`;
        
        // Intelligent Selection constraint: only return rooms that explicitly allow this year, or have no restrictions
        if (year) {
            query.$or = [
                { yearRestriction: year },
                { yearRestriction: { $size: 0 } }
            ];
        }

        const rooms = await Room.find(query).sort({ floor: 1, roomNumber: 1 });
        
        // Map availability status for frontend coloration
        const mappedRooms = rooms.map(room => {
            let status = 'available'; // Green
            if (room.occupancy === room.capacity) status = 'occupied'; // Red
            else if (room.occupancy > 0) status = 'partial'; // Yellow
            
            return {
                ...room._doc,
                computedStatus: status
            };
        });

        res.json(mappedRooms);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching rooms', error: err.message });
    }
});

// Admin Route: Add new room
router.post('/add', async (req, res) => {
    try {
        const { roomNumber, block, floor, capacity, yearRestriction } = req.body;
        const newRoom = new Room({ roomNumber, block: `Block ${block}`, floor, capacity, yearRestriction });
        await newRoom.save();
        res.status(201).json({ message: 'Room added successfully', room: newRoom });
    } catch (err) {
         res.status(500).json({ message: 'Server error adding room', error: err.message });
    }
});

// Post an application for a room
router.post('/apply', async (req, res) => {
    try {
        const { userId, roomId } = req.body;
        
        if (!roomId) return res.status(400).json({ message: 'No room selected' });
        if (!userId) return res.status(400).json({ message: 'User not authenticated' });

        // Double check room capacity
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (room.occupancy >= room.capacity) {
            return res.status(400).json({ message: 'Room is fully occupied' });
        }

        // Try finding user by _id first, fallback to rollNo
        let user = await User.findById(userId).catch(() => null);
        if (!user) {
            user = await User.findOne({ rollNo: userId });
        }
        if (!user) return res.status(404).json({ message: 'Student not found in the database' });

        // Check if user already has a Pending or Approved application
        const existingActive = await Application.findOne({ 
            student: user._id, 
            status: { $in: ['Pending', 'Approved'] } 
        });
        if (existingActive) {
            if (existingActive.status === 'Approved') {
                return res.status(400).json({ message: 'You already have an approved room allocation.' });
            }
            return res.status(400).json({ message: 'You already have a pending application. Please wait for admin to review it.' });
        }

        // 3-Strike Rule: count rejections
        const rejectionCount = await Application.countDocuments({ student: user._id, status: 'Rejected' });
        if (rejectionCount >= 3) {
            return res.status(400).json({ message: 'You have been rejected 3 times. Please contact the hostel admin directly for further assistance.' });
        }

        const newApp = new Application({ student: user._id, room: roomId, status: 'Pending' });
        await newApp.save();

        // Update user status
        user.hostelStatus = 'Pending';
        await user.save();

        res.json({ message: 'Application submitted successfully!', applicationId: newApp._id });
    } catch (err) {
        res.status(500).json({ message: 'Error applying for room: ' + err.message });
    }
});

// Student: Get own applications
router.get('/my-applications/:studentId', async (req, res) => {
    try {
        const apps = await Application.find({ student: req.params.studentId })
            .populate('room', 'roomNumber block floor capacity occupancy')
            .sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching applications', error: err.message });
    }
});

// Admin: Get ALL rooms for a given block (no year filtering)
router.get('/admin/all', async (req, res) => {
    try {
        const { block } = req.query;
        let query = {};
        if (block) query.block = `Block ${block}`;

        const rooms = await Room.find(query).sort({ floor: 1, roomNumber: 1 });

        const mappedRooms = rooms.map(room => {
            let status = 'available';
            if (room.occupancy === room.capacity) status = 'occupied';
            else if (room.occupancy > 0) status = 'partial';
            return { ...room._doc, computedStatus: status };
        });

        res.json(mappedRooms);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching rooms', error: err.message });
    }
});

// Student: Get swap-eligible rooms filtered by year
router.get('/swap-eligible', async (req, res) => {
    try {
        const { year } = req.query;
        let query = { occupancy: { $lt: 3 } }; // Only rooms with space
        if (year) {
            query.yearRestriction = year;
        }
        const rooms = await Room.find(query).sort({ block: 1, floor: 1, roomNumber: 1 });
        const mapped = rooms.map(r => ({
            _id: r._id,
            roomNumber: r.roomNumber,
            block: r.block,
            floor: r.floor,
            capacity: r.capacity,
            occupancy: r.occupancy,
            computedStatus: r.occupancy === 0 ? 'available' : 'partial'
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching eligible rooms', error: err.message });
    }
});

module.exports = router;
