const express = require("express");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/booking");
const chatRoutes = require("./routes/chat");
const trackingRoutes = require("./routes/tracking");
const reviewRoutes = require("./routes/reviews");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Use routes
app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);
app.use("/chat", chatRoutes);
app.use("/tracking", trackingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/admin", adminRoutes);

// Start server
app.listen(3000, () => {
  console.log("✅ SAHAYA SERVER RUNNING ON http://localhost:3000");
});
