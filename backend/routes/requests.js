const express = require('express');
const router = express.Router();
const { RoomChangeRequest, Pass, Complaint, GuestReq } = require('../models/Services');
const Room = require('../models/Room');
const Application = require('../models/Application');
const User = require('../models/User');

// ----- Room Change Requests & Auto-Approval Engine -----
router.post('/room-change', async (req, res) => {
    try {
        const { student, currentRoom, requestedRoom, reason, year } = req.body;
        
        // 1. Fetch Target Room constraints
        const targetRoom = await Room.findById(requestedRoom);
        if (!targetRoom) return res.status(404).json({ message: 'Room not found' });

        // 2. Strict Senior/Junior check: Does this room exclusively permit this student's year?
        // Our DB is seeded perfectly so Block A floors 1-4 only allow 1st year
        if (!targetRoom.yearRestriction.includes(year)) {
            return res.status(400).json({ message: 'Auto-Rejected: You cannot swap into a room assigned to a different academic year (Senior/Junior mixing is strictly prohibited).' });
        }

        // 3. Occupancy check
        if (targetRoom.occupancy >= targetRoom.capacity) {
            // Full room -> Pending manual swap
            const reqChange = new RoomChangeRequest({ student, currentRoom, requestedRoom, reason, status: 'Pending' });
            await reqChange.save();
            return res.json({ message: 'Room is fully occupied. Request submitted for manual admin review.', status: 'Pending' });
        }

        // 4. Auto-Approve (Room is empty or partially filled, and same year)
        // Increment target room occupancy
        targetRoom.occupancy += 1;
        await targetRoom.save();

        // Decrement old room occupancy
        if (currentRoom) {
            const oldRoom = await Room.findById(currentRoom);
            if (oldRoom) {
                oldRoom.occupancy -= 1;
                await oldRoom.save();
            }
        }

        const reqChange = new RoomChangeRequest({ student, currentRoom, requestedRoom, reason, status: 'Approved' });
        await reqChange.save();

        res.json({ message: 'Auto-Approved! Room swap completed instantly.', status: 'Approved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/room-change/:studentId', async (req, res) => {
    try {
        const changes = await RoomChangeRequest.find({ student: req.params.studentId });
        res.json(changes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----- Passes (Gate & Vacation) -----
router.post('/pass', async (req, res) => {
    try {
        const newPass = new Pass(req.body);
        await newPass.save();
        res.json({ message: 'Pass requested successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/pass/:studentId', async (req, res) => {
    try {
        const passes = await Pass.find({ student: req.params.studentId });
        res.json(passes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----- Guest Accommodation -----
router.post('/guest', async (req, res) => {
    try {
        const newGuest = new GuestReq(req.body);
        await newGuest.save();
        res.json({ message: 'Guest request submitted' });
    } catch (err) {
         res.status(500).json({ error: err.message });
    }
});

router.get('/guest/:studentId', async (req, res) => {
    try {
        const guests = await GuestReq.find({ student: req.params.studentId });
        res.json(guests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ----- Complaints -----
router.post('/complaint', async (req, res) => {
    try {
        const newComplaint = new Complaint(req.body);
        await newComplaint.save();
        res.json({ message: 'Complaint submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/complaint/:studentId', async (req, res) => {
    try {
        const complaints = await Complaint.find({ student: req.params.studentId }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----- Payment Gateway Mock -----
router.post('/payment/verify', async (req, res) => {
    try {
        const { amount, method } = req.body;
        if (!amount || !method) {
            return res.status(400).json({ message: 'Payment details incomplete' });
        }
        res.json({ message: 'Payment successful', transactionId: `TXN${Math.floor(Math.random()*10000000)}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----- Admin Endpoints -----
router.get('/admin/all', async (req, res) => {
    try {
        const passes = await Pass.find().populate('student', 'name rollNo year');
        const guests = await GuestReq.find().populate('student', 'name rollNo year');
        const swapp = await RoomChangeRequest.find().populate('student', 'name rollNo year');
        const complaints = await Complaint.find().populate('student', 'name rollNo year');
        const applications = await Application.find().populate('student', 'name rollNo year').populate('room', 'roomNumber block floor');
        
        res.json({ passes, guests, swapp, complaints, applications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/update/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const { status } = req.body; // 'Approved' or 'Rejected'
        
        let Model;
        if (type === 'pass') Model = Pass;
        else if (type === 'guest') Model = GuestReq;
        else if (type === 'swap') Model = RoomChangeRequest;
        else if (type === 'complaint') Model = Complaint;
        else if (type === 'application') Model = Application;
        else return res.status(400).json({ message: 'Invalid type' });

        const updated = await Model.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ message: 'Status updated', updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
