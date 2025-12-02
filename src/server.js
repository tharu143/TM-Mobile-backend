require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/productRoutes'));
app.use('/api', require('./routes/salesRoutes'));
app.use('/api', require('./routes/customerRoutes'));
app.use('/api', require('./routes/serviceRoutes'));
app.use('/api', require('./routes/dashboardRoutes'));
app.use('/api', require('./routes/settingsRoutes'));
app.use('/api', require('./routes/uploadRoutes'));
app.use('/api', require('./routes/authRoutes'));

// Root Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
