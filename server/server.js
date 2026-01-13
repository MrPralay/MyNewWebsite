require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cors());

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Access Denied" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = user;
        next();
    });
};

app.get('/api/dashboard-data', authenticateToken, (req, res) => {
    res.json({
        message: "Will you marry me?",
        user: req.user.username 
    });
});

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use('/api', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Port ${PORT}`));