const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POSTREŽI STATIČNE DATOTEKE IZ FRONTEND MAPE
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB povezava
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Povezan na MongoDB Atlas'))
  .catch(err => console.error('❌ Napaka pri povezavi:', err));

// Model
const Project = require('./models/Project');

// ============= API ENDPOINTI =============

// GET - vsi projekti
app.get('/api/projects', async (req, res) => {
  try {
    const { category, year, featured } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (year) query.year = year;
    if (featured) query.featured = featured === 'true';
    
    const projects = await Project.find(query).sort({ year: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - en projekt po ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Projekt ne obstaja' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - dodajanje projekta (za admin)
app.post('/api/projects', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT - posodobi projekt
app.put('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Projekt ne obstaja' });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - izbriši projekt
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Projekt ne obstaja' });
    }
    res.json({ message: 'Projekt izbrisan' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - statistika
app.get('/api/stats', async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const byCategory = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const years = await Project.distinct('year');
    
    res.json({
      totalProjects,
      byCategory,
      years: years.sort((a, b) => b - a)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - kontaktni obrazec
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  
  // Tukaj bi poslali email ali shranili v bazo
  console.log('📧 Novo sporočilo:', { name, email, phone, message });
  
  res.json({ 
    success: true, 
    message: 'Hvala za povpraševanje! Odgovorili vam bomo v najkrajšem možnem času.' 
  });
});

// Vzdrževanje povezave
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ZA VSE OSTALE POTI - pošlji index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Strežnik
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Strežnik teče na portu ${PORT}`);
  console.log(`📂 Strežnik streže statične datoteke iz: ${path.join(__dirname, '../frontend')}`);
  console.log(`🌐 Odpri brskalnik na: http://localhost:${PORT}`);
});