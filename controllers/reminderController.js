const Reminder = require('../models/Reminder');

// GET /api/reminders
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ status: 'success', reminders });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

// POST /api/reminders
const createReminder = async (req, res) => {
  try {
    const { medicineName, dosage, reminderTime, repeatDays } = req.body;
    if (!medicineName || !dosage || !reminderTime) {
      return res.status(400).json({ code: 'INVALID_INPUT', message: 'Missing required fields' });
    }

    const reminder = await Reminder.create({
      userId: req.user._id,
      medicineName,
      dosage,
      reminderTime,
      repeatDays: repeatDays || ['Daily'],
      isActive: true,
    });

    res.status(201).json({ status: 'success', reminder });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

// PUT /api/reminders/:id
const toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Reminder not found' });
    }
    if (typeof req.body.isActive === 'boolean') {
      reminder.isActive = req.body.isActive;
    } else {
      reminder.isActive = !reminder.isActive;
    }
    await reminder.save();
    res.json({ status: 'success', reminder });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

// DELETE /api/reminders/:id
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Reminder not found' });
    }
    res.json({ status: 'success', message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = {
  getReminders,
  createReminder,
  toggleReminder,
  deleteReminder,
};
