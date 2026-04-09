const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  rollNo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  year: { type: String, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Admin'] },
  hostelStatus: { type: String, enum: ['Not Allocated', 'Pending', 'Approved'], default: 'Not Allocated' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
