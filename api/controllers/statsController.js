const Project = require('../models/Project');

// GET /api/stats - statistika projektov
exports.getStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const categories = await Project.distinct('kategorija');
    const years = await Project.distinct('datum_izdelave.leto');
    
    // Statistika po kategorijah
    const categoryStats = {};
    for (const category of categories) {
      categoryStats[category] = await Project.countDocuments({ kategorija: category });
    }
    
    res.json({
      totalProjects,
      totalCategories: categories.length,
      totalYears: years.length,
      categories: categoryStats,
      years: years.sort((a, b) => b - a)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/years - vsa leta
exports.getYears = async (req, res) => {
  try {
    const years = await Project.distinct('datum_izdelave.leto');
    res.json(years.sort((a, b) => b - a));
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