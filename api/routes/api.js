const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const projectController = require('../controllers/projectController');
const statsController = require('../controllers/statsController');

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mongodbState: mongoose.connection.readyState
  });
});

// Projekti
router.get('/projects', projectController.getAllProjects);
router.post('/projects', projectController.createProject);
router.get('/projects/:id', projectController.getProjectById);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

// Filtri - specifične rute PRED generičnimi
router.get('/projects/category/:category', projectController.getProjectsByCategory);
router.get('/projects/year/:year', projectController.getProjectsByYear);

// Statistika
router.get('/stats', statsController.getStats);
router.get('/years', statsController.getYears);
router.get('/categories', statsController.getCategories);

// Kategorije (alternativna pot)
router.get('/categories', projectController.getCategories);

// Kontakt
router.post('/contact', projectController.contact);

module.exports = router;