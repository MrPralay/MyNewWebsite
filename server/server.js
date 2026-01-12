require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // <-- ADD THIS
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cors());

// --- 🛡️ ADD THIS SECTION FOR THE FRONTEND ---
// This tells the server to look in your folder for HTML/CSS/JS files
app.use(express.static(path.join(__dirname, './')));

// This makes sure when someone visits "yourwebsite.com", it shows index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
// --------------------------------------------

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (Cloud)'))
  .catch(err => console.error(err));

// API Routes
app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Live Server running on port ${PORT}`));