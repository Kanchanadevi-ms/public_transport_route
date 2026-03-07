const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Source location is required'],
    trim: true
  },
  sourceCoords: {
    lat: Number,
    lng: Number
  },
  destination: {
    type: String,
    required: [true, 'Destination location is required'],
    trim: true
  },
  destinationCoords: {
    lat: Number,
    lng: Number
  },
  transportType: {
    type: String,
    enum: ['bus', 'train', 'both'],
    default: 'both'
  },
  distance: {
    type: Number,
    default: 0
  },
  estimatedDuration: {
    type: Number,
    default: 0
  },
  polyline: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', routeSchema);