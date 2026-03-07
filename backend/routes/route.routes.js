const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const Transport = require('../models/Transport');

router.get('/search', async (req, res) => {
  try {
    const { source, destination, type = 'both', date } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ error: 'Source and destination are required' });
    }

    const query = {
      source: { $regex: source, $options: 'i' },
      destination: { $regex: destination, $options: 'i' }
    };

    if (type !== 'both') {
      query.transportType = type;
    }

    const transports = await Transport.find(query).sort({ fare: 1 });

    if (transports.length === 0) {
      return res.json({
        success: true,
        message: 'No transports found for the given route',
        data: []
      });
    }

    res.json({
      success: true,
      message: 'Routes found successfully',
      data: transports,
      count: transports.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id);
    if (!transport) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json({
      success: true,
      data: transport
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/stops', async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id);
    if (!transport) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json({
      success: true,
      data: transport.schedule
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;