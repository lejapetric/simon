// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    ime_projekta: {
        type: String,
        required: [true, 'Ime projekta je obvezno'],
        trim: true
    },
    opravljena_dela: {
        type: String,
        default: null,
        trim: true
    },
    kategorija: {
        type: String,
        required: [true, 'Kategorija je obvezna'],
        trim: true
    },
    datum_izdelave: {
        mesec: {
            type: String,
            required: [true, 'Mesec je obvezen'],
            enum: [
                'januar', 'februar', 'marec', 'april', 'maj', 'junij',
                'julij', 'avgust', 'september', 'oktober', 'november', 'december'
            ]
        },
        leto: {
            type: Number,
            required: [true, 'Leto je obvezno'],
            min: 1990,
            max: new Date().getFullYear()
        }
    },
    podrobnosti: {
        type: String,
        default: null,
        trim: true
    },
    slike: {
        type: [String],
        default: null
    }
}, {
    timestamps: true, // Dodata createdAt in updatedAt
    collection: 'projekti' // Ime kolekcije v MongoDB
});

// Indeksi za boljše poizvedbe
projectSchema.index({ kategorija: 1 });
projectSchema.index({ 'datum_izdelave.leto': -1 });
projectSchema.index({ ime_projekta: 'text' });

// Virtual polje za celoten datum (če ga potrebujete)
projectSchema.virtual('datumCeloten').get(function() {
    return `${this.datum_izdelave.mesec} ${this.datum_izdelave.leto}`;
});

// Metoda za formatiranje odgovora
projectSchema.methods.toJSON = function() {
    const project = this.toObject();
    project.id = project._id;
    delete project._id;
    delete project.__v;
    delete project.createdAt;
    delete project.updatedAt;
    return project;
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;