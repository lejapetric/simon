const Project = require('../models/Project');

// GET /api/projects - vrne vse projekte
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ 'datum_izdelave.leto': -1, 'datum_izdelave.mesec': -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/projects/category/:category - projekti po kategoriji
exports.getProjectsByCategory = async (req, res) => {
  try {
    const projects = await Project.find({ kategorija: req.params.category })
      .sort({ 'datum_izdelave.leto': -1, 'datum_izdelave.mesec': -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/projects/year/:year - projekti po letu
exports.getProjectsByYear = async (req, res) => {
  try {
    const projects = await Project.find({ 'datum_izdelave.leto': parseInt(req.params.year) })
      .sort({ 'datum_izdelave.mesec': -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/categories - vse kategorije
exports.getCategories = async (req, res) => {
  try {
    const categories = await Project.distinct('kategorija');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/contact - kontaktni obrazec
exports.contact = async (req, res) => {
  try {
    // Tukaj lahko dodate logiko za pošiljanje emaila, shranjevanje v bazo itd.
    res.json({ message: 'Sporočilo poslano', data: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};