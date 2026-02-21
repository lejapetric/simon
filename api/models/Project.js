// api/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  ime_projekta: { 
    type: String, 
    required: [true, 'Ime projekta je obvezno'] 
  },
  opravljena_dela: { 
    type: String, 
    required: [true, 'Opis del je obvezen'] 
  },
  kategorija: { 
    type: String, 
    required: [true, 'Kategorija je obvezna'] 
  },
  datum_izdelave: {
    mesec: { 
      type: Number, 
      required: true,
      min: 1,
      max: 12 
    },
    leto: { 
      type: Number, 
      required: true,
      min: 2000,
      max: 2100 
    }
  },
  podrobnosti: String,
  slike: [String]
}, {
  timestamps: true
});

// Text index za iskanje
projectSchema.index({ ime_projekta: 'text' });

module.exports = mongoose.model('Project', projectSchema);