require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cookieParser());

// --- SECURITY MIDDLEWARE ---
const protect = (req, res, next) => {
    const token = req.cookies.token; 
    
    // If no cookie, stop them immediately and send to login
    if (!token) {
        return res.redirect('/'); 
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.redirect('/'); 
        }
        req.user = user;
        next();
    });
};

// --- ROUTES ORDER MATTERS ---

// 1. Auth API
app.use('/api', authRoutes);

// 2. The Dashboard (Protected)
app.get('/dashboard', protect, (req, res) => {
    // Kill browser cache so it checks the cookie every single time
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.sendFile(path.join(__dirname, '../private/proposal_dashboard.html'));
});

// 3. Private Assets (Protected)
app.get('/private/:fileName', protect, (req, res) => {
    res.sendFile(path.join(__dirname, '../private', req.params.fileName));
});

// 4. Dashboard Data API (Protected)
app.get('/api/dashboard-data', protect, (req, res) => {
    res.json({
        message: "Will you marry me?",
        user: req.user.username 
    });
});

// 5. Public Static Files (MUST be after protected routes)
app.use(express.static(path.join(__dirname, '../client')));

// 6. Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Secure Connection Established'))
    .catch(err => console.error('Database connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server locked and loaded on port ${PORT}`));