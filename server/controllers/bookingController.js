const Booking = require("../models/Booking");
const Availability = require("../models/Availability");
const {
  sendBookingConfirmation,
  sendAdminNotification,
} = require("../services/emailService");

// Helper: Generate time slots from availability
const generateSlots = (startTime, endTime, duration) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    );
    currentMinutes += duration;
  }

  return slots;
};

// Get available slots for a specific date (Public)
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Get availability for this date
    const availability = await Availability.findOne({ date });

    if (!availability) {
      return res.json({ slots: [] });
    }

    // Generate all possible slots
    const allSlots = generateSlots(
      availability.startTime,
      availability.endTime,
      availability.duration,
    );

    // Get booked slots
    const bookings = await Booking.find({ date, status: "booked" });
    const bookedTimes = bookings.map((b) => b.time);

    // Filter out booked slots
    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot),
    );

    res.json({ slots: availableSlots });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create booking (Public)
const createBooking = async (req, res) => {
  try {
    const { name, email, date, time, note } = req.body;

    // Check if slot is already booked
    const existingBooking = await Booking.findOne({
      date,
      time,
      status: "booked",
    });
    if (existingBooking) {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    // Create booking
    const booking = new Booking({ name, email, date, time, note });
    await booking.save();

    // Get availability duration for the booking date
    const availability = await Availability.findOne({ date });
    const duration = availability ? availability.duration : 30;

    // Send emails
    await sendBookingConfirmation(booking, duration);
    await sendAdminNotification(booking);

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all bookings (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1, time: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cancel booking (Admin only)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true },
    );
    res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Send reminder email for a booking
const sendReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { sendReminderEmail } = require("../services/emailService");

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Send reminder email
    await sendReminderEmail(booking);

    res.json({ message: "Reminder sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get available dates (Public)
const getAvailableDates = async (req, res) => {
  try {
    // Get all dates that have availability entries
    const distinctDates = await Availability.distinct("date");
    const today = new Date().toISOString().split("T")[0];

    // Filter out past dates
    const futureDates = distinctDates.filter((date) => date >= today).sort();

    res.json({ dates: futureDates });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAvailableSlots,
  getAvailableDates,
  createBooking,
  getAllBookings,
  cancelBooking,
  sendReminder,
};
