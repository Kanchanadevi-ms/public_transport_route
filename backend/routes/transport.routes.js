const express = require('express');
const router = express.Router();
const Transport = require('../models/Transport');

router.get('/', async (req, res) => {
  try {
    const transports = await Transport.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: transports,
      count: transports.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const transport = new Transport(req.body);
    await transport.save();
    res.status(201).json({
      success: true,
      data: transport
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;