const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  // THE DOUBLE LOCK: Stores the unique ID of the current active session
  currentSessionId: { 
    type: String, 
    default: null 
  },
  // THE MASTER KEY: Stores the temporary ID used for the "Inspect" redirect trick
  authId: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('User', userSchema);