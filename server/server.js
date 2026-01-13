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
    
    // 1. Check for token
    if (!token) {
        console.log("Blocking: No token found."); // For your terminal logs
        return res.redirect('/'); 
    }

    // 2. Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("Blocking: Invalid token.");
            return res.redirect('/'); 
        }
        req.user = user;
        next();
    });
};

// --- ROUTES ORDER (DO NOT CHANGE) ---

// 1. Auth API (Login/Register)
app.use('/api', authRoutes);

// 2. The Dashboard (PROTECTED)
// This MUST stay above express.static
app.get('/dashboard', protect, (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    // Ensure this path leads to the /private folder OUTSIDE of /client
    res.sendFile(path.join(__dirname, '../private/proposal_dashboard.html'));
});

// 3. Private Assets (PROTECTED)
app.get('/private/:fileName', protect, (req, res) => {
    res.sendFile(path.join(__dirname, '../private', req.params.fileName));
});

// 4. API Data (PROTECTED)
app.get('/api/dashboard-data', protect, (req, res) => {
    res.json({
        message: "Will you marry me?",
        user: req.user.username 
    });
});

// 5. PUBLIC FILES (Only for index.html, login CSS/JS)
// Make sure proposal_dashboard.html is NOT inside this folder
app.use(express.static(path.join(__dirname, '../client')));

// 6. Landing Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// 7. CATCH-ALL (Redirects any weird 404s back to login)
app.get('*', (req, res) => {
    res.redirect('/');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Secure Connection Established'))
    .catch(err => console.error('Database connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server locked and loaded on port ${PORT}`));