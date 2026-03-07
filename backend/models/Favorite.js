const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  transportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transport'
  },
  transportDetails: {
    name: String,
    number: String,
    transportType: String,
    fare: Number
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Favorite', favoriteSchema);