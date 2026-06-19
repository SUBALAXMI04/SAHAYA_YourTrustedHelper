const express = require("express");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const chatRoutes = require("./routes/chats");
const trackingRoutes = require("./routes/tracking");
const reviewRoutes = require("./routes/reviews");
const adminRoutes = require("./routes/admin");
const servicesRoutes = require("./routes/services");
const paymentsRoutes = require("./routes/payments");
const notificationsRoutes = require("./routes/notifications");
const savedProfessionalsRoutes = require("./routes/saved-professionals");

const app = express();
const publicDir = path.join(__dirname, "public");
const themeBootstrap = `
<script>
  (function () {
    try {
      const saved = localStorage.getItem('theme');
      const theme = saved || 'light';
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme;
      if (theme === 'dark') {
        document.body?.classList.add('dark-mode');
        document.body?.classList.remove('light-mode');
      } else {
        document.body?.classList.add('light-mode');
        document.body?.classList.remove('dark-mode');
      }
    } catch (e) {}
  })();
</script>`;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const originalSend = res.send.bind(res);

  res.send = function (body) {
    if (typeof body === 'string' && body.includes('<html') && body.includes('</head>')) {
      body = body.replace('</head>', `${themeBootstrap}</head>`);
    }
    return originalSend(body);
  };

  next();
});

// Explicit frontend routes so the root page and admin entry point are clear
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "landing.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(publicDir, "landing.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(publicDir, "admin-login.html"));
});

// Serve remaining frontend files
app.use(express.static(publicDir));

// Use routes
app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);
app.use("/chat", chatRoutes);
app.use("/tracking", trackingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/admin", adminRoutes);
app.use("/services", servicesRoutes);
app.use("/payments", paymentsRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/saved-professionals", savedProfessionalsRoutes);

// Start server
app.listen(3000, () => {
  console.log("✅ SAHAYA SERVER RUNNING ON http://localhost:3000");
});
