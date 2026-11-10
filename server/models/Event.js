const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
  titre: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  categorie: { type: String, enum: ['Technologie', 'Culture', 'Sport', 'Carrière', 'Science'], required: true },
  niveau: { type: String, enum: ['Tous niveaux', 'Débutant', 'Intermédiaire', 'Avancé'], default: 'Tous niveaux' },
  date: { type: Date, required: true },
  heureDebut: { type: String, required: true },
  heureFin: { type: String, required: true },
  lieu: { type: String, required: true },
  capacite: { type: Number, required: true, min: 1 },
  tags: [String],
  statut: { type: String, enum: ['en_attente', 'publie'], default: 'en_attente' },
  organisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User 1 -> N Event
  inscrits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
module.exports = mongoose.model('Event', eventSchema);
