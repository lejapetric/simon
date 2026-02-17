const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  location: String,
  year: Number,
  image: String,
  details: String,
  materials: [String],
  featured: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema);