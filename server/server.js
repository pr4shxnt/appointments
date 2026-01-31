const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { createAdminDirect } = require("./controllers/authController");
const User = require("./models/User");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create admin on startup if none exists
async function createAdminOnce() {
  try {
    const adminCount = await User.countDocuments();

    if (adminCount === 0) {
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;

      await createAdminDirect(email, password);
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error checking/creating admin:", error.message);
  }
}

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/calendly-mvp")
  .then(() => {
    console.log("MongoDB Connected");
    // Create admin after DB connection
    createAdminOnce();
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/availability", require("./routes/availability"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/otp", require("./routes/otp"));

app.get("/", (req, res) => {
  res.send(`This server belongs to ${process.env.ADMIN_NAME}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
