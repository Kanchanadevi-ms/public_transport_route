const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Transport = require('../models/Transport');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId })
      .sort({ savedAt: -1 });

    res.json({
      success: true,
      message: 'Favorites retrieved successfully',
      data: favorites,
      count: favorites.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { source, destination, transportId } = req.body;

    if (!source || !destination) {
      return res.status(400).json({ error: 'Source and destination are required' });
    }

    let transportDetails = null;
    if (transportId) {
      const transport = await Transport.findById(transportId);
      if (transport) {
        transportDetails = {
          name: transport.name,
          number: transport.number,
          transportType: transport.transportType,
          fare: transport.fare
        };
      }
    }

    const favorite = new Favorite({
      userId: req.userId,
      source,
      destination,
      transportId,
      transportDetails
    });

    await favorite.save();

    res.status(201).json({
      success: true,
      message: 'Route saved to favorites',
      data: favorite
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    if (favorite.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this favorite' });
    }

    await Favorite.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;