const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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

        // Check if user is blocked from swapping
        const user = await User.findById(student);
        if (user && user.isSwapBlocked) {
            return res.status(403).json({ message: 'Your access to room swaps has been restricted due to multiple rejections. Please contact the Hostel Admin to restore access.' });
        }

        // 4. Strict constraint: Must have an approved room first
        const approvedApp = await Application.findOne({ student, status: 'Approved' });
        if (!approvedApp) {
            return res.status(403).json({ message: 'Constraint Error: You must have an Approved Room Allocation before you can request a room change/swap.' });
        }

        // 5. Status logic: All swaps are now manual as per mentor feedback
        // Save as Pending for Admin review
        const reqChange = new RoomChangeRequest({ 
            student, 
            currentRoom: currentRoom || null, 
            requestedRoom, 
            reason, 
            status: 'Pending' 
        });
        await reqChange.save();

        res.json({ 
            message: 'Room swap request submitted successfully. Please wait for Admin review and approval.', 
            status: 'Pending' 
        });
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
    res.json({ message: 'Payment Verified', status: 'Paid' });
});

// Admin Blocklist Management
router.get('/admin/blocklist', async (req, res) => {
    try {
        const blockedUsers = await User.find({
            $or: [{ isAppBlocked: true }, { isSwapBlocked: true }]
        }).select('name rollNo year isAppBlocked isSwapBlocked');
        res.json(blockedUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/unblock', async (req, res) => {
    try {
        const { userId, type } = req.body;
        const update = {};
        if (type === 'application') update.isAppBlocked = false;
        else if (type === 'swap') update.isSwapBlocked = false;
        
        await User.findByIdAndUpdate(userId, update);
        res.json({ message: `Successfully unblocked ${type} access.` });
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

        // Security logic: Blocking students after 3 rejections
        if (status === 'Rejected') {
            let studentId;
            if (type === 'swap') {
                const req = await RoomChangeRequest.findById(id);
                studentId = req?.student;
            } else if (type === 'application') {
                const app = await Application.findById(id);
                studentId = app?.student;
            }

            if (studentId) {
                const count = await Model.countDocuments({ student: studentId, status: 'Rejected' });
                if (count >= 3) {
                    if (type === 'swap') await User.findByIdAndUpdate(studentId, { isSwapBlocked: true });
                    else if (type === 'application') await User.findByIdAndUpdate(studentId, { isAppBlocked: true });
                }
            }
        }

        // --- NEW: GLOBAL SYNC ---
        // 1. If an Application is Approved, we MUST update the User's hostelStatus AND Room Occupancy
        if (type === 'application' && status === 'Approved') {
            const app = await Application.findById(id);
            if (app) {
                // Update User Status
                await User.findByIdAndUpdate(app.student, { hostelStatus: 'Approved' });
                
                // Update Room Occupancy
                const room = await Room.findById(app.room);
                if (room && room.occupancy < room.capacity) {
                    room.occupancy += 1;
                    await room.save();
                }
            }
        }

        // 2. If a Room Swap was manually approved, we must trigger the room occupancy logic
        if (type === 'swap' && status === 'Approved') {
            const swapReq = await RoomChangeRequest.findById(id);
            if (swapReq) {
                const targetRoom = await Room.findById(swapReq.requestedRoom);
                if (targetRoom && targetRoom.occupancy < targetRoom.capacity) {
                    targetRoom.occupancy += 1;
                    await targetRoom.save();

                    if (swapReq.currentRoom) {
                        const oldRoom = await Room.findById(swapReq.currentRoom);
                        if (oldRoom) {
                            oldRoom.occupancy = Math.max(0, oldRoom.occupancy - 1);
                            await oldRoom.save();
                        }
                    }

                    // CRITICAL: Update the Application record so the Student UI reflects the NEW room
                    // We look for ANY approved application for this student and update its room reference
                    await Application.updateOne(
                        { student: swapReq.student, status: 'Approved' },
                        { room: swapReq.requestedRoom }
                    );
                    
                    // Also ensure User status is set to Approved (redundancy)
                    await User.findByIdAndUpdate(swapReq.student, { hostelStatus: 'Approved' });
                }
            }
        }

        res.json({ message: 'Status updated', updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
