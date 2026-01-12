require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cors());

// --- 🛡️ THE FIX IS HERE ---
// '../client' moves the server up one level to find the HTML files
app.use(express.static(path.join(__dirname, '../client')));

// This makes sure the homepage points to index.html inside the client folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});
// --------------------------------------------

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (Cloud)'))
  .catch(err => console.error(err));

// API Routes
app.use('/api', authRoutes);

// Use process.env.PORT so Render can assign its own port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Live Server running on port ${PORT}`));