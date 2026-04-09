const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RoomChangeRequestSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  currentRoom: { type: Schema.Types.ObjectId, ref: 'Room' },
  requestedRoom: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

const PassSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Gate Pass', 'Vacation Pass'], required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

const ComplaintSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' }
}, { timestamps: true });

const GuestSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  guestName: { type: String, required: true },
  relation: { type: String, required: true },
  durationDays: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = {
  RoomChangeRequest: mongoose.model('RoomChangeRequest', RoomChangeRequestSchema),
  Pass: mongoose.model('Pass', PassSchema),
  Complaint: mongoose.model('Complaint', ComplaintSchema),
  GuestReq: mongoose.model('GuestReq', GuestSchema)
};
