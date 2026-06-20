const express = require('express');
const cors = require('cors');
require('dotenv').config({});
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8'])
const connectDB = require("./config/db");
const equipmentRoutes = require("./routes/equipmentRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const customerRoutes = require("./routes/customerRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: ["http://localhost:5173",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
};
app.use(cors(corsOptions));

// Equipment Routes
app.use("/api/equipment", equipmentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

app.get('/test', (req, res) => {
  res.send('Hello World!');
});

// Connect Database
connectDB();
app.listen(port, () => {

  console.log(`Example app listening on port ${port}`);
});