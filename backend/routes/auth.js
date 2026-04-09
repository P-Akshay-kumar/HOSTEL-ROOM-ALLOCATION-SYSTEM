const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ADMIN_SECRET_KEY = 'HOSTEL_ADMIN_2024';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, rollNo, password, year, role, adminSecret } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ rollNo });
    if (user) return res.status(400).json({ message: 'User with this Roll No / Username already exists' });

    // Admin Verification
    let finalRole = 'student';
    if (role === 'admin') {
        if (adminSecret !== ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: 'Invalid Admin Secret Key' });
        }
        finalRole = 'admin';
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ 
        name, 
        rollNo, 
        password: hashedPassword, 
        year: finalRole === 'admin' ? 'Admin' : year,
        role: finalRole,
        hostelStatus: finalRole === 'admin' ? 'Not Allocated' : 'Not Allocated'
    });
    
    await user.save();

    res.json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { rollNo, password } = req.body;
    
    const user = await User.findOne({ rollNo });
    if (!user) return res.status(400).json({ message: 'Invalid credentials. Please check your Roll No / Username.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, year: user.year }, process.env.JWT_SECRET || 'secret', { expiresIn: '10h' });
    res.json({ token, id: user._id, role: user.role, name: user.name, year: user.year, rollNo: user.rollNo });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
