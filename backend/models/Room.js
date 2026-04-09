const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  block: { type: String, required: true, enum: ['Block A', 'Block B', 'Block C', 'Block D'] },
  floor: { type: Number, required: true },
  capacity: { type: Number, required: true, default: 3 },
  occupancy: { type: Number, required: true, default: 0 },
  yearRestriction: [{ type: String, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'] }],
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
