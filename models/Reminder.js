const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    reminderTime: { type: String, required: true }, // e.g. "08:00"
    repeatDays: { type: [String], default: ['Daily'] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
