require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
const jwt = require('jsonwebtoken'); // Added for security
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cors());

// --- 🛡️ 1. THE BOUNCER (Authentication Middleware) ---
// This function checks if a request has a REAL token before letting it pass
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or Expired Token" });
        }
        req.user = user;
        next(); // Token is real, proceed to the data!
    });
};

// --- 🛡️ 2. THE PROTECTED DATA ROUTE ---
// Burp Suite can't "fake" this. It requires a signature from your JWT_SECRET.
app.get('/api/dashboard-data', authenticateToken, (req, res) => {
    res.json({
        message: "Will you marry me?",
        specialNote: "This message only appears if the Token is 100% REAL.",
        user: req.user.username // This proves the server knows exactly who is logged in
    });
});

// --- 📂 SERVING FRONTEND FILES ---
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// --- 🔗 API ROUTES ---
app.use('/api', authRoutes);

// --- ☁️ DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (Cloud)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 🚀 SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Live Server running on port ${PORT}`));