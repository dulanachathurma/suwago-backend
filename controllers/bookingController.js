const Booking = require('../models/Booking');

// GET /api/bookings
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ status: 'success', bookings });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { doctorId, doctorName, doctorSpecialty, appointmentDate, timeSlot, notes } = req.body;
    if (!doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({ code: 'INVALID_INPUT', message: 'Missing required booking fields' });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      doctorId,
      doctorName: doctorName || '',
      doctorSpecialty: doctorSpecialty || '',
      appointmentDate,
      timeSlot,
      notes: notes || '',
      status: 'Confirmed',
    });

    res.status(201).json({ status: 'success', booking });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

// PATCH /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Booking not found' });
    }
    if (status) booking.status = status;
    await booking.save();
    res.json({ status: 'success', booking });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

// DELETE /api/bookings/:id
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!booking) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Booking not found' });
    }
    res.json({ status: 'success', message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
};
