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
    const { kategorija, leto, iskanje } = req.query;
    let query = {};
    
    if (kategorija) query.kategorija = kategorija;
    if (leto) query['datum_izdelave.leto'] = parseInt(leto);
    
    // Text search po imenu projekta
    if (iskanje) {
      query.$text = { $search: iskanje };
    }
    
    const projects = await Project.find(query).sort({ 'datum_izdelave.leto': -1, 'datum_izdelave.mesec': -1 });
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
    const newProject = new Project({
      ime_projekta: req.body.ime_projekta,
      opravljena_dela: req.body.opravljena_dela,
      kategorija: req.body.kategorija,
      datum_izdelave: {
        mesec: req.body.datum_izdelave.mesec,
        leto: req.body.datum_izdelave.leto
      },
      podrobnosti: req.body.podrobnosti,
      slike: req.body.slike || []
    });
    
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
      {
        ime_projekta: req.body.ime_projekta,
        opravljena_dela: req.body.opravljena_dela,
        kategorija: req.body.kategorija,
        datum_izdelave: {
          mesec: req.body.datum_izdelave.mesec,
          leto: req.body.datum_izdelave.leto
        },
        podrobnosti: req.body.podrobnosti,
        slike: req.body.slike
      },
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
      { $group: { _id: '$kategorija', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const byYear = await Project.aggregate([
      { $group: { _id: '$datum_izdelave.leto', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    const categories = await Project.distinct('kategorija');
    const years = await Project.distinct('datum_izdelave.leto');
    
    // Posebna kategorija za Tondach podrobnosti
    const tondachDetails = await Project.find(
      { kategorija: 'Kritina Tondach', podrobnosti: { $ne: null } },
      'podrobnosti'
    );
    
    const uniqueTondachTypes = [...new Set(tondachDetails.map(p => p.podrobnosti).filter(Boolean))];
    
    res.json({
      totalProjects,
      byCategory,
      byYear,
      categories: categories.sort(),
      years: years.sort((a, b) => b - a),
      tondachTypes: uniqueTondachTypes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - vsa leta za filter
app.get('/api/years', async (req, res) => {
  try {
    const years = await Project.distinct('datum_izdelave.leto');
    res.json(years.sort((a, b) => b - a));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - vse kategorije za filter
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Project.distinct('kategorija');
    res.json(categories.sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - projekti po kategoriji
app.get('/api/projects/category/:category', async (req, res) => {
  try {
    const projects = await Project.find({ 
      kategorija: req.params.category 
    }).sort({ 'datum_izdelave.leto': -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - projekti po letu
app.get('/api/projects/year/:year', async (req, res) => {
  try {
    const projects = await Project.find({ 
      'datum_izdelave.leto': parseInt(req.params.year) 
    }).sort({ 'datum_izdelave.mesec': -1 });
    res.json(projects);
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
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    database: mongoose.connection.name
  });
});

// ZA VSE OSTALE POTI - pošlji index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Strežnik
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Strežnik teče na portu ${PORT}`);
  console.log(`📂 Strežnik streže statične datoteke iz: ${path.join(__dirname, '../frontend')}`);
  console.log(`🌐 Odpri brskalnik na: http://localhost:${PORT}`);
});