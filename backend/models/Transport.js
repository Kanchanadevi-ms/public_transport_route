const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  transportType: {
    type: String,
    enum: ['bus', 'train'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  },
  fare: {
    type: Number,
    required: true
  },
  source: String,
  destination: String,
  departureTime: String,
  arrivalTime: String,
  duration: Number,
  schedule: [
    {
      stopName: String,
      stopOrder: Number,
      arrivalTime: String,
      departureTime: String,
      lat: Number,
      lng: Number
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transport', transportSchema);